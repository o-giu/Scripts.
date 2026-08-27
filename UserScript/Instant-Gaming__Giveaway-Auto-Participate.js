// ==UserScript==
// @name        Instant Gaming - Giveaway Auto Participate
// @match       https://www.instant-gaming.com/*
// @grant       none
// @version     1.2
// @author      oGiu
// @description This script automates entries for giveaways on the IG website
// ==/UserScript==

(function() {
    'use strict';

    const defaultLinks = [
        "https://www.instant-gaming.com/fr/giveaway/BOBLENNON",
        "https://www.instant-gaming.com/fr/giveaway/INSTANTGAMING",
        "https://www.instant-gaming.com/fr/giveaway/SUPREMELEADER",
        "https://www.instant-gaming.com/fr/giveaway/ICONOBLAST",
        "https://www.instant-gaming.com/fr/giveaway/bugland",
        "https://www.instant-gaming.com/fr/giveaway/GAMEMOVIELAND",
        "https://www.instant-gaming.com/fr/giveaway/CODQG",
        "https://www.instant-gaming.com/fr/giveaway/NALFEINN",
        "https://www.instant-gaming.com/fr/giveaway/VARG",
        "https://www.instant-gaming.com/fr/giveaway/skyyart",
        "https://www.instant-gaming.com/fr/giveaway/ALKOR",
        "https://www.instant-gaming.com/fr/giveaway/ROBERT",
        "https://www.instant-gaming.com/fr/giveaway/GAMEWAVE",
        "https://www.instant-gaming.com/fr/giveaway/RATSUPER",
        "https://www.instant-gaming.com/fr/giveaway/YANKA",
        "https://www.instant-gaming.com/fr/giveaway/STREAMRUNNERS",
        "https://www.instant-gaming.com/fr/giveaway/MeetTheMyth",
        "https://www.instant-gaming.com/fr/giveaway/PHENRIR",
        "https://www.instant-gaming.com/fr/giveaway/GMODFR",
        "https://www.instant-gaming.com/fr/giveaway/INSTANTGAMINGES",
        "https://www.instant-gaming.com/fr/giveaway/ACRE",
        "https://www.instant-gaming.com/fr/giveaway/BILLYCHEROKEE",
        "https://www.instant-gaming.com/fr/giveaway/LYNX",
        "https://www.instant-gaming.com/fr/giveaway/ZONALEROS",
        "https://www.instant-gaming.com/fr/giveaway/GUIGUI",
        "https://www.instant-gaming.com/fr/giveaway/PORAID",
        "https://www.instant-gaming.com/fr/giveaway/INSTANTGAMINGPT",
        "https://www.instant-gaming.com/fr/giveaway/TOMBIE",
        "https://www.instant-gaming.com/fr/giveaway/muusoo",
        "https://www.instant-gaming.com/fr/giveaway/xariel",
        "https://www.instant-gaming.com/fr/giveaway/POKEMONMILLENNIUM",
        "https://www.instant-gaming.com/fr/giveaway/AQUIYAHORA",
        "https://www.instant-gaming.com/fr/giveaway/PIVI",
        "https://www.instant-gaming.com/fr/giveaway/Seals311",
        "https://www.instant-gaming.com/fr/giveaway/vicio",
        "https://www.instant-gaming.com/fr/giveaway/INSTANTGAMINGITALIA",
        "https://www.instant-gaming.com/fr/giveaway/INFOPOINT-ITALIA",
        "https://www.instant-gaming.com/fr/giveaway/FROZ3N",
        "https://www.instant-gaming.com/fr/giveaway/ELOTRIX",
        "https://www.instant-gaming.com/fr/giveaway/NYKK3",
        "https://www.instant-gaming.com/fr/giveaway/PLAYERINSIDE",
        "https://www.instant-gaming.com/fr/giveaway/ILGATTOSULTUBO",
        "https://www.instant-gaming.com/fr/giveaway/FRANCESCOPARDINI",
        "https://www.instant-gaming.com/fr/giveaway/NU89",
        "https://www.instant-gaming.com/fr/giveaway/ITERMOSIFONI",
        "https://www.instant-gaming.com/fr/giveaway/CORYPHEUS",
        "https://www.instant-gaming.com/fr/giveaway/THETJI",
        "https://www.instant-gaming.com/fr/giveaway/deladysigner",
        "https://www.instant-gaming.com/fr/giveaway/KURU",
        "https://www.instant-gaming.com/fr/giveaway/K0MPA",
        "https://www.instant-gaming.com/fr/giveaway/instantgamingde",
        "https://www.instant-gaming.com/fr/giveaway/INSTANTGAMINGPL",
        "https://www.instant-gaming.com/fr/giveaway/snedgie",
        "https://www.instant-gaming.com/fr/giveaway/officialinvictus",
        "https://www.instant-gaming.com/fr/giveaway/GCA",
        "https://www.instant-gaming.com/fr/giveaway/tahva",
        "https://www.instant-gaming.com/fr/giveaway/frankieslair",
        "https://www.instant-gaming.com/fr/giveaway/GIORNOGAMING",
        "https://www.instant-gaming.com/fr/giveaway/SOLOUMIDO",
        "https://www.instant-gaming.com/fr/giveaway/CYBERLUK",
        "https://www.instant-gaming.com/fr/giveaway/STELIUS",
        "https://www.instant-gaming.com/fr/giveaway/CSGOFR",
        "https://www.instant-gaming.com/fr/giveaway/EXOMADARA",
        "https://www.instant-gaming.com/fr/giveaway/KWOREY",
        "https://www.instant-gaming.com/fr/giveaway/PHOTORACERTV",
        "https://www.instant-gaming.com/fr/giveaway/ARLAN360",
        "https://www.instant-gaming.com/fr/giveaway/j0nathan",
        "https://www.instant-gaming.com/fr/giveaway/HEIKKI360",
        "https://www.instant-gaming.com/fr/giveaway/topgames",
        "https://www.instant-gaming.com/fr/giveaway/CABRAVOLADORA",
        "https://www.instant-gaming.com/fr/giveaway/DRWAL",
        "https://www.instant-gaming.com/fr/giveaway/MERTA",
        "https://www.instant-gaming.com/fr/giveaway/IMPAKT",
        "https://www.instant-gaming.com/fr/giveaway/kiszak",
        "https://www.instant-gaming.com/fr/giveaway/playluque",
        "https://www.instant-gaming.com/fr/giveaway/STRADI",
        "https://www.instant-gaming.com/fr/giveaway/poro",
        "https://www.instant-gaming.com/fr/giveaway/DESASTRESHOW",
        "https://www.instant-gaming.com/fr/giveaway/JOFRIK99",
        "https://www.instant-gaming.com/fr/giveaway/MFGAMING",
        "https://www.instant-gaming.com/fr/giveaway/HeyStan",
        "https://www.instant-gaming.com/fr/giveaway/Drunge",
        "https://www.instant-gaming.com/fr/giveaway/Zazza23",
        "https://www.instant-gaming.com/fr/giveaway/BlackPommes",
        "https://www.instant-gaming.com/fr/giveaway/LUSORKOEFFIZIENT",
        "https://www.instant-gaming.com/fr/giveaway/quantoquevaicustar",
        "https://www.instant-gaming.com/fr/giveaway/eusouocap",
        "https://www.instant-gaming.com/fr/giveaway/joepad17",
        "https://www.instant-gaming.com/fr/giveaway/vutomy",
        "https://www.instant-gaming.com/fr/giveaway/elkai",
        "https://www.instant-gaming.com/fr/giveaway/onlywaifu",
        "https://www.instant-gaming.com/fr/giveaway/naito75",
        "https://www.instant-gaming.com/fr/giveaway/remedy",
        "https://www.instant-gaming.com/fr/giveaway/losiu",
        "https://www.instant-gaming.com/fr/giveaway/azhunky",
        "https://www.instant-gaming.com/fr/giveaway/ramosturbo",
        "https://www.instant-gaming.com/fr/giveaway/mello",
        "https://www.instant-gaming.com/fr/giveaway/pixelade",
        "https://www.instant-gaming.com/fr/giveaway/carinazinhaa",
        "https://www.instant-gaming.com/fr/giveaway/huebi",
        "https://www.instant-gaming.com/fr/giveaway/JULIXSZ",
        "https://www.instant-gaming.com/fr/giveaway/locklear",
        "https://www.instant-gaming.com/fr/giveaway/FERJUS",
        "https://www.instant-gaming.com/fr/giveaway/iReaz",
        "https://www.instant-gaming.com/fr/giveaway/JORGESPRINTER",
        "https://www.instant-gaming.com/fr/giveaway/KAZHAMANIA",
        "https://www.instant-gaming.com/fr/giveaway/KYCU",
        "https://www.instant-gaming.com/fr/giveaway/larsi",
        "https://www.instant-gaming.com/fr/giveaway/lunadix28",
        "https://www.instant-gaming.com/fr/giveaway/NERDOVERNEWS",
        "https://www.instant-gaming.com/fr/giveaway/OVERCHARGEDEGG",
        "https://www.instant-gaming.com/fr/giveaway/PHASMOPHOBIAFR",
        "https://www.instant-gaming.com/fr/giveaway/polman",
        "https://www.instant-gaming.com/fr/giveaway/purePia",
        "https://www.instant-gaming.com/fr/giveaway/ROBLOXFR",
        "https://www.instant-gaming.com/fr/giveaway/SKIBCUSIENKO",
        "https://www.instant-gaming.com/fr/giveaway/T4ISON",
        "https://www.instant-gaming.com/fr/giveaway/XEUDITALIA",
        "https://www.instant-gaming.com/fr/giveaway/Xip4",
        "https://www.instant-gaming.com/fr/giveaway/YUUHI",
        "https://www.instant-gaming.com/fr/giveaway/zellendust",
        "https://www.instant-gaming.com/fr/giveaway/MartinSpielt",
        "https://www.instant-gaming.com/fr/giveaway/carlesims",
        "https://www.instant-gaming.com/fr/giveaway/jackdarius",
        "https://www.instant-gaming.com/fr/giveaway/MINOS",
        "https://www.instant-gaming.com/fr/giveaway/sermedieval",
        "https://www.instant-gaming.com/fr/giveaway/rax1337",
        "https://www.instant-gaming.com/fr/giveaway/gorillagame",
        "https://www.instant-gaming.com/fr/giveaway/masterdoom93",
        "https://www.instant-gaming.com/fr/giveaway/nyxson",
        "https://www.instant-gaming.com/fr/giveaway/me5rine-lab",
        "https://www.instant-gaming.com/fr/giveaway/valranox",
        "https://www.instant-gaming.com/fr/giveaway/gtatv",
        "https://www.instant-gaming.com/fr/giveaway/imkombo",
        "https://www.instant-gaming.com/fr/giveaway/luc1dg",
        "https://www.instant-gaming.com/fr/giveaway/xanderracing",
        "https://www.instant-gaming.com/fr/giveaway/hardware31",
        "https://www.instant-gaming.com/fr/giveaway/deezgames",
        "https://www.instant-gaming.com/fr/giveaway/IIP",
        "https://www.instant-gaming.com/fr/giveaway/RetroRaider",
        "https://www.instant-gaming.com/fr/giveaway/steamdeckmaniaofficial",
        "https://www.instant-gaming.com/fr/giveaway/slashingcreeps"
    ];

    let links = JSON.parse(localStorage.getItem('ig_links') || '[]');
    if (links.length !== defaultLinks.length) {
        links = defaultLinks;
        localStorage.setItem('ig_links', JSON.stringify(links));
    }

    let currentLang = localStorage.getItem('ig_lang') || 'pt';

    const trans = {
        pt: {
            ready: "Pronto para começar",
            running: "🚀 <strong>Rodando...</strong><br>Link {idx} de {total}",
            paused: "⏸️ <strong>Pausado</strong><br>Próximo: {idx}/{total}",
            finished: "✅ <strong>Concluído!</strong><br>Todos os {total} links visitados.",
            start: "INICIAR",
            pause: "PAUSAR",
            reset: "RESETAR",
            list: "📋 LISTA",
            end: "FIM",
            ended: "Terminou",
            prompt_add: "Digite o link do sorteio:",
            prompt_remove: "Digite o número para remover (1 a {total}):",
            invalid_link: "Link inválido!",
            going_to: "🔄 Indo para link {idx}...",
            closed: "⛔ Sorteio encerrado.",
            checking: "⚡ Verificando...",
            confirming: "⚡ Confirmando status...",
            success: "✅ Confirmado/Participado",
            searching: "🔎 Procurando botão participar...",
            clicking_social: "📱 Clicando nas tarefas...",
            flag: "🇧🇷",
            wait_success: "✅ Sucesso! Aguarde...",
            not_found: "🔎 Botão não encontrado/Já participa",
            waiting_frame: "⏳ Aguardando tarefas...",
            done_social: "✅ Tarefas clicadas."
        },
        en: {
            ready: "Ready to start",
            running: "🚀 <strong>Running...</strong><br>Link {idx} of {total}",
            paused: "⏸️ <strong>Paused</strong><br>Next: {idx}/{total}",
            finished: "✅ <strong>Finished!</strong><br>All {total} links visited.",
            start: "START",
            pause: "PAUSE",
            reset: "RESET",
            list: "📋 LIST",
            end: "END",
            ended: "Ended",
            prompt_add: "Enter giveaway link:",
            prompt_remove: "Enter number to remove (1 to {total}):",
            invalid_link: "Invalid link!",
            going_to: "🔄 Going to link {idx}...",
            closed: "⛔ Giveaway ended.",
            checking: "⚡ Checking...",
            confirming: "⚡ Confirming status...",
            success: "✅ Confirmed/Participated",
            searching: "🔎 Looking for participate button...",
            clicking_social: "📱 Clicking tasks...",
            flag: "🇺🇸",
            wait_success: "✅ Success! Please wait...",
            not_found: "🔎 Button not found or already participating",
            waiting_frame: "⏳ Waiting for tasks...",
            done_social: "✅ Tasks clicked."
        }
    };

    function t(key, replacements = {}) {
        let text = trans[currentLang][key] || key;
        for (const [k, v] of Object.entries(replacements)) {
            text = text.replace(`{${k}}`, v);
        }
        return text;
    }

    const style = document.createElement('style');
    style.innerHTML = `
        #ig-panel-container { position: fixed; bottom: 20px; right: 20px; width: 280px; background: #1e1e1e; color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.6); font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; z-index: 9999999; overflow: hidden; border: 1px solid #333; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
        #ig-panel-container.minimized { width: 60px; height: 60px; border-radius: 50%; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; }
        #ig-panel-container.minimized .header, #ig-panel-container.minimized .content { display: none !important; }
        #ig-panel-container.minimized .min-icon { display: block; font-size: 28px; animation: pulse 2s infinite; }
        .min-icon { display: none; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .header { background: linear-gradient(90deg, #6200ea, #9d46ff); padding: 12px 15px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
        .header-buttons { display: flex; gap: 5px; }
        .header button { background: rgba(0,0,0,0.2); border: none; color: white; width: 24px; height: 24px; border-radius: 50%; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .header button:hover { background: rgba(0,0,0,0.4); }
        .content { padding: 15px; }
        .progress-container { background: #333; border-radius: 10px; height: 8px; width: 100%; margin-bottom: 12px; overflow: hidden; }
        .progress-bar { background: #00e676; height: 100%; width: 0%; transition: width 0.3s ease; box-shadow: 0 0 8px rgba(0, 230, 118, 0.5); }
        .status-info { font-size: 13px; color: #ccc; margin-bottom: 15px; text-align: center; line-height: 1.4; background: #252525; padding: 10px; border-radius: 8px; min-height: 40px; display: flex; align-items: center; justify-content: center; flex-direction: column; }
        .status-info strong { color: #fff; }
        .controls { display: flex; gap: 10px; flex-wrap: wrap;}
        .btn { flex: 1; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px; transition: transform 0.1s, opacity 0.2s; text-transform: uppercase; min-width: 80px; }
        .btn:active { transform: scale(0.96); }
        .btn:hover { opacity: 0.9; }
        .btn-start { background: #00e676; color: #004d40; }
        .btn-start.paused { background: #ffea00; color: #3e2723; }
        .btn-reset { background: #ff1744; color: white; }
        .btn-list { background: #2979ff; color: white; flex-basis: 100%; margin-top: 5px;}
        #ig-list-container { margin-top: 15px; background: #121212; border-radius: 8px; max-height: 200px; overflow-y: auto; display: none; border: 1px solid #333; }
        #ig-list-container.visible { display: block; }
        .list-item { padding: 8px 10px; border-bottom: 1px solid #2c2c2c; font-size: 12px; display: flex; justify-content: space-between; align-items: center; }
        .list-item:last-child { border-bottom: none; }
        .list-item.participated { border-left: 3px solid #00e676; background: #003300; }
        .list-item.ended { border-left: 3px solid #d32f2f; background: #2a0e0e; opacity: 0.7; }
        .list-item.pending { border-left: 3px solid #757575; }
        .list-item.current { background: #2c2c2c; }
        .item-name { font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100px; }
        .item-timer { font-family: monospace; color: #aaa; font-size: 11px; }
        .edit-controls { display: flex; gap: 5px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #333; }
        .btn-action { padding: 5px 0; font-size: 16px; font-weight: bold; border-radius: 4px; flex: 1; }
        .btn-add { background: #2e7d32; color: white; }
        .btn-remove { background: #c62828; color: white; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #121212; }
        ::-webkit-scrollbar-thumb { background: #424242; border-radius: 3px; }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'ig-panel-container';
    container.innerHTML = `
        <div class="min-icon">🎁</div>
        <div class="header">
            <span>Giveaway Auto Participate</span>
            <div class="header-buttons">
                <button id="ig-lang-btn">${t('flag')}</button>
                <button id="ig-minimize-btn" title="_">_</button>
            </div>
        </div>
        <div class="content">
            <div class="progress-container">
                <div class="progress-bar" id="ig-progress"></div>
            </div>
            <div class="status-info" id="ig-status">
                ${t('ready')}
            </div>
            <div class="controls">
                <button class="btn btn-start" id="ig-btn-start">${t('start')}</button>
                <button class="btn btn-reset" id="ig-btn-reset">${t('reset')}</button>
                <button class="btn btn-list" id="ig-btn-toggle">${t('list')}</button>
            </div>
            <div id="ig-list-container"></div>
            <div class="edit-controls" id="ig-edit-controls" style="display:none;">
                <button class="btn btn-action btn-add" id="ig-btn-add">+</button>
                <button class="btn btn-action btn-remove" id="ig-btn-remove">-</button>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    const btnMinimize = document.getElementById('ig-minimize-btn');
    const btnLang = document.getElementById('ig-lang-btn');
    const progressBar = document.getElementById('ig-progress');
    const statusDiv = document.getElementById('ig-status');
    const btnStart = document.getElementById('ig-btn-start');
    const btnReset = document.getElementById('ig-btn-reset');
    const btnToggle = document.getElementById('ig-btn-toggle');
    const listContainer = document.getElementById('ig-list-container');
    const editControls = document.getElementById('ig-edit-controls');
    const btnAdd = document.getElementById('ig-btn-add');
    const btnRemove = document.getElementById('ig-btn-remove');

    let db = JSON.parse(localStorage.getItem('ig_db') || '{}');
    let isMinimized = localStorage.getItem('ig_minimized') === 'true';
    if(isMinimized) container.classList.add('minimized');

    container.onclick = function(e) {
        if (container.classList.contains('minimized')) {
            container.classList.remove('minimized');
            localStorage.setItem('ig_minimized', 'false');
        }
    };

    btnMinimize.onclick = function(e) {
        e.stopPropagation();
        container.classList.add('minimized');
        localStorage.setItem('ig_minimized', 'true');
    };

    btnLang.onclick = function(e) {
        e.stopPropagation();
        currentLang = currentLang === 'pt' ? 'en' : 'pt';
        localStorage.setItem('ig_lang', currentLang);
        btnLang.innerText = t('flag');
        refreshTexts();
        updateUI();
    };

    function refreshTexts() {
        btnReset.innerText = t('reset');
        btnToggle.innerText = t('list');
        updateUI();
    }

    btnToggle.onclick = function(e) {
        e.stopPropagation();
        listContainer.classList.toggle('visible');
        editControls.style.display = listContainer.classList.contains('visible') ? 'flex' : 'none';
    };

    btnAdd.onclick = function(e) {
        e.stopPropagation();
        const url = prompt(t('prompt_add'));
        if (url && url.includes('instant-gaming.com')) {
            links.push(url);
            localStorage.setItem('ig_links', JSON.stringify(links));
            updateListUI();
            updateUI();
        } else if (url) {
            alert(t('invalid_link'));
        }
    };

    btnRemove.onclick = function(e) {
        e.stopPropagation();
        const num = prompt(t('prompt_remove', {total: links.length}));
        const idx = parseInt(num) - 1;
        if (idx >= 0 && idx < links.length) {
            links.splice(idx, 1);
            localStorage.setItem('ig_links', JSON.stringify(links));
            updateListUI();
            updateUI();
        }
    };

    window.alert = () => true;
    window.confirm = () => true;
    const originalOpen = window.open;
    window.open = (url, target, features) => {
        const win = originalOpen(url, target, features);
        if (win) setTimeout(() => { try { win.close(); } catch(e){} }, 1500);
        return { close: () => {} };
    };

    function getNameFromUrl(url) { return url.split('/').pop().split('?')[0]; }

    function formatTime(seconds) {
        if (seconds <= 0) return t('ended');
        const d = Math.floor(seconds / 86400), h = Math.floor((seconds % 86400) / 3600), m = Math.floor((seconds % 3600) / 60);
        return d > 0 ? `${d}d ${h}h` : `${h}h ${m}m ${Math.floor(seconds % 60)}s`;
    }

    function updateListUI() {
        const currentIndex = parseInt(localStorage.getItem('ig_index') || '0');
        let html = '';
        links.forEach((link, idx) => {
            const name = getNameFromUrl(link), data = db[name];
            let statusClass = 'pending', timerText = '--:--:--';
            if (data) { if (data.ended) statusClass = 'ended'; else if (data.participated) statusClass = 'participated'; }
            if (idx === currentIndex) statusClass += ' current';
            if (data && data.endDate) timerText = formatTime(data.endDate - Math.floor(Date.now() / 1000));
            html += `<div class="list-item ${statusClass}" id="item-${idx}"><span class="item-name">${idx + 1}. ${name}</span><span class="item-timer" data-end="${data ? data.endDate : 0}">${timerText}</span></div>`;
        });
        listContainer.innerHTML = html;
    }

    function startTimerLoop() {
        setInterval(() => {
            if (!listContainer.classList.contains('visible')) return;
            const now = Math.floor(Date.now() / 1000);
            document.querySelectorAll('.item-timer').forEach(t => {
                const end = parseInt(t.getAttribute('data-end'));
                if (end > 0) t.innerText = formatTime(end - now);
            });
        }, 1000);
    }

    function updateUI() {
        const isRunning = localStorage.getItem('ig_running') === 'true', currentIndex = parseInt(localStorage.getItem('ig_index') || '0'), total = links.length;
        progressBar.style.width = `${Math.min((currentIndex / total) * 100, 100)}%`;
        if (currentIndex >= total) { statusDiv.innerHTML = t('finished', {total: total}); btnStart.innerText = t('end'); btnStart.disabled = true; return; }
        if (isRunning) { statusDiv.innerHTML = t('running', {idx: currentIndex + 1, total: total}); btnStart.innerText = t('pause'); btnStart.classList.add('paused'); }
        else { statusDiv.innerHTML = t('paused', {idx: currentIndex + 1, total: total}); btnStart.innerText = t('start'); btnStart.classList.remove('paused'); }
    }

    btnStart.onclick = function(e) {
        e.stopPropagation();
        if (parseInt(localStorage.getItem('ig_index') || '0') >= links.length) return;
        localStorage.setItem('ig_running', localStorage.getItem('ig_running') === 'true' ? 'false' : 'true');
        if (localStorage.getItem('ig_running') === 'true') runAutomation();
        updateUI();
    };

    btnReset.onclick = function(e) {
        e.stopPropagation();
        localStorage.setItem('ig_running', 'false');
        localStorage.setItem('ig_index', '0');
        btnStart.disabled = false;
        updateUI();
        updateListUI();
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function clickSocialButtons() {
        const sel = ['.boost .button:not(.validate)', '.boost a.button', '.actions a.button', '.social-actions a', '.modal .actions a.button', 'div[class*="actions"] a'];
        let buttons = [];
        sel.forEach(s => document.querySelectorAll(s).forEach(b => { if(!buttons.includes(b)) buttons.push(b); }));
        buttons = buttons.filter(b => !((b.className || '').includes('validate') || (b.id || '').includes('participate')));
        if (buttons.length > 0) {
            statusDiv.innerHTML = t('clicking_social');
            for (const btn of buttons) { btn.click(); await sleep(600); }
            statusDiv.innerHTML = t('done_social');
            return true;
        }
        return false;
    }

    function scrapeData() {
        const currentName = getNameFromUrl(window.location.href);
        if (!db[currentName]) db[currentName] = {};
        const c = document.getElementById('giveaway-countdown');
        if (c) db[currentName].endDate = parseInt(c.getAttribute('data-end-date'));
        if (document.querySelector('.giveaway-over')) { db[currentName].ended = true; db[currentName].participated = false; }
        else { db[currentName].ended = false; if (document.querySelector('.participated')) db[currentName].participated = true; }
        localStorage.setItem('ig_db', JSON.stringify(db));
        updateListUI();
        return db[currentName];
    }

    async function runAutomation() {
        if (localStorage.getItem('ig_running') !== 'true') return;
        let idx = parseInt(localStorage.getItem('ig_index') || '0');
        if (idx >= links.length) { localStorage.setItem('ig_running', 'false'); updateUI(); return; }
        const target = links[idx], current = window.location.href.split('?')[0];
        if (current !== target) { statusDiv.innerHTML = t('going_to', {idx: idx + 1}); await sleep(1000); window.location.href = target; return; }
        if (document.readyState !== 'complete') await new Promise(r => window.addEventListener('load', r));
        await sleep(1500);
        const data = scrapeData();
        if (data && data.ended) { statusDiv.innerHTML = t('closed'); await sleep(2000); localStorage.setItem('ig_index', (idx + 1).toString()); runAutomation(); return; }
        statusDiv.innerHTML = t('checking');
        const main = document.querySelector('.button.validate') || document.querySelector('#giveaway_participate_button');
        if (main) { statusDiv.innerHTML = t('searching'); main.click(); await sleep(3000); }
        await clickSocialButtons(); await sleep(1000);
        const main2 = document.querySelector('.button.validate') || document.querySelector('#giveaway_participate_button');
        if (main2 && !main2.disabled) { main2.click(); await sleep(1000); }
        scrapeData(); statusDiv.innerHTML = t('wait_success'); await sleep(2000);
        localStorage.setItem('ig_index', (idx + 1).toString());
        runAutomation();
    }

    updateListUI();
    startTimerLoop();
    updateUI();
    if (localStorage.getItem('ig_running') === 'true') runAutomation();
})();
