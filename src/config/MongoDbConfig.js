const mongoose = require('mongoose');

const connections = {}; // Store active connections

const connectMongoDb = async (location) => {
  try {
    // Check if a connection already exists for this location
    if (connections[location]) {
      return connections[location];
    }

    // Dynamically construct the connection URI based on the location
    const uri = `mongodb+srv://latkarmuskan16:JyD7bl4xulV9VBhl@cluster0.ffvwr.mongodb.net/hmsm`
    // Create a new connection
    const connection = await mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Store the connection for future use
    connections[location] = connection;

    console.log(`Connected to MongoDB database for location: ${location}`);
    return connection;
  } catch (error) {
    console.error(`Error connecting to MongoDB for location ${location}:, error`);
    throw error;
  }
};

const getConnectionByLocation = (location) => {
  if (!connections[location]) {
    throw new Error(`No connection found for location: ${location}`);
  }
  return connections[location];
};

module.exports = {
  connectMongoDb,
  getConnectionByLocation,
};