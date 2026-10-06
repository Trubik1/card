// =============================================================================
// КОНФИГУРАЦИЯ ПЕРСОНАЛЬНОЙ КАРТОЧКИ — TRUBIK
// =============================================================================

window.CARD_CONFIG = {
  // Имя и заголовок
  name: "Trubik",
  tagline: "ML Engineer & Fullstack Developer",
  bio: "Разработка систем компьютерного зрения, обучающих платформ с ИИ, Telegram-ботов и масштабируемых веб-приложений. Фокус на производительность и надёжность.",
  
  // Контакты
  telegram: {
    username: "@Trubik1",
    url: "https://t.me/Trubik1",
    buttonText: "Написать в Telegram"
  },
  
  channel: {
    username: "@Trubik11",
    url: "https://t.me/Trubik11",
    buttonText: "Telegram Канал"
  },

  github: {
    username: "Trubik1",
    url: "https://github.com/Trubik1",
    buttonText: "GitHub Профиль"
  },

  // Проекты (пока без внешних ссылок)
  projects: [
    {
      id: "connecto",
      title: "Connecto",
      tag: "WEB // NETWORKING",
      category: "Fullstack",
      desc: "Веб-приложение для нетворкинга на мероприятиях. Позволяет организаторам создавать события, а участникам — находить людей по интересам, обмениваться запросами на знакомство и формировать список контактов."
    },
    {
      id: "defect-detection",
      title: "Defect Detection CV",
      tag: "ML // COMPUTER VISION",
      category: "AI & CV",
      desc: "Высокоточная система компьютерного зрения для микродетекции дефектов пайки и компонентов на микроплатах в режиме реального времени."
    },
    {
      id: "ai-education",
      title: "AI Education Platform",
      tag: "AI // EDTECH",
      category: "Platform",
      desc: "Интерактивная обучающая тестовая система со встроенным ИИ-ассистентом, персонализированной генерацией заданий и адаптивным оцениванием."
    },
    {
      id: "gift-flipper",
      title: "Telegram Gift Flipper",
      tag: "BOT // ARBITRAGE",
      category: "Telegram",
      desc: "Автоматизированный бот для быстрого мониторинга, аналитики и флипа подарков в Telegram с мгновенным исполнением сценариев."
    },
    {
      id: "business-web",
      title: "Business Web Platforms",
      tag: "FULLSTACK // ENTERPRISE",
      category: "Web",
      desc: "Пул масштабируемых веб-сервисов и коммерческих сайтов для бизнеса с индивидуальной архитектурой, адаптивным UI и высокой конверсией."
    }
  ],

  // Стек технологий по категориям
  skillGroups: [
    {
      title: "Machine Learning & CV",
      skills: ["PyTorch", "TensorFlow", "OpenCV", "YOLO", "Computer Vision", "Scikit-Learn"]
    },
    {
      title: "Mobile Development",
      skills: ["Android SDK", "Kotlin", "Jetpack Compose", "Coroutines", "Room"]
    },
    {
      title: "Frontend Engineering",
      skills: ["React", "Next.js", "TypeScript", "JavaScript", "HTML5 / Canvas", "Tailwind CSS"]
    },
    {
      title: "Backend & Ecosystem",
      skills: ["Python", "FastAPI", "Node.js", "PostgreSQL", "Redis", "Telegram Bot API"]
    }
  ],

  // Только точные номера стикеров, которые указал пользователь (стартовый #10)
  stickers: [
    { id: "amnumya-10", src: "assets/amnumya_010.webp" },
    { id: "amnumya-71", src: "assets/amnumya_071.webp" },
    { id: "amnumya-05", src: "assets/amnumya_005.webp" },
    { id: "amnumya-19", src: "assets/amnumya_019.webp" },
    { id: "amnumya-25", src: "assets/amnumya_025.webp" },
    { id: "amnumya-30", src: "assets/amnumya_030.webp" },
    { id: "amnumya-34", src: "assets/amnumya_034.webp" },
    { id: "amnumya-40", src: "assets/amnumya_040.webp" },
    { id: "amnumya-50", src: "assets/amnumya_050.webp" }
  ],
  defaultSticker: "amnumya-10",
  stickerAutoCycleSeconds: 4,

  // Настройки физики частиц фонового Canvas
  particles: {
    enabled: true,
    gridDensity: 32,
    repulsionRadius: 110,
    particleColor: "rgba(255, 255, 255, 0.35)",
    cursorLightColor: "rgba(52, 211, 153, 0.15)"
  }
};
