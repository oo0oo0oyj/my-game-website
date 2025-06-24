const { createCanvas } = require('canvas');
const fs = require('fs');

function drawCarIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Set background
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, size, size);
    
    // Calculate relative sizes
    const carWidth = size * 0.6;
    const carHeight = size * 0.4;
    const x = (size - carWidth) / 2;
    const y = (size - carHeight) / 2;
    
    // Draw car body
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.moveTo(x, y + carHeight * 0.8);
    ctx.lineTo(x + carWidth, y + carHeight * 0.8);
    ctx.lineTo(x + carWidth * 0.8, y + carHeight * 0.2);
    ctx.lineTo(x + carWidth * 0.2, y + carHeight * 0.2);
    ctx.closePath();
    ctx.fill();
    
    // Draw wheels
    const wheelRadius = size * 0.1;
    ctx.fillStyle = '#333';
    // Left wheels
    ctx.beginPath();
    ctx.arc(x + wheelRadius * 1.5, y + carHeight * 0.9, wheelRadius, 0, Math.PI * 2);
    ctx.arc(x + carWidth - wheelRadius * 1.5, y + carHeight * 0.9, wheelRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(x + carWidth * 0.2, y + carHeight * 0.2);
    ctx.lineTo(x + carWidth * 0.4, y + carHeight * 0.2);
    ctx.lineTo(x + carWidth * 0.3, y + carHeight * 0.4);
    ctx.closePath();
    ctx.fill();
    
    return canvas;
}

// Generate icons
[192, 512].forEach(size => {
    const canvas = drawCarIcon(size);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icon-${size}.png`, buffer);
    console.log(`Generated icon-${size}.png`);
}); 