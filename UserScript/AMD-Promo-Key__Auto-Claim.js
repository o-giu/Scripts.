// ==UserScript==
// @name        AMD Promo-Key Auto-Claim
// @match       https://www.amdgaming.com/promotions
// @match       https://www.amdgaming.com/promotions/
// @match       https://www.amdgaming.com/promotions/*
// @description Automates the collection of giveaway keys from the site
// @author      oGiu
// @grant       none
// @version     1.1
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
    return href ? href.replace(/\/$/, '').split('/').pop() : null;
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
    if (btn.classList.contains('promotion-claim-key-btn--disabled')) return false;
    return true;
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
      `AMD PROMO KEY AUTO-CLAIM v1.1<br>` +
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
    if (el) {
      el.innerText = countdown;
    }
  }

  function runListPage() {
    buildHUD({ status: 'WAITING FOR EMBER', color: '#ff9900', extra: 'PAGE: listing<br>' });

    hudKeepAliveInterval = setInterval(() => {
      if (!document.getElementById(HUD_ID)) {
        buildHUD({ status: 'MONITORING FEATURED', color: '#ff9900', extra: 'PAGE: listing<br>' });
      }
    }, 2000);

    const observer = new MutationObserver(() => {
      if (!document.querySelectorAll(CLAIM_SELECTOR).length) return;
      observer.disconnect();
      buildHUD({ status: 'MONITORING FEATURED', color: '#ff9900', extra: 'PAGE: listing<br>' });
      startListLoop();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => { observer.disconnect(); startListLoop(); }, 10_000);
  }

  function startListLoop() {
    countdownInterval = setInterval(() => {
      const claimLinks = Array.from(document.querySelectorAll(CLAIM_SELECTOR)).sort((a, b) => {
        const aFeatured = a.closest('.promotion-main-featured-container') ? 0 : 1;
        const bFeatured = b.closest('.promotion-main-featured-container') ? 0 : 1;
        return aFeatured - bFeatured;
      });

      const claimed = getClaimed();

      for (const link of claimLinks) {
        const href  = link.getAttribute('href');
        const slug  = slugFromHref(href);

        if (slug && isClaimed(slug, claimed)) continue;

        const container  = link.closest('.promotion-claim-container') || link.closest('[class*="promotion"]');
        const keyCountEl = container?.querySelector(KEY_COUNT_SEL);
        const keyCount   = keyCountEl ? parseInt(keyCountEl.innerText, 10) : NaN;

        if (!isNaN(keyCount) && keyCount <= 0) continue;

        stopAllTimers();
        buildHUD({
          status: 'KEY AVAILABLE!',
          color:  '#00ff00',
          extra:  `PROMO: ${slug ?? '?'}<br>KEYS: ${isNaN(keyCount) ? '?' : keyCount}<br>`,
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
        location.reload();
      }
    }, 1000);
  }

  function runPromoPage() {
    const slug = slugFromHref(window.location.pathname);
    let phase = 'waiting-button';
    countdown = 15;

    buildHUD({ status: 'WAITING FOR EMBER', color: '#ffff00', extra: `PAGE: promotion<br>PROMO: ${slug}<br>` });

    hudKeepAliveInterval = setInterval(() => {
      if (!document.getElementById(HUD_ID)) {
        const label = phase === 'waiting-confirm' ? 'WAITING FOR CONFIRMATION' : 'WAITING FOR EMBER';
        buildHUD({ status: label, color: '#ffff00', extra: `PAGE: promotion<br>PROMO: ${slug}<br>` });
      }
    }, 2000);

    let waitInterval    = null;
    let confirmInterval = null;
    let buttonObserver  = null;
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

      buildHUD({ status: 'CLICKING...', color: '#00ffff', extra: `PROMO: ${slug}<br>` });
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
        buildHUD({ status: 'KEY CLAIMED!', color: '#00ff00', extra: `PROMO: ${slug}<br>` });

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
    runListPage();
  } else {
    runPromoPage();
  }

})();
