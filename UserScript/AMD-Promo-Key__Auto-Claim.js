// ==UserScript==
// @name        AMD Key Auto-Claim
// @match       https://www.amdgaming.com/
// @match       https://www.amdgaming.com/promotions
// @match       https://www.amdgaming.com/promotions/
// @match       https://www.amdgaming.com/promotions/*
// @author      oGiu
// @grant       none
// @version     1.2
// ==/UserScript==

(function () {
  'use strict';

  const CLAIM_SELECTOR   = '.promotion-claim-key-btn';
  const KEY_COUNT_SEL    = '.promotion-key-count';
  const STORAGE_KEY      = 'amd_claimed_promos';
  const REFRESH_INTERVAL = 10;

  let countdownInterval = null;
  let hudKeepAliveInterval = null;
  let countdown = REFRESH_INTERVAL;

  function getClaimed() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  function addClaimed(slug) {
    const list = getClaimed();
    if (!list.includes(slug)) {
      list.push(slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  }

  function isClaimed(slug, claimedList) {
    return claimedList.includes(slug);
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  function slugFromHref(href) {
    if (!href) return null;
    const parts = href.replace(/\/$/, '').split('/');
    return parts.pop();
  }

  function dispatchClicks(el) {
    ['mousedown', 'mouseup', 'click'].forEach(type =>
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }))
    );
    if (el.click) el.click();
  }

  function stopAllTimers() {
    clearInterval(countdownInterval);
    clearInterval(hudKeepAliveInterval);
    countdownInterval = null;
    hudKeepAliveInterval = null;
  }

  function isClaimReady(btn) {
    if (!btn) return false;
    return !btn.classList.contains('promotion-claim-key-btn--disabled');
  }

  function isClaimConfirmed() {
    const popup = document.querySelector('.promotion-page-popup-container');
    if (!popup || popup.classList.contains('closed')) return false;
    const codeEl = popup.querySelector('.claimed-key-code');
    return !!(codeEl && codeEl.textContent.trim().length > 0);
  }

  const HUD_ID = 'amd-hud';
  const COUNTDOWN_ID = 'amd-cnt';

  function buildHUD({ status, color, extra = '' }) {
    const existing = document.getElementById(HUD_ID);
    if (existing) existing.remove();

    const claimed = getClaimed();
    const hud = document.createElement('div');
    hud.id = HUD_ID;

    Object.assign(hud.style, {
      position:        'fixed',
      bottom:          '12px',
      right:           '12px',
      zIndex:          '2147483647',
      background:      'rgba(0,0,0,0.95)',
      color:           '#fff',
      padding:         '12px 16px',
      border:          `1px solid ${color}`,
      fontFamily:      'monospace',
      fontSize:        '12px',
      borderRadius:    '8px',
      lineHeight:      '1.7',
      minWidth:        '220px',
      pointerEvents:   'auto',
    });

    hud.innerHTML =
      `AMD PROMO KEY AUTO-CLAIM v1.3<br>` +
      `STATUS: <span style="color:${color}">${status}</span><br>` +
      extra +
      `ALREADY TRIED: ${claimed.length}<br>` +
      `NEXT IN: <span id="${COUNTDOWN_ID}">${countdown}</span>s<br>` +
      `<span id="amd-clear" style="color:#888;font-size:10px;cursor:pointer">[ clear history ]</span>`;

    document.body.appendChild(hud);
    document.getElementById('amd-clear').addEventListener('click', clearHistory);
  }

  function tickCountdown() {
    const el = document.getElementById(COUNTDOWN_ID);
    if (el) el.innerText = countdown;
  }

  function runListPage(isHome = false) {
    const pageName = isHome ? 'HOME' : 'LISTING';
    buildHUD({ status: 'MONITORING', color: '#ff9900', extra: `PAGE: ${pageName}<br>` });

    hudKeepAliveInterval = setInterval(() => {
      if (!document.getElementById(HUD_ID)) {
        buildHUD({ status: 'MONITORING', color: '#ff9900', extra: `PAGE: ${pageName}<br>` });
      }
    }, 2000);

    countdownInterval = setInterval(() => {
      let links = [];
      if (isHome) {
        links = Array.from(document.querySelectorAll('.banner-rotator a[href*="/promotions/"]'));
      } else {
        links = Array.from(document.querySelectorAll(CLAIM_SELECTOR));
      }

      const claimed = getClaimed();

      for (const link of links) {
        const href = link.getAttribute('href');
        const slug = slugFromHref(href);

        if (slug && isClaimed(slug, claimed)) continue;

        if (!isHome) {
          const container = link.closest('.promotion-claim-container') || link.closest('[class*="promotion"]');
          const keyCountEl = container?.querySelector(KEY_COUNT_SEL);
          const keyCount = keyCountEl ? parseInt(keyCountEl.innerText, 10) : NaN;
          if (!isNaN(keyCount) && keyCount <= 0) continue;
        }

        stopAllTimers();
        buildHUD({
          status: 'PROMO FOUND!',
          color:  '#00ff00',
          extra:  `TARGET: ${slug ?? '?'}<br>`,
        });

        setTimeout(() => {
          if (href) window.location.href = href;
          else dispatchClicks(link);
        }, 800);
        return;
      }

      countdown--;
      tickCountdown();

      if (countdown <= 0) {
        stopAllTimers();
        if (isHome) {
          window.location.href = 'https://www.amdgaming.com/promotions';
        } else {
          window.location.href = 'https://www.amdgaming.com/';
        }
      }
    }, 1000);
  }

  function runPromoPage() {
    const slug = slugFromHref(window.location.pathname);
    let phase = 'waiting-button';
    countdown = 15;

    buildHUD({ status: 'WAITING FOR EMBER', color: '#ffff00', extra: `PAGE: PROMO<br>SLUG: ${slug}<br>` });

    hudKeepAliveInterval = setInterval(() => {
      if (!document.getElementById(HUD_ID)) {
        const label = phase === 'waiting-confirm' ? 'WAITING FOR CONFIRMATION' : 'WAITING FOR EMBER';
        buildHUD({ status: label, color: '#ffff00', extra: `PAGE: PROMO<br>SLUG: ${slug}<br>` });
      }
    }, 2000);

    let waitInterval = null;
    let confirmInterval = null;
    let buttonObserver = null;
    let confirmObserver = null;

    function goToListPage() {
      clearInterval(waitInterval);
      clearInterval(confirmInterval);
      clearInterval(hudKeepAliveInterval);
      if (buttonObserver)  buttonObserver.disconnect();
      if (confirmObserver) confirmObserver.disconnect();
      window.location.href = 'https://www.amdgaming.com/promotions';
    }

    buttonObserver = new MutationObserver(() => {
      const btn = document.querySelector(CLAIM_SELECTOR);
      if (!isClaimReady(btn)) return;

      buttonObserver.disconnect();
      clearInterval(waitInterval);
      phase = 'waiting-confirm';

      buildHUD({ status: 'CLICKING...', color: '#00ffff', extra: `SLUG: ${slug}<br>` });
      dispatchClicks(btn);

      countdown = 10;
      startConfirmPhase();
    });
    buttonObserver.observe(document.body, { childList: true, subtree: true });

    waitInterval = setInterval(() => {
      countdown--;
      tickCountdown();
      if (countdown <= 0) {
        buttonObserver.disconnect();
        goToListPage();
      }
    }, 1000);

    function startConfirmPhase() {
      confirmObserver = new MutationObserver(() => {
        if (!isClaimConfirmed()) return;
        confirmObserver.disconnect();
        clearInterval(confirmInterval);

        addClaimed(slug);
        buildHUD({ status: 'KEY CLAIMED!', color: '#00ff00', extra: `SLUG: ${slug}<br>` });

        countdown = 5;
        confirmInterval = setInterval(() => {
          countdown--;
          tickCountdown();
          if (countdown <= 0) goToListPage();
        }, 1000);
      });
      confirmObserver.observe(document.body, { childList: true, subtree: true });

      confirmInterval = setInterval(() => {
        countdown--;
        tickCountdown();
        if (countdown <= 0) {
          confirmObserver.disconnect();
          goToListPage();
        }
      }, 1000);
    }
  }

  const path = window.location.pathname.replace(/\/$/, '');

  if (path === '/promotions') {
    runListPage(false);
  } else if (path === '' || path === '/') {
    runListPage(true);
  } else if (path.startsWith('/promotions/')) {
    runPromoPage();
  }

})();
