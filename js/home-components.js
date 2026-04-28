gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)

console.log("home-components script loaded")
// -----------------------------------------
// LOADING EFFECT //
// -----------------------------------------
CustomEase.create("slideshow-wipe", "0.625, 0.05, 0, 1");

// Loading Animation
function initCrispLoadingAnimation() {

  const smallElements = document.querySelectorAll(".nav-logo__link, .nav-links__wrapper");
  const container = document.querySelector(".crisp-header");
  const heading = container.querySelectorAll(".h1__hero");
  const revealImages = container.querySelectorAll(".crisp-loader__group > *");
  const isScaleUp = container.querySelectorAll(".crisp-loader__media");
  const isScaleDown = container.querySelectorAll(".crisp-loader__media .is--scale-down");
  const isRadius = container.querySelectorAll(".crisp-loader__media.is--scaling.is--radius");
  
  
  /* GSAP Timeline */
  const tl = gsap.timeline({
    defaults: {
      ease: "expo.inOut",
    },
    onStart: () => {
      window.scrollTo(0, 0);
      container.classList.remove('is--hidden');
      document.body.style.overflow = 'hidden';
    },
    onComplete: () => {
      document.body.style.overflow = '';
    }
  });
  
  /* Start of Timeline */
  if (revealImages.length) {
    tl.fromTo(revealImages, {
      xPercent: 500
    }, {
      xPercent: -500,
      duration: 2.5,
      stagger: 0.05
    });
  }
  
  if (isScaleDown.length) {
    tl.to(isScaleDown, {
      scale: 0.5,
      duration: 2,
      stagger: {
        each: 0.05,
        from: "edges",
        ease: "none"
      },
      onComplete: () => {
        if (isRadius) {
          isRadius.forEach(el => el.classList.remove('is--radius'));
        }
      }
    }, "-=0.1");
  }
  
  
  const mainHeaderImg = container.querySelector("[data-main-header-img]");
  if (mainHeaderImg) {
    gsap.set(mainHeaderImg, { opacity: 0 });
  }

  const scalingMedia = container.querySelector(".crisp-loader__media");
  const scalingSingle = scalingMedia ? scalingMedia.closest(".crisp-loader__single") : null;

  if (isScaleUp.length) {
    const vw = window.innerWidth;
    const scaleUpH = vw > 991 ? "100dvh"
                   : vw > 767 ? "960px"
                   : vw > 567 ? "960px"
                   : "880px";

    // Animate the scaling element's parent to align its top with the viewport top
    if (scalingSingle) {
      tl.fromTo(scalingSingle,
        { y: 0 },
        {
          y: () => -scalingSingle.getBoundingClientRect().top,
          duration: 2,
          ease: "expo.inOut",
          onComplete: () => {
            if (mainHeaderImg) gsap.set(mainHeaderImg, { opacity: 1 });
          }
        },
        "< 0.5"
      );
    }

    tl.fromTo(isScaleUp, {
      width: "10em",
      height: "10em"
    }, {
      width: "100vw",
      height: scaleUpH,
      duration: 2
    }, "<");
  }



  if (heading.length) {
    split = animateWords(heading, tl, "-=0.8");
  }


  if (smallElements.length) {
    tl.set('.nav-logo__link', { color: '#f9fafa' });
    tl.from(smallElements, {
      opacity: 0,
      ease: "power1.inOut",
      duration: 1
    }, "-=0.4");
  }
  
  
  // Featured work elements
  const fwTitle      = container.querySelector('.featured-work');
  const fwMock       = container.querySelector('.fw-mock__container');
  const fwInfo       = container.querySelector('.fw-info__wrapper');
  const fwHeading    = container.querySelector('.h4__featured-work');
  const fwTags       = container.querySelectorAll('.fw-tags__container > *');

  if (fwTitle) animateWords(fwTitle, tl, '-=1');
  if (fwMock)  tl.from(fwMock, { autoAlpha: 0, duration: 1, ease: 'power2.out' }, '<');
  if (fwInfo)  tl.from(fwInfo, { width: 0, duration: 1, ease: 'power2.inOut', overflow: 'hidden' }, '-=0.9');
  if (fwHeading) animateWords(fwHeading, tl, '-=0.6');
  if (fwTags.length) {
    tl.from(fwTags, { autoAlpha: 0, yPercent: 30, duration: 0.4, ease: 'power2.out', stagger: 0.06 }, '-=0.6');
  }

  
  // Simulated cursor sweep: drive handleY from 15% above center to 15% below
  // tl.call(function () {
  //   var vh = window.innerHeight;
  //   var startY = vh * 0.35; // 15% above center (50% - 15%)
  //   var endY   = vh * 0.65; // 15% below center (50% + 15%)
  //   var proxy  = { y: startY };
  //   gsap.to(proxy, {
  //     y: endY,
  //     duration: 2,
  //     ease: 'power1.inOut',
  //     onUpdate: function () {
  //       if (heroHandleY) heroHandleY(proxy.y);
  //       var ratio = (proxy.y - vh * 0.35) / (vh * 0.3);
  //       if (heroUpdateScrubber) heroUpdateScrubber(Math.max(0, Math.min(1, ratio)));
  //     }
  //   }, "-=0.6");
  // });

  tl.call(function () {
    container.classList.remove('is--loading');
  }, null, "+=0.45");
}

