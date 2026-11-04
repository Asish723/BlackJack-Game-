import React, { useState, useEffect } from 'react';
import styles from './styles/Controls.module.css';

type ControlsProps = {
  balance: number;
  gameState: number;
  buttonState: any;
  betEvent: any;
  hitEvent: any;
  standEvent: any;
  resetEvent: any;
  takeInsuranceEvent: any;
  declineInsuranceEvent: any;
  doubleEvent: any;
  splitEvent: any;
  canDouble: boolean;
  canSplit: boolean;
};

const Controls: React.FC<ControlsProps> = ({
  balance, gameState, buttonState, betEvent, hitEvent, standEvent,
  resetEvent, takeInsuranceEvent, declineInsuranceEvent,
  doubleEvent, splitEvent, canDouble, canSplit
}) => {
  const [amount, setAmount] = useState(10);
  const [inputStyle, setInputStyle] = useState(styles.input);

  useEffect(() => { validation(); }, [amount, balance]); // eslint-disable-line

  const validation = () => {
    if (amount > balance || amount < 0.01) {
      setInputStyle(styles.inputError);
      return false;
    }
    setInputStyle(styles.input);
    return true;
  };

  const amountChange = (e: any) => setAmount(e.target.value);

  const onBetClick = () => {
    if (validation()) betEvent(Math.round(amount * 100) / 100);
  };

  const getControls = () => {
    // Bet phase
    if (gameState === 0) {
      return (
        <div className={styles.controlsContainer}>
          <div className={styles.betContainer}>
            <h4>Amount:</h4>
            <input autoFocus type="number" value={amount} onChange={amountChange} className={inputStyle} />
          </div>
          <button onClick={onBetClick} className={styles.button}>Bet</button>
        </div>
      );
    }

    // Insurance phase (gameState === 2)
    if (gameState === 2) {
      return (
        <div className={styles.controlsContainer}>
          <button onClick={takeInsuranceEvent}   className={`${styles.button} ${styles.insuranceButton}`}>Take Insurance</button>
          <button onClick={declineInsuranceEvent} className={`${styles.button} ${styles.declineButton}`}>Decline</button>
        </div>
      );
    }

    // Player turn / dealer turn
    return (
      <div className={styles.controlsContainer}>
        <button onClick={hitEvent}   disabled={buttonState.hitDisabled}   className={styles.button}>Hit</button>
        <button onClick={standEvent} disabled={buttonState.standDisabled} className={styles.button}>Stand</button>

        {canDouble && (
          <button onClick={doubleEvent} className={`${styles.button} ${styles.doubleButton}`}>
            Double ×2
          </button>
        )}

        {canSplit && (
          <button onClick={splitEvent} className={`${styles.button} ${styles.splitButton}`}>
            Split
          </button>
        )}

        <button onClick={resetEvent} disabled={buttonState.resetDisabled} className={styles.button}>Reset</button>
      </div>
    );
  };

  return <>{getControls()}</>;
};

export default Controls;
