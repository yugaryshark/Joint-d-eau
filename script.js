document.addEventListener('DOMContentLoaded', function() {
(() => {
  const track = document.querySelector('.slider-track');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.querySelector('.slider-control.prev');
  const nextBtn = document.querySelector('.slider-control.next');
  if (!track || slides.length === 0) return;
  const indicators = Array.from(document.querySelectorAll('.indicator'));
  const viewport = document.querySelector('.slider-viewport');
  let current = 0;
  let autoplayInterval = null;
  const AUTOPLAY_DELAY = 4000;

  function goTo(index) {
    index = (index + slides.length) % slides.length;
    const offset = -index * 100;
    track.style.transform = `translateX(${offset}%)`;

    slides.forEach((s, i) => {
      const hidden = i !== index;
      s.setAttribute('aria-hidden', hidden ? 'true' : 'false');
      s.querySelector('img').tabIndex = hidden ? -1 : 0;
    });

    indicators.forEach((btn, i) => {
      btn.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    current = index;
    adjustViewportHeight(index);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  if (nextBtn) nextBtn.addEventListener('click', () => { pauseAutoplay(); next(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { pauseAutoplay(); prev(); });

  indicators.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      const i = parseInt(e.currentTarget.dataset.index, 10);
      if (Number.isFinite(i)) {
        pauseAutoplay();
        goTo(i);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { pauseAutoplay(); next(); }
    if (e.key === 'ArrowLeft') { pauseAutoplay(); prev(); }
  });

  function startAutoplay() {
    if (autoplayInterval) return;
    autoplayInterval = setInterval(next, AUTOPLAY_DELAY);
  }

  function pauseAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  const slider = document.querySelector('.slider');
  slider.addEventListener('mouseenter', pauseAutoplay);
  slider.addEventListener('focusin', pauseAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);
  slider.addEventListener('focusout', startAutoplay);

  goTo(0);
  startAutoplay();

  slides.forEach(s => {
    const img = s.querySelector('img');
    if (!img) return;
    const nw = img.naturalWidth || img.width;
    const nh = img.naturalHeight || img.height;
    if (nw && nh) {
      img.setAttribute('width', nw);
      img.setAttribute('height', nh);
      img.style.aspectRatio = `${nw} / ${nh}`;
    }
  });

  function adjustViewportHeight(index) {
    const img = slides[index].querySelector('img');
    if (!img) return;
    const vw = viewport.clientWidth;
    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;
    if (!naturalW || !naturalH) {
      setTimeout(() => { viewport.style.height = img.clientHeight + 'px'; }, 50);
      return;
    }
    const renderedH = Math.round((naturalH / naturalW) * vw);
    let maxLandscapeH = 0;
    slides.forEach((sl) => {
      const im = sl.querySelector('img');
      if (!im) return;
      const nw = im.naturalWidth || im.width;
      const nh = im.naturalHeight || im.height;
      if (nw && nh && nw >= nh) {
        const h = Math.round((nh / nw) * viewport.clientWidth);
        if (h > maxLandscapeH) maxLandscapeH = h;
      }
    });
    const cap = maxLandscapeH || renderedH;
    const finalH = Math.min(renderedH, cap);
    viewport.style.height = finalH + 'px';
  }

  function debounce(fn, wait = 120) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  const onResize = debounce(() => { adjustViewportHeight(current); });
  window.addEventListener('resize', onResize);

  adjustViewportHeight(0);
})();
const images = Array.from(document.querySelectorAll('.slide img'));
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';

const lightboxImg = document.createElement('img');
lightboxImg.className = 'lightbox-img';

const closeBtn = document.createElement('button');
closeBtn.className = 'close'; 
closeBtn.setAttribute('aria-label', 'Fermer');
closeBtn.innerHTML = '×';
closeBtn.type = 'button';

const captionEl = document.createElement('div');
captionEl.className = 'lightbox-caption';

const lbPrev = document.createElement('button');
lbPrev.className = 'lightbox-prev';
lbPrev.setAttribute('aria-label', 'Image précédente');
lbPrev.innerHTML = '‹';
lbPrev.type = 'button';

const lbNext = document.createElement('button');
lbNext.className = 'lightbox-next';
lbNext.setAttribute('aria-label', 'Image suivante');
lbNext.innerHTML = '›';
lbNext.type = 'button';

lightbox.appendChild(lightboxImg);
lightbox.appendChild(captionEl);
lightbox.appendChild(lbPrev);
lightbox.appendChild(lbNext);
lightbox.appendChild(closeBtn);
document.body.appendChild(lightbox);

let activeIndex = 0;
let previouslyFocused = null;

function openLightbox(index) {
  activeIndex = (index + images.length) % images.length;
  const src = images[activeIndex].src;
  lightbox.classList.add('active');
  document.body.classList.add('lightbox-open');
  previouslyFocused = document.activeElement;
  closeBtn.focus();

  lightboxImg.classList.remove('loaded');
  lightboxImg.src = src;
}

function closeLightbox() {
  lightboxImg.classList.remove('loaded');
  lightbox.classList.remove('active');
  document.body.classList.remove('lightbox-open');
  if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
    previouslyFocused.focus();
  }
}

function showNext() {
  activeIndex = (activeIndex + 1) % images.length;
  lightboxImg.classList.remove('loaded');
  lightboxImg.src = images[activeIndex].src;
}

function showPrev() {
  activeIndex = (activeIndex - 1 + images.length) % images.length;
  lightboxImg.classList.remove('loaded');
  lightboxImg.src = images[activeIndex].src;
}

images.forEach((img, idx) => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => openLightbox(idx));
});

closeBtn.addEventListener('click', closeLightbox);

lbNext.addEventListener('click', () => { showNext(); });
lbPrev.addEventListener('click', () => { showPrev(); });

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
});

lightboxImg.addEventListener('load', () => {
  requestAnimationFrame(() => lightboxImg.classList.add('loaded'));
  const slide = images[activeIndex].closest('.slide');
  const caption = slide ? (slide.querySelector('.slide-caption')?.textContent || '') : '';
  captionEl.textContent = caption;
});
});

