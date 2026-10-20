import { useState, useEffect } from 'react';

/**
 * Vibecoding Project Tracker — starter scaffold.
 *
 * Implemented here: M4 (data-model), M5 (crud-modal) and the card colouring/icons from M6 (tag-style).
 * Remaining milestones are still marked with `TODO M<n>` comments.
 *
 * Colours are Tailwind arbitrary values, so they work without any tailwind.config.js changes.
 * Palette: brandPrimary #3E3C6B, brandAccent #4F4C8A, surfacePage #000000, surfaceCard #2B2B2B,
 * textPrimary #FFFFFF, textMuted #999696, feature #10B981, bug #DC2626.
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

const EMPTY_TASK = {
  title: '',
  description: '',
  type: 'feature',
  status: 'todo',
  assignee: TEAM[0],
  dueDate: '',
};

const formatDate = (iso) =>
  iso
    ? new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'None';

/* ---------- M6 tag-style: card colour + icon per type ---------- */

// Feature cards are emerald, bug cards are crimson.
// Text is dark on the light emerald and white on the crimson so it stays readable.
const TYPE_STYLES = {
  feature: { label: 'Feature', card: 'bg-[#10B981]', text: 'text-black', muted: 'text-black/70' },
  bug:     { label: 'Bug',     card: 'bg-[#DC2626]',     text: 'text-white', muted: 'text-white/80' },
};

function CogIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function BugIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="8" height="12" rx="4" />
      <path d="M9 4l2 4M15 4l-2 4M8 12H4M16 12h4M8 17l-3 2M16 17l3 2" />
    </svg>
  );
}

/* ---------- components ---------- */

function TaskCard({ task, onOpen, onDragStart }) {
  const style = TYPE_STYLES[task.type];
  const Icon = task.type === 'bug' ? BugIcon : CogIcon;
  const overdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate + 'T23:59:59') < new Date();

  return (
    <article
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onOpen(task)}
      className={`cursor-pointer rounded-lg border border-white/20 p-3 shadow-sm hover:border-white/60 ${style.card} ${style.text}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug">{task.title}</h3>
        <span
          role="img"
          aria-label={style.label}
          title={style.label}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-black/30 text-white"
        >
          <Icon />
        </span>
      </div>

      {task.description && <p className={`mt-2 text-sm ${style.muted}`}>{task.description}</p>}

      <dl className={`mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs ${style.muted}`}>
        <dt>Assignee</dt>
        <dd className={style.text}>{task.assignee || 'Unassigned'}</dd>
        <dt>Due</dt>
        <dd className={`${style.text} ${overdue ? 'font-bold underline' : ''}`}>
          {formatDate(task.dueDate)}
          {overdue && ' (overdue)'}
        </dd>
        <dt>Created</dt>
        <dd>{formatDate(task.createdDate)}</dd>
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
      className={`flex min-h-[200px] flex-col rounded-xl border-t-4 border-[#4F4C8A] p-3 transition-colors ${
        over ? 'bg-[#3E3C6B]/40' : 'bg-[#3E3C6B]/20'
      }`}
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#FFFFFF]">{stage.label}</h2>
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
  'mt-1 w-full rounded-md border border-[#3E3C6B] bg-[#000000] px-3 py-2 text-sm text-[#FFFFFF] [color-scheme:dark] focus:border-[#4F4C8A] focus:outline-none focus:ring-2 focus:ring-[#4F4C8A]/50';

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
        <h2 className="text-lg font-bold text-[#FFFFFF]">{isEdit ? 'Edit task' : 'New task'}</h2>

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

        {isEdit && <p className="text-xs text-[#999696]">Created {formatDate(form.createdDate)}</p>}

        <div className="flex items-center justify-between pt-2">
          {isEdit ? (
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="rounded-md px-3 py-2 text-sm font-medium text-[#DC2626] hover:bg-[#DC2626]/10"
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
              className="rounded-md px-4 py-2 text-sm font-medium text-[#999696] hover:bg-[#3E3C6B]/30 hover:text-[#FFFFFF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#3E3C6B] px-4 py-2 text-sm font-medium text-[#FFFFFF] hover:bg-[#4F4C8A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F4C8A]"
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
          <h1 className="text-2xl font-bold text-[#FFFFFF]">Vibecoding Project Tracker</h1>
          <p className="text-sm text-[#999696]">
            {/* Replace this line with your team name from PRD §11. */}
            Team starter
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY_TASK })}
          aria-label="Add task"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3E3C6B] text-2xl leading-none text-[#FFFFFF] hover:bg-[#4F4C8A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F4C8A]"
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
