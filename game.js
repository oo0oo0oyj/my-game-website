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
        
        // Movement speed
        this.moveSpeed = 25;
        
        // Obstacle types
        this.obstacleTypes = ['car', 'mine', 'oil'];
        
        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    init(playerName, carColor) {
        this.playerName = playerName;
        this.carColor = carColor;
        this.distance = 0;
        this.obstacles = [];
        this.carPosition = (this.canvas.width - this.carWidth) / 2;
        this.gameSpeed = 5;
        
        // Add keyboard event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Start the game loop
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    handleKeyDown(event) {
        if (event.key === 'ArrowLeft') {
            this.carPosition = Math.max(0, this.carPosition - this.moveSpeed);
        } else if (event.key === 'ArrowRight') {
            this.carPosition = Math.min(this.canvas.width - this.carWidth, this.carPosition + this.moveSpeed);
        }
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
                // Enemy car
                this.ctx.fillStyle = '#666';
                this.ctx.beginPath();
                this.ctx.moveTo(x + 25, y);
                this.ctx.lineTo(x + 45, y + 30);
                this.ctx.lineTo(x + 45, y + 60);
                this.ctx.lineTo(x + 5, y + 60);
                this.ctx.lineTo(x + 5, y + 30);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Windows
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(x + 10, y + 10, 30, 15);
                break;
                
            case 'mine':
                // Mine body
                this.ctx.fillStyle = '#333';
                this.ctx.beginPath();
                this.ctx.arc(x + 25, y + 25, 20, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Spikes
                this.ctx.fillStyle = '#666';
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const spikeX = x + 25 + Math.cos(angle) * 25;
                    const spikeY = y + 25 + Math.sin(angle) * 25;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + 25, y + 25);
                    this.ctx.lineTo(spikeX, spikeY);
                    this.ctx.lineWidth = 5;
                    this.ctx.strokeStyle = '#666';
                    this.ctx.stroke();
                }
                break;
                
            case 'oil':
                // Oil slick
                const gradient = this.ctx.createRadialGradient(
                    x + 25, y + 25, 5,
                    x + 25, y + 25, 25
                );
                gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.ellipse(x + 25, y + 25, 25, 20, 0, 0, Math.PI * 2);
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

    update() {
        this.frameCount++;
        this.distance += this.gameSpeed;
        this.roadOffset = (this.roadOffset + this.gameSpeed) % 80;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw road background
        this.drawRoadBackground();
        
        // Spawn new obstacles
        if (this.frameCount % this.obstacleSpawnRate === 0) {
            this.spawnObstacle();
        }
        
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
        
        // Draw car
        this.drawCar(this.carPosition, this.carY);
        
        // Draw distance
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Racing Sans One';
        this.ctx.fillText(`Distance: ${Math.floor(this.distance)}m`, 10, 30);
        
        // Continue game loop
        this.gameLoop = requestAnimationFrame(() => this.update());
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
        
        // Show end screen with results
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('endScreen').style.display = 'block';
        document.getElementById('finalName').textContent = this.playerName;
        document.getElementById('finalDistance').textContent = Math.floor(this.distance);
    }
}

// Game initialization
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    let selectedColor = '';

    // Color selection
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedColor = btn.dataset.color;
        });
    });

    // Start game button
    document.getElementById('startButton').addEventListener('click', () => {
        const playerName = document.getElementById('playerName').value.trim();
        
        if (!playerName) {
            alert('Please enter your name!');
            return;
        }
        
        if (!selectedColor) {
            alert('Please select a car color!');
            return;
        }
        
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        game.init(playerName, selectedColor);
    });

    // Restart game button
    document.getElementById('restartButton').addEventListener('click', () => {
        document.getElementById('endScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'block';
        selectedColor = '';
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
    });
}); 