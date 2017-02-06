import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'

class BehaviorHint extends Component {
  constructor() {
    super()
    this.state = {
      code: ''
    }
    window.behaviorHint = this
  }

  componentDidMount() {
    $.ajax({
      method: 'GET',
      url: '/data/behavior-hint-1.py',
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
      <div id="behavior-hint">
        <h1>Behavior Hint</h1>
        <CodeMirror value={ this.state.code }
                    ref="editor"
                    options={ options }
        />

      </div>
    )
  }
}

export default BehaviorHint