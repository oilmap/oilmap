const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const BASE = 'https://oilmap.xyz';
const indexPath = path.join(root, 'index.html');

if (!fs.existsSync(indexPath)) {
    console.log('index.html not found, skipping i18n build.');
    process.exit(0);
}

const src = fs.readFileSync(indexPath, 'utf8');

const SEO = {
    es: {
        title: 'World Oil Map 2026 | Mapa Mundial del Petróleo: Upstream, Downstream y Precios del Crudo',
        description: 'Plataforma interactiva de inteligencia de localización para la industria del petróleo y gas. Explore bloques petroleros, refinerías, oleoductos, precios del crudo en tiempo real y datos de producción de la EIA.',
        ogTitle: 'World Oil Map 2026 | Inteligencia Global de Petróleo y Gas',
        ogDescription: 'Inteligencia espacial interactiva sobre Upstream, Downstream, oleoductos y referencias de crudo en vivo.',
    },
    fr: {
        title: 'World Oil Map 2026 | Carte mondiale du pétrole : Amont, Aval et prix du brut',
        description: "Plateforme interactive d'intelligence géographique pour l'industrie pétrolière et gazière. Explorez les blocs pétroliers, raffineries, pipelines, prix du brut en temps réel et données de production de l'EIA.",
        ogTitle: 'World Oil Map 2026 | Intelligence mondiale pétrole et gaz',
        ogDescription: "Intelligence spatiale interactive sur l'amont, l'aval, les pipelines et les références de brut en direct.",
    },
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const setMeta = (html, key, value) => {
    const re = new RegExp(`(<meta (?:name|property)="${key}" content=")[^"]*"`);
    if (!re.test(html)) return html;
    return html.replace(re, (_, p) => `${p}${esc(value)}"`);
};

for (const lang of Object.keys(SEO)) {
    const seo = SEO[lang];
    const pagePath = `/${lang}/`;
    let html = src;

    html = html.replace('<html lang="en">', `<html lang="${lang}">`);
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(seo.title)}</title>`);
    html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${BASE}${pagePath}">`);
    html = setMeta(html, 'description', seo.description);
    html = setMeta(html, 'og:title', seo.ogTitle);
    html = setMeta(html, 'og:description', seo.ogDescription);
    html = setMeta(html, 'og:url', `${BASE}${pagePath}`);
    html = setMeta(html, 'twitter:title', seo.ogTitle);
    html = setMeta(html, 'twitter:description', seo.ogDescription);

    fs.mkdirSync(path.join(root, lang), { recursive: true });
    fs.writeFileSync(path.join(root, lang, 'index.html'), html);
    console.log(`${lang}/index.html written successfully`);
}
