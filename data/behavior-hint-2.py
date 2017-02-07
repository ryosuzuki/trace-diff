def accumulate(combiner, base, n, term):
  if term(n) == base:
    return term(n)
  else:
    return combiner(term(n), accumulate(combiner, base, n-1, term))