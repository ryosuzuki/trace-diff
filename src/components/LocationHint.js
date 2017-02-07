import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import {  MarkdownPreview  } from 'react-marked-markdown';
import 'codemirror/mode/python/python'


class LocationHint extends Component {
  constructor(props) {
    super(props)
    const id = `location-hint-${this.props.index}`
    const error = this.props.error
    this.state = {
      code: '',
      error: error,
      id: id
    }
    window.locationHint = this
  }

  componentDidMount() {
    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}data/${this.state.id}.py`,
    })
    .then((res) => {
      this.setState({ code: res })
    })
  }

  showHint() {
    this.cm = this.refs.editor.getCodeMirror()
    this.cm.addLineClass(this.state.error, '', 'highlight')
    $(`#${this.state.id}`).slideToggle()
  }

  render() {
    return (
      <div>
        <button className="ui basic button" onClick={ this.showHint.bind(this) }>Show Hint</button>

        <div id={ this.state.id } className="ui message">
          <div className="header">
            Location Hint
          </div>
          <p>There is an error in line {this.state.error}.</p>
        </div>

        <CodeMirror value={ this.state.code }
                    ref="editor"
                    options={ this.props.options }
        />
      </div>
    )
  }
}

export default LocationHint