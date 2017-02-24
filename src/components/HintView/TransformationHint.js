import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'
import * as jsdiff from 'diff'

class TransformationHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      remove: '',
      add: ''
    }
    window.transformationHint = this
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

    if (!this.props.code) return false
    let before
    let after
    if (this.props.removed[0]) {
      before = this.props.code.split('\n')[this.props.removed[0]]
    }
    if (this.props.added[0]) {
      after = this.props.code.split('\n')[this.props.added[0]]
    }

    let diffs = jsdiff.diffWords(before, after)
    let common = diffs[0].value

    let remove = before.replace(common, '')
    let add = after.replace(common, '')

    this.setState({ remove: remove, add: add })

  }

  render() {
    return (
      <div>
        <h1>Transformation Hint</h1>
        <div className="ui message markdown">
          <div className="header">
            Transformation Hint
          </div>
          <p>Replace <strong>{ this.state.remove }</strong> with <strong>{ this.state.add }</strong> in <strong>line { this.props.removed[0]+1 }</strong></p>
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

export default TransformationHint