// Initialize Crisp Loading Animation
document.addEventListener('DOMContentLoaded', () => {
  document.fonts.ready.then(() => {
    initCrispLoadingAnimation();
  });
});


// -----------------------------------------
// HERO ANIMATIONS
// -----------------------------------------
var heroHandleY = null;
var heroUpdateScrubber = null;

document.addEventListener('DOMContentLoaded', function () {
  (function () {
    var slotClient = document.querySelector('[data-fw-client-slot]');
    var slotTags   = document.querySelector('[data-fw-tags-slot]');
    var slotImage  = document.querySelector('[data-fw-image]');

    var projects = [];

    document.querySelectorAll('[data-fw-images]').forEach(function (el) {
      var urls = (el.dataset.fwImages || '')
        .split(',')
        .map(function (u) { return u.trim(); })
        .filter(Boolean);

      if (!urls.length) return;

      projects.push({
        client: el.dataset.fwClient || '',
        tags:   el.dataset.fwTags   || '',
        images: urls
      });
    });

    if (!projects.length || !slotImage) return;

    var currentProject = -1;
    var currentImage   = -1;
    var clientSplit    = null;

    function swap(projectIdx, imageIdx) {
      var p = projects[projectIdx];
      if (!p) return;

      if (projectIdx !== currentProject) {
        if (slotClient) {
          if (clientSplit) { clientSplit.revert(); clientSplit = null; }
          slotClient.textContent = p.client;
          clientSplit = animateWords(slotClient);
        }

        if (slotTags) {
          var tagItems = p.tags.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
          var tagEls = slotTags.querySelectorAll('*');
          tagEls.forEach(function (el, i) {
            el.textContent = tagItems[i] || '';
          });
        }

        currentProject = projectIdx;
      }

      if (imageIdx !== currentImage && p.images[imageIdx]) {
        slotImage.src = p.images[imageIdx];
        currentImage  = imageIdx;

      }
    }

    function handleY(clientY) {
      var totalImages = projects.reduce(function (a, p) { return a + p.images.length; }, 0);
      var container = document.querySelector('[data-hero-anim-wrapper]');
      var rect = container.getBoundingClientRect();
      var ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      var flatIdx = Math.min(Math.floor(ratio * totalImages), totalImages - 1);

      var count = 0;
      for (var i = 0; i < projects.length; i++) {
        count += projects[i].images.length;
        if (flatIdx < count) {
          var imageIdx = flatIdx - (count - projects[i].images.length);
          swap(i, imageIdx);
          break;
        }
      }
    }
    heroHandleY = handleY;

    // ——— Scrubber init ———
    var isMobileCheck = window.innerWidth <= 767;
    var scrubber     = isMobileCheck
                       ? document.querySelector('[data-hero-scrubber-mobile]')
                       : document.querySelector('[data-hero-scrubber]');
    var barTemplate  = scrubber ? scrubber.querySelector('[data-scrubber-bar]') : null;
    var ball         = scrubber ? scrubber.querySelector('[data-scrubber-ball]') : null;
    var scrubberBars = [];

    if (scrubber && barTemplate) {
      var totalImages = projects.reduce(function (a, p) { return a + p.images.length; }, 0);

      // Save template copy, remove all existing bars, then rebuild
      var templateCopy = barTemplate.cloneNode(true);
      scrubber.querySelectorAll('[data-scrubber-bar]').forEach(function (el) { el.remove(); });

      var barCount = isMobileCheck ? totalImages : totalImages * 4;
      for (var b = 0; b < barCount; b++) {
        var clone = templateCopy.cloneNode(true);
        scrubber.insertBefore(clone, ball); // keep ball last in DOM
        scrubberBars.push(clone);
      }
    }

    function updateScrubber(ratio) {
      if (!scrubber || !scrubberBars.length) return;

      var n        = scrubberBars.length;
      var ballPos  = ratio * scrubber.clientHeight;
      var sigma    = n * 0.18; // wave spread — tune this
      var activeI  = ratio * (n - 1);

      if (ball) gsap.to(ball, { y: ballPos, duration: 0.25, ease: 'power2.out' });

      scrubberBars.forEach(function (bar, i) {
        var dist      = Math.abs(i - activeI);
        var amplitude = Math.exp(-(dist * dist) / (2 * sigma * sigma));
        // amplitude 1 = fully long, 0 = base width
        gsap.to(bar, {
          width: 2 + amplitude * 2 + 'rem', // 2rem base → 4rem peak
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    }

    heroUpdateScrubber = updateScrubber;

    // Set initial state immediately
    swap(0, 0);

    if (!isMobileCheck) {
      updateScrubber(0);
      // ——— Desktop: cursor Y drives image swap ———
      document.addEventListener('mousemove', function (e) {
        handleY(e.clientY);
        var container = document.querySelector('[data-hero-anim-wrapper]');
        var rect      = container.getBoundingClientRect();
        var ratio     = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        updateScrubber(ratio);
      });
    } else {
      // ——— Mobile: drag anywhere on scrubber, ball follows, bars wave ———
      if (!scrubber || !scrubberBars.length || !ball) return;

      var n          = scrubberBars.length;
      var sigma      = n * 0.18;
      var scrubberW  = scrubber.clientWidth;
      var ballX      = 0; // current ball position 0..scrubberW
      var dragStartX = 0;
      var dragStartBallX = 0;

      function applyMobileBallX(x, instant) {
        var ratio  = Math.max(0, Math.min(1, x / scrubberW));
        var activeI = ratio * (n - 1);
        var gsapMethod = instant ? gsap.set.bind(gsap) : gsap.to.bind(gsap);

        // Move ball
        gsapMethod(ball, { x: x, duration: 0.2, ease: 'power2.out', overwrite: true });

        // Wave on bar heights
        scrubberBars.forEach(function (bar, i) {
          var dist      = Math.abs(i - activeI);
          var amplitude = Math.exp(-(dist * dist) / (2 * sigma * sigma));
          gsapMethod(bar, {
            height: 24 + amplitude * 40 + 'px',
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        });

        // Image swap
        var totalImages = projects.reduce(function (a, p) { return a + p.images.length; }, 0);
        var flatIdx = Math.min(Math.floor(ratio * totalImages), totalImages - 1);
        var count = 0;
        for (var i = 0; i < projects.length; i++) {
          count += projects[i].images.length;
          if (flatIdx < count) {
            swap(i, flatIdx - (count - projects[i].images.length));
            break;
          }
        }
      }

      // Clear any GSAP-set widths from desktop init, distribute evenly
      var barWidthPct = (100 / scrubberBars.length) + '%';
      scrubberBars.forEach(function (bar) {
        gsap.set(bar, { clearProps: 'width', flexShrink: 0, width: barWidthPct });
      });

      // Set initial ball position and wave instantly
      applyMobileBallX(0, true);

      var isDragging    = false;
      var velocity      = 0;  // px/ms
      var lastX         = 0;
      var lastT         = 0;
      var momentumTween = null;

      scrubber.addEventListener('touchstart', function (e) {
        scrubberW      = scrubber.clientWidth;
        dragStartX     = e.touches[0].clientX;
        dragStartBallX = ballX;
        isDragging     = true;
        velocity       = 0;
        lastX          = e.touches[0].clientX;
        lastT          = e.timeStamp;
        if (momentumTween) { momentumTween.kill(); momentumTween = null; }
        document.body.style.overflowY = 'hidden';
      }, { passive: true });

      scrubber.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        e.preventDefault();
        var now = e.timeStamp;
        var dt  = now - lastT;
        if (dt > 0) velocity = (e.touches[0].clientX - lastX) / dt; // px/ms
        lastX = e.touches[0].clientX;
        lastT = now;
        var dx = e.touches[0].clientX - dragStartX;
        ballX  = Math.max(0, Math.min(scrubberW, dragStartBallX + dx));
        applyMobileBallX(ballX);
      }, { passive: false });

      function endDrag() {
        isDragging = false;
        document.body.style.overflowY = '';

        // Momentum: project forward based on velocity, decelerate over time
        var momentumDist = velocity * 180; // 180ms worth of travel — tune this
        var targetX = Math.max(0, Math.min(scrubberW, ballX + momentumDist));
        var duration = Math.min(0.8, Math.abs(velocity) * 0.6 + 0.15);

        var proxy = { x: ballX };
        momentumTween = gsap.to(proxy, {
          x: targetX,
          duration: duration,
          ease: 'slideshow-wipe',
          onUpdate: function () {
            ballX = proxy.x;
            applyMobileBallX(ballX);
          },
          onComplete: function () {
            // Snap to nearest bar after momentum settles
            var ratio      = ballX / scrubberW;
            var snappedIdx = Math.round(ratio * (n - 1));
            ballX          = (snappedIdx / (n - 1)) * scrubberW;
            applyMobileBallX(ballX);
            momentumTween  = null;
          }
        });
      }

      scrubber.addEventListener('touchend', endDrag);
      scrubber.addEventListener('touchcancel', endDrag);
    }

  })();
});

// -----------------------------------------
// STICKY SECTION SCROLL
// -----------------------------------------
function initStickyTitleScroll() {
  const wraps = document.querySelectorAll('[data-sticky-title="wrap"]');
  
  wraps.forEach(wrap => {
    const headings = Array.from(wrap.querySelectorAll('[data-sticky-title="heading"]'));
    
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: "top 40%",
        end: "bottom bottom",
        scrub: true,
      }
    });
    
    const revealDuration = 0.7,
          exitDuration   = 0.5,
          overlapOffset  = 0.15;

    const splits = headings.map((heading) => {
      heading.setAttribute("aria-label", heading.textContent);
      const split = new SplitText(heading, { type: "words,chars" });
      split.words.forEach(word => word.setAttribute("aria-hidden", "true"));
      gsap.set(heading, { visibility: "visible" });
      return split;
    });

    // Build reveal timelines for all headings
    const revealTls = headings.map((_heading, index) => {
      const tl = gsap.timeline();
      tl.from(splits[index].words, {
        autoAlpha: 0,
        stagger: { amount: revealDuration, from: "start" },
        duration: revealDuration
      });
      return tl;
    });

    // Build exit timelines for non-last headings
    const exitTls = headings.slice(0, -1).map((_heading, index) => {
      const tl = gsap.timeline();
      tl.to(splits[index].words, {
        autoAlpha: 0,
        stagger: { amount: exitDuration, from: "end" },
        duration: exitDuration
      });
      return tl;
    });

    // Sequence: h0 reveal → h1 reveal (overlap) → coexist beat → h0 exit → h1 exit (offset) → display reveal
    masterTl
      .add(revealTls[0])
      .add(revealTls[1], `-=${overlapOffset}`)
      .add(exitTls[0], `+=0.3`)               // coexist beat before exits begin
      .add(exitTls[1], `-=${exitDuration - 0.2}`) // h1 exits slightly after h0 starts
      .set(headings[1], { display: 'none' })
      .add(revealTls[2], `-=${overlapOffset}`);
  });
}

// Initialize Sticky Title Scroll Effect
document.addEventListener("DOMContentLoaded", () => {
  initStickyTitleScroll();
});


// -----------------------------------------
// PAIN POINT TABS
// -----------------------------------------
function initTabSystem() {
  const wrappers = document.querySelectorAll('[data-tabs="wrapper"]');
  
  wrappers.forEach((wrapper) => {
    const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]');
    const visualItems = wrapper.querySelectorAll('[data-tabs="visual-item"]');
    
    const autoplay = wrapper.dataset.tabsAutoplay === "false";
    const autoplayDuration = parseInt(wrapper.dataset.tabsAutoplayDuration) || 5000;
    
    let activeContent = null; // keep track of active item/link
    let activeVisual = null;
    let isAnimating = false;
    let progressBarTween = null; // to stop/start the progress bar

    function startProgressBar(index) {
      if (progressBarTween) progressBarTween.kill();
      const bar = contentItems[index].querySelector('[data-tabs="item-progress"]');
      if (!bar) return;
      
      // In this function, you can basically do anything you want, that should happen as a tab is active
      // Maybe you have a circle filling, some other element growing, you name it.
      gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
      progressBarTween = gsap.to(bar, {
        scaleX: 1,
        duration: autoplayDuration / 3000,
        ease: "power1.inOut",
        onComplete: () => {
          if (!isAnimating) {
            const nextIndex = (index + 1) % contentItems.length;
            switchTab(nextIndex); // once bar is full, set next to active – this is important
          }
        },
      });
    }

    function switchTab(index) {
      if (isAnimating || contentItems[index] === activeContent) return;
      
      isAnimating = true;
      if (progressBarTween) progressBarTween.kill(); // Stop any running progress bar here
      
      const outgoingContent = activeContent;
      const outgoingVisual = activeVisual;
      const outgoingBar = outgoingContent?.querySelector('[data-tabs="item-progress"]');
      
      const incomingContent = contentItems[index];
      const incomingVisual = visualItems[index];
      const incomingBar = incomingContent.querySelector('[data-tabs="item-progress"]');
      
      outgoingContent?.classList.remove("active");
      outgoingVisual?.classList.remove("active");
      incomingContent.classList.add("active");
      incomingVisual.classList.add("active");
      
      const tl = gsap.timeline({
        defaults: { duration: 0.65, ease: "power3" },
        onComplete: () => {
          activeContent = incomingContent;
          activeVisual = incomingVisual;
          isAnimating = false;
          if (autoplay) startProgressBar(index); // Start autoplay bar here
        },
      });
      
      // Wrap 'outgoing' in a check to prevent warnings on first run of the function
      // Of course, during first run (on page load), there's no 'outgoing' tab yet!
      if (outgoingContent) {
        outgoingContent.classList.remove("active");
        outgoingVisual?.classList.remove("active");
        tl.set(outgoingBar, { transformOrigin: "right center" })
          .to(outgoingBar, { scaleX: 0, duration: 0.3 }, 0)
          .to(outgoingVisual, { autoAlpha: 0, xPercent: 3 }, 0)
          .to(outgoingContent.querySelector('[data-tabs="item-details"]'), { height: 0 }, 0);
      }

      incomingContent.classList.add("active");
      incomingVisual.classList.add("active");
      tl.fromTo(incomingVisual, { autoAlpha: 0, xPercent: 3 }, { autoAlpha: 1, xPercent: 0 }, 0.3)
        .fromTo( incomingContent.querySelector('[data-tabs="item-details"]'),{ height: 0 },{ height: "auto" },0)
        .set(incomingBar, { scaleX: 0, transformOrigin: "left center" }, 0);
    }

    // on page load, set first to active
    // idea: you could wrap this in a scrollTrigger
    // so it will only start once a user reaches this section
    switchTab(0);
    
    // switch tabs on click
    contentItems.forEach((item, i) =>
      item.addEventListener("click", () => {
        if (item === activeContent) return; // ignore click if current one is already active
        switchTab(i);
      })
    );
    
  });
}

