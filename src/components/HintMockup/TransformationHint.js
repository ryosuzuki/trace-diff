import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'

class TransformationHint extends Component {
  constructor(props) {
    super(props)
    const id = `transformation-hint-${this.props.index}`
    const error = this.props.error
    const message = this.props.message
    const word = this.props.word
    this.state = {
      code: '',
      error: error,
      id: id,
      word: word,
      message: message,
    }
    window.transformationHintMockup = this
  }

  componentDidMount() {
    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}example/${this.state.id}.py`,
    })
    .then((res) => {
      this.setState({ code: res })
    })
  }

  showHint() {
    this.cm = this.refs.editor.getCodeMirror()
    if (this.state.word) {
      this.cm.markText(this.state.error.start, this.state.error.end, { className: 'highlight' })
    } else {
      this.cm.addLineClass(this.state.error, '', 'highlight')
    }
    $(`#${this.state.id}`).slideToggle()
  }

  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true
    }

    return (
      <div>
        <button className="ui basic button" onClick={ this.showHint.bind(this) }>Show Hint</button>

        <div id={ this.state.id } className="ui message">
          <div className="header">
            Transformation Hint
          </div>
          <p>{ this.state.message }</p>
        </div>

        <CodeMirror value={ this.state.code }
                    ref="editor"
                    options={ this.props.options }
        />
      </div>
    )
  }
}

export default TransformationHint
