# Nexus – AI Workplace Productivity Hub

A modern, responsive web application that brings together three AI-powered tools in a single integrated dashboard: an intelligent chatbot, a research assistant, and a smart email generator. All AI features use a **real language model** (Gemini 2.5 Flash) via a secure API gateway, delivering genuine, context-aware responses.

[![GitHub Repo](https://img.shields.io/badge/GitHub-nexus-blue?logo=github)](https://github.com/Makgoka-Ignatious/nexus)

---

## 📌 Project Overview

**Nexus** is a client‑side AI productivity platform that helps professionals automate common workplace tasks. Users can chat with an assistant, summarize articles and get insights, and generate professional emails in multiple tones — all without an account. The design follows a precise "Urban Grid" theme inspired by smart city infrastructure, emphasizing speed, clarity, and authority.

Each tool communicates with **Gemini 2.5 Flash** through Lovable’s AI gateway, producing realistic, dynamic, and context‑sensitive outputs. The application remains fully front‑end and does not store any user data.

---

## ✨ Features Implemented

### 🏠 Dashboard
- Clean home screen with animated grid background
- Overview cards for each tool
- Seamless sidebar navigation with active state indicator

### 💬 AI Chatbot Interface
- Real AI‑powered assistant (Gemini 2.5 Flash)
- Streaming‑style typewriter effect for responses
- Context‑aware conversations (model references previous messages)
- Clear conversation button
- Keyboard‑friendly input (Enter to send)

### 📚 AI Research Assistant
- Input area for topics or pasted articles
- Structured output: summary, key insights, recommendations  
  *(generated live by the AI model)*
- Inline editing of AI‑generated content
- Node‑and‑path connection animation on completion

### ✉️ Smart Email Generator
- Form with recipient, subject, context, and tone selector  
  (Formal / Friendly / Persuasive)
- AI‑generated email body that authentically reflects chosen tone and context
- Auto‑suggested subject line (when supported)
- Copy to clipboard, regenerate, and edit options

### 🎨 Design & UX
- **Urban Grid theme** – subtle grid background, crisp lines, high contrast
- Fully responsive: collapsible sidebar (desktop) → bottom tab bar (mobile)
- Smooth page transitions, button micro‑interactions, loading animations
- Typography: Inter font, geometric sans‑serif

### 🛡️ Responsible AI
- Persistent, dismissible disclaimer banner:  
  *“⚠️ AI-generated content. Verify before use. Nexus does not store your data.”*
- Per‑email warning: *“This is AI-generated and should be reviewed before sending.”*
- No user data stored; communication with the AI gateway is stateless

---

## 🧠 AI Integration

All AI features are powered by **Gemini 2.5 Flash** via the Lovable AI Gateway.

- **Implementation:**  
  The frontend sends a standard OpenAI‑compatible chat completion request to the gateway. The gateway handles authentication and rate limiting, so no API key is exposed to the browser.
- **Streaming:** The app parses server‑sent events (SSE) to deliver a typewriter effect in the chatbot and smooth loading states elsewhere.

---

## 🛠️ Technologies & Tools Used

| Category        | Technology / Tool                        |
|-----------------|------------------------------------------|
| Frontend        | React (with Hooks)                       |
| Build Tool      | Vite                                     |
| Styling         | Tailwind CSS                             |
| Icons           | Lucide React                             |
| Font            | Inter (Google Fonts)                     |
| AI Model        | Google Gemini 2.5 Flash (`gemini-2.5-flash`) |
| AI Gateway      | Lovable AI Gateway (proxy to Gemini API) |
| Animations      | CSS transitions, custom keyframes        |
| State Management| React `useState`, `useEffect`            |
| Version Control | Git & GitHub                             |

---

## 🚀 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Makgoka-Ignatious/nexus.git
   cd nexus

---

## 👤 Author

**Makgoka Ignatious**  
GitHub: [@Makgoka-Ignatious](https://github.com/Makgoka-Ignatious)
