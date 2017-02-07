import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'

class ExampleHint extends Component {
  constructor() {
    super()
    this.state = {
      code: ''
    }
    window.exampleHint = this
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
        <h1>Example Hint</h1>
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

export default ExampleHint

const description = 'Another way of showing how to fix the code is using a similar example. In our study, we found that the teaching assistants often used this type of hint. For instance, in one scenario, the student did not know how to use the combine function. The TA explained to him: “ accumulate(add, 0, 5, identity) should return 0 + 1 + 2 + 3 + 4 + 5. In this case combiner is the two-argument add function,whichweuselikethis: 0 + 1 + 2 + 3 + 4 + 5 = ((((0 + 1) + 2) + 3) + 4) + 5 = add(add(add(add(add(0, 1), 2),3), 4), 5).”. In another scenario, the TA gave an example of proper way of using lambda functions.'