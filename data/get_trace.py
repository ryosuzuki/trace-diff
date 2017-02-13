import sys
import json
import re
import pg_logger

path = sys.argv[1]

items = []
with open(path) as file:
  items = json.load(file)

for item in items:
  before = item['before']
  after = item['after']
  test = item['test']

  keywords = re.findall(r"[\w]+", test)
  combiner = None
  term = None
  combiner_func = ''
  term_func = ''

  # e.g.
  # product(3, identity)
  # >>> ['product', '3', 'identity']
  #
  # accumulate(add, 11, 3, square)
  # >>> ['accumulate', 'add', '11', '3', 'square']
  #
  # repeated(square, 4)(5)
  # >>> ['repeated', 'square', '4', '5']

  key = keywords[0]
  if key == 'product':
    term = keywords[1]
  elif key == 'accumulate':
    combiner = keywords[1]
    term = keywords[4]
  elif key == 'repeated':
    term = keywords[2]

  if combiner == 'add':
    combiner_func = "\n\ndef add(a, b):\n  return a + b\n"
  elif combiner == 'mul':
    combiner_func = "\n\ndef mul(a, b):\n  return a * b\n"

  if term == 'identity':
    term_func = "\n\ndef identity(x):\n  return x\n"
  elif term == 'square':
    term_func = "\n\ndef square(x):\n  return x * x\n"
  elif term == 'increment':
    term_func = "\n\ndef increment(x):\n  return x + 1\n"
  elif term == 'triple':
    term_func = "\n\ndef triple(x):\n  return 3 * x\n"

  before += combiner_func
  before += term_func
  before += '\n'
  before += test

  after += combiner_func
  after += term_func
  after += '\n'
  after += test

  before_traces = pg_logger.exec_script_str(before).trace
  after_traces = pg_logger.exec_script_str(after).trace
  item['before_traces'] = before_traces
  item['after_traces'] = after_traces

with open('example.json', 'w') as file:
  json.dump(items[0], file, indent = 2)

with open(path, 'w') as file:
  json.dump(items, file)

