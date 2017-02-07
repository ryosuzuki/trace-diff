import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'

class DataHint extends Component {
  constructor(props) {
    super(props)
    const id = `data-hint-${this.props.index}`
    this.state = {
      code: '',
      id: id,
      step: 0
    }
    window.dataHint = this
  }

  componentDidMount() {
    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}data/${this.state.id}.py`,
    })
    .then((res) => {
      this.setState({ code: res })
      this.setState({ code: res, origin: res })
    })
  }

  showHint() {
    this.cm = this.refs.editor.getCodeMirror()
    $(`#${this.state.id}`).slideToggle()
  }

  playStep() {
    let interval = 100
    let timer = setInterval(() => {
      if (this.state.step >= 15) {
        clearInterval(timer)
      } else {
        this.updateStep(this.state.step+1)
      }
    }, interval)
  }

  updateStep(value) {
    let step = Math.floor(value)
    this.cm.setValue(this.state.origin)
    for (let i = 0; i < step; i++) {
      let line = i
      let ch = this.state.origin.split('\n')[line].length
      let space = ' '
      for (let i = ch; i < 35; i++) {
        space += ' '
      }
      this.cm.replaceRange(space + '# test = 1, n = 0', { line: line, ch: ch }, { line: line, ch: Infinity })
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
          <p>There is an error in line {this.state.error_1}.</p>

          <div className="play-area">
          <button className="ui basic button play-button" onClick={ this.playStep.bind(this) }>
            <i className="fa fa-play fa-fw"></i>
          </button>
          <Slider
            dots
            min={ 0 }
            max={ 15 }
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
