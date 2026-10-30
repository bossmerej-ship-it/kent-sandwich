jQuery(function ($) {
    'use strict';

    const Kent = window.Kent;
    const signature = $('.signature-section');
    if (!Kent || !signature.length || Kent.MENU.length === 0) {
        return;
    }

    const create = Kent.element;
    const section = create('section', 'py-5 border-bottom border-2 border-dark');
    section.attr('aria-labelledby', 'suggestion-title');
    const heading = create('h2', 'fw-bold mb-3 display-6 text-uppercase lh-1', 'Need a hand choosing?');
    heading.attr("id", 'suggestion-title');
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
    add.attr("type", 'button');
    const another = create('button', 'btn btn-outline-dark rounded-0 border-2', 'Another suggestion');
    another.attr("type", 'button');
    const menuLink = create('a', 'btn btn-link link-dark', 'View the full menu →');
    menuLink.attr("href", 'menu.html');
    const status = create('p', 'small mt-3 mb-0');
    status.attr('role', 'status');
    status.attr('aria-atomic', 'true');
    const basketLink = create('a', 'link-dark fw-semibold d-inline-block mt-3', 'Review your basket →');
    basketLink.attr("href", 'order.html');
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
        card.toggleClass('is-selected', count > 0);
        quantity.text(count > 0 ? count + ' in your basket.' : 'Not in your basket yet.');
    }

    function showSuggestion(shouldAnnounce) {
        suggestionIndex = chooseSuggestion(suggestionIndex, Kent.MENU);
        const item = Kent.MENU[suggestionIndex];
        name.text(item.name);
        description.text(item.description);
        profile.text('Profile: ' + item.profile);
        price.text(Kent.formatMoney(item.price));
        add.attr('aria-label', 'Add ' + item.name + ' to basket');
        updateBasketSelection();
        status.removeClass('text-danger');
        status.text(shouldAnnounce ? 'Suggestion: ' + item.name + ', ' + Kent.formatMoney(item.price) + '.' : '');
    }

    another.on('click', function () {
        showSuggestion(true);
    });

    add.on('click', function () {
        const item = Kent.MENU[suggestionIndex];
        const result = Kent.addToCart(item.id);
        status.toggleClass('text-danger', !result.ok);
        if (!result.ok) {
            status.text(result.message);
            return;
        }
        const basket = Kent.calculateCart(Kent.getCart());
        const unit = basket.quantity === 1 ? ' sandwich' : ' sandwiches';
        status.text(item.name + ' added. Basket: ' + basket.quantity + unit + ', ' + Kent.formatMoney(basket.total) + '.');
    });

    showSuggestion(false);
    Kent.onCartChange(updateBasketSelection);
});
