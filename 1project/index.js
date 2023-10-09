const express = require('express');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const app = express();
const port = 8000;

const mongoUrl = 'mongodb://localhost:27017'; // Replace with your MongoDB connection URL
const dbName = 'githubData'; // Replace with your database name
const collectionName = 'repositories'; // Replace with your collection name

// Middleware to parse JSON requests
app.use(express.json());

// API 1: Save GitHub Data to MongoDB
app.post('/github', async (req, res) => {
  try {
    // Connect to MongoDB
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db(dbName);

    // Get the GitHub API URL from the request payload
    const { url } = req.body;

    // Fetch GitHub data
    const response = await axios.get(url);
    const githubData = response.data;

    // Loop through each repository and save it to MongoDB
    for (const repo of githubData) {
      // Check if a document with the same "id" exists, and update if it does, or insert a new document if not
      await db.collection(collectionName).updateOne(
        { id: repo.id },
        { $set: repo },
        { upsert: true }
      );
    }

    client.close();
    res.status(200).json({ message: 'GitHub data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API 2: Retrieve Saved GitHub Data from MongoDB
app.get('/github/:id', async (req, res) => {
  try {
    // Connect to MongoDB
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db(dbName);

    // Retrieve GitHub repository data based on the provided "id"
    const id = parseInt(req.params.id);
    const repository = await db.collection(collectionName).findOne({ id });

    if (!repository) {
      res.status(404).json({ error: 'Repository not found' });
    } else {
      res.status(200).json(repository);
    }

    client.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
