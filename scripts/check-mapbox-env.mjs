import process from 'node:process';

const token = process.env.VITE_MAPBOX_TOKEN;
const style = process.env.VITE_MAPBOX_STYLE;
const context = process.env.CONTEXT || ''; // Netlify contexts: production | deploy-preview | branch-deploy

function fail(msg) {
  console.error(`\n[build] ERROR: ${msg}\n`);
  process.exit(1);
}

// Relax requirements only for deploy-preview so previews build even if token is missing.
if (!token || token === 'REPLACE_ME_WITH_ENV_TOKEN' || token === 'REPLACE_ME') {
  if (context === 'deploy-preview') {
    console.warn('[build] WARNING: VITE_MAPBOX_TOKEN mancante nel deploy-preview. La mappa mostrerà un errore a runtime, ma la build continua.');
  } else {
    fail('Missing or placeholder VITE_MAPBOX_TOKEN. Imposta la variabile ambiente (Netlify) o aggiungila al file .env prima della build.');
  }
} else {
  if (!token.startsWith('pk.')) {
    console.warn('[build] WARNING: VITE_MAPBOX_TOKEN non inizia con pk. Verifica che sia un token pubblico valido.');
  }
  console.log('[build] Mapbox token presente (length: ' + token.length + ').');
}

if (style && !style.startsWith('mapbox://styles/')) {
  console.warn('[build] WARNING: VITE_MAPBOX_STYLE valore inusuale:', style);
}

console.log('[build] CONTEXT:', context || '(vuoto)');
console.log('[build] Env check completato.');
