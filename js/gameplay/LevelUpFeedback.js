// LevelUpFeedback.js - Visual feedback for leveling up
export class LevelUpFeedback {
    constructor(newLevel) {
        this.text = `LEVEL UP!\nLEVEL ${newLevel}`;
        this.x = 0; // Will be set to center horizontally
        this.y = 0; // Will be set to center vertically
        this.life = 1.0; // 1.0 to 0.0
        this.startTime = Date.now();
        this.duration = 2000; // 2 seconds
        this.scale = 0.5; // Start small and grow
        this.maxScale = 1.5; // Maximum scale
        this.pulseSpeed = 3; // How fast it pulses
    }

    update() {
        const elapsed = Date.now() - this.startTime;
        this.life = 1.0 - (elapsed / this.duration);

        // Pulse effect: grow then shrink
        const progress = elapsed / this.duration;
        if (progress < 0.5) {
            // First half: grow from 0.5 to maxScale
            this.scale = 0.5 + (this.maxScale - 0.5) * (progress / 0.5);
        } else {
            // Second half: shrink from maxScale to 0
            this.scale = this.maxScale * (1 - (progress - 0.5) / 0.5);
        }
    }

    isDead() {
        return this.life <= 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;

        // Center the text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Move to center of canvas
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

        // Apply scale
        ctx.scale(this.scale, this.scale);

        // Text styling
        ctx.fillStyle = '#ffff00'; // Yellow
        ctx.strokeStyle = '#000000'; // Black outline
        ctx.lineWidth = 3;
        ctx.font = 'bold 48px Arial';

        // Draw outline
        ctx.strokeText(this.text, 0, 0);
        // Draw fill
        ctx.fillText(this.text, 0, 0);

        ctx.restore();
    }
}