export const config = {
  runtime: 'edge',
};

const ALLOWED_ORIGINS = [
  'https://oilmap.xyz',
  'https://www.oilmap.xyz',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function isAllowedRequest(req) {
  const origin = req.headers.get('origin') || '';
  const referer = req.headers.get('referer') || '';

  if (origin) {
    return ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
  }
  if (referer) {
    return ALLOWED_ORIGINS.some((o) => referer.startsWith(o));
  }
  // Permite peticiones directas de navegación/tiles sin Origin ni Referer explícito
  return true;
}

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://www.oilmap.xyz';

  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (!isAllowedRequest(req)) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  const secretToken = process.env.MAPBOX_SECRET_TOKEN;
  if (!secretToken) {
    return new Response('Missing MAPBOX_SECRET_TOKEN', { status: 500, headers: corsHeaders });
  }

  const incomingUrl = new URL(req.url);
  const targetPath = incomingUrl.searchParams.get('path') || '';

  if (!targetPath.startsWith('/')) {
    return new Response('Invalid path', { status: 400, headers: corsHeaders });
  }

  const isEvents = targetPath.startsWith('/events');
  const baseHost = isEvents ? 'https://events.mapbox.com' : 'https://api.mapbox.com';
  const mapboxUrl = new URL(`${baseHost}${targetPath}`);

  for (const [key, value] of incomingUrl.searchParams.entries()) {
    if (key !== 'path' && key !== 'access_token') {
      mapboxUrl.searchParams.set(key, value);
    }
  }
  mapboxUrl.searchParams.set('access_token', secretToken);

  const fetchOptions = {
    method: req.method,
    headers: {
      'Content-Type': req.headers.get('content-type') || 'application/json',
    },
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    fetchOptions.body = await req.text();
  }

  const mapboxRes = await fetch(mapboxUrl.toString(), fetchOptions);

  const responseHeaders = new Headers(corsHeaders);
  const contentType = mapboxRes.headers.get('content-type');
  if (contentType) responseHeaders.set('Content-Type', contentType);
  responseHeaders.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');

  return new Response(mapboxRes.body, {
    status: mapboxRes.status,
    headers: responseHeaders,
  });
}
