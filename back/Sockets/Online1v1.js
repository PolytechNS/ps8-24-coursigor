const rooms = [];


const WALL_RIGHT =  0b10000000;
const WALL_BOTTOM = 0b1000000000;
const WALL_LEFT =   0b100000000000;
const WALL_TOP =    0b10000000000000;
const PLAYER2 =0b10000
const PLAYER1 =0b100000
const NEGMASK =0b1000
const VISIONMASK = 0b111

// dictionary of games



// initial game state
let wallsNotToPlace = [];
let placedWalls = [];   //type of wall, wall coordinates and player owning the wall

let visionBoard= [  [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
    [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
    [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
    [0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001, 0b1001,0b1001],
    [0b0, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0],
    [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1],
    [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1],
    [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1],
    [0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1, 0b1]];

let positionPlayer1 = [4, 8];
let positionPlayer2 = [4, 0];

visionBoard[positionPlayer1[1]][positionPlayer1[0]] += PLAYER1;
visionBoard[positionPlayer2[1]][positionPlayer2[0]] += PLAYER2;
updatePlayerVision(positionPlayer1[1], positionPlayer1[0], 1, visionBoard);
updatePlayerVision(positionPlayer2[1], positionPlayer2[0], -1, visionBoard);

let numberOfTurns = 0;


class GameState {
    constructor(wallsNotToPlace, placedWalls, visionBoard, positionPlayer1, positionPlayer2, activePlayer, wallsLeftP1, wallsLeftP2, numberOfTurns) {
        // Utilisation de l'opérateur spread pour créer des clones des propriétés passées
        this.wallsNotToPlace = [...wallsNotToPlace];
        this.placedWalls = [...placedWalls];
        this.visionBoard = [...visionBoard.map(row => [...row])]; // Clonage de la matrice 2D
        this.positionPlayer1 = [...positionPlayer1];
        this.positionPlayer2 = [...positionPlayer2];
        this.activePlayer = activePlayer;
        this.wallsLeftP1 = wallsLeftP1;
        this.wallsLeftP2 = wallsLeftP2;
        this.numberOfTurns = numberOfTurns;
    }
}

let games = {};
function handleStartGame(nsp, socket) {
    //console.log("handleStartGame\n");
    let playerInQueue = rooms.find((room) => room.players.length === 1);
    //console.log("que vaut playerInQueue :", playerInQueue);

    if(playerInQueue){
        //un joueur est déjà en attente
        //il faut l'associer à cette room
        //ajoût du joueur dans l'objet room
        //ajout du joueur dans la room
        console.log("playerInQueue.roomName", playerInQueue.roomName);
        socket.join(playerInQueue.roomName);


        //console.log("you are not alone in the room");
        nsp.to(playerInQueue.roomName).emit("nbJoueur", 2);
        nsp.to(socket.id).emit("whichPlayer", 2);
        nsp.to(roomName).emit("roomName", roomName);
        games[roomName]= new GameState(wallsNotToPlace, placedWalls, visionBoard, positionPlayer1, positionPlayer2, PLAYER1, 10, 10, numberOfTurns);
        nsp.to(roomName).emit('updateGrid', games[roomName]);
        //add the player to the room
        playerInQueue.players.push(socket.id);
        console.log("vision board de ref : ", visionBoard);
        console.log(games[roomName].visionBoard);


    }else{
        //aucun joueur en attente
        //il faut créer une room
        //création d'une room avec socket.id
        roomName=generateRoomName();
        console.log("roomName", roomName);
        //socket.join(roomName);
        socket.join(roomName);


        //création de l'objet room
        const room = {
            players: [socket.id],
            roomName: roomName
        }
        //ajout de l'objet room dans le tableau rooms
        rooms.push(room);
        console.log("you are alone in the room");
        nsp.to(roomName).emit("nbJoueur", 1);
        nsp.to(socket.id).emit("whichPlayer", 1);
    }
}
exports.handleStartGame = handleStartGame;


function generateRoomName() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let roomName = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        roomName += characters.charAt(randomIndex);
    }

    return roomName;
}

function nextMove(nsp,roomName, move) {
    console.log("\nthis move is made in the room: "+ roomName+"\n");
    console.log("activePlayer: " + games[roomName].activePlayer);
    // move contains the type of move as a string and a pair of coordinates
    console.log('nextMove: ' + move);
    // move is ["type, i, j"]
    let moves = move.split(",");
    moves[1] = parseInt(moves[1]);
    moves[2] = parseInt(moves[2]);


    if (moves[0] === "cell") {
        validMove(roomName, moves[1], moves[2],nsp);

    }
        else if (moves[0] === "horizontal") {

            console.log('horizontal', moves[1], moves[2]);
            let gameState = games[roomName];
            let i1 = moves[1];
            let j1 = moves[2];
            let i2 = i1 + 1;
            let j2 = j1;
            if(gameState.activePlayer===PLAYER1 && gameState.wallsLeftP1===0 || gameState.activePlayer===PLAYER2 && gameState.wallsLeftP2===0) {
                sendInvalidMove(roomName, "No more walls left", nsp);
                return;
            }
            gameState.visionBoard[j1][i1] += WALL_BOTTOM;
            gameState.visionBoard[j2][i2] += WALL_BOTTOM;

            gameState.visionBoard[j1 + 1][i1] += WALL_TOP;
            gameState.visionBoard[j2 + 1][i2] += WALL_TOP;

            gameState.placedWalls.push(["horizontal", i1, j1, gameState.activePlayer]);
            gameState.wallsNotToPlace.push(["horizontal", i2, j2]);   //the wall to the right
            gameState.wallsNotToPlace.push(["horizontal", i1 - 1, j1]);   //the wall to the left
            gameState.wallsNotToPlace.push(["vertical", i1, j1]);     //the perpendicular wall to the top

            let ncP1 = notCirclesPlayers([], gameState.positionPlayer1[0], gameState.positionPlayer1[1], PLAYER1);
            let ncP2 = notCirclesPlayers([], gameState.positionPlayer2[0], gameState.positionPlayer2[1], PLAYER2);


            if (!ncP1 || !ncP2) {
                //console.log("The player can't reach the end anymore. The move is invalid");

                gameState.visionBoard[j1][i1] -= WALL_BOTTOM;
                gameState.visionBoard[j2][i2] -= WALL_BOTTOM;

                gameState.visionBoard[j1 + 1][i1] -= WALL_TOP;
                gameState.visionBoard[j2 + 1][i2] -= WALL_TOP;

                // remove the coordinates from the wallsNotToPlace array
                removeMatchingWall(gameState.placedWalls, "horizontal", i1, j1);
                removeMatchingWall(gameState.wallsNotToPlace, "horizontal", i2, j2);
                removeMatchingWall(gameState.wallsNotToPlace, "horizontal", i1 - 1, j1);
                removeMatchingWall(gameState.wallsNotToPlace, "vertical", i1, j1);

                sendInvalidMove(roomName, "The player can't reach the end anymore. The move is invalid", nsp);
                return;
            }

            if (gameState.activePlayer === PLAYER1) {
                updateVisionWall(i1, j1, i2, j2, 1, gameState.visionBoard);

                gameState.wallsLeftP1--;
                gameState.numberOfTurns++;

            } else {
                updateVisionWall(i1, j1, i2, j2, -1,gameState.visionBoard);

                gameState.wallsLeftP2--;
                gameState.numberOfTurns++;
            }

            sendGameState(roomName,nsp);

    }
    else if (moves[0] === "vertical") {
        //console.log('vertical', moves[1], moves[2]);
        let gameState = games[roomName];
        let i1 = moves[1];
        let j1 = moves[2];
        let i2 = i1;
        let j2 = j1 + 1;
        if(gameState.activePlayer===PLAYER1 && gameState.wallsLeftP1===0 || gameState.activePlayer===PLAYER2 && gameState.wallsLeftP2===0) {
            sendInvalidMove(roomName, "No more walls left", nsp);
            return;
        }
        gameState.visionBoard[j1][i1] += WALL_RIGHT;
        gameState.visionBoard[j2][i2] += WALL_RIGHT;

        gameState.visionBoard[j1][i1 + 1] += WALL_LEFT;
        gameState.visionBoard[j2][i2 + 1] += WALL_LEFT;

        gameState.placedWalls.push(["vertical", i1, j1, gameState.activePlayer]);
        gameState.wallsNotToPlace.push(["vertical", i2, j2]);     //the wall to the bottom
        gameState.wallsNotToPlace.push(["vertical", i1, j1 - 1]);   //the wall to the top
        gameState.wallsNotToPlace.push(["horizontal", i1, j1]);   //the perpendicular wall to the left


        let ncP1 = notCirclesPlayers([], gameState.positionPlayer1[0], gameState.positionPlayer1[1], PLAYER1);
        let ncP2 = notCirclesPlayers([], gameState.positionPlayer2[0], gameState.positionPlayer2[1], PLAYER2);


        if (!ncP1 || !ncP2) {
            //console.log("The player can't reach the end anymore. The move is invalid");
            // Vertical wall
            gameState.visionBoard[j1][i1] -= WALL_RIGHT;
            gameState.visionBoard[j2][i2] -= WALL_RIGHT;

            gameState.visionBoard[j1][i1 + 1] -= WALL_LEFT;
            gameState.visionBoard[j2][i2 + 1] -= WALL_LEFT;

            //remove the coordinates from the wallsNotToPlace array
            removeMatchingWall(gameState.placedWalls, "vertical", i1, j1);
            removeMatchingWall(gameState.wallsNotToPlace, "vertical", i2, j2);
            removeMatchingWall(gameState.wallsNotToPlace, "vertical", i1, j1 - 1);
            removeMatchingWall(gameState.wallsNotToPlace, "horizontal", i1, j1);

            sendInvalidMove(roomName, "The player can't reach the end anymore. The move is invalid", nsp);
            return;
        }

        if (gameState.activePlayer === PLAYER1) {
            updateVisionWall(i1, j1,i2,j2, 1, gameState.visionBoard);
            gameState.wallsLeftP1--;
            gameState.numberOfTurns++;

        } else {
            updateVisionWall(i1, j1,i2,j2, -1, gameState.visionBoard);
            gameState.wallsLeftP2--;
            gameState.numberOfTurns++;
        }

        sendGameState(roomName,nsp);
    }
    else {
        sendInvalidMove(roomName, "Type of move not recognized", nsp);
    }
}
exports.nextMove = nextMove;


function validMove(id, i, j, nsp) {
    //console.log("test if valid move\n");
    //console.log('activePlayer: ' + games[id].activePlayer);
    let gameState = games[id];
    console.log("on récupère le gameState de la room: " + id);

    if(gameState.activePlayer === 32) {
        //console.log("player 1");
        //prevent the player to move on an illegal cell or on a cell separated with a wall
        //console.log(positionPlayer2[0] !== i || positionPlayer2[1] !== j);
        if (gameState.positionPlayer2[0] !== i || gameState.positionPlayer2[1] !== j) {

            if (gameState.positionPlayer1[0] === i - 1 && gameState.positionPlayer1[1] === j || gameState.positionPlayer1[0] === i + 1 && gameState.positionPlayer1[1] === j || gameState.positionPlayer1[0] === i && gameState.positionPlayer1[1] === j - 1 || gameState.positionPlayer1[0] === i && gameState.positionPlayer1[1] === j + 1) {

                if (checkPresenceWall(i, j, gameState.activePlayer, gameState.visionBoard, gameState.positionPlayer1, gameState.positionPlayer2)) {

                    gameState.visionBoard[gameState.positionPlayer1[1]][gameState.positionPlayer1[0]] -= PLAYER1;

                    updatePlayerVision(gameState.positionPlayer1[1], gameState.positionPlayer1[0], -1, gameState.visionBoard);
                    gameState.positionPlayer1[0] = i;
                    gameState.positionPlayer1[1] = j;
                    updatePiecePosition(PLAYER1, gameState.positionPlayer1[0], gameState.positionPlayer1[1], gameState.visionBoard);
                    updatePlayerVision(gameState.positionPlayer1[1], gameState.positionPlayer1[0], 1, gameState.visionBoard);

                    gameState.activePlayer = PLAYER2;
                    games[id].activePlayer = games[id].activePlayer === PLAYER1 ? PLAYER2 : PLAYER1;
                    sendGameState(id,nsp);
                }
            }
        }
        //partie pour bouger ton pion au dessus du pion de l'adversaire
        else {
            let iP2MinusP1= gameState.positionPlayer2[0] - gameState.positionPlayer1[0];
            let jP2MinusP1= gameState.positionPlayer2[1] - gameState.positionPlayer1[1];
            if(iP2MinusP1===0){
                if(gameState.positionPlayer2[1] + jP2MinusP1 === j){
                    if(checkPresenceWall(i, j,gameState.activePlayer, gameState.visionBoard, gameState.positionPlayer1, gameState.positionPlayer2))
                    {
                        gameState.visionBoard[gameState.positionPlayer1[1]][gameState.positionPlayer1[0]] -= PLAYER1;
                        updatePlayerVision(gameState.positionPlayer1[1], gameState.positionPlayer1[0], -1, gameState.visionBoard);
                        gameState.positionPlayer1[0] = i;
                        gameState.positionPlayer1[1] = j;
                        updatePiecePosition(PLAYER1, gameState.positionPlayer1[0], gameState.positionPlayer1[1], gameState.visionBoard);
                        updatePlayerVision(gameState.positionPlayer1[1], gameState.positionPlayer1[0], 1, gameState.visionBoard);
                        gameState.activePlayer = PLAYER2;
                        games[id].activePlayer = games[id].activePlayer === PLAYER1 ? PLAYER2 : PLAYER1;
                        sendGameState(id,nsp);
                    }
                }
            }
            else if(jP2MinusP1===0){
                if(gameState.positionPlayer2[0] + iP2MinusP1 === i){
                    if(checkPresenceWall(i, j, gameState.activePlayer, gameState.visionBoard, gameState.positionPlayer1, gameState.positionPlayer2))
                    {
                        gameState.visionBoard[gameState.positionPlayer1[1]][gameState.positionPlayer1[0]] -= PLAYER1;
                        updatePlayerVision(gameState.positionPlayer1[1], gameState.positionPlayer1[0], -1, gameState.visionBoard);
                        gameState.positionPlayer1[0] = i;
                        gameState.positionPlayer1[1] = j;
                        updatePiecePosition(PLAYER1, gameState.positionPlayer1[0], gameState.positionPlayer1[1], gameState.visionBoard);
                        updatePlayerVision(gameState.positionPlayer1[1], gameState.positionPlayer1[0], 1, gameState.visionBoard);

                        gameState.activePlayer = PLAYER2;
                        games[id].activePlayer = games[id].activePlayer === PLAYER1 ? PLAYER2 : PLAYER1;
                        sendGameState(id,nsp);
                    }
                }
            }
        }
    }
    else if(gameState.activePlayer === 16 ) {
        if (gameState.positionPlayer1[0] !== i || gameState.positionPlayer1[1] !== j) {
            if (gameState.positionPlayer2[0] === i - 1 && gameState.positionPlayer2[1] === j || gameState.positionPlayer2[0] === i + 1 && gameState.positionPlayer2[1] === j || gameState.positionPlayer2[0] === i && gameState.positionPlayer2[1] === j - 1 || gameState.positionPlayer2[0] === i && gameState.positionPlayer2[1] === j + 1) {

                if (checkPresenceWall(i, j, gameState.activePlayer, gameState.visionBoard, gameState.positionPlayer1, gameState.positionPlayer2)) {
                    gameState.visionBoard[gameState.positionPlayer2[1]][gameState.positionPlayer2[0]] -= PLAYER2;
                    updatePlayerVision(gameState.positionPlayer2[1], gameState.positionPlayer2[0], 1, gameState.visionBoard);
                    gameState.positionPlayer2[0] = i;
                    gameState.positionPlayer2[1] = j;
                    updatePiecePosition(PLAYER2, gameState.positionPlayer2[0], gameState.positionPlayer2[1], gameState.visionBoard);
                    updatePlayerVision(gameState.positionPlayer2[1], gameState.positionPlayer2[0], -1, gameState.visionBoard);

                    gameState.activePlayer = PLAYER1;
                    games[id].activePlayer = games[id].activePlayer === PLAYER1 ? PLAYER2 : PLAYER1;
                    sendGameState(id,nsp);
                }
            }
        }
        else {
            let iP1MinusP2=gameState.positionPlayer1[0]-gameState.positionPlayer2[0];
            let jP1MinusP2=gameState.positionPlayer1[1]-gameState.positionPlayer2[1];
            if(iP1MinusP2===0){
                if(gameState.positionPlayer1[1]+jP1MinusP2===j){
                    if(checkPresenceWall(i, j, gameState.activePlayer, gameState.visionBoard, gameState.positionPlayer1, gameState.positionPlayer2))
                    {
                        gameState.visionBoard[gameState.positionPlayer2[1]][gameState.positionPlayer2[0]] -= PLAYER2;
                        updatePlayerVision(gameState.positionPlayer2[1], gameState.positionPlayer2[0], 1, gameState.visionBoard);
                        gameState.positionPlayer2[0] = i;
                        gameState.positionPlayer2[1] = j;
                        updatePiecePosition(PLAYER2, gameState.positionPlayer2[0], gameState.positionPlayer2[1], gameState.visionBoard);
                        updatePlayerVision(gameState.positionPlayer2[1], gameState.positionPlayer2[0], -1, gameState.visionBoard);

                        gameState.activePlayer = PLAYER1;
                        games[id].activePlayer = games[id].activePlayer === PLAYER1 ? PLAYER2 : PLAYER1;
                        sendGameState(id,nsp);
                    }
                }
            }
            else if(jP1MinusP2===0){
                if(gameState.positionPlayer1[0]+iP1MinusP2===i){
                    if(checkPresenceWall(i, j, gameState.activePlayer, gameState.visionBoard, gameState.positionPlayer1, gameState.positionPlayer2))
                    {
                        gameState.visionBoard[gameState.positionPlayer2[1]][gameState.positionPlayer2[0]] -= PLAYER2;
                        updatePlayerVision(gameState.positionPlayer2[1], gameState.positionPlayer2[0], 1, gameState.visionBoard);
                        gameState.positionPlayer2[0] = i;
                        gameState.positionPlayer2[1] = j;
                        updatePiecePosition(PLAYER2, gameState.positionPlayer2[0], gameState.positionPlayer2[1], gameState.visionBoard);
                        updatePlayerVision(gameState.positionPlayer2[1], gameState.positionPlayer2[0], -1, gameState.visionBoard);

                        gameState.activePlayer = PLAYER1;
                        games[id].activePlayer = games[id].activePlayer === PLAYER1 ? PLAYER2 : PLAYER1;
                        sendGameState(id,nsp);
                    }
                }
            }
        }
    }
}


function notCirclesPlayers(alreadyChecked, i, j, player) {
    // check if the cell has already been checked
    if (alreadyChecked.some(cell => cell[0] === i && cell[1] === j)) {
        return false;
    }

    //if the cell is out of the board
    if (i < 0 || i > 8 || j < 0 || j > 8) {
        return false;
    }

    // store the cell as checked
    alreadyChecked.push([i, j]);

    if ((player == PLAYER1) && j == 0) {
        return true;
    }
    if ((player == PLAYER2) && j == 8) {
        return true;
    }

    let top = false;
    let bottom = false;
    let left = false;
    let right = false;

    if (!(visionBoard[j][i] & WALL_TOP)) {
        top = notCirclesPlayers(alreadyChecked, i, j - 1, player);
    }
    if (!(visionBoard[j][i] & WALL_BOTTOM)) {
        bottom = notCirclesPlayers(alreadyChecked, i, j + 1, player);
    }
    if (!(visionBoard[j][i] & WALL_LEFT)) {
        left = notCirclesPlayers(alreadyChecked, i - 1, j, player);
    }
    if (!(visionBoard[j][i] & WALL_RIGHT)) {
        right = notCirclesPlayers(alreadyChecked, i + 1, j, player);
    }

    return top || bottom || left || right;
}



function sendEndOfGameP1(id, player, nsp) {
    console.log("P1win nsp.to");
    console.log(id);
    nsp.to(id).emit("P1win", player);
}

function sendEndOfGameP2(id, player, nsp) {
    nsp.to(id).emit("P2win", player);
}

function sendEndOfGameDraw(id, player, nsp) {
    nsp.to(id).emit("Draw", player);
}

function sendInvalidMove(id, message, nsp) {
    nsp.to(id).emit('invalidMove', message);

}





function isMatchingWall(wall, type, i, j) {
    return wall[0] === type && wall[1] === i && wall[2] === j;
}

function removeMatchingWall(arr, type, i, j) {
    const indexToRemove = arr.findIndex(wall => isMatchingWall(wall, type, i, j));
    if (indexToRemove !== -1) {
        arr.splice(indexToRemove, 1);
    }
}

function updateVisionWall(i1, j1,i2,j2, value, visionBoard) {
    if (i1 === i2) {
        // Vertical wall

        calculateVision(visionBoard, j1, i1, value*2);
        calculateVision(visionBoard, j2, i2, value*2);
        calculateVision(visionBoard, j1 , i1 + 1, value*2);
        calculateVision(visionBoard, j2 , i2 + 1, value*2);
        calculateVision(visionBoard, j1 - 1 , i1, value);
        calculateVision(visionBoard,j2 + 1, i2 , value);
        calculateVision(visionBoard,j1 - 1 , i1+1, value);
        calculateVision(visionBoard, j2 + 1, i2+1, value);
        calculateVision(visionBoard, j1, i1+2, value);
        calculateVision(visionBoard, j2, i2+2, value);
        calculateVision(visionBoard, j1, i1-1, value);
        calculateVision(visionBoard, j2, i2-1, value);
    }
    else {
        //horizontal wall
        calculateVision(visionBoard, j1, i1, value*2);
        calculateVision(visionBoard, j2, i2, value*2);
        calculateVision(visionBoard, j1 + 1, i1, value*2);
        calculateVision(visionBoard, j2 + 1, i2, value*2);
        calculateVision(visionBoard, j1, i1 - 1, value);
        calculateVision(visionBoard, j2, i2 + 1, value);
        calculateVision(visionBoard, j1 + 1, i1 - 1, value);
        calculateVision(visionBoard, j2 + 1, i2 + 1, value);
        calculateVision(visionBoard, j1 + 2, i1, value);
        calculateVision(visionBoard, j2 + 2, i2, value);
        calculateVision(visionBoard, j1 - 1, i1, value);
        calculateVision(visionBoard, j2 - 1, i2, value);
    }
}
function calculateVision(board,i,j,value){
    if (i<0 || i>8 || j<0 || j>8)
        return;
    if ((board[i][j] & VISIONMASK)===0b111)
        return;
    else if (!(board[i][j] & VISIONMASK)){
        if (board[i][j] & NEGMASK)
            board[i][j] -=NEGMASK;
        if (value < 0){
            board[i][j] += 1;
            board[i][j] += NEGMASK;
        }
        else{
            board[i][j] += 1;
        }
    }
    else if (board[i][j] & NEGMASK){
        if (value > 0)
            board[i][j] -= 1;
        else
            board[i][j] += 1;
    }
    else{
        if (value>0)
            board[i][j] += 1;
        else
            board[i][j] -= 1;
    }
    if (value > 1) {
        calculateVision(board, i, j, value-1);
    }
    else if(value < -1){
        calculateVision(board, i, j, value+1);
    }
}


function sendGameState(roomName,nsp) {
    //change active player in gameState
    // make gameState into a json to send it to the client
    //socket of id sends the gameState to the client
    //switch active player
    //console.log("activePlayer before: " + games[roomName].activePlayer);
    games[roomName].activePlayer = games[roomName].activePlayer === PLAYER1 ? PLAYER2 : PLAYER1;
    //console.log("activePlayer now: " + games[roomName].activePlayer);


    nsp.to(roomName).emit('updateGrid', games[roomName]);
    checkVictoryCondition(roomName, games[roomName].positionPlayer1, games[roomName].positionPlayer2, nsp);
}


function checkPresenceWall(i,j, player, visionBoard, positionPlayer1, positionPlayer2){
    let iSub;
    let jSub;
    let posOpponent;
    if(player === PLAYER1) {
        iSub = i - positionPlayer1[0];
        jSub = j - positionPlayer1[1];
        posOpponent=visionBoard[positionPlayer2[1]][positionPlayer2[0]];
    }
    else if(player === PLAYER2) {
        iSub = i - positionPlayer2[0];
        jSub = j - positionPlayer2[1];
        posOpponent=visionBoard[positionPlayer1[1]][positionPlayer1[0]];
    }
    if(jSub===0){

        switch (iSub) {
            case -1:
                if(visionBoard[j][i] & WALL_RIGHT){
                    return false;
                }
                break;
            case -2:
                if(visionBoard[j][i] & WALL_RIGHT || posOpponent & WALL_RIGHT){
                    return false;
                }
                break;
            case 1:
                if(visionBoard[j][i] & WALL_LEFT){
                    return false;
                }
                break;
            case 2:
                if(visionBoard[j][i] & WALL_LEFT || posOpponent & WALL_LEFT){
                    return false;
                }
            default:
        }
        return true;

    }
    if(iSub===0){
        switch (jSub) {
            case -1:
                if(visionBoard[j][i] & WALL_BOTTOM){
                    return false;
                }
                break;
            case -2:
                if((visionBoard[j][i] & WALL_BOTTOM) || (posOpponent & WALL_BOTTOM)){
                    return false;
                }
                break;
            case 1:
                if(visionBoard[j][i] & WALL_TOP){
                    return false;
                }
                break;
            case 2:
                if(visionBoard[j][i] & WALL_TOP || posOpponent & WALL_TOP){
                    return false;
                }
                break;
            default:
        }
        return true;

    }


}
function updatePiecePosition(player, i, j, visionBoard) {
    if (player === PLAYER1) {
        visionBoard[j][i] += PLAYER1;
    }
    else if (player === PLAYER2) {
        visionBoard[j][i] += PLAYER2;
    }
}
function checkVictoryCondition(id, positionPlayer1, positionPlayer2, nsp) {
    if(positionPlayer1[1]===0){
        console.log("player 1 wins");
        sendEndOfGameP1(id, PLAYER1, nsp);
        return;
    }
    if(positionPlayer2[1]===8 && positionPlayer1[1]!==0){
        console.log("player 2 wins");
        sendEndOfGameP2(id, PLAYER2, nsp);
        return;
    }
    if(positionPlayer2[1]===8 && positionPlayer1[1]===0){
        console.log("Draw");
        sendEndOfGameDraw(id, PLAYER2, nsp);
        return;
    }
}


function updatePlayerVision(i, j, value, visionBoard) {
    calculateVision(visionBoard, i, j, value);
    calculateVision(visionBoard,i+1, j, value);
    calculateVision(visionBoard,i-1,j, value);
    calculateVision(visionBoard, i, j+1, value);
    calculateVision(visionBoard, i, j-1, value);
}

function userLeft(socket) {
    console.log("userLeft");
    let room = rooms.find(room => room.players.includes(socket.id));
    if (room) {
        let index = rooms.indexOf(room);
        rooms.splice(index, 1);
    }
}
exports.userLeft = userLeft;

function resumeGame(socket,roomName,nsp) {
    console.log("resumeGame");
    console.log(games[roomName]);
    socket.join(roomName);
    nsp.to(socket.id).emit('updateGrid', games[roomName]);

}
exports.resumeGame = resumeGame;

function makePlayersLeave(roomName, nsp) {
    nsp.to(roomName).emit('leaveGame');
}
exports.makePlayersLeave = makePlayersLeave;