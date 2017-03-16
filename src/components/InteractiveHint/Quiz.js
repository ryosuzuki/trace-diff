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

    let origin = this.props.beforeCode.split('\n')[this.props.line-1]

    let currentCode = this.props.currentCode.split('\n').map((code, index) => {
      if (index === this.props.line-1) {
        return `${origin}  # ${update}`
      } else {
        return code
      }
    }).join('\n')
    // let code = `${this.state.origin}  # ${update}`
    this.setState({ index: index })
    window.app.updateState({ currentCode: currentCode })
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



  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true,
      firstLineNumber: this.state.startLine
    }


    return (
      <div>
        { this.state.quizes.map((quiz, index) => {
          return (
            <div id={ `q-${index}` } key={ index } style={{ display: index > this.state.index ? 'none' : 'block' }}>
              { this.renderQuiz(quiz, index) }
            </div>
          )
        }) }
      </div>
    )
  }

}

export default Quiz