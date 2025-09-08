
export * as canvas from "./canvas.js"
export * as texture from "./texture.js"

export let frameDeltaT = 0;

/**
 * Start a game.
 * 
 * @param {() => void} loopFunction Run every frame
 */
export function startGame(loopFunction) {
    let before = Date.now();
    setInterval(() => {
        const now = Date.now();
        frameDeltaT = (now - before) / 1000;
        before = now;

        loopFunction();
    }, 16);
}

const keysPressed = new Set();
const keyPressHandlers = new Map();
const keyReleaseHandlers = new Map();

document.body.addEventListener("keydown", (ev) => {
    keysPressed.add(ev.key);
    keyPressHandlers.get(ev.key)?.();
});

document.body.addEventListener("keyup", (ev) => {
    keysPressed.delete(ev.key);
    keyReleaseHandlers.get(ev.key)?.();
});

/**
 * If a key is currently being pressed.
 * @param {string} key 
 * @returns {boolean}
 */
export function isPressed(key) {
    return keysPressed.has(key);
}

/**
 * When a key is pressed (key down).
 * @param {string} key 
 * @param {() => void} handlerFunction 
 */
export function onPress(key, handlerFunction) {
    keyPressHandlers.set(key, handlerFunction);
}

/**
 * When a key is released (key up).
 * @param {string} key 
 * @param {() => void} handlerFunction 
 */
export function onRelease(key, handlerFunction) {
    keyReleaseHandlers.set(key, handlerFunction);
}





