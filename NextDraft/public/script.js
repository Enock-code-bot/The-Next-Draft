// script.js

// Base URL for API requests
const API_URL = 'http://localhost:5000';

// Variable to track admin login state
let isAdminLoggedIn = false;

// Function to show loading indicator
function showLoading() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'block'; // Show loading indicator
}

// Function to hide loading indicator
function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none'; // Hide loading indicator
}

// Function to fetch and display players from the server
async function fetchPlayers() {
    showLoading(); // Show loading indicator
    try {
        const response = await fetch(`${API_URL}/players`);
        if (!response.ok) {
            throw new Error('Failed to fetch players. Please try again later.');
        }
        const players = await response.json();
        displayPlayers(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        displayMessage(error.message);
    } finally {
        hideLoading(); // Hide loading indicator
    }
}

// Function to display players in the UI
function displayPlayers(players) {
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '';
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';
        playerDiv.innerHTML = `
            <strong>${player.name}</strong> (${player.position})<br>
            Points: ${player.points}, Rebounds: ${player.rebounds}, Assists: ${player.assists}, Rating: ${player.rating}
        `;
        playerList.appendChild(playerDiv);
    });
}

// Function to add a new player
async function addPlayer() {
    if (!isAdminLoggedIn) {
        displayMessage('You must be logged in as an admin to add a player.');
        return;
    }

    const name = document.getElementById('name').value.trim();
    const position = document.getElementById('position').value.trim();
    const points = document.getElementById('points').value.trim();
    const rebounds = document.getElementById('rebounds').value.trim();
    const assists = document.getElementById('assists').value.trim();

    // Validate inputs
    if (!name || !position || isNaN(points) || isNaN(rebounds) || isNaN(assists)) {
        displayMessage('Please fill in all fields with valid data.');
        return;
    }

    const playerData = {
        name,
        position,
        points: parseInt(points),
        rebounds: parseInt(rebounds),
        assists: parseInt(assists),
        rating: calculateRating(points, rebounds, assists)
    };

    showLoading(); // Show loading indicator
    try {
        const response = await fetch(`${API_URL}/players`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playerData)
        });

        if (!response.ok) {
            throw new Error('Failed to add player. Please try again.');
        }

        const newPlayer = await response.json();
        fetchPlayers(); // Refresh the player list
        clearForm(); // Clear the input fields
        displayMessage('Player added successfully!');
    } catch (error) {
        console.error('Error adding player:', error);
        displayMessage(error.message);
    } finally {
        hideLoading(); // Hide loading indicator
    }
}

// Function to calculate player rating
function calculateRating(points, rebounds, assists) {
    return (parseInt(points) + parseInt(rebounds) + parseInt(assists)) / 3;
}

// Function to clear the input fields
function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('position').value = '';
    document.getElementById('points').value = '';
    document.getElementById('rebounds').value = '';
    document.getElementById('assists').value = '';
}

// Function to display messages to the user
function displayMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Function to handle admin login
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        displayMessage('Please enter both username and password.');
        return;
    }

    showLoading(); // Show loading indicator
    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const messageDiv = document.getElementById('message');
        if (response.ok) {
            const data = await response.json();
            isAdminLoggedIn = true;
            messageDiv.textContent = 'Login successful!';
            document.getElementById('login-form').style.display = 'none'; // Hide login form
            document.getElementById('player-management').style.display = 'block'; // Show player management section
            fetchPlayers(); // Fetch players to show the updated list
        } else {
            const errorData = await response.json();
            messageDiv.textContent = errorData.message;
        }
    } catch (error) {
        console.error('Error during login:', error);
        displayMessage('An error occurred during login. Please try again.');
    } finally {
        hideLoading(); // Hide loading indicator
    }
}

// Fetch players when the page loads
window.onload = () => {
    document.getElementById('player-management').style.display = 'none'; // Ensure player management is hidden initially
    fetchPlayers();
};