// tZNSUW8M3tGDlvqX

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require('express-session');
const authRoutes = require("./routes/auth");
const leaderboardRoutes = require("./routes/leaderboard");
const http = require("http");
const socketIo = require("socket.io");
const User = require('./models/user')
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        method: ["GET", "POST"]
    }
})
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
}));

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));


// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoutes)
// Serve frontend (for production)
app.use(express.static(path.join(path.resolve(), "/frontend/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(path.resolve(), "frontend", "dist", "index.html"));
});

// Game state management
const gameRooms = new Map(); // Store game state for each room


// SocketIO logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Track which rooms this socket is in
    const playerRooms = new Set();

    socket.on('joinRoom', (roomId) => {
        if (!roomId || roomId.trim() === '') {
            socket.emit('roomError', 'Room ID cannot be blank');
            return;
        }

        const room = io.sockets.adapter.rooms.get(roomId);
        const roomSize = room ? room.size : 0;

        if (roomSize > 2) {
            socket.emit('roomError', 'Room is full (max 2 players)');
            return;
        }

        // Leave any previous rooms
        for (const prevRoom of playerRooms) {
            socket.leave(prevRoom);
            // console.log(`User ${socket.id} left room: ${prevRoom}`);
            // Notify others in the room
            // socket.to(prevRoom).emit('playerDisconnected');
            // Update player count for the room they left
            const updatedRoom = io.sockets.adapter.rooms.get(prevRoom);
            const updatedSize = updatedRoom ? updatedRoom.size : 0;
            io.to(prevRoom).emit('playerCount', updatedSize);
        }
        playerRooms.clear();

        // Join the new room
        socket.join(roomId);
        playerRooms.add(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);

        // Initialize or get the game state
        if (!gameRooms.has(roomId)) {
            gameRooms.set(roomId, {
                board: Array(15).fill().map(() => Array(15).fill(null)),
                currentTurn: 'X',
                players: {},
                winner: null
            });
        }

        const gameState = gameRooms.get(roomId);

        // Assign player symbol (X or O)
        const players = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        let symbol;

        // Check if this player is rejoining
        if (Object.values(gameState.players).includes(socket.id)) {
            // Find the symbol for this socket id
            symbol = Object.keys(gameState.players).find(
                key => gameState.players[key] === socket.id
            );
        } else {
            // Assign a new symbol
            if (!('X' in gameState.players)) {
                symbol = 'X';
            } else if (!('O' in gameState.players)) {
                symbol = 'O';
            } else {
                // This shouldn't happen with the room size check above
                socket.emit('roomError', 'Room is full');
                return;
            }

            // Store the player's socket id with their symbol
            gameState.players[symbol] = socket.id;
        }

        socket.emit('playerSymbol', symbol);

        // Send the current game state to the player
        socket.emit('gameState', gameState.board);
        socket.emit('currentTurn', gameState.currentTurn);

        if (gameState.winner) {
            socket.emit('gameWinner', gameState.winner);
        }

        // Notify room of player count
        io.to(roomId).emit('playerCount', players.length);
    });


    socket.on('playerLeft', (roomId) => {
        io.to(roomId).emit('playerDisconnected');
    });

    socket.on('makeMove', ({ roomId, x, y, symbol }) => {
        if (!gameRooms.has(roomId)) {
            return;
        }

        const gameState = gameRooms.get(roomId);

        // Check if it's this player's turn
        if (gameState.currentTurn !== symbol || gameState.winner) {
            return;
        }

        // Check if the move is valid
        if (x < 0 || x >= 15 || y < 0 || y >= 15 || gameState.board[x][y] !== null) {
            return;
        }

        // Update the board
        gameState.board[x][y] = symbol;

        // Determine next turn
        const nextTurn = symbol === 'X' ? 'O' : 'X';
        gameState.currentTurn = nextTurn;

        // Broadcast the move to all players in the room
        io.to(roomId).emit('moveMade', { x, y, symbol, nextTurn });

        // Check for winner
        const winner = checkWinner(gameState.board, x, y, symbol);
        if (winner) {
            gameState.winner = symbol;
            io.to(roomId).emit('gameWinner', symbol);
        }
    });

    // Function to check for a winner
    function checkWinner(board, x, y, symbol) {
        const directions = [
            [0, 1],  // Horizontal
            [1, 0],  // Vertical
            [1, 1],  // Diagonal
            [-1, 1]  // Anti-diagonal
        ];

        for (let [dx, dy] of directions) {
            let count = 1; // Starting with the piece just placed

            // Check in positive direction
            for (let i = 1; i <= 4; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;

                if (nx < 0 || nx >= 15 || ny < 0 || ny >= 15 || board[nx][ny] !== symbol) {
                    break;
                }
                count++;
            }

            // Check in negative direction
            for (let i = 1; i <= 4; i++) {
                const nx = x - dx * i;
                const ny = y - dy * i;

                if (nx < 0 || nx >= 15 || ny < 0 || ny >= 15 || board[nx][ny] !== symbol) {
                    break;
                }
                count++;
            }

            if (count >= 5) {
                return true;
            }
        }

        return false;
    }

    socket.on('resetGame', (roomId) => {
        if (gameRooms.has(roomId)) {
            const gameState = gameRooms.get(roomId);
            gameState.board = Array(15).fill().map(() => Array(15).fill(null));
            gameState.currentTurn = 'X';
            gameState.winner = null;

            io.to(roomId).emit('gameState', gameState.board);
            io.to(roomId).emit('gameReset');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Notify rooms this player was in
        for (const roomId of playerRooms) {
            socket.to(roomId).emit('playerDisconnected');

            // Update player count
            const room = io.sockets.adapter.rooms.get(roomId);
            const roomSize = room ? room.size : 0;
            io.to(roomId).emit('playerCount', roomSize);

            // Find and remove the player from the game state
            if (gameRooms.has(roomId)) {
                const gameState = gameRooms.get(roomId);
                for (const [sym, id] of Object.entries(gameState.players)) {
                    if (id === socket.id) {
                        // We keep the player association in case they reconnect
                        // Just mark them as disconnected here
                        console.log(`Player ${sym} disconnected from room ${roomId}`);
                    }
                }

                // If the room is empty, clean up after some time
                setTimeout(() => {
                    const currentRoom = io.sockets.adapter.rooms.get(roomId);
                    if (!currentRoom || currentRoom.size === 0) {
                        gameRooms.delete(roomId);
                        console.log(`Room ${roomId} has been removed due to inactivity`);
                    }
                }, 60000); // Clean up after 1 minute of inactivity
            }
        }
    });
});

// PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});