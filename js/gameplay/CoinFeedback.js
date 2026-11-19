// CoinFeedback.js - Visual feedback for earning coins
export class CoinFeedback {
    constructor(amount, x, y) {
        this.text = `+${amount} 🪙`;
        this.x = x;
        this.y = y;
        this.life = 1.0; // 1.0 to 0.0
        this.speed = 20; // pixels per second upward
        this.startTime = Date.now();
        this.duration = 1500; // 1.5 seconds
    }

    update() {
        const elapsed = Date.now() - this.startTime;
        this.life = 1.0 - (elapsed / this.duration);
        // Move upward
        this.y -= (this.speed * (16.67 / 1000)); // approximate for 60fps: 16.67 ms per frame
    }

    isDead() {
        return this.life <= 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = '#ffff00'; // Yellow
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}