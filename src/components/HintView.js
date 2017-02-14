import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Datastore from 'nedb'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'

class HintView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      type: 'Data',
      step: 0,
      stop: false,
      message: '',
      code: '',
      origin: '',
      traces: [],
    }
    window.hintView = this
  }

  componentDidMount() {
    this.cm = this.refs.editor.getCodeMirror()
    this.initHint()
  }

  showHint() {
    $(`#${this.state.id}`).slideToggle()
  }

  onSelect(type) {
    this.setState({ type: type }, () => {
      this.initHint()
    })
  }

  initHint() {
    this.setState({
      step: 0,
      stop: false,
      message: '',
      code: this.props.beforeCode,
      origin: this.props.beforeCode,
      traces: this.props.traces,
      beforeTraces: this.props.beforeTraces,
      afterTraces: this.props.afterTraces,
    })
  }

  playStep() {
    let interval = 100
    this.setState({ stop: false })
    let timer = setInterval(() => {
      if (this.state.step >= this.state.origin.length || this.state.stop) {
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

    let current = this.state.traces.slice(0, step)
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
    const types = ['None', 'Location', 'Data', 'Behavior', 'Transformation']
    return (
      <div>
        <div className="ui form">
          <div className="inline fields">
            <label name="hint">Select Hint Types:</label>
            { types.map((type) => {
              return (
                <div className="field" key={ type }>
                  <div className="ui radio checkbox" key={ type } onClick={ this.onSelect.bind(this, type) }>
                    <input type="radio" checked={ type === this.state.type ? true : false } tabIndex="0" onChange={ this.onSelect.bind(this, type) } />
                    <label style={{ cursor: 'pointer' }}>{ type }</label>
                  </div>
                </div>
              )
            }) }
          </div>
        </div>

        <div className="ui message">
          <div className="header">
            { this.state.type } Hint
          </div>
          <p>{ this.state.message }</p>
          { ['Data', 'Behavior'].includes(this.state.type) ?
            <div className="play-area">
              <button className="ui basic button play-button" onClick={ this.playStep.bind(this) }>
                <i className="fa fa-play fa-fw"></i>
              </button>
              <Slider
                dots
                min={ 0 }
                max={ this.state.traces.length }
                value={ this.state.step }
                onChange={ this.updateStep.bind(this) }
              />
            </div>
          : null }
        </div>

        <h2>Code</h2>
        <CodeMirror
          value={ this.state.code }
          ref="editor"
          options={ this.props.options }
        />
        <br />
        <h2>Failed Test Result</h2>
        <div className="markdown">
          <pre><code>{ this.props.log }</code></pre>
        </div>
      </div>
    )
  }
}

export default HintView
