

// These variables store the scores and the current game settings.

// Load the scores saved in the browser, if there are any.
let xScore = Number(localStorage.getItem("xScore")) || 0;
let oScore = Number(localStorage.getItem("oScore")) || 0;
let drawScore = Number(localStorage.getItem("drawScore")) || 0;

// These variables keep track of the tournament progress.
let xTournamentScore = Number(localStorage.getItem("xTournamentScore")) || 0;
let oTournamentScore = Number(localStorage.getItem("oTournamentScore")) || 0;
let tournamentActive = xTournamentScore < 2 && oTournamentScore < 2;

const xTournamentScoreDisplay = document.getElementById("xTournamentScore");
const oTournamentScoreDisplay = document.getElementById("oTournamentScore");
const tournamentStatus = document.getElementById("tournamentStatus");
const newTournamentButton = document.getElementById("newTournamentButton");

const xScoreDisplay = document.getElementById("xScore");
const oScoreDisplay = document.getElementById("oScore");
const drawScoreDisplay = document.getElementById("drawScore");
const gameModeSelect = document.getElementById("gameMode");
const difficultySelect = document.getElementById("difficulty");

const statusDisplay = document.getElementById("status");

const restartButton = document.getElementById("restartButton");
const winnerPopup = document.getElementById("winnerPopup");
const winnerMessage = document.getElementById("winnerMessage");
const playAgainButton = document.getElementById("playAgainButton");

// Get the elements used to show the tournament winner.
const championPopup = document.getElementById("championPopup");
const championMessage = document.getElementById("championMessage");
const championNewTournament = document.getElementById("championNewTournament");

const cells = document.querySelectorAll(".cell");

// This array stores the value in each square on the board.
let gameState = ["", "", "", "", "", "", "", "", ""];

// CHAMPION'S TWO-MOVE UNDO SYSTEM

// Stores every move made during the current game
let moveHistory = [];

// Stores the previous tournament champion (X or O)
const savedChampion = localStorage.getItem("previousChampion");
let previousChampion = savedChampion === "X" || savedChampion === "O"
    ? savedChampion
    : null;

if (previousChampion === null && !tournamentActive) {
    previousChampion = xTournamentScore === 2 ? "X" : "O";
}

// Tracks whether the champion can still use their special ability
let championUndoAvailable = false;

// Identifies which player owns the undo ability
let championPlayer = null;

const championUndoButton = document.getElementById("championUndoButton");
const undoStatus = document.getElementById("undoStatus");

function saveTournamentState() {
    localStorage.setItem("xTournamentScore", xTournamentScore);
    localStorage.setItem("oTournamentScore", oTournamentScore);

    if (previousChampion !== null) {
        localStorage.setItem("previousChampion", previousChampion);
    }
}

// X always starts a new game.
let currentPlayer = "X";

// This is false when the round has finished.
let gameActive = true;
let computerMoveTimeout = null;


// These are all the possible winning lines on the board.

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];


// Show the message for the first player's turn.

statusDisplay.textContent = "Player X's turn";
xScoreDisplay.textContent = xScore;
oScoreDisplay.textContent = oScore;
drawScoreDisplay.textContent = drawScore;
xTournamentScoreDisplay.textContent = xTournamentScore;
oTournamentScoreDisplay.textContent = oTournamentScore;

if (!tournamentActive) {
    tournamentStatus.textContent =
        "Tournament complete: Player " + previousChampion + " is champion.";
} else if (xTournamentScore > 0 || oTournamentScore > 0) {
    tournamentStatus.textContent =
        "Tournament progress: X " + xTournamentScore +
        " - " + oTournamentScore + " O";
}


// Handle a click on one of the game squares.

function handleCellClick(event) {

    const clickedCell = event.target;

    const clickedCellIndex = Number(
        clickedCell.getAttribute("data-cell-index")
    );

    // Do not allow a used square or a finished game to be played.
    if (
        gameState[clickedCellIndex] !== "" ||
        !gameActive ||
        (gameModeSelect.value === "computer" && currentPlayer === "O")
    ) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);

    handleResultValidation();

    // Let the computer take its turn when the game is still running.
    if (
        gameActive &&
        gameModeSelect.value === "computer" &&
        currentPlayer === "O"
    ) {
        computerMoveTimeout = setTimeout(handleComputerMove, 500);
    }
}

// Put the current player's mark in the selected square.

