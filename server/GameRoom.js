// GameRoom.js
const Room = require('./Room');

const Lobby = require('./Lobby');


class GameRoom extends Room {
  constructor(name, users, active) {
    super(name, users, active);
    this.queue = [];
    this.maxUsers = 2;
    this.boardState = this.initializeBoardState();
    this.lobby = null;
  }

    initializeBoardState() {
        // Implement the function to initialize the board state
        // Return the initial board state as a 2D array or any suitable data structure
        // For example, a 3x3 board can be represented as [['', '', ''], ['', '', ''], ['', '', '']]
        // return [[null, null, null], [null, null, null], [null, null, null]];
  
        return [
          [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]], // layer 1
          [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]], // layer 2
          [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]]  // layer 3
        ];
        
    }


  addToQueue(user) {
    this.addUser({id:user.id, totem: 'y'})
    this.queue.push(user);
    if (this.queue.length == this.maxUsers -1 ) {
      this.createGameLobby();
    }
  }

  areValuesEqualAtIndexes(array, indexes) {
    const selectedValues = indexes.map((index)=> array[index])
    let selectedValuesSet = new Set(selectedValues)
    if(selectedValues[0] && selectedValuesSet.size === 1) {
      return true
    }return false
  }


    checkForWin() {

      const winningCombinations = [
        // Rows
        [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
        [16, 17, 18, 19], [20, 21, 22, 23], [24, 25, 26, 27], [28, 29, 30, 31],
        [32, 33, 34, 35], [36, 37, 38, 39], [40, 41, 42, 43], [44, 45, 46, 47],
        // Columns
        [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
        [16, 20, 24, 28], [17, 21, 25, 29], [18, 22, 26, 30], [19, 23, 27, 31],
        [32, 36, 40, 44], [33, 37, 41, 45], [34, 38, 42, 46], [35, 39, 43, 47],
        // Layers
        [0, 16, 32], [1, 17, 33], [2, 18, 34], [3, 19, 35],
        [4, 20, 36], [5, 21, 37], [6, 22, 38], [7, 23, 39],
        [8, 24, 40], [9, 25, 41], [10, 26, 42], [11, 27, 43],
        [12, 28, 44], [13, 29, 45], [14, 30, 46], [15, 31, 47],
        // Diagonals within layers
        [0, 5, 10, 15], [3, 6, 9, 12],
        [16, 21, 26, 31], [19, 22, 25, 28],
        [32, 37, 42, 47], [35, 38, 41, 44],
        // Diagonals across layers
        [0, 21, 42], [3, 22, 41],
        [12, 25, 38], [15, 26, 37],
        [0, 17, 34], [3, 18, 33],
        [12, 29, 46], [15, 30, 45],
        [4, 21, 38], [7, 22, 37],
        [8, 17, 26], [11, 18, 25],
        [4, 25, 46], [7, 22, 37],
        [8, 21, 34], [11, 22, 33],
        [1, 18, 35], [2, 19, 36], [13, 26, 39], [14, 27, 40],
        [1, 22, 43], [2, 21, 40], [13, 30, 47], [14, 29, 46]
    ];

        let boardMatrix = this.boardState;
        const flatBoard =  boardMatrix.flat(2)
        console.log('board state is ', flatBoard)

        const winPatterns = [
            // Rows
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            // Columns
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            // Diagonals
            [0, 4, 8],
            [2, 4, 6]
        ];
    
        for (const pattern of winningCombinations) {
          console.log('checking with', pattern)

          let isMatchFound = this.areValuesEqualAtIndexes(flatBoard, pattern)
          if(isMatchFound){
            console.log('won,,,', pattern)
            return true;
          }
          
        }
    
        return false; // No winner
    }

    
    checkForDraw () {
        let boardMatrix = this.boardState;
        const flatBoard =  boardMatrix.flat(2)

        return flatBoard.every((cell) => cell !== null);
    }

   isValidMove( rowIndex, colIndex, level) {
    // Check if the cell is within the bounds of the board
    if (
      level>=0 && level < this.boardState.length &&
      rowIndex >= 0 && rowIndex < this.boardState[0].length &&
      colIndex >= 0 && colIndex < this.boardState[0][rowIndex].length
    ) {
      // Check if the cell is empty
      return this.boardState[level][rowIndex][colIndex] === null;
    }
    
    return false;
  }

  updateBoard({rowIndex, colIndex, level, mark }) {

    let clonedBoard = [...this.boardState.map((row) => row.map((col) => [...col]))];

    clonedBoard[level][rowIndex][colIndex] = mark; 

    this.boardState = clonedBoard

  }

  restartGame() {
    this.boardState = this.initializeBoardState();
  }

  returnRoomObj() {
    let obj = {
        "players":  this.users,
        "active":this.active,
        "boardState" : this.boardState
    }
    return obj
  }

  createGameLobby() {
    const lobbyName = `${this.name}_Lobby`;
    const lobby = new Lobby(lobbyName, this.queue);
    this.lobby = lobby;
    // Additional logic to start the game and handle game-related events
    // For simplicity, just logging for now
    console.log(`Game lobby created: ${lobby.name}`);
  }
}

module.exports = GameRoom;

