import * as lib from "./lib/lib.js"

const playerSprite = await lib.texture.loadImage("assets/player.png", 64, 64);
playerSprite.adjustColor(1, 0.5, 0);

const bulletSprite = await lib.texture.loadImage("assets/bullet1.png", 24, 24);
bulletSprite.rotate(Math.PI);

const enemySprite = await  lib.texture.loadImage("assets/enemy1.png", 48, 48);
enemySprite.adjustColor(0.2, 0.2, 1);

const explosionSprites = [
    await lib.texture.loadImage(`assets/explosion1.png`, 64, 64),
    await lib.texture.loadImage(`assets/explosion2.png`, 64, 64),
    await lib.texture.loadImage(`assets/explosion3.png`, 64, 64),
    await lib.texture.loadImage(`assets/explosion4.png`, 64, 64),
];
for (const texture of explosionSprites) {
    texture.adjustColor(1, 0.75, 0);
}

const playerSpeed = 300;
let playerX = 0;

const bulletSpeed = 400;
const bulletCoolDown = 0.5;
let bullets = [];
// the first shot should not have cooldown
let bulletCooldownTimer = bulletCoolDown;

let enemies = [];

const explosionDuration = 0.5;
let explosions = [];

function loop() {
    bulletCooldownTimer += lib.frameDeltaT;

    updatePlayerMovement();
    updateBulletMovement();
    handleBulletCollisions();
    updateExplosions();

    if (enemies.length === 0) {
        spawnEnemies();
    }

    const cx = lib.canvas;
    
    cx.clear("black");
    cx.putTexture(playerSprite, playerX, 300);

    for (const bullet of bullets) {
        cx.putTexture(bulletSprite, bullet.x, bullet.y);
    }
    
    for (const enemy of enemies) {
        cx.putTexture(enemySprite, enemy.x, enemy.y);
    }


    for (const explosion of explosions) {

        // goes from 0.0 to 1.0
        const animationFraction = explosion.time / explosionDuration;

        // goes from 0.0 to 4.0
        const spriteIdxFraction = animationFraction * explosionSprites.length;

        // is either of 0, 1, 2 or 3
        const spriteIdx = Math.floor(spriteIdxFraction);

        const texture = explosionSprites[spriteIdx];

        cx.putTexture(texture, explosion.x - 32, explosion.y - 32);
    }
}

function spawnEnemies() {
    const rows = 2;
    const columns = 5;

    for (let y = 0; y < rows; ++y) {
        for (let x = 0; x < columns; ++x) {

            enemies.push({
                x: x * 100 + 10,
                y: y * 80 + 10,
            });
        }
    }
}

function updatePlayerMovement() {
    const goLeft = lib.isPressed("ArrowLeft");
    const goRight = lib.isPressed("ArrowRight");

    if (goLeft && !goRight) {
        // player should go left
        playerX -= playerSpeed * lib.frameDeltaT;
        
        if (playerX < 0) {
            playerX = 0;
        }
    } else if (goRight && !goLeft) {
        // player should go right
        playerX += playerSpeed * lib.frameDeltaT;

        if (playerX >= lib.canvas.width - playerSprite.width) {
            playerX = lib.canvas.width - playerSprite.width;
        }
    }
}

function updateBulletMovement() {
    for (const bullet of bullets) {
        bullet.y -= bulletSpeed * lib.frameDeltaT;
    }
}

function handleBulletCollisions() {
    let deadEnemies = [];
    let deadBullets = [];

    for (let enemyIdx = 0; enemyIdx < enemies.length; ++enemyIdx) {

        const enemy = enemies[enemyIdx];

        for (let bulletIdx = 0; bulletIdx < bullets.length; ++bulletIdx) {

            const bullet = bullets[bulletIdx];

            const isColliding = rectsAreColliding(
                bullet.x, bullet.y, 24, 24,
                enemy.x, enemy.y, 48, 48,
            );
            if (isColliding) {
                deadBullets.push(bulletIdx);
                deadEnemies.push(enemyIdx);

                explosions.push({
                    x: enemy.x + 24,
                    y: enemy.y + 24,
                    time: 0,
                });
            }
        }
    }

    for (const i of deadEnemies.toReversed()) {
        enemies.splice(i, 1)
    }
    for (const i of deadBullets.toReversed()) {
        bullets.splice(i, 1)
    }
}

function rectsAreColliding(
    aX, aY, aWidth, aHeight,
    bX, bY, bWidth, bHeight,
) {
    return aX < bX + bWidth
        && aX + aWidth >= bX
        && aY < bY + bHeight
        && aY + aHeight >= bY;
}

function updateExplosions() {
    let deadExplosions = [];

    for (let i = 0; i < explosions.length; ++i) {
        const explosion = explosions[i];

        explosion.time += lib.frameDeltaT;

        if (explosion.time > explosionDuration) {
            deadExplosions.push(i);
        }
    }

    for (const i of deadExplosions.toReversed()) {
        explosions.splice(i, 1)
    }
}

lib.onPress(" ", () => {
    if (bulletCooldownTimer >= bulletCoolDown) {
        bulletCooldownTimer = 0;

        bullets.push({ x: playerX + 20, y: 300 });
    }
});

lib.startGame(loop);
