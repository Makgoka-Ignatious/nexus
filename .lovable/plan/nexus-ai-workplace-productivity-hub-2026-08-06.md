# Nexus — AI Workplace Productivity Hub

A single-page, frontend-only productivity hub with four sections (Dashboard, Chat, Research, Email) in an "Urban Grid" visual system. No backend, no login, no stored data — everything lives in React state for the session.

## What gets built

**Shell**
- Fixed 260px sidebar (NEXUS wordmark, four nav items with Lucide icons and a green indicator dot on the active item). Below 768px it becomes a bottom tab bar.
- Animated 20px grid background that breathes between 0.05 and 0.1 opacity over 8s.
- Section switching does a 300ms crossfade with a 5px vertical slide.
- Dismissible 40px bottom disclaimer banner: "AI-generated content. Verify before use. Nexus does not store your data." Returns on reload (state only, nothing persisted).

**Dashboard Home**
- Welcome header, three tool cards (Chat, Research, Email) with icon, description, and a Launch button that switches sections.
- Static-but-lively stat strip: tools available, 100% local & secure, session-only storage.

**AI Chat**
- Message bubbles (user filled blue, assistant plain on grid surface), sticky composer, Enter-to-send, Shift+Enter newline.
- Assistant replies stream character-by-character at ~30 chars/sec with a blinking cursor.
- Mock reply engine with 5+ contextual branches (what is Nexus, capabilities, research help, email help, greetings, fallback) that reference earlier turns in the conversation.
- Clear conversation button.

**Research Assistant**
- Two panels: left input (topic or pasted article) + controls; right structured output.
- Generating shows the node-and-path animation, then renders Summary (2–3 paragraphs), Key Insights (3–5 bullets with green badges), Recommendations (2–3 items).
- Output text is derived from the input (topic keywords, length, detected terms) so different inputs give different results.
- Every output section is inline-editable after generation.

**Email Generator**
- To, Subject (auto-suggested from context, editable), Context/Key points textarea, Tone dropdown (Formal / Friendly / Persuasive).
- Generate runs a node-pulse delay, then renders a read-only email preview; Edit toggles to an editable body.
- Tone materially changes greeting, phrasing, structure, and sign-off for the same context.
- Copy to clipboard, Regenerate, and a review note under the preview.

**Animations**
- Grid breathing, node-and-path draw-in (1.5s) after research/email generation, 150ms button scale-down to 0.97 with 200ms color transition, typewriter streaming, section crossfade, dashed rotating spinner and grid-pulse skeletons for loading.

## Technical notes

- Stack stays as-is: TanStack Start + React + Tailwind v4 + Vite. The app is built as the index route (`src/routes/index.tsx`) with a client-side section switcher — a single-page hub, as specified, rather than separate URLs.
- Inter loaded via `<link>` tags in the root route head (Tailwind v4 forbids remote `@import` in CSS).
- All Urban Grid colors (#F8FAFC, #F1F5F9, #1E293B, #2563EB, #10B981, #E2E8F0, #0F172A, #475569), the 8px radius, spacing scale, grid-pattern utility, and keyframes go into `src/styles.css` as semantic tokens — no hardcoded color classes in components.
- `lucide-react` for icons (installed if not already present).
- Components split under `src/components/nexus/`: `Sidebar`, `GridBackground`, `DisclaimerBanner`, `NodePathAnimation`, `DashboardHome`, `ChatPanel`, `ResearchPanel`, `EmailPanel`, plus `src/lib/nexus/mock-*.ts` for the simulated chat/research/email generators.
- Keyboard accessibility throughout: focus rings on all controls, nav as real buttons, Enter/Escape handling in composers, ARIA live region for streaming assistant output.
- Head metadata on the index route: Nexus-specific title, description, og/twitter tags.
