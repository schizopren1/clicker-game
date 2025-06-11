// src/features/Prestige/PrestigeSystem.jsx
import React from 'react';
import styles from './Prestige.module.scss'; // Створимо цей файл стилів
import { PRESTIGE_SETTINGS } from '../../utils/gameConfig'; // Імпорт налаштувань

const PrestigeSystem = ({
  currentCredits,
  creditsEarnedThisPrestige,
  duiktcoins,
  onPrestige,
}) => {
  const canPrestige = currentCredits >= PRESTIGE_SETTINGS.REQUIRED_CREDITS_FOR_PRESTIGE || creditsEarnedThisPrestige >= PRESTIGE_SETTINGS.REQUIRED_CREDITS_FOR_PRESTIGE;
  const duiktcoinsToGain = canPrestige
    ? PRESTIGE_SETTINGS.calculatePrestigePoints(creditsEarnedThisPrestige) * PRESTIGE_SETTINGS.DUIKTCOINS_PER_PRESTIGE_POINT
    : 0;

  const handlePrestigeClick = () => {
    if (canPrestige && duiktcoinsToGain > 0) {
      // Можна додати підтвердження
      if (window.confirm(`Ви впевнені, що хочете здійснити Престиж? Ви отримаєте ${duiktcoinsToGain} Duiktcoin(s) і ваш поточний прогрес (кредити, покращення) буде скинуто.`)) {
        onPrestige(duiktcoinsToGain);
      }
    } else {
        alert(`Вам потрібно накопичити більше прогресу для Престижу (потрібно близько ${PRESTIGE_SETTINGS.REQUIRED_CREDITS_FOR_PRESTIGE.toLocaleString()} кредитів за цю сесію).`);
    }
  };

  const currentBonus = (duiktcoins * PRESTIGE_SETTINGS.INCOME_BONUS_PER_DUIKTCOIN * 100).toFixed(0);

  return (
    <div className={styles.prestigePanel}>
      <h3>Система Престижу</h3>
      <p>Duiktcoins: <span className={styles.duiktcoinCount}>{duiktcoins}</span></p>
      <p>Поточний бонус до доходу: <span className={styles.prestigeBonus}>+{currentBonus}%</span></p>
      {canPrestige && duiktcoinsToGain > 0 && (
        <p className={styles.gainInfo}>При наступному престижі ви отримаєте: ~{duiktcoinsToGain} Duiktcoin(s)</p>
      )}
      <button
        className={styles.prestigeButton}
        onClick={handlePrestigeClick}
        disabled={!canPrestige || duiktcoinsToGain <= 0}
      >
        Здійснити Престиж
      </button>
      {!canPrestige && <p className={styles.requirementInfo}>Для престижу потрібно ~{PRESTIGE_SETTINGS.REQUIRED_CREDITS_FOR_PRESTIGE.toLocaleString()} зароблених кредитів у цій сесії.</p>}
    </div>
  );
};

export default PrestigeSystem;