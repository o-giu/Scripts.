// ==UserScript==
// @name         ItzAGud - Automation
// @version      2.3
// @author       oGiu
// @match        https://www.itzagud.net/*
// @description  Automates the site's tasks, chat, roulette, and giveaways
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  GM_addStyle(`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@700;800&display=swap');
    #iga-toggle { position: fixed; top: 16px; right: 16px; z-index: 1000000; width: 42px; height: 42px; border-radius: 11px; background: #10b981; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
    #iga-container { position: fixed; top: 66px; right: 16px; z-index: 999999; width: 320px; font-family: 'JetBrains Mono', monospace; background: rgba(12,12,14,0.98); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; color: white; backdrop-filter: blur(10px); }
    .iga-hidden { display: none !important; }
    .iga-header { padding: 12px; background: rgba(16,185,129,0.1); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
    .iga-body { padding: 10px; display: flex; flex-direction: column; gap: 8px; max-height: 70vh; overflow-y: auto; }
    .iga-card { border-radius: 10px; padding: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); }
    .iga-settings-panel { padding: 12px; background: #18181b; border-bottom: 1px solid #27272a; display: none; flex-direction: column; gap: 6px; }
    .iga-settings-panel.open { display: flex; }
    .iga-set-row { display: flex; justify-content: space-between; align-items: center; font-size: 10px; margin-bottom: 2px; }
    .iga-set-title { font-size: 9px; font-weight: 800; color: #10b981; margin: 8px 0 4px 0; text-transform: uppercase; border-bottom: 1px solid #27272a; padding-bottom: 2px; }
    .iga-input { background: #27272a; border: 1px solid #3f3f46; color: white; border-radius: 4px; padding: 2px 4px; width: 45px; text-align: center; }
    .iga-alert { padding: 8px; border-radius: 6px; font-size: 10px; border-left: 4px solid #10b981; background: rgba(255,255,255,0.05); margin-bottom: 5px; }
    #iga-save-btn { background: #10b981; color: white; border: none; border-radius: 6px; padding: 6px; font-weight: 800; cursor: pointer; margin-top: 10px; font-size: 10px; }
    .iga-rank-grid { display: grid; grid-template-columns: 1fr 40px 55px; gap: 8px; align-items: center; font-size: 9px; }
  `);

  const CATEGORIES = [
    { id: 'quick', label: 'QUICK' },
    { id: 'gangster', label: 'GANGSTER' },
    { id: 'offerwall', label: 'OFFERWALL' },
    { id: 'member', label: 'MEMBER' },
    { id: 'boss', label: 'BOSS' },
    { id: 'hitman', label: 'HITMAN' },
    { id: 'rolling', label: 'ROLLING' }
  ];

  function sleep(ms) { return new Promise(r => setTimeout(r, ms + Math.random() * 500)); }

  function humanClick(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const opts = { bubbles: true, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
    el.dispatchEvent(new MouseEvent('mousedown', opts));
    el.dispatchEvent(new MouseEvent('mouseup', opts));
    el.dispatchEvent(new MouseEvent('click', opts));
  }

  const toggle = document.createElement('button');
  toggle.id = 'iga-toggle'; toggle.textContent = '🎯';
  document.body.appendChild(toggle);

  const container = document.createElement('div');
  container.id = 'iga-container'; container.className = 'iga-hidden';

  let rankHtml = CATEGORIES.map(cat => `
    <div class="iga-rank-grid">
      <span>${cat.label}</span>
      <input type="checkbox" id="iga-set-${cat.id}">
      <input type="number" id="iga-ent-${cat.id}" class="iga-input" placeholder="Ent">
    </div>
  `).join('');

  container.innerHTML = `
    <div class="iga-header"><span style="font-weight:800; font-size:12px; color:#10b981;">ITZAGUD V2.3</span><button id="iga-cfg-btn" style="background:none; border:none; cursor:pointer;">⚙️</button></div>
    <div class="iga-settings-panel" id="iga-cfg">
      <div class="iga-set-title">General</div>
      <div class="iga-set-row"><span>Auto Tasks</span><input type="checkbox" id="iga-set-tasks"></div>
      <div class="iga-set-row"><span>Auto Wheel</span><input type="checkbox" id="iga-set-wheel"></div>
      <div class="iga-set-row"><span>Auto Chat</span><input type="checkbox" id="iga-set-chat"></div>
      <div class="iga-set-row"><span>Clams Reserve</span><input type="number" id="iga-set-minclams" class="iga-input"></div>
      <div class="iga-set-row"><span>Cycle (min)</span><input type="number" id="iga-set-cycle" class="iga-input"></div>
      <div class="iga-set-title">Rank | Enable | Entries</div>
      ${rankHtml}
      <button id="iga-save-btn">SAVE SETTINGS</button>
    </div>
    <div class="iga-body">
      <div id="iga-alerts"></div>
      <div class="iga-card"><div style="font-size:8px; color:#52525b;">CYCLE TIMER</div><div id="cycle-timer" style="font-size:14px; font-weight:bold; color:#10b981; margin-top:2px;">...</div></div>
      <div class="iga-card"><div style="font-size:8px; color:#52525b;">STATUS</div><div id="next-step-txt" style="font-size:10px; color:#e4e4e7; margin-top:4px;">Waiting...</div></div>
      <button id="iga-force-btn" style="width: 100%; padding: 10px; background: #10b981; border: none; color: white; border-radius: 8px; font-weight: 700; cursor: pointer;">RESET & FORCE SCAN</button>
    </div>
  `;
  document.body.appendChild(container);

  const syncUI = () => {
    document.getElementById('iga-set-tasks').checked = GM_getValue('autoTasks', true);
    document.getElementById('iga-set-wheel').checked = GM_getValue('autoWheel', true);
    document.getElementById('iga-set-chat').checked = GM_getValue('autoChat', true);
    document.getElementById('iga-set-minclams').value = GM_getValue('minClamsReserve', 100);
    document.getElementById('iga-set-cycle').value = GM_getValue('cycleMin', 15);
    CATEGORIES.forEach(cat => {
      document.getElementById(`iga-set-${cat.id}`).checked = GM_getValue(`cat_${cat.id}`, true);
      document.getElementById(`iga-ent-${cat.id}`).value = GM_getValue(`ent_${cat.id}`, 1);
    });
  };
  syncUI();

  document.getElementById('iga-cfg-btn').onclick = () => document.getElementById('iga-cfg').classList.toggle('open');
  toggle.onclick = () => container.classList.toggle('iga-hidden');

  document.getElementById('iga-save-btn').onclick = () => {
    GM_setValue('autoTasks', document.getElementById('iga-set-tasks').checked);
    GM_setValue('autoWheel', document.getElementById('iga-set-wheel').checked);
    GM_setValue('autoChat', document.getElementById('iga-set-chat').checked);
    GM_setValue('minClamsReserve', parseInt(document.getElementById('iga-set-minclams').value));
    GM_setValue('cycleMin', parseInt(document.getElementById('iga-set-cycle').value));
    CATEGORIES.forEach(cat => {
      GM_setValue(`cat_${cat.id}`, document.getElementById(`iga-set-${cat.id}`).checked);
      GM_setValue(`ent_${cat.id}`, parseInt(document.getElementById(`iga-ent-${cat.id}`).value) || 1);
    });
    alert$('Settings Saved!', 'green');
    document.getElementById('iga-cfg').classList.remove('open');
  };

  document.getElementById('iga-force-btn').onclick = () => { GM_setValue('igaLastCycle', '0'); sessionStorage.clear(); window.location.reload(); };

  function getCurrentClams() {
    const clamLabel = Array.from(document.querySelectorAll('span')).find(s => s.textContent.trim() === 'Clams');
    return clamLabel ? parseInt((clamLabel.nextElementSibling.getAttribute('title') || clamLabel.nextElementSibling.textContent).replace(/[^\d]/g, '')) : 999999;
  }

  async function processGiveaways(isPointsTab) {
    const enterButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim().toLowerCase() === 'enter' && !b.disabled && b.offsetParent !== null);
    if (enterButtons.length === 0) return false;
    const currentClams = getCurrentClams();

    for (const btn of enterButtons) {
      const row = btn.closest('.grid') || btn.parentElement.parentElement.parentElement;
      if (!row) continue;
      const rowText = row.innerText.toUpperCase();
      const icon = row.querySelector('div[title]');
      const iconTitle = icon ? icon.getAttribute('title').toUpperCase() : "";
      const matchedCat = CATEGORIES.find(cat => iconTitle.includes(cat.label) || rowText.includes(cat.label));

      if (isPointsTab) {
        if (matchedCat && GM_getValue(`cat_${matchedCat.id}`, true)) {
          const desiredEntries = parseInt(GM_getValue(`ent_${matchedCat.id}`, 1));
          if (currentClams - (30 * desiredEntries) < GM_getValue('minClamsReserve', 100)) { alert$(`Reserve reached!`, 'yellow'); return false; }
          const entryInput = row.querySelector('input[type="number"]');
          if (entryInput) {
            const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeValueSetter.call(entryInput, desiredEntries);
            entryInput.dispatchEvent(new Event('input', { bubbles: true }));
            entryInput.dispatchEvent(new Event('change', { bubbles: true }));
            await sleep(800);
          }
          alert$(`Entering: ${matchedCat.label} (${desiredEntries}x)`, 'green');
          await doClickSequence(btn);
          return true;
        }
      } else {
        alert$(`Entering Clams`, 'green');
        await doClickSequence(btn);
        return true;
      }
    }
    return false;
  }

  async function doClickSequence(btn) {
    humanClick(btn); await sleep(2000);
    const confirm = Array.from(document.querySelectorAll('button')).find(b => {
      const t = b.innerText.toLowerCase();
      return (t.includes('confirm') || t === 'yes' || t === 'ok') && b.offsetParent !== null;
    });
    if (confirm) humanClick(confirm);
    await sleep(2500); window.location.reload();
  }

  async function processTasks() {
    const awesomeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Awesome!' && b.offsetParent !== null);
    if (awesomeBtn) {
        alert$(`Success!`, 'green');
        humanClick(awesomeBtn);
        await sleep(3000);
        return true;
    }

    const claim = Array.from(document.querySelectorAll('button')).find(b => (b.innerText.toLowerCase().includes('claim') || b.innerText.toLowerCase() === 'claim reward') && b.offsetParent !== null);
    if (claim) {
        alert$(`Claiming Reward...`, 'green');
        humanClick(claim);
        await sleep(4000);
        window.location.reload();
        return true;
    }

    const iframe = document.querySelector('iframe[src*="youtube.com"]');
    const timerSpan = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes(' / ') && s.parentElement.innerText.includes('Watched:'));

    if (iframe || timerSpan) {
        if (iframe) {
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }

        if (timerSpan) {
            const currentVal = timerSpan.innerText.split(' / ')[0].trim();
            const lastVal = sessionStorage.getItem('igaLastTVal');
            const lastTs = parseInt(sessionStorage.getItem('igaLastTStamp') || '0');
            const now = Date.now();

            if (lastVal === currentVal) {
                if (lastTs === 0) sessionStorage.setItem('igaLastTStamp', now.toString());
                if (now - lastTs > 60000) {
                    const currentLabel = sessionStorage.getItem('igaCurrentVideoLabel');
                    alert$(`Skipping Stuck Video`, 'yellow');
                    if (currentLabel) {
                        let list = JSON.parse(sessionStorage.getItem('igaSkipList') || '[]');
                        if (!list.includes(currentLabel)) list.push(currentLabel);
                        sessionStorage.setItem('igaSkipList', JSON.stringify(list));
                    }
                    const closeBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText === '✕' || b.getAttribute('title') === 'Close') && b.offsetParent !== null);
                    if (closeBtn) humanClick(closeBtn);
                    sessionStorage.removeItem('igaLastTStamp');
                    sessionStorage.removeItem('igaLastTVal');
                    return true;
                }
            } else {
                sessionStorage.setItem('igaLastTVal', currentVal);
                sessionStorage.setItem('igaLastTStamp', now.toString());
            }
        }
        return true;
    }

    const openPlayer = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Open Player' && b.offsetParent !== null);
    if (openPlayer) {
        alert$(`Opening Video...`, 'green');
        humanClick(openPlayer);
        await sleep(3000);
        return true;
    }

    const skipList = JSON.parse(sessionStorage.getItem('igaSkipList') || '[]');
    const articles = Array.from(document.querySelectorAll('article'));
    const nextTask = articles.find(art => {
        const label = art.getAttribute('aria-label');
        const btn = art.querySelector('button');
        const txt = btn ? btn.innerText.toLowerCase() : "";
        return label && !skipList.includes(label) && btn && (txt.includes('watch & earn') || txt.includes('start task')) && !btn.disabled;
    });

    if (nextTask) {
        const label = nextTask.getAttribute('aria-label');
        const btn = nextTask.querySelector('button');
        alert$(`Activating Task...`, 'green');
        sessionStorage.setItem('igaCurrentVideoLabel', label);
        sessionStorage.setItem('igaLastTStamp', '0');
        humanClick(btn);
        await sleep(3000);
        return true;
    }

    return false;
  }

  async function doWheel() {
    if (!GM_getValue('autoWheel', true)) return false;
    const modal = document.querySelector('div.bg-zinc-950\\/70.shadow-2xl');
    if (modal && modal.offsetParent !== null) {
        const wonText = modal.innerText.includes('You won');
        const doneBtn = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.trim() === 'Done');
        if (wonText && doneBtn) {
            alert$(`Wheel Finish`, 'green');
            humanClick(doneBtn);
            await sleep(2000);
            return true;
        }
        const spinBtn = Array.from(modal.querySelectorAll('button')).find(b =>
            b.innerText.trim().toUpperCase() === 'SPIN' && !b.disabled && b.className.includes('bg-emerald')
        );
        if (spinBtn) {
            alert$(`Spinning...`, 'green');
            humanClick(spinBtn);
            await sleep(12000);
            return true;
        }
        return true;
    }
    const triggerBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.innerText.includes('Spin') && b.offsetParent !== null && (b.innerText.includes('🎡') || b.className.includes('sky'))
    );
    if (triggerBtn && !triggerBtn.disabled) {
        const group = triggerBtn.closest('.group');
        const tooltip = group ? group.querySelector('span.pointer-events-none') : null;
        const match = tooltip ? tooltip.innerText.match(/(\d+)\/\d+/) : null;
        if (tooltip && tooltip.innerText.includes('cooldown')) return false;
        if (match && parseInt(match[1]) > 0) {
            alert$(`Opening Wheel...`, 'green');
            humanClick(triggerBtn);
            await sleep(3500);
            return true;
        }
    }
    return false;
  }

  async function runAutomation() {
    const lastCycle = parseInt(GM_getValue('igaLastCycle', '0'));
    const cycleMs = (GM_getValue('cycleMin', 15) * 60 * 1000);
    const now = Date.now();
    if (now - lastCycle < cycleMs && !sessionStorage.getItem('igaActive')) {
      const diff = (lastCycle + cycleMs) - now;
      document.getElementById('cycle-timer').textContent = `${Math.floor(diff / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`;
      return;
    }
    sessionStorage.setItem('igaActive', 'true');
    document.getElementById('cycle-timer').textContent = "EXECUTING";
    const phase = sessionStorage.getItem('igaPhase') || 'tasks';

    if (GM_getValue('autoChat', true) && document.body.innerText.includes('Send 1 message for +250')) {
      const lastChat = parseInt(GM_getValue('igaLastChatSentAt', '0'));
      if (now - lastChat >= 3600000) {
        const input = document.querySelector('input[placeholder="Type a message…"]');
        const send = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Send');
        if (input && send) {
          humanClick(input); await sleep(1000);
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
          setter ? setter.call(input, '👍') : input.value = '👍';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          await sleep(1000); humanClick(send); GM_setValue('igaLastChatSentAt', Date.now().toString()); await sleep(3000);
        }
      }
    }

    if (phase === 'tasks') {
      document.getElementById('next-step-txt').textContent = "Processing Tasks...";
      if (!window.location.pathname.includes('/tasks')) { window.location.href = 'https://www.itzagud.net/tasks'; return; }
      const busy = await processTasks();
      if (!busy) { sessionStorage.setItem('igaPhase', 'points'); }
    }
    else if (phase === 'points') {
      document.getElementById('next-step-txt').textContent = "Processing Points...";
      if (!window.location.search.includes('tab=points')) { window.location.href = 'https://www.itzagud.net/steam-key-giveaways?tab=points'; return; }
      const wheelWorking = await doWheel();
      if (wheelWorking) return;
      const entered = await processGiveaways(true);
      if (!entered) { sessionStorage.setItem('igaPhase', 'clams'); window.location.href = 'https://www.itzagud.net/steam-key-giveaways?tab=clams'; }
    }
    else if (phase === 'clams') {
      document.getElementById('next-step-txt').textContent = "Processing Clams...";
      if (!window.location.search.includes('tab=clams')) { window.location.href = 'https://www.itzagud.net/steam-key-giveaways?tab=clams'; return; }
      const wheelWorking = await doWheel();
      if (wheelWorking) return;
      const entered = await processGiveaways(false);
      if (!entered) {
        GM_setValue('igaLastCycle', Date.now().toString());
        sessionStorage.removeItem('igaActive');
        sessionStorage.removeItem('igaSkipList');
        sessionStorage.setItem('igaPhase', 'tasks');
        alert$('Cycle Finished!', 'green'); window.location.reload();
      }
    }
  }

  function alert$(text, color) {
    const el = document.createElement('div'); el.className = 'iga-alert';
    el.style.borderLeftColor = color === 'green' ? '#10b981' : '#fde047';
    el.textContent = text; document.getElementById('iga-alerts').appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }

  setInterval(runAutomation, 5000);
})();
