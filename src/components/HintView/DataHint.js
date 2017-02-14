import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'
import _ from 'lodash'

class DataHint extends Component {
  constructor(props) {
    super(props)
    window.dataHint = this
  }

  componentDidMount() {
    this.cm = this.refs.editor.getCodeMirror()
  }

  playStep() {
    let interval = 100
    window.app.updateState({ stop: false })
    let timer = setInterval(() => {
      if (this.props.step >= this.props.traces.length || this.props.stop) {
        clearInterval(timer)
        window.app.updateState({ stop: false })
      } else {
        this.updateStep(this.props.step+1)
      }
    }, interval)
  }

  updateStep(value) {
    let step = Math.floor(value)
    this.cm.setValue(this.props.beforeCode)

    let current = this.props.traces[step]
    if (current.error) {
      this.cm.addLineClass(current.line-1, '', 'highlight')
      window.app.updateState({ stop: true })
    } else {
      this.cm.addLineClass(current.line-1, '', 'current-line')
    }

    const getMsg = (output) => {
      let msg = ''
      for (let key of Object.keys(output)) {
        if (output[key] instanceof Object) {
          msg += key
          msg += '('
          msg += _.map(output[key]).join(', ')
          msg += ')'
        } else {
          if (key === '__return__') {
            msg += 'return'
          } else {
            msg += key
          }
          msg += ': '
          if (output[key] !== undefined) msg += output[key]
        }
      }
      return msg
    }

    window.current = current
    for (let line of Object.keys(current.outputs)) {
      let output = current.outputs[line]
      // output = JSON.stringify(output)
      let msg = getMsg(output)

      let fixedOutput = current.fixedOutputs ? current.fixedOutputs[line] : null
      if (fixedOutput && !_.isEqual(output, fixedOutput)) {
        msg += ' should be '
        msg += getMsg(fixedOutput)
      }


      let ch = this.props.beforeCode.split('\n')[line-1].length
      let space = ' '
      // for (let i = ch; i < 30; i++) {
      //   space += ' '
      // }
      msg = `${space} # ${msg}`
      this.cm.replaceRange(msg, { line: line-1, ch: ch }, { line: line-1, ch: Infinity })
    }
    let code = this.cm.getValue()
    window.app.updateState({ step: step, currentCode: code })
  }

  render() {
    return (
      <div>
        <h1>Data Hint</h1>
        <div className="ui message">
          <div className="header">
            Data Hint
          </div>
          <p>{ '' }</p>

          <div className="play-area">
          <button className="ui basic button play-button" onClick={ this.playStep.bind(this) }>
            <i className="fa fa-play fa-fw"></i>
          </button>
          <Slider
            dots
            min={ 0 }
            max={ this.props.traces.length-1 }
            value={ this.props.step }
            onChange={ this.updateStep.bind(this) }
          />
          </div>
        </div>
        <h2>Code</h2>
        <CodeMirror
          value={ this.props.currentCode }
          ref="editor"
          options={ this.props.options }
        />
      </div>
    )
  }
}

export default DataHint
