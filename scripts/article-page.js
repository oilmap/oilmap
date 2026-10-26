(function () {
    const BASE = 'https://oilmap.xyz';
// Endpoint del contador: GET ?slug=<slug>&hit=1 debe responder {"views": n}. Vacío = contador oculto.
const VIEW_ENDPOINT = '/api/views';
const LABELS = {
    en: { langName: 'English', ogLocale: 'en_US', home: 'Home', blog: 'Blog', back: 'Back to the blog', by: 'By', published: 'Published', updated: 'Updated', keyPoints: 'Key takeaways', sources: 'Sources', views: 'views' },
    es: { langName: 'Español', ogLocale: 'es_ES', home: 'Inicio', blog: 'Blog', back: 'Volver al blog', by: 'Por', published: 'Publicado', updated: 'Actualizado', keyPoints: 'Puntos clave', sources: 'Fuentes', views: 'vistas' },
    pt: { langName: 'Português', ogLocale: 'pt_BR', home: 'Início', blog: 'Blog', back: 'Voltar ao blog', by: 'Por', published: 'Publicado', updated: 'Atualizado', keyPoints: 'Pontos-chave', sources: 'Fontes', views: 'visualizações' },
    fr: { langName: 'Français', ogLocale: 'fr_FR', home: 'Accueil', blog: 'Blog', back: 'Retour au blog', by: 'Par', published: 'Publié', updated: 'Mis à jour', keyPoints: 'Points clés', sources: 'Sources', views: 'vues' }
};
function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatDate(iso, locale = 'en-US') {
    const d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}
function paragraphs(body) {
    return body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
}

function isSafeHref(href) {
    return /^\/(?!\/)[^\s()]*$/.test(href) || /^https:\/\/oilmap\.xyz(\/[^\s()]*)?$/.test(href);
}

function renderInline(text) {
    const LINK = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;
    let html = '';
    let last = 0;
    for (const m of text.matchAll(LINK)) {
        html += esc(text.slice(last, m.index));
        html += isSafeHref(m[2]) ? `<a href="${esc(m[2])}">${esc(m[1])}</a>` : esc(m[0]);
        last = m.index + m[0].length;
    }
    return html + esc(text.slice(last));
}

function renderBody(text) {
    const out = [];
    let items = [];
    const flush = () => {
        if (items.length) out.push(`<ul>${items.join('')}</ul>`);
        items = [];
    };
    for (const line of text.split('\n').map(l => l.trim()).filter(Boolean)) {
        const bullet = line.match(/^(?:•|- )\s*(.*)$/);
        if (bullet) {
            items.push(`<li>${renderInline(bullet[1])}</li>`);
            continue;
        }
        flush();
        const isHeading = line.length <= 80 && !/[.!?:]$/.test(line);
        out.push(isHeading ? `<h2>${renderInline(line)}</h2>` : `<p>${renderInline(line)}</p>`);
    }
    flush();
    return out.join('\n        ');
}

function parseLines(text) {
    return text.split('\n').map(l => l.trim()).filter(Boolean);
}

function parseSources(text) {
    return parseLines(text).map(line => {
        const [name, url] = line.includes('|') ? line.split('|').map(s => s.trim()) : [line, line];
        return { name: name || url, url };
    }).filter(s => /^https?:\/\//.test(s.url));
}

function wordCount(text) {
    return text.split(/\s+/).filter(Boolean).length;
}
function imageObject(a, url) {
    return {
        '@type': 'ImageObject',
        url,
        caption: a.imageCaption || a.imageAlt || a.title,
        ...(a.imageWidth && { width: Number(a.imageWidth), height: Number(a.imageHeight) })
    };
}

function heroFigure(a) {
    const img = `<img src="${esc(a.image)}"${a.imageSrcset ? ` srcset="${esc(a.imageSrcset)}" sizes="(max-width: 760px) 100vw, 760px"` : ''}${a.imageWidth ? ` width="${esc(a.imageWidth)}" height="${esc(a.imageHeight)}"` : ''} alt="${esc(a.imageAlt || a.title)}" fetchpriority="high" decoding="async">`;
    const caption = a.imageCaption ? `<figcaption>${esc(a.imageCaption)}</figcaption>` : '';
    return `<figure class="hero-figure">${img}${caption}</figure>`;
}

function buildArticlePage(a) {
    const L = LABELS[a.lang] || LABELS.en;
    const url = `${BASE}/blog/${a.slug}.html`;
    const title = a.seoTitle || `${a.title} · World Oil Map`;
    const image = a.image || `${BASE}/img/preview.jpg`;
    const keywords = a.keywords.split(',').map(k => k.trim()).filter(Boolean).join(', ');
    const updated = a.updated || a.date;
    const sources = parseSources(a.sources);
    const points = parseLines(a.keyPoints);
    const ld = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: a.title,
        description: a.summary,
        inLanguage: a.lang,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        datePublished: a.date,
        dateModified: updated,
        image: [imageObject(a, image)],
        keywords,
        articleSection: 'Oil and Gas',
        wordCount: wordCount(a.body),
        author: { '@type': 'Person', name: a.author },
        publisher: { '@type': 'Organization', name: 'World Oil Map', url: BASE, logo: { '@type': 'ImageObject', url: `${BASE}/img/oilmap.png` } },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.lead', '.key-points'] },
        isAccessibleForFree: true
    };
    if (sources.length) ld.citation = sources.map(s => s.url);
    const breadcrumbs = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: L.home, item: `${BASE}/` },
            { '@type': 'ListItem', position: 2, name: L.blog, item: `${BASE}/blog.html` },
            { '@type': 'ListItem', position: 3, name: a.title, item: url }
        ]
    };
    const body = renderBody(a.body);
    const pointsHtml = points.map(p => `<li>${esc(p)}</li>`).join('');
    const sourcesHtml = sources.map(s => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.name)}</a></li>`).join('');
    return `<!DOCTYPE html>
