// api/views.js — contador de vistas: Vercel Function + Firestore (firebase-admin)
// GET /api/views?slug=<slug>[&hit=1]  ->  {"views": n}
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}
const db = getFirestore();

const SITE = (process.env.SITE_URL || 'https://oilmap.xyz').replace(/\/$/, '');
const ALLOWED = (process.env.ALLOWED_ORIGINS || 'https://oilmap.xyz,https://www.oilmap.xyz').split(',');
const SLUG = /^[a-z0-9-]{1,80}$/;
const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless/i;

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { slug, hit } = req.query;
  if (!SLUG.test(slug || '')) return res.status(400).json({ error: 'invalid slug' });

  try {
    const ref = db.collection('views').doc(slug);
    if (hit === '1' && !BOTS.test(req.headers['user-agent'] || '')) {
      // Solo cuenta si el artículo existe de verdad (evita crear contadores falsos)
      const exists = await fetch(`${SITE}/blog/${slug}/`, { method: 'HEAD' }).then(r => r.ok).catch(() => false);
      if (exists) await ref.set({ views: FieldValue.increment(1) }, { merge: true });
    }
    const snap = await ref.get();
    return res.status(200).json({ views: snap.exists ? snap.data().views || 0 : 0 });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server error' });
  }
};
