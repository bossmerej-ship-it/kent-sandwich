const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({
  jQuery: function () { /* Pure helpers are tested without mounting the page. */ },
  document: { addEventListener: function () {} }
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

test('valid feedback permits empty optional contact fields and visit date', function () {
  assert.equal(context.validateFeedback(validFeedback(), '2026-10-23').length, 0);
  assert.equal(context.validateFeedback({ ...validFeedback(), date: '' }, '2026-10-23').length, 0);
});

test('spaces do not satisfy name or message length', function () {
  const errors = context.validateFeedback({ ...validFeedback(), name: '   ', message: ' '.repeat(30) }, '2026-10-23');
  assert.ok(errors.some(error => error.id === 'guest-name'));
  assert.ok(errors.some(error => error.id === 'guest-message'));
});

test('future and impossible visit dates are rejected', function () {
  for (const date of ['2099-10-23', '2026-02-30', '2026-13-01']) {
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

test('sandwich review filter combines with text and rating without mutating the source', function () {
  const reviews = [
    { id: 'a', name: 'Alice', text: 'Fresh chicken', category: 'Chicken', item: 'chicken', rating: 5, date: '2026-11-08' },
    { id: 'b', name: 'Bob', text: 'Fresh cheese', category: 'Cheese', item: 'cheese', rating: 4, date: '2026-11-07' },
    { id: 'c', name: 'Source', text: 'Nice room', category: 'Visit', rating: null, date: '2026-07-20' }
  ];
  assert.equal(context.filterFeedback(reviews, ' fresh ', '', 'newest', 'cheese')[0].id, 'b');
  assert.equal(context.filterFeedback(reviews, '', '5', 'newest', 'cheese').length, 0);
  assert.equal(context.filterFeedback(reviews, '', '', 'newest', 'unspecified')[0].id, 'c');
  assert.equal(reviews.length, 3);
  assert.equal(reviews[0].id, 'a');
});

test('rating order keeps unrated reviews last in both directions', function () {
  const reviews = [
    { name: 'Source', text: '', category: '', rating: null, date: '2026-11-08' },
    { name: 'Low', text: '', category: '', rating: 1, date: '2026-11-07' },
    { name: 'High', text: '', category: '', rating: 5, date: '2026-11-06' }
  ];
  assert.equal(context.filterFeedback(reviews, '', '', 'highest')[0].name, 'High');
  assert.equal(context.filterFeedback(reviews, '', '', 'lowest')[0].name, 'Low');
  assert.equal(context.filterFeedback(reviews, '', '', 'highest')[2].name, 'Source');
  assert.equal(context.filterFeedback(reviews, '', '', 'lowest')[2].name, 'Source');
});

test('feedback validates every selection including an unknown sandwich', function () {
  assert.ok(context.validateFeedback({ ...validFeedback(), item: 'unknown' }, '2026-10-23')
    .some(error => error.id === 'ordered-item'));
  assert.equal(context.validateFeedback({ ...validFeedback(), item: '' }, '2026-10-23').length, 0);
});

test('exported feedback summary includes actual details and only opted-in contacts', function () {
  const data = { ...validFeedback(), email: 'private@example.com', phone: '+7 700 000 00 00' };
  const summary = context.createFeedbackSummary(data, 'DEMO-123456');
  assert.match(summary, /DEMO-123456/);
  assert.match(summary, /Chicken/);
  assert.match(summary, /Group size: 2/);
  assert.match(summary, /not sent/i);
  assert.doesNotMatch(summary, /private@example.com|700 000/);
  assert.match(context.createFeedbackSummary({ ...data, contact: true }, 'DEMO-123456'), /private@example.com/);
});

test('gallery wraps in both directions', function () {
  assert.equal(context.getNextPhotoIndex(2, 1, 3), 0);
  assert.equal(context.getNextPhotoIndex(0, -1, 3), 2);
});

test('visit planner calculates remaining opening minutes at the inclusive opening boundary', function () {
  const plan = context.getVisitPlan('2026-11-09', '09:30', new Date('2026-11-08T05:00:00Z'));
  assert.equal(plan.errors.length, 0);
  assert.equal(plan.open, true);
  assert.equal(plan.minutesUntilClose, 720);
  assert.equal(context.getVisitPlan('2026-11-09', '21:29', new Date('2026-11-08T05:00:00Z')).minutesUntilClose, 1);
});

test('closed visit plans give the next opening date and time', function () {
  const now = new Date('2026-11-08T05:00:00Z');
  const early = context.getVisitPlan('2026-11-09', '09:29', now);
  assert.equal(early.open, false);
  assert.equal(early.nextOpening, '2026-11-09 09:30');
  const late = context.getVisitPlan('2026-12-31', '21:30', now);
  assert.equal(late.open, false);
  assert.equal(late.nextOpening, '2027-01-01 09:30');
});

test('visit planner rejects invalid dates and times and visits earlier than the Astana clock', function () {
  const now = new Date('2026-11-08T19:10:00Z'); // 9 November 00:10 in Astana.
  for (const date of ['', '2026-02-30', '2026-13-01', '2026-11-08']) {
    assert.ok(context.getVisitPlan(date, '12:00', now).errors.some(error => error.id === 'plan-date'), date);
  }
  for (const time of ['', '9:30', '24:00', '12:60', '00:09']) {
    assert.ok(context.getVisitPlan('2026-11-09', time, now).errors.some(error => error.id === 'plan-time'), time);
  }
  assert.equal(context.getVisitPlan('2026-11-09', '00:10', now).errors.length, 0);
});

test('visit week uses calendar days across month and year boundaries', function () {
  const days = context.getVisitWeek('2026-12-29');
  assert.equal(days.length, 7);
  assert.equal(days[0].date, '2026-12-29');
  assert.equal(days[6].date, '2027-01-04');
  assert.equal(days[0].opening, '09:30');
  assert.equal(days[6].closing, '21:30');
});

test('About and shared navigation run without a jQuery dependency', function () {
  for (const file of ['timur.js', 'about.js']) {
    const source = fs.readFileSync(path.join(__dirname, '../js', file), 'utf8');
    assert.doesNotMatch(source, /jQuery\(|\$\(/, file);
  }
  for (const file of ['about.html', 'colophon.html']) {
    assert.doesNotMatch(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), /code\.jquery\.com/);
  }
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
