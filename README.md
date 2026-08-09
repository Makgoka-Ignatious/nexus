# Nexus – AI Workplace Productivity Hub

**Think. Link. Deliver. — Built for Momentum.**

A modern, responsive single-page web application that brings together three AI-powered tools in one integrated dashboard: an intelligent chatbot, a research assistant, and a smart email generator. All AI features use real language models via a secure gateway — no account, no database, no stored data.

[![GitHub Repo](https://img.shields.io/badge/GitHub-nexus-blue?logo=github)](https://github.com/Makgoka-Ignatious/nexus)

---

## 📌 Project Overview

**Nexus** is a client-side AI productivity platform that helps professionals automate common workplace tasks. Users can chat with an assistant, analyse topics, articles, links, PDFs and YouTube videos, and generate professional emails in multiple tones — all without signing in.

The design follows a precise **"Urban Grid"** theme inspired by smart-city infrastructure and transit maps: a 20px breathing grid background, crisp 1px slate lines, blue routing accents and green signal highlights. The light Urban Grid palette is the default look and every session opens in it; a dark variant of the same grid system is available via the top-bar toggle.

---

## ✨ Features

### 🏠 Dashboard
- Hero with the Nexus logo and the "Think. Link. Deliver." motto
- Overview cards that launch each tool
- Animated grid background and active-state sidebar navigation

### 💬 AI Chatbot
- Real AI-powered assistant with context-aware, multi-turn conversation
- Typewriter streaming effect with markdown-formatted replies
- Clear conversation button, Enter to send / Shift+Enter for newline

### 📚 AI Research Assistant
Three input modes, all producing the same structured output:
- **Text** – paste a topic or full article
- **Link** – any URL; content is fetched and cleaned server-side, with a reader fallback for sites that block scrapers
- **PDF** – upload a document (up to 8MB) for direct analysis
- **YouTube** – paste a video link; title, description and transcript are extracted

Output: summary, key insights, recommendations, plus a note of the source. Every section is inline-editable, and a node-and-path animation plays while the grid "routes" the request.

### ✉️ Smart Email Generator
- Recipient email, recipient name or role, context/key points, tone (Formal / Friendly / Persuasive)
- Optional subject line — left blank, the AI writes one
- Tone materially changes greeting, phrasing, structure and sign-off
- Copy to clipboard, regenerate, and edit the draft before use

### 🎛️ Session Controls
- **Model picker** in the top bar — Gemini Flash (default), Gemini Pro, ChatGPT and ChatGPT Fast; the choice drives chat, research and email
- **AI request counter** — increments on every AI call, resets on reload (session-only, nothing persisted)
- **Theme toggle** — Urban Grid light (default) ↔ Urban Grid dark

### 🎨 Design & UX
- Urban Grid theme with semantic design tokens; no hardcoded colours
- Fully responsive from 320px to 4K: collapsible sidebar on desktop, bottom tab bar on mobile, 44px touch targets
- Smooth section crossfades, button micro-interactions, node/path and grid-pulse loading states
- Typography: Inter

### 🛡️ Responsible AI
- Dismissible disclaimer banner: *"AI-generated content. Verify before use. Nexus does not store your data."* — dismissing it drops the mobile tab bar flush to the screen edge
- Per-email review note before sending
- No user data stored; AI calls are stateless

---

## 🧠 AI Integration

AI features run through the Lovable AI Gateway, which handles authentication and rate limiting so **no API key is ever exposed to the browser**. Requests are issued from server functions (`src/lib/nexus/ai.functions.ts`); link, PDF and YouTube extraction happens server-side in `src/lib/nexus/extract.server.ts`.

---

## 🛠️ Technologies

| Category         | Technology / Tool                                   |
|------------------|-----------------------------------------------------|
| Framework        | TanStack Start (React 19, file-based routing)       |
| Build Tool       | Vite                                                 |
| Styling          | Tailwind CSS v4 (`src/styles.css` theme tokens)     |
| Icons            | Lucide React                                         |
| Font             | Inter (Google Fonts)                                 |
| AI Models        | Gemini Flash / Gemini Pro / ChatGPT / ChatGPT Fast  |
| AI Gateway       | Lovable AI Gateway                                   |
| Markdown         | react-markdown                                       |
| Animations       | CSS transitions and custom keyframes                 |
| State Management | React hooks + `useSyncExternalStore` session stores  |
| Version Control  | Git & GitHub                                         |

---

## 🚀 Setup

```bash
git clone https://github.com/Makgoka-Ignatious/nexus.git
cd nexus
npm install
npm run dev
```

The app runs at `http://localhost:8080`.

---

## 📁 Structure

```text
src/
  components/nexus/   Sidebar, TopBar, GridBackground, Dashboard/Chat/Research/Email panels
  lib/nexus/          AI server functions, extraction, model + theme + counter stores
  routes/             __root.tsx (shell, head metadata) and index.tsx (the hub)
  styles.css          Urban Grid design tokens, utilities and keyframes
```

---

## 👤 Author

**Makgoka Ignatious**
GitHub: [@Makgoka-Ignatious](https://github.com/Makgoka-Ignatious)
