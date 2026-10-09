// =============================================================================
// TRUBIK PERSONAL CARD: ГЛАВНЫЙ ДВИЖОК V2.1
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const CONFIG = window.CARD_CONFIG || {};

  // 1. Рендеринг данных (проекты, стек, био) — наивысший приоритет
  try {
    renderAllData(CONFIG);
  } catch (e) {
    console.error('renderAllData error:', e);
  }

  // 2. Инициализация фонового силового поля частиц (мышь, тачи, волны)
  try {
    const bgCanvas = document.getElementById('bg-canvas');
    if (bgCanvas && window.ParticleField && CONFIG.particles?.enabled !== false) {
      new window.ParticleField(bgCanvas, {
        spacing: CONFIG.particles?.gridDensity || 32,
        radius: CONFIG.particles?.repulsionRadius || 110
      });
    }
  } catch (e) {
    console.error('ParticleField error:', e);
  }

  // 3. Глобальный эффект дешифровки текста (Scramble Cipher)
  try {
    runGlobalCipherCascade();
  } catch (e) {
    console.error('cipher cascade error:', e);
  }

  // 4. Автосмена выбранных стикеров (стартовый #10, каждые 4 сек)
  try {
    initStickerAutoCycle(CONFIG);
  } catch (e) {
    console.error('sticker cycle error:', e);
  }

  // 5. Навигация и скролл-шпион по схемам (Desktop + Mobile Dock)
  try {
    initScrollNavigation();
  } catch (e) {
    console.error('scroll navigation error:', e);
  }

  // 6. Интерактивный 3D-Tilt наклон карточек со световым бликом (Spotlight)
  try {
    init3DTiltAndSpotlights();
  } catch (e) {
    console.error('3D tilt error:', e);
  }

  // 7. Интерактивный Ом Ням: слежение за курсором и упругий Squish
  try {
    initInteractiveOmNom();
  } catch (e) {
    console.error('om nom error:', e);
  }
});

// РЕНДЕРИНГ ДАННЫХ
function renderAllData(CONFIG) {
  // Имя и био
  const nameEl = document.getElementById('profile-name');
  if (nameEl && CONFIG.name) nameEl.textContent = CONFIG.name;

  const roleEl = document.getElementById('profile-role');
  if (roleEl && CONFIG.tagline) roleEl.textContent = CONFIG.tagline;

  const bioEl = document.getElementById('profile-bio');
  if (bioEl && CONFIG.bio) bioEl.textContent = CONFIG.bio;

  // Telegram кнопка
  const tgBtn = document.getElementById('btn-telegram');
  if (tgBtn && CONFIG.telegram) {
    tgBtn.href = CONFIG.telegram.url;
  }

  // Рендеринг проектов (Схема 02)
  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid && CONFIG.projects) {
    projectsGrid.innerHTML = CONFIG.projects.map(p => `
      <div class="project-card cyber-frame">
        <div class="corner-cross tl"></div>
        <div class="corner-cross tr"></div>
        <div class="corner-cross bl"></div>
        <div class="corner-cross br"></div>
        <div>
          <div class="project-card-header">
            <span class="tag-badge">[${escapeHtml(p.tag)}]</span>
            <span class="project-category-badge">${escapeHtml(p.category)}</span>
          </div>
          <h3 class="project-name cipher-trigger" data-cipher>${escapeHtml(p.title)}</h3>
          <p class="project-body">${escapeHtml(p.desc)}</p>
        </div>
        <div class="project-footer">
          <span class="project-tag-hint">${escapeHtml(p.category)}</span>
          <span class="arrow-indicator">↗</span>
        </div>
      </div>
    `).join('');
  }

  // Рендеринг стека технологий (Схема 03)
  const stackGrid = document.getElementById('stack-grid');
  if (stackGrid && CONFIG.skillGroups) {
    stackGrid.innerHTML = CONFIG.skillGroups.map(g => `
      <div class="stack-group-card cyber-frame">
        <div class="corner-cross tl"></div>
        <div class="corner-cross tr"></div>
        <div class="corner-cross bl"></div>
        <div class="corner-cross br"></div>
        <h3 class="stack-group-title" data-cipher>${escapeHtml(g.title)}</h3>
        <div class="stack-tags">
          ${g.skills.map(s => `<span class="tech-tag" data-cipher>${escapeHtml(s)}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }
}

// ТОТАЛЬНЫЙ ДЕШИФРОВЩИК ТЕКСТА (SCRAMBLE CIPHER)
const GLYPHS = '/\\|<>[]{}#%&*+=01!@?~';

