#!/usr/bin/env node
const axios = require('axios');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('\x1b[31m%s\x1b[0m', '🛑 Error: No command provided.');
  process.exit(1);
}

const action = args[0];
const payload = args.slice(1).join(' ');

const API_KEY = process.env.KAVLR_API_KEY || '';
const KAVLR_API = 'https://kavlr-api-production.up.railway.app/api/intercept';

async function run() {
  if (!API_KEY) {
    console.log('\x1b[31m%s\x1b[0m', '❌ KAVLR_API_KEY is not set. Blocking command for safety.');
    process.exit(1);
  }

  console.log(`\n\x1b[36m%s\x1b[0m`, `🔍 KAVLR analyzing: "${payload}"...`);

  try {
    const response = await axios.post(KAVLR_API, {
      agent_id: 'auto-hook',
      action_type: action,
      payload: payload
    }, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    console.log('\x1b[32m%s\x1b[0m', '✅ [ALLOWED] Action permitted.');
    
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log('\x1b[41m\x1b[37m%s\x1b[0m', ' 🛑 [BLOCKED] THREAT DETECTED ');
      console.log('\x1b[31m%s\x1b[0m', `Reason: ${error.response.data.message}`);
    } else if (error.response && error.response.status === 401) {
      console.log('\x1b[31m%s\x1b[0m', '❌ Invalid API Key. Blocking command.');
    } else {
      console.log('\x1b[31m%s\x1b[0m', `❌ KAVLR Backend Offline or Error. Blocking command.`);
    }
    process.exit(1); // ALWAYS exit with 1 on any error
  }
}

run();
