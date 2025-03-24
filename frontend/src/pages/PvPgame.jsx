import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import socket from '../socket';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function PvPgame() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState(Array(15).fill().map(() => Array(15).fill(null)));
    const [symbol, setSymbol] = useState(null);
    const [turn, setTurn] = useState('X'); // X goes first
    const [playerCount, setPlayerCount] = useState(0);
    const [winner, setWinner] = useState(null);
    const [isGameActive, setIsGameActive] = useState(false);

    useEffect(() => {
        // Join the room on mount
        socket.emit('joinRoom', roomId);

        socket.on('playerSymbol', (playerSymbol) => {
            setSymbol(playerSymbol);
            toast.success(`You are playing as ${playerSymbol}`);
        });

        socket.on('playerCount', (count) => {
            setPlayerCount(count);
            if (count < 2) {
                toast.loading('Waiting for another player...', { id: 'waitingToast' });
                setIsGameActive(false);
            } else {
                toast.dismiss('waitingToast');
                toast.success('Game started!');
                setIsGameActive(true);
            }
        });

        socket.on('gameState', (newBoard) => {
            setBoard(newBoard);
        });

        socket.on('currentTurn', (currentTurn) => {
            setTurn(currentTurn);
        });

        socket.on('moveMade', ({ x, y, symbol, nextTurn }) => {
            setBoard((prevBoard) => {
                const newBoard = prevBoard.map(row => [...row]);
                newBoard[x][y] = symbol;
                return newBoard;
            });
            setTurn(nextTurn);
        });

        socket.on('gameWinner', (winnerSymbol) => {
            setWinner(winnerSymbol);
            toast.success(`${winnerSymbol} wins!`);
            setIsGameActive(false);
        });

        socket.on('gameReset', () => {
            setBoard(Array(15).fill().map(() => Array(15).fill(null)));
            setTurn('X');
            setWinner(null);
            setIsGameActive(true);
            toast.success('Game has been reset');
        });

        socket.on('roomError', (message) => {
            toast.error(message);
            navigate('/lobby'); // Redirect to lobby on error
        });

        socket.on('playerDisconnected', () => {
            toast.error('Other player disconnected');
            setIsGameActive(false);
        });

        return () => {
            socket.off('playerSymbol');
            socket.off('playerCount');
            socket.off('gameState');
            socket.off('currentTurn');
            socket.off('moveMade');
            socket.off('gameWinner');
            socket.off('gameReset');
            socket.off('roomError');
            socket.off('playerDisconnected');
        };
    }, [roomId, navigate]);

    const handleMove = (x, y) => {
        // Check if move is valid
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
    };

    const handleResetGame = () => {
        if (winner || playerCount < 2) {
            socket.emit('resetGame', roomId);
        }
    };

    const handleReturnToLobby = () => {
        navigate('/lobby');
        socket.emit('playerLeft', roomId);
        console.log('Player left room');
        // toast.error('Other player disconnected');
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 p-6 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-white mb-4">
                Room: {roomId} | You are: {symbol || 'Waiting...'} | Players: {playerCount}/2
            </h2>

            {winner && (
                <div className="mb-4 p-4 bg-white/20 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
                    <h3 className="text-2xl text-white text-center">
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

            <div className="grid grid-cols-15 gap-1 bg-white p-2 rounded-lg shadow-xl">
                {board.map((row, x) => (
                    row.map((cell, y) => (
                        <div
                            key={`${x}-${y}`}
                            onClick={() => handleMove(x, y)}
                            className={`w-8 h-8 flex items-center justify-center border border-gray-300 
                                ${!cell && isGameActive && symbol === turn ? 'hover:bg-gray-200 cursor-pointer' : ''} 
                                ${cell === 'X' ? 'text-red-500 font-bold' : cell === 'O' ? 'text-blue-500 font-bold' : ''}`}
                        >
                            {cell}
                        </div>
                    ))
                ))}
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
            <Toaster />
        </div>
    );
}

export default PvPgame;