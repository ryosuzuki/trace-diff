import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'

class DataHint extends Component {
  constructor() {
    super()
    this.state = {
      code: ''
    }
    window.dataHint = this
  }

  componentDidMount() {
    $.ajax({
      method: 'GET',
      url: '/data/data-hint-1.py',
    })
    .then((res) => {
      this.setState({ code: res })
    })
  }

  showHint() {
    this.cm = this.refs.editor.getCodeMirror()
    this.cm.addLineClass(4, '', 'highlight')
  }

  render() {
    const options = {
      mode: 'python',
      lineNumbers: true
    }

    return (
      <div id="data-hint">
        <h1>Data Hint</h1>
        <button className="ui basic button" onClick={ this.showHint.bind(this) }>Show Hint</button>
        <CodeMirror value={ this.state.code }
                    ref="editor"
                    options={ options }
        />
      </div>
    )
  }
}

export default DataHint