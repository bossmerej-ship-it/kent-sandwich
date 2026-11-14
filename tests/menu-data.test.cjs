'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const context = { window: {}, Intl: Intl };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/menu-data.js'), 'utf8'), context);
const Kent = context.window.Kent;
const plain = value => JSON.parse(JSON.stringify(value));

test('catalogue matches the eight existing prices and uses immutable records', () => {
  assert.equal(Kent.MENU.length, 8);
  assert.ok(Kent.MENU.every(item => Object.keys(item).length >= 4 && Object.isFrozen(item)));
  assert.equal(new Set(Kent.MENU.map(item => item.id)).size, 8);
  assert.equal(Kent.getMenuItem(Kent.MENU, 'chicken').price, 640);
  assert.equal(Kent.getMenuItem(Kent.MENU, 'missing'), undefined);
});

test('connected filters trim input, combine constraints and handle no results', () => {
  assert.equal(Kent.filterMenu(Kent.MENU, '', '', '').length, 8);
  assert.equal(Kent.filterMenu(Kent.MENU, '', '', 640).length, 5);
  assert.deepEqual(plain(Kent.filterMenu(Kent.MENU, ' SPICY ', 'Hot', 700).map(item => item.id)), ['spicy']);
  assert.equal(Kent.filterMenu(Kent.MENU, 'spicy', 'Compact', 740).length, 0);
  assert.equal(Kent.filterMenu(Kent.MENU, '<script>', '', '').length, 0);
});

test('basket totals handle multiple lines, empty state and the upper quantity limit', () => {
  const basket = Kent.calculateCart([{ id: 'chicken', quantity: 2 }, { id: 'mini', quantity: 1 }]);
  assert.equal(basket.total, 1670);
  assert.equal(basket.quantity, 3);
  assert.equal(basket.lines[0].subtotal, 1280);
  assert.equal(Kent.calculateCart([]).total, 0);
  assert.equal(Kent.calculateCart([{ id: 'spicy-cutlet', quantity: 10 }]).total, 7400);
});

test('untrusted saved baskets cannot introduce prices, unknown items or invalid quantities', () => {
  assert.deepEqual(plain(Kent.normaliseCart(null)), []);
  const dirty = [
    null, { id: 'missing', quantity: 2 }, { id: 'mini', quantity: -1 },
    { id: 'classic', quantity: 1.5 }, { id: 'cheese', quantity: '2' },
    { id: 'chicken', quantity: 3, price: 1 }, { id: 'chicken', quantity: 20 }
  ];
  assert.deepEqual(plain(Kent.normaliseCart(dirty)), [{ id: 'chicken', quantity: 10 }]);
  assert.equal(Kent.calculateCart(dirty).total, 6400);
});
