const gameCanvas = document.getElementById("game");
const statsCanvas = document.getElementById("stats");
const ctxGame = gameCanvas.getContext("2d");
const ctxStats = statsCanvas.getContext("2d");

let GRID_WIDTH = 15;
let GRID_HEIGHT = 15;
let MAX_OFFSET = 20;
let SQUARE_SIZE;

let gameIntervalId;

let snake;
let state = "ended";
let score = 0;
let fruitX;
let fruitY;

let f = new FontFace("Varela Round", "url(https://fonts.gstatic.com/s/varelaround/v19/w8gdH283Tvk__Lua32TysjIfp8uP.woff2)")

f.load().then(font => {
    document.fonts.add(font);
    setupCanvas();
    drawMenu();
}, err => console.log(err));

let run = update;

//indow.onload = setupCanvas;
//window.onresize = setupCanvas;

function setupCanvas() {
    //screen.width is for mobile devices
    gameCanvas.width = Math.min(Math.min(window.screen.width, window.innerWidth) - 10, 600);
    gameCanvas.height = Math.min(Math.min(window.screen.width, window.innerWidth) - 10, 600);
    statsCanvas.width = 7 * gameCanvas.width / 12;
    statsCanvas.height = gameCanvas.height / 6;
    //drawMenu();
}


function start() {
    if (gameCanvas.width <= 400) {
        GRID_WIDTH = 11;
        GRID_HEIGHT = 11;
    }
    SQUARE_SIZE = gameCanvas.width / GRID_WIDTH;
    state = "playing";
    score = 0;
    snake = new Snake(3, 7, "right");
    gameIntervalId = setInterval(run, 1000 / 120);
    spawnFruit();
    drawScore();

    ctxGame.lineWidth = 3 * SQUARE_SIZE / 4;
    ctxGame.strokeStyle = "green"; 
    ctxGame.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    drawBoard();
}

function end() {
    clearInterval(gameIntervalId);
    state = "ended";
    //drawMenu();
}

function update() {
    drawFruit();
    drawSnake();
    checkCollision();
    if (snake.collidedWithSelf() || snake.collidedWithBoundary(GRID_WIDTH, GRID_HEIGHT)) {
        end();
        return;
    }
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
    if ((row % 2 == 0 && col % 2 == 1) || (row % 2 == 1 && col % 2 == 0)) {
        ctxGame.fillStyle = "lightgrey";
    } else {
        ctxGame.fillStyle = "white";
    }
    ctxGame.beginPath();
    ctxGame.rect(SQUARE_SIZE * col, SQUARE_SIZE * row, SQUARE_SIZE, SQUARE_SIZE);
    ctxGame.fill();
}

function drawSnakeCircle(x, y) {
    ctxGame.beginPath();
    ctxGame.fillStyle = "green";
    ctxGame.arc(x, y, 3 * SQUARE_SIZE / 8, 0, Math.PI * 2);
    ctxGame.fill();
}

function drawSnakeLine(x, y, x2, y2) {
    ctxGame.beginPath();
    ctxGame.moveTo(x, y);
    ctxGame.lineTo(x2, y2);
    ctxGame.stroke();
}

function drawSnakeEyes() {
    let leftEyeX = snake.head.getCanvasX();
    let leftEyeY = snake.head.getCanvasY();
    let rightEyeX = snake.head.getCanvasX();
    let rightEyeY = snake.head.getCanvasY();
    let pupilXOffset = snake.head.getNextXOffset() * (SQUARE_SIZE / 16);
    let pupilYOffset = snake.head.getNextYOffset() * (SQUARE_SIZE / 16);
    if (snake.head.direction === "up" || snake.head.direction === "down") {
        leftEyeX -= (SQUARE_SIZE / 6);
        rightEyeX += (SQUARE_SIZE / 6);
    } else {
        leftEyeY -= (SQUARE_SIZE / 6);
        rightEyeY += (SQUARE_SIZE / 6);
    }

    ctxGame.beginPath();
    ctxGame.fillStyle = "white";
    ctxGame.arc(leftEyeX, leftEyeY, SQUARE_SIZE / 8, 0, Math.PI * 2);
    ctxGame.fill();
    ctxGame.arc(rightEyeX, rightEyeY, SQUARE_SIZE / 8, 0, Math.PI * 2);
    ctxGame.fill();
    ctxGame.beginPath();
    ctxGame.fillStyle = "black";
    ctxGame.arc(leftEyeX + pupilXOffset, leftEyeY + pupilYOffset, SQUARE_SIZE / 16, 0, Math.PI * 2);
    ctxGame.fill();
    ctxGame.arc(rightEyeX + pupilXOffset, rightEyeY + pupilYOffset, SQUARE_SIZE / 16, 0, Math.PI * 2);
    ctxGame.fill();
}

