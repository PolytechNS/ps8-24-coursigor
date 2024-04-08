
//    WT WL WB WR P1 P2 cell vision
//    00 00 00 00 0  0  0000

// Wall state : Player wall here
//              0      0


var socket = io("/api/onlineGame");

socket.send("salut !");

const cookies = document.cookie.split(';');
let cookieString = "Cookies:\n";

cookies.forEach(cookie => {
    cookieString += cookie.trim() + '\n';
});

console.log(cookieString);

// socket.emit("newGame", cookieString);
socket.emit("loadGame", cookieString);

socket.on("message", (msg) => {
    console.log(msg);
});

socket.on("updateGrid", (gameStatus) => {
    console.log("updateGrid", gameStatus);
    closeOverlay();
    createGrid(gameStatus.visionBoard, gameStatus.activePlayer, gameStatus.placedWalls, gameStatus.wallsNotToPlace, gameStatus.positionPlayer1, gameStatus.positionPlayer2);
})

socket.on("invalidMove", (msg) => {
    console.log(msg);
});





const WALL_RIGHT =  0b10000000;
const WALL_BOTTOM = 0b1000000000;
const WALL_LEFT =   0b100000000000;
const WALL_TOP =    0b10000000000000;
const PLAYER2 =0b10000
const PLAYER1 =0b100000
const NEGMASK =0b1000
const VISIONMASK = 0b111


