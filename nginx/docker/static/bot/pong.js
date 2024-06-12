// const aSocket = new WebSocket(
//     "ws://localhost:8000/ws/"
// );
var aSocket;

var move = 0;
var connected = false;

/********** PONG INIT *************/

const canvas = document.getElementById("game");
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 800;

/* set the CSS styles of the canvas to center it in the middle of the window
and give it a border of 2 pixels
*/
// canvas.style.margin = "auto";
// canvas.style.display = "block";
// canvas.style.position = "absolute";
// canvas.style.top = "0";
// canvas.style.bottom = "0";
// canvas.style.left = "0";
// canvas.style.right = "0";
// canvas.style.border = "2px solid black"; //border
// document.body.appendChild(canvas);

// width and height of the paddles, size of the ball, speed of the paddles
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 10;
const paddleSpeed = 5;

// paddles are initially centered vertically, ball is initially centered both vertically and horizontally
let player1Y = canvas.height / 2 - paddleHeight / 2;
let computerY = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;

let player1Score = 0;
let computerScore = 0;

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

/*
A path is a series of connected lines or curves that can be used to draw shapes

startAngle is 0, endAngle is Math.PI * 2 (=360 degrees in radians), and anticlockwise is false,
because the arc is drawn in the clockwise direction.
*/
function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

// the white net line in the middle
function drawNet() {
    for (let i = 0; i < canvas.height; i += 15)
        drawRect(canvas.width / 2 - 1, i, 2, 10, 'white');
}

function draw() {
    // Clear the canvas
    drawRect(0, 0, canvas.width, canvas.height, 'black');

    // Draw paddles
    drawRect(0, player1Y, paddleWidth, paddleHeight, 'white');
    drawRect(canvas.width - paddleWidth, computerY, paddleWidth, paddleHeight, 'white');

    // Draw ball
    drawCircle(ballX, ballY, ballSize, 'white');

    // Draw net
    drawNet();

    // Draw scores
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(player1Score, canvas.width / 4, 50);
    ctx.fillText(computerScore, (3 * canvas.width) / 4, 50);
}




//  Collisions
function ai_update(move = 0) {
    const nextY = computerY + 4 * move;

    // Check if the next position of the paddle exceeds the canvas boundaries
    if (nextY >= 0 && nextY <= canvas.height - paddleHeight) {
        // If within bounds, update the paddle's position
        computerY = nextY;
    } else {
        // If out of bounds, clamp the paddle's position to stay within the canvas boundaries
        if (nextY < 0)
            computerY = 0; // Clamp to the top boundary
        else
            computerY = canvas.height - paddleHeight; // Clamp to the bottom boundary
    }
}




/********** MOVES *************/

// Move paddles (w/s for the left paddle or upArrow/downArrow for the right paddle if no AI)


function update() {
    if (wPressed && player1Y > 0)
        player1Y -= paddleSpeed;
    else if (sPressed && player1Y < canvas.height - paddleHeight)
        player1Y += paddleSpeed;

    // // Player2 - computer not AI
    // if (upArrowPressed && computerY > 0)
    //     computerY -= paddleSpeed;
    // else if (downArrowPressed && computerY < canvas.height - paddleHeight)
    //     computerY += paddleSpeed;

    /*
    AI instead of computer. The idea:
    if (NN_output = [1,0,0])
        computerY -= paddleSpeed (up);
    if (NN_output = [0,0,1])
        computerY += paddleSpeed (down);
    ele if (NN_output == [0,0,0])
        does nothing;
    */
    if (connected == true)
    {
        aSocket.send(JSON.stringify({"player" : player1Y, "computer" : computerY, "ballX" : ballX, "ballY" : ballY}));
        connected = false;
    }
    ai_update(move);



    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with top/bottom walls
    if (ballY + ballSize >= canvas.height || ballY - ballSize <= 0)
        ballSpeedY = -ballSpeedY;

    // Ball collision with paddles
    if (
        (ballX - ballSize <= paddleWidth && ballY >= player1Y && ballY <= player1Y + paddleHeight) ||
        (ballX + ballSize >= canvas.width - paddleWidth && ballY >= computerY && ballY <= computerY + paddleHeight)
    ) {
        ballSpeedY += Math.random() - 0.5
        ballSpeedX = -ballSpeedX;
    }

    // Ball out of bounds
    if (ballX - ballSize <= 0) {
        // Player 2 scores
        computerScore++;
        resetBall();
    } else if (ballX + ballSize >= canvas.width) {
        // Player 1 scores
        player1Score++;
        resetBall();
    }
}

// Reset position and speed. Place the ball in the middle again
function resetBall() {
    ballX = canvas.width / 2;
    ballY = Math.random() * canvas.height;
    ballSpeedX = -ballSpeedX;
    ballSpeedY = Math.random() * 6 - 3;
}

export function gameLoop_init(ws)
{
    aSocket = ws;
    aSocket.onopen = function(event) {
        connected = true;
    };
    aSocket.addEventListener('message', function (event) {
        let messageData = JSON.parse(event.data);
        move = messageData.predict;
        aSocket.send(JSON.stringify({"player" : player1Y, "computer" : computerY, "ballX" : ballX, "ballY" : ballY}));
    });
    gameLoop();
}

function gameLoop() {
    update();
    // console.log("heuuu");
    draw();
    requestAnimationFrame(gameLoop);
}

let wPressed = false;
let sPressed = false;

document.addEventListener('keydown', function (event) {
    if (event.key === 'w')
        wPressed = true;
    else if (event.key === 's')
        sPressed = true;
});

document.addEventListener('keyup', function (event) {
    if (event.key === 'w')
        wPressed = false;
    else if (event.key === 's')
        sPressed = false;
});

// gameLoop();
