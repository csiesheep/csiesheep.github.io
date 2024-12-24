let currentLevel = '';
let score = 0;
let correctAnswer = 0;

// Get DOM elements
const equationElement = document.getElementById('equation');
const choicesContainer = document.getElementById('choices');
const scoreElement = document.getElementById('score');
const resultElement = document.getElementById('result');

// Check login status
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '/index.html';
    }
    return currentUser;
}

// Add event listeners to level buttons
document.getElementById('easy').addEventListener('click', () => startGame('easy'));
document.getElementById('medium').addEventListener('click', () => startGame('medium'));
document.getElementById('hard').addEventListener('click', () => startGame('hard'));

function startGame(level) {
    if (!checkLoginStatus()) return;
    
    currentLevel = level;
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    generateQuestion();
}

function generateQuestion() {
    let num1, num2, num3, operator1, operator2;
    let equation = '';

    switch(currentLevel) {
        case 'easy':
            // One-digit addition or subtraction
            num1 = Math.floor(Math.random() * 9) + 1;
            num2 = Math.floor(Math.random() * 9) + 1;
            operator1 = Math.random() < 0.5 ? '+' : '-';
            
            if (operator1 === '-' && num1 < num2) {
                [num1, num2] = [num2, num1]; // Swap numbers to avoid negative results
            }
            
            equation = `${num1} ${operator1} ${num2}`;
            correctAnswer = operator1 === '+' ? num1 + num2 : num1 - num2;
            break;

        case 'medium':
            // Two-digit addition or subtraction
            num1 = Math.floor(Math.random() * 90) + 10;
            num2 = Math.floor(Math.random() * 90) + 10;
            operator1 = Math.random() < 0.5 ? '+' : '-';
            
            if (operator1 === '-' && num1 < num2) {
                [num1, num2] = [num2, num1];
            }
            
            equation = `${num1} ${operator1} ${num2}`;
            correctAnswer = operator1 === '+' ? num1 + num2 : num1 - num2;
            break;

        case 'hard':
            // Two-digit calculation with two operations
            num1 = Math.floor(Math.random() * 90) + 10;
            num2 = Math.floor(Math.random() * 90) + 10;
            num3 = Math.floor(Math.random() * 90) + 10;
            operator1 = Math.random() < 0.5 ? '+' : '-';
            operator2 = Math.random() < 0.5 ? '+' : '-';
            
            equation = `${num1} ${operator1} ${num2} ${operator2} ${num3}`;
            
            // Calculate the result
            let intermediateResult;
            if (operator1 === '+') {
                intermediateResult = num1 + num2;
            } else {
                intermediateResult = num1 - num2;
            }
            
            if (operator2 === '+') {
                correctAnswer = intermediateResult + num3;
            } else {
                correctAnswer = intermediateResult - num3;
            }
            break;
    }

    equationElement.textContent = `${equation} = ?`;
    generateChoices(correctAnswer);
}

function generateChoices(correct) {
    // Generate 3 wrong answers that are close to the correct answer
    let choices = [correct];
    
    while (choices.length < 4) {
        let offset = Math.floor(Math.random() * 10) - 5;
        let wrongAnswer = correct + offset;
        
        if (!choices.includes(wrongAnswer) && wrongAnswer >= 0) {
            choices.push(wrongAnswer);
        }
    }

    // Shuffle the choices
    choices.sort(() => Math.random() - 0.5);

    // Clear previous choices
    choicesContainer.innerHTML = '';

    // Create buttons for each choice
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.onclick = () => checkAnswer(choice);
        choicesContainer.appendChild(button);
    });
}

function saveGameScore() {
    const currentUser = checkLoginStatus();
    if (!currentUser) return;

    // Call the addGameScore function from the main page
    if (window.parent.addGameScore) {
        window.parent.addGameScore('Addition and Subtraction', score);
    } else {
        // Fallback if the game is not in an iframe
        const history = JSON.parse(localStorage.getItem(`gameHistory_${currentUser.username}`) || '[]');
        history.push({
            date: new Date().toISOString(),
            game: 'Addition and Subtraction',
            score: score
        });
        localStorage.setItem(`gameHistory_${currentUser.username}`, JSON.stringify(history));
    }
}

function checkAnswer(selectedAnswer) {
    if (selectedAnswer === correctAnswer) {
        score += 10;
        resultElement.textContent = 'Correct!';
        resultElement.style.color = 'green';
    } else {
        score = Math.max(0, score - 5);
        resultElement.textContent = 'Wrong! Try again.';
        resultElement.style.color = 'red';
    }
    
    scoreElement.textContent = `Score: ${score}`;
    saveGameScore();
    
    // Generate a new question after a short delay
    setTimeout(generateQuestion, 1000);
}

// Initialize login check when the page loads
document.addEventListener('DOMContentLoaded', checkLoginStatus);
