let gameArea = document.querySelector(".gamearea");
let player = document.getElementById("player");
let scoreDisplay = document.getElementById("score");
let gameOverScreen = document.getElementById("gameover");
let finalScore = document.getElementById("finalScore");
let playerX = 370;
let bullets = [];
let enemies = [];
let score = 0;
let isGameOver = false;
let enemyTimer;
let enemySpeed = 3;
gameArea.addEventListener("mousemove", function(event){
    if(isGameOver) return;
    let area = gameArea.getBoundingClientRect();
    let mouseX = event.clientX - area.left;
    let playerWidth = player.offsetWidth;
    playerX = mouseX - (playerWidth / 2);
    if(playerX < 0){
        playerX = 0;
    }
    if(playerX > area.width - playerWidth){
        playerX = area.width - playerWidth;
    }
    player.style.left = playerX + "px";
});
document.addEventListener("keydown", function(e){
    if(e.code === "Space"){
        makeBullet();
    }
});
function makeBullet(){
    let b = document.createElement("div");
    b.classList.add("bullet");
    let playerRect = player.getBoundingClientRect();
    let areaRect = gameArea.getBoundingClientRect();
    b.style.left = (playerRect.left - areaRect.left + playerRect.width / 2 - 3) + "px";
    b.style.top = (playerRect.top - areaRect.top - 20) + "px";
    gameArea.appendChild(b);
    bullets.push(b);
}
function makeEnemy(){
    if(isGameOver) return;
    let maxEnemies = score < 10 ? 1 : 2;
    let count = Math.floor(Math.random() * maxEnemies) + 1;
    for(let i=0; i<count; i++){
        let en = document.createElement("div");
        en.classList.add("enemy");
        if (Math.random() < 0.5) {
            en.classList.add("enemy-type-1");
        } else {
            en.classList.add("enemy-type-2");
        }
        en.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - 70)) + "px";
        en.style.top = "0px";
        gameArea.appendChild(en);
        enemies.push(en);
    }
}
function gameLoop(){
    if(isGameOver) return;

    for(let i=0; i<bullets.length; i++){
        let b = bullets[i];
        let y = parseInt(b.style.top);
        if(y <= 0){
            b.remove();
            bullets.splice(i,1);
            i--;
        } else {
            b.style.top = (y - 10) + "px";
        }
    }
    for(let j=0; j<enemies.length; j++){
        let en = enemies[j];
        let y2 = parseInt(en.style.top);
        let spd = enemySpeed + Math.floor(score/10);
        if(y2 >= gameArea.offsetHeight - 70){
            endGame();
        } else {
            en.style.top = (y2 + spd) + "px";
        }
        if(checkHit(en, player)){
            endGame();
        }
    }
    for(let k=0; k<bullets.length; k++){
        for(let m=0; m<enemies.length; m++){
            if(checkHit(bullets[k], enemies[m])){
                bullets[k].remove();
                enemies[m].remove();
                bullets.splice(k,1);
                enemies.splice(m,1);
                score++;
                scoreDisplay.textContent = score;
                break;
            }
        }
    }
    requestAnimationFrame(gameLoop);
}
function checkHit(obj1, obj2){
    let r1 = obj1.getBoundingClientRect();
    let r2 = obj2.getBoundingClientRect();
    if(r1.top > r2.bottom) return false;
    if(r1.bottom < r2.top) return false;
    if(r1.right < r2.left) return false;
    if(r1.left > r2.right) return false;
    return true;
}
function endGame(){
    isGameOver = true;
    clearInterval(enemyTimer);
    finalScore.textContent = score;
    gameOverScreen.style.display = "flex";
}
function restartGame(){
    location.reload();
}
function startGame(){
    player.style.left = playerX + "px";
    requestAnimationFrame(gameLoop);
    enemyTimer = setInterval(makeEnemy, 1500);
}
startGame();