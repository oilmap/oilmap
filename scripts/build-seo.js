const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const BASE = 'https://oilmap.xyz';
const HOME_ALTERNATES = [
    { lang: 'en', href: `${BASE}/` },
    { lang: 'es', href: `${BASE}/es/` },
    { lang: 'fr', href: `${BASE}/fr/` },
    { lang: 'x-default', href: `${BASE}/` },
];

const PAGES = [
    { path: '/', priority: '1.0', alternates: HOME_ALTERNATES },
    { path: '/es/', priority: '0.9', alternates: HOME_ALTERNATES },
    { path: '/fr/', priority: '0.9', alternates: HOME_ALTERNATES },
    { path: '/blog.html', priority: '0.9' },
    { path: '/venezuela_petroleum_market.html', priority: '0.8' },
    { path: '/uae_petroleum_market.html', priority: '0.8' },
    { path: '/nigeria_petroleum_market.html', priority: '0.8' },
    { path: '/argentina_petroleum_market.html', priority: '0.8' },
    { path: '/iran_petroleum_market.html', priority: '0.8' },
    { path: '/data_lineage.html', priority: '0.8' },
    { path: '/cited-by.html', priority: '0.8' },
    { path: '/contact.html', priority: '0.5' },
    { path: '/privacy-policy.html', priority: '0.3' },
];

const articles = JSON.parse(fs.readFileSync(path.join(root, 'data/news.json'), 'utf8'))
    .sort((a, b) => b.date.localeCompare(a.date));

const pageUrl = p => {
    const alternates = (p.alternates || []).map(a =>
        `<xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.href}"/>`).join('');
    return `<url><loc>${BASE}${p.path}</loc>${alternates}<priority>${p.priority}</priority></url>`;
};

const postUrl = a =>
    `<url><loc>${BASE}/blog/${a.slug}.html</loc><lastmod>${a.updated || a.date}</lastmod><priority>0.7</priority></url>`;

const urlset = (urls, withAlternates) =>
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${withAlternates ? ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' : ''}>
${urls.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(root, 'sitemap-pages.xml'),
    urlset(PAGES.map(pageUrl), true));

fs.writeFileSync(path.join(root, 'sitemap-posts.xml'),
    urlset(articles.map(postUrl), false));

fs.writeFileSync(path.join(root, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${BASE}/sitemap-pages.xml</loc></sitemap>
  <sitemap><loc>${BASE}/sitemap-posts.xml</loc></sitemap>
</sitemapindex>
`);

const news = articles.map(a =>
    `- [${a.title}](${BASE}/blog/${a.slug}.html): ${(a.summary || '').replace(/\s+/g, ' ').trim()}`
);

fs.writeFileSync(path.join(root, 'llms.txt'),
`# World Oil Map

> World Oil Map is an open-source interactive map of global oil and gas infrastructure, including wells, pipelines, refineries and LNG facilities, built from official national datasets and the OGIM v2.7 database. The site also publishes oil market news.

## Key pages
- [Home](${BASE}/): interactive map of oil and gas exploration, production and infrastructure
- [Blog](${BASE}/blog.html): oil market, OPEC, upstream and downstream news
- [Data lineage](${BASE}/data_lineage.html): official source references and citation details for the data
- [Cited by](${BASE}/cited-by.html): publications, courses and recognitions that cite or use the project
- [Contact](${BASE}/contact.html): data corrections, research collaboration and data sharing

## News
${news.join('\n') || '- No articles yet'}
`);
