// src/features/Upgrades/UpgradesList.jsx
import React from 'react';
import UpgradeItem from './UpgradeItem';
import styles from './Upgrades.module.scss';
import { motion } from 'framer-motion';

const UpgradesList = ({ upgrades, credits, onBuyUpgrade, calculateUpgradeCost, calculateUpgradeEffect }) => {
  return (
    <motion.section 
        className={`card ${styles.upgradesSection}`}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="section-title">Покращення</h2>
      <div className={styles.upgradesGrid}>
        {upgrades.map((upgrade, index) => (
          <motion.div
            key={upgrade.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <UpgradeItem
              upgrade={upgrade}
              credits={credits}
              onBuyUpgrade={onBuyUpgrade}
              calculateCost={calculateUpgradeCost}
              calculateEffect={calculateUpgradeEffect}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default UpgradesList;