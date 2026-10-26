import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
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

const HEADER_I18N = {
    es: [
        ['aria-label="Scroll left"', 'aria-label="Desplazar a la izquierda"'],
        ['aria-label="Scroll right"', 'aria-label="Desplazar a la derecha"'],
        ['placeholder="🔍 Search Block or Country..."', 'placeholder="🔍 Buscar bloque o país..."'],
        ['aria-label="Search"', 'aria-label="Buscar"'],
        ['aria-label="Map Controls"', 'aria-label="Controles del mapa"'],
        ['<span>🗂️ Layers ▾</span>', '<span>🗂️ Capas ▾</span>'],
        ['<span>📊 Intelligence ▾</span>', '<span>📊 Inteligencia ▾</span>'],
        ['<span>🛠️ Tools ▾</span>', '<span>🛠️ Herramientas ▾</span>'],
        ['<span>Contact</span>', '<span>Contacto</span>'],
        ['<span>Sources ▾</span>', '<span>Fuentes ▾</span>'],
        ['aria-label="Select Language"', 'aria-label="Seleccionar idioma"'],
    ],
    fr: [
        ['aria-label="Scroll left"', 'aria-label="Défiler vers la gauche"'],
        ['aria-label="Scroll right"', 'aria-label="Défiler vers la droite"'],
        ['placeholder="🔍 Search Block or Country..."', 'placeholder="🔍 Rechercher un bloc ou un pays..."'],
        ['aria-label="Search"', 'aria-label="Rechercher"'],
        ['aria-label="Map Controls"', 'aria-label="Contrôles de la carte"'],
        ['<span>🗂️ Layers ▾</span>', '<span>🗂️ Couches ▾</span>'],
        ['<span>🛠️ Tools ▾</span>', '<span>🛠️ Outils ▾</span>'],
        ['aria-label="Select Language"', 'aria-label="Sélectionner la langue"'],
    ],
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const setMeta = (html, key, value) => {
    const re = new RegExp(`(<meta (?:name|property)="${key}" content=")[^"]*"`);
    if (!re.test(html)) return html;
    return html.replace(re, (_, p) => `${p}${esc(value)}"`);
};

const translateHeader = (html, lang) => {
    const headerRe = /<header[\s\S]*?<\/header>/;
    const header = html.match(headerRe)[0];
    let translated = header;
    for (const [from, to] of HEADER_I18N[lang]) {
        if (!translated.includes(from)) {
            console.warn(`[${lang}] header string not found: ${from}`);
            continue;
        }
        translated = translated.split(from).join(to);
    }
    return html.replace(header, translated);
};

const toRootRelative = html => html
    .replace(/(\s(?:href|src)=")\.\//g, '$1/')
    .replace(/(\s(?:href|src)=")(?!https?:|mailto:|#|\/|data:|javascript:)([^"]*)"/g, '$1/$2"')
    .replace("s.src = 'data/geocoder.js';", "s.src = '/data/geocoder.js';");

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
    html = translateHeader(html, lang);
    html = toRootRelative(html);

    fs.mkdirSync(path.join(root, lang), { recursive: true });
    fs.writeFileSync(path.join(root, lang, 'index.html'), html);
    console.log(`${lang}/index.html written successfully`);
}
