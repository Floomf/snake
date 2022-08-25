
class SnakeNode {

    constructor(x, y, canvasXOffset, canvasYOffset, direction, next, prev) {
        this.x = x;
        this.y = y;
        this.canvasXOffset = canvasXOffset;
        this.canvasYOffset = canvasYOffset; 

        this.startXOffset = canvasXOffset;
        this.startYOffset = canvasYOffset;

        this.direction = direction;
        this.startDirection = direction;

        this.next = next;
        this.prev = prev;
    }

    moveOffset() {
        this.canvasXOffset += this.getNextXOffset();
        this.canvasYOffset += this.getNextYOffset();
    }

    getNextXOffset(direction = this.direction) {
        if (direction === "right") {
            return 1;
        } else if (direction === "left") {
            return -1;
        }
        return 0;
    }

    getNextYOffset(direction = this.direction) {
        if (direction === "up") {
            return -1;
        } else if (direction === "down") {
            return 1;
        }
        return 0;
    }

    getCanvasX() {
        return SQUARE_SIZE * this.x + (SQUARE_SIZE / MAX_OFFSET * this.canvasXOffset);
    }

    getCanvasY() {
        return SQUARE_SIZE * this.y + (SQUARE_SIZE / MAX_OFFSET * this.canvasYOffset);
    }

    getXOfSquareCenter() {
        return SQUARE_SIZE * this.x + MAX_OFFSET;
    }

    getYOfSquareCenter() {
        return SQUARE_SIZE * this.y + MAX_OFFSET;
    }
    
    isLeavingSquare() {
        return (this.direction === "right" && this.canvasXOffset > MAX_OFFSET / 2) || (this.direction === "left" && this.canvasXOffset < MAX_OFFSET / 2)
            || (this.direction === "down" && this.canvasYOffset > MAX_OFFSET / 2) || (this.direction === "up" && this.canvasYOffset < MAX_OFFSET / 2);
    }

}

const MAX_OFFSET = 20;

class Snake {

    constructor(startX, startY, direction) {
        this.head = new SnakeNode(startX, startY, 0, 10, "right", null, null);
        this.head.next = new SnakeNode(startX - 1, startY, 0, 10, "right", null, this.head);
        this.head.next.next = new SnakeNode(startX - 2, startY, 0, 10, "right", null, this.head.next);

        this.head.next.prev = this.head;

        this.tail = this.head.next.next;
        this.nextDirection = direction;
        this.directions = [direction];
        this.growing = false;
    }

    moveOffsets() {
        let curr = this.head;
        while (curr !== null) {
            curr.moveOffset();
            curr = curr.next;
        }
        if (this.head.canvasXOffset == MAX_OFFSET / 2 && this.head.canvasYOffset == MAX_OFFSET / 2) {
            curr = this.tail;
            while (curr.prev !== null) {
                curr.direction = curr.prev.direction;
                curr = curr.prev;
            }
            this.loadNextDirection();
            this.head.direction = this.nextDirection;
        } else if (this.head.canvasXOffset == 0 || this.head.canvasYOffset == 0 
                || this.head.canvasXOffset == MAX_OFFSET || this.head.canvasYOffset == MAX_OFFSET) {
            this.moveNodes();
        }
    }

    moveNodes() {
        //calculating new head offsets
        //20, 0 -> 20, 40
        //0, 20 -> 40, 20
        //20, 40 -> 20, 0
        //40, 20 -> 0, 20
        //40 - x, 40 - y
        this.head = new SnakeNode(this.getNextX(), this.getNextY(), MAX_OFFSET - this.head.canvasXOffset, MAX_OFFSET - this.head.canvasYOffset, this.head.direction, this.head, null);
        this.head.next.prev = this.head;
        
        //remove tail
        if (this.growing) {
            this.growing = false;
        } else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }

        //reset the nodes, seamlessly moving the snake position over
        let curr = this.tail;
        while (curr.prev !== null) {
            curr.canvasXOffset = curr.startXOffset;
            curr.canvasYOffset = curr.startYOffset;
            curr.direction = curr.startDirection;
            curr = curr.prev;
        }
    }

    grow() {
        this.growing = true;
    }

    getNextX() {
        if (this.head.direction === "right") {
            return this.head.x + 1;
        } else if (this.head.direction === "left") {
            return this.head.x - 1;
        }
        return this.head.x;
    }

    getNextY() {
        if (this.head.direction === "up") {
            return this.head.y - 1;
        } else if (this.head.direction === "down") {
            return this.head.y + 1;
        }
        return this.head.y;
    }

    collidedWithSelf() {
        let current = this.head.next.next; //impossible to collide with next 2;
        while (current !== null) {
            if (current.x === this.head.x && current.y === this.head.y) {
                return true;
            }
            current = current.next;
        }
        return false;
    }

    collidedWithBoundary(width, height) {
        return this.head.x < 0 || this.head.x >= width || this.head.y < 0 || this.head.y >= height;
    }

    occupies(x, y) {
        let current = this.head;
        while (current !== null) {
            if (x == current.x && y === current.y) {
                return true;
            }
            current = current.next;
        }
        return false;
    }

    queueDirection(direction) {
        if (this.directions[this.directions.length - 1] !== direction && this.directions.length <= 2) {
            this.directions.push(direction);
        }
    }

    loadNextDirection() {
        if (this.directions.length >= 1) {
            let direction = this.directions.shift();
            if (this.canMove(direction)) {
                this.nextDirection = direction;
            } else {
                this.loadNextDirection();
            }
        }
    }

    canMove(direction) {
        if (direction === "up" && this.head.next.y < this.head.y) {
            return false;
        } else if (direction === "down" && this.head.next.y > this.head.y) {
            return false;
        } else if (direction === "left" && this.head.next.x < this.head.x) {
            return false;
        } else if (direction === "right" && this.head.next.x > this.head.x) {
            return false;
        }
        return true;
    }

    keyToDirection(key) {
        if (key === "ArrowUp" || key === "w") {
            return "up";
        } else if (key === "ArrowRight" || key === "d") {
            return "right";
        } else if (key === "ArrowDown" || key === "s") {
            return "down";
        } else if (key === "ArrowLeft" || key === "a") {
            return "left";
        }
    }

    print() {
        console.log("Snake nodes:");
        let current = this.head;
        while (current !== null) {
            console.log(current);
            current = current.next;
        }
    }

}