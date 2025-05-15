import { useEffect, useState } from "react";
import { authRequest } from "../api";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const fetchTasks = async () => {
    try {
      const data = await authRequest("tasks", null, "GET");
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      alert(err.message || "Failed to fetch tasks.");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await authRequest("tasks", { title }, "POST");
      setTitle("");
      fetchTasks();
    } catch (err) {
      console.error("Failed to add task:", err);
      alert(err.message || "Failed to add task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmed) return;

    try {
      await authRequest(`tasks/${taskId}`, null, "DELETE");
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert(err.message || "Failed to delete task.");
    }
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      await authRequest(
        `tasks/${taskId}`,
        { completed: !currentStatus },
        "PUT"
      );
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task completion:", err);
      alert(err.message || "Failed to update task completion.");
    }
  };

  const handleUpdateTask = async (taskId) => {
    try {
      await authRequest(`tasks/${taskId}`, { title: editingTitle }, "PUT");
      setEditingTaskId(null);
      setEditingTitle("");
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task title:", err);
      alert(err.message || "Failed to update task title.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow space-y-4">
      <h1 className="text-3xl font-bold text-primary text-center">My Tasks</h1>

      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter a new task..."
          className="flex-grow p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600">
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task._id}
            className={`flex justify-between items-center p-2 border rounded ${
              task.completed ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            {editingTaskId === task._id ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="flex-grow p-1 border rounded mr-2"
              />
            ) : (
              <span
                className={task.completed ? "line-through text-gray-500" : ""}
              >
                {task.title}
              </span>
            )}

            <div className="flex gap-2">
              {editingTaskId === task._id ? (
                <>
                  <button
                    onClick={() => handleUpdateTask(task._id)}
                    className="text-sm text-green-500 underline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingTaskId(null);
                      setEditingTitle("");
                    }}
                    className="text-sm text-gray-500 underline"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() =>
                      toggleTaskCompletion(task._id, task.completed)
                    }
                    className="text-sm text-primary underline"
                  >
                    {task.completed ? "Undo" : "Complete"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingTaskId(task._id);
                      setEditingTitle(task.title);
                    }}
                    className="text-sm text-yellow-500 underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="text-sm text-red-500 underline"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