function scrambleElement(el, delay = 0) {
  const original = el.getAttribute('data-original') || el.textContent;
  el.setAttribute('data-original', original);

  setTimeout(() => {
    const startTime = performance.now();
    // Увеличенная длительность: дает глазу успеть насладиться эффектом
    const duration = Math.max(650, 400 + original.length * 28);

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const charsSolved = Math.floor(original.length * progress);

      let text = '';
      for (let i = 0; i < original.length; i++) {
        if (original[i] === ' ' || original[i] === '/' || original[i] === '[' || original[i] === ']') {
          text += original[i];
        } else if (i < charsSolved) {
          text += original[i];
        } else if (i < charsSolved + 4) {
          // Окно активной бегущей дешифровки
          text += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        } else {
          text += ' ';
        }
      }

      el.textContent = text;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = original;
      }
    }

    requestAnimationFrame(tick);
  }, delay);
}

function runGlobalCipherCascade(container = document) {
  const targets = container.querySelectorAll('[data-cipher]');
  targets.forEach((el, index) => {
    // Каскад с комфортными интервалами
    const delay = 120 + index * 90;
    scrambleElement(el, delay);
  });

  // Интерактивный ре-скрэмбл при наведении
  container.querySelectorAll('.cipher-trigger').forEach(el => {
    el.addEventListener('mouseenter', () => scrambleElement(el, 0));
  });
}

// АВТОСМЕНА СТИКЕРОВ АМ НЯМА (БЕЗ ПОДПИСЕЙ И НОМЕРОВ)
function initStickerAutoCycle(CONFIG) {
  const stage = document.getElementById('sticker-stage');
  const imgEl = document.getElementById('sticker-img');
  if (!imgEl || !CONFIG.stickers?.length) return;

  const stickers = CONFIG.stickers;
  let currentIndex = stickers.findIndex(s => s.id === CONFIG.defaultSticker);
  if (currentIndex === -1) currentIndex = 0;

  const eyesOverlay = document.getElementById('omnom-eyes');

  function setSticker(index) {
    const s = stickers[index];
    imgEl.style.transform = 'scale(0.85) rotate(-6deg)';
    imgEl.style.opacity = '0.35';
    if (eyesOverlay) {
      eyesOverlay.style.opacity = '0';
    }

    setTimeout(() => {
      imgEl.src = s.src;
      imgEl.alt = 'Ам Няма';
      imgEl.style.transform = 'scale(1) rotate(0deg)';
      imgEl.style.opacity = '1';
      
      // Живые анимированные глаза накладываем на стикер #10 (где он смотрит прямо)
      if (eyesOverlay) {
        if (s.id === 10) {
          eyesOverlay.classList.remove('hidden');
          eyesOverlay.style.opacity = '1';
        } else {
          eyesOverlay.classList.add('hidden');
          eyesOverlay.style.opacity = '0';
        }
      }
    }, 140);
  }

  // Установка стартового стикера #10
  setSticker(currentIndex);

  function nextSticker() {
    currentIndex = (currentIndex + 1) % stickers.length;
    setSticker(currentIndex);
  }

  // Ручной клик
  if (stage) {
    stage.addEventListener('click', () => {
      nextSticker();
      resetTimer();
    });
  }

  // Автоматический таймер каждые 4 секунды
  const intervalTime = (CONFIG.stickerAutoCycleSeconds || 4) * 1000;
  let timer = setInterval(nextSticker, intervalTime);

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(nextSticker, intervalTime);
  }
}

// ТАКТИЛЬНЫЙ ВИБРО-КЛИК (HAPTIC FEEDBACK)
function triggerHaptic(duration = 16) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(duration);
    } catch (e) {}
  }
}

// СКРОЛЛ-НАВИГАЦИЯ И АКТИВНЫЕ РАЗДЕЛЫ (SCROLL SPY)
function initScrollNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
  const dockBtns = document.querySelectorAll('.dock-btn');
  const sections = document.querySelectorAll('.schema-section');

  function updateActiveNav(activeId) {
    navTabs.forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-target') === activeId);
    });
    dockBtns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-target') === activeId);
    });
  }

  // Плавный скролл по клику + тактильный вибро-клик
  function bindSmoothScroll(elements) {
    elements.forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        triggerHaptic(18);
        const targetId = el.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
          updateActiveNav(targetId);
        }
      });
    });
  }

  bindSmoothScroll(navTabs);
  bindSmoothScroll(dockBtns);

  // Скролл-шпион через IntersectionObserver
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateActiveNav(entry.target.id);
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(s => observer.observe(s));
  }
}

