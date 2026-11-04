import React, { useEffect, useState } from 'react';
import styles from './styles/ResultOverlay.module.css';

export type ResultType = 'win' | 'lose' | 'tie' | null;

export type SplitResult = {
  label: string;
  type: 'win' | 'lose' | 'tie';
  amount: number;
};

type ResultOverlayProps = {
  show: boolean;
  resultType: ResultType;
  headline: string;
  amountChange: number;
  onNextRound: () => void;
  splitResults?: SplitResult[];
};

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
const CONFETTI_COUNT = 60;

const ResultOverlay: React.FC<ResultOverlayProps> = ({
  show,
  resultType,
  headline,
  amountChange,
  onNextRound,
  splitResults
}) => {
  const [confetti, setConfetti] = useState<any[]>([]);

  useEffect(() => {
    if (show && resultType === 'win') {
      const pieces = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 1.8 + Math.random() * 1.5,
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
      }));
      setConfetti(pieces);
    } else {
      setConfetti([]);
    }
  }, [show, resultType]);

  if (!show) return null;

  const emoji = resultType === 'win' ? '🏆' : resultType === 'tie' ? '🤝' : '💸';
  const amountText = amountChange > 0
    ? `+$${amountChange}`
    : amountChange < 0
    ? `-$${Math.abs(amountChange)}`
    : '$0';

  return (
    <div className={`${styles.overlay} ${styles.fadeIn}`}>
      {/* Confetti rain for wins */}
      {confetti.map(c => (
        <div
          key={c.id}
          className={styles.confettiPiece}
          style={{
            left: `${c.left}%`,
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            width: c.shape === 'circle' ? `${c.size}px` : `${c.size * 0.6}px`,
            height: c.shape === 'circle' ? `${c.size}px` : `${c.size * 1.4}px`,
            borderRadius: c.shape === 'circle' ? '50%' : '2px',
            transform: `rotate(${c.rotation}deg)`,
          }}
        />
      ))}

      <div className={`${styles.card} ${resultType === 'win' ? styles.winCard : resultType === 'tie' ? styles.tieCard : styles.loseCard}`}>
        <div className={`${styles.emoji} ${resultType === 'win' ? styles.bounceEmoji : resultType === 'lose' ? styles.shakeEmoji : styles.pulseEmoji}`}>
          {emoji}
        </div>

        <h1 className={`${styles.headline} ${resultType === 'win' ? styles.winText : resultType === 'tie' ? styles.tieText : styles.loseText}`}>
          {headline}
        </h1>

        {splitResults && splitResults.length > 0 && (
          <div className={styles.splitList}>
            {splitResults.map((sr, idx) => (
              <div key={idx} className={styles.splitItem}>
                <span className={styles.splitLabel}>{sr.label}:</span>
                <span className={sr.type === 'win' ? styles.splitWin : sr.type === 'lose' ? styles.splitLose : styles.splitTie}>
                  {sr.type === 'win' ? `Won (+$${sr.amount})` : sr.type === 'lose' ? `Lost (-$${Math.abs(sr.amount)})` : 'Push ($0)'}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className={`${styles.amount} ${amountChange > 0 ? styles.amountWin : amountChange < 0 ? styles.amountLose : styles.amountTie}`}>
          {splitResults ? `Net: ${amountText}` : amountText}
        </p>

        <button className={`${styles.nextBtn} ${resultType === 'win' ? styles.nextBtnWin : resultType === 'tie' ? styles.nextBtnTie : styles.nextBtnLose}`} onClick={onNextRound}>
          Next Round →
        </button>
      </div>
    </div>
  );
};

export default ResultOverlay;
