// seed.js — run with: node seed.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedUser = {
  username: "testuser",
  password: "password123",
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Remove existing seeded user if present
    await User.deleteOne({ username: seedUser.username });

    const hashed = await bcrypt.hash(seedUser.password, 10);
    const user = await User.create({
      username: seedUser.username,
      password: hashed,
    });

    console.log("Seeded user created:");
    console.log(`  username : ${user.username}`);
    console.log(`  password : ${seedUser.password}`);
    console.log(`  _id      : ${user._id}`);
  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
}

seed();
