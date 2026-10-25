// api/upload.js — sube imágenes WebP del editor a Firebase Storage (firebase-admin)
// POST /api/upload  header x-editor-token  body {"name":"<slug>-480w.webp","data":"<base64>"}  ->  {"url": "..."}
// Requiere FIREBASE_SERVICE_ACCOUNT, FIREBASE_STORAGE_BUCKET y EDITOR_TOKEN.

const crypto = require('crypto');

const NAME = /^[a-z0-9-]{1,100}\.webp$/;
const MAX_BYTES = 400 * 1024;
const FOLDER = 'blog-images';

let bucket;

function getBucket() {
  if (bucket) return bucket;
  const app = require('firebase-admin/app');
  const { getStorage } = require('firebase-admin/storage');
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const name = process.env.FIREBASE_STORAGE_BUCKET;
  if (!raw || !name) throw Object.assign(new Error('ENV_MISSING'), { tag: 'ENV_MISSING' });
  if (!app.getApps().length) {
    app.initializeApp({ credential: app.cert(JSON.parse(raw)), storageBucket: name });
  }
  bucket = getStorage().bucket(name);
  return bucket;
}

function authorized(token) {
  const expected = process.env.EDITOR_TOKEN || '';
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function isWebp(buf) {
  return buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  if (!authorized(req.headers['x-editor-token'])) return res.status(401).json({ error: 'UNAUTHORIZED' });

  const { name, data } = req.body || {};
  if (!NAME.test(name || '') || typeof data !== 'string') return res.status(400).json({ error: 'INVALID_BODY' });

  const buf = Buffer.from(data, 'base64');
  if (!isWebp(buf)) return res.status(400).json({ error: 'NOT_WEBP' });
  if (buf.length > MAX_BYTES) return res.status(413).json({ error: 'TOO_LARGE' });

  try {
    const bkt = getBucket();
    let finalName = name;
    const [exists] = await bkt.file(`${FOLDER}/${finalName}`).exists();
    if (exists) finalName = name.replace(/\.webp$/, `-${crypto.randomBytes(3).toString('hex')}.webp`);

    await bkt.file(`${FOLDER}/${finalName}`).save(buf, {
      resumable: false,
      contentType: 'image/webp',
      metadata: { cacheControl: 'public, max-age=31536000, immutable' }
    });
    return res.status(200).json({ url: `https://storage.googleapis.com/${bkt.name}/${FOLDER}/${finalName}` });
  } catch (e) {
    console.error('upload error:', e.tag || e.code || 'UNKNOWN');
    return res.status(500).json({ error: e.tag || 'STORAGE_ERROR', code: e.code });
  }
};
