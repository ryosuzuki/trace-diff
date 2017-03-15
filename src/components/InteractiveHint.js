import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'
import Highlight from 'react-highlight'
import Quiz from './InteractiveHint/Quiz'
import Ladder from './InteractiveHint/Ladder'
import Answer from './InteractiveHint/Answer'

class InteractiveHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 0,
      loops: [],
      text: '',
      events: [],
    }
    window.interactiveHint = this
  }

  init() {

  }

  onClick() {
    this.setState({ step: this.state.step + 1 })
  }

  clickWhy() {
    $('#step-2-1').show()
    $('#button-2-1').removeClass('primary')
  }

  render() {
    return (
      <div>
        <h1>Interactive Hint</h1>

        <div className="ui message hint-message">
          <div className="ui two column grid">
            <div className="eight wide column">
              <h2>Code</h2>
              <CodeMirror
                value={ this.props.before }
                ref="editor2"
                options={ this.props.options }
              />
              <br />
              <h2>Failed Test Result</h2>
              <Highlight className="python">
                { this.props.log }
              </Highlight>
            </div>
            <div className="eight wide column">
              <Ladder
                beforeHistory={ this.props.beforeHistory }
                afterHistory={ this.props.afterHistory }
                beforeEvents={ this.props.beforeEvents }
                afterEvents={ this.props.afterEvents }
                beforeAst={ this.props.beforeAst }
                afterAst={ this.props.afterAst }
                focusKeys={ this.props.focusKeys }
                test={ this.props.test }
                expected={ this.props.expected }
                result={ this.props.result }
                root={ this }
              />
            </div>
          </div>
        </div>
        <Answer
          options={ this.props.options }
          id={ this.props.id }
          code={ this.props.code }
          before={ this.props.before }
          after={ this.props.after }

          added={ this.props.added }
          removed={ this.props.removed }

          beforeHistory={ this.props.beforeHistory }
          afterHistory={ this.props.afterHistory }
        />

      </div>
    )
  }
}

export default InteractiveHint