function handleCellPlayed(clickedCell, clickedCellIndex) {

    // Save the move in the game state array.
    gameState[clickedCellIndex] = currentPlayer;

    // Record the move for the champion's undo ability
    moveHistory.push({
        player: currentPlayer,
        index: clickedCellIndex
    });

    // Show the player's mark on the page.
    clickedCell.textContent = currentPlayer;
    clickedCell.setAttribute(
        "aria-label",
        "Player " + currentPlayer + " played in board square " +
        (clickedCellIndex + 1)
    );

    // Add a class so the mark gets the correct colour.
    clickedCell.classList.add(currentPlayer.toLowerCase());
}


// Check whether the round has been won or drawn.

function handleResultValidation() {
    let roundWon = false;
    let winningCombination = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];

        const a = gameState[winCondition[0]];
        const b = gameState[winCondition[1]];
        const c = gameState[winCondition[2]];

        if (a === "" || b === "" || c === "") {
            continue;
        }

        if (a === b && b === c) {
            roundWon = true;
            winningCombination = winCondition;
            break;
        }
    }

    if (roundWon) {

        winnerMessage.textContent = "Player " + currentPlayer + " WON!";
        winnerPopup.showModal();

        if (currentPlayer === "X") {
            xScore++;
            xScoreDisplay.textContent = xScore;
        } else {
            oScore++;
            oScoreDisplay.textContent = oScore;
        }
        // Add this result to the tournament score.
        if (tournamentActive) {
            if (currentPlayer === "X") {
                xTournamentScore++;
                xTournamentScoreDisplay.textContent = xTournamentScore;
            } else {
                oTournamentScore++;
                oTournamentScoreDisplay.textContent = oTournamentScore;
            }

            // Check whether this result has decided the tournament.
            if (xTournamentScore === 2 || oTournamentScore === 2) {
                tournamentActive = false;

                const champion = xTournamentScore === 2 ? "Player X" : "Player O";
                // Remember the champion for the next tournament
                previousChampion = xTournamentScore === 2 ? "X" : "O";
                localStorage.setItem("previousChampion", previousChampion);

                championMessage.textContent = champion + " IS THE CHAMPION!";
                championPopup.showModal();
                tournamentStatus.textContent =
                    champion + " wins the tournament!";
            } else {
                tournamentStatus.textContent =
                    "Tournament progress: X " + xTournamentScore +
                    " - " + oTournamentScore + " O";
            }
        }
        // Save the updated scores in the browser.
        localStorage.setItem("xScore", xScore);
        localStorage.setItem("oScore", oScore);
        localStorage.setItem("drawScore", drawScore);
        saveTournamentState();

        winningCombination.forEach(function (index) {
            cells[index].classList.add("winning-cell");
        });

        gameActive = false;
        return;
    }

    let roundDraw = !gameState.includes("");

    if (roundDraw) {

        statusDisplay.textContent = "Game ended in a draw!";

        drawScore++;
        drawScoreDisplay.textContent = drawScore;

        // Save the updated draw score in the browser.
        localStorage.setItem("drawScore", drawScore);

        gameActive = false;
        return;
    }

    handlePlayerChange();
}


// Change to the other player's turn.

function handlePlayerChange() {

    currentPlayer = currentPlayer === "X" ? "O" : "X";

    statusDisplay.textContent =
        "Player " + currentPlayer + "'s turn";
}


// Reset the board without removing the scores.

function handleRestartGame() {

    clearTimeout(computerMoveTimeout);
    computerMoveTimeout = null;

    // Clear move history for the new game
    moveHistory = [];

    gameState = ["", "", "", "", "", "", "", "", ""];

    currentPlayer = "X";

    gameActive = true;

    statusDisplay.textContent = "Player X's turn";

    // Remove the marks and winning styles from every square.
    cells.forEach(function (cell) {

        cell.textContent = "";
        cell.setAttribute(
            "aria-label",
            "Empty board square " +
            (Number(cell.getAttribute("data-cell-index")) + 1)
        );

        cell.classList.remove("x", "o", "winning-cell");

    });
}
// CHAMPION'S TWO-MOVE UNDO
function handleChampionUndo() {

    // Check that the ability is available
    if (!championUndoAvailable || !gameActive || championPlayer === null) {
        return;
    }

    // Two moves must exist to undo
    if (moveHistory.length < 2) {
        undoStatus.textContent =
            "There are not enough moves to undo.";
        return;
    }

    // Cancel any computer move that is waiting
    clearTimeout(computerMoveTimeout);
    computerMoveTimeout = null;

    // Reverse the last two moves
    const undoneMoves = moveHistory.splice(-2, 2);

    undoneMoves.forEach(function (move) {
        gameState[move.index] = "";
        cells[move.index].textContent = "";
        cells[move.index].setAttribute(
            "aria-label",
            "Empty board square " + (move.index + 1)
        );

        cells[move.index].classList.remove(
            "x",
            "o",
            "winning-cell"
        );
    });

    // Restore the player whose turn it was
    currentPlayer = undoneMoves[0].player;

    gameActive = true;

    statusDisplay.textContent =
        "Player " + currentPlayer + "'s turn";

    // Use up the champion's ability
    championUndoAvailable = false;
    championUndoButton.disabled = true;
    championUndoButton.textContent = "Undo Last Two Moves";

    undoStatus.textContent =
        "Player " + championPlayer +
        " has used their Two-Move Undo!";

    // Allow the computer to move if O is next
    if (
        gameModeSelect.value === "computer" &&
        currentPlayer === "O"
    ) {
        computerMoveTimeout = setTimeout(handleComputerMove, 500);
    }
}
// Make a random move for the easy computer level.

