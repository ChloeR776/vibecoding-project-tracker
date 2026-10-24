import { useState, useEffect } from 'react';

/**
 * TrackIt — Vibecoding Project Tracker.
 *
 * Implemented: M4 data-model, M5 crud-modal, M6 tag-style (type stripe + icons),
 * M8 due-tint (card colour + tag by due date), M9 context (Markdown briefing,
 * AI tool, last-updated timestamp), M10 copy-prompt (Copy context button),
 * M11 anchors (pinned deliverables banner) and the M7 handoff toast (fires when an assignee changes).
 * Still open: M7 "Hand off to..." dropdown,
 * M12 secret-sauce. Search for `TODO M<n>`.
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
 * @property {string} context          Markdown briefing (Background, Constraints, ...)
 * @property {string} aiTool           one of AI_TOOLS
 * @property {string|null} contextUpdated  ISO timestamp of the last change to `context`
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

// Options for the "AI tool used" dropdown on the Context section.
export const AI_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

// Pre-filled into the Context field of every new task.
export const CONTEXT_TEMPLATE = `## Background

## Constraints

## Tried so far

## Pick up
`;

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
  copyContext: 'Copy context',
  copied: 'Copied Successfully!',
  nothingToCopy: "Sorry, there's nothing to copy here",
  copyFailed: "Couldn't copy. Select the text and copy it by hand",
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

const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
    aiTool: 'Claude',
    contextUpdated: hoursAgo(26),
    context: `## Background
Users have no way to sign in, so nothing is saved between visits.

## Constraints
- Email and password only for now
- Reuse the existing form components

## Tried so far
Nothing yet.

## Pick up
Start with the form layout, then add validation.
`,
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
    aiTool: 'Cursor',
    contextUpdated: hoursAgo(5),
    context: `## Background
Checkout button does nothing in Safari when the cart has more than 10 items.

## Constraints
- Must not change the cart data shape

## Tried so far
- Reproduced on Safari 17 only
- Click handler fires, but the request never sends

## Pick up
Check the request payload size limit in the checkout call.
`,
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
    aiTool: 'ChatGPT',
    contextUpdated: hoursAgo(50),
    context: `## Background
People want a dark theme that remembers their choice.

## Constraints
- Use Tailwind colour tokens, no new libraries

## Tried so far
Toggle works, but the choice is lost on reload.

## Pick up
Persist the theme with the useLocalStorage hook.
`,
  },
];

const EMPTY_TASK = {
  title: '',
  description: '',
  type: 'feature',
  status: 'todo',
  assignee: TEAM[0],
  dueDate: '',
  context: CONTEXT_TEMPLATE,
  aiTool: AI_TOOLS[0],
  contextUpdated: null,
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

/* ---------- M10 copy-prompt: turn a task into a briefing to paste into an AI tool ---------- */

// Drops template headings with nothing under them, so an untouched template doesn't clutter
// the paste. Anything the person has typed (even on a heading line) is kept.
const EMPTY_TEMPLATE_HEADING = /^#{1,6}\s+(Background|Constraints|Tried so far|Pick up)\s*$/i;

