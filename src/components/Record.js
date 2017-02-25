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
    let history = {}
    let ticks = {}
    let lines = {}
    for (let i = 0; i < traces.length; i++) {
      let trace = traces[i]
      for (let func of Object.keys(trace.locals)) {

        if (func !== 'accumulate') {
          if (trace.event === 'return') {
            let value = ''
            let args = []
            for (let key of Object.keys(trace.locals[func])) {
              if (key === '__return__') {
                value = trace.locals[func][key]
              } else {
                args.push({ key: key, val: trace.locals[func][key] })
              }
            }
            let key = `${func}(${args.map(arg => arg.val).join(', ')})`
            history[key] = [value]
          }
          continue
        }

        let variables = trace.locals[func]
        for (let key of Object.keys(variables)) {
          let value = variables[key]
          if (value === undefined) continue

          if (!history[key]) history[key] = []
          if (!lines[key]) lines[key] = []
          if (!ticks[key]) ticks[key] = {}

          let line = trace.line
          if (trace.event === 'step_line') {
            line = traces[i-1].line
          }
          let last = _.last(history[key])
          if (last === undefined || last !== value) {
            history[key].push(value)
            lines[key].push(line)
          }
          ticks[key][i] = history[key].length
          if (trace.event === 'step_line') {
            ticks[key][i-1] = history[key].length
          }
        }
      }
    }

    if (type === 'before') {
      this.beforeHistory = history
      this.beforeTicks = ticks
    } else if (type === 'after') {
      this.afterHistory = history
      this.afterTicks = ticks
    }
    return { history: history, lines: lines, ticks: ticks }
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