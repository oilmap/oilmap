// api/upload.js — guarda imágenes WebP del editor en img/blog_img/ mediante la API de contenidos de GitHub
// POST /api/upload  header x-editor-token  body {"name":"<slug>-480w.webp","data":"<base64>"}  ->  {"url": "..."}
// Requiere GITHUB_TOKEN (contents: write), GITHUB_REPO ("owner/repo"), EDITOR_TOKEN y opcionalmente GITHUB_BRANCH.

const crypto = require('crypto');

const NAME = /^[a-z0-9-]{1,100}\.webp$/;
const MAX_BYTES = 400 * 1024;
const FOLDER = 'img/blog_img';
const SITE = 'https://oilmap.xyz';

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

async function github(path, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) throw Object.assign(new Error('ENV_MISSING'), { tag: 'ENV_MISSING' });
  return fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body && { 'Content-Type': 'application/json' }),
      ...options.headers
    }
  });
}

async function exists(path, branch) {
  const res = await github(`${path}?ref=${encodeURIComponent(branch)}`);
  if (res.status === 404) return false;
  if (!res.ok) throw Object.assign(new Error('GITHUB_ERROR'), { tag: 'GITHUB_ERROR', code: res.status });
  return true;
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
    const branch = process.env.GITHUB_BRANCH || 'main';
    let finalName = name;
    if (await exists(`${FOLDER}/${finalName}`, branch)) {
      finalName = name.replace(/\.webp$/, `-${crypto.randomBytes(3).toString('hex')}.webp`);
    }

    const path = `${FOLDER}/${finalName}`;
    const put = await github(path, {
      method: 'PUT',
      body: JSON.stringify({
        message: `Add blog image ${finalName}`,
        content: buf.toString('base64'),
        branch
      })
    });
    if (!put.ok) throw Object.assign(new Error('GITHUB_ERROR'), { tag: 'GITHUB_ERROR', code: put.status });

    return res.status(200).json({ url: `${SITE}/${path}` });
  } catch (e) {
    console.error('upload error:', e.tag || e.code || 'UNKNOWN');
    return res.status(500).json({ error: e.tag || 'GITHUB_ERROR', code: e.code });
  }
};
