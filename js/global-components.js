//New Nav Animation
function initNewNav() {
  const trigger = document.querySelector('[data-nav-trigger]');
  const modal   = document.querySelector('[data-nav-modal-main]');

  if (!trigger || !modal) return;

  const lineTop = trigger.querySelector('[data-line="top"]');
  const lineMid = trigger.querySelector('[data-line="mid"]');
  const lineBot = trigger.querySelector('[data-line="bot"]');
  const hasLines = lineTop && lineMid && lineBot;

  // SVG transform-origin for rotations: center of each rect
  // top: y=0 h=1 → cy=0.5, mid: y=5 h=1 → cy=5.5, bot: y=10 h=1 → cy=10.5
  if (hasLines) {
    gsap.set(lineTop, { transformOrigin: '8.5px 0.5px' });
    gsap.set(lineMid, { transformOrigin: '8.5px 5.5px' });
    gsap.set(lineBot, { transformOrigin: '8.5px 10.5px' });
  }

  let isOpen = false;
  let tl = null;
  let btnTl = null;

  function measure(el) {
    const s = el.style;
    const prev = { visibility: s.visibility, opacity: s.opacity, height: s.height };
    Object.assign(s, { visibility: 'visible', opacity: '0', height: 'auto', pointerEvents: 'auto' });
    const h = el.getBoundingClientRect().height;
    Object.assign(s, prev);
    return h;
  }

  // ——— Button states ———
  function btnToPlus() {
    if (!hasLines) return;
    if (btnTl) btnTl.kill();
    btnTl = gsap.timeline({ defaults: { duration: 0.25, ease: 'power2.inOut' } });
    // top moves to center and rotates 90° (vertical bar of plus)
    btnTl.to(lineTop, { y: 5, rotation: 90 }, 0);
    // mid stays as horizontal bar
    btnTl.to(lineMid, { y: 0 }, 0);
    // bot fades out
    btnTl.to(lineBot, { autoAlpha: 0, y: -5 }, 0);
  }

  function btnToMinus() {
    if (!hasLines) return;
    if (btnTl) btnTl.kill();
    btnTl = gsap.timeline({ defaults: { duration: 0.25, ease: 'power2.inOut' } });
    // top fades out
    btnTl.to(lineTop, { autoAlpha: 0 }, 0);
    // mid stays centered as the minus
    btnTl.to(lineMid, { y: 0, rotation: 0, autoAlpha: 1 }, 0);
    // bot fades out
    btnTl.to(lineBot, { autoAlpha: 0 }, 0);
  }

  function btnToDefault() {
    if (!hasLines) return;
    if (btnTl) btnTl.kill();
    btnTl = gsap.timeline({ defaults: { duration: 0.25, ease: 'power2.inOut' } });
    btnTl.to(lineTop, { y: 0, rotation: 0, autoAlpha: 1 }, 0);
    btnTl.to(lineMid, { y: 0, rotation: 0, autoAlpha: 1 }, 0);
    btnTl.to(lineBot, { y: 0, autoAlpha: 1 }, 0);
  }

  function openNav() {
    if (tl) tl.kill();
    isOpen = true;
    btnToMinus();

    const modalH = measure(modal);
    gsap.set(modal, { height: 0, overflow: 'hidden', autoAlpha: 1 });

    tl = gsap.timeline();
    tl.to(modal, { height: modalH, duration: 0.5, ease: 'power3.out' });
    tl.set(modal, { height: 'auto', overflow: '' });
  }

  function closeNav() {
    if (tl) tl.kill();
    isOpen = false;
    btnToDefault();

    tl = gsap.timeline({
      onComplete() { gsap.set(modal, { autoAlpha: 0, height: 0 }); }
    });
    tl.to(modal, { height: 0, duration: 0.35, ease: 'power2.in' });
  }

  // Hover: plus on enter, revert on leave (only when closed)
  trigger.addEventListener('mouseenter', () => { if (!isOpen) btnToPlus(); });
  trigger.addEventListener('mouseleave', () => { if (!isOpen) btnToDefault(); });

  trigger.addEventListener('click', () => isOpen ? closeNav() : openNav());
}

document.addEventListener('DOMContentLoaded', initNewNav);

