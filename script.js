(function () {
  // Map each card id to its accordion id and column side
  const cards = {
    1: { acc: 'acc-1', side: 'left' },
    2: { acc: 'acc-2', side: 'right' },
    3: { acc: 'acc-3', side: 'left' },
    4: { acc: 'acc-4', side: 'right' },
    5: { acc: 'acc-5', side: 'left' },
    6: { acc: 'acc-6', side: 'right' },
    7: { acc: 'acc-7', side: 'right' },
    8: { acc: 'acc-8', side: 'left' },
  };

  let openCard = null;

  function closeCard(id) {
    const cfg = cards[id];
    if (!cfg) return;
    const acc = document.getElementById(cfg.acc);
    const card = document.querySelector(`.sample-card[data-card="${id}"]`);
    const btn = document.querySelector(`.info-btn[data-card="${id}"]`);

    acc.classList.remove('open');
    if (card) card.classList.remove('card-shifted');
    if (btn) btn.setAttribute('aria-expanded', 'false');

    setTimeout(() => { acc.hidden = true; }, 420);
    openCard = null;
  }

  function openCardFn(id) {
    const cfg = cards[id];
    if (!cfg) return;
    const acc = document.getElementById(cfg.acc);
    const card = document.querySelector(`.sample-card[data-card="${id}"]`);
    const btn = document.querySelector(`.info-btn[data-card="${id}"]`);

    acc.hidden = false;
    // Force reflow so transition fires
    requestAnimationFrame(() => requestAnimationFrame(() => {
      acc.classList.add('open');
      if (card) card.classList.add('card-shifted');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }));
    openCard = id;
  }

  function toggle(id) {
    if (openCard !== null) {
      const prev = openCard;
      closeCard(prev);
      if (prev === id) return; // clicking same card → just close
      setTimeout(() => openCardFn(id), 50);
    } else {
      openCardFn(id);
    }
  }

  // Info buttons
  document.querySelectorAll('.info-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggle(Number(btn.dataset.card));
    });
  });

  // Thumbnails
  document.querySelectorAll('.sample-thumb').forEach(thumb => {
    const card = thumb.closest('.sample-card');
    if (!card) return;
    thumb.addEventListener('click', () => {
      toggle(Number(card.dataset.card));
    });
  });

  // Accordion panels
  document.querySelectorAll('.accordion-panel').forEach(panel => {
    panel.addEventListener('click', () => {
      const id = Number(panel.id.replace('acc-', ''));
      if (openCard === id) closeCard(id);
    });
  });

  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = document.querySelector('.lightbox-image');
  const lightboxCaption = document.querySelector('.lightbox-caption');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  let lightboxImages = [];
  let lightboxIndex = 0;
  let lightboxTitle = '';

  function closeLightbox() {
    if (!lightbox || !lightboxImage) return;
    lightbox.hidden = true;
    lightboxImage.src = '';
    lightboxImage.alt = '';
    if (lightboxCaption) lightboxCaption.textContent = '';
    lightboxImages = [];
    lightboxIndex = 0;
    lightboxTitle = '';
  }

  function showLightboxImage(index) {
    const img = lightboxImages[index];
    if (!img || !lightboxImage) return;
    lightboxIndex = index;
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt || 'Expanded image preview';
    if (lightboxCaption) lightboxCaption.textContent = lightboxTitle;
  }

  function openLightbox(img) {
    if (!lightbox || !lightboxImage) return;
    const panel = img.closest('.accordion-panel');
    const cardId = panel ? panel.id.replace('acc-', '') : '';
    lightboxTitle = document.querySelector(`.sample-card[data-card="${cardId}"] h3`)?.textContent || '';
    lightboxImages = panel ? Array.from(panel.querySelectorAll('.info-images img')) : [img];
    lightboxIndex = Math.max(0, lightboxImages.indexOf(img));

    showLightboxImage(lightboxIndex);
    lightbox.hidden = false;
  }

  function moveLightbox(direction) {
    if (lightboxImages.length < 2) return;
    const nextIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
    showLightboxImage(nextIndex);
  }

  document.querySelectorAll('.info-images img').forEach(img => {
    img.addEventListener('click', e => {
      e.stopPropagation();
      openLightbox(img);
    });
  });

  if (lightbox) {
    lightbox.addEventListener('click', closeLightbox);
  }

  if (lightboxImage) {
    lightboxImage.addEventListener('click', closeLightbox);
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', e => {
      e.stopPropagation();
      moveLightbox(-1);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', e => {
      e.stopPropagation();
      moveLightbox(1);
    });
  }

  document.addEventListener('keydown', e => {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') moveLightbox(-1);
    if (e.key === 'ArrowRight') moveLightbox(1);
  });

  const processCycle = document.querySelector('.process-cycle');
  const processSteps = document.querySelectorAll('.process-step');
  const processArrow23 = document.getElementById('process-arrow-2-3');
  const processArrow56 = document.getElementById('process-arrow-5-6');
  let activeProcessStep = null;

  function revealProcessSteps() {
    processSteps.forEach(step => {
      step.classList.add('is-visible');
    });
    updateAdaptiveProcessArrows(false);
  }

  function animateSvgNumber(target, attr, value, duration = 300) {
    if (!target) return;
    target._processAnimations = target._processAnimations || {};
    if (target._processAnimations[attr]) {
      cancelAnimationFrame(target._processAnimations[attr]);
    }

    const start = Number(target.getAttribute(attr));
    const change = value - start;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      target.setAttribute(attr, (start + change * eased).toFixed(1));

      if (progress < 1) {
        target._processAnimations[attr] = requestAnimationFrame(tick);
      }
    }

    target._processAnimations[attr] = requestAnimationFrame(tick);
  }

  function getProcessLabelBottom(step) {
    if (!processCycle || !step) return null;
    const title = step.querySelector('.process-label h3');
    const description = step.querySelector('.process-label p');
    if (!title || !description) return null;

    const styles = getComputedStyle(step);
    const yPercent = parseFloat(styles.getPropertyValue('--y'));
    const nodeCenterY = Number.isFinite(yPercent) ? (yPercent / 100) * 600 : 0;
    const nodeCenterOffset = parseFloat(styles.getPropertyValue('--node-center-y')) || 32;
    const rem = Number(getComputedStyle(document.documentElement).fontSize) || 16;
    const labelGap = 8;
    const labelTop = 64 + rem * .65;
    let bottom = nodeCenterY - nodeCenterOffset + labelTop + title.offsetHeight + labelGap;

    if (step.classList.contains('is-active')) {
      bottom += description.scrollHeight + rem * .25;
    }

    return bottom;
  }

  function updateAdaptiveProcessArrows(animate = true) {
    const step2 = processSteps[1];
    const step6 = processSteps[5];
    const arrow23Start = getProcessLabelBottom(step2);
    const arrow56End = getProcessLabelBottom(step6);

    if (processArrow23 && arrow23Start !== null) {
      if (animate) animateSvgNumber(processArrow23, 'y1', arrow23Start);
      else processArrow23.setAttribute('y1', arrow23Start.toFixed(1));
    }

    if (processArrow56 && arrow56End !== null) {
      if (animate) animateSvgNumber(processArrow56, 'y2', arrow56End);
      else processArrow56.setAttribute('y2', arrow56End.toFixed(1));
    }
  }

  function setActiveProcessStep(step) {
    const shouldClose = activeProcessStep === step;
    activeProcessStep = shouldClose ? null : step;

    if (processCycle) {
      processCycle.classList.toggle('has-active', Boolean(activeProcessStep));
    }

    processSteps.forEach(item => {
      const isActive = item === activeProcessStep;
      item.classList.toggle('is-active', isActive);
      item.classList.toggle('is-dimmed', Boolean(activeProcessStep) && !isActive);
    });

    updateAdaptiveProcessArrows(true);
  }

  if (processCycle && processSteps.length) {
    processSteps.forEach(step => {
      const node = step.querySelector('.process-node');
      const title = step.querySelector('.process-label h3');

      [node, title].forEach(trigger => {
        if (!trigger) return;
        trigger.addEventListener('click', () => {
          setActiveProcessStep(step);
        });
      });
    });

    updateAdaptiveProcessArrows(false);

    if ('IntersectionObserver' in window) {
      const processObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          revealProcessSteps();
          processObserver.unobserve(entry.target);
        });
      }, { threshold: 0.28 });

      processObserver.observe(processCycle);
    } else {
      revealProcessSteps();
    }

    window.addEventListener('resize', () => {
      updateAdaptiveProcessArrows(false);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => updateAdaptiveProcessArrows(false));
    }
  }

  let scrollTimer = null;
  window.addEventListener('scroll', () => {
    document.body.classList.add('is-scrolling');
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      document.body.classList.remove('is-scrolling');
    }, 3000);
  }, { passive: true });

  // Smooth scroll with nav offset
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navHeight = document.querySelector('.topbar').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
