import React from 'react';
import styles from './styles/Card.module.css';

type CardProps = {
  value: string;
  suit: string;
  hidden: boolean;
  index: number;
};

const Card: React.FC<CardProps> = ({ value, suit, hidden, index }) => {
  const animStyle: React.CSSProperties = {
    animationDelay: `${index * 0.16}s`,
  };

  const getColorClass = () => {
    return suit === '♠' || suit === '♣' ? styles.blackSuit : styles.redSuit;
  };

  if (hidden) {
    return (
      <div className={`${styles.card} ${styles.dealIn}`} style={animStyle}>
        <div className={styles.cardBack}>
          <div className={styles.cardBackPattern}>
            <div className={styles.cardBackSeal}>♠ ♣ ♦ ♥</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.dealIn}`} style={animStyle}>
      <div className={`${styles.cardFace} ${getColorClass()}`}>
        {/* Top-left corner index */}
        <div className={styles.cornerTop}>
          <span className={styles.cornerValue}>{value}</span>
          <span className={styles.cornerSuit}>{suit}</span>
        </div>

        {/* Prominent centered suit pip */}
        <div className={styles.centerPip}>{suit}</div>

        {/* Bottom-right inverted corner index (mirror of real cards) */}
        <div className={styles.cornerBottom}>
          <span className={styles.cornerValue}>{value}</span>
          <span className={styles.cornerSuit}>{suit}</span>
        </div>
      </div>
    </div>
  );
};

export default Card;
