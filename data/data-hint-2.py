def accumulate(combiner, base, n, term):
  if n==1:
    return base+term(1)
  elif n==0:
    return base+term(0)
  else:
    return combiner(term(n), accumulate(combiner, base, n-1, term))

def mul(a, b):
  return a * b

def square(x):
  return x * x

res = accumulate(mul, 2, 3, square)
print(res)