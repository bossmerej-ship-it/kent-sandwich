(function () {
    'use strict';

    const Kent = window.Kent;
    const signature = document.querySelector('.signature-section');
    if (!Kent || !signature || Kent.MENU.length === 0) {
        return;
    }

    const create = Kent.createElement;
    const section = create('section', 'py-5 border-bottom border-2 border-dark');
    section.setAttribute('aria-labelledby', 'suggestion-title');
    const heading = create('h2', 'fw-bold mb-3 display-6 text-uppercase lh-1', 'Need a hand choosing?');
    heading.id = 'suggestion-title';
    const introduction = create('p', '', 'Try a random pick from our eight sandwiches, or ask for another suggestion.');
    const card = create('article', 'menu-card card border-dark border-2 rounded-0');
    const body = create('div', 'card-body p-4');
    const name = create('h3', 'h4 fw-bold text-uppercase');
    const description = create('p');
    const profile = create('p', 'small text-body-secondary');
    const price = create('p', 'menu-price fs-3 fw-bold');
    const quantity = create('p', 'small mb-3');
    const actions = create('div', 'd-flex flex-wrap gap-2');
    const add = create('button', 'btn btn-dark rounded-0 border-2 fw-bold', 'Add to basket');
    add.type = 'button';
    const another = create('button', 'btn btn-outline-dark rounded-0 border-2', 'Another suggestion');
    another.type = 'button';
    const menuLink = create('a', 'btn btn-link link-dark', 'View the full menu →');
    menuLink.href = 'menu.html';
    const status = create('p', 'small mt-3 mb-0');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-atomic', 'true');
    const basketLink = create('a', 'link-dark fw-semibold d-inline-block mt-3', 'Review your basket →');
    basketLink.href = 'order.html';
    actions.append(add, another, menuLink);
    body.append(name, description, profile, price, quantity, actions, status, basketLink);
    card.append(body);
    section.append(heading, introduction, card);
    signature.before(section);

    let suggestionIndex = -1;

    // Skip the current item so that "Another suggestion" always produces a change.
    function chooseSuggestion(previousIndex, items) {
        if (items.length <= 1) {
            return 0;
        }
        if (previousIndex < 0) {
            return Math.floor(Math.random() * items.length);
        }
        const index = Math.floor(Math.random() * (items.length - 1));
        return index >= previousIndex ? index + 1 : index;
    }

    function updateBasketSelection() {
        const item = Kent.MENU[suggestionIndex];
        const entry = Kent.getCart().find(function (line) {
            return line.id === item.id;
        });
        const count = entry ? entry.quantity : 0;
        card.classList.toggle('is-selected', count > 0);
        quantity.textContent = count > 0 ? count + ' in your basket.' : 'Not in your basket yet.';
    }

    function showSuggestion(shouldAnnounce) {
        suggestionIndex = chooseSuggestion(suggestionIndex, Kent.MENU);
        const item = Kent.MENU[suggestionIndex];
        name.textContent = item.name;
        description.textContent = item.description;
        profile.textContent = 'Profile: ' + item.profile;
        price.textContent = Kent.formatMoney(item.price);
        add.setAttribute('aria-label', 'Add ' + item.name + ' to basket');
        updateBasketSelection();
        status.classList.remove('text-danger');
        status.textContent = shouldAnnounce ? 'Suggestion: ' + item.name + ', ' + Kent.formatMoney(item.price) + '.' : '';
    }

    another.addEventListener('click', function () {
        showSuggestion(true);
    });

    add.addEventListener('click', function () {
        const item = Kent.MENU[suggestionIndex];
        const result = Kent.addToCart(item.id);
        status.classList.toggle('text-danger', !result.ok);
        if (!result.ok) {
            status.textContent = result.message;
            return;
        }
        const basket = Kent.calculateCart(Kent.getCart());
        const unit = basket.quantity === 1 ? ' sandwich' : ' sandwiches';
        status.textContent = item.name + ' added. Basket: ' + basket.quantity + unit + ', ' + Kent.formatMoney(basket.total) + '.';
    });

    showSuggestion(false);
    Kent.onCartChange(updateBasketSelection);
}());
