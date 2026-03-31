"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Todo {
  id: string;
  title: string;
  assigneeName: string | null;
  dueDate: string | null;
  completed: boolean;
}

interface Props {
  projectId: string;
  initialTodos: Todo[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(dateStr: string | null, completed: boolean) {
  if (!dateStr || completed) return false;
  return new Date(dateStr) < new Date();
}

export default function TodoList({ projectId, initialTodos }: Props) {
  const router = useRouter();
  const [todos, setTodos] = useState(initialTodos);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  const open = todos.filter((t) => !t.completed);
  const done = todos.filter((t) => t.completed);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          assigneeName: newAssignee.trim() || null,
          dueDate: newDueDate || null,
        }),
      });
      if (res.ok) {
        const todo = await res.json();
        setTodos((prev) => [
          { ...todo, dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString() : null },
          ...prev,
        ]);
        setNewTitle("");
        setNewAssignee("");
        setNewDueDate("");
        setShowAddForm(false);
      }
    } finally {
      setAdding(false);
    }
  }

  async function toggleComplete(todo: Todo) {
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    if (res.ok) {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
      );
    }
  }

  async function deleteTodo(id: string) {
    if (!confirm("Delete this to-do?")) return;
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditAssignee(todo.assigneeName ?? "");
    setEditDueDate(
      todo.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : ""
    );
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle.trim(),
        assigneeName: editAssignee.trim() || null,
        dueDate: editDueDate || null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                title: updated.title,
                assigneeName: updated.assigneeName,
                dueDate: updated.dueDate ? new Date(updated.dueDate).toISOString() : null,
              }
            : t
        )
      );
      setEditingId(null);
    }
  }

  function TodoRow({ todo }: { todo: Todo }) {
    const overdue = isOverdue(todo.dueDate, todo.completed);

    if (editingId === todo.id) {
      return (
        <li className="py-3 px-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <input
              type="text"
              value={editAssignee}
              onChange={(e) => setEditAssignee(e.target.value)}
              placeholder="Assignee"
              className="w-32 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => saveEdit(todo.id)}
                className="text-sm text-blue-600 font-medium hover:text-blue-800"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </li>
      );
    }

    return (
      <li className="flex items-start gap-3 py-3 group">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleComplete(todo)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <button
            onClick={() => startEdit(todo)}
            className={`text-sm text-left hover:text-blue-600 transition-colors ${
              todo.completed ? "line-through text-gray-400" : "text-gray-800"
            }`}
          >
            {todo.title}
          </button>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            {todo.assigneeName && (
              <span className="text-xs text-gray-500">{todo.assigneeName}</span>
            )}
            {todo.dueDate && (
              <span className={`text-xs ${overdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                {overdue ? "Overdue · " : ""}{formatDate(todo.dueDate)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => deleteTodo(todo.id)}
          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-xs"
        >
          ×
        </button>
      </li>
    );
  }

  return (
    <div>
      {/* Add To-Do Form */}
      <div className="mb-6">
        {showAddForm ? (
          <form onSubmit={addTodo} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                required
              />
              <input
                type="text"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                placeholder="Assignee (optional)"
                className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={adding || !newTitle.trim()}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {adding ? "Adding…" : "Add to-do"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            <span className="text-lg leading-none">+</span> Add To-Do
          </button>
        )}
      </div>

      {/* Open Todos */}
      {open.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Open ({open.length})
          </h3>
          <ul className="divide-y divide-gray-100">
            {open.map((todo) => (
              <TodoRow key={todo.id} todo={todo} />
            ))}
          </ul>
        </div>
      )}

      {/* Completed Todos */}
      {done.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Completed ({done.length})
          </h3>
          <ul className="divide-y divide-gray-100">
            {done.map((todo) => (
              <TodoRow key={todo.id} todo={todo} />
            ))}
          </ul>
        </div>
      )}

      {todos.length === 0 && !showAddForm && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No to-dos yet. Add one above.</p>
        </div>
      )}
    </div>
  );
}
