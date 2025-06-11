// src/utils/gameConfig.js
export const PRESTIGE_SETTINGS = {
  REQUIRED_CREDITS_FOR_PRESTIGE: 1000000, // Приклад: 1 мільйон кредитів (зароблених у цій сесії)
  DUIKTCOINS_PER_PRESTIGE_POINT: 1,
  calculatePrestigePoints: (creditsEarnedThisSession) => {
    if (creditsEarnedThisSession < PRESTIGE_SETTINGS.REQUIRED_CREDITS_FOR_PRESTIGE) return 0;
    // Формула: кожен мільйон зароблених кредитів дає очки, але зі спадною віддачею
    // Приклад: log10(1000000/100000 +1) * 10 = log10(11) * 10 ~ 1.04 * 10 = 10 очок
    // log10(10000000/100000 +1) * 10 = log10(101) * 10 ~ 2 * 10 = 20 очок
    // Підберіть коефіцієнти для балансу
    return Math.floor(Math.log10(creditsEarnedThisSession / 100000 + 1) * 10);
  },
  INCOME_BONUS_PER_DUIKTCOIN: 0.01, // +1% до загального доходу за кожен Duiktcoin
};