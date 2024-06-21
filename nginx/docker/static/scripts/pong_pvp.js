/********** PONG INIT *************/

const canvas = document.getElementById("game_canvas");
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

let player2 = {
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
    player2.xPos = board_width - player_width - 20;
    player2.yPos = board_height / 2 - player_height / 2;
    player2.width = player_width;
    player2.height = player_height;
    player2.velocityY = playerVelocity;
    player2.score = 0;
    player2.prediction = -1;
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

export function loop()
{
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
	context.fillText(player2.score.toString(), board_width - board_width / 3, 100);

    context.fillStyle = "white";

    //players
    context.fillRect(player1.xPos, player1.yPos, player1.width, player1.height);
    context.fillRect(player2.xPos, player2.yPos, player2.width, player2.height);

    //ball
    context.fillRect(ball.xPos, ball.yPos, ball.width, ball.height);
}

function move_players() {
    //player 1
    if (player1.yPos + player1.velocityY > 0 && player1.yPos + player1.velocityY + player1.height < board_height)
        player1.yPos += player1.velocityY;
    else if (!(player1.yPos + player1.velocityY > 0))
        player1.yPos = 0;
    else
        player1.yPos = board_height - player1.height;

    //player 2
    if (player2.yPos + player2.velocityY > 0 && player2.yPos + player2.velocityY + player2.height < board_height)
        player2.yPos += player2.velocityY;
    else if (!(player2.yPos + player2.velocityY > 0))
        player2.yPos = 0;
    else
        player2.yPos = board_height - player2.height;
}

function changeBallVelocity() {
    if (!(ball.yPos + ball.velocityY > 0 && ball.yPos + ball.velocityY + ball.height < board_height)) {
        ball.velocityY *= -1;
    }
    if (ball.xPos + ball.velocityX + ball.width >= board_width - player1.xPos - player2.width) {
        if (ball.yPos + ball.velocityY + ball.height + 2 >= player2.yPos && ball.yPos + ball.velocityY - 2 <= player2.yPos + player2.height && ball.velocityX > 0) {
            ball.velocityY = ((ball.yPos + ball.height / 2) - (player2.yPos + player2.height / 2)) / 15;
            console.log(ball.velocityY);
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
            console.log(ball.velocityY);
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
            player2.score++;
        else
            player1.score++;

        // if (player1.score == 5) {
        //     stop_playing();
        //     context.font = "100px serif";
        //     context.fillText("Player 1 won !", 325, 400);
        //     stop = true;
        //     return;
        // }
        // if (player2.score == 5) {
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
	if (e.key == 'ArrowUp') {
        player2.velocityY = -player_speed;
    }
    if (e.key == 'ArrowDown') {
        player2.velocityY = player_speed;
    }
}

function stopPlayer(e) {
    if (e.key == 'w' || e.key == 's')
        player1.velocityY = 0;
	else if (e.key == 'ArrowUp' || e.key == 'ArrowDown')
		player2.velocityY = 0
}
