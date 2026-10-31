'use strict';

function getOpeningStatus(now, opening, closing) {
  const clock = getShopClock(now);
  const open = clock.time >= opening && clock.time < closing;
  let text = 'Open until ' + closing + ' (Astana time).';
  if (!open) {
    const day = clock.time < opening ? 'today' : 'tomorrow';
    text = 'Closed — opens ' + day + ' at ' + opening + ' (Astana time).';
  }
  return { open: open, text: text };
}

function getNextMinuteDelay(now) {
  return 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
}

function getNextPhotoIndex(index, step, count) {
  return (index + step + count) % count;
}

// jQuery 3.7.1 ready waits for the gallery and hours markup.
jQuery(function ($) {
  if ($('body').attr('data-page') !== 'about') return;
  const hours = $('#visit-hours');
  function updateHours() {
    const result = getOpeningStatus(new Date(), hours.attr('data-open'), hours.attr('data-close'));
    $('#visit-status').text(result.text).removeClass('hidden').toggleClass('success', result.open);
  }
  function refreshHours() {
    updateHours();
    window.setTimeout(refreshHours, getNextMinuteDelay(new Date()));
  }
  refreshHours();
  $(document).on('visibilitychange', function () {
    if (!$(document).prop('hidden')) updateHours();
  });
  // .on(), .find(), .attr() and .text() replace event listeners and DOM properties.
  // This is shorter; native dialog methods remain necessary because jQuery has no modal API.
  const links = $('.gallery-link');
  const dialog = $('#gallery-dialog');
  const image = $('#gallery-dialog-image');
  let photoIndex = 0;
  let opener = null;
  function showPhoto(index) {
    photoIndex = index;
    const link = links.eq(index);
    image.attr({ alt: link.find('img').attr('alt'), src: link.attr('href') });
    $('#gallery-dialog-caption').text($('#' + link.attr('data-caption-id')).text());
    $('#gallery-position').text((index + 1) + ' of ' + links.length);
    $('#gallery-error').addClass('hidden');
  }
  links.on('click', function (event) {
    // Without this the browser navigates to the image instead of opening the viewer.
    event.preventDefault();
    opener = $(this);
    showPhoto(links.index(this));
    dialog[0].showModal();
  });
  $('#gallery-next').on('click', function () { showPhoto(getNextPhotoIndex(photoIndex, 1, links.length)); });
  $('#gallery-previous').on('click', function () { showPhoto(getNextPhotoIndex(photoIndex, -1, links.length)); });
  dialog.on('keydown', function (event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showPhoto(getNextPhotoIndex(photoIndex, event.key === 'ArrowRight' ? 1 : -1, links.length));
    }
  }).on('close', function () { if (opener) opener.trigger('focus'); });
  image.on('error', function () { $('#gallery-error').removeClass('hidden'); })
    .on('load', function () { $('#gallery-error').addClass('hidden'); });
});
