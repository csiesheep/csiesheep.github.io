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

    const canvas = document.getElementById('clockCanvas');
    const ctx = canvas.getContext('2d');
    const options = document.querySelectorAll('.option');
    const nextButton = document.getElementById('next');
    const feedback = document.getElementById('feedback');
    const scoreElement = document.querySelector('#score span');
    let score = 0;
    let currentTime = null;

    function drawClock(hours, minutes) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw clock face
        ctx.beginPath();
        ctx.arc(100, 100, 90, 0, 2 * Math.PI);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw center dot
        ctx.beginPath();
        ctx.arc(100, 100, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();
        
        // Draw hour marks
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6 - Math.PI / 2;
            const startX = 100 + 80 * Math.cos(angle);
            const startY = 100 + 80 * Math.sin(angle);
            const endX = 100 + 90 * Math.cos(angle);
            const endY = 100 + 90 * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // Draw hands
        // Hour hand
        const hourAngle = (hours % 12 + minutes / 60) * Math.PI / 6 - Math.PI / 2;
        drawHand(hourAngle, 50, 4);
        
        // Minute hand
        const minuteAngle = minutes * Math.PI / 30 - Math.PI / 2;
        drawHand(minuteAngle, 70, 2);
    }
    
    function drawHand(angle, length, width) {
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(
            100 + length * Math.cos(angle),
            100 + length * Math.sin(angle)
        );
        ctx.strokeStyle = '#333';
        ctx.lineWidth = width;
        ctx.stroke();
    }

    function generateTime() {
        const hours = Math.floor(Math.random() * 12);
        const minutes = Math.floor(Math.random() * 4) * 15; // Only 00, 15, 30, 45
        return { hours, minutes };
    }

    function formatTime(hours, minutes) {
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    function generateOptions(correctTime) {
        const options = [formatTime(correctTime.hours, correctTime.minutes)];
        
        while (options.length < 4) {
            const newTime = generateTime();
            const timeString = formatTime(newTime.hours, newTime.minutes);
            if (!options.includes(timeString)) {
                options.push(timeString);
            }
        }
        
        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
    }

    function saveGameScore() {
        const currentUser = checkLoginStatus();
        if (!currentUser) return;

        // Call the addGameScore function from the main page
        if (window.parent.addGameScore) {
            window.parent.addGameScore('Clock Game', score);
        } else {
            // Fallback if the game is not in an iframe
            const history = JSON.parse(localStorage.getItem(`gameHistory_${currentUser.username}`) || '[]');
            history.push({
                date: new Date().toISOString(),
                game: 'Clock Game',
                score: score
            });
            localStorage.setItem(`gameHistory_${currentUser.username}`, JSON.stringify(history));
        }
    }

    function newQuestion() {
        feedback.textContent = '';
        options.forEach(btn => {
            btn.classList.remove('correct', 'wrong');
            btn.disabled = false;
        });
        
        currentTime = generateTime();
        drawClock(currentTime.hours, currentTime.minutes);
        
        const timeOptions = generateOptions(currentTime);
        options.forEach((btn, index) => {
            btn.textContent = timeOptions[index];
        });
    }

    function checkAnswer(selectedOption) {
        const correctAnswer = formatTime(currentTime.hours, currentTime.minutes);
        const isCorrect = selectedOption.textContent === correctAnswer;
        
        options.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
        
        if (isCorrect) {
            score += 10;
            scoreElement.textContent = score;
            feedback.textContent = 'Correct! Well done!';
        } else {
            score = Math.max(0, score - 5);
            scoreElement.textContent = score;
            selectedOption.classList.add('wrong');
            feedback.textContent = 'Try again!';
        }

        saveGameScore();
    }

    options.forEach(option => {
        option.addEventListener('click', (e) => {
            checkAnswer(e.target);
        });
    });

    nextButton.addEventListener('click', newQuestion);

    // Start the game
    newQuestion();
});
