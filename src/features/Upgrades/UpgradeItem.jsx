// src/features/Upgrades/UpgradeItem.jsx
import React from 'react';
import { motion } from 'framer-motion'; // Імпортуємо motion
import styles from './Upgrades.module.scss';
import { calculateUpgradeCost } from '../../utils/upgradesData';

// Обгортаємо в motion.div
const MotionDiv = motion.div;

const UpgradeItem = ({ upgrade, level, onPurchase, credits, canAfford }) => {
  const currentCost = calculateUpgradeCost(upgrade, level);
  const isMaxLevel = level >= upgrade.maxLevel;

  return (
    <MotionDiv // Використовуємо MotionDiv
      className={`${styles.upgradeItem} ${!canAfford && !isMaxLevel ? styles.unaffordable : ''} ${isMaxLevel ? styles.maxLevel : ''}`}
      initial={{ opacity: 0, y: 20 }} // Початковий стан (невидимий, зміщений вниз)
      animate={{ opacity: 1, y: 0 }}   // Кінцевий стан (видимий, на своєму місці)
      transition={{ duration: 0.3, delay: (upgrade.animationDelay || 0) * 0.05 }} // Плавний перехід з невеликою затримкою для каскадного ефекту
      layout // Анімує зміни в макеті, якщо елементи перевпорядковуються або змінюють розмір
    >
      <div className={styles.upgradeIcon}>{upgrade.icon}</div>
      <div className={styles.upgradeInfo}>
        <h3 className={styles.upgradeName}>{upgrade.name} (Рів. {level})</h3>
        <p className={styles.upgradeDescription}>{upgrade.description}</p>
        {!isMaxLevel ? (
          <p className={styles.upgradeCost}>Вартість: {currentCost.toLocaleString()}</p>
        ) : (
          <p className={styles.upgradeMaxed}>МАКС. РІВЕНЬ</p>
        )}
      </div>
      {!isMaxLevel && (
        <button
          className={styles.purchaseButton}
          onClick={() => onPurchase(upgrade.id, currentCost)}
          disabled={!canAfford}
        >
          Купити
        </button>
      )}
    </MotionDiv>
  );
};

export default UpgradeItem;