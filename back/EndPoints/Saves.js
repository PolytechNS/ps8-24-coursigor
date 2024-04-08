const { MongoClient } = require("mongodb");
const jwt = require('jsonwebtoken');
const http = require('http');
const cors = require('cors');

// MongoDB connection URI
const DBuri = "mongodb://root:example@localhost:27017/";
const DBClient = new MongoClient(DBuri);

// Function to save AI game
async function saveAIGame(token) {
    try {
        // Establish MongoDB connection
        await DBClient.connect();
        console.log('Connected to the database');

        // Retrieve game
        let game = JSON.stringify(retrieveGame(token));

        // Save the game
        await DB_saveAIGame(DBClient, JSON.stringify(token), game);

        console.log("Game saved !");
    } catch (error) {
        console.error('Error saving game:', error);
    } finally {
        // Close the MongoDB connection
        await DBClient.close();
        console.log('Database connection closed');
    }
}
exports.saveAIGame = saveAIGame;

// Function to retrieve game
function retrieveGame(token) {
    let onlineGame = require('../logic/onlineGame.js');
    let game = onlineGame.retrieveGame(token);
    return game;
}

// Function to save game to MongoDB
const DB_saveAIGame = async (DBClient, userName, game) => {
    try {
        console.log('Saving game...');

        // Select database
        const db = DBClient.db('ma_base_de_donnees');

        // Create or access the collection
        const partiesCollection = db.collection('parties');

        // Add the game to the collection
        await partiesCollection.insertOne({ userName, game });

        console.log('Game added successfully!');
    } catch (error) {
        console.error('Error saving game to database:', error);
        throw error;
    }
};
