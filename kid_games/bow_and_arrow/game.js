// Game elements
const gameContainer = document.getElementById('gameContainer');
const targetCanvas = document.getElementById('target');
const bowElement = document.getElementById('bow');
const arrowElement = document.getElementById('arrow');
const scoreElement = document.getElementById('scoreValue');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const powerMeter = document.getElementById('power-meter');
const powerLevel = document.getElementById('power-level');

// Game variables
let bowAngle = 0; // Current angle of the bow
let power = 0; // Current power level
let isCharging = false; // Whether the bow is being charged
let isShooting = false; // Whether an arrow is currently flying
let score = 0;
let arrows = 10; // Number of arrows available
let gameActive = true;
let shootingArrow = null; // Reference to the flying arrow element
let arrowX = 0; // Current X position of flying arrow
let arrowY = 0; // Current Y position of flying arrow
let arrowVelocityX = 0; // X velocity of the arrow
let arrowVelocityY = 0; // Y velocity of the arrow

// Constants
const POWER_INCREASE_RATE = 1; // How fast power increases
const MAX_POWER = 100;
const GRAVITY = 0.5;
const TARGET_RINGS = [
    { radius: 20, score: 100, color: '#FF0000' },
    { radius: 40, score: 50, color: '#FFFFFF' },
    { radius: 60, score: 20, color: '#FF0000' },
    { radius: 80, score: 10, color: '#FFFFFF' }
];

// Draw target
function drawTarget() {
    const ctx = targetCanvas.getContext('2d');
    const centerX = targetCanvas.width / 2;
    const centerY = targetCanvas.height / 2;

    // Draw target rings from outside in
    TARGET_RINGS.slice().reverse().forEach(ring => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
        ctx.fillStyle = ring.color;
        ctx.fill();
    });
}

// Update game state
function updateGame() {
    if (isCharging) {
        // Increase power while space is held
        power = Math.min(power + POWER_INCREASE_RATE, MAX_POWER);
        powerLevel.style.height = `${power}%`;
    }

    if (isShooting && shootingArrow) {
        // Update arrow position with physics
        arrowVelocityY += GRAVITY;
        arrowX += arrowVelocityX;
        arrowY += arrowVelocityY;

        // Update arrow position and rotation
        shootingArrow.style.left = arrowX + 'px';
        shootingArrow.style.top = arrowY + 'px';
        const arrowAngle = Math.atan2(arrowVelocityY, arrowVelocityX) * 180 / Math.PI;
        shootingArrow.style.transform = `rotate(${arrowAngle}deg)`;

        // Get target bounds
        const targetRect = targetCanvas.getBoundingClientRect();
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        // Calculate distance to target center
        const distance = Math.sqrt(
            Math.pow(arrowX - targetCenterX, 2) +
            Math.pow(arrowY - targetCenterY, 2)
        );

        // Check if arrow hit target or went out of bounds
        const gameRect = gameContainer.getBoundingClientRect();
        if (distance <= TARGET_RINGS[TARGET_RINGS.length - 1].radius ||
            arrowX < 0 || arrowX > gameRect.width ||
            arrowY < 0 || arrowY > gameRect.height) {
            
            isShooting = false;
            
            // Only keep arrow and score if it hit the target
            if (distance <= TARGET_RINGS[TARGET_RINGS.length - 1].radius) {
                calculateScore(distance);
            } else {
                gameContainer.removeChild(shootingArrow);
            }

            // Check if game is over
            if (arrows <= 0) {
                endGame();
            }
        }
    }

    // Update bow rotation
    bowElement.style.transform = `translateY(-50%) rotate(${bowAngle}deg)`;
    if (!isShooting) {
        arrowElement.style.transform = `rotate(${bowAngle}deg)`;
    }

    requestAnimationFrame(updateGame);
}

// Handle keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;

    switch (e.key) {
        case 'ArrowUp':
            bowAngle = Math.max(bowAngle - 2, -80);
            break;
        case 'ArrowDown':
            bowAngle = Math.min(bowAngle + 2, 80);
            break;
        case ' ':
            if (!isShooting && !isCharging) {
                isCharging = true;
                power = 0;
            }
            break;
    }
});

document.addEventListener('keyup', (e) => {
    if (!gameActive) return;

    if (e.key === ' ' && isCharging) {
        shootArrow();
    }
});

// Shoot arrow
function shootArrow() {
    if (!gameActive || arrows <= 0 || isShooting) return;

    isCharging = false;
    isShooting = true;
    arrows--;

    // Create the shooting arrow
    shootingArrow = document.createElement('div');
    shootingArrow.className = 'flying-arrow';
    
    // Create arrow SVG
    const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowSvg.setAttribute('width', '60');
    arrowSvg.setAttribute('height', '8');
    arrowSvg.setAttribute('viewBox', '0 0 60 8');
    
    const arrowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    arrowLine.setAttribute('x1', '0');
    arrowLine.setAttribute('y1', '4');
    arrowLine.setAttribute('x2', '45');
    arrowLine.setAttribute('y2', '4');
    arrowLine.setAttribute('stroke', '#8B4513');
    arrowLine.setAttribute('stroke-width', '2');
    
    const arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrowHead.setAttribute('points', '45,0 60,4 45,8');
    arrowHead.setAttribute('fill', '#8B4513');
    
    arrowSvg.appendChild(arrowLine);
    arrowSvg.appendChild(arrowHead);
    shootingArrow.appendChild(arrowSvg);

    // Set initial position and velocity
    const bowRect = bowElement.getBoundingClientRect();
    arrowX = bowRect.left + bowRect.width / 2;
    arrowY = bowRect.top + bowRect.height / 2;
    const radians = bowAngle * Math.PI / 180;
    const velocity = power * 0.2; // Scale power to reasonable velocity
    arrowVelocityX = Math.cos(radians) * velocity;
    arrowVelocityY = Math.sin(radians) * velocity;

    shootingArrow.style.left = arrowX + 'px';
    shootingArrow.style.top = arrowY + 'px';
    shootingArrow.style.transform = `rotate(${bowAngle}deg)`;

    gameContainer.appendChild(shootingArrow);
    powerLevel.style.height = '0%';
}

// Calculate score based on distance to center
function calculateScore(distance) {
    let points = 0;
    for (let i = 0; i < TARGET_RINGS.length; i++) {
        if (distance <= TARGET_RINGS[i].radius) {
            points = TARGET_RINGS[i].score;
            break;
        }
    }

    score += points;
    scoreElement.textContent = score;
}

// End the game
function endGame() {
    gameActive = false;
    gameOverElement.style.display = 'block';
    finalScoreElement.textContent = score;
    
    // Save score to localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        const gameHistory = JSON.parse(localStorage.getItem(`gameHistory_${currentUser.username}`) || '[]');
        gameHistory.push({
            game: 'Archery',
            score: score,
            date: new Date().toISOString()
        });
        localStorage.setItem(`gameHistory_${currentUser.username}`, JSON.stringify(gameHistory));
    }
}

// Restart the game
function restartGame() {
    score = 0;
    arrows = 10;
    gameActive = true;
    bowAngle = 0;
    power = 0;
    isCharging = false;
    isShooting = false;
    
    scoreElement.textContent = '0';
    gameOverElement.style.display = 'none';
    powerLevel.style.height = '0%';
    
    // Remove all flying arrows
    const flyingArrows = document.querySelectorAll('.flying-arrow');
    flyingArrows.forEach(arrow => arrow.remove());
}

// Initialize game
drawTarget();
updateGame();
