// src/utils/casesData.js
import { BONUS_TYPES } from './bonusesData'; // Імпортуємо типи бонусів для boostDetails

export const CASE_REWARD_INTERNAL_TYPES = {
    INSTANT_CREDITS: 'INSTANT_CREDITS_FROM_CASE',
    TEMPORARY_BOOST: 'TEMPORARY_BOOST_FROM_CASE',
};

export const caseRewardsPool = [
  {
    id: 'case_credits_small',
    name: 'Трохи кредитів',
    type: CASE_REWARD_INTERNAL_TYPES.INSTANT_CREDITS,
    value: () => 100 + Math.floor(Math.random() * 200),
    icon: '💰',
    weight: 10,
    getDescription: (value) => `+${value ? value.toLocaleString() : 'Н/Д'} кредитів!`,
  },
  {
    id: 'case_credits_medium',
    name: 'Пристойна сума',
    type: CASE_REWARD_INTERNAL_TYPES.INSTANT_CREDITS,
    value: () => 500 + Math.floor(Math.random() * 1000),
    icon: '💰💰',
    weight: 5,
    getDescription: (value) => `+${value ? value.toLocaleString() : 'Н/Д'} кредитів!`,
  },
  {
    id: 'case_temp_click_boost_short',
    name: 'Міні-буст кліка',
    type: CASE_REWARD_INTERNAL_TYPES.TEMPORARY_BOOST,
    boostDetails: {
      id: 'temp_click_boost_from_case_1.5x_15s',
      type: BONUS_TYPES.CLICK_MULTIPLIER, // Тип ефекту
      name: 'Міні-буст кліка (15с)',
      apply: () => ({ clickMultiplierBonus: 1.5 }),
      duration: 15000,
      icon: '⚡️',
    },
    weight: 7,
    getDescription: () => `Кліки x1.5 на 15 секунд!`,
  },
  {
    id: 'case_temp_cps_boost_short',
    name: 'Міні-буст доходу',
    type: CASE_REWARD_INTERNAL_TYPES.TEMPORARY_BOOST,
    boostDetails: {
      id: 'temp_cps_boost_from_case_1.25x_20s',
      type: BONUS_TYPES.CPS_BOOST, // Тип ефекту
      name: 'Міні-буст доходу (20с)',
      apply: () => ({ cpsMultiplierBonus: 1.25 }),
      duration: 20000,
      icon: '📈',
    },
    weight: 6,
    getDescription: () => `Дохід/сек x1.25 на 20 секунд!`,
  },
];

export const getRandomCaseReward = () => {
  const totalWeight = caseRewardsPool.reduce((sum, reward) => sum + reward.weight, 0);
  if (totalWeight === 0) return caseRewardsPool[0] || null; // Захист, якщо всі ваги 0
  let randomNum = Math.random() * totalWeight;
  for (const reward of caseRewardsPool) {
    if (randomNum < reward.weight) {
      const finalValue = typeof reward.value === 'function' ? reward.value() : reward.value;
      return { ...reward, currentValue: finalValue };
    }
    randomNum -= reward.weight;
  }
  const fallbackReward = caseRewardsPool[0];
  const fallbackValue = typeof fallbackReward.value === 'function' ? fallbackReward.value() : fallbackReward.value;
  return { ...fallbackReward, currentValue: fallbackValue };
};

export const purchasableCases = [
  {
    id: 'standard_case',
    name: 'Стандартний Кейс',
    description: 'Містить випадкову нагороду.',
    cost: 250,
    icon: '🎁',
  },
  {
    id: 'premium_case',
    name: 'Преміум Кейс',
    description: 'Більш цінні нагороди!',
    cost: 1000,
    icon: '💎',
  },
];