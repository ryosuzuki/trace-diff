
# Generating dataset

Run the following command
```
node trace.js accumulate
```

It generates `accumulate.json` and `accumulate_example.json` from `accumulate_all_attempts.json`
`accumulate_example.json` is a subset of `accumulate.json`.


Other commands:
```
node trace.js g
node trace.js product
node trace.js repeated
```


# Example Problems

## Question: Accumulate
Show that both summation and product are instances of a more general function, called accumulate, with the following signature:

```python
def accumulate(combiner, base, n, term):
  """Return the result of combining the first N terms in a sequence.  The
  terms to be combined are TERM(1), TERM(2), ..., TERM(N).  COMBINER is a
  two-argument function.  Treating COMBINER as if it were a binary operator,
  the return value is
      BASE COMBINER TERM(1) COMBINER TERM(2) ... COMBINER TERM(N)

  >>> accumulate(add, 0, 5, identity)  # 0 + 1 + 2 + 3 + 4 + 5
  15
  >>> accumulate(add, 11, 5, identity) # 11 + 1 + 2 + 3 + 4 + 5
  26
  >>> accumulate(add, 11, 0, identity) # 11
  11
  >>> accumulate(add, 11, 3, square)   # 11 + 1^2 + 2^2 + 3^2
  25
  >>> accumulate(mul, 2, 3, square)   # 2 * 1^2 * 2^2 * 3^2
  72
  """
  "*** YOUR CODE HERE ***"
```

accumulate(combiner, base, n, term) takes the following arguments:

- term and n: the same arguments as in summation and product
- combiner: a two-argument function that specifies how the current term combined with the previously accumulated terms.
- base: value that specifies what value to use to start the accumulation.

For example, accumulate(add, 11, 3, square) is
```python
11 + square(1) + square(2) + square(3)
```



## Question: G function
A mathematical function G on positive integers is defined by two cases:
```python
G(n) = n,                                       if n <= 3
G(n) = G(n - 1) + 2 * G(n - 2) + 3 * G(n - 3),  if n > 3
```
Write a recursive function g that computes G(n). Then, write an iterative function g_iter that also computes G(n):

```python
def g(n):
  """Return the value of G(n), computed recursively.

  >>> g(1)
  1
  >>> g(2)
  2
  >>> g(3)
  3
  >>> g(4)
  10
  >>> g(5)
  22
  >>> from construct_check import check
  >>> check(HW_SOURCE_FILE, 'g', ['While', 'For'])
  True
  """
  "*** YOUR CODE HERE ***"
```



## Question: Product
The summation(term, n) function from lecture adds up `term(1) + ... + term(n)` Write a similar product(n, term) function that returns `term(1) * ... * term(n)`. Show how to define the factorial function in terms of product. Hint: try using the identity function for factorial.

```python
def product(n, term):
  """Return the product of the first n terms in a sequence.

  n    -- a positive integer
  term -- a function that takes one argument

  >>> product(3, identity) # 1 * 2 * 3
  6
  >>> product(5, identity) # 1 * 2 * 3 * 4 * 5
  120
  >>> product(3, square)   # 1^2 * 2^2 * 3^2
  36
  >>> product(5, square)   # 1^2 * 2^2 * 3^2 * 4^2 * 5^2
  14400
  """
  "*** YOUR CODE HERE ***"
```



## Question: Repeated
Implement repeated(f, n):

- f is a one-argument function that takes a number and returns another number.
- n is a non-negative integer

repeated returns another function that, when given an argument x, will compute f(f(....(f(x))....)) (apply f a total n times). For example, repeated(square, 3)(42) evaluates to square(square(square(42))). Yes, it makes sense to apply the function zero times! See if you can figure out a reasonable function to return for that case.

```python
def repeated(f, n):
  """Return the function that computes the nth application of f.

  >>> add_three = repeated(increment, 3)
  >>> add_three(5)
  8
  >>> repeated(triple, 5)(1) # 3 * 3 * 3 * 3 * 3 * 1
  243
  >>> repeated(square, 2)(5) # square(square(5))
  625
  >>> repeated(square, 4)(5) # square(square(square(square(5))))
  152587890625
  >>> repeated(square, 0)(5)
  5
  """
  "*** YOUR CODE HERE ***"

Hint: You may find it convenient to use compose1 from the textbook:

def compose1(f, g):
    """Return a function h, such that h(x) = f(g(x))."""
    def h(x):
        return f(g(x))
    return h
```
