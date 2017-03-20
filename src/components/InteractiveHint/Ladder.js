import React, { Component } from 'react'
import Highlight from 'react-highlight'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Tree from '../Data/Tree'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'

import Quiz from './Quiz'


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
      events: [],
      quizIndex: null,
      currentLine: null,
    }
    window.ladder = this
  }

  componentDidMount() {
    setTimeout(() => {
      this.init()
    }, 1500);
  }

  init() {
    // this.generate('before')
    // this.generate('after')

    this.fuga('before')
    this.fuga('after')
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

    let filteredEvents = []

    filteredEvents = events.filter((event) => {
      // if (event.type === 'call') return false
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
      try {
        tree.history = history
        tree.analyze(ast)
        event.updates = tree.updates
        return event
      } catch (err) {
        return false
      }
    }).filter(event => event)

    let state = {}
    state[key] = filteredEvents
    this.setState(state, () => {
      this.translate()
    })
  }

  translate() {
    let text = ''
    let max = 0
    let events = []
    let length = Math.min(this.state.beforeEvents.length, this.state.afterEvents.length)
    for (let i = 0; i < length; i++) {
      let beforeEvent = this.state.beforeEvents[i]
      let afterEvent = this.state.afterEvents[i]
      let beforeUpdates = _.uniq(beforeEvent.updates).reverse()
      let afterUpdates = _.uniq(afterEvent.updates).reverse()
      let result = beforeUpdates[this.state.level]
      let expected = afterUpdates[this.state.level]
      if (result === undefined) result = _.last(beforeUpdates)
      if (expected === undefined) expected = _.last(afterUpdates)

      max = Math.max(max, beforeUpdates.length - 1)
      max = Math.max(max, afterUpdates.length - 1)

      let event = beforeEvent
      event.result = result
      event.expected = expected
      events.push(event)
    }

    let marks = {}
    marks[0] = 'concrete'
    marks[max] = 'abstract'
    this.setState({ events: events, max: max, marks: marks })
  }

  onChange(value) {
    this.setState({ level: value }, () => {
      this.init()
    })
  }

  onClick(index, line, event) {
    console.log('fjewo')
    $(event.target).removeClass('primary')
    setTimeout(() => {
      let target = $(`#hoge .CodeMirror`)
      target.popup('toggle')

      this.setState({ quizIndex: index, currentLine: line })
      let top = 75 + parseInt(line)*24
      $('.inline-hint').css('top',`${top}px`)
      window.cm.addLineClass(line-1, '', 'current-line')
    }, 100)
  }

  onClose() {
    let popup = $('.popup')
    if (popup.hasClass('visible')) {
      popup.removeClass('visible')
      popup.addClass('hidden')
    }
    window.cm.removeLineClass(this.state.currentLine-1, '', 'current-line')
    this.setState({ quizIndex: null, currentLine: null })
  }

  fuga(type) {
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


    let indent = 0
    events = events.map((event) => {
      let focusKeys = _.union(Object.keys(this.props.beforeHistory), Object.keys(this.props.afterHistory)).map((key) => {
        if (_.isEqual(this.props.beforeHistory[key], this.props.afterHistory[key])) return false
        return key
      }).filter(key => key)
      if (!focusKeys.includes(event.key)) return false
      if (event.builtin) return false
      if (event.type === 'call' && event.children.length === 0) return false

      let trimmedEvents = events.slice(0, event.id)
      let history = {}
      for (let e of trimmedEvents) {
        history[e.key] = e
      }

      let ast = asts[event.line-1]
      let tree = new Tree()

      try {
        tree.history = history
        tree.analyze(ast)
        event.updates = tree.updates
        return event
      } catch (err) {
        return false
      }
    }).filter(event => event)

    let max = this.state.max
    events = events.map((event) => {
      let updates = _.uniq(event.updates).reverse()
      let value = updates[this.state.level]
      if (value === undefined) value = _.last(updates)
      if (value === undefined) value = event.value

      max = Math.max(max, updates.length - 1)

      switch (event.type) {
        case 'call':
          event.call = event.children[0]
          event.html = [
            { className: 'normal', text: 'call ' },
            { className: 'keyword', text: event.call },
          ]
          indent++
          event.indent = indent
          break
        case 'return':
          event.html = [
            { className: 'keyword', text: event.key },
            { className: 'normal', text: ' returns ' },
            { className: 'number', text: value },
          ]
          event.indent = indent
          indent--
          break
        default:
          event.html = [
            { className: 'keyword', text: event.key },
            { className: 'normal', text: ' = ' },
            { className: 'number', text: value },
          ]
          event.indent = indent
          break
      }
      return event
    })

    let state = {}
    let marks = {}
    marks[0] = 'concrete'
    marks[max] = 'abstract'
    state['max'] = max
    state['marks'] = marks
    state[key] = events
    this.setState(state)
  }

  onMouseOver(line) {
    window.cm.addLineClass(line-1, '', 'current-line')
  }

  onMouseOut(line) {
    window.cm.removeLineClass(line-1, '', 'current-line')
  }

  hoge(event, index) {
    return (
      <div key={ index } >
        <p style={{ marginLeft: `${10 * event.indent}px` }}
          onMouseOver={ this.onMouseOver.bind(this, event.line) }
          onMouseOut={ this.onMouseOut.bind(this, event.line) }
        >
          { event.html.map((html) => {
            return <span className={ `hljs-${html.className}` }>{ html.text }</span>
          }) }
        </p>
      </div>
    )
  }

  render() {

    $('#hoge .CodeMirror').popup({
      target: $('#hoge .CodeMirror'),
      position: 'bottom center',
      inline: true,
      popup : $(`.inline-hint`),
      on: 'manual',
    })

    return (
      <div id='ladder' className="ladder">
        <div className="ui two column grid">
          <div className="eight wide column">
            <h2>Result</h2>
            <pre><code className="hljs">
              { this.state.beforeEvents.map((event, index) => {
                return this.hoge(event, index)
              }) }
            </code></pre>
          </div>
          <div className="eight wide column">
            <h2>Expected</h2>
            <pre><code className="hljs">
              { this.state.afterEvents.map((event, index) => {
                return this.hoge(event, index)
              }) }
            </code></pre>
          </div>

          { /*this.state.events.map((event, index) => {
            if (event.result === undefined) return null
            switch (event.type) {
              case 'call':
                if (event.children.length === 0) return null
                return (
                  <div key={ index }>
                    { event.children.map((child) => {
                      return <p><span className="hljs-keyword">{ `${event.key} `}</span> calls <span className="hljs-number">{ ` ${child} ` }</span></p>
                    }) }
                  </div>
                )
              case 'return':
                return (
                  <div key={ index }>
                    <p>
                      <span className="hljs-keyword">{ `${event.key} `}</span>
                      returns
                      <span className="hljs-number">{ ` ${event.result} ` }</span>
                      should be
                      <span className="hljs-number">{ ` ${event.expected} ` }</span>
                      <br />
                      <i className="fa fa-long-arrow-right fa-fw"></i><a onClick={ this.onClick.bind(this, index, event.line) }> why { `${event.key} returns ${event.result} ?` }</a>
                    </p>
                  </div>
                )
              default:
                return (
                  <div key={ index }>
                    <p>
                      <span className="hljs-keyword">{ `${event.key} `}</span>
                      =
                      <span className="hljs-number">{ ` ${event.result} ` }</span>
                      should be
                      <span className="hljs-number">{ ` ${event.expected} ` }</span>
                      <br />
                      <i className="fa fa-long-arrow-right fa-fw"></i><a onClick={ this.onClick.bind(this, index, event.line) }> why { `${ event.key } = ${ event.result } ?` }</a>
                    </p>
                  </div>
                )
            }
          }) */ }


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
        </div>

        <div className="ui fluid popup bottom center transition inline-hint">
          { this.state.events.map((event, index) => {
            let question = ''
            question += 'Q. Why '
            question += event.key
            if (event.type === 'return') {
              question += ' returns '
            }
            if (event.type === 'assign') {
              if (event.index === 0) {
                question += ' is initialized with '
              } else {
                question += ' is updated to '
              }
            }
            question += event.value
            question += ' ?'
            let events = this.props.beforeEvents.slice(0, event.id)
            let history = {}
            for (let e of events) {
              history[e.key] = e
            }

            return (
              <div id={ `quiz-${index} `} className="quiz" key={ index } style={{ display: this.state.quizIndex === index ? 'block' : 'none' }}>
                <h1><b>{ question }</b></h1>
                <Quiz
                  id={ `quiz-${ index }` }
                  options={ this.props.options }
                  line={ event.line }
                  currentCode={ this.props.currentCode }
                  beforeCode={ this.props.beforeCode }
                  before={ this.props.before }
                  beforeAst={ this.props.beforeAst }
                  history={ history }
                />
              </div>
            )
          }) }
          <button className="ui basic button close-button" onClick={ this.onClose.bind(this) } style={{ float: 'right' }}>Close</button>
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

/*

  translate(compare = false) {
    let events = this.props.beforeEvents
    // .filter(event => this.props.focusKeys.includes(event.key))
    let filteredEvents = []
    let text = ''
    for (let event of events) {
      switch (event.type) {
        case 'call':
          if (event.children.length === 0) continue
          for (let child of event.children) {
            text += `${event.key} calls ${child}`
          }
          break
        case 'return':
          if (event.builtin) continue
          text += `${event.key} returns ${event.value}`
          break
        default:
          if (!this.props.focusKeys.includes(event.key)) continue
          if (event.index === 0) {
            text += `${event.key} is initialized with ${event.value}`
          } else {
            text += `${event.key} is updated to ${event.value}`
          }
          break
      }
      text += ` at line ${ event.line }`
      text += '\n'
      if (event.type !== 'call') filteredEvents.push(event)
    }
    this.setState({ text: text, events: filteredEvents })
  }


 */