/**
 * INSTAGRAM CONVERSATION & MEMORY ARCHIVE — CORE ENGINE
 * Interactive personal memory viewer for Anshika & Anuj
 */

(function () {
  'use strict';

  // --- STATE ---
  let archive = window.CHAT_ARCHIVE || null;
  let messages = [];
  let stats = {};
  
  // Virtual / Chunk Render Window
  const CHUNK_SIZE = 90;
  let renderedStartIndex = 0;
  let renderedEndIndex = 0;
  let isLoadingChunk = false;

  // Search State
  let searchResults = [];
  let currentSearchIndex = -1;
  let currentQuery = '';

  // Bookmarks
  let bookmarkedIds = new Set();
  try {
    const saved = localStorage.getItem('anshi_chat_bookmarks');
    if (saved) bookmarkedIds = new Set(JSON.parse(saved));
  } catch (e) {}

  // DOM Elements
  const viewport = document.getElementById('chat-viewport');
  const messagesList = document.getElementById('messages-list');
  const topSentinel = document.getElementById('top-sentinel');
  const bottomSentinel = document.getElementById('bottom-sentinel');
  const header = document.getElementById('chat-header');
  const progressPill = document.getElementById('progress-pill');
  const searchPanel = document.getElementById('search-bar-panel');
  const searchInput = document.getElementById('search-input');
  const searchCount = document.getElementById('search-count');
  const searchPrevBtn = document.getElementById('search-prev');
  const searchNextBtn = document.getElementById('search-next');
  const searchClearBtn = document.getElementById('search-clear');
  const desktopTimeline = document.getElementById('desktop-timeline');
  const datePickerModal = document.getElementById('date-picker-modal');
  const datesGrid = document.getElementById('dates-grid');
  const introScreen = document.getElementById('intro-screen');
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const toast = document.getElementById('app-toast');

  // --- INITIALIZATION ---
  async function init() {
    initTheme();

    if (!archive) {
      try {
        const res = await fetch('conversation_data.json');
        if (res.ok) {
          archive = await res.json();
          window.CHAT_ARCHIVE = archive;
        }
      } catch (err) {
        console.warn('Could not fetch JSON, waiting for script tag...', err);
      }
    }

    if (!archive || !archive.messages) {
      setTimeout(init, 50);
      return;
    }

    messages = archive.messages;
    stats = archive.stats;

    buildDesktopTimeline();
    buildDatePickerSheet();
    setupIntersectionObservers();
    setupEventListeners();

    // Render initial chunk starting at index 0 (August 14, 2026)
    renderInitialChunk(0);
  }

  // --- THEME HANDLING ---
  function initTheme() {
    const savedTheme = localStorage.getItem('anshi_chat_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-mode');
      updateThemeToggleIcon(true);
    } else {
      document.body.classList.remove('dark-mode');
      updateThemeToggleIcon(false);
    }
  }

  function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('anshi_chat_theme', isDark ? 'dark' : 'light');
    updateThemeToggleIcon(isDark);
  }

  function updateThemeToggleIcon(isDark) {
    const iconBtn = document.getElementById('theme-toggle-btn');
    if (!iconBtn) return;
    iconBtn.innerHTML = isDark
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  }

  // --- VIRTUAL CHUNK RENDERING ---
  function renderInitialChunk(centerIndex) {
    messagesList.innerHTML = '';
    const start = Math.max(0, centerIndex - Math.floor(CHUNK_SIZE / 2));
    const end = Math.min(messages.length, start + CHUNK_SIZE);
    
    renderedStartIndex = start;
    renderedEndIndex = end;

    const fragment = document.createDocumentFragment();
    for (let i = start; i < end; i++) {
      fragment.appendChild(createMessageDOM(messages[i], i));
    }
    messagesList.appendChild(fragment);

    // If reached end, render chat in numbers summary & ending card
    if (end >= messages.length) {
      appendSummaryAndEndingCard();
    }

    updateActiveDateIndicator();
    setupVideoObservers();
  }

  function appendNextChunk() {
    if (isLoadingChunk || renderedEndIndex >= messages.length) return;
    isLoadingChunk = true;

    const nextEnd = Math.min(messages.length, renderedEndIndex + CHUNK_SIZE);
    const fragment = document.createDocumentFragment();

    for (let i = renderedEndIndex; i < nextEnd; i++) {
      fragment.appendChild(createMessageDOM(messages[i], i));
    }

    messagesList.appendChild(fragment);
    renderedEndIndex = nextEnd;

    if (renderedEndIndex >= messages.length) {
      appendSummaryAndEndingCard();
    }

    isLoadingChunk = false;
    updateActiveDateIndicator();
    setupVideoObservers();
  }

  function prependPreviousChunk() {
    if (isLoadingChunk || renderedStartIndex <= 0) return;
    isLoadingChunk = true;

    const prevStart = Math.max(0, renderedStartIndex - CHUNK_SIZE);
    const fragment = document.createDocumentFragment();

    for (let i = prevStart; i < renderedStartIndex; i++) {
      fragment.appendChild(createMessageDOM(messages[i], i));
    }

    const previousScrollHeight = viewport.scrollHeight;
    const previousScrollTop = viewport.scrollTop;

    messagesList.insertBefore(fragment, messagesList.firstChild);
    renderedStartIndex = prevStart;

    // Preserve exact scroll position so view doesn't jump
    const newScrollHeight = viewport.scrollHeight;
    viewport.scrollTop = previousScrollTop + (newScrollHeight - previousScrollHeight);

    isLoadingChunk = false;
    updateActiveDateIndicator();
    setupVideoObservers();
  }

  // --- MESSAGE DOM BUILDER ---
  function createMessageDOM(msg, idx) {
    const prevMsg = idx > 0 ? messages[idx - 1] : null;
    const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;

    const isAnuj = msg.s === 'Anuj';
    const isNewDate = !prevMsg || prevMsg.d !== msg.d;
    const isSenderChange = isNewDate || (prevMsg && prevMsg.s !== msg.s);
    const isLastOfGroup = !nextMsg || nextMsg.d !== msg.d || nextMsg.s !== msg.s;
    const isFirstOfGroup = isSenderChange;

    const container = document.createElement('div');
    container.className = 'message-group-container';
    container.dataset.msgId = msg.id;

    // 1. Date Separator & First Message Opening Experience
    if (isNewDate) {
      const sep = document.createElement('div');
      sep.className = 'date-separator';
      sep.dataset.date = msg.d;
      sep.innerHTML = `<span class="date-badge">${escapeHtml(msg.d)}</span>`;
      container.appendChild(sep);

      // Special opening memory card before conversation starts at idx 0
      if (idx === 0) {
        container.appendChild(createOpeningMemoryCard());
      }
    }

    // 2. Scrapbook Accents (Sparse, delicate notes outside conversation)
    if (idx === 2) {
      const sticker = document.createElement('div');
      sticker.className = 'scrapbook-sticker right';
      sticker.innerHTML = `<span>✏️ &ldquo;random question&rdquo;</span>`;
      container.appendChild(sticker);
    } else if (msg.d === 'Aug 15, 2026' && isFirstOfGroup && idx === 13) {
      const sticker = document.createElement('div');
      sticker.className = 'scrapbook-sticker left';
      sticker.innerHTML = `<span>🌸 &ldquo;and then we kept talking...&rdquo;</span>`;
      container.appendChild(sticker);
    }

    // 3. Message Row
    const row = document.createElement('div');
    row.id = `msg-${msg.id}`;
    row.className = `message-row ${isAnuj ? 'sent' : 'received'}`;
    if (isSenderChange) row.classList.add('sender-change');

    // Grouping classes for border-radius tailoring
    if (isFirstOfGroup && isLastOfGroup) {
      row.classList.add('group-single');
    } else if (isFirstOfGroup) {
      row.classList.add('group-top');
    } else if (isLastOfGroup) {
      row.classList.add('group-bottom');
    } else {
      row.classList.add('group-mid');
    }

    // Bubble Wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'message-bubble-wrapper';

    // Left avatar for Anshika
    if (!isAnuj) {
      if (isLastOfGroup) {
        const avatar = document.createElement('img');
        avatar.className = 'bubble-avatar';
        avatar.src = 'files/anshika_profile.jpg';
        avatar.alt = 'Anshika';
        avatar.onerror = function () {
          this.style.display = 'none';
        };
        wrapper.appendChild(avatar);
      } else {
        const spacer = document.createElement('div');
        spacer.className = 'bubble-avatar-spacer';
        wrapper.appendChild(spacer);
      }
    }

    // The Bubble itself
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    // Bubble Content
    let bubbleContent = '';

    // Text Content (Highlight search matches if active)
    if (msg.c && msg.c.trim()) {
      let formattedText = escapeHtml(msg.c);
      if (currentQuery) {
        const regex = new RegExp(`(${escapeRegex(currentQuery)})`, 'gi');
        formattedText = formattedText.replace(regex, '<mark class="search-match">$1</mark>');
      }
      bubbleContent += `<div class="message-text">${formattedText}</div>`;
    }

    // Media: Images
    if (msg.img && msg.img.length > 0) {
      bubbleContent += `<div class="message-media-grid">`;
      msg.img.forEach((imgSrc) => {
        bubbleContent += `
          <div class="message-img-container" onclick="window.chatApp.openLightbox('${imgSrc}')">
            <img class="message-img" src="${imgSrc}" loading="lazy" alt="Shared photo" onerror="this.parentElement.innerHTML='<div class=\\'media-unavailable\\'><span>📷 Media unavailable</span></div>'" />
          </div>`;
      });
      bubbleContent += `</div>`;
    }

    // Media: Videos
    if (msg.vid && msg.vid.length > 0) {
      bubbleContent += `<div class="message-media-grid">`;
      msg.vid.forEach((vidSrc) => {
        bubbleContent += `
          <video class="message-video" controls playsinline preload="metadata">
            <source src="${vidSrc}" type="video/mp4">
            Your browser does not support video.
          </video>`;
      });
      bubbleContent += `</div>`;
    }

    // Media: Shared Links / Reels / Posts
    if (msg.lnk && msg.lnk.length > 0) {
      msg.lnk.forEach((link) => {
        bubbleContent += `
          <div class="ig-post-card">
            <div class="ig-post-header">
              <svg class="ig-post-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              <span>Instagram Post / Reel</span>
            </div>
            <div class="ig-post-body">${escapeHtml(link.title || 'Shared attachment')}</div>
            <div class="ig-post-footer">
              <a class="ig-post-link" href="${link.url}" target="_blank" rel="noopener noreferrer">
                <span>View on Instagram</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            </div>
          </div>`;
      });
    }

    bubble.innerHTML = bubbleContent;
    wrapper.appendChild(bubble);

    // Reactions (Attached neatly to bubble corner)
    if (msg.rx && msg.rx.length > 0) {
      msg.rx.forEach((r) => {
        const badge = document.createElement('div');
        badge.className = 'reaction-badge';
        badge.title = `Reacted by ${r.reactor}`;
        badge.innerHTML = `<span>${r.emoji}</span><span class="reaction-name">${r.reactor}</span>`;
        wrapper.appendChild(badge);
      });
    }

    // Action Toolbar on Hover (Copy & Bookmark)
    const isBookmarked = bookmarkedIds.has(msg.id);
    const toolbar = document.createElement('div');
    toolbar.className = 'message-actions-toolbar';
    toolbar.innerHTML = `
      <button class="action-pill-btn" title="Copy text" onclick="window.chatApp.copyMessageText(${msg.id}, event)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </button>
      <button class="action-pill-btn ${isBookmarked ? 'bookmarked' : ''}" title="${isBookmarked ? 'Saved memory' : 'Save memory'}" onclick="window.chatApp.toggleBookmark(${msg.id}, event)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </button>
    `;
    wrapper.appendChild(toolbar);

    row.appendChild(wrapper);

    // Timestamp
    const ts = document.createElement('div');
    ts.className = 'message-timestamp';
    ts.textContent = msg.t;
    row.appendChild(ts);

    // Click to toggle timestamp on mobile/desktop
    bubble.addEventListener('click', (e) => {
      // Don't trigger if clicked a link or media
      if (e.target.closest('a') || e.target.closest('video')) return;
      row.classList.toggle('show-timestamp');
    });

    container.appendChild(row);

    // 4. Memory Break Checkpoints around conversation
    if (idx === 245) {
      container.appendChild(createFirstSnapMemoryBreak());
    } else if (idx === 7141) {
      container.appendChild(createFavoriteSnapMemoryBreak());
    }

    return container;
  }

  // --- SUMMARY SECTION & ENDING CARD ---
  function appendSummaryAndEndingCard() {
    if (document.getElementById('chat-summary-section')) return;

    const summarySection = document.createElement('div');
    summarySection.id = 'chat-summary-section';
    summarySection.className = 'chat-summary-section';
    summarySection.innerHTML = `
      <div class="summary-header">
        <span class="summary-badge">Our Memories</span>
        <h2 class="summary-title">Our Conversation in Numbers</h2>
      </div>

      <div class="summary-stats-grid">
        <div class="stat-card">
          <div class="stat-number">${stats.totalMessages.toLocaleString()}</div>
          <div class="stat-label">Total Messages</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.totalDays}</div>
          <div class="stat-label">Days Together</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.totalPhotos}</div>
          <div class="stat-label">Photos Shared</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.totalReactions}</div>
          <div class="stat-label">Reactions</div>
        </div>
      </div>

      <div class="summary-detail-row">
        <span class="detail-label">First Message</span>
        <span class="detail-value">${stats.firstMessageDate}</span>
      </div>
      <div class="summary-detail-row">
        <span class="detail-label">Latest Message</span>
        <span class="detail-value">${stats.latestMessageDate}</span>
      </div>
      <div class="summary-detail-row">
        <span class="detail-label">Messages by Anuj</span>
        <span class="detail-value">${stats.anujMessages.toLocaleString()} (${Math.round((stats.anujMessages / stats.totalMessages) * 100)}%)</span>
      </div>
      <div class="summary-detail-row">
        <span class="detail-label">Messages by Anshika</span>
        <span class="detail-value">${stats.anshikaMessages.toLocaleString()} (${Math.round((stats.anshikaMessages / stats.totalMessages) * 100)}%)</span>
      </div>
    `;
    messagesList.appendChild(summarySection);

    // Scrapbook Ending Card (Section 10: END-OF-CHAT EXPERIENCE)
    const endingCard = document.createElement('div');
    endingCard.className = 'scrapbook-ending-card';
    endingCard.innerHTML = `
      <div class="washi-tape-strip"></div>
      <div class="ending-badge">✨ YOU MADE IT TO THE END</div>
      <h3 class="ending-title">From one random conversation<br>to all of this.</h3>

      <div class="ending-video-frame" onclick="window.chatApp.toggleVideoPlay(this, event)">
        <video class="memory-video" src="files/my-fav-snap.mp4" playsinline loop muted preload="metadata"></video>
        <div class="video-overlay-ui">
          <span class="video-memory-sticker">memory</span>
          <button class="video-toggle-play" title="Play / Pause" onclick="window.chatApp.toggleVideoPlay(this, event)">
            <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
            <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          </button>
          <div class="video-bottom-controls">
            <button class="video-toggle-mute" title="Toggle Sound" onclick="window.chatApp.toggleVideoMute(this, event)">
              <svg class="icon-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
              <svg class="icon-unmuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            </button>
            <button class="video-expand-btn" title="Expand View" onclick="window.chatApp.openVideoModal('files/my-fav-snap.mp4', 'Funny how things work sometimes.', event)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <p class="ending-line-2" style="font-family: var(--font-hand); font-size: 21px; margin-bottom: 22px;">&ldquo;Funny how things work sometimes.&rdquo;</p>
      
      <button class="back-to-surprise-btn" onclick="window.chatApp.returnToBirthdaySurprise()">
        <span>Back to birthday surprise →</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </button>
    `;
    messagesList.appendChild(endingCard);
    setupVideoObservers();
  }

  // --- INTERSECTION OBSERVERS FOR INFINITE SCROLL ---
  function setupIntersectionObservers() {
    const bottomObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoadingChunk) {
          appendNextChunk();
        }
      });
    }, { root: viewport, rootMargin: '400px' });

    if (bottomSentinel) bottomObserver.observe(bottomSentinel);

    const topObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoadingChunk && renderedStartIndex > 0) {
          prependPreviousChunk();
        }
      });
    }, { root: viewport, rootMargin: '400px' });

    if (topSentinel) topObserver.observe(topSentinel);
  }

  // --- NAVIGATION & DATE JUMPING ---
  function jumpToMessage(msgId, highlight = true) {
    if (msgId < 0 || msgId >= messages.length) return;

    // Check if message is currently rendered
    let targetEl = document.getElementById(`msg-${msgId}`);

    if (!targetEl) {
      // Re-center rendered chunk around target
      renderInitialChunk(msgId);
      targetEl = document.getElementById(`msg-${msgId}`);
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (highlight) {
        targetEl.classList.add('target-highlight');
        setTimeout(() => targetEl.classList.remove('target-highlight'), 3600);
      }
    }
  }

  function jumpToFirstMessage() {
    renderInitialChunk(0);
    viewport.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      const firstRow = document.getElementById('msg-0');
      if (firstRow) {
        firstRow.classList.add('target-highlight');
        setTimeout(() => firstRow.classList.remove('target-highlight'), 3600);
      }
      showToast('✨ This is where it started.');
    }, 400);
  }

  function jumpToLatestMessage() {
    renderInitialChunk(messages.length - 1);
    setTimeout(() => {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }, 100);
  }

  function jumpToDate(dateStr) {
    const targetIdx = stats.dateFirstMsgMap[dateStr];
    if (targetIdx !== undefined) {
      jumpToMessage(targetIdx, true);
      showToast(`Jumped to ${dateStr}`);
    }
  }

  // --- TIMELINE & DATE PICKER BUILDERS ---
  function buildDesktopTimeline() {
    if (!desktopTimeline || !stats.uniqueDates) return;
    desktopTimeline.innerHTML = '';

    // Sample key dates evenly so desktop timeline is clean
    const step = Math.max(1, Math.floor(stats.uniqueDates.length / 10));
    const datesToDisplay = [];
    for (let i = 0; i < stats.uniqueDates.length; i += step) {
      datesToDisplay.push(stats.uniqueDates[i]);
    }
    const lastDate = stats.uniqueDates[stats.uniqueDates.length - 1];
    if (!datesToDisplay.includes(lastDate)) {
      datesToDisplay.push(lastDate);
    }

    // Always ensure milestone dates are represented
    const milestones = [
      { date: 'Aug 14, 2026', label: '✨ Start' },
      { date: 'Aug 15, 2026', label: '📸 Snap' },
      { date: 'Sep 20, 2026', label: '♡ Fav' },
      { date: 'Sep 30, 2026', label: '🏁 Latest' }
    ];

    datesToDisplay.forEach((d) => {
      const btn = document.createElement('button');
      btn.className = 'timeline-dot-btn';
      btn.title = d;
      let shortDate = d.replace(', 2026', '');

      const ms = milestones.find((m) => m.date === d);
      if (ms) {
        btn.classList.add('timeline-milestone');
        shortDate = ms.label;
      }

      btn.innerHTML = `<span class="timeline-dot"></span><span>${shortDate}</span>`;
      btn.addEventListener('click', () => jumpToDate(d));
      desktopTimeline.appendChild(btn);
    });
  }

  function buildDatePickerSheet() {
    if (!datesGrid || !stats.uniqueDates) return;
    datesGrid.innerHTML = '';

    stats.uniqueDates.forEach((d) => {
      const item = document.createElement('div');
      item.className = 'date-grid-item';
      let label = d.replace(', 2026', '');
      if (d === 'Aug 14, 2026') label += ' ✨';
      else if (d === 'Aug 15, 2026') label += ' 📸';
      else if (d === 'Sep 20, 2026') label += ' ♡';
      else if (d === 'Sep 30, 2026') label += ' 🏁';

      item.textContent = label;
      item.addEventListener('click', () => {
        closeDatePicker();
        jumpToDate(d);
      });
      datesGrid.appendChild(item);
    });
  }

  function openDatePicker() {
    if (datePickerModal) datePickerModal.classList.add('open');
  }

  function closeDatePicker() {
    if (datePickerModal) datePickerModal.classList.remove('open');
  }

  // --- SEARCH SYSTEM ---
  function toggleSearch() {
    const isOpen = searchPanel.classList.toggle('open');
    if (isOpen) {
      searchInput.focus();
      document.getElementById('search-toggle-btn').classList.add('active');
    } else {
      clearSearch();
      document.getElementById('search-toggle-btn').classList.remove('active');
    }
  }

  function handleSearchInput() {
    const query = searchInput.value.trim().toLowerCase();
    currentQuery = query;

    if (!query) {
      clearSearchResults();
      return;
    }

    searchClearBtn.style.display = 'block';

    // Search across text, sender, and date
    searchResults = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (
        (m.c && m.c.toLowerCase().includes(query)) ||
        m.s.toLowerCase().includes(query) ||
        m.d.toLowerCase().includes(query)
      ) {
        searchResults.push(m.id);
      }
    }

    if (searchResults.length > 0) {
      currentSearchIndex = 0;
      updateSearchUI();
      jumpToMessage(searchResults[0], true);
    } else {
      currentSearchIndex = -1;
      searchCount.textContent = '0 matches';
      searchPrevBtn.disabled = true;
      searchNextBtn.disabled = true;
    }
  }

  function nextSearchResult() {
    if (searchResults.length === 0) return;
    currentSearchIndex = (currentSearchIndex + 1) % searchResults.length;
    updateSearchUI();
    jumpToMessage(searchResults[currentSearchIndex], true);
  }

  function prevSearchResult() {
    if (searchResults.length === 0) return;
    currentSearchIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    updateSearchUI();
    jumpToMessage(searchResults[currentSearchIndex], true);
  }

  function updateSearchUI() {
    searchCount.textContent = `${currentSearchIndex + 1} of ${searchResults.length}`;
    searchPrevBtn.disabled = searchResults.length <= 1;
    searchNextBtn.disabled = searchResults.length <= 1;
  }

  function clearSearch() {
    searchInput.value = '';
    currentQuery = '';
    clearSearchResults();
    searchPanel.classList.remove('open');
    document.getElementById('search-toggle-btn').classList.remove('active');
  }

  function clearSearchResults() {
    searchResults = [];
    currentSearchIndex = -1;
    searchCount.textContent = '';
    searchClearBtn.style.display = 'none';
    searchPrevBtn.disabled = true;
    searchNextBtn.disabled = true;
  }

  // --- CONVERSATION PROGRESS TRACKER ---
  let progressTimeout = null;
  function updateActiveDateIndicator() {
    // Detect currently visible date in viewport
    const visibleDateSeps = Array.from(document.querySelectorAll('.date-separator'));
    let currentVisibleDate = stats.uniqueDates ? stats.uniqueDates[0] : 'August 14';

    for (let i = visibleDateSeps.length - 1; i >= 0; i--) {
      const rect = visibleDateSeps[i].getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.45) {
        currentVisibleDate = visibleDateSeps[i].dataset.date || currentVisibleDate;
        break;
      }
    }

    // Calculate day number
    if (stats.uniqueDates) {
      const dayIndex = stats.uniqueDates.indexOf(currentVisibleDate);
      if (dayIndex !== -1 && progressPill) {
        progressPill.textContent = `${currentVisibleDate.replace(', 2026', '')} • Day ${dayIndex + 1} of our conversations`;
        progressPill.classList.add('visible');

        clearTimeout(progressTimeout);
        progressTimeout = setTimeout(() => {
          progressPill.classList.remove('visible');
        }, 2200);
      }
    }
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Scroll listener for header elevation & progress pill
    viewport.addEventListener('scroll', () => {
      if (viewport.scrollTop > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      updateActiveDateIndicator();
    }, { passive: true });

    // Search inputs
    searchInput.addEventListener('input', handleSearchInput);
    searchPrevBtn.addEventListener('click', prevSearchResult);
    searchNextBtn.addEventListener('click', nextSearchResult);
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      handleSearchInput();
      searchInput.focus();
    });

    // Keyboard shortcuts (Cmd/Ctrl + F, Escape)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        toggleSearch();
      } else if (e.key === 'Escape') {
        if (lightbox && lightbox.classList.contains('open')) {
          closeLightbox();
        } else if (datePickerModal && datePickerModal.classList.contains('open')) {
          closeDatePicker();
        } else if (searchPanel && searchPanel.classList.contains('open')) {
          clearSearch();
        }
      }
    });

    // Close date picker when clicking outside sheet
    if (datePickerModal) {
      datePickerModal.addEventListener('click', (e) => {
        if (e.target === datePickerModal) closeDatePicker();
      });
    }

    // Close lightbox when clicking outside
    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.closest('.lightbox-close-btn')) {
          closeLightbox();
        }
      });
    }
  }

  // --- MEMORY BREAK & SCRAPBOOK CARD BUILDERS ---
  function createOpeningMemoryCard() {
    const cardWrapper = document.createElement('div');
    cardWrapper.innerHTML = `
      <div class="first-message-opening-card">
        <div class="washi-tape-strip"></div>
        <div class="memory-badge" style="margin-bottom: 8px;">
          <span class="memory-badge-icon">✨</span>
          <span>WHERE IT ALL STARTED</span>
        </div>
        <div class="intro-date-pill" style="margin: 0 auto 16px auto; font-size: 11.5px; padding: 3px 12px;">August 2026</div>

        <div class="intro-ss-frame" onclick="window.chatApp.openLightbox('files/1st-msg-ss.png', 'The first few messages.')" title="Click to view full screen">
          <div class="intro-ss-washi"></div>
          <img class="intro-ss-img" src="files/1st-msg-ss.png" alt="1st msg ss" loading="eager" />
          <div class="intro-ss-tape-label">the first message</div>
        </div>

        <h3 class="intro-ss-quote-1">&ldquo;The first few messages.&rdquo;</h3>
        <p class="intro-ss-quote-2">Before all the random conversations,<br>there was just... this.</p>

        <button class="intro-start-btn" style="margin-top: 14px; padding: 9px 20px; font-size: 13px;" onclick="window.chatApp.scrollToFirstMessageBubble()">
          <span>Start the conversation ↓</span>
        </button>
      </div>

      <div class="timeline-step-connector">
        <span class="connector-line"></span>
        <span class="connector-badge">✨ THE BEGINNING</span>
        <span class="connector-line"></span>
      </div>
    `;
    return cardWrapper;
  }

  function createFirstSnapMemoryBreak() {
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="timeline-step-connector">
        <span class="connector-line"></span>
        <span class="connector-badge">📸 FIRST SNAP</span>
        <span class="connector-line"></span>
      </div>

      <div class="memory-checkpoint-break" id="memory-first-snap">
        <div class="memory-transition-text">
          &ldquo;Somewhere along the way,<br>the conversation became memories.&rdquo;
        </div>

        <div class="memory-card">
          <div class="memory-card-washi"></div>
          <div class="memory-badge">
            <span class="memory-badge-icon">📸</span>
            <span>ONE OF THE FIRST MEMORIES</span>
          </div>

          <div class="memory-video-wrapper" onclick="window.chatApp.toggleVideoPlay(this, event)">
            <video class="memory-video" src="files/1st-snap.mp4" playsinline loop muted preload="metadata"></video>
            <div class="video-overlay-ui">
              <span class="video-memory-sticker">memory</span>
              <button class="video-toggle-play" title="Play / Pause" onclick="window.chatApp.toggleVideoPlay(this, event)">
                <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              </button>
              <div class="video-bottom-controls">
                <button class="video-toggle-mute" title="Toggle Sound" onclick="window.chatApp.toggleVideoMute(this, event)">
                  <svg class="icon-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                  <svg class="icon-unmuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </button>
                <button class="video-expand-btn" title="Expand View" onclick="window.chatApp.openVideoModal('files/1st-snap.mp4', 'One of the first snaps.', event)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="memory-caption">&ldquo;One of the first snaps.&rdquo;</div>
        </div>
      </div>

      <div class="timeline-step-connector">
        <span class="connector-line"></span>
        <span class="connector-badge">💬 conversation continues...</span>
        <span class="connector-line"></span>
      </div>
    `;
    return el;
  }

  function createFavoriteSnapMemoryBreak() {
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="timeline-step-connector">
        <span class="connector-line"></span>
        <span class="connector-badge">♡ FAVORITE SNAP</span>
        <span class="connector-line"></span>
      </div>

      <div class="memory-checkpoint-break" id="memory-fav-snap">
        <div class="memory-transition-text">
          &ldquo;Not everything needs an explanation.<br>Some moments are just favorites.&rdquo;
        </div>

        <div class="memory-card">
          <div class="memory-card-washi"></div>
          <div class="memory-badge">
            <span class="memory-badge-icon">♡</span>
            <span>ONE OF MY FAVORITES</span>
          </div>

          <div class="memory-video-wrapper" onclick="window.chatApp.toggleVideoPlay(this, event)">
            <video class="memory-video" src="files/my-fav-snap.mp4" playsinline loop muted preload="metadata"></video>
            <div class="video-overlay-ui">
              <span class="video-memory-sticker">favorite</span>
              <button class="video-toggle-play" title="Play / Pause" onclick="window.chatApp.toggleVideoPlay(this, event)">
                <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              </button>
              <div class="video-bottom-controls">
                <button class="video-toggle-mute" title="Toggle Sound" onclick="window.chatApp.toggleVideoMute(this, event)">
                  <svg class="icon-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                  <svg class="icon-unmuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                </button>
                <button class="video-expand-btn" title="Expand View" onclick="window.chatApp.openVideoModal('files/my-fav-snap.mp4', 'Some memories just stay.', event)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="memory-caption">&ldquo;Some memories just stay.&rdquo;</div>
        </div>
      </div>

      <div class="timeline-step-connector">
        <span class="connector-line"></span>
        <span class="connector-badge">💬 conversation continues...</span>
        <span class="connector-line"></span>
      </div>
    `;
    return el;
  }

  // --- VIDEO CONTROLS & OBSERVER ENGINE ---
  let videoIntersectionObserver = null;
  function setupVideoObservers() {
    if (!('IntersectionObserver' in window)) return;
    if (videoIntersectionObserver) {
      videoIntersectionObserver.disconnect();
    }
    videoIntersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target.querySelector('video');
        if (!video) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (video.paused) {
            pauseAllOtherVideos(video);
            video.muted = true;
            video.play().then(() => {
              entry.target.classList.add('playing');
              entry.target.classList.remove('paused');
            }).catch(() => {});
          }
        } else {
          if (!video.paused) {
            video.pause();
            entry.target.classList.remove('playing');
            entry.target.classList.add('paused');
          }
        }
      });
    }, { root: viewport, threshold: [0.1, 0.5, 0.85] });

    document.querySelectorAll('.memory-video-wrapper, .ending-video-frame').forEach((el) => {
      videoIntersectionObserver.observe(el);
    });
  }

  function pauseAllOtherVideos(exceptVideo) {
    document.querySelectorAll('video').forEach((v) => {
      if (v !== exceptVideo && !v.paused) {
        v.pause();
        const wrapper = v.closest('.memory-video-wrapper, .ending-video-frame');
        if (wrapper) {
          wrapper.classList.remove('playing');
          wrapper.classList.add('paused');
        }
      }
    });
  }

  function toggleVideoPlay(targetEl, event) {
    if (event) event.stopPropagation();
    const wrapper = targetEl.closest('.memory-video-wrapper, .ending-video-frame');
    if (!wrapper) return;
    const video = wrapper.querySelector('video');
    if (!video) return;

    if (video.paused) {
      pauseAllOtherVideos(video);
      video.play().then(() => {
        wrapper.classList.add('playing');
        wrapper.classList.remove('paused');
      }).catch(() => {});
    } else {
      video.pause();
      wrapper.classList.remove('playing');
      wrapper.classList.add('paused');
    }
  }

  function toggleVideoMute(targetEl, event) {
    if (event) event.stopPropagation();
    const wrapper = targetEl.closest('.memory-video-wrapper, .ending-video-frame');
    if (!wrapper) return;
    const video = wrapper.querySelector('video');
    if (!video) return;

    video.muted = !video.muted;
    if (video.muted) {
      wrapper.classList.remove('unmuted');
      showToast('Muted');
    } else {
      wrapper.classList.add('unmuted');
      showToast('Sound on 🔊');
    }
  }

  function openVideoModal(src, caption, event) {
    if (event) event.stopPropagation();
    openVideoLightbox(src, caption);
  }

  // --- LIGHTBOX (Images & Videos) ---
  function openLightbox(src, caption = '') {
    if (!lightbox || !lightboxImg) return;
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.src = '';
      lightboxVideo.style.display = 'none';
    }
    lightboxImg.src = src;
    lightboxImg.style.display = 'block';
    if (lightboxCaption) {
      lightboxCaption.textContent = caption;
      lightboxCaption.style.display = caption ? 'block' : 'none';
    }
    lightbox.classList.add('open');
  }

  function openVideoLightbox(src, caption = '') {
    if (!lightbox || !lightboxVideo) return;
    if (lightboxImg) {
      lightboxImg.src = '';
      lightboxImg.style.display = 'none';
    }
    lightboxVideo.src = src;
    lightboxVideo.muted = true; // muted by default per specification
    lightboxVideo.style.display = 'block';
    if (lightboxCaption) {
      lightboxCaption.textContent = caption;
      lightboxCaption.style.display = caption ? 'block' : 'none';
    }
    lightbox.classList.add('open');
    lightboxVideo.play().catch(() => {});
  }

  function closeLightbox() {
    if (!lightbox) return;
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.src = '';
      lightboxVideo.style.display = 'none';
    }
    if (lightboxImg) {
      lightboxImg.src = '';
      lightboxImg.style.display = 'none';
    }
    lightbox.classList.remove('open');
  }

  function handleLightboxBackdrop(event) {
    if (event.target === lightbox || event.target.closest('.lightbox-close-btn')) {
      closeLightbox();
    }
  }

  // --- BOOKMARKS & COPY ---
  function toggleBookmark(msgId, event) {
    if (event) event.stopPropagation();
    if (bookmarkedIds.has(msgId)) {
      bookmarkedIds.delete(msgId);
      showToast('Removed from saved memories');
    } else {
      bookmarkedIds.add(msgId);
      showToast('Saved to your favorite memories ⭐');
    }
    try {
      localStorage.setItem('anshi_chat_bookmarks', JSON.stringify(Array.from(bookmarkedIds)));
    } catch (e) {}

    // Update button in DOM
    const row = document.getElementById(`msg-${msgId}`);
    if (row) {
      const btn = row.querySelector('.action-pill-btn[title*="Save"]');
      if (btn) btn.classList.toggle('bookmarked', bookmarkedIds.has(msgId));
    }
  }

  function copyMessageText(msgId, event) {
    if (event) event.stopPropagation();
    const msg = messages[msgId];
    if (!msg || !msg.c) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg.c).then(() => {
        showToast('Copied message to clipboard 📋');
      }).catch(() => {
        fallbackCopyText(msg.c);
      });
    } else {
      fallbackCopyText(msg.c);
    }
  }

  function fallbackCopyText(text) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast('Copied message to clipboard 📋');
  }

  // --- INTRO SCREEN TRANSITIONS & FIRST MESSAGE FLOW ---
  function showFirstMessageStep() {
    const step1 = document.getElementById('intro-step-1');
    const step2 = document.getElementById('intro-step-2');
    if (!step1 || !step2) {
      startFromBeginning();
      return;
    }

    step1.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    step1.style.opacity = '0';
    step1.style.transform = 'translateY(-10px)';

    setTimeout(() => {
      step1.style.display = 'none';
      step2.style.display = 'block';
      step2.style.opacity = '0';
      step2.style.transform = 'translateY(15px)';

      requestAnimationFrame(() => {
        step2.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        step2.style.opacity = '1';
        step2.style.transform = 'translateY(0)';
      });
    }, 280);
  }

  function startConversation() {
    startFromBeginning();
  }

  function startFromBeginning() {
    if (introScreen) {
      introScreen.classList.add('fade-out');
      setTimeout(() => {
        introScreen.style.display = 'none';
      }, 650);
    }
    jumpToFirstMessage();
  }

  function scrollToFirstMessageBubble() {
    const firstRow = document.getElementById('msg-0');
    if (firstRow) {
      firstRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
      firstRow.classList.add('target-highlight');
      setTimeout(() => firstRow.classList.remove('target-highlight'), 3600);
    }
  }

  function reopenIntro() {
    if (introScreen) {
      const step1 = document.getElementById('intro-step-1');
      const step2 = document.getElementById('intro-step-2');
      if (step1) {
        step1.style.display = 'block';
        step1.style.opacity = '1';
        step1.style.transform = 'none';
      }
      if (step2) {
        step2.style.display = 'none';
      }
      introScreen.style.display = 'flex';
      requestAnimationFrame(() => {
        introScreen.classList.remove('fade-out');
      });
    }
  }

  function returnToBirthdaySurprise() {
    if (window.opener) {
      window.close();
    } else if (document.referrer && document.referrer.includes('3000')) {
      window.location.href = document.referrer;
    } else {
      window.location.href = 'http://localhost:3000';
    }
  }

  // --- TOAST NOTIFICATIONS ---
  let toastTimer = null;
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2800);
  }

  // --- UTILS ---
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Expose global controller
  window.chatApp = {
    openLightbox,
    openVideoLightbox,
    openVideoModal,
    closeLightbox,
    handleLightboxBackdrop,
    toggleVideoPlay,
    toggleVideoMute,
    toggleBookmark,
    copyMessageText,
    jumpToFirstMessage,
    jumpToLatestMessage,
    jumpToDate,
    jumpToMessage,
    scrollToFirstMessageBubble,
    toggleSearch,
    toggleTheme,
    openDatePicker,
    closeDatePicker,
    showFirstMessageStep,
    startConversation,
    startFromBeginning,
    reopenIntro,
    returnToBirthdaySurprise
  };

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

