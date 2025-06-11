// src/features/Notifications/ToastNotification.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Notifications.module.scss'; // Создадим этот файл

const ToastNotification = ({ notification, onDismiss }) => {
  const { id, icon, title, message, type = 'info', duration = 5000 } = notification;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout // Важно для AnimatePresence при удалении элементов из списка
      className={`${styles.toastNotification} ${styles[type]}`}
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onClick={() => onDismiss(id)} // Закрытие по клику
    >
      {icon && <span className={styles.toastIcon}>{icon}</span>}
      <div className={styles.toastContent}>
        {title && <h5 className={styles.toastTitle}>{title}</h5>}
        {message && <p className={styles.toastMessage}>{message}</p>}
      </div>
      <button className={styles.toastCloseButton} onClick={(e) => { e.stopPropagation(); onDismiss(id); }}>
        ×
      </button>
    </motion.div>
  );
};

export default ToastNotification;