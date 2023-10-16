const express = require('express');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// In-memory data storage for slots
const slots = Array(10).fill(null).map((_, i) => ({ slotNumber: i + 1, carNumber: null, ipAddress: null }));

// Rate limiting setup (adjust the options as needed)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute per IP
});

app.use(bodyParser.json()); // Middleware to parse JSON requests
app.use(limiter); // Apply rate limiting middleware to all routes

app.get('/', (req, res) => {
  res.send('Parking Lot Management API');
});

app.post('/park', (req, res) => {
  try {
    const { carNumber } = req.body;
    const ipAddress = req.ip;

    // Check if the parking lot is full
    const occupiedSlots = slots.filter((slot) => slot.carNumber !== null);

    if (occupiedSlots.length >= slots.length) {
      return res.status(400).json({ message: 'Parking lot is full.' });
    }

    // Park the car
    const slot = slots.find((slot) => slot.carNumber === null);
    slot.carNumber = carNumber;
    slot.ipAddress = ipAddress;

    return res.status(201).json({ message: 'Car parked successfully', slot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/unpark/:slotNumber', (req, res) => {
  try {
    const { slotNumber } = req.params;

    const slot = slots.find((slot) => slot.slotNumber === parseInt(slotNumber));

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found.' });
    }

    if (slot.carNumber === null) {
      return res.status(400).json({ message: 'Slot is already empty.' });
    }

    slot.carNumber = null;
    slot.ipAddress = null;

    return res.status(200).json({ message: 'Car unparked successfully', slot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



app.get('/car/:carNumber', (req, res) => {
  const { carNumber } = req.params;

  const slot = slots.find((slot) => slot.carNumber === carNumber);

  if (!slot) {
    return res.status(404).json({ message: 'Car not found.' });
  }

  return res.status(200).json(slot);
});



app.get('/slot/:slotNumber', (req, res) => {
  const { slotNumber } = req.params;

  const slot = slots.find((slot) => slot.slotNumber === parseInt(slotNumber));

  if (!slot) {
    return res.status(404).json({ message: 'Slot not found.' });
  }

  return res.status(200).json(slot);
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