function cleanContext(markdown = '') {
  return markdown
    .split(/^(?=#{1,6}\s)/m)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk && !EMPTY_TEMPLATE_HEADING.test(chunk))
    .join('\n\n');
}

function buildBriefing(task) {
  const stage = STAGES.find((s) => s.id === task.status)?.label ?? task.status;
  const details = [
    `Type: ${TYPE_STYLES[task.type]?.label ?? task.type}`,
    `Status: ${stage}`,
    task.dueDate && `Due: ${formatDate(task.dueDate)}`,
    task.assignee && `Assignee: ${task.assignee}`,
  ].filter(Boolean);

  const parts = [
    "Here is the briefing for a task I'm working on.",
    `Task: ${task.title}\n${details.join('\n')}`,
  ];
  if (task.description?.trim()) parts.push(`Description:\n${task.description.trim()}`);
  const context = cleanContext(task.context);
  if (context) parts.push(`Context:\n\n${context}`);
  return parts.join('\n\n') + '\n';
}

function ClipboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

/* ---------- components ---------- */

function TaskCard({ task, onOpen, onDragStart, onCopy }) {
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
        {task.aiTool && (
          <>
            <dt>AI tool</dt>
            <dd className={due.text}>{task.aiTool}</dd>
          </>
        )}
      </dl>

      <div className="mt-3 flex items-center justify-between gap-2">
        {due.tag ? (
          <span className="rounded-md bg-black/30 px-2 py-0.5 text-xs font-medium text-white">
            {due.tag}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          aria-label={`${COPY.copyContext}: ${task.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onCopy(task);
          }}
          className={`flex items-center gap-1 rounded-md bg-black/30 px-2 py-1 text-xs font-medium text-white hover:bg-black/50 ${buttonFocus}`}
        >
          <ClipboardIcon />
          {COPY.copyContext}
        </button>
      </div>
    </article>
  );
}

function Column({ stage, tasks, onOpen, onDragStart, onDropTask, onCopy }) {
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
          <TaskCard key={t.id} task={t} onOpen={onOpen} onDragStart={onDragStart} onCopy={onCopy} />
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

function TaskModal({ task, onSave, onDelete, onClose, onCopy }) {
  const isEdit = Boolean(task.id);
  // Defaults cover tasks saved before the Context fields existed.
  const [form, setForm] = useState({ context: '', aiTool: AI_TOOLS[0], contextUpdated: null, ...task });
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
        className="max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-md border border-white/20 bg-[#2B2B2B] p-6"
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

        {/* M9 context */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold uppercase text-[#FFFFFF]">Context</h3>
            <button
              type="button"
              onClick={() => onCopy(form)}
              className={`flex items-center gap-1 rounded-md bg-[#3E3C6B] px-3 py-1.5 text-xs text-[#FFFFFF] hover:bg-[#4F4C8A] ${buttonFocus}`}
            >
              <ClipboardIcon />
              {COPY.copyContext}
            </button>
          </div>
          <label className={labelClass}>
            Briefing (Markdown supported)
            <textarea
              rows={10}
              value={form.context}
              onChange={set('context')}
              className={`${fieldClass} font-mono leading-relaxed`}
            />
          </label>
          <p className="text-xs text-[#999696]">
            {form.contextUpdated
              ? `Context last updated ${formatDateTime(form.contextUpdated)}`
              : 'Context not edited yet'}
          </p>
          <label className={labelClass}>
            AI tool used
            <select value={form.aiTool} onChange={set('aiTool')} className={fieldClass}>
              {AI_TOOLS.map((tool) => (
                <option key={tool}>{tool}</option>
              ))}
            </select>
          </label>
        </div>

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

/* ---------- M11 anchors: pinned deliverables banner ---------- */

const ANCHORS = [
  { id: 'presentation', label: 'Presentation' },
  { id: 'demo', label: 'Demo' },
  { id: 'report', label: 'Report' },
  { id: 'documentation', label: 'Documentation' },
];

// Returns a safe, clickable http(s) address for what was typed, or null if it isn't one.
function toHref(value) {
  const v = value.trim();
  if (!v) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function AnchorBoard({ anchors, onChange }) {
  return (
    <section
      aria-label="Project deliverables"
      className="-mx-6 mb-4 border-b border-white/10 bg-[#000000] px-6 pb-4 pt-3 md:sticky md:top-0 md:z-[5]"
    >
      <h2 className="mb-2 text-base font-semibold uppercase text-[#FFFFFF]">Deliverables</h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ANCHORS.map(({ id, label }) => {
          const value = anchors[id] ?? '';
          const hasLink = value.trim() !== '';
          const href = toHref(value);
          return (
            <li key={id} className="rounded-md border border-white/20 bg-[#2B2B2B] p-3">
              <div className="flex items-center gap-2">
                <span
                  role="img"
                  aria-label={hasLink ? 'Link added' : 'No link yet'}
                  title={hasLink ? 'Link added' : 'No link yet'}
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    hasLink ? 'bg-[#10B981]' : 'border border-[#999696]'
                  }`}
                />
                <h3 className="flex-1 text-sm font-medium text-[#FFFFFF]">{label}</h3>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#FFFFFF] underline hover:text-[#999696]"
                  >
                    Open
                  </a>
                ) : (
                  <span className="text-xs text-[#999696]">{hasLink ? 'Check link' : 'Not added'}</span>
                )}
              </div>
              <input
                type="url"
                inputMode="url"
                value={value}
                onChange={(e) => onChange(id, e.target.value)}
                placeholder="https://"
                aria-label={`${label} link`}
                className={fieldClass}
              />
            </li>
          );
        })}
      </ul>
    </section>
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

  // M11 anchors: one saved link per deliverable
  const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', {
    presentation: '',
    demo: '',
    report: '',
    documentation: '',
  });

  // M10: copy a clean briefing to the clipboard
  const copyContext = async (task) => {
    // Always work from the freshest saved version of the task, with any unsaved
    // edits from the modal layered on top, so the copy matches what's on screen.
    const saved = tasks.find((t) => t.id === task.id);
    const source = saved ? { ...saved, ...task } : task;

    // An empty (or heading-only) context has nothing worth copying
    if (!cleanContext(source.context)) {
      showToast(COPY.nothingToCopy);
      return;
    }

    const text = buildBriefing(source);
    try {
      await navigator.clipboard.writeText(text);
      showToast(COPY.copied);
    } catch {
      // Fallback for browsers or contexts where the Clipboard API is blocked
      const box = document.createElement('textarea');
      box.value = text;
      box.style.position = 'fixed';
      box.style.opacity = '0';
      document.body.appendChild(box);
      box.focus();
      box.select();
      box.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(box);
      showToast(ok ? COPY.copied : COPY.copyFailed);
    }
  };

  const saveTask = (data) => {
    if (data.id) {
      const previous = tasks.find((t) => t.id === data.id);
      // M9: only bump the timestamp when the context text actually changed
      const contextChanged = (previous?.context ?? '') !== data.context;
      const contextUpdated = contextChanged ? new Date().toISOString() : previous?.contextUpdated ?? null;
      setTasks(tasks.map((t) => (t.id === data.id ? { ...t, ...data, contextUpdated } : t)));
      // M7 handoff toast: only when an existing task's assignee actually changes
      if (previous && previous.assignee !== data.assignee) {
        showToast(COPY.handoff(data.assignee));
      }
    } else {
      // A new task only gets a timestamp once its template has been edited
      const edited = data.context.trim() !== CONTEXT_TEMPLATE.trim();
      setTasks([
        ...tasks,
        {
          ...data,
          id: crypto.randomUUID(),
          createdDate: isoDay(0),
          contextUpdated: edited ? new Date().toISOString() : null,
        },
      ]);
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

      <AnchorBoard
        anchors={anchors}
        onChange={(id, url) => setAnchors({ ...anchors, [id]: url })}
      />

      <main className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            tasks={tasks.filter((t) => t.status === stage.id)}
            onOpen={setEditing}
            onDragStart={onDragStart}
            onDropTask={onDropTask}
            onCopy={copyContext}
          />
        ))}
      </main>

      {editing && (
        <TaskModal
          task={editing}
          onSave={saveTask}
          onDelete={deleteTask}
          onCopy={copyContext}
          onClose={() => setEditing(null)}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
