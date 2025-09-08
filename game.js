"use strict";
import * as lib from "./lib/lib.js"

// === SPRITES ===

const playerSprite = await lib.texture.loadImage("assets/player.png", 64, 64);
playerSprite.adjustColor(1, 0.5, 0);

const enemySprite = await lib.texture.loadImage("assets/enemy1.png", 48, 48);
enemySprite.adjustColor(0.2, 0.2, 1);

const bulletSprite = await lib.texture.loadImage("assets/bullet1.png", 24, 24);
bulletSprite.rotate(Math.PI);

const enemybulletSprite = await lib.texture.loadImage("assets/bullet1.png", 24, 24)

const powerupSprite = await lib.texture.loadImage("assets/player.png", 64, 64);
powerupSprite.adjustColor(0, 1, 0);


const explosionSprites = [
    await lib.texture.loadImage(`assets/explosion1.png`, 64, 64),
    await lib.texture.loadImage(`assets/explosion2.png`, 64, 64),
    await lib.texture.loadImage(`assets/explosion3.png`, 64, 64),
    await lib.texture.loadImage(`assets/explosion4.png`, 64, 64),
];


for (const texture of explosionSprites) {
    texture.adjustColor(1, 0.75, 0);
}
const gameoverSprite = await lib.texture.loadImage("assets/gameover.png", 480, 360);
// === DATA ===
let firstUpdate = true;
let gamerunning = true;

let playerspeedstart = 300
let playerSpeed = playerspeedstart;
let player = { x: 0, y: 360 - 64 - 10 };

let enemies = [];

const bulletSpeed = 400;
let bullets = [];

const bulletCoolDown = 0.5;
let bulletCooldownTimer = 0;

const explosionDuration = 0.5;
let explosions = [];

let enemybullets = [];

const enemybulletSpeedStart = 400
let enemybulletSpeed = enemybulletSpeedStart;

const enemybulletCoolDownStart = 1.5;
let enemybulletCoolDown = enemybulletCoolDownStart;
let enemybulletCooldownTimer = bulletCoolDown;

let lvl = 1;

const gameoverScreenDelay = 1;
let gameoverScreenTimer = 0;
// === LOGIC ===

function loop() {
    if (gamerunning) {
        tick();
    }
    render();
    gameoverScreenTimer += lib.frameDeltaT;
}

function tick() {
    bulletCooldownTimer += lib.frameDeltaT;
    enemybulletCooldownTimer -= lib.frameDeltaT;

    updatePlayerMovement();
    updateBulletMovement();
    updateEnemyBulletMovement();
    spawnenemybullets()
    handleBulletCollisions();
    handleenemyBulletCollisions()

    updateExplosions();

    
    if (firstUpdate) {
        spawnEnemies();
    }
    if (enemies.length === 0) {
        spawnEnemies();
        newLevel();
    }
    firstUpdate = false;
}

function newLevel() {
    lvl = lvl + 1
    enemybulletSpeed = enemybulletSpeed + 50
    enemybulletCoolDown = enemybulletCoolDown * 0.9
    playerSpeed = playerSpeed + 35
}

function resetLevel() {
    enemies = [];   

    bullets = [];
    bulletCooldownTimer = 0;

    enemybullets = [];
    enemybulletCooldownTimer = enemybulletCoolDownStart;

    lvl = 1;
    playerSpeed = playerspeedstart
    enemybulletSpeed = enemybulletSpeedStart;
    enemybulletCoolDown = enemybulletCoolDownStart;

    gamerunning = true;
    firstUpdate = true;
}

function gameOver() {
    console.log("ej du dårlig. nåede du kun til lvl " + lvl + "? 😂")
    gameoverScreenTimer = 0;
    gamerunning = false
}

function render() {
    const cx = lib.canvas;

    cx.clear("black");

    cx.putTexture(playerSprite, player.x, player.y);
    // cx.strokeRect(player.x, player.y, 64, 64, "red");

    for (const bullet of bullets) {
        cx.putTexture(bulletSprite, bullet.x, bullet.y);
    }
    for (const enemy of enemies) {
        cx.putTexture(enemySprite, enemy.x, enemy.y);
    }
    for (const bullet of enemybullets) {
        cx.putTexture(enemybulletSprite, bullet.x, bullet.y);
        // cx.strokeRect(bullet.x, bullet.y, 24, 24, "red");
    }
    for (const explosion of explosions) {
        const animationFraction = explosion.time / explosionDuration;
        const spriteIdxFraction = animationFraction * explosionSprites.length;
        const spriteIdx = Math.floor(spriteIdxFraction);
        const texture = explosionSprites[spriteIdx];
        cx.putTexture(texture, explosion.x - 32, explosion.y - 32);
    }

    cx.putText("LvL "+lvl, 0, 0, "white");

    if (!gamerunning) {
        if (gameoverScreenTimer >= gameoverScreenDelay) {
            cx.putTexture(gameoverSprite, 0, 0);
            cx.putText("ej du dårlig.", 150 - 3, 150 - 3, "black");
            cx.putText("ej du dårlig.", 150, 150, "white");
            cx.putText("nåede du kun til lvl " + lvl + "? 😂", 70 - 3, 174 - 3, "black");
            cx.putText("nåede du kun til lvl " + lvl + "? 😂", 70, 174, "white");
        }
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
    const goleft = lib.isPressed("ArrowLeft") || lib.isPressed("a");

    const goright = lib.isPressed("ArrowRight") || lib.isPressed("d");

    if (goleft && !goright) {
        player.x -= playerSpeed * lib.frameDeltaT;

        if (player.x < 0) {
            player.x = 0;
        }
    }
    else if (goright && !goleft) {
        player.x += playerSpeed * lib.frameDeltaT;

        if (player.x >= lib.canvas.width - playerSprite.width) {
            player.x = lib.canvas.width - playerSprite.width;
        }
    }
}

function updateBulletMovement() {
    for (const bullet of bullets) {
        bullet.y -= bulletSpeed * lib.frameDeltaT;
    }
}
function updateEnemyBulletMovement() {
    for (const bullet of enemybullets) {
        bullet.y += enemybulletSpeed * lib.frameDeltaT;
    }
}
function spawnenemybullets() {
    if (enemybulletCooldownTimer < 0) {
        enemybulletCooldownTimer = enemybulletCoolDown / 2 
            + (enemybulletCoolDown / 2) * Math.random();

        let enemyidx = Math.floor(enemies.length * Math.random())
        let enemy = enemies[enemyidx]
        enemybullets.push({ x: enemy.x + 12, y: enemy.y + 12 });
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
function handleenemyBulletCollisions() {
    for (let bulletIdx = 0; bulletIdx < enemybullets.length; ++bulletIdx) {

        const bullet = enemybullets[bulletIdx];
        const isColliding = rectsAreColliding(
            bullet.x, bullet.y, 24, 24,
            player.x, player.y, 64, 64,
        );
        if (isColliding) {
            gameOver();
        }
    }
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


function rectsAreColliding(
    aX, aY, aWidth, aHeight,
    bX, bY, bWidth, bHeight,
) {
    return aX < bX + bWidth
        && aX + aWidth >= bX
        && aY < bY + bHeight
        && aY + aHeight >= bY;
}

lib.onPress(" ", () => {
    if (!gamerunning) {
        resetLevel();
        return;
    }
    if (bulletCooldownTimer >= bulletCoolDown) {
        bulletCooldownTimer = 0;
        bullets.push({ x: player.x + 20, y: 300 });
    }
});

lib.onPress("r", () => {
    resetLevel();
});

lib.startGame(loop);
