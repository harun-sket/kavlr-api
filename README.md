<div align="center">
  <img src="logo.svg" width="100" alt="KAVLR Logo">
  <h1>KAVLR: The AI Agent Action Gate</h1>
  <p><strong>Stop rogue AI agents from destroying your production. Built on a $150 Android phone.</strong></p>

  <a href="https://www.npmjs.com/package/@hynaweb/kavlr"><img src="https://img.shields.io/npm/v/@hynaweb/kavlr?color=blue&label=npm" alt="NPM Version"></a>
  <a href="https://github.com/harun-sket/kavlr-api/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License"></a>
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

```bash
npm install -g @hynaweb/kavlr
