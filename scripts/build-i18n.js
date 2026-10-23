const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const BASE = 'https://oilmap.xyz';
const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const i18nStart = src.indexOf('const i18n = {');
const i18nEnd = src.indexOf('let currentLang');
const i18n = vm.runInNewContext(`${src.slice(i18nStart, i18nEnd)} i18n`);

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

const alternates = () => [
    `<link rel="alternate" hreflang="en" href="${BASE}/">`,
    `<link rel="alternate" hreflang="es" href="${BASE}/es/">`,
    `<link rel="alternate" hreflang="fr" href="${BASE}/fr/">`,
    `<link rel="alternate" hreflang="x-default" href="${BASE}/">`,
].join('\n    ');

const setMeta = (html, key, value) => {
    const re = new RegExp(`(<meta (?:name|property)="${key}" content=")[^"]*"`);
    if (!re.test(html)) throw new Error(`missing meta ${key}`);
    return html.replace(re, (_, p) => `${p}${esc(value)}"`);
};

for (const lang of Object.keys(SEO)) {
    const seo = SEO[lang];
    const dict = i18n[lang];
    const pagePath = `/${lang}/`;
    let html = src;

    html = html.replace('<html lang="en" dir="ltr">', `<html lang="${lang}" dir="ltr">`);
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(seo.title)}</title>`);
    html = setMeta(html, 'description', seo.description);
    html = setMeta(html, 'og:title', seo.ogTitle);
    html = setMeta(html, 'og:description', seo.ogDescription);
    html = setMeta(html, 'og:url', `${BASE}${pagePath}`);
    html = setMeta(html, 'twitter:title', seo.ogTitle);
    html = setMeta(html, 'twitter:description', seo.ogDescription);
    html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${BASE}${pagePath}">`);
    html = html.replace(/<link rel="alternate" hreflang="en" href="[^"]*">\s*<link rel="alternate" hreflang="es" href="[^"]*">\s*<link rel="alternate" hreflang="fr" href="[^"]*">\s*<link rel="alternate" hreflang="x-default" href="[^"]*">/, alternates());

    html = html.replace(/(src|href)="(?!https?:|mailto:|#|\/|data:)\.?\/?([^"]+)"/g, '$1="/$2"');

    html = html.replace('<option value="en" selected>', '<option value="en">');
    html = html.replace(`<option value="${lang}">`, `<option value="${lang}" selected>`);
    html = html.replace("let currentLang = 'en';", `let currentLang = '${lang}';`);

    let missing = 0;
    html = html.replace(/(<([a-zA-Z][\w-]*)\b[^>]*?\sdata-i18n="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g, (m, open, _tag, key, _text, close) => {
        if (!dict[key]) { missing++; return m; }
        return `${open}${esc(dict[key])}${close}`;
    });
    html = html.replace(/(<[^>]*?data-i18n-ph="([^"]+)"[^>]*?\splaceholder=")[^"]*(")/g, (m, pre, key, post) => {
        if (!dict[key]) { missing++; return m; }
        return `${pre}${esc(dict[key])}${post}`;
    });

    fs.mkdirSync(path.join(root, lang), { recursive: true });
    fs.writeFileSync(path.join(root, lang, 'index.html'), html);
    console.log(`${lang}/index.html written, untranslated keys: ${missing}`);
}
