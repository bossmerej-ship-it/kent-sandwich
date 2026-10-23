const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({
  document: { body: { dataset: { page: 'test' } } }
});
for (const file of ['timur.js', 'about.js', 'feedback.js']) {
  const source = fs.readFileSync(path.join(__dirname, '../js', file), 'utf8');
  vm.runInContext(source, context);
}

function validFeedback() {
  return {
    name: 'Demo Visitor', email: '', phone: '', group: '2', date: '2026-10-23',
    item: 'chicken', rating: '5', message: 'The sandwich was hot and the seating was comfortable.',
    contact: false
  };
}

test('Astana date changes at midnight rather than at UTC midnight', function () {
  assert.equal(context.getShopClock(new Date('2026-10-23T18:59:59Z')).date, '2026-10-23');
  assert.equal(context.getShopClock(new Date('2026-10-23T19:00:00Z')).date, '2026-10-24');
});

test('opening is inclusive at 09:30 and closing is exclusive at 21:30', function () {
  assert.equal(context.getOpeningStatus(new Date('2026-10-23T04:29:00Z'), '09:30', '21:30').open, false);
  assert.equal(context.getOpeningStatus(new Date('2026-10-23T04:30:00Z'), '09:30', '21:30').open, true);
  assert.equal(context.getOpeningStatus(new Date('2026-10-23T16:29:59Z'), '09:30', '21:30').open, true);
  const closed = context.getOpeningStatus(new Date('2026-10-23T16:30:00Z'), '09:30', '21:30');
  assert.equal(closed.open, false);
  assert.match(closed.text, /tomorrow/);
});

test('hours refresh aligns with the next minute instead of the page-load time', function () {
  assert.equal(context.getNextMinuteDelay(new Date('2026-10-23T04:29:59.500Z')), 500);
  assert.equal(context.getNextMinuteDelay(new Date('2026-10-23T04:30:00.000Z')), 60000);
});

test('valid feedback permits empty optional contact fields', function () {
  assert.equal(context.validateFeedback(validFeedback(), '2026-10-23').length, 0);
});

test('spaces do not satisfy name or message length', function () {
  const errors = context.validateFeedback({ ...validFeedback(), name: '   ', message: ' '.repeat(30) }, '2026-10-23');
  assert.ok(errors.some(error => error.id === 'guest-name'));
  assert.ok(errors.some(error => error.id === 'guest-message'));
});

test('future and impossible visit dates are rejected', function () {
  for (const date of ['2099-10-23', '2026-02-30', '', '2026-13-01']) {
    assert.ok(context.validateFeedback({ ...validFeedback(), date }, '2026-10-23')
      .some(error => error.id === 'visit-date'));
  }
});

test('contact permission requires at least one valid contact', function () {
  const data = { ...validFeedback(), contact: true };
  assert.ok(context.validateFeedback(data, '2026-10-23').some(error => error.id === 'contact-permission'));
  assert.equal(context.validateFeedback({ ...data, email: 'demo@example.com' }, '2026-10-23').length, 0);
  assert.equal(context.validateFeedback({ ...data, phone: '+7 700 000 00 00' }, '2026-10-23').length, 0);
});

test('bad email, phone, group size and rating receive specific errors', function () {
  const errors = context.validateFeedback({ ...validFeedback(), email: 'bad', phone: 'abc', group: '1.5', rating: '' }, '2026-10-23');
  for (const id of ['guest-email', 'guest-phone', 'group-size', 'rating-1']) {
    assert.ok(errors.some(error => error.id === id), id);
  }
});

test('review search and rating filters combine and handle unrated records', function () {
  const reviews = [
    { id: 'a', name: 'Alice', text: 'Hot chicken sandwich', category: 'Chicken', rating: 5, date: '2026-10-23' },
    { id: 'b', name: 'Bob', text: 'Comfortable room', category: 'Visit', rating: null, date: '2026-07-20' }
  ];
  assert.equal(context.filterFeedback(reviews, ' CHICKEN ', '5', 'newest').length, 1);
  assert.equal(context.filterFeedback(reviews, ' CHICKEN ', '1', 'newest').length, 0);
  assert.equal(context.filterFeedback(reviews, '', 'unrated', 'newest')[0].id, 'b');
  assert.equal(context.filterFeedback(reviews, '', '', 'oldest')[0].id, 'b');
  assert.equal(reviews[0].id, 'a', 'sorting must not mutate the original list');
});

test('gallery wraps in both directions', function () {
  assert.equal(context.getNextPhotoIndex(2, 1, 3), 0);
  assert.equal(context.getNextPhotoIndex(0, -1, 3), 2);
});

for (const [page, expectedScripts] of [
  ['about.html', ['js/timur.js', 'js/about.js']],
  ['feedback.html', ['js/timur.js', 'js/feedback.js']],
  ['colophon.html', ['js/timur.js']]
]) {
  test(page + ' loads the common script before its page script', function () {
    const html = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
    const scripts = Array.from(html.matchAll(/<script\s+src="(js\/[^"]+)"\s+defer><\/script>/g), match => match[1]);
    assert.deepEqual(scripts, expectedScripts);
  });
}
