import React, { Component } from 'react'
import Highlight from 'react-highlight'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Tree from '../Data/Tree'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'

class Ladder extends Component {
  constructor(props) {
    super(props)
    this.state = {
      text: '',
      level: 0,
      max: 0,
      marks: {},
      events: []
    }
    window.ladder = this
  }

  init() {
    this.translate()
  }

  hoge() {
    let events = this.props.beforeEvents
    let code = this.props.before

    let filteredEvents = events.filter((event) => {
      // if (event.type === 'call') return false
      if (event.builtin) return false
      if (!this.props.focusKeys.includes(event.key)) return false
      return true
    })

    for (let event of filteredEvents) {
      if (event.type === 'call') continue
      let trimedEvents = events.slice(0, event.id)
      let history = {}
      for (let e of trimmedEvents) {
        history[e.key] = e
      }

      let line = event.line
      let snippet = code.split('\n')[line-1].trim()

      $.ajax({
        url: 'https://python-ast-explorer.com/api/_parse',
        method: 'POST',
        data: snippet,
      })
      .then((res) => {
        let tree = new Tree()
        tree.history = history
        tree.analyze(res)
        event.updates = tree.updates
      })
    }
    this.setState({ events: filteredEvents })
  }


  translate() {
    let text = ''
    let max = 0
    let events = this.props.beforeEvents
    for (let event of events) {
      let updates = _.uniq(event.updates).reverse()
      let update = updates[this.state.level]
      max = Math.max(max, updates.length - 1)
      if (!update) update = _.last(updates)

      switch (event.type) {
        case 'call':
          if (event.children.length === 0) continue
          for (let child of event.children) {
            text += `${event.key} calls ${child}`
          }
          break
        case 'return':
          if (event.builtin) continue
          text += `${event.key} returns ${update}`
          break
        default:
          if (!this.props.focusKeys.includes(event.key)) continue
          if (event.index === 0) {
            text += `${event.key} is initialized with ${update}`
          } else {
            text += `${event.key} is updated to ${update}`
          }
          break
      }
      text += ` at line ${ event.line }`
      text += '\n'
    }
    let marks = {}
    marks[0] = 'concrete'
    marks[max] = 'abstract'
    this.setState({ text: text, max: max, marks: marks })
  }


  onChange(value) {
    this.setState({ level: value }, () => {
      this.init()
    })
  }


  render() {
    return (
      <div id={ this.props.id } className="ladder">
        <p>However, the behavior of <code>{ this.props.name }</code> should be somethin like this</p>
        <p>Q. Why the behavior of previous is different ?</p>
        <p>
          <button className="ui primary button" onClick={ this.init.bind(this) }>Why ?</button>
        </p>

        <Highlight className="python">
          { this.state.text }
        </Highlight>

        <Slider
          dots
          min={ 0 }
          max={ this.state.max }
          marks={ this.state.marks }
          value={ this.state.level }
          handle={ handle }
          onChange={ this.onChange.bind(this) }
        />



      </div>
    )
  }
}

export default Ladder


const Handle = Slider.Handle;
const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      overlay={ value === 0 ? 'concrete value' : `${value}-step abstract` }
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle {...restProps} />
    </Tooltip>
  );
};