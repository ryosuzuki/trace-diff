import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'
import _ from 'lodash'
import * as jsdiff from 'diff'
import Tree from './Tree'

class ScaffoldingHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      detail: '',
      step: 4,
      quizes: [],
      loops: [],
    }
    window.scaffoldingHint = this
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
    window.jsdiff = jsdiff
    window.before = this.props.before
    window.after = this.props.after

    for (let line of this.props.removed) {
      this.cm.addLineClass(line, '', 'highlight')
    }

    // let code1 = this.props.before.split('\n')[4]
    if (this.props.removedLine[0]) {
      let code = this.props.removedLine[0].code
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
    if (value == quiz.answer) {
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
        <h1>Scaffolding Hint</h1>


        <div className="markdown">
          <pre>
            { _.intersection(Object.keys(this.props.beforeHistory), Object.keys(this.props.afterHistory)).map((key) => {
              return (
                <div key={ key }>
                  <code>
                    { key }
                  </code>
                  <br />
                  <code>
                    - Expected: { this.props.beforeHistory[key].join(' | ') }
                  </code>
                  <br />
                  <code>
                    - Result:   { this.props.afterHistory[key].join(' | ') }
                  </code>
                  <br />
                  <br />
                </div>
              )
            }) }
          </pre>
        </div>


        <div className="ui message markdown">
          <div className="header">
            Scaffolding Hint
          </div>
          <div id="step-1" style={{ display: this.state.step >= 1 ? 'block' : 'none' }}>
            <h1>Step 1</h1>
            <p>Your accumulate function has an 1 mistake</p>
            <p>Let's think with this example:</p>
            <pre><code>{ this.props.test }</code></pre>
          </div>
          <div id="step-2" style={{ display: this.state.step >= 2 ? 'block' : 'none' }}>
            <h1>Step 2</h1>
            <p>Let's look at line { this.props.removed[0] + 1 }</p>
            <pre><code>{ this.props.removedLine[0] ? this.props.removedLine[0].code.trim() : '' }</code></pre>
            { this.state.quizes.map((quiz, index) => {
              return (
                <div id={ `q-${index}` } key={ index }>
                  <p>Q. What is the value of <code>{ quiz.key }</code>?</p>
                  <p>
                    <code>{ quiz.key }</code> =
                    <input className={ 'inline-input'  } type="text" placeholder="" onChange={ this.onChange.bind(this, quiz, index) } />
                    <span className="inline-message">Correct!</span>
                  </p>
                </div>
              )
            }) }
          </div>
          <div id="step-3" style={{ display: this.state.step >= 3 ? 'block' : 'none' }}>
            <h1>Step 3</h1>
            <p>Great, then let's think about the behavior of <code>{ this.props.focusKeys[0] }</code></p>
            <pre><code>o previous: 11 | 12 | 16 | 25<br/>x previous: 121 | 122 | 126 | 135</code></pre>
            <p>{ this.props.focusKeys[0] } starts at <strong>{ 121 }</strong></p>
            { this.state.loops.map((loop) => {
              return (
                <p>{ loop.type } <code>{ loop.value }</code> and update <strong>{ loop.assign }</strong></p>
              )
            }) }
          </div>
          <div id="step-4" style={{ display: this.state.step >= 4 ? 'block' : 'none' }}>
            <h1>Step 4</h1>
          </div>
          <button className="ui basic button" onClick={ this.onClick.bind(this) }>Next</button>

        </div>
        <h2>Code</h2>
        <CodeMirror
          value={ this.props.before }
          ref="editor"
          options={ this.props.options }
        />
      </div>
    )
  }
}

export default ScaffoldingHint
