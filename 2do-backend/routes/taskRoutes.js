import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Task from "../models/Task.js";
import { updateStreakForUser } from "./userRoutes.js";

const router = express.Router();

// 📌 Create Task (POST)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Task title is required." });
    }

    if (dueDate && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ message: "Invalid due date format." });
    }

    const validPriorities = ["low", "medium", "high"];
    const resolvedPriority = validPriorities.includes(priority) ? priority : "medium";

    const validStatuses = ["todo", "in-progress", "done"];
    const resolvedStatus = validStatuses.includes(status) ? status : "todo";

    const newTask = new Task({
      user: req.user.id,
      title: title.trim(),
      description,
      dueDate,
      priority: resolvedPriority,
      status: resolvedStatus,
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
      order: 1,
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
    const { title, description, dueDate, completed, priority, focusToday, status, links } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

    if (!task) return res.status(404).json({ message: "Task not found." });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;

    const validPriorities = ["low", "medium", "high"];
    if (priority !== undefined && validPriorities.includes(priority)) {
      task.priority = priority;
    }

    // ✅ Handle completion status and completedAt timestamp
    if (completed !== undefined) {
      task.completed = completed;
      task.completedAt = completed ? new Date() : null;
      // Update streak when a task is being marked complete
      if (completed) {
        updateStreakForUser(req.user.id).catch((err) =>
          console.error("Streak update failed:", err)
        );
      }
    }

    // ✅ Handle kanban status — keep completed flag in sync
    const validStatuses = ["todo", "in-progress", "done"];
    if (status !== undefined && validStatuses.includes(status)) {
      task.status = status;
      // Moving to "done" column marks complete; moving out resets it
      if (status === "done" && !task.completed) {
        task.completed = true;
        task.completedAt = new Date();
        updateStreakForUser(req.user.id).catch((err) =>
          console.error("Streak update failed:", err)
        );
      } else if (status !== "done" && task.completed) {
        task.completed = false;
        task.completedAt = null;
      }
    }

    if (focusToday !== undefined) task.focusToday = focusToday;

    // ✅ Replace entire links array when provided
    if (links !== undefined && Array.isArray(links)) {
      task.links = links
        .filter(l => l.url && l.url.trim())
        .map(l => ({ url: l.url.trim(), label: (l.label || "").trim() }));
    }

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

// ─── Subtask routes ────────────────────────────────────────────

// 📌 Add Subtask (POST /tasks/:id/subtasks)
router.post("/:id/subtasks", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim())
      return res.status(400).json({ message: "Subtask title is required." });

    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found." });

    task.subtasks.push({ title: title.trim() });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Toggle Subtask Completion (PATCH /tasks/:id/subtasks/:subtaskId)
router.patch("/:id/subtasks/:subtaskId", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found." });

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ message: "Subtask not found." });

    subtask.completed = !subtask.completed;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Delete Subtask (DELETE /tasks/:id/subtasks/:subtaskId)
router.delete("/:id/subtasks/:subtaskId", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found." });

    task.subtasks.pull({ _id: req.params.subtaskId });
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Link routes ────────────────────────────────────────────────

// 📌 Add Link (POST /tasks/:id/links)
router.post("/:id/links", authMiddleware, async (req, res) => {
  try {
    const { url, label } = req.body;
    if (!url || !url.trim())
      return res.status(400).json({ message: "Link URL is required." });

    // Basic URL sanity check
    try { new URL(url.trim()); } catch {
      return res.status(400).json({ message: "Invalid URL." });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found." });

    task.links.push({ url: url.trim(), label: (label || "").trim() });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Delete Link (DELETE /tasks/:id/links/:linkId)
router.delete("/:id/links/:linkId", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found." });

    task.links.pull({ _id: req.params.linkId });
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Reorder Tasks (PATCH /tasks/reorder)
// Body: { orderedIds: ["id1", "id2", ...] }
router.patch("/reorder", authMiddleware, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ message: "orderedIds must be a non-empty array." });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, user: req.user.id },
        update: { $set: { order: index } },
      },
    }));

    await Task.bulkWrite(bulkOps);
    res.json({ message: "Order saved." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
