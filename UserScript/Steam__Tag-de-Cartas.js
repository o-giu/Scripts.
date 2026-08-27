// ==UserScript==
// @name         Steam - Tag de Cartas
// @version      1.0
// @description  Detecta cartas colecionáveis mesmo em jogos sem a tag correspondente (comum quando o dev esquece de atualizá-la)
// @author       oGiu
// @match        https://store.steampowered.com/app/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      raw.githubusercontent.com
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const BADGES_DB_URL = 'https://raw.githubusercontent.com/nolddor/steam-badges-db/main/data/badges.json';

    const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

    const KEY_DB = 'cartas_db_v1';
    const KEY_DB_TS = 'cartas_db_timestamp_v1';
    const KEY_CHECKED_PREFIX = 'cartas_checked_';

    function getAppId() {
        const match = window.location.pathname.match(/\/app\/(\d+)/);
        return match ? match[1] : null;
    }

    function makeTag(text, state) {
        const tag = document.createElement('span');
        tag.textContent = text;
        tag.id = 'cartas-tag-userscript';

        const colors = {
            checking: { bg: '#4a4a4a', fg: '#dddddd' },
            green:    { bg: '#2e7d32', fg: '#ffffff' },
            red:      { bg: '#a33636', fg: '#ffffff' },
            error:    { bg: '#7a6a2e', fg: '#ffffff' }
        };
        const c = colors[state] || colors.checking;

        Object.assign(tag.style, {
            display: 'inline-block',
            marginLeft: '8px',
            padding: '3px 10px',
            borderRadius: '3px',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '0.3px',
            verticalAlign: 'middle',
            backgroundColor: c.bg,
            color: c.fg
        });
        return tag;
    }

    function findAnchor() {
        return document.querySelector('.apphub_AppName')
            || document.querySelector('#appHubAppName')
            || document.querySelector('.game_title_area .apphub_AppName');
    }

    function insertTag(state, label) {
        const anchor = findAnchor();
        if (!anchor || !anchor.parentNode) return;

        const existing = document.getElementById('cartas-tag-userscript');
        if (existing) existing.remove();

        const tag = makeTag(label, state);
        anchor.parentNode.insertBefore(tag, anchor.nextSibling);
    }

    function getLocalDb() {
        const raw = GM_getValue(KEY_DB, null);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function dbNeedsSync() {
        const ts = GM_getValue(KEY_DB_TS, 0);
        return (Date.now() - ts) > SYNC_INTERVAL_MS;
    }

    function syncDb() {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: BADGES_DB_URL,
                timeout: 30000,
                onload: function (response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        const appidSet = {};
                        for (const appid in data) {
                            appidSet[appid] = 1;
                        }
                        GM_setValue(KEY_DB, JSON.stringify(appidSet));
                        GM_setValue(KEY_DB_TS, Date.now());
                        resolve(appidSet);
                    } catch (e) {
                        resolve(null);
                    }
                },
                onerror: function () { resolve(null); },
                ontimeout: function () { resolve(null); }
            });
        });
    }

    function checkAppidLive(appid) {
        return new Promise((resolve) => {
            fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&filters=basic,categories&cc=BR&l=brazilian`)
                .then(r => r.json())
                .then(data => {
                    const entry = data[appid];
                    if (!entry || !entry.success) {
                        resolve(null);
                        return;
                    }
                    const categories = (entry.data && entry.data.categories) || [];
                    const hasCards = categories.some(c => c.id === 29);
                    resolve(hasCards);
                })
                .catch(() => resolve(null));
        });
    }

    async function checkCards(appid) {
        insertTag('checking', 'Cartas: verificando...');

        let db = getLocalDb();
        if (!db || dbNeedsSync()) {
            const synced = await syncDb();
            if (synced) db = synced;
        }

        if (db && db[appid]) {
            insertTag('green', 'Cartas: sim');
            return;
        }

        const cachedChecked = GM_getValue(KEY_CHECKED_PREFIX + appid, null);
        if (cachedChecked === '1') {
            insertTag('green', 'Cartas: sim');
            return;
        }
        if (cachedChecked === '0') {
            insertTag('red', 'Cartas: não');
            return;
        }

        const hasCards = await checkAppidLive(appid);
        if (hasCards === null) {
            insertTag('error', 'Cartas: erro ao checar');
            return;
        }
        GM_setValue(KEY_CHECKED_PREFIX + appid, hasCards ? '1' : '0');
        insertTag(hasCards ? 'green' : 'red', hasCards ? 'Cartas: sim' : 'Cartas: não');
    }

    const appid = getAppId();
    if (appid) {
        const tryInsert = () => {
            if (findAnchor()) {
                checkCards(appid);
            } else {
                setTimeout(tryInsert, 300);
            }
        };
        tryInsert();
    }
})();
