# Description

Another way of showing how to fix the code is using a similar example. In our study, we found that the teaching assistants often used this type of hint. For instance, in one scenario, the student did not know how to use the combine function. The TA explained to him: “ accumulate(add, 0, 5, identity) should return 0 + 1 + 2 + 3 + 4 + 5. In this case combiner is the two-argument add function,whichweuselikethis: 0 + 1 + 2 + 3 + 4 + 5 = ((((0 + 1) + 2) + 3) + 4) + 5 = add(add(add(add(add(0, 1), 2),3), 4), 5).”. In another scenario, the TA gave an example of proper way of using lambda functions.

# Background

### Piazza 33

[s] Can someone explain to me how to use combiner? I'm a bit confused on how to integrate it into my code

[i] Look at the doctests: `combiner` is the function that you're using to accumulate all these values. For instance, when `combiner` is `add` , all the terms of the sequence get added for the final product. When `combiner` is `mul` , they all get multiplied together.
**Looking at the first example more closely,**

```python
accumulate(add, 0, 5, identity)
# => 0 + 1 + 2 + 3 + 4 + 5</tt>.
```

In this case `combiner` is the two-argument `add` function, which we use like this:

```python
0 + 1 + 2 + 3 + 4 + 5
= ((((0 + 1) + 2) + 3) + 4) + 5
= add(add(add(add(add(0, 1), 2), 3), 4), 5)
```

How exactly you'll use `combiner` depends on how you're writing your `accumulate` function; it can be either recursive or iterative, for instance. [id: 33]

---

### Piazza 7

[s] How do we find the identity function for the factorial? Or are we supposed to write it ourselves? (I remember seeing it somewhere, but not too sure).

[i] For anyone reading this question, the identity function is a function that takes in some value x and just spits that value back out. For example, [id: 7]

```python
>>> identity(4)
4
>>> identity("hello!")
"hello!"
```


---

### Piazza 16

[s] I'm aware that the typical syntax is `lambda n: <expr> if <condition> else <expr>` but in Q3 I would prefer that the function just does nothing if the condition was not satisfied. Is there a method for this? Thanks!

[i] **Maybe something like this?** [id: 16]

```python
h = lambda x: 3 if (x>2) else None
```


----------

### Piazza 18

```python
def g(f, n)
  g(cube, 3)(4)
```

[s] If I have a higher order function where it takes a one argument function and an integer, say,
If I want to return or manipulate that digit (4), how do I do that? what is it assigned to?

[i] I'm a little confused what you're asking, but

```python
def g(f,n):
  def h(x):
    code
  return h
```

is probably what the g function looks like. The 4 would then get passed in as the x value. If you wanted to change the 4, you could set a variable to `g(cube,3)` and then call that variable. ex. [id: 18]

```python
hi = g(cube,3)
print(hi(4))
print(hi(5))
```