function drawSnake() {
    fillSquare(snake.tail.y, snake.tail.x);
    //clear square tail was in previously (because its circle is drawn in that square when the tail is entering another square)
    fillSquare(snake.tail.y - snake.tail.getNextYOffset(snake.tail.firstDirection), snake.tail.x - snake.tail.getNextXOffset(snake.tail.firstDirection));

    drawSnakeCircle(snake.head.getCanvasX(), snake.head.getCanvasY());
    drawSnakeCircle(snake.tail.getCanvasX(), snake.tail.getCanvasY())

    ctxGame.strokeStyle = "green"; 
    //the way the head and tail are drawn depend on if the nodes are entering or exiting their squares
    if (snake.head.isLeavingSquare()) {
        //draw line from head pos to center of head square
        drawSnakeLine(snake.head.getCanvasX(), snake.head.getCanvasY(), snake.head.getXOfSquareCenter(), snake.head.getYOfSquareCenter());
        //draw circle at center of head square
        drawSnakeCircle(snake.head.getXOfSquareCenter(), snake.head.getYOfSquareCenter());
        //draw line from center of head square to center of next square
        drawSnakeLine(snake.head.getXOfSquareCenter(), snake.head.getYOfSquareCenter(), snake.head.next.getXOfSquareCenter(), snake.head.next.getYOfSquareCenter());

        //draw line from tail pos to center of prev square
        drawSnakeLine(snake.tail.getCanvasX(), snake.tail.getCanvasY(), snake.tail.prev.getXOfSquareCenter(), snake.tail.prev.getYOfSquareCenter());
    } else {
        //draw line from head to center of next square
        drawSnakeLine(snake.head.getCanvasX(), snake.head.getCanvasY(), snake.head.next.getXOfSquareCenter(), snake.head.next.getYOfSquareCenter());

        //draw line from tail pos to center of tail square
        drawSnakeLine(snake.tail.getCanvasX(), snake.tail.getCanvasY(), snake.tail.getXOfSquareCenter(), snake.tail.getYOfSquareCenter());
        //draw circle at center of tail square
        drawSnakeCircle(snake.tail.getXOfSquareCenter(), snake.tail.getYOfSquareCenter());
        //draw line from center of tail square to center of next square
        drawSnakeLine(snake.tail.getXOfSquareCenter(), snake.tail.getYOfSquareCenter(), snake.tail.prev.getXOfSquareCenter(), snake.tail.prev.getYOfSquareCenter());
    }

    let curr = snake.head.next;
    while (curr.next.next !== null) {
        drawSnakeCircle(curr.getXOfSquareCenter(), curr.getYOfSquareCenter());
        drawSnakeLine(curr.getXOfSquareCenter(), curr.getYOfSquareCenter(), curr.next.getXOfSquareCenter(), curr.next.getYOfSquareCenter());
        curr = curr.next;
    }

    drawSnakeEyes();
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
    ctxStats.font = "bold " + (statsCanvas.height / (7 / 2)) + "px Varela Round";
    ctxStats.fillText("Score", statsCanvas.width / 4, statsCanvas.height / (5 / 2));
    ctxStats.font = statsCanvas.height / (7 / 2) + "px Varela Round";
    ctxStats.fillText(score, statsCanvas.width / 4, statsCanvas.height / (5 / 4));

}

function drawMenu() {
    ctxGame.textAlign = "center";
    ctxGame.shadowColor = "rgba(0,0,0,0)";
    ctxGame.font = 'bold 128px Varela Round';
    ctxGame.lineWidth = 1;
    ctxGame.fillText("Snake", gameCanvas.width / 2, gameCanvas.height / 2 - 25);
    ctxGame.strokeText("Snake", gameCanvas.width / 2, gameCanvas.height / 2 - 25);
    ctxGame.font = "bold 48px Varela Round";
    //ctxGame.fillText("Space to Play", gameCanvas.width / 2, gameCanvas.height / 2 + 45);
    //ctxGame.strokeText("Space to Play", gameCanvas.width / 2, gameCanvas.height / 2 + 45);
    ctxGame.font = "18px Varela Round";
    ctxGame.textAlign = "left";
    ctxGame.fillText("Created by Floomf", 16, gameCanvas.height - 20);
}

function inputDirection(e) {
    let direction = snake.keyToDirection(e.key);
    if (direction !== undefined) {
        snake.queueDirection(direction);
        e.preventDefault();
    }
}

gameCanvas.addEventListener("click", e => {
    if (state === "ended") {
        start();
    }
})

document.addEventListener("keydown", e => {
    if (state === "playing") {
        inputDirection(e);
    } else if (state === "ended" && e.key === " ") {
        start();
    }
});

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

let xDown = null;                                                        
let yDown = null;
                                                                    
function handleTouchStart(e) {      
    if (state == "ended") {
        start();
    }                          
    xDown = e.touches[0].clientX;                                      
    yDown = e.touches[0].clientY;                                    
};                                                
                                                                         
function handleTouchMove(e) {
    e.preventDefault();  
    e.stopPropagation();
    if (!xDown || !yDown) {
        return;
    }

    let xUp = e.touches[0].clientX;                                    
    let yUp = e.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;
                                                                         
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff < 0) {
            snake.queueDirection("right");
        } else {
            snake.queueDirection("left");
        }                       
    } else {
        if (yDiff < 0) {
            snake.queueDirection("down");
        } else { 
            snake.queueDirection("up");
        }                                                                 
    }
    xDown = null;
    yDown = null;                                             
};