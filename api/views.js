// api/views.js — contador de vistas: Vercel Function + Firestore (firebase-admin)
// GET /api/views?slug=<slug>[&hit=1]  ->  {"views": n}
// Si algo falla, responde {"error":"<CODIGO>"} para saber qué corregir (nunca muestra secretos).

const SITE = (process.env.SITE_URL || 'https://oilmap.xyz').replace(/\/$/, '');
const ALLOWED = (process.env.ALLOWED_ORIGINS || 'https://oilmap.xyz,https://www.oilmap.xyz').split(',');
const SLUG = /^[a-z0-9-]{1,80}$/;
const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless/i;

const fail = tag => Object.assign(new Error(tag), { tag });
let db, FieldValue;

function getDb() {
  if (db) return db;
  let app, fs;
  try {
    app = require('firebase-admin/app');
    fs = require('firebase-admin/firestore');
  } catch { throw fail('MODULE_MISSING'); }            // falta firebase-admin en package.json
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw fail('ENV_MISSING');                  // la variable no existe en este despliegue
  let cred;
  try { cred = JSON.parse(raw); } catch { throw fail('ENV_NOT_JSON'); }   // JSON incompleto o alterado
  try {
    if (!app.getApps().length) app.initializeApp({ credential: app.cert(cred) });
  } catch { throw fail('ENV_BAD_CREDENTIAL'); }         // falta project_id, private_key o client_email
  FieldValue = fs.FieldValue;
  db = fs.getFirestore();
  return db;
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { slug, hit } = req.query;
  if (!SLUG.test(slug || '')) return res.status(400).json({ error: 'INVALID_SLUG' });

  try {
    const ref = getDb().collection('views').doc(slug);
    if (hit === '1' && !BOTS.test(req.headers['user-agent'] || '')) {
      // Solo cuenta si el artículo existe de verdad (evita crear contadores falsos)
      const exists = await fetch(`${SITE}/blog/${slug}/`, { method: 'HEAD' }).then(r => r.ok).catch(() => false);
      if (exists) await ref.set({ views: FieldValue.increment(1) }, { merge: true });
    }
    const snap = await ref.get();
    return res.status(200).json({ views: snap.exists ? snap.data().views || 0 : 0 });
  } catch (e) {
    console.error('views error:', e.tag || e.code || 'UNKNOWN');
    return res.status(500).json({ error: e.tag || 'FIRESTORE_ERROR', code: e.code });
  }
};
