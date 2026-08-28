(() => {
    const _r = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
    const _w = (ms) => new Promise(res => setTimeout(res, ms));
    const _cl = async (_el) => {
        if (!_el) return;
        const _evs = ['mouseenter', 'mousedown', 'mouseup', 'click'];
        for (const _ev of _evs) {
            _el.dispatchEvent(new MouseEvent(_ev, {
                view: window,
                bubbles: true,
                cancelable: true,
                buttons: 1
            }));
            await _w(_r(20, 60));
        }
    };
    const _act = async () => {
        const _e = document.querySelectorAll('#quick-emotes-holder button');
        const _s = document.querySelector('#send-message-button');
        if (_e.length > 0 && _s && !_s.disabled) {
            const _target = _e[_r(0, _e.length - 1)];
            await _cl(_target);
            await _w(_r(1200, 3500));
            if (_s && !_s.disabled) {
                await _cl(_s);
            }
        }
        // Manda entre 10 e 15 minutos
        const _next = _r(10 * 60 * 1000, 15 * 60 * 1000);
        const _next_min = (_next / 1000 / 60).toFixed(2);
        setTimeout(_act, _next);
        console.log(`Next: ${_next_min} min.`);
        setTimeout(_act, _next);
    };
    _act();
})();
