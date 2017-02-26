import _ from 'lodash'

class Record {
  constructor () {
    this.beforeHistory = {}
    this.afterHistory = {}
    this.beforeTicks = {}
    this.afterTicks = {}
    this.commonKeys = []
    this.focusKeys = []
  }

  generate(traces, type) {
    this.stacks = []
    this.history = {}
    this.ticks = {}
    for (let i = 0; i < traces.length; i++) {
      let trace = traces[i]
      for (let func of Object.keys(trace.locals)) {
        if (func === 'accumulate') {
          this.addValue(traces, i, func)
        }
      }
      if (trace.event === 'call') this.addCall(trace)
      if (trace.event === 'return') this.addReturn(trace)
    }

    if (type === 'before') {
      this.beforeHistory = this.history
      this.beforeTicks = this.ticks
    } else if (type === 'after') {
      this.afterHistory = this.history
      this.afterTicks = this.ticks
    }
    return { history: this.history, ticks: this.ticks }
  }

  addCall(trace) {
    let func = trace.func_name
    if (func === "<module>") return
    let args = {}
    for (let key of Object.keys(trace.locals[func])) {
      args[key] = trace.locals[func][key]
    }
    let key = this.getKey(func, args)
    let node = {
      type: 'call',
      calls: [],
      value: ''
    }
    this.history[key] = node

    let last = _.last(this.stacks)
    if (last) this.history[last].calls.push(key)
    this.stacks.push(key)
  }

  addReturn(trace) {
    let func = trace.func_name
    if (func === "<module>") return
    let args = {}
    for (let key of Object.keys(trace.locals[func])) {
      if (key === '__return__') continue
      args[key] = trace.locals[func][key]
    }
    let key = this.getKey(func, args)
    let value = trace.locals[func]['__return__']
    this.history[key]['value'] = value
    this.history[key]['history'] = [value]

    this.stacks.pop(key)
  }

  getKey(func, args) {
    if (func === 'accumulate') {
      const ks = ['combiner', 'base', 'n', 'term']
      return `${func}(${ks.map(k => args[k]).join(', ')})`
    } else {
      return `${func}(${Object.values(args).join(', ')})`
    }
  }

  addValue(traces, i, func) {
    let trace = traces[i]
    let variables = trace.locals[func]
    for (let key of Object.keys(variables)) {
      let value = variables[key]
      if (key === '__return__') continue
      if (value === undefined) continue

      let node = {
        type: 'assign',
        value: value,
        history: [value],
      }
      if (!this.history[key]) this.history[key] = node
      if (!this.ticks[key]) this.ticks[key] = {}
      if (this.history[key]['value'] !== value) {
        this.history[key]['value'] = value
        this.history[key]['history'].push(value)
      }
      this.ticks[key][i] = this.history[key].length
      if (trace.event === 'step_line') {
        this.ticks[key][i-1] = this.history[key].length
      }
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