function createGrid(visionBoard, activePlayer, placedWalls, wallsNotToPlace, positionPlayer1, positionPlayer2) {
    const svg = document.querySelector('svg');
    //clear the previous cells and walls but keep the placed walls
    svg.querySelectorAll(".cell").forEach(cell => cell.remove());
    svg.querySelectorAll(".wall").forEach(wall => wall.remove());
    svg.querySelectorAll(".player").forEach(player => player.remove());
    var StartGame= document.getElementById("StartGame");
    StartGame.style.display = "none";

    // Create the cells
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const x = i * 5;
            const y = j * 5;

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", x.toString());
            rect.setAttribute("y", y.toString());
            rect.setAttribute("width", "4");
            rect.setAttribute("height", "4");
            rect.setAttribute("fill", "#B70000");
            rect.setAttribute("class", "cell");

            rect.setAttribute("data-i", i.toString());
            rect.setAttribute("data-j", j.toString());
            rect.addEventListener("click", () => handlePlayerClick(i, j));

            document.querySelector('svg').appendChild(rect);
            if (visionBoard[j][i] & PLAYER1) {
                const circlePlayer1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circlePlayer1.setAttribute("cx", (x + 2).toString());
                circlePlayer1.setAttribute("cy", (y + 2).toString());
                circlePlayer1.setAttribute("r", "1.8");
                circlePlayer1.setAttribute("fill", "#00FF00");
                circlePlayer1.setAttribute("class", "player");
                circlePlayer1.addEventListener("click", () => handlePlayerClick(i, j));
                svg.appendChild(circlePlayer1);
            }

            // Ajoutez un cercle pour le joueur 2
            if (visionBoard[j][i] & PLAYER2) {
                const circlePlayer2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circlePlayer2.setAttribute("cx", (x + 2).toString());
                circlePlayer2.setAttribute("cy", (y + 2).toString());
                circlePlayer2.setAttribute("r", "1.8");
                circlePlayer2.setAttribute("fill", "#0000FF");
                circlePlayer2.setAttribute("class", "player");
                circlePlayer2.addEventListener("click", () => handlePlayerClick(i, j));
                svg.appendChild(circlePlayer2);
            }
            if (visionBoard[j][i]& VISIONMASK){


                if (activePlayer==PLAYER1 && visionBoard[j][i] & NEGMASK && !nextToPlayer(activePlayer, i, j, positionPlayer1, positionPlayer2)){
                    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    rect.setAttribute("x", x.toString());
                    rect.setAttribute("y", y.toString());
                    rect.setAttribute("width", "4");
                    rect.setAttribute("height", "4");
                    rect.setAttribute("fill", "rgba(0,0,0,1)");
                    rect.setAttribute("data-i", i.toString());
                    rect.setAttribute("data-j", j.toString());
                    rect.addEventListener("click", () => handlePlayerClick(i, j));
                    document.querySelector('svg').appendChild(rect);
                } else if (activePlayer==PLAYER2 && ((visionBoard[j][i] ^ NEGMASK)&NEGMASK) && !nextToPlayer(activePlayer, i, j, positionPlayer1, positionPlayer2)){
                    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    rect.setAttribute("x", x.toString());
                    rect.setAttribute("y", y.toString());
                    rect.setAttribute("width", "4");
                    rect.setAttribute("height", "4");
                    rect.setAttribute("fill", "rgba(0,0,0,1)");
                    rect.setAttribute("data-i", i.toString());
                    rect.setAttribute("data-j", j.toString());
                    rect.addEventListener("click", () => handlePlayerClick(i, j));
                    document.querySelector('svg').appendChild(rect);
                }

            }
        }
    }


    //create the walls
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const x = i * 5;
            const y = j * 5;

            if (wallsNotToPlace.some(wall => wall[0] === "vertical" && wall[1] === i && wall[2] === j)) {
                //console.log("skipping vertical wall", i, j);
            } else {
                const verticalWall = createWall(x + 4, y, 1, 4, "verticalWall");
                verticalWall.setAttribute("data-i", i.toString());
                verticalWall.setAttribute("data-j", j.toString());

                if (placedWalls.some(wall => wall[0] === "vertical" && wall[1] === i && wall[2] === j && wall[3] === PLAYER1)) {
                    verticalWall.setAttribute("height", "9");
                    verticalWall.setAttribute("fill", "#00FF00");
                    verticalWall.setAttribute("class", "placedVerticalWall");
                } else if (placedWalls.some(wall => wall[0] === "vertical" && wall[1] === i && wall[2] === j && wall[3] === PLAYER2)) {
                    verticalWall.setAttribute("height", "9");
                    verticalWall.setAttribute("fill", "#0000FF");
                    verticalWall.setAttribute("class", "placedVerticalWall");

                }

                document.querySelector('svg').appendChild(verticalWall);

            }
            if (wallsNotToPlace.some(wall => wall[0] === "horizontal" && wall[1] === i && wall[2] === j)) {
                //console.log("skipping horizontal wall", i, j);
            } else {
                const horizontalWall = createWall(x, y + 4, 4, 1, "horizontalWall");
                horizontalWall.setAttribute("data-i", i.toString());
                horizontalWall.setAttribute("data-j", j.toString());

                if (placedWalls.some(wall => wall[0] === "horizontal" && wall[1] === i && wall[2] === j && wall[3] === PLAYER1)) {
                    horizontalWall.setAttribute("width", "9");
                    horizontalWall.setAttribute("fill", "#00FF00");
                    horizontalWall.setAttribute("class", "placedHorizontalWall");
                } else if (placedWalls.some(wall => wall[0] === "horizontal" && wall[1] === i && wall[2] === j && wall[3] === PLAYER2)) {
                    horizontalWall.setAttribute("width", "9");
                    horizontalWall.setAttribute("fill", "#0000FF");
                    horizontalWall.setAttribute("class", "placedHorizontalWall");

                }

                document.querySelector('svg').appendChild(horizontalWall);

            }
        }
    }

    const horizontalWalls = document.querySelectorAll(".horizontalWall");
    horizontalWalls.forEach(wall => {
        wall.setAttribute("data-width", wall.getAttribute("width"));
        wall.setAttribute("data-height", wall.getAttribute("height"));
        wall.addEventListener("mouseenter", horizontalWallHandleHover);
        wall.addEventListener("mouseleave", horizontalWallHandleHover);

        const i1 = parseInt(wall.getAttribute("data-i"));
        const j1 = parseInt(wall.getAttribute("data-j"));
        const i2 = 1 + parseInt(wall.getAttribute("data-i"));
        const j2 = parseInt(wall.getAttribute("data-j"));
        wall.addEventListener("click", () => handleWallClick(i1, j1, i2, j2));
    });

    const verticalWalls = document.querySelectorAll(".verticalWall");
    verticalWalls.forEach(wall => {
        wall.setAttribute("data-width", wall.getAttribute("width"));
        wall.setAttribute("data-height", wall.getAttribute("height"));
        wall.addEventListener("mouseenter", verticalWallHandleHover);
        wall.addEventListener("mouseleave", verticalWallHandleHover);

        const i1 = parseInt(wall.getAttribute("data-i"));
        const j1 = parseInt(wall.getAttribute("data-j"));
        const i2 = parseInt(wall.getAttribute("data-i"));
        const j2 = 1 + parseInt(wall.getAttribute("data-j"));
        wall.addEventListener("click", () => handleWallClick(i1, j1, i2, j2));
    });
    // document.getElementById('overlay').classList.add('active');

}

