import React, { Component } from 'react'
import LocationHint from './LocationHint'
import DataHint from './DataHint'
import BehaviorHint from './BehaviorHint'
import TransformationHint from './TransformationHint'

class App extends Component {

  componentDidMount() {
    window.app = this
  }

  render() {
    return (
      <div>
        <h1>Hello Worlds</h1>
        <LocationHint />
        <DataHint />
        <BehaviorHint />
        <TransformationHint />
      </div>
    )
  }
}

export default App