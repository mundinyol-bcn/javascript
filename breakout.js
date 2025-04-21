let canvas, ctx;
let paddleX;
let x, y;
let dx = 2, dy = -2;
let ballRadius = 10;
let paddleHeight = 10, paddleWidth = 75;
let rightPressed = false, leftPressed = false;
let brickRowCount = 4, brickColumnCount = 5;
let brickWidth = 75, brickHeight = 20;
let brickPadding = 10, brickOffsetTop = 30, brickOffsetLeft = 30;
let bricks = [];
let score = 0;
let lives = 3;
let isPlaying = false;

const hitSound = new Audio('blocksound.mp3');

// ブロック初期化
function initBricks() {
  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}

// スコア表示
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + score, 8, 20);
}

// ライフ表示
function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Lives: " + lives, canvas.width - 80, 20);
}

// ボール描画
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

// パドル描画
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();
}

// ブロック描画
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// ブロックとの当たり判定
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          hitSound.play();
          score++;
          if (score === brickRowCount * brickColumnCount) {
            alert("YOU WIN!");
            document.location.reload();
          }
        }
      }
    }
  }
}

// メイン描画処理
function draw() {
  if (!isPlaying) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  collisionDetection();

  // 壁反射
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }

  // 上反射
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius - 10) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      lives--;
      if (!lives) {
        alert("GAME OVER");
        document.location.reload();
      } else {
        setTimeout(() => {
          resetBallAndPaddle();
          draw();
        }, 1000);
        return;
      }
    }
  }

  x += dx;
  y += dy;

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  requestAnimationFrame(draw);
}

// ボールとパドル初期化
function resetBallAndPaddle() {
  x = canvas.width / 2;
  y = canvas.height / 2;
  paddleX = (canvas.width - paddleWidth) / 2;
}

// スピード変更機能（5段階）
function setBallSpeed(level) {
  const speedLevels = {
    1: 1,
    2: 1.5,
    3: 2,
    4: 3,
    5: 4
  };

  const speed = speedLevels[level] || 2;
  const dxSign = dx >= 0 ? 1 : -1;
  const dySign = dy >= 0 ? 1 : -1;
  dx = dxSign * speed;
  dy = dySign * -speed;
}

// キーボードイベント
function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

// ゲーム開始・停止・リセット
function startGame() {
  const img = document.getElementById("startImage");
  if (img) img.style.display = "none"; // 👈 ここがポイント！

  if (!isPlaying) {
    isPlaying = true;
    draw();
  }
}

function stopGame() {
  isPlaying = false;
}

function resetGame() {
  stopGame();
  resetBallAndPaddle();
  initBricks();
  score = 0;
  lives = 3;
}

window.onload = () => {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  initBricks();
  resetBallAndPaddle();

};
