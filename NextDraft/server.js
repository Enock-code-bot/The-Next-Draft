// server.js
const express = require('express'); // Import Express framework
const mongoose = require('mongoose'); // Import Mongoose for MongoDB interaction
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const cors = require('cors'); // Middleware for enabling CORS
const path = require('path'); // Module for handling file paths

const app = express(); // Create an Express application
const PORT = process.env.PORT || 5000; // Set the port for the server

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/basketball', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...')) // Log success message
    .catch(err => console.error('MongoDB connection error:', err)); // Log any connection errors

// Define a Player schema
const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    points: { type: Number, required: true },
    rebounds: { type: Number, required: true },
    assists: { type: Number, required: true },
    rating: { type: Number, required: true }
});

// Create a Player model
const Player = mongoose.model('Player', playerSchema);

// Define API routes
// GET route to fetch all players
app.get('/players', async (req, res) => {
    try {
        const players = await Player.find(); // Fetch all players from the database
        res.json(players); // Send the players as a JSON response
    } catch (error) {
        console.error('Error fetching players:', error); // Log any errors
        res.status(500).json({ message: 'Internal Server Error' }); // Send error response
    }
});

// POST route to add a new player
app.post('/players', async (req, res) => {
    const newPlayer = new Player(req.body); // Create a new player from the request body
    try {
        await newPlayer.save(); // Save the player to the database
        res.status(201).json(newPlayer); // Send the newly created player as a JSON response
    } catch (error) {
        console.error('Error adding player:', error); // Log any errors
        res.status(400).json({ message: 'Bad Request' }); // Send error response
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`); // Log the server URL
});