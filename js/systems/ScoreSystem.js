// ScoreSystem.js - Handles match score
export class ScoreSystem {
    constructor(game) {
        this.game = game;
        this.score = 0;
    }

    addScore(points) {
        this.score += Math.max(0, points);
        const best = this.game.getSaveSystem().get('bestScore') || 0;
        if (this.score > best) this.game.getSaveSystem().set('bestScore', this.score);
        this.game.emitEvent('scoreChanged', this.score);
    }

    getScore() {
        return this.score;
    }

    reset() {
        this.score = 0;
        this.game.emitEvent('scoreChanged', this.score);
    }
}
