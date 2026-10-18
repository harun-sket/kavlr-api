const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yasllkvdrgnqtjesdyfz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhc2xsa3ZkcmducXRqZXNkeWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyODQwNjgsImV4cCI6MjEwNzg2MDA2OH0.1bD80IRX7agRAK7luYzdsUvFO3uSbfaK1OSo58l4-N4';
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

const BLOCKED_PATTERNS = ['.env', 'rm -rf', 'DROP TABLE', 'sudo', 'curl | bash'];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ allowed: false, message: 'Method not allowed' });

  try {
    const { agent_id, action_type, payload } = req.body || {};
    
    const authHeader = req.headers.authorization;
    
    const apiKey = authHeader.split(' ')[1];
    const { data: keyData, error: keyError } = await supabase.from('api_keys').select('user_email, user_id').eq('key', apiKey).single();


    const { data: settings } = await supabase.from('settings').select('kill_switch_active').eq('id', 1).single();
    
    if (settings && settings.kill_switch_active) {
      await supabase.from('agent_logs').insert([{ user_id: keyData.user_id, agent_id, action_type, payload, status: 'BLOCKED' }]);
      return res.status(403).json({ allowed: false, message: 'Global Kill Switch is ACTIVE.' });
    }

    const isDangerous = BLOCKED_PATTERNS.some(pattern => payload.toLowerCase().includes(pattern.toLowerCase()));

    if (isDangerous) {
      await supabase.from('agent_logs').insert([{ user_id: keyData.user_id, agent_id, action_type, payload, status: 'BLOCKED' }]);
      return res.status(403).json({ allowed: false, message: 'Action matches a dangerous security pattern.' });
    }

    await supabase.from('agent_logs').insert([{ user_id: keyData.user_id, agent_id, action_type, payload, status: 'ALLOWED' }]);
    return res.json({ allowed: true, message: 'Action permitted.' });
    
  } catch (err) {
    return res.status(500).json({ allowed: false, message: 'Internal Server Error: ' + err.message });
  }
};
