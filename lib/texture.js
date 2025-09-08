
export class Texture {
    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.canvas = canvas;
    }

    /**
     * 
     * @param {HTMLImageElement} imageElement 
     * @returns {Texture}
     */
    static fromImage(imageElement) {
        const canvas = new OffscreenCanvas(imageElement.width, imageElement.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imageElement, 0, 0);
        return new Texture(canvas);
    }

    get width() {
        return this.canvas.width;
    }
    get height() {
        return this.canvas.height;
    }

    set width(value) {
        const newCanvas = new OffscreenCanvas(value, this.canvas.height);
        const ctx = newCanvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.canvas, 0, 0, value, this.canvas.height);
        this.canvas = newCanvas;
    }
    set height(value) {
        const newCanvas = new OffscreenCanvas(this.canvas.width, value);
        const ctx = newCanvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.canvas, 0, 0, this.canvas.width, value);
        this.canvas = newCanvas;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x 
     * @param {number} y 
     */
    draw(ctx, x, y) {
        ctx.drawImage(this.canvas, x, y);
    }

    /**
     * 
     * @param {number} red 
     * @param {number} green 
     * @param {number} blue 
     */
    adjustColor(red, green, blue) {
        const ctx = this.canvas.getContext("2d");
        const data = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < data.height; ++y) {
            for (let x = 0; x < data.width; ++x) {
                const idx = y * (data.width * 4) + x * 4;
                data.data[idx] *= red;
                data.data[idx + 1] *= green;
                data.data[idx + 2] *= blue;
            }
        }
        ctx.putImageData(data, 0, 0);
    }

    rotate(angle) {
        const { width, height } = this;
        const newCanvas = new OffscreenCanvas(width, height);
        const newCtx = newCanvas.getContext("2d");
        newCtx.imageSmoothingEnabled = false;
        newCtx.save();
        newCtx.translate(width / 2, height / 2)
        newCtx.rotate(angle)
        newCtx.drawImage(this.canvas, -width / 2, -height / 2, width, height);
        newCtx.restore();
        this.canvas = newCanvas;
    }

    copy() {
        const { width, height } = this;
        const newCanvas = new OffscreenCanvas(width, height);
        const newCtx = newCanvas.getContext("2d");
        newCtx.imageSmoothingEnabled = false;
        newCtx.drawImage(this.canvas, -width / 2, -height / 2, width, height);
        return new Texture(newCanvas);
    }
}

/**
 * 
 * @param {string} path 
 * @param {number} [width]
 * @param {number} [height]
 * @returns {Promise<Texture>}
 */
export function loadImage(path, width, height) {
    const image = document.createElement("img");
    image.src = path;
    return new Promise((resolve) => {
        image.onload = () => {
            const texture = Texture.fromImage(image);
            if (width !== undefined) {
                texture.width = width;
            }
            if (height !== undefined) {
                texture.height = height;
            }
            resolve(texture);
        }
    });
}
