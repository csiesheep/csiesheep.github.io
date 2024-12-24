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
const windStrengthElement = document.getElementById('wind-strength');
const windArrow = document.getElementById('wind-arrow');
const windToggle = document.getElementById('wind-toggle');
const windEffect = document.getElementById('wind-effect');

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
let windSpeed = 0;
let windEnabled = false;

// Constants
const POWER_INCREASE_RATE = 2; // How fast power increases
const MAX_POWER = 100;
const GRAVITY = 0.3;
const INITIAL_VELOCITY = 15; // Base velocity for arrows
const MAX_WIND_SPEED = 0.3;
const WIND_CHANGE_INTERVAL = 3000;
const TARGET_RINGS = [
    { radius: 20, score: 100, color: '#FF0000', gradient: ['#FF0000', '#CC0000'] },
    { radius: 40, score: 50, color: '#FFFFFF', gradient: ['#FFFFFF', '#EEEEEE'] },
    { radius: 60, score: 20, color: '#FF0000', gradient: ['#FF0000', '#CC0000'] },
    { radius: 80, score: 10, color: '#FFFFFF', gradient: ['#FFFFFF', '#EEEEEE'] }
];

// Create wind particles
function createWindParticles() {
    windEffect.innerHTML = '';
    
    if (!windEnabled || windSpeed === 0) return;

    const particleCount = Math.abs(windSpeed) * 100;
    const windDistance = windSpeed > 0 ? '800px' : '-800px';

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'wind-particle';
        particle.style.setProperty('--wind-distance', windDistance);
        
        // Random position and timing
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animation = `windMove ${2 + Math.random() * 2}s linear infinite`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        
        windEffect.appendChild(particle);
    }
}

// Create firework effect
function createFirework(x, y, color) {
    const particles = 30;
    const angleStep = (2 * Math.PI) / particles;

    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = color;
        
        const angle = angleStep * i;
        const velocity = 5 + Math.random() * 5;
        
        particle.style.animation = 'explode 1s ease-out forwards';
        particle.style.transform = `rotate(${angle}rad)`;
        
        gameContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => particle.remove(), 1000);
    }
}

// Show points popup
function showPointsPopup(points, x, y) {
    const popup = document.createElement('div');
    popup.className = 'points-popup';
    popup.textContent = `+${points}`;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    
    gameContainer.appendChild(popup);
    
    // Remove popup after animation
    setTimeout(() => popup.remove(), 1000);
    
    // Add fireworks based on points
    const colors = ['#FFD700', '#FFA500', '#FF4500'];
    const fireworkCount = Math.floor(points / 20); // More fireworks for higher points
    
    for (let i = 0; i < fireworkCount; i++) {
        setTimeout(() => {
            const offsetX = (Math.random() - 0.5) * 100;
            const offsetY = (Math.random() - 0.5) * 100;
            createFirework(
                x + offsetX,
                y + offsetY,
                colors[Math.floor(Math.random() * colors.length)]
            );
        }, i * 200);
    }
}

