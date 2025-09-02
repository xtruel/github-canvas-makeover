import process from 'node:process';

const token = process.env.VITE_MAPBOX_TOKEN;
const style = process.env.VITE_MAPBOX_STYLE;

function fail(msg) {
  console.error(`\n[build] ERROR: ${msg}\n`);
  process.exit(1);
}

if (!token || token === 'REPLACE_ME_WITH_ENV_TOKEN' || token === 'REPLACE_ME') {
  fail('Missing or placeholder VITE_MAPBOX_TOKEN. Set it in Netlify (Environment variables) or in a local .env before building.');
}

if (!token.startsWith('pk.')) {
  console.warn('[build] WARNING: VITE_MAPBOX_TOKEN does not start with pk. Are you sure this is a public token?');
}

if (style && !style.startsWith('mapbox://styles/')) {
  console.warn('[build] WARNING: VITE_MAPBOX_STYLE looks unusual:', style);
}

console.log('[build] Mapbox token present (length: ' + token.length + ').');
console.log('[build] Env check passed. Proceeding with Vite build...');
// Optionally you could add a lightweight fetch to validate the style endpoint, but
// that would slow down builds and consume a request. Keeping it simple.