


class Move {
    constructor(action, value) {
      this.action = action;
      this.value = value;
    }
  }

class gameState {
    constructor(opponentWalls, ownWalls, board) {
      this.opponentWalls = opponentWalls;
      this.ownWalls = ownWalls;
      this.board = board;
    }
  };
const WALL_RIGHT =  0b10000000;
const WALL_BOTTOM = 0b1000000000;
const WALL_LEFT =   0b100000000000;
const WALL_TOP =    0b10000000000000;
const PLAYER2 =0b10000
const PLAYER1 =0b100000
let whichTurn = 1;
var canSeeOpponent = false;
var ownPosition = [0,0];
var opponentPosition = [-1,-1];
var wallsPlaced = 0;
var goingLeft = true;


var whichPlayer = 0;
let visionBoard = [ [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0] ];


let advance;

function setup(AIplay) {
    return new Promise((resolve, reject) => {   
        if (AIplay == 1){
            whichPlayer = 1;
            advance = 1;
            ownPosition[0] = 3;
            ownPosition[1] = 1;
            resolve( "31");
        }
        else {
            whichPlayer = 2;
            advance = -1;
            ownPosition[0] = 3;
            ownPosition[1] = 9;
            resolve("99");
        }
        setTimeout(() => {
            reject('timeout');
        }, 1000);
    });
}

function nextMove(gameState) {
    return new Promise((resolve, reject) => {
        let j, i;
        if (whichTurn<4){
            if (whichTurn == 1) {
                if (whichPlayer == 1) {
                    wallsPlaced++;
                    resolve({ action: "wall", value: ["17", 0] });
                } else {
                    wallsPlaced++;
                    resolve({ action: "wall", value: ["14", 0] });
                }
            } else if (whichTurn == 2 && !canSeeOpponent) {
                if (whichPlayer == 1) {
                    wallsPlaced++;
                    resolve({ action: "wall", value: ["47", 0] });
                } else {
                    wallsPlaced++;
                    resolve({ action: "wall", value: ["44", 0] });
                }
            } else if (whichTurn == 3 && !canSeeOpponent) {
                if (whichPlayer == 1) {
                    wallsPlaced++;
                    resolve({ action: "wall", value: ["77", 0] });
                } else {
                    wallsPlaced++;
                    resolve({ action: "wall", value: ["74", 0] });
                }
            }
        }
        if (canSeeOpponent && wallsPlaced < 10 && whichTurn % 2 == 0 && opponentPosition[0] != ownPosition[0]) {
            i = opponentPosition[0] -1;
            j = opponentPosition[1] -1;
            if (whichPlayer == 2){
                if (!((visionBoard[i][j] & WALL_TOP) == 0) && !((visionBoard[i+1][j]& WALL_TOP) == 0)){
                    wallsPlaced++;
                    resolve({ action: "wall", value: [opponentPosition[0].toString() + opponentPosition[1].toString(), 0] });
                }else if (((visionBoard[i+1][j] & WALL_TOP) == 0) ){
                    wallsPlaced++;
                    resolve({ action: "wall", value: [opponentPosition[0].toString() + opponentPosition[1].toString(), 1] });
                }else if (((visionBoard[i-1][j]& WALL_TOP) == 0)){
                    wallsPlaced++;
                    resolve({ action: "wall", value: [(opponentPosition[0]+1).toString() + opponentPosition[1].toString(), 1] });
                }
            }else {
                if (!((visionBoard[i][j] & WALL_BOTTOM) == 0) && !((visionBoard[i-1][j]& WALL_BOTTOM) == 0)){
                    wallsPlaced++;
                    resolve({ action: "wall", value: [opponentPosition[0].toString() + opponentPosition[1].toString(), 0] });
                }else if (((visionBoard[i-1][j] & WALL_BOTTOM) == 0) ){
                    wallsPlaced++;
                    resolve({ action: "wall", value: [opponentPosition[0].toString() + opponentPosition[1].toString(), 1] });
                }else if (((visionBoard[i+1][j]& WALL_BOTTOM == 0))){
                    wallsPlaced++;
                    resolve({ action: "wall", value: [opponentPosition[0].toString() + opponentPosition[1].toString(), 1] });
                }
            }
        }

        i = ownPosition[0]-1;
        j = ownPosition[1] -1;
        if (whichPlayer == 1) {
            if ((visionBoard[i][j] & WALL_TOP) == 0) {
                resolve({ action: "move", value: ownPosition[0].toString() + (ownPosition[1] + advance).toString() });
            } else if (goingLeft) {
                if ((visionBoard[i][j] & WALL_LEFT) == 0 && i<8) {
                    resolve({ action: "move", value: (ownPosition[0] + 1).toString() + ownPosition[1].toString() });
                } else if (i>0){
                    goingLeft = !goingLeft;
                    resolve({ action: "move", value: (ownPosition[0] - 1).toString() + (ownPosition[1]).toString() });
                }
            } else 
            if ((visionBoard[i][j] & WALL_RIGHT) == 0 && i>0) {
                resolve({ action: "move", value: (ownPosition[0] - 1).toString() + ownPosition[1].toString() });
            } else if (j>0) {
                goingLeft = !goingLeft;
                resolve({ action: "move", value: ownPosition[0].toString() + (ownPosition[1] - advance).toString() });
            }
        } else {
            if ((visionBoard[i][j] & WALL_BOTTOM) == 0) {
                resolve({ action: "move", value: ownPosition[0].toString() + (ownPosition[1] + advance).toString() });
            } else if (goingLeft) {
                if ((visionBoard[i][j] & WALL_LEFT) == 0 && i<8) {
                    resolve({ action: "move", value: (ownPosition[0] + 1).toString() + ownPosition[1].toString() });
                } else {
                    goingLeft = !goingLeft;
                    resolve({ action: "move", value: (ownPosition[0] - 1).toString() + (ownPosition[1]).toString() });
                }
            } else {
                if ((visionBoard[i][j] & WALL_RIGHT == 0) && i>0) {
                    resolve({ action: "move", value: (ownPosition[0] - 1).toString() + ownPosition[1].toString() });
                } else if (j<8){
                    goingLeft = !goingLeft;
                    resolve({ action: "move", value: ownPosition[0].toString() + (ownPosition[1] - advance).toString() });
                }
            }
        }
        resolve({ action: "move", value: ownPosition[0].toString() + (ownPosition[1] + advance).toString() });

    setTimeout(() => {

        resolve({ action: "move", value: ownPosition[0].toString() + (ownPosition[1]+advance).toString()});
    }, 199);
    });
}

