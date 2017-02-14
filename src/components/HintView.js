import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Datastore from 'nedb'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'

import NoneHint from './HintView/NoneHint'
import LocationHint from './HintView/LocationHint'
import DataHint from './HintView/DataHint'
import BehaviorHint from './HintView/BehaviorHint'

class HintView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      type: 'Location',
    }
    window.hintView = this
  }

  showHint() {
    $(`#${this.state.id}`).slideToggle()
  }

  onSelect(type) {
    this.setState({ type: type })
  }

  showSelectComponent() {
    const types = ['None', 'Location', 'Data', 'Behavior', 'Transformation']
    return types.map((type) => {
      return (
        <div className="field" key={ type }>
          <div className="ui radio checkbox" key={ type } onClick={ this.onSelect.bind(this, type) }>
            <input type="radio" checked={ type === this.state.type ? true : false } tabIndex="0" onChange={ this.onSelect.bind(this, type) } />
            <label style={{ cursor: 'pointer' }}>{ type }</label>
          </div>
        </div>
      )
    })
  }

  showHintComponent() {
    switch (this.state.type) {
      case 'None':
        return (
          <NoneHint
            options={ this.props.options }
            id={ this.props.id }
            before={ this.props.before }
          />
        )
        break
      case 'Location':
        return (
          <LocationHint
            options={ this.props.options }
            id={ this.props.id }
            before={ this.props.before }
            after={ this.props.after }
            diffs={ this.props.diffs }
            removed={ this.props.removed }
            added={ this.props.added }
          />
        )
        break
      case 'Data':
        return (
          <DataHint
            options={ this.props.options }
            id={ this.props.id }
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
          />
        )
        break
      case 'Behavior':
        return (
          <BehaviorHint
            options={ this.props.options }
            id={ this.props.id }
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
          />        )
        break
      default:
        return (
          <h1>Under Construction</h1>
        )
        break
    }
  }

  render() {
    return (
      <div>
        <div className="ui form">
          <div className="inline fields">
            <label name="hint">Select Hint Types:</label>
            { this.showSelectComponent() }
          </div>
        </div>
        { this.showHintComponent() }
        <br />
        <h2>Failed Test Result</h2>
        <div className="markdown">
          <pre><code>{ this.props.log }</code></pre>
        </div>
      </div>
    )
  }
}

export default HintView
