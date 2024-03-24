var socket = io("/api/1v1Online");
var ingame = false;
var roomName = "";
var whichPlayer;
var activePlayer="1";
var myTurn;
let InGame="false";

window.addEventListener('beforeunload', function (event) {
    console.log("Je quitte la partie");
    InGame = localStorage.getItem("InGame");
    socket.emit("userLeft",InGame);
});

window.addEventListener('load', function() {
    InGame = localStorage.getItem("InGame");
    if(InGame === "true") {
        console.log("J'étais déjà dans une partie");
        roomName = localStorage.getItem("roomName");
        whichPlayer = JSON.parse(localStorage.getItem("whichPlayer"));
        document.getElementById("overlay").style.display = "none";
        document.getElementById("game").style.display = "grid";
        console.log(roomName);
        socket.emit('resumeGame', roomName);

    }else{
        socket.emit('firstConnection');
        socket.on("nbJoueur", (nbJoueur) => {
            console.log("un joueur a rejoint la partie", nbJoueur);
            if (nbJoueur === 2) {
                // Enlever l'overlay
                document.getElementById("overlay").style.display = "none";

                // Afficher le contenu du jeu
                document.getElementById("game").style.display = "grid";

            }
        });


        socket.on("whichPlayer", (whichPlayer) => {

            this.whichPlayer = whichPlayer;
            localStorage.setItem("whichPlayer", this.whichPlayer);
            console.log("whichPlayer", whichPlayer);
        });
        socket.on("roomName", (roomName) => {
            console.log("roomName", roomName)
            this.roomName = roomName;
            localStorage.setItem("roomName",this.roomName);
        });
        InGame= "true";
        localStorage.setItem("InGame", InGame);
        console.log("Nouvelle partie");
    }

});
socket.on("updateGrid", (gameStatus) => {
    document.getElementById("wallLeftP1").textContent= gameStatus.wallsLeftP1;
    document.getElementById("wallLeftP2").textContent= gameStatus.wallsLeftP2;
    console.log("GamesState reçu");
    if(gameStatus.activePlayer===32){
        activePlayer=1;
    }else {
        activePlayer=2;
    }
    if(activePlayer!==whichPlayer){
        myTurn=false;
        document.getElementById('whichTurn').textContent = "Tour Adverse";
    }else
    {
        myTurn=true;
        document.getElementById('whichTurn').textContent = "Votre tour";
    }

    createGrid(gameStatus.visionBoard, gameStatus.activePlayer, gameStatus.placedWalls, gameStatus.wallsNotToPlace, gameStatus.positionPlayer1, gameStatus.positionPlayer2);

});

socket.on("updateGridResume", (gameStatus) => {


    createGrid(gameStatus.visionBoard, gameStatus.activePlayer, gameStatus.placedWalls, gameStatus.wallsNotToPlace, gameStatus.positionPlayer1, gameStatus.positionPlayer2);

});


