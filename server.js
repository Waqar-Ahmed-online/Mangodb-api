import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productsRouter from "./routes/products.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// Reuse the MongoDB connection across serverless invocations on Vercel
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
  console.log("Connected to MongoDB");
}

// Middleware ensures DB is connected before handling any request (needed for Vercel).
// This MUST be registered before the routes below, otherwise requests reach
// the route handlers before the connection is ready.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use("/products", productsRouter);

app.get("/", (req, res) => {
  res.json({ status: "API is running" });
});

// Only start a normal listening server when running locally (npm start).
// On Vercel, the exported `app` is used directly as a serverless function.
if (process.env.VERCEL !== "1") {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
}

export default app;