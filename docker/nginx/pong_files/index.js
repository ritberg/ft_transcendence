//inititates socket
const ws = new WebSocket("ws://10.19.246.185:3333");

//tells the game logic if it's dealing with player 1 or 2
var player_id = 0;

//board
let board_height = 800;
let board_width = 1200;

//player
let player_width = 15;
let player_height = 100;
let playerVelocity = 0;

//ball
let ball_width = 15;
let ball_height = 15;
let ball_velocity = 10;

let ball = {
    width: ball_width,
    height: ball_height,
    xPos: (board_width / 2) - (ball_width / 2),
    yPos: (board_height / 2) - (ball_height / 2),
    velocityY: 0,
    velocityX: 0,
    id: 12,
}

let player1 = {
    xPos: 10,
    yPos: board_height / 2 - player_height / 2,
    width: player_width,
    height: player_height,
    velocityY: playerVelocity,
    score: 0,
    //prediction set to -1 so the bot doesn't move before the ball goes it's direction
    prediction: -1,
    id: 10
}

let player2 = {
    xPos: board_width - player_width - 10,
    yPos: board_height / 2 - player_height / 2,
    width: player_width,
    height: player_height,
    velocityY: playerVelocity,
    score: 0,
    //prediction set to -1 so the bot doesn't move before the ball goes it's direction
    prediction: -1,
    id: 11
}

//the send_id variable sends info to the server for the state of the gam, 3 is a new player, 4 means a player left online mode
let send_id = {
    id: 0
}

//decides wheter to start the game logic or not
var stop = true;
//if isalone == true and gameMod == 4 display a message telling player to wait for another player
var isalone = true;
//gameMod tells gameLogic what game mod is played. 1 = one player, 2 = two players, 3 = zero players, 4 = online
var gameMod = 0;
var sound = false;
//animation_id is used to stop requestAnimationFrame to avoid frame acceleration
var animation_id = -1;

//resets the board when a new mode is requested
function reset_board() {
    //gameMod = 0;
    player2.xPos = board_width - player_width - 10;
    player2.yPos = board_height / 2 - player_height / 2;
    player2.width = player_width;
    player2.height = player_height;
    player2.velocityY = playerVelocity;
    //player2.score = 0;
    player2.prediction = -1;
    player1.xPos = 10;
    player1.yPos = board_height / 2 - player_height / 2;
    player1.width = player_width;
    player1.height = player_height;
    player1.velocityY = playerVelocity;
    //player1.score = 0;
    player1.prediction = -1;
    ball.width = ball_width;
    ball.height = ball_height;
    ball.xPos = (board_width / 2) - (ball_width / 2);
    ball.yPos = (board_height / 2) - (ball_height / 2);
    ball.velocityY = 0;
    ball.velocityX = 0;
}

function sound_change() {
    if (sound == false)
        sound = true;
    else
        sound = false;
}

function stop_playing() {
    //informs server the client has left online mode
    if (gameMod == 4) {
        send_id.id = 4;
        ws.send(JSON.stringify(send_id));
    }
    reset_board();
    gameMod = 0;
    if (stop == false) {
        player1.score = 0;
        player2.score = 0;
    }
    //window.cancelAnimationFrame(animation_id);
}


function button1Init() {
    //informs server the client has left online mode
    if (gameMod == 4) {
        send_id.id = 4;
        ws.send(JSON.stringify(send_id));
    }
    reset_board();
    gameMod = 1;
    player1.score = 0;
    player2.score = 0;
    stop = false;
    window.cancelAnimationFrame(animation_id);
    gameloopInit();
    startAnimating(60);
    //gameLoop();
}

function button2Init() {
    //informs server the client has left online mode
    if (gameMod == 4) {
        send_id.id = 4;
        ws.send(JSON.stringify(send_id));
    }
    reset_board();
    gameMod = 2;
    player1.score = 0;
    player2.score = 0;
    stop = false;
    window.cancelAnimationFrame(animation_id);
    gameloopInit();
    startAnimating(60);
    //gameLoop();
}


function button3Init() {
    //informs server the client has left online mode
    if (gameMod == 4) {
        send_id.id = 4;
        ws.send(JSON.stringify(send_id));
    }
    reset_board();
    gameMod = 3;
    player1.score = 0;
    player2.score = 0;
    stop = false;
    window.cancelAnimationFrame(animation_id);
    gameloopInit();
    startAnimating(60);
    //gameLoop();
}

