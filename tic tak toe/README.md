# ⚡ Nexus Tic-Tac-Toe — Cyber Arena

> **SkillCraft Technology Web Development Internship — Task 03 (Alternative)**  
> A high-performance, responsive Tic-Tac-Toe web application built with **HTML5, CSS3, and Vanilla JavaScript**. Features an unbeatable AI powered by the **Minimax Algorithm**, local 2-Player Pass & Play, dynamic scoreboard tracking, real-time Web Audio API sound synthesis, and particle confetti celebrations.

---

## 📸 Overview & Design Philosophy

Nexus Tic-Tac-Toe was crafted with a **modern gaming dashboard aesthetic**:
- **Dark Navy Cyber Palette**: Rich background tones (`#080c18`) paired with neon cyan (`#00f0ff`) for **Player X** and electric purple (`#bd34fe`) for **Player O / AI**.
- **Dynamic Glassmorphism**: Translucent panels with subtle border glows and backdrop filters.
- **Micro-Animations**: Smooth pop-in animations for cell moves, pulsating winning line glows, and celebratory particle confetti.
- **Native Synthesized Audio**: Built-in sound effects using the browser's native **Web Audio API** (zero external MP3 assets required, 100% offline-ready).
- **Fully Responsive**: Adapts seamlessly from 4K desktop screens down to 320px mobile viewports.

---

## ✨ Features

### 1. 🤖 Player vs Computer (AI Mode)
- **Unbeatable Minimax Algorithm**: Evaluates every possible game state recursively to calculate optimal strategic moves.
- **Difficulty Settings**:
  - **⚡ Master (Minimax)**: Mathematically impossible to beat (results in either an AI win or a hard-fought draw).
  - **⚖️ Skilled (Balanced)**: Blends Minimax tactical defensive play with occasional opportunities for the player.
  - **🎯 Casual (Rookie)**: Relaxed AI designed for casual play.
- **Realistic Thinking Delay**: Features a subtle calculation delay (~480ms) and indicator so the AI feels natural rather than instant.

### 2. 👥 2 Players (Local Pass & Play)
- Allows two players to battle on the same device.
- Alternates turns between **Player X** and **Player O** with clear active-turn highlights.

### 3. 🎯 Complete Game Logic
- **8 Winning Configurations**: Checks all 3 rows, 3 columns, and 2 diagonals.
- **Draw / Stalemate Detection**: Accurately triggers when all 9 squares are filled with no winning trio.
- **Input Locking**: Prevents clicking already occupied cells, making moves after a match ends, or clicking while the AI is calculating.
- **Winning Line Highlight**: Winning cells glow brightly with an animated neon aura.

### 4. 📊 Real-Time Scoreboard
- Tracks:
  - **Player X Wins**
  - **Player O / AI Wins**
  - **Draws (Ties)**
  - **Total Completed Matches**
  - **Current Round Number**
- Quick Actions:
  - **Next Round**: Advances to the next round while preserving match tallies.
  - **Restart Round**: Clears the current board without affecting scores.
  - **Reset Scores**: Resets all tallies and rounds back to zero.

### 5. 🔊 Native Sound & Celebrations
- Real-time synthesized chimes for moves, victory fanfare, and draws.
- Sound mute/unmute toggle.
- HTML5 Canvas particle confetti on round victories.

---

## 📁 Project Directory Structure

```text
tic-tac-toe/
│
├── index.html       # Semantic HTML5 markup, scoreboard, grid, and modal
├── style.css        # Cyber theme, design tokens, responsive grid, animations
├── script.js        # Minimax algorithm, state engine, Web Audio synth, events
└── README.md        # Complete documentation and viva guide
```

---

## 🚀 How to Run the Project

This application requires **no external dependencies, Node.js packages, or build tools**. You can run it immediately in any web browser.

### Option 1: Direct File Launch (Easiest)
1. Navigate to the project folder.
2. Double-click **`index.html`** or right-click and choose **Open with > Google Chrome** (or Edge / Firefox / Safari).

### Option 2: VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension by Ritwick Dey (if not already installed).
3. Right-click `index.html` and select **"Open with Live Server"**.
4. The game will launch automatically at `http://127.0.0.1:5500/`.

### Option 3: Python Built-In HTTP Server (Terminal)
Open your terminal inside the project directory and run:
```bash
# For Python 3
python -m http.server 3000
```
Then visit `http://localhost:3000` in your browser.

---

## 🎓 Viva & Technical Interview Guide

Here are common questions asked during academic viva and internship evaluations regarding this project:

### 1. How does the Minimax Algorithm work in this game?
> **Answer**:  
> Minimax is a recursive backtracking algorithm used in two-player, zero-sum decision games.  
> - It simulates every possible move until reaching a **terminal state** (Win, Loss, or Draw).  
> - In our implementation:
>   - AI (`O`) is the **maximizing player**, aiming for the highest score (`+10 - depth`).
>   - The Human (`X`) is the **minimizing player**, aiming for the lowest score (`-10 + depth`).
>   - Subtracting `depth` ensures the AI prioritizes winning in fewer moves and prolongs defense when facing a loss.  
> - Because Tic-Tac-Toe has a relatively small search space ($9! = 362,880$ worst-case terminal states, and in practice under 26,000 game states), pure Minimax computes instantaneously without needing tree pruning.

### 2. How did you organize the game state?
> **Answer**:  
> We maintained a centralized reactive state object `gameState` in `script.js`:
> - `board`: A 1D array of 9 elements (`['', '', ...]`) mapping directly to cells 0 through 8.
> - `currentPlayer`: Stores `'X'` or `'O'`.
> - `isGameActive`: Boolean flag disabling board interaction when a game ends.
> - `isAiThinking`: Boolean preventing human input during the AI's 480ms simulated delay.
> - `scores`: Object maintaining X wins, O wins, draws, and total matches.

### 3. How are winning combinations detected?
> **Answer**:  
> We define a 2D constant array `WINNING_COMBINATIONS` containing the 8 winning index trios:
> ```javascript
> const WINNING_COMBINATIONS = [
>   [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
>   [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
>   [0, 4, 8], [2, 4, 6]             // Diagonals
> ];
> ```
> After each valid move, the algorithm iterates over these 8 configurations. If all three positions on the board match the current player's symbol, a win is declared and the matching indices are highlighted.

### 4. Why use the Web Audio API instead of `<audio>` tags and `.mp3` files?
> **Answer**:  
> - **Zero Latency**: Native synthesized oscillators trigger instantly without network buffer delays.
> - **Self-Contained**: The project works completely offline without requiring audio asset downloads or risking broken file paths on different operating systems.
> - **Customization**: Frequencies, attack, decay, and pitch-bends can be manipulated programmatically in code.

---

## ♿ Accessibility & Best Practices

- **Semantic HTML5**: Uses `<header>`, `<main>`, `<section>`, `<footer>`, `<canvas>`, and descriptive heading hierarchies.
- **ARIA Attributes**: `role="grid"`, `role="gridcell"`, `aria-label`, and `aria-live="polite"` for turn status updates.
- **Keyboard Navigation**: Each cell is keyboard-focusable via `tabindex="0"` and can be triggered with `Enter` or `Space`.
- **Responsive Layout**: Fluid clamp typography and CSS Grid layout accommodate all screen dimensions.

---

## 📜 Internship Declaration

* **Internship Program**: SkillCraft Technology Web Development Internship
* **Task**: Task 03 (Alternative) — Tic-Tac-Toe Web Application
* **Developer**: SkillCraft Web Dev Intern
* **Submission Date**: October 2026
