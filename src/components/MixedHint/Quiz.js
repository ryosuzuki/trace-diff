import React, { Component } from 'react'
import Highlight from 'react-highlight'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Tree from '../Data/Tree'

class Quiz extends Component {
  constructor(props) {
    super(props)
    this.state = {
      code: '',
      origin: '',
      startLine: 0,
      quizes: [],
      updates: [],
      ast: {},
      index: 0,
    }
    window.quizes.push(this)
  }

  componentDidMount() {
  }

  init() {
    // let code = 'previous = term(base)'
    let line = this.props.line

    let code = this.props.code.split('\n')[line].trim()
    $.ajax({
      url: 'https://python-ast-explorer.com/api/_parse',
      method: 'POST',
      data: code,
    })
    .then((res) => {
      console.log('get response')
      window.res = res

      let tree = new Tree()
      tree.history = window.app.props.beforeHistory // TODO
      tree.tick = 0
      tree.analyze(res)
      this.setState({
        quizes: tree.quizes,
        updates: tree.updates,
        ast: tree.ast
      })
      if (tree.quizes.length + 1 !== tree.updates.length) {
        alert(`Error in updates number updates = ${tree.updates.length} quizes = ${tree.quizes.length}`)
      }
      // this.createQuiz(tree.quizes)
    })

    this.setState({
      code: code,
      origin: code,
      startLine: line
    })
  }

  onChange(quiz, index, event) {
    let value = event.target.value
    if (value === undefined) return
    if (value == quiz.value) {
      $(`#q-${index} .inline-input`).addClass('correct')
      $(`#q-${index} .inline-message`).addClass('correct')
      this.addValue(quiz)
    } else {
      $(`#q-${index} .inline-input`).removeClass('correct')
      $(`#q-${index} .inline-message`).removeClass('correct')
    }
  }

  addValue(quiz) {
    let index = this.state.index + 1
    if (index >= this.state.updates.length) {
      index = this.state.updates.length - 1
    }
    let update = this.state.updates[index]
    let code = `${this.state.origin}  # ${update}`
    this.setState({ code: code, index: index })
  }

  renderQuiz(quiz, index) {
    switch (quiz.type) {
      case 'call':
        return (
          <div className="mini-quiz">
            <p>
              <b className="question">
              Q. What is the return value of <code>{ quiz.key }</code>?
              </b>
              <code>{ quiz.key }</code> returns
              <input className={ 'inline-input' } type="text" placeholder={ quiz.value } onChange={ this.onChange.bind(this, quiz, index) } />
              <i className="inline-message fa fa-check fa-fw" />
            </p>
          </div>
        )
        break
      case 'assign':
        return (
          <div className="mini-quiz">
            <p><b>Therefore,</b>
              <code>{ quiz.key }</code> =
              <input className={ 'inline-input' } type="text" placeholder={ quiz.value } onChange={ this.onChange.bind(this, quiz, index) } />
              <i className="inline-message fa fa-check fa-fw" />
            </p>
          </div>
        )
        break
      case 'return':
        return (
          <div className="mini-quiz">
            <p><b>Therefore,</b>
            <code>{ quiz.key }</code> returns
              <input className={ 'inline-input' } type="text" placeholder={ quiz.value } onChange={ this.onChange.bind(this, quiz, index) } />
              <i className="inline-message fa fa-check fa-fw" />
              </p>
          </div>
        )
        break
      default:
        return (
          <div className="mini-quiz">
            <p>
            <b className="question">
              Q. What is the value of <code>{ quiz.key }</code>?
            </b>
              <code>{ quiz.key }</code> =
              <input className={ 'inline-input' } type="text" placeholder={ quiz.value } onChange={ this.onChange.bind(this, quiz, index) } />
              <i className="inline-message fa fa-check fa-fw" />
            </p>
          </div>
        )
        break
    }
  }


  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true,
      firstLineNumber: this.state.startLine
    }

    $(`#${this.props.id} .button`)
      .popup({
        position: 'bottom center',
        target: `#${this.props.id} .CodeMirror`,
        lastResort: 'bottom right',
        popup : $(`#${this.props.id} .inline-hint`),
        on: 'click'
      })
    ;

    return (
      <div id={ this.props.id } className="quiz">

        <CodeMirror
          value={ this.state.code }
          ref="editor"
          options={ options }
        />

        <button className="ui basic button">
          Next
        </button>
        <div className="ui fluid popup bottom left transition inline-hint">
          <p><b>{ this.props.description }</b></p>

          { this.state.quizes.map((quiz, index) => {
            return (
              <div id={ `q-${index}` } key={ index } style={{ display: index > this.state.index ? 'none' : 'block' }}>
                { this.renderQuiz(quiz, index) }
                { quiz.calls ? quiz.calls.map((call) => {
                  return (
                    <p>{ call }</p>
                  )
                }) : '' }
              </div>
            )
          }) }
        </div>


      </div>
    )
  }

}

export default Quiz