import { useState, useEffect } from 'react';

/**
 * Vibecoding Project Tracker — starter scaffold.
 * 
 *  * This file is intentionally almost empty. The boilerplate (Vite, React,
 * Tailwind) is configured for you, plus a few shared constants and a
 * localStorage helper. Everything visible on screen, you build.
 *
 * Where to start (build sequence in Phase 3):
 *   - M4  data-model    : render the four columns and the task cards below.
 *   - M5  crud-modal    : add the "+" button modal and the edit-on-click modal.
 *   - M6  tag-style     : feature vs. bug color coding (uses DESIGN.md §2 colors).
 *   - M7  task-owner    : assignee badge + "Hand off to..." dropdown.
 *   - M8  due-tint      : color cards by due date (uses DESIGN.md §2 due-state colors).
 *   - M9  context       : a curated Context briefing field on the modal.
 *   - M10 copy-prompt   : a "Copy as Prompt Context" button that serializes the task + context.
 *   - M11 anchors       : the Anchor Board above the Kanban.
 *   - M12 secret-sauce  : the one open-ended thing that makes your tracker yours.
 *
 * Search the file for `TODO M<n>` to find the right hook for each milestone.
 *
 * Implemented here: M4 (data-model) and M5 (crud-modal).
 * Remaining milestones are still marked with `TODO M<n>` comments.
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'feature'|'bug'} type
 * @property {'todo'|'in-progress'|'review'|'done'} status
 * @property {string} assignee
 * @property {string|null} dueDate     ISO 'YYYY-MM-DD'
 * @property {string} createdDate      ISO 'YYYY-MM-DD'
 */

// The four columns of the board, in render order.
// Use these IDs everywhere — do not invent new ones.
export const STAGES = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];

// Replace these placeholders with the three names from PRD §8.
// They are the only valid values for `Task.assignee`.
export const TEAM = ['Teammate A', 'Teammate B', 'Teammate C'];

/**
 * A tiny localStorage hook — survives reloads, no library needed.
 *
 * Usage:
 *   const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', []);
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private-mode error — silently ignore for hackathon */
    }
  }, [key, value]);

  return [value, setValue];
}

/* ---------- helpers & seed data ---------- */

const isoDay = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

/** @type {Task[]} */
const SEED_TASKS = [
  {
    id: 'task-1',
    title: 'Add user login page',
    description: 'Build the sign-in form with email and password validation.',
    type: 'feature',
    status: 'todo',
    assignee: TEAM[0],
    dueDate: isoDay(7),
    createdDate: isoDay(-2),
  },
  {
    id: 'task-2',
    title: 'Fix broken checkout button',
    description: 'The checkout button does nothing on Safari when the cart has more than 10 items.',
    type: 'bug',
    status: 'in-progress',
    assignee: TEAM[1],
    dueDate: isoDay(2),
    createdDate: isoDay(-5),
  },
  {
    id: 'task-3',
    title: 'Dark mode toggle',
    description: 'Add a theme switch to the settings menu and remember the choice.',
    type: 'feature',
    status: 'review',
    assignee: TEAM[2],
    dueDate: isoDay(4),
    createdDate: isoDay(-8),
  },
];

/*
 * Palette (applied as Tailwind arbitrary values):
 *   brandPrimary  #3E3C6B   buttons, card borders, column tint
 *   brandAccent   #4F4C8A   hover, focus, column top borders, feature badge
 *   surfacePage   #000000   page background
 *   surfaceCard   #2B2B2B   cards, modal, count pills
 *   textPrimary   #FFFFFF   titles and main text
 *   textMuted     #999696   labels, descriptions, timestamps
 */
const TYPE_STYLES = {
  feature: 'bg-[#4F4C8A] text-white',
  bug: 'bg-rose-500/20 text-rose-300',
};

const STAGE_ACCENT = {
  'todo': 'border-[#4F4C8A]',
  'in-progress': 'border-[#4F4C8A]',
  'review': 'border-[#4F4C8A]',
  'done': 'border-[#4F4C8A]',
};

const formatDate = (iso) =>
  iso
    ? new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'None';

const EMPTY_TASK = {
  title: '',
  description: '',
  type: 'feature',
  status: 'todo',
  assignee: TEAM[0],
  dueDate: '',
};

/* ---------- components ---------- */

