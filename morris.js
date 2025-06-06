// Para ver cómo funciona accedea https://magradacatalunya.com/barcelona/morris/
// ¿Te animas a convertir las ideas y la sabiduría de los antiguos en código con un lenguaje de programación?
// Ven a una Quedada de Mundiñol! Somos un grupo académico que explora no solo lenguajes de programación, sino también culturas, idiomas e historias del mundo.

const board = document.getElementById("board-container");
const messageDiv = document.getElementById("message-container");
const restartBtn = document.getElementById("restart-button");
const removeSound = new Audio("pieces/neko.mp3");


const points = [
  [5, 5], [50, 5], [95, 5],
  [20, 20], [50, 20], [80, 20],
  [35, 35], [50, 35], [65, 35],
  [5, 50], [20, 50], [35, 50],
  [65, 50], [80, 50], [95, 50],
  [35, 65], [50, 65], [65, 65],
  [20, 80], [50, 80], [80, 80],
  [5, 95], [50, 95], [95, 95]
];

const neighbors = {
  0: [1, 9], 1: [0, 2, 4], 2: [1, 14],
  3: [4, 10], 4: [1, 3, 5, 7], 5: [4, 13],
  6: [7, 11], 7: [4, 6, 8], 8: [7, 12],
  9: [0, 10, 21], 10: [3, 9, 11, 18], 11: [6, 10, 15],
  12: [8, 13, 17], 13: [5, 12, 14, 20], 14: [2, 13, 23],
  15: [11, 16], 16: [15, 17, 19], 17: [12, 16],
  18: [10, 19], 19: [16, 18, 20, 22], 20: [13, 19],
  21: [9, 22], 22: [19, 21, 23], 23: [14, 22]
};

const mills = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [15, 16, 17], [18, 19, 20], [21, 22, 23],
  [0, 9, 21], [3, 10, 18], [6, 11, 15],
  [1, 4, 7], [16, 19, 22], [8, 12, 17],
  [5, 13, 20], [2, 14, 23], [9, 10, 11],
  [12, 13, 14]
];

let pieces = {};
let currentPlayer = "white";
let placedCount = { black: 0, white: 0 };
const maxPieces = 9;
let phase = 1;
let selectedPiece = null;
let highlightedMoves = [];
let isRemoving = false;

showMessage("Turno de blanco");

points.forEach((_, i) => {
  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.left = `${points[i][0]}%`;
  dot.style.top = `${points[i][1]}%`;
  dot.style.width = "30px";
  dot.style.height = "30px";
  dot.style.transform = "translate(-50%, -50%)";
  dot.style.cursor = "pointer";
  dot.dataset.index = i;
  dot.onclick = onPointClick;
  board.appendChild(dot);
});

function onPointClick(e) {
  const index = parseInt(e.target.dataset.index);
  if (isNaN(index) || isRemoving) return;

  if (phase === 1) {
    if (pieces[index] || placedCount[currentPlayer] >= maxPieces) return;
    placePiece(index, currentPlayer);
    placedCount[currentPlayer]++;

    if (checkMill(index, currentPlayer)) {
      enableRemoveMode();
      return;
    }

    if (placedCount.black === maxPieces && placedCount.white === maxPieces) {
      phase = 2;
      showMessage("Fase 2: Mueve un gato negro");
      return;
    }

    switchTurn();
  } else if (phase >= 2) {
    if (highlightedMoves.includes(index)) {
      movePiece(selectedPiece, index);
      clearHighlights();
      selectedPiece = null;

      if (checkMill(index, currentPlayer)) {
        enableRemoveMode();
        return;
      }

      if (checkVictory()) return;

      switchTurn();
      return;
    }

    const pieceColor = pieces[index];
    if (pieceColor === currentPlayer) {
      clearHighlights();
      selectedPiece = index;
      highlightMoves(index);
    }
  }
}

function placePiece(index, color) {
  pieces[index] = color;
  const [x, y] = points[index];
  const img = document.createElement("img");
  img.src = `pieces/${color === "white" ? "shiro" : "kuro"}.png`;
  img.className = "piece";
  img.style.left = `${x}%`;
  img.style.top = `${y}%`;
  img.style.width = "10%";
  img.style.height = "10%";
  img.dataset.index = index;
  img.dataset.color = color;
  img.style.cursor = color === currentPlayer ? "pointer" : "default";
  img.onclick = onPointClick;
  board.appendChild(img);

  updatePieceCursors();
}

