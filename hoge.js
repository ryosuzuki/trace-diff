a = `def accumulate(combiner, base, n, term):
    previous = term(base)
    for i in range(1, n+1):
        previous = combiner(previous, term(i))
    return previous`

b = `def accumulate(combiner, base, n, term):
    previous = base
    for i in range(1, n+1):
        previous = combiner(previous, term(i))
    return previous`