import { useEffect, useState } from "react";
import { authRequest } from "../api";
import {
  FaCheckCircle,
  FaUndo,
  FaEdit,
  FaTrash,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [expandedTaskIds, setExpandedTaskIds] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortOption, setSortOption] = useState("created_newest");

  const fetchTasks = async () => {
    try {
      const data = await authRequest("tasks", null, "GET");
      setTasks(data);
    } catch (err) {
      alert(err.message || "Failed to fetch tasks.");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await authRequest("tasks", { title, description, dueDate }, "POST");
      setTitle("");
      setDescription("");
      setDueDate("");
      fetchTasks();
    } catch (err) {
      alert(err.message || "Failed to add task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await authRequest(`tasks/${taskId}`, null, "DELETE");
      fetchTasks();
    } catch (err) {
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
      alert(err.message || "Failed to update task completion.");
    }
  };

  const handleUpdateTask = async (taskId) => {
    try {
      await authRequest(
        `tasks/${taskId}`,
        { title: editingTitle, description: editingDescription },
        "PUT"
      );
      setEditingTaskId(null);
      setEditingTitle("");
      setEditingDescription("");
      fetchTasks();
    } catch (err) {
      alert(err.message || "Failed to update task.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const toggleDescription = (taskId) => {
    setExpandedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  let filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  filteredTasks.sort((a, b) => {
    if (sortOption === "created_newest")
      return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOption === "created_oldest")
      return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOption === "due_earliest")
      return new Date(a.dueDate || Infinity) - new Date(b.dueDate || Infinity);
    if (sortOption === "due_latest")
      return new Date(b.dueDate || 0) - new Date(a.dueDate || 0);
    return 0;
  });

  return (
    <>
      {/* ✅ Header */}
      <header className="w-full bg-brand-yellow p-4 flex justify-between items-center shadow-md fixed top-0 left-0 z-50">
        <h1 className="text-2xl font-bold text-brand-dark">2Do</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-brand-dark font-medium hover:brightness-110 transition"
        >
          <FaSignOutAlt className="text-lg" /> Logout
        </button>
      </header>

      <main className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow space-y-4 pt-20">
        {/* ✅ Task Summary */}
        <div className="flex justify-around bg-brand-light p-4 rounded shadow text-center my-4">
          <div>
            <h2 className="text-xl font-bold">{totalTasks}</h2>
            <p className="text-gray-600 text-sm">Total</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-600">
              {completedTasks}
            </h2>
            <p className="text-gray-600 text-sm">Completed</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-yellow-500">
              {pendingTasks}
            </h2>
            <p className="text-gray-600 text-sm">Pending</p>
          </div>
        </div>

        {/* ✅ Filter & Sort */}
        <div className="flex justify-between mb-4 gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded text-sm w-1/2"
          >
            <option value="all">All Tasks</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="p-2 border rounded text-sm w-1/2"
          >
            <option value="created_newest">Created Date (Newest)</option>
            <option value="created_oldest">Created Date (Oldest)</option>
            <option value="due_earliest">Due Date (Earliest)</option>
            <option value="due_latest">Due Date (Latest)</option>
          </select>
        </div>

        {/* ✅ Add Task Form */}
        <form onSubmit={handleAddTask} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Task Title..."
            className="p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description (optional)..."
            className="p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <input
            type="date"
            className="p-2 border rounded"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button className="bg-brand-yellow text-brand-dark py-2 rounded font-semibold hover:brightness-110 transition">
            Add Task
          </button>
        </form>

        {/* ✅ Task List */}
        <ul className="space-y-2">
          {filteredTasks.map((task) => {
            const isExpanded = expandedTaskIds.includes(task._id);

            return (
              <li
                key={task._id}
                className={`flex flex-col p-4 border rounded space-y-2 ${
                  task.completed ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <div className="flex justify-between items-start">
                  {editingTaskId === task._id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="flex-grow p-1 border rounded mr-2"
                    />
                  ) : (
                    <span
                      className={`font-semibold ${
                        task.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                  )}

                  <div className="flex gap-2">
                    {editingTaskId === task._id ? (
                      <>
                        <button
                          onClick={() => handleUpdateTask(task._id)}
                          title="Save"
                        >
                          <FaCheckCircle className="text-green-600 text-lg" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTaskId(null);
                            setEditingTitle("");
                            setEditingDescription("");
                          }}
                          title="Cancel"
                        >
                          <FaUndo className="text-gray-500 text-lg" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            toggleTaskCompletion(task._id, task.completed)
                          }
                          title={task.completed ? "Undo" : "Complete"}
                        >
                          <FaCheckCircle
                            className={`text-lg ${
                              task.completed
                                ? "text-gray-500"
                                : "text-green-600"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTaskId(task._id);
                            setEditingTitle(task.title);
                            setEditingDescription(task.description || "");
                          }}
                          title="Edit"
                        >
                          <FaEdit className="text-yellow-500 text-lg" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          title="Delete"
                        >
                          <FaTrash className="text-red-500 text-lg" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {editingTaskId === task._id ? (
                  <textarea
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    className="p-2 border rounded text-sm"
                    rows={2}
                  ></textarea>
                ) : (
                  task.description && (
                    <p className="text-sm text-gray-600 pl-2 break-words">
                      {isExpanded
                        ? task.description
                        : `${task.description.slice(0, 100)}`}
                      {task.description.length > 100 && (
                        <button
                          onClick={() => toggleDescription(task._id)}
                          className="ml-2 text-brand-yellow underline text-xs"
                        >
                          {isExpanded ? "View Less" : "View More"}
                        </button>
                      )}
                    </p>
                  )
                )}

                {/* Dates */}
                {task.dueDate && (
                  <p className="text-xs text-gray-500 pl-2">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
                {task.completed && task.completedAt && (
                  <p className="text-xs text-green-600 pl-2">
                    Completed on:{" "}
                    {new Date(task.completedAt).toLocaleDateString()}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
