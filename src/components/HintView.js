import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Datastore from 'nedb'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'

import NoneHint from './HintView/NoneHint'
import TransformationHint from './HintView/TransformationHint'
import LocationHint from './HintView/LocationHint'
import DataHint from './HintView/DataHint'
import BehaviorHint from './HintView/BehaviorHint'
import ExampleHint from './HintView/ExampleHint'
import ScaffoldingHint from './HintView/ScaffoldingHint'


class HintView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      type: 'Scaffolding',
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
    const types = ['None', 'Transformation', 'Location', 'Data', 'Behavior', 'Example', 'Scaffolding']
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
    const types = ['None', 'Location', 'Data', 'Behavior', 'Transformation', 'Example', 'Scaffolding']
    return types.map((type) => {
      switch (type) {
        case 'None':
          return (
            <div id="none-hint" style={{ display: type === this.state.type ? 'block' : 'none' }} key={ type }>
              <NoneHint
                options={ this.props.options }
                id={ this.props.id }
                before={ this.props.before }
              />
            </div>
          )
          break
        case 'Transformation':
          return (
            <div id="transformation-hint" style={{ display: type === this.state.type ? 'block' : 'none' }} key={ type }>
              <TransformationHint
                options={ this.props.options }
                id={ this.props.id }
                before={ this.props.before }
                code={ this.props.code }
                removed={ this.props.removed }
                added={ this.props.added }
              />
            </div>
          )
          break
        case 'Location':
          return (
            <div id="location-hint" style={{ display: type === this.state.type ? 'block' : 'none' }} key={ type }>
              <LocationHint
                options={ this.props.options }
                id={ this.props.id }
                before={ this.props.before }
                after={ this.props.after }
                diffs={ this.props.diffs }
                removed={ this.props.removed }
                added={ this.props.added }
              />
            </div>
          )
          break
        case 'Data':
          return (
            <div id="data-hint" style={{ display: type === this.state.type ? 'block' : 'none' }} key={ type }>
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
            </div>
          )
          break
        case 'Behavior':
          return (
            <div id="behavior-hint" style={{ display: type === this.state.type ? 'block' : 'none' }} key={ type }>
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
                removed={ this.props.removed }
                added={ this.props.added }
                beforeHistory={ this.props.beforeHistory}
                afterHistory={ this.props.afterHistory}
                beforeTicks={ this.props.beforeTicks}
                afterTicks={ this.props.afterTicks}
                commonKeys={ this.props.commonKeys}
                focusKeys={ this.props.focusKeys}
              />
            </div>
          )
          break
        case 'Example':
          return (
            <div id="example-hint" style={{ display: type === this.state.type ? 'block' : 'none' }} key={ type }>
              <ExampleHint
                options={ this.props.options }
                id={ this.props.id }
                before={ this.props.before }
                after={ this.props.after }
                diffs={ this.props.diffs }
                removed={ this.props.removed }
                added={ this.props.added }
                log={ this.props.log }
              />
            </div>
          )
          break
        case 'Scaffolding':
          return (
            <div id="location-hint" style={{ display: type === this.state.type ? 'block' : 'none' }} key={ type }>
              <ScaffoldingHint
                options={ this.props.options }
                id={ this.props.id }
                before={ this.props.before }
                after={ this.props.after }
                diffs={ this.props.diffs }
                removed={ this.props.removed }
                added={ this.props.added }
                removedLine={ this.props.removedLine }
                addedLine={ this.props.addedLine }
                log={ this.props.log }
                test={ this.props.test }
                beforeHistory={ this.props.beforeHistory}
                afterHistory={ this.props.afterHistory}
                beforeTicks={ this.props.beforeTicks}
                afterTicks={ this.props.afterTicks}
                commonKeys={ this.props.commonKeys}
                focusKeys={ this.props.focusKeys}
              />
            </div>
          )
          break
        default:
          return false
          break
      }
    })
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
