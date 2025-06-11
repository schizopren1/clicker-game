import React from 'react';
import styles from './Cases.module.scss';
import { formatNumber } from '../../utils/formatNumber';

const CaseItem = ({ caseInfo, onPurchase, credits }) => {
  const canAfford = credits >= caseInfo.cost;

  const handlePurchase = () => {
    if (canAfford) {
      onPurchase(caseInfo.id, caseInfo.cost);
    }
  };

  return (
    <div className={`${styles.caseItem} ${!canAfford ? styles.unaffordable : ''}`}>
      <div className={styles.caseIcon}>{caseInfo.icon}</div>
      <div className={styles.caseInfo}>
        <h3 className={styles.caseName}>{caseInfo.name}</h3>
        <p className={styles.caseDescription}>{caseInfo.description}</p>
      </div>
      <div className={styles.caseActions}>
        <p className={styles.caseCost}>{formatNumber(caseInfo.cost)} кредитів</p>
        <button
          className={styles.purchaseButton}
          onClick={handlePurchase}
          disabled={!canAfford}
        >
          Купити
        </button>
      </div>
    </div>
  );
};

export default CaseItem;