// ==UserScript==
// @name        TikTok - Downloader
// @namespace   oGiu
// @match       https://www.tiktok.com/*
// @description Adds a UI to download photos and videos on browser
// @grant       none
// @version     1.0
// @author      oGiu
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.innerHTML = `
        #downloader-container {
            position: fixed; top: 15%; right: 230px; z-index: 10000;
            background: #121212; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
            padding: 0; width: 195px; color: white;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            box-shadow: 0 12px 32px rgba(0,0,0,0.9);
            display: none; max-height: 80vh; flex-direction: column;
            transition: width 0.3s, height 0.3s, border-radius 0.3s;
            box-sizing: border-box; user-select: none;
        }
        #downloader-container.minimized { width: 48px; height: 48px; border-radius: 50%; cursor: pointer; overflow: hidden; }
        .dl-header { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #fe2c55; padding: 10px; text-align: center; border-bottom: 1px solid #222; flex-shrink: 0; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: center; }
        .dl-header:hover { cursor: move; background: rgba(255,255,255,0.05); }
        .min-icon { display: none; font-size: 20px; width: 100%; height: 100%; align-items: center; justify-content: center; background: #fe2c55; }
        #downloader-container.minimized .min-icon { display: flex; }
        #downloader-container.minimized .dl-header, #downloader-container.minimized #dl-content, #downloader-container.minimized .dl-footer { display: none; }
        .toggle-ui { cursor: pointer; padding: 2px 8px; font-size: 18px; font-weight: bold; color: #fe2c55; }
        #dl-content { overflow-y: auto; flex-grow: 1; display: flex; flex-direction: column; gap: 8px; padding: 12px; }
        #dl-content::-webkit-scrollbar { width: 4px; }
        #dl-content::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; }
        .dl-btn { background: #262626; border: 1px solid #363636; border-radius: 6px; padding: 10px; width: 100%; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s ease; display: flex !important; align-items: center; justify-content: flex-start; text-decoration: none !important; box-sizing: border-box; gap: 10px; color: #efefef !important; }
        .dl-btn:hover { background: #333; border-color: #fe2c55; color: #fff !important; transform: scale(1.02); }
        .dl-btn span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; }
        .dl-footer { font-size: 8px; color: #555; padding: 8px; text-align: center; font-weight: 500; border-top: 1px solid #222; }
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

    let lastRenderedKey = '';
    let lastPostId = null;
    const itemCache = {};

    const savedPos = JSON.parse(localStorage.getItem('tt-dl-pos-v7') || '{"x":0,"y":0}');
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
        if (isDragging) { isDragging = false; localStorage.setItem('tt-dl-pos-v7', JSON.stringify({ x: xOffset, y: yOffset })); }
    });

    container.addEventListener('click', () => { if (container.classList.contains('minimized')) container.classList.remove('minimized'); });
    document.getElementById('dl-minimize').addEventListener('click', (e) => { e.stopPropagation(); container.classList.add('minimized'); });

    function getPostId() {
        const m = location.pathname.match(/\/(video|photo)\/(\d+)/);
        return m ? m[2] : null;
    }

    const INVALID = ['ttwstatic.com/obj/tiktok_web_login_static','sf16-website-login','sf19-website-login','webapp/main/webapp-desktop'];
    function validUrl(url) {
        if (!url || typeof url !== 'string' || url.startsWith('blob:')) return false;
        return !INVALID.some(p => url.includes(p));
    }

    function extractItems(data) {
        if (!data || typeof data !== 'object') return;
        try {
            const single = data.itemInfo?.itemStruct || data.itemStruct;
            if (single?.id) { itemCache[single.id] = single; tick(); return; }
            const lists = [data.itemList, data.items, data.videoList, data.data?.itemList, data.data?.items];
            for (const list of lists) {
                if (Array.isArray(list)) list.forEach(i => { if (i?.id) itemCache[i.id] = i; });
            }
            tick();
        } catch(e) {}
    }

    const origFetch = window.fetch;
    window.fetch = async function(input, ...args) {
        const res = await origFetch(input, ...args);
        try {
            const url = (typeof input === 'string' ? input : input?.url) || '';
            if (url.includes('tiktok')) res.clone().json().then(extractItems).catch(() => {});
        } catch(e) {}
        return res;
    };

    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(m, url, ...r) { this._url = url || ''; return origOpen.call(this, m, url, ...r); };
    XMLHttpRequest.prototype.send = function(...args) {
        if (this._url?.includes('tiktok')) {
            this.addEventListener('load', function() {
                try { extractItems(JSON.parse(this.responseText)); } catch(e) {}
            });
        }
        return origSend.call(this, ...args);
    };

    function findItemInData(obj, postId, depth) {
        if (depth > 8 || !obj || typeof obj !== 'object') return null;
        if ((obj.id === postId || obj.id === String(postId)) && (obj.video?.playAddr || obj.imagePost?.images?.length)) return obj;
        for (const key of Object.keys(obj)) {
            try { const r = findItemInData(obj[key], postId, depth + 1); if (r) return r; } catch(e) {}
        }
        return null;
    }

    function getFromUniversalData(postId) {
        const script = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__');
        if (!script) return null;
        try {
            const data = JSON.parse(script.textContent);
            const byId = findItemInData(data, postId, 0);
            if (byId) return byId;
            const findFirst = (obj, depth) => {
                if (depth > 6 || !obj || typeof obj !== 'object') return null;
                if ((obj.video?.playAddr && validUrl(obj.video.playAddr)) || obj.imagePost?.images?.length) return obj;
                for (const key of Object.keys(obj)) {
                    try { const r = findFirst(obj[key], depth + 1); if (r) return r; } catch(e) {}
                }
                return null;
            };
            return findFirst(data, 0);
        } catch(e) {}
        return null;
    }

    function mediaFromItem(item) {
        const media = [];
        if (!item) return media;
        if (item.imagePost?.images?.length) {
            item.imagePost.images.forEach((img, idx) => {
                const u = img.imageURL?.urlList?.[0] || img.imageURL?.urlList?.[1] || img.display_url || img.url;
                if (validUrl(u)) media.push({ url: u, type: 'Photo', index: idx + 1 });
            });
            const bg = item.music?.playUrl || item.music?.play_url?.uri;
            if (validUrl(bg)) media.push({ url: bg, type: 'Audio', index: null });
        } else {
            const v = validUrl(item.video?.playAddr) ? item.video.playAddr : validUrl(item.video?.downloadAddr) ? item.video.downloadAddr : null;
            if (v) media.push({ url: v, type: 'Video' });
            const t = item.video?.cover || item.video?.dynamicCover;
            if (validUrl(t)) media.push({ url: t, type: 'Thumbnail' });
        }
        return media;
    }

    function getTikTokMedia(postId) {
        if (itemCache[postId]) {
            const m = mediaFromItem(itemCache[postId]);
            if (m.length) return m;
        }
        const fromData = getFromUniversalData(postId);
        if (fromData) {
            itemCache[postId] = fromData;
            const m = mediaFromItem(fromData);
            if (m.length) return m;
        }
        const media = [];
        document.querySelectorAll('div[data-e2e="photo-post-image"] img, img[class*="ImgPhoto"]').forEach((img, idx) => {
            if (validUrl(img.src) && !media.some(m => m.url === img.src)) media.push({ url: img.src, type: 'Photo', index: idx + 1 });
        });
        return media;
    }

    function renderUI(found, postId) {
        const content = document.getElementById('dl-content');
        const key = postId + '|' + found.map(m => m.type + m.url.substring(0, 30)).join(',');
        if (key === lastRenderedKey && content.children.length > 0) return;
        lastRenderedKey = key;
        container.style.display = 'flex';
        content.innerHTML = '';
        let vi = 0, ti = 0, pi = 0, ai = 0;
        found.forEach((m) => {
            const a = document.createElement('a');
            a.className = 'dl-btn'; a.href = m.url; a.target = '_blank';
            const icon = m.type === 'Video' ? '🎥' : m.type === 'Thumbnail' ? '🖼️' : m.type === 'Audio' ? '🎵' : '📷';
            const num = m.index != null ? m.index : m.type === 'Video' ? ++vi : m.type === 'Thumbnail' ? ++ti : m.type === 'Audio' ? ++ai : ++pi;
            const label = (m.index === null && m.type === 'Audio') ? m.type : `${m.type} #${num}`;
            a.innerHTML = `<span>${icon}</span><span>${label}</span>`;
            content.appendChild(a);
        });
    }

    function dispatchCommentsTab() {
        const el = document.querySelector('.TUXTabBar');
        if (!el) return;
        const k = Object.keys(el).find(k => k.startsWith('__reactFiber'));
        if (!k) return;
        let fiber = el[k];
        while (fiber) {
            let s = fiber.memoizedState;
            while (s) {
                if (s.queue && s.memoizedState === 'related') {
                    try { s.queue.dispatch('comments'); } catch(e) {}
                    return;
                }
                s = s?.next;
            }
            fiber = fiber.return;
        }
    }

    new MutationObserver(() => {
        if (document.querySelector('.TUXTabBar-item#related button[data-active]')) {
            dispatchCommentsTab();
            setTimeout(dispatchCommentsTab, 50);
            setTimeout(dispatchCommentsTab, 200);
        }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-active'] });

    function tick() {
        const postId = getPostId();
        if (!postId) {
            if (lastPostId !== null) { container.style.display = 'none'; lastRenderedKey = ''; lastPostId = null; }
            return;
        }
        if (postId !== lastPostId) { lastPostId = postId; lastRenderedKey = ''; }
        const found = getTikTokMedia(postId);
        if (found.length > 0) renderUI(found, postId);
        dispatchCommentsTab();
    }

    const _push = history.pushState.bind(history);
    const _replace = history.replaceState.bind(history);
    function onNav() { setTimeout(tick, 50); setTimeout(tick, 400); }
    history.pushState = function(...a) { _push(...a); onNav(); };
    history.replaceState = function(...a) { _replace(...a); onNav(); };
    window.addEventListener('popstate', onNav);

    new MutationObserver(tick).observe(document.body, { childList: true, subtree: true });

    tick();
})();
