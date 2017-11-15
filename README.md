# Breaking Crypto with Z3   

This repo holds materials for our Splash 2017 class on Z3

## Getting started with Z3

### Installing

Download Z3 from [Github](https://github.com/Z3Prover/z3) and run the build script as instructed, with the `--python` option to install Python bindings. 

### Basics


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
