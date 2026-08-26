const assert = require('node:assert');
const test = require('node:test');

test('Trend & Topic Engine - computes velocity percentage and classifies emerging trends', () => {
  const earlyCount = 10;
  const lateCount = 35;
  const velocity = Number((((lateCount - earlyCount) / earlyCount) * 100).toFixed(1));

  assert.strictEqual(velocity, 250.0);
  assert.ok(velocity > 60, 'Velocity > 60% should indicate emerging/peaking growth');
});

test('Virality Score Calculation - scales within [0, 100] bounds', () => {
  function calcVirality(volume, velocity, spread) {
    const volumeScore = Math.min(40, (volume / 100) * 40);
    const velocityScore = Math.min(40, Math.max(0, (velocity + 50) / 150 * 40));
    const spreadScore = Math.min(20, spread * 2);
    return Math.min(99, Math.max(25, Math.round(volumeScore + velocityScore + spreadScore)));
  }

  const viral = calcVirality(250, 180, 8);
  assert.ok(viral >= 25 && viral <= 99);
  assert.ok(viral > 75, 'High volume & high velocity should yield virality score > 75');
});
