import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../redux/actions'
import Mousetrap from 'mousetrap'

import ControlPanel from './ControlPanel'
import DiffView from './DiffView'
import HintView from './HintView'
import MockupView from './MockupView'
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
    $.ajax({
      method: 'GET',
      // url: `${window.location.pathname}data/accumulate.json`
      url: `${window.location.pathname}data/example.json`
    })
    .then((items) => {
      console.log('start')
      this.updateState({ items: items })
      let id = 0
      if (window.location.search) {
        id = Number(window.location.search.split('=')[1])
      }
      this.setCurrent(id)

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
        let item = items[id]
        db.find({ test: item.test, result: item.result }, function(err, items) {
          this.updateState({ relatedItems: items })
        }.bind(this))

      })
    })

    Mousetrap.bind('left', () => {
      this.setCurrent(this.props.id - 1)
    })
    Mousetrap.bind('right', () => {
      this.setCurrent(this.props.id + 1)
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
      traces: stream.traces,
      currentCode: item.beforeCode,
      step: 0,
      stop: false,
    })
    this.updateState(state)
    window.history.pushState(null, null, `?id=${id}`)
    window.diffView.generateDiff(id)
    setTimeout(() => {
      window.locationHint.init()
      window.transformationHint.init()
      window.behaviorHint.init()
    }, 500)

    db.find({ test: item.test, result: item.result }, function(err, items) {
      this.updateState({ relatedItems: items })
    }.bind(this))


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
              Exploring the Design Space of Automated Hints -
              <a href="https://github.com/ryosuzuki/hint-mockup/" target="blank">
                <i className="fa fa-fw fa-github-alt"></i> GitHub
              </a>
            </h1>
          </div>
          <div id="control-panel" className="eight wide column">
            <ControlPanel
              id={ this.props.id }
              items={ this.props.items }
              test={ this.props.test }
              expected={ this.props.expected }
              result={ this.props.result }
              relatedItems={ this.props.relatedItems }
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
              rule={ this.props.rule }
              relatedItems={ this.props.relatedItems }
            />
          </div>
          <div id="hint-view" className="ten wide column">
            <h1 className="title">Student</h1>
            <HintView
              options={ options }
              id={ this.props.id }
              code={ this.props.code }
              before={ this.props.before }
              after={ this.props.after }
              traces={ this.props.traces }
              currentCode={ this.props.currentCode }
              step={ this.props.step }
              stop={ this.props.stop }
              beforeCode={ this.props.beforeCode }
              afterCode={ this.props.afterCode }
              beforeTraces={ this.props.beforeTraces }
              afterTraces={ this.props.afterTraces }
              added={ this.props.added }
              removed={ this.props.removed }
              diffs={ this.props.diffs }
              log={ this.props.log }
            />
          </div>
        </div>
        <div className="ui two column centered grid">
          <div id="mockup-view" className="nine wide column">
            <MockupView
              options={ options }
            />
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