function TaskCard({ task, onOpen, onDragStart }) {
  const overdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate + 'T23:59:59') < new Date();

  return (
    <article
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onOpen(task)}
      className="cursor-pointer rounded-lg border border-[#3E3C6B] bg-[#2B2B2B] p-3 shadow-sm hover:border-[#4F4C8A]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-white">{task.title}</h3>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[task.type]}`}>
          {task.type === 'bug' ? 'Bug' : 'Feature'}
        </span>
      </div>

      {task.description && <p className="mt-2 text-sm text-[#999696]">{task.description}</p>}

      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-white">
        <dt className="text-[#999696]">Assignee</dt>
        <dd>{task.assignee || 'Unassigned'}</dd>
        <dt className="text-[#999696]">Due</dt>
        <dd className={overdue ? 'font-semibold text-rose-400' : ''}>
          {formatDate(task.dueDate)}
          {overdue && ' (overdue)'}
        </dd>
        <dt className="text-[#999696]">Created</dt>
        <dd className="text-[#999696]">{formatDate(task.createdDate)}</dd>
      </dl>
    </article>
  );
}

function Column({ stage, tasks, onOpen, onDragStart, onDropTask }) {
  const [over, setOver] = useState(false);

  return (
    <section
      aria-label={stage.label}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        setOver(false);
        onDropTask(e, stage.id);
      }}
      className={`flex min-h-[200px] flex-col rounded-xl border-t-4 p-3 transition-colors ${
        STAGE_ACCENT[stage.id]
      } ${over ? 'bg-[#3E3C6B]/40' : 'bg-[#3E3C6B]/20'}`}
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-white">{stage.label}</h2>
        <span className="rounded-full bg-[#2B2B2B] px-2 py-0.5 text-xs font-medium text-[#999696]">
          {tasks.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onOpen={onOpen} onDragStart={onDragStart} />
        ))}
        {tasks.length === 0 && (
          <p className="rounded-lg border border-dashed border-[#999696]/50 p-4 text-center text-sm text-[#999696]">
            No tasks here. Drag one in or add a new task.
          </p>
        )}
      </div>
    </section>
  );
}

const fieldClass =
  'mt-1 w-full rounded-md border border-[#3E3C6B] bg-[#000000] px-3 py-2 text-sm text-white [color-scheme:dark] focus:border-[#4F4C8A] focus:outline-none focus:ring-2 focus:ring-[#4F4C8A]/50';

function TaskModal({ task, onSave, onDelete, onClose }) {
  const isEdit = Boolean(task.id);
  const [form, setForm] = useState(task);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, title: form.title.trim(), dueDate: form.dueDate || null });
  };

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-xl border border-[#3E3C6B] bg-[#2B2B2B] p-6 shadow-xl"
      >
        <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit task' : 'New task'}</h2>

        <label className="block text-sm font-medium text-[#999696]">
          Title
          <input autoFocus required value={form.title} onChange={set('title')} className={fieldClass} />
        </label>

        <label className="block text-sm font-medium text-[#999696]">
          Description
          <textarea rows={3} value={form.description} onChange={set('description')} className={fieldClass} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-[#999696]">
            Type
            <select value={form.type} onChange={set('type')} className={fieldClass}>
              <option value="feature">Feature</option>
              <option value="bug">Bug</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-[#999696]">
            Status
            <select value={form.status} onChange={set('status')} className={fieldClass}>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-[#999696]">
            Assignee
            <select value={form.assignee} onChange={set('assignee')} className={fieldClass}>
              {TEAM.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-[#999696]">
            Due date
            <input type="date" value={form.dueDate ?? ''} onChange={set('dueDate')} className={fieldClass} />
          </label>
        </div>

        {isEdit && (
          <p className="text-xs text-[#999696]">Created {formatDate(form.createdDate)}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          {isEdit ? (
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="rounded-md px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10"
            >
              Delete task
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-[#999696] hover:bg-[#3E3C6B]/30 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#3E3C6B] px-4 py-2 text-sm font-medium text-white hover:bg-[#4F4C8A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F4C8A]"
            >
              {isEdit ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ---------- app ---------- */

export default function App() {
  // M4 data-model
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);

  // M5 crud-modal: null = closed, otherwise the task (or blank draft) being edited
  const [editing, setEditing] = useState(null);

  // TODO M11 anchors:
  //   const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', [...]);

  const saveTask = (data) => {
    if (data.id) {
      setTasks(tasks.map((t) => (t.id === data.id ? { ...t, ...data } : t)));
    } else {
      setTasks([...tasks, { ...data, id: crypto.randomUUID(), createdDate: isoDay(0) }]);
    }
    setEditing(null);
  };

  const deleteTask = (id) => {
    if (window.confirm('Delete this task?')) {
      setTasks(tasks.filter((t) => t.id !== id));
      setEditing(null);
    }
  };

  const onDragStart = (e, id) => e.dataTransfer.setData('text/plain', id);

  const onDropTask = (e, status) => {
    const id = e.dataTransfer.getData('text/plain');
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  return (
    <div className="min-h-screen bg-[#000000] p-6">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vibecoding Project Tracker</h1>
          <p className="text-sm text-[#999696]">
            {/* Replace this line with your team name from PRD §11. */}
            Team starter
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY_TASK })}
          aria-label="Add task"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3E3C6B] text-2xl leading-none text-white hover:bg-[#4F4C8A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F4C8A]"
        >
          +
        </button>
      </header>

      {/* TODO M11 anchors: render the Anchor Board (Presentation / Demo / Report / Documentation) above the board. */}

      <main className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            tasks={tasks.filter((t) => t.status === stage.id)}
            onOpen={setEditing}
            onDragStart={onDragStart}
            onDropTask={onDropTask}
          />
        ))}
      </main>

      {editing && (
        <TaskModal
          task={editing}
          onSave={saveTask}
          onDelete={deleteTask}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