//whenever the server sends a message to the client, it is parsed here
ws.addEventListener("message", message => {
    //console.log(message.data);
    //parses the json formated message
    let array = JSON.parse(message.data);
    //id 1 is sent when a client joins to assign player_id
    if (array.id == 1)
        player_id = array.num;
    //id 2 is sent to determine if the player is alone in online mode or not
    else if (array.id == 2 && array.isready == 1) {
        stop = false;
        isalone = false;
    }
    else if (array.id == 2 && array.isready == 0) {
        stop = true;
        isalone = true;
    }
    //id 10 is sent to communicate player1 position to player2
    else if (array.id == 10) {
        player1.yPos = array.yPos;
        player1.velocityY = array.velocityY;
        player1.score = array.score;
    }
    //id 11 is sent to communicate player2 postion to player1
    else if (array.id == 11) {
        player2.yPos = array.yPos;
        player2.velocityY = array.velocityY;
        player2.score = array.score;
    }
    //id 12 is sent to communicate ball postion when respawning to both players
    else if (array.id == 12) {
        ball.yPos = array.yPos;
        ball.xPos = array.xPos;

        ball.velocityX = 0;
        ball.velocityY = 0;
        //set delay so the ball doesn't start moving right away
        setTimeout(() => { ball.velocityY = array.velocityY; }, 500);
        setTimeout(() => { ball.velocityX = array.velocityX; }, 500);
    }
    else if (array.id == 13)
    {
        ball.yPos = array.yPos;
        ball.xPos = array.xPos;

        ball.velocityY = array.velocityY;
        ball.velocityX = array.velocityX;
    }
});

function button4Init() {
    //informs server the client has left online mode'
    if (gameMod == 4) {
        send_id.id = 4;
        ws.send(JSON.stringify(send_id));
    }
    reset_board();
    gameMod = 4;
    //informs server the client has entered online mode
    send_id.id = 3;
    ws.send(JSON.stringify(send_id));
    player1.score = 0;
    player2.score = 0;
    //stop = false;
    window.cancelAnimationFrame(animation_id);
    gameloopInit();
    startAnimating(60);
    //gameLoop();
}

var fpsInterval;
var then;

//used at the moment, can set a certain frame per second limit
function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = performance.now();
    gameLoop();
}

//loads when window is first opened
window.onload = function () {
    //allows the code to modify html canvas
    let board = document.getElementById("board");
    board.width = board_width;
    board.height = board_height;
    //initiates the "drawing board"
    context = board.getContext("2d");

    context.fillStyle = "white";
    //player 1
    context.fillRect(player1.xPos, player1.yPos, player1.width, player1.height);

    //player 2
    context.fillRect(player2.xPos, player2.yPos, player2.width, player2.height);

    //middle_line
    fill_middle_lines();

    //score
    context.font = "48px serif";
    context.fillText(player1.score, 100, 50);

    context.fillText(player2.score, board_width - 130, 50);

    //ball
    context.fillStyle = "white";
    context.fillRect(ball.xPos, ball.yPos, ball.width, ball.height);
}

//initiates which direction the ball will go at the start of the game
function gameloopInit() {
    //decides whether the ball goes left or right
    let ran = Math.floor(Math.random() * 2);
    let tmp = ball_velocity;
    let tmp2 = 0;

    //so the ball doesn't go straight at the start the launch
    while (tmp2 == 0)
        tmp2 = Math.floor(Math.random() * 11) - 5;
    ball.velocityY = tmp2;
    if (ran == 0) {
        tmp *= -1;
    }
    ball.velocityX = tmp;
    //make bot predictions if correct game mode
    if (ran == 0 && gameMod == 3)
        makeBot1Prediction();
    else if (ran == 1 && (gameMod == 1 || gameMod == 3))
        makeBot2Prediction();
    //lets players know which direction the ball will go in online mode
    if (gameMod == 4) {
        ball.id = 12;
        ws.send(JSON.stringify(ball));
    }
    //if game mode is == 4 it will be sorted in message events
    if (gameMod != 4) {
        ball.velocityX = 0;
        ball.velocityY = 0;
        //set delay so the ball doesn't start moving right away
        setTimeout(() => { ball.velocityY = tmp2; }, 500);
        setTimeout(() => { ball.velocityX = tmp; }, 500);
    }
    //window.requestAnimationFrame(gameLoop);
    //listens for inputs on keyboard
    document.addEventListener("keydown", movePlayer);
    document.addEventListener("keyup", stopPlayer);
}

