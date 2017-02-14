import _ from 'lodash'
import diff from 'deep-diff'

window.diff = diff

class Stream {
  constructor () {
    this.beforeTraces = []
    this.afterTraces = []
    this.traces = []
  }

  check () {
    this.traces = _.clone(this.beforeTraces)

    if (this.traces.length >= 100) {
      let index = this.traces.length-1
      let trace = this.traces[index]
      trace.error = true
      trace.outputs[trace.line] = 'stopped after 100 steps to prevent possible infinite loop'
      return false
    }

    for (let i=0; i<this.traces.length; i++) {

      let beforeTrace = this.beforeTraces[i]
      let afterTrace  = this.afterTraces[i]
      let trace = _.clone(beforeTrace)

      if (!afterTrace || trace.exception_msg) {
        this.traces[i].error = true
        break
      }

      if (this.traces[i].event === 'call') {
        let before_output = beforeTrace.outputs[beforeTrace.line]
        let after_output = afterTrace.outputs[afterTrace.line]
        if (!_.isEqual(before_output, after_output)) {
          this.traces[i-1].error = true
          this.traces[i-1].fixed_outputs = afterTrace.outputs
        }
      }

      if (!_.isEqual(beforeTrace.outputs, afterTrace.outputs)) {
        this.traces[i].error = true
        this.traces[i].fixed_outputs = afterTrace.outputs
      }

      // if (trace.line !== afterTrace.line) {
      //   if (trace.content !== trace.content) {
      //     this.traces[i-1].error = true
      //   }
      // }

    }
  }

  generate (traces, code, type) {
    let newTraces = []

    for (let i=0; i<traces.length; i++) {
      let trace = traces[i]
      trace.error = false
      trace.calling = false
      trace.call_line = undefined
      trace.change_line = 1
      trace.content = code.split('\n')[trace.line-1]
      trace.outputs = {}
      trace.refs = {}
      trace.locals = {}
      trace.change = {}

      if (trace.exception_msg) {
        trace.error = true
        traces[i] = trace
        break
      }

      if (traces[i-1]) {
        trace.outputs = _.clone(traces[i-1].outputs)
        trace.call_line = traces[i-1].call_line
      }

      /*
       * Track only the changed of stack_locals
       */
      for (let key in trace.globals) {
        let func_name = key
        let id = trace.globals[key][1]
        trace.refs[id] = func_name
      }

      for (let j=0; j<trace.stack_locals.length; j++) {
        let stack_local = trace.stack_locals[j]
        let key = stack_local[0]
        if (!trace.locals[key]) {
          let locals = stack_local[1]
          for (let name in locals) {
            if (locals[name][0] === 'REF') {
              let id = locals[name][1]
              let func_name = trace.refs[id]
              locals[name] = func_name
            }
          }
          trace.locals[key] =locals
        }
      }

      if (traces[i-1]) {
        let prev = traces[i-1].locals
        let current = trace.locals

        let diffs = diff(prev, current)
        if (diffs) {
          for (let d=0; d<diffs.length; d++) {
            let key = _.last(diffs[d].path)
            let value = diffs[d].rhs
            trace.change[key] = value
          }
        }
      }

      /*
       * If function returns the value, show the returned object
       */
      if (trace.event === 'call') {
        if (traces[i-1].event === 'return') {
          trace.call_line = traces[i-1].return_line
        } else {
          trace.call_line = traces[i-1].line
        }
      }
      if (trace.event === 'return' && trace.stack_locals[0]) {
        trace.line = trace.call_line
        trace.change_line = trace.callline
        trace.return_line = trace.call_line
        let func = trace.stack_locals[0][0]
        func += '('
        let args = trace.stack_locals[0][1]
        for (let key in args) {
          if (key === '__return__') continue
          let value = args[key]
          func += value
        }
        func += ')'
        // trace.outputs[trace.line] = {}
        // trace.outputs[trace.line][func] = trace.stack_locals[0][1]['__return__']
      }

      /*
       * When there is a change, show the latest stack_locals
       */
      if (_.keys(trace.change).length > 0) {
        if (trace.event === 'call') {
          trace.change_line = trace.line
          trace.outputs[trace.line] = trace.change
        } else {
          if (traces[i-1].event === 'return') {
            trace.change_line = trace.call_line
            trace.outputs[trace.change_line] = trace.change
            trace.call_line = undefined
          } else {
            trace.change_line = traces[i-1].line
            traces[i-1].change_line = trace.change_line
            traces[i-1].outputs[trace.change_line] = trace.change
            trace.outputs[trace.change_line] = trace.change
          }
        }
      }

      if (trace.event === 'call') {
        newTraces[i-1].outputs[traces[i-1].line] = { 'call': trace.func_name }
        trace.outputs[traces[i-1].line] = { 'call': trace.func_name }
      }

      /*
       * If there is a discrepancy between before and after,
       * we identify this is an error
       *
       * TODO: more acculate error detection
       */
      // if (trace.line !== afterTrace.line) {
      //   traces[i-1].error = true
      // }

      newTraces.push(trace)
    }
    if (type === 'before') {
      this.beforeTraces = newTraces
    } else if (type === 'after') {
      this.afterTraces = newTraces
    }
    return newTraces
  }

}

export default Stream