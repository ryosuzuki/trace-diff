import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import HistoryLog from './HistoryLog'

class Answer extends Component {
  constructor(props) {
    super(props)
    window.answer = this
  }

  componentDidMount() {
    this.init()
  }

  init() {
    setTimeout(() => {
      if (!this.refs.editor) return false
      this.cm = this.refs.editor.getCodeMirror()
      window.before = this.props.before
      window.after = this.props.after
      for (let line of this.props.removed) {
        this.cm.addLineClass(line, '', 'highlight')
      }
      this.generateDiff()
    }, 1500);
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

  render() {
    return (
      <div className="teacher">
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
    )
  }
}

export default Answer