// Initialize Tab System with Autoplay Option
document.addEventListener('DOMContentLoaded', () => {
  initTabSystem();
});

// -----------------------------------------
// FEATURED CASE STUDIES
// -----------------------------------------

//Feature Case Studies swipers
document.addEventListener('DOMContentLoaded', function () {

  document.querySelectorAll('[data-fcs-item]').forEach(function (item) {
    var source = item.querySelector('[data-fcs-images]');
    if (!source) return;

    var urls = (source.dataset.fcsImages || '')
      .split(',')
      .map(function (u) { return u.trim(); })
      .filter(Boolean);

    if (!urls.length) return;

    // ——— Tags ———
    var tagContainer = item.querySelector('[data-fcs-tags-slot]');
    if (tagContainer) {
      var tagItems = (source.dataset.fcsTags || '')
        .split(',')
        .map(function (t) { return t.trim(); })
        .filter(Boolean);
      var tagEls = tagContainer.querySelectorAll('*');
      tagEls.forEach(function (el, i) {
        el.textContent = tagItems[i] || '';
      });
    }

    // ——— Slides ———
    var wrapper  = item.querySelector('.swiper-wrapper');
    var template = wrapper ? wrapper.querySelector('.swiper-slide') : null;
    if (!wrapper || !template) return;

    // Set first slide image
    var firstImg = template.querySelector('img');
    if (firstImg) firstImg.src = urls[0];

    // Clone template for remaining images
    for (var i = 1; i < urls.length; i++) {
      var clone    = template.cloneNode(true);
      var cloneImg = clone.querySelector('img');
      if (cloneImg) cloneImg.src = urls[i];
      wrapper.appendChild(clone);
    }

    // ——— Init Swiper ———
    new Swiper(item.querySelector('.swiper'), {
      loop: false,
      slidesPerView: 'auto',
      observer: true,
      observeParents: true,
      navigation: {
        nextEl: item.querySelector('[data-fcs-next]'),
        prevEl: item.querySelector('[data-fcs-prev]'),
      }
    });

    // ——— Lightbox ———
    var gallery = item.querySelector('[data-gallery]');
    if (!gallery) return;

    var lightboxList = gallery.querySelector('.lightbox-img__list');
    var itemTemplate = lightboxList ? lightboxList.querySelector('[data-lightbox="item"]') : null;
    if (!lightboxList || !itemTemplate) return;

    // Set first lightbox item image
    var firstLightboxImg = itemTemplate.querySelector('img');
    if (firstLightboxImg) firstLightboxImg.src = urls[0];

    // Clone template for remaining images
    for (var j = 1; j < urls.length; j++) {
      var lightboxClone = itemTemplate.cloneNode(true);
      var lightboxCloneImg = lightboxClone.querySelector('img');
      if (lightboxCloneImg) lightboxCloneImg.src = urls[j];
      lightboxList.appendChild(lightboxClone);
    }

    createLightbox(gallery);
  });

});


