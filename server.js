import express from "express";
import mongoose from "mongoose";
import { Url } from "./Models/Url.js";
import { randomBytes } from "crypto";
import "dotenv/config";

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// EJS setup
app.set("view engine", "ejs");
app.set("views", "./views");

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "url_shortener",
  })
  .then(() => {
    console.log("MongoDB Connected...");

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

// Home page
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// About page
app.get("/about", (req, res) => {
  res.render("about.ejs");
});

// Shorten URL
app.post("/shorten", async (req, res) => {
  const { fullUrl } = req.body;

  if (!fullUrl) {
    return res.status(400).json({
      message: "URL is required",
    });
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(fullUrl);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return res.status(400).json({
        message: "Only HTTP and HTTPS URLs are allowed!",
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: "Invalid URL!",
    });
  }

  if (parsedUrl.host === req.get("host")) {
    return res.status(400).json({
      message: "You cannot shorten your own shortened URL!",
    });
  }

  // Check whether the URL already exists
  const existingUrl = await Url.findOne({
    fullUrl: fullUrl,
  });

  if (existingUrl) {
    return res.status(200).json({
      success: true,
      message: "URL already exists",
      shortUrl: `${req.protocol}://${req.get("host")}/${existingUrl.shortUrl}`,
    });
  }

  // Generate a random short ID
  const shortId = randomBytes(4).toString("hex");

  // Save URL in MongoDB
  const newUrl = new Url({
    fullUrl: fullUrl,
    shortUrl: shortId,
  });

  await newUrl.save();

  res.status(201).json({
    success: true,
    message: "URL shortened successfully",
    shortUrl: `${req.protocol}://${req.get("host")}/${shortId}`,
  });
});

// Redirect to original URL
app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;

  const url = await Url.findOne({
    shortUrl: shortId,
  });

  if (!url) {
    return res.status(404).json({
      message: "Short URL not found",
    });
  }

  return res.redirect(url.fullUrl);
});
