# 🛡️ KAVLR: The Agent Leash
**Runtime security for AI coding agents. Built on a $150 phone.**

KAVLR is a fail-closed Bash hook that intercepts dangerous terminal commands (like `rm -rf`, `cat .env`, `sudo`) executed by AI agents (Claude Code, Cursor, Devin) *before* the OS runs them. 

If the API is unreachable, it defaults to **BLOCKED**. Safety first. Always.

### ⚡ Install in 30 Seconds
```bash
npm install -g @hynaweb/kavlr
javlr init
```
*(Paste your API key from [kavlr.netlify.app](https://kavlr.netlify.app) when prompted)*

### 🧪 Test It
Try to read your environment variables:
```bash
cat .env
```
**Expected Output:** `🛠 [BLOCKED] THREAT DETECTED`

*(Pro Tip: Need to bypass it for debugging? Just use a backslash: `\cat .env`)*

### 🥖 Why I Built This
I’m a 12-year-old developer building entirely on a $150 Android phone. I realized AI agents can halucinate and destroy production environments with zero "Are you sure?" prompts. Enterprise tools cost thousands. KAVLR is free, lightweight, and fail-closed. 

[Read the full story of how my own code locked me out for 48 hours →](https://kavlr.netlify.app) *(Link to your Dev.to post later, or a Notion doc for now)*

---
**Tech Stack:** Vanilla JS, Supabase Edge Functions (Deno), PostgreSQL (RLS), Bash.
