
class SnakeNode {

    constructor(x, y, next, prev) {
        this.x = x;
        this.y = y;
        this.next = next;
        this.prev = prev;
    }

}

class Snake {

    constructor(startX, startY, direction) {
        this.head = new SnakeNode(startX, startY, null, null);
        this.head.next = new SnakeNode(startX - 1, startY, null, this.head);
        this.tail = this.head.next;
        this.direction = direction;
        this.print();
    }

    move(removeTail = true) {
        this.print();
        this.head = new SnakeNode(this.getNextX(), this.getNextY(), this.head, null);
        this.head.next.prev = this.head;
        if (removeTail) {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
    }

    grow() {
        this.move(false);
    }

    getNextX() {
        if (this.direction === "right") {
            return this.head.x + 1;
        } else if (this.direction === "left") {
            return this.head.x - 1;
        }
        return this.head.x;
    }

    getNextY() {
        if (this.direction === "up") {
            return this.head.y - 1;
        } else if (this.direction === "down") {
            return this.head.y + 1;
        }
        return this.head.y;
    }

    willCollideWithSelf() {
        let current = this.head.next.next; //impossible to collide with next 2;
        while (current !== null) {
            let nextX = this.getNextX();
            let nextY = this.getNextY();
            if (current.x === nextX && current.y === nextY) {
                return true;
            }
            current = current.next;
        }
        return false;
    }

    willCollideWithBoundary(width, height) {
        return this.getNextX() < 0 || this.getNextX() >= width || this.getNextY() < 0 || this.getNextY() >= height;
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