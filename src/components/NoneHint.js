import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'

class NoneHint extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id={ this.props.id }>
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

export default NoneHint
