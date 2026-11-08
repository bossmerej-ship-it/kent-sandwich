(function () {
  'use strict';

  const Kent = window.Kent;
  const signature = document.querySelector('.signature-section');
  if (!Kent || !signature || !Kent.MENU.length) return;

  function element(tag, classes = '', text = '') {
    const node = document.createElement(tag);
    node.className = classes;
    node.textContent = text;
    return node;
  }

  function button(label, classes, type = 'button') {
    const node = element('button', classes, label);
    node.type = type;
    return node;
  }

  function addPreference(container, id, label, options) {
    const column = element('div', 'col-12 col-sm-6');
    const title = element('label', 'form-label fw-semibold', label);
    const select = element('select', 'form-select rounded-0');
    title.htmlFor = id;
    select.id = id;
    for (const [value, text] of options) {
      const option = element('option', '', text);
      option.value = value;
      select.append(option);
    }
    column.append(title, select);
    container.append(column);
    return select;
  }

  // The same chooser serves the initial recommendation and the Another suggestion action.
  function chooseSuggestion(items, previous) {
    const others = items.filter(item => item !== previous);
    const pool = others.length ? others : items;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const section = element('section', 'py-5 border-bottom border-2 border-dark');
  const heading = element('h2', 'fw-bold mb-3 display-6 text-uppercase lh-1', 'Need a hand choosing?');
  heading.id = 'suggestion-title';
  section.setAttribute('aria-labelledby', heading.id);

  const form = element('form', 'mb-3');
  form.setAttribute('aria-label', 'Sandwich preferences');
  const controls = element('div', 'row g-3 mb-3');
  const profiles = [...new Set(Kent.MENU.map(item => item.profile))];
  const prices = [...new Set(Kent.MENU.map(item => item.price))].sort((left, right) => left - right);
  const profile = addPreference(controls, 'suggestion-profile', 'Sandwich profile', [
    ['', 'Any profile'], ...profiles.map(value => [value, value])
  ]);
  const budget = addPreference(controls, 'suggestion-budget', 'Maximum price', [
    ['', 'Any price'], ...prices.map(value => [value, 'Up to ' + Kent.formatMoney(value)])
  ]);
  const reset = button('Reset preferences', 'btn btn-outline-dark rounded-0', 'reset');
  form.append(controls, reset);

  const matchStatus = element('p', 'fw-semibold mb-2');
  matchStatus.setAttribute('role', 'status');
  const matchList = element('ul', 'list-unstyled d-flex flex-wrap gap-2 mb-3');
  matchList.setAttribute('aria-label', 'Matching sandwiches');

  const card = element('article', 'menu-card card border-dark border-2 rounded-0');
  const body = element('div', 'card-body p-4');
  const name = element('h3', 'h4 fw-bold text-uppercase');
  const description = element('p');
  const profileText = element('p', 'small text-body-secondary');
  const price = element('p', 'menu-price fs-3 fw-bold');
  const quantity = element('p', 'small mb-3');
  const actions = element('div', 'd-flex flex-wrap gap-2');
  const add = button('Add to basket', 'btn btn-dark rounded-0 border-2 fw-bold');
  const another = button('Another suggestion', 'btn btn-outline-dark rounded-0 border-2');
  const basketLink = element('a', 'link-dark fw-semibold d-inline-block mt-3', 'Review your basket →');
  basketLink.href = 'order.html#order-cart';
  const basketStatus = element('p', 'small mt-3 mb-0');
  basketStatus.setAttribute('role', 'status');
  actions.append(add, another);
  body.append(name, description, profileText, price, quantity, actions, basketStatus, basketLink);
  card.append(body);
  const menuLink = element('a', 'btn btn-link link-dark px-0 mt-3', 'View the full menu →');
  menuLink.href = 'menu.html';
  section.append(heading, form, matchStatus, matchList, card, menuLink);
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
    selected = item;
    name.textContent = item.name;
    description.textContent = item.description;
    profileText.textContent = 'Profile: ' + item.profile;
    price.textContent = Kent.formatMoney(item.price);
    add.setAttribute('aria-label', 'Add ' + item.name + ' to basket');
    for (const option of matchList.querySelectorAll('button')) {
      const current = option.dataset.suggestion === item.id;
      option.setAttribute('aria-pressed', String(current));
      option.classList.toggle('btn-dark', current);
      option.classList.toggle('btn-outline-dark', !current);
    }
    basketStatus.classList.remove('text-danger');
    basketStatus.textContent = announce ? 'Suggestion: ' + item.name + ', ' + Kent.formatMoney(item.price) + '.' : '';
    updateBasketSelection();
  }

  function renderMatches() {
    matches = Kent.filterMenu(Kent.MENU, '', profile.value, budget.value);
    matchList.replaceChildren();
    card.classList.toggle('is-hidden', matches.length === 0);
    matchList.classList.toggle('is-hidden', matches.length === 0);
    if (!matches.length) {
      selected = undefined;
      matchStatus.textContent = 'No sandwiches match. Change your preferences or reset them.';
      return;
    }

    matchStatus.textContent = matches.length + (matches.length === 1 ? ' matching sandwich.' : ' matching sandwiches.');
    for (const item of matches) {
      const row = element('li');
      const option = button(item.name + ' · ' + Kent.formatMoney(item.price), 'btn btn-sm rounded-0');
      option.dataset.suggestion = item.id;
      row.append(option);
      matchList.append(row);
    }
    another.disabled = matches.length < 2;
    showSuggestion(matches.includes(selected) ? selected : chooseSuggestion(matches), false);
  }

  form.addEventListener('change', renderMatches);
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('reset', function (event) {
    event.preventDefault();
    profile.value = '';
    budget.value = '';
    renderMatches();
    profile.focus();
  });

  // The list is rebuilt when preferences change, so one parent handles all its buttons.
  matchList.addEventListener('click', function (event) {
    const choice = event.target.closest('button[data-suggestion]');
    if (!choice) return;
    const item = Kent.getMenuItem(matches, choice.dataset.suggestion);
    if (item) showSuggestion(item, true);
  });
  another.addEventListener('click', function () {
    showSuggestion(chooseSuggestion(matches, selected), true);
  });
  add.addEventListener('click', function () {
    const result = Kent.addToCart(selected.id);
    basketStatus.classList.toggle('text-danger', !result.ok);
    if (!result.ok) {
      basketStatus.textContent = result.message;
      return;
    }
    const basket = Kent.calculateCart(Kent.getCart());
    basketStatus.textContent = selected.name + ' added. Basket total: ' + Kent.formatMoney(basket.total) + '.';
  });

  Kent.onCartChange(updateBasketSelection);
  renderMatches();
})();
