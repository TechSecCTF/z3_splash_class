import math
import struct
import random
import binascii
from z3 import *

MASK = 0xFFFFFFFFFFFFFFFF

def xshiro128p(state0, state1):
  s0 = state0 & MASK
  s1 = state1 & MASK
  r = (s0 + s1) & MASK
  s1 = (s0 ^ s1) & MASK
  state0 = ((((s0 << 55) | s0 >> (64 - 55)) & MASK) ^ s1 ^ (s1 << 14)) & MASK
  state1 = ((s1 << 36) | s1 >> (64 - 36)) & MASK

  return state0, state1, r

# Symbolic execution of xs128p
# Add the constraint to the solver
def z3_xshiro128p(slvr, sym_state0, sym_state1, result):
  pass

def encrypt(seed, message):
  s0 = struct.unpack('>Q', seed[:8])[0]
  s1 = struct.unpack('>Q', seed[8:])[0]
  ciphertext = ''

  assert len(message) % 8 == 0
  for i in range(len(message) / 8):
    s0, s1, r = xshiro128p(s0, s1)
    m = struct.unpack('>Q', message[i*8:(i+1)*8])[0]
    ciphertext += struct.pack('>Q', m ^ r)
  return ciphertext

def decrypt(seed, message):
  return encrypt(seed, message)

def break_cipher():
  crib = "Dear friends, Today's password:"
  ciphertext = binascii.unhexlify(
    '755eace4bee16d06795ac3b2e2e43b9c'
    'a1d9a7aacec6fd79f866d741ef64ecfc'
    'e4d1037bc4b3ac688075ea2dd062ff9f'
  )

  # Expected outputs from RNG based on crib
  pblocks = [struct.unpack('>Q', crib[i*8:(i+1)*8])[0] for i in range(3)]
  cblocks = [struct.unpack('>Q', ciphertext[i*8:(i+1)*8])[0] for i in range(3)]
  outputs = [p ^ c for (p, c) in zip(pblocks, cblocks)]

  # setup symbolic state for xorshiro128+
  ostate0, ostate1 = BitVecs('ostate0 ostate1', 64)
  sym_state0 = ostate0
  sym_state1 = ostate1
  slvr = Solver()
  conditions = []

  # run symbolic xorshiro128+ algorithm for three iterations
  # using the recovered numbers as constraints
  for r in outputs:
    sym_state0, sym_state1 = z3_xshiro128p(slvr, sym_state0, sym_state1, r)

  if slvr.check() == sat:
    print 'SAT'

    # get a solved state
    m = slvr.model()
    state0 = m[ostate0].as_long()
    state1 = m[ostate1].as_long()

    seed = struct.pack('>Q', state0) + struct.pack('>Q', state1)
    print decrypt(seed, ciphertext)

  else:
      print 'UNSAT'

if __name__ == '__main__':
  break_cipher()
