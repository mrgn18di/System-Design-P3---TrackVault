// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Mongoose model for favorites
const favoriteSchema = new mongoose.Schema({
  trackId: { type: Number, required: true, unique: true },
  title: String,
  artist: String,
  artworkUrl: String,
  previewUrl: String,
});

const Favorite = mongoose.model("Favorite", favoriteSchema);

// ----------- ROUTES ----------- //

// Search route (uses iTunes API)
app.get("/api/search", async (req, res) => {
  const term = req.query.term;

  if (!term) {
    return res.status(400).json({ error: "Missing search term" });
  }

  try {
    const response = await axios.get("https://itunes.apple.com/search", {
      params: {
        term,
        entity: "song",
        limit: 20,
      },
    });

    const results = response.data.results.map((item) => ({
      trackId: item.trackId,
      title: item.trackName,
      artist: item.artistName,
      artworkUrl: item.artworkUrl100,
      previewUrl: item.previewUrl,
    }));

    res.json(results);
  } catch (err) {
    console.error("Error fetching from iTunes API:", err.message);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

// Get all favorites
app.get("/api/favorites", async (req, res) => {
  try {
    const favorites = await Favorite.find().sort({ title: 1 });
    res.json(favorites);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// Add a favorite
app.post("/api/favorites", async (req, res) => {
  const { trackId, title, artist, artworkUrl, previewUrl } = req.body;

  if (!trackId || !title || !artist) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // prevent duplicates
    const existing = await Favorite.findOne({ trackId });
    if (existing) {
      return res.status(200).json(existing);
    }

    const favorite = new Favorite({
      trackId,
      title,
      artist,
      artworkUrl,
      previewUrl,
    });

    const saved = await favorite.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving favorite:", err);
    res.status(500).json({ error: "Failed to save favorite" });
  }
});

// Delete a favorite by MongoDB _id
app.delete("/api/favorites/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Favorite.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    console.error("Error deleting favorite:", err);
    res.status(500).json({ error: "Failed to delete favorite" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 TrackVault server running on http://localhost:${PORT}`);
});