//where most of the program lives, the board is drawn here and the ball logic is also calculated here
function gameLoop() {
    //requestAnimationFrame is what makes the whole game move
    animation_id = window.requestAnimationFrame(gameLoop);

    //if player is moving tell it to move
    if (gameMod == 4 && isalone == true) {
        reset_board();
        player1.score = 0;
        player2.score = 0;
        context.font = "50px serif";
        context.fillText("waiting for another player", 330, 600);
    }

    //remove comments bellow to set fps manually, otherwise browser does it manually
    let now = performance.now();
    let elapsed = now - then;

    if (gameMod == 4 && isalone == false)
    {
        if (player_id == 1)
            ws.send(JSON.stringify(player1));
        else if (player_id == 2)
            ws.send(JSON.stringify(player2));
    }
    if (gameMod == 4 && player_id == 1 && isalone == false)
    {
        ball.id = 13;
        ws.send(JSON.stringify(ball));
    }

    if (elapsed > fpsInterval && stop == false) {
        then = now - (elapsed % fpsInterval);
        context.fillStyle = "white";
        //context.clearRect(0, 0, board.width, board.height);
        //bot1 movement
        if (gameMod == 3) {
            if (player1.prediction >= player1.yPos && player1.prediction <= player1.yPos + player1.height || player1.prediction == -1)
                player1.velocityY = 0;
            else {
                if (player1.yPos + player1.height < player1.prediction)
                    player1.velocityY = 10;
                if (player1.yPos > player1.prediction)
                    player1.velocityY = -10;
            }
        }

        //player 1 movement, disabled if bot is enabled
        if (player1.yPos + player1.velocityY > 0 && player1.yPos + player1.velocityY + player1.height < board_height)
            player1.yPos += player1.velocityY;
        else if (!(player1.yPos + player1.velocityY > 0))
            player1.yPos = 2;
        else
            player1.yPos = board_height - player1.height - 2;
        context.fillRect(player1.xPos, player1.yPos, player1.width, player1.height);
        //bot2 movement
        if (gameMod == 1 || gameMod == 3) {
            if (player2.prediction >= player2.yPos && player2.prediction <= player2.yPos + player2.height || player2.prediction == -1)
                player2.velocityY = 0;
            else {
                if (player2.yPos + player2.height < player2.prediction)
                    player2.velocityY = 10;
                if (player2.yPos > player2.prediction)
                    player2.velocityY = -10;
            }
        }
        //player 2 movement, disabled if bot is enabled
        if (player2.yPos + player2.velocityY > 0 && player2.yPos + player2.velocityY + player2.height < board_height)
            player2.yPos += player2.velocityY;
        else if (!(player2.yPos + player2.velocityY > 0))
            player2.yPos = 2;
        else
            player2.yPos = board_height - player2.height - 2;
        context.fillRect(player2.xPos, player2.yPos, player2.width, player2.height);
        //middle_line
        fill_middle_lines();

        //if online mode, both players send their infos to other player
        // if (gameMod == 4)
        // {
        //     if (player_id == 1)
        //         ws.send(JSON.stringify(player1));
        //     else if (player_id == 2)
        //         ws.send(JSON.stringify(player2));
        // }
        // if (gameMod == 4)
        // {
        //     if (player_id == 1) {
        //         ball.is_delay = false;
        //         ws.send(JSON.stringify(ball));
        //     }
        // }

        //calculate ball logic
        changeBallVelocity();

        //score
        context.fillStyle = "gray";
        context.font = "48px serif";
        context.fillText(player1.score, 100, 50);
        context.fillText(player2.score, board_width - 130, 50);
        if (stop == false) {
            ball.xPos += ball.velocityX;
            ball.yPos += ball.velocityY;
            context.fillStyle = "white";
            context.fillRect(ball.xPos, ball.yPos, ball.width, ball.height);
        }
        if (stop == true) {
            player1.score = 0;
            player2.score = 0;
        }
    }
}

//displays the middle lines
function fill_middle_lines() {
    for (let i = 0; i < board_height; i += 4.2) {
        context.fillStyle = "gray";
        context.fillRect(board_width / 2 - 5, i, 10, 30);
        i += 60;
    }
}

