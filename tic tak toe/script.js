/**
 * ============================================================================
 * Nexus Tic-Tac-Toe — Game Logic & AI Engine
 * Developed for SkillCraft Technology Web Development Internship (Task 03)
 * 
 * Key Highlights:
 * 1. Minimax Algorithm: Recursive backtracking algorithm for an unbeatable AI.
 * 2. Two Modes: Player vs AI (PvC) & 2 Players Local (PvP).
 * 3. Sound Effects: Native Web Audio API synthesizer (no external audio files needed).
 * 4. Visual Flourish: Native HTML5 Canvas confetti particle animation on victory.
 * 5. Full Accessibility: Screen reader labels, keyboard navigation (Enter/Space).
 * ============================================================================
 */

'use strict';

// ============================================================================
// 1. GAME STATE & CONSTANTS
// ============================================================================

/** The 8 possible winning combinations on a 3x3 grid (3 rows, 3 cols, 2 diagonals) */
const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6]  // Diagonal top-right to bottom-left
];

const PLAYER_X = 'X';
const PLAYER_O = 'O';

/** State container holding the entire reactive game status */
const gameState = {
  board: Array(9).fill(''),     // Array representing board cells 0-8
  currentPlayer: PLAYER_X,      // Turn starts with 'X'
  isGameActive: true,           // Flag preventing moves once round ends
  isAiThinking: false,          // Prevents human clicks during AI turn delay
  gameMode: 'pvc',              // 'pvc' (Player vs AI) or 'pvp' (2 Players)
  aiDifficulty: 'unbeatable',   // 'unbeatable' (Minimax), 'medium', or 'easy'
  soundEnabled: true,           // Toggle for synthesized audio
  scores: {
    x: 0,
    o: 0,
    draws: 0,
    totalMatches: 0
  },
  currentRound: 1
};

// ============================================================================
// 2. DOM ELEMENT REFERENCES
// ============================================================================

const cells = document.querySelectorAll('.cell');
const gameBoard = document.getElementById('game-board');
const turnBanner = document.getElementById('turn-banner');
const statusText = document.getElementById('status-text');

// Scoreboard elements
const scoreXElem = document.getElementById('score-x');
const scoreOElem = document.getElementById('score-o');
const scoreDrawElem = document.getElementById('score-draw');
const totalMatchesElem = document.getElementById('total-matches');
const roundNumberElem = document.getElementById('round-number');

// Player cards
const cardX = document.getElementById('card-x');
const cardO = document.getElementById('card-o');
const roleX = document.getElementById('role-x');
const roleO = document.getElementById('role-o');
const nameO = document.getElementById('name-o');

// Mode & Difficulty controls
const modePvcBtn = document.getElementById('mode-pvc');
const modePvpBtn = document.getElementById('mode-pvp');
const difficultyWrapper = document.getElementById('difficulty-wrapper');
const aiDifficultySelect = document.getElementById('ai-difficulty');

// Action buttons
const newRoundBtn = document.getElementById('new-round-btn');
const resetBoardBtn = document.getElementById('reset-board-btn');
const resetScoreBtn = document.getElementById('reset-score-btn');
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const soundIcon = document.getElementById('sound-icon');
const soundLabel = document.getElementById('sound-label');

// Result Modal dialog
const resultModal = document.getElementById('result-modal');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalNextBtn = document.getElementById('modal-next-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');

// Confetti canvas
const confettiCanvas = document.getElementById('confetti-canvas');

// ============================================================================
// 3. SYNTHESIZED SOUND EFFECTS (Web Audio API)
// ============================================================================

/**
 * Creates browser-native audio sound effects using the Web Audio API synthesizer.
 * This guarantees audio works completely offline without missing file dependencies.
 */
