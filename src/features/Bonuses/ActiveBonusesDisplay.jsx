// src/features/Bonuses/ActiveBonusesDisplay.jsx
import React, { useState, useEffect } from 'react';
import styles from './Bonuses.module.scss'; // Використовуємо ті ж стилі

const ActiveBonusesDisplay = ({ activeBonuses }) => {
  const [, setTick] = useState(0); // Для перерендеру та оновлення таймерів

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTick(prevTick => prevTick + 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (!activeBonuses || activeBonuses.length === 0) {
    return null;
  }

  return (
    <div className={styles.activeBonusesList}>
      <h4>Активні бонуси:</h4>
      <ul>
        {activeBonuses.map(bonus => {
          const timeLeft = Math.max(0, Math.round((bonus.expiresAt - Date.now()) / 1000));
          return (
            <li key={bonus.idInGame}>
              {bonus.icon} {bonus.name} - {timeLeft}с
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ActiveBonusesDisplay;