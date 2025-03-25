const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/", async (req, res) => {
    try {
        const players = await User.find().sort({ elo: -1 }).limit(10);
        res.status(200).json(players);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error: " + error.message });
    }
})

module.exports = router;