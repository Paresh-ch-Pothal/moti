/* ============================================================
   Divine Motivation — Application Logic
   Vanilla JS, LocalStorage persistence, PWA-friendly.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Constants ---------- */
  const STORAGE_KEY = 'divineMotivation.data.v1';
  const SETTINGS_KEY = 'divineMotivation.settings.v1';
  const HISTORY_KEY = 'divineMotivation.history.v1';
  const THEME_KEY = 'divineMotivation.theme.v1';

  const CATEGORIES = [
    'Discipline',
    'Success',
    'Hard Work',
    'Self Confidence',
    'Life Lessons',
    'Spirituality',
    'Bhagavad Gita',
    'Personal Thoughts'
  ];

  // Background image sets — local files (cached by service worker)
  const BG_IMAGES = {
    krishna: [
      'images/krishna-flute.jpg',
      'images/krishna-aura.jpg',
      'images/krishna-crown.jpg',
      'images/krishna-peacock.jpg'
    ],
    shiva: [
      'images/shiva-meditation.jpg',
      'images/shiva-himalaya.jpg',
      'images/shiva-trident.jpg',
      'images/shiva-kailash.jpg'
    ]
  };

  // Default sample motivations
  const SAMPLE_MOTIVATIONS = [
    { text: 'You have the right to perform your duty, but never to its fruits. Let not the fruits of action be your motive, nor let your attachment be to inaction.', category: 'Bhagavad Gita', author: 'Bhagavad Gita 2.47', favourite: false },
    { text: 'The mind is restless, turbulent, obstinate and very strong, O Krishna, and to subdue it, I think, is more difficult than controlling the wind.', category: 'Bhagavad Gita', author: 'Bhagavad Gita 6.34', favourite: true },
    { text: 'When you arise in the morning, think of what a precious privilege it is to be alive — to breathe, to think, to enjoy, to love. Then make that day count.', category: 'Discipline', author: 'Marcus Aurelius', favourite: false },
    { text: 'Discipline is the bridge between goals and accomplishment. Small disciplines practiced daily lead to great results over time.', category: 'Discipline', author: 'Personal Thoughts', favourite: false },
    { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts. Trust the divine plan even when the path is unclear.', category: 'Success', author: 'Inspired by Churchill', favourite: true },
    { text: 'Set your heart upon your work, but never on its reward. Work done with full attention and pure intention becomes worship itself.', category: 'Hard Work', author: 'Bhagavad Gita Wisdom', favourite: false },
    { text: 'The harder you work for something, the greater you will feel when you achieve it. Persistence is the most divine form of faith.', category: 'Hard Work', author: 'Personal Thoughts', favourite: false },
    { text: 'Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.', category: 'Self Confidence', author: 'Christian D. Larson', favourite: false },
    { text: 'You are never given a dream without also being given the power to make it come true. The divine has already equipped you for the journey.', category: 'Self Confidence', author: 'Richard Bach', favourite: true },
    { text: 'What we think, we become. What we feel, we attract. What we imagine, we create. Your thoughts shape your destiny.', category: 'Life Lessons', author: 'Buddha', favourite: false },
    { text: 'The wound is the place where the light enters you. Every heartbreak, every fall, is an opening for grace to flow through.', category: 'Life Lessons', author: 'Rumi', favourite: true },
    { text: 'Whatever happened, happened for the good. Whatever is happening, is happening for the good. Whatever will happen, will also happen for the good.', category: 'Spirituality', author: 'Bhagavad Gita', favourite: false },
    { text: 'Silence is the language of God; all else is poor translation. Sit quietly, listen, and you will hear the divine whisper.', category: 'Spirituality', author: 'Rumi', favourite: false },
    { text: 'The soul is neither born, nor does it ever die. It is unborn, eternal, ever-existing, and primeval. It is not slain when the body is slain.', category: 'Bhagavad Gita', author: 'Bhagavad Gita 2.20', favourite: false },
    { text: 'Whenever dharma declines and adharma rises, I manifest myself. To protect the good and destroy evil, I take birth in every age.', category: 'Bhagavad Gita', author: 'Bhagavad Gita 4.7-8', favourite: true },
    { text: 'Wake up with determination. Go to bed with satisfaction. The gap between who you are and who you want to be is filled by your daily discipline.', category: 'Personal Thoughts', author: 'Personal Thoughts', favourite: false },
    { text: 'Let your faith be stronger than your fears. When you cannot see the next step, trust that the divine hand is already there to guide you.', category: 'Spirituality', author: 'Divine Wisdom', favourite: false },
    { text: 'Hard work beats talent when talent does not work hard. The universe rewards consistent effort, not occasional brilliance.', category: 'Hard Work', author: 'Personal Thoughts', favourite: false },
    { text: 'Three things cannot be long hidden: the sun, the moon, and the truth. Walk in truth, and the divine walks with you.', category: 'Life Lessons', author: 'Buddha', favourite: false },
    { text: 'You are the universe experiencing itself. Within you is the same consciousness that moves the stars and breathes through every leaf.', category: 'Spirituality', author: 'Personal Thoughts', favourite: true },
    { text: 'Do not let what you cannot do interfere with what you can do. Begin where you are, with what you have, and the way will open.', category: 'Self Confidence', author: 'John Wooden', favourite: false },
    { text: 'The only way to do great work is to love what you do. If you have not found it yet, keep looking. Do not settle.', category: 'Success', author: 'Steve Jobs', favourite: false }
  ];

  /* ---------- State ---------- */
  let motivations = [];
  let settings = {
    theme: 'krishna',
    bgRotate: 'on',
    dailyInspiration: 'on'
  };
  let currentView = 'home';
  let currentQuoteId = null;
  let history = [];      // stack of visited quote ids (back nav)
  let historyIndex = -1; // pointer within history
  let currentFilter = 'all';
  let currentSearch = '';
  let editingId = null;
  let confirmCallback = null;
  let bgImageIndex = 0;

  /* ---------- DOM ---------- */
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    bgLayer: $('bgLayer'),
    quoteCard: $('quoteCard'),
    quoteText: $('quoteText'),
    quoteCategory: $('quoteCategory'),
    quoteAuthor: $('quoteAuthor'),
    favBtn: $('favBtn'),
    copyBtn: $('copyBtn'),
    shareBtn: $('shareBtn'),
    prevBtn: $('prevBtn'),
    newBtn: $('newBtn'),
    nextBtn: $('nextBtn'),
    themeKrishna: $('themeKrishna'),
    themeShiva: $('themeShiva'),
    collectionList: $('collectionList'),
    collectionStats: $('collectionStats'),
    collectionEmpty: $('collectionEmpty'),
    favList: $('favList'),
    favStats: $('favStats'),
    favEmpty: $('favEmpty'),
    addNewBtn: $('addNewBtn'),
    emptyAddBtn: $('emptyAddBtn'),
    filterCategory: $('filterCategory'),
    searchInput: $('searchInput'),
    settingTheme: $('settingTheme'),
    settingBgRotate: $('settingBgRotate'),
    settingDaily: $('settingDaily'),
    exportBtn: $('exportBtn'),
    importBtn: $('importBtn'),
    importFile: $('importFile'),
    resetBtn: $('resetBtn'),
    clearAllBtn: $('clearAllBtn'),
    // Modal
    modalOverlay: $('modalOverlay'),
    modalTitle: $('modalTitle'),
    modalClose: $('modalClose'),
    modalCancel: $('modalCancel'),
    modalSave: $('modalSave'),
    motivationForm: $('motivationForm'),
    editId: $('editId'),
    formText: $('formText'),
    formCategory: $('formCategory'),
    formAuthor: $('formAuthor'),
    charCount: $('charCount'),
    // Confirm
    confirmOverlay: $('confirmOverlay'),
    confirmTitle: $('confirmTitle'),
    confirmMessage: $('confirmMessage'),
    confirmCancel: $('confirmCancel'),
    confirmOk: $('confirmOk'),
    // Toast
    toast: $('toast'),
    // Views
    views: {
      home: $('view-home'),
      collection: $('view-collection'),
      favourites: $('view-favourites'),
      settings: $('view-settings')
    }
  };

  /* ---------- Storage ---------- */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        motivations = JSON.parse(raw);
        // Migration: ensure each has favourite + id
        motivations.forEach((m) => {
          if (typeof m.favourite !== 'boolean') m.favourite = false;
          if (!m.id) m.id = generateId();
        });
      } else {
        motivations = SAMPLE_MOTIVATIONS.map((m) => ({ ...m, id: generateId() }));
        saveMotivations();
      }
    } catch (e) {
      console.warn('Failed to load motivations:', e);
      motivations = SAMPLE_MOTIVATIONS.map((m) => ({ ...m, id: generateId() }));
    }

    try {
      const sRaw = localStorage.getItem(SETTINGS_KEY);
      if (sRaw) settings = { ...settings, ...JSON.parse(sRaw) };
    } catch (e) { /* ignore */ }

    try {
      const hRaw = localStorage.getItem(HISTORY_KEY);
      if (hRaw) {
        const parsed = JSON.parse(hRaw);
        if (Array.isArray(parsed.history)) history = parsed.history;
        if (typeof parsed.index === 'number') historyIndex = parsed.index;
      }
    } catch (e) { /* ignore */ }

    try {
      const tRaw = localStorage.getItem(THEME_KEY);
      if (tRaw === 'krishna' || tRaw === 'shiva') settings.theme = tRaw;
    } catch (e) { /* ignore */ }
  }

  function saveMotivations() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(motivations));
    } catch (e) {
      console.error('Failed to save motivations:', e);
      showToast('Could not save — storage may be full.');
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      localStorage.setItem(THEME_KEY, settings.theme);
    } catch (e) { /* ignore */ }
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify({ history, index: historyIndex }));
    } catch (e) { /* ignore */ }
  }

  /* ---------- Helpers ---------- */
  function generateId() {
    return 'm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showToast(message, duration) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.hidden = false;
    // restart animation
    els.toast.style.animation = 'none';
    void els.toast.offsetWidth;
    els.toast.style.animation = '';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      els.toast.hidden = true;
    }, duration || 2600);
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ---------- Background ---------- */
  function applyBackground(theme) {
    if (!els.bgLayer) return;
    const imgs = BG_IMAGES[theme] || BG_IMAGES.krishna;
    let url;
    if (settings.bgRotate === 'on') {
      url = imgs[bgImageIndex % imgs.length];
    } else {
      url = imgs[0];
    }
    // Preload to avoid flicker
    const img = new Image();
    img.onload = () => {
      els.bgLayer.style.backgroundImage = `url('${url}')`;
    };
    img.onerror = () => {
      // Fallback: try next image, else gradient
      const next = imgs[(bgImageIndex + 1) % imgs.length];
      els.bgLayer.style.backgroundImage = `url('${next}')`;
      // Ultimate fallback: keep navy gradient (already in CSS)
    };
    img.src = url;
  }

  function rotateBackground() {
    const imgs = BG_IMAGES[settings.theme] || BG_IMAGES.krishna;
    bgImageIndex = (bgImageIndex + 1) % imgs.length;
    applyBackground(settings.theme);
  }

  /* ---------- Quote Display ---------- */
  function showQuote(id, direction) {
    const m = motivations.find((x) => x.id === id);
    if (!m) {
      // Fallback: pick a random one
      if (motivations.length === 0) {
        els.quoteText.textContent = 'Add your first motivation to begin your journey.';
        els.quoteCategory.textContent = '—';
        els.quoteAuthor.textContent = '';
        currentQuoteId = null;
        updateFavButton(false);
        return;
      }
      const random = pickRandom(motivations);
      return showQuote(random.id, direction);
    }

    // Fade transition
    els.quoteText.classList.add('fade');
    setTimeout(() => {
      els.quoteText.textContent = '\u201C' + m.text + '\u201D';
      els.quoteCategory.textContent = m.category || 'Personal Thoughts';
      els.quoteAuthor.textContent = m.author ? '— ' + m.author : '';
      els.quoteText.classList.remove('fade');
      updateFavButton(m.favourite);
    }, 180);

    currentQuoteId = m.id;
  }

  function updateFavButton(isFav) {
    if (!els.favBtn) return;
    els.favBtn.classList.toggle('active', !!isFav);
    els.favBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
    els.favBtn.setAttribute('aria-label', isFav ? 'Remove from favourites' : 'Add to favourites');
  }

  function pushHistory(id) {
    // Truncate any forward history
    history = history.slice(0, historyIndex + 1);
    history.push(id);
    historyIndex = history.length - 1;
    // Cap history length
    if (history.length > 100) {
      history.shift();
      historyIndex--;
    }
    saveHistory();
  }

  function newMotivation() {
    if (motivations.length === 0) {
      showToast('Add motivations first from the Collection tab.');
      switchView('collection');
      openModal();
      return;
    }
    // Pick a random one that is different from current (if possible)
    let pool = motivations;
    if (motivations.length > 1 && currentQuoteId) {
      pool = motivations.filter((m) => m.id !== currentQuoteId);
    }
    const next = pickRandom(pool);
    showQuote(next.id, 'forward');
    pushHistory(next.id);
    if (settings.bgRotate === 'on') rotateBackground();
    updateNavButtons();
  }

  function nextMotivation() {
    // Forward history
    if (historyIndex < history.length - 1) {
      historyIndex++;
      const id = history[historyIndex];
      showQuote(id, 'forward');
      saveHistory();
    } else {
      newMotivation();
      return;
    }
    updateNavButtons();
  }

  function prevMotivation() {
    if (historyIndex > 0) {
      historyIndex--;
      const id = history[historyIndex];
      showQuote(id, 'back');
      saveHistory();
    } else {
      showToast('Already at the beginning.');
    }
    updateNavButtons();
  }

  function updateNavButtons() {
    if (!els.prevBtn || !els.nextBtn) return;
    const atStart = historyIndex <= 0;
    const atEnd = historyIndex >= history.length - 1;
    els.prevBtn.classList.toggle('disabled', atStart);
    els.prevBtn.setAttribute('aria-disabled', atStart ? 'true' : 'false');
    els.nextBtn.classList.toggle('disabled', atEnd && motivations.length <= 1);
    els.nextBtn.setAttribute('aria-disabled', (atEnd && motivations.length <= 1) ? 'true' : 'false');
  }

  function toggleFavourite(id) {
    const m = motivations.find((x) => x.id === id);
    if (!m) return;
    m.favourite = !m.favourite;
    saveMotivations();
    updateFavButton(m.favourite);
    showToast(m.favourite ? 'Added to favourites.' : 'Removed from favourites.');
    renderCollection();
    renderFavourites();
  }

  function copyCurrent() {
    if (!currentQuoteId) return;
    const m = motivations.find((x) => x.id === currentQuoteId);
    if (!m) return;
    const text = `"${m.text}"${m.author ? ' — ' + m.author : ''}\n\n— Divine Motivation`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast('Copied to clipboard.'),
        () => fallbackCopy(text)
      );
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Copied to clipboard.');
    } catch (e) {
      showToast('Copy failed — long-press to copy manually.');
    }
    document.body.removeChild(ta);
  }

  function shareCurrent() {
    if (!currentQuoteId) return;
    const m = motivations.find((x) => x.id === currentQuoteId);
    if (!m) return;
    const text = `"${m.text}"${m.author ? ' — ' + m.author : ''}`;
    const shareData = {
      title: 'Divine Motivation',
      text: text,
      url: window.location.href
    };
    if (navigator.share) {
      navigator.share(shareData).then(
        () => showToast('Shared.'),
        (err) => {
          if (err && err.name !== 'AbortError') {
            showToast('Sharing cancelled.');
          }
        }
      ).catch(() => { /* user cancelled */ });
    } else {
      // Fallback: copy
      copyCurrent();
    }
  }

  /* ---------- Views ---------- */
  function switchView(view) {
    if (!els.views[view]) return;
    Object.values(els.views).forEach((el) => el.classList.remove('active'));
    els.views[view].classList.add('active');
    currentView = view;
    $$('.nav-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'collection') renderCollection();
    if (view === 'favourites') renderFavourites();
  }

  /* ---------- Collection Render ---------- */
  function renderCollection() {
    const filter = currentFilter;
    const search = currentSearch.trim().toLowerCase();

    let items = motivations.slice();
    if (filter !== 'all') {
      items = items.filter((m) => m.category === filter);
    }
    if (search) {
      items = items.filter(
        (m) =>
          m.text.toLowerCase().includes(search) ||
          (m.author && m.author.toLowerCase().includes(search)) ||
          (m.category && m.category.toLowerCase().includes(search))
      );
    }

    // Stats
    const total = motivations.length;
    const shown = items.length;
    els.collectionStats.textContent =
      shown === total
        ? `${total} motivation${total === 1 ? '' : 's'}`
        : `${shown} of ${total} motivations`;

    if (items.length === 0) {
      els.collectionList.innerHTML = '';
      els.collectionEmpty.hidden = false;
      els.collectionEmpty.querySelector('p').textContent =
        total === 0 ? 'No motivations yet.' : 'No motivations match your filter.';
      const btn = els.collectionEmpty.querySelector('button');
      btn.style.display = total === 0 ? '' : 'none';
      return;
    }

    els.collectionEmpty.hidden = true;
    els.collectionList.innerHTML = items
      .map((m) => renderItemHtml(m))
      .join('');

    attachItemHandlers(els.collectionList);
  }

  function renderFavourites() {
    const items = motivations.filter((m) => m.favourite);
    els.favStats.textContent = `${items.length} favourite${items.length === 1 ? '' : 's'}`;
    if (items.length === 0) {
      els.favList.innerHTML = '';
      els.favEmpty.hidden = false;
      return;
    }
    els.favEmpty.hidden = true;
    els.favList.innerHTML = items.map((m) => renderItemHtml(m)).join('');
    attachItemHandlers(els.favList);
  }

  function renderItemHtml(m) {
    return `
      <li class="list-item" data-id="${escapeHtml(m.id)}">
        <div class="item-header">
          <span class="item-category">${escapeHtml(m.category || 'Personal Thoughts')}</span>
          <div class="item-actions">
            <button class="icon-btn fav-toggle ${m.favourite ? 'fav-active' : ''}" data-id="${escapeHtml(m.id)}" aria-label="Toggle favourite" aria-pressed="${m.favourite}" title="Favourite">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18z"/></svg>
            </button>
            <button class="icon-btn edit-btn" data-id="${escapeHtml(m.id)}" aria-label="Edit" title="Edit">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button class="icon-btn danger delete-btn" data-id="${escapeHtml(m.id)}" aria-label="Delete" title="Delete">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg>
            </button>
          </div>
        </div>
        <p class="item-text">${escapeHtml(m.text)}</p>
        ${m.author ? `<p class="item-author">— ${escapeHtml(m.author)}</p>` : ''}
      </li>
    `;
  }

  function attachItemHandlers(container) {
    container.querySelectorAll('.fav-toggle').forEach((btn) => {
      btn.addEventListener('click', () => toggleFavourite(btn.dataset.id));
    });
    container.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });
    container.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', () => confirmDelete(btn.dataset.id));
    });
  }

  /* ---------- Modal (Add / Edit) ---------- */
  function openModal(id) {
    editingId = id || null;
    if (id) {
      const m = motivations.find((x) => x.id === id);
      if (!m) return;
      els.modalTitle.textContent = 'Edit Motivation';
      els.editId.value = m.id;
      els.formText.value = m.text;
      els.formCategory.value = m.category || 'Personal Thoughts';
      els.formAuthor.value = m.author || '';
    } else {
      els.modalTitle.textContent = 'Add New Motivation';
      els.editId.value = '';
      els.formText.value = '';
      els.formCategory.value = 'Personal Thoughts';
      els.formAuthor.value = '';
    }
    updateCharCount();
    els.modalOverlay.hidden = false;
    setTimeout(() => els.formText.focus(), 100);
  }

  function closeModal() {
    els.modalOverlay.hidden = true;
    editingId = null;
  }

  function updateCharCount() {
    els.charCount.textContent = String(els.formText.value.length);
  }

  function saveFromForm(e) {
    if (e) e.preventDefault();
    const text = els.formText.value.trim();
    const category = els.formCategory.value;
    const author = els.formAuthor.value.trim();

    if (!text) {
      showToast('Please enter a motivation.');
      els.formText.focus();
      return;
    }

    if (editingId) {
      const m = motivations.find((x) => x.id === editingId);
      if (m) {
        m.text = text;
        m.category = category;
        m.author = author;
      }
      showToast('Motivation updated.');
    } else {
      const newM = {
        id: generateId(),
        text: text,
        category: category,
        author: author,
        favourite: false
      };
      motivations.unshift(newM);
      showToast('Motivation added.');
    }
    saveMotivations();
    closeModal();
    renderCollection();
    renderFavourites();
    // If on home view and no current quote, show new one
    if (currentView === 'home' && !currentQuoteId) {
      showQuote(motivations[0].id);
    }
  }

  /* ---------- Delete ---------- */
  function confirmDelete(id) {
    const m = motivations.find((x) => x.id === id);
    if (!m) return;
    const preview = m.text.length > 60 ? m.text.slice(0, 60) + '...' : m.text;
    showConfirm(
      'Delete this motivation?',
      `"${preview}"\n\nThis cannot be undone.`,
      () => {
        motivations = motivations.filter((x) => x.id !== id);
        // Clean up history references
        history = history.filter((hid) => hid !== id);
        if (historyIndex >= history.length) historyIndex = history.length - 1;
        saveMotivations();
        saveHistory();
        renderCollection();
        renderFavourites();
        // If current home quote was deleted, pick another
        if (currentQuoteId === id) {
          if (motivations.length > 0) {
            const next = pickRandom(motivations);
            showQuote(next.id);
            pushHistory(next.id);
          } else {
            currentQuoteId = null;
            els.quoteText.textContent = 'Add your first motivation to begin your journey.';
            els.quoteCategory.textContent = '—';
            els.quoteAuthor.textContent = '';
            updateFavButton(false);
          }
        }
        showToast('Motivation deleted.');
      }
    );
  }

  /* ---------- Confirm dialog ---------- */
  function showConfirm(title, message, callback) {
    els.confirmTitle.textContent = title;
    els.confirmMessage.textContent = message;
    confirmCallback = callback;
    els.confirmOverlay.hidden = false;
  }

  function closeConfirm() {
    els.confirmOverlay.hidden = true;
    confirmCallback = null;
  }

  /* ---------- Settings ---------- */
  function applySettingsToUI() {
    els.settingTheme.value = settings.theme;
    els.settingBgRotate.value = settings.bgRotate;
    els.settingDaily.value = settings.dailyInspiration;
    // Theme buttons on home
    $$('.theme-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.theme === settings.theme);
    });
  }

  function setTheme(theme) {
    settings.theme = theme;
    saveSettings();
    applySettingsToUI();
    bgImageIndex = 0;
    applyBackground(theme);
  }

  /* ---------- Export / Import ---------- */
  function exportData() {
    const data = {
      app: 'Divine Motivation',
      version: 1,
      exportedAt: new Date().toISOString(),
      motivations: motivations,
      settings: settings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `divine-motivation-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Backup exported.');
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data.motivations)) {
          showToast('Invalid backup file.');
          return;
        }
        showConfirm(
          'Import motivations?',
          `This will replace your current ${motivations.length} motivations with ${data.motivations.length} from the file.`,
          () => {
            motivations = data.motivations.map((m) => ({
              id: m.id || generateId(),
              text: String(m.text || ''),
              category: CATEGORIES.includes(m.category) ? m.category : 'Personal Thoughts',
              author: m.author ? String(m.author) : '',
              favourite: !!m.favourite
            }));
            if (data.settings) settings = { ...settings, ...data.settings };
            saveMotivations();
            saveSettings();
            applySettingsToUI();
            setTheme(settings.theme);
            renderCollection();
            renderFavourites();
            // Reset home quote
            if (motivations.length > 0) {
              const q = pickRandom(motivations);
              showQuote(q.id);
              pushHistory(q.id);
            }
            showToast('Motivations imported.');
          }
        );
      } catch (err) {
        showToast('Could not read the file.');
      }
    };
    reader.readAsText(file);
  }

  function resetToSamples() {
    showConfirm(
      'Reset to sample data?',
      'This will erase all your motivations and restore the original sample set.',
      () => {
        motivations = SAMPLE_MOTIVATIONS.map((m) => ({ ...m, id: generateId() }));
        history = [];
        historyIndex = -1;
        saveMotivations();
        saveHistory();
        renderCollection();
        renderFavourites();
        const q = pickRandom(motivations);
        showQuote(q.id);
        pushHistory(q.id);
        showToast('Reset to sample motivations.');
      }
    );
  }

  function clearAll() {
    showConfirm(
      'Delete all motivations?',
      'This will permanently delete every motivation you have saved. Consider exporting a backup first.',
      () => {
        motivations = [];
        history = [];
        historyIndex = -1;
        currentQuoteId = null;
        saveMotivations();
        saveHistory();
        renderCollection();
        renderFavourites();
        els.quoteText.textContent = 'Add your first motivation to begin your journey.';
        els.quoteCategory.textContent = '—';
        els.quoteAuthor.textContent = '';
        updateFavButton(false);
        showToast('All motivations deleted.');
      }
    );
  }

  /* ---------- Event wiring ---------- */
  function wireEvents() {
    // Navigation
    $$('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Home actions
    els.newBtn.addEventListener('click', newMotivation);
    els.nextBtn.addEventListener('click', nextMotivation);
    els.prevBtn.addEventListener('click', prevMotivation);
    els.favBtn.addEventListener('click', () => {
      if (currentQuoteId) toggleFavourite(currentQuoteId);
    });
    els.copyBtn.addEventListener('click', copyCurrent);
    els.shareBtn.addEventListener('click', shareCurrent);

    // Theme switcher (home)
    $$('.theme-btn').forEach((btn) => {
      btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });

    // Collection
    els.addNewBtn.addEventListener('click', () => openModal());
    els.emptyAddBtn.addEventListener('click', () => openModal());
    els.filterCategory.addEventListener('change', (e) => {
      currentFilter = e.target.value;
      renderCollection();
    });
    els.searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderCollection();
    });

    // Modal
    els.modalClose.addEventListener('click', closeModal);
    els.modalCancel.addEventListener('click', closeModal);
    els.motivationForm.addEventListener('submit', saveFromForm);
    els.formText.addEventListener('input', updateCharCount);
    els.modalOverlay.addEventListener('click', (e) => {
      if (e.target === els.modalOverlay) closeModal();
    });

    // Confirm dialog
    els.confirmCancel.addEventListener('click', closeConfirm);
    els.confirmOk.addEventListener('click', () => {
      const cb = confirmCallback;
      closeConfirm();
      if (cb) cb();
    });
    els.confirmOverlay.addEventListener('click', (e) => {
      if (e.target === els.confirmOverlay) closeConfirm();
    });

    // Settings
    els.settingTheme.addEventListener('change', (e) => {
      setTheme(e.target.value);
    });
    els.settingBgRotate.addEventListener('change', (e) => {
      settings.bgRotate = e.target.value;
      saveSettings();
      bgImageIndex = 0;
      applyBackground(settings.theme);
    });
    els.settingDaily.addEventListener('change', (e) => {
      settings.dailyInspiration = e.target.value;
      saveSettings();
    });

    els.exportBtn.addEventListener('click', exportData);
    els.importBtn.addEventListener('click', () => els.importFile.click());
    els.importFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) importData(file);
      e.target.value = '';
    });
    els.resetBtn.addEventListener('click', resetToSamples);
    els.clearAllBtn.addEventListener('click', clearAll);

    // Keyboard shortcuts (home view)
    document.addEventListener('keydown', (e) => {
      if (currentView !== 'home') return;
      // Ignore if typing in a field
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (els.modalOverlay.hidden === false || els.confirmOverlay.hidden === false) return;

      if (e.key === 'ArrowRight') { e.preventDefault(); nextMotivation(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prevMotivation(); }
      else if (e.key === 'n' || e.key === 'N') { e.preventDefault(); newMotivation(); }
      else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); if (currentQuoteId) toggleFavourite(currentQuoteId); }
      else if (e.key === 'c' || e.key === 'C') { e.preventDefault(); copyCurrent(); }
      else if (e.key === 's' || e.key === 'S') { e.preventDefault(); shareCurrent(); }
    });

    // ESC closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (els.confirmOverlay.hidden === false) closeConfirm();
        else if (els.modalOverlay.hidden === false) closeModal();
      }
    });
  }

  /* ---------- PWA: Register Service Worker ---------- */
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('service-worker.js')
          .then((reg) => {
            // Listen for updates
            reg.addEventListener('updatefound', () => {
              const nw = reg.installing;
              if (!nw) return;
              nw.addEventListener('statechange', () => {
                if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available — silently update; will activate on next load
                  showToast('App updated — reload to use the new version.');
                }
              });
            });
          })
          .catch((err) => {
            console.warn('Service worker registration failed:', err);
          });
      });
    }
  }

  /* ---------- Install prompt (Android Chrome) ---------- */
  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default mini-infobar
    e.preventDefault();
    deferredInstallPrompt = e;
    // We don't show a banner; user can use browser menu "Install app".
  });

  /* ---------- Init ---------- */
  function init() {
    loadState();
    applySettingsToUI();
    applyBackground(settings.theme);
    wireEvents();

    // Show initial quote
    if (motivations.length > 0) {
      let initialId = null;
      if (settings.dailyInspiration === 'on') {
        // Pick a "daily" quote based on day of year (stable within a day)
        const dayOfYear = Math.floor(
          (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
        );
        initialId = motivations[dayOfYear % motivations.length].id;
      } else if (historyIndex >= 0 && history[historyIndex]) {
        initialId = history[historyIndex];
      } else {
        initialId = pickRandom(motivations).id;
      }
      showQuote(initialId);
      // Reset history to this single point (don't accumulate across sessions beyond what we restored)
      if (historyIndex < 0) pushHistory(initialId);
      updateNavButtons();
    } else {
      els.quoteText.textContent = 'Add your first motivation to begin your journey.';
      els.quoteCategory.textContent = '—';
      els.quoteAuthor.textContent = '';
      updateFavButton(false);
      updateNavButtons();
    }

    renderCollection();
    renderFavourites();
    registerServiceWorker();
  }

  // Kick off
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
