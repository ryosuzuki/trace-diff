
class Tree {
  constructor() {
    this.history = {}
    this.ast = {}

    this.quizes = []
    this.updates = []
  }

  init() {
    this.ast = {}
    this.quizes = []
    this.updates = []
  }

  analyze(ast) {
    if (ast.error) return false
    let body = ast.Module.body[0]
    let key = Object.keys(body)[0]

    for (let key of Object.keys(body)) {
      let el = body[key]
      if (key === 'Assign') {
        this.ast = this.addAssign(el)
      }
      if (key === 'Return') {
        this.ast = this.addReturn(el)
      }
      if (key === 'Expr') {
        this.ast = this.addExpr(el)
      }
    }
  }

  addAssign(el) {
    let right = this.addNode(el.value)
    let left = []
    for (let target of el.targets) {
      let tn = this.addNode(target)
      left.push(tn)
      if (_.last(this.quizes).key === tn.key) this.quizes.pop()
    }
    let key = left.map(target => target.key).join(', ')
    let value = right.value
    let assignValue = left[0].value

    let updates = []
    updates = updates.concat(right.updates)
    updates.push(value)
    let node = {
      type: 'assign',
      key: key,
      value: value,
      left: left,
      right: right,
      assign: assignValue,
      updates: updates,
    }
    this.updates = updates
    this.quizes.push(node)
    return node
  }

  addExpr(el) {
    let expr = this.addNode(el.value)
    let key = expr.key
    let value = expr.value
    let updates = expr.updates
    updates.push(value)
    let node = {
      type: 'expr',
      key: key,
      value: value,
      expr: expr,
      updates: updates,
    }
    this.updates = updates
    this.quizes.push(node)
    return node
  }

  addReturn(el) {
    let right = this.addNode(el.value)
    let key = right.key
    let value = right.value
    let updates = right.updates
    updates.push(value)
    let node = {
      type: 'return',
      key: key,
      value: value,
      right: right,
      updates: updates,
    }
    this.updates = updates
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
      case 'Tuple':
        return this.addTuple(node)
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
      origin: key,
      key: key,
      value: value,
      updates: key === value ? [] : [key, value],
    }
    if (key !== value) this.quizes.push(node)
    return node
  }

  addNum(el) {
    let node = {
      type: 'num',
      origin: el.n,
      key: el.n,
      value: el.n,
      updates: [],
    }
    return node
  }

  addStr(el) {
    let node = {
      type: 'str',
      origin: el.s,
      key: el.s,
      value: el.s,
      updates: [],
    }
    return node
  }

  addTuple(el) {
    let items = []
    for (let elt of el.elts) {
      let item = this.addNode(elt)
      items.push(item)
    }
    let origin = items.map(item => item.origin).join(', ')
    let key = items.map(item => item.key).join(', ')
    let value = items.map(item => item.value).join(', ')
    let node = {
      type: 'tuple',
      origin: origin,
      key: key,
      value: value,
      updates: [],
    }
    return node
  }

  addCompare(el) {
    let comparator = this.addNode(el.comparator)
    let left = this.addNode(el.left)
    let ops = el.ops
    let node = {
      type: 'compare',
      origin: '',
      key: '',
      value: '',
      comparator: comparator,
      left: left,
      ops: ops,
      updates: [],
    }
  }

  addBinOp(el) {
    const operator = { Add: '+', Sub: '-', Mult: '*', Div: '/' }
    let left = this.addNode(el.left)
    let right = this.addNode(el.right)
    let op = el.op
    let origin = `${left.origin} ${operator[op]} ${right.origin}`
    let key = `${left.value} ${operator[op]} ${right.value}`
    let value
    if (isNaN(left.value) || isNaN(right.value)) {
      value = `${left.value} ${operator[op]} ${right.value}`
    } else {
      value = eval(`${left.value} ${operator[op]} ${right.value}`)
    }
    let updates = []
    for (let lu of left.updates) {
      updates.push(`${lu} ${operator[op]} ${right.origin}`)
    }
    for (let rh of right.updates) {
      let update = `${left.value} ${operator[op]} ${ru}`
      if (!updates.includes(update)) {
        updates.push(update)
      }
    }
    updates.push(value)
    let node = {
      type: 'binop',
      origin: origin,
      key: key,
      value: value,
      left: left,
      right: right,
      op: op,
      updates: updates,
    }
    this.quizes.push(node)
    return node
  }

  addCall(el) {
    let args = []
    for (let arg of el.args) {
      arg = this.addNode(arg)
      args.push(arg)
    }
    let func = this.addNode(el.func)
    let origin = `${func.origin}(${args.map(arg => arg.origin).join(', ')})`
    let key = `${func.value}(${args.map(arg => arg.value).join(', ')})`
    let value = this.getValue(key)
    let calls = this.getCalls(key)
    let children = this.getChildren(key)
    let updates = []
    for (let i = 0; i < args.length; i++) {
      let arg = args[i]
      let a0 = args.slice(0, i)
      let a1 = args.slice(i+1)
      for (let j = 0; j < arg.updates.length; j++) {
        let a = []
        a = a.concat(a0.map(i => i.value))
        a.push(arg.updates[j])
        a = a.concat(a1.map(i => i.origin))
        let update = `${func.origin}(${a.join(', ')})`
        if (!updates.includes(update)) {
          updates.push(update)
        }
      }
    }
    updates.push(`${func.value}(${args.map(a => a.value).join(', ')})`)
    updates.push(value)
    let node = {
      type: 'call',
      key: key,
      value: value,
      func: func,
      args: args,
      origin: origin,
      calls: calls,
      children: children,
      updates: updates,
    }
    this.quizes.push(node)
    return node
  }

  getCalls(key) {
    if (!this.history[key]) return []
    return this.history[key]['calls']
  }

  getChildren(key) {
    if (!this.history[key]) return []
    return this.history[key]['children']
  }

  getValue(key) {
    let value
    if (!Object.keys(this.history).includes(key)) {
      return key
    }
    return this.history[key]['value']
  }


}


export default Tree