function nextToPlayer(activePlayer, i, j, positionPlayer1, positionPlayer2) {
    if (activePlayer === PLAYER1) {
        return (i===positionPlayer1[0] && j===positionPlayer1[1]) || (i === positionPlayer1[0] + 1 && j === positionPlayer1[1]) || (i === positionPlayer1[0] - 1 && j === positionPlayer1[1]) || (i === positionPlayer1[0] && j === positionPlayer1[1] + 1) || (i === positionPlayer1[0] && j === positionPlayer1[1] - 1);
    }else if (activePlayer === PLAYER2) {
        return (i===positionPlayer2[0] && j===positionPlayer2[1]) || (i === positionPlayer2[0] + 1 && j === positionPlayer2[1]) || (i === positionPlayer2[0] - 1 && j === positionPlayer2[1]) || (i === positionPlayer2[0] && j === positionPlayer2[1] + 1) || (i === positionPlayer2[0] && j === positionPlayer2[1] - 1);
    }
}
function closeOverlay() {
    // Masquer l'overlay
    document.getElementById('overlay').classList.remove('active');
}
function displayOverlay() {
    // Afficher l'overlay
    document.getElementById('overlay').classList.add('active');
}

function createWall(x, y, width, height, className) {
    const wall = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    wall.setAttribute("x", x.toString());
    wall.setAttribute("y", y.toString());
    wall.setAttribute("width", width.toString());
    wall.setAttribute("height", height.toString());
    wall.setAttribute("fill", "rgba(8,59,45,0)");
    wall.setAttribute("class", "wall " + className);

    return wall;
}

function horizontalWallHandleHover(event) {
    const wall = event.target;
    const isHover = event.type === "mouseenter";

    // Adjust the size on hover
    wall.setAttribute("width", isHover ? 9 : wall.getAttribute("data-width"));
    wall.setAttribute("height", isHover ? wall.getAttribute("data-height") : wall.getAttribute("data-height"));
    wall.setAttribute("fill", isHover ? "#ff0000" : "rgba(255,255,255,0)");

    // Bring the wall to the front on hover
    if (isHover) {
        wall.parentElement.appendChild(wall);
    }
}

function verticalWallHandleHover(event) {
    const wall = event.target;
    const isHover = event.type === "mouseenter";

    // Adjust the size on hover
    wall.setAttribute("width", isHover ? wall.getAttribute("data-width") : wall.getAttribute("data-width"));
    wall.setAttribute("height", isHover ? 9 : wall.getAttribute("data-height"));
    wall.setAttribute("fill", isHover ? "#ff0000" : "rgba(255,255,255,0)");

    // Bring the wall to the front on hover
    if (isHover) {
        wall.parentElement.appendChild(wall);
    }
}


function handleWallClick(i1, j1, i2, j2) {

    if (i1 === i2) {
        // Vertical wall
        console.log("vertical", i1, j1);
        socket.emit("nextMove", "vertical," + i1 + "," + j1);
    } else {
        // Horizontal wall
        console.log("horizontal", i1, j1)
        socket.emit("nextMove", "horizontal," + i1 + "," + j1);
    }
}

function handlePlayerClick(i, j) {
    socket.emit("nextMove", "cell," + i + "," + j);
}


function showGameplayExplanation() {
    document.getElementById('gameplayExplanation').style.display = "block";
}
function closeGameExplanation() {
    document.getElementById('gameplayExplanation').style.display = "none";
}

