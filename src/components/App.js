import React, { Component } from 'react'
import LocationHint from './LocationHint'
import DataHint from './DataHint'
import BehaviorHint from './BehaviorHint'
import TransformationHint from './TransformationHint'
import ExampleHint from './ExampleHint'

class App extends Component {

  componentDidMount() {
    window.app = this



  }

  render() {
    return (
      <div>
        <div className="ui two column centered grid">
          <div className="nine wide column">
            <h1 id="top" className="ui center aligned huge header">
              Exploring the Design Space of Automated Hints
            </h1>
          </div>
          <div className="nine wide column">
            <LocationHint />
            <div className="ui divider"></div>
          </div>
          <div className="nine wide column">
            <DataHint />
            <div className="ui divider"></div>
          </div>
          <div className="nine wide column">
            <BehaviorHint />
            <div className="ui divider"></div>
          </div>
          <div className="nine wide column">
            <TransformationHint />
            <div className="ui divider"></div>
          </div>
          <div className="nine wide column">
            <ExampleHint />
            <div className="ui divider"></div>
          </div>
        </div>
      </div>
    )
  }
}

export default App