// ==UserScript==
// @name         Mercado Livre - Aplicador Automatico de Cupons
// @version      1.0
// @description  Aplica cupons de forma automática para o Mercado Livre
// @author       oGiu
// @match        https://www.mercadolivre.com.br/cupons*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    if (window.self !== window.top) return;

    const STATE_KEY = 'ML_COUPON_STATE_V10';
    const START_URL = 'https://www.mercadolivre.com.br/cupons/filter?all=true';
    let keepAwakeCtx = null;

    const styles = `
        #ml-coupon-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 320px;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            color: #e2e8f0;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.6);
            font-family: 'Segoe UI', Roboto, sans-serif;
            z-index: 999999;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.15);
            transition: transform 0.3s ease;
        }
        #ml-coupon-header {
            padding: 15px;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            font-weight: 700;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 15px;
            color: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        #ml-coupon-body { padding: 15px; }
        .ml-stat-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
        }
        .ml-stat-box {
            background: rgba(255,255,255,0.05);
            padding: 10px;
            border-radius: 8px;
            text-align: center;
        }
        .ml-stat-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
        .ml-stat-val { font-size: 18px; font-weight: 700; color: #fff; margin-top: 2px; }
        #ml-console-log {
            font-family: monospace;
            font-size: 11px;
            color: #60a5fa;
            margin-bottom: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            height: 16px;
        }
        .ml-actions-row {
            display: flex;
            gap: 8px;
        }
        button.ml-btn {
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 13px;
            text-transform: uppercase;
            flex: 1;
        }
        #ml-reset-btn {
            background: rgba(255, 255, 255, 0.1);
            color: #cbd5e1;
            border: 1px solid rgba(255,255,255,0.1);
            display: none;
        }
        #ml-reset-btn:hover { background: rgba(255, 255, 255, 0.2); color: #fff; }

        .btn-start { background: #22c55e; color: #fff; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); }
        .btn-start:hover { background: #16a34a; transform: translateY(-1px); }

        .btn-stop { background: #ef4444; color: #fff; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
        .btn-stop:hover { background: #dc2626; transform: translateY(-1px); }

        .btn-reset { background: #3b82f6; color: #fff; }

        .pulse-text { animation: pulse 1.5s infinite; }
        .pop-anim { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .ml-target-highlight {
            outline: 3px solid #ef4444 !important;
            outline-offset: 2px !important;
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.6) !important;
            transition: all 0.2s !important;
        }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
    `;

    function getState() {
        return GM_getValue(STATE_KEY, {
            running: false,
            page: 1,
            totalPageCount: 1,
            applied: 0,
            visited: [],
            finished: false
        });
    }

    function setState(newState) {
        GM_setValue(STATE_KEY, { ...getState(), ...newState });
    }

    function resetState() {
        GM_setValue(STATE_KEY, {
            running: false,
            page: 1,
            totalPageCount: 1,
            applied: 0,
            visited: [],
            finished: false
        });
    }

    function toggleWakeLock(enable) {
        if (enable && !keepAwakeCtx) {
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                keepAwakeCtx = new AC();
                const osc = keepAwakeCtx.createOscillator();
                const gain = keepAwakeCtx.createGain();
                gain.gain.value = 0.0001;
                osc.connect(gain);
                gain.connect(keepAwakeCtx.destination);
                osc.start();
            } catch(e) {}
        } else if (!enable && keepAwakeCtx) {
            keepAwakeCtx.close();
            keepAwakeCtx = null;
        }
    }

    function createUI() {
        GM_addStyle(styles);
        const state = getState();
        const div = document.createElement('div');
        div.id = 'ml-coupon-widget';

        let btnText = 'INICIAR';
        let btnClass = 'btn-start';
        let indText = '⚪';
        let indClass = '';
        let logText = 'Aguardando início...';
        let pageText = '-';
        let showReset = false;

        if (state.running) {
            btnText = 'PARAR';
            btnClass = 'btn-stop';
            indText = '🟢';
            indClass = 'pulse-text';
            logText = 'Executando...';
            pageText = `${state.page} / ${state.totalPageCount}`;
        } else if (state.finished) {
            btnText = 'REINICIAR TUDO';
            btnClass = 'btn-reset';
            indText = '✅';
            logText = 'Concluído!';
            pageText = `${state.page} / ${state.totalPageCount}`;
        } else {
            if (state.applied > 0 || state.page > 1) {
                btnText = 'CONTINUAR';
                logText = 'Pausado.';
                pageText = `${state.page} / ${state.totalPageCount}`;
                showReset = true;
            }
        }

        div.innerHTML = `
            <div id="ml-coupon-header">
                <span>🎫 Aplicador Automatico de Cupons</span>
                <span id="ml-indicator" class="${indClass}">${indText}</span>
            </div>
            <div id="ml-coupon-body">
                <div class="ml-stat-grid">
                    <div class="ml-stat-box">
                        <div class="ml-stat-label">Páginas</div>
                        <div id="ml-page-val" class="ml-stat-val">${pageText}</div>
                    </div>
                    <div class="ml-stat-box">
                        <div class="ml-stat-label">Aplicados</div>
                        <div id="ml-applied-val" class="ml-stat-val">${state.applied}</div>
                    </div>
                </div>
                <div id="ml-console-log">${logText}</div>
                <div class="ml-actions-row">
                    <button id="ml-reset-btn" class="ml-btn">RESETAR</button>
                    <button id="ml-action-btn" class="ml-btn ${btnClass}">${btnText}</button>
                </div>
            </div>
        `;
        document.body.appendChild(div);

        document.getElementById('ml-reset-btn').style.display = showReset ? 'block' : 'none';
        document.getElementById('ml-action-btn').addEventListener('click', handleBtnClick);
        document.getElementById('ml-reset-btn').addEventListener('click', handleResetClick);
    }

    function log(msg) {
        const el = document.getElementById('ml-console-log');
        if (el) el.textContent = '> ' + msg;
    }

    function updateUI() {
        const state = getState();
        const btn = document.getElementById('ml-action-btn');
        const resetBtn = document.getElementById('ml-reset-btn');
        const indicator = document.getElementById('ml-indicator');
        const pageVal = document.getElementById('ml-page-val');
        const appliedVal = document.getElementById('ml-applied-val');

        pageVal.textContent = (state.running || state.finished || state.applied > 0)
            ? `${state.page} / ${state.totalPageCount}`
            : '-';

        if (parseInt(appliedVal.textContent) !== state.applied) {
            appliedVal.classList.remove('pop-anim');
            void appliedVal.offsetWidth;
            appliedVal.classList.add('pop-anim');
        }
        appliedVal.textContent = state.applied;

        const hasProgress = state.applied > 0 || state.page > 1;
        if (!state.running && !state.finished && hasProgress) {
            resetBtn.style.display = 'block';
            btn.textContent = 'CONTINUAR';
            btn.className = 'ml-btn btn-start';
            indicator.textContent = '🟡';
            indicator.classList.remove('pulse-text');
        } else if (state.running) {
            resetBtn.style.display = 'none';
            btn.textContent = 'PARAR';
            btn.className = 'ml-btn btn-stop';
            indicator.textContent = '🟢';
            indicator.classList.add('pulse-text');
        } else if (state.finished) {
            resetBtn.style.display = 'none';
            btn.textContent = 'REINICIAR TUDO';
            btn.className = 'ml-btn btn-reset';
            indicator.textContent = '✅';
            indicator.classList.remove('pulse-text');
        } else {
            resetBtn.style.display = 'none';
            btn.textContent = 'INICIAR';
            btn.className = 'ml-btn btn-start';
            indicator.textContent = '⚪';
            indicator.classList.remove('pulse-text');
        }
    }

    function handleResetClick() {
        if(confirm('Isso apagará o progresso e voltará para o início. Confirmar?')) {
            resetState();
            window.location.href = START_URL;
        }
    }

    function handleBtnClick() {
        const state = getState();
        if (state.running) {
            setState({ running: false });
            toggleWakeLock(false);
            log('Pausado.');
            updateUI();
        } else if (state.finished) {
            resetState();
            window.location.href = START_URL;
        } else {
            startAutomation();
        }
    }

    function getTotalPagesFromDOM() {
        const links = document.querySelectorAll('.andes-pagination__button a, .andes-pagination__page-count');
        let max = 1;
        links.forEach(l => {
            const txt = l.textContent.trim();
            const n = parseInt(txt);
            if (!isNaN(n) && n > max) max = n;
        });
        const current = parseInt(new URLSearchParams(window.location.search).get('page') || '1');
        return Math.max(max, current);
    }

    async function startAutomation() {
        setState({ running: true });
        toggleWakeLock(true);
        updateUI();
        log('Iniciando...');

        const currentUrl = new URL(window.location.href);
        if (getState().page === 1 && !currentUrl.href.includes('/filter?all=true')) {
            log('Redirecionando...');
            window.location.href = START_URL;
            return;
        }
        processPage();
    }

    function getButtons() {
        return Array.from(document.querySelectorAll('button, a.andes-button'))
            .filter(b => {
                const txt = (b.textContent || '').toLowerCase();
                const isAction = txt.includes('aplicar') || txt.includes('ativar');
                const isVisible = b.offsetParent !== null;
                const isNotDisabled = !b.disabled && b.getAttribute('aria-disabled') !== 'true';
                return isAction && isVisible && isNotDisabled;
            });
    }

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    async function processPage() {
        const state = getState();
        if (!state.running) return;

        const urlParams = new URLSearchParams(window.location.search);
        const currentPage = parseInt(urlParams.get('page') || '1');

        const total = getTotalPagesFromDOM();
        setState({ page: currentPage, totalPageCount: total });

        updateUI();
        log(`Página ${currentPage} de ${total}`);
        await sleep(1500);

        const buttons = getButtons();

        if (buttons.length > 0) {
            log(`Encontrados ${buttons.length} cupons.`);
            await sleep(500);

            for (let i = 0; i < buttons.length; i++) {
                if (!getState().running) break;
                const btn = buttons[i];

                btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                btn.classList.add('ml-target-highlight');
                log(`Aplicando ${i+1}/${buttons.length}...`);
                await sleep(400);

                try {
                    btn.click();
                    setState({ applied: getState().applied + 1 });
                    updateUI();
                } catch (e) {}

                await sleep(200);
                btn.classList.remove('ml-target-highlight');
                await sleep(300);
            }
        } else {
            log('Sem cupons nesta página.');
            await sleep(1000);
        }

        if (!getState().running) return;

        if (!state.visited.includes(currentPage)) {
            const visited = [...state.visited, currentPage];
            setState({ visited });
        }

        const nextBtn = document.querySelector('li.andes-pagination__button--next a, a[title="Siguiente"], a[title="Próximo"]');

        if (nextBtn && !nextBtn.getAttribute('aria-disabled')) {
            log('Próxima página...');
            await sleep(1000);
            const nextUrl = new URL(window.location.href);
            nextUrl.searchParams.set('page', currentPage + 1);
            window.location.href = nextUrl.toString();
        } else {
            setState({ running: false, finished: true });
            toggleWakeLock(false);
            updateUI();
            alert(`🎉 Fim! Total de Cupons Aplicados: ${getState().applied}`);
        }
    }

    const state = getState();
    createUI();

    if (state.running && !state.finished) {
        toggleWakeLock(true);
        setTimeout(processPage, 1000);
    }

})();
