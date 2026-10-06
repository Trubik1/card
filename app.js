// =============================================================================
// TRUBIK PERSONAL CARD: ГЛАВНЫЙ ДВИЖОК V2.1
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const CONFIG = window.CARD_CONFIG || {};

  // 1. Инициализация фонового силового поля частиц (мышь, тачи, волны)
  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas && window.ParticleField && CONFIG.particles?.enabled !== false) {
    new window.ParticleField(bgCanvas, {
      spacing: CONFIG.particles?.gridDensity || 32,
      radius: CONFIG.particles?.repulsionRadius || 110
    });
  }

  // 2. Рендеринг данных (проекты, стек, био)
  renderAllData(CONFIG);

  // 3. Глобальный эффект дешифровки текста (Scramble Cipher)
  runGlobalCipherCascade();

  // 4. Автосмена выбранных стикеров (стартовый #10, каждые 4 сек)
  initStickerAutoCycle(CONFIG);

  // 5. Навигация и скролл-шпион по схемам (Desktop + Mobile Dock)
  initScrollNavigation();

  // 6. Интерактивный свет курсора на карточках (Spotlight effect)
  initCardSpotlights();
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
          <span class="project-status-tag">STATUS: ACTIVE</span>
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

  function setSticker(index) {
    const s = stickers[index];
    imgEl.style.transform = 'scale(0.85) rotate(-6deg)';
    imgEl.style.opacity = '0.35';

    setTimeout(() => {
      imgEl.src = s.src;
      imgEl.alt = 'Ам Няма';
      imgEl.style.transform = 'scale(1) rotate(0deg)';
      imgEl.style.opacity = '1';
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

  // Плавный скролл по клику
  function bindSmoothScroll(elements) {
    elements.forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
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

// SPOTLIGHT МИКРО-СВЕЧЕНИЕ НА КАРТОЧКАХ
function initCardSpotlights() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.cyber-frame');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--spot-x', `${x}px`);
      card.style.setProperty('--spot-y', `${y}px`);
    });
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
