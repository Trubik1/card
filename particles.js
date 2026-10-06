// =============================================================================
// ДВИЖОК ФИЗИКИ ЧАСТИЦ (MOBILE + DESKTOP ADAPTIVE)
// Реагирует на мышь, сенсорные касания, волны и наклон устройства
// =============================================================================

class ParticleField {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.options = Object.assign({
      spacing: 32,
      radius: 110,
      returnSpeed: 0.08,
      damping: 0.75,
      force: 3.8,
      dotSize: 1.5,
      dotColor: 'rgba(255, 255, 255, 0.32)',
      glowColor: 'rgba(52, 211, 153, 0.14)'
    }, options);

    this.particles = [];
    this.mouse = { x: -9999, y: -9999, active: false };
    this.touchRipples = []; // Расходящиеся волны от тапов на телефоне
    this.tilt = { x: 0, y: 0 };
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.rafId = null;
    this.width = 0;
    this.height = 0;
    this.time = 0;

    this.init();
  }

  init() {
    this.resize();
    this.bindEvents();
    this.loop = this.loop.bind(this);
    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);

    this.createGrid();
  }

  createGrid() {
    this.particles = [];
    const spacing = this.options.spacing;
    const cols = Math.ceil(this.width / spacing) + 1;
    const rows = Math.ceil(this.height / spacing) + 1;

    const offsetX = (this.width - (cols - 1) * spacing) / 2;
    const offsetY = (this.height - (rows - 1) * spacing) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ox = offsetX + c * spacing;
        const oy = offsetY + r * spacing;
        this.particles.push({
          ox,
          oy,
          x: ox,
          y: oy,
          vx: 0,
          vy: 0,
          size: this.options.dotSize,
          alpha: 0.25,
          phase: (ox * 0.015 + oy * 0.015) % (Math.PI * 2)
        });
      }
    }
  }

  bindEvents() {
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.resize(), 120);
    });

    // Десктоп: движение мыши
    window.addEventListener('pointermove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;
    }, { passive: true });

    window.addEventListener('pointerleave', () => {
      this.mouse.active = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });

    // Мобильные: касания и импульсные волны
    const addRipple = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      this.touchRipples.push({
        x,
        y,
        radius: 10,
        maxRadius: 180,
        strength: 5.5,
        alpha: 1.0
      });
      // Ограничиваем количество одновременных волн
      if (this.touchRipples.length > 5) this.touchRipples.shift();
    };

    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        const t = e.touches[0];
        this.mouse.x = t.clientX;
        this.mouse.y = t.clientY;
        this.mouse.active = true;
        addRipple(t.clientX, t.clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const t = e.touches[0];
        this.mouse.x = t.clientX;
        this.mouse.y = t.clientY;
        this.mouse.active = true;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.mouse.active = false;
    });

    // Гироскоп мобильного телефона
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          this.tilt.x = (e.gamma / 45) * 0.8;
          this.tilt.y = (e.beta / 45) * 0.8;
        }
      }, { passive: true });
    }
  }

  loop() {
    this.time += 0.03;
    this.update();
    this.render();
    this.rafId = requestAnimationFrame(this.loop);
  }

  update() {
    const mx = this.mouse.x;
    const my = this.mouse.y;
    const R = this.options.radius;
    const R2 = R * R;
    const force = this.options.force;
    const k = this.options.returnSpeed;
    const damping = this.options.damping;

    // Обновление импульсных волн от тапов
    for (let w = this.touchRipples.length - 1; w >= 0; w--) {
      const rip = this.touchRipples[w];
      rip.radius += 5.5;
      rip.strength *= 0.94;
      rip.alpha *= 0.94;
      if (rip.radius > rip.maxRadius || rip.strength < 0.1) {
        this.touchRipples.splice(w, 1);
      }
    }

    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      const p = this.particles[i];

      // Фоновое плавное дыхание (ambient floating на телефонах)
      const breathX = Math.cos(this.time + p.phase) * 1.2 + this.tilt.x * 2.5;
      const breathY = Math.sin(this.time + p.phase) * 1.2 + this.tilt.y * 2.5;

      let ax = (p.ox + breathX - p.x) * k;
      let ay = (p.oy + breathY - p.y) * k;

      // 1. Отталкивание от курсора / пальца
      if (this.mouse.active) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist2 = dx * dx + dy * dy;

        if (dist2 < R2 && dist2 > 0.0001) {
          const dist = Math.sqrt(dist2);
          const f = (1 - dist / R);
          const push = f * f * force;
          ax += (dx / dist) * push * 2.8;
          ay += (dy / dist) * push * 2.8;
          
          p.alpha = Math.min(1, 0.35 + f * 0.65);
          p.size = this.options.dotSize + f * 1.5;
        } else {
          p.alpha += (0.28 - p.alpha) * 0.08;
          p.size += (this.options.dotSize - p.size) * 0.08;
        }
      } else {
        p.alpha += (0.28 - p.alpha) * 0.08;
        p.size += (this.options.dotSize - p.size) * 0.08;
      }

      // 2. Отталкивание от расходящихся волн тапов (mobile ripple)
      for (let w = 0; w < this.touchRipples.length; w++) {
        const rip = this.touchRipples[w];
        const rdx = p.x - rip.x;
        const rdy = p.y - rip.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        const waveDelta = Math.abs(rdist - rip.radius);

        if (waveDelta < 26) {
          const factor = (1 - waveDelta / 26) * rip.strength;
          ax += (rdx / (rdist || 1)) * factor;
          ay += (rdy / (rdist || 1)) * factor;
          p.alpha = Math.min(1, p.alpha + factor * 0.2);
        }
      }

      p.vx = (p.vx + ax) * damping;
      p.vy = (p.vy + ay) * damping;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Мягкое свечение под курсором / пальцем
    if (this.mouse.active && this.mouse.x > 0 && this.mouse.y > 0) {
      const grad = ctx.createRadialGradient(
        this.mouse.x, this.mouse.y, 0,
        this.mouse.x, this.mouse.y, this.options.radius * 1.3
      );
      grad.addColorStop(0, this.options.glowColor);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.mouse.x, this.mouse.y, this.options.radius * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Отрисовка частиц
    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      const p = this.particles[i];
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  start() {
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

window.ParticleField = ParticleField;
