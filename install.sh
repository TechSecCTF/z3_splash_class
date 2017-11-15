#!/bin/bash
git clone git@github.com:Z3Prover/z3.git
cd z3
python scripts/mk_make.py --python
cd build
make -j8
sudo make install
