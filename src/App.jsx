import { useState, useEffect } from 'react';

/**
 * TrackIt — Vibecoding Project Tracker.
 *
 * Implemented: M4 data-model, M5 crud-modal, M6 tag-style (type stripe + icons),
 * M8 due-tint (card colour + tag by due date) and the M7 handoff toast (fires when an assignee changes).
 * Still open: M7 "Hand off to..." dropdown, M9 context, M10 copy-prompt,
 * M11 anchors, M12 secret-sauce. Search for `TODO M<n>`.
 *
 * Colours are Tailwind arbitrary values, so no tailwind.config.js changes are needed.
 * Palette: brandPrimary #3E3C6B, brandAccent #4F4C8A, surfacePage #000000, surfaceCard #2B2B2B,
 * textPrimary #FFFFFF, textMuted #999696, feature #10B981, bug #DC2626,
 * dueSafe #2B2B2B, dueWarning #C9900E, overdue #A6170A, done #0AA1A6.
 *
 * Type scale: page title 24px semibold · section header 16px semibold uppercase ·
 * card title 14px medium · body 14px regular · caption 12px regular muted.
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

/* ---------- voice / microcopy ---------- */

const COPY = {
  addTask: 'Add Task',
  emptyColumn: 'Nothing here yet',
  confirmDelete: "Are you sure? You can't undo this",
  handoff: (name) => `Handed off to ${name}, its their problem now`,
  // TODO M10 copy-prompt toast: 'Copied Successfully!'
};

/* ---------- helpers & seed data ---------- */

const isoDay = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDate = (iso) =>
  iso
    ? new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'None';

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
    dueDate: isoDay(1),
    createdDate: isoDay(-5),
  },
  {
    id: 'task-3',
    title: 'Dark mode toggle',
    description: 'Add a theme switch to the settings menu and remember the choice.',
    type: 'feature',
    status: 'review',
    assignee: TEAM[2],
    dueDate: isoDay(-1),
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

/* ---------- M6 tag-style: type stripe + icon chip ---------- */

// The left stripe and icon chip carry the feature (emerald) / bug (crimson) colour.
const TYPE_STYLES = {
  feature: { label: 'Feature', stripe: 'border-l-[#10B981]', chip: 'bg-[#10B981] text-black' },
  bug:     { label: 'Bug',     stripe: 'border-l-[#DC2626]', chip: 'bg-[#DC2626] text-white' },
};

/* ---------- M8 due-tint: card colour + tag by due date ---------- */

// done → done; past due → overdue; due today or tomorrow (under 2 days) → warning; otherwise safe.
function dueState(task) {
  if (task.status === 'done') return 'done';
  if (!task.dueDate) return 'safe';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(task.dueDate + 'T00:00:00');
  const daysLeft = Math.round((due - today) / 86400000);
  if (daysLeft < 0) return 'overdue';
  if (daysLeft < 2) return 'warning';
  return 'safe';
}

// Text is black on the amber and turquoise cards so it stays readable.
const DUE_STYLES = {
  safe:    { card: 'bg-[#2B2B2B]', text: 'text-white', muted: 'text-[#999696]', tag: null },
  warning: { card: 'bg-[#C9900E]', text: 'text-black', muted: 'text-black/70',   tag: 'Due soon' },
  overdue: { card: 'bg-[#A6170A]', text: 'text-white', muted: 'text-white/80',   tag: 'Overdue!' },
  done:    { card: 'bg-[#0AA1A6]', text: 'text-black', muted: 'text-black/70',   tag: 'Complete' },
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

// Drag affordance: six dots.
function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      {[8, 16].flatMap((x) =>
        [5, 12, 19].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />)
      )}
    </svg>
  );
}

/* ---------- components ---------- */

