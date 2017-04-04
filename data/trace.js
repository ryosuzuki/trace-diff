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
    let id = 0

    this.items = this.items.slice(0, 300)
    for (let item of this.items) {
      item = new Item(item, id++)
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
  constructor(item, id) {
    this.item = item
    this.id = id
    this.studentId = this.item.studentId
    this.rule = this.item.UsedFix
    this.before = this.item.before.substr(2)
    this.after = this.item.SynthesizedAfter.substr(2)
    this.code = ''
    this.diffs = []
    this.added = []
    this.removed = []
  }

  generate() {
    this.getDiff()
    this.getTest()
    delete this.item
  }

  getDiff() {
    if (this.before.includes('from operator import')) {
      let lines = []
      for (let line of this.before.split('\r\n')) {
        if (line.includes('from operator import')) continue
        lines.push(line)
      }
      this.before = lines.join('\n')
    }
    this.before = this.before.replace(/\r\n/g, '\n');
    this.after = this.after.replace(/\r\n/g, '\n');


    let diffs = jsdiff.diffJson(this.before, this.after)
    let line = -1
    let code = ''
    let added = []
    let removed = []
    let addedLine = []
    let removedLine = []
    for (let diff of diffs) {
      let lines = diff.value.split('\n')
      for (let i = 0; i < diff.count; i++) {
        code += lines[i]
        code += '\n'
        line++
        if (diff.added) {
          added.push(line)
          addedLine.push({ line: line, code: lines[i] })
        }
        if (diff.removed) {
          removed.push(line)
          removedLine.push({ line: line, code: lines[i] })
        }
      }
    }
    this.code = code
    this.diffs = diffs
    this.added = added
    this.removed = removed
    this.addedLine = addedLine
    this.removedLine = removedLine
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
    test = test.substr(0, test.indexOf(')') + 1)
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