// Nav logo color based on current section
function initNavLogoColor() {
  const logo = document.querySelector('[data-nav-logo-wrapper]');
  const sections = document.querySelectorAll('[data-nav-color]');

  if (!logo || !sections.length) return;

  function getCurrentColor() {
    const logoMid = logo.getBoundingClientRect().top + logo.getBoundingClientRect().height / 2;
    let active = null;
    sections.forEach(section => {
      const { top, bottom } = section.getBoundingClientRect();
      if (top <= logoMid && bottom > logoMid) active = section;
    });
    return active ? active.dataset.navColor : '#193157';
  }

  function update() {
    const color = getCurrentColor();
    gsap.to(logo, { color, duration: 0.3, ease: 'power2.out', overwrite: true });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

document.addEventListener('DOMContentLoaded', initNavLogoColor);

// Wordmark scroll-out animation
function initWordmarkAnim() {
  const wrapper = document.querySelector('[data-anim-wordmark]');
  if (!wrapper) return;

  const split = new SplitText(wrapper, { type: 'chars', specialChars: [' '] });
  const clipH = (wrapper.parentElement || wrapper).getBoundingClientRect().height;

  // Set initial state
  gsap.set(split.chars, { y: 0, autoAlpha: 1 });

  let hidden = false;
  let tl = null;

  function hideWordmark() {
    if (hidden) return;
    hidden = true;
    if (tl) tl.kill();
    tl = gsap.timeline();
    tl.to(split.chars, {
      y: clipH,
      autoAlpha: 0,
      duration: 0.4,
      ease: 'power2.in',
      stagger: { each: 0.025, from: 'end' }
    });
  }

  function showWordmark() {
    if (!hidden) return;
    hidden = false;
    if (tl) tl.kill();
    tl = gsap.timeline();
    tl.to(split.chars, {
      y: 0,
      autoAlpha: 1,
      duration: 0.4,
      ease: 'power2.out',
      stagger: { each: 0.025, from: 'start' }
    });
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) hideWordmark();
    else showWordmark();
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', initWordmarkAnim);

// ——— Reusable word reveal animation ———
// Usage:
//   animateWords(elements)              → creates its own timeline, triggers immediately
//   animateWords(elements, tl, "< 0.1") → appends to an existing timeline at the given position
//
// elements: a selector string, Element, or NodeList
// Returns the SplitText instance so callers can reference split.words / split.revert()

function animateWords(elements, tl, position) {
  const targets = typeof elements === 'string'
    ? document.querySelectorAll(elements)
    : elements;

  if (!targets || (targets.length !== undefined && !targets.length)) return null;

  const split = new SplitText(targets, { type: 'words', mask: 'words' });
  gsap.set(split.words, { yPercent: 110 });

  const tweenVars = {
    yPercent: 0,
    stagger: 0.075,
    ease: 'expo.out',
    duration: 0.8
  };

  if (tl) {
    tl.to(split.words, tweenVars, position);
  } else {
    gsap.to(split.words, tweenVars);
  }

  return split;
}


// -----------------------------------------
// COLLECTIVE SWIPER
// -----------------------------------------
function initSwiperSlider() {
  const slug = window.location.pathname.split('/').filter(Boolean).pop();
  const swiperSliderGroups = document.querySelectorAll("[data-swiper-group]");

  swiperSliderGroups.forEach((swiperGroup) => {
    const swiperSliderWrap = swiperGroup.querySelector("[data-swiper-wrap]");
    if(!swiperSliderWrap) return;

    const prevButton = swiperGroup.querySelector("[data-swiper-prev]");
    const nextButton = swiperGroup.querySelector("[data-swiper-next]");

    const originalSlides = Array.from(swiperSliderWrap.querySelectorAll('.swiper-slide'));
    const matchIndex = slug
      ? originalSlides.findIndex(s => s.dataset.memberSlug === slug)
      : -1;
    const resolvedIndex = matchIndex !== -1 ? matchIndex : 4;

    const swiper = new Swiper(swiperSliderWrap, {
      slidesPerView: 7,
      initialSlide: resolvedIndex,
      speed: 600,
      mousewheel: false,
      grabCursor: true,
      centeredSlides: true,
      loop: true,
      breakpoints: {
        320: {
          slidesPerView: 1.5,
          centeredSlides: false,
          initialSlide: matchIndex !== -1 ? matchIndex : 0,
        },
        480: {
          slidesPerView: 3,
          centeredSlides: false,
          initialSlide: matchIndex !== -1 ? matchIndex : 0,
        },
        568: {
          slidesPerView: 3,
          centeredSlides: true,
          initialSlide: resolvedIndex,
        },
        992: {
          slidesPerView: 7,
        }
      },
      navigation: {
        nextEl: nextButton,
        prevEl: prevButton,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: false,
      },
      on: {
        init: function() {
          const active = this.slides[this.activeIndex];
          if (!active) return;
          document.querySelector('[data-member-name]').textContent = active.querySelector('.member-name-source')?.textContent || '';
          document.querySelector('[data-member-bio]').textContent = active.querySelector('.member-bio-source')?.textContent || '';
          document.querySelector('[data-member-role]').textContent = active.querySelector('.member-role-source')?.textContent || '';
        },
        slideChangeTransitionStart: function() {
          this.slides.forEach(slide => {
            slide.style.width = '';
            slide.style.height = '';
          });
          const active = this.slides[this.activeIndex];

          document.querySelector('[data-member-name]').textContent = active.querySelector('.member-name-source')?.textContent || '';
          document.querySelector('[data-member-bio]').textContent = active.querySelector('.member-bio-source')?.textContent || '';
          document.querySelector('[data-member-role]').textContent = active.querySelector('.member-role-source')?.textContent || '';
        }
      },
    });
  });
}

// Initialize Swiper Slider Setup
document.addEventListener('DOMContentLoaded', () => {
  initSwiperSlider();
});


// -----------------------------------------
// SLIDER CONTRAST-ADAPTIVE HEADING
// -----------------------------------------
// When the current slider slide has [data-low-contrast], set .crisp-header__h1
// to #193157. Clears when a slide without that attribute becomes current.

(function () {
  const LOW_CONTRAST_COLOR = '#193157';

  function updateHeadingColor(slide) {
    const heading = document.querySelector('.crisp-header__h1');
    if (!heading) return;

    const target = slide.hasAttribute('data-low-contrast') ? LOW_CONTRAST_COLOR : '#f9fafa';

    gsap.to(heading, {
      color: target,
      duration: 1,
      ease: 'cubic-bezier(0.625, 0.05, 0, 1)',
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Set initial state from whichever slide starts as current
    const initial = document.querySelector('[data-slideshow="slide"].is--current');
    if (initial) updateHeadingColor(initial);

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        const el = mutation.target;
        if (el.matches('[data-slideshow="slide"]') && el.classList.contains('is--current')) {
          updateHeadingColor(el);
          break;
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true,
    });
  });
})();