import mongoose from "mongoose";

const SubtaskSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const TaskSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:     { type: String, required: true },
  description: { type: String },
  dueDate:   { type: Date },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  subtasks:  { type: [SubtaskSchema], default: [] },
  order:     { type: Number, default: 0 },
  focusToday: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["todo", "in-progress", "done"],
    default: "todo",
  },
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", TaskSchema);
export default Task;
