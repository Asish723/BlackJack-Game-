import React from 'react';
import styles from './styles/Hand.module.css';
import Card from './Card';

type HandProps = {
  title: string;
  cards: any[];
  isActive?: boolean;
};

const Hand: React.FC<HandProps> = ({ title, cards, isActive }) => {
  return (
    <div className={`${styles.handContainer} ${isActive ? styles.activeHand : ''}`}>
      {cards.length > 0 && (
        <h1 className={styles.title}>
          {title} {isActive && <span className={styles.activeBadge}>◄ TURN</span>}
        </h1>
      )}
      <div className={styles.cardContainer}>
        {cards.map((card: any, index: number) => (
          <Card
            key={index}
            index={index}
            value={card.value}
            suit={card.suit}
            hidden={card.hidden}
          />
        ))}
      </div>
    </div>
  );
};

export default Hand;
