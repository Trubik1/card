// =============================================================================
// РАМКИ ИЗ УБЕГАЮЩИХ КВАДРАТИКОВ (PIXEL BORDER CANVAS ENGINE)
// Вдохновлено tier.guru/ecronx: контуры карточек из микро-пикселей,
// которые разлетаются от курсора и упруго возвращаются на место
// =============================================================================

class PixelBorderEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.points = [];
    this.mouse = { x: -9999, y: -9999, active: false };
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.step = 8;             // расстояние между пикселями по периметру
    this.radius = 80;          // радиус отталкивания
    this.force = 4.2;          // сила толчка
    this.spring = 0.09;        // упругость возврата
    this.damping = 0.72;       // демпфирование
    this.baseSize = 2.5;       // размер квадратика

    this.init();
  }

  init() {
    this.resize();
    this.bindEvents();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);

    this.rebuildBorders();
  }

  rebuildBorders() {
    this.points = [];
    const elements = document.querySelectorAll('.pixel-frame');
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const scrollX = window.scrollX || window.pageXOffset || 0;

    elements.forEach(el => {
      // Игнорируем скрытые карточки из неактивных вкладок
      if (el.offsetParent === null) return;

      const rect = el.getBoundingClientRect();
      const x = rect.left;
      const y = rect.top;
      const w = rect.width;
      const h = rect.height;
      const radius = 24; // скругление углов

      // Точки для верхнего и нижнего ребра
      for (let px = radius; px <= w - radius; px += this.step) {
        this.addPoint(x + px, y);             // Верх
        this.addPoint(x + px, y + h);         // Низ
      }

      // Точки для левого и правого ребра
      for (let py = radius; py <= h - radius; py += this.step) {
        this.addPoint(x, y + py);             // Лево
        this.addPoint(x + w, y + py);         // Право
      }

      // Скругленные углы (дуги из пикселей)
      const corners = [
        { cx: x + radius, cy: y + radius, start: Math.PI, end: Math.PI * 1.5 },
        { cx: x + w - radius, cy: y + radius, start: Math.PI * 1.5, end: Math.PI * 2 },
        { cx: x + w - radius, cy: y + h - radius, start: 0, end: Math.PI * 0.5 },
        { cx: x + radius, cy: y + h - radius, start: Math.PI * 0.5, end: Math.PI }
      ];

      corners.forEach(c => {
        const arcLen = (c.end - c.start) * radius;
        const count = Math.max(3, Math.floor(arcLen / this.step));
        for (let i = 0; i <= count; i++) {
          const angle = c.start + (c.end - c.start) * (i / count);
          this.addPoint(
            c.cx + Math.cos(angle) * radius,
            c.cy + Math.sin(angle) * radius
          );
        }
      });
    });
  }

  addPoint(ox, oy) {
    this.points.push({
      ox,
      oy,
      x: ox,
      y: oy,
      vx: 0,
      vy: 0,
      size: this.baseSize,
      perturbed: 0
    });
  }

  bindEvents() {
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.resize(), 100);
    });

    window.addEventListener('scroll', () => {
      this.rebuildBorders();
    }, { passive: true });

    const onPointerMove = (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
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
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
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
    requestAnimationFrame(this.loop);
  }

  update() {
    const mx = this.mouse.x;
    const my = this.mouse.y;
    const R = this.radius;
    const R2 = R * R;
    const len = this.points.length;

    for (let i = 0; i < len; i++) {
      const p = this.points[i];

      // Пружинная сила возврата к базовому положению рамки
      let ax = (p.ox - p.x) * this.spring;
      let ay = (p.oy - p.y) * this.spring;

      // Отталкивание пикселей рамки от курсора (убегающие квадратики)
      if (this.mouse.active) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist2 = dx * dx + dy * dy;

        if (dist2 < R2 && dist2 > 0.001) {
          const dist = Math.sqrt(dist2);
          const f = (1 - dist / R);
          const push = f * f * this.force;
          ax += (dx / dist) * push * 3.5;
          ay += (dy / dist) * push * 3.5;

          p.perturbed = Math.min(1, p.perturbed + 0.35);
          p.size = this.baseSize + f * 1.5;
        } else {
          p.perturbed *= 0.92;
          p.size += (this.baseSize - p.size) * 0.1;
        }
      } else {
        p.perturbed *= 0.92;
        p.size += (this.baseSize - p.size) * 0.1;
      }

      p.vx = (p.vx + ax) * this.damping;
      p.vy = (p.vy + ay) * this.damping;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const len = this.points.length;
    for (let i = 0; i < len; i++) {
      const p = this.points[i];
      const s = p.size;

      // При возмущении квадратики светятся зеленым кибер-оттенком
      if (p.perturbed > 0.05) {
        ctx.fillStyle = `rgba(52, 211, 153, ${0.4 + p.perturbed * 0.6})`;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      }

      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    }
  }
}

window.PixelBorderEngine = PixelBorderEngine;
