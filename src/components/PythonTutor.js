import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'

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

    /*
    code
    traces
      $("#cp-thumbnail").attr('src', require('./images/opt-v3-cs61a-embed-small.png'));


    var demoTrace = {
      "code": "def listSum(numbers):\n  ...\n",
      "trace": [{"ordered_globals": [], "stdout": "", "func_name": "<module>", "stack_to_render": [], "globals": {}, "heap": {}, "line": 1, "event": "ste ... }]
    }

    var demoViz = new ExecutionVisualizer(
                    'demoViz',
                    demoTrace,
                    {
                      embeddedMode: true,
                      lang: 'py2',
                      startingInstruction: 10,
                      editCodeBaseURL: 'visualize.html'
                    }
                  );
    demoViz.redrawConnectors();
    */

  }

  render() {
    return (
      <div>
        PythonTutor
      </div>
    )
  }
}

export default PythonTutor
