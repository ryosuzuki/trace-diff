import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'

import FirstStep from './MixedHint/FirstStep'
import SecondStep from './MixedHint/SecondStep'

import Highlight from 'react-highlight'
import Quiz from './MixedHint/Quiz'


class MixedHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      detail: '',
      step: 4,
      loops: [],
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
    // let code2 = this.props.before.split('\n')[3]
    // this.getAST(code2, 'loop')
  }

  generateDiff() {
    setTimeout(() => {
      console.log('update')
      for (let line of this.props.removed) {
        this.cm.addLineClass(line, '', 'removed')
      }
      for (let line of this.props.added) {
        this.cm.addLineClass(line, '', 'added')
      }
    }, 5000)
  }

  onClick() {
    this.setState({ step: this.state.step + 1 })
  }

  render() {
    return (
      <div>
        <h1>Mixed Hint</h1>

        <div className="ui message hint-message">
          <div id="step-1">
            <h1>Step 1</h1>
            <p>Your <code>accumulate</code> function failed 1 test case</p>
            <Highlight className="python">
              { this.props.log }
            </Highlight>
          </div>

          <div id="step-2">
            <h1>Step 2</h1>
            <p>Let's think with the following example.</p>
            <Highlight className="python">
              { this.props.test }
            </Highlight>
            <p>Look at line { 2 }</p>
            <Quiz
              id={ 'quiz-1' }
              options={ this.props.options }
              line={ this.props.removed[0] }
              code={ this.props.before }
            />
          </div>

          <div id="step-3">
            <h1>Step 3</h1>
            <p>Let's think about the behavior of <code>{ 'previous' }</code>.</p>
            <p>When <code>{ 'i = 1' }</code>, </p>
            <Quiz
              id={ 'quiz-2' }
              options={ this.props.options }
              code={ this.props.before }
              line={ 3 }
            />

            <p>In a similar way, the behavior of <code>prevous</code> looks like this</p>


            <table className="ui celled table">
              <thead>
                <tr>
                <th><code>previous</code></th>
                <th>-</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
              </tr></thead>
              <tbody>
                <tr>
                  <td>Result</td>
                  { this.props.beforeHistory['previous'] ? this.props.beforeHistory['previous'].history.map((i) => {
                    return <td>{ i }</td>
                  }) : '' }
                </tr>
                <tr>
                  <td>Expected</td>
                  { this.props.afterHistory['previous'] ? this.props.afterHistory['previous'].history.map((i) => {
                    return <td>{ i }</td>
                  }) : '' }
                </tr>
              </tbody>
            </table>
          </div>

        </div>
        <h2>Code</h2>
        <CodeMirror
          value={ this.props.code }
          ref="editor"
          options={ this.props.options }
        />


        <div className="markdown">
          <pre>
            { _.union(Object.keys(this.props.beforeHistory), Object.keys(this.props.afterHistory)).map((key) => {
              return (
                <div key={ key }>
                  <code>
                    { key }
                  </code>
                  <br />
                  <code>
                    - Expected: { this.props.beforeHistory[key] ? this.props.beforeHistory[key].history.join(' | ') : '' }
                  </code>
                  <br />
                  <code>
                    - Result:   { this.props.afterHistory[key] ? this.props.afterHistory[key].history.join(' | ') : '' }
                  </code>
                  <br />
                  <code>
                    - Calls:    { this.props.beforeHistory[key] ? this.props.beforeHistory[key].calls ? this.props.beforeHistory[key].calls.join(' | ') : '' : '' }
                  </code>
                  <br />
                  <code>
                    - Calls Exp:{ this.props.afterHistory[key] ? this.props.afterHistory[key].calls ? this.props.afterHistory[key].calls.join(' | ') : '' : '' }
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

export default MixedHint


/*

          <div id="step-2" style={{ display: this.state.step >= 2 ? 'block' : 'none' }}>
            <h1>Step 2</h1>
            <p>Let's look at line { this.props.removed[0] + 1 }</p>
            <pre><code>{ this.props.removedLine[0] ? _.last(this.props.removedLine).code.trim() : '' }</code></pre>
            { this.state.quizes.map((quiz, index) => {
              return (
                <div id={ `q-${index}` } key={ index }>
                  <p>Q. What is the value of <code>{ quiz.key }</code>?</p>
                  <p>
                    <code>{ quiz.key }</code> =
                    <input className={ 'inline-input'  } type="text" placeholder={ quiz.value } onChange={ this.onChange.bind(this, quiz, index) } />
                    <span className="inline-message">Correct!</span>
                  </p>
                  { quiz.calls ? quiz.calls.map((call) => {
                    return (
                      <p>{ call }</p>
                    )
                  }) : '' }
                </div>
              )
            }) }
          </div>
          <button className="ui basic button" onClick={ this.onClick.bind(this) }>Next</button>

 */