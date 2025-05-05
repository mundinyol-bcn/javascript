const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const boardSize = 9;  // 列数
const rowSize = 10;   // 行数
let cellSize;
let selectedPiece = null;
let currentPlayer = 'red';
let validMoves = [];
let gameOver = false;

// 盤の状態（10x9）: board[y][x]
const board = [];

function resizeCanvas() {
  const containerWidth = document.getElementById("board-container").clientWidth;

  canvas.width = containerWidth;
  canvas.height = containerWidth * (10 / 9);

  cellSize = Math.min(
    canvas.width / (boardSize + 1),
    canvas.height / (rowSize + 1)
  );

  drawBoard();
  drawPieces();
}

// 駒の基本クラス
class Piece {
  constructor(type, color, x, y) {
    this.type = type;
    this.color = color;
    this.x = x;
    this.y = y;
  }

  draw(ctx) {
    const px = (this.x + 1) * cellSize;
    const py = (this.y + 1) * cellSize;
    ctx.beginPath();
    ctx.arc(px, py, cellSize * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = this.color === 'red' ? '#f44' : '#777';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = `${cellSize * 0.5}px SimSun, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.type, px, py);
  }

  getValidMoves(board) {
    return [];
  }
}

// 車（Rook）
class Che extends Piece {
  constructor(color, x, y) {
    super(color === 'red' ? '俥' : '車', color, x, y);
  }

  getValidMoves(board) {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    
    for (const [dx, dy] of directions) {
      let nx = this.x + dx;
      let ny = this.y + dy;
      while (nx >= 0 && nx < boardSize && ny >= 0 && ny < rowSize) {
        const target = board[ny][nx];
        if (!target) {
          moves.push({ x: nx, y: ny });
        } else {
          if (target.color !== this.color) {
            moves.push({ x: nx, y: ny });
          }
          break;
        }
        nx += dx;
        ny += dy;
      }
    }
    return moves;
  }
}

// 馬（Horse）
class Ma extends Piece {
  constructor(color, x, y) {
    super(color === 'red' ? '傌' : '馬', color, x, y);
  }

  getValidMoves(board) {
    const moves = [];
    const directions = [
      [-1, -2, 0, -1], [1, -2, 0, -1],
      [-2, -1, -1, 0], [2, -1, 1, 0],
      [-2, 1, -1, 0], [2, 1, 1, 0],
      [-1, 2, 0, 1], [1, 2, 0, 1]
    ];

    for (const [dx, dy, blockX, blockY] of directions) {
      const bx = this.x + blockX;
      const by = this.y + blockY;
      const nx = this.x + dx;
      const ny = this.y + dy;

      if (nx < 0 || nx >= boardSize || ny < 0 || ny >= rowSize) continue;
      if (board[by]?.[bx]) continue;
      
      const target = board[ny][nx];
      if (!target || target.color !== this.color) {
        moves.push({ x: nx, y: ny });
      }
    }
    return moves;
  }
}

// 象（Elephant）
class Xiang extends Piece {
  constructor(color, x, y) {
    super(color === 'red' ? '相' : '象', color, x, y);
  }

  getValidMoves(board) {
    const moves = [];
    const directions = [
      [-2, -2, -1, -1], [2, -2, 1, -1],
      [-2, 2, -1, 1], [2, 2, 1, 1]
    ];

    for (const [dx, dy, blockX, blockY] of directions) {
      const bx = this.x + blockX;
      const by = this.y + blockY;
      const nx = this.x + dx;
      const ny = this.y + dy;

      if (nx < 0 || nx >= boardSize || ny < 0 || ny >= rowSize) continue;
      if (board[by]?.[bx]) continue;

      if (this.color === 'red' && ny < 5) continue;
      if (this.color === 'black' && ny > 4) continue;

      const target = board[ny][nx];
      if (!target || target.color !== this.color) {
        moves.push({ x: nx, y: ny });
      }
    }
    return moves;
  }
}

// 仕（Advisor）
class Shi extends Piece {
  constructor(color, x, y) {
    super(color === 'red' ? '仕' : '士', color, x, y);
  }

  getValidMoves(board) {
    const moves = [];
    const directions = [[-1, -1], [1, -1], [-1, 1], [1, 1]]; // 斜め4方向

    for (const [dx, dy] of directions) {
      const nx = this.x + dx;
      const ny = this.y + dy;

      // 九宮チェック（赤:y7-9, 黒:y0-2）
      const inPalace = (
        nx >= 3 && nx <= 5 && (
          (this.color === 'red' && ny >= 7 && ny <= 9) ||
          (this.color === 'black' && ny >= 0 && ny <= 2)
        )
      );

      if (!inPalace) continue;

      const target = board[ny]?.[nx];
      if (!target || target.color !== this.color) {
        moves.push({ x: nx, y: ny });
      }
    }
    return moves;
  }
}

// 将（General）
class Shuai extends Piece {
  constructor(color, x, y) {
    super(color === 'red' ? '帥' : '将', color, x, y);
  }

  getValidMoves(board) {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    for (const [dx, dy] of directions) {
      const nx = this.x + dx;
      const ny = this.y + dy;

      if (nx < 3 || nx > 5) continue;
      if (this.color === 'red' && (ny < 7 || ny > 9)) continue;
      if (this.color === 'black' && (ny < 0 || ny > 2)) continue;

      const target = board[ny][nx];
      if (!target || target.color !== this.color) {
        moves.push({ x: nx, y: ny });
      }
    }
    return moves;
  }
}

// 炮（Cannon）
class Pao extends Piece {
  constructor(color, x, y) {
    super(color === 'red' ? '砲' : '炮', color, x, y);
  }

  getValidMoves(board) {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    for (const [dx, dy] of directions) {
      let nx = this.x + dx;
      let ny = this.y + dy;
      let jumped = false;

      while (nx >= 0 && nx < boardSize && ny >= 0 && ny < rowSize) {
        const target = board[ny][nx];

        if (!jumped) {
          if (!target) {
            moves.push({ x: nx, y: ny });
          } else {
            jumped = true;
          }
        } else {
          if (target) {
            if (target.color !== this.color) {
              moves.push({ x: nx, y: ny });
            }
            break;
          }
        }

        nx += dx;
        ny += dy;
      }
    }
    return moves;
  }
}

// 兵（Pawn）
class Bing extends Piece {
  constructor(color, x, y) {
    super(color === 'red' ? '兵' : '卒', color, x, y);
  }

  getValidMoves(board) {
    const moves = [];
    const forward = this.color === 'red' ? -1 : 1;
    const riverRow = this.color === 'red' ? 4 : 5;

    // 前進
    let ny = this.y + forward;
    if (ny >= 0 && ny < rowSize) {
      if (!board[ny][this.x] || board[ny][this.x].color !== this.color) {
        moves.push({ x: this.x, y: ny });
      }
    }

    // 川を渡った後の横移動
    if ((this.color === 'red' && this.y <= riverRow) || 
        (this.color === 'black' && this.y >= riverRow)) {
      for (const dx of [-1, 1]) {
        const nx = this.x + dx;
        if (nx >= 0 && nx < boardSize) {
          const target = board[this.y][nx];
          if (!target || target.color !== this.color) {
            moves.push({ x: nx, y: this.y });
          }
        }
      }
    }

    return moves;
  }
}

// 初期盤面設定
function initBoard() {
  gameOver = false;
  canvas.style.pointerEvents = 'auto';
  
  for (let y = 0; y < rowSize; y++) {
    board[y] = [];
    for (let x = 0; x < boardSize; x++) {
      board[y][x] = null;
    }
  }

  // 黒の駒
  board[0][0] = new Che('black', 0, 0);
  board[0][8] = new Che('black', 8, 0);
  board[0][1] = new Ma('black', 1, 0);
  board[0][7] = new Ma('black', 7, 0);
  board[0][2] = new Xiang('black', 2, 0);
  board[0][6] = new Xiang('black', 6, 0);
  board[0][3] = new Shi('black', 3, 0);
  board[0][5] = new Shi('black', 5, 0);
  board[0][4] = new Shuai('black', 4, 0);
  board[2][1] = new Pao('black', 1, 2);
  board[2][7] = new Pao('black', 7, 2);
  for (let i = 0; i < 5; i++) {
    board[3][i * 2] = new Bing('black', i * 2, 3);
  }

  // 赤の駒
  board[9][0] = new Che('red', 0, 9);
  board[9][8] = new Che('red', 8, 9);
  board[9][1] = new Ma('red', 1, 9);
  board[9][7] = new Ma('red', 7, 9);
  board[9][2] = new Xiang('red', 2, 9);
  board[9][6] = new Xiang('red', 6, 9);
  board[9][3] = new Shi('red', 3, 9);
  board[9][5] = new Shi('red', 5, 9);
  board[9][4] = new Shuai('red', 4, 9);
  board[7][1] = new Pao('red', 1, 7);
  board[7][7] = new Pao('red', 7, 7);
  for (let i = 0; i < 5; i++) {
    board[6][i * 2] = new Bing('red', i * 2, 6);
  }
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;

  // 横線
  for (let y = 0; y < rowSize; y++) {
    const yPos = (y + 1) * cellSize;
    ctx.beginPath();
    ctx.moveTo(cellSize, yPos);
    ctx.lineTo(cellSize * boardSize, yPos);
    ctx.stroke();
  }

  // 縦線
  for (let x = 0; x < boardSize; x++) {
    const xPos = (x + 1) * cellSize;
    ctx.beginPath();
    ctx.moveTo(xPos, cellSize);
    ctx.lineTo(xPos, 5 * cellSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(xPos, 6 * cellSize);
    ctx.lineTo(xPos, rowSize * cellSize);
    ctx.stroke();
  }

  // 中央の文字
  ctx.font = `${cellSize * 0.6}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("楚河", 2 * cellSize, 5.5 * cellSize);
  ctx.fillText("漢界", 7 * cellSize, 5.5 * cellSize);

  // 宮廷の斜線
  ctx.beginPath();
  ctx.moveTo(4 * cellSize, 8 * cellSize);
  ctx.lineTo(6 * cellSize, 10 * cellSize);
  ctx.moveTo(6 * cellSize, 8 * cellSize);
  ctx.lineTo(4 * cellSize, 10 * cellSize);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(4 * cellSize, 1 * cellSize);
  ctx.lineTo(6 * cellSize, 3 * cellSize);
  ctx.moveTo(6 * cellSize, 1 * cellSize);
  ctx.lineTo(4 * cellSize, 3 * cellSize);
  ctx.stroke();
}

function drawPieces() {
  for (let y = 0; y < rowSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const piece = board[y][x];
      if (piece) {
        // 選択中の駒は黄色い枠
        if (selectedPiece === piece) {
          ctx.beginPath();
          ctx.arc((x + 1) * cellSize, (y + 1) * cellSize, cellSize * 0.45, 0, Math.PI * 2);
          ctx.strokeStyle = "#FFFF00";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        piece.draw(ctx);
      }
    }
  }
}

function drawValidMoves() {
  if (!validMoves || validMoves.length === 0) return;
  ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
  for (const move of validMoves) {
    ctx.beginPath();
    ctx.arc((move.x + 1) * cellSize, (move.y + 1) * cellSize, cellSize * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function movePiece(piece, x, y) {
  const target = board[y][x];
  
  // 将を取った場合
  if (target && (target.type === '将' || target.type === '帥')) {
    endGame(piece.color);
    return;
  }

  board[piece.y][piece.x] = null;
  board[y][x] = piece;
  piece.x = x;
  piece.y = y;
  currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
  updatePlayerDisplay();
  selectedPiece = null;
  validMoves = [];
  drawBoard();
  drawPieces();
}

function endGame(winner) {
  gameOver = true;
  const infoElement = document.getElementById("info");
  infoElement.innerHTML = winner === 'red' 
    ? '<span style="color:#f00;font-size:1.8em">红方胜利<br>Victoria del rojo</span>' 
    : '<span style="color:#000;font-size:1.8em">黑方胜利<br>Victoria del negro</span>';
  
  canvas.style.pointerEvents = 'none';
  setTimeout(() => {
    if (confirm(`${winner === 'red' ? '红方' : '黑方'}胜利！再战 (Revancha)？`)) {
      resetGame();
    }
  }, 100);
}

function resetGame() {
  initBoard();
  updatePlayerDisplay();
  drawBoard();
  drawPieces();
}

function selectNewPiece(piece) {
  selectedPiece = piece;
  validMoves = piece.getValidMoves(board);
  drawBoard();
  drawPieces();
  drawValidMoves();
}

function updatePlayerDisplay() {
  if (gameOver) return;
  const infoElement = document.getElementById("info");
  infoElement.innerHTML = currentPlayer === 'red' 
    ? '<span style="color:#f00;font-size:1.8em">红方走棋</span><br>Le toca al rojo' 
    : '<span style="color:#000;font-size:1.8em">黑方走棋</span><br>Le toca al negro';
  infoElement.style.color = currentPlayer === 'red' ? '#f00' : '#000';
}

canvas.addEventListener("click", (e) => {
  if (gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left) / cellSize) - 1;
  const y = Math.round((e.clientY - rect.top) / cellSize) - 1;

  // 座標チェック（緩和版）
  if (x < -0.5 || x >= boardSize + 0.5 || y < -0.5 || y >= rowSize + 0.5) {
    selectedPiece = null;
    validMoves = [];
    drawBoard();
    drawPieces();
    return;
  }

  // 駒検出（拡大範囲）
  let clickedPiece = board[y]?.[x];
  if (!clickedPiece) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < boardSize && ny >= 0 && ny < rowSize && board[ny][nx]) {
          clickedPiece = board[ny][nx];
          break;
        }
      }
    }
  }

  if (selectedPiece && validMoves.some(pos => 
    Math.abs(pos.x - x) <= 0.5 && Math.abs(pos.y - y) <= 0.5)) {
    movePiece(selectedPiece, x, y);
    return;
  }

  if (clickedPiece && clickedPiece.color === currentPlayer) {
    selectNewPiece(clickedPiece);
    return;
  }

  selectedPiece = null;
  validMoves = [];
  drawBoard();
  drawPieces();
});

window.addEventListener("load", () => {
  initBoard();
  resizeCanvas();
  updatePlayerDisplay();
});

window.addEventListener("resize", resizeCanvas);
