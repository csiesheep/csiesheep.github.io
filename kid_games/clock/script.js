// Check login status
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '/index.html';
    }
    return currentUser;
}

document.addEventListener('DOMContentLoaded', () => {
    // Check login status first
    if (!checkLoginStatus()) return;

    let score = 0;
    let questionCounter = 0;
    let currentTime;
    let options;
    let canvas;
    let ctx;
    const TOTAL_QUESTIONS = 10;

    function init() {
        canvas = document.getElementById('clockCanvas');
        ctx = canvas.getContext('2d');
        
        // Add event listeners
        document.querySelectorAll('.option').forEach(button => {
            button.addEventListener('click', checkAnswer);
        });
        
        document.getElementById('next').addEventListener('click', nextQuestion);
        document.getElementById('restart').addEventListener('click', restartGame);
        
        // Start the game
        startNewGame();
    }

    function startNewGame() {
        score = 0;
        questionCounter = 0;
        updateScore();
        updateQuestionCounter();
        nextQuestion();
    }

    function restartGame() {
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = '';
        document.querySelectorAll('.option').forEach(button => {
            button.disabled = false;
            button.classList.remove('selected');
        });
        startNewGame();
    }

    function drawClock(hours, minutes) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Draw clock face
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw numbers
        ctx.font = '20px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for(let i = 1; i <= 12; i++) {
            const angle = (i - 3) * (Math.PI / 6);
            const x = centerX + (radius - 30) * Math.cos(angle);
            const y = centerY + (radius - 30) * Math.sin(angle);
            ctx.fillText(i.toString(), x, y);
        }

        // Draw hour marks
        for(let i = 0; i < 12; i++) {
            const angle = i * Math.PI / 6;
            const startX = centerX + (radius - 15) * Math.cos(angle);
            const startY = centerY + (radius - 15) * Math.sin(angle);
            const endX = centerX + radius * Math.cos(angle);
            const endY = centerY + radius * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw hands
        // Hour hand
        const hourAngle = (hours % 12 + minutes / 60) * 30 * Math.PI / 180 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + radius * 0.5 * Math.cos(hourAngle),
            centerY + radius * 0.5 * Math.sin(hourAngle)
        );
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Minute hand
        const minuteAngle = minutes * 6 * Math.PI / 180 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + radius * 0.7 * Math.cos(minuteAngle),
            centerY + radius * 0.7 * Math.sin(minuteAngle)
        );
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw center dot
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();
    }

    function generateTime() {
        const hours = Math.floor(Math.random() * 12) + 1;
        const minutes = Math.floor(Math.random() * 4) * 15; // Only 00, 15, 30, 45
        return { hours, minutes };
    }

    function formatTime(hours, minutes) {
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    function generateOptions(correctTime) {
        let options = [correctTime];
        while (options.length < 4) {
            const newTime = generateTime();
            const timeString = formatTime(newTime.hours, newTime.minutes);
            if (!options.includes(timeString)) {
                options.push(timeString);
            }
        }
        return options.sort(() => Math.random() - 0.5);
    }

    function nextQuestion() {
        if (questionCounter >= TOTAL_QUESTIONS) {
            showFinalScore();
            return;
        }

        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = '';
        document.getElementById('next').style.display = 'none';
        
        currentTime = generateTime();
        drawClock(currentTime.hours, currentTime.minutes);
        
        const correctTimeString = formatTime(currentTime.hours, currentTime.minutes);
        options = generateOptions(correctTimeString);
        
        const optionButtons = document.querySelectorAll('.option');
        optionButtons.forEach((button, index) => {
            button.textContent = options[index];
            button.disabled = false;
            button.classList.remove('selected');
        });
        
        questionCounter++;
        updateQuestionCounter();
    }

    function checkAnswer(event) {
        const selectedAnswer = event.target.textContent;
        const correctAnswer = formatTime(currentTime.hours, currentTime.minutes);
        const feedback = document.getElementById('feedback');
        
        document.querySelectorAll('.option').forEach(button => {
            button.disabled = true;
            if (button === event.target) {
                button.classList.add('selected');
            }
        });

        if (selectedAnswer === correctAnswer) {
            score++;
            updateScore();
            feedback.textContent = 'Correct!';
            feedback.className = 'correct';
        } else {
            feedback.textContent = `Wrong! The correct time was ${correctAnswer}`;
            feedback.className = 'incorrect';
        }

        if (questionCounter < TOTAL_QUESTIONS) {
            document.getElementById('next').style.display = 'inline-block';
        } else {
            showFinalScore();
        }
    }

    function showFinalScore() {
        const feedback = document.getElementById('feedback');
        feedback.textContent = `Game Over! Final Score: ${score}/${TOTAL_QUESTIONS}`;
        feedback.className = 'correct';
        document.getElementById('next').style.display = 'none';
    }

    function updateScore() {
        document.querySelector('#score span').textContent = score;
    }

    function updateQuestionCounter() {
        document.querySelector('#question-counter span').textContent = questionCounter;
    }

    // Initialize the game when the page loads
    window.addEventListener('load', init);
});
