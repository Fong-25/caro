import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

function JoinPvP() {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");

    useEffect(() => {
        socket.on('playerSymbol', (symbol) => {
            if (roomId) {
                toast.success(`Room joined successfully! You are ${symbol}`);
                navigate(`/play/${roomId}`);
            }
        });

        socket.on('roomError', (message) => {
            toast.error(message);
        });

        return () => {
            socket.off('playerSymbol');
            socket.off('roomError');
        };
    }, [navigate, roomId]);

    const handleJoinRoom = () => {
        const inputRoomId = window.prompt("Enter Room ID");

        if (inputRoomId && inputRoomId.trim() !== '') {
            setRoomId(inputRoomId.trim());
            socket.emit('joinRoom', inputRoomId.trim());
        } else if (inputRoomId !== null) { // Check if user didn't click Cancel
            toast.error("Room ID cannot be blank");
        }
    };

    const handleCreateRoom = () => {
        // Generate a random room ID
        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomId(newRoomId);
        socket.emit('joinRoom', newRoomId);
        toast.success(`Created room ${newRoomId}`);
    };

    return (
        <div className="p-4 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 mb-4 text-center">
            <h3 className="text-white text-xl mb-3 font-semibold">Play against a friend</h3>

            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={handleCreateRoom}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors duration-300 font-medium"
                >
                    Create Room
                </button>

                <button
                    onClick={handleJoinRoom}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors duration-300 font-medium"
                >
                    Join Room
                </button>
            </div>
        </div>
    );
}

export default JoinPvP;