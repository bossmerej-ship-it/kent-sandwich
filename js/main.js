// jQuery 3.7.1 full loads first; ready waits for the frozen markup.
jQuery(function ($) {
  'use strict';

  const Kent = window.Kent;

  // All UI helpers return jQuery collections, never native DOM nodes.
  function element(tag, classes, text) {
    const node = $('<' + tag + '>').addClass(classes || '');
    if (text !== undefined) node.text(text);
    return node;
  }

  function effectDuration() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
  }

  const main = $('main');
  $('<link>').attr({ rel: 'icon', href: 'images/kent-logo.jpg' }).appendTo('head');
  const status = element('p', 'visually-hidden')
    .attr({ id: 'basket-status', role: 'status', 'aria-live': 'polite' }).prependTo(main);
  const storageNotice = element('p', 'form-message is-hidden')
    .attr('id', 'basket-storage-notice').prependTo(main);

  function showStorageNotice() {
    storageNotice.removeClass('is-hidden')
      .text('Your basket works on this page. Browser storage is unavailable, so it may not carry over to another page.');
  }

  function announce(message) {
    status.text('');
    window.requestAnimationFrame(function () { status.text(message); });
  }

  Object.assign(Kent, { element, effectDuration, announce });

  const navList = $('#main-navbar ul');
  navList.find('a[href="colophon.html"]').closest('li').remove();
  navList.find('a').each(function () {
    $(this).toggleClass('active', $(this).attr('aria-current') === 'page');
  });
  const navLink = element('a', 'nav-link px-3 fw-semibold')
    .attr({ id: 'shared-basket-link', href: 'order.html#order-cart' });
  element('li', 'nav-item').append(navLink).appendTo(navList);

  const cartRegion = $('#order-cart');
  const cartList = $('#cart-items');
  const cartEmpty = $('#cart-empty-state');
  const clearButton = element('button', 'btn btn-outline-dark rounded-0 mt-3', 'Clear basket')
    .attr({ type: 'button', id: 'clear-basket' });
  if (cartRegion.length) {
    cartEmpty.append(' ', element('a', 'link-dark fw-semibold', 'Browse the menu.').attr('href', 'menu.html'));
    cartRegion.removeClass('is-hidden').append(clearButton);
    clearButton.on('click', function () {
      Kent.clearCart();
      cartEmpty.attr('tabindex', '-1').trigger('focus');
      announce('Your basket is now empty. Add sandwiches to prepare a demo order.');
    });
  }

  function makeCartButton(action, item, label, accessibleName) {
    return element('button', 'btn btn-outline-dark rounded-0', label).attr({
      type: 'button', 'data-cart-action': action, 'data-item-id': item.id, 'aria-label': accessibleName
    });
  }

  // Rewrite 2: $(), .empty(), .append(), .prop() and delegated .on() replace native basket DOM/listeners.
  // Building rows is shorter; calculation/storage logic stays the same and focus recovery still needs care.
  function renderCart() {
    const summary = Kent.calculateCart(Kent.getCart());
    navLink.text('Basket (' + summary.quantity + ')')
      .attr('aria-label', 'Basket, ' + summary.quantity + ' items, ' + Kent.formatMoney(summary.total));
    if (!cartList.length) return;
    const focused = cartList.find(':focus');
    const focusedId = focused.attr('data-item-id');
    const focusedAction = focused.attr('data-cart-action');
    cartList.empty();
    // These rows exist only here: #cart-items in the frozen HTML is empty.
    summary.lines.forEach(function (line) {
      const row = element('li', 'border-bottom py-3').attr('data-item-id', line.item.id);
      const heading = element('p', 'fw-bold mb-2', line.item.name + ' — ' + Kent.formatMoney(line.item.price) + ' each');
      const controls = element('div', 'd-flex flex-wrap align-items-center gap-2');
      const minus = makeCartButton('decrease', line.item, '−', 'Decrease ' + line.item.name + ' quantity');
      const plus = makeCartButton('increase', line.item, '+', 'Increase ' + line.item.name + ' quantity')
        .prop('disabled', line.quantity >= Kent.MAX_QUANTITY);
      const quantity = element('span', 'px-2', String(line.quantity))
        .attr('aria-label', line.quantity + ' ' + line.item.name);
      const remove = makeCartButton('remove', line.item, 'Remove', 'Remove ' + line.item.name + ' from basket');
      controls.append(minus, quantity, plus, remove, element('strong', 'ms-sm-auto', Kent.formatMoney(line.subtotal)));
      row.append(heading, controls).appendTo(cartList);
    });
    $('#cart-count').text(summary.quantity + (summary.quantity === 1 ? ' item' : ' items'));
    $('#cart-total').text(Kent.formatMoney(summary.total));
    cartEmpty.toggleClass('is-hidden', summary.quantity !== 0);
    clearButton.prop('disabled', summary.quantity === 0);
    if (focused.length) {
      const buttons = cartList.find('button:not(:disabled)');
      const next = buttons.filter(function () {
        return $(this).attr('data-item-id') === focusedId && $(this).attr('data-cart-action') === focusedAction;
      }).first();
      if (next.length || buttons.length) (next.length ? next : buttons.first()).trigger('focus');
      else cartEmpty.attr('tabindex', '-1').trigger('focus');
    }
  }

  // The parent exists before rows. Direct binding would miss new buttons after every render.
  cartList.on('click', 'button[data-cart-action]', function () {
    const button = $(this);
    const id = button.closest('li').attr('data-item-id');
    const line = Kent.getCart().find(function (entry) { return entry.id === id; });
    if (!line) return;
    const action = button.attr('data-cart-action');
    const quantity = action === 'increase' ? line.quantity + 1 : action === 'decrease' ? line.quantity - 1 : 0;
    announce(Kent.setQuantity(line.id, quantity).message);
  });
  Kent.onCartChange(function (source) {
    renderCart();
    if (!Kent.isCartStorageAvailable()) showStorageNotice();
    if (source === 'storage') announce('Your basket was updated in another tab.');
  });
  if (!Kent.isCartStorageAvailable()) showStorageNotice();
  renderCart();
});
