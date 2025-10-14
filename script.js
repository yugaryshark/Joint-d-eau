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
