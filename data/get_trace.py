"""
TODO:
temporarily, switching the condition based on the question_number, but it should be automatically identified and add proper functions.
Q1: accumulate
test = "accumulate(add, 11, 0, identity)"
- combiner = add
- term = identity
Q2: g
test = "g(3)"
- no additional functions
Q3: product
test = "product(3, identity)"
- term = identity
Q4: repeated
test = "repeated(square, 0)(5)"
- term = square
"""

import sys
import json
import pg_logger

path = sys.argv[1]

items = []
with open(path) as file:
  items = json.load(file)

for item in items:
  before = item['before']
  after = item['after']
  before_traces = pg_logger.exec_script_str(before).trace
  after_traces = pg_logger.exec_script_str(after).trace
  item['before_traces'] = before_traces
  item['after_traces'] = after_traces

with open(path, 'w') as file:
  json.dump(items, file, indent = 2)
  # json.dump(items, file)


  # combiner = None
  # term = None
  # keywords = re.findall(r"[\w]+", test)
  # if int(question_number) is 1:
  #   combiner = keywords[1]
  #   term = keywords[4]
  # elif int(question_number) is 3:
  #   term = keywords[2]
  # elif int(question_number) is 4:
  #   term = keywords[1]

  # print('question_number: ' + str(question_number))
  # print('keywords: ' + str(keywords))
  # print('combiner: ' + str(combiner))
  # print('term: ' + str(term))
  # combiner_func = ''
  # term_func = ''
  # if combiner == 'add':
  #   combiner_func = "\n\ndef add(a, b):\n  return a + b\n"
  # elif combiner == 'mul':
  #   combiner_func = "\n\ndef mul(a, b):\n  return a * b\n"

  # if term == 'identity':
  #   term_func = "\n\ndef identity(x):\n  return x\n"
  # elif term == 'square':
  #   term_func = "\n\ndef square(x):\n  return x * x\n"
  # elif term == 'increment':
  #   term_func = "\n\ndef increment(x):\n  return x + 1\n"
  # elif term == 'triple':
  #   term_func = "\n\ndef triple(x):\n  return 3 * x\n"

  # before  = before_code
  # before += combiner_func
  # before += term_func
  # before += '\n'
  # before += test

  # after  = after_code
  # after += combiner_func
  # after += term_func
  # after += '\n'
  # after += test

  # print(before)

  # return jsonify({
  #   'before_code': before,
  #   'before_traces': before_traces,
  #   'after_code': after,
  #   'after_traces': after_traces
  # })

