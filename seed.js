// One-time script to import your old db.json data into MongoDB.
// Run with: node seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import Product from "./models/Product.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB for seeding...");

  const raw = fs.readFileSync("./db.json", "utf-8");
  const data = JSON.parse(raw);
  const products = data.Products || [];

  const toInsert = products.map((p) => ({
    name: p.name,
    category: p.category,
    price: Number(p.price),
    description: p.description || "",
    image: p.image || "",
  }));

  await Product.deleteMany({}); // clear existing data before re-seeding
  await Product.insertMany(toInsert);

  console.log(`Seeded ${toInsert.length} products successfully.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
