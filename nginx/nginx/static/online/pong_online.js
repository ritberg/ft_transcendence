import { route } from '../scripts/router.js';
import { getUserId } from '../scripts/users.js'
import { token } from '../scripts/users.js';

var ws;
var username;

var p1 = "";
var p2 = "";
var p1Id = "";
var p2Id = "";
var side = 0;

const audio = new Audio("static/online/utils/1.mp3");

var context;
var board;
//board
let board_height = 800;
let board_width = 1000;

//player
let player_width = 30;
let player_height = 200;

//balling
let ball_width = 30;
let ball_height = 30;

let ball = {
    width: ball_width,
    height: ball_height,
    xPos: (board_width / 2) - (ball_width / 2),
    yPos: (board_height / 2) - (ball_height / 2),
}

let player1 = {
    xPos: 20,
    yPos: board_height / 2 - player_height / 2,
    score: 0,
    velocity: 0,
}

let player2 = {
    xPos: board_width - player_width - 10,
    yPos: board_height / 2 - player_height / 2,
    score: 0,
    velocity: 0,
}

var sound = false;
var isalone = true;
var disconnect = false;
var start_time;

// var fpsInterval;
// var then;

// function startAnimating(fps) {
//     fpsInterval = 1000 / fps;
//     then = performance.now();
//     gameLoop();
// }

export function online_game(new_ws) {
    ws = new_ws;
    ws.addEventListener("message", async (event) => {
        let messageData = JSON.parse(event.data);
        // console.log(messageData);
        if (messageData.type === "stateUpdate") {
            player1.yPos = messageData.objects.player1Pos;
            player2.yPos = messageData.objects.player2Pos;
            ball.xPos = messageData.objects.ball_xPos;
            ball.yPos = messageData.objects.ball_yPos;
            player1.score = messageData.objects.player1Score;
            player2.score = messageData.objects.player2Score;
            if (messageData.objects.sound == true)
                play();
        }
        else if (messageData.type === "playerNum") {
            if (messageData.objects.num === 2)
            {
                isalone = false;
                start_time = new Date();
                p1Id = await getUserId(messageData.objects.p1Name);
                p2Id = await getUserId(messageData.objects.p2Name);
                console.log("p1Id: ", p1Id);
                console.log("p2Id: ", p2Id);
            }
            else if (messageData.objects.num === 1)
            {
                disconnect = true;
                let end_time = new Date();
                let duration = (end_time - start_time) / 1000;
                ws.close();
                let winner;
                if (side == "left")
                    winner = p1Id;
                else
                    winner = p2Id;
                const game = {
                    player_1_id: p1Id,
                    player_2_id: p2Id,
                    player_1_score: player1.score,
                    player_2_score: player2.score,
                    winner_id: winner,
                    data_played: new Date().toISOString(),
                    duration: duration,
                };
                console.log("gamehere: ", game);
                sendStats(game);
                setTimeout(() => { route("/"); }, 5000);
            }
            
            p1 = messageData.objects.p1Name;
            p2 = messageData.objects.p2Name;

        }
        else if (messageData.type === "playerId") {
            username = messageData.objects.id;
            side = messageData.objects.side;
        }
    });

    board = document.getElementById("game_canvas");
    board.width = board_width;
    board.height = board_height;
    context = board.getContext("2d");

    document.addEventListener("keydown", movePlayer);
    document.addEventListener("keyup", stopPlayer);
    draw_board();
    gameLoop();
    // startAnimating(60);
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

    context.font = "30px Comic Sans MS";
    let textWidth = context.measureText(p1).width;
    context.fillText(p1, (board_width / 8) - (textWidth / 10), 50);
    textWidth = context.measureText(p2).width;
    context.fillText(p2, (board_width / (1)) - (textWidth / (1)), 50);

    context.textAlign = "left";
    context.fillStyle = "white";

    //players
    context.fillRect(player1.xPos, player1.yPos, player_width, player_height);
    context.fillRect(player2.xPos, player2.yPos, player_width, player_height);

    //ball
    context.fillRect(ball.xPos, ball.yPos, ball.width, ball.height);
}

var trigger = true;

async function sendStats(game) {
    try {
        const response = await fetch("https://localhost/stat/game-history/", {
            method: "POST",
            headers: {
            "X-CSRFToken": token,
            "Content-Type": "application/json",
            },
            body: JSON.stringify(game),
            credentials: "include",
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.log(response);
            throw new Error(
            `Network response was not ok: ${JSON.stringify(errorData)}`
            );
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Fetch error: ", error);
    }
}

function gameLoop() {
    window.requestAnimationFrame(gameLoop);
    draw_board();
    if (isalone == true)
    {
        context.font = "48px serif";
        context.fillStyle = "white";
        context.fillText("waiting for a second player", 250, 315);
    }
    else if (disconnect == true)
    {
        context.font = "48px serif";
        context.fillStyle = "white";
        context.fillText("a player has disconnected", 250, 315);
    }
    if (player1.score == 5)
    {
        if (trigger == true)
        {
            if (side == "left")
            {
                let end_time = new Date();
                let duration = (end_time - start_time) / 1000;
                const game = {
                    player_1_id: p1Id,
                    player_2_id: p2Id,
                    player_1_score: player1.score,
                    player_2_score: player2.score,
                    winner_id: p1Id,
                    data_played: new Date().toISOString(),
                    duration: duration,
                };
                console.log("gamehere: ", game);
                sendStats(game);
            }
            ws.close();
            setTimeout(() => { route("/"); }, 5000);
            trigger = false;
        }
        context.font = "100px serif";
        context.fillText("Player 1 won !", 250, 400);
    }
    else if (player2.score == 5)
    {
        if (trigger == true)
        {
            if (side == "right")
            {
                let end_time = new Date();
                let duration = (end_time - start_time) / 1000;
                const game = {
                    player_1_id: p1Id,
                    player_2_id: p2Id,
                    player_1_score: player1.score,
                    player_2_score: player2.score,
                    winner_id: p2Id,
                    data_played: new Date().toISOString(),
                    duration: duration,
                };
                console.log("gamehere: ", game);
                sendStats(game);
            }
            ws.close();
            setTimeout(() => { route("/"); }, 5000);
            trigger = false;
        }
        context.font = "100px serif";
        context.fillText("Player 2 won !", 250, 400);
    }
}

function play() {
    if (sound == true)
        audio.play();
}

var lastSent = "none";

function movePlayer(e) {
    if (e.key == 'w' && lastSent != "keyW") {
        ws.send(JSON.stringify({ type: "keyW", username: username }));
        lastSent = "keyW";
    }
    if (e.key == 's' && lastSent != "keyS") {
        ws.send(JSON.stringify({ type: "keyS", username: username }));
        lastSent = "keyS"
    }
}

//allows the player to stop if key is released
function stopPlayer(e) {
    if (e.key == 'w' && lastSent != "keyStop") {
        ws.send(JSON.stringify({ type: "keyStop", username: username }));

        lastSent = "keyStop"
    }
    if (e.key == 's' && lastSent != "keyStop") {
        ws.send(JSON.stringify({ type: "keyStop", username: username }));
        lastSent = "keyStop"  
    }
}
