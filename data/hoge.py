import json
from parse_ast import make_ast

def parse(code):
  try:
    return json.dumps({ 'ast': make_ast(code) })
  except Exception as e:
    return json.dumps({ 'ast': { 'error': 'yes', 'why_error?': 'it doesn\'t compile, yo' }})


code = 'previous = combiner(previous, term(i))'
result = parse(code)

print result