function handleEasyComputerMove() {
    const availableCells = gameState
        .map((value, index) => value === "" ? index : null)
        .filter(index => index !== null);

    if (availableCells.length === 0) {
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const chosenCell = availableCells[randomIndex];

    handleCellPlayed(cells[chosenCell], chosenCell);
    handleResultValidation();
}

// Choose a move for the medium or hard computer level.

function handleComputerMove() {

    if (!gameActive || gameModeSelect.value !== "computer") {
        return;
    }

    if (difficultySelect.value === "easy") {
        handleEasyComputerMove();
        return;
    }
    let computerMove = -1;

    if (difficultySelect.value === "hard") {
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === "") {
                gameState[i] = "O";

                const score = minimax(gameState, 0, false);

                gameState[i] = "";

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        if (bestMove !== -1) {
            handleCellPlayed(cells[bestMove], bestMove);
            handleResultValidation();
        }

        return;
    }

    // First, check whether the computer can win this turn.
    for (let condition of winningConditions) {

        const [a, b, c] = condition;

        if (
            gameState[a] === "O" &&
            gameState[b] === "O" &&
            gameState[c] === ""
        ) {
            computerMove = c;
            break;
        }

        if (
            gameState[a] === "O" &&
            gameState[c] === "O" &&
            gameState[b] === ""
        ) {
            computerMove = b;
            break;
        }

        if (
            gameState[b] === "O" &&
            gameState[c] === "O" &&
            gameState[a] === ""
        ) {
            computerMove = a;
            break;
        }
    }

    // Next, block the human player if they are about to win.
    if (computerMove === -1) {

        for (let condition of winningConditions) {

            const [a, b, c] = condition;

            if (
                gameState[a] === "X" &&
                gameState[b] === "X" &&
                gameState[c] === ""
            ) {
                computerMove = c;
                break;
            }

            if (
                gameState[a] === "X" &&
                gameState[c] === "X" &&
                gameState[b] === ""
            ) {
                computerMove = b;
                break;
            }

            if (
                gameState[b] === "X" &&
                gameState[c] === "X" &&
                gameState[a] === ""
            ) {
                computerMove = a;
                break;
            }
        }
    }

    // The centre is a useful move if it is still empty.
    if (computerMove === -1 && gameState[4] === "") {
        computerMove = 4;
    }

    // If possible, choose one of the corner squares.
    if (computerMove === -1) {

        const corners = [0, 2, 6, 8];

        const availableCorners = corners.filter(function (index) {
            return gameState[index] === "";
        });

        if (availableCorners.length > 0) {

            computerMove = availableCorners[
                Math.floor(Math.random() * availableCorners.length)
            ];

        }
    }

    // Otherwise, choose any square that is still empty.
    if (computerMove === -1) {

        const availableCells = [];

        gameState.forEach(function (cell, index) {

            if (cell === "") {
                availableCells.push(index);
            }

        });

        if (availableCells.length > 0) {

            computerMove = availableCells[
                Math.floor(Math.random() * availableCells.length)
            ];

        }
    }

    // Display the computer's chosen move and check the result.
    if (computerMove !== -1) {

        handleCellPlayed(cells[computerMove], computerMove);

        handleResultValidation();

    }
}
// Use minimax to choose the best move for hard difficulty.

function minimax(board, depth, isMaximizing) {

    // Return a positive score if the computer has won.
    if (checkWinner(board, "O")) {
        return 10 - depth;
    }

    // Return a negative score if the human player has won.
    if (checkWinner(board, "X")) {
        return depth - 10;
    }

    // Return zero when there are no moves left.
    if (!board.includes("")) {
        return 0;
    }

    if (isMaximizing) {

        let bestScore = -Infinity;

        for (let i = 0; i < board.length; i++) {

            if (board[i] === "") {

                board[i] = "O";

                let score = minimax(board, depth + 1, false);

                board[i] = "";

                bestScore = Math.max(score, bestScore);
            }
        }

        return bestScore;

    } else {

        let bestScore = Infinity;

        for (let i = 0; i < board.length; i++) {

            if (board[i] === "") {

                board[i] = "X";

                let score = minimax(board, depth + 1, true);

                board[i] = "";

                bestScore = Math.min(score, bestScore);
            }
        }

        return bestScore;
    }
}


// Check whether a player has completed a winning line.
function checkWinner(board, player) {

    return winningConditions.some(function (condition) {

        return condition.every(function (index) {
            return board[index] === player;
        });

    });
}
// Connect the buttons and squares to their functions.


// Run the move function when a square is clicked.
cells.forEach(function (cell) {
    cell.addEventListener("click", handleCellClick);
});

// Restart the game when the restart button is clicked.
restartButton.addEventListener("click", handleRestartGame);

// Start a fresh round when the game mode changes.
gameModeSelect.addEventListener("change", handleRestartGame);
// Close the winner message and start another round.

playAgainButton.addEventListener("click", function () {
    winnerPopup.close();
    handleRestartGame();
});
// Reset the tournament and begin a new one.
newTournamentButton.addEventListener("click", function () {
    xTournamentScore = 0;
    oTournamentScore = 0;

    xTournamentScoreDisplay.textContent = 0;
    oTournamentScoreDisplay.textContent = 0;

    tournamentActive = true;

    // Activate the previous champion's special ability
    if (previousChampion !== null) {
        championPlayer = previousChampion;
        championUndoAvailable = true;

        undoStatus.textContent =
            "Player " + championPlayer +
            " has one Two-Move Undo available!";

        championUndoButton.disabled = false;
        championUndoButton.textContent =
            "Player " + championPlayer + ": Undo Last Two Moves";
    } else {
        championUndoButton.disabled = true;
        championUndoButton.textContent = "Undo Last Two Moves";
    }

    tournamentStatus.textContent = "First to 2 wins becomes champion!";
    saveTournamentState();

    if (winnerPopup.open) {
        winnerPopup.close();
    }

    handleRestartGame();
});
// Start another tournament when the play again button is clicked.
championNewTournament.addEventListener("click", function () {
    championPopup.close();

    if (winnerPopup.open) {
        winnerPopup.close();
    }
    xTournamentScore = 0;
    oTournamentScore = 0;

    xTournamentScoreDisplay.textContent = 0;
    oTournamentScoreDisplay.textContent = 0;

    tournamentActive = true;

    // Activate the previous champion's special ability
    if (previousChampion !== null) {
        championPlayer = previousChampion;
        championUndoAvailable = true;

        undoStatus.textContent =
            "Player " + championPlayer +
            " has one Two-Move Undo available!";

        championUndoButton.disabled = false;
        championUndoButton.textContent =
            "Player " + championPlayer + ": Undo Last Two Moves";
    } else {
        undoStatus.textContent =
            "The champion's special ability will appear here.";

        championUndoButton.disabled = true;
        championUndoButton.textContent = "Undo Last Two Moves";
    }

    tournamentStatus.textContent = "First to 2 wins becomes champion!";
    saveTournamentState();


    handleRestartGame();
});
// CHAMPION'S UNDO BUTTON
championUndoButton.addEventListener("click", handleChampionUndo);
// Reset the lifetime scoreboard.
document.getElementById("resetScoreboardButton")
    .addEventListener("click", function () {

        const confirmReset = confirm(
            "Are you sure you want to reset the lifetime scoreboard?"
        );

        if (!confirmReset) {
            return;
        }

        xScore = 0;
        oScore = 0;
        drawScore = 0;

        localStorage.setItem("xScore", xScore);
        localStorage.setItem("oScore", oScore);
        localStorage.setItem("drawScore", drawScore);

        document.getElementById("xScore").textContent = xScore;
        document.getElementById("oScore").textContent = oScore;
        document.getElementById("drawScore").textContent = drawScore;
    });
// GAME RULES POPUP

const rulesPopup = document.getElementById("rulesPopup");
const rulesButton = document.getElementById("rulesButton");
const closeRulesButton = document.getElementById("closeRulesButton");

// Show the rules automatically on the first visit.
if (localStorage.getItem("rulesSeen") !== "true") {
    rulesPopup.showModal();
    rulesPopup.scrollTop = 0;

    localStorage.setItem("rulesSeen", "true");
}

// Open the rules when the Rules button is clicked.
rulesButton.addEventListener("click", function () {
    rulesPopup.showModal();
    rulesPopup.scrollTop = 0;
});

// Close the rules when Start Playing is clicked.
closeRulesButton.addEventListener("click", function () {
    rulesPopup.close();
});