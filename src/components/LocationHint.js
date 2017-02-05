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
      url: '/data/location-hint-1.py',
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
      lineNumbers: true
    }
    return (
      <div id="location-hint">
        <h1>Location Hint</h1>
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