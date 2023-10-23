const express = require('express');
const app = express();
const mongoose = require('mongoose');

app.use(express.json());

mongoose.connect('mongodb+srv://sahil:sahilmalviya@cluster0.hhowf26.mongodb.net/unit5final?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const authRoutes = require('./routes/auh');
app.use('/api', authRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
