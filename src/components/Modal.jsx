// src/components/Modal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Modal.module.scss'; // Створити цей файл
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Закриття по кліку на фон
        >
          <motion.div
            className={styles.modalContent}
            initial={{ y: "-50px", opacity: 0 }}
            animate={{ y: "0", opacity: 1 }}
            exit={{ y: "50px", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()} // Зупинити спливання, щоб не закривалось по кліку на контент
          >
            <div className={styles.modalHeader}>
              <h2>{title}</h2>
              <Button onClick={onClose} variant="secondary" className={styles.closeButton}>X</Button>
            </div>
            <div className={styles.modalBody}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;