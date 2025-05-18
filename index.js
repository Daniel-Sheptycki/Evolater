const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Load Firebase admin credentials from the secret file
const serviceAccount = JSON.parse(
  fs.readFileSync('/etc/secrets/admin-files', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.get('/', (req, res) => {
  res.send('Server is running');
});

// POST route that accepts JSON and returns true
app.post('/test', (req, res) => {
  console.log('Received data:', req.body);
  res.json({ success: true });
});

app.post('/add-creature', async (req, res) => {
  const { userId, creatureId, data } = req.body;

  const { state, img, name, description, enviornmentDescription } = data;

  try {
    const generatedData = await CreatureOutput(description, enviornmentDescription, img);

    const creatureRef = db
      .collection('users')
      .doc(userId)
      .collection('creatures')
      .doc(creatureId);

    const newState = {
      dateAdded: new Date(),
      image: generatedData.image,
      state: 2,
      changes: generatedData.changes,
    };

    await creatureRef.collection('states').add(newState);

    return res.status(200).json({ success: true, message: "Should have added creature" });

  } catch (error) {

    console.error('Error adding creature:', error);
    return res.status(500).json({ error: 'Failed to add creature' });

  }
});

async function CreatureOutput(creatureDetails, creatureEnvironment, creatureImage) {

    //Call 4o mini api for text generation for what changed part and definition, use what changed for image and text, use definition for next input

    //Call Image Generation API for image

    const generatedImage = creatureImage; // Placeholder for the generated image URL
    const generatedText = "This is a example of what would have changed if this were altered by a.i";

    // Return the generated data
    return {
      image: generatedImage,
      changes: generatedText,
    };
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});