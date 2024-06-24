import { route } from '../scripts/router.js';
import { getUserId } from '../scripts/users.js'
import { token } from '../scripts/users.js';
import { game } from '../scripts/router.js';
import { modifyDelta } from '../scripts/stars.js';
import { writeVerticalText } from '../scripts/utils.js';

export class online {
    username;

    p1 = "";
    p2 = "";
    p1Id = "";
    p2Id = "";
    side = 0;

    board = document.getElementById("game_canvas");
    context = this.board.getContext("2d");
    //board
    board_height = 800;
    board_width = 1000;

    //player
    player_width = 30;
    player_height = 200;

    //balling
    ball_width = 30;
    ball_height = 30;

    ball = {
        width: this.ball_width,
        height: this.ball_height,
        xPos: (this.board_width / 2) - (this.ball_width / 2),
        yPos: (this.board_height / 2) - (this.ball_height / 2),
    }

    player1 = {
        xPos: 20,
        yPos: this.board_height / 2 - this.player_height / 2,
        score: 0,
        velocity: 0,
    }

    player2 = {
        xPos: this.board_width - this.player_width - 10,
        yPos: this.board_height / 2 - this.player_height / 2,
        score: 0,
        velocity: 0,
    }

    isalone = true;
    disconnect = false;
    start_time;

    constructor() {
        modifyDelta(1.5);
		// this.animation_id = null;
		this.gameLoop = this.gameLoop.bind(this);
		this.movePlayer = this.movePlayer.bind(this);
		this.stopPlayer = this.stopPlayer.bind(this);
	}

    online_game() {
        game.ws.addEventListener("message", async (event) => {
            let messageData = JSON.parse(event.data);
            // console.log(messageData);
            if (messageData.type === "stateUpdate") {
                this.player1.yPos = messageData.objects.player1Pos;
                this.player2.yPos = messageData.objects.player2Pos;
                this.ball.xPos = messageData.objects.ball_xPos;
                this.ball.yPos = messageData.objects.ball_yPos;
                this.player1.score = messageData.objects.player1Score;
                this.player2.score = messageData.objects.player2Score;
            }
            else if (messageData.type === "playerNum") {
                if (messageData.objects.num === 2)
                {
                    this.isalone = false;
                    this.start_time = new Date();
                    this.p1Id = messageData.objects.p1Id;
                    this.p2Id = messageData.objects.p2Id;
                    console.log("this.p1Id: ", this.p1Id);
                    console.log("this.p2Id: ", this.p2Id);
                }
                else if (messageData.objects.num === 1)
                {
                    this.disconnect = true;
                    let end_time = new Date();
                    let duration = (end_time - this.start_time) / 1000;
                    game.ws.close();
                    game.ws = null;
                    let winner;
                    if (this.p1Id && this.p2Id) {
                        if (this.side == "left")
                            winner = this.p1Id;
                        else
                            winner = this.p2Id;
                        const game_stat = {
                            player_1_id: this.p1Id,
                            player_2_id: this.p2Id,
                            player_1_score: this.player1.score,
                            player_2_score: this.player2.score,
                            winner_id: winner,
                            data_played: new Date().toISOString(),
                            duration: duration,
                        };
                        this.sendStats(game_stat);
                    }
                    setTimeout(() => { route("/"); }, 5000);
                }
                
                this.p1 = messageData.objects.p1Name;
                this.p2 = messageData.objects.p2Name;

            }
            else if (messageData.type === "playerId") {
                this.username = messageData.objects.id;
                this.side = messageData.objects.side;
            }
        });

        document.addEventListener("keydown", this.movePlayer);
        document.addEventListener("keyup", this.stopPlayer);
        this.draw_board();
        this.gameLoop();
        // startAnimating(60);
    }

    fill_middle_lines() {
        for (let i = 10; i < this.board_height - 30; i += 50) {
            this.context.fillRect(this.board_width / 2 - 5, i, 10, 30);
        }
    }

