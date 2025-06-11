// src/features/Effects/FloatingPoints.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Effects.module.scss'; // Создадим этот файл

const FloatingPoints = ({ points, id, x, y, isCritical = false }) => {
  return (
    <motion.div
      key={id} // Важно для AnimatePresence
      className={`${styles.floatingPoints} ${isCritical ? styles.critical : ''}`}
      style={{
        position: 'absolute', // Позиционируем абсолютно
        left: `${x}px`,
        top: `${y}px`,
        pointerEvents: 'none', // Чтобы не мешало кликам
      }}
      initial={{ opacity: 1, y: 0, scale: isCritical ? 1.2 : 1 }}
      animate={{ opacity: 0, y: isCritical ? -80 : -60, scale: isCritical ? 1.5 : 1.2 }}
      exit={{ opacity: 0, y: isCritical ? -100 : -80, scale: isCritical ? 1.7 : 1.4 }} // exit не всегда хорошо работает с AnimatePresence без layout
      transition={{ duration: isCritical ? 1.2 : 0.8, ease: "easeOut" }}
    >
      +{points.toLocaleString()}
    </motion.div>
  );
};

export default FloatingPoints;