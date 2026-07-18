const API = 'https://api.jikan.moe/v4';
const sidebar = document.getElementById('animeSidebar');
const episodesBox = document.getElementById('episodes');
const player = document.getElementById('player');
const epTitle = document.getElementById('epTitle');

const params = new URLSearchParams(location.search);
const malId = params.get('id');
const title = params.get('title');

function findEntry(db, title, malId) {
  if (db[title]) return db[title];
  const numId = Number(malId);
  return Object.values(db).find(v => v.mal_id === numId) || null;
}

function renderSidebar(anime) {
  const genres = (anime.genres || []).map(g => `<span class="meta-tag">${g.name}</span>`).join('');
  sidebar.innerHTML = `
    <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
    <div class="meta-row">
      ${anime.score ? `<span class="meta-tag">&#11088; ${anime.score}</span>` : ''}
      ${anime.episodes ? `<span class="meta-tag">${anime.episodes} eps</span>` : ''}
      ${anime.status ? `<span class="meta-tag">${anime.status}</span>` : ''}
    </div>
    <h1>${anime.title}</h1>
    <div class="meta-row">${genres}</div>
    <p>${(anime.synopsis || 'Sem sinopse.').slice(0, 400)}${anime.synopsis && anime.synopsis.length > 400 ? '...' : ''}</p>
  `;
  document.title = `AniSite - ${anime.title}`;
}

function renderEpisodes(entry) {
  episodesBox.innerHTML = '';
  if (!entry || !entry.embed || !entry.embed.length) {
    episodesBox.innerHTML = '<p class="no-eps">Nenhum episodio cadastrado para este anime.</p>';
    epTitle.textContent = 'Sem episodios';
    return;
  }

  const epNames = entry.names || [];

  entry.embed.forEach((url, i) => {
    const name = epNames[i] || `Episodio ${i + 1}`;
    const btn = document.createElement('button');
    btn.className = 'ep-btn' + (i === 0 ? ' active' : '');
    btn.textContent = `EP ${i + 1}`;
    btn.title = name;
    btn.addEventListener('click', () => {
      player.src = url;
      epTitle.textContent = name;
      document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      player.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    episodesBox.appendChild(btn);
  });

  player.src = entry.embed[0];
  epTitle.textContent = epNames[0] || 'Episodio 1';
}

async function loadPage() {
  sidebar.innerHTML = '<p style="color:#64748b;padding:16px">Carregando...</p>';

  try {
    const [animeRes, dbRes] = await Promise.all([
      fetch(`${API}/anime/${malId}/full`),
      fetch('./db.json')
    ]);

    const animeJson = await animeRes.json();
    const db = await dbRes.json();

    const anime = animeJson.data;
    const entry = findEntry(db, title, malId);

    renderSidebar(anime);
    renderEpisodes(entry);
  } catch (err) {
    sidebar.innerHTML = '<p style="color:#ef4444;padding:16px">Erro ao carregar anime.</p>';
  }
}

loadPage();
