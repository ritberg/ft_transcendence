import { sleep, writeVerticalText } from '../scripts/utils.js';
import { stars, modifyDelta, starWarsTourney } from '../scripts/stars.js';
import { tourney_game, drawBrackets } from '../scripts/brackets.js';
import { route, game } from '../scripts/router.js';
import { tournamentMessages } from '../scripts/animations.js';

/********** PONG INIT *************/

export var loop_exec = false;

export function change_loop_exec(bool) {
	loop_exec = bool;
}

export class tourney {
	canvas = document.getElementById("game_canvas");
	context = this.canvas.getContext('2d');

	//board
	board_height = 800;
	board_width = 1000;

	//player
	player_width = 30;
	player_height = 200;
	playerVelocity = 0;
	player_speed = 15;

	//balling
	ball_width = 30;
	ball_height = 30;
	ball_velocity = 5;

	first_bounce = true;

	ball = {
		width: this.ball_width,
		height: this.ball_height,
		xPos: (this.board_width / 2) - (this.ball_width / 2),
		yPos: (this.board_height / 2) - (this.ball_height / 2),
		velocityY: 0,
		velocityX: 0,
		velocityXTmp: 0,
		velocityYTmp: 0,
	}

	player1 = {
		xPos: 20,
		yPos: this.board_height / 2 - this.player_height / 2,
		width: this.player_width,
		height: this.player_height,
		velocityY: this.playerVelocity,
		score: 0,
	}

	player2 = {
		xPos: this.board_width - this.player_width - 20,
		yPos: this.board_height / 2 - this.player_height / 2,
		width: this.player_width,
		height: this.player_height,
		velocityY: this.playerVelocity,
		score: 0,
	}

	stop = true;

	constructor() {
		modifyDelta(1.5);

		// this.animation_id = null;
		this.gameLoop = this.gameLoop.bind(this);
		this.movePlayer = this.movePlayer.bind(this);
		this.stopPlayer = this.stopPlayer.bind(this);
	}

	reset_board() {
		this.player2.xPos = this.board_width - this.player_width - 20;
		this.player2.yPos = this.board_height / 2 - this.player_height / 2;
		this.player2.width = this.player_width;
		this.player2.height = this.player_height;
		this.player2.velocityY = this.playerVelocity;
		this.player2.score = 0;
		this.player2.prediction = -1;
		this.player1.xPos = 20;
		this.player1.yPos = this.board_height / 2 - this.player_height / 2;
		this.player1.width = this.player_width;
		this.player1.height = this.player_height;
		this.player1.velocityY = this.playerVelocity;
		this.player1.score = 0;
		this.player1.prediction = -1;
		this.ball.width = this.ball_width;
		this.ball.height = this.ball_height;
		this.ball.xPos = (this.board_width / 2) - (this.ball_width / 2);
		this.ball.yPos = (this.board_height / 2) - (this.ball_height / 2);
		this.ball.velocityY = 0;
		this.ball.velocityX = 0;
		this.ball.velocityXTmp = 0;
		this.ball.velocityYTmp = 0;
	}

	loopTourney()
	{
		loop_exec = true;
		this.canvas.width = this.board_width;
		this.canvas.height = this.board_height;
		let ran = Math.floor(Math.random() * 2);
		let tmp = this.ball_velocity;
		let tmp2 = 0;
		while (tmp2 == 0)
			tmp2 = Math.floor(Math.random() * 11) - 5;
		this.ball.velocityY = tmp2;
		if (ran == 0) {
			tmp *= -1;
		}
		this.ball.velocityX = tmp;
		this.ball.velocityX = 0;
		this.ball.velocityY = 0;
		setTimeout(() => { this.ball.velocityY = tmp2; }, 500);
		setTimeout(() => { this.ball.velocityX = tmp; }, 500);
		document.addEventListener("keydown", this.movePlayer);
		document.addEventListener("keyup", this.stopPlayer);
		this.gameLoop();
	}

