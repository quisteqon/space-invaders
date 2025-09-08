import { Texture } from "./texture.js";

/** @type {HTMLCanvasElement} */
const htmlCanvas = document.querySelector("#game");
const ctx = htmlCanvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

export const width = htmlCanvas.width;
export const height = htmlCanvas.height;

/**
 * Clear canvas with a color.
 * @param {string} color
 */
export function clear(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
}

/**
 * Draw a filled rectangle.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} color 
 */
export function fillRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

/**
 * Draw a rectangle outline.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} color 
 */
export function strokeRect(x, y, width, height, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
}

/**
 * 
 * @param {Texture} texture
 * @param {number} x
 * @param {number} y
 */
export function putTexture(texture, x, y) {
    texture.draw(ctx, x, y);
}

/**
 * 
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {string} color 
 */
export function putText(text, x, y, color) {
    const fontSize = 24;
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillText(text, x, y + fontSize);
}
