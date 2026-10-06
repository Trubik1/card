// =============================================================================
// ДВИЖОК ФИЗИКИ ЧАСТИЦ (CANVAS REPUTATION FIELD)
// Вдохновлено физикой tier.guru/ecronx: упругое силовое поле и отталкивание от курсора
// =============================================================================

class ParticleField {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.options = Object.assign({
      spacing: 30,           // расстояние между узлами сетки
      radius: 120,          // радиус силового поля отталкивания
      returnSpeed: 0.08,    // упругость возврата частицы на базу
      damping: 0.74,        // коэффициент затухания скорости
      force: 3.5,           // сила отталкивания от курсора
      dotSize: 1.5,         // базовый размер точки
      dotColor: 'rgba(255, 255, 255, 0.35)',
      activeDotColor: 'rgba(255, 255, 255, 0.95)',
      glowColor: 'rgba(78, 201, 176, 0.12)'
    }, options);

    this.particles = [];
    this.mouse = { x: -9999, y: -9999, active: false };
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.rafId = null;
    this.width = 0;
    this.height = 0;

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
          ox,          // исходная координата X
          oy,          // исходная координата Y
          x: ox,       // текущая координата X
          y: oy,       // текущая координата Y
          vx: 0,       // скорость по X
          vy: 0,       // скорость по Y
          size: this.options.dotSize,
          alpha: 0.25
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

    const onPointerMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', () => {
      this.mouse.active = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.touches[0].clientX - rect.left;
        this.mouse.y = e.touches[0].clientY - rect.top;
        this.mouse.active = true;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.mouse.active = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });
  }

  loop() {
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

    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      const p = this.particles[i];

      let ax = (p.ox - p.x) * k;
      let ay = (p.oy - p.y) * k;

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

      p.vx = (p.vx + ax) * damping;
      p.vy = (p.vy + ay) * damping;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.mouse.active && this.mouse.x > 0 && this.mouse.y > 0) {
      const grad = ctx.createRadialGradient(
        this.mouse.x, this.mouse.y, 0,
        this.mouse.x, this.mouse.y, this.options.radius * 1.4
      );
      grad.addColorStop(0, this.options.glowColor);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.mouse.x, this.mouse.y, this.options.radius * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

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
