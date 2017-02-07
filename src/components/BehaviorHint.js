import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'


class BehaviorHint extends Component {
  constructor(props) {
    super(props)
    const gutters = ['CodeMirror-linenumbers', 'breakpoints']
    const id = `behavior-hint-${this.props.index}`
    this.props.options.gutters = gutters
    this.state = {
      code: '',
      id: id,
      step: 0
    }
    window.behaviorHint = this
  }

  componentDidMount() {
    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}data/${this.state.id}.py`,
    })
    .then((res) => {
      this.setState({ code: res, origin: res })
    })
  }

  showHint() {
    this.cm = this.refs.editor.getCodeMirror()
    $(`#${this.state.id}`).slideToggle()

    let msg = document.createElement('div')
    msg.className = 'inline-hint'
    msg.append($('.arrow-border')[0])
    msg.append($('.arrow-up')[0])
    msg.append($('.dynamic-hint')[0])
    this.cm.addLineWidget(4, msg, { coverGutter: true })

    this.cm.markText({ line: 4, ch: 4 }, { line: 4, ch: 7 }, { className: 'highlight' })

    let marker = document.createElement('div')
    marker.append($('.label')[0])
    this.cm.setGutterMarker(3, 'breakpoints', marker)
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
    this.setState({ step: step })
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
        <div style={{ display: 'none' }}>
        <div className="ui blue label call-label">
          10 calls
        </div>
        <div className="arrow-up"></div>
        <div className="arrow-border"></div>
        <pre className="dynamic-hint">
          Expected |  { [...Array(this.state.step).keys()].join('  ') }
          <br />
          Result   |  { [...Array(this.state.step).fill(0)].join('  ') }
        </pre>
        { /*
        <table className="ui definition table">
          <thead>
            <tr>
              <th></th>
              { [...Array(10).keys()].map((i) => {
                return <th className={ i === this.state.step ? 'active' : '' }>{ i }</th>
              }) }
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Expected
              </td>
              { [...Array(10).keys()].map((i, index) => {
                return <td className={ index === this.state.step ? 'active' : '' }>{ i }</td>
              }) }
            </tr>
            <tr>
              <td>
                Result
              </td>
              { [...Array(10).fill(0)].map((i, index) => {
                return <td className={ index === this.state.step ? 'active' : '' }>{ i }</td>
              }) }
            </tr>
          </tbody>
        </table>
        */ }
        </div>
      </div>
    )
  }
}

export default BehaviorHint
