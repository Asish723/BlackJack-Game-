import React from 'react';
import styles from './styles/TableMarkings.module.css';

const TableMarkings: React.FC = () => {
  return (
    <div className={styles.markingsContainer}>
      <div className={styles.arcDivider}></div>

      <div className={styles.textGroup}>
        <div className={styles.goldRule}>
          <span>BLACKJACK PAYS 3 TO 2</span>
        </div>
        <div className={styles.whiteRule}>
          DEALER MUST DRAW TO 16 AND STAND ON ALL 17S
        </div>
        <div className={styles.insuranceBanner}>
          <span className={styles.insuranceLine}></span>
          <span className={styles.insuranceText}>INSURANCE PAYS 2 TO 1</span>
          <span className={styles.insuranceLine}></span>
        </div>
      </div>

      {/* Flexible Live Casino Crest & Suits Medallion */}
      <div className={styles.emblemWrapper}>
        <div className={styles.wingLine}></div>
        <div className={styles.suitsPill}>
          <div className={`${styles.suitPillItem} ${styles.spade}`}>♠</div>
          <div className={`${styles.suitPillItem} ${styles.heart}`}>♥</div>
          <div className={styles.emblemCenter}>
            <span className={styles.emblemStar}>★</span>
            <span className={styles.emblemTitle}>VIP DECK</span>
            <span className={styles.emblemStar}>★</span>
          </div>
          <div className={`${styles.suitPillItem} ${styles.diamond}`}>♦</div>
          <div className={`${styles.suitPillItem} ${styles.club}`}>♣</div>
        </div>
        <div className={styles.wingLine}></div>
      </div>
    </div>
  );
};

export default TableMarkings;
