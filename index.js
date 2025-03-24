const express = require("express");
const cors = require("cors")
const mongoose = require("mongoose")
const PORT = 8000;
const app = express()
const jwt = require('jsonwebtoken');
const secretKey = "secretKey"

app.use(cors())
app.use(express.json());

mongoose.connect("mongodb+srv://test-sandip:VHkXUhy0cgp9wx91@test.bspx5.mongodb.net/?retryWrites=true&w=majority&appName=test")
const User = require('./modals/userModal')
const Register = require('./modals/registerModal')
const Login = require('./modals/loginModal')

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    Register.findOne({ email: email }).then((user) => {
        if (user) {
            if (user.password === password) {
                // Create a payload with user data
                const payload = { id: user._id, email: user.email, name: user.name };

                // Sign the JWT token
                jwt.sign(payload, secretKey, { expiresIn: "86400s" }, (err, token) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error generating token' }); // 500 Internal Server Error
                    }

                    // Return the token and user data
                    res.status(200).json({
                        message: 'Login successful',
                        token: token,
                        user: payload
                    });
                });
            } else {
                res.status(401).json({ message: 'Password is incorrect' }); // 401 Unauthorized
            }
        } else {
            res.status(404).json({ message: 'User not found' }); // 404 Not Found
        }
    }).catch((err) => {
        res.status(500).json({ message: 'Internal Server Error' }); // 500 Internal Server Error
    });
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name.trim() || !email.trim() || !password.trim()) {
        res.status(400).json({ message: 'All fields are required' }); // 400 Bad Request
    } else {
        Register.findOne({ email: email }).then((user) => {
            if (user) {
                res.status(409).json({ message: 'Email already exists' }); // 409 Conflict
            } else {
                Register.create(req.body)
                    .then(register => res.status(201).json(register)) // 201 Created
                    .catch((err) => res.status(500).json(err)); // 500 Internal Server Error
            }
        }).catch((err) => {
            res.status(500).json('Internal Server Error'); // 500 Internal Server Error
        });
    }
});

app.post('/create-user', (req, res) => {
    const { firstname, lastname, email, phone, gender } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !email || !phone || !gender) {
        return res.status(400).json({ message: 'All fields are required' }); // 400 Bad Request
    }

    // Check if the user already exists
    User.findOne({ email: email }).then((existingUser) => {
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' }); // 409 Conflict
        }

        // Create a new user
        User.create({ firstname, lastname, email, phone, gender })
            .then((newUser) => res.status(201).json({ message: 'User created successfully', user: newUser })) // 201 Created
            .catch((err) => res.status(500).json({ message: 'Internal Server Error', error: err })); // 500 Internal Server Error
    }).catch((err) => {
        res.status(500).json({ message: 'Internal Server Error', error: err }); // 500 Internal Server Error
    });
});

app.get('/user-list', (req, res) => {
    const { page = 1, limit = 10, email } = req.query;

    const query = email ? { email: { $regex: email, $options: 'i' } } : {};

    User.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .then((users) => res.status(200).json({
            message: 'User list fetched successfully',
            users
        })) // 200 OK
        .catch((err) => res.status(500).json({
            message: 'Internal Server Error',
            error: err
        })); // 500 Internal Server Error
});

app.put('/update-user', (req, res) => {
    const { _id, firstname, lastname, email, phone, gender } = req.body;

    if (!_id || !firstname || !lastname || !email || !phone || !gender) {
        return res.status(400).json({ message: 'All fields are required' }); // 400 Bad Request
    }

    const updates = { firstname, lastname, email, phone, gender };

    User.findByIdAndUpdate(_id, updates, { new: true })
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' }); // 404 Not Found
            }

            // Fetch the updated user list
            User.find({})
                .then((users) => res.status(200).json({
                    message: 'User updated successfully',
                    user: updatedUser,
                    users
                })) // 200 OK
                .catch((err) => res.status(500).json({
                    message: 'Internal Server Error while fetching user list',
                    error: err
                })); // 500 Internal Server Error
        })
        .catch((err) => res.status(500).json({ message: 'Internal Server Error', error: err })); // 500 Internal Server Error
});

app.post('/logout', (req, res) => {
    // Invalidate the token on the client side
    res.status(200).json({ message: 'Logout successful' }); // 200 OK
});

app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`);
})