// Draw target with better point display
function drawTarget() {
    const ctx = targetCanvas.getContext('2d');
    const centerX = targetCanvas.width / 2;
    const centerY = targetCanvas.height / 2;

    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

    // Draw rings from outside in
    TARGET_RINGS.slice().reverse().forEach(ring => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
        
        // Create gradient
        const gradient = ctx.createRadialGradient(
            centerX, centerY, ring.radius - 10,
            centerX, centerY, ring.radius
        );
        gradient.addColorStop(0, ring.gradient[0]);
        gradient.addColorStop(1, ring.gradient[1]);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

// Create hit effect
function createHitEffect(x, y, points) {
    // Create expanding ring
    const ring = document.createElement('div');
    ring.className = 'hit-ring';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    ring.style.width = '40px';
    ring.style.height = '40px';
    gameContainer.appendChild(ring);
    setTimeout(() => ring.remove(), 500);

    // Create points popup with score-based styling
    const popup = document.createElement('div');
    popup.className = `points-popup score-${points}`;
    popup.textContent = `+${points}`;
    popup.style.left = '50%';
    popup.style.top = '50%';
    gameContainer.appendChild(popup);
    setTimeout(() => popup.remove(), 1500);

    // Create fireworks based on score
    const fireworkConfigs = {
        100: { count: 20, colors: ['#FFD700', '#FFA500', '#FF8C00'], size: 8 },
        50: { count: 12, colors: ['#FFA500', '#FF8C00', '#FF4500'], size: 6 },
        20: { count: 8, colors: ['#FF4500', '#FF6347'], size: 5 },
        10: { count: 4, colors: ['#FF6347'], size: 4 }
    };

    const config = fireworkConfigs[points] || { count: 0, colors: [], size: 4 };
    
    for (let i = 0; i < config.count; i++) {
        setTimeout(() => {
            const offsetX = (Math.random() - 0.5) * 200;
            const offsetY = (Math.random() - 0.5) * 200;
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];
            
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = (x + offsetX) + 'px';
            firework.style.top = (y + offsetY) + 'px';
            firework.style.backgroundColor = color;
            firework.style.width = config.size + 'px';
            firework.style.height = config.size + 'px';
            firework.style.animation = 'explode 1s ease-out forwards';
            
            gameContainer.appendChild(firework);
            setTimeout(() => firework.remove(), 1000);
        }, i * 50);
    }
}

// Calculate score and show effects
function calculateScore(distance) {
    let points = 0;
    const targetRect = targetCanvas.getBoundingClientRect();
    const hitX = targetRect.left + targetRect.width / 2;
    const hitY = targetRect.top + targetRect.height / 2;

    // Find the highest scoring ring that contains the hit
    for (let ring of TARGET_RINGS) {
        if (distance <= ring.radius) {
            points = ring.score;
            break;
        }
    }

    // Update score
    score += points;
    scoreElement.textContent = score;

    // Create hit effects
    if (points > 0) {
        createHitEffect(hitX, hitY, points);
    }

    return points;
}

// Update wind
function updateWind() {
    if (!windEnabled) {
        windSpeed = 0;
        windStrengthElement.textContent = '0';
        windArrow.style.transform = 'scaleX(0)';
        createWindParticles();
        return;
    }

    // Generate random wind speed
    windSpeed = (Math.random() * 2 - 1) * MAX_WIND_SPEED;
    
    // Update wind indicator
    windStrengthElement.textContent = Math.abs(windSpeed * 10).toFixed(1);
    windArrow.style.transform = `scaleX(${windSpeed < 0 ? -1 : 1})`;
    
    // Update wind particles
    createWindParticles();
}

// Toggle wind
windToggle.addEventListener('click', () => {
    windEnabled = !windEnabled;
    windToggle.textContent = windEnabled ? 'Disable Wind' : 'Enable Wind';
    windToggle.classList.toggle('disabled');
    updateWind();
});

// Start wind updates
setInterval(updateWind, WIND_CHANGE_INTERVAL);

// Update game state
function updateGame() {
    if (isCharging) {
        // Increase power while space is held
        power = Math.min(power + POWER_INCREASE_RATE, MAX_POWER);
        powerLevel.style.height = `${power}%`;
    }

    if (isShooting && shootingArrow) {
        // Apply wind effect
        arrowVelocityX += windSpeed;
        
        // Update velocities and position
        arrowVelocityY += GRAVITY;
        arrowX += arrowVelocityX;
        arrowY += arrowVelocityY;

        // Update arrow position and rotation
        const arrowAngle = Math.atan2(arrowVelocityY, arrowVelocityX) * 180 / Math.PI;
        shootingArrow.style.transform = `translate(${arrowX}px, ${arrowY}px) rotate(${arrowAngle}deg)`;

        // Get target bounds
        const targetRect = targetCanvas.getBoundingClientRect();
        const gameRect = gameContainer.getBoundingClientRect();
        
        // Calculate arrow center position relative to game container
        const arrowCenterX = arrowX + shootingArrow.offsetWidth / 2;
        const arrowCenterY = arrowY + shootingArrow.offsetHeight / 2;
        
        // Calculate target center position relative to game container
        const targetCenterX = targetRect.left - gameRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top - gameRect.top + targetRect.height / 2;

        // Calculate distance to target center
        const distance = Math.sqrt(
            Math.pow(arrowCenterX - targetCenterX, 2) +
            Math.pow(arrowCenterY - targetCenterY, 2)
        );

        // Check if arrow hit target or went out of bounds
        if (distance <= TARGET_RINGS[TARGET_RINGS.length - 1].radius ||
            arrowX < -shootingArrow.offsetWidth || arrowX > gameRect.width ||
            arrowY < -shootingArrow.offsetHeight || arrowY > gameRect.height) {
            
            isShooting = false;
            
            // Only keep arrow if it hit the target
            if (distance <= TARGET_RINGS[TARGET_RINGS.length - 1].radius) {
                calculateScore(distance);
                
                // Calculate final position relative to target
                const finalX = targetCenterX + (arrowCenterX - targetCenterX) * 0.9; // Slightly adjust towards center
                const finalY = targetCenterY + (arrowCenterY - targetCenterY) * 0.9;
                
                // Fix arrow at hit position with shadow for 3D effect
                shootingArrow.style.transform = `translate(${finalX - shootingArrow.offsetWidth / 2}px, ${finalY - shootingArrow.offsetHeight / 2}px) rotate(${arrowAngle}deg)`;
                shootingArrow.style.zIndex = '1'; // Ensure arrow appears above target
                shootingArrow.style.filter = 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))';
            } else {
                gameContainer.removeChild(shootingArrow);
            }

            // Check if game is over
            if (arrows <= 0) {
                endGame();
            } else {
                // Reset for next arrow after a short delay
                setTimeout(() => {
                    arrowElement.style.display = 'block';
                }, 500);
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
    
    // Hide the bow's arrow while shooting
    arrowElement.style.display = 'none';

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

    // Set initial position at bow's center
    const bowRect = bowElement.getBoundingClientRect();
    const gameRect = gameContainer.getBoundingClientRect();
    arrowX = bowRect.left - gameRect.left;
    arrowY = bowRect.top - gameRect.top + bowRect.height / 2 - 4; // Center arrow vertically (8px height / 2 = 4)

    // Calculate initial velocities based on power and angle
    const radians = bowAngle * Math.PI / 180;
    const velocity = INITIAL_VELOCITY * (power / 100); // Scale velocity by power
    arrowVelocityX = Math.cos(radians) * velocity;
    arrowVelocityY = Math.sin(radians) * velocity;

    // Set initial position and rotation
    shootingArrow.style.transform = `translate(${arrowX}px, ${arrowY}px) rotate(${bowAngle}deg)`;
    shootingArrow.style.position = 'absolute';
    
    gameContainer.appendChild(shootingArrow);
    powerLevel.style.height = '0%';
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
