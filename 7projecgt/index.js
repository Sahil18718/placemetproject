const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Connect to MongoDB (replace with your actual MongoDB URI)
mongoose.connect('mongodb://localhost:27017/user-management', {
  
});


const User = mongoose.model('User', {
  first_name: String,
  last_name: String,
  email: { type: String, unique: true },
  mobile: String,
  password: String,
  role: String,
  status: String,
});


const jwtSecret = 'your-secret-key';


function validateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ status: 401, message: 'Invalid/Expired Token' });

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(401).json({ status: 401, message: 'Invalid/Expired Token' });

    req.user = user;
    next();
  });
}

app.post('/api/users/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ status: 200, message: 'Account successfully created' });
  } catch (error) {
    res.status(501).json({ status: 501, message: 'Validation failed' });
  }
});

// User Login API
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.role !== role) {
      return res.status(401).json({ status: 401, message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ status: 401, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '30d' });

    res.json({
      status: 200,
      message: 'Logged in successfully',
      data: {
        userDetails: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          status: user.status,
        },
        token,
      },
    });
  } catch (error) {
    res.status(501).json({ status: 501, message: 'Validation failed' });
  }
});


app.get('/api/users/details', validateToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ status: 404, message: 'User not found' });

  res.json({
    status: 200,
    data: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
    },
  });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
