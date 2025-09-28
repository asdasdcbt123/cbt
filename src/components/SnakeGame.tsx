import React, { useState, useEffect, useCallback, useRef } from 'react';

// Types
type Position = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

type GameStatus = 'IDLE' | 'PLAYING' | 'GAME_OVER';

// Constants
const BOARD_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 50;
const SPEED_INCREMENT = 5;
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

const SnakeGame: React.FC = () => {
  // Game state
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('UP');
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  // Refs
  const directionRef = useRef<Direction>(direction);
  const gameStatusRef = useRef<GameStatus>(gameStatus);
  
  // Generate food at random position
  const generateFood = useCallback((snakeBody: Position[]) => {
    const isPositionOccupied = (pos: Position) => snakeBody.some(segment => segment.x === pos.x && segment.y === pos.y);
    
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
      // Make sure food doesn't appear on snake
    } while (isPositionOccupied(newFood));
    
    setFood(newFood);
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection('UP');
    directionRef.current = 'UP';
    setScore(0);
    setSpeed(INITIAL_SPEED);
    generateFood(INITIAL_SNAKE);
    setGameStatus('PLAYING');
    gameStatusRef.current = 'PLAYING';
  }, [generateFood]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatusRef.current === 'GAME_OVER' && (e.key === ' ' || e.key === 'Spacebar')) {
        initGame();
        return;
      }

      if (gameStatusRef.current !== 'PLAYING') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (directionRef.current !== 'DOWN') {
            setDirection('UP');
            directionRef.current = 'UP';
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (directionRef.current !== 'UP') {
            setDirection('DOWN');
            directionRef.current = 'DOWN';
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (directionRef.current !== 'RIGHT') {
            setDirection('LEFT');
            directionRef.current = 'LEFT';
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (directionRef.current !== 'LEFT') {
            setDirection('RIGHT');
            directionRef.current = 'RIGHT';
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initGame]);

  // Game loop
  useEffect(() => {
    if (gameStatus !== 'PLAYING') return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        
        // Move head based on direction
        switch (directionRef.current) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        // Check collision with walls
        if (
          head.x < 0 || 
          head.x >= BOARD_SIZE || 
          head.y < 0 || 
          head.y >= BOARD_SIZE
        ) {
          setGameStatus('GAME_OVER');
          gameStatusRef.current = 'GAME_OVER';
          return prevSnake;
        }

        // Check collision with self
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameStatus('GAME_OVER');
          gameStatusRef.current = 'GAME_OVER';
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];
        
        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
          // Increase score
          setScore(prev => prev + 10);
          
          // Increase speed
          setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
          
          // Generate new food
          generateFood(newSnake);
        } else {
          // Remove tail if no food was eaten
          newSnake.pop();
        }
        
        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [food, gameStatus, generateFood, speed]);

  // Initialize food position
  useEffect(() => {
    generateFood(snake);
  }, [generateFood, snake]);

  // Update refs when state changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  // Handle touch controls for mobile
  const handleSwipe = (dir: Direction) => {
    if (gameStatusRef.current !== 'PLAYING') return;
    
    switch (dir) {
      case 'UP':
        if (directionRef.current !== 'DOWN') {
          setDirection('UP');
          directionRef.current = 'UP';
        }
        break;
      case 'DOWN':
        if (directionRef.current !== 'UP') {
          setDirection('DOWN');
          directionRef.current = 'DOWN';
        }
        break;
      case 'LEFT':
        if (directionRef.current !== 'RIGHT') {
          setDirection('LEFT');
          directionRef.current = 'LEFT';
        }
        break;
      case 'RIGHT':
        if (directionRef.current !== 'LEFT') {
          setDirection('RIGHT');
          directionRef.current = 'RIGHT';
        }
        break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Snake Game
        </h1>
        
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-semibold">
            Score: <span className="text-yellow-300">{score}</span>
          </div>
          <div className="text-lg">
            Speed: <span className="text-green-300">{Math.round((INITIAL_SPEED - speed + MIN_SPEED) / SPEED_INCREMENT) + 1}x</span>
          </div>
        </div>
        
        <div className="relative bg-gray-900 rounded-xl shadow-2xl p-4 mb-4">
          <div 
            className="grid gap-0 border-2 border-gray-700 rounded-lg overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
              width: '100%',
              aspectRatio: '1/1'
            }}
          >
            {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
              const x = index % BOARD_SIZE;
              const y = Math.floor(index / BOARD_SIZE);
              
              const isSnakeHead = snake[0].x === x && snake[0].y === y;
              const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
              const isFood = food.x === x && food.y === y;
              
              let cellClass = 'aspect-square ';
              
              if (isSnakeHead) {
                cellClass += 'bg-gradient-to-br from-green-400 to-emerald-600 rounded-sm';
              } else if (isSnakeBody) {
                cellClass += 'bg-gradient-to-br from-green-500 to-green-700 rounded';
              } else if (isFood) {
                cellClass += 'bg-gradient-to-br from-red-500 to-red-700 rounded-full animate-pulse';
              } else {
                cellClass += 'bg-gray-800';
              }
              
              return <div key={index} className={cellClass} />;
            })}
          </div>
          
          {gameStatus === 'IDLE' && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg">
              <h2 className="text-3xl font-bold mb-4 text-center">Snake Game</h2>
              <p className="text-lg mb-2 text-center">Use WASD or Arrow Keys to move</p>
              <p className="text-lg mb-6 text-center">Collect red food to grow</p>
              <button
                onClick={initGame}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-full text-xl font-bold shadow-lg hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Start Game
              </button>
            </div>
          )}
          
          {gameStatus === 'GAME_OVER' && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
              <h2 className="text-3xl font-bold mb-2 text-red-500">Game Over!</h2>
              <p className="text-2xl mb-4">Score: <span className="text-yellow-300">{score}</span></p>
              <button
                onClick={initGame}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-full text-xl font-bold shadow-lg hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
        
        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6 md:hidden">
          <div></div>
          <button
            onClick={() => handleSwipe('UP')}
            className="bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-xl p-4 flex items-center justify-center shadow-lg transition-all active:scale-95"
            aria-label="Move up"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <div></div>
          
          <button
            onClick={() => handleSwipe('LEFT')}
            className="bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-xl p-4 flex items-center justify-center shadow-lg transition-all active:scale-95"
            aria-label="Move left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => handleSwipe('DOWN')}
            className="bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-xl p-4 flex items-center justify-center shadow-lg transition-all active:scale-95"
            aria-label="Move down"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => handleSwipe('RIGHT')}
            className="bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-xl p-4 flex items-center justify-center shadow-lg transition-all active:scale-95"
            aria-label="Move right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="text-center text-gray-300">
          <p className="mb-2 hidden md:block">Use <span className="font-bold">WASD</span> or <span className="font-bold">Arrow Keys</span> to control the snake</p>
          <p className="hidden md:block">Press <span className="font-bold">Space</span> to restart after game over</p>
          <p className="md:hidden">Tap the controls above to move the snake</p>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;