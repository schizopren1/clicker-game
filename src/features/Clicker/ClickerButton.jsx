// src/features/Clicker/ClickerButton.jsx
import React from 'react';
import styles from './ClickerButton.module.scss';

// Рядок "import { useSkin }..." був тут, але ми його видалили.

const ClickerButton = ({ onClick, clickValue }) => {
  // Ми не використовуємо тут хук, тому логіка залишається простою.
  
  return (
    <button className={styles.clickerButton} onClick={onClick}>
      <span className={styles.clickerText}>КЛІК! ({clickValue})</span>
    </button>
  );
};

export default ClickerButton;