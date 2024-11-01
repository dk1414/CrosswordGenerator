const apiUrl = "https://crossword-endpoint-5815431822.us-central1.run.app/generate"; 


let currentPuzzle = [];
let currentClues = [];
let correctPuzzle = [];

// DOM Elements
const generateBtn = document.getElementById("generate-btn");
const checkBtn = document.getElementById("check-btn");
const revealBtn = document.getElementById("reveal-btn"); // New Element
const puzzleContainer = document.getElementById("puzzle");
const acrossCluesContainer = document.getElementById("across-clues");
const downCluesContainer = document.getElementById("down-clues");
const resultContainer = document.getElementById("result");
const loadingIndicator = document.getElementById("loading");
const toggleSwitch = document.getElementById("toggle-switch");

// Event Listeners
generateBtn.addEventListener("click", generatePuzzle);
checkBtn.addEventListener("click", checkAnswers);
revealBtn.addEventListener("click", revealAnswers); // New Listener
document.addEventListener("keydown", handleKeyDown);

// Initialize with a blank puzzle
window.onload = () => {
    renderPuzzle(createEmptyPuzzle(5, 5));
};

// Dark Mode Toggle
toggleSwitch.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", toggleSwitch.checked);
});

// Generate Puzzle Function
async function generatePuzzle() {
    try {
        showLoading(true);
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();

        currentPuzzle = data.puzzle;
        currentClues = data.clues;
        correctPuzzle = data.puzzle; // Store correct answers

        renderPuzzle(currentPuzzle);
        renderClues(currentClues);
        resultContainer.textContent = "";
        resultContainer.classList.remove("success", "error");
    } catch (error) {
        console.error("Error fetching puzzle:", error);
        alert("Failed to load puzzle. Please try again later.");
    } finally {
        showLoading(false);
    }
}

// Reveal Answers Function
function revealAnswers() {
    if (correctPuzzle.length === 0) {
        alert("Please generate a puzzle first!");
        return;
    }

    const inputs = document.querySelectorAll("#puzzle input");
    inputs.forEach(input => {
        const row = parseInt(input.getAttribute("data-row"));
        const col = parseInt(input.getAttribute("data-col"));
        const correctLetter = correctPuzzle[row][col].toUpperCase();
        input.value = correctLetter;
        input.style.backgroundColor = "var(--correct-bg)"; // Indicate correct answer
    });

    resultContainer.textContent = "✅ All answers revealed!";
    resultContainer.classList.add("success");
    resultContainer.classList.remove("error");
}

// Create an empty puzzle grid
function createEmptyPuzzle(rows, cols) {
    const empty = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push("");
        }
        empty.push(row);
    }
    return empty;
}

// Render Puzzle Function
function renderPuzzle(puzzle) {
    puzzleContainer.innerHTML = "";

    puzzle.forEach((row, rowIndex) => {
        row.forEach((letter, colIndex) => {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            const input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("maxlength", "1");
            input.setAttribute("data-row", rowIndex);
            input.setAttribute("data-col", colIndex);
            input.setAttribute("placeholder", " ");

            // Event Listener for Input Event
            input.addEventListener("input", () => {
                input.value = input.value.toUpperCase();
            });

            // Event Listener for Focus Event
            input.addEventListener("focus", () => {
                highlightClues(rowIndex, colIndex);
            });

            // Event Listener for Keydown Event (Handle Backspace and Delete)
            input.addEventListener("keydown", (event) => {
                if (event.key === "Backspace" || event.key === "Delete") {
                    // Prevent default behavior to ensure consistent clearing
                    event.preventDefault();
                    input.value = "";
                    input.style.backgroundColor = ""; // Reset background color
                }
            });

            cell.appendChild(input);
            puzzleContainer.appendChild(cell);
        });
    });

    // Automatically focus the first input
    const firstInput = puzzleContainer.querySelector("input");
    if (firstInput) {
        firstInput.focus();
        setCursorToEnd(firstInput); // Ensure cursor is at the end
    }
}

