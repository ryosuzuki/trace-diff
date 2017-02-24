import json

from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter
from pygments.formatter import Formatter
from pygments.token import STANDARD_TYPES


class JSONFormatter(Formatter):
  def format(self, tokensource, outfile):
    tokensource = [{STANDARD_TYPES[k]: v} for k, v in tokensource]
    json.dump(tokensource, outfile)

with open('example/behavior-hint-1.py') as file:
  code = file.read()

code = '    previous = term(base)'
# output = highlight(code, PythonLexer(), HtmlFormatter())
output = highlight(code, PythonLexer(), JSONFormatter())


print output

# [{"": "    "}, {"n": "previous"}, {"": " "}, {"o": "="}, {"": " "}, {"n": "term"}, {"p": "("}, {"n": "base"}, {"p": ")"}, {"": "\n"}]

# [{"k": "def"}, {"": " "}, {"nf": "accumulate"}, {"p": "("}, {"n": "combiner"}, {"p": ","}, {"": " "}, {"n": "base"}, {"p": ","}, {"": " "}, {"n": "n"}, {"p": ","}, {"": " "}, {"n": "term"}, {"p": ")"}, {"p": ":"}, {"": "\n"}, {"": "  "}, {"n": "i"}, {"": " "}, {"o": "="}, {"": " "}, {"mi": "1"}, {"": "\n"}, {"": "  "}, {"n": "total"}, {"": " "}, {"o": "="}, {"": " "}, {"mi": "1"}, {"": "\n"}, {"": "  "}, {"k": "while"}, {"": " "}, {"n": "i"}, {"": " "}, {"o": "<"}, {"o": "="}, {"": " "}, {"n": "n"}, {"p": ":"}, {"": "\n"}, {"": "    "}, {"n": "total"}, {"": " "}, {"o": "="}, {"": " "}, {"n": "combiner"}, {"p": "("}, {"n": "total"}, {"p": ","}, {"": " "}, {"n": "term"}, {"p": "("}, {"n": "i"}, {"p": ")"}, {"p": ")"}, {"": "\n"}, {"": "    "}, {"n": "i"}, {"": " "}, {"o": "="}, {"": " "}, {"n": "i"}, {"o": "+"}, {"mi": "1"}, {"": "\n"}, {"": "  "}, {"k": "return"}, {"": " "}, {"n": "total"}, {"": "\n"}]