import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Task from "../models/Task.js";

const router = express.Router();

// 📌 Create Task (POST)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Task title is required." });
    }

    if (dueDate && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ message: "Invalid due date format." });
    }

    const newTask = new Task({
      user: req.user.id,
      title: title.trim(),
      description,
      dueDate,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Get All Tasks (GET)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Update Task (PUT)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate, completed } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

    if (!task) return res.status(404).json({ message: "Task not found." });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (completed !== undefined) task.completed = completed;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Delete Task (DELETE)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) return res.status(404).json({ message: "Task not found." });

    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