    draw_board() {
        this.context.clearRect(0, 0, this.board_width, this.board_height);

        this.context.fillStyle = "rgb(70, 70, 70)";
        //middle_line
        this.fill_middle_lines();

        //score
        this.context.font = "100px Arial";
        this.context.textAlign = "center";
        this.context.fillText(this.player1.score.toString(), this.board_width / 3, 100);
        this.context.fillText(this.player2.score.toString(), this.board_width - this.board_width / 3, 100);

			this.context.fillStyle = "black";
        let textWidth = this.context.measureText(this.p1).width;
        this.context.fillText(this.p1, (this.board_width / 8) - (textWidth / 10), 50);
			writeVerticalText(this.context, this.p1, 22.5, this.player1.yPos + 100, "35px Arial", 0);
			writeVerticalText(this.context, this.p2, 977.5, this.player2.yPos + 100, "35px Arial", 1);

        this.context.textAlign = "left";
        this.context.fillStyle = "white";

        //players
        this.context.fillRect(this.player1.xPos, this.player1.yPos, this.player_width, this.player_height);
        this.context.fillRect(this.player2.xPos, this.player2.yPos, this.player_width, this.player_height);

        //ball
        this.context.fillRect(this.ball.xPos, this.ball.yPos, this.ball.width, this.ball.height);
    }

    trigger = true;

    async sendStats(game_stat) {
        let statsUrl = 'https://' + window.location.host + "/stat/game-history/";
        try {
            const response = await fetch(statsUrl, {
                method: "POST",
                headers: {
                "X-CSRFToken": token,
                "Content-Type": "application/json",
                },
                body: JSON.stringify(game_stat),
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

    gameLoop() {
        game.animation_id = window.requestAnimationFrame(this.gameLoop);
        this.draw_board();
        if (this.isalone == true)
        {
					this.context.textAlign = "center";
            this.context.font = "48px Arial";
            this.context.fillStyle = "white";
						this.context.fillText("WAITING FOR A SECOND PLAYER", this.board_width / 2, this.board_height / 3);
        }
        else if (this.disconnect == true)
        {
					this.context.textAlign = "center";
            this.context.font = "48px Arial";
            this.context.fillStyle = "white";
						this.context.fillText("A PLAYER HAS DISCONNECTED", this.board_width / 2, this.board_height / 3);
        }
        if (this.player1.score == 5)
        {
            if (this.trigger == true)
            {
                if (this.side == "left" && this.p1Id && this.p2Id)
                {
                    let end_time = new Date();
                    let duration = (end_time - this.start_time) / 1000;
                    const game_stat = {
                        player_1_id: this.p1Id,
                        player_2_id: this.p2Id,
                        player_1_score: this.player1.score,
                        player_2_score: this.player2.score,
                        winner_id: this.p1Id,
                        data_played: new Date().toISOString(),
                        duration: duration,
                    };
                    console.log("gamehere: ", game_stat);
                    this.sendStats(game_stat);
                }
                game.ws.close();
                game.ws = null;
                setTimeout(() => { route("/"); }, 5000);
                this.trigger = false;
            }
					this.context.textAlign = "center";
					this.context.font = "100px Arial";
					this.context.fillText("PLAYER 1 WON!", this.board_width / 2, this.board_height / 3);
        }
        else if (this.player2.score == 5)
        {
            if (this.trigger == true)
            {
                if (this.side == "right" && this.p1Id && this.p2Id)
                {
                    let end_time = new Date();
                    let duration = (end_time - this.start_time) / 1000;
                    const game_stat = {
                        player_1_id: this.p1Id,
                        player_2_id: this.p2Id,
                        player_1_score: this.player1.score,
                        player_2_score: this.player2.score,
                        winner_id: this.p2Id,
                        data_played: new Date().toISOString(),
                        duration: duration,
                    };
                    console.log("gamehere: ", game_stat);
                    this.sendStats(game_stat);
                }
                game.ws.close();
                game.ws = null;
                setTimeout(() => { route("/"); }, 5000);
                this.trigger = false;
            }
					this.context.textAlign = "center";
					this.context.font = "100px Arial";
					this.context.fillText("PLAYER 2 WON!", this.board_width / 2, this.board_height / 3);
        }
    }

    lastSent = "none";

    movePlayer(e) {
        if (game.ws == null)
            return;
        if (e.key == 'w' && this.lastSent != "keyW") {
            game.ws.send(JSON.stringify({ type: "keyW", username: this.username }));
            this.lastSent = "keyW";
        }
        if (e.key == 's' && this.lastSent != "keyS") {
            game.ws.send(JSON.stringify({ type: "keyS", username: this.username }));
            this.lastSent = "keyS"
        }
    }

    //allows the player to stop if key is released
    stopPlayer(e) {
        if (game.ws == null)
            return;
        if (e.key == 'w' && this.lastSent != "keyStop") {
            game.ws.send(JSON.stringify({ type: "keyStop", username: this.username }));

            this.lastSent = "keyStop"
        }
        if (e.key == 's' && this.lastSent != "keyStop") {
            game.ws.send(JSON.stringify({ type: "keyStop", username: this.username }));
            this.lastSent = "keyStop"  
        }
    }
}
