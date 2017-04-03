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
    this.init()
  }

  init() {
    console.log('hello world')

    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}data/sample-pytutor.json`
    })
    .then((data) => {
      console.log(data)
      window.data = data

      const demoTrace = data
      const options = {
        embeddedMode: true,
        lang: 'py2',
        startingInstruction: 10,
        editCodeBaseURL: 'visualize.html'
      }
      const demoViz = new ExecutionVisualizer('demoViz', demoTrace, options);
    })
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
