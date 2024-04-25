class Move {
    constructor(action, value) {
        this.action = action;
        this.value = value;
    }
}

class GameState {
    constructor(opponentWalls, ownWalls, board) {
        this.opponentWalls = opponentWalls;
        this.ownWalls = ownWalls;
        this.board = board;
    }
}

const WALL_RIGHT = 0b10000000;
const WALL_BOTTOM = 0b1000000000;
const WALL_LEFT = 0b100000000000;
const WALL_TOP = 0b10000000000000;
const PLAYER2 = 0b10000;
const PLAYER1 = 0b100000;

class AI {
    constructor() {
        this.whichTurn = 1;
        this.canSeeOpponent = false;
        this.ownPosition = [0, 0];
        this.opponentPosition = [-1, -1];
        this.wallsPlaced = 0;
        this.goingLeft = true;
        this.whichPlayer = 0;
        this.visionBoard = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
    }

    setup(AIplay) {
        return new Promise((resolve, reject) => {
            if (AIplay == 1) {
                this.whichPlayer = 1;
                this.advance = 1;
                this.ownPosition[0] = 3;
                this.ownPosition[1] = 1;
                resolve("31");
            } else {
                this.whichPlayer = 2;
                this.advance = -1;
                this.ownPosition[0] = 3;
                this.ownPosition[1] = 9;
                resolve("99");
            }
            setTimeout(() => {
                reject('timeout');
            }, 1000);
        });
    }

