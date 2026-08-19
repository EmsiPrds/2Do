import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username:       { type: String, required: true, unique: true, trim: true },
    password:       { type: String, required: true },
    avatar:         { type: String, default: "" },
    currentStreak:  { type: Number, default: 0 },
    longestStreak:  { type: Number, default: 0 },
    lastActiveDate: { type: String, default: "" }, // "YYYY-MM-DD" local date string
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
