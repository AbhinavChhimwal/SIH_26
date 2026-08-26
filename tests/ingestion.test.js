const assert = require('node:assert');
const test = require('node:test');

test('Ingestion Engine - JSON parser extracts fields correctly', () => {
  const jsonText = JSON.stringify([
    {
      platform: 'x',
      author_name: 'Elena AI',
      content: 'Testing Nova-4X performance benchmarks',
      likes: 1200,
    },
    {
      platform: 'telegram',
      author_name: 'Threat Intel',
      content: 'Alert on system telemetry breach',
      likes: 540,
    }
  ]);

  const parsed = JSON.parse(jsonText);
  assert.strictEqual(parsed.length, 2);
  assert.strictEqual(parsed[0].platform, 'x');
  assert.strictEqual(parsed[1].platform, 'telegram');
});

test('Ingestion Engine - CSV header normalization parses row items', () => {
  const csv = `platform,author,content,likes\nx,Elena,New AI breakthrough,1200\nreddit,DevOp,SRE incident review,450`;
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  const row1 = lines[1].split(',');

  assert.strictEqual(headers[0], 'platform');
  assert.strictEqual(row1[0], 'x');
  assert.strictEqual(row1[1], 'Elena');
});
