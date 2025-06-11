// src/utils/upgradesData.js

export const UPGRADE_TYPES = {
  CLICK_BOOST: 'CLICK_BOOST', // Збільшення сили кліку
  AUTO_CLICKER: 'AUTO_CLICKER', // Автоматичні кліки на секунду
  PASSIVE_INCOME: 'PASSIVE_INCOME', // Пасивний дохід на секунду
  CRITICAL_CHANCE: 'CRITICAL_CHANCE', // Шанс критичного кліку
  CRITICAL_MULTIPLIER: 'CRITICAL_MULTIPLIER', // Множник критичного кліку
  // Додайте ще, якщо потрібно
};

export const upgradesList = [
  {
    id: 'click_boost_1',
    name: 'Посилений палець',
    description: 'Збільшує кредити за клік на 1.',
    type: UPGRADE_TYPES.CLICK_BOOST,
    baseCost: 10,
    costIncreaseFactor: 1.15, // На скільки збільшується вартість щоразу
    baseEffect: 1, // Базове збільшення сили кліку
    effectIncreaseFactor: 1, // Якщо ефект теж зростає з рівнем (тут не зростає)
    maxLevel: 100,
    icon: '👆', // Емодзі або шлях до іконки
  },
  {
    id: 'auto_clicker_1',
    name: 'Авто-клікер v1',
    description: 'Автоматично клікає 1 раз на секунду.',
    type: UPGRADE_TYPES.AUTO_CLICKER,
    baseCost: 100,
    costIncreaseFactor: 1.2,
    baseEffect: 1, // Кліків на секунду
    effectIncreaseFactor: 1,
    maxLevel: 50,
    icon: '🤖',
  },
  {
    id: 'passive_income_1',
    name: 'Інвестиції новачка',
    description: 'Приносить 5 кредитів на секунду пасивно.',
    type: UPGRADE_TYPES.PASSIVE_INCOME,
    baseCost: 500,
    costIncreaseFactor: 1.25,
    baseEffect: 5, // Кредитів на секунду
    effectIncreaseFactor: 1,
    maxLevel: 30,
    icon: '💰',
  },
  {
    id: 'critical_chance_1',
    name: 'Удача новачка',
    description: 'Збільшує шанс критичного кліку на 1%.',
    type: UPGRADE_TYPES.CRITICAL_CHANCE,
    baseCost: 250,
    costIncreaseFactor: 1.3,
    baseEffect: 0.01, // 1%
    effectIncreaseFactor: 1,
    maxLevel: 20, // Максимум 20% шанс від цього апгрейду
    icon: '🍀',
  },
  {
    id: 'critical_multiplier_1',
    name: 'Точка докладання сили',
    description: 'Збільшує множник критичного кліку на 0.5x.',
    type: UPGRADE_TYPES.CRITICAL_MULTIPLIER,
    baseCost: 1000,
    costIncreaseFactor: 1.35,
    baseEffect: 0.5, // +0.5x до множника
    effectIncreaseFactor: 1,
    maxLevel: 10,
    icon: '💥',
  },
  // Додайте ще апгрейди за аналогією
];

// Функція для розрахунку вартості апгрейду на основі рівня
export const calculateUpgradeCost = (upgrade, level) => {
  if (level >= upgrade.maxLevel) return Infinity; // Не можна купити, якщо макс. рівень
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costIncreaseFactor, level));
};

// Функція для розрахунку ефекту апгрейду на основі рівня (якщо ефект складний)
// У нашому випадку ефект просто підсумовується або базовий * рівень
export const calculateUpgradeEffect = (upgrade, level) => {
    // Для більшості наших апгрейдів ефект просто baseEffect * level
    // Але можна зробити складніше, якщо baseEffect - це початкове значення, а effectIncreaseFactor - множник
    return upgrade.baseEffect * level; // Спрощений варіант, якщо кожен рівень дає +baseEffect
    // Для CLICK_BOOST краще, якщо кожен рівень додає baseEffect
    // return upgrade.baseEffect; // якщо кожен рівень додає baseEffect
};