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
      for (let func of Object.keys(trace.locals)) {
        let builtin = ['add', 'mul', 'identity', 'square', 'increment', 'triple'].includes(func)
        if (!builtin) {
          this.addValue(traces, i, func)
        }
      }
      if (trace.event === 'call') this.addCall(trace)
      if (trace.event === 'return') this.addReturn(trace)
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

  addCall(trace) {
    let func = trace.func_name
    if (func === "<module>") return
    let args = {}
    for (let key of Object.keys(trace.locals[func])) {
      let arg = trace.locals[func][key]
      if (arg !== undefined) args[key] = arg
    }
    let key = this.getKey(func, args)
    let builtin = ['add', 'mul', 'identity', 'square', 'increment', 'triple'].includes(func)
    let node = {
      type: 'call',
      calls: [],
      children: [],
      key: key,
      value: '',
      builtin: builtin,
      history: [],
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

  addReturn(trace) {
    let func = trace.func_name
    if (func === "<module>") return
    let args = {}
    for (let key of Object.keys(trace.locals[func])) {
      if (key === '__return__') continue
      let arg = trace.locals[func][key]
      if (arg !== undefined) args[key] = arg
    }
    let key = this.getKey(func, args)
    let value = trace.locals[func]['__return__']
    this.history[key]['value'] = value
    this.history[key]['history'] = [value]
    this.history[key]['line'] = trace.line

    let event = _.clone(this.history[key])
    event.line = trace.line
    event.type = 'return'
    this.events.push(event)

    this.stacks.pop(key)
  }

  addValue(traces, i, func) {
    let trace = traces[i]
    let variables = trace.locals[func]
    for (let key of Object.keys(variables)) {
      let value = variables[key]
      if (key === '__return__') continue
      if (value === undefined) continue

      let line
      if (trace.event === 'call') {
        line = traces[i].line
      }
      if (trace.event === 'return') {
        line = traces[i].line
      }
      if (trace.event === 'step_line') {
        for (let j = i-1; j >= 0; j--) {
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
      }
      let event = _.clone(node)
      event.line = line

      if (!this.history[key]) {
        this.history[key] = node
        this.events.push(event)
      }
      if (this.history[key]['value'] !== value) {
        this.history[key]['value'] = value
        this.history[key]['history'].push(value)
        this.events.push(event)
      }

      if (!this.ticks[key]) this.ticks[key] = {}
      this.ticks[key][i] = this.history[key].length
      if (trace.event === 'step_line') {
        this.ticks[key][i-1] = this.history[key].length
      }
    }
  }

  getKey(func, args) {
    // TODO
    // Know issue http://0.0.0.0:8080/?id=55
    // helper(combiner, n-1, term)
    // x helper(identity, add, 0)
    // o helper(add, 0, identity)
    if (func === 'accumulate') {
      const ks = ['combiner', 'base', 'n', 'term']
      return `${func}(${ks.map(k => args[k]).join(', ')})`
    } else {
      return `${func}(${Object.values(args).join(', ')})`
    }
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


/*

  addValue(traces, i, func) {
    let trace = traces[i]
    let variables = trace.locals[func]
    for (let key of Object.keys(variables)) {
      let value = variables[key]
      if (key === '__return__') continue
      if (value === undefined) continue

      if (!this.history[key]) this.history[key] = []
      if (!this.lines[key]) this.lines[key] = []
      if (!this.ticks[key]) this.ticks[key] = {}

      let line = trace.line
      if (trace.event === 'step_line') {
        line = traces[i-1].line
      }
      let last = _.last(this.history[key])
      if (last === undefined || last !== value) {
        this.history[key].push(value)
        this.lines[key].push(line)
      }
      this.ticks[key][i] = this.history[key].length
      if (trace.event === 'step_line') {
        this.ticks[key][i-1] = this.history[key].length
      }
    }
  }
 */