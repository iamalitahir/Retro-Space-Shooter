const gameArea = document.querySelector(".gamearea");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const bulletLevelDisplay = document.getElementById("bulletLevel");
const gameOverScreen = document.getElementById("gameover");
const finalScore = document.getElementById("finalScore");
let playerX = 370;
let bullets = [];
let enemies = [];
let powerups = [];
let score = 0;
let level = 1;
let waveCount = 0;
let enemyTimer = null;
let enemySpeed = 3;
let bulletCount = 1;
const maxBullets = 8;
function updateHUD() {
  scoreDisplay.textContent = score;
  levelDisplay.textContent = level;
  bulletLevelDisplay.textContent = bulletCount + "x";
}
function safeRectsIntersect(a, b, padding = 0) {
  if (!a || !b) return false;
  if (a.width === 0 || a.height === 0 || b.width === 0 || b.height === 0) return false;
  return !(
    (a.top + padding) > (b.bottom - padding) ||
    (a.bottom - padding) < (b.top + padding) ||
    (a.right - padding) < (b.left + padding) ||
    (a.left + padding) > (b.right - padding)
  );
}
function checkHit(el1, el2, padding = 5) {
  try {
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    return safeRectsIntersect(r1, r2, padding);
  } catch (e) {
    return false;
  }
}
gameArea.addEventListener("mousemove", (e) => {
  if (isGameOver) return;
  const area = gameArea.getBoundingClientRect();
  const mouseX = e.clientX - area.left;
  const pw = player.offsetWidth || 100;
  playerX = mouseX - pw / 2;
  if (playerX < 0) playerX = 0;
  if (playerX > area.width - pw) playerX = area.width - pw;
  player.style.left = playerX + "px";
});
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") spawnPlayerBullets();
});
function spawnPlayerBullets() {
  const spacing = 12;
  const centerX = playerX + (player.offsetWidth || 100) / 2;
  for (let i = 0; i < bulletCount; i++) {
    const b = document.createElement("div");
    b.className = "bullet";
    const offset = (i - (bulletCount - 1) / 2) * spacing;
    b.style.left = centerX + offset - 3 + "px";
    const playerRect = player.getBoundingClientRect();
    const areaRect = gameArea.getBoundingClientRect();
    b.style.top = playerRect.top - areaRect.top - 20 + "px";
    gameArea.appendChild(b);
    bullets.push(b);
  }
}
function makeEnemy(x, y) {
  const en = document.createElement("div");
  en.classList.add("enemy");
  const r = Math.random();
  if (r < 0.35) {
    en.classList.add("enemy-type-1");
    en.dataset.hp = "1";
  } else if (r < 0.7) {
    en.classList.add("enemy-type-2");
    en.dataset.hp = "1";
  } else {
    en.classList.add("enemy-type-3");
    en.dataset.hp = "3";
  }
  en.style.left = x + "px";
  en.style.top = y + "px";
  gameArea.appendChild(en);
  enemies.push(en);
}
function spawnWave() {
  if (isGameOver) return;
  const pattern = Math.floor(Math.random() * 4);
  const areaWidth = gameArea.offsetWidth;
  switch (pattern) {
    case 0:
      makeEnemy(Math.random() * (areaWidth - 70), 0);
      break;
    case 1:
      for (let i = 0; i < 3; i++) makeEnemy(100 + i * 200, 0);
      break;
    case 2:
      for (let i = 0; i < 4; i++) makeEnemy(50 + i * 150, -i * 60);
      break;
    case 3:
      for (let i = 0; i < 5; i++) makeEnemy(Math.random() * (areaWidth - 70), -(i * 40));
      break;
  }
  waveCount++;
  if (waveCount % 5 === 0) {
    level++;
    levelDisplay.textContent = level;
    enemySpeed += 1;
    clearInterval(enemyTimer);
    enemyTimer = setInterval(spawnWave, Math.max(800, 1800 - level * 100));
  }
}
function spawnPowerUp(x, y) {
  const p = document.createElement("div");
  p.className = "powerup";
  p.style.left = x + "px";
  p.style.top = y + "px";
  gameArea.appendChild(p);
  powerups.push(p);
}
let isGameOver = false;
function gameLoop() {
  if (isGameOver) return;
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.style.top = parseFloat(b.style.top) - 10 + "px";
    if (parseFloat(b.style.top) <= -20) {
      b.remove();
      bullets.splice(i, 1);
      continue;
    }
  }
  for (let j = enemies.length - 1; j >= 0; j--) {
    const en = enemies[j];
    en.style.top = parseFloat(en.style.top) + enemySpeed + "px";
    if (checkHit(en, player, 15)) { // stricter hit detection
      endGame();
      return;
    }
    if (parseFloat(en.style.top) > gameArea.offsetHeight + 100) {
      en.remove();
      enemies.splice(j, 1);
    }
  }
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const b = bullets[bi];
    let hitSomething = false;
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      if (checkHit(b, e, 5)) {
        if (b.parentNode) b.remove();
        bullets.splice(bi, 1);
        hitSomething = true;
        const hp = Math.max(0, Number(e.dataset.hp) - 1);
        e.dataset.hp = String(hp);
        if (hp <= 0) {
          const ex = parseFloat(e.style.left);
          const ey = parseFloat(e.style.top);
          if (e.parentNode) e.remove();
          enemies.splice(ei, 1);
          score++;
          updateHUD();
          if (Math.random() < 0.06) spawnPowerUp(ex, ey);
        }
        break;
      }
    }
    if (hitSomething) continue;
  }
  for (let pi = powerups.length - 1; pi >= 0; pi--) {
    const p = powerups[pi];
    p.style.top = parseFloat(p.style.top) + 3 + "px";
    if (checkHit(p, player, -10)) { // easier pickup
      if (p.parentNode) p.remove();
      powerups.splice(pi, 1);
      if (bulletCount < maxBullets) {
        bulletCount++;
        bulletLevelDisplay.textContent = bulletCount + "x";
      }
      continue;
    }
    if (parseFloat(p.style.top) > gameArea.offsetHeight + 50) {
      if (p.parentNode) p.remove();
      powerups.splice(pi, 1);
    }
  }
  requestAnimationFrame(gameLoop);
}
function endGame() {
  isGameOver = true;
  clearInterval(enemyTimer);
  finalScore.textContent = score;
  gameOverScreen.style.display = "flex";
}
function restartGame() {
  clearInterval(enemyTimer);
  document.querySelectorAll(".bullet, .enemy, .powerup").forEach(n => n.remove());

  bullets = [];
  enemies = [];
  powerups = [];
  score = 0;
  level = 1;
  waveCount = 0;
  enemySpeed = 3;
  bulletCount = 1;
  isGameOver = false;

  updateHUD();
  gameOverScreen.style.display = "none";

  requestAnimationFrame(gameLoop);
  enemyTimer = setInterval(spawnWave, 2000);
  spawnWave();
}
updateHUD();
requestAnimationFrame(gameLoop);
enemyTimer = setInterval(spawnWave, 2000);
spawnWave();
