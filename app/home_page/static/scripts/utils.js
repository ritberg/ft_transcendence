export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomNumber(numberList) {
	const listLength = numberList.length;
	const randomIndex = Math.random();
	const randomIntegerIndex = Math.floor(randomIndex * listLength);
	return numberList[randomIntegerIndex];
}

export function writeVerticalText(context, text, x, y, font, rotation) {
	context.save(); // Save the current state
	context.translate(x, y); // Move the origin
	if (rotation == 0)
		context.rotate(Math.PI / 2); // Rotate 90 degrees counter-clockwise
	else
		context.rotate(-Math.PI / 2); // Rotate 90 degrees counter-clockwise
	context.font = font;
	context.fillText(text, 0, 0); // Draw text horizontally at origin
	context.restore(); // Restore the original state
}

export class Player {
	constructor(name, fighter) {
		this.name = name;
		this.fighter = fighter;
	}
}

export class Game {
	constructor(player, index, scores) {
		this.player = [];
		this.index = index;
		this.scores = [];
	}
	addScore(scorePair) {
		if (Array.isArray(scorePair) && scorePair.length === 2 && 
			typeof scorePair[0] === 'number' && typeof scorePair[1] === 'number') {
			this.scores.push(scorePair);
		} else {
			throw new Error('Score must be an array of two numbers');
		}
	}
}
