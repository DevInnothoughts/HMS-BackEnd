const mongoose = require("mongoose");

const dbConnections = {}; // Stores active connections

const connectToDatabase = async (jobLocation) => {
    try {
        const dbURIs = {
            DP_ROAD: process.env.DB_URI_hmsm, // Main database
            BANER: process.env.DB_URI_hmsmBanerDb,
            CHAKAN: process.env.DB_URI_hmsmChakanDb,
            INDIRANAGAR: process.env.DB_URI_hmsmIndiranagarDb,
            LUCKNOW: process.env.DB_URI_hmsmLucknowDb
        };

        const locationKey = jobLocation.toUpperCase(); // Normalize input
        const dbURI = dbURIs[locationKey];

        if (!dbURI) throw new Error(`❌ No database URI found for location: ${jobLocation}`);

        // ✅ Return existing connection if already connected
        if (dbConnections[locationKey]) {
            console.log(`✅ Using existing connection for ${locationKey}`);
            return dbConnections[locationKey];
        }

        console.log(`🚀 Connecting to database: ${locationKey}...`);
        const connection = await mongoose.createConnection(dbURI).asPromise();

        if (!connection) throw new Error(`❌ Failed to establish connection with ${locationKey} DB`);

        dbConnections[locationKey] = connection;
        console.log(`✅ Connected to ${locationKey} database.`);
        return connection;
    } catch (error) {
        console.error("❌ Database connection error:", error.message);
        throw new Error(`Failed to connect to ${jobLocation} database.`);
    }
};

module.exports = { connectToDatabase };
