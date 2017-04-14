import React, { Component } from 'react'
import Highlight from 'react-highlight'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Tree from '../Data/Tree'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'

import Quiz from './Quiz'
import ExecutionVisualizer from '../PythonTutor/ExecutionVisualizer'


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
      diffIndex: null,
      focusKeys: [],
      condition: 0,
    }
    window.ladder = this
  }

  componentDidMount() {
    setTimeout(() => {
      this.init()
    }, 1500);
  }

  init() {
    this.generate('before')
    this.generate('after')
  }

  onChange(value) {
    if (value > this.state.max) return false
    this.setState({ level: value }, () => {
      this.init()
    })
  }

  onClick(index, line, event) {
    this.onChange(this.state.level + 1)
    return false


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


  onMouseOver(event, index) {
    let line = event.line
    $(`.history-line.line-${index}`).addClass('hover')

    let popup = $('.popup')
    if (!popup.hasClass('visible')) {
      window.cm.addLineClass(line-1, '', 'current-line')
    }
  }

  onMouseOut(event, index) {
    let line = event.line
    $(`.history-line.line-${index}`).removeClass('hover')

    let popup = $('.popup')
    if (!popup.hasClass('visible')) {
      window.cm.removeLineClass(line-1, '', 'current-line')
    }
  }

  initVisualization(id = 0) {
    let data = {
      code: this.props.beforeCode,
      trace: this.props.beforeTraces,
      history: this.state.beforeEvents,
      afterTrace: this.props.afterTraces,
      afterHistory: this.state.afterEvents,
    }
    if (id === 1) {
      data.history = []
      data.afterTrace = []
      data.afterHistory = []
    }
    let options = {
      embeddedMode: true,
      lang: 'py2',
      startingInstruction: 0,
      editCodeBaseURL: 'visualize.html',
      // hideCode: true,
    }
    window.viz = new ExecutionVisualizer('viz', data, options);
    window.viz.renderStep(0)
    this.setState({ condition: id })
  }

  visualize(index) {
    if (!window.viz.renderStep) {
      this.initVisualization(this.state.condition)
    }

    let startIndex
    let stopIndex
    if (index === 0) {
      startIndex = this.state.beforeEvents[index].traceIndex
      stopIndex = this.state.beforeEvents[index].traceIndex
    } else {
      startIndex = this.state.beforeEvents[index-1].traceIndex
      stopIndex = this.state.beforeEvents[index].traceIndex
    }

    let count = startIndex
    const animate = () => {
      let timer = setTimeout(animate, 100)
      window.viz.renderStep(count)
      count++
      if (count > stopIndex) {
        clearTimeout(timer)
      }
    }

    animate()

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

    const isEqual = (before, after) => {
      let bool = true
      if (!before || !after) return false
      for (let key of ['value', 'key', 'type', 'history']) {
        if (!_.isEqual(before[key], after[key])) bool = false
      }
      return bool
    }

    let focusKeys = _.union(Object.keys(this.props.beforeHistory), Object.keys(this.props.afterHistory)).map((key) => {
      if (isEqual(this.props.beforeHistory[key], this.props.afterHistory[key])   && this.props.beforeHistory[key].type !== 'call') return false
      return key
    }).filter(key => key)

    let indent = 0
    events = events.map((event) => {
      if (!focusKeys.includes(event.key)) return false
      if (window.type !== 'repeated' && event.builtin) return false
      // if (event.type === 'call' && event.children.length === 0) return false

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

        if (event.type !== tree.type && event.value !== '') {
          event.updates = [event.value]
        }

        return event
      } catch (err) {
        event.updates = []
        return event
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
          event.call = // event.children[0]
          event.html = [
            { className: 'normal', text: 'call ' },
            { className: 'keyword', text: event.key },
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
    if (max > 3) max = 3
    marks[0] = 'concrete'
    marks[max] = 'abstract'
    state['max'] = max
    state['marks'] = marks
    state['focusKeys'] = focusKeys
    state[key] = events
    this.setState(state, () => {
      window.quizes.map((quiz, index) => { quiz.init() })

      let diffIndex
      if (this.state.beforeEvents.length === 0
       || this.state.afterEvents.length === 0) return
      for (let i = 0; i < this.state.beforeEvents.length; i++) {
        let be = this.state.beforeEvents[i]
        let ae = this.state.afterEvents[i]
        if (be.key !== ae.key || be.value !== ae.value) {
          diffIndex = i
          break
        }
      }
      this.setState({ diffIndex: diffIndex })

      this.initVisualization(this.state.condition)
    })
  }


  renderEvent(event, index) {
    let showWhy = true
    if (event.type === 'call') showWhy = false
    if (event.updates.length < 2) showWhy = false
    let className = 'history-line'
    className += ` line-${index} `
    if (this.state.diffIndex === index && (this.state.condition === 0 || this.state.condition === 3))  className += ' diff-line'
    let conditions = [0, 3]
    return (
      <div className={ className } data-index={ index } key={ index }>
        <p style={{ paddingLeft: `${10 * event.indent}px` , cursor: 'pointer' }}
          onMouseOver={ this.onMouseOver.bind(this, event, index) }
          onMouseOut={ this.onMouseOut.bind(this, event, index) }
          onClick={ this.visualize.bind(this, index) }
        >
          <span style={{ display: (this.state.condition === 0 || this.state.condition === 3) ? 'inline' : 'none' }}>
            { index < this.state.diffIndex ? <i className="fa fa-check fa-fw"></i> : <i className="fa fa-fw fa-angle-right"></i> }
          &nbsp;
          </span>
          { event.html.map((html, index) => {
            return <span key={ index } className={ `hljs-${html.className}` }>{ html.text }</span>
          }) }
          <span id={ `why-${index}` } style={{ display: showWhy ? 'inline' : 'none' }}>
          &nbsp;
          <i className="fa fa-long-arrow-right fa-fw"></i><a onClick={ this.onClick.bind(this, index, event.line) }> why ?</a>
          </span>
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
      <div id='ladder'>
        <div className="ui two column grid">
          <div className="eight wide column">
            <h2>Result</h2>
            <Highlight className="python">
              { `${this.props.test}\n>>> ${this.props.result}` }
            </Highlight>
            <div id="result-ladder" className="ladder">
              <pre><code className="hljs">
                { this.state.beforeEvents.map((event, index) => {
                  return this.renderEvent(event, index)
                }) }
              </code></pre>
            </div>
          </div>
          <div className="eight wide column">
            <h2>Expected</h2>
            <Highlight className="python">
              { `${this.props.test}\n>>> ${this.props.expected}` }
            </Highlight>
            <div id="expected-ladder" className="ladder">
              <pre><code className="hljs">
                { this.state.afterEvents.map((event, index) => {
                  return this.renderEvent(event, index)
                }) }
              </code></pre>
            </div>
          </div>


          <div id="control-ladder" className="ladder" style={{ width: '50%'}}>
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

        </div>

        <div className="ui fluid popup bottom center transition inline-hint">
          { this.state.beforeEvents.map((event, index) => {
            if (event.type === 'call') return null
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
                  index={ index }
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
