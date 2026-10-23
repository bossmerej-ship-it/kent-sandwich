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

function initTimurAbout() {
  const hours = document.getElementById('visit-hours');
  const status = document.getElementById('visit-status');
  function updateHours() {
    const result = getOpeningStatus(new Date(), hours.dataset.open, hours.dataset.close);
    status.textContent = result.text;
    status.classList.remove('hidden');
    status.classList.toggle('success', result.open);
  }
  function refreshHours() {
    updateHours();
    window.setTimeout(refreshHours, getNextMinuteDelay(new Date()));
  }
  refreshHours();
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) updateHours();
  });

  const links = Array.from(document.querySelectorAll('.gallery-link'));
  const dialog = document.getElementById('gallery-dialog');
  const image = document.getElementById('gallery-dialog-image');
  const caption = document.getElementById('gallery-dialog-caption');
  const error = document.getElementById('gallery-error');
  let photoIndex = 0;
  let opener = null;

  function showPhoto(index) {
    photoIndex = index;
    const link = links[index];
    image.alt = link.querySelector('img').alt;
    image.src = link.getAttribute('href');
    caption.textContent = document.getElementById(link.dataset.captionId).textContent;
    document.getElementById('gallery-position').textContent = (index + 1) + ' of ' + links.length;
    error.classList.add('hidden');
  }
  for (let index = 0; index < links.length; index++) {
    links[index].addEventListener('click', function (event) {
      event.preventDefault();
      opener = links[index];
      showPhoto(index);
      dialog.showModal();
    });
  }
  document.getElementById('gallery-next').addEventListener('click', function () {
    showPhoto(getNextPhotoIndex(photoIndex, 1, links.length));
  });
  document.getElementById('gallery-previous').addEventListener('click', function () {
    showPhoto(getNextPhotoIndex(photoIndex, -1, links.length));
  });
  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 1 : -1;
      showPhoto(getNextPhotoIndex(photoIndex, step, links.length));
    }
  });
  dialog.addEventListener('close', function () {
    if (opener) opener.focus();
  });
  image.addEventListener('error', function () { error.classList.remove('hidden'); });
  image.addEventListener('load', function () { error.classList.add('hidden'); });
}

if (document.body.dataset.page === 'about') {
  initTimurAbout();
}