	async gameLoop() {
		loop_exec = true;
		if (this.player1.score == tourney_game.max_points || this.player2.score == tourney_game.max_points) {
			//console.log(tourney_game.index, tourney_game.score[0][0].name);
			tourney_game.score[tourney_game.index][1] = this.player1.score;
			tourney_game.score[tourney_game.index + 1][1] = this.player2.score;
			if (this.player1.score > this.player2.score) {
				tourney_game.score.push([tourney_game.score[tourney_game.index][0], 172]);
				tournamentMessages("tournament", `${tourney_game.score[tourney_game.index][0]} won !`);
			}
			else {
				tourney_game.score.push([tourney_game.score[tourney_game.index + 1][0], 172]);
				tournamentMessages("tournament", `${tourney_game.score[tourney_game.index + 1][0]} won !`);
			}
			tourney_game.index += 2;
			this.player1.score = 0;
			this.player2.score = 0;
			this.player1.yPos = this.board_height / 2 - 100;
			this.player2.yPos = this.player1.yPos;
			this.context.clearRect(0, 0, this.board_width, this.board_height);
			loop_exec = false;
			modifyDelta(1.5);
			stars(document.getElementById("game_canvas"));
			await sleep(500);
			if (window.location.pathname !== "/tourney/") {
				change_loop_exec(false);
				modifyDelta(1.5);
				stars(document.getElementById("main_canvas"));
				return;
			}
			await drawBrackets();
			if (window.location.pathname !== "/tourney/") {
				change_loop_exec(false);
				modifyDelta(1.5);
				stars(document.getElementById("main_canvas"));
				return;
			}
			//await starWars();
			let last_player = 0;
			for (let z = tourney_game.player.length; z > 1; z /= 2)
				last_player += z;
			if (tourney_game.index != last_player)
				await starWarsTourney();
			else {
				stars(document.getElementById("main_canvas"));
				//document.getElementById("main-menu").style.display = "flex";
				//document.getElementById("main-menu").style.opacity = "0";
				//await sleep(100);
				//document.getElementById("main-menu").classList.remove("hidden");
				//document.getElementById("main-menu").classList.add("shown");
				//await sleep(200);
				//document.getElementById("main-menu").style.opacity = "1";
				if (window.location.pathname == "/tourney/")
					route("/");
				return;
			}
		}
		else {
			//move players
			this.move_players();

			//this.ball
			this.changeBallVelocity();

			//draw
			this.draw_board();
		}
		game.animation_id = window.requestAnimationFrame(this.gameLoop);

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

		this.context.fillStyle = "white";

		//players
		this.context.fillRect(this.player1.xPos, this.player1.yPos, this.player1.width, this.player1.height);
		this.context.fillRect(this.player2.xPos, this.player2.yPos, this.player2.width, this.player2.height);
		this.context.fillStyle = "black";
		writeVerticalText(this.context, tourney_game.score[tourney_game.index][0], 25, this.player1.yPos + 100, "30px Arial", 0);
		writeVerticalText(this.context, tourney_game.score[tourney_game.index + 1][0], 975, this.player2.yPos + 100, "30px Arial", 1);
		this.context.fillStyle = "white";

		//this.ball
		this.context.fillRect(this.ball.xPos, this.ball.yPos, this.ball.width, this.ball.height);
	}

	move_players() {
		//player 1
		if (this.player1.yPos + this.player1.velocityY > 20 && this.player1.yPos + this.player1.velocityY + this.player1.height < this.board_height - 20)
			this.player1.yPos += this.player1.velocityY;
		else if (!(this.player1.yPos + this.player1.velocityY > 20))
			this.player1.yPos = 20;
		else if (!(this.player1.yPos + this.player1.velocityY + this.player1.height < this.board_height - 20))
			this.player1.yPos = this.board_height - this.player1.height - 20;

		//player 2
		if (this.player2.yPos + this.player2.velocityY > 20 && this.player2.yPos + this.player2.velocityY + this.player2.height < this.board_height - 20)
			this.player2.yPos += this.player2.velocityY;
		else if (!(this.player2.yPos + this.player2.velocityY > 20))
			this.player2.yPos = 20;
		else if (!(this.player2.yPos + this.player2.velocityY + this.player2.height < this.board_height - 20))
			this.player2.yPos = this.board_height - this.player2.height - 20;
	}

