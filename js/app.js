/*-------------------------------- Constants --------------------------------*/
const cellSize = 20;
const gridHeight = 300;
const gridWidth = 300;
const totalGridRows = gridHeight / cellSize; // 15
const totalGridCols = gridWidth / cellSize; // 15
const gridArr = [];
const wallCoords = { tops: [], bottoms: [], lefts: [], rights: [] }
const santaStartPos = { top: 0, left: 0 };
const exitPos = { top: 0, left: 0 };


/*---------------------------- Variables (state) ----------------------------*/
let totalTime = 60; // 30 seconds
let hasGameStarted = false;
let hasGameEnded = false;
let isSoundOn = true;


/*------------------------ Cached Element References ------------------------*/
const maze = document.getElementById('maze');
const santa = document.getElementById('santa');
const exit = document.getElementById('exit');
const walls = document.getElementsByClassName('wall');
const wallHeight = document.getElementById('top').clientHeight; // top and bottom walls height
const restartBtn = document.getElementById('restart');
const playBtn = document.getElementById('play');
const playAgainBtn = document.getElementById('play-again');
const soundDiv = document.getElementById('sound');
const speakerIcon = document.getElementById('speaker-icon');
const audios = {
	maze: new Audio('/assets/audios/maze.mp3'),
	santa: new Audio('/assets/audios/santa.mp3')
}


/*-------------------------------- Grid Manipulations --------------------------------*/
// Store grid walls' coordinations
function storeWallsCoords() {
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
	const topHeight = Math.floor(Math.random() * totalGridRows) * cellSize;
	const botHeight = gridHeight - cellSize - topHeight;
	const rightWall_x = gridWidth + cellSize;

	const boundaries = [
		{ t: cellSize, l: cellSize, h: topHeight },
		{ t: topHeight + 2 * cellSize, l: cellSize, h: botHeight },
		{ t: cellSize, l: rightWall_x, h: botHeight },
		{ t: botHeight + 2 * cellSize, l: rightWall_x, h: topHeight }
	];

	// Set Santa entry & exit positions in the maze
	Object.assign(santa.style, { top: `${topHeight + cellSize}px`, left: '0px' });
	Object.assign(exit.style, { top: `${botHeight + cellSize}px`, left: `${rightWall_x}px` });

	// Update Santa and exit position variables
	Object.assign(santaStartPos, { top: topHeight + cellSize, left: 0 });
	Object.assign(exitPos, { top: botHeight + cellSize, left: rightWall_x });

	// Create boundaries
	boundaries.forEach(({ t, l, h }) => {
		const wall = document.createElement('div');
		Object.assign(wall.style, { top: `${t}px`, left: `${l}px`, height: `${h}px`, width: `${wallHeight}px` });
		wall.classList.add('wall', 'extra');
		maze.appendChild(wall);
	});

	updateWallCoords(topHeight, botHeight, rightWall_x);
}

