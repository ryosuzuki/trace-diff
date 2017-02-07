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
      url: `${window.location.pathname}data/data-hint-1.py`,
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
    this.cm.replaceRange(' # hoge = 1, n = 0', { line: line, ch: ch }, { line: line, ch: Infinity })
    $('#data-hint-1').slideToggle()
  }

  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true
    }

    return (
      <div>
        <button className="ui basic button" onClick={ this.showHint.bind(this) }>Show Hint</button>

        <div id="data-hint-1" className="ui message">
          <div className="header">
            Data Hint
          </div>
          <p>There is an error in line {this.state.error_1}.</p>
        </div>

        <CodeMirror value={ this.state.code }
                    ref="editor"
                    options={ options }
        />
      </div>
    )
  }
}

export default DataHint
