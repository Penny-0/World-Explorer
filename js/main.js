document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const favorites = read('worldExplorerFavorites');
  const favoriteKey = item => `${item.type}::${item.name}`;
  const getItem = card => ({ type: card.dataset.favoriteType || '國家', name: $('h3', card)?.textContent.trim() || '未命名', description: $('p', card)?.textContent.trim() || '', href: (card.matches('a') ? card.getAttribute('href') : $('a', card)?.getAttribute('href')) || '' });
  const isSaved = item => favorites.some(saved => favoriteKey(saved) === favoriteKey(item));
  function syncButtons() {
    $$('.favorite-button').forEach(button => {
      const item = getItem(button.closest('.attraction-card, .country-card'));
      const saved = isSaved(item); button.setAttribute('aria-pressed', String(saved)); button.textContent = saved ? '♥ 已收藏' : '♡ 收藏景點';
    });
    $$('.country-card[data-country]').forEach(card => {
      let button = $('.favorite-button', card);
      if (!button) { button = document.createElement('button'); button.type = 'button'; button.className = 'favorite-button'; button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); toggleFavorite(getItem(card)); }); card.append(button); }
      const item = getItem(card); const saved = isSaved(item); button.setAttribute('aria-pressed', String(saved)); button.textContent = saved ? '♥ 已收藏' : '♡ 收藏國家';
    });
  }
  function toggleFavorite(item) {
    const index = favorites.findIndex(saved => favoriteKey(saved) === favoriteKey(item));
    if (index >= 0) favorites.splice(index, 1); else favorites.push(item);
    write('worldExplorerFavorites', favorites); syncButtons(); renderFavorites();
  }
  $$('.favorite-button').forEach(button => button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); toggleFavorite(getItem(button.closest('.attraction-card, .country-card'))); }));
  syncButtons();
  // Search and continent filter
  const search = $('#country-search'), filter = $('#continent-filter');
  function filterCountries() {
    const query = (search?.value || '').trim().toLocaleLowerCase(); const continent = filter?.value || 'all'; let visible = 0;
    $$('.country-card[data-country]').forEach(card => { const match = (card.dataset.country || card.textContent).toLocaleLowerCase().includes(query); const area = continent === 'all' || card.dataset.continent === continent; card.hidden = !(match && area); if (!card.hidden) visible++; });
    const empty = $('#country-empty'); if (empty) empty.hidden = visible !== 0;
  }
  search?.addEventListener('input', filterCountries); filter?.addEventListener('change', filterCountries);
  // Favorites page
  function renderFavorites() {
    const list = $('#favorites-list'), empty = $('#favorites-empty'); if (!list) return;
    list.replaceChildren(); favorites.forEach(item => { const card = document.createElement('article'); card.className = 'country-card'; const title = document.createElement('h3'); title.textContent = item.name; const type = document.createElement('span'); type.textContent = item.type; const desc = document.createElement('p'); desc.textContent = item.description; const remove = document.createElement('button'); remove.className = 'favorite-button'; remove.textContent = '移除收藏'; remove.addEventListener('click', () => toggleFavorite(item)); card.append(type, title, desc); if (item.href) { const link = document.createElement('a'); link.href = item.href; link.className = 'card-link'; link.textContent = '前往介紹 →'; card.append(link); } card.append(remove); list.append(card); }); if (empty) empty.hidden = favorites.length > 0;
  }
  renderFavorites();
  // Trip planner
  const form = $('#planner-form'), itinerary = $('#itinerary-list'); const plans = read('worldExplorerPlans');
  function renderPlans() { if (!itinerary) return; itinerary.replaceChildren(); plans.forEach((plan, index) => { const li = document.createElement('li'); const content = document.createElement('span'); content.textContent = `${plan.date}｜${plan.destination}${plan.note ? ' — ' + plan.note : ''}`; const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '刪除'; remove.addEventListener('click', () => { plans.splice(index, 1); write('worldExplorerPlans', plans); renderPlans(); }); li.append(content, remove); itinerary.append(li); }); }
  form?.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(form); plans.push({ destination: data.get('destination').trim(), date: data.get('date'), note: data.get('note').trim() }); write('worldExplorerPlans', plans); form.reset(); renderPlans(); }); renderPlans();
  // Smooth in-page navigation
  $$('.nav-links a, .nav-button, .hero-buttons a, .footer-logo').forEach(link => link.addEventListener('click', event => { const href = link.getAttribute('href'); if (href?.startsWith('#')) { const target = $(href); if (target) { event.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } } }));
  // Scroll-to-top
  let topButton = $('#back-to-top'); if (!topButton) { topButton = document.createElement('button'); topButton.id = 'back-to-top'; topButton.type = 'button'; topButton.className = 'back-to-top'; topButton.textContent = '↑'; topButton.setAttribute('aria-label', '回到頂端'); document.body.append(topButton); }
  const updateTop = () => topButton.classList.toggle('visible', window.scrollY > 350); window.addEventListener('scroll', updateTop, { passive: true }); updateTop(); topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  const navbar = $('.navbar'); window.addEventListener('scroll', () => navbar?.classList.toggle('scrolled', window.scrollY > 50), { passive: true });
  const copyright = $('.copyright'); if (copyright) copyright.textContent = `© ${new Date().getFullYear()} World Explorer. All Rights Reserved.`;
  const cards = $$('.country-card, .attraction-card, .food-card'); if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('show'); observer.unobserve(entry.target); } }), { threshold: .12 }); cards.forEach(card => { card.classList.add('hidden'); observer.observe(card); }); }
  $('.hero-content')?.classList.add('hero-loaded');
});