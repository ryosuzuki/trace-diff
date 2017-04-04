import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'

import ExecutionVisualizer from './PythonTutor/ExecutionVisualizer'
import Ladder from './PythonTutor/Ladder'

class PythonTutor extends Component {
  constructor(props) {
    super(props)
    window.pythonTutor = this
  }

  componentDidMount() {
  }

  init() {
    console.log('hello world')

    let options = {
      embeddedMode: true,
      lang: 'py2',
      startingInstruction: 10,
      editCodeBaseURL: 'visualize.html'
    }

    let beforeData = {
      code: this.props.beforeCode,
      trace: this.props.beforeTraces,
      vizId: 'before',
    }
    let beforeViz = new ExecutionVisualizer('beforeViz', beforeData, options);
    window.beforeViz = beforeViz

    let afterData = {
      code: this.props.afterCode,
      trace: this.props.afterTraces,
      vizId: 'after'
    }
    options.hideCode = true
    let afterViz = new ExecutionVisualizer('afterViz', afterData, options);
    window.afterViz = afterViz



    $('.variableTr[data-name="previous"]').addClass('highlight-var-name')
    window.ladder.init()

  }

  render() {
    return (
      <div className="ui two column centered grid">
        PythonTutor
        <div id="beforeViz" className="ten wide column"></div>
        <div id="afterViz" className="five wide column"></div>
        <div className="five wide column">
          <Ladder
            beforeHistory={ this.props.beforeHistory }
            afterHistory={ this.props.afterHistory }

            beforeEvents={ this.props.beforeEvents }
            afterEvents={ this.props.afterEvents }

            beforeAst={ this.props.beforeAst }
            afterAst={ this.props.afterAst }

            currentCode={ this.props.currentCode }
            beforeCode={ this.props.beforeCode }

            before={ this.props.before }

            focusKeys={ this.props.focusKeys }
            test={ this.props.test }
            expected={ this.props.expected }
            result={ this.props.result }
            root={ this }
          />
        </div>
      </div>
    )
  }
}

export default PythonTutor
