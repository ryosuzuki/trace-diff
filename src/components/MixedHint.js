import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'
import Highlight from 'react-highlight'
import Quiz from './MixedHint/Quiz'
import HistoryLog from './MixedHint/HistoryLog'
import Ladder from './MixedHint/Ladder'

class MixedHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 0,
      loops: [],
      text: '',
      events: [],
    }
    window.mixedHint = this
  }

  componentDidMount() {
    this.init()
  }

  init() {
    if (!this.refs.editor) return false
    this.cm = this.refs.editor.getCodeMirror()
    window.before = this.props.before
    window.after = this.props.after
    for (let line of this.props.removed) {
      this.cm.addLineClass(line, '', 'highlight')
    }

    // let code1 = this.props.before.split('\n')[4]
    // if (this.props.removedLine[0]) {
    //   let i = this.props.removedLine.length
    //   let code = this.props.removedLine[i-1].code
    // }

    this.generateDiff()
    this.translate()

    // this.cm2 = this.refs.editor2.getCodeMirror()
    // this.cm2.markText({ line: 1, ch: 15}, { line: 1, ch: 26 }, { className: 'highlight' })

    // let code2 = this.props.before.split('\n')[3]
    // this.getAST(code2, 'loop')
  }

  generateDiff() {
    console.log('update')
    for (let line of this.props.removed) {
      this.cm.addLineClass(line, '', 'removed')
    }
    for (let line of this.props.added) {
      this.cm.addLineClass(line, '', 'added')
    }
  }

  onClick() {
    this.setState({ step: this.state.step + 1 })
  }

  translate(compare = false) {
    let events = this.props.beforeEvents
    // .filter(event => this.props.focusKeys.includes(event.key))
    let filteredEvents = []
    let text = ''
    for (let event of events) {
      switch (event.type) {
        case 'call':
          if (event.children.length === 0) continue
          for (let child of event.children) {
            text += `${event.key} calls ${child}`
          }
          break
        case 'return':
          if (event.builtin) continue
          text += `${event.key} returns ${event.value}`
          break
        default:
          if (!this.props.focusKeys.includes(event.key)) continue
          if (event.index === 0) {
            text += `${event.key} is initialized with ${event.value}`
          } else {
            text += `${event.key} is updated to ${event.value}`
          }
          break
      }
      text += ` at line ${ event.line }`
      text += '\n'
      if (event.type !== 'call') filteredEvents.push(event)
    }
    this.setState({ text: text, events: filteredEvents })
  }

  clickWhy() {
    $('#step-2-1').show()
    $('#button-2-1').removeClass('primary')

  }

  render() {
    return (
      <div>
        <h1>Mixed Hint</h1>

        <div className="ui message hint-message">
          <div id="step-1" className="step">
            <h1 className="title">Step 1: Identify the Error</h1>
            <h2>Hint Strategy: Test-based Hints</h2>
            <p>Your <code>accumulate</code> function failed 1 test case</p>
            <Highlight className="python">
              { this.props.log }
            </Highlight>

            <div id="next-1" className="next" style={{ display: this.state.step === 0 ? 'block' : 'none' }}>
              <button className="ui primary button" onClick={ this.onClick.bind(this) }>Next</button>
            </div>
          </div>

          <div id="step-2" className="step" style={{ display: this.state.step >= 1 ? 'block' : 'none' }}>
            <h1 className="title">Step 2: Understand the Behavior</h1>
            <h2>Hint Strategy: Data or Behavior Hints with Scaffolding Questions</h2>

            <h2>Step 2-1: Highlight the Behavior of Key Variables</h2>
            <p>Let's think with the following example. With your <code>accumulate</code> function,</p>
            <Highlight className="python">
              { `${this.props.test} returns ${this.props.result}` }
            </Highlight>

            <p>
              <button id="button-2-1" className="ui basic primary button" onClick={ this.clickWhy }>Q. Why { this.props.test } returns { this.props.result } ?</button>
            </p>

            <div id="step-2-1" style={{ display: 'none' }}>
              <Highlight className="python">
                { this.state.text }
              </Highlight>
              <div className="next" style={{ display: this.state.step === 1 ? 'block' : 'none' }}>
                <button className="ui primary button" onClick={ this.onClick.bind(this) }>Next</button>
              </div>
            </div>

            <div id="step2-2" style={{ display: this.state.step >= 2 ? 'block' : 'none' }}>
              <h2>Step 2-2: Understand the Behavior with Scaffolding Questions</h2>
              { this.state.events.map((event, index) => {
                let question = ''
                question += 'Q. Why '
                question += event.key
                if (event.type === 'return') {
                  question += ' returns '
                }
                if (event.type === 'assign') {
                  if (event.index === 0) {
                    question += ' is initialized with '
                  } else {
                    question += ' is updated to '
                  }
                }
                question += event.value
                question += ' ?'
                let events = this.props.beforeEvents.slice(0, event.id)
                let history = {}
                for (let e of events) {
                  history[e.key] = e
                }

                return (
                  <div key={ index }>
                    <p>{  }</p>
                    <Quiz
                      description={ question }
                      id={ `quiz-${ index }` }
                      options={ this.props.options }
                      line={ event.line }
                      before={ this.props.before }
                      beforeAst={ this.props.beforeAst }
                      history={ history }
                    />
                    <div className="ui divider"></div>
                  </div>
                )
              }) }

              <div id="next-1" className="next" style={{ display: this.state.step === 2 ? 'block' : 'none' }}>
                <button className="ui primary button" onClick={ this.onClick.bind(this) }>Next</button>
              </div>
            </div>
          </div>

          <div id="step-3" className="step" style={{ display: this.state.step >= 3 ? 'block' : 'none' }}>
            <h1 className="title">Step 3: Understand the Cause and Misconception</h1>
            <h2>Hint Strategy: Behavior Hints with Ladder of Abstraction</h2>
            <Ladder
              beforeHistory={ this.props.beforeHistory }
              afterHistory={ this.props.afterHistory }
              beforeEvents={ this.props.beforeEvents }
              afterEvents={ this.props.afterEvents }
              beforeAst={ this.props.beforeAst }
              afterAst={ this.props.afterAst }
              focusKeys={ this.props.focusKeys }
              test={ this.props.test }
              expected={ this.props.expected }
              result={ this.props.result }
              root={ this }
            />
          </div>

          <div id="step-4" className="step" style={{ display: this.state.step >= 4 ? 'block' : 'none' }}>
            <h1 className="title">Step 4: Fix the Error</h1>
            <h2>Hint Strategy: Location Hints and Interactive Debugger</h2>
            <p>How can you fix it?</p>

            <div className="ui negative message">
              <div className="header">
                Python back-end is currently not available.
              </div>
              <p>
                Since the current app is running with pure client JavaScript, Python back-end is only available at localhost.
                <br/>
                It is supposed to be an interactive code editor and debugger.
              </p>
            </div>
            <h2>Location Hint</h2>
            <p>Under construction (e.g. the assignment of previous has a mistake at line 2, and highlight <code>term(base)</code>)</p>

          </div>

          <div id="step-code" className="step">
            <h2>Code</h2>
            <CodeMirror
              value={ this.props.before }
              ref="editor2"
              options={ this.props.options }
            />
          </div>
        </div>

        <div className="teacher" style={{ marginTop: '30px', display: this.state.step >= 4 ? 'block' : 'none' }}>
          <h1 className="title">Teacher</h1>
          <h2>Answer</h2>
          <CodeMirror
            value={ this.props.code }
            ref="editor"
            options={ this.props.options }
          />

          <h2>Code Traces</h2>
          <HistoryLog
            beforeHistory={ this.props.beforeHistory }
            afterHistory={ this.props.afterHistory }
          />
        </div>
      </div>
    )
  }
}

export default MixedHint
