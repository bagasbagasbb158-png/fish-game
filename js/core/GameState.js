// GameState.js - Manages game states and transitions
export class GameState {
    constructor() {
        // Possible game states
        this.states = {
            MENU: 'menu',
            PLAYING: 'playing',
            PAUSED: 'paused',
            GAMEOVER: 'gameover',
            WON: 'won',
            SHOP: 'shop',
            ACHIEVEMENTS: 'achievements',
            LEVEL_SELECT: 'level_select'
        };

        // Current state
        this.current = this.states.MENU;

        // Previous state (for returning from substates)
        this.previous = null;
    }

    // Get current state
    getCurrent() {
        return this.current;
    }

    // Set current state
    setCurrent(newState) {
        // Validate state
        if (Object.values(this.states).includes(newState)) {
            this.previous = this.current;
            this.current = newState;
            return true;
        }
        console.warn(`Invalid game state: ${newState}`);
        return false;
    }

    // Check if currently in a specific state
    is(state) {
        return this.current === state;
    }

    // Get previous state
    getPrevious() {
        return this.previous;
    }

    // Return to previous state
    returnToPrevious() {
        if (this.previous) {
            const temp = this.current;
            this.current = this.previous;
            this.previous = temp;
            return true;
        }
        return false;
    }

    // Reset to menu
    resetToMenu() {
        this.previous = this.current;
        this.current = this.states.MENU;
    }
}