//where the ball bouncing is determined
function changeBallVelocity() {
    //checks if ball should bounce on top or bottom of the board
    if (!(ball.yPos + ball.velocityY > 0 && ball.yPos + ball.velocityY + ball.height < board_height)) {
        ball.velocityY *= -1;
    }
    //checks if the ball hit the player 2 paddle
    if (ball.xPos + ball.velocityX + ball.width >= board_width - 11) {
        if (ball.yPos + ball.velocityY + ball.height + 2 >= player2.yPos && ball.yPos + ball.velocityY - 2 <= player2.yPos + player2.height) {
            ball.velocityY = ((ball.yPos + ball.height / 2) - (player2.yPos + player2.height / 2)) / 7;
            ball.velocityX *= -1;
            if (ball.velocityX < 0)
                ball.velocityX -= 0.5;
            else
                ball.velocityX += 0.5;
            //whenever ball hits paddle, opposite side bot will calculate it's prediction
            if (gameMod == 3)
                makeBot1Prediction();
            if (sound == true)
                play();
        }
    }
    //checks if the ball hit the player 1 paddle
    if (ball.xPos + ball.velocityX <= 11) {
        if (ball.yPos + ball.velocityY + ball.height + 2 >= player1.yPos && ball.yPos + ball.velocityY - 2 <= player1.yPos + player1.height) {
            ball.velocityY = ((ball.yPos + ball.height / 2) - (player1.yPos + player1.height / 2)) / 7;
            ball.velocityX *= -1;
            if (ball.velocityX < 0)
                ball.velocityX -= 0.5;
            else
                ball.velocityX += 0.5;
            //whenever ball hits paddle, opposite side bot will calculate it's prediction
            if (gameMod == 1 || gameMod == 3)
                makeBot2Prediction();
            //setTimeout(() => { makeBot2Prediction(); }, 500);
            if (sound == true)
                play();
        }
    }
    //checks if ball will go out of bound horizontally (if a player scored)
    if (!(ball.xPos + ball.velocityX > 0 && ball.xPos + ball.velocityX + ball.width < board_width)) {
        context.fillStyle = "white";
        //increases player score
        if (!(ball.xPos + ball.velocityX > 0))
            player2.score++;
        else
            player1.score++;
        //checks if a player has won the set
        // if (player1.score == 5) {
        //     console.log("dawg " + player1.score);
        //     stop_playing();
        //     context.font = "100px serif";
        //     context.fillText("Player 1 won !", 325, 400);
        //     //if game is over, disconnect players
        //     send_id.id = 4;
        //     console.log(send_id.id);
        //     ws.send(JSON.stringify(send_id));
        //     stop = true;
        //     return;
        // }
        // if (player2.score == 5) {
        //     console.log("bruh " + player2.score);
        //     stop_playing();
        //     context.font = "100px serif";
        //     context.fillText("Player 2 won !", 330, 400);
        //     //if game is over, disconnect players
        //     send_id.id = 4;
        //     console.log(send_id.id);
        //     ws.send(JSON.stringify(send_id));
        //     stop = true;
        //     return;
        // }
        //only one side of online will determine where the ball goes to avoid desyncs
        ball.xPos = (board_width / 2) - (ball_width / 2);
        ball.yPos = (board_height / 2) - (ball_height / 2);
        // ball.velocityX = 0;
        // ball.velocityY = 0;
        if (!(gameMod == 4 && player_id == 1)) {
            //determine where ball goes after a score
            ball.velocityX = ball_velocity;
            let ran = Math.floor(Math.random() * 2);
            if (ran == 0)
                ball.velocityX *= -1;
            ball.velocityY = 0;
            while (ball.velocityY == 0)
                ball.velocityY = Math.floor(Math.random() * 11) - 5;
            //sends ball info to all players
            if (gameMod == 4) {
                ball.id = 12;
                ws.send(JSON.stringify(ball));
            }
            if (ball.velocityX > 0 && (gameMod == 1 || gameMod == 3))
                makeBot2Prediction();
            else if (ball.velocityX < 0 && gameMod == 3)
                makeBot1Prediction();
            let tmpX = ball.velocityX;
            let tmpY = ball.velocityY;
            //sets timeout so that the ball doesn't move straight away
            if (gameMod != 4) {
                ball.velocityX = 0;
                ball.velocityY = 0;
                setTimeout(() => { ball.velocityY = tmpY; }, 500);
                setTimeout(() => { ball.velocityX = tmpX; }, 500);
            }
        }
    }
}

//what allows players to move
function movePlayer(e) {

    if (gameMod == 1 || gameMod == 2) {
        if (e.key == 'w') {
            player1.velocityY = -10;
        }
        if (e.key == 's') {
            player1.velocityY = 10;
        }
    }
    if (gameMod == 2) {
        if (e.key == 'ArrowUp') {
            player2.velocityY = -10;
        }
        if (e.key == 'ArrowDown') {
            player2.velocityY = 10;
        }
    }

    //checks which player the game should move in online mode
    if (gameMod == 4) {
        if (player_id == 1) {
            if (e.key == 'w') {
                player1.velocityY = -10;
            }
            if (e.key == 's') {
                player1.velocityY = 10;
            }
            // if (e.key == 's' || e.key == 'w')
            //     ws.send(JSON.stringify(player1));
        }
        else if (player_id == 2) {
            if (e.key == 'w') {
                player2.velocityY = -10;
            }
            if (e.key == 's') {
                player2.velocityY = 10;
            }
            // if (e.key == 's' || e.key == 'w')
            //     ws.send(JSON.stringify(player2));
        }
    }
}

