import React, { Component } from 'react'
import {  MarkdownPreview  } from 'react-marked-markdown';
import LocationHint from './LocationHint'
import DataHint from './DataHint'
import BehaviorHint from './BehaviorHint'
import TransformationHint from './TransformationHint'
import ExampleHint from './ExampleHint'

class App extends Component {
  constructor(props) {
    super(props)
    window.app = this
    this.state = {}
  }

  componentDidMount() {
    let names = ['location', 'data', 'behavior', 'transformation']
    for (let name of names) {
      $.ajax({
        method: 'GET',
        url: `${window.location.pathname}data/${name}.md`,
      })
      .then((res) => {
        let hash = {}
        hash[name] = res
        this.setState(hash)
      })
    }
  }

  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true
    }

    return (
      <div>
        <div className="ui two column centered grid">
          <div className="nine wide column">
            <h1 id="top" className="ui center aligned huge header">
              Exploring the Design Space of Automated Hints
            </h1>
          </div>
          <div id="location-hint" className="nine wide column">
            <MarkdownPreview
              className="markdown"
              value={ this.state.location }
            />
            <h1>Demo of Location Hint</h1>
            <h2>Example 1</h2>
            <LocationHint
              options={ options }
              index={ 1 }
              error={ 4 }
            />
            <br />
            <h2>Example 2</h2>
            <LocationHint
              options={ options }
              index={ 2 }
              error={ 1 }
            />
            <div className="ui divider"></div>
          </div>
          <div id="data-hint" className="nine wide column">
            <MarkdownPreview
              className="markdown"
              value={ this.state.data }
            />
            <DataHint
              options={ options }
              index={ 1 }
            />
            <div className="ui divider"></div>
          </div>
          <div id="behavior-hint" className="nine wide column">
            <MarkdownPreview
              className="markdown"
              value={ this.state.behavior }
            />
            <BehaviorHint
              options={ options }
              index={ 1 }
            />
            <div className="ui divider"></div>
          </div>
          <div id="transformation-hint" className="nine wide column">
            <MarkdownPreview
              className="markdown"
              value={ this.state.transformation }
            />
            <TransformationHint />
            <div className="ui divider"></div>
          </div>
          <div id="example-hint" className="nine wide column">
            <MarkdownPreview
              className="markdown"
              value={ this.state.example }
            />
            <ExampleHint />
            <div className="ui divider"></div>
          </div>
        </div>
      </div>
    )
  }
}

export default App

