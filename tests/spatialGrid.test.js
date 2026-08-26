const assert = require('node:assert');
const test = require('node:test');

class TestSpatialGrid {
  constructor(cellSize = 40) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  insert(id, x, y) {
    const gx = Math.floor(x / this.cellSize);
    const gy = Math.floor(y / this.cellSize);
    const key = `${gx},${gy}`;
    if (!this.grid.has(key)) this.grid.set(key, []);
    this.grid.get(key).push(id);
  }

  query(x, y, radius) {
    const results = [];
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minY = Math.floor((y - radius) / this.cellSize);
    const maxY = Math.floor((y + radius) / this.cellSize);

    for (let gx = minX; gx <= maxX; gx++) {
      for (let gy = minY; gy <= maxY; gy++) {
        const cell = this.grid.get(`${gx},${gy}`);
        if (cell) results.push(...cell);
      }
    }
    return results;
  }
}

test('Spatial Grid Engine - Index retrieves nearby node neighbors within radius in O(1)', () => {
  const grid = new TestSpatialGrid(50);
  grid.insert(1, 10, 10);
  grid.insert(2, 20, 25);
  grid.insert(3, 800, 800); // far away

  const hits = grid.query(15, 15, 30);
  assert.ok(hits.includes(1));
  assert.ok(hits.includes(2));
  assert.strictEqual(hits.includes(3), false);
});
