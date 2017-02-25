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
      nodes: []
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

    const addCall = (node) => {
      let nodes = []
      let args = []
      for (let arg of node.args) {
        if (arg.Name) {
          arg = arg.Name.id
          args.push(arg)
          console.log(`1: arg ${arg}`)
          nodes.push(arg)
        }
        if (arg.Call) {
          let children = addCall(arg.Call)
          nodes.push(children)
        }
      }
      let func = node.func.Name.id
      let value = `${func}(${args.join(', ')})`

      nodes.push(func)
      nodes.push(value)
      return nodes
    }

    for (let key of Object.keys(body)) {
      let line = body[key]
      if (key === 'Assign') {
        let targets = line.targets
        let value = line.value

        if (value.Call) {
          nodes = addCall(value.Call)
        }

        for (let target of targets) {
          target = target.Name.id
          nodes.push(target)
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
                <p key={ index }>Q. What is the value of <code>{ node }</code>?</p>
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