// Update grid walls' coordinations
function updateWallCoords(topHeight, botHeight, rightWall_x) {
	wallCoords.lefts.push(
		0,
		gridWidth + 2 * cellSize,
		0,
		0,
		rightWall_x,
		rightWall_x
	);

	wallCoords.rights.push(
		wallHeight,
		gridWidth + 2 * cellSize + wallHeight,
		cellSize,
		cellSize,
		gridWidth + 2 * cellSize,
		gridWidth + 2 * cellSize
	);

	wallCoords.tops.push(
		topHeight + cellSize,
		botHeight + cellSize,
		topHeight + cellSize,
		topHeight + 2 * cellSize,
		botHeight + cellSize,
		botHeight + 2 * cellSize
	);

	wallCoords.bottoms.push(
		topHeight + cellSize * 2,
		botHeight + cellSize * 2,
		topHeight + cellSize + wallHeight,
		topHeight + 2 * cellSize + wallHeight,
		botHeight + cellSize + wallHeight,
		botHeight + 2 * cellSize + wallHeight
	);
}

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
	const top = (y + 1) * cellSize;
	const left = (x + 1) * cellSize;

	const innerWalls = [];

	if (l === 0 && x > 0) {
		innerWalls.push({
			top,
			left,
			width: wallHeight,
			height: cellSize,
		});
	}

	if (d === 0 && y < totalGridRows - 1) {
		innerWalls.push({
			top: top + cellSize,
			left,
			width: cellSize + wallHeight,
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

	displayEmojis();
}

function displayEmojis() {
	const emojis = {
		cookie: '🍪',
		clock: '⏰',
		kid: '👧🏻',
		key: '🔑',
	};

	for (let emo in emojis) {
		const randomX = (Math.floor(Math.random() * totalGridCols) + 1) * cellSize;
		const randomY = (Math.floor(Math.random() * totalGridRows) + 1) * cellSize;
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
	const resultDiv = document.getElementById('result');

	document.getElementById('maze').style.filter = 'blur(5px)'; // Blurs entire grid & walls
	resultDiv.classList.add('show');
	playBtn.classList.add('hide');
	restartBtn.classList.add('hide');
	playAgainBtn.classList.add('show');

	if (checkGameStatus() === 'win') {
		santa.innerText = '';
		exit.innerText = '🎉';
		audios.santa.play();
		resultDiv.innerText = 'Mission Accomplished!';
	} else if (checkGameStatus() === 'lose') {
		resultDiv.innerText = "Time's Up!";
	}

	santa.innerText = '' // remove Santa when game ends
	hasGameEnded = true;
}

// Start and pause timer when game ends
function runTimer() {
	setTimeout(() => {
		const timer = setInterval(() => {
			hasGameStarted = true;
			document.getElementById('time').innerText = '00:' + String(totalTime).padStart(2, '0');
			totalTime--;

			if (totalTime < 10) document.getElementById('key').innerText = ''; // remove key if time < 10 secs

			if (checkGameStatus()) {
				clearInterval(timer);
				displayResult();
			}
		}, 1000);
	}, 3000);
}

// Display 3 seconds countdown and timer countdown
function runCountdown() {
	const countdownDiv = document.getElementById('countdown');
	let countdownTime = 3;

	const pregameCountDown = setInterval(() => {
		audios.maze.play();
		document.getElementById('maze').style.filter = 'blur(5px)'; // Blurs entire grid & walls
		countdownDiv.innerText = String(countdownTime);
		countdownTime--;

		if (countdownTime < 0) {
			clearInterval(pregameCountDown);
			document.getElementById('maze').style.removeProperty('filter');
			countdownDiv.innerText = '';
		}
	}, 1000);

	runTimer();
}

function isCollided(emo) {
	return santa.offsetLeft === emo.offsetLeft && santa.offsetTop === emo.offsetTop;
}

// Update timer when Santa hits different emojis
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
		kid: () => Object.assign(santa.style, { top: `${santaStartPos.top}px`, left: '0px' }),
		key: () => {
			totalTime -= 9;
			Object.assign(santa.style, { top: `${exitPos.top}px`, left: `${exitPos.left - cellSize}px` })
		},
	};

	for (let emo in emojis) {
		if (isCollided(emojis[emo])) {
			emojiEffects[emo]();
			emojis[emo].classList.add('hide'); // remove emo after colliding
		}
	}
}

// Update top scorers board with localStorage
function updateRecordBoard() {

}


/*-------------------------------- Audio Components --------------------------------*/
function muteSound() {
	speakerIcon.src = '/assets/images/speaker.png';
	speakerIcon.alt = 'Sound-on icon';
	audios.santa.volume = 0;
	audios.maze.volume = 0;
	isSoundOn = false;
}

function unmuteSound() {
	speakerIcon.src = '/assets/images/silent.png';
	speakerIcon.alt = 'Silent icon';
	audios.santa.volume = 1;
	audios.maze.volume = 1;
	isSoundOn = true;
}


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
			if (x < wallCoords.lefts[i] || x > wallCoords.rights[i] - cellSize) check = 1;
			if (dir === "u" && (y < wallCoords.tops[i] || y > wallCoords.bottoms[i])) check = 1;
			if (dir === "d" && (y < wallCoords.tops[i] - cellSize || y > wallCoords.bottoms[i] - cellSize)) check = 1;
		} else {
			if (y < wallCoords.tops[i] || y > wallCoords.bottoms[i] - cellSize) check = 1;
			if (dir === "l" && (x < wallCoords.lefts[i] || x > wallCoords.rights[i])) check = 1;
			if (dir === "r" && (x < wallCoords.lefts[i] - cellSize || x > wallCoords.rights[i] - cellSize)) check = 1;
		}

		wallChecks.push(check);
	}

	return wallChecks.every(check => check === 1);
}

function checkVerticalWall(dir) {
	return checkWall(dir, true);
}

function checkHorizontalWall(dir) {
	return checkWall(dir, false);
}

function checkGameStatus() {
	if (totalTime < 0 && santa.offsetLeft <= gridWidth) return "lose";
	if (totalTime >= 0 && santa.offsetLeft > gridWidth) return "win";
}


/*-------------------------------- Events Handlers --------------------------------*/
function up() {
	if (checkVerticalWall('u')) {
		santa.style.top = santa.offsetTop - cellSize + 'px';
	}
}

function down() {
	if (checkVerticalWall('d')) {
		santa.style.top = santa.offsetTop + cellSize + 'px';
	}
}

function left() {
	if (checkHorizontalWall('l')) {
		santa.style.left = santa.offsetLeft - cellSize + 'px';
	}
}

function right() {
	if (checkHorizontalWall('r')) {
		santa.style.left = santa.offsetLeft + cellSize + 'px';
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

function startGame() {
	runCountdown();
}

function restartGame() {
	window.location.reload();
}


/*----------------------------- Event Listeners -----------------------------*/
document.addEventListener('keydown', (e) => {
	if (e.key === 'Enter' && (!hasGameStarted || hasGameEnded)) {
		handleEnterKey();
	} else if (['ArrowUp', 'ArrowDown', ['ArrowLeft', 'ArrowDown'].includes(e.key)] && hasGameStarted) {
		handleDirectionalInput(e);
	}
});

soundDiv.addEventListener('click', () => {
	if (isSoundOn) {
		muteSound();
	} else {
		unmuteSound();
	}
});

restartBtn.addEventListener('click', restartGame);
playBtn.addEventListener('click', startGame, { once: true });
playAgainBtn.addEventListener('click', restartGame);


/*-------------------------------- Rendering Page --------------------------------*/
function render() {
	window.onload = () => storeWallsCoords();
	initializeGrid();
	createVerticalBoundaries();
	generateRandomMaze(0, 0);
	displayMaze();
}

render();