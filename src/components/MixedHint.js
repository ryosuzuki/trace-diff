import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'

import FirstStep from './MixedHint/FirstStep'
import SecondStep from './MixedHint/SecondStep'

import Highlight from 'react-highlight'
import Quiz from './MixedHint/Quiz'
import HistoryLog from './MixedHint/HistoryLog'
import Ladder from './MixedHint/Ladder'


class MixedHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 4,
      loops: [],
      detail: '',
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

    this.cm2 = this.refs.editor2.getCodeMirror()
    this.cm2.markText({ line: 1, ch: 15}, { line: 1, ch: 26 }, { className: 'highlight' })

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


  render() {

    const translate = (key, compare = false) => {
      if (!this.props.beforeHistory[key]) return null
      let after = this.props.afterHistory[key].history
      let before = this.props.beforeHistory[key].history
      let text = ''
      for (let i = 0; i < before.length; i++) {
        let result = before[i]
        let expected = after[i]
        if (i === 0) {
          text += `${key} is initialized with ${result}`
        } else {
          text += `${key} is updated to ${result}`
        }
        if (compare) text += ` should be ${expected}`
        text += '\n'
      }
      text += `${this.props.test} returns ${this.props.result}`
      if (compare) text += ` should be ${this.props.expected}`
      return text
    }

    return (
      <div>
        <h1>Mixed Hint</h1>

        <div className="ui message hint-message">
          <div id="step-1" className="step">
            <h1 className="title">Step 1</h1>
            <p>Your <code>accumulate</code> function failed 1 test case</p>
            <Highlight className="python">
              { this.props.log }
            </Highlight>
          </div>

          <div id="step-2" className="step">
            <h1 className="title">Step 2</h1>
            <p>Let's think with the following example. With your <code>accumulate</code> function,</p>
            <Highlight className="python">
              { `${this.props.test} returns ${this.props.result}` }
            </Highlight>

            <h2>Step 2-1</h2>
            <p>Q. Why { this.props.test } returns { this.props.result } ?</p>
            <p>
              <button className="ui primary button">Why ?</button>
            </p>

            <Highlight className="python">
              { translate('previous') }
            </Highlight>


            <h2>Step 2-2</h2>
            <p>Q. Why previous is initialized with 121?</p>
            <Quiz
              description={ `Q. Why previous is initialized with 121?` }
              id={ 'quiz-1' }
              options={ this.props.options }
              line={ this.props.removed[0] }
              code={ this.props.before }
              history={ this.props.beforeHistory }
            />

            <h2>Step 2-3</h2>
            <p>Q. Why previous is updated to 122 ?</p>
            <Quiz
              description={ `Q. Why previous is updated to 122?` }
              id={ 'quiz-2' }
              options={ this.props.options }
              line={ 3 }
              code={ this.props.before }
              history={ this.props.beforeHistory }
            />

            <h2>Step 2-4</h2>
            <Ladder
              name={ 'previous' }
              beforeHistory={ this.props.beforeHistory }
              afterHistory={ this.props.afterHistory }
              test={ this.props.test }
              expected={ this.props.expected }
              result={ this.props.result }
            />
          </div>

          <div id="step-3" className="step">
            <h1 className="title">Step 3</h1>
            <p>So, it seems like your 2nd argument of initialization is wrong.</p>
            <p>How can you fix that?</p>

            <CodeMirror
              value={ this.props.before }
              ref="editor2"
              options={ this.props.options }
            />

          </div>

        </div>

        <h2>Code</h2>
        <CodeMirror
          value={ this.props.code }
          ref="editor"
          options={ this.props.options }
        />


        <HistoryLog
          beforeHistory={ this.props.beforeHistory }
          afterHistory={ this.props.afterHistory }
        />
      </div>
    )
  }
}

export default MixedHint
