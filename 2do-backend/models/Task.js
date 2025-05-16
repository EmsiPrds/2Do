import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }, // ✅ Track when task is completed
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", TaskSchema);
export default Task;
