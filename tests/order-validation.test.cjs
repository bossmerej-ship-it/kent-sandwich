const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Load the real basket and validators without mounting a page or changing the clock.
const storage = new Map();
const context = vm.createContext({
  window: {
    addEventListener() {},
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    }
  },
  jQuery: function () { /* Pure validators are exported before the UI ready callback. */ }
});
for (const filename of ['menu-data.js', 'basket.js', 'order.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', filename), 'utf8'), context,
    { filename: filename });
}
const Kent = context.window.Kent;
const noonInAstana = new Date('2026-10-23T07:00:00Z');

test('phone validation accepts Kazakhstan mobile and landline formats', function () {
  for (const phone of ['  +7 (701) 234-56-78  ', '8 (747) 234 56 78', '7771234567',
    '77082345678', '+7 (7172) 23-45-67', '+7 727 234 56 78', '+7-(747)-123-1212']) {
    assert.equal(Kent.validatePhone(phone), '', phone);
  }
});

test('phone validation rejects impossible lengths, characters and codes', function () {
  for (const phone of ['', '   ', '+7', '123', '1234567890', '00000000000', '+7 701 234 56 7',
    '+7 701 234 56 789', '+7 700 CALL NOW', '++77012345678', '+7 (701 234-56-78', '+8 701 234 56 78',
    '+1 202 555 0123', '+7 999 123 45 67', '+7 703 123 45 67', '+7 717 123 45 67']) {
    assert.ok(Kent.validatePhone(phone), phone);
  }
});

test('email validation trims outer spaces and accepts ordinary and plus-tag addresses', function () {
  for (const email of ['  demo@example.com  ', 'demo+pickup@example.co.uk']) {
    assert.equal(Kent.validateEmail(email), '', email);
  }
});

test('email validation rejects missing domains, multiple @ signs and internal whitespace', function () {
  for (const email of ['', ' ', 'bad@', 'a@localhost', 'a@@example.com', 'two names@example.com', 'a@example.']) {
    assert.ok(Kent.validateEmail(email), email);
  }
});

test('basket accepts the maximum quantity and removes the sandwich at zero', function () {
  assert.equal(Kent.setQuantity('mini', 10).ok, true);
  assert.equal(Kent.calculateCart(Kent.getCart()).total, 3900);
  assert.equal(Kent.setQuantity('mini', 0).ok, true);
  assert.equal(Kent.getCart().length, 0);
});

test('invalid basket quantities leave the last valid quantity unchanged', function () {
  Kent.setQuantity('mini', 1);
  for (const quantity of ['', '2', -1, 1.5, 11, Infinity]) {
    assert.equal(Kent.setQuantity('mini', quantity).ok, false, String(quantity));
    assert.equal(Kent.getCart()[0].quantity, 1);
  }
  Kent.clearCart();
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
