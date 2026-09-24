import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the production evaluator over every pair, including row boundaries.
const app = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const start = app.indexOf('  function reviewGradeFamilies()');
const end = app.indexOf('  function renderGradeOptions()', start);
assert(start >= 0 && end > start);
const context = vm.createContext({ expertTraining: () => true, tierColors: {}, tierModifierOrder: ['+', '', '-'] });
vm.runInContext(app.slice(start, end), context);
const rows = [['5','4.5','4'], ['3.5','3'], ['2.5','2'], ['1.5','1','0.5','0']];
for (const answer of rows.flat()) {
  for (const guess of rows.flat()) {
    const expected = guess === answer ? 'exact' : rows.some(row => row.includes(guess) && row.includes(answer)) && Math.abs(Number(guess) - Number(answer)) === 0.5 ? 'close' : 'miss';
    assert.equal(context.trainerAnswerOutcome(guess, answer), expected, `${guess} against ${answer}`);
  }
  assert.equal(context.trainerAnswerOutcome(null, answer), 'miss');
}
context.expertTraining = () => false;
for (const [guess, answer, expected] of [['B+','B','close'], ['B','B-','close'], ['B+','B-','miss'], ['A-','B+','miss'], ['S','A+','miss'], ['F','D-','miss'], ['C','C','exact'], [null,'C','miss']]) {
  assert.equal(context.trainerAnswerOutcome(guess, answer), expected);
}
console.log('Verified all 121 expert grade pairs, manual reveals, and Hobbit tier tolerance.');
