import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../redux/actions'
import Mousetrap from 'mousetrap'

import ControlPanel from './ControlPanel'
import DiffView from './HintView/DiffView'
import HintView from './HintView/Index'
import MockupView from './HintMockup/Index'
import MixedHint from './MixedHint'
import InteractiveHint from './InteractiveHint'
import Stream from './Data/Stream'
import Record from './Data/Record'
import Tree from './Data/Tree'

import PythonTutor from './PythonTutor'

import Datastore from 'nedb'
const db = new Datastore()

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    window.app = this
    window.db = db

    window.quizes = []
  }

  componentDidMount() {
    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}data/accumulate.json`
      // url: `${window.location.pathname}data/example.json`
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
    console.log('set current')
    let item = this.props.items[id]

    let stream = new Stream()
    stream.generate(item.beforeTraces, item.beforeCode, 'before')
    stream.generate(item.afterTraces, item.afterCode, 'after')
    stream.check()

    let record = new Record()
    record.generate(stream.beforeTraces, 'before')
    record.generate(stream.afterTraces, 'after')
    record.check()

    let state = Object.assign(item, {
      id: id,
      beforeTraces: stream.beforeTraces,
      afterTraces: stream.afterTraces,
      traces: stream.traces,
      currentCode: item.beforeCode,
      step: 0,
      stop: false,
      beforeHistory: record.beforeHistory,
      afterHistory: record.afterHistory,
      beforeTicks: record.beforeTicks,
      afterTicks: record.afterTicks,
      commonKeys: record.commonKeys,
      focusKeys: record.focusKeys,
      beforeEvents: record.beforeEvents,
      afterEvents: record.afterEvents,
    })
    this.updateState(state)
    window.history.pushState(null, null, `?id=${id}`)
    // window.diffView.generateDiff(id)

    window.pythonTutor.init()

    setTimeout(() => {
      console.log('call init')

      // window.pythonTutor.init()
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
        {/*
        <div className="ui two column centered grid">
          <div className="sixteen wide column">
            <h1 id="top-title" className="ui center aligned huge header">
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
            />
          </div>
        </div>
        */}
        <div className="ui two column centered grid">
          <div id="python-tutor" className="fourteen wide column">
            <h1 className="title">Student</h1>
            <PythonTutor
              options={ options }
              id={ this.props.id }
              code={ this.props.code }
              before={ this.props.before }
              after={ this.props.after }

              test={ this.props.test }
              expected={ this.props.expected }
              result={ this.props.result }
              log={ this.props.log }

              step={ this.props.step }
              stop={ this.props.stop }

              currentCode={ this.props.currentCode }
              beforeCode={ this.props.beforeCode }
              afterCode={ this.props.afterCode }
              added={ this.props.added }
              removed={ this.props.removed }
              addedLine={ this.props.addedLine }
              removedLine={ this.props.removedLine }
              diffs={ this.props.diffs }

              traces={ this.props.traces }
              beforeTraces={ this.props.beforeTraces }
              afterTraces={ this.props.afterTraces }

              beforeHistory={ this.props.beforeHistory}
              afterHistory={ this.props.afterHistory}

              beforeEvents={ this.props.beforeEvents}
              afterEvents={ this.props.afterEvents}

              beforeTicks={ this.props.beforeTicks}
              afterTicks={ this.props.afterTicks}

              beforeAst={ this.props.beforeAst}
              afterAst={ this.props.afterAst}

              commonKeys={ this.props.commonKeys}
              focusKeys={ this.props.focusKeys}
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
