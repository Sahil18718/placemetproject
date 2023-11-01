// Import necessary modules and set up Express
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const app = express();
const port = process.env.PORT || 3000;


mongoose.connect('mongodb://localhost/email-scheduling-app', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

s
const EmailSchedule = require('./models/emailSchedule');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Schedule Email
app.post('/schedule-email', async (req, res) => {
  const { email, time, subject, body } = req.body;

  // Implement logic to schedule the email based on the 'time' parameter

  try {
    // Send the scheduled email using nodemailer or the SMTP system of your choice
    const transporter = nodemailer.createTransport({
      // Your SMTP configuration here
    });

    const mailOptions = {
      from: 'your-email@example.com',
      to: email,
      subject,
      text: body,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email scheduled and sent successfully' });

   
    const emailSchedule = new EmailSchedule({ email, time, subject, body, status: 'Success' });
    emailSchedule.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Email scheduling and sending failed' });

    // Record the failure in MongoDB
    const emailSchedule = new EmailSchedule({ email, time, subject, body, status: 'Failed' });
    emailSchedule.save();
  }
});


app.get('/scheduled-emails', async (req, res) => {
  try {
    const scheduledEmails = await EmailSchedule.find();
    res.status(200).json(scheduledEmails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch scheduled emails' });
  }
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
