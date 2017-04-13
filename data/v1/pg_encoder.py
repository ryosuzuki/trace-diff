# Online Python Tutor
# https://github.com/pgbovine/OnlinePythonTutor/
#
# Copyright (C) 2010-2012 Philip J. Guo (philip@pgbovine.net)
#
# Permission is hereby granted, free of charge, to any person obtaining a
# copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be included
# in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
# OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
# IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
# CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
# TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


# Given an arbitrary piece of Python data, encode it in such a manner
# that it can be later encoded into JSON.
#   http://json.org/
#
# We use this function to encode run-time traces of data structures
# to send to the front-end.
#
# Format:
#   * None, int, long, float, str, bool - unchanged
#     (json.dumps encodes these fine verbatim)
#   * list     - ['LIST', unique_id, elt1, elt2, elt3, ..., eltN]
#   * tuple    - ['TUPLE', unique_id, elt1, elt2, elt3, ..., eltN]
#   * set      - ['SET', unique_id, elt1, elt2, elt3, ..., eltN]
#   * dict     - ['DICT', unique_id, [key1, value1], [key2, value2], ..., [keyN, valueN]]
#   * instance - ['INSTANCE', class name, unique_id, [attr1, value1], [attr2, value2], ..., [attrN, valueN]]
#   * class    - ['CLASS', class name, unique_id, [list of superclass names], [attr1, value1], [attr2, value2], ..., [attrN, valueN]]
#   * circular reference - ['CIRCULAR_REF', unique_id]
#   * other    - [<type name>, unique_id, string representation of object]
#
# the unique_id is derived from id(), which allows us to explicitly
# capture aliasing of compound values

# Key: real ID from id()
# Value: a small integer for greater readability, set by cur_small_id
real_to_small_IDs = {}
cur_small_id = 1

import re, types
import sys
import inspect
typeRE = re.compile("<type '(.*)'>")
classRE = re.compile("<class '(.*)'>")

is_python3 = (sys.version_info[0] == 3)
if is_python3:
  # avoid name errors (GROSS!)
  long = int
  unicode = str



def is_class(dat):
  """Return whether dat is a class."""
  if is_python3:
    return isinstance(dat, type)
  else:
    return type(dat) in (types.ClassType, types.TypeType)

def is_instance(dat):
  """Return whether dat is an instance of a class."""
  if is_python3:
    return type(dat) not in PRIMITIVE_TYPES and \
           isinstance(type(dat), type) and \
           not isinstance(dat, type)
  else:
    # ugh, classRE match is a bit of a hack :(
    return type(dat) == types.InstanceType or classRE.match(str(type(dat)))

def get_name(obj):
  """Return the name of an object."""
  return obj.__name__ if hasattr(obj, '__name__') else get_name(type(obj))

PRIMITIVE_TYPES = (int, long, float, str, unicode, bool, type(None))


def encode_class_or_instance(dat, new_obj):
  """Encode dat as a class or instance."""
  if is_instance(dat):
    if hasattr(dat, '__class__'):
      # common case ...
      class_name = get_name(dat.__class__)
    else:
      # super special case for something like
      # "from datetime import datetime_CAPI" in Python 3.2,
      # which is some weird 'PyCapsule' type ...
      # http://docs.python.org/release/3.1.5/c-api/capsule.html
      class_name = get_name(type(dat))

    if hasattr(dat, '__str__') and \
       (not dat.__class__.__str__ is object.__str__): # make sure it's not the lame default __str__
      # N.B.: when objects are being constructed, this call
      # might fail since not all fields have yet been populated
      try:
        pprint_str = str(dat)
      except:
        pprint_str = '<incomplete object>'

      new_obj.extend(['INSTANCE_PPRINT', class_name, pprint_str])
      return # bail early
    else:
      new_obj.extend(['INSTANCE', class_name])
      # don't traverse inside modules, or else risk EXPLODING the visualization
      if class_name == 'module':
        return
  else:
    superclass_names = [e.__name__ for e in dat.__bases__ if e is not object]
    new_obj.extend(['CLASS', get_name(dat), superclass_names])

  # traverse inside of its __dict__ to grab attributes
  # (filter out useless-seeming ones, based on anecdotal observation):
  hidden = ('__doc__', '__module__', '__return__', '__dict__',
      '__locals__', '__weakref__', '__qualname__')
  if hasattr(dat, '__dict__'):
    user_attrs = sorted([e for e in dat.__dict__ if e not in hidden])
  else:
    user_attrs = []

  for attr in user_attrs:
    new_obj.append([encode(attr, None), encode(dat.__dict__[attr], None)])



