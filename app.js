// * Инициализируем канвас
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

// * Создаем сетку
// Сетка нужна для того чтобы разбить канвас на блоки и в дальнейшем через эти блоки отрисововать змейку и яблоко
const blockSize = 10;
const widthInBlocks = width / blockSize;
const heightInBlocks = height / blockSize;

// * Рисуем границы канваса
function drawBorder() {
  ctx.fillStyle = "Grey";
  ctx.fillRect(0, 0, width, blockSize); // Верхняя граница
  ctx.fillRect(0, height - blockSize, width, blockSize); // Нижняя граница
  ctx.fillRect(0, 0, blockSize, height); // Левая граница
  ctx.fillRect(width - blockSize, 0, blockSize, height); // Правая граница
}

// * Пишем счет игры
let score = 0;
function drawScore() {
  ctx.font = "20px serif";
  ctx.textBaseline = "top";
  ctx.fillText("Score: " + score, blockSize, blockSize);
}

// * Конец игры
function gameOver() {
  playing = false;
  ctx.font = "60px serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("Конец игры", width / 2, height / 2);
}

// * Облегчение рисования круга
function circle(x, y, radius, fill) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  if (fill) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

// *Объект Блок
const Block = function (col, row) {
  this.col = col;
  this.row = row;
};

Block.prototype.drawSquare = function (color) {
  const x = this.col * blockSize;
  const y = this.row * blockSize;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, blockSize, blockSize);
};

Block.prototype.drawCircle = function (color) {
  const x = this.col * blockSize + blockSize / 2;
  const y = this.row * blockSize + blockSize / 2;
  ctx.fillStyle = color;
  circle(x, y, blockSize / 2, true);
};

Block.prototype.equal = function (otherSegment) {
  return this.col === otherSegment.col && this.row === otherSegment.row;
};

// * Объкт Snake
const Snake = function () {
  this.segments = [new Block(7, 5), new Block(6, 5), new Block(5, 5)];
  this.direction = "right";
  this.nextDirection = "right";
};

Snake.prototype.draw = function () {
  for (let i = 0; i < this.segments.length; i++) {
    this.segments[0].drawSquare("green");
    if (i % 2 === 0) {
      this.segments[i].drawSquare("yellow");
    } else {
      this.segments[i].drawSquare("blue");
    }
  }
};

Snake.prototype.move = function () {
  const head = this.segments[0];
  let newHead;

  this.direction = this.nextDirection;
  switch (this.direction) {
    case "up":
      newHead = new Block(head.col, head.row - 1);
      break;
    case "right":
      newHead = new Block(head.col + 1, head.row);
      break;
    case "down":
      newHead = new Block(head.col, head.row + 1);
      break;
    case "left":
      newHead = new Block(head.col - 1, head.row);
      break;
  }

  if (this.checkCollision(newHead)) {
    gameOver();
    return;
  }

  this.segments.unshift(newHead);

  if (newHead.equal(apple.position)) {
    score++;
    animationTime -= 2;
    apple.move(this.segments);
  } else {
    this.segments.pop();
  }
};

Snake.prototype.checkCollision = function (head) {
  const leftCollision = head.col === 0;
  const rightCollision = head.col === widthInBlocks - 1;
  const topCollision = head.row === 0;
  const bottomCollision = head.row === heightInBlocks - 1;

  const wallCollision =
    leftCollision || rightCollision || topCollision || bottomCollision;

  let selfCollision = false;

  for (let i = 0; i < this.segments.length; i++) {
    if (head.equal(this.segments[i])) {
      selfCollision = true;
    }
  }

  return wallCollision || selfCollision;
};

Snake.prototype.setDirection = function (newDirection) {
  if (this.direction === "up" && newDirection === "down") {
    return;
  } else if (this.direction === "left" && newDirection === "right") {
    return;
  } else if (this.direction === "down" && newDirection === "up") {
    return;
  } else if (this.direction === "right" && newDirection === "left") {
    return;
  }

  this.nextDirection = newDirection;
};

// * Объект яблоко
const Apple = function () {
  this.position = new Block(10, 10);
};

Apple.prototype.draw = function () {
  this.position.drawCircle("green");
};

Apple.prototype.move = function (occupiedBlocks) {
  const randomCol = Math.floor(Math.random() * (widthInBlocks - 2) + 1);
  const randomRow = Math.floor(Math.random() * (heightInBlocks - 2) + 1);
  this.position = new Block(randomCol, randomRow);

  // * Check if apple spawn in the snake
  for (let i = 0; i < occupiedBlocks.length; i++) {
    if (this.position.equal(occupiedBlocks[i])) {
      this.move(occupiedBlocks);
    }
  }
};
const snake = new Snake();
const apple = new Apple();
let animationTime = 100;
let playing = true;
//
// const intervalId = setInterval(function () {
//   ctx.clearRect(0, 0, width, height);
//   drawScore();
//   snake.move();
//   snake.draw();
//   apple.draw();
//   drawBorder();
// }, 30);

function gameLoop() {
  ctx.clearRect(0, 0, width, height);
  drawScore();
  snake.move();
  snake.draw();
  apple.draw();
  drawBorder();
  if (playing) {
    setTimeout(gameLoop, animationTime);
  }
}
gameLoop();
const direction = {
  38: "up",
  39: "right",
  40: "down",
  37: "left",
};

const body = document.querySelector("body");

body.addEventListener("keydown", function (e) {
  const newDirection = direction[e.keyCode];
  if (newDirection !== undefined) {
    snake.setDirection(newDirection);
  }
});
