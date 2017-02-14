import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import { MarkdownPreview } from 'react-marked-markdown';

import LocationHint from './HintMockup/LocationHint'
import DataHint from './HintMockup/DataHint'
import BehaviorHint from './HintMockup/BehaviorHint'
import BehaviorHint2 from './HintMockup/BehaviorHint2'
import TransformationHint from './HintMockup/TransformationHint'
import ExampleHint from './HintMockup/ExampleHint'

class MockupView extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    window.mockupView = this
  }

  componentDidMount() {
    let names = ['location', 'data', 'behavior', 'transformation', 'example']
    for (let name of names) {
      $.ajax({
        method: 'GET',
        url: `${window.location.pathname}example/${name}.md`,
      })
      .then((res) => {
        let hash = {}
        hash[name] = res
        this.setState(hash)
      })
    }
  }


  render() {
    return (
      <div>
        <div id="location-hint" className="nine wide column">
          <h1 className="title">Location Hint</h1>
          <MarkdownPreview
            className="markdown"
            value={ this.state.location }
          />
          <h4 className="ui horizontal divider header">Demo</h4>
          <h1>Location Hint Demo</h1>
          <h2>Example 1</h2>
          <LocationHint
            options={ this.props.options }
            index={ 1 }
            error={ 4 }
            message={ 'There is an error in line 5.' }
          />
          <br />
          <h2>Example 2</h2>
          <LocationHint
            options={ this.props.options }
            index={ 2 }
            error={ 1 }
            message={ 'Insert code after the line 2' }
          />
          <h2>Example 3</h2>
          <LocationHint
            options={ this.props.options }
            index={ 3 }
            error={ { start: { line: 4, ch: 12 } , end: { line: 4, ch: 18 } } }
            word={ true }
            message={ 'Take a look at i in line 5.' }
          />
          <div className="ui divider"></div>
        </div>
        <div id="data-hint" className="nine wide column">
          <h1 className="title">Data Hint</h1>
          <MarkdownPreview
            className="markdown"
            value={ this.state.data }
          />
          <h4 className="ui horizontal divider header">Demo</h4>
          <h1>Data Hint Demo</h1>
          <h2>Example 1</h2>
          <DataHint
            options={ this.props.options }
            index={ 1 }
            message={ 'Failed Test Result: product(5, square): Expected 14400, but got 120' }
          />
          <div className="ui divider"></div>
        </div>
        <div id="behavior-hint" className="nine wide column">
          <h1 className="title">Behavioral Hint</h1>
          <MarkdownPreview
            className="markdown"
            value={ this.state.behavior }
          />
          <h4 className="ui horizontal divider header">Demo</h4>
          <h1>Behavioral Hint Demo</h1>
          <h2>Example 1</h2>
          <BehaviorHint
            options={ this.props.options }
            index={ 1 }
            message={ 'Failed Test Result: accumulate(add, 11, 5, identity): Expected 26, but got 16' }
          />
          <h2>Example 2</h2>
          <BehaviorHint2
            options={ this.props.options }
            index={ 2 }
            message={ 'Possible infinite loop' }
          />
          <div className="ui divider"></div>
        </div>
        <div id="transformation-hint" className="nine wide column">
          <h1 className="title">Transformation Hint</h1>
          <MarkdownPreview
            className="markdown"
            value={ this.state.transformation }
          />
          <h4 className="ui horizontal divider header">Demo</h4>
          <h1>Transformation Hint Demo</h1>
          <h2>Example 1</h2>
          <TransformationHint
            options={ this.props.options }
            index={ 1 }
            error={ { start: { line: 4, ch: 12 } , end: { line: 4, ch: 18 } } }
            word={ true }
            message={ 'Replace i with term(i) in line 5' }
          />
          <div className="ui divider"></div>
        </div>
        <div id="example-hint" className="nine wide column">
          <h1 className="title">Example-based Hint</h1>
          <MarkdownPreview
            className="markdown"
            value={ this.state.example }
          />
          <h4 className="ui horizontal divider header">Demo</h4>
          <h1>Example-based Hint Demo</h1>
          <h2>Example 1</h2>
          <ExampleHint
            options={ this.props.options }
            index={ 1 }
            message={ 'Replace i with term(i) in line 5' }
          />
          <h4 className="ui horizontal divider header">Description</h4>
          <div className="ui divider"></div>
        </div>
      </div>
    )
  }

}

export default MockupView