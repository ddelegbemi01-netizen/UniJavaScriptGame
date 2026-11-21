

// GAME VARIABLES
let xScore = 0;
let oScore = 0;
let drawScore = 0;

const xScoreDisplay = document.getElementById("xScore");
const oScoreDisplay = document.getElementById("oScore");
const drawScoreDisplay = document.getElementById("drawScore");

const statusDisplay = document.getElementById("status");

const restartButton = document.getElementById("restartButton");

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

        statusDisplay.textContent =
            "Player " + currentPlayer + " has won!";

        if (currentPlayer === "X") {
            xScore++;
            xScoreDisplay.textContent = xScore;
        } else {
            oScore++;
            oScoreDisplay.textContent = oScore;
        }

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


// EVENT LISTENERS

cells.forEach(function (cell) {

    cell.addEventListener("click", handleCellClick);

});

restartButton.addEventListener("click", handleRestartGame);