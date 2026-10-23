const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const BASE = 'https://oilmap.xyz';
const STATIC = [
    { path: '/', priority: '1.0' },
    { path: '/blog.html', priority: '0.9' },
    { path: '/es/', priority: '0.9' },
    { path: '/fr/', priority: '0.9' },
    { path: '/data_lineage.html', priority: '0.8' },
    { path: '/cited-by.html', priority: '0.8' },
];

const articles = JSON.parse(fs.readFileSync(path.join(root, 'data/news.json'), 'utf8'))
    .sort((a, b) => b.date.localeCompare(a.date));

const urls = [
    ...STATIC.map(s => `<url><loc>${BASE}${s.path}</loc><priority>${s.priority}</priority></url>`),
    ...articles.map(a => `<url><loc>${BASE}/blog/${a.slug}.html</loc><lastmod>${a.updated || a.date}</lastmod><priority>0.7</priority></url>`),
];

fs.writeFileSync(path.join(root, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
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
