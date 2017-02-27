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

    // $('#step-3 .button')
    // .popup({
    //   position: 'bottom center',
    //   target: '#table-1',
    //   lastResort: 'bottom right',
    //   title: 'HOGEHO',
    //   content  : 'My favorite dog would like other dogs as much as themselves',
    //   on: 'click'
    // })

    $('#step-3 #table-0')
    .popup({
      position: 'bottom center',
      title: 'square(11)',
    })
    $('#step-3 #table-1')
    .popup({
      position: 'bottom center',
      title: 'add(121, 1)',
    })
    $('#step-3 #table-2')
    .popup({
      position: 'bottom center',
      title: 'add(122, 4)',
    })
    $('#step-3 #table-3')
    .popup({
      position: 'bottom center',
      title: 'add(126, 9)',
    })

    $('#step-3 .button').click(() => {
      $('#table-0').popup('show')
      $('#table-1').popup('show')
      $('#table-2').popup('show')
      $('#table-3').popup('show')
    })

    $('#step-4 #result-0')
    .popup({
      position: 'top center',
      title: 'square(11)',
    })
    $('#step-4 #result-1')
    .popup({
      position: 'top center',
      title: 'add(121, 1)',
    })
    $('#step-4 #result-2')
    .popup({
      position: 'top center',
      title: 'add(122, 4)',
    })
    $('#step-4 #result-3')
    .popup({
      position: 'top center',
      title: 'add(126, 9)',
    })

    $('#step-4 #expected-0')
    .popup({
      position: 'bottom center',
      title: 'square(1)',
    })
    $('#step-4 #expected-1')
    .popup({
      position: 'bottom center',
      title: 'add(1, 1)',
    })
    $('#step-4 #expected-2')
    .popup({
      position: 'bottom center',
      title: 'add(2, 4)',
    })
    $('#step-4 #expected-3')
    .popup({
      position: 'bottom center',
      title: 'add(6, 9)',
    })


    $('#step-4 .button').click(() => {
      $('#result-0').popup('show')
      $('#result-1').popup('show')
      $('#result-2').popup('show')
      $('#result-3').popup('show')
      $('#expected-0').popup('show')
      $('#expected-1').popup('show')
      $('#expected-2').popup('show')
      $('#expected-3').popup('show')
    })

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
          <div id="step-1">
            <h1>Step 1</h1>
            <p>Your <code>accumulate</code> function failed 1 test case</p>
            <Highlight className="python">
              { this.props.log }
            </Highlight>
          </div>

          <div id="step-2">
            <h1>Step 2</h1>
            <p>Let's think with the following example. With your <code>accumulate</code> function,</p>
            <Highlight className="python">
              { `${this.props.test} returns ${this.props.result}` }
            </Highlight>

            <p>
              <button className="ui primary button">Q. Why { this.props.test } returns { this.props.result } ?</button>
            </p>


            <Highlight className="python">
              { translate('previous') }
            </Highlight>

            <Quiz
              description={ `Q. Why previous is initialized with 121?` }
              id={ 'quiz-1' }
              options={ this.props.options }
              line={ this.props.removed[0] }
              code={ this.props.before }
              history={ this.props.beforeHistory }
            />

            <Quiz
              description={ `Q. Why previous is updated to 122?` }
              id={ 'quiz-2' }
              options={ this.props.options }
              line={ 3 }
              code={ this.props.before }
              history={ this.props.beforeHistory }
            />

            <p>However, the behavior of <code>{ 'previous' }</code> should be somethin like this</p>
            <Highlight className="python">
              { translate('previous', true) }
            </Highlight>


          </div>

          <div id="step-3">
            <h1>Step 3</h1>
            <p>Let's think about the behavior of <code>{ 'previous' }</code>.</p>

            <table className="ui celled table">
              <thead>
                <tr>
                <th><code>i</code></th>
                <th>-</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
              </tr></thead>
              <tbody>
                <tr>
                  <td>previous</td>
                  { this.props.beforeHistory['previous'] ? this.props.beforeHistory['previous'].history.map((i, index) => {
                    return <td id={ `table-${index}` }>{ i }</td>
                  }) : '' }
                </tr>
              </tbody>
            </table>

            <p><code>{ 'previous' }</code> updates at line { 3 }</p>

            <p>In a similar way, the behavior of <code>prevous</code> looks like this</p>
            <button className="ui basic button">Next</button>

          </div>

          <div id="step-4">
            <h1>Step 4</h1>
            <p>However, the behavior of <code>{ 'previous' }</code> should be somethin like this</p>
            <button className="ui basic button">Next</button>

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
                  { this.props.beforeHistory['previous'] ? this.props.beforeHistory['previous'].history.map((i, index) => {
                    return <td id={ `result-${index}` }>{ i }</td>
                  }) : '' }
                </tr>
                <tr>
                  <td>Expected</td>
                  { this.props.afterHistory['previous'] ? this.props.afterHistory['previous'].history.map((i, index) => {
                    return <td id={ `expected-${index}` }>{ i }</td>
                  }) : '' }
                </tr>
              </tbody>
            </table>
          </div>

          <div id="step-5">
            <h1>Step 5</h1>
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