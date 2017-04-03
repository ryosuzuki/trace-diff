import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'

class PythonTutor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 10,
      loops: [],
      text: '',
      events: [],
    }
    window.pythonTutor = this
  }

  componentDidMount() {
    this.init()
  }

  init() {
    console.log('hello world')
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