//---------- Osmo Lightbox ----------//
gsap.registerPlugin(Flip)

gsap.defaults({
  ease: "power4.inOut",
  duration: 0.8,
});


function createLightbox(container, {
  onStart,
  onOpen,
  onClose,
  onCloseComplete
} = {}) {

    const elements = {
      wrapper: container.querySelector('[data-lightbox="wrapper"]'),
      triggers: container.querySelectorAll('[data-lightbox="trigger"]'),
      triggerParents: container.querySelectorAll('[data-lightbox="trigger-parent"]'),
      items: container.querySelectorAll('[data-lightbox="item"]'),
      nav: container.querySelectorAll('[data-lightbox="nav"]'),
      counter: {
        current: container.querySelector('[data-lightbox="counter-current"]'),
        total: container.querySelector('[data-lightbox="counter-total"]')
      },
      buttons: {
        prev: container.querySelector('[data-lightbox="prev"]'),
        next: container.querySelector('[data-lightbox="next"]'),
        close: container.querySelector('[data-lightbox="close"]')
      }
    };

    // Create our main timeline that will coordinate all animations
    const mainTimeline = gsap.timeline();


    // ————————— COUNTER ————————— //
    if (elements.counter.total) {
      elements.counter.total.textContent = elements.items.length;
    }
    
    
    // ————————— CLOSE FUNCTION ————————— //
    function closeLightbox() {
      onClose?.();

      mainTimeline.clear();
      gsap.killTweensOf([elements.wrapper, elements.nav, elements.triggerParents, elements.items]);

      let activeLightboxSlide = container.querySelector('[data-lightbox="item"].is-active');

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          elements.wrapper.classList.remove('is-active');
          elements.wrapper.style.display = '';
          elements.items.forEach(item => item.classList.remove('is-active'));
          onCloseComplete?.();
        }
      });

      // Return animation
      tl.to(elements.triggerParents, {
        autoAlpha: 1,
        duration: 0.5,
        stagger: 0.03,
        overwrite: true
      })
      .to(elements.nav, {
        autoAlpha: 0,
        y: "1rem",
        duration: 0.4,
        stagger: 0
      },"<")
      .to(elements.wrapper, {
        backgroundColor: "rgba(0,0,0,0)",
        duration: 0.4
      }, "<")
      .to(activeLightboxSlide,{
        autoAlpha:0,
        duration: 0.4,
      },"<")
      .set([elements.items, activeLightboxSlide, elements.triggerParents],  { clearProps: "all" })
    
      // Add this timeline to our main timeline
      mainTimeline.add(tl);
      
    }


    // ————————— CLICK-OUTSIDE FUNCTIONALITY ————————— //
    function handleOutsideClick(event) {
      if (event.detail === 0) {
        return;
      }
    
      const clickedElement = event.target;
      const isOutside = !clickedElement.closest('[data-lightbox="item"].is-active img, [data-lightbox="nav"], [data-lightbox="close"], [data-lightbox="trigger"]');
        
      if (isOutside) {
        closeLightbox();
      }
    }


    // ————————— TOGGLE ACTIVE ITEM IN LIGHTBOX ————————— //
    function updateActiveItem(index) {
      elements.items.forEach(item => {
        item.classList.remove('is-active');
        gsap.set(item, { visibility: 'hidden', autoAlpha: 0 });
      });
      elements.items[index].classList.add('is-active');
      gsap.set(elements.items[index], { visibility: 'visible', autoAlpha: 1 });

      if (elements.counter.current) {
        elements.counter.current.textContent = index + 1;
      }
    }



    // ————————— CLICK TO OPEN ————————— //
    // Listen on document so clicks inside swiper (sibling of container) are caught
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-lightbox="trigger"]');
      if (!trigger) return;
      if (!container.contains(trigger) && !trigger.closest('[data-fcs-item]')?.contains(container)) return;
      if (elements.wrapper.classList.contains('is-active')) return;

      e.preventDefault();
      onStart?.();

      // With loop:false, Swiper doesn't add data-swiper-slide-index,
      // so find the index by position of the slide among its siblings instead
      const slideEl = trigger.closest('.swiper-slide');
      const index = slideEl
        ? Array.from(slideEl.parentElement.children).indexOf(slideEl)
        : 0;

      mainTimeline.clear();
      gsap.killTweensOf([elements.wrapper, elements.nav, elements.triggerParents]);

      updateActiveItem(index);
      document.addEventListener('click', handleOutsideClick);
      elements.wrapper.classList.add('is-active');
      elements.wrapper.style.display = 'flex';

      const activeItem = elements.items[index];
      const tl = gsap.timeline({ onComplete: () => onOpen?.() });
      tl.to(elements.wrapper, { backgroundColor: "rgba(0,0,0,0.75)", duration: 0.6 }, 0)
        .set(activeItem, { visibility: 'visible', autoAlpha: 1 }, 0)
        .fromTo(elements.nav,
          { autoAlpha: 0, y: "1rem" },
          { autoAlpha: 1, y: "0rem", duration: 0.6, stagger: { each: 0.05, from: "center" } },
          0.2
        );

      mainTimeline.add(tl);
    });


    // ————————— NAV BUTTONS ————————— //
    if (elements.buttons.next) {
      elements.buttons.next.addEventListener('click', () => {
        const currentIndex = Array.from(elements.items).findIndex(item => 
          item.classList.contains('is-active')
        );
        const nextIndex = (currentIndex + 1) % elements.items.length;
        updateActiveItem(nextIndex);
      });
    }

    if (elements.buttons.prev) {
      elements.buttons.prev.addEventListener('click', () => {
        const currentIndex = Array.from(elements.items).findIndex(item => 
          item.classList.contains('is-active')
      );
      const prevIndex = (currentIndex - 1 + elements.items.length) % elements.items.length;
        updateActiveItem(prevIndex);
      });
    }

    if (elements.buttons.close) {
      elements.buttons.close.addEventListener('click', closeLightbox);
    }


    // ————————— KEYBOARD NAV ————————— //
    document.addEventListener('keydown', (event) => {
      if (!elements.wrapper.classList.contains('is-active')) return;
      switch (event.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          elements.buttons.next?.click();
          break;
        case 'ArrowLeft':
          elements.buttons.prev?.click();
          break;
      }
    });
}

// createLightbox is called per-gallery inside the FCS init block above

// -----------------------------------------
// LOGOS LIST
// -----------------------------------------
document.addEventListener('DOMContentLoaded', function () {
  var list = document.querySelector('.logos__list');
  if (!list) return;

  var allItems = Array.from(list.querySelectorAll('.logo__item'));
  var colorItems = allItems.filter(function (el) {
    return el.dataset.color === '01';
  });
  var otherItems = allItems.filter(function (el) {
    return el.dataset.color !== '01';
  });

  // Build the reordered list: even positions (2, 4, 6...) get color=01 items
  // Index is 1-based, so even = index % 2 === 0
  var totalItems = allItems.length;
  var result = [];
  var colorIdx = 0;
  var otherIdx = 0;

  for (var i = 1; i <= totalItems; i++) {
    if (i % 2 === 0 && colorIdx < colorItems.length) {
      result.push(colorItems[colorIdx++]);
    } else if (otherIdx < otherItems.length) {
      result.push(otherItems[otherIdx++]);
    } else {
      result.push(colorItems[colorIdx++]);
    }
  }

  result.forEach(function (el) {
    list.appendChild(el);
  });
});

