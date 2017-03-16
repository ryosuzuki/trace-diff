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
      clicked: false,
    }
    window.quizes.push(this)
  }

  componentDidMount() {
  }

  init() {
    let line = this.props.line
    let code = this.props.before.split('\n')[line-1].trim()
    let ast = this.props.beforeAst[line-1]
    let tree = new Tree()
    tree.history = this.props.history
    tree.analyze(ast)
    this.setState({
      quizes: tree.quizes,
      updates: tree.updates,
      ast: tree.ast
    })
    if (tree.quizes.length + 1 !== tree.updates.length) {
      // alert(`Error in updates number updates = ${tree.updates.length} quizes = ${tree.quizes.length}`)
    }

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
            { quiz.children.length > 0 ?
              <div>
                <p>
                  <b className="question">
                  Q. What is the value of <code>{ quiz.key }</code>?
                  </b>
                </p>
                { this.renderChildren(quiz.key) }
                <p>
                  <code>{ quiz.key }</code> returns
                  <input className={ 'inline-input' } type="text" placeholder={ quiz.value } onChange={ this.onChange.bind(this, quiz, index) } />
                  <i className="inline-message fa fa-check fa-fw" />
                </p>
              </div>
            :
              <div>
                <p>
                  <b className="question">
                  Q. What is the value of <code>{ quiz.key }</code>?
                  </b>
                  <code>{ quiz.key }</code> returns
                  <input className={ 'inline-input' } type="text" placeholder={ quiz.value } onChange={ this.onChange.bind(this, quiz, index) } />
                  <i className="inline-message fa fa-check fa-fw" />
                </p>
              </div>
            }
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

  onClick() {
    $(`#${this.props.id} .button`).removeClass('primary')
    this.setState({ clicked: true }, () => {
      setTimeout(() => {
        let popup = $(`#${this.props.id} .popup`)
        // let target = $(`#hoge .CodeMirror`)
        let target = $($('.CodeMirror-linenumber')[2])

        console.log(popup.hasClass('visible'))
        if (popup.hasClass('visible')) {
          popup.removeClass('visible')
          popup.addClass('hidden')
        } else {
          target.popup('show')
        }
      }, 100)
    })
  }

  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true,
      firstLineNumber: this.state.startLine
    }

    $('.CodeMirror-linenumber').popup({
      position: 'bottom center',
      inline: true,
      popup : $(`#${this.props.id} .inline-hint`),
      lastResort: 'bottom right',
      on: 'click'
    })


    return (
      <div id={ this.props.id } className="quiz">
        <p>
          <button className="ui basic primary button" onClick={ this.onClick.bind(this) }>{ this.props.description }</button>
        </p>
        <div className='hint' style={{ display: this.state.clicked ? 'block' : 'none' }}>
          <p>Look at line { this.props.line }</p>
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

      </div>
    )
  }

}

export default Quiz