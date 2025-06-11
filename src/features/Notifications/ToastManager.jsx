// src/features/Notifications/ToastManager.jsx
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import ToastNotification from './ToastNotification';
import styles from './Notifications.module.scss';

const ToastManager = ({ notifications, dismissNotification }) => {
  return (
    <div className={styles.toastContainer}>
      <AnimatePresence initial={false}>
        {notifications.map((notification) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastManager;