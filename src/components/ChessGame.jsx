'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { getAIMove } from '../services/openRouterApi';
import styles from '../styles/ChessGame.module.css';

const GAME_STATE = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished'
};

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [gameState, setGameState] = useState(GAME_STATE.IDLE);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState('');
  
  const moveHistoryRef = useRef(null);

  // 设置默认模型
  const [models, setModels] = useState({
    white: 'anthropic/claude-3-sonnet',
    black: 'deepseek/deepseek-chat:free'
  });

  // 重置游戏
  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setGameState(GAME_STATE.IDLE);
    setCurrentPlayer('white');
    setError(null);
    setMoveHistory([]);
    setGameStatus('');
  }, []);

  // 处理移动
  const makeMove = useCallback((move) => {
    try {
      const gameCopy = new Chess(game.fen());
      
      // 直接使用字符串形式的移动
      const moveStr = typeof move === 'string' 
        ? move  // AI 返回的代数记号格式 (如 'e4')
        : `${move.from}${move.to}`; // 用户拖动时的格式转换为字符串
      
      const result = gameCopy.move(moveStr);
      if (result) {
        setGame(gameCopy);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
  }, [game]);

  // AI下一步
  const playNextMove = async () => {
    if (gameState !== GAME_STATE.PLAYING || isThinking) return;

    try {
      setError(null);
      setIsThinking(true);
      const player = game.turn() === 'w' ? 'white' : 'black';
      setCurrentPlayer(player);

      // 检查游戏是否结束
      if (game.isGameOver()) {
        updateGameStatus();
        return;
      }

      const aiMove = await getAIMove(
        game.fen(),
        player,
        models[player],
        apiKey
      );

      if (aiMove) {
        const success = makeMove(aiMove);
        if (success) {
          setMoveHistory(prev => [...prev, 
            `${player.charAt(0).toUpperCase() + player.slice(1)} (${models[player]}): ${aiMove}`
          ]);
          updateGameStatus();
        } else {
          throw new Error('Invalid move returned by AI');
        }
      }
    } catch (error) {
      console.error('Error making move:', error);
      setError(`Error: ${error.message}`);
      setGameState(GAME_STATE.PAUSED);  // 改为PAUSED而不是FINISHED，让用户可以继续
    } finally {
      setIsThinking(false);
    }
  };

  const updateGameStatus = () => {
    if (game.isGameOver()) {
      setGameState(GAME_STATE.FINISHED);
      if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? 'Black' : 'White';
        setGameStatus(`Checkmate! ${winner} wins!`);
      } else if (game.isDraw()) {
        if (game.isStalemate()) {
          setGameStatus("Game Over - Stalemate");
        } else if (game.isThreefoldRepetition()) {
          setGameStatus("Game Over - Draw by repetition");
        } else if (game.isInsufficientMaterial()) {
          setGameStatus("Game Over - Draw by insufficient material");
        } else {
          setGameStatus("Game Over - Draw");
        }
      }
      return true;
    }
    return false;
  };

  // 自动播放
  useEffect(() => {
    let timeoutId;
    if (gameState === GAME_STATE.PLAYING && !isThinking) {
      timeoutId = setTimeout(playNextMove, 1000);
    }
    return () => clearTimeout(timeoutId);
  }, [game, gameState, isThinking]);

  // 处理用户操作
  const onDrop = (sourceSquare, targetSquare) => {
    if (gameState !== GAME_STATE.PLAYING) return false;
    
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // 默认升变为皇后
    };

    const success = makeMove(move);
    return success;
  };

  // 添加移动历史自动滚动效果
  useEffect(() => {
    if (moveHistoryRef.current) {
      moveHistoryRef.current.scrollTop = moveHistoryRef.current.scrollHeight;
    }
  }, [moveHistory]);

  return (
    <div className={styles.chessGame}>
      <div className={styles.controlsContainer}>
        <input
          type="password"
          placeholder="Enter OpenRouter API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <select
          value={models.white}
          onChange={(e) => setModels(prev => ({ ...prev, white: e.target.value }))}
        >
          <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
          <option value="deepseek/deepseek-chat:free">Deepseek</option>
          <option value="google/gemini-pro">Gemini Pro</option>
          <option value="meta-llama/llama-2-70b-chat">Llama 2</option>
        </select>
        <select
          value={models.black}
          onChange={(e) => setModels(prev => ({ ...prev, black: e.target.value }))}
        >
          <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
          <option value="deepseek/deepseek-chat:free">Deepseek</option>
          <option value="google/gemini-pro">Gemini Pro</option>
          <option value="meta-llama/llama-2-70b-chat">Llama 2</option>
        </select>
        <button
          className={styles.startButton}
          onClick={() => setGameState(GAME_STATE.PLAYING)}
          disabled={gameState === GAME_STATE.PLAYING || !apiKey}
        >
          Start
        </button>
        <button
          className={styles.pauseButton}
          onClick={() => setGameState(GAME_STATE.PAUSED)}
          disabled={gameState !== GAME_STATE.PLAYING}
        >
          Pause
        </button>
        <button 
          className={styles.resetButton}
          onClick={resetGame}
        >
          Reset1
        </button>
      </div>

      <div className={styles.gameContainer}>
        <div className={styles.boardContainer}>
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardWidth={600}
          />
        </div>

        <div className={styles.gameInfo}>
          <h3>Game Status</h3>
          {isThinking && <p className={styles.thinking}>AI is thinking</p>}
          {error && <p className={styles.error}>{error}</p>}
          {gameStatus && <p className={styles.gameStatus}>{gameStatus}</p>}
          <p>Current Player: {currentPlayer}</p>
          
          <div className={styles.moveHistory}>
            <h3>Move History</h3>
            {moveHistory.map((move, index) => (
              <div key={index} className={styles.moveEntry}>
                {`${index + 1}. ${move}`}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame; 