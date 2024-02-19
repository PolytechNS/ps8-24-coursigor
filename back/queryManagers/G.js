import { GameState, Move } from './Classes';
const WALL_RIGHT =  0b10000000;
const WALL_BOTTOM = 0b1000000000;
const WALL_LEFT =   0b100000000000;
const WALL_TOP =    0b10000000000000;
const PLAYER2 =0b10000
const PLAYER1 =0b100000
var whichTurn = 0;
var canSeeOpponent = false;
var ownPosition = [0,0];
var opponentPosition = [-1,-1];

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
            resolve( "20");
        }
        else {
            whichPlayer = 2;
            advance = -1;
            resolve("28");
        }
        setTimeout(() => {
            reject('timeout');
        }, 1000);
    });
}

function nextMove(gameState) {
    return new Promise ((resolve, reject) => {
    resolve(whatToDo(whichPlayer, gameState));

    setTimeout(() => {
        reject('timeout');
    }, 200);
    });
}

function correction(rightMove) {
    return new Promise((resolve, reject) => {
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
                    ownPosition[0] = i;
                    ownPosition[1] = j;
                }
                else if (gameState.board[i][j] == 2){
                    visionBoard[i][j] = 2;
                    opponentPosition[0] = i;
                    opponentPosition[1] = j;
                    canSeeOpponent = true;
                }
                else if (gameState.board[i][j] == -1){
                    visionBoard[i][j] = 4;
                }
            }
        }
        gameState.opponentWalls.array.forEach(element => {
            const element0 = element[0];
            const firstHalf = element0.substring(0, 1);
            const secondHalf = element0.substring(1);
            firstHalf = parseInt(firstHalf);
            secondHalf = parseInt(secondHalf);
            if (element[1] == 1){

                visionBoard[firstHalf][secondHalf] = visionBoard[firstHalf][secondHalf] | WALL_RIGHT;
                visionBoard[firstHalf][secondHalf+1] = visionBoard[firstHalf][secondHalf+1] | WALL_LEFT;
                visionBoard[firstHalf+1][secondHalf] = visionBoard[firstHalf+1][secondHalf] | WALL_RIGHT;
                visionBoard[firstHalf+1][secondHalf+1] = visionBoard[firstHalf+1][secondHalf+1] | WALL_LEFT;
                
            }else{
                visionBoard[firstHalf][secondHalf] = visionBoard[firstHalf][secondHalf] | WALL_BOTTOM;
                visionBoard[firstHalf+1][secondHalf] = visionBoard[firstHalf+1][secondHalf] | WALL_TOP;
                visionBoard[firstHalf][secondHalf+1] = visionBoard[firstHalf][secondHalf+1] | WALL_BOTTOM;
                visionBoard[firstHalf+1][secondHalf+1] = visionBoard[firstHalf+1][secondHalf+1] | WALL_TOP;}

        });
        whichTurn++;
        resolve(true);
        setTimeout(() => {reject('timeout');}, 50);
    });
}   


function whatToDo(whichPlayer, gameState){
    if (whichTurn == 1){
        if (whichPlayer == 1){
            return new Move("wall", ["60",0]);
        }
        else {
            return new Move("wall", ["20",0]);
        }
    }else if (whichTurn == 2 && !canSeeOpponent)
    {
        if (whichPlayer == 1){
            return new Move("wall", ["63",0]);
        }
        else {
            return new Move("wall", ["23",0]);
        }
    }else if (whichTurn == 3 && !canSeeOpponent){
        if (whichPlayer == 1){
            return new Move("wall", ["66",0]);
        }
        else {
            return new Move("wall", ["26",0]);
        }
    }
    let i = ownPosition[0];
    let j = ownPosition[1];
    if (gameState.board[i][j] == 1){
            if (whichPlayer == 1){
                if (visionBoard[i][j] & WALL_TOP == 0  )
                    return new Move("move", i.toString() + (j+advance).toString());
                else if (visionBoard[i][j] & WALL_RIGHT == 0)
                    return new Move("move", (i-1).toString() + j.toString());
                else if (visionBoard[i][j] & WALL_LEFT == 0)
                    return new Move("move", (i+1).toString() + j.toString());
                else{
                    return new Move("move", i.toString() + (j-advance).toString());
                }
            }else {
                if (visionBoard[i][j] & WALL_BOTTOM == 0)
                    return new Move("move", i.toString() + (j+advance).toString());
                else if (visionBoard[i][j] & WALL_RIGHT == 0)
                    return new Move("move", (i-1).toString() + j.toString());
                else if (visionBoard[i][j] & WALL_LEFT == 0)
                    return new Move("move", (i+1).toString() + j.toString());
                else{
                    return new Move("move", i.toString() + (j-advance).toString());
                }
            }
    }
    if (opponentPosition!= [-1,-1]){
        i = opponentPosition[0];
        j = opponentPosition[1];
        if (whichPlayer == 2){
            if (!(visionBoard[i][j] & WALL_TOP == 0)){

            }
        }else {

        }
    }
    opponentPosition = [-1,-1];

}


    


exports.setup = setup;
exports.nextMove = nextMove;    
exports.correction = correction;    
exports.updateBoard = updateBoard;
