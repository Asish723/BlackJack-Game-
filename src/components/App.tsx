import React, { useState, useEffect, useRef } from 'react';
import Status from './Status';
import Controls from './Controls';
import Hand from './Hand';
import TableMarkings from './TableMarkings';
import ResultOverlay, { ResultType, SplitResult } from './ResultOverlay';
import jsonData from '../deck.json';

const App: React.FC = () => {
  enum GameState { bet, init, insurance, userTurn, dealerTurn }
  enum Deal     { user, dealer, hidden }

  enum Message {
    bet          = 'Place a Bet!',
    hitStand     = 'Hit or Stand?',
    bust         = 'Bust!',
    userWin      = 'You Win!',
    dealerWin    = 'Dealer Wins!',
    tie          = 'Tie!',
    insurance    = 'Dealer has an Ace! Take Insurance?',
    insuranceWin = 'Insurance Paid! Dealer had Blackjack.',
    insuranceLose= 'No Blackjack. Insurance Lost.',
    blackjack    = 'Blackjack! Dealer Wins!',
    blackjackWin = 'Blackjack! You Win!',
    playHand1    = 'Hand 1 — Hit or Stand?',
    playHand2    = 'Hand 2 — Hit or Stand?',
    hand1Bust    = 'Hand 1 Busted! — Playing Hand 2'
  }

  const data = JSON.parse(JSON.stringify(jsonData.cards));
  const [deck, setDeck]: any[] = useState(data);

  // ── Main hand ──────────────────────────────────────────────────────────────
  const [userCards,   setUserCards]:   any[] = useState([]);
  const [userScore,   setUserScore]          = useState(0);
  const [userCount,   setUserCount]          = useState(0);

  const [dealerCards, setDealerCards]: any[] = useState([]);
  const [dealerScore, setDealerScore]        = useState(0);
  const [dealerCount, setDealerCount]        = useState(0);

  const [balance, setBalance] = useState(100);
  const [bet,     setBet]     = useState(0);
  const [insuranceBet, setInsuranceBet] = useState(0);

  // ── Split state ────────────────────────────────────────────────────────────
  const [isSplit,          setIsSplit]          = useState(false);
  const [splitH2Cards,     setSplitH2Cards]:any[]= useState([]);
  const [splitH2Score,     setSplitH2Score]     = useState(0);
  const [splitH2Count,     setSplitH2Count]     = useState(0);
  const [activeSplitHand,  setActiveSplitHand]  = useState<0|1>(0);
  const [splitResultsData, setSplitResultsData] = useState<SplitResult[]>([]);

  // Refs — read synchronously inside effects (avoid stale-closure issues)
  const betRef                = useRef(0);
  const isDoublingRef         = useRef(false);
  const isSplitRef            = useRef(false);
  const activeSplitHandRef    = useRef<0|1>(0);
  const hand1BustedRef        = useRef(false);
  const splitH2BustedRef      = useRef(false);
  const hand1FinalScoreRef    = useRef(0);
  const aceSplitRef           = useRef(false);

  // ── Game / UI state ────────────────────────────────────────────────────────
  const [gameState,    setGameState]   = useState(GameState.bet);
  const [message,      setMessage]     = useState<string>(Message.bet);
  const [buttonState,  setButtonState] = useState({ hitDisabled: false, standDisabled: false, resetDisabled: true });

  // ── Result overlay ─────────────────────────────────────────────────────────
  const [showResult,     setShowResult]     = useState(false);
  const [resultType,     setResultType]     = useState<ResultType>(null);
  const [resultHeadline, setResultHeadline] = useState('');
  const [resultAmount,   setResultAmount]   = useState(0);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (gameState === GameState.init) {
      drawCard(Deal.user);
      drawCard(Deal.hidden);
      drawCard(Deal.user);
      drawCard(Deal.dealer);
      setGameState(GameState.userTurn);
      setMessage(Message.hitStand);
    }
  }, [gameState]); // eslint-disable-line

  // Offer insurance when dealer's face-up card is Ace
  useEffect(() => {
    if (gameState === GameState.userTurn && dealerCards.length === 2) {
      const up = dealerCards.find((c: any) => !c.hidden);
      if (up && up.value === 'A') {
        setGameState(GameState.insurance);
        setMessage(Message.insurance);
        setButtonState(p => ({ ...p, hitDisabled: true, standDisabled: true }));
      }
    }
  }, [dealerCards]); // eslint-disable-line

  useEffect(() => {
    setUserScore(calcScore(userCards));
    setUserCount(c => c + 1);
  }, [userCards]); // eslint-disable-line

  useEffect(() => {
    setDealerScore(calcScore(dealerCards));
    setDealerCount(c => c + 1);
  }, [dealerCards]); // eslint-disable-line

  // Split hand 2 score
  useEffect(() => {
    if (splitH2Cards.length > 0) {
      setSplitH2Score(calcScore(splitH2Cards));
      setSplitH2Count(c => c + 1);
    }
  }, [splitH2Cards]); // eslint-disable-line

  // User / hand-1 card changes
  useEffect(() => {
    if (gameState !== GameState.userTurn) return;
    if (isSplitRef.current && activeSplitHandRef.current === 1) return; // playing hand 2 — ignore

    if (isDoublingRef.current) {
      isDoublingRef.current = false;
      executeDealerTurn();
      return;
    }
    if (userScore === 21) {
      if (userCards.length === 2 && !isSplitRef.current) {
        naturalBlackjack();
      } else {
        setButtonState(p => ({ ...p, hitDisabled: true }));
      }
    } else if (userScore > 21) {
      bust();
    }
  }, [userCount]); // eslint-disable-line

  // Split hand-2 card changes
  useEffect(() => {
    if (!isSplitRef.current || activeSplitHandRef.current !== 1) return;
    if (splitH2Cards.length === 0) return;
    if (splitH2Score > 21) {
      bustHand2();
    } else if (splitH2Score === 21) {
      setButtonState(p => ({ ...p, hitDisabled: true }));
    }
  }, [splitH2Count]); // eslint-disable-line

  // Dealer draws
  useEffect(() => {
    if (gameState === GameState.dealerTurn) {
      if (dealerScore >= 17) checkWin();
      else drawCard(Deal.dealer);
    }
  }, [dealerCount]); // eslint-disable-line

  // ── Helpers ────────────────────────────────────────────────────────────────

  const calcScore = (cards: any[]): number => {
    let total = 0;
    cards.forEach((c: any) => {
      if (c.hidden || c.value === 'A') return;
      switch (c.value) {
        case 'K': case 'Q': case 'J': total += 10; break;
        default: total += Number(c.value);
      }
    });
    const aces = cards.filter((c: any) => c.value === 'A' && !c.hidden);
    aces.forEach(() => {
      if      ((total + 11) > 21)                     total += 1;
      else if ((total + 11) === 21 && aces.length > 1) total += 1;
      else                                             total += 11;
    });
    return total;
  };

  const triggerResult = (type: ResultType, headline: string, amount: number) => {
    setTimeout(() => {
      setResultType(type); setResultHeadline(headline);
      setResultAmount(amount); setShowResult(true);
    }, 650);
  };

  const triggerSplitResult = (type: ResultType, results: SplitResult[], net: number) => {
    setTimeout(() => {
      setSplitResultsData(results);
      setResultType(type);
      setResultHeadline(type === 'win' ? 'You Win! 🎉' : type === 'lose' ? 'Dealer Wins' : 'Break Even 🤝');
      setResultAmount(net);
      setShowResult(true);
    }, 650);
  };

  /** Pull one card from the deck, return display object without dealing to any hand */
  const pullCard = (): { value: string; suit: string } | null => {
    if (deck.length === 0) return null;
    const idx  = Math.floor(Math.random() * deck.length);
    const card = deck[idx];
    deck.splice(idx, 1);
    setDeck([...deck]);
    const suits: { [k: string]: string } = { spades:'♠', diamonds:'♦', clubs:'♣', hearts:'♥' };
    return { value: card.value, suit: suits[card.suit] ? suits[card.suit] : card.suit };
  };

  // ── Natural Blackjack ──────────────────────────────────────────────────────
  const naturalBlackjack = () => {
    const currentBet = betRef.current;
    dealerCards.forEach((c: any) => { c.hidden = false; });
    setDealerCards([...dealerCards]);
    const dealerFull         = calcScore(dealerCards);
    const dealerAlsoBlackjack = dealerFull === 21 && dealerCards.length === 2;
    setButtonState({ hitDisabled: true, standDisabled: true, resetDisabled: false });
    if (dealerAlsoBlackjack) {
      setBalance(p => Math.round((p + currentBet) * 100) / 100);
      setMessage(Message.tie);
      triggerResult('tie', 'Push! Both Blackjack 🤝', 0);
    } else {
      const winnings = Math.round(currentBet * 1.5 * 100) / 100;
      setBalance(p => Math.round((p + currentBet + winnings) * 100) / 100);
      setMessage(Message.blackjackWin);
      triggerResult('win', 'Blackjack! 🃏', winnings);
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetGame = () => {
    console.clear();
    setDeck(data);
    setUserCards([]); setUserScore(0); setUserCount(0);
    setDealerCards([]); setDealerScore(0); setDealerCount(0);
    betRef.current = 0;
    setBet(0); setInsuranceBet(0);
    setIsSplit(false); setSplitH2Cards([]); setSplitH2Score(0);
    setSplitH2Count(0); setActiveSplitHand(0); setSplitResultsData([]);
    isSplitRef.current         = false;
    activeSplitHandRef.current = 0;
    hand1BustedRef.current     = false;
    splitH2BustedRef.current   = false;
    hand1FinalScoreRef.current = 0;
    aceSplitRef.current        = false;
    isDoublingRef.current      = false;
    setShowResult(false); setResultType(null); setResultHeadline(''); setResultAmount(0);
    setGameState(GameState.bet);
    setMessage(Message.bet);
    setButtonState({ hitDisabled: false, standDisabled: false, resetDisabled: true });
  };

  // ── Bet / Deal ─────────────────────────────────────────────────────────────
  const placeBet = (amount: number) => {
    betRef.current = amount;
    setBet(amount);
    setBalance(p => Math.round((p - amount) * 100) / 100);
    setGameState(GameState.init);
  };

  const drawCard = (dealType: Deal) => {
    const card = pullCard();
    if (!card) { alert('All cards have been drawn'); return; }
    dealCard(dealType, card.value, card.suit);
  };

  const dealCard = (dealType: Deal, value: string, suit: string) => {
    switch (dealType) {
      case Deal.user:
        userCards.push({ value, suit, hidden: false });
        setUserCards([...userCards]);
        break;
      case Deal.dealer:
        dealerCards.push({ value, suit, hidden: false });
        setDealerCards([...dealerCards]);
        break;
      case Deal.hidden:
        dealerCards.push({ value, suit, hidden: true });
        setDealerCards([...dealerCards]);
        break;
    }
  };

  const revealCard = () => {
    dealerCards.forEach((c: any) => { c.hidden = false; });
    setDealerCards([...dealerCards]);
  };

  const dealerHasBlackjack = () => {
    const h = dealerCards.find((c: any) => c.hidden);
    return h ? ['10','J','Q','K'].indexOf(h.value) !== -1 : false;
  };

  // ── Double Down ────────────────────────────────────────────────────────────
  const doubleDown = () => {
    isDoublingRef.current = true;
    const initialBet = betRef.current;
    const doubledTotal = Math.round(initialBet * 2 * 100) / 100;
    // Deduct the additional doubled bet amount from balance
    setBalance(p => Math.round((p - initialBet) * 100) / 100);
    // Update total active bet to doubled amount
    betRef.current = doubledTotal;
    setBet(doubledTotal);
    drawCard(Deal.user); // userCount effect fires → sees isDoubling → auto-stand
  };

  const executeDealerTurn = () => {
    setButtonState({ hitDisabled: true, standDisabled: true, resetDisabled: false });
    setGameState(GameState.dealerTurn);
    revealCard();
  };

  // ── Split ──────────────────────────────────────────────────────────────────
  const split = () => {
    const card1   = { ...userCards[0] };
    const card2   = { ...userCards[1] };
    const isAces  = card1.value === 'A';
    const currentBet = betRef.current;

    // Deduct second bet
    setBalance(p => Math.round((p - currentBet) * 100) / 100);

    // Flip all refs synchronously before any state updates
    isSplitRef.current         = true;
    activeSplitHandRef.current = 0;
    hand1BustedRef.current     = false;
    splitH2BustedRef.current   = false;
    aceSplitRef.current        = isAces;

    setIsSplit(true);
    setActiveSplitHand(0);
    setSplitResultsData([]);

    // Deal one fresh card to each hand from the deck
    const extra1 = pullCard();
    const extra2 = pullCard();

    const hand1 = [card1, ...(extra1 ? [{ ...extra1, hidden: false }] : [])];
    const hand2 = [card2, ...(extra2 ? [{ ...extra2, hidden: false }] : [])];

    setUserCards([...hand1]);
    setSplitH2Cards([...hand2]);
    setMessage(Message.playHand1);
    setButtonState({ hitDisabled: false, standDisabled: false, resetDisabled: true });

    // Aces: auto-stand both hands after animation settles
    if (isAces) {
      setTimeout(() => {
        setButtonState({ hitDisabled: true, standDisabled: true, resetDisabled: false });
        setGameState(GameState.dealerTurn);
        dealerCards.forEach((c: any) => { c.hidden = false; });
        setDealerCards([...dealerCards]);
      }, 1200);
    }
  };

  // ── Hit ────────────────────────────────────────────────────────────────────
  const hit = () => {
    if (isSplitRef.current && activeSplitHandRef.current === 1) {
      // Add card to split hand 2
      const card = pullCard();
      if (card) {
        splitH2Cards.push({ ...card, hidden: false });
        setSplitH2Cards([...splitH2Cards]);
      }
    } else {
      drawCard(Deal.user);
    }
  };

  // ── Stand ──────────────────────────────────────────────────────────────────
  const stand = () => {
    if (isSplitRef.current) {
      if (activeSplitHandRef.current === 0) {
        // Hand 1 done — save score, switch to hand 2
        hand1FinalScoreRef.current = userScore;
        activeSplitHandRef.current = 1;
        setActiveSplitHand(1);
        setMessage(Message.playHand2);
        setButtonState({ hitDisabled: false, standDisabled: false, resetDisabled: true });
      } else {
        // Hand 2 done — trigger dealer
        standHand2ForDealer();
      }
      return;
    }
    executeDealerTurn();
  };

  const standHand2ForDealer = () => {
    setButtonState({ hitDisabled: true, standDisabled: true, resetDisabled: false });
    setGameState(GameState.dealerTurn);
    revealCard();
  };

  // ── Bust ───────────────────────────────────────────────────────────────────
  const bust = () => {
    if (isSplitRef.current) {
      if (activeSplitHandRef.current === 0) {
        // Hand 1 busted — switch to hand 2
        hand1BustedRef.current     = true;
        hand1FinalScoreRef.current = 0;
        activeSplitHandRef.current = 1;
        setActiveSplitHand(1);
        setMessage(Message.hand1Bust);
        setButtonState({ hitDisabled: false, standDisabled: false, resetDisabled: true });
      } else {
        bustHand2();
      }
      return;
    }
    // Normal bust
    setButtonState({ hitDisabled: true, standDisabled: true, resetDisabled: false });
    setMessage(Message.bust);
    triggerResult('lose', 'Bust! 💥', -betRef.current);
  };

  const bustHand2 = () => {
    const currentBet = betRef.current;
    splitH2BustedRef.current = true;
    setButtonState({ hitDisabled: true, standDisabled: true, resetDisabled: false });
    if (hand1BustedRef.current) {
      // Both busted — skip dealer, show result immediately
      const results: SplitResult[] = [
        { label: 'Hand 1', type: 'lose', amount: -currentBet },
        { label: 'Hand 2', type: 'lose', amount: -currentBet },
      ];
      setSplitResultsData(results);
      triggerSplitResult('lose', results, -(currentBet * 2));
    } else {
      standHand2ForDealer();
    }
  };

  // ── Insurance ──────────────────────────────────────────────────────────────
  const takeInsurance = () => {
    const currentBet = betRef.current;
    const sideBet = Math.round((currentBet / 2) * 100) / 100;
    setInsuranceBet(sideBet);
    setBalance(p => Math.round((p - sideBet) * 100) / 100);
    resolveInsurance(true, sideBet);
  };

  const declineInsurance = () => { resolveInsurance(false, 0); };

  const resolveInsurance = (took: boolean, sideBet: number) => {
    const currentBet = betRef.current;
    const hasBJ = dealerHasBlackjack();
    if (hasBJ) {
      // Dealer has Blackjack — reveal card and end the round
      revealCard();
      if (took) {
        setBalance(p => Math.round((p + sideBet * 3) * 100) / 100);
        setMessage(Message.insuranceWin);
        triggerResult('win', 'Insurance Paid!', Math.round((sideBet * 2 - currentBet) * 100) / 100);
      } else {
        setMessage(Message.blackjack);
        triggerResult('lose', 'Dealer Blackjack!', -currentBet);
      }
      setButtonState({ hitDisabled: true, standDisabled: true, resetDisabled: false });
    } else {
      // Dealer DOES NOT have Blackjack — keep the dealer's hole card hidden!
      // Do NOT reveal the card so the player doesn't see it early.
      setMessage(took ? Message.insuranceLose : Message.hitStand);
      setButtonState(p => ({ ...p, hitDisabled: false, standDisabled: false }));
      setGameState(GameState.userTurn);
    }
  };

  // ── Check Win ──────────────────────────────────────────────────────────────
  const checkWin = () => {
    if (isSplitRef.current) { checkSplitWin(); return; }
    const currentBet = betRef.current;
    if (userScore > dealerScore || dealerScore > 21) {
      // Total payout returned to balance = player's total bet stake + 1x win profit = currentBet * 2
      setBalance(p => Math.round((p + currentBet * 2) * 100) / 100);
      setMessage(Message.userWin);
      triggerResult('win', 'You Win! 🎉', currentBet);
    } else if (dealerScore > userScore) {
      setMessage(Message.dealerWin);
      triggerResult('lose', 'Dealer Wins', -currentBet);
    } else {
      // Push / Tie: return the total bet stake
      setBalance(p => Math.round((p + currentBet) * 100) / 100);
      setMessage(Message.tie);
      triggerResult('tie', "It's a Tie!", 0);
    }
  };

  const checkSplitWin = () => {
    const currentBet = betRef.current;
    const h1Score   = hand1FinalScoreRef.current;
    const h1Busted  = hand1BustedRef.current;
    const h2Score   = splitH2Score;
    const h2Busted  = splitH2BustedRef.current;

    const results: SplitResult[] = [];
    let   balanceAdd = 0;
    let   netChange  = 0;

    const evalHand = (label: string, score: number, busted: boolean) => {
      if (!busted && (score > dealerScore || dealerScore > 21)) {
        results.push({ label, type: 'win',  amount:  currentBet });
        balanceAdd += currentBet * 2; netChange += currentBet;
      } else if (!busted && score === dealerScore) {
        results.push({ label, type: 'tie',  amount: 0 });
        balanceAdd += currentBet;
      } else {
        results.push({ label, type: 'lose', amount: -currentBet });
        netChange -= currentBet;
      }
    };

    evalHand('Hand 1', h1Score, h1Busted);
    evalHand('Hand 2', h2Score, h2Busted);

    if (balanceAdd > 0) setBalance(p => Math.round((p + balanceAdd) * 100) / 100);

    setSplitResultsData(results);
    const overall: ResultType = netChange > 0 ? 'win' : netChange < 0 ? 'lose' : 'tie';
    triggerSplitResult(overall, results, netChange);
  };

  // ── Derived flags for Controls ─────────────────────────────────────────────
  const canDouble = !isSplit
    && userCards.length === 2
    && balance >= bet
    && gameState === GameState.userTurn
    && !buttonState.hitDisabled;

  const canSplit = !isSplit
    && userCards.length === 2
    && userCards[0]
    && userCards[1]
    && userCards[0].value === userCards[1].value
    && balance >= bet
    && gameState === GameState.userTurn;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Status
        message={message}
        balance={balance}
        bet={bet}
        insuranceBet={insuranceBet}
      />

      <Controls
        balance={balance}
        gameState={gameState}
        buttonState={buttonState}
        betEvent={placeBet}
        hitEvent={hit}
        standEvent={stand}
        resetEvent={resetGame}
        takeInsuranceEvent={takeInsurance}
        declineInsuranceEvent={declineInsurance}
        doubleEvent={doubleDown}
        splitEvent={split}
        canDouble={canDouble}
        canSplit={canSplit}
      />

      {/* Dealer's hand always at top */}
      <Hand
        title={`Dealer's Hand (${dealerScore})`}
        cards={dealerCards}
        isActive={false}
      />

      {/* Realistic Casino Table Felt Markings */}
      <TableMarkings />

      {/* Player hand(s) */}
      {isSplit ? (
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1em' }}>
          <Hand
            title={`Hand 1 (${userScore})`}
            cards={userCards}
            isActive={activeSplitHand === 0}
          />
          <Hand
            title={`Hand 2 (${splitH2Score})`}
            cards={splitH2Cards}
            isActive={activeSplitHand === 1}
          />
        </div>
      ) : (
        <Hand
          title={`Your Hand (${userScore})`}
          cards={userCards}
          isActive={false}
        />
      )}

      <ResultOverlay
        show={showResult}
        resultType={resultType}
        headline={resultHeadline}
        amountChange={resultAmount}
        onNextRound={resetGame}
        splitResults={splitResultsData.length > 0 ? splitResultsData : undefined}
      />
    </>
  );
};

export default App;
