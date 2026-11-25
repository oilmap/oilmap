export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';
  const referer = req.headers.get('referer') || '';

  const isAllowed =
    origin.includes('oilmap.xyz') ||
    referer.includes('oilmap.xyz') ||
    origin.includes('localhost');

  if (!isAllowed) {
    return new Response('Forbidden', { status: 403 });
  }

  const incomingUrl = new URL(req.url);
  const targetPath = incomingUrl.searchParams.get('path') || '';

  if (!targetPath.startsWith('/')) {
    return new Response('Invalid path', { status: 400 });
  }

  const mapboxUrl = new URL(`https://api.mapbox.com${targetPath}`);

  // Copiar parámetros originales excepto "path" y "access_token"
  for (const [key, value] of incomingUrl.searchParams.entries()) {
    if (key !== 'path' && key !== 'access_token') {
      mapboxUrl.searchParams.set(key, value);
    }
  }

  mapboxUrl.searchParams.set('access_token', process.env.MAPBOX_SECRET_TOKEN);

  const mapboxRes = await fetch(mapboxUrl.toString());

  const headers = new Headers(mapboxRes.headers);
  headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');

  return new Response(mapboxRes.body, {
    status: mapboxRes.status,
    headers,
  });
}
