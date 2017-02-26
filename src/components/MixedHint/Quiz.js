import React, { Component } from 'react'
import Highlight from 'react-highlight'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Tree from '../Data/Tree'

class Quiz extends Component {
  constructor(props) {
    super(props)
    this.state = {
      quizes: []
    }
  }

  componentDidMount() {
    let code = 'previous = term(base)' // this.props.before.split('\n')[this.props.line-1].trim()
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
      this.setState({ quizes: tree.quizes })
    })
  }

  onChange(quiz, index, event) {
    let value = event.target.value
    if (value === undefined) return
    if (value == quiz.value) {
      $(`#q-${index} .inline-input`).addClass('correct')
      $(`#q-${index} .inline-message`).addClass('correct')
    } else {
      $(`#q-${index} .inline-input`).removeClass('correct')
      $(`#q-${index} .inline-message`).removeClass('correct')
    }
  }

  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true
    }

    return (
      <div className="quiz">

        <CodeMirror
          value={ this.props.before }
          ref="editor"
          options={ options }
        />

        { this.state.quizes.map((quiz, index) => {
          return (
            <div id={ `q-${index}` } key={ index }>
              <p>Q. What is the value of <code>{ quiz.key }</code>?</p>
              <p>
                <code>{ quiz.key }</code> =
                <input className={ 'inline-input'  } type="text" placeholder={ quiz.value } onChange={ this.onChange.bind(this, quiz, index) } />
                <span className="inline-message">Correct!</span>
              </p>
              { quiz.calls ? quiz.calls.map((call) => {
                return (
                  <p>{ call }</p>
                )
              }) : '' }
            </div>
          )
        }) }
      </div>
    )
  }

}

export default Quiz