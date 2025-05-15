import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String }, // Optional field for details
  dueDate: { type: Date }, // Optional field for deadlines
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", TaskSchema);
export default Task;
