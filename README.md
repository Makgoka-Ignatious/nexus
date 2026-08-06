# Nexus

You are an elite full-stack AI developer and UI designer. Your task is to build a complete, modern, single-page web application called **Nexus** – an AI Workplace Productivity Hub. The app must be created with zero external database, zero authentication, and all state handled locally (session only). The final output must be fully functional, beautifully animated, and ready to run.

**THINK STEP BY STEP before writing any code:**
1. Analyse the full requirement set and plan the component tree, state architecture, and data flow.
2. Plan the exact Urban Grid visual design – every color, spacing, line weight, and animation.
3. Ensure every navigation state (Chat, Research, Email, Dashboard) is handled with clean transitions.
4. Then generate the entire application code as a single, cohesive project.

---

## 1. CORE PRODUCT & THEME
- **Name:** Nexus
- **Tagline:** “Command your communication infrastructure.”
- **Theme:** “Urban Grid” – precise, professional, inspired by smart city grids and transit maps.
- **No login, no database.** All user data (chat history, research summaries, generated emails) is ephemeral and managed via React state.

---

## 2. APPLICATION STRUCTURE (Single Dashboard)
The app must have a **responsive sidebar navigation** and a main content area. The four sections are:

### a) Dashboard Home
- A clean welcome screen with a subtle animated grid background.
- Show three “tool cards” (Chat, Research, Email) with icons and short descriptions.
- A summary stat area (e.g., “3 tools available”, “100% local & secure”) – static but looks dynamic.
- Each card has a “Launch” button that navigates to that tool’s section.

### b) AI Chatbot Interface
- Chat window with message bubbles (user vs. assistant styling).
- Input area at bottom with send button and Enter-to-send.
- Assistant responses must simulate AI generation (delayed streaming effect: characters appear one by one).
- Provide at least 5 contextually aware mock responses that actually reference previous messages (e.g., if user asks “What is Nexus?”, answer accordingly).  
- Include a clear “Clear conversation” button.

### c) AI Research Assistant
- A two-panel layout: left panel for input + controls, right panel for structured output.
- Input: a topic or paste an article (textarea).
- Action button: “Generate Summary & Insights”.
- On trigger, show a loading state with a grid-node animation (see animations).
- Output must contain:
  - **Summary** (2-3 paragraphs, simulated).
  - **Key Insights** (3-5 bullet points).
  - **Recommendations** (2-3 actionable suggestions).
- All content is simulated but must be highly convincing, well-formatted, and context-dependent (different output for different inputs – use the input text to vary the result).
- Allow the user to **edit any output section** inline after generation.

### d) Smart Email Generator
- Structured email composer:
  - **To** field (simulated, not actually sent).
  - **Subject** (auto-suggested after filling context, but editable).
  - **Context / Key points** textarea.
  - **Tone selector:** Formal, Friendly, Persuasive (dropdown).
- “Generate Email” button – upon click, produce a full professional email body in a rich text preview (non-editable initially, then click “Edit” to modify).
- The generated email must reflect the chosen tone and context. Provide distinctly different outputs for the same input across tones.
- A “Copy to clipboard” button and a “Regenerate” button.
- Simulate a small delay with a node-pulse animation while generating.

---

## 3. DESIGN SYSTEM: URBAN GRID (Precise & Professional)
Implement **every** detail:

- **Color Palette:**
  - Background: `#F8FAFC` (off-white) for main areas, `#F1F5F9` for sidebar.
  - Sidebar active item: `#1E293B` (dark slate), text white.
  - Primary accent: `#2563EB` (crisp digital blue) for buttons, links, active states.
  - Secondary accent: `#10B981` (signal green) for success indicators, insights badges.
  - Borders and grid lines: `#E2E8F0` (subtle slate) with 1px solid.
  - Text: `#0F172A` for headings, `#475569` for body.

- **Typography:**
  - Use only **Inter** (or **Space Grotesk** as fallback) from Google Fonts. Load it properly.
  - Headings: 600 weight, 24px/20px/18px.
  - Body: 400 weight, 16px, line-height 1.6.
  - Monospace: for any code-like data (none required, but if needed).

- **Layout & Grid:**
  - Entire background has a **subtle 20px grid pattern** drawn with thin (1px) #E2E8F0 lines. This is the “Urban Grid” foundation.
  - Cards and panels use white background with a 1px border and 8px border-radius.
  - Sidebar: 260px wide, fixed height 100vh, with thin right border. Logo “NEXUS” at top, navigation items with icons (use Lucide icons or similar) and a small indicator dot that lights up green for the active section.
  - Responsive: on screens < 768px, sidebar collapses to a bottom tab bar (mobile style) with icons.

- **Spacing:** generous padding (24px inside cards, 32px section spacing). Use consistent 8px grid for margins and paddings.

---

## 4. ANIMATIONS & MICRO-INTERACTIONS (Crucial)
These must feel like a high-end SaaS control panel:

1. **Grid Background Animation:** The fine grid lines slowly pulse or shift opacity (0.05 to 0.1) in a breathing pattern over 8s – very subtle, never distracting.
2. **Node-and-Path Connection Animation:** When the Research Assistant finishes generating or the Email Generator completes, display a brief (1.5s) animation in the output area: small glowing blue dots (nodes) connected by thin animated lines that draw a mini transit route, then fade into the result. This symbolizes the “data flow through the Nexus grid”.
3. **Button Micro-interactions:** All buttons have a 150ms scale-down (0.97) on click and a background color transition of 200ms ease.
4. **Streaming text effect:** In the Chatbot, simulate a typewriter with cursor, character by character at ~30 chars/sec.
5. **Page transitions:** When switching sidebar items, the main content does a smooth 300ms crossfade + slight vertical slide (5px) to feel instantaneous but polished.
6. **Loading states:** Use a rotating thin circle (dashed) or a grid-pulse skeleton inside cards. Never a static “Loading…” text.

---

## 5. RESPONSIBLE AI & DISCLAIMER
- A fixed **bottom banner** (non-intrusive, 40px height) across the entire app, with text:  
  _“⚠️ AI-generated content. Verify before use. Nexus does not store your data.”_
- The banner must be dismissible but reappears on next session.
- In the Email Generator, add a small note below the generated email: “This is AI-generated and should be reviewed before sending.”
- No real API calls – all responses are simulated using mock functions and local state.

---

## 6. TECHNICAL CONSTRAINTS
- **Frontend only.** Use React (with hooks), Tailwind CSS for all styling, Vite as the build tool.
- No backend, no database. Use `useState`, `useEffect`, and mock data.
- Icons: install and use `lucide-react` for crisp, geometric icons matching the theme.
- Fonts: import Inter from Google Fonts via index.html or CSS.
- Ensure all interactive elements are keyboard accessible.
- The entire app must be fully responsive: desktop sidebar becomes bottom tab bar on mobile, all layouts stack accordingly, cards reflow.

---

## 7. EXPECTED OUTPUT
Generate the complete project with all files (App.jsx, components, index.html, package.json, tailwind.config, etc.) in a single code block or structured artifact. Ensure the implementation exactly follows the Urban Grid design, the three integrated tools, sidebar navigation, and all animations described. Do not cut corners – the result must be a polished, production-grade portfolio piece.

**Now, build Nexus from scratch.**

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/64adfdec-a64b-4560-a944-82f8462aedca).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