//allows the player to stop if key is released
function stopPlayer(e) {
    if (gameMod == 1 || gameMod == 2) {
        if (e.key == 'w') {
            player1.velocityY = 0;
        }
        if (e.key == 's') {
            player1.velocityY = 0;
        }
    }
    if (gameMod == 2) {
        if (e.key == 'ArrowUp') {
            player2.velocityY = 0;
        }
        if (e.key == 'ArrowDown') {
            player2.velocityY = 0;
        }
    }

    //checks which player the game should stop in online mode
    if (gameMod == 4) {
        if (player_id == 1) {
            if (e.key == 'w') {
                player1.velocityY = 0;
            }
            if (e.key == 's') {
                player1.velocityY = 0;
            }
            // if (e.key == 's' || e.key == 'w')
            //     ws.send(JSON.stringify(player1));
        }
        else if (player_id == 2) {
            if (e.key == 'w') {
                player2.velocityY = 0;
            }
            if (e.key == 's') {
                player2.velocityY = 0;
            }
            // if (e.key == 's' || e.key == 'w')
            //     ws.send(JSON.stringify(player2));
        }
    }
}

//bot prediction, made by creating an invisible ball with the same values as real ball and checking where it lands
function makeBot1Prediction() {
    let ballcpy_xPos = ball.xPos;
    let ballcpy_yPos = ball.yPos;
    let ballcpy_height = ball.height;
    let ballcpy_velocityX = ball.velocityX;
    let ballcpy_velocityY = ball.velocityY;
    let yDistance = 0;

    if (ballcpy_velocityY < 0)
        yDistance = 0;
    else
        yDistance = board_height;

    while (ballcpy_xPos + ballcpy_velocityX - 11 > 0) {
        ballcpy_xPos += ballcpy_velocityX;
        if (yDistance == 0) {
            if (ballcpy_yPos + ballcpy_velocityY > yDistance) {
                ballcpy_yPos += ballcpy_velocityY;
            }
            else {
                ballcpy_velocityY *= -1;
                ballcpy_yPos += ballcpy_velocityY;
            }
        }
        else {
            if (ballcpy_yPos + ballcpy_velocityY + ballcpy_height < yDistance) {
                ballcpy_yPos += ballcpy_velocityY;
            }
            else {
                ballcpy_velocityY *= -1;
                ballcpy_yPos += ballcpy_velocityY;
            }
        }

    }
    let res = ballcpy_xPos / (ballcpy_velocityX * -1);
    player1.prediction = ballcpy_yPos + ballcpy_height / 2 + ballcpy_velocityY * res;
}

//bot prediction, made by creating an invisible ball with the same values as real ball and checking where it lands
function makeBot2Prediction() {
    let ballcpy_xPos = ball.xPos;
    let ballcpy_yPos = ball.yPos;
    let ballcpy_height = ball.height;
    let ballcpy_width = ball.width;
    let ballcpy_velocityX = ball.velocityX;
    let ballcpy_velocityY = ball.velocityY;
    let yDistance = 0;

    if (ballcpy_velocityY < 0)
        yDistance = 0;
    else
        yDistance = board_height;

    while (ballcpy_xPos + ballcpy_velocityX + ballcpy_width + 11 < board_width) {
        ballcpy_xPos += ballcpy_velocityX;
        if (yDistance == 0) {
            if (ballcpy_yPos + ballcpy_velocityY > yDistance) {
                ballcpy_yPos += ballcpy_velocityY;
            }
            else {
                ballcpy_velocityY *= -1;
                ballcpy_yPos += ballcpy_velocityY;
                if (ballcpy_velocityY < 0)
                    yDistance = 0;
                else
                    yDistance = board_height;
            }
        }
        else {
            if (ballcpy_yPos + ballcpy_velocityY + ballcpy_height < yDistance) {
                ballcpy_yPos += ballcpy_velocityY;
            }
            else {
                ballcpy_velocityY *= -1;
                ballcpy_yPos += ballcpy_velocityY;
                if (ballcpy_velocityY < 0)
                    yDistance = 0;
                else
                    yDistance = board_height;
            }
        }

    }
    let res = (board_width - ballcpy_xPos) / ballcpy_velocityX;
    player2.prediction = ballcpy_yPos + ballcpy_height / 2 + ballcpy_velocityY * res;
}

//if option enabled, make sound each time the ball hits a paddle
function play() {
    var audio = new Audio('utils/1.mp3');
    audio.play();
}