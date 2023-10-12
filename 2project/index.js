const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const stripe = require('stripe')('YOUR_STRIPE_API_KEY');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect('mongodb://localhost/your-database-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a MongoDB model for PaymentIntents (This should be in a separate file)
const PaymentIntent = mongoose.model('PaymentIntent', {
  amount: Number,
  currency: String,
  // Define other fields as needed
});

// Middleware
app.use(bodyParser.json());

// Routes
app.post('/api/v1/create_intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    

    // Save intent to MongoDB (You should handle errors and validation)
    const paymentIntent = new PaymentIntent({
      amount,
      currency,
     
    });
    await paymentIntent.save();

    res.status(200).json({ intent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
