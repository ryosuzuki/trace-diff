def accumulate(combiner, base, n, term):
  if n==0:
    return term(1)
  else:
    return accumulate(combiner, combiner(base, term(n)), n-1, term)