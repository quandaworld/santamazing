/*-------------------------------- Constants --------------------------------*/

const singleCellSize = 20;
const gridHeight = 300;
const gridWidth = 300;
const totalGridRows = gridHeight / singleCellSize; // 15
const totalGridCols = gridWidth / singleCellSize; // 15
const gridArr = [];
const wallCoords = { tops: [], bottoms: [], lefts: [], rights: [] }
const santaCurrentPos = { top: 0, left: 0 };


/*---------------------------- Variables (state) ----------------------------*/

let totalTime = 60; // 30 seconds


/*------------------------ Cached Element References ------------------------*/

const maze = document.getElementById('maze');
const santa = document.getElementById('santa');
const exit = document.getElementById('exit');
const walls = document.getElementsByClassName('wall');
const wallHeight = document.getElementById('top').clientHeight; // top and bottom walls height
const restartBtn = document.getElementById('restart');
const playBtn = document.getElementById('play');
const playAgainBtn = document.getElementById('play-again');
const timeEl = document.getElementById('time');
const resultDiv = document.getElementById('result');


/*-------------------------------- Grid Manipulations --------------------------------*/

// Populate grid's outer walls
function initializeOuterWalls() {
	for (let i = 0; i < walls.length; i++) {
		wallCoords.lefts.push(walls[i].offsetLeft);
		wallCoords.rights.push(walls[i].offsetLeft + walls[i].clientWidth);
		wallCoords.tops.push(walls[i].offsetTop);
		wallCoords.bottoms.push(walls[i].offsetTop + walls[i].clientHeight);
	}
}

// Populate grid array structure with rows and columns
function initializeGrid() {
	for (let i = 0; i < totalGridRows; i++) {
		const singleRowArr = [];

		for (let j = 0; j < totalGridCols; j++) {
			singleRowArr.push({ u: 0, d: 0, l: 0, r: 0, v: 0 }); // up, down, left, right, visited
		}

		gridArr.push(singleRowArr);
	}
}

// Create maze's vertical boundaries with random entry and exit gaps
function createVerticalBoundaries() {
	const topHeight = Math.floor(Math.random() * totalGridRows) * singleCellSize;
	const botHeight = gridHeight - singleCellSize - topHeight;
	const rightWall_x = gridWidth + singleCellSize;

	const boundaries = [
		{ t: singleCellSize, l: singleCellSize, h: topHeight },
		{ t: topHeight + 2 * singleCellSize, l: singleCellSize, h: botHeight },
		{ t: singleCellSize, l: rightWall_x, h: botHeight },
		{ t: botHeight + 2 * singleCellSize, l: rightWall_x, h: topHeight }
	];

	// Set Santa entry & exit position
	Object.assign(santa.style, { top: `${topHeight + singleCellSize}px`, left: '0px' });
	Object.assign(exit.style, { top: `${botHeight + singleCellSize}px`, left: `${rightWall_x}px` });

	// Update Santa's current position
	santaCurrentPos.top = topHeight + singleCellSize;

	// Create boundaries
	boundaries.forEach(({ t, l, h }) => {
		const wall = document.createElement('div');
		Object.assign(wall.style, { top: `${t}px`, left: `${l}px`, height: `${h}px`, width: `${wallHeight}px` });
		wall.classList.add('wall', 'extra');
		maze.appendChild(wall);
	});

	updateWallCoords(topHeight, botHeight, rightWall_x);
}

// Helper method for createVerticalBoundaries()
function updateWallCoords(topHeight, botHeight, rightWall_x) {
	wallCoords.lefts.push(
		0,
		gridWidth + 2 * singleCellSize,
		0,
		0,
		rightWall_x,
		rightWall_x
	);

	wallCoords.rights.push(
		wallHeight,
		gridWidth + 2 * singleCellSize + wallHeight,
		singleCellSize,
		singleCellSize,
		gridWidth + 2 * singleCellSize,
		gridWidth + 2 * singleCellSize
	);

	wallCoords.tops.push(
		topHeight + singleCellSize,
		botHeight + singleCellSize,
		topHeight + singleCellSize,
		topHeight + 2 * singleCellSize,
		botHeight + singleCellSize,
		botHeight + 2 * singleCellSize
	);

	wallCoords.bottoms.push(
		topHeight + singleCellSize * 2,
		botHeight + singleCellSize * 2,
		topHeight + singleCellSize + wallHeight,
		topHeight + 2 * singleCellSize + wallHeight,
		botHeight + singleCellSize + wallHeight,
		botHeight + 2 * singleCellSize + wallHeight
	);
}

// Helper method for generateRandomMaze()
function shuffleArr(arr) {
	for (let i = arr.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}

	return arr;
}

