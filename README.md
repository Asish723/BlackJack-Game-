# ♠ Blackjack VIP Casino React App ♥

A modern, fully-featured **Blackjack Casino Web Application** built with **React**, **TypeScript**, and **CSS Modules**. Features authentic live casino rules, realistic felt table presentation, fluid animations, and interactive betting controls.

---

## 🌟 Key Features

* **🎲 Complete Casino Rules Engine**
  * **Natural Blackjack (3:2 / 1.5× Payout)**: Dealt 21 on opening cards pays 1.5× your bet.
  * **Dealer Ace Insurance (2:1)**: Offered whenever dealer shows an Ace, with hidden-card peek.
  * **Double Down (×2)**: Double your stake, draw exactly one card, and auto-stand.
  * **Split Hands**: Split matched cards into two independent hands with active turn glow (`◄ TURN`).
  * **Dynamic Soft/Hard Ace Scoring**: Aces automatically calculate as 11 or 1 to prevent busting.

* **🎴 Authentic Casino Presentation**
  * **Official 2.5 : 3.5 Card Ratio**: True playing card proportions with corner indices and centered pips.
  * **Bee-Style Diamond Lattice Card Back**: Classic red casino lattice back for face-down cards.
  * **Staggered Card Deal Animations**: Cards slide and bounce in 1-by-1 rather than appearing abruptly.
  * **Realistic Baize Felt Table**: Deep emerald woven cloth texture, casino spotlighting, and dark mahogany leather armrest rail.
  * **Felt Markings**: Authentic gold printed rules and flexible `VIP DECK` card suit medallion (`♠ ♥ ♦ ♣`).

* **🏆 Interactive Win Overlays & Confetti**
  * Animated physics-based 60-piece confetti shower on wins.
  * Detailed split hand result breakdown (Hand 1 / Hand 2 outcomes + Net ledger).
  * Direct "Next Round →" transition into the next bet.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v16, v18, v20, or v22+)
* **npm**

### Installation

1. Navigate to the project folder:
   ```bash
   cd BlackJack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

* **React 16.9** (Hooks, functional updates, refs)
* **TypeScript 3.5** (Strict typings and interfaces)
* **CSS Modules** (Scoped component styling, keyframe animations, responsive clamp scaling)

---

## 📄 License
MIT License.
