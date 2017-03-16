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
      beforeEvents: [],
      afterEvents: [],
      clicked: false,
    }
    window.ladder = this
  }

  componentDidMount() {
    this.init()
  }

  init() {
    setTimeout(() => {
      this.generate('before')
      this.generate('after')
    }, 1500);
  }


  generate(type) {
    let events, asts, key
    if (type === 'before') {
      events = this.props.beforeEvents
      asts = this.props.beforeAst
      key = 'beforeEvents'
    } else {
      events = this.props.afterEvents
      asts = this.props.afterAst
      key = 'afterEvents'
    }

    let filteredEvents = events.filter((event) => {
      if (event.type === 'call') return false
      if (event.builtin) return false
      if (!this.props.focusKeys.includes(event.key)) return false
      return true
    })

    filteredEvents = filteredEvents.map((event) => {
      let trimmedEvents = events.slice(0, event.id)
      let history = {}
      for (let e of trimmedEvents) {
        history[e.key] = e
      }

      let ast = asts[event.line-1]
      let tree = new Tree()
      tree.history = history
      tree.analyze(ast)
      event.updates = tree.updates
      return event
    })

    let state = {}
    state[key] = filteredEvents
    this.setState(state, () => {
      this.translate()
    })
  }

  translate() {
    let text = ''
    let max = 0
    let length = Math.min(this.state.beforeEvents.length, this.state.afterEvents.length)
    for (let i = 0; i < length; i++) {
      let beforeEvent = this.state.beforeEvents[i]
      let afterEvent = this.state.afterEvents[i]
      let beforeUpdates = _.uniq(beforeEvent.updates).reverse()
      let afterUpdates = _.uniq(afterEvent.updates).reverse()
      let result = beforeUpdates[this.state.level]
      let expected = afterUpdates[this.state.level]
      if (!result) result = _.last(beforeUpdates)
      if (!expected) expected = _.last(afterUpdates)

      max = Math.max(max, beforeUpdates.length - 1)
      max = Math.max(max, afterUpdates.length - 1)

      let event = beforeEvent
      switch (event.type) {
        case 'call':
          if (event.children.length === 0) continue
          for (let child of event.children) {
            text += `${event.key} calls ${child}`
          }
          break
        case 'return':
          if (event.builtin) continue
          text += `${ event.key } returns ${ result } should be ${ expected }`
          break
        default:
          if (!this.props.focusKeys.includes(event.key)) continue
          if (event.index === 0) {
            text += `${ event.key } is initialized with ${ result } should be ${ expected }`
          } else {
            text += `${ event.key } is updated to ${ result } should be ${ expected }`
          }
          break
      }
      // text += ` at line ${ event.line }`
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

  onClick() {
    $('#ladder #why-button').removeClass('primary')
    this.setState({ clicked: true })
    this.init()
  }

  render() {
    return (
      <div id='ladder' className="ladder">
        <div className='hint'>
          <Highlight className="python">
            { this.state.text }
          </Highlight>

          <div style={{ width: '10%'}}></div>
          <div style={{ width: '80%'}}>
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
          <div style={{ width: '10%'}}></div>

          <div id="next-1" className="next" style={{ display: this.props.root.state.step <= 3 ? 'block' : 'none', marginTop: '50px' }}>
            <button className="ui primary button" onClick={ this.props.root.onClick.bind(this.props.root) }>Next</button>
          </div>
        </div>


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
      placement="bottom"
      key={index}
    >
      <Handle {...restProps} />
    </Tooltip>
  );
};