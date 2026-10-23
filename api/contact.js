// api/contact.js — guarda mensajes del formulario de contacto en Firestore
// POST /api/contact  body JSON: {name, email, subject, message, website}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { name: 100, email: 150, subject: 150, message: 3000 };

let db, FieldValue;

function getDb() {
  if (db) return db;
  const app = require('firebase-admin/app');
  const fs = require('firebase-admin/firestore');
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw Object.assign(new Error('ENV_MISSING'), { tag: 'ENV_MISSING' });
  if (!app.getApps().length) {
    app.initializeApp({ credential: app.cert(JSON.parse(raw)) });
  }
  FieldValue = fs.FieldValue;
  db = fs.getFirestore();
  return db;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};

  // Campo trampa: los humanos no lo rellenan, los bots suelen hacerlo
  if (body.website) return res.status(200).json({ ok: true });

  const clean = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    const value = typeof body[key] === 'string' ? body[key].trim() : '';
    if (!value || value.length > max) return res.status(400).json({ error: 'INVALID_' + key.toUpperCase() });
    clean[key] = value;
  }
  if (!EMAIL.test(clean.email)) return res.status(400).json({ error: 'INVALID_EMAIL' });

  try {
    await getDb().collection('contacts').add({
      ...clean,
      createdAt: FieldValue.serverTimestamp(),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 300),
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('contact error:', e.tag || e.code || 'UNKNOWN');
    return res.status(500).json({ error: e.tag || 'FIRESTORE_ERROR' });
  }
};
