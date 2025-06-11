// src/features/Bonuses/BonusManager.jsx
import React, { useState, useEffect } from 'react';
import styles from './Bonuses.module.scss';
import { getRandomBonus } from '../../utils/bonusesData';

const BONUS_SPAWN_CHANCE_PER_CLICK = 0.02; // 2% шанс (збільшив для тесту)
const BONUS_BUTTON_LIFETIME = 10000; // 10 секунд

const BonusManager = ({ onActivateBonus, totalClicks }) => {
  const [availableBonus, setAvailableBonus] = useState(null);
  const [bonusButtonTimer, setBonusButtonTimer] = useState(0);

  useEffect(() => {
    if (totalClicks > 0 && !availableBonus && Math.random() < BONUS_SPAWN_CHANCE_PER_CLICK) {
        const newBonus = getRandomBonus();
        if (newBonus) { // Переконаємося, що newBonus не null
            if (typeof newBonus.value === 'function') {
                newBonus.currentValue = newBonus.value();
            }
            setAvailableBonus(newBonus);
            setBonusButtonTimer(BONUS_BUTTON_LIFETIME / 1000);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalClicks]); // Прибрав availableBonus із залежностей, щоб він не заважав новому спавну після активації старого

  useEffect(() => {
    if (!availableBonus || bonusButtonTimer <= 0) {
      if (availableBonus && bonusButtonTimer <= 0) setAvailableBonus(null);
      return;
    }
    const intervalId = setInterval(() => {
      setBonusButtonTimer(prev => {
        if (prev - 1 <= 0) {
          clearInterval(intervalId);
          setAvailableBonus(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [availableBonus, bonusButtonTimer]);

  const handleActivateBonusClick = () => {
    if (!availableBonus) return;
    onActivateBonus(availableBonus);
    setAvailableBonus(null);
    setBonusButtonTimer(0);
  };

  if (!availableBonus) {
    return null;
  }

  const buttonDescription = typeof availableBonus.description === 'function'
    ? availableBonus.description(availableBonus.currentValue)
    : availableBonus.name;

  return (
    <div className={styles.bonusManager}>
      <button
        className={styles.bonusButton}
        onClick={handleActivateBonusClick}
        title={buttonDescription}
      >
        {availableBonus.icon} {availableBonus.name} ({bonusButtonTimer}с)
      </button>
    </div>
  );
};

export default BonusManager;