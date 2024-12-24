let currentLevel = '';
let score = 0;
let correctAnswer = 0;

// Get DOM elements
const equationElement = document.getElementById('equation');
const choicesContainer = document.getElementById('choices');
const scoreElement = document.getElementById('score');

// Add event listeners to level buttons
document.getElementById('easy').addEventListener('click', () => startGame('easy'));
document.getElementById('medium').addEventListener('click', () => startGame('medium'));
document.getElementById('hard').addEventListener('click', () => startGame('hard'));

function startGame(level) {
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

    // Update the choice buttons
    const choiceButtons = choicesContainer.getElementsByClassName('choice-btn');
    for (let i = 0; i < choiceButtons.length; i++) {
        choiceButtons[i].textContent = choices[i];
        choiceButtons[i].disabled = false;
        choiceButtons[i].onclick = () => checkAnswer(choices[i]);
    }
}

function checkAnswer(selectedAnswer) {
    if (selectedAnswer === correctAnswer) {
        score++;
        scoreElement.textContent = `Score: ${score}`;
        alert('Correct! 🎉');
    } else {
        alert(`Wrong! The correct answer was ${correctAnswer}`);
    }

    // Generate a new question
    generateQuestion();
}
