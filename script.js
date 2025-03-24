let board = null;
let game = new Chess();
let playerColor = 'white';
let aiLevel = 1;

function startGame(color) {
    playerColor = color;
    aiLevel = parseInt(document.getElementById("difficulty").value);
    
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";
    
    board = Chessboard('chessboard', {
        draggable: true,
        position: 'start',
        orientation: playerColor,
        onDrop: handleMove
    });

    if (playerColor === 'black') {
        makeAIMove();
    }
}

function handleMove(source, target) {
    let move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) return 'snapback';

    updateStatus();
    setTimeout(makeAIMove, 250);
}

function makeAIMove() {
    if (game.game_over()) return;

    let bestMove = getBestMove(game, aiLevel);
    game.move(bestMove);

    board.position(game.fen());
    updateStatus();
}

function getBestMove(game, depth) {
    let possibleMoves = game.moves();
    if (possibleMoves.length === 0) return null;

    let bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    if (depth > 1) {
        let bestValue = -Infinity;
        for (let move of possibleMoves) {
            game.move(move);
            let moveValue = minimax(game, depth - 1, false);
            game.undo();

            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
        }
    }

    return bestMove;
}

function minimax(game, depth, isMaximizing) {
    if (depth === 0) return evaluateBoard(game);

    let possibleMoves = game.moves();
    let bestValue = isMaximizing ? -Infinity : Infinity;

    for (let move of possibleMoves) {
        game.move(move);
        let value = minimax(game, depth - 1, !isMaximizing);
        game.undo();

        bestValue = isMaximizing ? Math.max(bestValue, value) : Math.min(bestValue, value);
    }

    return bestValue;
}

function evaluateBoard(game) {
    let evaluation = 0;
    let board = game.board();

    board.forEach(row => {
        row.forEach(piece => {
            if (piece) {
                let value = getPieceValue(piece);
                evaluation += piece.color === 'w' ? value : -value;
            }
        });
    });

    return evaluation;
}

function getPieceValue(piece) {
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    return values[piece.type] || 0;
}

function updateStatus() {
    if (game.in_checkmate()) {
        document.getElementById("status").textContent = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`;
    } else if (game.in_draw()) {
        document.getElementById("status").textContent = "It's a draw!";
    } else {
        document.getElementById("status").textContent = `Turn: ${game.turn() === 'w' ? 'White' : 'Black'}`;
    }
}

function resetGame() {
    game.reset();
    board.position('start');
    updateStatus();

    if (playerColor === 'black') {
        setTimeout(makeAIMove, 500);
    }
}
