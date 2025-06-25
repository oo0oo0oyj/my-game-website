class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.playerName = '';
        this.carColor = '';
        this.distance = 0;
        this.gameLoop = null;
        this.obstacles = [];
        this.carPosition = 0;
        this.gameSpeed = 5;
        this.obstacleSpawnRate = 100;
        this.frameCount = 0;
        this.roadOffset = 0;
        
        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 600;
        
        // Car dimensions
        this.carWidth = 50;
        this.carHeight = 90;
        this.carY = this.canvas.height - 100;
        
        // Initialize car position to center
        this.carPosition = (this.canvas.width - this.carWidth) / 2;
        
        // Movement control variables
        this.targetCarPosition = this.carPosition;
        this.moveSpeed = 15; // Reduced from 25
        this.movementLerp = 0.08; // Reduced from 0.15 for slower response
        this.isMovingLeft = false;
        this.isMovingRight = false;
        this.difficulty = 'normal'; // 'easy', 'normal', 'hard'
        
        // Obstacle types
        this.obstacleTypes = ['car', 'mine', 'oil'];
        
        // Touch control variables
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minSwipeDistance = 30;
        this.isTouching = false;
        this.lastTouchX = 0;
        
        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.preventScroll = this.preventScroll.bind(this);
    }

    init(playerName, carColor, difficulty = 'normal') {
        this.playerName = playerName;
        this.carColor = carColor;
        this.difficulty = difficulty;
        this.distance = 0;
        this.obstacles = [];
        
        // Reset car position to center
        this.carPosition = (this.canvas.width - this.carWidth) / 2;
        this.targetCarPosition = this.carPosition;
        
        // Reset movement flags
        this.isMovingLeft = false;
        this.isMovingRight = false;
        
        // Set game parameters based on difficulty
        switch(difficulty) {
            case 'easy':
                this.gameSpeed = 4;
                this.obstacleSpawnRate = 120;
                break;
            case 'normal':
                this.gameSpeed = 5;
                this.obstacleSpawnRate = 100;
                break;
            case 'hard':
                this.gameSpeed = 6;
                this.obstacleSpawnRate = 80;
                break;
        }
        
        // Remove any existing event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        document.removeEventListener('touchmove', this.preventScroll);
        
        // Add event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: true });
        document.addEventListener('touchmove', this.preventScroll, { passive: false });
        
        // Start the game loop
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    preventScroll(e) {
        if (this.isTouching) {
            e.preventDefault();
        }
    }

    handleKeyDown(event) {
        if (event.key === 'ArrowLeft') {
            this.isMovingLeft = true;
        } else if (event.key === 'ArrowRight') {
            this.isMovingRight = true;
        }
    }

    handleKeyUp(event) {
        if (event.key === 'ArrowLeft') {
            this.isMovingLeft = false;
            // Set target to current position when stopping
            this.targetCarPosition = this.carPosition;
        } else if (event.key === 'ArrowRight') {
            this.isMovingRight = false;
            // Set target to current position when stopping
            this.targetCarPosition = this.carPosition;
        }
    }

    handleTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.lastTouchX = touch.clientX;
        this.isTouching = true;
    }

    handleTouchMove(event) {
        event.preventDefault();
        if (!this.isTouching) return;
        
        const touch = event.touches[0];
        const currentX = touch.clientX;
        const diffX = currentX - this.lastTouchX;
        
        // Move car with enhanced smoothness
        const sensitivity = 1.2; // Adjust this value to control movement sensitivity
        const newPosition = this.carPosition + (diffX * sensitivity);
        this.carPosition = Math.max(0, Math.min(this.canvas.width - this.carWidth, newPosition));
        
        this.lastTouchX = currentX;
    }

    handleTouchEnd(event) {
        this.isTouching = false;
        this.touchStartX = 0;
        this.lastTouchX = 0;
        // Set target to current position when touch ends
        this.targetCarPosition = this.carPosition;
    }

    drawRoadBackground() {
        // Draw road
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw side lines
        this.ctx.fillStyle = '#FF5722';
        this.ctx.fillRect(0, 0, 10, this.canvas.height);
        this.ctx.fillRect(this.canvas.width - 10, 0, 10, this.canvas.height);
        
        // Draw center lines
        const lineHeight = 30;
        const lineGap = 50;
        const totalLines = Math.ceil(this.canvas.height / (lineHeight + lineGap));
        
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < totalLines; i++) {
            const y = ((this.roadOffset + i * (lineHeight + lineGap)) % this.canvas.height) - lineHeight;
            this.ctx.fillRect(this.canvas.width / 2 - 5, y, 10, lineHeight);
        }
    }

    drawObstacle(obstacle) {
        const x = obstacle.x;
        const y = obstacle.y;
        
        switch(obstacle.type) {
            case 'car':
                // Enemy car with enhanced design
                // Car body
                this.ctx.fillStyle = '#444';
                this.ctx.beginPath();
                this.ctx.moveTo(x + 25, y);
                this.ctx.lineTo(x + 45, y + 20);
                this.ctx.lineTo(x + 45, y + 70);
                this.ctx.lineTo(x + 5, y + 70);
                this.ctx.lineTo(x + 5, y + 20);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Windows
                this.ctx.fillStyle = '#222';
                this.ctx.fillRect(x + 10, y + 15, 30, 20);
                
                // Headlights
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(x + 8, y + 5, 8, 5);
                this.ctx.fillRect(x + 34, y + 5, 8, 5);
                
                // Taillights
                this.ctx.fillStyle = '#FF0000';
                this.ctx.fillRect(x + 8, y + 65, 8, 5);
                this.ctx.fillRect(x + 34, y + 65, 8, 5);
                break;
                
            case 'mine':
                // Animated mine with pulsing effect
                const pulseScale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
                
                // Mine body with gradient
                const mineGradient = this.ctx.createRadialGradient(
                    x + 25, y + 25, 5,
                    x + 25, y + 25, 20 * pulseScale
                );
                mineGradient.addColorStop(0, '#FF4444');
                mineGradient.addColorStop(1, '#880000');
                
                this.ctx.fillStyle = mineGradient;
                this.ctx.beginPath();
                this.ctx.arc(x + 25, y + 25, 20 * pulseScale, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Spikes with rotation
                const rotation = Date.now() * 0.002;
                this.ctx.strokeStyle = '#666';
                this.ctx.lineWidth = 3;
                
                for (let i = 0; i < 8; i++) {
                    const angle = rotation + (i / 8) * Math.PI * 2;
                    const spikeX = x + 25 + Math.cos(angle) * 25 * pulseScale;
                    const spikeY = y + 25 + Math.sin(angle) * 25 * pulseScale;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + 25, y + 25);
                    this.ctx.lineTo(spikeX, spikeY);
                    this.ctx.stroke();
                }
                break;
                
            case 'oil':
                // Animated oil slick with rainbow effect
                const oilGradient = this.ctx.createRadialGradient(
                    x + 25, y + 25, 5,
                    x + 25, y + 25, 30
                );
                
                // Create rainbow-like effect
                const hue = (Date.now() * 0.1) % 360;
                oilGradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.8)`);
                oilGradient.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 100%, 50%, 0.5)`);
                oilGradient.addColorStop(1, `hsla(${(hue + 120) % 360}, 100%, 50%, 0.2)`);
                
                this.ctx.fillStyle = oilGradient;
                this.ctx.beginPath();
                this.ctx.ellipse(
                    x + 25, 
                    y + 25, 
                    30 + Math.sin(Date.now() * 0.005) * 5, 
                    25 + Math.sin(Date.now() * 0.005) * 5, 
                    Date.now() * 0.001, 
                    0, 
                    Math.PI * 2
                );
                this.ctx.fill();
                break;
        }
    }

    spawnObstacle() {
        const type = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
        const x = Math.random() * (this.canvas.width - 50);
        this.obstacles.push({
            x: x,
            y: -50,
            type: type
        });
    }

    drawCar(x, y) {
        // Save the current context state
        this.ctx.save();
        
        // Main car body
        this.ctx.fillStyle = this.carColor;
        
        // Car body - bottom part (wider)
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + this.carHeight * 0.8);
        this.ctx.lineTo(x + this.carWidth, y + this.carHeight * 0.8);
        this.ctx.lineTo(x + this.carWidth * 0.9, y + this.carHeight);
        this.ctx.lineTo(x + this.carWidth * 0.1, y + this.carHeight);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Car body - top part (sleek)
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.carWidth * 0.2, y + this.carHeight * 0.8);
        this.ctx.lineTo(x + this.carWidth * 0.8, y + this.carHeight * 0.8);
        this.ctx.lineTo(x + this.carWidth * 0.7, y + this.carHeight * 0.2);
        this.ctx.lineTo(x + this.carWidth * 0.3, y + this.carHeight * 0.2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Windshield
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.carWidth * 0.3, y + this.carHeight * 0.3);
        this.ctx.lineTo(x + this.carWidth * 0.7, y + this.carHeight * 0.3);
        this.ctx.lineTo(x + this.carWidth * 0.65, y + this.carHeight * 0.2);
        this.ctx.lineTo(x + this.carWidth * 0.35, y + this.carHeight * 0.2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Wheels
        this.ctx.fillStyle = '#333';
        // Front wheel
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + this.carWidth * 0.25,
            y + this.carHeight * 0.9,
            this.carWidth * 0.12,
            this.carHeight * 0.1,
            0,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Rear wheel
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + this.carWidth * 0.75,
            y + this.carHeight * 0.9,
            this.carWidth * 0.12,
            this.carHeight * 0.1,
            0,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Wheel rims
        this.ctx.fillStyle = '#DDD';
        [0.25, 0.75].forEach(wheelX => {
            this.ctx.beginPath();
            this.ctx.ellipse(
                x + this.carWidth * wheelX,
                y + this.carHeight * 0.9,
                this.carWidth * 0.06,
                this.carHeight * 0.05,
                0,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
        
        // Add shine/reflection
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.carWidth * 0.35, y + this.carHeight * 0.25);
        this.ctx.lineTo(x + this.carWidth * 0.65, y + this.carHeight * 0.25);
        this.ctx.lineTo(x + this.carWidth * 0.6, y + this.carHeight * 0.4);
        this.ctx.lineTo(x + this.carWidth * 0.4, y + this.carHeight * 0.4);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add side details (air intakes)
        this.ctx.fillStyle = '#222';
        // Left intake
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.carWidth * 0.1, y + this.carHeight * 0.6);
        this.ctx.lineTo(x + this.carWidth * 0.2, y + this.carHeight * 0.6);
        this.ctx.lineTo(x + this.carWidth * 0.2, y + this.carHeight * 0.7);
        this.ctx.lineTo(x + this.carWidth * 0.1, y + this.carHeight * 0.75);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Right intake
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.carWidth * 0.8, y + this.carHeight * 0.6);
        this.ctx.lineTo(x + this.carWidth * 0.9, y + this.carHeight * 0.6);
        this.ctx.lineTo(x + this.carWidth * 0.9, y + this.carHeight * 0.75);
        this.ctx.lineTo(x + this.carWidth * 0.8, y + this.carHeight * 0.7);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Restore the context state
        this.ctx.restore();
    }

    updateCarPosition() {
        // Update target position based on input
        if (this.isMovingLeft) {
            this.targetCarPosition = Math.max(0, this.targetCarPosition - this.moveSpeed);
            // Apply smooth movement only when moving
            this.carPosition += (this.targetCarPosition - this.carPosition) * this.movementLerp;
        } else if (this.isMovingRight) {
            this.targetCarPosition = Math.max(0, Math.min(this.canvas.width - this.carWidth, this.targetCarPosition + this.moveSpeed));
            // Apply smooth movement only when moving
            this.carPosition += (this.targetCarPosition - this.carPosition) * this.movementLerp;
        } else {
            // When no keys are pressed, immediately stop by setting current position to target
            this.carPosition = this.targetCarPosition;
        }
        
        // Ensure both positions stay within bounds
        this.targetCarPosition = Math.max(0, Math.min(this.canvas.width - this.carWidth, this.targetCarPosition));
        this.carPosition = Math.max(0, Math.min(this.canvas.width - this.carWidth, this.carPosition));
    }

    update() {
        this.frameCount++;
        this.distance += this.gameSpeed;
        this.roadOffset = (this.roadOffset + this.gameSpeed) % 80;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update car position
        this.updateCarPosition();
        
        // Draw road background with moving effect
        this.drawRoadBackground();
        
        // Update and draw obstacles
        this.updateObstacles();
        
        // Draw car
        this.drawCar(this.carPosition, this.carY);
        
        // Draw distance
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Racing Sans One';
        this.ctx.fillText(`Distance: ${Math.floor(this.distance)}m`, 10, 30);
        
        // Spawn new obstacles
        if (this.frameCount % this.obstacleSpawnRate === 0) {
            this.spawnObstacle();
        }
        
        // Update road animation
        this.roadOffset += this.gameSpeed;
        if (this.roadOffset >= this.canvas.height) {
            this.roadOffset = 0;
        }
        
        // Continue game loop
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    updateObstacles() {
        // Update and draw obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += this.gameSpeed;
            
            this.drawObstacle(obstacle);
            
            // Check collision
            if (this.checkCollision(obstacle)) {
                this.endGame();
                return;
            }
            
            // Remove obstacles that are off screen
            if (obstacle.y > this.canvas.height) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    checkCollision(obstacle) {
        // Adjust collision box size based on obstacle type
        let obstacleWidth = 50;
        let obstacleHeight = 50;
        
        if (obstacle.type === 'car') {
            obstacleHeight = 60;
        } else if (obstacle.type === 'oil') {
            obstacleWidth = 40;
            obstacleHeight = 40;
        }
        
        return (
            this.carPosition < obstacle.x + obstacleWidth &&
            this.carPosition + this.carWidth > obstacle.x &&
            this.carY < obstacle.y + obstacleHeight &&
            this.carY + this.carHeight > obstacle.y
        );
    }

    endGame() {
        cancelAnimationFrame(this.gameLoop);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        // Remove touch event listeners
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        
        // Show end screen with results
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('endScreen').style.display = 'block';
        document.getElementById('finalDistance').textContent = Math.floor(this.distance);
    }
}

// Game initialization
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    let selectedColor = 'red';
    let selectedDifficulty = 'normal';

    // Color selection
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.style.border = 'none');
            btn.style.border = '2px solid white';
            selectedColor = btn.dataset.color;
        });
    });

    // Difficulty selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDifficulty = btn.dataset.difficulty;
        });
    });

    // Start game
    document.getElementById('startButton').addEventListener('click', () => {
        const playerName = document.getElementById('playerName').value || 'Player';
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        game.init(playerName, selectedColor, selectedDifficulty);
    });

    // Restart game
    document.getElementById('restartButton').addEventListener('click', () => {
        document.getElementById('endScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'block';
    });
}); 