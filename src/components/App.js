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
            <h1>Location Hint Demo</h1>
            <h2>Example 1</h2>
            <LocationHint
              options={ options }
              index={ 1 }
              error={ 4 }
              message={ 'There is an error in line 5.' }
            />
            <br />
            <h2>Example 2</h2>
            <LocationHint
              options={ options }
              index={ 2 }
              error={ 1 }
              message={ 'Insert code after the line 2' }
            />
            <h2>Example 3</h2>
            <LocationHint
              options={ options }
              index={ 3 }
              error={ { start: { line: 4, ch: 12 } , end: { line: 4, ch: 18 } } }
              word={ true }
              message={ 'Take a look at i in line 5.' }
            />
            <h4 className="ui horizontal divider header">
              Description
            </h4>
            <MarkdownPreview
              className="markdown"
              value={ this.state.location }
            />
            <div className="ui divider"></div>
          </div>
          <div id="data-hint" className="nine wide column">
            <h1>Data Hint Demo</h1>
            <h2>Example 1</h2>
            <DataHint
              options={ options }
              index={ 1 }
              message={ 'Failed Test Result: product(5, square): Expected 14400, but got 120' }
            />
            <h4 className="ui horizontal divider header">
              Description
            </h4>
            <MarkdownPreview
              className="markdown"
              value={ this.state.data }
            />
            <div className="ui divider"></div>
          </div>
          <div id="behavior-hint" className="nine wide column">
            <BehaviorHint
              options={ options }
              index={ 1 }
            />
            <h4 className="ui horizontal divider header">
              Description
            </h4>
            <MarkdownPreview
              className="markdown"
              value={ this.state.behavior }
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

