import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'


class BehaviorHint extends Component {
  constructor() {
    super()
    this.state = {
      code: '\n',
      step: 0
    }
    window.behaviorHint = this
  }

  componentDidMount() {
    $.ajax({
      method: 'GET',
      url: '/data/behavior-hint-1.py',
    })
    .then((res) => {
      let origin = []
      for (let line of res.split('\n')) {
        origin.push(line)
      }
      this.setState({ code1: res, origin: origin })
    })
  }

  showHint() {
    this.cm = this.refs.editor1.getCodeMirror()
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

  updateStep(value) {
    let step = Math.floor(value)
    this.setState({ step: step })
  }

  handle(props) {
    const Handle = Slider.Handle
    const { value, dragging, index } = props
    return (
      <Tooltip
        overlay={ value }
        visible={ dragging }
        placement="top"
        key={ index }
      >
        <Handle {...props} />
      </Tooltip>
    )
  }

  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true,
      gutters: ['CodeMirror-linenumbers', 'breakpoints']
    }

    return (
      <div id="behavior-hint">
        <h1>Behavior Hint</h1>
        <p className="ui text">{ description }</p>
        <button className="ui basic button" onClick={ this.showHint.bind(this) }>Show Hint</button>
        <Slider
          dots
          min={ 0 }
          max={ 15 }
          value={ this.state.step }
          handle={ this.handle }
          onChange={ this.updateStep.bind(this) }
        />
        <CodeMirror value={ this.state.code1 }
                    ref="editor1"
                    options={ options }
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
        </div>
      </div>
    )
  }
}

export default BehaviorHint

const description = 'The Data hint points to a difference in the program state in a particular moment of the program execution. Sometimes, however, it is hard to understand how that difference affects the program behavior considering the entire program execution. The Behavioral hint provides information about the internal behavior of the program dur- ing its execution. For instance, in our running example, a Behavioral hint would be: “The variable total received the following values after the program execution: 0, 0, 0, 0. The expected values are: 2, 18, 72, 72. As another example of a Behavioral hint, consider a scenario where the student had forgotten to add a base case to the recursion, and the code thrown a StackOverFlowException. A Behavioral hint will show the difference in the expected number of calls to the recursive function and the actual one.'