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
      message: '',
      detail: ''
    }
    window.locationHint = this
  }

  componentDidMount() {
    this.init()
  }

  init() {
    this.cm = this.refs.editor.getCodeMirror()
    window.jsdiff = jsdiff
    window.before = this.props.before
    window.after = this.props.after

    for (let line of this.props.removed) {
      this.cm.addLineClass(line, '', 'highlight')
    }

    let message = `There is an error in line ${this.props.removed.join(', ')}`
    let detail = `Check `
    let diffs = jsdiff.diffChars(this.props.before, this.props.after)
    for (let diff of diffs) {
      if (!diff.removed) continue
      detail += diff.value
      detail += ' '
    }
    detail += `in line ${this.props.removed.join(', ')}`
    this.setState({ message: message, detail: detail })

  }

  render() {
    return (
      <div id={ this.state.id }>
        <div className="ui message">
          <div className="header">
            Location Hint
          </div>
          <p><b>Hint 1:</b> { this.state.message }</p>
          <p><b>Hint 2:</b> { this.state.detail }</p>
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
