(function universalWebPresentation(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WebPresentation = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function webPresentationFactory() {
  'use strict';

  const KEY_ACTIONS = Object.freeze({
    ArrowRight: 'NEXT', PageDown: 'NEXT', ' ': 'NEXT',
    ArrowLeft: 'PREVIOUS', PageUp: 'PREVIOUS',
    Home: 'FIRST', End: 'LAST', f: 'FULLSCREEN', F: 'FULLSCREEN',
  });

  function actionForKey(key) { return KEY_ACTIONS[key] || null; }

  function createNavigationState(slideCount, currentIndex = 0, pendingPerSlide = []) {
    const count = Math.max(0, Number(slideCount) || 0);
    const index = count ? Math.max(0, Math.min(count - 1, Number(currentIndex) || 0)) : 0;
    return Object.freeze({ slideCount: count, currentIndex: index, pendingPerSlide: Array.from({ length: count }, (_, slide) => Math.max(0, Number(pendingPerSlide[slide]) || 0)) });
  }

  function reduceNavigationState(state, action) {
    const pending = state.pendingPerSlide.slice(); let currentIndex = state.currentIndex;
    if (action === 'NEXT' && pending[currentIndex] > 0) pending[currentIndex] -= 1;
    else if (action === 'NEXT') currentIndex = Math.min(state.slideCount - 1, currentIndex + 1);
    else if (action === 'PREVIOUS') currentIndex = Math.max(0, currentIndex - 1);
    else if (action === 'FIRST') currentIndex = 0;
    else if (action === 'LAST') currentIndex = Math.max(0, state.slideCount - 1);
    return createNavigationState(state.slideCount, currentIndex, pending);
  }

  function createPresentationController(doc, win) {
    if (!doc || !win) throw new TypeError('A browser document and window are required');
    const slides = Array.from(doc.querySelectorAll('.web-slide'));
    const previousButton = doc.querySelector('[data-action="previous"]');
    const nextButton = doc.querySelector('[data-action="next"]');
    const fullscreenButton = doc.querySelector('[data-action="fullscreen"]');
    const currentLabel = doc.querySelector('[data-current-slide]');
    const totalLabel = doc.querySelector('[data-total-slides]');
    const progressBar = doc.querySelector('[data-progress-bar]');
    const reducedMotion = Boolean(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const listeners = [];
    let currentIndex = 0;

    function listen(target, type, handler) {
      if (!target || !target.addEventListener) return;
      target.addEventListener(type, handler);
      listeners.push(() => target.removeEventListener(type, handler));
    }

    function progressiveItems(slide) {
      return Array.from(slide ? slide.querySelectorAll('[data-progressive-item]') : []);
    }

    function prepareSlideInteractions(slide) {
      const items = progressiveItems(slide);
      items.forEach((item) => {
        const showFirstStep = slide.dataset.interactionMethod === 'STEP_SEQUENCE' && Number(item.dataset.step) === 1;
        const revealed = reducedMotion || showFirstStep;
        item.classList.remove('is-pending', 'is-revealed');
        item.classList.add(revealed ? 'is-revealed' : 'is-pending');
        item.setAttribute('aria-hidden', revealed ? 'false' : 'true');
      });
      Array.from(slide.querySelectorAll('[data-quiz-answer]')).forEach((answer) => {
        answer.classList.toggle('is-concealed', !reducedMotion);
        answer.setAttribute('aria-hidden', reducedMotion ? 'false' : 'true');
      });
    }

    function revealNext() {
      const slide = slides[currentIndex];
      const next = progressiveItems(slide).find((item) => item.classList.contains('is-pending'));
      if (!next) return false;
      next.classList.remove('is-pending');
      next.classList.add('is-revealed');
      next.setAttribute('aria-hidden', 'false');
      return true;
    }

    function updateUi() {
      slides.forEach((slide, index) => {
        const active = index === currentIndex;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      if (currentLabel) currentLabel.textContent = String(currentIndex + 1);
      if (totalLabel) totalLabel.textContent = String(slides.length);
      if (progressBar) {
        const percent = slides.length ? ((currentIndex + 1) / slides.length) * 100 : 0;
        progressBar.style.width = `${percent}%`;
        progressBar.parentElement?.setAttribute('aria-valuenow', String(Math.round(percent)));
      }
      if (previousButton) previousButton.disabled = currentIndex === 0;
      if (nextButton) nextButton.disabled = currentIndex >= slides.length - 1 && !progressiveItems(slides[currentIndex]).some((item) => item.classList.contains('is-pending'));
      win.history?.replaceState?.(null, '', `#slide-${currentIndex + 1}`);
    }

    function goTo(index) {
      if (!slides.length) return;
      currentIndex = Math.max(0, Math.min(slides.length - 1, Number(index) || 0));
      updateUi();
    }
    function next() { if (!revealNext()) goTo(currentIndex + 1); else updateUi(); }
    function previous() { goTo(currentIndex - 1); }
    function first() { goTo(0); }
    function last() { goTo(slides.length - 1); }
    function fullscreen() {
      if (doc.fullscreenElement && doc.exitFullscreen) return doc.exitFullscreen();
      const target = doc.querySelector('.presentation-shell') || doc.documentElement;
      return target.requestFullscreen ? target.requestFullscreen() : null;
    }

    function onKeydown(event) {
      const tag = String(event.target?.tagName || '').toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && event.key !== 'Escape') return;
      const action = actionForKey(event.key);
      if (!action) return;
      event.preventDefault();
      ({ NEXT: next, PREVIOUS: previous, FIRST: first, LAST: last, FULLSCREEN: fullscreen })[action]();
    }

    function prepareControls() {
      listen(previousButton, 'click', previous);
      listen(nextButton, 'click', next);
      listen(fullscreenButton, 'click', fullscreen);
      listen(doc, 'keydown', onKeydown);
      Array.from(doc.querySelectorAll('[data-action="reveal-answer"]')).forEach((button) => listen(button, 'click', () => {
        const answer = doc.getElementById(button.getAttribute('aria-controls'));
        if (!answer) return;
        const reveal = answer.classList.contains('is-concealed');
        answer.classList.toggle('is-concealed', !reveal);
        answer.setAttribute('aria-hidden', reveal ? 'false' : 'true');
        button.setAttribute('aria-expanded', reveal ? 'true' : 'false');
      }));
      Array.from(doc.querySelectorAll('[data-highlight-target]')).forEach((button) => listen(button, 'click', () => {
        const target = doc.getElementById(button.dataset.highlightTarget);
        if (target) target.classList.toggle('is-highlighted');
      }));
      Array.from(doc.querySelectorAll('[data-before-after-control]')).forEach((control) => listen(control, 'input', () => {
        const target = doc.getElementById(control.getAttribute('aria-controls'));
        if (target) target.style.setProperty('--comparison-position', `${control.value}%`);
      }));
    }

    function initialIndex() {
      const query = new URLSearchParams(win.location?.search || '').get('slide');
      const hash = String(win.location?.hash || '').match(/slide-(\d+)/);
      const requested = Number(query || hash?.[1] || 1);
      return Number.isFinite(requested) ? requested - 1 : 0;
    }

    function audit() {
      const shell = doc.querySelector('.presentation-shell');
      const interactiveTargets = Array.from(doc.querySelectorAll('button, input, [tabindex]'));
      const minTarget = interactiveTargets.reduce((min, item) => {
        const rect = item.getBoundingClientRect();
        return Math.min(min, rect.width || Infinity, rect.height || Infinity);
      }, Infinity);
      const textElements = Array.from(doc.querySelectorAll('.web-slide h1, .web-slide h2, .web-slide h3, .web-slide p, .web-slide li, .web-slide button'));
      const minFontSize = textElements.reduce((min, item) => Math.min(min, parseFloat(win.getComputedStyle(item).fontSize) || Infinity), Infinity);
      return {
        slideCount: slides.length,
        activeSlideCount: slides.filter((slide) => slide.classList.contains('is-active')).length,
        currentSlide: currentIndex + 1,
        aspectRatio: shell ? shell.getBoundingClientRect().width / Math.max(shell.getBoundingClientRect().height, 1) : 0,
        overflowSlides: slides.filter((slide) => slide.scrollWidth > slide.clientWidth + 1 || slide.scrollHeight > slide.clientHeight + 1).map((slide) => slide.dataset.slideIndex),
        minFontSize: Number.isFinite(minFontSize) ? minFontSize : null,
        minInteractiveTarget: Number.isFinite(minTarget) ? minTarget : null,
        brokenImages: Array.from(doc.images || []).filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute('src')),
        pendingProgressiveItems: doc.querySelectorAll('.is-pending').length,
        reducedMotion,
        javascriptErrors: Array.from(win.__webPresentationErrors || []),
      };
    }

    doc.documentElement.classList.remove('no-js');
    doc.documentElement.classList.add('js-enabled');
    slides.forEach(prepareSlideInteractions);
    prepareControls();
    goTo(initialIndex());
    return Object.freeze({
      next, previous, first, last, goTo, revealNext, fullscreen, audit,
      getState: () => Object.freeze({ currentIndex, currentSlide: currentIndex + 1, slideCount: slides.length, reducedMotion }),
      destroy: () => listeners.splice(0).forEach((remove) => remove()),
    });
  }

  function autoStart(doc, win) {
    if (!doc || !win) return null;
    win.__webPresentationErrors = win.__webPresentationErrors || [];
    win.addEventListener('error', (event) => win.__webPresentationErrors.push(String(event.message || event.error || 'Unknown JavaScript error')));
    const start = () => {
      if (!doc.querySelector('.presentation-shell')) return;
      win.webPresentationController = createPresentationController(doc, win);
      win.WebPresentationAudit = Object.freeze({ run: () => win.webPresentationController.audit() });
    };
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
    return true;
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') autoStart(document, window);
  return Object.freeze({ KEY_ACTIONS, actionForKey, createNavigationState, reduceNavigationState, createPresentationController, autoStart });
}));
