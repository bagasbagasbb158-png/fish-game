// Get the canvas element
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to full window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initial resize
resizeCanvas();

// Resize on window resize
window.addEventListener('resize', resizeCanvas);

// Mouse position
let mouseX = 0;
let mouseY = 0;

// Update mouse position on mousemove
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Game state
let gameState = "playing"; // "playing", "gameover", or "won"

// Score variables
let score = 0;
let highScore = 0;

// Game timer (in seconds)
let gameTime = 0;
const BOSS_SPAWN_TIME = 30; // 30 seconds

// Load high score from localStorage
function loadHighScore() {
    const saved = localStorage.getItem('fishGameHighScore');
    if (saved) {
        highScore = parseInt(saved);
    }
}

// Save high score to localStorage
function saveHighScore() {
    localStorage.setItem('fishGameHighScore', highScore);
}

// Fish tier system
const fishTiers = [
    {
        name: 'Tiny',
        sizeMin: 10,
        sizeMax: 18,
        speedMin: 1.5,
        speedMax: 2.5,
        color: '#06d6a0', // teal
        weight: 40 // most common
    },
    {
        name: 'Small',
        sizeMin: 18,
        sizeMax: 25,
        speedMin: 1.0,
        speedMax: 2.0,
        color: '#118ab2', // blue
        weight: 30
    },
    {
        name: 'Medium',
        sizeMin: 25,
        sizeMax: 35,
        speedMin: 0.5,
        speedMax: 1.5,
        color: '#ff9f1c', // orange
        weight: 20
    },
    {
        name: 'Large',
        sizeMin: 35,
        sizeMax: 45,
        speedMin: 0.2,
        speedMax: 0.8,
        color: '#ff6b35', // red-orange
        weight: 8
    },
    {
        name: 'Huge',
        sizeMin: 45,
        sizeMax: 60,
        speedMin: 0.1,
        speedMax: 0.4,
        color: '#073b4c', // dark blue
        weight: 2 // rarest
    }
];

// Helper: select a tier based on weights
function selectTier() {
    let totalWeight = 0;
    for (const tier of fishTiers) {
        totalWeight += tier.weight;
    }
    let random = Math.random() * totalWeight;
    for (const tier of fishTiers) {
        if (random < tier.weight) {
            return tier;
        }
        random -= tier.weight;
    }
    // fallback (should never happen)
    return fishTiers[0];
}

// Boss constants
const BOSS_SIZE = 80;         // Fixed size for the boss
const BOSS_SPEED = 0.15;      // Slow horizontal speed
const BOSS_COLOR = '#ff00ff'; // Magenta/purple
const BOSS_MESSAGE_TIME = 180; // 3 seconds at 60fps

// Bubble class for underwater bubbles
class Bubble {
    constructor() {
        this.reset();
    }

    reset() {
        // Spawn near the bottom
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 50; // Start slightly below bottom
        this.radius = 2 + Math.random() * 3; // 2-5 pixels
        this.speed = 0.2 + Math.random() * 0.8; // 0.2-1.0 px/frame upward
        this.opacity = 0.3 + Math.random() * 0.4; // 0.3-0.7
    }

    update() {
        // Move upward
        this.y -= this.speed;

        // If bubble goes off top, reset to bottom
        if (this.y < -this.radius) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.restore();
    }
}

