import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'
import Highlight from 'react-highlight'
import Quiz from './InteractiveHint/Quiz'
import Ladder from './InteractiveHint/Ladder'
import Answer from './InteractiveHint/Answer'
import Play from './InteractiveHint/Play'

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

  componentDidMount() {
    this.init()
  }

  init() {
    if (!this.refs.editor) return false
    this.cm = this.refs.editor.getCodeMirror()
    window.cm = this.cm
    // let msg = document.createElement('div')
    // this.cm.addLineWidget(3, msg, { coverGutter: true })
  }

  showCondition(id) {
    switch (id) {
      case 1:
        $('.ladder').hide()
        break
      case 2:
        $('.ladder').hide()
        $('#result-ladder').show()
        $('#control-ladder').show()
        break
      case 3:
        $('.ladder').show()
        break
    }
    window.ladder.initVisualization(id)
  }

  render() {
    return (
      <div>
        <div className="ui message hint-message">

          <div className="ui fourteen column grid">
            <button className="ui basic button" onClick={ this.showCondition.bind(this, 1) }>Condition 1</button>
            <button className="ui basic button" onClick={ this.showCondition.bind(this, 2) }>Condition 2</button>
            <button className="ui basic button" onClick={ this.showCondition.bind(this, 3) }>Condition 3</button>
          </div>

          <div className="ui three column grid">
            <div className="five wide column">
              <h2>Code</h2>
              <div id="hoge">
              <CodeMirror
                value={ this.props.currentCode }
                ref="editor"
                options={ this.props.options }
              />
              </div>
            </div>
            <div className="eleven wide column">
              <Ladder
                beforeHistory={ this.props.beforeHistory }
                afterHistory={ this.props.afterHistory }

                beforeEvents={ this.props.beforeEvents }
                afterEvents={ this.props.afterEvents }

                beforeTraces={ this.props.beforeTraces }
                afterTraces={ this.props.afterTraces }

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
              <div id="viz" style={{ marginTop: '50px' }}></div>

              {/*
              <Play
                traces={ this.props.traces }
                step={ this.props.step }
                beforeCode={ this.props.beforeCode }
                currentCode={ this.props.currentCode }
              />
              */}

            </div>
          </div>
        </div>
        <button className="ui basic button" onClick={ () => { $('#answer').toggle(); window.answer.init() } }>Show Answer</button>
        <br/>

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

          <div className="arrow-up"></div>
          <div className="arrow-border"></div>
          <pre className="dynamic-hint"></pre>

      </div>
    )
  }
}

export default InteractiveHint