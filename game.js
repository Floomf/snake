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

let run = update;

function start() {
    state = "playing";
    score = 0;
    snake = new Snake(3, 3, "right");
    gameIntervalId = setInterval(run, 1000 / 120);
    spawnFruit();
    drawScore();

    ctxGame.lineWidth = 30;
    ctxGame.strokeStyle = "green"; 
    ctxGame.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    drawBoard();
    ctxGame.beginPath();
    ctxGame.moveTo(snake.head.getCanvasX(), snake.head.getCanvasY());
    ctxGame.lineTo(snake.tail.getCanvasX(), snake.tail.getCanvasY());
    ctxGame.stroke();
}

function end() {
    clearInterval(gameIntervalId);
    state = "ended";
    //drawMenu();
}

function update() {
    checkCollision();
    if (snake.collidedWithSelf() || snake.collidedWithBoundary(GRID_WIDTH, GRID_HEIGHT)) {
        end();
        return;
    }
    drawFruit();
    drawSnake();
}

function checkCollision() {
   if (snake.head.x === fruitX && snake.head.y === fruitY) {
        console.log("Collided with fruit");
        score++;
        snake.grow();
        drawScore();
        spawnFruit();
   } else {
        snake.moveOffsets();
   }
}

function drawBoard() {
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            fillSquare(row, col);
        }
    }
}

function fillSquare(row, col) {
    console.log("Filling square at " + col + ", " + row);
    if ((row % 2 == 0 && col % 2 == 1) || (row % 2 == 1 && col % 2 == 0)) {
        ctxGame.fillStyle = "lightgrey";
    } else {
        ctxGame.fillStyle = "white";
    }
    ctxGame.beginPath();
    ctxGame.rect(SQUARE_SIZE * col, SQUARE_SIZE * row, SQUARE_SIZE, SQUARE_SIZE);
    ctxGame.fill();
}

function drawSnake() {
    fillSquare(snake.tail.y, snake.tail.x);
    //clear square tail was in previously (because its circle is drawn in that square when the tail is entering another square)
    fillSquare(snake.tail.y - snake.tail.getNextYOffset(snake.tail.firstDirection), snake.tail.x - snake.tail.getNextXOffset(snake.tail.firstDirection));

    //draw head
    ctxGame.beginPath();
    ctxGame.fillStyle = "green";
    ctxGame.arc(snake.head.getCanvasX(), snake.head.getCanvasY(), 15, 0, Math.PI * 2, false);
    ctxGame.fill();

    //draw tail
    ctxGame.beginPath();
    ctxGame.arc(snake.tail.getCanvasX(), snake.tail.getCanvasY(), 15, 0, Math.PI * 2, false);
    ctxGame.fill();


    ctxGame.beginPath();
    ctxGame.lineWidth = 30;
    ctxGame.strokeStyle = "green"; 
    //redraw the back of the snake that was cleared in the 2 squares
    if (snake.tail.isLeavingSquare()) {
        //draw to center of previous tail's square
        ctxGame.moveTo(snake.tail.getCanvasX(), snake.tail.getCanvasY());
        ctxGame.lineTo(snake.tail.prev.getXOfSquareCenter(), snake.tail.prev.getYOfSquareCenter());
        ctxGame.stroke();
    } else { //tail is entering square
        //draw to center of tail square
        ctxGame.moveTo(snake.tail.getCanvasX(), snake.tail.getCanvasY());
        ctxGame.lineTo(snake.tail.getXOfSquareCenter(), snake.tail.getYOfSquareCenter());

        //draw to canvas position of previous node
        ctxGame.moveTo(snake.tail.getXOfSquareCenter(), snake.tail.getYOfSquareCenter());
        ctxGame.lineTo(snake.tail.prev.getCanvasX(), snake.tail.prev.getCanvasY());
        ctxGame.stroke();

        //draw circle in tail's square
        ctxGame.beginPath();
        ctxGame.arc(snake.tail.getXOfSquareCenter(), snake.tail.getYOfSquareCenter(), 15, 0, Math.PI * 2, false);
        ctxGame.fill();
    }
}

function drawFruit() {
    ctxGame.fillStyle = "red";
    ctxGame.beginPath();
    ctxGame.arc(fruitX * SQUARE_SIZE + (SQUARE_SIZE / 2), fruitY * SQUARE_SIZE + (SQUARE_SIZE / 2), SQUARE_SIZE / 3, 0, Math.PI * 2, false);
    ctxGame.fill();
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
   console.log("Setting next direction to " + direction);
   snake.nextDirection = direction;
}

document.addEventListener("keydown", e => {
    if (state === "playing") {
        changeDirection(e);
    } else if (state === "ended" && e.key === " ") {
        start();
    }
});
