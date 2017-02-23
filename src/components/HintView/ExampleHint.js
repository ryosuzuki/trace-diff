import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'

class ExampleHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      result: '',
      example: ''
    }
    window.exampleHint = this
  }

  componentDidMount() {
    this.init()
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

    let error = _.last(this.props.log.split('\n')).substr(6)
    if (isNaN(error)) {
      let result
      for (let line of this.props.log.split('\n')) {
        if (line.includes(error)) {
          result = line
          break
        }
      }

      let keyword = result.split('\'')[1]
      let bad = ''
      bad += 'x Bad\n'
      bad += 'def foo():\n'
      bad += `  return ${keyword}\n`
      bad += 'foo()\n'
      bad += `# => ${result}\n`

      let good = ''
      good += 'o Good\n'
      good += `def foo(${keyword}):\n`
      good += `  return ${keyword}\n`
      good += 'foo(1)\n'
      good += `# => 1\n`

      this.setState({ result: result, bad: bad, good: good })
    }


  }

  render() {
    return (
      <div>
        <h1>Example Hint</h1>
        <div className="ui message markdown">
          <div className="header">
            Example Hint
          </div>
          <p>{ this.state.result }</p>
          <pre><code>{ this.state.bad }</code></pre>
          <pre><code>{ this.state.good }</code></pre>
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

export default ExampleHint
