const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = async () => {
    try {
        // Use a fixed database name
        const dbName = 'hsmDB';
        const uri = `mongodb://localhost:27017/${dbName}`;

        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('MongoDB connected successfully.');
        }

        return mongoose;  // Return mongoose instance

    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw new Error(`Database connection failed: ${error.message}`);
    }
};

module.exports = connectToDatabase;