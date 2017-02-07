def accumulate(combiner, base, n, term):
  x = 1
  while n > 1:
    x = combiner(x, term(n))
    n -= 1
  return combiner(x, base)