// Particle class for underwater debris/plankton
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        // Spawn anywhere in the canvas
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = 0.5 + Math.random() * 1.5; // 0.5-2 pixels
        // Slow drift in random direction
        this.speedX = (Math.random() - 0.5) * 0.2; // -0.1 to 0.1
        this.speedY = (Math.random() - 0.5) * 0.2; // -0.1 to 0.1
        this.opacity = 0.1 + Math.random() * 0.2; // 0.1-0.3
        // Random color for debris (slightly varied)
        const colors = ['#001f3f', '#00254d', '#002b5e', '#00316a'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Move with drift
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

// Eat effect class for when player eats an enemy
class EatEffect {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.particles = [];
        this.life = 1.0; // 1.0 to 0.0
        this.maxLife = 0.5; // seconds? but we use frames, so let's use frames: 30 frames at 60fps = 0.5s
        // Create particles
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3; // 2-5 px/frame
            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 1 + Math.random() * 2, // 1-3 pixels
                life: 1.0
            });
        }
    }

    update() {
        this.life -= 1/60; // assuming 60fps, reduce life by 1/60 per frame
        if (this.life <= 0) {
            return false; // dead
        }

        // Update particles
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98; // slight drag
            p.vy *= 0.98;
            p.life -= 1/30; // particles fade faster
            if (p.life <= 0) {
                p.life = 0;
            }
        }
        return true;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }
}

// Boss class
class BossFish {
    constructor() {
        this.size = BOSS_SIZE;
        // Start at a random vertical position, but off-screen horizontally
        // We'll start from the left or right randomly
        if (Math.random() < 0.5) {
            this.x = -this.size/2; // Start off-screen left
            this.speedX = BOSS_SPEED; // Moving right
        } else {
            this.x = canvas.width + this.size/2; // Start off-screen right
            this.speedX = -BOSS_SPEED; // Moving left
        }
        this.y = Math.random() * (canvas.height - this.size) + this.size/2; // Within vertical bounds
        this.color = BOSS_COLOR;

        // Animation phases (more noticeable than normal fish)
        this.tailPhase = Math.random() * Math.PI * 2;
        this.bobPhase = Math.random() * Math.PI * 2;
        // Boss has a slower, more pronounced bob
        this.bobAmplitude = 3.0; // pixels
    }

    // Update position and handle screen wrapping
    update() {
        // Move horizontally
        this.x += this.speedX;

        // Horizontal wrapping: when off left/right, appear on opposite side
        if (this.x < -this.size/2) {
            this.x = canvas.width + this.size/2;
        } else if (this.x > canvas.width + this.size/2) {
            this.x = -this.size/2;
        }

        // Vertical drift: slow up/down movement (more noticeable than normal fish)
        this.y += (Math.random() - 0.5) * 0.3; // -0.15 to 0.15
        // Keep within vertical bounds (with some flexibility)
        if (this.y < this.size/2) {
            this.y = this.size/2;
        } else if (this.y > canvas.height - this.size/2) {
            this.y = canvas.height - this.size/2;
        }
    }

