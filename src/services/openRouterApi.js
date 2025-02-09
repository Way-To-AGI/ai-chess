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

// 添加棋子价值常量
const PIECE_VALUES = {
  p: 1,  // 兵
  n: 3,  // 马
  b: 3,  // 象
  r: 5,  // 车
  q: 9,  // 后
  k: 0   // 王
};

// 添加位置权重常量 (这里只添加了兵和马的权重作为示例)
const POSITION_WEIGHTS = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 5, 5, 5, 5, 5, 5, 5],
    [1, 1, 2, 3, 3, 2, 1, 1],
    [0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5],
    [0.5, 1, 1, -2, -2, 1, 1, 0.5],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  n: [
    [-5, -4, -3, -3, -3, -3, -4, -5],
    [-4, -2, 0, 0, 0, 0, -2, -4],
    [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
    [-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
    [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
    [-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
    [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
    [-5, -4, -3, -3, -3, -3, -4, -5]
  ]
};

export const getAIMove = async (fen, player, model, apiKey) => {
  try {
    const game = new Chess(fen);
    const legalMoves = game.moves({ verbose: true });

    if (legalMoves.length === 0) {
      throw new Error('No legal moves available');
    }

    const prompt = `Chess position FEN: ${fen}
Legal moves: ${legalMoves.map(m => m.san).join(', ')}
Return only one move from the legal moves list:`;

    const response = await openRouterClient.post('/chat/completions', {
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10,
      temperature: 0.7,
      models: [model, "anthropic/claude-3-sonnet"],
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/yourusername/ai-chess',
        'X-Title': 'AI Chess Game',
      }
    });

    // 检查响应格式
    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from AI service');
    }

    let suggestedMove = response.data.choices[0].message.content
      .trim()
      .replace(/[\n\r]/g, '')
      .replace(/\s+/g, ' ');
    
    // 获取当前所有合法走法
    const legalMovesNotation = game.moves();
    
    // 验证移动的合法性并检查是否会导致不利局面
    const validMove = legalMovesNotation.find(move => 
      move.toLowerCase() === suggestedMove.toLowerCase() &&
      !willLeadToDraw(game, move) &&
      !willLoseMaterial(game, move)
    ) || legalMovesNotation[0]; // 如果没有找到合适的移动，使用第一个合法移动

    // 使用验证过的合法走法
    const moveDetails = legalMoves.find(
      move => move.san.toLowerCase() === validMove.toLowerCase()
    );

    return moveDetails.san;
  } catch (error) {
    console.error('Error getting AI move:', error);
    throw new Error(
      error.response?.data?.error?.message || 
      error.response?.data?.error || 
      error.message || 
      'Unknown error occurred'
    );
  }
};

// 添加辅助函数：检查移动是否会导致和棋
const willLeadToDraw = (game, move) => {
  const testGame = new Chess(game.fen());
  testGame.move(move);
  return testGame.isDraw();
};

// 添加辅助函数：检查移动是否会导致重大损失
const willLoseMaterial = (game, move) => {
  const testGame = new Chess(game.fen());
  testGame.move(move);
  const materialBefore = evaluatePosition(game);
  const materialAfter = evaluatePosition(testGame);
  return materialAfter < materialBefore - 3; // 允许为了更好的位置而牺牲一定子力
};

// 更新评估函数
const evaluatePosition = (game) => {
  const board = game.board();
  let score = 0;
  
  // 基础子力价值评估
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        let value = PIECE_VALUES[piece.type.toLowerCase()] || 0;
        
        // 添加位置权重
        if (POSITION_WEIGHTS[piece.type.toLowerCase()]) {
          const positionValue = piece.color === 'w' 
            ? POSITION_WEIGHTS[piece.type.toLowerCase()][i][j]
            : POSITION_WEIGHTS[piece.type.toLowerCase()][7-i][j];
          value += positionValue;
        }
        
        // 中心控制奖励
        if ((i === 3 || i === 4) && (j === 3 || j === 4)) {
          value *= 1.1;
        }
        
        score += piece.color === 'w' ? value : -value;
      }
    }
  }
  
  // 机动性奖励
  const mobility = game.moves().length;
  score += (game.turn() === 'w' ? 0.1 : -0.1) * mobility;
  
  return score;
};

