export class InputManager {
    constructor() {
        // storage for key states: { "ArrowUp": true, "KeyW": false }
        this.activeKeys = {};
        
        // Mappings for logical actions
        this.bindings = {
            UP: ['ArrowUp', 'KeyW'],
            DOWN: ['ArrowDown', 'KeyS'],
            LEFT: ['ArrowLeft', 'KeyA'],
            RIGHT: ['ArrowRight', 'KeyD'],
            INTERACT: ['Space', 'Enter']
        };
        
        this.lastDirection = null;
    }

    init() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        console.log("Input System Initialized");
    }

    onKeyDown(e) {
        this.activeKeys[e.code] = true;

        // Prevent scrolling with arrows/space
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
            e.preventDefault();
        }
    }

    onKeyUp(e) {
        this.activeKeys[e.code] = false;
    }

    /**
     * Returns true if any key bound to the action is held down.
     * Example: Input.isDown('UP') -> true if W or Up Arrow is pressed.
     */
    isDown(action) {
        const keys = this.bindings[action];
        if (!keys) return false;
        return keys.some(key => this.activeKeys[key]);
    }

    /**
     * Returns a simple vector {x: -1/0/1, y: -1/0/1} based on input.
     * Used for grid movement logic.
     */
    getMovementVector() {
        let dx = 0;
        let dy = 0;

        if (this.isDown('UP')) dy = -1;
        if (this.isDown('DOWN')) dy = 1;
        if (this.isDown('LEFT')) dx = -1;
        if (this.isDown('RIGHT')) dx = 1;

        // Prevent diagonal movement if you want strictly grid-based (Optional)
        // For now, we allow it, but we can clamp it in the Player script later.
        
        return { x: dx, y: dy };
    }
}

// Export a single instance so we don't have multiple listeners
export const Input = new InputManager();