const fs = require('fs');
const path = require('path');
const { buildArticlePage, LABELS } = require('./article-page');
const { loadNews } = require('./news-store');

const root = path.join(__dirname, '..');
const BASE = 'https://oilmap.xyz';
const START = '<!-- news:start -->';
const END = '<!-- news:end -->';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const articles = loadNews();

function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function cardImage(a) {
    const attrs = [
        'class="card-image"',
        `src="${esc(a.image)}"`,
        a.imageSrcset && `srcset="${esc(a.imageSrcset)}" sizes="(max-width: 900px) 100vw, 400px"`,
        a.imageWidth && `width="${esc(a.imageWidth)}" height="${esc(a.imageHeight)}"`,
        `alt="${esc(a.imageAlt || a.title)}"`,
        'loading="lazy" decoding="async"'
    ];
    return `<img ${attrs.filter(Boolean).join(' ')}>`;
}

function card(a) {
    const url = `/blog/${a.slug}.html`;
    const image = a.image ? cardImage(a) : '';
    const label = (LABELS[a.lang] || LABELS.en).views;
    return `<article class="news-card" data-topic="${esc(a.topicFilter)}">
                <div class="card-meta">
                    <span class="badge-source">World Oil Map · ${esc(a.lang.toUpperCase())}</span>
                    <span class="card-stats">
                        <span class="card-views" data-slug="${esc(a.slug)}" data-lang="${esc(a.lang)}" data-label="${esc(label)}" hidden></span>
                        <time class="badge-date" datetime="${esc(a.date)}">${esc(formatDate(a.date))}</time>
                    </span>
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

const viewsScript = `<script>
(function () {
    document.querySelectorAll('.card-views').forEach(function (el) {
        fetch('/api/views?slug=' + encodeURIComponent(el.dataset.slug))
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (typeof d.views !== 'number') return;
                el.textContent = Number(d.views).toLocaleString(el.dataset.lang) + ' ' + el.dataset.label;
                el.hidden = false;
            })
            .catch(function () {});
    });
})();
</script>`;

const block = articles.length
    ? `${articles.map(card).join('\n            ')}\n            ${itemList()}\n            ${viewsScript}`
    : '<p class="news-empty">No articles have been published yet.</p>';

const blogPath = path.join(root, 'blog.html');
const html = fs.readFileSync(blogPath, 'utf8');
const pattern = new RegExp(`${START}[\\s\\S]*?${END}`);
if (!pattern.test(html)) throw new Error('news markers not found in blog.html');
fs.writeFileSync(blogPath, html.replace(pattern, () => `${START}\n            ${block}\n            ${END}`));

const blogDir = path.join(root, 'blog');
fs.mkdirSync(blogDir, { recursive: true });
for (const a of articles) fs.writeFileSync(path.join(blogDir, `${a.slug}.html`), buildArticlePage(a));

console.log(`blog.html written, ${articles.length} articles`);
