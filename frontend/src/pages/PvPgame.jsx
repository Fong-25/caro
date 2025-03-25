import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Add useMemo and useCallback
import socket from '../socket';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Create a memoized cell component
const BoardCell = React.memo(({ cell, onClick, isActive, symbol, turn, x, y }) => {
    return (
        <div
            key={`${x}-${y}`}
            onClick={onClick}
            className={`
                aspect-square w-full flex items-center justify-center 
                border border-white/30 
                bg-white/20 backdrop-blur-sm
                sm:text-xl text-xs font-bold transition-all duration-200
                ${!cell && isActive && symbol === turn
                    ? 'hover:bg-white/40 cursor-pointer'
                    : ''} 
                ${cell === 'X'
                    ? 'text-red-600 bg-red-100/30'
                    : cell === 'O'
                        ? 'text-blue-600 bg-blue-100/30'
                        : ''
                }
            `}
        >
            {cell}
        </div>
    );
});

function PvPgame() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState(Array(15).fill().map(() => Array(15).fill(null)));
    const [symbol, setSymbol] = useState(null);
    const [turn, setTurn] = useState('X'); // X goes first
    const [playerCount, setPlayerCount] = useState(0);
    const [winner, setWinner] = useState(null);
    const [isGameActive, setIsGameActive] = useState(false);

    // useEffect(() => {
    //     socket.off('playerSymbol');
    //     socket.off('playerCount');
    //     socket.off('gameState');
    //     socket.off('currentTurn');
    //     socket.off('moveMade');
    //     socket.off('gameWinner');
    //     socket.off('gameReset');
    //     socket.off('roomError');
    //     socket.off('playerDisconnected');
    //     // Join the room on mount
    //     socket.emit('joinRoom', roomId);

    //     socket.on('playerSymbol', (playerSymbol) => {
    //         setSymbol(playerSymbol);
    //         toast.success(`You are playing as ${playerSymbol}`);
    //     });

    //     socket.on('playerCount', (count) => {
    //         setPlayerCount(count);
    //         if (count < 2) {
    //             toast.loading('Waiting for another player...', { id: 'waitingToast' });
    //             setIsGameActive(false);
    //         } else {
    //             toast.dismiss('waitingToast');
    //             toast.success('Game started!', { id: 'gameStartToast' });
    //             setIsGameActive(true);
    //         }
    //     });

    //     socket.on('gameState', (newBoard) => {
    //         setBoard(newBoard);
    //     });

    //     socket.on('currentTurn', (currentTurn) => {
    //         setTurn(currentTurn);
    //     });

    //     socket.on('moveMade', ({ x, y, symbol, nextTurn }) => {
    //         setBoard((prevBoard) => {
    //             const newBoard = prevBoard.map(row => [...row]);
    //             newBoard[x][y] = symbol;
    //             return newBoard;
    //         });
    //         setTurn(nextTurn);
    //     });

    //     socket.on('gameWinner', (winnerSymbol) => {
    //         setWinner(winnerSymbol);
    //         toast.success(`${winnerSymbol} wins!`);
    //         setIsGameActive(false);
    //     });

    //     socket.on('gameReset', () => {
    //         setBoard(Array(15).fill().map(() => Array(15).fill(null)));
    //         setTurn('X');
    //         setWinner(null);
    //         setIsGameActive(true);
    //         toast.success('Game has been reset');
    //     });

    //     socket.on('roomError', (message) => {
    //         toast.error(message);
    //         navigate('/lobby'); // Redirect to lobby on error
    //     });

    //     socket.on('playerDisconnected', () => {
    //         toast.error('Other player disconnected');
    //         setIsGameActive(false);
    //     });

    //     return () => {
    //         socket.off('playerSymbol');
    //         socket.off('playerCount');
    //         socket.off('gameState');
    //         socket.off('currentTurn');
    //         socket.off('moveMade');
    //         socket.off('gameWinner');
    //         socket.off('gameReset');
    //         socket.off('roomError');
    //         socket.off('playerDisconnected');
    //     };
    // }, [roomId, navigate]);

    // const handleMove = (x, y) => {
    //     // Check if move is valid
    //     if (
    //         !isGameActive ||
    //         winner ||
    //         playerCount < 2 ||
    //         board[x][y] !== null ||
    //         symbol !== turn
    //     ) {
    //         if (symbol !== turn && !winner && isGameActive) {
    //             toast('Not your turn', { icon: '⏳' });
    //         }
    //         return;
    //     }

    //     socket.emit('makeMove', { roomId, x, y, symbol });
    // };

    const handleMove = useCallback((x, y) => {
        if (
            !isGameActive ||
            winner ||
            playerCount < 2 ||
            board[x][y] !== null ||
            symbol !== turn
        ) {
            if (symbol !== turn && !winner && isGameActive) {
                toast('Not your turn', { icon: '⏳' });
            }
            return;
        }

        socket.emit('makeMove', { roomId, x, y, symbol });
    }, [isGameActive, winner, playerCount, board, symbol, turn, roomId]);

    // Memoize board rendering to reduce unnecessary re-renders
    const boardGrid = useMemo(() => {
        return board.map((row, x) =>
            row.map((cell, y) => (
                <BoardCell
                    key={`${x}-${y}`}
                    cell={cell}
                    onClick={() => handleMove(x, y)}
                    isActive={isGameActive}
                    symbol={symbol}
                    turn={turn}
                    x={x}
                    y={y}
                />
            ))
        );
    }, [board, isGameActive, symbol, turn, handleMove]);

    const handleResetGame = () => {
        if (winner || playerCount < 2) {
            socket.emit('resetGame', roomId);
        }
    };
    useEffect(() => {
        // Create stable event handler functions
        const handlePlayerSymbol = (playerSymbol) => {
            setSymbol(playerSymbol);
            toast.success(`You are playing as ${playerSymbol}`);
        };

        const handlePlayerCount = (count) => {
            setPlayerCount(count);
            if (count < 2) {
                toast.loading('Waiting for another player...', { id: 'waitingToast' });
                setIsGameActive(false);
            } else {
                toast.dismiss('waitingToast');
                toast.success('Game started!', { id: 'gameStartToast' });
                setIsGameActive(true);
            }
        };

        const handleGameState = (newBoard) => {
            setBoard(newBoard);
        };

        const handleCurrentTurn = (currentTurn) => {
            setTurn(currentTurn);
        };

        const handleMoveMade = ({ x, y, symbol, nextTurn }) => {
            setBoard((prevBoard) => {
                const newBoard = [...prevBoard];
                newBoard[x] = [...prevBoard[x]];
                newBoard[x][y] = symbol;
                return newBoard;
            });
            setTurn(nextTurn);
        };

        const handleGameWinner = (winnerSymbol) => {
            setWinner(winnerSymbol);
            toast.success(`${winnerSymbol} wins!`);
            setIsGameActive(false);
        };

        const handleGameReset = () => {
            setBoard(Array(15).fill().map(() => Array(15).fill(null)));
            setTurn('X');
            setWinner(null);
            setIsGameActive(true);
            toast.success('Game has been reset');
        };

        const handleRoomError = (message) => {
            toast.error(message);
            navigate('/lobby');
        };

        const handlePlayerDisconnected = () => {
            toast.error('Other player disconnected');
            setIsGameActive(false);
        };

        // Add listeners with stable handler functions
        socket.on('playerSymbol', handlePlayerSymbol);
        socket.on('playerCount', handlePlayerCount);
        socket.on('gameState', handleGameState);
        socket.on('currentTurn', handleCurrentTurn);
        socket.on('moveMade', handleMoveMade);
        socket.on('gameWinner', handleGameWinner);
        socket.on('gameReset', handleGameReset);
        socket.on('roomError', handleRoomError);
        socket.on('playerDisconnected', handlePlayerDisconnected);

        // Join the room
        const userId = localStorage.getItem('userId'); // Get from storage
        socket.emit('joinRoom', roomId, userId); // Send userId
        // socket.emit('joinRoom', roomId);

        // Cleanup function to remove listeners
        return () => {
            socket.off('playerSymbol', handlePlayerSymbol);
            socket.off('playerCount', handlePlayerCount);
            socket.off('gameState', handleGameState);
            socket.off('currentTurn', handleCurrentTurn);
            socket.off('moveMade', handleMoveMade);
            socket.off('gameWinner', handleGameWinner);
            socket.off('gameReset', handleGameReset);
            socket.off('roomError', handleRoomError);
            socket.off('playerDisconnected', handlePlayerDisconnected);
        };
    }, [roomId, navigate]);


    const handleReturnToLobby = () => {
        navigate('/lobby');
        socket.emit('playerLeft', roomId);
        console.log('Player left room');
        // toast.error('Other player disconnected');
        toast.dismiss('gameStartToast');
        toast.dismiss('waitingToast');
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 p-6 flex flex-col items-center">
            <h2 className="sm:text-lg text-sm font-semibold text-white mb-4 break-words">
                Room: {roomId} | You are: {symbol || 'Waiting...'} | Players: {playerCount}/2
            </h2>

            {winner && (
                <div className="mb-4 p-4 bg-white/20 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
                    <h3 className="text-sm text-white text-center">
                        {winner === symbol ? 'You won! 🎉' : 'You lost! 😢'}
                        ({winner} wins)
                    </h3>
                </div>
            )}

            {!winner && playerCount === 2 && (
                <h3 className="text-2xl text-white mb-4">
                    Current turn: {turn} {symbol === turn ? '(Your turn)' : '(Opponent\'s turn)'}
                </h3>
            )}

            <div className="w-full max-w-[calc(15*3rem)] mx-auto px-2">
                <div className="grid grid-cols-15 gap-0.5 bg-white/30 backdrop-blur-sm p-1 rounded-lg shadow-xl border border-white/20">
                    {boardGrid}
                </div>
            </div>

            {playerCount < 2 && (
                <div className="mt-4 p-4 bg-white/20 backdrop-blur-lg rounded-lg text-white text-center">
                    Waiting for another player to join...
                </div>
            )}

            <div className="mt-6 flex gap-4">
                {winner && (
                    <button
                        onClick={handleResetGame}
                        className="px-4 py-2 bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white rounded-lg"
                    >
                        Play Again
                    </button>
                )}
                <button
                    onClick={handleReturnToLobby}
                    className="px-4 py-2 bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white rounded-lg"
                >
                    Return to Lobby
                </button>
            </div>
            <Toaster
                position="top-right"
                reverseOrder={false}
            />
        </div>
    );
}

export default PvPgame;