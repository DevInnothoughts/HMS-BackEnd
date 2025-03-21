const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();
const LocationDb = require("../database/locationDb.js");
const UserModel=require("../database/userDb.js")

const SECRET_KEY = process.env.JWT_SECRET || "jwt_secret_code";
const dbConnections = {}; // Store database connections

const connectToDatabase = async () => {
    try {
        console.log("📍 Connecting to DP Road database...");
        
        const dbURI = process.env.DB_URI_hmsDPRoadDb;
        if (!dbURI) {
            throw new Error("❌ No database URI found for DP Road.");
        }

        if (!dbConnections["DP Road"]) {
            console.log("🚀 Connecting to DP Road database...");
            dbConnections["DP Road"] = mongoose.createConnection(dbURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            await new Promise((resolve, reject) => {
                dbConnections["DP Road"].once("open", resolve);
                dbConnections["DP Road"].once("error", reject);
            });

            console.log("✅ Connected to DP Road database.");
        } else {
            console.log("🔄 Reusing existing connection: DP Road");
        }

        return dbConnections["DP Road"];
    } catch (error) {
        console.error("❌ Database connection error:", error.message);
        throw new Error("Failed to connect to DP Road database.");
    }
};

const getUserModel = (dbConnection, collectionName) => {
    const userSchema = new mongoose.Schema({
        email: { type: String, required: true, lowercase: true },
        password: { type: String, required: true },
        fullName: { type: String },
    });

    return dbConnection.model(collectionName, userSchema, collectionName);
};

const login = async (email, password, accountType) => {
    try {
        console.log("🔍 Authenticating user...");
        
        const dbConnection = await connectToDatabase();
        if (!dbConnection) throw new Error("Database connection failed for DP Road.");

        console.log("✅ Connected to DP Road database.");

        const collectionMapping = {
            doctor: "doctor",
            reception: "receptionist"
        };

        const collectionName = collectionMapping[accountType];
        if (!collectionName) {
            throw new Error("❌ Invalid account type.");
        }

        console.log(`🔍 Searching in collection: ${collectionName}`);
        const User = getUserModel(dbConnection, collectionName);

        console.log(`🔍 Searching for email: ${email.trim().toLowerCase()}`);
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            throw new Error("❌ No user found for email: " + email);
        }

        console.log("🔑 Checking password...");
        if (password !== user.password) {
            throw new Error("❌ Invalid password.");
        }

        console.log("✅ User authenticated successfully.");

        const token = jwt.sign(
            { email: user.email, role: accountType, userId: user._id },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        return {
            success: true,
            data: {
                token,
                role: accountType,
                fullName: user.fullName,
                email: user.email,
                jobLocation: "DP Road"
            }
        };
    } catch (error) {
        console.error("❌ Login error:", error.message);
        throw new Error("Login failed.");
    }
};

const locationDropdown = async () => {
    try {
        console.log("Fetching location dropdown...");
        const locations = await LocationDb.find({}, { name: 1, _id: 0 });
        return locations.map(location => location.name);
    } catch (error) {
        console.error("Error fetching location dropdown:", error.message);
        throw new Error("Unable to fetch location dropdown.");
    }
};

module.exports = { login, locationDropdown, connectToDatabase };