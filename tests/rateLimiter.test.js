const assert = require('node:assert');
const test = require('node:test');

class TestTokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.currentTokens = capacity;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
    this.circuitState = 'CLOSED';
    this.failures = 0;
  }

  consume(tokens) {
    if (this.circuitState === 'OPEN') {
      return { allowed: false, reason: 'CIRCUIT_OPEN' };
    }
    if (this.currentTokens >= tokens) {
      this.currentTokens -= tokens;
      return { allowed: true, remaining: this.currentTokens };
    } else {
      this.failures++;
      if (this.failures >= 3) {
        this.circuitState = 'OPEN';
      }
      return { allowed: false, reason: 'CAPACITY_EXHAUSTED' };
    }
  }

  refill() {
    this.currentTokens = this.capacity;
    this.circuitState = 'CLOSED';
    this.failures = 0;
  }
}

test('Rate Limiter Engine - Token Bucket consumes tokens and decrements remaining balance', () => {
  const bucket = new TestTokenBucket(10, 2);
  const res1 = bucket.consume(3);
  assert.strictEqual(res1.allowed, true);
  assert.strictEqual(res1.remaining, 7);

  const res2 = bucket.consume(5);
  assert.strictEqual(res2.allowed, true);
  assert.strictEqual(res2.remaining, 2);
});

test('Rate Limiter Engine - Trips circuit breaker to OPEN when consecutive rate limits exceeded', () => {
  const bucket = new TestTokenBucket(5, 1);
  bucket.consume(5); // 0 remaining

  bucket.consume(1); // fail 1
  bucket.consume(1); // fail 2
  const fail3 = bucket.consume(1); // fail 3 -> circuit opens

  assert.strictEqual(fail3.allowed, false);
  assert.strictEqual(bucket.circuitState, 'OPEN');

  const blockedRes = bucket.consume(1);
  assert.strictEqual(blockedRes.reason, 'CIRCUIT_OPEN');
});
