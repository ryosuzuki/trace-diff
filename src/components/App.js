import React, { Component } from 'react'
import {  MarkdownPreview  } from 'react-marked-markdown';
import LocationHint from './LocationHint'
import DataHint from './DataHint'
import BehaviorHint from './BehaviorHint'
import BehaviorHint2 from './BehaviorHint2'
import TransformationHint from './TransformationHint'
import ExampleHint from './ExampleHint'

class App extends Component {
  constructor(props) {
    super(props)
    window.app = this
    this.state = {}
  }

  componentDidMount() {
    let names = ['location', 'data', 'behavior', 'transformation', 'example']
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
            <h1 className="title">Location Hint Demo</h1>
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
            <h1 className="title">Data Hint Demo</h1>
            <h2>Example 1</h2>
            <DataHint
              options={ options }
              index={ 1 }
              message={ 'Failed Test Result: product(5, square): Expected 14400, but got 120' }
            />
            <h4 className="ui horizontal divider header">Description</h4>
            <MarkdownPreview
              className="markdown"
              value={ this.state.data }
            />
            <div className="ui divider"></div>
          </div>
          <div id="behavior-hint" className="nine wide column">
            <h1 className="title">Behavioral Hint Demo</h1>
            <h2>Example 1</h2>
            <BehaviorHint
              options={ options }
              index={ 1 }
              message={ 'Failed Test Result: accumulate(add, 11, 5, identity): Expected 26, but got 16' }
            />
            <h2>Example 2</h2>
            <BehaviorHint2
              options={ options }
              index={ 2 }
              message={ 'Possible infinite loop' }
            />
            <h4 className="ui horizontal divider header">Description</h4>
            <MarkdownPreview
              className="markdown"
              value={ this.state.behavior }
            />
            <div className="ui divider"></div>
          </div>
          <div id="transformation-hint" className="nine wide column">
            <h1 className="title">Transformation Hint Demo</h1>
            <h2>Example 1</h2>
            <TransformationHint
              options={ options }
              index={ 1 }
              error={ { start: { line: 4, ch: 12 } , end: { line: 4, ch: 18 } } }
              word={ true }
              message={ 'Replace i with term(i) in line 5' }
            />
            <h4 className="ui horizontal divider header">Description</h4>
            <MarkdownPreview
              className="markdown"
              value={ this.state.transformation }
            />
            <div className="ui divider"></div>
          </div>
          <div id="example-hint" className="nine wide column">
            <h1 className="title">Example-based Hint Demo</h1>
            <h2>Example 1</h2>
            <ExampleHint
              options={ options }
              index={ 1 }
              message={ 'Replace i with term(i) in line 5' }
            />
            <h4 className="ui horizontal divider header">Description</h4>
            <MarkdownPreview
              className="markdown"
              value={ this.state.example }
            />
            <div className="ui divider"></div>
          </div>
        </div>
      </div>
    )
  }
}

export default App

