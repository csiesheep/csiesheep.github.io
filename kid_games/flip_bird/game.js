document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const themeButton = document.getElementById('themeButton');
    const scoreElement = document.getElementById('score');
    const giftsElement = document.getElementById('gifts');
    const normalScore = document.getElementById('normalScore');
    const christmasScore = document.getElementById('christmasScore');
    const normalInstructions = document.getElementById('normalInstructions');
    const christmasInstructions = document.getElementById('christmasInstructions');
    const bestScoreElement = document.getElementById('bestScore');
    const visitCountElement = document.getElementById('visitCount');

    // Initialize visit counter and best score
    let visitCount = parseInt(localStorage.getItem('flappyBirdVisits') || '0');
    let bestScore = parseInt(localStorage.getItem('flappyBirdBestScore') || '0');
    visitCount++;
    localStorage.setItem('flappyBirdVisits', visitCount);
    visitCountElement.textContent = visitCount;
    bestScoreElement.textContent = bestScore;

    // Game constants
    const GRAVITY = 0.5;
    const FLAP_SPEED = -8;
    const PIPE_SPEED = 2;
    const PIPE_SPAWN_INTERVAL = 2000;
    const PIPE_GAP = 150;
    const BIRD_SIZE = 30;
    const GIFT_SIZE = 25;
    const GIFT_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    const SNOW_COUNT = 100;

    // Game variables
    let bird = {
        x: canvas.width / 4,
        y: canvas.height / 2,
        velocity: 0,
        rotation: 0
    };

    let pipes = [];
    let gifts = [];
    let snowflakes = [];
    let score = 0;
    let gameLoop;
    let isGameRunning = false;
    let lastPipeSpawn = 0;
    let isChristmasTheme = true; // Default to Christmas theme

    class Snowflake {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -10;
            this.size = Math.random() * 3 + 2;
            this.speed = Math.random() * 2 + 1;
            this.swing = Math.random() * 3;
            this.swingSpeed = Math.random() * 0.02;
            this.angle = 0;
        }

        update() {
            this.y += this.speed;
            this.x += Math.sin(this.angle) * this.swing;
            this.angle += this.swingSpeed;

            if (this.y > canvas.height) {
                this.reset();
            }
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        }
    }

    // Theme-specific colors and properties
    const themes = {
        normal: {
            bird: {
                body: '#FFD700',
                wing: '#FFA500',
                eye: '#000000',
                beak: '#FF6B6B'
            },
            pipe: {
                main: '#4CAF50',
                cap: '#45a049'
            }
        },
        christmas: {
            santa: {
                suit: '#ff0000',
                fur: '#ffffff',
                sled: '#8b4513',
                face: '#ffe4c4'
            },
            chimney: {
                brick: '#8b4513',
                top: '#a0522d'
            }
        }
    };

    function drawBird() {
        if (!isChristmasTheme) {
            // Normal bird
            ctx.fillStyle = themes.normal.bird.body;
            ctx.beginPath();
            ctx.arc(bird.x, bird.y, BIRD_SIZE/2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = themes.normal.bird.wing;
            ctx.beginPath();
            ctx.ellipse(bird.x - 5, bird.y + 5, BIRD_SIZE/3, BIRD_SIZE/4, Math.PI/4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = themes.normal.bird.eye;
            ctx.beginPath();
            ctx.arc(bird.x + 8, bird.y - 5, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = themes.normal.bird.beak;
            ctx.beginPath();
            ctx.moveTo(bird.x + 12, bird.y);
            ctx.lineTo(bird.x + 22, bird.y);
            ctx.lineTo(bird.x + 12, bird.y + 5);
            ctx.closePath();
            ctx.fill();
        } else {
            // Santa on sled
            drawSanta();
        }
    }

    function drawSanta() {
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(bird.rotation);

        // Sled
        ctx.fillStyle = themes.christmas.santa.sled;
        ctx.beginPath();
        ctx.moveTo(-25, 10);
        ctx.quadraticCurveTo(-15, 15, 25, 10);
        ctx.lineTo(30, 5);
        ctx.quadraticCurveTo(-15, 0, -20, 5);
        ctx.closePath();
        ctx.fill();

        // Sled details
        ctx.strokeStyle = '#6d3c11';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-20, 7);
        ctx.lineTo(25, 7);
        ctx.stroke();

        // Santa body
        ctx.fillStyle = themes.christmas.santa.suit;
        ctx.beginPath();
        ctx.ellipse(0, -5, BIRD_SIZE/1.5, BIRD_SIZE/1.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belt
        ctx.fillStyle = '#000';
        ctx.fillRect(-10, -2, 20, 4);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-2, -3, 4, 6);

        // Santa face
        ctx.fillStyle = themes.christmas.santa.face;
        ctx.beginPath();
        ctx.arc(5, -10, 10, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(7, -12, 2, 0, Math.PI * 2);
        ctx.fill();

        // Rosy cheeks
        ctx.fillStyle = '#ff9999';
        ctx.beginPath();
        ctx.arc(12, -8, 3, 0, Math.PI * 2);
        ctx.fill();

        // Santa hat
        ctx.fillStyle = themes.christmas.santa.suit;
        ctx.beginPath();
        ctx.moveTo(-5, -15);
        ctx.quadraticCurveTo(5, -30, 20, -20);
        ctx.quadraticCurveTo(15, -15, 10, -15);
        ctx.closePath();
        ctx.fill();

        // Hat trim
        ctx.fillStyle = themes.christmas.santa.fur;
        ctx.beginPath();
        ctx.ellipse(-2, -15, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hat pom-pom
        ctx.fillStyle = themes.christmas.santa.fur;
        ctx.beginPath();
        ctx.arc(20, -20, 5, 0, Math.PI * 2);
        ctx.fill();

        // Beard
        ctx.fillStyle = themes.christmas.santa.fur;
        ctx.beginPath();
        ctx.moveTo(-5, -5);
        ctx.quadraticCurveTo(5, 0, 15, -5);
        ctx.quadraticCurveTo(10, -8, -5, -5);
        ctx.fill();

        ctx.restore();
    }

    function createPipe() {
        const gapStart = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
        const pipe = {
            x: canvas.width,
            gapStart: gapStart,
            gapEnd: gapStart + PIPE_GAP,
            passed: false
        };

        if (isChristmasTheme && Math.random() < 0.7) {
            const gift = {
                x: pipe.x + 25,
                y: pipe.gapStart + (PIPE_GAP / 2),
                collected: false,
                color: GIFT_COLORS[Math.floor(Math.random() * GIFT_COLORS.length)],
                rotation: Math.random() * 0.5 - 0.25 // Slight random rotation
            };
            gifts.push(gift);
        }

        pipes.push(pipe);
    }

    function drawPipe(pipe) {
        if (!isChristmasTheme) {
            // Normal pipes
            ctx.fillStyle = themes.normal.pipe.main;
            ctx.fillRect(pipe.x, 0, 50, pipe.gapStart);
            ctx.fillRect(pipe.x, pipe.gapEnd, 50, canvas.height - pipe.gapEnd);

            ctx.fillStyle = themes.normal.pipe.cap;
            ctx.fillRect(pipe.x - 5, pipe.gapStart - 20, 60, 20);
            ctx.fillRect(pipe.x - 5, pipe.gapEnd, 60, 20);
        } else {
            // Chimneys
            const brickHeight = 20;
            const chimWidth = 50;

            // Draw main chimney structure
            ctx.fillStyle = themes.christmas.chimney.brick;
            for (let y = 0; y < pipe.gapStart; y += brickHeight) {
                ctx.fillRect(pipe.x, y, chimWidth, brickHeight - 2);
            }
            for (let y = pipe.gapEnd; y < canvas.height; y += brickHeight) {
                ctx.fillRect(pipe.x, y, chimWidth, brickHeight - 2);
            }

            // Chimney tops
            ctx.fillStyle = themes.christmas.chimney.top;
            ctx.fillRect(pipe.x - 10, pipe.gapStart - 15, chimWidth + 20, 15);
            ctx.fillRect(pipe.x - 10, pipe.gapEnd, chimWidth + 20, 15);
        }
    }

    function drawGift(gift) {
        if (!gift.collected) {
            ctx.save();
            ctx.translate(gift.x, gift.y);
            ctx.rotate(gift.rotation || 0);

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(0, GIFT_SIZE/2, GIFT_SIZE/2, GIFT_SIZE/4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Gift box
            ctx.fillStyle = gift.color;
            ctx.fillRect(-GIFT_SIZE/2, -GIFT_SIZE/2, GIFT_SIZE, GIFT_SIZE);

            // Box highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.moveTo(-GIFT_SIZE/2, -GIFT_SIZE/2);
            ctx.lineTo(-GIFT_SIZE/4, -GIFT_SIZE/2);
            ctx.lineTo(-GIFT_SIZE/2, -GIFT_SIZE/4);
            ctx.closePath();
            ctx.fill();

            // Ribbon
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, -GIFT_SIZE/2);
            ctx.lineTo(0, GIFT_SIZE/2);
            ctx.moveTo(-GIFT_SIZE/2, 0);
            ctx.lineTo(GIFT_SIZE/2, 0);
            ctx.stroke();

            // Bow
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, GIFT_SIZE/6, 0, Math.PI * 2);
            ctx.fill();
            
            // Bow loops
            ctx.beginPath();
            ctx.arc(-GIFT_SIZE/4, 0, GIFT_SIZE/6, 0.5, 5.5);
            ctx.arc(GIFT_SIZE/4, 0, GIFT_SIZE/6, 3.7, 2.5, true);
            ctx.fill();

            ctx.restore();
        }
    }

    function checkGiftCollection() {
        const birdRadius = BIRD_SIZE/2;
        gifts.forEach(gift => {
            if (!gift.collected) {
                const dx = bird.x - gift.x;
                const dy = bird.y - gift.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < birdRadius + GIFT_SIZE/2) {
                    gift.collected = true;
                    score += 5; // Gifts are worth 5 points
                    giftsElement.textContent = Math.floor(score / 5); // Update gift counter
                    scoreElement.textContent = score;
                }
            }
        });
    }

    function checkCollision(pipe) {
        const birdRadius = BIRD_SIZE/2;
        const birdRight = bird.x + birdRadius;
        const birdLeft = bird.x - birdRadius;
        const birdTop = bird.y - birdRadius;
        const birdBottom = bird.y + birdRadius;

        if (birdBottom > canvas.height || birdTop < 0) {
            return true;
        }

        if (birdRight > pipe.x && birdLeft < pipe.x + 50) {
            if (birdTop < pipe.gapStart || birdBottom > pipe.gapEnd) {
                return true;
            }
        }

        return false;
    }

    function updateScore(pipe) {
        if (!pipe.passed && bird.x > pipe.x + 50) {
            score += isChristmasTheme ? 0 : 1; // Only increment score in normal mode
            scoreElement.textContent = score;
            pipe.passed = true;
        }
    }

    function gameOver() {
        cancelAnimationFrame(gameLoop);
        isGameRunning = false;
        startButton.classList.remove('hidden');
        startButton.textContent = 'Play Again';
        
        // Update best score
        const finalScore = isChristmasTheme ? Math.floor(score / 5) : score;
        if (finalScore > bestScore) {
            bestScore = finalScore;
            localStorage.setItem('flappyBirdBestScore', bestScore);
            bestScoreElement.textContent = bestScore;
        }
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
        ctx.font = '24px Arial';
        if (isChristmasTheme) {
            ctx.fillText(`Gifts Collected: ${Math.floor(score / 5)}`, canvas.width/2, canvas.height/2 + 40);
            if (finalScore === bestScore) {
                ctx.fillStyle = '#4CAF50';
                ctx.fillText('New Best Score!', canvas.width/2, canvas.height/2 + 70);
            }
        } else {
            ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 40);
            if (finalScore === bestScore) {
                ctx.fillStyle = '#4CAF50';
                ctx.fillText('New Best Score!', canvas.width/2, canvas.height/2 + 70);
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update snow
        snowflakes.forEach(snow => {
            snow.update();
            snow.draw(ctx);
        });

        bird.velocity += GRAVITY;
        bird.y += bird.velocity;

        // Update bird rotation
        const targetRotation = bird.velocity * 0.1;
        bird.rotation += (targetRotation - bird.rotation) * 0.1;

        const currentTime = Date.now();
        if (currentTime - lastPipeSpawn > PIPE_SPAWN_INTERVAL) {
            createPipe();
            lastPipeSpawn = currentTime;
        }

        // Update and draw gifts
        if (isChristmasTheme) {
            gifts.forEach(gift => {
                if (!gift.collected) {
                    gift.x -= PIPE_SPEED;
                    drawGift(gift);
                }
            });
            checkGiftCollection();
        }

        // Update and draw pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= PIPE_SPEED;
            drawPipe(pipes[i]);
            
            if (checkCollision(pipes[i])) {
                gameOver();
                return;
            }

            updateScore(pipes[i]);

            if (pipes[i].x + 50 < 0) {
                pipes.splice(i, 1);
            }
        }

        drawBird();
        gameLoop = requestAnimationFrame(draw);
    }

    function toggleTheme() {
        isChristmasTheme = !isChristmasTheme;
        canvas.classList.toggle('christmas');
        themeButton.innerHTML = isChristmasTheme ? 
            '<span class="theme-icon">🐦</span> Normal Mode' : 
            '<span class="theme-icon">🎅</span> Christmas Mode';
        
        normalScore.classList.toggle('hidden');
        christmasScore.classList.toggle('hidden');
        normalInstructions.classList.toggle('hidden');
        christmasInstructions.classList.toggle('hidden');

        if (isGameRunning) {
            startGame(); // Restart the game with new theme
        }
    }

    function startGame() {
        bird = {
            x: canvas.width / 4,
            y: canvas.height / 2,
            velocity: 0,
            rotation: 0
        };
        pipes = [];
        gifts = [];
        score = 0;
        scoreElement.textContent = score;
        giftsElement.textContent = '0';
        lastPipeSpawn = Date.now();

        // Initialize snowflakes
        snowflakes = Array(SNOW_COUNT).fill(null).map(() => new Snowflake());
        
        startButton.classList.add('hidden');
        
        isGameRunning = true;
        draw();
    }

    // Event listeners
    startButton.addEventListener('click', startGame);
    themeButton.addEventListener('click', toggleTheme);
    canvas.addEventListener('click', () => {
        if (isGameRunning) {
            bird.velocity = FLAP_SPEED;
        } else {
            startGame();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (!isGameRunning && !startButton.classList.contains('hidden')) {
                startGame();
            } else {
                bird.velocity = FLAP_SPEED;
            }
            e.preventDefault();
        }
    });
});
