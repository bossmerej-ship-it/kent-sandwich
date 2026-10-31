'use strict';

// jQuery 3.7.1: create elements in code and insert visitor content as plain text.
function createTimurElement(tag, classes, text) {
  const element = jQuery('<' + tag + '>').addClass(classes || '');
  if (text !== undefined) element.text(text);
  return element;
}

function timurEffectDuration() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
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

// .find(), .attr() and class methods replace DOM queries/property assignments.
// Collection operations make this shorter than the original link loop.
jQuery(function ($) {
  // Ready waits until the page exists before querying and changing its header.
  if (!['about', 'feedback', 'colophon'].includes($('body').attr('data-page'))) return;
  const header = $('.site-header');
  header.removeClass('bg-body py-4 border-2').addClass('py-3');
  header.find('.brand-mark img').attr({ width: 44, height: 44 }).removeClass('border-2');
  header.find('.navbar-toggler').removeClass('rounded-0 border-dark border-2');
  header.find('.header-note').removeClass('text-uppercase');
  header.find('.nav-link').removeClass('rounded-0 text-uppercase small fw-bold').addClass('fw-semibold');
  header.find('a[href="colophon.html"]').closest('li').remove();
});
