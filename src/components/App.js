import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../redux/actions'
import { MarkdownPreview  } from 'react-marked-markdown';
import LocationHint from './HintMockup/LocationHint'
import DataHint from './HintMockup/DataHint'
import BehaviorHint from './HintMockup/BehaviorHint'
import BehaviorHint2 from './HintMockup/BehaviorHint2'
import TransformationHint from './HintMockup/TransformationHint'
import ExampleHint from './HintMockup/ExampleHint'

import ControlPanel from './ControlPanel'
import DiffView from './DiffView'
import HintView from './HintView'
import Stream from './Stream'

import Datastore from 'nedb'
const db = new Datastore()

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    window.app = this
    window.db = db
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

    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}data/example.json`
    })
    .then((items) => {
      console.log('start')
      this.updateState({ items: items })
      this.setCurrent(0)

      items = items.map((item) => {
        return {
          id: item.id,
          test: item.test,
          expected: item.expected,
          result: item.result
        }
      })
      db.insert(items, (err) => {
        console.log('finish')
      })
    })
  }

  setCurrent(id) {
    let item = this.props.items[id]
    let stream = new Stream()
    stream.generate(item.beforeTraces, item.beforeCode, 'before')
    stream.generate(item.afterTraces, item.afterCode, 'after')
    stream.check()

    let state = Object.assign(item, {
      id: id,
      beforeTraces: stream.beforeTraces,
      afterTraces: stream.afterTraces,
      traces: stream.traces
    })
    this.updateState(state)
    window.diffView.generateDiff(id)
    window.hintView.initHint()

  }

  updateState(state) {
    this.props.store.dispatch(actions.updateState(state))
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
          <div className="sixteen wide column">
            <h1 id="top" className="ui center aligned huge header">
              Exploring the Design Space of Automated Hints
            </h1>
          </div>
          <div id="control-panel" className="eight wide column">
            <ControlPanel
              id={ this.props.id }
              items={ this.props.items }
            />
          </div>
        </div>
        <div className="ui two column centered grid">
          <div id="diff-view" className="six wide column">
            <h1 className="title">Teacher</h1>
            <DiffView
              options={ options }
              id={ this.props.id }
              code={ this.props.code }
              added={ this.props.added }
              removed={ this.props.removed }
              log={ this.props.log }
            />
          </div>
          <div id="hint-view" className="ten wide column">
            <h1 className="title">Student</h1>
            <HintView
              options={ options }
              id={ this.props.id }
              before={ this.props.before }
              after={ this.props.after }
              traces={ this.props.traces }
              beforeCode={ this.props.beforeCode }
              afterCode={ this.props.afterCode }
              beforeTraces={ this.props.beforeTraces }
              afterTraces={ this.props.afterTraces }
              log={ this.props.log }
            />
          </div>

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
              options={ options }
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
              options={ options }
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
              options={ options }
              index={ 1 }
              message={ 'Replace i with term(i) in line 5' }
            />
            <h4 className="ui horizontal divider header">Description</h4>
            <div className="ui divider"></div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return state
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
