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
        <h1>Interactive Hint</h1>

        <div className="ui message hint-message">
          <div className="ui two column grid">
            <div id="step-code" className="eight wide column">
              <h2>Code</h2>
              <CodeMirror
                value={ this.props.before }
                ref="editor2"
                options={ this.props.options }
              />
              <br />
              <h2>Failed Test Result</h2>
              <Highlight className="python">
                { this.props.log }
              </Highlight>
            </div>
          </div>
          <div className="ui two column grid">

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
