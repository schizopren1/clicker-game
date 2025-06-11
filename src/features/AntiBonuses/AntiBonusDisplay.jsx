// src/features/AntiBonuses/AntiBonusDisplay.jsx
import React from 'react';
import styles from './AntiBonuses.module.scss';
import { motion, AnimatePresence } from 'framer-motion';

const AntiBonusDisplay = ({ antiBonuses }) => {
  if (antiBonuses.length === 0) return null;

  return (
    <div className={styles.antiBonusContainer}>
      <AnimatePresence>
        {antiBonuses.map(ab => (
          <motion.div 
            key={ab.id} 
            className={`${styles.antiBonusItem} ${styles[ab.effectType]}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
            layout // Важливо для AnimatePresence з кількома елементами
          >
            <h4>{ab.name}!</h4>
            <p>{ab.description}</p>
            {ab.duration && ab.effectType !== 'lose_credits_percentage' && ( // Не показувати таймер для миттєвих
                 <p>Залишилось: {Math.ceil((ab.expiresAt - Date.now()) / 1000)}с</p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AntiBonusDisplay;