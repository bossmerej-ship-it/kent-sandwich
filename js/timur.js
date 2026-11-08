'use strict';

// Native helpers shared by the pages; they never require a DOM library.
function createTimurNode(tag, classes, text) {
  const element = document.createElement(tag);
  element.className = classes || '';
  if (text !== undefined) element.textContent = text;
  return element;
}

function getShopClock(now) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(now);
  const values = {};
  for (const part of parts) values[part.type] = part.value;
  return {
    date: values.year + '-' + values.month + '-' + values.day,
    time: values.hour + ':' + values.minute
  };
}

document.addEventListener('DOMContentLoaded', function () {
  if (!['about', 'feedback', 'colophon'].includes(document.body.dataset.page)) return;
  const header = document.querySelector('.site-header');
  header.classList.remove('bg-body', 'py-4', 'border-2');
  header.classList.add('py-3');
  const logo = header.querySelector('.brand-mark img');
  logo.width = 44;
  logo.height = 44;
  logo.classList.remove('border-2');
  header.querySelector('.navbar-toggler').classList.remove('rounded-0', 'border-dark', 'border-2');
  header.querySelector('.header-note').classList.remove('text-uppercase');
  for (const link of header.querySelectorAll('.nav-link')) {
    link.classList.remove('rounded-0', 'text-uppercase', 'small', 'fw-bold');
    link.classList.add('fw-semibold');
  }
  header.querySelector('a[href="colophon.html"]').closest('li').remove();
  if (document.body.dataset.page === 'colophon') {
    document.getElementById('build-form-description').textContent =
      'Bootstrap opens the mobile menu. Feedback checks each field, then offers a review step and local confirmation.';
    document.getElementById('feedback-principle').lastChild.textContent =
      ' Each field is checked before the review step. You can edit, confirm, copy or save the local summary. Nothing is sent to the shop.';
    document.getElementById('keyboard-guide').replaceChildren(
      document.createTextNode('Press '), createTimurNode('kbd', '', 'Tab'),
      document.createTextNode(' to move through links and controls. Feedback errors appear beside each field; the error summary links focus the field to correct.'));
  }
});
