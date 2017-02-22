import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'
import _ from 'lodash'

class BehaviorHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      expected: [],
      result: [],
      tick: 0,
      beforeHistory: {},
      afterHistory: {}
    }
    window.behaviorHint = this
  }

  componentDidMount() {
    this.init()
  }

  init() {
    if (!this.refs.editor) return false
    this.cm = this.refs.editor.getCodeMirror()

    // this.cm.markText({ line: 4, ch: 4 }, { line: 4, ch: 9 }, { className: 'highlight' })
    /*
    let marker = document.createElement('div')
    marker.append($('.label')[0])
    this.cm.setGutterMarker(3, 'breakpoints', marker)
    */

   this.generate('before')
   this.generate('after')
  }


  playStep() {
    let interval = 100
    window.app.updateState({ stop: false })
    let timer = setInterval(() => {
      if (this.props.step >= this.props.traces.length || this.props.stop) {
        clearInterval(timer)
        window.app.updateState({ stop: false })
      } else {
        try {
          this.updateStep(this.props.step+1)
        } catch (err) {
          this.updateStep(this.props.step-1)
          window.app.updateState({ stop: true })
        }
      }
    }, interval)
  }

  updateStep(value) {
    let step = Math.floor(value)
    this.cm.setValue(this.props.beforeCode)

    let current = this.props.traces[step]
    /*
    if (current.error) {
      this.cm.addLineClass(current.line-1, '', 'highlight')
      window.app.updateState({ stop: true })
    } else {
      this.cm.addLineClass(current.line-1, '', 'current-line')
    }
    */
    this.cm.addLineClass(current.line-1, '', 'current-line')

    let msg = document.createElement('div')
    msg.className = 'inline-hint'
    msg.append($('.arrow-border').clone()[0])
    msg.append($('.arrow-up').clone()[0])
    msg.append($('.dynamic-hint').clone()[0])
    this.cm.addLineWidget(this.props.removed[0], msg, { coverGutter: true })

    const getLog = (output) => {
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
          if (output[key]) msg += output[key]
        }
      }
      return msg
    }

    const getValue = (output) => {
      let val = ''
      for (let key of Object.keys(output)) {
        if (output[key] instanceof Object) {
        } else {
          if (output[key]) val += output[key]
        }
      }
      return val
    }

    window.current = current
    for (let line of Object.keys(current.outputs)) {
      let output = current.outputs[line]
      // output = JSON.stringify(output)
      let msg = getLog(output)

      let fixedOutput = current.fixedOutputs ? current.fixedOutputs[line] : null
      if (fixedOutput && !_.isEqual(output, fixedOutput)) {
        msg += ' should be '
        msg += getLog(fixedOutput)
      }

      let ch = this.props.beforeCode.split('\n')[line-1].length
      let space = ' '
      // for (let i = ch; i < 30; i++) {
      //   space += ' '
      // }
      msg = `${space} # ${msg}`
      this.cm.replaceRange(msg, { line: line-1, ch: ch }, { line: line-1, ch: Infinity })
    }

    /*
    if (current.line - 1 === this.props.removed[0]) {
      let output = current.outputs[current.line]
      let fixedOutput = current.fixedOutputs ? current.fixedOutputs[current.line] : null
      let val = getValue(output)
      let result = this.state.result.concat([val])
      let expected = this.state.expected
      if (fixedOutput) {
        let fixedVal = getValue(fixedOutput)
        expected = expected.concat([fixedVal])
      }
      this.setState({
        expected: expected,
        result: result,
      })
    }
    */

    let code = this.cm.getValue()
    window.app.updateState({ step: step, currentCode: code })
  }


  generate(type) {
    let history = {}
    let ticks = {}
    let traces
    if (type === 'before') {
      traces = this.props.beforeTraces
    } else {
      traces = this.props.afterTraces
    }
    for (let i = 0; i < traces.length; i++) {
      let trace = traces[i]
      for (let func of Object.keys(trace.locals)) {
        let variables = trace.locals[func]
        for (let key of Object.keys(variables)) {
          let value = variables[key]
          if (value === undefined) continue

          if (!ticks[key]) ticks[key] = {}
          if (!history[key]) history[key] = []
          let last = _.last(history[key])
          if (last === undefined || last !== value) {
            history[key].push(value)
          }
          ticks[key][i] = history[key].length
        }
      }
    }

    if (type === 'before') {
      this.setState({ beforeHistory: history, beforeTicks: ticks })
    } else {
      this.setState({ afterHistory: history, afterTicks: ticks })
    }
  }



  render() {
    return (
      <div>
        <h1>Under Construction (Current Status: Buggy)</h1>
        <div className="ui message">
          <div className="header">
            Behavior Hint
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

        <pre className="markdown">
          { Object.keys(this.state.afterHistory).map((key) => {
            return (
              <div>
                <code key={ key }>
                  { key }
                </code>
                <br />
                <code>
                  Expected: { this.state.afterHistory[key].join(' | ') }
                </code>
                <br />
                <code>
                  Result:   { this.state.beforeHistory[key].join(' | ') }
                </code>
              </div>
            )
          }) }
        </pre>

        <h2>Code</h2>
        <CodeMirror
          value={ this.props.currentCode }
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
            Expected |  { this.state.expected.map((i) => {
              // let num = `${i}`
              // let space = Array(2 - num.length).fill(' ').join('')
              // return `${space}${num}`
              return i
            }).join('  |  ') }
            <br />
            Result   |  { this.state.result.map((i) => {
              // let num = `${i}`
              // let space = Array(2 - num.length).fill(' ').join('')
              // return `${space}${num}`
              return i
            }).join('  |  ') }
          </pre>
        </div>
      </div>
    )
  }
}

export default BehaviorHint
