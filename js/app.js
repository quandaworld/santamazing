/*-------------------------------- Constants --------------------------------*/
const singleWallSize = 20;
const mazeHeight = 300;
const mazeWidth = 300;
const totalGridRows = mazeHeight / singleWallSize; // 15
const totalGridCols = mazeWidth / singleWallSize; // 15
const gridArr = [];
const wallLeftCoords = [];
const wallRightCoords = [];
const wallTopCoords = [];
const wallBotCoords = [];

/*------------------------ Cached Element References ------------------------*/
const maze = document.getElementById('maze');
const santa = document.getElementById('santa');
const exit = document.getElementById('exit');
const walls = document.getElementsByClassName('wall');
const wallWidth = document.getElementById('top').clientHeight;

/*-------------------------------- Functions --------------------------------*/

// Populate grid's walls when the page is done loading
window.onload = () => {
	for (let i = 0; i < walls.length; i++) {
		wallLeftCoords.push(walls[i].offsetLeft);
		wallRightCoords.push(walls[i].offsetLeft + walls[i].clientWidth);
		wallTopCoords.push(walls[i].offsetTop);
		wallBotCoords.push(walls[i].offsetTop + walls[i].clientHeight);
	}
};

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
	const topHeight = Math.floor(Math.random() * totalGridRows) * singleWallSize;
	const botHeight = mazeHeight - singleWallSize - topHeight;
	const rightWall_x = mazeWidth + singleWallSize;

	const walls = [
		{ t: singleWallSize, l: singleWallSize, h: topHeight },
		{ t: topHeight + 2 * singleWallSize, l: singleWallSize, h: botHeight },
		{ t: singleWallSize, l: rightWall_x, h: botHeight },
		{ t: botHeight + 2 * singleWallSize, l: rightWall_x, h: topHeight }
	];

	// Store wall coordinates
	wallLeftCoords.push(0, rightWall_x, 0, 0, rightWall_x, rightWall_x);
	wallRightCoords.push(wallWidth, rightWall_x + wallWidth, singleWallSize, singleWallSize, rightWall_x, rightWall_x);
	wallTopCoords.push(topHeight + singleWallSize, botHeight + singleWallSize, topHeight + singleWallSize,
		topHeight + 2 * singleWallSize, botHeight + singleWallSize, botHeight + 2 * singleWallSize);
	wallBotCoords.push(...wallTopCoords.map(coord => coord + wallWidth));

	// Set Santa entry & exit position
	Object.assign(santa.style, { top: `${topHeight + singleWallSize}px`, left: '0px' });
	Object.assign(exit.style, { top: `${botHeight + singleWallSize}px`, left: `${rightWall_x}px` });

	// Create walls
	walls.forEach(({ t, l, h }) => {
		const wall = document.createElement('div');
		Object.assign(wall.style, { top: `${t}px`, left: `${l}px`, height: `${h}px`, width: `${wallWidth}px` });
		wall.classList.add('wall');
		maze.appendChild(wall);
	});
}

// Helper method for generateRandomMaze()
function shuffleArr(arr) {
	for (let i = arr.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}

	return arr;
}

// Populate a maze using Recursive Backtracking
function generateRandomMaze(currentX, currentY) {
	const dirs = shuffleArr(['u', 'd', 'l', 'r']); // up, down, left, right
	const dirsCoords = { // directions' coordinates x, y, opposite
		u: { x: 0, y: -1, o: 'd' },
		d: { x: 0, y: 1, o: 'u' },
		l: { x: -1, y: 0, o: 'r' },
		r: { x: 1, y: 0, o: 'l' }
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
	const top = (y + 1) * singleWallSize;
	const left = (x + 1) * singleWallSize;

	const walls = [];

	if (l === 0 && x > 0) {
		walls.push({
			top,
			left,
			width: wallWidth,
			height: singleWallSize,
		});
	}

	if (d === 0 && y < totalGridRows - 1) {
		walls.push({
			top: top + singleWallSize,
			left,
			width: singleWallSize + wallWidth,
			height: wallWidth,
		});
	}

	walls.forEach(({ top, left, width, height }) => {
		const el = document.createElement('div');
		Object.assign(el.style, { top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px` });
		el.classList.add('wall');
		maze.appendChild(el);
	});
}

// Display maze
function displayMaze() {
	for (let x = 0; x < totalGridCols; x++) {
		for (let y = 0; y < totalGridRows; y++) {
			const l = gridArr[y][x].l;
			const r = gridArr[y][x].r;
			const u = gridArr[y][x].u;
			const d = gridArr[y][x].d;

			createMazeWalls(x, y, u, d, l, r);
		}
	}
}

// check if Santa can move horizontally
function checkHorizontalWall(dir) {
	const x = santa.offsetLeft;
	const y = santa.offsetTop;
	const maxLen = Math.max(wallLeftCoords.length, wallRightCoords.length, wallTopCoords.length, wallBotCoords.length);
	const canMove = [];
	let check;

	for (let i = 0; i < maxLen; i++) {
		check = 0;

		if (y < wallTopCoords[i] || y > wallBotCoords[i] - singleWallSize) check = 1;

		if (dir === "r") {
			if (x < wallLeftCoords[i] - singleWallSize || x > wallRightCoords[i] - singleWallSize) check = 1;
		}

		if (dir === "l") {
			if (x < wallLeftCoords[i] || x > wallRightCoords[i]) check = 1;
		}

		canMove.push(check);
	}

	return canMove.every(check => check === 1);
}

// check if Santa can move vertically


function up() {
	if (checkYWall('u')) {
		santa.style.top = santa.offsetTop - singleWallSize + 'px';
	}
}

function down() {
	if (checkYWall('d')) {
		santa.style.top = santa.offsetTop + singleWallSize + 'px';
	}
}

function left() {
	if (checkHorizontalWall('l')) {
		santa.style.left = santa.offsetLeft - singleWallSize + 'px';
	}
}

function right() {
	if (checkHorizontalWall('r')) {
		santa.style.left = santa.offsetLeft + singleWallSize + 'px';
	}
}

function handleKeyboardInput(e) {
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
}

initializeGrid();
createVerticalBoundaries();
generateRandomMaze(0, 0);
displayMaze();

/*----------------------------- Event Listeners -----------------------------*/
document.addEventListener('keydown', handleKeyboardInput);
