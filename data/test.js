const fs = require('fs')
const PythonShell = require('python-shell')

const test = [{
  "before": "def accumulate(combiner, base, n, term):\n    previous = term(base)\n    for i in range(1, n+1):\n        previous = combiner(previous, term(i))\n    return previous",
  "after": "def accumulate(combiner, base, n, term):\n    previous = base\n    for i in range(1, n+1):\n        previous = combiner(previous, term(i))\n    return previous",
  "test": "accumulate(add, 11, 3, square)",
}]

const path = 'test.json'

fs.writeFileSync(path, JSON.stringify(test, null, 2))

console.log('write finish')

PythonShell.run('get_trace.py', { args: [path] }, (err) => {
  if (err) throw err
  console.log('generate finish')
})

