const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    phone:String,
    gender: String
});

module.exports = mongoose.model("User", userSchema);