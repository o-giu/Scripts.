// ==UserScript==
// @name        Instagram - Downloader
// @namespace   oGiu
// @match       https://www.instagram.com/*
// @description Adds a UI to download photos and videos on browser
// @grant       none
// @version     1.0
// @author      oGiu
// ==/UserScript==

(function() {
    'use strict';

    const wasReloaded = performance.getEntriesByType('navigation')[0]?.type === 'reload';

    const style = document.createElement('style');
    style.innerHTML = `
        #downloader-container {
            position: fixed; top: 12px; right: 60px; z-index: 10000;
            background: #121212; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
            padding: 0; width: 190px; color: white;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            box-shadow: 0 12px 32px rgba(0,0,0,0.9);
            display: none; max-height: 75vh; flex-direction: column;
            box-sizing: border-box; user-select: none;
            transition: width 0.3s, height 0.3s, border-radius 0.3s;
        }
        #downloader-container.minimized { width: 48px; height: 48px; border-radius: 50%; cursor: pointer; overflow: hidden; }
        .min-icon { display: none; font-size: 20px; width: 100%; height: 100%; align-items: center; justify-content: center; background: #0095f6; }
        #downloader-container.minimized .min-icon { display: flex; }
        #downloader-container.minimized .dl-header, #downloader-container.minimized #dl-content, #downloader-container.minimized .dl-footer { display: none; }
        .dl-header { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #0095f6; padding: 12px; text-align: center; border-bottom: 1px solid #222; flex-shrink: 0; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: center; cursor: move; }
        .dl-header:hover { background: rgba(255,255,255,0.05); }
        .toggle-ui { cursor: pointer; padding: 2px 8px; font-size: 18px; font-weight: bold; color: #0095f6; }
        #dl-content { overflow-y: auto; flex-grow: 1; scrollbar-width: thin; display: flex; flex-direction: column; gap: 8px; padding: 12px; }
        #dl-content::-webkit-scrollbar { width: 4px; }
        #dl-content::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; }
        .dl-btn { background: #262626; border: 1px solid #363636; border-radius: 6px; padding: 10px; width: 100%; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s ease; display: flex !important; align-items: center; justify-content: flex-start; text-decoration: none !important; box-sizing: border-box; gap: 10px; color: #efefef !important; }
        .dl-btn:hover { background: #333; border-color: #0095f6; color: #fff !important; transform: scale(1.02); box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
        .dl-btn span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; }
        .dl-footer { font-size: 9px; color: #555; padding: 8px; text-align: center; flex-shrink: 0; font-weight: 500; border-top: 1px solid #222; }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'downloader-container';
    container.innerHTML = `
        <div class="min-icon">📥</div>
        <div class="dl-header" id="dl-drag-handle">
            <span>Downloader</span>
            <div class="toggle-ui" id="dl-minimize">−</div>
        </div>
        <div id="dl-content"></div>
        <div class="dl-footer">by oGiu</div>
    `;
    document.body.appendChild(container);

    const savedPos = JSON.parse(localStorage.getItem('ig-dl-pos-v1') || '{"x":0,"y":0}');
    let xOffset = savedPos.x, yOffset = savedPos.y;
    container.style.transform = `translate(${xOffset}px, ${yOffset}px)`;

    let isDragging = false, initialX, initialY;
    document.addEventListener('mousedown', (e) => {
        if (e.target.closest('#dl-drag-handle')) { initialX = e.clientX - xOffset; initialY = e.clientY - yOffset; isDragging = true; }
    });
    document.addEventListener('mousemove', (e) => {
        if (isDragging) { e.preventDefault(); xOffset = e.clientX - initialX; yOffset = e.clientY - initialY; container.style.transform = `translate(${xOffset}px, ${yOffset}px)`; }
    });
    document.addEventListener('mouseup', () => {
        if (isDragging) { isDragging = false; localStorage.setItem('ig-dl-pos-v1', JSON.stringify({ x: xOffset, y: yOffset })); }
    });

    container.addEventListener('click', () => { if (container.classList.contains('minimized')) container.classList.remove('minimized'); });
    document.getElementById('dl-minimize').addEventListener('click', (e) => { e.stopPropagation(); container.classList.add('minimized'); });

    let lastRenderedKey = '';
    let lastUrl = location.href;
    let storiesEnabledForSession = wasReloaded && isStoriesPage();
    const mediaCache = {};
    const storyItemCache = {};
    const fetchingPosts = new Set();

    function isPostPage() { return /^\/(p|reel|reels)\/[A-Za-z0-9_-]+/.test(location.pathname); }
    function isStoriesPage() { return /^\/stories\//.test(location.pathname); }
    function getCurrentShortcode() {
        const m = location.pathname.match(/\/(p|reels|reel)\/([A-Za-z0-9_-]+)/);
        return m ? m[2] : null;
    }
    function getStoryInfo() {
        const m = location.pathname.match(/^\/stories\/([^/]+)(?:\/(\d+))?/);
        return m ? { username: m[1], storyId: m[2] } : null;
    }
    function shortcodeToId(s) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        let id = BigInt(0);
        for (const c of s) id = id * BigInt(64) + BigInt(chars.indexOf(c));
        return id.toString();
    }

    function extractMedia(node, list) {
        if (!node) return;
        const isVideo = node.video_versions?.length > 0 || node.is_video === true || node.media_type === 2;
        if (isVideo) {
            if (node.video_versions?.length) list.push({ url: node.video_versions[0].url, type: 'Video' });
            else if (node.video_url) list.push({ url: node.video_url, type: 'Video' });
            if (node.image_versions2?.candidates?.length) list.push({ url: node.image_versions2.candidates[0].url, type: 'Thumbnail' });
            else if (node.display_url) list.push({ url: node.display_url, type: 'Thumbnail' });
        } else if (node.image_versions2?.candidates?.length) {
            list.push({ url: node.image_versions2.candidates[0].url, type: 'Photo' });
        } else if (node.display_url) {
            list.push({ url: node.display_url, type: 'Photo' });
        }
    }

    function extractFromItem(item, list) {
        if (!item) return;
        if (item.carousel_media) item.carousel_media.forEach(m => extractMedia(m, list));
        else if (item.edge_sidecar_to_children?.edges) item.edge_sidecar_to_children.edges.forEach(e => extractMedia(e.node, list));
        else extractMedia(item, list);
    }

    function processStoryItems(items) {
        if (!Array.isArray(items)) return;
        items.forEach(item => {
            const id = item?.pk || item?.id;
            if (!id) return;
            const list = [];
            extractMedia(item, list);
            if (list.length) storyItemCache[String(id)] = list;
        });
    }

    function findAndProcess(obj, depth) {
        if (depth > 15 || !obj || typeof obj !== 'object') return;
        if (Array.isArray(obj)) { obj.forEach(i => findAndProcess(i, depth + 1)); return; }

        if (Array.isArray(obj.reels_media)) {
            obj.reels_media.forEach(reel => { if (reel.items) processStoryItems(reel.items); });
        }

        const connKey = Object.keys(obj).find(k => k.includes('reels_media') && k.includes('connection'));
        if (connKey && obj[connKey]?.edges) {
            obj[connKey].edges.forEach(edge => { if (edge?.node?.items) processStoryItems(edge.node.items); });
        }

        const postKey = obj.shortcode || obj.code;
        if (postKey && obj.video_versions?.length) {
            const list = [];
            extractFromItem(obj, list);
            if (list.length) mediaCache[postKey] = list;
        } else if (postKey && (obj.carousel_media || obj.edge_sidecar_to_children)) {
            const list = [];
            extractFromItem(obj, list);
            if (list.length) mediaCache[postKey] = list;
        } else if (postKey && obj.image_versions2 && !mediaCache[postKey]) {
            const list = [];
            extractFromItem(obj, list);
            if (list.length) mediaCache[postKey] = list;
        }

        for (const k of Object.keys(obj)) {
            try { findAndProcess(obj[k], depth + 1); } catch(e) {}
        }
    }

    function processResponse(text) {
        try {
            const data = JSON.parse(text);
            findAndProcess(data, 0);
            if (isPostPage() || isStoriesPage()) refreshUI();
        } catch(e) {}
    }

    const origFetch = window.fetch;
    window.fetch = async function(input, ...args) {
        const res = await origFetch(input, ...args);
        try {
            const url = (typeof input === 'string' ? input : input?.url) || '';
            if (url.includes('instagram.com')) res.clone().text().then(processResponse).catch(() => {});
        } catch(e) {}
        return res;
    };

    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(m, url, ...r) { this._url = url || ''; return origOpen.call(this, m, url, ...r); };
    XMLHttpRequest.prototype.send = function(...args) {
        if (this._url?.includes('instagram.com')) {
            this.addEventListener('load', function() { processResponse(this.responseText); });
        }
        return origSend.call(this, ...args);
    };

    function fetchPostByShortcode(shortcode) {
        if (fetchingPosts.has(shortcode)) return;
        fetchingPosts.add(shortcode);
        origFetch(`https://www.instagram.com/api/v1/media/${shortcodeToId(shortcode)}/info/`, {
            credentials: 'include',
            headers: { 'X-IG-App-ID': '936619743392459', 'X-Requested-With': 'XMLHttpRequest', 'Accept': '*/*' }
        })
        .then(r => r.json())
        .then(data => {
            if (data.items?.length) {
                const list = [];
                data.items.forEach(item => extractFromItem(item, list));
                if (list.length) {
                    mediaCache[shortcode] = list;
                    if (isPostPage() && getCurrentShortcode() === shortcode) refreshUI();
                }
            }
        })
        .catch(() => {});
    }

    function getStoryMedia() {
        const info = getStoryInfo();
        if (!info) return [];
        if (info.storyId && storyItemCache[info.storyId]) return storyItemCache[info.storyId];
        document.querySelectorAll('script[type="application/json"]').forEach(s => {
            if (s.textContent.includes('reels_media')) {
                try { findAndProcess(JSON.parse(s.textContent), 0); } catch(e) {}
            }
        });
        if (info.storyId && storyItemCache[info.storyId]) return storyItemCache[info.storyId];
        return Object.values(storyItemCache).flat();
    }

    function getPostMedia(shortcode) {
        if (mediaCache[shortcode]?.some(m => m.type === 'Video')) return mediaCache[shortcode];
        document.querySelectorAll('script[type="application/json"]').forEach(s => {
            if (s.textContent.includes(shortcode)) {
                try { findAndProcess(JSON.parse(s.textContent), 0); } catch(e) {}
            }
        });
        if (mediaCache[shortcode]?.some(m => m.type === 'Video')) return mediaCache[shortcode];
        fetchPostByShortcode(shortcode);
        if (mediaCache[shortcode]) return mediaCache[shortcode];
        return [];
    }

    function renderUI(found) {
        const content = document.getElementById('dl-content');
        if (!content) return;
        const unique = Array.from(new Map(found.map(item => [item.url, item])).values());
        const renderKey = unique.map(m => m.url).join(',');
        if (renderKey === lastRenderedKey) return;
        lastRenderedKey = renderKey;
        container.style.display = 'flex';
        content.innerHTML = '';
        let vi = 0, ti = 0, pi = 0;
        unique.forEach((media) => {
            const a = document.createElement('a');
            a.className = 'dl-btn'; a.href = media.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
            const icon = media.type === 'Video' ? '🎥' : media.type === 'Thumbnail' ? '🖼️' : '📷';
            const label = media.type === 'Video' ? `Video #${++vi}` : media.type === 'Thumbnail' ? `Thumbnail #${++ti}` : `Photo #${++pi}`;
            a.innerHTML = `<span>${icon}</span><span>${label}</span>`;
            content.appendChild(a);
        });
    }

    function hideUI() { container.style.display = 'none'; lastRenderedKey = ''; }

    function refreshUI() {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            lastRenderedKey = '';
            if (!isStoriesPage()) storiesEnabledForSession = false;
        }
        if (isStoriesPage()) {
            if (!storiesEnabledForSession) { hideUI(); return; }
            const found = getStoryMedia();
            found.length > 0 ? renderUI(found) : hideUI();
        } else if (isPostPage()) {
            const found = getPostMedia(getCurrentShortcode());
            found.length > 0 ? renderUI(found) : hideUI();
        } else {
            hideUI();
        }
    }

    const _push = history.pushState.bind(history);
    const _replace = history.replaceState.bind(history);
    function onNav() { setTimeout(refreshUI, 100); setTimeout(refreshUI, 600); }
    history.pushState = function(...a) { _push(...a); onNav(); };
    history.replaceState = function(...a) { _replace(...a); onNav(); };
    window.addEventListener('popstate', onNav);

    new MutationObserver(() => {
        document.querySelectorAll('script[type="application/json"]:not([data-processed])').forEach(s => {
            s.setAttribute('data-processed', '1');
            processResponse(s.textContent);
        });
        refreshUI();
    }).observe(document.body, { childList: true, subtree: true });

    refreshUI();
})();
