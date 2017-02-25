import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'
import _ from 'lodash'
import * as jsdiff from 'diff'


class ScaffoldingHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      detail: '',
      step: 4,
      nodes: [],

    }
    window.scaffoldingHint = this
  }

  componentDidMount() {
    this.init()
  }

  getAST() {
    if (!this.props.removedLine.length) return false
    let code = this.props.removedLine[0].code
    code = code.trim()

    $.ajax({
      url: 'https://python-ast-explorer.com/api/_parse',
      method: 'POST',
      data: code,
    })
    .then((res) => {
      console.log('get response')
      window.res = res
      this.analyze(res)
    })
  }

  analyze(res) {
    let body = res.ast.Module.body[0]
    let key = Object.keys(body)[0]

    window.body = body
    let nodes = []
    let hash = {}
    let id = 0

    const getValue = (name) => {
      let value
      if (!Object.keys(this.props.beforeHistory).includes(name)) {
        return name
      }
      if (this.props.beforeHistory[name].length > 1) {
        let step = 9
        let tick = this.props.beforeTicks[name][step]
        value = this.props.beforeHistory[name][tick-1]
      } else {
        value = this.props.beforeHistory[name][0]
      }
      return value
    }

    const addName = (el) => {
      let key = el.Name.id
      let value = getValue(key)
      let node = { key: key, value: value }
      nodes.push(node)
      return node
    }

    const addCall = (el) => {
      let args = []
      let argVals = []
      for (let arg of el.args) {
        if (arg.Name) {
          arg = addName(arg)
          args.push(arg)
        }
        if (arg.Call) {
          // let children = addCall(arg.Call)
          // nodes.push(children)
        }
      }
      let func = addName(el.func)
      let key = `${func.value}(${args.map(arg => arg.value).join(', ')})`
      let value = getValue(key)
      let node = { key: key, value: value}
      nodes.push(node)
      return node
    }

    for (let key of Object.keys(body)) {
      let line = body[key]
      if (key === 'Assign') {
        let targets = line.targets
        let value = line.value

        if (value.Call) {
          addCall(value.Call)
        }

        for (let target of targets) {
          addName(target)
        }
      }
    }
    nodes = _.flatten(nodes)

    this.setState({ nodes: nodes })
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

    this.getAST()
  }

  onClick() {
    this.setState({ step: this.state.step + 1 })
  }

  onChange(node, index, event) {
    let value = event.target.value
    if (value == node.value) {
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
            { this.state.nodes.map((node, index) => {
              return (
                <div id={ `q-${index}` } key={ index }>
                  <p>Q. What is the value of <code>{ node.key }</code>?</p>
                  <p>
                    <code>{ node.key }</code> =
                    <input className={ 'inline-input'  } type="text" placeholder="" onChange={ this.onChange.bind(this, node, index) } />
                    <span className="inline-message">Correct!</span>
                  </p>
                </div>
              )
            }) }
          </div>
          <div id="step-3" style={{ display: this.state.step >= 3 ? 'block' : 'none' }}>
            <h1>Step 3</h1>
            <p>Great, then let's think about the behavior of <code>previous</code></p>
            <pre><code>o previous: 11 | 12 | 16 | 25<br/>x previous: 121 | 122 | 126 | 135</code></pre>
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
