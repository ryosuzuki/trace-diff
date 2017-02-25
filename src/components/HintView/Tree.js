
class Tree {
  constructor() {
    this.history = {}
    this.ast = {}
    this.nodes = []
    this.res = {}
    this.code = ''
    this.tick = 2 // <- TODO: assign
    // let step = 9
    // let tick = this.props.beforeTicks[name][step]

  }

  init(code) {
    this.ast = {}
    this.nodes = []
    this.code = code.trim()
    $.ajax({
      url: 'https://python-ast-explorer.com/api/_parse',
      method: 'POST',
      data: this.code,
    })
    .then((res) => {
      console.log('get response')
      this.res = res
    })
  }

  analyze() {
    let body = this.res.ast.Module.body[0]
    let key = Object.keys(body)[0]
    window.body = body

    let ast
    for (let key of Object.keys(body)) {
      let el = body[key]
      if (key === 'Assign') {
        ast = this.addAssign(el)
      }
    }
    this.ast = ast
  }

  addAssign(el) {
    let right
    if (el.value.Call) {
      right = this.addCall(el.value.Call)
    }

    let left = []
    for (let el of el.targets) {
      let target = this.addName(el)
      left.push(target)
    }

    let key = left.map(target => target.key).join(', ')
    let value = right.value
    let assignValue = left[0].value
    let node = {
      type: 'assign',
      key: key,
      value: right.value,
      left: left,
      right: right,
      assign: assignValue
    }
    return node
  }

  addName(el) {
    let key = el.Name.id
    let value = this.getValue(key)
    let node = {
      type: 'name',
      key: key,
      value: value
    }
    this.nodes.push(node)
    return node
  }

  addCall(el) {
    let args = []
    for (let arg of el.args) {
      if (arg.Name) {
        arg = this.addName(arg)
      }
      if (arg.Call) {
        arg = this.addCall(arg.Call)
        // nodes.push(children)
      }
      args.push(arg)
    }
    let func = this.addName(el.func)
    let key = `${func.key}(${args.map(arg => arg.key).join(', ')})`
    let value = `${func.value}(${args.map(arg => arg.value).join(', ')})`
    let returnValue = this.getValue(value)
    let node = {
      type: 'call',
      key: key,
      value: value,
      func: func,
      args: args,
      return: returnValue
    }
    this.nodes.push(node)
    return node
  }

  getValue(key) {
    let value
    if (!Object.keys(this.history).includes(key)) {
      return key
    }
    if (this.history[key].length > 1) {
      value = this.history[key][this.tick]
    } else {
      value = this.history[key][0]
    }
    return value
  }


}


export default Tree