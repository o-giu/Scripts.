// ==UserScript==
// @name         ItzAGud - Automation
// @version      2.5
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
  Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
  Object.defineProperty(document, 'hidden', { value: false, writable: true });

  document.addEventListener('visibilitychange', (e) => { e.stopImmediatePropagation(); }, true);
  window.addEventListener('blur', (e) => { e.stopImmediatePropagation(); }, true);
  window.addEventListener('focus', (e) => { e.stopImmediatePropagation(); }, true);

  GM_addStyle(`
    #iga-toggle{position:fixed;top:16px;right:16px;z-index:1000000;width:42px;height:42px;border-radius:11px;background:#10b981;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 15px rgba(0,0,0,0.3);transition:all 0.2s}
    #iga-toggle:hover{transform:scale(1.05)}
    #iga-toggle.active{background:#059669}
    #iga-container{position:fixed;top:66px;right:16px;z-index:999999;width:320px;font-family:sans-serif;background:#18181b;border:1px solid #27272a;border-radius:12px;overflow:hidden;color:white;box-shadow:0 10px 25px rgba(0,0,0,0.5)}
    .iga-hidden{display:none !important}
    .iga-header{padding:15px;background:#202023;border-bottom:1px solid #27272a;display:flex;justify-content:space-between;align-items:center}
    .iga-body{padding:15px;display:flex;flex-direction:column;gap:10px}
    .iga-settings-panel{padding:15px;background:#1e1e21;display:none;border-bottom:1px solid #27272a}
    .iga-settings-panel.open{display:block}
    .iga-rank-grid{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;margin-bottom:8px;font-size:12px}
    .iga-set-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:13px}
    .iga-set-title{font-weight:bold;color:#10b981;margin:10px 0 5px 0;font-size:11px;text-transform:uppercase}
    .iga-input{background:#27272a;border:1px solid #3f3f46;color:white;border-radius:4px;padding:4px;width:50px;text-align:center}
    .iga-btn{width:100%;padding:10px;background:#10b981;border:none;color:white;border-radius:6px;font-weight:600;cursor:pointer;margin-top:10px;transition:background 0.2s}
    .iga-btn:hover{background:#059669}
    .iga-card{border-radius:8px;padding:10px;background:#202023;border:1px solid #27272a}
    .iga-alert{padding:8px;border-radius:6px;font-size:10px;border-left:4px solid #10b981;background:#202023;margin-bottom:5px}
    @media (max-width: 400px) {
      #iga-container { width: 95% !important; right: 2.5% !important; }
    }
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

  const EMOJIS = ['😂', '💀', '🔥', '❤️', '💯', '👏', '🙏', '😎', '👀', '✅', '🎉', '🤔', '😭', '🤣'];

  function sleep(ms) { return new Promise(r => setTimeout(r, ms + Math.random() * 500)); }

  function deepQuery(root, selector) {
    if (!root) return null;
    let found = root.querySelector(selector);
    if (found) return found;
    const all = root.querySelectorAll('*');
    for (const el of all) {
      if (el.shadowRoot) {
        found = deepQuery(el.shadowRoot, selector);
        if (found) return found;
      }
    }
    return null;
  }

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
  container.id = 'iga-container';
  container.className = 'iga-hidden';
  document.body.appendChild(container);

  let rankHtml = CATEGORIES.map(cat => `
    <div class="iga-rank-grid">
      <span>${cat.label}</span>
      <input type="checkbox" id="iga-set-${cat.id}">
      <input type="number" id="iga-ent-${cat.id}" class="iga-input" placeholder="Ent">
    </div>
  `).join('');

  container.innerHTML = `
    <div class="iga-header">
      <span style="font-weight:800; font-size:14px; color:#10b981;">ITZAGUD V2.5</span>
      <button id="iga-cfg-btn" style="background:none; border:none; cursor:pointer; font-size: 16px;">⚙️</button>
    </div>
    <div class="iga-settings-panel" id="iga-cfg">
      <div class="iga-set-title">Geral</div>
      <div class="iga-set-row"><span>Auto Tasks</span><input type="checkbox" id="iga-set-tasks"></div>
      <div class="iga-set-row"><span>Auto Wheel</span><input type="checkbox" id="iga-set-wheel"></div>
      <div class="iga-set-row"><span>Auto Chat</span><input type="checkbox" id="iga-set-chat"></div>
      <div class="iga-set-row"><span>Min Clams</span><input type="number" id="iga-set-minclams" class="iga-input"></div>
      <div class="iga-set-row"><span>Cycle (min)</span><input type="number" id="iga-set-cycle" class="iga-input"></div>

      <div class="iga-set-title">Ranks</div>
      ${rankHtml}
      <button id="iga-save-btn" class="iga-btn">SAVE CONFIG</button>
    </div>
    <div class="iga-body">
      <div id="iga-alerts"></div>
      <div class="iga-card">
        <div style="font-size:9px; color:#a1a1aa;">TIMER</div>
        <div id="cycle-timer" style="font-size:16px; font-weight:bold; color:#10b981;">...</div>
      </div>
      <div class="iga-card">
        <div style="font-size:9px; color:#a1a1aa;">STATUS</div>
        <div id="next-step-txt" style="font-size:12px; color:#e4e4e7; margin-top:2px;">Aguardando...</div>
      </div>
      <button id="iga-force-btn" class="iga-btn" style="background:#ef4444;">RESET & FORCE SCAN</button>
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
  toggle.onclick = () => {
    const isHidden = container.classList.toggle('iga-hidden');
    toggle.classList.toggle('active', !isHidden);
  };

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

  document.getElementById('iga-force-btn').onclick = () => { GM_setValue('igaLastCycle', '0'); GM_setValue('igaLastChatAttempt', '0'); sessionStorage.clear(); window.location.reload(); };

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
    const iframe = document.querySelector('iframe[src*="youtube.com"]');
    const timerSpan = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes(' / ') && s.parentElement.innerText.includes('Watched:'));

    const claimBtn = Array.from(document.querySelectorAll('button')).find(b => {
        const txt = b.innerText.toLowerCase().replace(/\s+/g, ' ').trim();
        return (txt === 'claim reward') && b.className.includes('bg-emerald-600') && b.offsetParent !== null;
    });

    if (claimBtn) {
        humanClick(claimBtn);
        await sleep(3000);
        window.location.reload();
        return true;
    }

    if (iframe) {
      try {
        iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
        iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        const playBtn = iframe.contentDocument?.querySelector('.ytp-large-play-button');
        if (playBtn) humanClick(playBtn);
      } catch (e) {}

      if (timerSpan) {
        document.getElementById('next-step-txt').textContent = "Watching video...";
        const currentVal = timerSpan.innerText.split(' / ')[0].trim();
        const lastVal = sessionStorage.getItem('igaLastTVal');
        const lastTs = parseInt(sessionStorage.getItem('igaLastTStamp') || '0');
        const now = Date.now();

        if (lastVal === currentVal) {
          if (lastTs === 0) sessionStorage.setItem('igaLastTStamp', now.toString());
          if (now - lastTs > 65000) {
            const closeBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText === '✕' || b.getAttribute('title') === 'Close') && b.offsetParent !== null);
            if (closeBtn) humanClick(closeBtn);
            sessionStorage.removeItem('igaLastTStamp');
            sessionStorage.removeItem('igaLastTVal');
          }
        } else {
          sessionStorage.setItem('igaLastTVal', currentVal);
          sessionStorage.setItem('igaLastTStamp', now.toString());
        }
        return true;
      }
      return true;
    }

    const awesomeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Awesome!' && b.offsetParent !== null);
    if (awesomeBtn) {
      humanClick(awesomeBtn);
      await sleep(3000);
      return true;
    }

    const claim = Array.from(document.querySelectorAll('button')).find(b => (b.innerText.toLowerCase().includes('claim') || b.innerText.toLowerCase() === 'claim reward') && b.offsetParent !== null);
    if (claim) {
      humanClick(claim);
      await sleep(4000);
      window.location.reload();
      return true;
    }

    const openPlayer = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Open Player' && b.offsetParent !== null);
    if (openPlayer) {
      humanClick(openPlayer);
      await sleep(5000);
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
      skipList.push(label);
      sessionStorage.setItem('igaSkipList', JSON.stringify(skipList));
      humanClick(btn);
      await sleep(5000);
      return true;
    }

    return false;
  }

  function getChatInput() {
    const selectors = [
      'input[placeholder="Type a message…"]',
      'input[placeholder*="message" i]',
      'input[placeholder*="chat" i]',
      'textarea[placeholder*="message" i]',
      'textarea[placeholder*="chat" i]',
      'textarea',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function getChatSendButton() {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.trim().toLowerCase() === 'send' && !b.disabled);
  }

  function isChatBonusReady() {
    const rDivs = document.querySelectorAll('div.rounded-full');
    for (let i = 0; i < rDivs.length; i++) {
      const txt = rDivs[i].textContent.toLowerCase();
      if (txt.includes('send 1 message')) return true;
    }
    return false;
  }

  async function autoChat() {
    if (!isChatBonusReady()) return false;

    const chatInput = getChatInput();
    const sendBtn = getChatSendButton();

    if (!chatInput || !sendBtn) return false;
    if (sendBtn.disabled) return false;

    const message = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    const proto = chatInput.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value").set;
    nativeSetter.call(chatInput, message);

    chatInput.dispatchEvent(new Event('input', { bubbles: true }));
    chatInput.dispatchEvent(new Event('change', { bubbles: true }));

    await sleep(1500);

    if (!sendBtn.disabled) {
        humanClick(sendBtn);
        GM_setValue('igaLastChatAttempt', Date.now().toString());
        await sleep(2000);
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
            humanClick(doneBtn);
            await sleep(2000);
            return true;
        }
        const spinBtn = Array.from(modal.querySelectorAll('button')).find(b =>
            b.innerText.trim().toUpperCase() === 'SPIN' && !b.disabled && b.className.includes('bg-emerald')
        );
        if (spinBtn) {
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
        if (tooltip && tooltip.innerText.includes('cooldown')) return false;
        humanClick(triggerBtn);
        await sleep(3500);
        return true;
    }
    return false;
  }

  let igaRunning = false;

  async function runAutomation() {
    if (igaRunning) return;
    igaRunning = true;
    try {
      if (GM_getValue('autoChat', true)) {
          const currentCycle = GM_getValue('igaLastCycle', '0');
          const lastChatCycle = localStorage.getItem('igaChatCycle') || 'none';

          if (lastChatCycle !== currentCycle) {
              const sent = await autoChat();
              if (sent) {
                  localStorage.setItem('igaChatCycle', currentCycle);
                  await sleep(2000);
              }
          }
      }

      const isTaskPage = window.location.pathname.includes('/tasks');

      if (isTaskPage) {
        const busy = await processTasks();
        if (busy) {
          document.getElementById('next-step-txt').textContent = "Task in progress...";
          return;
        }
      }

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

      if (phase === 'tasks') {
        if (!isTaskPage) { window.location.href = 'https://www.itzagud.net/tasks'; return; }
        const busy = await processTasks();
        if (!busy) { sessionStorage.setItem('igaPhase', 'points'); window.location.reload(); }
      } else if (phase === 'points') {
        if (!window.location.search.includes('tab=points')) { window.location.href = 'https://www.itzagud.net/steam-key-giveaways?tab=points'; return; }
        const wheelWorking = await doWheel();
        if (wheelWorking) return;
        const entered = await processGiveaways(true);
        if (!entered) { sessionStorage.setItem('igaPhase', 'clams'); window.location.href = 'https://www.itzagud.net/steam-key-giveaways?tab=clams'; }
      } else if (phase === 'clams') {
        if (!window.location.search.includes('tab=clams')) { window.location.href = 'https://www.itzagud.net/steam-key-giveaways?tab=clams'; return; }
        const wheelWorking = await doWheel();
        if (wheelWorking) return;
        const entered = await processGiveaways(false);
        if (!entered) {
          GM_setValue('igaLastCycle', Date.now().toString());
          sessionStorage.removeItem('igaActive');
          sessionStorage.removeItem('igaSkipList');
          sessionStorage.setItem('igaPhase', 'tasks');
          window.location.reload();
        }
      }
    } finally {
      igaRunning = false;
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
