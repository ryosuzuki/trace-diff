import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'
import Datastore from 'nedb'


class DiffView extends Component {
  constructor(props) {
    super(props)
    window.diffView = this
  }

  componentDidMount() {
    this.cm = this.refs.editor.getCodeMirror()
  }

  generateDiff(id) {
    setTimeout(() => {
      console.log('update')
      for (let line of this.props.removed) {
        this.cm.addLineClass(line, '', 'removed')
      }
      for (let line of this.props.added) {
        this.cm.addLineClass(line, '', 'added')
      }
    }, 50)
  }


  render() {
    return (
      <div>
        <h2>Code</h2>
        <CodeMirror
          value={ this.props.code }
          ref="editor"
          options={ this.props.options }
        />
        <br />
        <h2>Failed Test Result</h2>
        <div className="markdown">
          <pre><code>{ this.props.log }</code></pre>
        </div>
      </div>
    )
  }
}

export default DiffView

