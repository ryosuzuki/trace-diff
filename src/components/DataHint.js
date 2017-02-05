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
      let origin = []
      for (let line of res.split('\n')) {
        origin.push(line)
      }
      this.setState({ code: res, origin: origin })
    })
  }

  showHint() {
    this.cm = this.refs.editor.getCodeMirror()
    let line = 4
    let ch = this.state.origin[line].length + 30
    dataHint.cm.replaceRange(' # hoge = 1, n = 0', { line: line, ch: ch }, { line: line, ch: Infinity })
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