<html lang="${a.lang}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(a.summary)}">
    <meta name="keywords" content="${esc(keywords)}">
    <meta name="author" content="${esc(a.author)}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <link rel="canonical" href="${url}">
    <link rel="icon" type="image/png" href="/img/oilmap.png" sizes="16x16">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="World Oil Map">
    <meta property="og:locale" content="${L.ogLocale}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(a.summary)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${esc(image)}">
    <meta property="article:published_time" content="${a.date}">
    <meta property="article:modified_time" content="${updated}">
    <meta property="article:author" content="${esc(a.author)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(a.summary)}">
    <meta name="twitter:image" content="${esc(image)}">
    <meta property="og:image:alt" content="${esc(a.imageAlt || a.title)}">
    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}<\/script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbs).replace(/</g, '\\u003c')}<\/script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
body { margin: 0; font-family: 'Inter', sans-serif; background: #0f172a; color: #f1f5f9; line-height: 1.7; }
header { background: #020617; border-bottom: 1px solid #334155; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
header a { color: #f0b823; text-decoration: none; font-weight: 600; letter-spacing: 1px; font-size: 1rem; }
nav a { color: #aaa; text-decoration: none; font-size: 14px; margin-left: 15px; }
article { max-width: 760px; margin: 0 auto; padding: 30px 20px 60px; }
.meta { color: #10b981; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.lang-badge { background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 4px; margin-right: 6px; }
h1 { font-size: 2rem; line-height: 1.25; margin: 8px 0 12px; }
.byline { color: #94a3b8; font-size: 0.9rem; margin: 0 0 16px; }
.views { color: #10b981; }
.lead { color: #94a3b8; font-size: 1.1rem; }
.key-points { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
.key-points ul { margin: 0; padding-left: 20px; color: #cbd5e1; }
.key-points h2, .sources h2 { font-size: 0.85rem; color: #f0b823; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px; }
article img { width: 100%; height: auto; border-radius: 12px; border: 1px solid #334155; }
.hero-figure { margin: 20px 0; }
.hero-figure figcaption { color: #94a3b8; font-size: 0.85rem; margin-top: 8px; }
article p { color: #cbd5e1; }
.sources { margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; font-size: 0.9rem; }
.sources ul { padding-left: 20px; margin: 0; }
.sources a { color: #34d399; }
.back { display: inline-block; margin-top: 30px; color: #10b981; text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>
    <header>
<a href="/">WORLD OIL MAP 2026</a>
<nav><a href="/blog.html">${L.blog}</a><a href="/">${L.home}</a></nav>
    </header>
    <main>
    <article>
<div class="meta"><span class="lang-badge">${esc(L.langName)}</span><time datetime="${a.date}">${esc(formatDate(a.date, a.lang))}</time></div>
<h1>${esc(a.title)}</h1>
<p class="byline">${L.by} ${esc(a.author)} · ${L.published} <time datetime="${a.date}">${esc(formatDate(a.date, a.lang))}</time> · ${L.updated} <time datetime="${updated}">${esc(formatDate(updated, a.lang))}</time> · <span class="views" id="views" hidden data-label="${esc(L.views)}"></span></p>
<p class="lead">${esc(a.summary)}</p>
${points.length ? `<section class="key-points"><h2>${L.keyPoints}</h2><ul>${pointsHtml}</ul></section>` : ''}
${a.image ? heroFigure(a) : ''}
${body}
${sources.length ? `<section class="sources"><h2>${L.sources}</h2><ul>${sourcesHtml}</ul></section>` : ''}
<a class="back" href="/blog.html">${L.back}</a>
    </article>
    </main>
    <script>
(function () {
    var endpoint = ${JSON.stringify(VIEW_ENDPOINT)};
    var el = document.getElementById('views');
    if (!endpoint || !el) return;
    var sep = endpoint.indexOf('?') === -1 ? '?' : '&';
    fetch(endpoint + sep + 'slug=' + encodeURIComponent(${JSON.stringify(a.slug)}) + '&hit=1')
        .then(function (r) { return r.json(); })
        .then(function (d) {
            if (typeof d.views !== 'number') return;
            el.textContent = Number(d.views).toLocaleString(${JSON.stringify(a.lang)}) + ' ' + el.dataset.label;
            el.hidden = false;
        })
        .catch(function () {});
})();
    <\/script>
</body>
</html>
`;
}
    const api = { LABELS, paragraphs, parseLines, parseSources, wordCount, isSafeHref, buildArticlePage };
    if (typeof module !== 'undefined') module.exports = api;
    else window.ArticlePage = api;
})();
