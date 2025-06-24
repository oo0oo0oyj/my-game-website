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
        this.carWidth = 40;
        this.carHeight = 60;
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
        
        // Draw car
        this.ctx.fillStyle = this.carColor;
        this.ctx.fillRect(this.carPosition, this.carY, this.carWidth, this.carHeight);
        
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