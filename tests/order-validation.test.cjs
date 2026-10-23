const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Load the real browser scripts without mounting a page or changing the clock.
const context = vm.createContext({
  window: {},
  document: { getElementById: function () { return null; } }
});
for (const filename of ['menu-data.js', 'order.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', filename), 'utf8'), context,
    { filename: filename });
}
const Kent = context.window.Kent;
const noonInAstana = new Date('2026-10-23T07:00:00Z');

test('selected quantities accept the whole-number boundaries 1 and 10', function () {
  for (const quantity of ['1', '10', 3]) {
    assert.equal(Kent.validateQuantity(quantity), '', String(quantity));
  }
});

test('blank, zero, fractional, excessive and non-numeric quantities are rejected', function () {
  for (const quantity of ['', '  ', 0, -1, 1.5, 11, 'abc', Infinity]) {
    assert.ok(Kent.validateQuantity(quantity), String(quantity));
  }
});

test('the same day is permitted while a past shop date is rejected', function () {
  assert.equal(Kent.validatePickup('2026-10-23', '12:01', noonInAstana).date, '');
  assert.equal(Kent.validatePickup('2026-10-23', '12:01', noonInAstana).time, '');
  assert.ok(Kent.validatePickup('2026-10-22', '13:00', noonInAstana).date);
  assert.equal(Kent.validatePickup('2026-10-24', '09:30', noonInAstana).date, '');
});

test('pickup time boundaries are inclusive and times outside them are rejected', function () {
  for (const time of ['09:30', '21:15']) {
    assert.equal(Kent.validatePickup('2026-10-24', time, noonInAstana).time, '', time);
  }
  for (const time of ['09:29', '21:16', '00:00', '23:59']) {
    assert.ok(Kent.validatePickup('2026-10-24', time, noonInAstana).time, time);
  }
});

test('the date and time together must be later than the current shop time', function () {
  const withSeconds = new Date('2026-10-23T07:00:30Z');
  assert.ok(Kent.validatePickup('2026-10-23', '11:59', withSeconds).time);
  assert.ok(Kent.validatePickup('2026-10-23', '12:00', withSeconds).time);
  assert.equal(Kent.validatePickup('2026-10-23', '12:01', withSeconds).time, '');
  assert.ok(Kent.validatePickup('2026-10-23', '12:00', noonInAstana).time);
});

test('shop midnight uses the Astana calendar regardless of the host time zone', function () {
  const previousUtcDay = new Date('2026-10-23T20:01:00Z');
  assert.ok(Kent.validatePickup('2026-10-23', '21:15', previousUtcDay).date);
  assert.equal(Kent.validatePickup('2026-10-24', '09:30', previousUtcDay).date, '');
  assert.equal(Kent.validatePickup('2026-10-24', '09:30', previousUtcDay).time, '');
});

test('missing and impossible calendar dates are rejected rather than rolled forward', function () {
  for (const date of ['', '2026-02-31', '2026-02-29', '2026-13-01', '2026-1-01']) {
    assert.ok(Kent.validatePickup(date, '13:00', noonInAstana).date, date);
  }
  assert.equal(Kent.validatePickup('2028-02-29', '13:00', noonInAstana).date, '');
});

test('missing or malformed clock values cannot pass the hours comparison', function () {
  for (const time of ['', '9:30', '10:99', '24:00', 'noon']) {
    assert.ok(Kent.validatePickup('2026-10-24', time, noonInAstana).time, time);
  }
});
