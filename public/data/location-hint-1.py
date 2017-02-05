def accumulate(combiner, base, n, term):
  if n == 0:
    return base
  if n == 1:
    return combiner(base, term(1))
  else:
    return combiner(term(n), accumulate(combiner, base, n-1, term))
