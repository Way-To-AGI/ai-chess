import axios from 'axios';
import { Chess } from 'chess.js';

const openRouterClient = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器来设置 Authorization header
openRouterClient.interceptors.request.use((config) => {
  if (config.headers && config.apiKey) {
    config.headers.Authorization = `Bearer ${config.apiKey}`;
    delete config.apiKey; // 删除额外的 apiKey 参数
  }
  return config;
});

export const getAIMove = async (fen, player, model, apiKey) => {
  try {
    const game = new Chess(fen);
    const legalMoves = game.moves({ verbose: true });

    if (legalMoves.length === 0) {
      throw new Error('No legal moves available');
    }

    // 评估每个可能的移动
    const evaluatedMoves = legalMoves.map(move => {
      const testGame = new Chess(fen);
      testGame.move(move);
      return {
        move: move,
        score: evaluatePosition(testGame, player === 'white' ? 'w' : 'b')
      };
    });

    // 选择最佳移动，但加入一些随机性以避免重复
    const bestMoves = evaluatedMoves
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // 取前三个最佳移动
    
    const selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)].move;

    // 验证移动的合法性
    if (!game.moves().includes(selectedMove.san)) {
      throw new Error('Invalid move generated');
    }

    return selectedMove.san;
  } catch (error) {
    console.error('Error getting AI move:', error);
    throw new Error(error.response?.data?.error || error.message);
  }
};

// 添加位置评估函数
const evaluatePosition = (game, playerColor) => {
  let score = 0;
  const board = game.board();
  
  // 基础子力价值
  const pieceValues = {
    p: 1, n: 3, b: 3, r: 5, q: 9, k: 0
  };

  // 计算所有棋子的价值
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const value = pieceValues[piece.type];
        score += piece.color === playerColor ? value : -value;
      }
    }
  }

  // 考虑王的安全性
  if (game.isCheck()) {
    score -= playerColor === game.turn() ? 2 : -2;
  }

  // 考虑机动性
  score += game.moves().length * 0.1;

  // 避免重复移动
  if (game.isThreefoldRepetition()) {
    score -= 5;
  }

  return score;
};