    // Draw the boss fish with animation (more noticeable than normal fish)
    draw() {
        // Calculate animation factors (boss is slow but has pronounced movement)
        const speedFactor = 1 + Math.abs(this.speedX) * 2; // Boss is slow but we amplify for animation
        const tailOscillation = Math.sin(Date.now() * 0.0015 * speedFactor + this.tailPhase) * 0.5; // More pronounced tail
        const bobOffset = Math.sin(Date.now() * 0.0008 * speedFactor + this.bobPhase) * this.bobAmplitude; // More pronounced bob

        // Save current context state
        ctx.save();

        // Move to fish position
        ctx.translate(this.x, this.y);

        // Apply bob (vertical oscillation)
        ctx.translate(0, bobOffset);

        // Rotate to face direction of movement (boss only moves horizontally, so we use speedX for direction)
        let angle = 0;
        if (this.speedX < 0) {
            angle = Math.PI; // facing left
        } else {
            angle = 0; // facing right
        }
        ctx.rotate(angle);

        // Draw fish body (circle) - slightly larger than normal for the same size? We'll use the same.
        ctx.beginPath();
        ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Draw tail (animated) - more pronounced
        ctx.save();
        // Move to the back of the body
        ctx.translate(-this.size/2, 0);
        // Oscillate the tail more
        ctx.rotate(tailOscillation);
        // Draw tail triangle (same as normal fish)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-this.size, -this.size/3);
        ctx.lineTo(-this.size, this.size/3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw eye (circle) - maybe make it more menacing?
        ctx.beginPath();
        ctx.arc(this.size/4, -this.size/4, this.size/8, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        // Draw eye pupil
        ctx.beginPath();
        ctx.arc(this.size/4, -this.size/4, this.size/16, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();

        // Restore context
        ctx.restore();
    }
}

// Player object
const player = {
    x: canvas.width / 2,      // Start at center x
    y: canvas.height / 2,     // Start at center y
    size: 30,                 // Fish size (diameter of body)
    speed: 0.1,               // Movement damping factor (lower = smoother)
    color: '#ff6b35',         // Orange-ish fish color
    growthFlash: 0,           // Timer for visual feedback when eating
    tailPhase: Math.random() * Math.PI * 2, // Random phase for tail animation
    bobPhase: Math.random() * Math.PI * 2   // Random phase for bob animation
};

// Enemy fish class
class EnemyFish {
    constructor() {
        // Select a tier based on spawn probabilities
        const tier = selectTier();

        // Generate size within tier's range
        this.size = tier.sizeMin + Math.random() * (tier.sizeMax - tier.sizeMin);

        // Random starting position within canvas
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        // Generate horizontal speed within tier's range
        // Ensure it's not zero so they always move
        let speed = (Math.random() - 0.5) * 2; // -1 to 1 base
        // Scale to tier's speed range
        const speedRange = tier.speedMax - tier.speedMin;
        this.speedX = tier.speedMin + Math.random() * speedRange;
        // Random direction (left or right)
        if (Math.random() < 0.5) {
            this.speedX = -this.speedX;
        }

        // Small vertical drift for natural movement
        this.speedY = (Math.random() - 0.5) * 0.4; // -0.2 to 0.2

        // Use tier's color
        this.color = tier.color;

        // Animation phases
        this.tailPhase = Math.random() * Math.PI * 2;
        this.bobPhase = Math.random() * Math.PI * 2;
    }

    // Update position and handle screen wrapping
    update() {
        // Move horizontally
        this.x += this.speedX;
        // Move vertically with slight drift
        this.y += this.speedY;

        // Horizontal wrapping: when off left/right, appear on opposite side
        if (this.x < -this.size/2) {
            this.x = canvas.width + this.size/2;
        } else if (this.x > canvas.width + this.size/2) {
            this.x = -this.size/2;
        }

        // Vertical bouncing: reverse direction when hitting top/bottom
        if (this.y < this.size/2) {
            this.y = this.size/2;
            this.speedY = Math.abs(this.speedY); // Ensure downward movement
        } else if (this.y > canvas.height - this.size/2) {
            this.y = canvas.height - this.size/2;
            this.speedY = -Math.abs(this.speedY); // Ensure upward movement
        }
    }

    // Draw the enemy fish with animation
    draw() {
        // Calculate animation factors
        const speedFactor = 1 + Math.abs(this.speedX); // 1 to about 2.5
        const tailOscillation = Math.sin(Date.now() * 0.002 * speedFactor + this.tailPhase) * 0.3;
        const bobOffset = Math.sin(Date.now() * 0.001 * speedFactor + this.bobPhase) * 0.5;

        // Save current context state
        ctx.save();

        // Move to fish position
        ctx.translate(this.x, this.y);

        // Apply bob (vertical oscillation)
        ctx.translate(0, bobOffset);

        // Rotate to face direction of movement
        ctx.rotate(Math.atan2(this.speedY, this.speedX)); // Note: atan2(y, x) gives angle from x-axis

        // Draw fish body (circle)
        ctx.beginPath();
        ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Draw tail (animated)
        ctx.save();
        // Move to the back of the body
        ctx.translate(-this.size/2, 0);
        // Oscillate the tail
        ctx.rotate(tailOscillation);
        // Draw tail triangle
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-this.size, -this.size/3);
        ctx.lineTo(-this.size, this.size/3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw eye (circle)
        ctx.beginPath();
        ctx.arc(this.size/4, -this.size/4, this.size/8, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        // Draw eye pupil
        ctx.beginPath();
        ctx.arc(this.size/4, -this.size/4, this.size/16, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();

        // Restore context
        ctx.restore();
    }
}

// Array to hold all enemy fish
const enemies = [];
// Boss state
let boss = null;
let bossSpawned = false;
let bossMessageTimer = 0; // For the announcement timer

// Arrays for environment
const bubbles = [];
const particles = [];
const eatEffects = []; // for eating effects

// Initialize environment (bubbles and particles)
function initEnvironment() {
    // Clear existing
    bubbles.length = 0;
    particles.length = 0;
    eatEffects.length = 0;

    // Create bubbles
    for (let i = 0; i < 25; i++) {
        bubbles.push(new Bubble());
    }

    // Create particles
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle());
    }
}

// Spawn initial enemy fish (around 10)
function spawnInitialEnemies() {
    enemies.length = 0; // clear first
    for (let i = 0; i < 10; i++) {
        enemies.push(new EnemyFish());
    }
}

// Spawn the boss fish
function spawnBoss() {
    if (!bossSpawned) {
        boss = new BossFish();
        bossSpawned = true;
        bossMessageTimer = BOSS_MESSAGE_TIME; // Start the announcement timer
    }
}

// Update game timer and check for boss spawn
function updateGameTimer() {
    if (gameState === "playing") {
        // Increment time by 1/60 seconds (assuming 60fps)
        gameTime += 1/60;
        // Check if it's time to spawn the boss and we haven't spawned yet
        if (gameTime >= BOSS_SPAWN_TIME && !bossSpawned) {
            spawnBoss();
        }
    }
}

// Check collisions between player and enemies (normal fish)
function checkCollisions() {
    // Loop backwards so we can safely remove elements while iterating
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        // Calculate distance between centers
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate sum of radii (half sizes)
        const radiusSum = (player.size / 2) + (enemy.size / 2);

        // Check if circles overlap (collision)
        if (distance < radiusSum) {
            // Check if player is large enough to eat (at least 20% larger)
            if (player.size >= enemy.size * 1.2) {
                // Player eats the enemy

                // Increase player size (small growth based on enemy size)
                player.size += enemy.size * 0.05; // 5% of enemy size

                // Set visual feedback timer (e.g., 10 frames)
                player.growthFlash = 10;

                // Add score based on enemy size
                addScore(enemy.size);

                // Create eating effect at enemy's position
                eatEffects.push(new EatEffect(enemy.x, enemy.y, enemy.color));

                // Remove the eaten enemy
                enemies.splice(i, 1);

                // Spawn a new enemy to maintain population
                enemies.push(new EnemyFish());
            } else {
                // Enemy is too big -> game over
                gameState = "gameover";
            }
        }
    }
}

// Add score when eating an enemy
function addScore(enemySize) {
    // Scoring: enemy size * 10 (so size 20 = 200 points)
    const points = Math.floor(enemySize * 10);
    score += points;

    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        saveHighScore();
    }
}

// Win the game
function winGame() {
    gameState = "won";
    // Optional: add a win effect or just stop updates
}

// Draw ocean background with vertical gradient
function drawBackground() {
    // Create gradient: lighter at top (shallower), darker at bottom (deeper)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#001f3f');   // very dark blue (top)
    gradient.addColorStop(0.5, '#002b5e'); // medium blue
    gradient.addColorStop(1, '#000d1a');   // almost black (bottom)

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw the player fish (with optional growth flash and animation)
function drawPlayer() {
    // Calculate animation factors for player
    // Use distance to mouse as a proxy for speed
    const dx = mouseX - player.x;
    const dy = mouseY - player.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    const speedFactor = 0.5 + Math.min(1, distance / 200); // between 0.5 and 1.5
    const tailOscillation = Math.sin(Date.now() * 0.002 * speedFactor + player.tailPhase) * 0.3;
    const bobOffset = Math.sin(Date.now() * 0.001 * speedFactor + player.bobPhase) * 0.5;

    // Calculate angle from player to mouse (for rotation)
    const angle = Math.atan2(dy, dx); // Returns angle in radians

    // Save the current context state
    ctx.save();

    // Translate to player position
    ctx.translate(player.x, player.y);

    // Apply bob (vertical oscillation)
    ctx.translate(0, bobOffset);

    // Rotate by the calculated angle (so fish faces direction of movement)
    ctx.rotate(angle);

    // Apply growth flash effect if active
    let scale = 1.0;
    if (player.growthFlash > 0) {
        // Pulse effect: scale up to 1.2 when flash is high, down to 1.0 when low
        const flashProgress = player.growthFlash / 10; // 0 to 1
        scale = 1.0 + flashProgress * 0.2; // 1.0 to 1.2
        player.growthFlash--; // Decrease timer
    }

    // Apply scale if needed
    if (scale !== 1.0) {
        ctx.scale(scale, scale);
    }

    // Draw fish body (circle)
    ctx.beginPath();
    ctx.arc(0, 0, player.size/2, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();

    // Draw tail (animated)
    ctx.save();
    // Move to the back of the body
    ctx.translate(-player.size/2, 0);
    // Oscillate the tail
    ctx.rotate(tailOscillation);
    // Draw tail triangle
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-player.size, -player.size/3);
    ctx.lineTo(-player.size, player.size/3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw eye (circle)
    ctx.beginPath();
    ctx.arc(player.size/4, -player.size/4, player.size/8, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Draw eye pupil
    ctx.beginPath();
    ctx.arc(player.size/4, -player.size/4, player.size/16, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    // Restore the context to its original state
    ctx.restore();
}

// Keep player inside canvas boundaries
function constrainPlayer() {
    if (player.x < player.size/2) player.x = player.size/2;
    if (player.x > canvas.width - player.size/2) player.x = canvas.width - player.size/2;
    if (player.y < player.size/2) player.y = player.size/2;
    if (player.y > canvas.height - player.size/2) player.y = canvas.height - player.size/2;
}

// Draw game-over overlay
function drawGameOver() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Game Over text
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);

    // Sub text
    ctx.font = '24px Arial';
    ctx.fillText('You were eaten!', canvas.width / 2, canvas.height / 2);
    ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 40);
}

// Draw win overlay
function drawWin() {
    // Semi-transparent overlay (maybe a bit lighter for win?)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Win text
    ctx.fillStyle = '#00ff00'; // Bright green for win
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2 - 40);

    // Sub text
    ctx.font = '24px Arial';
    ctx.fillText('You became the biggest fish!', canvas.width / 2, canvas.height / 2);
    ctx.fillText('Click to play again', canvas.width / 2, canvas.height / 2 + 40);
}

// Format time in seconds to MM:SS
function formatTime(seconds) {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Draw the UI (score, high score, and timer)
function drawUI() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 20, 30);
    ctx.fillText(`BEST: ${highScore}`, 20, 60);
    // Timer in top-right
    ctx.textAlign = 'right';
    ctx.fillText(`TIME: ${formatTime(gameTime)}`, canvas.width - 20, 30);
}

