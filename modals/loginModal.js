const mongoose = require('mongoose')

const loginSchema = new mongoose.Schema({
    email: String,
    password: String
})

module.exports = mongoose.model('Login', loginSchema)