// Render Clues Function
function renderClues(clues) {
    const [acrossClues, downClues] = clues;

    acrossCluesContainer.innerHTML = acrossClues
        .map((clue, index) => `<li><strong>${index + 1}.</strong> ${clue}</li>`)
        .join("");

    downCluesContainer.innerHTML = downClues
        .map((clue, index) => `<li><strong>${index + 1}.</strong> ${clue}</li>`)
        .join("");
}

// Check Answers Function
function checkAnswers() {
    const inputs = document.querySelectorAll("#puzzle input");
    let allCorrect = true;

    inputs.forEach(input => {
        const row = parseInt(input.getAttribute("data-row"));
        const col = parseInt(input.getAttribute("data-col"));
        const correctLetter = correctPuzzle[row][col].toUpperCase();
        const userLetter = input.value.toUpperCase();

        if (userLetter === correctLetter) {
            input.style.backgroundColor = "var(--correct-bg)"; // Green for correct
        } else if (userLetter !== "") {
            input.style.backgroundColor = "var(--incorrect-bg)"; // Red for incorrect
            allCorrect = false;
        } else {
            input.style.backgroundColor = ""; // Reset if empty
            allCorrect = false;
        }
    });

    if (allCorrect) {
        resultContainer.textContent = "🎉 Congratulations! You completed the puzzle correctly!";
        resultContainer.classList.add("success");
        resultContainer.classList.remove("error");
    } else {
        resultContainer.textContent = "❌ Some answers are incorrect. Please try again.";
        resultContainer.classList.add("error");
        resultContainer.classList.remove("success");
    }
}

// Handle Arrow Keys Navigation
function handleKeyDown(event) {
    const activeElement = document.activeElement;
    if (activeElement.tagName.toLowerCase() !== 'input') return;

    const key = event.key;
    const row = parseInt(activeElement.getAttribute("data-row"));
    const col = parseInt(activeElement.getAttribute("data-col"));

    let targetRow = row;
    let targetCol = col;

    switch (key) {
        case 'ArrowUp':
            targetRow = row > 0 ? row - 1 : row;
            break;
        case 'ArrowDown':
            targetRow = row < 4 ? row + 1 : row;
            break;
        case 'ArrowLeft':
            targetCol = col > 0 ? col - 1 : col;
            break;
        case 'ArrowRight':
            targetCol = col < 4 ? col + 1 : col;
            break;
        case 'Enter':
            event.preventDefault(); // Prevent form submission if inside a form
            checkAnswers();
            return;
        default:
            return; // Do nothing for other keys
    }

    const targetInput = puzzleContainer.querySelector(`input[data-row="${targetRow}"][data-col="${targetCol}"]`);
    if (targetInput) {
        targetInput.focus();
        setCursorToEnd(targetInput); // Ensure cursor is at the end
    }
}

// Highlight Clues Function (Simplified Mapping)
function highlightClues(row, col) {
    const acrossClues = acrossCluesContainer.children;
    const downClues = downCluesContainer.children;

    // Remove existing highlights
    Array.from(acrossClues).forEach(clue => clue.style.backgroundColor = "");
    Array.from(downClues).forEach(clue => clue.style.backgroundColor = "");

    // Simple mapping based on position
    // Adjust this logic based on your actual puzzle and clue associations

    // Example: Assume each row corresponds to an Across clue and each column to a Down clue
    if (row >= 0 && row < 5) {
        acrossClues[row].style.backgroundColor = "#b2dfdb"; // Light teal
    }

    if (col >= 0 && col < 5) {
        downClues[col].style.backgroundColor = "#b2dfdb"; // Light teal
    }
}

// Show or Hide Loading Indicator
function showLoading(isLoading) {
    if (isLoading) {
        loadingIndicator.classList.remove("hidden");
        generateBtn.disabled = true;
        checkBtn.disabled = true;
        revealBtn.disabled = true; // Disable Reveal button during loading
    } else {
        loadingIndicator.classList.add("hidden");
        generateBtn.disabled = false;
        checkBtn.disabled = false;
        revealBtn.disabled = false; // Enable Reveal button after loading
    }
}

// Utility Function to Set Cursor to End of Input
function setCursorToEnd(input) {
    const len = input.value.length;
    input.setSelectionRange(len, len);
}
