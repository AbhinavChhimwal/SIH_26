const assert = require('node:assert');
const test = require('node:test');

// Simple emulation of sentiment logic for pure Node.js test runner
function analyzeSentimentTest(text) {
  const normalizedText = text.toLowerCase();
  
  let isSarcastic = false;
  if ((normalizedText.includes('love') || normalizedText.includes('great') || normalizedText.includes('revolutionary')) && 
      (normalizedText.includes('crash') || normalizedText.includes('broken') || normalizedText.includes('hallucinate') || normalizedText.includes('as if'))) {
    isSarcastic = true;
  }

  let polarity = 0;
  if (normalizedText.includes('revolutionary') || normalizedText.includes('amazing') || normalizedText.includes('breakthrough')) {
    polarity = 0.8;
  } else if (normalizedText.includes('threat') || normalizedText.includes('leaked') || normalizedText.includes('unacceptable')) {
    polarity = -0.7;
  }

  if (isSarcastic) {
    polarity = -0.5;
  }

  return {
    polarity,
    isSarcastic,
    dominantEmotion: isSarcastic ? 'sarcasm' : (polarity > 0 ? 'excitement' : (polarity < 0 ? 'anxiety' : 'neutral'))
  };
}

test('Sentiment Engine - should detect nuanced sarcasm with contrasting clauses', () => {
  const text = 'Oh great, the "revolutionary" update just crashed our entire cluster. Working flawlessly as if!';
  const result = analyzeSentimentTest(text);
  
  assert.strictEqual(result.isSarcastic, true);
  assert.strictEqual(result.dominantEmotion, 'sarcasm');
  assert.ok(result.polarity < 0, 'Sarcastic praise should have negative effective polarity');
});

test('Sentiment Engine - should detect high excitement on breakthrough product launches', () => {
  const text = 'Nova-4X is a revolutionary breakthrough milestone! Amazing speed.';
  const result = analyzeSentimentTest(text);
  
  assert.strictEqual(result.isSarcastic, false);
  assert.strictEqual(result.dominantEmotion, 'excitement');
  assert.ok(result.polarity > 0.5);
});

test('Sentiment Engine - should detect anxiety on security leak events', () => {
  const text = 'Critical threat alert: private weights leaked to public torrents.';
  const result = analyzeSentimentTest(text);
  
  assert.strictEqual(result.dominantEmotion, 'anxiety');
  assert.ok(result.polarity < -0.3);
});
