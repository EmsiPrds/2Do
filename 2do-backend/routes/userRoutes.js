import express from "express";
import multer from "multer";
import path from "path";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ─────────────────────────────────────
   Streak helpers
───────────────────────────────────── */

/**
 * Returns "YYYY-MM-DD" in the server's local time.
 * Using local time is fine — streak is a "day" concept, not UTC-precise.
 */
function toDateStr(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterday(dateStr) {
  const d = new Date(dateStr + "T12:00:00"); // noon avoids DST edge
  d.setDate(d.getDate() - 1);
  return toDateStr(d);
}

/**
 * Called whenever a task is marked complete.
 * Updates currentStreak / longestStreak / lastActiveDate on the user doc.
 */
export async function updateStreakForUser(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const today = toDateStr(new Date());

  // Already counted today — nothing to do
  if (user.lastActiveDate === today) return;

  if (user.lastActiveDate === yesterday(today)) {
    // Consecutive day — extend streak
    user.currentStreak += 1;
  } else {
    // Gap or first completion ever — reset to 1
    user.currentStreak = 1;
  }

  user.lastActiveDate = today;
  if (user.currentStreak > user.longestStreak) {
    user.longestStreak = user.currentStreak;
  }

  await user.save();
}

/* ─────────────────────────────────────
   Routes
───────────────────────────────────── */

// GET /api/user/streak
router.get("/streak", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "currentStreak longestStreak lastActiveDate"
    );
    if (!user) return res.status(404).json({ message: "User not found." });

    // If the user missed yesterday, their streak is broken — return 0
    const today = toDateStr(new Date());
    const active =
      user.lastActiveDate === today ||
      user.lastActiveDate === yesterday(today);

    const currentStreak = active ? user.currentStreak : 0;

    // Persist the reset so it's not stale next time
    if (!active && user.currentStreak !== 0) {
      await User.findByIdAndUpdate(req.user.id, { currentStreak: 0 });
    }

    res.json({
      currentStreak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastActiveDate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/user/me  — username + avatar for the profile panel
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username avatar");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ username: user.username, avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
