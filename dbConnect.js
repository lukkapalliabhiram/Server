const MongoClient = require('mongodb').MongoClient;
// MongoDB connection URL
const url = require("./config/keys").mongoURI;
// Database name
const dbName = 'test'; 
// Function to establish MongoDB connection and return the database object
async function connectToDb() {
  try {
    const client = await MongoClient.connect(url);
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    // console.log(db);
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    throw err;
  }
}

module.exports = connectToDb().then(db => module.exports = db);
