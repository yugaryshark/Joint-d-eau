(() => {
  const track = document.querySelector('.slider-track');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.querySelector('.slider-control.prev');
  const nextBtn = document.querySelector('.slider-control.next');
  const indicators = Array.from(document.querySelectorAll('.indicator'));
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
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Controls
  nextBtn.addEventListener('click', () => { pauseAutoplay(); next(); });
  prevBtn.addEventListener('click', () => { pauseAutoplay(); prev(); });

  indicators.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = parseInt(e.currentTarget.dataset.index, 10);
      pauseAutoplay();
      goTo(i);
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

  window.addEventListener('resize', () => { goTo(current); });
})();
// Lightbox: full-screen preview with background blur
const images = Array.from(document.querySelectorAll('.slide img'));
const lightbox = document.createElement('div');
lightbox.id = 'lightbox'; // correspond au CSS (#lightbox)

const lightboxImg = document.createElement('img');
lightboxImg.className = 'lightbox-img';

const closeBtn = document.createElement('button');
closeBtn.className = 'close'; // correspond au sélecteur #lightbox .close
closeBtn.setAttribute('aria-label', 'Fermer');
closeBtn.innerHTML = '×';

// caption and controls in lightbox
const captionEl = document.createElement('div');
captionEl.className = 'lightbox-caption';

const lbPrev = document.createElement('button');
lbPrev.className = 'lightbox-prev';
lbPrev.setAttribute('aria-label', 'Image précédente');
lbPrev.innerHTML = '‹';

const lbNext = document.createElement('button');
lbNext.className = 'lightbox-next';
lbNext.setAttribute('aria-label', 'Image suivante');
lbNext.innerHTML = '›';

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
  // afficher le fond immédiatement, puis afficher l'image quand elle est chargée
  lightbox.classList.add('active');
  document.body.classList.add('lightbox-open');
  previouslyFocused = document.activeElement;
  closeBtn.focus();

  // retirer toute classe loaded précédente, setter la source et attendre le chargement
  lightboxImg.classList.remove('loaded');
  lightboxImg.src = src;
}

function closeLightbox() {
  // enlever l'état loaded pour déclencher la transition de sortie
  lightboxImg.classList.remove('loaded');
  // Fermer le conteneur (le CSS gère la transition d'opacité)
  lightbox.classList.remove('active');
  document.body.classList.remove('lightbox-open');
  if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
    previouslyFocused.focus();
  }
}

function showNext() {
  activeIndex = (activeIndex + 1) % images.length;
  // reset loaded state then set src (onload gèrera caption)
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

// Keyboard handling when lightbox open
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
});

// Central handler pour chaque chargement d'image (ouvre la transition et met à jour la caption)
lightboxImg.addEventListener('load', () => {
  // animer l'image
  requestAnimationFrame(() => lightboxImg.classList.add('loaded'));
  // mettre à jour la légende
  const slide = images[activeIndex].closest('.slide');
  const caption = slide ? (slide.querySelector('.slide-caption')?.textContent || '') : '';
  captionEl.textContent = caption;
});

