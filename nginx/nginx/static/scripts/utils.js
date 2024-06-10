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

export class Game {
	constructor(player, index, scores, max_points, max_phases) {
		this.player = [];
		this.index = index;
		this.score = [];
		this.max_points;
		this.max_phases;
	}
}
