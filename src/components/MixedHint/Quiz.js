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
      index: 10,
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

      window.tree = tree
      this.setState({
        quizes: tree.quizes,
        updates: tree.updates,
        ast: tree.ast
      })
      if (tree.quizes.length + 1 !== tree.updates.length) {
        // alert(`Error in updates number updates = ${tree.updates.length} quizes = ${tree.quizes.length}`)
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

  renderChildren(key) {
    let item = this.props.history[key]
    if (item.children.length > 0) {
      return (
        item.children.map((childKey) => {
          return (
            <div className="recursive">
              <p><code>{ key }</code> calls <code>{ childKey }</code></p>
              <div style={{ marginLeft: '10px' }}>
              { this.renderChildren(childKey) }
              </div>
              <p><code>{ key }</code> returns <code>{ item.value }</code></p>
            </div>
          )
        })
      )
    } else {
      return (
        <div className="recursive">
          <p><code>{ key }</code> returns <code>{ item.value }</code></p>
        </div>
      )
    }
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
            </p>
            { quiz.children.length > 0 ? this.renderChildren(quiz.key) : '' }
            <p>
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

    $(`#${this.props.id} .CodeMirror`).popup({
      position: 'bottom center',
      inline: true,
      popup : $(`#${this.props.id} .inline-hint`),
      lastResort: 'bottom right',
      on: 'click'
    })

    $(`#${this.props.id} .button`).click(() => {
      $(`#${this.props.id} .CodeMirror`).popup('show')
    })

    return (
      <div id={ this.props.id } className="quiz">
        <p>
          <button className="ui primary button">{ this.props.description }</button>
        </p>

        <p>Look at line { this.props.line }</p>

        <CodeMirror
          value={ this.state.code }
          ref="editor"
          options={ options }
        />

        <div className="ui fluid popup bottom left transition inline-hint">
          <h1><b>{ this.props.description }</b></h1>

          { this.state.quizes.map((quiz, index) => {
            return (
              <div id={ `q-${index}` } key={ index } style={{ display: index > this.state.index ? 'none' : 'block' }}>
                { this.renderQuiz(quiz, index) }
              </div>
            )
          }) }
        </div>


      </div>
    )
  }

}

export default Quiz