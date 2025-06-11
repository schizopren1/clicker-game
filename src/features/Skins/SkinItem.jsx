// src/features/Skins/SkinItem.jsx
import React from 'react';
import styles from './Skins.module.scss'; // Створимо цей файл

const SkinItem = ({
  skin,
  isUnlocked,
  isActive,
  canUnlock,
  onUnlock,
  onSelect,
  currentCredits,
  currentDuiktcoins
}) => {
  const handleUnlock = () => {
    if (canUnlock && !isUnlocked) {
      onUnlock(skin.id, skin.unlockType, skin.unlockValue);
    }
  };

  const handleSelect = () => {
    if (isUnlocked) {
      onSelect(skin.id);
    }
  };

  let unlockButtonText = 'Розблоковано';
  let unlockAction = null;
  let unlockDisabled = true;

  if (!isUnlocked) {
    unlockAction = handleUnlock;
    unlockDisabled = !canUnlock;
    if (skin.unlockType === 'CREDITS') {
      unlockButtonText = `Купити (${skin.unlockValue.toLocaleString()} кр.)`;
    } else if (skin.unlockType === 'DUIKTCOINS') {
      unlockButtonText = `Купити (${skin.unlockValue} D¢)`;
    } else if (skin.unlockType === 'ACHIEVEMENT') {
      unlockButtonText = `Відкрити (Досягнення)`; // Опис досягнення можна додати в skin.description
    }
  }

  return (
    <div className={`${styles.skinItem} ${isActive ? styles.active : ''} ${isUnlocked ? styles.unlocked : styles.locked}`}>
      <div className={styles.skinPreview} style={{ backgroundColor: skin.previewColor || '#ccc' }}>
        <span>{skin.name.substring(0, 2).toUpperCase()}</span>
      </div>
      <div className={styles.skinInfo}>
        <h4 className={styles.skinName}>{skin.name}</h4>
        <p className={styles.skinDescription}>{skin.description}</p>
        {!isUnlocked && skin.unlockType !== 'DEFAULT' && (
          <p className={styles.unlockCondition}>
            {skin.unlockType === 'CREDITS' && `Потрібно: ${skin.unlockValue.toLocaleString()} кредитів`}
            {skin.unlockType === 'DUIKTCOINS' && `Потрібно: ${skin.unlockValue} Duiktcoins`}
            {skin.unlockType === 'ACHIEVEMENT' && `Умова: ${skin.unlockValue} (див. опис)`}
          </p>
        )}
      </div>
      <div className={styles.skinActions}>
        {isUnlocked ? (
          <button
            onClick={handleSelect}
            disabled={isActive}
            className={`${styles.actionButton} ${styles.selectButton}`}
          >
            {isActive ? 'Активний' : 'Обрати'}
          </button>
        ) : skin.unlockType !== 'DEFAULT' ? (
          <button
            onClick={unlockAction}
            disabled={unlockDisabled}
            className={`${styles.actionButton} ${styles.unlockButton}`}
          >
            {unlockButtonText}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default SkinItem;