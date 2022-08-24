const SQUARE_SIZE = 40;
const GRID_WIDTH = 15;
const GRID_HEIGHT = 15;

const gameCanvas = document.getElementById("game");
const statsCanvas = document.getElementById("stats");
const ctxGame = gameCanvas.getContext("2d");
const ctxStats = statsCanvas.getContext("2d");

let gameIntervalId;

let snake;
let state = "ended";
let score = 0;
let fruitX;
let fruitY;

let f = new FontFace("Varela Round", "url(https://fonts.gstatic.com/s/varelaround/v19/w8gdH283Tvk__Lua32TysjIfp8uP.woff2)")

f.load().then(font => {
    document.fonts.add(font);
    drawMenu();
}, err => console.log(err));

let run = function() {
    update();
    drawGame();
}

function start() {
    state = "playing";
    score = 0;
    snake = new Snake(3, 3, "right");
    gameIntervalId = setInterval(run, 100);
    spawnFruit();
    drawScore();
}

function end() {
    clearInterval(gameIntervalId);
    state = "ended";
    //drawMenu();
}

function update() {
    checkCollision();
    if (snake.willCollideWithSelf() || snake.willCollideWithBoundary(GRID_WIDTH, GRID_HEIGHT)) {
        end();
        return;
    }
}

function checkCollision() {
   if (snake.head.x === fruitX && snake.head.y === fruitY) {
        score++;
        snake.grow();
        drawScore();
        spawnFruit();
   } else {
        snake.move();
   }
}

function drawGame() {
    ctxGame.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            ctxGame.beginPath();
            ctxGame.lineWidth = 1;
            ctxGame.fillStyle = "white";
            ctxGame.rect(SQUARE_SIZE * col, SQUARE_SIZE * row, SQUARE_SIZE, SQUARE_SIZE);
            ctxGame.fill();
            ctxGame.stroke();
        }
    }

    let current = snake.head;
    while (current !== null) {
        //console.log("drawing block at " + current.x + " , " + current.y);
        ctxGame.beginPath();
        ctxGame.lineWidth = 1;
        ctxGame.fillStyle = "green";
        ctxGame.rect(SQUARE_SIZE * current.x, SQUARE_SIZE * current.y, SQUARE_SIZE, SQUARE_SIZE);
        ctxGame.fill();
        ctxGame.stroke();
        current = current.next;
    }

    ctxGame.fillStyle = "red";
    ctxGame.beginPath();
    ctxGame.rect(fruitX * SQUARE_SIZE, fruitY * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    ctxGame.fill();
    ctxGame.stroke();
}

function spawnFruit() {
    do {
        fruitX = Math.floor(Math.random() * GRID_WIDTH);
        fruitY = Math.floor(Math.random() * GRID_HEIGHT);
    } while (snake.occupies(fruitX, fruitY))
}

function drawScore() {
    ctxStats.clearRect(0, 0, statsCanvas.width / 2, statsCanvas.height);
    ctxStats.textAlign = "center";
    ctxStats.font = "24px Varela Round";
    ctxStats.fillText("Score", statsCanvas.width / 4, 40);
    ctxStats.fillText(score, statsCanvas.width / 4, 75);

}

function drawMenu() {
    ctxGame.textAlign = "center";
    ctxGame.shadowColor = "rgba(0,0,0,0)";
    ctxGame.font = 'bold 128px Varela Round';
    ctxGame.lineWidth = 1;
    ctxGame.fillText("Snake", gameCanvas.width / 2, gameCanvas.height / 2 - 25);
    ctxGame.strokeText("Snake", gameCanvas.width / 2, gameCanvas.height / 2 - 25);
    ctxGame.font = "bold 48px Varela Round";
    ctxGame.fillText("Space to Play", gameCanvas.width / 2, gameCanvas.height / 2 + 45);
    ctxGame.strokeText("Space to Play", gameCanvas.width / 2, gameCanvas.height / 2 + 45);
    ctxGame.font = "18px Varela Round";
    ctxGame.textAlign = "left";
    ctxGame.fillText("Created by Floomf", 16, gameCanvas.height - 40);
}

function changeDirection(e) {
   let direction = snake.keyToDirection(e.key);
   if (direction === undefined || !snake.canMove(direction)) {
       return;
   }
   snake.direction = direction;
}

document.addEventListener("keydown", e => {
    if (state === "playing") {
        changeDirection(e);
    } else if (state === "ended" && e.key === " ") {
        start();
    }
});
