// src/components/Button.jsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from './Button.module.scss'; // Створити цей файл

const Button = ({ onClick, children, disabled = false, className = '', variant = 'primary' }) => {
  return (
    <motion.button
      className={`${styles.customButton} ${styles[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {children}
    </motion.button>
  );
};

export default Button;