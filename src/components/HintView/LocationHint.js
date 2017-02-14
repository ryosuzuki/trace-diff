import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'
import _ from 'lodash'
import * as jsdiff from 'diff'


class LocationHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      detail: ''
    }
    window.locationHint = this
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

    let diffs = jsdiff.diffWords(this.props.before, this.props.after)
    let detail = ''
    for (let diff of diffs) {
      if (diff.removed) {
        detail += diff.value
        detail += ' '
      }
    }
    this.setState({ detail: detail })

  }

  render() {
    return (
      <div id={ this.state.id }>
        <div className="ui message markdown">
          <div className="header">
            Location Hint
          </div>
          <p><b>Hint 1:</b> There is an error in <strong>line { this.props.removed.map(i => ++i).join(', ') }</strong></p>
          <p><b>Hint 2:</b> Check <strong>{ this.state.detail }</strong> in <strong>line { this.props.removed.map(i => ++i).join(', ') }</strong></p>
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

export default LocationHint
