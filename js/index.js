(function () {
  'use strict';

  const Kent = window.Kent;
  const signature = document.querySelector('.signature-section');
  if (!Kent || !signature || Kent.MENU.length === 0) return;

  function element(tag, classes = '', text = '') {
    const node = document.createElement(tag);
    node.className = classes;
    node.textContent = text;
    return node;
  }

  function chooseSuggestion(items, previous) {
    if (items.length < 2) return items[0];
    const choices = items.filter(item => item !== previous);
    return choices[Math.floor(Math.random() * choices.length)];
  }

  const section = element('section', 'py-5 border-bottom border-2 border-dark');
  const heading = element('h2', 'fw-bold mb-3 display-6 text-uppercase lh-1', 'Need a hand choosing?');
  heading.id = 'suggestion-title';
  section.setAttribute('aria-labelledby', heading.id);

  const budgetField = element('div', 'col-12 col-sm-6 col-lg-4 mb-3');
  const label = element('label', 'form-label fw-semibold', 'Maximum price');
  const budget = element('select', 'form-select rounded-0');
  budget.id = 'suggestion-budget';
  label.htmlFor = budget.id;
  budget.append(new Option('Any price', ''));
  const prices = [...new Set(Kent.MENU.map(item => item.price))].sort((a, b) => a - b);
  for (const price of prices) {
    budget.append(new Option('Up to ' + Kent.formatMoney(price), String(price)));
  }
  const budgetStatus = element('p', 'form-text mb-0');
  budgetStatus.setAttribute('role', 'status');
  budgetField.append(label, budget, budgetStatus);

  const card = element('article', 'menu-card card border-dark border-2 rounded-0');
  const body = element('div', 'card-body p-4');
  const itemViews = new Map();
  for (const item of Kent.MENU) {
    const details = element('div', 'is-hidden');
    details.append(
      element('h3', 'h4 fw-bold text-uppercase', item.name),
      element('p', '', item.description),
      element('p', 'small text-body-secondary', 'Profile: ' + item.profile),
      element('p', 'menu-price fs-3 fw-bold', Kent.formatMoney(item.price))
    );
    body.append(details);
    itemViews.set(item, details);
  }

  const quantity = element('p', 'small mb-3');
  const actions = element('div', 'd-flex flex-wrap gap-2');
  const add = element('button', 'btn btn-dark rounded-0 border-2 fw-bold', 'Add to basket');
  add.type = 'button';
  const another = element('button', 'btn btn-outline-dark rounded-0 border-2', 'Another suggestion');
  another.type = 'button';
  const menuLink = element('a', 'btn btn-link link-dark', 'View the full menu →');
  menuLink.href = 'menu.html';
  const status = element('p', 'small mt-3 mb-0');
  status.setAttribute('role', 'status');
  const basketLink = element('a', 'link-dark fw-semibold d-inline-block mt-3', 'Review your basket →');
  basketLink.href = 'order.html#order-cart';
  actions.append(add, another, menuLink);
  body.append(quantity, actions, status, basketLink);
  card.append(body);
  section.append(heading, budgetField, card);
  signature.before(section);

  let matches = [];
  let selected;

  function updateBasketSelection() {
    if (!selected) return;
    const line = Kent.getCart().find(entry => entry.id === selected.id);
    const count = line ? line.quantity : 0;
    card.classList.toggle('is-selected', count > 0);
    quantity.textContent = count ? count + ' in your basket.' : 'Not in your basket yet.';
  }

  function showSuggestion(item, announce) {
    if (selected) itemViews.get(selected).classList.add('is-hidden');
    selected = item;
    card.classList.toggle('is-hidden', !item);
    if (!item) return;
    itemViews.get(item).classList.remove('is-hidden');
    add.setAttribute('aria-label', 'Add ' + item.name + ' to basket');
    status.classList.remove('text-danger');
    status.textContent = announce ? 'Suggestion: ' + item.name + ', ' + Kent.formatMoney(item.price) + '.' : '';
    updateBasketSelection();
  }

  function applyBudget() {
    matches = Kent.filterMenu(Kent.MENU, '', '', budget.value);
    if (matches.length === 0) {
      budgetStatus.textContent = 'No sandwiches fit this budget. Choose a higher price.';
    } else {
      budgetStatus.textContent = matches.length === 1 ? '1 matching sandwich.' : matches.length + ' matching sandwiches.';
    }
    another.disabled = matches.length < 2;
    showSuggestion(matches.includes(selected) ? selected : chooseSuggestion(matches), false);
  }

  budget.addEventListener('change', applyBudget);
  actions.addEventListener('click', function (event) {
    const button = event.target.closest('button');
    if (button === another && matches.length > 1) {
      showSuggestion(chooseSuggestion(matches, selected), true);
      return;
    }
    if (button !== add || !selected) return;
    const result = Kent.addToCart(selected.id);
    status.classList.toggle('text-danger', !result.ok);
    if (!result.ok) {
      status.textContent = result.message;
      return;
    }
    const basket = Kent.calculateCart(Kent.getCart());
    status.textContent = selected.name + ' added. Basket total: ' + Kent.formatMoney(basket.total) + '.';
  });

  Kent.onCartChange(updateBasketSelection);
  applyBudget();
})();
