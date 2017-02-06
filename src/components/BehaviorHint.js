import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'

class BehaviorHint extends Component {
  constructor() {
    super()
    this.state = {
      code: '',
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
      this.setState({ code: res })
      let origin = []
      for (let line of res.split('\n')) {
        origin.push(line)
      }
      this.setState({ code: res, origin: origin })
    })
  }

  showHint() {
    this.cm = this.refs.editor.getCodeMirror()
    let msg = document.createElement('div')
    msg.append($('.table')[0])
    // debugger
    this.cm.addLineWidget(4, msg)
  }

  updateStep(value) {
    let step = Math.floor(value)
    this.setState({ step: step })
  }

  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true
    }

    return (
      <div id="behavior-hint">
        <h1>Behavior Hint</h1>
        <button className="ui basic button" onClick={ this.showHint.bind(this) }>Show Hint</button>
        <CodeMirror value={ this.state.code }
                    ref="editor"
                    options={ options }
        />
        <Slider
          dots
          min={ 0 }
          max={ 15 }
          value={ this.state.step }
          onChange={ this.updateStep.bind(this) }
        />
        <div style={{ display: 'none' }}>
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