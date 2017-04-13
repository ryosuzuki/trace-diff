import sys
import json
import re
import pg_logger
import json
import parse

question_type = sys.argv[1]
path = question_type + '.json'

items = []
with open(path) as file:
  items = json.load(file)

i = 0
for item in items:
  before = item['before']
  after = item['after']
  test = item['test']

  before_ast = []
  after_ast = []

  for line in before.splitlines():
    line = line.strip()
    try:
      ast = parse.make_ast(line)
    except Exception as err:
      ast = { 'error': True }
    before_ast.append(ast)

  for line in after.splitlines():
    line = line.strip()
    try:
      ast = parse.make_ast(line)
    except Exception as err:
      ast = { 'error': True }
    after_ast.append(ast)

  item['beforeAst'] = before_ast
  item['afterAst'] = after_ast

  keywords = re.findall(r"[\w]+", test)
  combiner = None
  term = None
  combiner_func = ''
  term_func = ''
  test = test.split('#')[0]

  before = before.replace('    ', '  ')
  after = after.replace('    ', '  ')

  # e.g.
  # product(3, identity)
  # >>> ['product', '3', 'identity']
  #
  # accumulate(add, 11, 3, square)
  # >>> ['accumulate', 'add', '11', '3', 'square']
  #
  # add_three = repeated(increment, 3)
  # >>> ['add_three', 'repeated', 'increment', '3']
  #
  # add_three(5)
  # >>> ['add_three', '5']
  #
  # repeated(square, 4)(5)
  # >>> ['repeated', 'square', '4', '5']
  #

  if not keywords:
    continue
  key = keywords[0]

  if key == 'product':
    term = keywords[2]
  elif key == 'accumulate':
    combiner = keywords[1]
    term = keywords[4]
  elif key == 'repeated':
    term = keywords[1]
  elif key == 'add_three':
    term = "increment"
    if keywords[1] == '5':
      test = "repeated(increment, 3)(5)"
      item['test'] = test

  if combiner == 'add':
    combiner_func = "def add(a, b):\n  return a + b"
  elif combiner == 'mul':
    combiner_func = "def mul(a, b):\n  return a * b"

  if term == 'identity':
    term_func = "def identity(x):\n  return x"
  elif term == 'square':
    term_func = "def square(x):\n  return x * x"
  elif term == 'increment':
    term_func = "def increment(x):\n  return x + 1"
  elif term == 'triple':
    term_func = "def triple(x):\n  return 3 * x"

  if combiner_func is not '':
    before += '\n\n'
    before += combiner_func

  if key == 'add_three' or key == 'repeated':
    before += '\n\n'
    before += "def identity(x):\n  return x"

  if term_func is not '':
    before += '\n\n'
    before += term_func

  before += '\n\n'
  before += test

  if combiner_func is not '':
    after += '\n\n'
    after += combiner_func

  if key == 'add_three' or key == 'repeated':
    after += '\n\n'
    after += "def identity(x):\n  return x"

  if term_func is not '':
    after += '\n\n'
    after += term_func

  after += '\n\n'
  after += test

  beforeTraces = pg_logger.exec_script_str(before).trace
  afterTraces = pg_logger.exec_script_str(after).trace
  item['beforeCode'] = before
  item['afterCode'] = after
  item['beforeTraces'] = beforeTraces
  item['afterTraces'] = afterTraces


with open(question_type + '_example.json', 'w') as file:
  json.dump([items[0]], file, indent = 2)

with open(path, 'w') as file:
  json.dump(items, file)
