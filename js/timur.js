'use strict';

function createTimurElement(tag, classes, text) {
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

function alignTimurHeader() {
  const header = document.querySelector('.site-header');
  header.classList.remove('bg-body', 'py-4', 'border-2');
  header.classList.add('py-3');
  const logo = header.querySelector('.brand-mark img');
  logo.width = 44;
  logo.height = 44;
  logo.classList.remove('border-2');
  header.querySelector('.navbar-toggler').classList.remove('rounded-0', 'border-dark', 'border-2');
  header.querySelector('.header-note').classList.remove('text-uppercase');
  const links = header.querySelectorAll('.nav-link');
  for (const link of links) {
    link.classList.remove('rounded-0', 'text-uppercase', 'small', 'fw-bold');
    link.classList.add('fw-semibold');
    if (link.getAttribute('href') === 'colophon.html') link.closest('li').remove();
  }
}

const timurPage = document.body.dataset.page;
if (timurPage === 'about' || timurPage === 'feedback' || timurPage === 'colophon') {
  alignTimurHeader();
}
