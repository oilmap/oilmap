const fs = require('fs');
const path = require('path');
const { LABELS } = require('./article-page');

const DATA_DIR = path.join(__dirname, '..', 'data');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');
const TOPICS_FILE = path.join(DATA_DIR, 'topics.json');
const REQUIRED = ['id', 'title', 'slug', 'lang', 'date', 'summary', 'body', 'topicFilter'];
const SLUG = /^[a-z0-9-]{1,80}$/;
const TOPIC_VALUE = /^[a-z0-9-]{1,40}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(iso) {
    if (!DATE.test(iso)) return false;
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function validateTopics(topics) {
    if (!Array.isArray(topics)) throw new Error('data/topics.json debe contener un array');
    const values = new Set();
    topics.forEach((t, i) => {
        const where = `data/topics.json entrada ${i} (${t && t.value})`;
        if (!t || typeof t.value !== 'string' || !TOPIC_VALUE.test(t.value)) throw new Error(`${where}: value inválido`);
        if (typeof t.label !== 'string' || !t.label.trim() || t.label.length > 60) throw new Error(`${where}: label inválido`);
        if (values.has(t.value)) throw new Error(`${where}: value duplicado`);
        values.add(t.value);
    });
    return topics;
}

function validateArticles(articles, topics) {
    if (!Array.isArray(articles)) throw new Error('data/news.json debe contener un array');
    const topicValues = new Set(topics.map(t => t.value));
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
        if (!topicValues.has(a.topicFilter)) throw new Error(`${where}: tema "${a.topicFilter}" no existe en data/topics.json`);
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

function loadTopics() {
    return validateTopics(JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8')));
}

function loadNews() {
    const topics = loadTopics();
    const articles = validateArticles(JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8')), topics);
    return articles.sort((a, b) => b.date.localeCompare(a.date));
}

module.exports = { loadNews, loadTopics, validateTopics };
