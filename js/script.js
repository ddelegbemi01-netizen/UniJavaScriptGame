

// GAME VARIABLES

// Load previously saved scores from localStorage
let xScore = Number(localStorage.getItem("xScore")) || 0;
let oScore = Number(localStorage.getItem("oScore")) || 0;
let drawScore = Number(localStorage.getItem("drawScore")) || 0;

// TOURNAMENT VARIABLES
let xTournamentScore = 0;
let oTournamentScore = 0;
let tournamentActive = true;

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

// TOURNAMENT CHAMPION POPUP
const championPopup = document.getElementById("championPopup");
const championMessage = document.getElementById("championMessage");
const championNewTournament = document.getElementById("championNewTournament");

const cells = document.querySelectorAll(".cell");

// Represents the current state of the game board
let gameState = ["", "", "", "", "", "", "", "", ""];

// Player who starts the game
let currentPlayer = "X";

// Determines whether the game is active
let gameActive = true;


// WINNING COMBINATIONS

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


// INITIAL GAME MESSAGE

statusDisplay.textContent = "Player X's turn";


// HANDLE CELL CLICK

function handleCellClick(event) {

    const clickedCell = event.target;

    const clickedCellIndex = Number(
        clickedCell.getAttribute("data-cell-index")
    );

    // Prevent invalid moves
    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);

    handleResultValidation();

    // Allow the computer to play if the game is still active
    if (
        gameActive &&
        gameModeSelect.value === "computer" &&
        currentPlayer === "O"
    ) {
        setTimeout(handleComputerMove, 500);
    }
}

// UPDATE GAME BOARD

function handleCellPlayed(clickedCell, clickedCellIndex) {

    // Update the JavaScript game state
    gameState[clickedCellIndex] = currentPlayer;

    // Display the player's symbol
    clickedCell.textContent = currentPlayer;

    // Apply the appropriate CSS class
    clickedCell.classList.add(currentPlayer.toLowerCase());
}


// CHECK FOR WIN OR DRAW

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
        // UPDATE TOURNAMENT SCORE
        if (tournamentActive) {
            if (currentPlayer === "X") {
                xTournamentScore++;
                xTournamentScoreDisplay.textContent = xTournamentScore;
            } else {
                oTournamentScore++;
                oTournamentScoreDisplay.textContent = oTournamentScore;
            }

            // CHECK IF A PLAYER HAS WON THE TOURNAMENT
            if (xTournamentScore === 2 || oTournamentScore === 2) {
                tournamentActive = false;

                const champion = xTournamentScore === 2 ? "Player X" : "Player O";
                championMessage.textContent = champion + " IS THE CHAMPION!";
                championPopup.showModal();
            } else {
                tournamentStatus.textContent =
                    "Tournament progress: X " + xTournamentScore +
                    " - " + oTournamentScore + " O";
            }
        }
        // Save scores in the browser`
        localStorage.setItem("xScore", xScore);
        localStorage.setItem("oScore", oScore);
        localStorage.setItem("drawScore", drawScore);
        localStorage.setItem("xTournamentScore", xTournamentScore);
        localStorage.setItem("oTournamentScore", oTournamentScore);

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

        // Save draw score in the browser
        localStorage.setItem("drawScore", drawScore);

        gameActive = false;
        return;
    }

    handlePlayerChange();
}


// CHANGE ACTIVE PLAYER

function handlePlayerChange() {

    currentPlayer = currentPlayer === "X" ? "O" : "X";

    statusDisplay.textContent =
        "Player " + currentPlayer + "'s turn";
}


// RESTART GAME

function handleRestartGame() {

    gameState = ["", "", "", "", "", "", "", "", ""];

    currentPlayer = "X";

    gameActive = true;

    statusDisplay.textContent = "Player X's turn";

    // Clear every cell
    cells.forEach(function (cell) {

        cell.textContent = "";

        cell.classList.remove("x", "o", "winning-cell");

    });
}

// COMPUTER PLAYER

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

// INTELLIGENT COMPUTER PLAYER

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

    // 1. Check whether the computer can win
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

    // 2. Block the human player from winning
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

    // 3. Take the centre square if available
    if (computerMove === -1 && gameState[4] === "") {
        computerMove = 4;
    }

    // 4. Choose an available corner
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

    // 5. Choose any remaining available square
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

    // Play the computer's move
    if (computerMove !== -1) {

        handleCellPlayed(cells[computerMove], computerMove);

        handleResultValidation();

    }
}
// MINIMAX ALGORITHM – HARD DIFFICULTY

function minimax(board, depth, isMaximizing) {

    // Check if the computer has won
    if (checkWinner(board, "O")) {
        return 10 - depth;
    }

    // Check if the human player has won
    if (checkWinner(board, "X")) {
        return depth - 10;
    }

    // Check for a draw
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


// CHECK WHETHER A PLAYER HAS WON
function checkWinner(board, player) {

    return winningConditions.some(function (condition) {

        return condition.every(function (index) {
            return board[index] === player;
        });

    });
}
// EVENT LISTENERS


// Listen for clicks on the game board
cells.forEach(function (cell) {
    cell.addEventListener("click", handleCellClick);
});

// Listen for restart button clicks
restartButton.addEventListener("click", handleRestartGame);

// Reset the game when the game mode changes
gameModeSelect.addEventListener("change", handleRestartGame);
// CLOSE WINNER POPUP AND RESTART GAME

playAgainButton.addEventListener("click", function () {
    winnerPopup.close();
    handleRestartGame();
});
// START A NEW TOURNAMENT
newTournamentButton.addEventListener("click", function () {
    xTournamentScore = 0;
    oTournamentScore = 0;

    xTournamentScoreDisplay.textContent = 0;
    oTournamentScoreDisplay.textContent = 0;

    tournamentActive = true;

    tournamentStatus.textContent = "First to 2 wins becomes champion!";

    if (winnerPopup.open) {
        winnerPopup.close();
    }

    handleRestartGame();
});
// CHAMPION POPUP PLAY AGAIN BUTTON
championNewTournament.addEventListener("click", function () {
    championPopup.close();

    xTournamentScore = 0;
    oTournamentScore = 0;

    xTournamentScoreDisplay.textContent = 0;
    oTournamentScoreDisplay.textContent = 0;

    tournamentActive = true;

    tournamentStatus.textContent = "First to 2 wins becomes champion!";

    handleRestartGame();
});