class SoundEngine {
  constructor() {
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /** Play tone at specified frequency, type and duration */
  playTone(freq, type = 'sine', duration = 0.12, volume = 0.15, pitchBend = null) {
    if (!gameState.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (pitchBend) {
        osc.frequency.exponentialRampToValueAtTime(pitchBend, now + duration);
      }

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /** Sound when X places a mark (crisp neon chime) */
  playMoveX() {
    this.playTone(587.33, 'triangle', 0.12, 0.2, 880); // D5 -> A5
  }

  /** Sound when O places a mark (smooth warm tone) */
  playMoveO() {
    this.playTone(440.00, 'sine', 0.14, 0.2, 330); // A4 -> E4
  }

  /** Sound on victory fanfare (triumphant 3-note arpeggio) */
  playWin() {
    if (!gameState.soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.22, 0.25);
      }, index * 110);
    });
  }

  /** Sound on a tied match */
  playDraw() {
    if (!gameState.soundEnabled) return;
    this.playTone(392.00, 'sine', 0.2, 0.18, 330);
    setTimeout(() => {
      this.playTone(330.00, 'sine', 0.35, 0.18, 220);
    }, 150);
  }

  /** General UI click sound */
  playClick() {
    this.playTone(800, 'sine', 0.05, 0.08, 400);
  }
}

const sounds = new SoundEngine();

// ============================================================================
// 4. CELEBRATION CONFETTI (HTML5 Canvas Particle System)
// ============================================================================

class ConfettiEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  trigger(durationMs = 2400) {
    this.particles = [];
    const colors = ['#00f0ff', '#bd34fe', '#ffb800', '#ffffff', '#00ff88'];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        alpha: 1,
        decay: Math.random() * 0.012 + 0.008
      });
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    const startTime = performance.now();
    const animate = (currentTime) => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98; // air drag
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate((p.rotation * Math.PI) / 180);
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = Math.max(0, p.alpha);
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          this.ctx.restore();
        }
      });

      this.particles = this.particles.filter(p => p.alpha > 0);

      if (this.particles.length > 0 && currentTime - startTime < durationMs) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }
}

const confetti = new ConfettiEngine(confettiCanvas);

// ============================================================================
// 5. UNBEATABLE MINIMAX AI ALGORITHM
// ============================================================================

/**
 * Checks if a specific player has achieved a winning configuration on a given board.
 * @param {Array<string>} board - 9-element array representing board.
 * @param {string} player - PLAYER_X ('X') or PLAYER_O ('O').
 * @returns {Array<number>|null} The winning indices or null.
 */
function checkWinningBoard(board, player) {
  for (let combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] === player && board[b] === player && board[c] === player) {
      return combo;
    }
  }
  return null;
}

/**
 * Returns an array of empty cell indices available on the given board.
 * @param {Array<string>} board
 * @returns {Array<number>}
 */
function getEmptyIndices(board) {
  const empty = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') empty.push(i);
  }
  return empty;
}

/**
 * Minimax Recursive Evaluation Function.
 * Evaluates all future board possibilities using backtracking.
 *
 * Scoring logic:
 * - AI (Player O) Win: +10 - depth  (rewards faster wins)
 * - Human (Player X) Win: -10 + depth (penalizes quick losses)
 * - Tie: 0
 *
 * @param {Array<string>} currentBoard - Current state of the board.
 * @param {number} depth - Recursion depth for scoring shortest path to win.
 * @param {boolean} isMaximizing - True if evaluating AI (O)'s optimal move; false for human (X).
 * @returns {number} Evaluated score.
 */
function minimax(currentBoard, depth, isMaximizing) {
  // Check terminal state: did AI win?
  if (checkWinningBoard(currentBoard, PLAYER_O)) {
    return 10 - depth;
  }
  // Check terminal state: did Human win?
  if (checkWinningBoard(currentBoard, PLAYER_X)) {
    return -10 + depth;
  }

  const emptyCells = getEmptyIndices(currentBoard);
  // Check terminal state: is it a draw?
  if (emptyCells.length === 0) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let index of emptyCells) {
      currentBoard[index] = PLAYER_O;
      const score = minimax(currentBoard, depth + 1, false);
      currentBoard[index] = ''; // Backtrack
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let index of emptyCells) {
      currentBoard[index] = PLAYER_X;
      const score = minimax(currentBoard, depth + 1, true);
      currentBoard[index] = ''; // Backtrack
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
}

/**
 * Determines the AI's next move based on current difficulty mode.
 * - 'unbeatable': 100% Minimax (mathematically impossible to beat).
 * - 'medium': 60% Minimax, with defensive fallback.
 * - 'easy': Random with slight check.
 * @returns {number} The cell index chosen by the AI.
 */
