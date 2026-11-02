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
    const extMatch = safeFilename.match(/\.(kml|xml|gpx|geojson|json|zip|shp)$/i);

    if (!extMatch) {
      return res.status(400).json({
        error: 'Only .kml, .xml, .gpx, .geojson, .json, .zip, or .shp files are allowed.'
      });
    }

    const ext = extMatch[1].toLowerCase();

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: 'Empty file payload.' });
    }

    // Límite de seguridad de 4.5 MB
    if (fileBuffer.length > 4.5 * 1024 * 1024) {
      return res.status(413).json({ error: 'File exceeds the 4.5 MB limit.' });
    }

    let bodyToStore = fileBuffer;
    let contentType = 'application/octet-stream';

    if (ext === 'kml' || ext === 'xml' || ext === 'gpx') {
      const rawBody = fileBuffer.toString('utf8');
      const lower = rawBody.toLowerCase();

      if (!lower.includes('<kml') && !lower.includes('<gpx') && !lower.includes('xml')) {
        return res.status(400).json({ error: 'Invalid XML/KML/GPX structure.' });
      }

      bodyToStore = rawBody
        .replace(/<!DOCTYPE[^>]*>/gi, '')
        .replace(/<!ENTITY[^>]*>/gi, '')
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

      contentType = ext === 'gpx'
        ? 'application/gpx+xml'
        : 'application/vnd.google-earth.kml+xml';

    } else if (ext === 'geojson' || ext === 'json') {
      const rawBody = fileBuffer.toString('utf8');
      let parsed;
      try {
        parsed = JSON.parse(rawBody);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid GeoJSON format.' });
      }

      if (!parsed || typeof parsed !== 'object' || (!parsed.type && !parsed.features)) {
        return res.status(400).json({ error: 'Invalid GeoJSON object structure.' });
      }

      bodyToStore = rawBody.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      contentType = 'application/geo+json';

    } else if (ext === 'zip') {
      // Verificar firma binaria PK (0x50 0x4B) de un archivo ZIP válido
      if (fileBuffer.length < 4 || fileBuffer[0] !== 0x50 || fileBuffer[1] !== 0x4B) {
        return res.status(400).json({ error: 'Invalid ZIP archive header for Shapefile.' });
      }
      contentType = 'application/zip';

    } else if (ext === 'shp') {
      // Verificar código mágico ESRI Shapefile (9994 en Big-Endian en los primeros 4 bytes)
      if (fileBuffer.length < 100 || fileBuffer.readInt32BE(0) !== 9994) {
        return res.status(400).json({ error: 'Invalid binary ESRI .shp header.' });
      }
      contentType = 'application/octet-stream';
    }

    // Subir a Vercel Blob manteniendo tu ruta kml-uploads/
    const blob = await put(`kml-uploads/${Date.now()}_${safeFilename}`, bodyToStore, {
      access: 'public',
      contentType,
      addRandomSuffix: true
    });

    return res.status(200).json({ ok: true, url: blob.url, format: ext });
  } catch (err) {
    console.error('GIS upload error details:', err);
    return res.status(500).json({
      error: 'Failed to store GIS file.',
      details: err.message || String(err)
    });
  }
}
