const fs = require('fs')
const jsdiff = require('diff')
const PythonShell = require('python-shell')

const main = () => {
  const trace = new Trace()
  trace.open('accumulate_all_attempts.json')
  trace.generate('accumulate.json')
}

class Trace {
  constructor() {
    this.items = []
    this.results = []
  }

  open(path) {
    const json = fs.readFileSync(path, 'utf8')
    this.items = JSON.parse(json)
  }

  generate(path) {
    let results = []
    for (let item of this.items) {
      item = new Item(item)
      item.generate()
      this.results.push(item)
    }
    fs.writeFileSync(path, JSON.stringify(this.results, null, 2))
    console.log('write finish')

    PythonShell.run('get_trace.py', { args: [path] }, (err) => {
      if (err) throw err
      console.log('generate finish')
    })
  }
}

class Item {
  constructor(item) {
    this.item = item
    this.before = this.item.before.substr(2)
    this.after = this.item.SynthesizedAfter.substr(2)
    this.diff = ''
    this.added = []
    this.removed = []
  }

  generate() {
    this.getDiff()
    this.getTest()
    delete this.item
  }

  getDiff() {
    let diffs = jsdiff.diffJson(this.before, this.after)
    let line = -1
    let code = ''
    let added = []
    let removed = []
    for (let diff of diffs) {
      code += diff.value
      for (let i = 0; i < diff.count; i++) {
        line++
        if (diff.added) added.push(line)
        if (diff.removed) removed.push(line)
      }
    }
    this.diff = code
    this.added = added
    this.removed = removed
  }

  getTest() {
    let i = 0
    let testIndex = 0
    let errorIndex = 0
    for (let text of this.item.failed) {
      if (text.includes('>>> ')) testIndex = i
      if (text.includes('# Error: expected')) errorIndex = i
      i++
    }
    let pass = parseInt(this.item.failed[this.item.failed.length-2])
    let test = this.item.failed[testIndex]
    test = test.substr(4)
    test = test.split('   ')[0]
    let expected = this.item.failed[errorIndex+1]
    expected = parseInt(expected.substr(1))
    let result = this.item.failed[errorIndex+3]
    result = parseInt(result.substr(1))
    let log = this.item.failed.slice(testIndex, errorIndex+4).join('\n')

    this.test = test
    this.expected = expected
    this.result = result
    this.log = log
  }
}

main()
