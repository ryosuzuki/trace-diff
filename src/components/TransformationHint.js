import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'

class TransformationHint extends Component {
  constructor() {
    super()
    this.state = {
      code: ''
    }
    window.transformationHint = this
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
    let ch = this.state.origin[line].length
    this.cm.replaceRange(' # hoge = 1, n = 0', { line: line, ch: ch }, { line: line, ch: Infinity })
  }

  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true
    }

    return (
      <div id="data-hint">
        <h1>Transformation Hint</h1>
        <p className="ui text">{ description }</p>
        <button className="ui basic button" onClick={ this.showHint.bind(this) }>Show Hint</button>
        <CodeMirror value={ this.state.code }
                    ref="editor"
                    options={ options }
        />
      </div>
    )
  }
}

export default TransformationHint

const description = 'The Transformation hint abstracts the synthesized fix and provides an information about what change the student should do. For example: “you should replace the initialization of the variable total” or “you should add an If statement”. The abstraction level can be configured by the teaching staff. This type of hint is already used by current program synthesis techniques.'