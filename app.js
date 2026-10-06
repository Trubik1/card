// =============================================================================
// TRUBIK PERSONAL CARD: ГЛАВНЫЙ ДВИЖОК V2.0
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const CONFIG = window.CARD_CONFIG || {};

  // 1. Инициализация фонового силового поля частиц
  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas && window.ParticleField && CONFIG.particles?.enabled !== false) {
    new window.ParticleField(bgCanvas, {
      spacing: CONFIG.particles?.gridDensity || 30,
      radius: CONFIG.particles?.repulsionRadius || 110
    });
  }

  // 2. Рендеринг данных
  renderAllData(CONFIG);

  // 3. Инициализация движка рамок из убегающих квадратиков
  const bordersCanvas = document.getElementById('pixel-borders-canvas');
  let pixelBorders = null;
  if (bordersCanvas && window.PixelBorderEngine) {
    pixelBorders = new window.PixelBorderEngine(bordersCanvas);
    window.pixelBorderEngine = pixelBorders;
  }

  // 4. Глобальный эффект дешифровки текста (Scramble Cipher)
  runGlobalCipherCascade();

  // 5. Автосмена стикеров каждые 4 секунды
  initStickerAutoCycle(CONFIG);

  // 6. Навигация по вкладкам (Desktop + Mobile Dock)
  initTabNavigation();

  // 7. Копирование юзернейма @Trubik1 с Toast
  initCopyHandler(CONFIG);
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

  // Telegram кнопки
  const tgBtn = document.getElementById('btn-telegram');
  if (tgBtn && CONFIG.telegram) {
    tgBtn.href = CONFIG.telegram.url;
  }

  const copyVal = document.getElementById('copy-username');
  if (copyVal && CONFIG.telegram) copyVal.textContent = CONFIG.telegram.username;

  // Рендеринг проектов (Section 2)
  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid && CONFIG.projects) {
    projectsGrid.innerHTML = CONFIG.projects.map(p => `
      <div class="project-card pixel-frame">
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

  // Рендеринг стека технологий (Section 3)
  const stackGrid = document.getElementById('stack-grid');
  if (stackGrid && CONFIG.skillGroups) {
    stackGrid.innerHTML = CONFIG.skillGroups.map(g => `
      <div class="stack-group-card pixel-frame">
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
    const duration = Math.min(600, 200 + original.length * 20);

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const charsSolved = Math.floor(original.length * progress);

      let text = '';
      for (let i = 0; i < original.length; i++) {
        if (original[i] === ' ' || original[i] === '/' || original[i] === '[' || original[i] === ']') {
          text += original[i];
        } else if (i < charsSolved) {
          text += original[i];
        } else if (i < charsSolved + 3) {
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
    const delay = 80 + index * 40;
    scrambleElement(el, delay);
  });

  // Интерактивный ре-скрэмбл при наведении
  container.querySelectorAll('.cipher-trigger').forEach(el => {
    el.addEventListener('mouseenter', () => scrambleElement(el, 0));
  });
}

// АВТОСМЕНА СТИКЕРОВ АМ НЯМА (10 СТИКЕРОВ)
function initStickerAutoCycle(CONFIG) {
  const stage = document.getElementById('sticker-stage');
  const imgEl = document.getElementById('sticker-img');
  const hintName = document.getElementById('sticker-hint-name');
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
      imgEl.alt = s.name;
      if (hintName) {
        hintName.textContent = s.name;
        scrambleElement(hintName, 0);
      }
      imgEl.style.transform = 'scale(1) rotate(0deg)';
      imgEl.style.opacity = '1';
    }, 140);
  }

  // Запуск начального стикера
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

// НАВИГАЦИЯ ПО ВКЛАДКАМ (DESKTOP + MOBILE DOCK)
function initTabNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
  const dockBtns = document.querySelectorAll('.dock-btn');
  const views = document.querySelectorAll('.tab-view');
  const quickBtn = document.getElementById('btn-quick-projects');

  function switchTab(tabId) {
    // 1. Обновляем табы десктопа
    navTabs.forEach(t => {
      const active = t.getAttribute('data-tab') === tabId;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active);
    });

    // 2. Обновляем мобильный док
    dockBtns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });

    // 3. Переключаем видимость экранов
    views.forEach(v => {
      const active = v.id === `view-${tabId}`;
      v.classList.toggle('active', active);
      if (active) {
        runGlobalCipherCascade(v);
      }
    });

    // 4. Перестраиваем рамки из квадратиков под новую геометрию
    if (window.pixelBorderEngine) {
      setTimeout(() => window.pixelBorderEngine.rebuildBorders(), 60);
    }

    // Скролл наверх
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navTabs.forEach(t => {
    t.addEventListener('click', () => switchTab(t.getAttribute('data-tab')));
  });

  dockBtns.forEach(b => {
    b.addEventListener('click', () => switchTab(b.getAttribute('data-tab')));
  });

  if (quickBtn) {
    quickBtn.addEventListener('click', () => switchTab('projects'));
  }
}

// КОПИРОВАНИЕ ЮЗЕРНЕЙМА
function initCopyHandler(CONFIG) {
  const copyBtn = document.getElementById('copy-pill');
  const toast = document.getElementById('toast-notice');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const username = CONFIG.telegram?.username || '@Trubik1';
    try {
      await navigator.clipboard.writeText(username);
      showToast(`✓ Скопировано: ${username}`);
    } catch (err) {
      const input = document.createElement('input');
      input.value = username;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showToast(`✓ Скопировано: ${username}`);
    }
  });

  let toastTimer = null;
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }
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
