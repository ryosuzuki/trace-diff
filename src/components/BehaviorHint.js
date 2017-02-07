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
    const message = this.props.message
    this.props.options.gutters = gutters
    this.state = {
      code: '',
      id: id,
      step: 0,
      stream: [],
      message: message,
      expected: [],
      result: [],
      tick: 0
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
    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}data/${this.state.id}.json`,
    })
    .then((res) => {
      this.setState({ stream: res })
    })
  }

  showHint() {
    this.cm = this.refs.editor.getCodeMirror()
    $(`#${this.state.id}`).slideToggle()

    this.setState({
      expected: [11, 12, 14, 17, 21, 26],
      result: [1, 2, 4, 7, 11, 16],
    })

    let msg = document.createElement('div')
    msg.className = 'inline-hint'
 // debugger
    msg.append($('.arrow-border').clone()[0])
    msg.append($('.arrow-up').clone()[0])
    msg.append($('.dynamic-hint').clone()[0])
    this.cm.addLineWidget(4, msg, { coverGutter: true })
    this.cm.markText({ line: 4, ch: 4 }, { line: 4, ch: 9 }, { className: 'highlight' })
    /*
    let marker = document.createElement('div')
    marker.append($('.label')[0])
    this.cm.setGutterMarker(3, 'breakpoints', marker)
    */
  }

  playStep() {
    let interval = 100
    let timer = setInterval(() => {
      if (this.state.step >= this.state.stream.length) {
        clearInterval(timer)
      } else {
        this.updateStep(this.state.step+1)
      }
    }, interval)
  }

  updateStep(value) {
    let step = Math.floor(value)
    this.cm.setValue(this.state.origin)
    if (step < 3) this.setState({ tick: 0 })
    if (step >= 3) this.setState({ tick: 1 })
    if (step >= 5) this.setState({ tick: 2 })
    if (step >= 8) this.setState({ tick: 3 })
    if (step >= 11) this.setState({ tick: 4 })
    if (step >= 14) this.setState({ tick: 5 })
    if (step >= 17) this.setState({ tick: 6 })

    let msg = document.createElement('div')
    msg.className = 'inline-hint'
    msg.append($('.arrow-border').clone()[0])
    msg.append($('.arrow-up').clone()[0])
    msg.append($('.dynamic-hint').clone()[0])
    this.cm.addLineWidget(4, msg, { coverGutter: true })
    this.cm.markText({ line: 4, ch: 4 }, { line: 4, ch: 9 }, { className: 'highlight' })

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
      if (line === 0) {
        let ch = this.state.origin.split('\n')[line].length
        let space = ' '
        for (let i = ch; i < 30; i++) {
          space += ' '
        }
        let msg = `${space} #   ${hash.msg}`
        this.cm.replaceRange(msg, { line: line, ch: ch }, { line: line, ch: Infinity })
      }
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
        <div style={{ display: 'none' }}>
        <div className="ui blue label call-label">
          10 calls
        </div>
        <div className="arrow-up"></div>
        <div className="arrow-border"></div>
        <pre className="dynamic-hint">
          Expected |  { this.state.expected.slice(0, this.state.tick).map((i) => {
            let num = `${i}`
            let space = Array(2 - num.length).fill(' ').join('')
            return `${space}${num}`
          }).join('  |  ') }
          <br />
          Result   |  { this.state.result.slice(0, this.state.tick).map((i) => {
            let num = `${i}`
            let space = Array(2 - num.length).fill(' ').join('')
            return `${space}${num}`
          }).join('  |  ') }
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