function movePiece(from, to) {
  const pieceElements = document.querySelectorAll(".piece");
  pieceElements.forEach(img => {
    if (parseInt(img.dataset.index) === from && img.dataset.color === currentPlayer) {
      const [x, y] = points[to];
      img.style.left = `${x}%`;
      img.style.top = `${y}%`;
      img.dataset.index = to;

      pieces[to] = currentPlayer;
      delete pieces[from];
    }
  });

  updatePieceCursors();
}

function checkMill(index, color) {
  return mills.some(mill => mill.includes(index) && mill.every(i => pieces[i] === color));
}

function enableRemoveMode() {
  isRemoving = true;
  showMessage("Elige una pieza del oponente para eliminar");

  const enemies = Object.entries(pieces)
    .filter(([i, c]) => c !== currentPlayer)
    .map(([i]) => parseInt(i));

  let removable = enemies.filter(i => !checkMill(i, pieces[i]));
  if (removable.length === 0) removable = enemies;

  removable.forEach(i => {
    const img = document.querySelector(`img[data-index='${i}']`);
    if (img) {
      img.style.outline = "3px solid yellow";
      img.style.cursor = "pointer";
      img.onclick = onRemoveClick;
    }
  });
}

function onRemoveClick(e) {
  const index = parseInt(e.target.dataset.index);
  delete pieces[index];
  e.target.remove();

  const allRemovable = document.querySelectorAll("img[style*='outline']");
  allRemovable.forEach(img => {
    img.style.outline = "";
    img.onclick = onPointClick;
  });

  isRemoving = false;
  updatePieceCursors();
  clearHighlights();

  if (checkVictory()) return;

  switchTurn();
}

function highlightMoves(index) {
  const ownCount = Object.values(pieces).filter(c => c === currentPlayer).length;
  const neighborsList = neighbors[index] || [];
  highlightedMoves = ownCount === 3
    ? points.map((_, i) => i).filter(i => !pieces[i])
    : neighborsList.filter(n => !pieces[n]);

  highlightedMoves.forEach(i => {
    const dot = document.querySelector(`div[data-index='${i}']`);
    if (dot) dot.style.backgroundColor = "yellow";
  });
}

function clearHighlights() {
  highlightedMoves.forEach(i => {
    const dot = document.querySelector(`div[data-index='${i}']`);
    if (dot) dot.style.backgroundColor = "";
  });
  highlightedMoves = [];
}

function updatePieceCursors() {
  const pieceElements = document.querySelectorAll(".piece");
  pieceElements.forEach(img => {
    const color = img.dataset.color;
    img.style.cursor = color === currentPlayer ? "pointer" : "default";
  });
}

function switchTurn() {
  currentPlayer = currentPlayer === "black" ? "white" : "black";
  showMessage(`Turno de ${currentPlayer === "black" ? "negro" : "blanco"}`);
}

function checkVictory() {
  
  if (phase === 1) return false;
  
  const opponent = currentPlayer === "black" ? "white" : "black";
  const opponentPieces = Object.entries(pieces).filter(([_, c]) => c === opponent).map(([i]) => parseInt(i));

  if (opponentPieces.length < 3) {
    showVictory(currentPlayer);
    return true;
  }

  const hasMoves = opponentPieces.some(index => {
    if (opponentPieces.length === 3) {
      return points.some((_, i) => !pieces[i]);
    }
    return (neighbors[index] || []).some(n => !pieces[n]);
  });

  if (!hasMoves) {
    showVictory(currentPlayer);
    return true;
  }

  return false;
}

function showMessage(msg) {
  messageDiv.textContent = msg;
  messageDiv.style.display = "block";
  messageDiv.style.backgroundColor = "blue";
  messageDiv.style.color = "white";
  messageDiv.style.borderRadius = "0px";
  restartBtn.style.display = "none";
}

function showVictory(winner) {
  messageDiv.textContent = `${winner === "black" ? "Negro" : "Blanco"} gana la partida`;
  messageDiv.style.display = "block";
  messageDiv.style.backgroundColor = "red";
  messageDiv.style.color = "yellow";
  messageDiv.style.borderRadius = "20px";
  restartBtn.textContent = "Jugar de nuevo";
  restartBtn.style.display = "block";
  restartBtn.style.marginTop = "10px";
  restartBtn.style.padding = "8px 16px";
  restartBtn.style.fontSize = "1em";
  restartBtn.style.border = "none";
  restartBtn.style.borderRadius = "10px";
  restartBtn.style.backgroundColor = "#333";
  restartBtn.style.color = "#fff";
  restartBtn.style.cursor = "pointer";
}

restartBtn.onclick = () => {
  location.reload();
};
