import express from "express";
import multer from "multer";
import path from "path";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}${ext}`);
  },
});

const upload = multer({ storage });

// ✅ Avatar Upload Route
router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      console.log("File Info: ", req.file); // ✅ Add this to see if Multer receives the file

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found." });

      user.avatar = `/uploads/avatars/${req.file.filename}`;
      await user.save();

      res.json({
        message: "Avatar updated successfully.",
        avatar: user.avatar,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
