# Transformation Hint

The Transformation hint abstracts the synthesized fix and provides an information about what change the student should do. For example: “you should replace the initialization of the variable total” or “you should add an If statement”. The abstraction level can be configured by the teaching staff. This type of hint is already used by current program synthesis techniques.

## Background

### Piazza 38

```python
def accumulate(combiner, base, n, term):
  if n ==0:
    return base
  else:
    combiner(term(n),accumulate(combiner,base,n-1,term))
```

[s] After execution python returns `TypeError: unsupported  operand types for +: 'int' and 'NoneType'`

[i] **U missed a return statement on the else branch** [id:38]

