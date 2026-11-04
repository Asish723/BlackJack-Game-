import React from 'react';
import styles from './styles/Status.module.css';

type StatusProps = {
  message: string,
  balance: number,
  bet: number,
  insuranceBet: number
};

const Status: React.FC<StatusProps> = ({ message, balance, bet, insuranceBet }) => {
  return (
    <div className={styles.statusContainer}>
      <div className={styles.status}>
        <h1 className={styles.value}>{message}</h1>
      </div>
      <div className={styles.balance}>
        <h1 className={styles.value}>${balance}</h1>
        {bet > 0 && <p className={styles.betInfo}>Bet: ${bet}{insuranceBet > 0 ? ` | Insurance: $${insuranceBet}` : ''}</p>}
      </div>
    </div>
  );
}

export default Status;
