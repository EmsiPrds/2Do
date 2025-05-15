import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// User Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // ✅ Validate and Trim Username
    if (!username || username.trim() === "") {
      return res.status(400).json({ message: "Username is required." });
    }

    const trimmedUsername = username.trim();

    // Check if the user already exists
    const existingUser = await User.findOne({ username: trimmedUsername });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // ✅ Password Strength Validation
    if (
      password.length < 8 ||
      !/\d/.test(password) ||
      !/[!@#$%^&*]/.test(password)
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include a number and a special character.",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username: trimmedUsername,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // ✅ Validate and Trim Username
    if (!username || username.trim() === "") {
      return res.status(400).json({ message: "Username is required." });
    }

    const trimmedUsername = username.trim();

    // Check if the user exists
    const user = await User.findOne({ username: trimmedUsername });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // ✅ Include userId in response for frontend context
    res.json({ token, username: user.username, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