// Draw the boss announcement message
function drawBossMessage() {
    if (bossMessageTimer > 0) {
        // Fade out effect
        const alpha = bossMessageTimer / BOSS_MESSAGE_TIME; // 1 to 0
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffff00'; // Yellow for announcement
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('A MASSIVE FISH HAS APPEARED!', canvas.width / 2, canvas.height / 2 - 100);
        ctx.restore();
        bossMessageTimer--;
    }
}

// Reset the game to initial state
function resetGame() {
    gameState = "playing";

    // Reset player
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.size = 30; // original size
    player.growthFlash = 0;
    player.tailPhase = Math.random() * Math.PI * 2;
    player.bobPhase = Math.random() * Math.PI * 2;

    // Reset score
    score = 0;

    // Reset game timer
    gameTime = 0;

    // Clear enemies and respawn
    enemies.length = 0; // clear array
    spawnInitialEnemies();

    // Reset boss state
    boss = null;
    bossSpawned = false;
    bossMessageTimer = 0;

    // Reset environment (bubbles, particles, eat effects)
    initEnvironment();
}

// Game loop
function gameLoop() {
    // Draw background (replaces clear)
    drawBackground();

    if (gameState === "playing") {
        // Smoothly move player towards mouse (with damping)
        const dx = mouseX - player.x;
        const dy = mouseY - player.y;
        player.x += dx * player.speed;
        player.y += dy * player.speed;

        // Keep player within bounds
        constrainPlayer();

        // Update game timer and check for boss spawn
        updateGameTimer();

        // Update and draw environment
        for (const bubble of bubbles) {
            bubble.update();
            bubble.draw();
        }
        for (const particle of particles) {
            particle.update();
            particle.draw();
        }
        for (let i = eatEffects.length - 1; i >= 0; i--) {
            if (!eatEffects[i].update()) {
                eatEffects.splice(i, 1);
            } else {
                eatEffects[i].draw();
            }
        }

        // Update and draw all enemy fish
        for (const enemy of enemies) {
            enemy.update();
            enemy.draw();
        }

        // Update and draw boss (if spawned)
        if (boss) {
            boss.update();
            boss.draw();
        }

        // Check for collisions (eating) with normal enemies
        checkCollisions();

        // Check for collision with boss
        if (boss) {
            // Calculate distance between centers
            const dx = player.x - boss.x;
            const dy = player.y - boss.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calculate sum of radii (half sizes)
            const radiusSum = (player.size / 2) + (boss.size / 2);

            // Check if circles overlap (collision)
            if (distance < radiusSum) {
                // Check if player is large enough to eat the boss (at least 20% larger)
                if (player.size >= boss.size * 1.2) {
                    // Player eats the boss -> win the game
                    winGame();
                } else {
                    // Boss is too big -> game over
                    gameState = "gameover";
                }
            }
        }

        // Draw the player (last, so it appears on top)
        drawPlayer();
    } else if (gameState === "gameover") {
        // gameover: draw environment and player without updating
        for (const bubble of bubbles) {
            bubble.draw();
        }
        for (const particle of particles) {
            particle.draw();
        }
        for (const effect of eatEffects) {
            effect.draw();
        }
        for (const enemy of enemies) {
            enemy.draw();
        }
        if (boss) {
            boss.draw();
        }
        drawPlayer();
    } else if (gameState === "won") {
        // won: draw environment and player without updating
        for (const bubble of bubbles) {
            bubble.draw();
        }
        for (const particle of particles) {
            particle.draw();
        }
        for (const effect of eatEffects) {
            effect.draw();
        }
        for (const enemy of enemies) {
            enemy.draw();
        }
        if (boss) {
            boss.draw();
        }
        drawPlayer();
    }

    // Draw the UI (score, high score, and timer) - visible in all states
    drawUI();

    // Draw boss announcement message (only during playing state and when timer > 0)
    if (gameState === "playing") {
        drawBossMessage();
    }

    // Draw game-over or win overlay if needed
    if (gameState === "gameover") {
        drawGameOver();
    } else if (gameState === "won") {
        drawWin();
    }

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Initialize everything
loadHighScore();
initEnvironment();
spawnInitialEnemies();
requestAnimationFrame(gameLoop);

// Add click event listener for restart
canvas.addEventListener('click', function() {
    if (gameState === "gameover" || gameState === "won") {
        resetGame();
    }
});

// Log initialization
console.log('Fish Game initialized. Player fish, enemy fish with tier system, eating mechanics, game-over, win condition based on timer, boss fish, score system, animated underwater environment, and enhanced animations added.');