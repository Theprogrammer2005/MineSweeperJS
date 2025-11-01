const BOARD_SIZE = 9;
const MINE_COUNT = 10;
const board = document.getElementById('board');
const messageElement = document.getElementById('message');
const resetButton = document.getElementById('reset-button');
let gameBoard = [];
let isGameOver = false;
let revealedCount = 0;

/**
 * Initializes the game: resets state, creates the grid, and places mines.
 */
function initializeGame() {
    // Reset state
    board.innerHTML = '';
    gameBoard = [];
    isGameOver = false;
    revealedCount = 0;
    messageElement.textContent = 'Click a square to start!';

    // 1. Create the grid array (data model)
    for (let r = 0; r < BOARD_SIZE; r++) {
        gameBoard[r] = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            gameBoard[r][c] = {
                isMine: false,
                isRevealed: false,
                neighborMines: 0,
                element: null // Reference to the DOM element
            };
        }
    }

    // 2. Place mines
    placeMines();

    // 3. Calculate neighbor counts for non-mine cells
    calculateNeighborCounts();

    // 4. Create DOM elements for the board
    createBoardElements();
}

/**
 * Places the specified number of mines randomly on the board.
 */
function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
        const r = Math.floor(Math.random() * BOARD_SIZE);
        const c = Math.floor(Math.random() * BOARD_SIZE);

        if (!gameBoard[r][c].isMine) {
            gameBoard[r][c].isMine = true;
            minesPlaced++;
        }
    }
}

/**
 * Calculates and sets the neighborMines count for every non-mine cell.
 */
function calculateNeighborCounts() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (!gameBoard[r][c].isMine) {
                gameBoard[r][c].neighborMines = countMinesAround(r, c);
            }
        }
    }
}

/**
 * Counts the number of mines in the 8 surrounding cells.
 */
function countMinesAround(row, col) {
    let count = 0;
    // Iterate through the 3x3 grid centered on (row, col)
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue; // Skip the cell itself

            const nr = row + dr; // Neighbor row
            const nc = col + dc; // Neighbor column

            // Check if neighbor is within bounds
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                if (gameBoard[nr][nc].isMine) {
                    count++;
                }
            }
        }
    }
    return count;
}

/**
 * Creates the HTML elements for the board cells and attaches event listeners.
 */
function createBoardElements() {
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 30px)`;
    board.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 30px)`;

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.dataset.row = r;
            cellElement.dataset.col = c;

            // Attach the data model to the DOM element
            gameBoard[r][c].element = cellElement;

            cellElement.addEventListener('click', handleCellClick);

            board.appendChild(cellElement);
        }
    }
}

/**
 * Handles a click on a cell.
 */

function handleCellClick(event) {
    if (isGameOver) return;

    const cellElement = event.target;
    const r = parseInt(cellElement.dataset.row);
    const c = parseInt(cellElement.dataset.col);
    const cell = gameBoard[r][c];

    if (cell.isRevealed) return;

    if (cell.isMine) {
        // Game Over!
        revealAllMines();
        messageElement.textContent = '💥 Game Over! You hit a mine.';
        isGameOver = true;
    } else {
        // Safe click: reveal and possibly cascade
        revealCell(r, c);
        checkWin();
    }
}

/**
 * Recursively reveals a cell and its neighbors if the neighbor count is 0.
 */
function revealCell(r, c) {
    // Basic boundary and state checks
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return;
    const cell = gameBoard[r][c];
    if (cell.isRevealed || cell.isMine) return;

    // Mark as revealed in the data model
    cell.isRevealed = true;
    revealedCount++;

    // Update the DOM element
    const element = cell.element;
    element.classList.add('revealed');

    if (cell.neighborMines > 0) {
        // Show the count
        element.textContent = cell.neighborMines;
        element.dataset.count = cell.neighborMines;
    } else {
        // If count is 0, recursively reveal neighbors (cascade)
        element.textContent = '';
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                revealCell(r + dr, c + dc);
            }
        }
    }
}

/**
 * Reveals all mines when the game is lost.
 */
function revealAllMines() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = gameBoard[r][c];
            if (cell.isMine) {
                cell.element.classList.add('revealed', 'mine');
                cell.element.innerHTML = '💣'; // Bomb emoji
                cell.isRevealed = true;
            }
            // Disable further clicks on all cells
            cell.element.removeEventListener('click', handleCellClick);
        }
    }
}

/**
 * Checks if the player has won the game.
 */
function checkWin() {
    // Win condition: revealed cells = total cells - mine count
    if (revealedCount === (BOARD_SIZE * BOARD_SIZE) - MINE_COUNT) {
        isGameOver = true;
        messageElement.textContent = ' Congratulations! You cleared the board!';
        // Optional: show a green border or other victory visual
        board.style.border = '5px solid green';

        // Remove click listeners
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                gameBoard[r][c].element.removeEventListener('click', handleCellClick);
            }
        }
    }
}

// Event listener for the reset button
resetButton.addEventListener('click', initializeGame);

// Start the game when the page loads
initializeGame();
