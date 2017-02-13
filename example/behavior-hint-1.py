def accumulate(combiner, base, n, term):
  i = 1
  total = 1
  while i <= n:
    total = combiner(total, term(i))
    i = i+1
  return total