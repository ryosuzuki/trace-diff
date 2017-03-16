import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'
import _ from 'lodash'

class Play extends Component {
  constructor(props) {
    super(props)
    window.play = this
  }

  playStep() {
    let interval = 100
    window.app.updateState({ stop: false })
    let timer = setInterval(() => {
      if (this.props.step >= this.props.traces.length || this.props.stop) {
        clearInterval(timer)
        window.app.updateState({ stop: false })
      } else {
        this.updateStep(this.props.step+1)
      }
    }, interval)
  }

  updateStep(value) {
    let step = Math.floor(value)
    let lines = this.props.beforeCode.split('\n')
    let current = this.props.traces[step]

    window.current = current
    for (let line of Object.keys(current.outputs)) {
      let output = current.outputs[line]
      let msg = this.getMessage(output)
      let fixedOutput = current.fixedOutputs ? current.fixedOutputs[line] : null
      if (fixedOutput && !_.isEqual(output, fixedOutput)) {
        msg += ' should be '
        msg += this.getMessage(fixedOutput)
      }
      let content = lines[line-1]
      content += ` # ${msg}`
      lines[line-1] = content
    }
    let currentCode = lines.join('\n')
    window.app.updateState({ step: step, currentCode: currentCode })

    // if (current.error) {
    //   this.cm.addLineClass(current.line-1, '', 'highlight')
    //   window.app.updateState({ stop: true })
    // } else {
    //   this.cm.addLineClass(current.line-1, '', 'current-line')
    // }
  }

  getMessage(output) {
    let msg = ''
    for (let key of Object.keys(output)) {
      if (output[key] instanceof Object) {
        msg += key
        msg += '('
        msg += _.map(output[key]).join(', ')
        msg += ')'
      } else {
        if (key === '__return__') {
          msg += 'return'
        } else {
          msg += key
        }
        msg += ': '
        if (output[key] !== undefined) msg += output[key]
      }
    }
    return msg
  }

  render() {
    return (
      <div className="play-area">
        <button className="ui basic button play-button" onClick={ this.playStep.bind(this) }>
          <i className="fa fa-play fa-fw"></i>
        </button>
        <Slider
          dots
          min={ 0 }
          max={ this.props.traces.length-1 }
          value={ this.props.step }
          onChange={ this.updateStep.bind(this) }
        />
      </div>
    )
  }
}

export default Play