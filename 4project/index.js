const express = require('express');
const app = express();
const mongoose = require('mongoose');

// Configure Express and middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://sahil:sahilmalviya@cluster0.hhowf26.mongodb.net/unit5final?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
