import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'
import Tree from './Data/Tree'

import FirstStep from './MixedHint/FirstStep'
import SecondStep from './MixedHint/SecondStep'

class MixedHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      detail: '',
      step: 4,
      quizes: [],
      loops: [],
    }
    window.mixedHint = this
  }

  componentDidMount() {
    this.init()
  }

  getAST(code, type) {
    if (!code) return false
    code = code.trim()
    $.ajax({
      url: 'https://python-ast-explorer.com/api/_parse',
      method: 'POST',
      data: code,
    })
    .then((res) => {
      console.log('get response')
      window.res = res

      if (type === 'init') {
        let tree = new Tree()
        tree.history = this.props.beforeHistory
        tree.tick = 0
        tree.analyze(res)
        this.setState({ quizes: tree.quizes })
        window.tree = tree
      } else if (type === 'loop') {
        let loops = []
        for (let i = 0; i < 3; i++) {
          let tree = new Tree()
          tree.history = this.props.beforeHistory
          tree.tick = i
          tree.analyze(res)
          loops.push(tree.ast)
        }
        this.setState({ loops: loops })
      }
    })

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
    if (this.props.removedLine[0]) {
      let i = this.props.removedLine.length
      let code = this.props.removedLine[i-1].code
      this.getAST(code, 'init')
    }

    // let code2 = this.props.before.split('\n')[3]
    // this.getAST(code2, 'loop')
  }

  onClick() {
    this.setState({ step: this.state.step + 1 })
  }

  onChange(quiz, index, event) {
    let value = event.target.value
    if (value === undefined) return
    if (value == quiz.value) {
      $(`#q-${index} .inline-input`).addClass('correct')
      $(`#q-${index} .inline-message`).addClass('correct')
    } else {
      $(`#q-${index} .inline-input`).removeClass('correct')
      $(`#q-${index} .inline-message`).removeClass('correct')
    }
  }

  render() {
    return (
      <div>
        <h1>Mixed Hint</h1>

        <div className="ui message markdown">
          <FirstStep
            test={ this.props.test }
            expected={ this.props.expected }
            result={ this.props.result }
            log={ this.props.log }
          />

          <SecondStep
            test={ this.props.test }
            expected={ this.props.expected }
            result={ this.props.result }
            log={ this.props.log }
          />


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

        </div>
        <h2>Code</h2>
        <CodeMirror
          value={ this.props.before }
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