    nextMove(gameState) {
        return new Promise((resolve, reject) => {
            let j, i;
            if (this.whichTurn < 4) {
                if (this.whichTurn == 1) {
                    if (this.whichPlayer == 1) {
                        this.wallsPlaced++;
                        resolve({ action: "wall", value: ["17", 0] });
                    } else {
                        this.wallsPlaced++;
                        resolve({ action: "wall", value: ["14", 0] });
                    }
                } else if (this.whichTurn == 2 && !this.canSeeOpponent) {
                    if (this.whichPlayer == 1) {
                        this.wallsPlaced++;
                        resolve({ action: "wall", value: ["47", 0] });
                    } else {
                        this.wallsPlaced++;
                        resolve({ action: "wall", value: ["44", 0] });
                    }
                } else if (this.whichTurn == 3 && !this.canSeeOpponent) {
                    if (this.whichPlayer == 1) {
                        this.wallsPlaced++;
                        resolve({ action: "wall", value: ["77", 0] });
                    } else {
                        this.wallsPlaced++;
                        resolve({ action: "wall", value: ["74", 0] });
                    }
                }
            }
            if (this.canSeeOpponent && this.wallsPlaced < 10 && this.whichTurn % 2 == 0 && this.opponentPosition[0] != this.ownPosition[0]) {
                i = this.opponentPosition[0] - 1;
                j = this.opponentPosition[1] - 1;
                if (this.whichPlayer == 2) {
                    if (!((this.visionBoard[i][j] & WALL_TOP) == 0) && !((this.visionBoard[i + 1][j] & WALL_TOP) == 0)) {
                        this.wallsPlaced++;
                        resolve({ action: "wall", value: [this.opponentPosition[0].toString() + this.opponentPosition[1].toString(), 0] });
                    } else if (((this.visionBoard[i + 1][j] & WALL_TOP) == 0)) {
                        this.wallsPlaced++;
                        resolve({ action: "wall", value: [this.opponentPosition[0].toString() + this.opponentPosition[1].toString(), 1] });
                    } else if (((this.visionBoard[i - 1][j] & WALL_TOP) == 0)) {
                        this.wallsPlaced++;
                        resolve({ action: "wall", value: [(this.opponentPosition[0] + 1).toString() + this.opponentPosition[1].toString(), 1] });
                    }
                } else {
                    if (!((this.visionBoard[i][j] & WALL_BOTTOM) == 0) && !((this.visionBoard[i - 1][j] & WALL_BOTTOM) == 0)) {
                        this.wallsPlaced++;
                        resolve({ action: "wall", value: [this.opponentPosition[0].toString() + this.opponentPosition[1].toString(), 0] });
                    } else if (((this.visionBoard[i - 1][j] & WALL_BOTTOM) == 0)) {
                        this.wallsPlaced++;
                        resolve({ action: "wall", value: [this.opponentPosition[0].toString() + this.opponentPosition[1].toString(), 1] });
                    } else if (((this.visionBoard[i + 1][j] & WALL_BOTTOM == 0))) {
                        this.wallsPlaced++;
                        resolve({ action: "wall", value: [opponentPosition[0].toString() + opponentPosition[1].toString(), 1] });
                    }
                }
            }

            i = this.ownPosition[0] - 1;
            j = this.ownPosition[1] - 1;
            if (this.whichPlayer == 1) {
                if ((this.visionBoard[i][j] & WALL_TOP) == 0) {
                    resolve({ action: "move", value: this.ownPosition[0].toString() + (this.ownPosition[1] + this.advance).toString() });
                } else if (this.goingLeft) {
                    if ((this.visionBoard[i][j] & WALL_LEFT) == 0 && i < 8) {
                        resolve({ action: "move", value: (this.ownPosition[0] + 1).toString() + this.ownPosition[1].toString() });
                    } else if (i > 0) {
                        this.goingLeft = !this.goingLeft;
                        resolve({ action: "move", value: (this.ownPosition[0] - 1).toString() + (this.ownPosition[1]).toString() });
                    }
                } else if ((this.visionBoard[i][j] & WALL_RIGHT) == 0 && i > 0) {
                    resolve({ action: "move", value: (this.ownPosition[0] - 1).toString() + this.ownPosition[1].toString() });
                } else if (j > 0) {
                    this.goingLeft = !this.goingLeft;
                    resolve({ action: "move", value: this.ownPosition[0].toString() + (this.ownPosition[1] - this.advance).toString() });
                }
            } else {
                if ((this.visionBoard[i][j] & WALL_BOTTOM) == 0) {
                    resolve({ action: "move", value: this.ownPosition[0].toString() + (this.ownPosition[1] + this.advance).toString() });
                } else if (this.goingLeft) {
                    if ((this.visionBoard[i][j] & WALL_LEFT) == 0 && i < 8) {
                        resolve({ action: "move", value: (this.ownPosition[0] + 1).toString() + this.ownPosition[1].toString() });
                    } else {
                        this.goingLeft = !this.goingLeft;
                        resolve({ action: "move", value: (this.ownPosition[0] - 1).toString() + (this.ownPosition[1]).toString() });
                    }
                } else if ((this.visionBoard[i][j] & WALL_RIGHT == 0) && i > 0) {
                    resolve({ action: "move", value: (this.ownPosition[0] - 1).toString() + this.ownPosition[1].toString() });
                } else if (j < 8) {
                    this.goingLeft = !this.goingLeft;
                    resolve({ action: "move", value: this.ownPosition[0].toString() + (this.ownPosition[1] - this.advance).toString() });
                }
            }
            resolve({ action: "move", value: this.ownPosition[0].toString() + (this.ownPosition[1] + this.advance).toString() });

            setTimeout(() => {

                resolve({ action: "move", value: this.ownPosition[0].toString() + (this.ownPosition[1] + this.advance).toString() });
            }, 199);
        });
    }


    correction(rightMove) {
        return new Promise((resolve, reject) => {
            this.goingLeft = !this.goingLeft;
            resolve(true);
            setTimeout(() => { reject('timeout'); }, 50);
        });
    }

