class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.playerName = '';
        this.carColor = '';
        this.distance = 0;
        this.gameLoop = null;
        this.blocks = [];
        this.carPosition = 0; // Horizontal position of the car
        this.gameSpeed = 5;
        this.blockSpawnRate = 60;
        this.frameCount = 0;
        
        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 600;
        
        // Car dimensions
        this.carWidth = 50;
        this.carHeight = 90;
        this.carY = this.canvas.height - 100;
        
        // Block dimensions
        this.blockWidth = 60;
        this.blockHeight = 40;
        
        // Initialize car position to center
        this.carPosition = (this.canvas.width - this.carWidth) / 2;
        
        // Movement speed
        this.moveSpeed = 25; // Increased from 10 to 25
        
        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    init(playerName, carColor) {
        this.playerName = playerName;
        this.carColor = carColor;
        this.distance = 0;
        this.blocks = [];
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

    spawnBlock() {
        const x = Math.random() * (this.canvas.width - this.blockWidth);
        this.blocks.push({
            x: x,
            y: -this.blockHeight
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
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Spawn new blocks
        if (this.frameCount % this.blockSpawnRate === 0) {
            this.spawnBlock();
        }
        
        // Update and draw blocks
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            block.y += this.gameSpeed;
            
            // Draw block
            this.ctx.fillStyle = '#666';
            this.ctx.fillRect(block.x, block.y, this.blockWidth, this.blockHeight);
            
            // Check collision
            if (this.checkCollision(block)) {
                this.endGame();
                return;
            }
            
            // Remove blocks that are off screen
            if (block.y > this.canvas.height) {
                this.blocks.splice(i, 1);
            }
        }
        
        // Draw car using the new method
        this.drawCar(this.carPosition, this.carY);
        
        // Draw distance
        this.ctx.fillStyle = '#000';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Distance: ${Math.floor(this.distance)}m`, 10, 30);
        
        // Continue game loop
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    checkCollision(block) {
        return (
            this.carPosition < block.x + this.blockWidth &&
            this.carPosition + this.carWidth > block.x &&
            this.carY < block.y + this.blockHeight &&
            this.carY + this.carHeight > block.y
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