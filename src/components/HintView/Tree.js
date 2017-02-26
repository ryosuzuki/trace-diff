
class Tree {
  constructor() {
    this.history = {}
    this.ast = {}
    this.quizes = []
    this.tick = 2 // <- TODO: assign
    // let step = 9
    // let tick = this.props.beforeTicks[name][step]
  }

  init() {
    this.ast = {}
    this.quizes = []
  }

  analyze(res) {
    let body = res.ast.Module.body[0]
    let key = Object.keys(body)[0]
    window.body = body

    let ast
    for (let key of Object.keys(body)) {
      let el = body[key]
      if (key === 'Assign') {
        ast = this.addAssign(el)
      }
      if (key === 'Return') {
        ast = this.addReturn(el)
      }
    }
    this.ast = ast
    window.ast = ast
  }

  addAssign(el) {
    let right = this.addNode(el.value)
    let left = []
    for (let target of el.targets) {
      let tn = this.addNode(target)
      left.push(tn)
    }
    let key = left.map(target => target.key).join(', ')
    let value = right.value
    let assignValue = left[0].value
    let node = {
      type: 'assign',
      key: key,
      value: value,
      left: left,
      right: right,
      assign: assignValue
    }
    this.quizes.push(node)
    return node
  }

  addReturn(el) {
    let right = this.addNode(el.value)
    let key = right.key
    let value = right.value
    let node = {
      type: 'return',
      key: key,
      value: value,
      right: right
    }
    this.quizes.push(node)
    return node
  }

  addAugAssign(el) {
    const operator = { Add: '+', Sub: '-', Mult: '*', Div: '/' }
    let left = this.addNode(el.target)
    let right = this.addNode(el.value)
    let op = le.op
    let key = `${left.key} ${operator[op]}= ${right.key}`
    let value = eval(`${left.value} ${operator[op]} ${right.value}`)
    let node = {
      type: 'return',
      key: key,
      value: value,
      left: left,
      right: right,
    }
    return node
  }

  addNode(el) {
    let key = Object.keys(el)[0]
    let node = el[key]
    switch (key) {
      case 'Call':
        return this.addCall(node)
        break
      case 'Name':
        return this.addName(node)
        break
      case 'BinOp':
        return this.addBinOp(node)
        break
      case 'Num':
        return this.addNum(node)
        break
      case 'Str':
        return this.addStr(node)
        break
      case 'Compare':
        return this.addCompare(node)
        break
      default:
        return
    }
  }

  addName(el) {
    let key = el.id
    let value = this.getValue(key)
    let node = {
      type: 'name',
      key: key,
      value: value
    }
    this.quizes.push(node)
    return node
  }

  addNum(el) {
    let node = {
      type: 'num',
      key: el.n,
      value: el.n
    }
    return node
  }

  addStr(el) {
    let node = {
      type: 'str',
      key: el.s,
      value: el.s
    }
    return node
  }

  addCompare(el) {
    let comparator = this.addNode(el.comparator)
    let left = this.addNode(el.left)
    let ops = el.ops
    let node = {
      type: 'compare',
      key: '',
      value: '',
      comparator: comparator,
      left: left,
      ops: ops,
    }
  }

  addBinOp(el) {
    const operator = { Add: '+', Sub: '-', Mult: '*', Div: '/' }
    let left = this.addNode(el.left)
    let right = this.addNode(el.right)
    let op = el.op
    let key = `${left.key} ${operator[op]} ${right.key}`
    let value
    if (isNaN(left.value) || isNaN(right.value)) {
      value = `${left.value} ${operator[op]} ${right.value}`
    } else {
      value = eval(`${left.value} ${operator[op]} ${right.value}`)
    }
    let node = {
      type: 'binop',
      key: key,
      value: value,
      left: left,
      right: right,
      op: op,
    }
    return node
  }

  addCall(el) {
    let args = []
    for (let arg of el.args) {
      arg = this.addNode(arg)
      args.push(arg)
    }
    let func = this.addNode(el.func)
    let origin = `${func.value}(${args.map(arg => arg.key).join(', ')})`
    let key = `${func.value}(${args.map(arg => arg.value).join(', ')})`
    let value = this.getValue(key)
    let calls = this.getCalls(key)
    let node = {
      type: 'call',
      key: key,
      value: value,
      func: func,
      args: args,
      origin: origin,
      calls: calls,
    }
    this.quizes.push(node)
    return node
  }

  getCalls(key) {
    if (!this.history[key]) return []
    return this.history[key]['calls']
  }

  getValue(key) {
    let value
    if (!Object.keys(this.history).includes(key)) {
      return key
    }
    if (this.history[key].length > 1) {
      value = this.history[key]['history'][this.tick]
    } else {
      value = this.history[key]['history'][0]
    }
    return value
  }


}


export default Tree