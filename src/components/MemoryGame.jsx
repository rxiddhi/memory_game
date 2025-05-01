import { useEffect, useState, useCallback } from "react";
import "./MemoryGame.css";

const MemoryGame = () => {
  // State variables to manage game state
  const [gridSize, setGridSize] = useState(4);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [confetti, setConfetti] = useState([]);

  // Numbers for the pairs
  const numberPairs = Array.from({ length: 50 }, (_, i) => i + 1);

  // Initialize the game
  const initializeGame = useCallback((size) => {
    const totalCards = size * size;
    const pairCount = Math.floor(totalCards / 2);
    const selectedNumbers = numberPairs.slice(0, pairCount);
    let gameCards = [...selectedNumbers, ...selectedNumbers];
    
    if (totalCards % 2 !== 0) {
      gameCards.push(selectedNumbers[0]);
    }
    
    const shuffledCards = gameCards
      .sort(() => Math.random() - 0.5)
      .map((number, index) => ({ id: index, number }));

    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
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

  // Helper functions
  const isFlipped = useCallback((id) => flipped.includes(id) || solved.includes(id), [flipped, solved]);
  const isSolved = useCallback((id) => solved.includes(id), [solved]);

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
    if (cards[firstId].number === cards[secondId].number) {
      setSolved(prev => [...prev, firstId, secondId]);
      setFlipped([]);
      setDisabled(false);
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 1000);
    }
  }, [cards]);

  // Handle card click
  const handleClick = useCallback((id) => {
    if (disabled || won || flipped.includes(id) || solved.includes(id)) return;

    if (!isPlaying) {
      setIsPlaying(true);
    }

    setFlipped(prev => {
      if (prev.length === 0) {
        return [id];
      }
      if (prev.length === 1) {
        setDisabled(true);
        setMoves(m => m + 1);
        const newFlipped = [...prev, id];
        checkMatch(prev[0], id);
        return newFlipped;
      }
      return prev;
    });
  }, [disabled, won, flipped, solved, isPlaying, checkMatch]);

  // Timer for the game
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

  // Check win condition
  useEffect(() => {
    if (cards.length > 0 && solved.length > 0 && solved.length === cards.length * 2) {
      setWon(true);
      setIsPlaying(false);
      createConfetti();
    }
  }, [solved, cards.length]);

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
      </div>

      <div
        className="game-board"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleClick(card.id)}
            className={`card ${isFlipped(card.id) ? (isSolved(card.id) ? "solved" : "flipped") : ""}`}
          >
            {isFlipped(card.id) ? (
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