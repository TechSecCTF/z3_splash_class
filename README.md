# Breaking Crypto with Z3   

This repo holds materials for our Splash 2017 class on Z3.

## Getting started with Z3

Z3 is a powerful theorem prover developed by Microsoft Research. Essentially, you can give Z3 a bunch of equations or constraints expressed in terms of variables, and it will do its best to find a solution that satisfies the constraints. Z3 is an example of an [*SMT Solver*](https://en.wikipedia.org/wiki/Satisfiability_modulo_theories). There's a rich theory underlying how to write good SMT solvers, but we're not concerned with any of that in this class. We'll just be using Z3 as a tool in order to break some cryptography.

### Installing

Z3 should already be installed on the computer you're using, but if you want to install it on another computer, you can either follow the instructions [here](https://github.com/Z3Prover/z3) (use the `--python` flag when running `mk_make.py` to install the python bindings), or you can clone this git repository and run `install.sh`.

### Basics

This image was floating around facebook some time ago, with the caption "ONLY FOR GENiUS". Let's find the solution using Z3.

![](assets/shapes.png)

Check out `examples/only_for_genius.py`, reproduced below:

```python
from z3 import *

circle, square, triangle = Ints('circle square triangle')
s = Solver()
s.add(circle + circle == 10)
s.add(circle * square + square == 12)
s.add(circle * square - triangle * circle == circle)
print s.check()
print s.model()
```

Let's go through it line by line:
* All of our Z3 programs will start with the line `from z3 import *`. This imports all the Z3 python bindings.
* Next, we declare three integer variables, `circle`, `square` and `triangle`.
* Then, we instantiate a new solver `s` and we add our three constraints.
* Finally, we call the function `s.check()`. In any Z3 program, this function is doing all of the heavy lifting. It checks if a solution exists given our constraints and returns `sat` if yes, and `unsat` if no.
* Once we've verified that there is at least one solution, we can get Z3 to print it for us by asking it for its model.

When we run the program we see:

```
sat
[triangle = 1, square = 2, circle = 5]
```

## Data Types

Z3 includes built-in support for Ints, Reals, Booleans, and BitVectors and several common operations on them.

## Let's roll!

Let's get warmed up with a relatively easy example — Sudoku

Sudoku is just a system of equations, and it's simple for Z3 to solve.

![](https://gwb.blob.core.windows.net/blackrabbitcoder/Windows-Live-Writer/Little-PuzzlersValidate-a-Sudoku-Board_92D9/250px-Sudoku-by-L2G-20050714_svg_thumb.png)

We can do this solely with the Z3 `Int` and `Distinct` types, plus some basic operators `And` and `<=`.  

But what if you want to find more than one solution? Z3 doesn't have a clean way to do this. You have to encode more constraints into your solver that prevent it from using a previous model.

For the sudoku example, this would look like:

```python
while s.check() == sat:
    m = s.model()

    solved = [['.' for i in range(9)] for j in range(9)]
    for i in range(9):
        for j in range(9):
            a = m.evaluate(cells[i][j])
            solved[i][j] = a
    s.add(Or(add_constraints(m))) # Add an Or for each square, preventing this solution from being used again
```
