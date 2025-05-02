import { useEffect, useState, useCallback } from "react";
import "./MemoryGame.css";

const MemoryGame = () => {
  // State variables to manage game state
  const [gridSize, setGridSize] = useState(4);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solvedPairs, setSolvedPairs] = useState(new Set()); // Track solved pair IDs
  const [disabled, setDisabled] = useState(false);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [totalPairsNeeded, setTotalPairsNeeded] = useState(0);

  // Numbers for the pairs
  const numberPairs = Array.from({ length: 50 }, (_, i) => i + 1);

  // Initialize the game
  const initializeGame = useCallback((size) => {
    const totalCards = size * size;
    // For odd grids (e.g. 3x3), we'll have one less card
    const actualCards = totalCards % 2 === 0 ? totalCards : totalCards - 1;
    const numPairs = actualCards / 2; // This gives us correct number of pairs (e.g. 4 pairs for 3x3)
    
    console.log(`Initializing ${size}x${size} grid:`);
    console.log(`- Total grid spaces: ${totalCards}`);
    console.log(`- Actual cards: ${actualCards}`);
    console.log(`- Number of pairs needed: ${numPairs}`);
    
    const selectedNumbers = numberPairs.slice(0, numPairs);
    let gameCards = [];
    
    // Create all pairs
    for (let i = 0; i < numPairs; i++) {
      gameCards.push({ id: i * 2, number: selectedNumbers[i], pairId: i });
      gameCards.push({ id: i * 2 + 1, number: selectedNumbers[i], pairId: i });
    }
    
    // Shuffle the cards
    const shuffledCards = [...gameCards].sort(() => Math.random() - 0.5);
    
    setTotalPairsNeeded(numPairs);
    setCards(shuffledCards);
    setFlipped([]);
    setSolvedPairs(new Set());
    setWon(false);
    setMoves(0);
    setTime(0);
    setIsPlaying(false);
    setDisabled(false);
    setConfetti([]);
  }, []);

  // Handle grid size change
  const handleGridSizeChange = (e) => {
    const size = parseInt(e.target.value);
    if (size >= 2 && size <= 10) {
      setGridSize(size);
      initializeGame(size);
    }
  };

  // Initialize game on mount and when grid size changes
  useEffect(() => {
    initializeGame(gridSize);
  }, [gridSize, initializeGame]);

  // Check if card is flipped
  const isCardFlipped = useCallback((cardId) => {
    const card = cards.find(c => c.id === cardId);
    return flipped.includes(cardId) || (card && solvedPairs.has(card.pairId));
  }, [flipped, solvedPairs, cards]);

  // Check if card is solved
  const isCardSolved = useCallback((cardId) => {
    const card = cards.find(c => c.id === cardId);
    return card && solvedPairs.has(card.pairId);
  }, [solvedPairs, cards]);

  // Function to create confetti effect
  const createConfetti = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#2ecc71', '#ff8c42'];
    const newConfetti = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 8 + 4,
      animationDuration: 1 + Math.random() * 2,
      animationDelay: Math.random()
    }));
    setConfetti(newConfetti);
  };

  // Check if the selected cards match
  const checkMatch = useCallback((firstId, secondId) => {
    const firstCard = cards.find(card => card.id === firstId);
    const secondCard = cards.find(card => card.id === secondId);

    if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
      setSolvedPairs(prev => {
        const newSolved = new Set(prev);
        newSolved.add(firstCard.pairId);
        console.log(`Pair ${firstCard.pairId} matched. Total solved: ${newSolved.size}/${totalPairsNeeded}`);
        return newSolved;
      });
      setFlipped([]);
    } else {
      setTimeout(() => {
        setFlipped([]);
      }, 1000);
    }
    setDisabled(false);
  }, [cards, totalPairsNeeded]);

  // Handle card click
  const handleClick = useCallback((cardId) => {
    if (disabled || won || isCardFlipped(cardId)) return;

    if (!isPlaying) {
      setIsPlaying(true);
    }

    setFlipped(prev => {
      if (prev.length === 0) {
        return [cardId];
      }
      if (prev.length === 1) {
        setDisabled(true);
        setMoves(m => m + 1);
        const newFlipped = [prev[0], cardId];
        checkMatch(prev[0], cardId);
        return newFlipped;
      }
      return prev;
    });
  }, [disabled, won, isPlaying, isCardFlipped, checkMatch]);

  // Check win condition
  useEffect(() => {
    if (cards.length === 0 || totalPairsNeeded === 0) return;
    
    console.log(`Win check: Solved pairs ${solvedPairs.size}/${totalPairsNeeded}`);
    
    if (solvedPairs.size === totalPairsNeeded) {
      console.log('Win condition met!');
      setWon(true);
      setIsPlaying(false);
      createConfetti();
    }
  }, [solvedPairs, cards.length, totalPairsNeeded]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isPlaying && !won) {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, won]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-container">
      <h1 className="title">Memory Game</h1>

      <div className="game-stats">
        <div className="stat">
          <span className="stat-label">Moves</span>
          <span className="stat-value">{moves}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Time</span>
          <span className="stat-value">{formatTime(time)}</span>
        </div>
      </div>

      <div className="input-container">
        <label htmlFor="gridSize">Grid Size</label>
        <input
          type="number"
          id="gridSize"
          min="2"
          max="10"
          value={gridSize}
          onChange={handleGridSizeChange}
          className="grid-input"
        />
        {gridSize % 2 !== 0 && (
          <div className="grid-info">
            Note: In {gridSize}x{gridSize} grid, one card is removed to ensure all cards can be paired.
          </div>
        )}
      </div>

      <div
        className="game-board"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleClick(card.id)}
            className={`card ${isCardFlipped(card.id) ? (isCardSolved(card.id) ? "solved" : "flipped") : ""}`}
          >
            {isCardFlipped(card.id) ? (
              <span className="card-number">{card.number}</span>
            ) : (
              <span className="card-back">?</span>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => initializeGame(gridSize)} className="reset-button">
        {won ? "Play Again" : "Reset Game"}
      </button>

      {won && (
        <div className="win-popup">
          <div className="confetti-container">
            {confetti.map(piece => (
              <div
                key={piece.id}
                className="confetti"
                style={{
                  backgroundColor: piece.color,
                  left: `${piece.left}%`,
                  top: `${piece.top}%`,
                  width: `${piece.size}px`,
                  height: `${piece.size}px`,
                  animationDuration: `${piece.animationDuration}s`,
                  animationDelay: `${piece.animationDelay}s`
                }}
              />
            ))}
          </div>
          <div className="win-content">
            <h2 className="win-title">Congratulations!</h2>
            <div className="win-stats">
              <div className="win-stat">
                <span className="win-stat-label">Moves</span>
                <span className="win-stat-value">{moves}</span>
              </div>
              <div className="win-stat">
                <span className="win-stat-label">Time</span>
                <span className="win-stat-value">{formatTime(time)}</span>
              </div>
            </div>
            <div className="win-message">
              You've completed the game in {moves} moves!
            </div>
            <div className="win-buttons">
              <button onClick={() => initializeGame(gridSize)} className="win-button">
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGame; 