# Data Hint

Data hint provides information about expected internal data values of the program during a de- bugging section. The system iteratively executes the code, line-by-line, similar to a debugging tool such as PythonTu- tor [11]. When the system detects that a value of variable is incorrect, it pauses the execution of the program, and shows the difference between the expected value and the actual value.


## Background

### Piazza 122

```python
return accumulate(combiner ,base,n if pred else 0,term)
```

[s] I had tried to use a one line conditional as described in the hint to negate every n that did not satisfy n with the following code. Am i misusing the conditional statement here, or will this approach simply not work? I have also tried using the conditional to set term to something that will negate whatever it acts on, but I received similar results.

[i] Well, from the code u r rather off a bit. **I suggest u try accumulate on Python tutor and see how it actually works**. Then u should find clue on this question. [id: 122]


---

### Piazza 107

```python
def accumulate(combiner, base, n, term):
  k = base
  for i in range (1, n + 1):
     k = combiner(k, term(i))
  return k
```

[s] For filtered_accumulate I've written this as my return line:
`return accumulate(combiner, base, n, term) if pred(term(n)) else base`
However, I noticed that it is only applying my pred check to the n term before going on with the accumulate function. Help on how to word the return line in order to prevent this would be much appreciated!

[i] **Draw the env diagram for accumulate or see it in the Python   tutor, then you should tell what went wrong in ur code**. [id: 107]


---

### Piazza 74

```python
def accumulate(combiner, base, n, term):
  while n>0:
    base=combiner(term(n),base)
    n-=1
  return base

def filtered_accumulate(combiner, base, pred, n, term):
  return accumulate(combiner if pred(n)==True else (lambda term, base: base), base, n, term)
```

[s] `filtered_accumulate` passes for true/false `preds` , but seems to not correctly "skip" even numbers for the odd pred.

[i] **Try to examine the code in PythonTutor. What happens when you call accumulate? Is the combiner that you're passing on to accumulate making a decision based on the predicate for every number in the sequence? Or is it only evaluating the predicate once?** [id: 74]