// ИНТЕРАКТИВНЫЙ 3D-TILT И ДИНАМИЧЕСКИЙ БЛИК SPOTLIGHT
function init3DTiltAndSpotlights() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.cyber-frame');
  cards.forEach(card => {
    let bounds;

    function onMouseEnter() {
      bounds = card.getBoundingClientRect();
    }

    function onMouseMove(e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      // Позиция для радиального светового пятна
      card.style.setProperty('--mouse-x', `${mouseX}px`);
      card.style.setProperty('--mouse-y', `${mouseY}px`);

      // 3D Tilt физика: вычисляем угол наклона (от -4.5deg до +4.5deg)
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;
      const rotateX = ((mouseY - centerY) / centerY) * -4.5;
      const rotateY = ((mouseX - centerX) / centerX) * 4.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    }

    function onMouseLeave() {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.setProperty('--mouse-x', `-500px`);
      card.style.setProperty('--mouse-y', `-500px`);
      bounds = null;
    }

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  });
}

// ИНТЕРАКТИВНЫЙ ОМ НЯМ: ГЛОБАЛЬНЫЙ ТРЕКИНГ ЗРАЧКОВ (EYE TRACKING) + SQUISH
function initInteractiveOmNom() {
  const stage = document.getElementById('sticker-stage');
  const img = document.getElementById('sticker-img');
  const pupils = document.querySelectorAll('.omnom-pupil');
  const eyesOverlay = document.getElementById('omnom-eyes');
  const shadow = document.getElementById('sticker-shadow');
  if (!stage || !img) return;

  // Глобальное слежение за курсором мыши по всему экрану
  if (!window.matchMedia('(hover: none)').matches) {
    window.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const stageCenterX = rect.left + rect.width / 2;
      const stageCenterY = rect.top + rect.height / 2;

      // Вектор от центра Ам Няма до курсора
      const dx = e.clientX - stageCenterX;
      const dy = e.clientY - stageCenterY;
      const dist = Math.hypot(dx, dy);

      // 1. Поворот и наклон тела Ам Няма в направлении курсора
      const maxAngle = 14;
      const angleX = Math.max(-maxAngle, Math.min(maxAngle, (dx / window.innerWidth) * 28));
      const angleY = Math.max(-10, Math.min(10, (dy / window.innerHeight) * 16));
      img.style.transform = `perspective(600px) rotateY(${angleX.toFixed(1)}deg) rotateX(${-angleY.toFixed(1)}deg)`;

      // 2. Движение зрачков внутри глазниц (макс радиус движения 10px)
      const maxPupilMove = 10;
      const pRatio = Math.min(1, dist / 400);
      const angleRad = Math.atan2(dy, dx);
      const pupilX = Math.cos(angleRad) * maxPupilMove * pRatio;
      const pupilY = Math.sin(angleRad) * maxPupilMove * pRatio;

      pupils.forEach(pupil => {
        // Эффект расширения зрачков при приближении курсора (любопытство)
        const scale = dist < 220 ? 1.25 : 1.0;
        pupil.style.transform = `translate3d(${pupilX.toFixed(1)}px, ${pupilY.toFixed(1)}px, 0) scale(${scale})`;
      });

      // 3. Смещение тени в противоположную сторону от наклона
      if (shadow) {
        shadow.style.transform = `translate3d(${-angleX * 1.2}px, 0, 0) scale(${1 - Math.abs(angleX) * 0.01})`;
      }
    });

    // Плавный возврат в центр при уходе мыши с окна
    window.addEventListener('mouseleave', () => {
      img.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg)';
      pupils.forEach(p => {
        p.style.transform = 'translate3d(0, 0, 0) scale(1)';
      });
      if (shadow) shadow.style.transform = 'translate3d(0, 0, 0) scale(1)';
    });
  }

  // На смартфонах: реакция на гироскоп / наклон телефона (DeviceOrientation)
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma === null || e.beta === null) return;
      // gamma: наклон влево/вправо (-90 до 90)
      // beta: наклон вперед/назад (-180 до 180)
      const tiltX = Math.max(-14, Math.min(14, e.gamma * 0.45));
      const tiltY = Math.max(-10, Math.min(10, (e.beta - 45) * 0.35));

      img.style.transform = `perspective(600px) rotateY(${tiltX.toFixed(1)}deg) rotateX(${-tiltY.toFixed(1)}deg)`;

      const pupilX = (tiltX / 14) * 8;
      const pupilY = (tiltY / 10) * 8;
      pupils.forEach(pupil => {
        pupil.style.transform = `translate3d(${pupilX.toFixed(1)}px, ${pupilY.toFixed(1)}px, 0)`;
      });

      if (shadow) {
        shadow.style.transform = `translate3d(${-tiltX}px, 0, 0)`;
      }
    }, { passive: true });
  }

  // При клике / тапе: смачный пружинистый squish + тактильный вибро-клик
  stage.addEventListener('click', () => {
    img.classList.remove('squish');
    if (eyesOverlay) eyesOverlay.classList.remove('squish');
    
    // Force reflow
    void img.offsetWidth;
    img.classList.add('squish');
    if (eyesOverlay) eyesOverlay.classList.add('squish');

    triggerHaptic(22);
  });
}

// Защита от XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
