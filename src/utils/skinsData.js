// src/utils/skinsData.js
export const SKIN_UNLOCK_TYPE = {
  CREDITS: 'CREDITS',
  DUIKTCOINS: 'DUIKTCOINS',
  ACHIEVEMENT: 'ACHIEVEMENT',
  DEFAULT: 'DEFAULT',
};

export const skinsList = [
  {
    id: 'neon_crystal',
    name: 'Неоновий Кристал',
    description: 'Стандартна тема. Темна, з ефектом матового скла.',
    unlockType: SKIN_UNLOCK_TYPE.DEFAULT,
    previewColor: '#00f2fe',
    themeVariables: {
      '--primary-color': '#00f2fe',
      '--primary-color-rgb': '0, 242, 254',
      '--secondary-color': '#ff00e5',
      '--background-color': '#1a1a2e',
      '--panel-bg-color': 'rgba(23, 23, 43, 0.5)',
      '--card-bg-color': 'rgba(255, 255, 255, 0.05)',
      '--backdrop-filter-blur': '12px',
      '--text-color': '#e0e0e0',
      '--text-color-light': '#ffffff',
      '--text-color-muted': '#a0a0b0',
      '--text-color-on-primary': '#1a1a2e',
      '--border-color': 'rgba(255, 255, 255, 0.1)',
    },
  },
  {
    id: 'classic_light',
    name: 'Класичний Світлий',
    description: 'Оригінальний світлий та чистий дизайн.',
    unlockType: SKIN_UNLOCK_TYPE.CREDITS,
    unlockValue: 10000,
    previewColor: '#007bff',
    themeVariables: {
      '--primary-color': '#007bff',
      '--primary-color-rgb': '0, 123, 255',
      '--secondary-color': '#28a745',
      '--background-color': '#f4f6f8',
      '--panel-bg-color': '#ffffff',
      '--card-bg-color': '#f8f9fa',
      '--backdrop-filter-blur': '0px',
      '--text-color': '#495057',
      '--text-color-light': '#212529',
      '--text-color-muted': '#6c757d',
      '--text-color-on-primary': '#ffffff',
      '--border-color': '#dee2e6',
    },
  },
  // 👇 НОВИЙ СКІН 👇
  {
    id: 'cyber_sunset',
    name: 'Кіберпанк Захід',
    description: 'Неонові вогні на тлі нічного міста.',
    unlockType: SKIN_UNLOCK_TYPE.CREDITS,
    unlockValue: 150000,
    previewColor: '#ff6b00',
    themeVariables: {
      '--primary-color': '#ff6b00', // Гарячий помаранчевий
      '--primary-color-rgb': '255, 107, 0',
      '--secondary-color': '#00ffff', // Ціановий (бірюзовий)
      '--background-color': '#0d0221', // Дуже темний фіолетовий
      '--panel-bg-color': 'rgba(13, 2, 33, 0.6)',
      '--card-bg-color': 'rgba(42, 12, 94, 0.3)',
      '--backdrop-filter-blur': '8px',
      '--text-color': '#f0f0f0',
      '--text-color-light': '#ffffff',
      '--text-color-muted': '#8d8d9e',
      '--text-color-on-primary': '#0d0221',
      '--border-color': 'rgba(0, 255, 255, 0.2)',
    },
  },
];