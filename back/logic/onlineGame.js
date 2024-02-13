

// dictionary of games
let games = {};

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


class GameState {
    constructor(wallsNotToPlace, placedWalls, visionBoard, positionPlayer1, positionPlayer2) {
        this.wallsNotToPlace = wallsNotToPlace;
        this.placedWalls = placedWalls;
        this.visionBoard = visionBoard;
        this.positionPlayer1 = positionPlayer1;
        this.positionPlayer2 = positionPlayer2;
    }
}





export function newGame(socketId) {
    console.log('new game: ' + socketId);

    games[socketId] = new GameState(wallsNotToPlace, placedWalls, visionBoard, positionPlayer1, positionPlayer2);
    console.log(games);
}


export function nextMove(id, move) {
    console.log('nextMove: ' + move);

    let gameState = games[id];

    // move est de type [string, int, int]
    if (move[0] === "cell") {
        //TODO
    }
    else if (move[0] === "horizontal") {
        //TODO
    }
    else if (move[0] === "vertical") {
        //TODO
    }
    else {
        //TODO
    }
}