const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const BASE = 'https://oilmap.xyz';
const START = '<!-- news:start -->';
const END = '<!-- news:end -->';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const articles = JSON.parse(fs.readFileSync(path.join(root, 'data/news.json'), 'utf8'))
    .sort((a, b) => b.date.localeCompare(a.date));

function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function card(a) {
    const url = `/blog/${a.slug}.html`;
    const image = a.image ? `<img class="card-image" src="${esc(a.image)}" alt="${esc(a.title)}" loading="lazy">` : '';
    return `<article class="news-card" data-topic="${esc(a.topicFilter)}">
                <div class="card-meta">
                    <span class="badge-source">World Oil Map · ${esc(a.lang.toUpperCase())}</span>
                    <time class="badge-date" datetime="${esc(a.date)}">${esc(formatDate(a.date))}</time>
                </div>
                ${image}
                <div class="gdelt-text-wrapper">
                    <h3 class="own-title"><a href="${url}" lang="${esc(a.lang)}">${esc(a.title)}</a></h3>
                    <p class="news-snippet">${esc(a.summary)}</p>
                </div>
            </article>`;
}

function itemList() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Global Petroleum News',
        numberOfItems: articles.length,
        itemListElement: articles.map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${BASE}/blog/${a.slug}.html`,
            name: a.title
        }))
    };
    return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

const block = articles.length
    ? `${articles.map(card).join('\n            ')}\n            ${itemList()}`
    : '<p class="news-empty">No articles have been published yet.</p>';

const blogPath = path.join(root, 'blog.html');
const html = fs.readFileSync(blogPath, 'utf8');
const pattern = new RegExp(`${START}[\\s\\S]*?${END}`);
if (!pattern.test(html)) throw new Error('news markers not found in blog.html');
fs.writeFileSync(blogPath, html.replace(pattern, () => `${START}\n            ${block}\n            ${END}`));

console.log(`blog.html written, ${articles.length} articles`);
