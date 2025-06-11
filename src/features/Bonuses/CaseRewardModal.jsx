// src/features/Bonuses/CaseRewardModal.jsx
import React from 'react';
import styles from './Bonuses.module.scss';

const CaseRewardModal = ({ isOpen, onClose, reward }) => {
  if (!isOpen || !reward) return null;

  // Використовуємо reward.getDescription, якщо він є, інакше ім'я нагороди
  const descriptionText = typeof reward.getDescription === 'function'
    ? reward.getDescription(reward.currentValue) // Передаємо currentValue для нагород типу INSTANT_CREDITS
    : reward.name;

  return (
    <div className={styles.modalOverlay} onClick={onClose}> {/* Закриття по кліку на оверлей */}
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}> {/* Запобігаємо закриттю по кліку на контент */}
        <h2>{reward.icon} {reward.name}!</h2>
        <p className={styles.rewardDescription}>{descriptionText}</p>
        <button onClick={onClose} className={styles.modalCloseButton}>
          Чудово!
        </button>
      </div>
    </div>
  );
};

export default CaseRewardModal;