function getBestAiMove() {
  const emptyCells = getEmptyIndices(gameState.board);
  if (emptyCells.length === 0) return -1;

  // Easy mode: pick random move
  if (gameState.aiDifficulty === 'easy') {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // Medium mode: occasionally makes sub-optimal choices (40% chance random)
  if (gameState.aiDifficulty === 'medium' && Math.random() < 0.4) {
    // Quick win or block check before random
    for (let index of emptyCells) {
      // Can AI win right now?
      gameState.board[index] = PLAYER_O;
      if (checkWinningBoard(gameState.board, PLAYER_O)) {
        gameState.board[index] = '';
        return index;
      }
      gameState.board[index] = '';
    }
    for (let index of emptyCells) {
      // Must AI block human right now?
      gameState.board[index] = PLAYER_X;
      if (checkWinningBoard(gameState.board, PLAYER_X)) {
        gameState.board[index] = '';
        return index;
      }
      gameState.board[index] = '';
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // Master / Unbeatable Mode: Full Minimax evaluation
  let bestScore = -Infinity;
  let bestMove = emptyCells[0];

  for (let index of emptyCells) {
    gameState.board[index] = PLAYER_O;
    const score = minimax(gameState.board, 0, false);
    gameState.board[index] = ''; // Backtrack

    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
}

// ============================================================================
// 6. GAMEPLAY ENGINE & INTERACTION
// ============================================================================

/**
 * Handles cell click / activation from either human player or AI invocation.
 * @param {number} cellIndex - The 0-8 index of the cell clicked.
 */
function handleCellSelection(cellIndex) {
  // Guard checks: ignore if cell occupied, round finished, or AI currently thinking
  if (
    !gameState.isGameActive ||
    gameState.isAiThinking ||
    gameState.board[cellIndex] !== ''
  ) {
    return;
  }

  // Apply move to state
  makeMove(cellIndex, gameState.currentPlayer);

  // Evaluate board for win or draw
  const winningCombo = checkWinningBoard(gameState.board, gameState.currentPlayer);

  if (winningCombo) {
    handleRoundWon(gameState.currentPlayer, winningCombo);
    return;
  }

  if (checkDraw()) {
    handleRoundDraw();
    return;
  }

  // Switch active player turn
  switchTurn();

  // If in Player vs AI mode and it's now AI's turn (O), trigger AI move
  if (gameState.gameMode === 'pvc' && gameState.currentPlayer === PLAYER_O && gameState.isGameActive) {
    triggerAiTurn();
  }
}

/**
 * Applies a player's mark to the board and updates UI elements.
 * @param {number} index - Index of cell (0-8).
 * @param {string} player - PLAYER_X or PLAYER_O.
 */
function makeMove(index, player) {
  gameState.board[index] = player;

  const targetCell = cells[index];
  targetCell.textContent = player;
  targetCell.classList.add(player.toLowerCase(), 'taken');
  targetCell.setAttribute('aria-label', `Cell ${index + 1}: ${player}`);

  // Play synthesized audio effect
  if (player === PLAYER_X) {
    sounds.playMoveX();
  } else {
    sounds.playMoveO();
  }
}

/**
 * Switches the active turn between X and O and updates indicators.
 */
function switchTurn() {
  gameState.currentPlayer = gameState.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
  updateTurnDisplay();
}

/**
 * Updates visual turn indicators, player card highlights, and status banner.
 */
function updateTurnDisplay() {
  const isX = gameState.currentPlayer === PLAYER_X;

  // Toggle card active states
  cardX.classList.toggle('active-turn', isX);
  cardO.classList.toggle('active-turn', !isX);

  // Update banner classes & styling
  turnBanner.classList.toggle('x-turn', isX);
  turnBanner.classList.toggle('o-turn', !isX);

  // Status text message
  if (gameState.gameMode === 'pvc') {
    statusText.textContent = isX ? "Player X's Turn" : "AI is calculating move...";
  } else {
    statusText.textContent = isX ? "Player X's Turn" : "Player O's Turn";
  }
}

/**
 * Triggers AI move with a realistic "thinking" delay for immersive feedback.
 */
function triggerAiTurn() {
  gameState.isAiThinking = true;
  gameBoard.classList.add('ai-calculating');

  // Short delay (500ms) gives realistic feel and avoids jarring instant moves
  setTimeout(() => {
    if (!gameState.isGameActive) {
      gameState.isAiThinking = false;
      return;
    }

    const aiMoveIndex = getBestAiMove();
    gameState.isAiThinking = false;
    gameBoard.classList.remove('ai-calculating');

    if (aiMoveIndex !== -1) {
      handleCellSelection(aiMoveIndex);
    }
  }, 480);
}

/**
 * Checks whether all 9 cells are occupied without a winner.
 * @returns {boolean}
 */
function checkDraw() {
  return gameState.board.every(cell => cell !== '');
}

/**
 * Handles end-of-round victory event.
 * @param {string} winner - PLAYER_X or PLAYER_O.
 * @param {Array<number>} combo - Winning 3 indices.
 */
function handleRoundWon(winner, combo) {
  gameState.isGameActive = false;
  gameState.scores.totalMatches++;

  // Highlight winning cells
  combo.forEach(idx => {
    cells[idx].classList.add('winning-cell');
  });
  gameBoard.classList.add('game-over');

  // Update score tallies
  if (winner === PLAYER_X) {
    gameState.scores.x++;
  } else {
    gameState.scores.o++;
  }
  updateScoreboard();

  // Celebration effects
  sounds.playWin();
  confetti.trigger(2800);

  // Status and Modal announcement
  let winnerTitle = '';
  let winnerDescription = '';

  if (winner === PLAYER_X) {
    winnerTitle = gameState.gameMode === 'pvc' ? 'Victory! You Won!' : 'Player X Wins!';
    winnerDescription = 'Flawless line combination! Dominant tactical play.';
  } else {
    winnerTitle = gameState.gameMode === 'pvc' ? 'AI Bot Wins!' : 'Player O Wins!';
    winnerDescription = gameState.gameMode === 'pvc'
      ? 'The Minimax Algorithm calculated the optimal victory path.'
      : 'Superior strategy executed! Line secured.';
  }

  statusText.textContent = winnerTitle;
  showModal('🏆', winnerTitle, winnerDescription, winner === PLAYER_X ? 'x-win' : 'o-win');
}

/**
 * Handles end-of-round draw event.
 */
function handleRoundDraw() {
  gameState.isGameActive = false;
  gameState.scores.draws++;
  gameState.scores.totalMatches++;

  gameBoard.classList.add('game-over');
  updateScoreboard();

  sounds.playDraw();

  const drawTitle = "It's a Stalemate!";
  const drawDescription = 'Both players defended completely. No winning line conceded.';
  statusText.textContent = drawTitle;

  showModal('🤝', drawTitle, drawDescription, 'draw-game');
}

/**
 * Updates the numbers displayed in the scoreboard.
 */
function updateScoreboard() {
  scoreXElem.textContent = gameState.scores.x;
  scoreOElem.textContent = gameState.scores.o;
  scoreDrawElem.textContent = gameState.scores.draws;
  totalMatchesElem.textContent = gameState.scores.totalMatches;
  roundNumberElem.textContent = gameState.currentRound;
}

/**
 * Displays the victory / draw modal dialog.
 */
function showModal(icon, title, desc, titleClass) {
  modalIcon.textContent = icon;
  modalTitle.textContent = title;
  modalTitle.className = `modal-title ${titleClass}`;
  modalDesc.textContent = desc;

  // Short delay so user sees winning line highlight on board first
  setTimeout(() => {
    resultModal.classList.add('open');
    resultModal.setAttribute('aria-hidden', 'false');
  }, 450);
}

/**
 * Closes modal dialog.
 */
function closeModal() {
  resultModal.classList.remove('open');
  resultModal.setAttribute('aria-hidden', 'true');
}

// ============================================================================
// 7. ROUND & MATCH RESET HANDLERS
// ============================================================================

/**
 * Prepares the board for the next round (preserves score, advances round counter).
 */
function startNextRound() {
  closeModal();
  sounds.playClick();

  gameState.currentRound++;
  resetBoardState();
  updateScoreboard();
}

/**
 * Restarts current round (clears board, retains current round number & scores).
 */
function restartCurrentRound() {
  closeModal();
  sounds.playClick();
  resetBoardState();
}

/**
 * Clears board cells, variables, and reinitializes X's turn.
 */
function resetBoardState() {
  gameState.board = Array(9).fill('');
  gameState.currentPlayer = PLAYER_X;
  gameState.isGameActive = true;
  gameState.isAiThinking = false;

  gameBoard.classList.remove('game-over', 'ai-calculating');

  cells.forEach((cell, idx) => {
    cell.textContent = '';
    cell.className = 'cell';
    cell.setAttribute('aria-label', `Cell ${idx + 1}: empty`);
  });

  updateTurnDisplay();
}

/**
 * Resets all scores, draw counts, match counts, and rounds to initial 0 state.
 */
function resetAllScores() {
  sounds.playClick();
  gameState.scores.x = 0;
  gameState.scores.o = 0;
  gameState.scores.draws = 0;
  gameState.scores.totalMatches = 0;
  gameState.currentRound = 1;

  resetBoardState();
  updateScoreboard();
}

/**
 * Switches game mode between Player vs AI (PvC) and 2 Players (PvP).
 * @param {string} mode - 'pvc' or 'pvp'
 */
function setGameMode(mode) {
  if (gameState.gameMode === mode) return;
  sounds.playClick();

  gameState.gameMode = mode;

  if (mode === 'pvc') {
    modePvcBtn.classList.add('active');
    modePvcBtn.setAttribute('aria-checked', 'true');
    modePvpBtn.classList.remove('active');
    modePvpBtn.setAttribute('aria-checked', 'false');

    nameO.textContent = 'AI Bot';
    roleO.textContent = 'Minimax AI';
    difficultyWrapper.classList.remove('hidden');
  } else {
    modePvpBtn.classList.add('active');
    modePvpBtn.setAttribute('aria-checked', 'true');
    modePvcBtn.classList.remove('active');
    modePvcBtn.setAttribute('aria-checked', 'false');

    nameO.textContent = 'Player O';
    roleO.textContent = 'Human';
    difficultyWrapper.classList.add('hidden');
  }

  // Restart round when switching modes
  resetBoardState();
}

/**
 * Toggles synthesized audio sound effects.
 */
function toggleSound() {
  gameState.soundEnabled = !gameState.soundEnabled;
  if (gameState.soundEnabled) {
    soundIcon.textContent = '🔊';
    soundLabel.textContent = 'Sound ON';
    sounds.playClick();
  } else {
    soundIcon.textContent = '🔇';
    soundLabel.textContent = 'Sound OFF';
  }
}

// ============================================================================
// 8. EVENT LISTENERS INITIALIZATION
// ============================================================================

function initializeEventListeners() {
  // Cell clicks & keyboard activation
  cells.forEach(cell => {
    cell.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      handleCellSelection(idx);
    });

    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        handleCellSelection(idx);
      }
    });
  });

  // Mode Selection
  modePvcBtn.addEventListener('click', () => setGameMode('pvc'));
  modePvpBtn.addEventListener('click', () => setGameMode('pvp'));

  // AI Difficulty Selection
  aiDifficultySelect.addEventListener('change', (e) => {
    gameState.aiDifficulty = e.target.value;
    sounds.playClick();
  });

  // Action Buttons
  newRoundBtn.addEventListener('click', startNextRound);
  resetBoardBtn.addEventListener('click', restartCurrentRound);
  resetScoreBtn.addEventListener('click', resetAllScores);
  soundToggleBtn.addEventListener('click', toggleSound);

  // Modal Buttons
  modalNextBtn.addEventListener('click', startNextRound);
  modalCloseBtn.addEventListener('click', closeModal);

  // Close modal when clicking backdrop
  resultModal.addEventListener('click', (e) => {
    if (e.target === resultModal) {
      closeModal();
    }
  });

  // Keyboard shortcut: Escape to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resultModal.classList.contains('open')) {
      closeModal();
    }
  });
}

// ============================================================================
// 9. APP ENTRY POINT
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  updateTurnDisplay();
  updateScoreboard();
});
