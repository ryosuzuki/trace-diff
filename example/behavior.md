# Description

The Data hint points to a difference in the program state in a particular moment of the program execution. Sometimes, however, it is hard to understand how that difference affects the program behavior considering the entire program execution. The Behavioral hint provides information about the internal behavior of the program dur- ing its execution. For instance, in our running example, a Behavioral hint would be: “The variable total received the following values after the program execution: 0, 0, 0, 0. The expected values are: 2, 18, 72, 72. As another example of a Behavioral hint, consider a scenario where the student had forgotten to add a base case to the recursion, and the code thrown a StackOverFlowException. A Behavioral hint will show the difference in the expected number of calls to the recursive function and the actual one.


# Background

### Piazza 28

```python
counter, total, upordown = 1, 1, 1
def helper(n, counter,total, upordown):
  if (counter>n):
    return total
  elif (counter%7==0 or has_seven(counter)):
    return helper(n,counter+1,total, 1-upordown)
  elif (upordown):
    return helper(n,counter+1,total+1,upordown)
  else:
    return helper(n,counter+1,total-1,upordown)
return helper (n, counter, total, upordown)
```

[s] This is my code. Currently, the code doesn't work for the third doc test. Does anybody have an idea what the issue is?

[i] Lets say that in helper, the parameters are at `n=15, counter=7, total=7, upordown=up`. Looking at your code, you would hit the case
```python
elif (counter%7==0 or has_seven(counter)):  return helper(n, counter+1, total, 1-upordown)
```
making the new parameters `n=15, counter=8, total = 7, upordown=down`.

**Think about what the counter value is, and what the total value is. Is this correct?
Remember, ping pong looks like this:**
```
total = 1 2 3 4 5 6 [7] 6 5
count = 1 2 3 4 5 6 7 8 9
```
for the first 9 elements. [id: 28]


---


### Piazza 20

```python
$ python ok -q accumulate
(and then it just keeps going, doing nothing)
```

[s] when I attempt to test my code with the ok grader, after I press enter, nothing happens, and it just keeps going, is this a problem with my code? I would have thought I'd get a run-time error in that case though...

[s] **You may have entered the recursive variant of an "infinite loop"**; make sure that your recursive function has a solid base case (that cannot be skipped or "jumped over"). [id: 20]


---

### Piazza 8

```python
def identity(x):
  return x

def factor(n, term):
  def start(m, accum):
    if m==n:
      return accum
    else:
      m+=1
    return start(m,accum*m)
  start(1,1)

factor(5, identity)
```

[s] my code is returning none and I do not know why, can someone explain?

[i] **You are not returning anything in your factor function**. You're only calling start(1,1), not returning it. If Python does not see a return statement in a function, it automatically returns None. [id: 8]



---

### Piazza 94

```python
return accumulate(lambda x: combiner(x + base) if pred(x) else nothing in range(n), base, n, term)
```

[s] I put in this code for my question 3 but I get the error of (lambda)() takes 1 positional argument but 2 were given. what is my current code doing and what way should i be thinking of making it work instead?

[i] your lambda function replaces combiner, and **combiner is a function that takes in two parameters. Hence you got the error.** Try accumulate in python tutor to understand how/what/when combiner /term/base/n are used in the accumulate function, then it should help you know where to modify it to fit it for the filtered version. [id: 94]


