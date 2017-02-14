import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'
import _ from 'lodash'

class DataHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      id: 0,
      step: 0,
      stop: false,
      message: '',
      code: '',
      origin: '',
      traces: [],
    }
    window.dataHint = this
  }

  componentDidMount() {
    setTimeout(() => {
      this.init()
    }, 500)
  }

  init() {
    this.setState({
      id: this.props.id,
      code: this.props.beforeCode,
      origin: this.props.beforeCode,
      traces: this.props.traces,
    })
    this.cm = this.refs.editor.getCodeMirror()
  }

  playStep() {
    let interval = 100
    this.setState({ stop: false })
    let timer = setInterval(() => {
      if (this.state.step >= this.state.traces.length || this.state.stop) {
        clearInterval(timer)
        this.setState({ stop: false })
      } else {
        this.updateStep(this.state.step+1)
      }
    }, interval)
  }

  updateStep(value) {
    let step = Math.floor(value)
    this.cm.setValue(this.state.origin)

    let current = this.state.traces[step]
    if (current.error) {
      this.cm.addLineClass(current.line-1, '', 'highlight')
      this.setState({ stop: true })
    } else {
      this.cm.addLineClass(current.line-1, '', 'current-line')
    }

    for (let line of Object.keys(current.outputs)) {
      let output = current.outputs[line]
      output = JSON.stringify(output)
      let fixedOutput = current.fixedOutputs ? current.fixedOutputs[line] : null
      if (fixedOutput && !_.isEqual(output, fixedOutput)) {
        output += ' should be '
        output += JSON.stringify(fixedOutput)
      }


      let ch = this.state.origin.split('\n')[line-1].length
      let space = ' '
      // for (let i = ch; i < 30; i++) {
      //   space += ' '
      // }
      let msg = `${space} # ${JSON.stringify(output)}`
      this.cm.replaceRange(msg, { line: line-1, ch: ch }, { line: line-1, ch: Infinity })
    }
    let code = this.cm.getValue()
    this.setState({ step: step, code: code })
  }

  render() {
    return (
      <div id={ this.state.id }>
        <div className="ui message">
          <div className="header">
            Data Hint
          </div>
          <p>{ this.state.message }</p>

          <div className="play-area">
          <button className="ui basic button play-button" onClick={ this.playStep.bind(this) }>
            <i className="fa fa-play fa-fw"></i>
          </button>
          <Slider
            dots
            min={ 0 }
            max={ this.state.traces.length-1 }
            value={ this.state.step }
            onChange={ this.updateStep.bind(this) }
          />
          </div>
        </div>
        <CodeMirror
          value={ this.state.code }
          ref="editor"
          options={ this.props.options }
        />
      </div>
    )
  }
}

export default DataHint
