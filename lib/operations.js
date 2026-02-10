// Reusable mathematical operations used by the API

// Export each operation as a module object with a `compute` method.

function _isInteger(x) {
  return Number.isInteger(x);
}

const Fibonacci = {
  compute(n) {
    if (!_isInteger(n)) throw new TypeError('n must be an integer');
    if (n < 0) throw new RangeError('n must be non-negative');
    if (n === 0) return [];
    const seq = [0];
    if (n === 1) return seq;
    seq.push(1);
    while (seq.length < n) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
    return seq;
  },
};

const Prime = {
  _isPrime(x) {
    if (!_isInteger(x)) return false;
    if (x <= 1) return false;
    if (x <= 3) return true;
    if (x % 2 === 0) return false;
    const r = Math.floor(Math.sqrt(x));
    for (let i = 3; i <= r; i += 2) if (x % i === 0) return false;
    return true;
  },
  compute(arr) {
    if (!Array.isArray(arr)) throw new TypeError('arr must be an array');
    return arr.filter((x) => _isInteger(x) && Prime._isPrime(x));
  },
};

const MathGcd = {
  compute(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  },
};

const LCM = {
  _lcmTwo(a, b) {
    if (a === 0 || b === 0) return 0;
    return Math.abs((a / MathGcd.compute(a, b)) * b);
  },
  compute(arr) {
    if (!Array.isArray(arr) || arr.length === 0) throw new TypeError('arr must be a non-empty array');
    if (!arr.every(_isInteger)) throw new TypeError('arr must contain integers only');
    return arr.reduce((acc, x) => LCM._lcmTwo(acc, x), arr[0]);
  },
};

const HCF = {
  compute(arr) {
    if (!Array.isArray(arr) || arr.length === 0) throw new TypeError('arr must be a non-empty array');
    if (!arr.every(_isInteger)) throw new TypeError('arr must contain integers only');
    return arr.reduce((acc, x) => MathGcd.compute(acc, x), arr[0]);
  },
};

module.exports = { Fibonacci, Prime, LCM, HCF };
