import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Datastore from 'nedb'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'

import DataHint from './DataHint'

class HintView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      type: 'Data',
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
      case 'Data':
        return (
          <DataHint
            options={ this.props.options }
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
        )
        break
      case 'Behavior':
        return (
          <h1>Behavior Hint</h1>
        )
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
      </div>
    )
  }
}

export default HintView
