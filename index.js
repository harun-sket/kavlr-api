const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = 'https://yasllkvdrgnqtjesdyfz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhc2xsa3ZkcmducXRqZXNkeWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyODQwNjgsImV4cCI6MjEwNzg2MDA2OH0.1bD80IRX7agRAK7luYzdsUvFO3uSbfaK1OSo58l4-N4';
const supabase = createClient(supabaseUrl, supabaseKey);

const BLOCKED_PATTERNS = ['.env', 'rm -rf', 'DROP TABLE', 'sudo', 'curl | bash'];

app.post('/api/intercept', async (req, res) => {
  try {
    const { agent_id, action_type, payload } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ allowed: false, message: 'Missing API Key.' });
    }
    
    const apiKey = authHeader.split(' ')[1];
    
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_email, user_id')
      .eq('key', apiKey)
      .single();

    if (keyError || !keyData) {
      console.log('❌ KEY ERROR:', keyError ? keyError.message : 'Key not found');
      return res.status(401).json({ allowed: false, message: 'Invalid API Key.' });
    }

    const { data: settings } = await supabase.from('settings').select('kill_switch_active').eq('id', 1).single();
    if (settings && settings.kill_switch_active) {
      return logAndRespond(res, keyData.user_id, agent_id, action_type, payload, 'BLOCKED', 'Global Kill Switch is ACTIVE.');
    }

    const isDangerous = BLOCKED_PATTERNS.some(pattern => payload.toLowerCase().includes(pattern.toLowerCase()));

    if (isDangerous) {
      return logAndRespond(res, keyData.user_id, agent_id, action_type, payload, 'BLOCKED', 'Action matches a dangerous security pattern.');
    }

    return logAndRespond(res, keyData.user_id, agent_id, action_type, payload, 'ALLOWED', 'Action permitted.');
    
  } catch (err) {
    console.error('❌ SERVER CRASH PREVENTED:', err.message);
    return res.status(500).json({ allowed: false, message: 'Internal Server Error: ' + err.message });
  }
});

async function logAndRespond(res, user_id, agent_id, action_type, payload, status, message) {
  try {
    const { error } = await supabase.from('agent_logs').insert([{
      user_id: user_id || null,
      agent_id: agent_id || 'unknown',
      action_type: action_type || 'command',
      payload: payload,
      status: status
    }]);

    if (error) console.error('❌ DB LOG ERROR:', error.message);
  } catch (e) {
    console.error('❌ INSERT CRASH:', e.message);
  }

  if (status === 'BLOCKED') {
    console.log(`🛑 [BLOCKED] ${payload}`);
    return res.status(403).json({ allowed: false, message });
  } else {
    console.log(`✅ [ALLOWED] ${payload}`);
    return res.json({ allowed: true, message });
  }
}

app.listen(3000, () => {
  console.log('🛡️ KAVLR Interceptor running on http://localhost:3000');
});
