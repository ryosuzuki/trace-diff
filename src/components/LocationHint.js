import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'

class LocationHint extends Component {
  constructor() {
    super()
    this.state = {
      code: ''
    }
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

  render() {
    const options = {
      mode: 'python',
      lineNumbers: true
    }
    return (
      <div id="location-hint">
        <h1>Location Hint</h1>
        <CodeMirror value={ this.state.code } options={ options } />
      </div>
    )
  }
}

export default LocationHint