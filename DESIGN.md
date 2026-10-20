# Vibecoding Project Tracker — Design

**Status:** Hackathon starter design doc · fill in the **`<TODO>`** sections before you tag `design-done`.

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. Twenty minutes of design decisions here will be visible on every screen for the next six weeks of Module 5.

**Who owns this.** Person B, during the same window the rest of the team is reviewing the PRD. By the time the team converges to start M4 (`data-model`), this file should be filled in and the colors should already be in `tailwind.config.js`.

---

## 1. Mood / vibe

One sentence that captures the feeling the tracker should leave you with.

`Sleek, modern and readable`

Two or three references that capture the vibe (links to dribbble shots, screenshots of apps you admire, Pinterest boards — anything visual):

- <img width="1908" height="863" alt="image of GitLab issue board" src="https://github.com/user-attachments/assets/6e6bf5f1-e21a-4c57-87b3-e56ca9bc0b0d" />
- <img width="1863" height="862" alt="image" src="https://github.com/user-attachments/assets/fd664a97-592e-4f2b-8349-01f9c331bb80" />

Anti-references — what we are explicitly **not** trying to look like:

- <img width="800" height="601" alt="image" src="https://github.com/user-attachments/assets/83123327-bd71-4ed8-b220-451fa231611c" />


## 2. Color palette

These are the colors the build milestones will reference. Once chosen, paste the hex values into `tailwind.config.js` so the rest of the team can use Tailwind utility classes (e.g. `bg-brand-primary`, `border-due-warning`).

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `3E3C6B` | Header, "+" button, focus rings |
| `brand-accent` | `4F4C8A` | Highlights, hover states, links |
| `surface-page` | `000000` | Page background |
| `surface-card` | `2B2B2B` | Card background |
| `text-primary` | `FFFFFF` | Body text |
| `text-muted` | `999696` | Captions, dates, counts |

### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `DC2626` | Cards tagged `feature` (accent stripe + icon) |
| `type-bug` | `10B981` | Cards tagged `bug` (accent stripe + icon) |

### Due-date states (M8 `due-tint`)

| Token | Hex | When used |
|---|---|---|
| `due-safe` | `2B2B2B` | More than 2 days out |
| `due-warning` | `C9900E` | Less than 24 hours |
| `due-overdue` | `A6170A` | Past due |
| `due-neutral` | `0AA1A6` | Done (overrides date) |

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | `Verdana (Bold)` | `It is a font that is more accessible as its easier to read` |
| Body | `Verdana` | `It is an accessible font that is easy to read` |
| Monospace (tags, badges, code) | `Verdana (Smaller than body text)` | `It is an accessible font that is easy to read` |

Suggested sizes (override only if the design demands it):

- Page title: 24 px / semibold
- Section header: 16 px / semibold uppercase
- Card title: 14 px / medium
- Body: 14 px / regular
- Caption: 12 px / regular muted

## 4. Component principles

One short sentence per element. These set the tone for the build phase — Person A's modal and Person B's anchor board should both feel like they came from this doc.

- **Cards:** `1px border, slightly lighter than the background. No shadow except on hover`
- **Buttons:** `Solid fill, rounded-md, average padding`
- **Modal:** `Centered, 60% opacity, same colour as cards ` (e.g. "Centered, max-width-md, slate-900 backdrop at 50% opacity.")
- **Empty states:** `Text that says "nothing here"` (e.g. "Dashed border, muted text, never sad.")
- **Drag affordance (if used):** `Has a drag handle`

## 5. Voice / microcopy

Three lines of microcopy that capture the tone of the product. Keep it short — these are the words a stressed user reads at 11pm.

| Where | Text |
|---|---|
| "+" button label | `Add Task`|
| Empty column placeholder | `Nothing here yet` |
| Toast after "Copy as Prompt Context" | `Copied Successfully!`|
| Confirm-delete message | `Are you sure? You can't undo this`|
| Handoff toast (M7 `task-owner`) | `Handed off to {name}, its their problem now`|

## 6. Logo / wordmark

The tracker probably doesn't need a logo, but it does need a name and a wordmark style.

- **Product name:** `TrackIt` (match PRD §11 team identity)
- **Wordmark style:** `The name in the heading font with brand-primary colour`

## 7. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Pick one mode and ship it.
- Multiple themes. One brand, applied consistently.
- Animations beyond a 200 ms fade on toast notifications.
- A custom icon set. Use [Lucide icons](https://lucide.dev) via Tailwind classes if you need any.

---

*DESIGN.md version: hackathon-starter v1*
