const fs = require('fs')
const jsdiff = require('diff')

class Trace {
  constructor(path) {
    this.path = path
    this.items = []
    this.results = []
  }

  open() {
    const json = fs.readFileSync(this.path, 'utf8')
    this.items = JSON.parse(json)
    this.prepare()
  }

  prepare() {
    console.log(this.items.length)
    for (let item of this.items) {
      item = new Item(item)
      console.log(JSON.stringify(item, null, 2))
      break
    }
    // console.log(JSON.stringify(this.results, null, 2))
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
    this.getDiff()
    this.getTest()

    delete this.item
  }

  getTrace() {

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


const trace = new Trace('./accumulate_all_attempts.json')
trace.open()

// export default Trace

