import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'

import ExecutionVisualizer from './PythonTutor/ExecutionVisualizer'

class PythonTutor extends Component {
  constructor(props) {
    super(props)
    window.pythonTutor = this
  }

  componentDidMount() {
  }

  init() {
    console.log('hello world')

    const data = {
      code: this.props.beforeCode,
      trace: this.props.beforeTraces
    }
    const options = {
      embeddedMode: true,
      lang: 'py2',
      startingInstruction: 0,
      editCodeBaseURL: 'visualize.html'
    }
    const demoViz = new ExecutionVisualizer('demoViz', data, options);
  }

  render() {
    return (
      <div>
        PythonTutor
        <div id="demoViz"></div>
      </div>
    )
  }
}

export default PythonTutor