function correction(rightMove) {
    return new Promise((resolve, reject) => {
        goingLeft = !goingLeft;
        resolve(true);
        setTimeout(() => {reject('timeout');}, 50);
    });
}

function updateBoard(gameState) {
    return new Promise((resolve,reject)=>{
        canSeeOpponent = false;
        for (let i = 0; i < 9; i++){
            for (let j = 0; j < 9; j++){
                if (gameState.board[i][j] == 1){
                    visionBoard[i][j] = 1;
                    ownPosition[0] = i+1;
                    ownPosition[1] = j+1;
                }
                else if (gameState.board[i][j] == 2){
                    visionBoard[i][j] = 2;
                    opponentPosition[0] = i+1;
                    opponentPosition[1] = j+1;
                    canSeeOpponent = true;
                }
                else if (gameState.board[i][j] == -1){
                    visionBoard[i][j] = 4;
                }
            }
        }

        gameState.opponentWalls.forEach(element => {
            const element0 = element[0];
            const firstHalf = element0.substring(0, 1);
            const secondHalf = element0.substring(1);
            const firstHalfParsed = parseInt(firstHalf) - 1;
            const secondHalfParsed = parseInt(secondHalf) -1 ;
            if (element[1] == 1){

                visionBoard[firstHalfParsed][secondHalfParsed] = visionBoard[firstHalfParsed][secondHalfParsed] | WALL_RIGHT;
                visionBoard[firstHalfParsed][secondHalfParsed+1] = visionBoard[firstHalfParsed][secondHalfParsed+1] | WALL_LEFT;
                visionBoard[firstHalfParsed+1][secondHalfParsed] = visionBoard[firstHalfParsed+1][secondHalfParsed] | WALL_RIGHT;
                visionBoard[firstHalfParsed+1][secondHalfParsed+1] = visionBoard[firstHalfParsed+1][secondHalfParsed+1] | WALL_LEFT;
                
            }else{
                visionBoard[firstHalfParsed][secondHalfParsed] = visionBoard[firstHalfParsed][secondHalfParsed] | WALL_BOTTOM;
                visionBoard[firstHalfParsed+1][secondHalfParsed] = visionBoard[firstHalfParsed+1][secondHalfParsed] | WALL_TOP;
                visionBoard[firstHalfParsed][secondHalfParsed+1] = visionBoard[firstHalfParsed][secondHalfParsed+1] | WALL_BOTTOM;
                visionBoard[firstHalfParsed+1][secondHalfParsed+1] = visionBoard[firstHalfParsed+1][secondHalfParsed+1] | WALL_TOP;}

        });
        gameState.ownWalls.forEach(element => {
            
            const element0 = element[0];
            const firstHalf = element0.substring(0, 1);
            const secondHalf = element0.substring(1);
            
            const firstHalfParsed = parseInt(firstHalf) -1;
            const secondHalfParsed = parseInt(secondHalf) -1;
            if (element[1] == 1){

                visionBoard[firstHalfParsed][secondHalfParsed] = visionBoard[firstHalfParsed][secondHalfParsed] | WALL_RIGHT;
                visionBoard[firstHalfParsed][secondHalfParsed+1] = visionBoard[firstHalfParsed][secondHalfParsed+1] | WALL_LEFT;
                visionBoard[firstHalfParsed+1][secondHalfParsed] = visionBoard[firstHalfParsed+1][secondHalfParsed] | WALL_RIGHT;
                visionBoard[firstHalfParsed+1][secondHalfParsed+1] = visionBoard[firstHalfParsed+1][secondHalfParsed+1] | WALL_LEFT;
                
            }else{
                visionBoard[firstHalfParsed][secondHalfParsed] = visionBoard[firstHalfParsed][secondHalfParsed] | WALL_BOTTOM;
                visionBoard[firstHalfParsed+1][secondHalfParsed] = visionBoard[firstHalfParsed+1][secondHalfParsed] | WALL_TOP;
                visionBoard[firstHalfParsed][secondHalfParsed+1] = visionBoard[firstHalfParsed][secondHalfParsed+1] | WALL_BOTTOM;
                visionBoard[firstHalfParsed+1][secondHalfParsed+1] = visionBoard[firstHalfParsed+1][secondHalfParsed+1] | WALL_TOP;}
        });         
        whichTurn++;
        resolve(true);
        setTimeout(() => {resolve(true);}, 50);
    });
}   


function whatToDo(whichPlayer, gameState){
}

    


exports.setup = setup;
exports.nextMove = nextMove;    
exports.correction = correction;    
exports.updateBoard = updateBoard;
