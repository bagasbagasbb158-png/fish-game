// TimerSystem.js - Handles game time
export class TimerSystem {
    constructor(game) {
        this.game = game;
        this.elapsedTime = 0; // in seconds
    }

    update(deltaTime) {
        // deltaTime is in milliseconds
        this.elapsedTime += deltaTime / 1000;
    }

    getElapsedTime() {
        return this.elapsedTime;
    }

    reset() {
        this.elapsedTime = 0;
    }

    start() {
        // Not needed if we reset and then start updating
        this.elapsedTime = 0;
    }

    stop() {
        // Not needed, we just stop updating
    }
}