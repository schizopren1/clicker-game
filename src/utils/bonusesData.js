// src/utils/bonusesData.js
export const BONUS_TYPES = {
  INSTANT_CREDITS: 'INSTANT_CREDITS',
  CLICK_MULTIPLIER: 'CLICK_MULTIPLIER',
  CPS_BOOST: 'CPS_BOOST',
  // Тип CASE_REWARD більше не потрібен для спавну, він використовується в casesData.js
};

// CASE_REWARD_INTERNAL_TYPES тепер у casesData.js
// caseRewardsPool тепер у casesData.js
// getRandomCaseReward тепер у casesData.js

// Залишаються тільки бонуси для випадкового спавну (якщо вони потрібні)
export const possibleBonuses = [
  {
    id: 'instant_credits_small_spawn',
    type: BONUS_TYPES.INSTANT_CREDITS,
    name: 'Мішок кредитів',
    description: (value) => `Ви знайшли ${value ? value.toLocaleString() : 'трохи'} кредитів!`,
    value: () => 50 + Math.floor(Math.random() * 150),
    duration: 0,
    icon: '💰',
    weight: 5,
  },
  {
    id: 'click_multiplier_x2_30s_spawn',
    type: BONUS_TYPES.CLICK_MULTIPLIER,
    name: 'Подвійний клік!',
    description: () => 'Кліки x2 на 30 секунд!',
    apply: () => ({ clickMultiplierBonus: 2 }),
    duration: 30000,
    icon: '✨👆',
    weight: 3,
  },
  {
    id: 'cps_boost_50p_20s_spawn',
    type: BONUS_TYPES.CPS_BOOST,
    name: 'Буст доходу!',
    description: () => 'Дохід/сек +50% на 20 секунд!',
    apply: () => ({ cpsMultiplierBonus: 1.5 }),
    duration: 20000,
    icon: '🚀',
    weight: 2,
  },
  // ПРИБРАЛИ 'mystery_case_spawn' звідси
];

export const getRandomBonus = () => {
  if (possibleBonuses.length === 0) return null; // Якщо немає бонусів для спавну
  const totalWeight = possibleBonuses.reduce((sum, bonus) => sum + bonus.weight, 0);
  if (totalWeight === 0) return null;
  let randomNum = Math.random() * totalWeight;
  for (const bonus of possibleBonuses) {
    if (randomNum < bonus.weight) {
      const currentBonus = { ...bonus };
      if (currentBonus.type === BONUS_TYPES.INSTANT_CREDITS && typeof currentBonus.value === 'function') {
        currentBonus.currentValue = currentBonus.value();
      }
      return currentBonus;
    }
    randomNum -= bonus.weight;
  }
  const fallbackBonus = { ...(possibleBonuses.find(b => b.weight > 0) || possibleBonuses[0]) };
   if (fallbackBonus && fallbackBonus.type === BONUS_TYPES.INSTANT_CREDITS && typeof fallbackBonus.value === 'function') {
        fallbackBonus.currentValue = fallbackBonus.value();
    }
  return fallbackBonus;
};