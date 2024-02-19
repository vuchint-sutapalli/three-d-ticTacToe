import React, { useState, useEffect } from 'react';
import './index.css';
import ChatRoom from '../ChatRoom';

import Result from '../Result';


import socketService from '../../services/socketService';
import LogMaintainer from '../LogMaintainer';

const TicTacToeBoard = ({serverRoomId, logs, setLogs}) => {
  const boardSize = 4;


  const [isBoardActive, setIsBoardActive] = useState(false);

  const  [gameState, setGameState] = useState(null);
//   const [winProbability, setWinProbability] = useState('33 %');
  const [opponent, setOpponent] = useState('');
  const [totem, setTotem] = useState(null);
  let board = Array(3).fill(Array(boardSize).fill(Array(boardSize).fill(null)))
  // const sta = Array(3).fill(Array(boardSize*boardSize).fill(null));

  const [boardState, setBoardState] = useState(board);




  const clearBoard= () => {
    // Reset the game state to start a new game
    setBoardState(Array(3).fill(Array(boardSize).fill(Array(boardSize).fill(null))));
    setGameState(null);
  }

  
  const handleRestart = () => {
    let socket = socketService.getSocket();
    
    // setWinner(null);
    clearBoard()

    // Emit 'restartGame' event to inform the server to reinitialize the room
    socket.emit('restart_game', serverRoomId);
  };
  

  useEffect(() => {
    // Set up the listener for board state updates
    let socket = socketService.getSocket();
    socket.on('recieve_board', (newBoardState, active) => {

        console.log(`recieved board ${newBoardState} and totem is ${totem}`)
        setIsBoardActive(active === socket.id);
      setBoardState(newBoardState);

    });



    socket.on('game_over', (newBoardState, serverMessage) => {
        setBoardState(newBoardState);
        console.log(`game over`, serverMessage)
        if(serverMessage.winner) {
            if(serverMessage.winner === socket.id) {
                setGameState('won')
            } else{
                setGameState('lost')
            }

        } else {
            setGameState('draw')
        }
    });

    

    socket.on('game-start', ({boardState, active, players }) => {
        clearBoard()
        console.log(`game started and current player is ${active} with ${boardState}`)

        setGameState('started')

        for (let i = 0; i < players.length; i++) {
            if (players[i].id === socket.id) {
              setTotem(players[i].totem)
              break; // Exit the loop once the object is found
            }else{
                setOpponent(players[i].id)
            }
          }

          setIsBoardActive(active === socket.id);
    });

    // Clean up the listener when the component unmounts
    return () => {
      socket.off('recieve_board');
      socket.off('game-start');
      socket.off('game_over');
    };
  }, []);




  const handleCellClick = (event, rowIndex, colIndex, level) => {
    event.preventDefault();
    event.stopPropagation();
    // console.log((boardState));
    console.log(boardState)
    if (boardState[level][rowIndex][colIndex] === null) {

        console.log(`cell clicked ${level} ${rowIndex} ${colIndex} `)

        socketService.getSocket().emit("update_board", {rowIndex: rowIndex, colIndex: colIndex ,level:level,mark: totem}, serverRoomId, socketService.getSocket().id);

    }
  };

  return (
    <div className="tictactoe-board-container">
        <h1>{`joined room: ${serverRoomId} ${totem ?  `with totem ` + totem : '.Waiting for opponent to join'}`}</h1>
        <>
            {
                gameState && ['won' , 'lost' , 'draw'].includes(gameState) ? (
                <Result handleRestart ={handleRestart} gameState={gameState} player={socketService.getSocket().id} opponent={opponent} onRestart={()=>{}}/>
                ) : (
                  <>
                    {
                        isBoardActive && (
                          <h2 style={{"height": "20px"}} > "Your turn!!"</h2>
                        )
                    }   
                  </>
                )
            }
        
        </>
       
        <div className='tictactoe-board-wrapper'>
            <div className="threed-board">
              <div className={`tictactoe-board top ${isBoardActive ? '': 'inactive'}`}>
                    {boardState[0]?.map((row, rowIndex) => {
                      return (
                            <div key={rowIndex} className="tictactoe-row">
                              {row?.map((cell, colIndex) => (
                                  <div key={colIndex} className={`tictactoe-cell ${cell === totem ? 'mine' : ''}`} onClick={(event) => handleCellClick(event, rowIndex, colIndex, 0)}>
                                      {cell && cell !== null ? (<span>{cell}</span>) : null}
                                  </div>
                              ))}
                            </div>
                        )
                    }
                    )}
                </div>
                <div className={`tictactoe-board middle ${isBoardActive ? '': 'inactive'}`}>
                    {boardState[1]?.map((row, rowIndex) => (
                        <div key={rowIndex} className="tictactoe-row">
                        {row?.map((cell, colIndex) => (
                            <div key={colIndex} className={`tictactoe-cell ${cell === totem ? 'mine' : ''}`} onClick={(event) => handleCellClick(event, rowIndex, colIndex,1)}>
                                {cell && cell !== null ? (<span>{cell}</span>) : null}
                            </div>
                        ))}
                        </div>
                    ))}
                </div>
                <div className={`tictactoe-board last ${isBoardActive ? '': 'inactive'}`}>
                    {boardState[2]?.map((row, rowIndex) => (
                        <div key={rowIndex} className="tictactoe-row">
                        {row?.map((cell, colIndex) => (
                            <div key={colIndex} className={`tictactoe-cell ${cell === totem ? 'mine' : ''}`} onClick={(event) => handleCellClick(event, rowIndex, colIndex,2)}>
                                {cell && cell !== null ? (<span>{cell}</span>) : null}
                            </div>
                        ))}
                        </div>
                    ))}
                </div>
            </div>
           
            <ChatRoom serverRoomId ={serverRoomId} />
        </div>

        {/* <LogMaintainer setLogs={setLogs} logs={logs} /> */}

    </div>
  );
};

export default TicTacToeBoard;