    updateBoard(gameState) {
        try {
            return new Promise((resolve, reject) => {
                this.canSeeOpponent = false;
                for (let i = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++) {
                        if (gameState.board[i][j] == 1) {
                            this.visionBoard[i][j] = 1;
                            this.ownPosition[0] = i + 1;
                            this.ownPosition[1] = j + 1;
                        } else if (gameState.board[i][j] == 2) {
                            this.visionBoard[i][j] = 2;
                            this.opponentPosition[0] = i + 1;
                            this.opponentPosition[1] = j + 1;
                            this.canSeeOpponent = true;
                        } else if (gameState.board[i][j] == -1) {
                            this.visionBoard[i][j] = 4;
                        }
                    }
                }

                console.log("opponent walls : " + gameState.opponentWalls);
                gameState.opponentWalls.forEach(element => {
                    console.log("element : " + element);
                    const element0 = element[0];
                    element0.toString();
                    const firstHalf = element0.substring(0, 1);
                    const secondHalf = element0.substring(1);
                    const firstHalfParsed = parseInt(firstHalf) - 1;
                    const secondHalfParsed = parseInt(secondHalf) - 1;
                    if (element[1] == 1) {

                        this.visionBoard[firstHalfParsed][secondHalfParsed] = this.visionBoard[firstHalfParsed][secondHalfParsed] | WALL_RIGHT;
                        this.visionBoard[firstHalfParsed][secondHalfParsed + 1] = this.visionBoard[firstHalfParsed][secondHalfParsed + 1] | WALL_LEFT;
                        this.visionBoard[firstHalfParsed + 1][secondHalfParsed] = this.visionBoard[firstHalfParsed + 1][secondHalfParsed] | WALL_RIGHT;
                        this.visionBoard[firstHalfParsed + 1][secondHalfParsed + 1] = this.visionBoard[firstHalfParsed + 1][secondHalfParsed + 1] | WALL_LEFT;

                    } else {
                        this.visionBoard[firstHalfParsed][secondHalfParsed] = this.visionBoard[firstHalfParsed][secondHalfParsed] | WALL_BOTTOM;
                        this.visionBoard[firstHalfParsed + 1][secondHalfParsed] = this.visionBoard[firstHalfParsed + 1][secondHalfParsed] | WALL_TOP;
                        this.visionBoard[firstHalfParsed][secondHalfParsed + 1] = this.visionBoard[firstHalfParsed][secondHalfParsed + 1] | WALL_BOTTOM;
                        this.visionBoard[firstHalfParsed + 1][secondHalfParsed + 1] = this.visionBoard[firstHalfParsed + 1][secondHalfParsed + 1] | WALL_TOP;
                    }

                });

                console.log("own walls : " + gameState.ownWalls);
                gameState.ownWalls.forEach(element => {
                    console.log("element : " + element);

                    const element0 = element[0];
                    element0.toString();
                    const firstHalf = element0.substring(0, 1);
                    const secondHalf = element0.substring(1);

                    const firstHalfParsed = parseInt(firstHalf) - 1;
                    const secondHalfParsed = parseInt(secondHalf) - 1;
                    if (element[1] == 1) {

                        this.visionBoard[firstHalfParsed][secondHalfParsed] = this.visionBoard[firstHalfParsed][secondHalfParsed] | WALL_RIGHT;
                        this.visionBoard[firstHalfParsed][secondHalfParsed + 1] = this.visionBoard[firstHalfParsed][secondHalfParsed + 1] | WALL_LEFT;
                        this.visionBoard[firstHalfParsed + 1][secondHalfParsed] = this.visionBoard[firstHalfParsed + 1][secondHalfParsed] | WALL_RIGHT;
                        this.visionBoard[firstHalfParsed + 1][secondHalfParsed + 1] = this.visionBoard[firstHalfParsed + 1][secondHalfParsed + 1] | WALL_LEFT;

                    } else {
                        this.visionBoard[firstHalfParsed][secondHalfParsed] = this.visionBoard[firstHalfParsed][secondHalfParsed] | WALL_BOTTOM;
                        this.visionBoard[firstHalfParsed + 1][secondHalfParsed] = this.visionBoard[firstHalfParsed + 1][secondHalfParsed] | WALL_TOP;
                        this.visionBoard[firstHalfParsed][secondHalfParsed + 1] = this.visionBoard[firstHalfParsed][secondHalfParsed + 1] | WALL_BOTTOM;
                        this.visionBoard[firstHalfParsed + 1][secondHalfParsed + 1] = this.visionBoard[firstHalfParsed + 1][secondHalfParsed + 1] | WALL_TOP;
                    }
                });
                this.whichTurn++;
                resolve(true);
                setTimeout(() => {
                    resolve(true);
                }, 50);
            });
        } catch (e) {
            console.log(e);
        }
    }

    whatToDo(whichPlayer, gameState) {
        // Method definition not provided, you can add it here as needed
    }
}

module.exports = {AI, AIGameState : GameState};