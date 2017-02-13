import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'

class DataHint extends Component {
  constructor(props) {
    super(props)
    const id = `data-hint-${this.props.index}`
    const message = this.props.message
    this.state = {
      code: '',
      id: id,
      step: 0,
      stream: [],
      stop: false,
      message: message,
    }
    window.dataHint = this
  }

  componentDidMount() {
    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}example/${this.state.id}.py`,
    })
    .then((res) => {
      this.setState({ code: res, origin: res })
    })
    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}example/${this.state.id}.json`,
    })
    .then((res) => {
      this.setState({ stream: res })
    })
  }

  showHint() {
    this.cm = this.refs.editor.getCodeMirror()
    $(`#${this.state.id}`).slideToggle()
  }

  playStep() {
    let interval = 100
    this.setState({ stop: false })
    let timer = setInterval(() => {
      if (this.state.step >= this.state.stream.length || this.state.stop) {
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

    let current = this.state.stream.slice(0, step)
    let lastLine = 0
    for (let hash of current) {
      let line = hash.line - 1
      this.cm.removeLineClass(lastLine, '', 'current-line')
      this.cm.removeLineClass(lastLine, '', 'highlight')
      if (hash.error) {
        this.cm.addLineClass(line, '', 'highlight')
        this.setState({ stop: true })
      } else {
        this.cm.addLineClass(line, '', 'current-line')
      }
      let ch = this.state.origin.split('\n')[line].length
      let space = ' '
      for (let i = ch; i < 30; i++) {
        space += ' '
      }
      let msg = `${space} #   ${hash.msg}`
      this.cm.replaceRange(msg, { line: line, ch: ch }, { line: line, ch: Infinity })
      lastLine = line
    }
    let code = this.cm.getValue()
    this.setState({ step: step, code: code })

  }

  render() {
    return (
      <div>
        <button className="ui basic button" onClick={ this.showHint.bind(this) }>Show Hint</button>

        <div id={ this.state.id } className="ui message">
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
            max={ this.state.stream.length }
            value={ this.state.step }
            onChange={ this.updateStep.bind(this) }
          />
          </div>

        </div>

        <CodeMirror value={ this.state.code }
                    ref="editor"
                    options={ this.props.options }
        />
      </div>
    )
  }
}

export default DataHint
