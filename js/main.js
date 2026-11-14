// jQuery 3.7.1 full loads first; ready waits for the page markup.
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
  const cartRegion = $('#order-cart');
  const cartList = $('#cart-items');
  const cartEmpty = $('#cart-empty-state');
  const clearButton = element('button', 'btn btn-outline-dark btn-sm rounded-0 mt-3', 'Clear basket')
    .attr({ type: 'button', id: 'clear-basket' });
  if (cartRegion.length) {
    cartRegion.append(clearButton);
    clearButton.on('click', function () {
      Kent.clearCart();
      cartEmpty.attr('tabindex', '-1').trigger('focus');
      announce('Your basket is now empty. Add sandwiches to prepare a demo order.');
    });
  }

  function makeCartButton(action, label, accessibleName) {
    return element('button', 'btn btn-outline-dark btn-sm rounded-0', label).attr({
      type: 'button', 'data-cart-action': action, 'aria-label': accessibleName
    });
  }

  // Rewrite 2: $(), .empty(), .append(), .prop() and delegated .on() replace native basket DOM/listeners.
  // Building rows is shorter; calculation/storage logic stays the same and focus recovery still needs care.
  function renderCart() {
    if (!cartList.length) return;
    const summary = Kent.calculateCart(Kent.getCart());
    const focused = cartList.find(':focus');
    const focusedId = focused.closest('li').attr('data-item-id');
    const focusedAction = focused.attr('data-cart-action');
    const scrollTop = cartList.scrollTop();
    cartList.empty();
    summary.lines.forEach(function (line) {
      const row = element('li', 'border-bottom py-2').attr('data-item-id', line.item.id);
      const heading = element('div', 'd-flex flex-wrap justify-content-between gap-1 mb-1').append(
        element('span', 'fw-semibold', line.item.name),
        element('strong', 'text-nowrap', Kent.formatMoney(line.subtotal))
      );
      const controls = element('div', 'd-flex flex-wrap align-items-center gap-1');
      const minus = makeCartButton('decrease', '−', 'Decrease ' + line.item.name + ' quantity');
      const plus = makeCartButton('increase', '+', 'Increase ' + line.item.name + ' quantity')
        .prop('disabled', line.quantity >= Kent.MAX_QUANTITY);
      const quantity = element('span', 'px-2', String(line.quantity))
        .attr('aria-label', line.quantity + ' ' + line.item.name);
      const remove = makeCartButton('remove', 'Remove', 'Remove ' + line.item.name + ' from basket');
      controls.append(minus, quantity, plus, remove.addClass('ms-auto'));
      row.append(heading, controls).appendTo(cartList);
    });
    cartList.scrollTop(scrollTop);
    $('#cart-total').text(Kent.formatMoney(summary.total));
    cartEmpty.toggleClass('is-hidden', summary.quantity !== 0);
    clearButton.prop('disabled', summary.quantity === 0);
    if (focused.length) {
      const buttons = cartList.find('button:not(:disabled)');
      const sameItem = buttons.filter(function () {
        return $(this).closest('li').attr('data-item-id') === focusedId;
      });
      const sameAction = sameItem.filter(function () { return $(this).attr('data-cart-action') === focusedAction; });
      const next = sameAction[0] || sameItem[0] || buttons[0] || cartEmpty[0];
      next.focus();
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
