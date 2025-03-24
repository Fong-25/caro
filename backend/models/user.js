const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    elo: { type: Number, default: 1000 },
    win: { type: Number, default: 0 },
    lose: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", userSchema);

