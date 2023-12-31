const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 7);

    
    const newUser = new User({
      email,
      password: hashedPassword
    });
    

    await newUser.save();

    // Send a welcome email (you need to implement this)

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
