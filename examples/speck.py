from z3 import *
import struct
import binascii

ROUNDS = 32
MASK = (1 << 64) - 1

def ror(x, r):
  return ((x >> r) | (x << (64 - r))) & MASK

def rol(x, r):
  return ((x << r) | (x >> (64 - r))) & MASK

def r(x, y, k):
  x = ror(x, 8)
  x += y
  x &= MASK
  x ^= k
  y = rol(y, 3)
  y ^= x
  return x, y, k

def encrypt(plaintext, key):
  assert len(plaintext) == 16
  assert len(key) == 16
  y = struct.unpack('>Q', plaintext[8:])[0]
  x = struct.unpack('>Q', plaintext[:8])[0]
  a = struct.unpack('>Q', key[:8])[0]
  b = struct.unpack('>Q', key[8:])[0]

  for i in range(ROUNDS):
    x, y, _ = r(x, y, b)
    a, b, _ = r(a, b, i)

  return struct.pack('>Q', x) + struct.pack('>Q', y)

key = binascii.unhexlify('0f0e0d0c0b0a09080706050403020100')
plaintext = binascii.unhexlify('6c617669757165207469206564616d20')
print binascii.hexlify(encrypt(plaintext, key))