// Carve out a random maze using recursion
function generateRandomMaze(currentX, currentY) {
	const dirs = shuffleArr(['u', 'd', 'l', 'r']); // up, down, left, right
	const dirsCoords = { // Directions' coordinates x, y, opposite
		u: { x: 0, y: -1, o: 'd' },
		d: { x: 0, y: 1, o: 'u' },
		l: { x: -1, y: 0, o: 'r' },
		r: { x: 1, y: 0, o: 'l' },
	};

	for (let i = 0; i < dirs.length; i++) {
		const newX = currentX + dirsCoords[dirs[i]].x;
		const newY = currentY + dirsCoords[dirs[i]].y;

		gridArr[currentY][currentX].v = 1;

		if (newX >= 0 && newX < totalGridCols && newY >= 0 && newY < totalGridRows && gridArr[newY][newX].v === 0) {
			gridArr[currentY][currentX][dirs[i]] = 1;
			gridArr[newY][newX][dirsCoords[dirs[i]].o] = 1;
			generateRandomMaze(newX, newY);
		}
	}
}

// Create maze's internal walls
function createMazeWalls(x, y, u, d, l, r) {
	const top = (y + 1) * singleCellSize;
	const left = (x + 1) * singleCellSize;

	const innerWalls = [];

	if (l === 0 && x > 0) {
		innerWalls.push({
			top,
			left,
			width: wallHeight,
			height: singleCellSize,
		});
	}

	if (d === 0 && y < totalGridRows - 1) {
		innerWalls.push({
			top: top + singleCellSize,
			left,
			width: singleCellSize + wallHeight,
			height: wallHeight,
		});
	}

	innerWalls.forEach(({ top, left, width, height }) => {
		const el = document.createElement('div');
		Object.assign(el.style, { top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px` });
		el.classList.add('wall', 'extra');
		maze.appendChild(el);
	});
}

// Display maze
function displayMaze() {
	for (let x = 0; x < totalGridCols; x++) {
		for (let y = 0; y < totalGridRows; y++) {
			const u = gridArr[y][x].u;
			const d = gridArr[y][x].d;
			const l = gridArr[y][x].l;
			const r = gridArr[y][x].r;

			createMazeWalls(x, y, u, d, l, r);
		}
	}
}

// Add emojis to maze
function displayEmojis() {
	const emojis = {
		cookie: '🍪',
		clock: '⏰',
		kid: '👧🏻',
		key: '🔑',
	};

	for (let emo in emojis) {
		const randomX = (Math.floor(Math.random() * totalGridCols) + 1) * singleCellSize;
		const randomY = (Math.floor(Math.random() * totalGridRows) + 1) * singleCellSize;
		const emoji = document.createElement('div');

		emoji.setAttribute('id', emo);
		emoji.style.left = `${randomX}px`;
		emoji.style.top = `${randomY}px`;
		emoji.innerText = emojis[emo];
		maze.appendChild(emoji);
	}
}


/*-------------------------------- Other DOM Components --------------------------------*/

// Update page UI when game ends
function displayResult() {
	document.getElementById('maze').style.filter = 'blur(5px)'; // Blurs entire grid & walls
	resultDiv.classList.add('show');
	playBtn.classList.add('hide');
	restartBtn.classList.add('hide');
	playAgainBtn.classList.add('show');

	if (checkGameStatus() === 'win') {
		santa.innerText = '';
		exit.innerText = '🎉';
		resultDiv.innerText = 'Mission Accomplished!';
	} else if (checkGameStatus() === 'lose') {
		resultDiv.innerText = "Time's Up!";
	}

	document.removeEventListener('keydown', handleKeyboardInput); // This needs to be updated because it removes everything including Enter
}

// Update top scorers board with localStorage
function updateRecordBoard() {

}


/*-------------------------------- Audio Components --------------------------------*/

// Play slow music when page is done loading and when game is over

// Play fast music when player hit start, stop when game is over


/*-------------------------------- Game Logic --------------------------------*/

// Helper method for checkVerticalWall and checkHorizontalWall, return true if no wall in the way, otherwise return fall
function checkWall(dir, isVertical) {
	const x = santa.offsetLeft;
	const y = santa.offsetTop;
	const maxLen = Math.max(wallCoords.lefts.length, wallCoords.rights.length, wallCoords.tops.length, wallCoords.bottoms.length);
	const wallChecks = [];
	let check;

	for (let i = 0; i < maxLen; i++) {
		check = 0; // 0 is wall, 1 is no wall

		if (isVertical) {
			if (x < wallCoords.lefts[i] || x > wallCoords.rights[i] - singleCellSize) check = 1;
			if (dir === "u" && (y < wallCoords.tops[i] || y > wallCoords.bottoms[i])) check = 1;
			if (dir === "d" && (y < wallCoords.tops[i] - singleCellSize || y > wallCoords.bottoms[i] - singleCellSize)) check = 1;
		} else {
			if (y < wallCoords.tops[i] || y > wallCoords.bottoms[i] - singleCellSize) check = 1;
			if (dir === "l" && (x < wallCoords.lefts[i] || x > wallCoords.rights[i])) check = 1;
			if (dir === "r" && (x < wallCoords.lefts[i] - singleCellSize || x > wallCoords.rights[i] - singleCellSize)) check = 1;
		}

		wallChecks.push(check);
	}

	return wallChecks.every(check => check === 1);
}

// Check if Santa can move vertically
function checkVerticalWall(dir) {
	return checkWall(dir, true);
}

// Check if Santa can move horizontally
function checkHorizontalWall(dir) {
	return checkWall(dir, false);
}

// Start and pause timer when game ends
function runTimer() {
	const timer = setInterval(() => {
		timeEl.innerText = '00:' + String(totalTime).padStart(2, '0');
		totalTime--;

		if (checkGameStatus()) {
			clearInterval(timer);
			displayResult();
		}
	}, 1000);
}

// Check if Santa collides with emojis, helper method for updateTimer()
function isCollided(emo) { // this has to check when santa about to
	return santa.offsetLeft === emo.offsetLeft && santa.offsetTop === emo.offsetTop;
}

// Update timer as Santa hits different emojis
function updateTimer() {
	const emojis = {
		cookie: document.getElementById('cookie'),
		clock: document.getElementById('clock'),
		kid: document.getElementById('kid'),
		key: document.getElementById('key'),
	}

	const emojiEffects = {
		cookie: () => totalTime += 6,
		clock: () => totalTime += 11,
		kid: () => Object.assign(santa.style, { top: `${santaCurrentPos.top}px`, left: '0px' }),
		key: () => {
			totalTime -= 9;
			// highlighting the correct path
		},
	};

	for (let emo in emojis) {
		if (isCollided(emojis[emo])) {
			emojiEffects[emo]();
			emojis[emo].classList.add('hide'); // remove emo after colliding
		}		
	}
}


// Return game status
function checkGameStatus() {
	if (totalTime < 0 && santa.offsetLeft <= gridWidth) return "lose";
	if (totalTime <= 60 && santa.offsetLeft > gridWidth) return "win";
}


/*-------------------------------- Keyboard Events --------------------------------*/

function up() {
	if (checkVerticalWall('u')) {
		santa.style.top = santa.offsetTop - singleCellSize + 'px';
	}
}

function down() {
	if (checkVerticalWall('d')) {
		santa.style.top = santa.offsetTop + singleCellSize + 'px';
	}
}

function left() {
	if (checkHorizontalWall('l')) {
		santa.style.left = santa.offsetLeft - singleCellSize + 'px';
	}
}

function right() {
	if (checkHorizontalWall('r')) {
		santa.style.left = santa.offsetLeft + singleCellSize + 'px';
	}

	if (santa.offsetLeft > gridWidth) {
		displayResult();
	}
}

function handleDirectionalInput(e) {
	switch (e.key) {
		case 'ArrowUp':
			up();
			break;
		case 'ArrowDown':
			down();
			break;
		case 'ArrowLeft':
			left();
			break;
		case 'ArrowRight':
			right();
			break;
	}

	updateTimer();
}

function handleEnterKey() {
	checkGameStatus() ? restartGame() : startGame();
}

/*-------------------------------- Button Event Handlers --------------------------------*/
// Event handler for start button
function startGame() {
	runTimer();
}

// Event handler for restart button, to be updated
function restartGame() {
	window.location.reload();
}


/*-------------------------------- Page Populating Functions --------------------------------*/

window.onload = () => initializeOuterWalls(); // Initialize walls when page is done loading
initializeGrid();
createVerticalBoundaries();
generateRandomMaze(0, 0);
displayMaze();
displayEmojis();


/*----------------------------- Event Listeners -----------------------------*/
document.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		handleEnterKey();
	} else if (['ArrowUp', 'ArrowDown', ['ArrowLeft', 'ArrowDown'].includes(e.key)]) {
		handleDirectionalInput(e);
	}
});

restartBtn.addEventListener('click', restartGame);
playBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', restartGame);


// Get timer to work correctly

// Remove emojis after collision
// Add displayEmojis inside display maze
// Use animal foot prints to highlight correct path
// Update target emoji to rudolph icon
// Mission accomplish is showing on and off
// Reset maze when hitting play
// Add music
// Add sound effects for each emojis
// Update localStorage logic
// Add player name element 
// +5 seconds bubble effects when hitting bonus emojis
// 3 seconds counting down effect when hitting play
// Update placing logics for kid and key emojis
// Add speaker symbol and song playing on top right corner
// Update restart button to reset DOM instead of reload page
