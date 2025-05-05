  <div id="game-container">

    <div id="turn-indicator">TURNO DEL PRIMER JUGADOR(S)</div>

    <!-- 後手の持ち駒 -->
    <div class="row">
      <div class="hand-label">PRISIONEROS<br>DEL SEGUNDO JUGADOR(G)</div>
      <div class="hand-container" id="hand-G"></div>
    </div>

    <!-- 将棋盤 -->
    <table class="board" id="board"></table>

    <!-- 先手の持ち駒 -->
    <div class="row">
      <div class="hand-label">PRISIONEROS<br>DEL PRIMER JUGADOR(S)</div>
      <div class="hand-container" id="hand-S"></div>
    </div>

    <!-- コントロールボタン -->
    <div class="control-buttons">
      <button onclick="resetGame()">RESET</button>
    </div>
  </div>

  <!-- 勝敗メッセージ用オーバーレイ -->
  <div id="message-overlay">
    <div class="message-box">
      <h2 id="result-message"></h2>
      <button class="close-btn" onclick="closeMessage()">CERRAR</button>
    </div>
  </div>

  <script>
    /********************************************************************
     * 1. 駒の情報と初期配置
     ********************************************************************/
    const PIECE_SYMBOLS = {
      FU: '歩', KY: '香', KE: '桂', GI: '銀', KI: '金',
      KA: '角', HI: '飛', OU: '王',
      TO: 'と', NY: '成香', NK: '成桂', NG: '成銀', UM: '馬', RY: '龍'
    };

    // 標準の初期配置 (平手)
    // row:0～8, col:0～8
    // 先手(S) → 下段, 後手(G) → 上段
    const initialBoard = [
      [ 'G-KY','G-KE','G-GI','G-KI','G-OU','G-KI','G-GI','G-KE','G-KY'], // 0段目
      [ '',     'G-HI','',     '',     '',     '',     '',     'G-KA',''    ], // 1段目
      [ 'G-FU','G-FU','G-FU','G-FU','G-FU','G-FU','G-FU','G-FU','G-FU'], // 2段目
      [ '',     '',     '',     '',     '',     '',     '',     '',     ''    ], // 3段目
      [ '',     '',     '',     '',     '',     '',     '',     '',     ''    ], // 4段目
      [ '',     '',     '',     '',     '',     '',     '',     '',     ''    ], // 5段目
      [ 'S-FU','S-FU','S-FU','S-FU','S-FU','S-FU','S-FU','S-FU','S-FU'], // 6段目
      [ '',     'S-KA','',     '',     '',     '',     '',     'S-HI',''    ], // 7段目
      [ 'S-KY','S-KE','S-GI','S-KI','S-OU','S-KI','S-GI','S-KE','S-KY']  // 8段目
    ];

    // 現在の盤面
    let boardState = JSON.parse(JSON.stringify(initialBoard));

    // 持ち駒 (先手/後手) : { FU: 数, KY: 数, ... }
    let hands = {
      S: {},
      G: {}
    };

    // true = 先手(S)の番 / false = 後手(G)の番
    let isPlayerSTurn = true;

    // 選択中の情報 { type: 'board' or 'hand', row?, col?, player?, piece? }
    let selectedInfo = null;

    // 移動/打ち可能マス一覧
    let possibleMoves = [];

    // DOM要素の取得
    const boardElement = document.getElementById('board');
    const turnIndicator = document.getElementById('turn-indicator');
    const handContainerS = document.getElementById('hand-S');
    const handContainerG = document.getElementById('hand-G');
    const messageOverlay = document.getElementById('message-overlay');
    const resultMessage = document.getElementById('result-message');

    /********************************************************************
     * 2. 初期描画
     ********************************************************************/
    drawAll();

    /********************************************************************
     * 3. ユーティリティ
     ********************************************************************/
    function clearSelection() {
      selectedInfo = null;
      possibleMoves = [];
    }

    // メッセージを表示してゲームを終了
    function endGame(winner) {
      let text = (winner === 'S') ? '¡EL PRIMER JUGADOR(S) HA GANADO!'
                                  : '¡EL SEGUNDO JUGADOR(G) HA GANADO!';
      resultMessage.textContent = text;
      messageOverlay.style.display = 'flex';
      // 盤操作を無効化するため、全てのクリックをキャンセル (簡易実装)
      boardElement.style.pointerEvents = 'none';
      handContainerS.style.pointerEvents = 'none';
      handContainerG.style.pointerEvents = 'none';
    }

    function closeMessage() {
      messageOverlay.style.display = 'none';
    }

    // 相手の王を取ったら勝ち
    // 盤面上にOUがなければ、その駒の持ち主が負け
    function checkKingCapture() {
      // S-OU と G-OU が盤上にいるか確認
      let sKingExists = false;
      let gKingExists = false;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const val = boardState[r][c];
          if (val === 'S-OU') sKingExists = true;
          if (val === 'G-OU') gKingExists = true;
        }
      }
      // 両方いればゲーム続行
      if (sKingExists && gKingExists) return;
      // 先手王がいない → 後手の勝ち
      if (!sKingExists && gKingExists) {
        endGame('G');
      }
      // 後手王がいない → 先手の勝ち
      if (!gKingExists && sKingExists) {
        endGame('S');
      }
    }

    /********************************************************************
     * 4. 盤・持ち駒の描画
     ********************************************************************/
    function drawAll() {
      drawBoard();
      drawHands();
      updateTurnIndicator();
    }

    function drawBoard() {
      boardElement.innerHTML = '';
      for (let row = 0; row < 9; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < 9; col++) {
          const td = document.createElement('td');
          const cellValue = boardState[row][col];

          // 駒表示
          if (cellValue) {
            const [player, piece] = cellValue.split('-');
            td.textContent = PIECE_SYMBOLS[piece] || piece;
            td.classList.add(player);
          }

          // 選択中セルをハイライト
          if (selectedInfo && selectedInfo.type === 'board'
              && selectedInfo.row === row && selectedInfo.col === col) {
            td.classList.add('selected');
          }

          // 移動/打ち可能マスをハイライト
          if (possibleMoves.some(m => m.row === row && m.col === col)) {
            td.classList.add('highlight');
          }

          td.addEventListener('click', () => onCellClick(row, col));
          tr.appendChild(td);
        }
        boardElement.appendChild(tr);
      }
    }

    function drawHands() {
      // 先手(S)
      handContainerS.innerHTML = '';
      for (let piece in hands.S) {
        const count = hands.S[piece];
        for (let i = 0; i < count; i++) {
          const div = document.createElement('div');
          div.textContent = PIECE_SYMBOLS[piece] || piece;
          div.classList.add('hand-piece', 'S');
          div.addEventListener('click', () => onHandPieceClick('S', piece));
          handContainerS.appendChild(div);
        }
      }
      // 後手(G)
      handContainerG.innerHTML = '';
      for (let piece in hands.G) {
        const count = hands.G[piece];
        for (let i = 0; i < count; i++) {
          const div = document.createElement('div');
          div.textContent = PIECE_SYMBOLS[piece] || piece;
          div.classList.add('hand-piece', 'G');
          div.addEventListener('click', () => onHandPieceClick('G', piece));
          handContainerG.appendChild(div);
        }
      }
    }

    function updateTurnIndicator() {
      turnIndicator.textContent = isPlayerSTurn
        ? 'TURNO DEL PRIMER JUGADOR(S)'
        : 'TURNO DEL SEGUNDO JUGADOR(G)';
    }

    /********************************************************************
     * 5. クリック処理
     ********************************************************************/
    function onCellClick(row, col) {
      const cellValue = boardState[row][col];
      const currentPlayerPrefix = isPlayerSTurn ? 'S' : 'G';

      // (A) 手駒を選択中 → その駒を打つ
      if (selectedInfo && selectedInfo.type === 'hand') {
        const canDrop = possibleMoves.some(m => m.row === row && m.col === col);
        if (canDrop) {
          dropPiece(selectedInfo.player, selectedInfo.piece, row, col);
          clearSelection();
          drawAll();
          checkKingCapture();
          return;
        }
        // ドロップ不可 → 選択解除
        clearSelection();
        drawAll();
        return;
      }

      // (B) まだ何も選択していない → 自分の駒なら選択
      if (!selectedInfo) {
        if (cellValue && cellValue.startsWith(currentPlayerPrefix)) {
          selectedInfo = { type: 'board', row, col };
          possibleMoves = getPossibleMovesOnBoard(row, col);
          drawAll();
        }
        return;
      }

      // (C) 盤上の駒を選択中
      if (selectedInfo.type === 'board') {
        // 同じマスをクリック → 選択解除
        if (selectedInfo.row === row && selectedInfo.col === col) {
          clearSelection();
          drawAll();
          return;
        }
        // 移動可能マスか？
        const canMove = possibleMoves.some(m => m.row === row && m.col === col);
        if (canMove) {
          movePiece(selectedInfo.row, selectedInfo.col, row, col);
          clearSelection();
          drawAll();
          checkKingCapture();
          return;
        }
        // 移動不可 → 選択解除
        clearSelection();
        drawAll();
      }
    }

    // 手駒をクリック
    function onHandPieceClick(player, piece) {
      const currentPlayerPrefix = isPlayerSTurn ? 'S' : 'G';
      if (player !== currentPlayerPrefix) return;

      // 同じ手駒を再クリック → 選択解除
      if (selectedInfo && selectedInfo.type === 'hand' 
          && selectedInfo.player === player && selectedInfo.piece === piece) {
        clearSelection();
        drawAll();
        return;
      }

      // 新規選択
      selectedInfo = { type: 'hand', player, piece };
      possibleMoves = getPossibleDrops(player, piece);
      drawAll();
    }

    /********************************************************************
     * 6. 駒の移動処理
     ********************************************************************/
    function movePiece(fromRow, fromCol, toRow, toCol) {
      const movingPiece = boardState[fromRow][fromCol]; // "S-FU" など
      const [player, piece] = movingPiece.split('-');
      const targetCell = boardState[toRow][toCol];

      // もし相手の駒を取るなら持ち駒に加える（王を含む）
      if (targetCell) {
        const [enemyPlayer, enemyPiece] = targetCell.split('-');
        if (enemyPlayer !== player) {
          // 王でも取る (→ 取った瞬間ゲーム終了)
          // ただし後で checkKingCapture() で処理
          const capturedBase = demoteIfPromoted(enemyPiece);
          // もし取った駒が王でなければ持ち駒に追加
          if (capturedBase !== 'OU') {
            addToHand(player, capturedBase);
          }
        }
      }

      // 移動先に駒を置き、元は空に
      boardState[toRow][toCol] = movingPiece;
      boardState[fromRow][fromCol] = '';

      // 成り判定
      if (shouldPromote(player, piece, toRow)) {
        const promoted = promotePiece(piece);
        if (promoted) {
          const doPromote = confirm(`${PIECE_SYMBOLS[piece]} transforma.`);
          if (doPromote) {
            boardState[toRow][toCol] = `${player}-${promoted}`;
          }
        }
      }

      // ターン交代
      isPlayerSTurn = !isPlayerSTurn;
    }

    // 成り判定
    function shouldPromote(player, piece, toRow) {
      // 王・金・成駒は成れない
      if (!['FU','KY','KE','GI','KA','HI'].includes(piece)) return false;
      // 敵陣
      if (player === 'S' && toRow <= 2) return true;
      if (player === 'G' && toRow >= 6) return true;
      return false;
    }

    // 成駒変換
    function promotePiece(piece) {
      switch (piece) {
        case 'FU': return 'TO';
        case 'KY': return 'NY';
        case 'KE': return 'NK';
        case 'GI': return 'NG';
        case 'KA': return 'UM';
        case 'HI': return 'RY';
        default:   return null;
      }
    }

    // 成駒を元に戻す
    function demoteIfPromoted(piece) {
      switch (piece) {
        case 'TO': return 'FU';
        case 'NY': return 'KY';
        case 'NK': return 'KE';
        case 'NG': return 'GI';
        case 'UM': return 'KA';
        case 'RY': return 'HI';
        default:   return piece;
      }
    }

    /********************************************************************
     * 7. 手駒のドロップ処理
     ********************************************************************/
    function dropPiece(player, piece, toRow, toCol) {
      if (boardState[toRow][toCol]) return; // 空じゃない → 打てない

      // 二歩チェック
      if (piece === 'FU') {
        if (existsPawnInFile(player, toCol)) {
          alert('No puedes poner dos peones en el mimos paso');
          return;
        }
      }

      // 打てない段（歩・香→最終段、桂→最終段とその1つ前の段）はNG
      if (!canDropHere(player, piece, toRow)) {
        alert('No se puede');
        return;
      }

      // 手駒を1枚減らす
      if (!hands[player][piece] || hands[player][piece] <= 0) {
        return; // 持ち駒がない場合は打てない
      }
      hands[player][piece]--;

      // 盤上に設置
      boardState[toRow][toCol] = `${player}-${piece}`;

      // ターン交代
      isPlayerSTurn = !isPlayerSTurn;
    }

    function canDropHere(player, piece, row) {
      // 先手(S)の場合
      if (player === 'S') {
        if ((piece === 'FU' || piece === 'KY') && row === 0) return false;
        if (piece === 'KE' && (row === 0 || row === 1)) return false;
      }
      // 後手(G)の場合
      else {
        if ((piece === 'FU' || piece === 'KY') && row === 8) return false;
        if (piece === 'KE' && (row === 7 || row === 8)) return false;
      }
      return true;
    }

    function existsPawnInFile(player, col) {
      for (let r = 0; r < 9; r++) {
        const val = boardState[r][col];
        if (val) {
          const [p, pc] = val.split('-');
          if (p === player && pc === 'FU') return true;
        }
      }
      return false;
    }

    /********************************************************************
     * 8. 駒を手駒に追加
     ********************************************************************/
    function addToHand(player, piece) {
      if (!hands[player][piece]) {
        hands[player][piece] = 0;
      }
      hands[player][piece]++;
    }

    /********************************************************************
     * 9. 盤上の駒の移動可能マス取得（簡易版）
     ********************************************************************/
    function getPossibleMovesOnBoard(row, col) {
      const cellValue = boardState[row][col];
      if (!cellValue) return [];
      const [player, piece] = cellValue.split('-');
      let moves = [];
      const direction = (player === 'S') ? -1 : 1;

      const addMove = (r, c) => {
        if (r < 0 || r > 8 || c < 0 || c > 8) return; // 盤外
        const target = boardState[r][c];
        if (target) {
          const [tp, _] = target.split('-');
          // 自分の駒があれば進めない
          if (tp === player) return;
          // 相手駒なら取れるが、その先には進めない
          moves.push({ row: r, col: c });
          return;
        }
        // 空マス
        moves.push({ row: r, col: c });
      };

      switch (piece) {
        case 'FU': // 歩
        case 'TO': // と金(=金)
          if (piece === 'FU') {
            addMove(row + direction, col);
          } else {
            // と金 → 金の動き
            const offsets = (player === 'S')
              ? [[-1,0],[-1,-1],[-1,1],[0,-1],[0,1],[1,0]]
              : [[1,0],[1,-1],[1,1],[0,-1],[0,1],[-1,0]];
            offsets.forEach(([dr,dc]) => addMove(row+dr, col+dc));
          }
          break;
        case 'KY': // 香
        case 'NY': // 成香(=金)
          if (piece === 'KY') {
            let r = row + direction;
            while (r >= 0 && r <= 8) {
              const t = boardState[r][col];
              if (!t) {
                moves.push({ row: r, col: col });
              } else {
                const [tp, _] = t.split('-');
                if (tp !== player) moves.push({ row: r, col: col });
                break;
              }
              r += direction;
            }
          } else {
            // 成香 → 金
            const offsets = (player === 'S')
              ? [[-1,0],[-1,-1],[-1,1],[0,-1],[0,1],[1,0]]
              : [[1,0],[1,-1],[1,1],[0,-1],[0,1],[-1,0]];
            offsets.forEach(([dr,dc]) => addMove(row+dr, col+dc));
          }
          break;
        case 'KE': // 桂
        case 'NK': // 成桂(=金)
          if (piece === 'KE') {
            const keOffsets = (player === 'S') ? [[-2,-1],[-2,1]] : [[2,-1],[2,1]];
            keOffsets.forEach(([dr,dc]) => addMove(row+dr, col+dc));
          } else {
            // 成桂 → 金
            const offsets = (player === 'S')
              ? [[-1,0],[-1,-1],[-1,1],[0,-1],[0,1],[1,0]]
              : [[1,0],[1,-1],[1,1],[0,-1],[0,1],[-1,0]];
            offsets.forEach(([dr,dc]) => addMove(row+dr, col+dc));
          }
          break;
        case 'GI': // 銀
        case 'NG': // 成銀(=金)
          if (piece === 'GI') {
            const giOffsets = (player === 'S')
              ? [[-1,0],[-1,-1],[-1,1],[1,-1],[1,1]]
              : [[1,0],[1,-1],[1,1],[-1,-1],[-1,1]];
            giOffsets.forEach(([dr,dc]) => addMove(row+dr, col+dc));
          } else {
            // 成銀 → 金
            const offsets = (player === 'S')
              ? [[-1,0],[-1,-1],[-1,1],[0,-1],[0,1],[1,0]]
              : [[1,0],[1,-1],[1,1],[0,-1],[0,1],[-1,0]];
            offsets.forEach(([dr,dc]) => addMove(row+dr, col+dc));
          }
          break;
        case 'KI': // 金
          const kinOffsets = (player === 'S')
            ? [[-1,0],[-1,-1],[-1,1],[0,-1],[0,1],[1,0]]
            : [[1,0],[1,-1],[1,1],[0,-1],[0,1],[-1,0]];
          kinOffsets.forEach(([dr,dc]) => addMove(row+dr, col+dc));
          break;
        case 'KA': // 角
        case 'UM': // 馬
          // 角 → 斜め全方向
          // 馬 → 角 + 上下左右1マス
          const bishopDirs = [[1,1],[1,-1],[-1,1],[-1,-1]];
          bishopDirs.forEach(([dr,dc]) => {
            let r = row + dr;
            let c = col + dc;
            while (r>=0 && r<=8 && c>=0 && c<=8) {
              const t = boardState[r][c];
              if (!t) {
                moves.push({ row: r, col: c });
              } else {
                const [tp, _] = t.split('-');
                if (tp !== player) moves.push({ row: r, col: c });
                break;
              }
              r += dr;
              c += dc;
            }
          });
          if (piece === 'UM') {
            [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => addMove(row+dr, col+dc));
          }
          break;
        case 'HI': // 飛
        case 'RY': // 龍
          // 飛 → 縦横
          // 龍 → 飛 + 斜め1マス
          const rookDirs = [[1,0],[-1,0],[0,1],[0,-1]];
          rookDirs.forEach(([dr,dc]) => {
            let r = row + dr;
            let c = col + dc;
            while (r>=0 && r<=8 && c>=0 && c<=8) {
              const t = boardState[r][c];
              if (!t) {
                moves.push({ row: r, col: c });
              } else {
                const [tp, _] = t.split('-');
                if (tp !== player) moves.push({ row: r, col: c });
                break;
              }
              r += dr;
              c += dc;
            }
          });
          if (piece === 'RY') {
            [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc]) => addMove(row+dr, col+dc));
          }
          break;
        case 'OU': // 王
          [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc]) => {
            addMove(row+dr, col+dc);
          });
          break;
        default:
          break;
      }
      return moves;
    }

    /********************************************************************
     * 10. 手駒を打てるマスの一覧
     ********************************************************************/
    function getPossibleDrops(player, piece) {
      let drops = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!boardState[r][c]) {
            // 空マスなら打てる可能性あり → 二歩, 打不可段などをチェック
            if (!wouldCauseNiFu(player, piece, c) && canDropHere(player, piece, r)) {
              drops.push({ row: r, col: c });
            }
          }
        }
      }
      return drops;
    }

    function wouldCauseNiFu(player, piece, col) {
      if (piece !== 'FU') return false;
      return existsPawnInFile(player, col);
    }

    /********************************************************************
     * 11. リセット
     ********************************************************************/
    function resetGame() {
      boardState = JSON.parse(JSON.stringify(initialBoard));
      hands = { S: {}, G: {} };
      isPlayerSTurn = true;
      clearSelection();

      // 盤操作有効化
      boardElement.style.pointerEvents = '';
      handContainerS.style.pointerEvents = '';
      handContainerG.style.pointerEvents = '';

      // メッセージ閉じる
      closeMessage();
      drawAll();
    }
  </script>
