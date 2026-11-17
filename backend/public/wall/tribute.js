// A finite server-clock presentation. No game state or private letter access.
export function createTribute({ preview, reduced }) {
    const panel = document.querySelector('#tribute');
    const heading = document.querySelector('.wall-heading');
    const button = document.querySelector('#tribute-audio');
    const audio = new Audio('/wall-assets/thank-you.m4a?v=1794936859859');
    audio.loop = true;
    audio.preload = 'none';
    const dedicationHeader = document.createElement('header');
    dedicationHeader.className = 'tribute-dedication-header';
    const gratitudeTitle = document.createElement('h2');
    gratitudeTitle.textContent = 'Cảm ơn';
    const gratitudeSubtitle = document.createElement('p');
    gratitudeSubtitle.textContent = 'Vì đã cùng viết nên câu chuyện này.';
    dedicationHeader.append(gratitudeTitle, gratitudeSubtitle);
    panel.prepend(dedicationHeader);
    const viewport = document.createElement('div');
    viewport.className = 'tribute-roll-window';
    const track = document.createElement('div');
    track.className = 'tribute-roll';
    viewport.append(track);
    panel.querySelector('.tribute-name').after(viewport);
    let scrollAnimation = null, layoutDirty = true, layoutKey = '';
    const observer = new ResizeObserver(() => { layoutDirty = true; });
    observer.observe(viewport);
    observer.observe(track);
    reduced.addEventListener('change', () => { layoutDirty = true; });
    function stopScroll() { scrollAnimation?.cancel(); scrollAnimation = null; }
    let enabled = false, allowed = false, pending = false, key = '', run = '', targetVolume = 0;
    function silence() {
        allowed = false;
        audio.pause();
    }
    function reset() {
        silence();
        stopScroll();
        layoutDirty = true;
        panel.hidden = true;
        heading.hidden = false;
        key = '';
    }
    function play() {
        if (!enabled || !allowed || preview || pending || !audio.paused) return;
        pending = true;
        const requestedRun = run;
        audio.volume = targetVolume;
        audio.play().then(() => {
            if (run !== requestedRun) return;
            if (!allowed || !enabled || document.hidden) audio.pause();
            button.setAttribute('aria-pressed', String(enabled && !audio.paused));
            button.textContent = enabled ? 'Tắt âm thanh · M' : 'Bật âm thanh · M';
        }).catch(() => {
            if (run !== requestedRun) return;
            enabled = false;
            button.setAttribute('aria-pressed', 'false');
            button.textContent = 'Bấm để cho phép phát nhạc · M';
        }).finally(() => { pending = false; });
    }
    function toggle() {
        if (preview) return;
        enabled = !enabled;
        button.setAttribute('aria-pressed', String(enabled));
        button.textContent = enabled ? 'Tắt âm thanh · M' : 'Bật âm thanh · M';
        if (!enabled) { audio.pause(); return; }
        // Unlock this media element on the projector's own gesture, silently.
        if (!allowed) {
            audio.volume = 0;
            audio.play().then(() => { if (!allowed || !enabled || document.hidden) audio.pause(); }).catch(() => {
                enabled = false;
                button.setAttribute('aria-pressed', 'false');
                button.textContent = 'Chưa phát được nhạc · bấm thử lại';
            });
        } else play();
    }
    button.hidden = preview;
    button.addEventListener('click', toggle);
    document.addEventListener('keydown', event => {
        if (!event.repeat && event.key.toLowerCase() === 'm') toggle();
    });
    window.addEventListener('pagehide', silence);
    return {
        reset,
        paint(tribute, now) {
            if (!tribute) { reset(); return false; }
            panel.hidden = false;
            heading.hidden = true;
            const elapsed = Math.max(0, (now - tribute.started_at_ms) / 1000);
            const duration = tribute.rows.length * tribute.seconds;
            const index = Math.floor(elapsed / tribute.seconds);
            const finished = elapsed >= duration;
            dedicationHeader.hidden = finished;
            const page = Math.floor(index / 4);
            const nextKey = `${tribute.id}:${reduced.matches ? page : 'roll'}:${finished}`;
            if (run !== tribute.id) {
                audio.pause();
                audio.currentTime = 0;
                run = tribute.id;
                // A new authorized tribute starts sound; polling the same run
                // never overrides a manual mute. Admin preview stays silent.
                enabled = !preview;
                button.setAttribute('aria-pressed', 'false');
                button.textContent = 'Đang mở nhạc… · M';
            }
            allowed = !document.hidden;
            targetVolume = 0.75 * Math.max(0, Math.min(1, elapsed / 1.5));
            audio.volume = targetVolume;
            if (allowed) play(); else silence();
            if (key !== nextKey) {
                stopScroll();
                track.replaceChildren();
                const rows = reduced.matches ? tribute.rows.slice(page * 4, page * 4 + 4) : tribute.rows;
                let lastGroup = '';
                if (!finished) for (const row of rows) {
                    if (row.group !== lastGroup) {
                        const label = document.createElement('p');
                        label.className = 'tribute-roll-group';
                        label.textContent = row.group;
                        track.append(label);
                        lastGroup = row.group;
                    }
                    const name = document.createElement('p');
                    name.className = 'tribute-roll-name';
                    name.dataset.id = row.id;
                    name.textContent = row.name;
                    track.append(name);
                }
                viewport.hidden = finished;
                viewport.classList.toggle('is-static', reduced.matches);
                panel.querySelector('.tribute-group').textContent = finished ? 'THE UNWRITTEN LESSON' : 'VÌ CÓ THẦY CÔ. VÌ CÓ BẠN.';
                const title = panel.querySelector('.tribute-name');
                title.hidden = !finished;
                title.textContent = finished ? 'Cảm ơn vì đã ở đây.' : '';
                panel.querySelector('.tribute-copy').textContent = finished ? 'Câu chuyện này có bạn trong đó.' : '';
                panel.querySelector('.tribute-count').textContent = finished ? 'HẸN GẶP LẠI TRONG NHỮNG ĐIỀU TỐT ĐẸP' : `${tribute.rows.length} LỜI CẢM ƠN · MỘT HÀNH TRÌNH`;
                key = nextKey;
                layoutDirty = true;
            }
            if (!finished && !reduced.matches) {
                const geometry = `${viewport.clientHeight}:${track.scrollHeight}:${duration}`;
                if (layoutDirty || geometry !== layoutKey || !scrollAnimation) {
                    stopScroll();
                    scrollAnimation = track.animate([
                        { transform: `translateY(${viewport.clientHeight}px)` },
                        { transform: `translateY(${-track.scrollHeight}px)` },
                    ], { duration: duration * 1000, easing: 'linear', fill: 'both' });
                    scrollAnimation.currentTime = elapsed * 1000;
                    layoutKey = geometry;
                    layoutDirty = false;
                } else if (Math.abs(scrollAnimation.currentTime - elapsed * 1000) > 200) {
                    scrollAnimation.currentTime = elapsed * 1000;
                }
            }
            if (!finished) {
                // Change the dedication only after the preceding group's last name
                // has left the visible roll, rather than at an estimated row index.
                let group = tribute.rows[0]?.group;
                if (reduced.matches) {
                    group = tribute.rows[page * 4]?.group;
                } else {
                    const top = viewport.getBoundingClientRect().top;
                    const firstVisible = [...track.querySelectorAll('.tribute-roll-name')].find(el => el.getBoundingClientRect().bottom > top);
                    if (firstVisible) group = tribute.rows.find(row => row.id === firstVisible.dataset.id)?.group;
                    else group = tribute.rows.at(-1)?.group;
                }
                const teachers = group === 'Kính gửi thầy cô';
                const players = group === 'Cảm ơn bạn đã chơi';
                gratitudeTitle.textContent = teachers ? 'Tri ân thầy cô' : players ? 'Cảm ơn bạn' : 'Cảm ơn những người đồng hành';
                gratitudeSubtitle.textContent = teachers
                    ? 'Cảm ơn thầy cô đã gieo tri thức, nuôi dưỡng ước mơ và tin vào chúng em.'
                    : players ? 'Vì đã bước vào câu chuyện này và để lại một phần ánh sáng của mình.'
                    : 'Vì đã cùng chúng tôi làm nên những điều đáng nhớ.';
            }
            return true;
        },
    };
}
