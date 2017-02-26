import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../../redux/actions'
import Mousetrap from 'mousetrap'

import ControlPanel from '../ControlPanel'
import MockupView from './Index'

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
