const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },  // ⚠️ Storing plaintext (NOT RECOMMENDED)
    fullName: { type: String, required: true },
    accountType: { type: String, enum: ["doctor", "reception", "admin"], required: true }
}, { timestamps: true });

const UserModel = mongoose.model("User", userSchema, "users");
module.exports = UserModel;
