<div align="center">
  <img src="logo.svg" width="100" alt="KAVLR Logo">
  <h1>KAVLR: The AI Agent Action Gate</h1>
  <p><strong>Stop rogue AI agents from destroying your production. Built on a $150 Android phone.</strong></p>

  <a href="https://www.npmjs.com/package/@hynaweb/kavlr"><img src="https://img.shields.io/npm/v/@hynaweb/kavlr?color=blue&label=npm" alt="NPM Version"></a>
  <a href="https://kavlr.netlify.app/"><img src="https://img.shields.io/badge/Live_Dashboard-Online-purple" alt="Live Dashboard"></a>
</div>

---

## 🛑 The Problem
AI coding agents (Cursor, Claude Code) can run terminal commands. Text-based filters are dead. An agent can easily bypass them using `base64`, shell-outs, or prompt injection.

If an agent hallucinates an `rm -rf /` or tries to exfiltrate your `.env` file, traditional security tools won't stop it.

## 🛡️ The Solution
**KAVLR** is a fail-closed terminal leash. It intercepts commands *before* the OS executes them. It doesn't read the text; it grades the **action**.

If the API is unreachable or the AI is less than 90% sure a command is safe, **it fails closed.**

> **The wildest test:** During debugging, I tried to run `rm -f` to uninstall my own KAVLR CLI. The AI intercepted it, recognized the destructive filesystem action, gave it a `0/100` safety score, and **blocked its own deletion.** The gate developed self-preservation.

## ⚡ Install in 30 Seconds

Run this in your terminal:
`npm install -g @hynaweb/kavlr`

Initialize your API key (get one free from the [Live Dashboard](https://kavlr.netlify.app)):
`kavlr init`

## 🧪 Test It (Watch it block malicious commands)

Try to steal environment variables:
`kavlr cat .env`

**Output:** `🛑 [BLOCKED] Binary explicitly denied.`

Try an obfuscated exfiltration attack:
`kavlr bash -c "cat .env | base64"`

**Output:** `🛑 [BLOCKED] AI Score: 0/100 - Attempted to read .env file and encode its contents with base64.`

Try a safe command:
`kavlr mkdir my_project`

**Output:** `✅ [ALLOWED] AI Score: 95/100 - Standard mkdir command. Safe.`

## 🧠 How it Works (The Architecture)

1. **The CLI Gate:** Your terminal command is intercepted by the Node.js CLI (`shlex` parsing).
2. **The Policy Engine (Postgres):** Known bad binaries (`curl`, `rm`) are instantly blocked.
3. **The Constitutional AI (Llama 3 + Groq):** Unknown commands are sent to an AI with a strict security constitution. If it scores < 90, it's blocked.
4. **Live Telemetry:** Every action is streamed to a real-time web dashboard.

## 🥖 Why I Built This
I’m a 12-year-old developer building entirely on a $150 Android phone using Termux. I realized AI agents can hallucinate and destroy production environments with zero "Are you sure?" prompts. Enterprise tools cost thousands. KAVLR is free, lightweight, and fail-closed.

*Read the full story of how I built this on [Dev.to](https://dev.to/harun-solo-dev).*

## ⭐ Support the Project
If you believe AI agents need better safety rails, please give this repo a **Star**! It helps a 12-year-old founder more than you know.

---
*Copyright (c) 2026 HYNAWEB. All Rights Reserved.*
