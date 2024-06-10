var aSocket;

var move = 0;

/********** PONG INIT *************/

const canvas = document.getElementById("game");
const context = canvas.getContext('2d');

//board
const board_height = 800;
const board_width = 1000;

//player
const player_width = 30;
const player_height = 200;
const playerVelocity = 0;
const player_speed = 10;

//balling
const ball_width = 30;
const ball_height = 30;
let ball_velocity = 7;

let ball = {
    width: ball_width,
    height: ball_height,
    xPos: (board_width / 2) - (ball_width / 2),
    yPos: (board_height / 2) - (ball_height / 2),
    velocityY: 0,
    velocityX: 0,
    velocityXTmp: 0,
    velocityYTmp: 0,
}

let player1 = {
    xPos: 20,
    yPos: board_height / 2 - player_height / 2,
    width: player_width,
    height: player_height,
    velocityY: playerVelocity,
    score: 0,
}

let computer = {
    xPos: board_width - player_width - 20,
    yPos: board_height / 2 - player_height / 2,
    width: player_width,
    height: player_height,
    velocityY: playerVelocity,
    score: 0,
}

var stop = true;
var animation_id = -1;

function reset_board() {
    computer.xPos = board_width - player_width - 20;
    computer.yPos = board_height / 2 - player_height / 2;
    computer.width = player_width;
    computer.height = player_height;
    computer.velocityY = playerVelocity;
    computer.score = 0;
    computer.prediction = -1;
    player1.xPos = 20;
    player1.yPos = board_height / 2 - player_height / 2;
    player1.width = player_width;
    player1.height = player_height;
    player1.velocityY = playerVelocity;
    player1.score = 0;
    player1.prediction = -1;
    ball.width = ball_width;
    ball.height = ball_height;
    ball.xPos = (board_width / 2) - (ball_width / 2);
    ball.yPos = (board_height / 2) - (ball_height / 2);
    ball.velocityY = 0;
    ball.velocityX = 0;
    ball.velocityXTmp = 0;
    ball.velocityYTmp = 0;
}

export function gameLoop_bot(ws)
{
    aSocket = ws;
    aSocket.onopen = function(event) {
        aSocket.send(JSON.stringify({"player" : player1.yPos, "computer" : computer.yPos, "ballX" : ball.xPos, "ballY" : ball.yPos}));
    };
    aSocket.addEventListener('message', function (event) {
        let messageData = JSON.parse(event.data);
        move = messageData.predict;
        console.log(move);
        aSocket.send(JSON.stringify({"player" : player1.yPos, "computer" : computer.yPos, "ballX" : ball.xPos, "ballY" : ball.yPos}));
    });
    canvas.width = board_width;
    canvas.height = board_height;
    let ran = Math.floor(Math.random() * 2);
    let tmp = ball_velocity;
    let tmp2 = 0;
    while (tmp2 == 0)
        tmp2 = Math.floor(Math.random() * 11) - 5;
    ball.velocityY = tmp2;
    if (ran == 0) {
        tmp *= -1;
    }
    ball.velocityX = tmp;
    ball.velocityX = 0;
    ball.velocityY = 0;
    setTimeout(() => { ball.velocityY = tmp2; }, 500);
    setTimeout(() => { ball.velocityX = tmp; }, 500);
    document.addEventListener("keydown", movePlayer);
    document.addEventListener("keyup", stopPlayer);
    gameLoop();
}

function gameLoop() {
    animation_id = window.requestAnimationFrame(gameLoop);

    //move players
    move_players();

    //ball
    changeBallVelocity();

    //draw
    draw_board();
}

function fill_middle_lines() {
	for (let i = 10; i < board_height - 30; i += 50) {
		context.fillRect(board_width / 2 - 5, i, 10, 30);
	}
}

function draw_board() {
    context.clearRect(0, 0, board_width, board_height);

    context.fillStyle = "rgb(70, 70, 70)";
    //middle_line
    fill_middle_lines();

    //score
    context.font = "100px Arial";
	context.textAlign = "center";
	context.fillText(player1.score.toString(), board_width / 3, 100);
	context.fillText(computer.score.toString(), board_width - board_width / 3, 100);

    context.fillStyle = "white";

    //players
    context.fillRect(player1.xPos, player1.yPos, player1.width, player1.height);
    context.fillRect(computer.xPos, computer.yPos, computer.width, computer.height);

    //ball
    context.fillRect(ball.xPos, ball.yPos, ball.width, ball.height);
}