function createGrid(visionBoard, activePlayer, placedWalls, wallsNotToPlace, positionPlayer1, positionPlayer2) {
    const WALL_RIGHT =  0b10000000;
    const WALL_BOTTOM = 0b1000000000;
    const WALL_LEFT =   0b100000000000;
    const WALL_TOP =    0b10000000000000;
    const PLAYER2 =0b10000
    const PLAYER1 =0b100000
    const NEGMASK =0b1000
    const VISIONMASK = 0b111

    console.log("visionBoard",visionBoard);

    const svg = document.querySelector('svg');
    //clear the previous cells and walls but keep the placed walls
    svg.querySelectorAll(".cell").forEach(cell => cell.remove());
    svg.querySelectorAll(".wall").forEach(wall => wall.remove());
    svg.querySelectorAll(".player").forEach(player => player.remove());


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
            // Create a circle with an image for player 1
            if (visionBoard[j][i] & PLAYER1) {
                const circlePlayer1 = document.createElementNS("http://www.w3.org/2000/svg", "image");
                circlePlayer1.setAttribute("x", (x + 0.2).toString()); // ajuster x pour le centrage horizontal
                circlePlayer1.setAttribute("y", (y + 0.2).toString()); // ajuster y pour le centrage vertical
                circlePlayer1.setAttribute("width", "3.6");
                circlePlayer1.setAttribute("height", "3.6");
                circlePlayer1.setAttribute("href", "../../Images/kenedy.png");
                circlePlayer1.setAttribute("class", "player");
                circlePlayer1.addEventListener("click", () => handlePlayerClick(i, j));
                svg.appendChild(circlePlayer1);
            }

// Create a circle with an image for player 2
            if (visionBoard[j][i] & PLAYER2) {
                const circlePlayer2 = document.createElementNS("http://www.w3.org/2000/svg", "image");
                circlePlayer2.setAttribute("x", (x + 0.2).toString()); // ajuster x pour le centrage horizontal
                circlePlayer2.setAttribute("y", (y + 0.2).toString()); // ajuster y pour le centrage vertical
                circlePlayer2.setAttribute("width", "3.6");
                circlePlayer2.setAttribute("height", "3.6");
                circlePlayer2.setAttribute("href", "../../Images/staline.png");
                circlePlayer2.setAttribute("class", "player");
                circlePlayer2.addEventListener("click", () => handlePlayerClick(i, j));
                svg.appendChild(circlePlayer2);
            }
            if (visionBoard[j][i]& VISIONMASK){
                   if (whichPlayer === 1 && (visionBoard[j][i] & NEGMASK)) {
                       if(!casesACote(i,j,positionPlayer1,positionPlayer2, whichPlayer)) {
                           createGridPlayer1(x, y, i, j);
                       }
                   } else if (whichPlayer === 2 && ((visionBoard[j][i] ^ NEGMASK) & NEGMASK)) {
                       if(!casesACote(i,j,positionPlayer1,positionPlayer2, whichPlayer)) {
                            createGridPlayer2(x, y, i, j);
                       }
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



function createGridPlayer1(x,y, i, j) {
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
function createGridPlayer2(x,y, i, j) {
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



function handlePlayerClick(i, j) {
    console.log(myTurn)
    if (!myTurn) {
        // Ne rien faire si ce n'est pas votre tour
        return;
    }
    socket.emit("nextMove", "cell," + i + "," + j, roomName);
}

function handleWallClick(i1, j1, i2, j2) {
    if (!myTurn) {
        // Ne rien faire si ce n'est pas votre tour
        return;
    }

    if (i1 === i2) {
        // Vertical wall
        console.log("vertical", i1, j1);
        socket.emit("nextMove", "vertical," + i1 + "," + j1,roomName);
    } else {
        // Horizontal wall
        console.log("horizontal", i1, j1)
        socket.emit("nextMove", "horizontal," + i1 + "," + j1,roomName);
    }
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
function casesACote(i,j,positionPlayer1,positionPlayer2, whichPlayer){
    if(whichPlayer===1){
        if(positionPlayer1[0]===i && positionPlayer1[1]===j){
            return true;
        }
        if(positionPlayer1[0]===i+1 && positionPlayer1[1]===j){
            return true;
        }
        if(positionPlayer1[0]===i-1 && positionPlayer1[1]===j){
            return true;
        }
        if(positionPlayer1[0]===i && positionPlayer1[1]===j+1){
            return true;
        }
        if(positionPlayer1[0]===i && positionPlayer1[1]===j-1){
            return true;
        }
    }else{
        if(positionPlayer2[0]===i && positionPlayer2[1]===j){
            return true;
        }
        if(positionPlayer2[0]===i+1 && positionPlayer2[1]===j){
            return true;
        }
        if(positionPlayer2[0]===i-1 && positionPlayer2[1]===j){
            return true;
        }
        if(positionPlayer2[0]===i && positionPlayer2[1]===j+1){
            return true;
        }
        if(positionPlayer2[0]===i && positionPlayer2[1]===j-1){
            return true;
        }
    }
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

socket.on("invalidMove", (msg) => {
    console.log(msg);
});


socket.on("usaWin", (player) => {
    console.log("P1 va gagner"+player);
    //get by id whichTurn
    document.getElementById('Winning').textContent = "Dernier tour pour Staline";
});

socket.on("urssWin", () => {
    console.log("P2 a gagné");
    //get by id whichTurn
    document.getElementById('Winning').textContent = "Staline a gagné";
});

socket.on("draw", () => {
    console.log("Match nul");
    //pop up de draw
    document.getElementById("gameover-message").textContent = "Match nul";
    document.getElementById('gameover').style.display = "block";


});

function showGameplayExplanation() {
    document.getElementById('gameplayExplanation').style.display = "block";
}
function closeGameExplanation() {
    document.getElementById('gameplayExplanation').style.display = "none";
}

function formatTime(time) {
    let minutes = Math.floor((time % 3600) / 60);
    let seconds = time % 60;


    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    return `${minutes}:${seconds}`;
}

function updateTimer() {
    // Commencez avec 0 secondes
    let seconds = 0;

    const timerElement = document.getElementById('timer');

    setInterval(() => {
        seconds++;
        timerElement.textContent = formatTime(seconds);
    }, 1000);
}

updateTimer();

function goBackToMenu(){
    InGame= "false";
    localStorage.setItem("InGame", InGame);
    window.location.href = "../../index.html";
}

function surrender(){
    InGame= "false";
    localStorage.setItem("InGame", InGame);
    window.location.href = "../../index.html";
    socket.emit("surrender", roomName);
}

socket.on("quitRoom", () => {
    window.location.href = "../../index.html";
});

socket.on("leaveGame", () => {
    goBackToMenu();
});