function TaskCard({ task, onOpen, onDragStart }) {
  const type = TYPE_STYLES[task.type];
  const Icon = task.type === 'bug' ? BugIcon : CogIcon;
  const due = DUE_STYLES[dueState(task)];

  return (
    <article
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onOpen(task)}
      className={`cursor-pointer rounded-md border border-l-4 border-white/20 ${type.stripe} p-3 transition-shadow hover:shadow-lg hover:shadow-black/60 ${due.card} ${due.text}`}
    >
      <div className="flex items-start gap-2">
        <span title="Drag to move" className={`mt-0.5 shrink-0 cursor-grab ${due.muted}`}>
          <GripIcon />
        </span>
        <h3 className="flex-1 text-sm font-medium leading-snug">{task.title}</h3>
        <span
          role="img"
          aria-label={type.label}
          title={type.label}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${type.chip}`}
        >
          <Icon />
        </span>
      </div>

      {task.description && <p className={`mt-2 text-sm ${due.muted}`}>{task.description}</p>}

      <dl className={`mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs ${due.muted}`}>
        <dt>Assignee</dt>
        <dd className={due.text}>{task.assignee || 'Unassigned'}</dd>
        <dt>Due</dt>
        <dd className={due.text}>{formatDate(task.dueDate)}</dd>
        <dt>Created</dt>
        <dd>{formatDate(task.createdDate)}</dd>
      </dl>

      {due.tag && (
        <span className="mt-3 inline-block rounded-md bg-black/30 px-2 py-0.5 text-xs font-medium text-white">
          {due.tag}
        </span>
      )}
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
      className={`flex min-h-[200px] flex-col rounded-md border-t-4 border-[#4F4C8A] p-3 transition-colors ${
        over ? 'bg-[#3E3C6B]/40' : 'bg-[#3E3C6B]/20'
      }`}
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold uppercase text-[#FFFFFF]">{stage.label}</h2>
        <span className="rounded-full bg-[#2B2B2B] px-2 py-0.5 text-xs text-[#999696]">
          {tasks.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onOpen={onOpen} onDragStart={onDragStart} />
        ))}
        {tasks.length === 0 && (
          <p className="rounded-md border border-dashed border-[#999696]/50 p-4 text-center text-sm text-[#999696]">
            {COPY.emptyColumn}
          </p>
        )}
      </div>
    </section>
  );
}

const fieldClass =
  'mt-1 w-full rounded-md border border-[#3E3C6B] bg-[#000000] px-3 py-2 text-sm text-[#FFFFFF] [color-scheme:dark] focus:border-[#4F4C8A] focus:outline-none focus:ring-2 focus:ring-[#4F4C8A]/50';

const labelClass = 'block text-xs text-[#999696]';

const buttonFocus =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F4C8A]';

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
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-md border border-white/20 bg-[#2B2B2B] p-6"
      >
        <h2 className="text-base font-semibold uppercase text-[#FFFFFF]">
          {isEdit ? 'Edit task' : 'New task'}
        </h2>

        <label className={labelClass}>
          Title
          <input autoFocus required value={form.title} onChange={set('title')} className={fieldClass} />
        </label>

        <label className={labelClass}>
          Description
          <textarea rows={3} value={form.description} onChange={set('description')} className={fieldClass} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Type
            <select value={form.type} onChange={set('type')} className={fieldClass}>
              <option value="feature">Feature</option>
              <option value="bug">Bug</option>
            </select>
          </label>
          <label className={labelClass}>
            Status
            <select value={form.status} onChange={set('status')} className={fieldClass}>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Assignee
            <select value={form.assignee} onChange={set('assignee')} className={fieldClass}>
              {TEAM.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Due date
            <input type="date" value={form.dueDate ?? ''} onChange={set('dueDate')} className={fieldClass} />
          </label>
        </div>

        {/* TODO M9 context: add a curated "Context" briefing textarea here. */}

        {isEdit && <p className="text-xs text-[#999696]">Created {formatDate(form.createdDate)}</p>}

        <div className="flex items-center justify-between pt-2">
          {isEdit ? (
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className={`rounded-md bg-[#A6170A] px-4 py-2 text-sm text-[#FFFFFF] hover:opacity-90 ${buttonFocus}`}
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-md bg-[#000000] px-4 py-2 text-sm text-[#FFFFFF] hover:bg-[#3E3C6B]/50 ${buttonFocus}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`rounded-md bg-[#3E3C6B] px-4 py-2 text-sm text-[#FFFFFF] hover:bg-[#4F4C8A] ${buttonFocus}`}
            >
              {isEdit ? 'Save changes' : COPY.addTask}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* Pop-up message that clears itself after a few seconds (or when clicked). */
function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onDismiss}
      className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 cursor-pointer rounded-md border border-white/20 bg-[#4F4C8A] px-4 py-3 text-sm text-[#FFFFFF] shadow-lg shadow-black/60"
    >
      {toast.text}
    </div>
  );
}

/* ---------- app ---------- */

export default function App() {
  // M4 data-model
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);

  // M5 crud-modal: null = closed, otherwise the task (or blank draft) being edited
  const [editing, setEditing] = useState(null);

  // Toast pop-up: null or { id, text }
  const [toast, setToast] = useState(null);
  const showToast = (text) => setToast({ id: Date.now(), text });

  // TODO M11 anchors:
  //   const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', [...]);

  const saveTask = (data) => {
    if (data.id) {
      const previous = tasks.find((t) => t.id === data.id);
      setTasks(tasks.map((t) => (t.id === data.id ? { ...t, ...data } : t)));
      // M7 handoff toast: only when an existing task's assignee actually changes
      if (previous && previous.assignee !== data.assignee) {
        showToast(COPY.handoff(data.assignee));
      }
    } else {
      setTasks([...tasks, { ...data, id: crypto.randomUUID(), createdDate: isoDay(0) }]);
    }
    setEditing(null);
  };

  const deleteTask = (id) => {
    if (window.confirm(COPY.confirmDelete)) {
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
    <div className="min-h-screen bg-[#000000] p-6 text-[#FFFFFF]">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#3E3C6B]">TrackIt</h1>
          <p className="text-xs text-[#999696]">
            {/* Replace this line with your team name from PRD §11. */}
            Team starter
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY_TASK })}
          className={`rounded-md bg-[#3E3C6B] px-4 py-2 text-sm text-[#FFFFFF] hover:bg-[#4F4C8A] ${buttonFocus}`}
        >
          + {COPY.addTask}
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

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
