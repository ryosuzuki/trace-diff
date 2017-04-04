import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'

import ExecutionVisualizer from './PythonTutor/ExecutionVisualizer'
import Ladder from './PythonTutor/Ladder'
import Tree from './Data/Tree'

class PythonTutor extends Component {
  constructor(props) {
    super(props)
    window.pythonTutor = this
  }

  componentDidMount() {
  }

  init() {
    console.log('hello world')

    let options = {
      embeddedMode: true,
      lang: 'py2',
      startingInstruction: 10,
      editCodeBaseURL: 'visualize.html'
    }

    let beforeHistory = this.generateHistory('before')
    let beforeData = {
      code: this.props.beforeCode,
      trace: this.props.beforeTraces,
      history: beforeHistory,
      vizId: 'before',
    }

    let beforeViz = new ExecutionVisualizer('beforeViz', beforeData, options);
    window.beforeViz = beforeViz


    let afterHistory = this.generateHistory('after')
    let afterData = {
      code: this.props.afterCode,
      trace: this.props.afterTraces,
      history: afterHistory,
      vizId: 'after'
    }
    options.hideCode = true
    let afterViz = new ExecutionVisualizer('afterViz', afterData, options);
    window.afterViz = afterViz


    $('.variableTr[data-name="previous"]').addClass('highlight-var-name')
    window.ladder.init()
  }

  generateHistory(type) {
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
        event.updates = []
        return event
      }
    }).filter(event => event)

    let max = 0
    let level = 0
    events = events.map((event) => {
      let updates = _.uniq(event.updates).reverse()
      /*
      let value = updates[level]
      if (value === undefined) value = _.last(updates)
      if (value === undefined) value = event.value
      */

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
            { className: 'number', text: event.value },
          ]
          event.indent = indent
          indent--
          break
        default:
          event.html = [
            { className: 'keyword', text: event.key },
            { className: 'normal', text: ' = ' },
            { className: 'number', text: event.value },
          ]
          event.indent = indent
          break
      }
      return event
    })

    return events
  }



  render() {
    return (
      <div className="ui two column centered grid">
        PythonTutor
        <div id="beforeViz" className="ten wide column"></div>
        <div id="afterViz" className="five wide column"></div>
      </div>
    )
  }
}

export default PythonTutor
