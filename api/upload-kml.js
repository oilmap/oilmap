import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const consentParam = url.searchParams.get('consent');
    const consentHeader = req.headers['x-user-consent'];

    // 1. Verificación estricta de consentimiento RGPD / ToS
    if (consentParam !== 'true' || consentHeader !== 'accepted-tos-and-privacy') {
      return res.status(403).json({ error: 'Explicit user consent is required.' });
    }

    // 2. Sanitizar nombre de archivo
    const rawName = url.searchParams.get('filename') || 'uploaded_map.kml';
    const safeFilename = rawName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 90);
    if (!/\.(kml|xml)$/i.test(safeFilename)) {
      return res.status(400).json({ error: 'Only .kml or .xml files are allowed.' });
    }

    // 3. Leer y validar el cuerpo del KML
    const rawBody = typeof req.body === 'string' ? req.body : Buffer.from(req.body || '').toString('utf-8');
    if (!rawBody || !rawBody.includes('<kml')) {
      return res.status(400).json({ error: 'Invalid KML structure.' });
    }

    // 4. Saneamiento de seguridad en servidor contra XXE y scripts
    const sanitizedKml = rawBody
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<!ENTITY[^>]*>/gi, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // 5. Guardar en Vercel Blob (carpeta kml-uploads/)
    const blob = await put(`kml-uploads/${Date.now()}_${safeFilename}`, sanitizedKml, {
      access: 'public', // o 'private' si solo los revisarás desde tu dashboard de Vercel
      contentType: 'application/vnd.google-earth.kml+xml',
      addRandomSuffix: true
    });

    return res.status(200).json({ ok: true, url: blob.url });
  } catch (err) {
    console.error('KML upload error:', err);
    return res.status(500).json({ error: 'Failed to store KML file.' });
  }
}