def encode(dat, ignore_id=False):
  def encode_helper(dat, compound_obj_ids):
    # primitive type
    if dat is None or \
       type(dat) in (int, long, float, str, bool):
      return dat
    # compound type
    else:
      my_id = id(dat)

      global cur_small_id
      if my_id not in real_to_small_IDs:
        if ignore_id:
          real_to_small_IDs[my_id] = 99999
        else:
          real_to_small_IDs[my_id] = cur_small_id
        cur_small_id += 1

      if my_id in compound_obj_ids:
        return ['CIRCULAR_REF', real_to_small_IDs[my_id]]

      new_compound_obj_ids = compound_obj_ids.union([my_id])

      new_obj = []
      typ = type(dat)

      my_small_id = real_to_small_IDs[my_id]

      ret = ['REF', my_small_id]

      if typ == list:
        ret = ['LIST', my_small_id]
        for e in dat: ret.append(encode_helper(e, new_compound_obj_ids))
      elif typ == tuple:
        ret = ['TUPLE', my_small_id]
        for e in dat: ret.append(encode_helper(e, new_compound_obj_ids))
      elif typ == set:
        ret = ['SET', my_small_id]
        for e in dat: ret.append(encode_helper(e, new_compound_obj_ids))
      elif typ == dict:
        ret = ['DICT', my_small_id]
        for (k,v) in dat.iteritems():
          # don't display some built-in locals ...
          if k not in ('__module__', '__return__'):
            ret.append([encode_helper(k, new_compound_obj_ids), encode_helper(v, new_compound_obj_ids)])
      elif typ in (types.FunctionType, types.MethodType):
        if is_python3:
          argspec = inspect.getfullargspec(dat)
        else:
          argspec = inspect.getargspec(dat)

        printed_args = [e for e in argspec.args]
        if argspec.varargs:
          printed_args.append('*' + argspec.varargs)

        if is_python3:
          if argspec.varkw:
            printed_args.append('**' + argspec.varkw)
          if argspec.kwonlyargs:
            printed_args.extend(argspec.kwonlyargs)
        else:
          if argspec.keywords:
            printed_args.append('**' + argspec.keywords)

        func_name = get_name(dat)

        pretty_name = func_name

        # sometimes might fail for, say, <genexpr>, so just ignore
        # failures for now ...
        try:
          pretty_name += '(' + ', '.join(printed_args) + ')'
        except TypeError:
          pass

        # put a line number suffix on lambdas to more uniquely identify
        # them, since they don't have names
        if func_name == '<lambda>':
            cod = (dat.__code__ if is_python3 else dat.func_code) # ugh!
            lst = self.line_to_lambda_code[cod.co_firstlineno]
            if cod not in lst:
                lst.append(cod)
            pretty_name += create_lambda_line_number(cod,
                                                     self.line_to_lambda_code)

        encoded_val = ['FUNCTION', pretty_name, None]
        # if get_parent:
        #   enclosing_frame_id = get_parent(dat)
        #   encoded_val[2] = enclosing_frame_id
        new_obj.extend(encoded_val)
      elif typ is types.BuiltinFunctionType:
        pretty_name = get_name(dat) + '(...)'
        new_obj.extend(['FUNCTION', pretty_name, None])
      elif is_class(dat) or is_instance(dat):
        encode_class_or_instance(dat, new_obj)
      elif typ is types.ModuleType:
        new_obj.extend(['module', dat.__name__])
      elif typ in PRIMITIVE_TYPES:
        assert self.render_heap_primitives
        new_obj.extend(['HEAP_PRIMITIVE', type(dat).__name__, encode_primitive(dat)])
      else:
        typeStr = str(typ)
        m = typeRE.match(typeStr)

        if not m:
          m = classRE.match(typeStr)

        assert m, typ

        if is_python3:
          encoded_dat = str(dat)
        else:
          # ugh, for bytearray() in Python 2, str() returns
          # non-JSON-serializable characters, so need to decode:
          encoded_dat = str(dat).decode('utf-8', 'replace')
        new_obj.extend([m.group(1), encoded_dat])
      return ret

  return encode_helper(dat, set())