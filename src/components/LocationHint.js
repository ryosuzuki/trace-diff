import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'

class LocationHint extends Component {
  constructor() {
    super()
    this.state = {
      code: ''
    }
    window.locationHint = this
  }

  componentDidMount() {
    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}data/location-hint-1.py`,
    })
    .then((res) => {
      this.setState({ code: res })
    })
  }

  showHint() {
    this.cm = this.refs.editor.getCodeMirror()
    this.cm.addLineClass(4, '', 'highlight')
  }

  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true
    }
    return (
      <div id="location-hint">
        <h1>Location Hint</h1>
        <p className="ui text">{ description }</p>
        <button className="ui basic button" onClick={ this.showHint.bind(this) }>Show Hint</button>
        <CodeMirror value={ this.state.code }
                    ref="editor"
                    options={ options }
        />
      </div>
    )
  }
}

export default LocationHint

const description = 'The location hint provides information about which part of the student code is incorrect. For instance, a location hint for our running example would be: “There is an error in line 3”. The level of abstraction of a location hint can vary. A more concrete hint would be: “There is an error in the value assigned to the variable total in line 3”. This type of information is easily extracted from a synthesized bug fix.'