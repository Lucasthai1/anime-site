const API = 'https://api.jikan.moe/v4';
const grid = document.getElementById('grid');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultsTitle = document.getElementById('resultsTitle');
const loading = document.getElementById('loading');

let db = {};

async function loadDB() {
  try {
    const res = await fetch('./db.json');
    db = await res.json();
  } catch (e) {
    db = {};
  }
}

async function fetchAnime(query = '', page = 1) {
  grid.innerHTML = '';
  loading.classList.add('show');

  let url;
  if (query) {
    url = `${API}/anime?q=${encodeURIComponent(query)}&limit=18&page=${page}`;
    resultsTitle.textContent = `Resultados para "${query}"`;
  } else {
    url = `${API}/top/anime?limit=18&page=${page}`;
    resultsTitle.textContent = 'Em alta';
  }

  try {
    const res = await fetch(url);
    const json = await res.json();
    renderCards(json.data || []);
  } catch (e) {
    grid.innerHTML = '<p style="padding:24px;color:#64748b">Erro ao carregar. Tente novamente.</p>';
  } finally {
    loading.classList.remove('show');
  }
}

function hasEpisodes(title, malId) {
  if (db[title]) return true;
  return Object.values(db).some(v => v.mal_id === malId);
}

function renderCards(items) {
  if (!items.length) {
    grid.innerHTML = '<p style="padding:24px;color:#64748b">Nenhum anime encontrado.</p>';
    return;
  }
  items.forEach(anime => {
    const hasDub = hasEpisodes(anime.title, anime.mal_id);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" loading="lazy">
      <div class="card-content">
        ${hasDub ? '<span class="card-badge">Legendado</span>' : ''}
        <h3>${anime.title}</h3>
        <p>Score: ${anime.score ?? 'N/A'} &middot; ${anime.episodes ?? '?'} eps</p>
      </div>
    `;
    card.addEventListener('click', () => {
      const url = new URL('anime.html', location.href);
      url.searchParams.set('id', anime.mal_id);
      url.searchParams.set('title', anime.title);
      location.href = url.toString();
    });
    grid.appendChild(card);
  });
}

searchBtn.addEventListener('click', () => {
  const q = searchInput.value.trim();
  fetchAnime(q);
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') fetchAnime(searchInput.value.trim());
});

(async () => {
  await loadDB();
  fetchAnime();
})();
