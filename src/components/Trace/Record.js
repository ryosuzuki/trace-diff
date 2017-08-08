import _ from 'lodash'

class Record {
  constructor () {
    this.beforeHistory = {}
    this.afterHistory = {}
    this.beforeTicks = {}
    this.afterTicks = {}
    this.commonKeys = []
    this.focusKeys = []

    this.events = []
  }

  generate(traces, type) {
    this.stacks = []
    this.history = {}
    this.ticks = {}

    this.events = []

    for (let i = 0; i < traces.length; i++) {
      let trace = traces[i]
      if (trace.event === 'call') this.addCall(trace, i)

      for (let func of Object.keys(trace.locals)) {
        let builtin = ['add', 'mul', 'identity', 'square', 'increment', 'triple'].includes(func)
        if (!builtin) {
          this.addValue(traces, i, func)
        }
      }

      if (trace.event === 'return') this.addReturn(trace, i)
    }

    // for (let key of Object.keys(this.history)) {
    //   let item = this.history[key]
    //   if (item.type !== 'call') continue
    //   let children = []
    //   for (let funcKey of item.calls) {
    //     let child = this.history[funcKey]
    //     if (!child.builtin) {
    //       children.push(funcKey)
    //     }
    //   }
    //   item.children = children
    //   this.history[key] = item
    // }

    this.events = this.events.map((event, index) => {
      event.id = index
      return event
    })

    if (type === 'before') {
      this.beforeHistory = this.history
      this.beforeTicks = this.ticks
      this.beforeEvents = this.events
    } else if (type === 'after') {
      this.afterHistory = this.history
      this.afterTicks = this.ticks
      this.afterEvents = this.events
    }
    return { history: this.history, ticks: this.ticks, events: this.events }
  }

  addCall(trace, index) {
    let func = trace.func_name
    if (func === '<module>') return

    let key = this.getKey(func, trace)
    let builtin = ['add', 'mul', 'identity', 'square', 'increment', 'triple'].includes(func)
    let node = {
      type: 'call',
      calls: [],
      children: [],
      key: key,
      value: '',
      builtin: builtin,
      history: [],
      traceIndex: index,
    }
    this.history[key] = node

    let event = _.clone(node)
    event.line = trace.call_line
    this.events.push(event)

    let last = _.last(this.stacks)
    if (last) {
      this.history[last].calls.push(key)
      if (!node.builtin) {
        this.history[last].children.push(key)
      }
    }
    this.stacks.push(key)
  }

  addReturn(trace, index) {
    let func = trace.func_name
    if (func === '<module>') return

    let key = this.getKey(func, trace)
    let value = trace.locals[func]['__return__']

    this.history[key]['value'] = value
    this.history[key]['history'] = [value]
    this.history[key]['line'] = trace.line

    let event = _.clone(this.history[key])
    event.line = trace.line
    event.type = 'return'
    event.traceIndex = index
    this.events.push(event)

    this.stacks.pop(key)
  }

  addValue(traces, index, func) {
    let trace = traces[index]
    let variables = trace.locals[func]
    for (let key of Object.keys(variables)) {
      let value = variables[key]
      if (key === '__return__') continue
      if (value === undefined) continue

      let line
      if (trace.event === 'call') {
        line = traces[index].line
      }
      if (trace.event === 'return') {
        line = traces[index].line
      }
      if (trace.event === 'step_line') {
        for (let j = index-1; j >= 0; j--) {
          let prev = traces[j]
          if (prev.func_name === trace.func_name) {
            line = prev.line
            break
          }
        }
      }

      let node = {
        type: 'assign',
        key: key,
        value: value,
        history: [value],
        traceIndex: index
      }
      let event = _.clone(node)
      event.line = line
      event.index = 0
      if (!this.history[key]) {
        this.history[key] = node
        this.events.push(event)
      }
      if (this.history[key]['value'] !== value) {
        this.history[key]['value'] = value
        this.history[key]['history'].push(value)
        event.index = this.history[key]['history'].length-1
        this.events.push(event)
      }

      if (!this.ticks[key]) this.ticks[key] = {}
      this.ticks[key][index] = this.history[key].length
      if (trace.event === 'step_line') {
        this.ticks[key][index-1] = this.history[key].length
      }
    }
  }

  getKey(func, trace) {
    let locals = {}
    for (let key of Object.keys(trace.locals[func])) {
      let local = trace.locals[func][key]
      if (local !== undefined) locals[key] = local
    }

    /*
      e.g.
      funcStr = 'accumulate(combiner, base, n, term)
      funcName = 'accumulate'
      funcArgs = 'combiner, base, n, term'
      args = ['combiner', 'base', 'n', 'term']
    */
    let args = []
    for (let i of Object.keys(trace.heap)) {
      let heap = trace.heap[i]
      let funcStr = heap[1]
      let funcName = funcStr.split('(')[0]
      if (func === funcName) {
        let funcArgs = /\(\s*([^)]+?)\s*\)/.exec(funcStr)[1]
        if (funcArgs) {
          args = funcArgs.split(/\s*,\s*/)
        }
        break
      }
    }
    return `${func}(${args.map(arg => locals[arg]).join(', ')})`
  }

  check() {
    this.commonKeys = _.intersection(
      Object.keys(this.beforeHistory),
      Object.keys(this.afterHistory)
    )

    let line
    this.focusKeys = []
    for (let key of this.commonKeys) {
      if (key === '__return__') continue
      if (!_.isEqual(this.beforeHistory[key], this.afterHistory[key])) {
        // let obj = _.countBy(before.lines[key])
        // line = Number(Object.keys(obj).reduce(function(a, b){ return obj[a] > obj[b] ? a : b }))
        this.focusKeys.push(key)
      }
    }
  }

}

export default Record
