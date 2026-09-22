// Read-only availability check. Never prints credentials or financial records.
import { loadEnv } from 'vite';
const env = loadEnv('development', process.cwd(), 'VITE_');
const response = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/rpc/finance_dataset`, {
  method: 'POST',
  headers: { apikey: env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
  body: '{}',
});
const result = await response.json();
console.log(JSON.stringify({ status: response.status, code: result.code, message: result.message }));