	changeBallVelocity() {
		if (!(this.ball.yPos + this.ball.velocityY > 0 && this.ball.yPos + this.ball.velocityY + this.ball.height < this.board_height)) {
			this.ball.velocityY *= -1;
		}
		if (this.ball.xPos + this.ball.width >= this.board_width - this.player1.xPos - this.player2.width) {
			if (this.ball.yPos + this.ball.velocityY + this.ball.height + 2 >= this.player2.yPos && this.ball.yPos + this.ball.velocityY - 2 <= this.player2.yPos + this.player2.height && this.ball.velocityX > 0) {
				this.ball.velocityY = ((this.ball.yPos + this.ball.height / 2) - (this.player2.yPos + this.player2.height / 2)) / 15;
				this.ball.velocityX *= -1;
				if (this.ball.velocityX < 0)
					this.ball.velocityX -= 0.5;
				else
					this.ball.velocityX += 0.5;
				if (this.first_bounce == true) {
					if (this.ball.velocityX < 0)
						this.ball.velocityX -= 5;
					else
						this.ball.velocityX += 5;
					this.first_bounce = false;
				}
			}
		}
		if (this.ball.xPos <= this.player1.xPos + this.player1.width) {
			if (this.ball.yPos + this.ball.velocityY + this.ball.height + 2 >= this.player1.yPos && this.ball.yPos + this.ball.velocityY - 2 <= this.player1.yPos + this.player1.height && this.ball.velocityX < 0) {
				this.ball.velocityY = ((this.ball.yPos + this.ball.height / 2) - (this.player1.yPos + this.player1.height / 2)) / 15;
				this.ball.velocityX *= -1;
				if (this.ball.velocityX < 0)
					this.ball.velocityX -= 0.5;
				else
					this.ball.velocityX += 0.5;
				if (this.first_bounce == true) {
					if (this.ball.velocityX < 0)
						this.ball.velocityX -= 5;
					else
						this.ball.velocityX += 5;
					this.first_bounce = false;
				}
			}
		}
		if (!(this.ball.xPos + this.ball.velocityX > 0 && this.ball.xPos + this.ball.velocityX + this.ball.width < this.board_width)) {
			this.context.fillStyle = "white";
			if (!(this.ball.xPos + this.ball.velocityX > 0))
				this.player2.score++;
			else
				this.player1.score++;

			// if (this.player1.score == 5) {
			//     stop_playing();
			//     this.context.font = "100px serif";
			//     this.context.fillText("Player 1 won !", 325, 400);
			//     this.stop = true;
			//     return;
			// }
			// if (this.player2.score == 5) {
			//     stop_playing();
			//     this.context.font = "100px serif";
			//     this.context.fillText("Player 2 won !", 330, 400);
			//     this.stop = true;
			//     return;
			// }
			this.first_bounce = true;
			this.ball.xPos = (this.board_width / 2) - (this.ball_width / 2);
			this.ball.yPos = (this.board_height / 2) - (this.ball_height / 2);
			let ran = Math.floor(Math.random() * 2);
			this.ball.velocityX = this.ball_velocity;
			this.ball.velocityY = 0;
			while (this.ball.velocityY == 0)
				this.ball.velocityY = Math.floor(Math.random() * 11) - 5;
			if (ran == 0)
				this.ball.velocityX *= -1;
			this.ball.velocityXTmp = this.ball.velocityX;
			this.ball.velocityYTmp = this.ball.velocityY;
			this.ball.velocityX = 0;
			this.ball.velocityY = 0;
			setTimeout(() => { this.ball.velocityY = this.ball.velocityYTmp; }, 500);
			setTimeout(() => { this.ball.velocityX = this.ball.velocityXTmp; }, 500);
		}
		this.ball.xPos += this.ball.velocityX;
		this.ball.yPos += this.ball.velocityY;
	}

	movePlayer(e) {
		if (e.key == 'w') {
			this.player1.velocityY = -this.player_speed;
		}
		if (e.key == 's') {
			this.player1.velocityY = this.player_speed;
		}
		if (e.key == 'ArrowUp') {
			this.player2.velocityY = -this.player_speed;
		}
		if (e.key == 'ArrowDown') {
			this.player2.velocityY = this.player_speed;
		}
	}

	stopPlayer(e) {
		if (e.key == 'w' || e.key == 's')
			this.player1.velocityY = 0;
		else if (e.key == 'ArrowUp' || e.key == 'ArrowDown')
			this.player2.velocityY = 0
	}
}