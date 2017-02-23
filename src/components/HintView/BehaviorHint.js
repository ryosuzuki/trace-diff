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
      tick: 0,
      expected: {},
      result: {},
      keys: [],
      key: '',
      line: 0,
      beforeHistory: {},
      afterHistory: {},
      beforeTicks: {},
      afterTicks: {},
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

   this.generate()
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

  generateHistory(traces) {
    let history = {}
    let ticks = {}
    let lines = {}
    for (let i = 0; i < traces.length; i++) {
      let trace = traces[i]
      for (let func of Object.keys(trace.locals)) {
        if (func !== 'accumulate') continue

        let variables = trace.locals[func]
        for (let key of Object.keys(variables)) {
          let value = variables[key]
          if (value === undefined) continue

          if (!history[key]) history[key] = []
          if (!lines[key]) lines[key] = []
          if (!ticks[key]) ticks[key] = {}

          let line = trace.line
          if (trace.event === 'step_line') {
            line = traces[i-1].line
          }
          let last = _.last(history[key])
          if (last === undefined || last !== value) {
            history[key].push(value)
            lines[key].push(line)
          }
          ticks[key][i] = history[key].length
          if (trace.event === 'step_line') {
            ticks[key][i-1] = history[key].length
          }
        }
      }
    }
    return { history: history, lines: lines, ticks: ticks }
  }

  generate() {
    let before = this.generateHistory(this.props.beforeTraces)
    let after = this.generateHistory(this.props.afterTraces)
    let commonKeys = _.intersection(Object.keys(before.history), Object.keys(after.history))

    let line
    let keys = []
    for (let key of commonKeys) {
      if (key === '__return__') continue
      if (!_.isEqual(before.history[key], after.history[key])) {
        let obj = _.countBy(before.lines[key])
        line = Number(Object.keys(obj).reduce(function(a, b){ return obj[a] > obj[b] ? a : b }))
        keys.push(key)
      }
    }
    this.setState({
      beforeHistory: before.history,
      beforeTicks: before.ticks,
      afterHistory: after.history,
      afterTicks: after.ticks,
      keys: keys,
      line: line,
    })
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

    let result = {}
    let expected = {}
    for (let key of Object.keys(this.state.beforeHistory)) {
      let history = this.state.beforeHistory[key]
      let tick = this.state.beforeTicks[key][step]
      if (!tick) tick = 0
      result[key] = history.slice(0, tick)
    }
    for (let key of Object.keys(this.state.afterHistory)) {
      let history = this.state.afterHistory[key]
      // let tick = this.state.afterTicks[key][step]
      let tick = this.state.beforeTicks[key][step]
      if (!tick) tick = 0
      expected[key] = history.slice(0, tick)
    }

    this.setState({ expected: expected, result: result })

    let code = this.cm.getValue()
    window.app.updateState({ step: step, currentCode: code })

    this.cm.addLineClass(current.line-1, '', 'current-line')
    let msg = document.createElement('div')
    msg.className = 'inline-hint'
    msg.append($('.arrow-border').clone()[0])
    msg.append($('.arrow-up').clone()[0])
    msg.append($('.dynamic-hint').clone()[0])
    this.cm.addLineWidget(this.state.line-1, msg, { coverGutter: true })


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
            { this.state.keys.map((key, index) => {
              return (
                <div key={ key }>
                  o { key }: { this.state.expected[key] ? this.state.expected[key].join(' | ') : '' }
                  <br />
                  x { key }: { this.state.result[key] ? this.state.result[key].join(' | ') : '' }

                  { index !== this.state.keys.length-1 ? (
                    <span><br /><br /></span>
                  ) : (
                    ''
                  ) }
                </div>
              )
            }) }
          </pre>
        </div>

        <div className="markdown">
          <pre>
            { _.intersection(Object.keys(this.state.beforeHistory), Object.keys(this.state.afterHistory)).map((key) => {
              return (
                <div key={ key }>
                  <code>
                    { key }
                  </code>
                  <br />
                  <code>
                    - Expected: { this.state.expected[key] ? this.state.expected[key].join(' | ') : '' }
                  </code>
                  <br />
                  <code>
                    - Result:   { this.state.result[key] ? this.state.result[key].join(' | ') : '' }
                  </code>
                  <br />
                  <br />
                </div>
              )
            }) }
          </pre>
        </div>

      </div>
    )
  }
}

export default BehaviorHint
