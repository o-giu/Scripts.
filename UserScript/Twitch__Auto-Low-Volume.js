// ==UserScript==
// @name         Twitch Auto Low Volume
// @namespace    oGiu
// @version      1.0
// @author       oGiu
// @description  Forces Twitch player volume to 1% on load
// @match        https://www.twitch.tv/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

/*
 * ============================================================
 *  Make sure the Autoplay permissions are not blocked
 * ============================================================
 */

(function () {
    'use strict';
    localStorage.setItem('volume', '0.01');
    let applied = false;
    document.addEventListener('volumechange', e => {
        if (e.target instanceof HTMLVideoElement && !applied) {
            e.target.volume = 0.01;
            applied = true;
        }
    }, true);
})();
