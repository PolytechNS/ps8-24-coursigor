const gameState = {
    opponentWalls: [],
    ownWalls: [],
    board: [
      [-1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1, -1],
    ],
    constructor(opponentWalls, ownWalls, board) {
      this.opponentWalls = opponentWalls;
      this.ownWalls = ownWalls;
      this.board = board;
    }
  };

class Move {
    constructor(action, value) {
      this.action = action;
      this.value = value;
    }
  }