import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const consentParam = url.searchParams.get('consent');
    const consentHeader = req.headers['x-user-consent'];

    if (consentParam !== 'true' || consentHeader !== 'accepted-tos-and-privacy') {
      return res.status(403).json({ error: 'Explicit user consent is required.' });
    }

    const rawName = url.searchParams.get('filename') || 'uploaded_map.kml';
    const safeFilename = rawName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 90);
    if (!/\.(kml|xml)$/i.test(safeFilename)) {
      return res.status(400).json({ error: 'Only .kml or .xml files are allowed.' });
    }

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);
    const rawBody = fileBuffer.toString('utf8');

    if (!rawBody || (!rawBody.toLowerCase().includes('<kml') && !rawBody.toLowerCase().includes('xml'))) {
      return res.status(400).json({ error: 'Invalid KML structure.' });
    }

    const sanitizedKml = rawBody
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<!ENTITY[^>]*>/gi, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Subir a Vercel Blob
    const blob = await put(`kml-uploads/${Date.now()}_${safeFilename}`, sanitizedKml, {
      access: 'public',
      contentType: 'application/vnd.google-earth.kml+xml',
      addRandomSuffix: true
    });

    return res.status(200).json({ ok: true, url: blob.url });
  } catch (err) {
    console.error('KML upload error details:', err);
    // Devuelve el mensaje exacto del error para verlo en la respuesta de la red
    return res.status(500).json({ 
      error: 'Failed to store KML file.', 
      details: err.message || String(err) 
    });
  }
}
