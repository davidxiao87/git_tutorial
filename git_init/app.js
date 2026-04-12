(function () {
  "use strict";

  const STORAGE_KEY = "todo-app-tasks";
  const addForm = document.getElementById("add-form");
  const taskInput = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");
  const taskTemplate = document.getElementById("task-template");
  const taskCountEl = document.getElementById("task-count");
  const clearCompletedBtn = document.getElementById("clear-completed");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let tasks = loadTasks();
  let filter = "all";

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((t) => ({
        id: String(t.id || crypto.randomUUID()),
        text: String(t.text || "").slice(0, 500),
        done: Boolean(t.done),
      }));
    } catch {
      return [];
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function getFilteredTasks() {
    if (filter === "active") return tasks.filter((t) => !t.done);
    if (filter === "completed") return tasks.filter((t) => t.done);
    return tasks;
  }

  function updateCount() {
    const active = tasks.filter((t) => !t.done).length;
    const total = tasks.length;
    if (total === 0) {
      taskCountEl.textContent = "";
    } else {
      taskCountEl.textContent = `共 ${total} 项，未完成 ${active} 项`;
    }
    const hasCompleted = tasks.some((t) => t.done);
    clearCompletedBtn.hidden = !hasCompleted;
  }

  function render() {
    taskList.replaceChildren();
    const list = getFilteredTasks();

    for (const task of list) {
      const node = taskTemplate.content.firstElementChild.cloneNode(true);
      const checkbox = node.querySelector(".task-checkbox");
      const textSpan = node.querySelector(".task-text");
      const deleteBtn = node.querySelector(".delete-btn");

      checkbox.checked = task.done;
      checkbox.dataset.id = task.id;
      textSpan.textContent = task.text;
      if (task.done) node.classList.add("is-done");
      deleteBtn.dataset.id = task.id;

      taskList.appendChild(node);
    }

    updateCount();
  }

  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    tasks.unshift({
      id: crypto.randomUUID(),
      text,
      done: false,
    });
    taskInput.value = "";
    saveTasks();
    render();
    taskInput.focus();
  });

  taskList.addEventListener("change", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") return;
    const id = target.dataset.id;
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.done = target.checked;
      saveTasks();
      render();
    }
  });

  taskList.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-btn");
    if (!btn || !btn.dataset.id) return;
    const id = btn.dataset.id;
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
  });

  clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter((t) => !t.done);
    saveTasks();
    render();
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      if (!f || f === filter) return;
      filter = f;
      filterButtons.forEach((b) => {
        const active = b.dataset.filter === filter;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      render();
    });
  });

  render();
  taskInput.focus();
})();
