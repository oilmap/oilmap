const fs = require('fs');
const path = require('path');
const { LABELS } = require('./article-page');

const FILE = path.join(__dirname, '..', 'data', 'news.json');
const REQUIRED = ['id', 'title', 'slug', 'lang', 'date', 'summary', 'body'];
const SLUG = /^[a-z0-9-]{1,80}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(iso) {
    if (!DATE.test(iso)) return false;
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function validate(articles) {
    if (!Array.isArray(articles)) throw new Error('data/news.json debe contener un array');
    const ids = new Set();
    const slugs = new Set();
    articles.forEach((a, i) => {
        const where = `data/news.json entrada ${i} (${a && a.slug})`;
        if (!a || typeof a !== 'object') throw new Error(`${where}: no es un objeto`);
        for (const field of REQUIRED) {
            if (typeof a[field] !== 'string' || !a[field].trim()) throw new Error(`${where}: falta "${field}"`);
        }
        if (!SLUG.test(a.slug)) throw new Error(`${where}: slug inválido (solo a-z, 0-9 y guiones)`);
        if (!LABELS[a.lang]) throw new Error(`${where}: idioma "${a.lang}" no soportado`);
        if (!isRealDate(a.date)) throw new Error(`${where}: fecha "${a.date}" inválida (usa AAAA-MM-DD)`);
        if (a.updated && !isRealDate(a.updated)) throw new Error(`${where}: fecha de actualización inválida`);
        if (a.image && !a.image.startsWith('https://')) throw new Error(`${where}: la imagen debe ser una URL https`);
        if (ids.has(a.id)) throw new Error(`${where}: id duplicado "${a.id}"`);
        if (slugs.has(a.slug)) throw new Error(`${where}: slug duplicado "${a.slug}"`);
        ids.add(a.id);
        slugs.add(a.slug);
    });
    return articles;
}

function loadNews() {
    const articles = validate(JSON.parse(fs.readFileSync(FILE, 'utf8')));
    return articles.sort((a, b) => b.date.localeCompare(a.date));
}

module.exports = { loadNews, validate };
