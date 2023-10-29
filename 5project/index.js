// Import necessary modules and set up Express
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/parking-lot-app', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define MongoDB schemas (models)
const ParkingLot = require('./models/parkingLot');
const ParkingHistory = require('./models/parkingHistory');
const User = require('./models/user');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// User Authentication

// Register a new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Hash the password before storing it
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      res.status(500).json({ error: 'Password hashing error' });
    } else {
      const newUser = new User({ username, password: hashedPassword });

      newUser.save((err) => {
        if (err) {
          res.status(500).json({ error: 'Registration failed' });
        } else {
          res.status(201).json({ message: 'Registration successful' });
        }
      });
    }
  });
});

// Login for existing users
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username }, (err, user) => {
    if (err || !user) {
      res.status(401).json({ error: 'Authentication failed' });
    } else {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err || !result) {
          res.status(401).json({ error: 'Authentication failed' });
        } else {
          // Generate and send a JWT token
          const token = jwt.sign({ userId: user._id, username: user.username }, 'your-secret-key', {
            expiresIn: '1h', // Token expires in 1 hour
          });

          res.status(200).json({ message: 'Authentication successful', token });
        }
      });
    }
  });
});


app.use((req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'your-secret-key');
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