function move_players() {
    computer.velocityY = move * player_speed;

    //player 1
    if (player1.yPos + player1.velocityY > 0 && player1.yPos + player1.velocityY + player1.height < board_height)
        player1.yPos += player1.velocityY;
    else if (!(player1.yPos + player1.velocityY > 0))
        player1.yPos = 0;
    else
        player1.yPos = board_height - player1.height;

    //player 2
    if (computer.yPos + computer.velocityY > 0 && computer.yPos + computer.velocityY + computer.height < board_height)
        computer.yPos += computer.velocityY;
    else if (!(computer.yPos + computer.velocityY > 0))
        computer.yPos = 0;
    else
        computer.yPos = board_height - computer.height;
}

function changeBallVelocity() {
    if (!(ball.yPos + ball.velocityY > 0 && ball.yPos + ball.velocityY + ball.height < board_height)) {
        ball.velocityY *= -1;
    }
    if (ball.xPos + ball.velocityX + ball.width >= board_width - player1.xPos - computer.width) {
        if (ball.yPos + ball.velocityY + ball.height + 2 >= computer.yPos && ball.yPos + ball.velocityY - 2 <= computer.yPos + computer.height && ball.velocityX > 0) {
            ball.velocityY = ((ball.yPos + ball.height / 2) - (computer.yPos + computer.height / 2)) / 15;
            ball.velocityX *= -1;
            if (ball.velocityX < 0)
                ball.velocityX -= 0.5;
            else
                ball.velocityX += 0.5;
        }
    }
    if (ball.xPos + ball.velocityX <= player1.xPos + player1.width) {
        if (ball.yPos + ball.velocityY + ball.height + 2 >= player1.yPos && ball.yPos + ball.velocityY - 2 <= player1.yPos + player1.height && ball.velocityX < 0) {
            ball.velocityY = ((ball.yPos + ball.height / 2) - (player1.yPos + player1.height / 2)) / 15;
            ball.velocityX *= -1;
            if (ball.velocityX < 0)
                ball.velocityX -= 0.5;
            else
                ball.velocityX += 0.5;
        }
    }
    if (!(ball.xPos + ball.velocityX > 0 && ball.xPos + ball.velocityX + ball.width < board_width)) {
        context.fillStyle = "white";
        if (!(ball.xPos + ball.velocityX > 0))
            computer.score++;
        else
            player1.score++;

        // if (player1.score == 5) {
        //     stop_playing();
        //     context.font = "100px serif";
        //     context.fillText("Player 1 won !", 325, 400);
        //     stop = true;
        //     return;
        // }
        // if (computer.score == 5) {
        //     stop_playing();
        //     context.font = "100px serif";
        //     context.fillText("Player 2 won !", 330, 400);
        //     stop = true;
        //     return;
        // }
        ball.xPos = (board_width / 2) - (ball_width / 2);
        ball.yPos = (board_height / 2) - (ball_height / 2);
        let ran = Math.floor(Math.random() * 2);
        ball.velocityX = ball_velocity;
        ball.velocityY = 0;
        while (ball.velocityY == 0)
            ball.velocityY = Math.floor(Math.random() * 11) - 5;
        if (ran == 0)
            ball.velocityX *= -1;
        ball.velocityXTmp = ball.velocityX;
        ball.velocityYTmp = ball.velocityY;
        ball.velocityX = 0;
        ball.velocityY = 0;
        setTimeout(() => { ball.velocityY = ball.velocityYTmp; }, 500);
        setTimeout(() => { ball.velocityX = ball.velocityXTmp; }, 500);
    }
    ball.xPos += ball.velocityX;
    ball.yPos += ball.velocityY;
}

function movePlayer(e) {
    if (e.key == 'w') {
        player1.velocityY = -player_speed;
    }
    if (e.key == 's') {
        player1.velocityY = player_speed;
    }
}

function stopPlayer(e) {
    if (e.key == 'w') {
        player1.velocityY = 0;
    }
    if (e.key == 's') {
        player1.velocityY = 0;
    }
}
