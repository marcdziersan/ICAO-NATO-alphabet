if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((error) => {
            console.warn('Service worker registration failed:', error);
        });
    });
}

const LETTERS_DATA = [
    { letter: 'A', word: 'Alfa', pronunciation: '(AL-FAH)', type: 'vowel' },
    { letter: 'B', word: 'Bravo', pronunciation: '(BRAH-VOH)', type: 'consonant' },
    { letter: 'C', word: 'Charlie', pronunciation: '(CHAR-LEE)', type: 'consonant' },
    { letter: 'D', word: 'Delta', pronunciation: '(DELL-TAH)', type: 'consonant' },
    { letter: 'E', word: 'Echo', pronunciation: '(ECK-OH)', type: 'vowel' },
    { letter: 'F', word: 'Foxtrot', pronunciation: '(FOKS-TROT)', type: 'consonant' },
    { letter: 'G', word: 'Golf', pronunciation: '(GOLF)', type: 'consonant' },
    { letter: 'H', word: 'Hotel', pronunciation: '(HOH-TEL)', type: 'consonant' },
    { letter: 'I', word: 'India', pronunciation: '(IN-DEE-AH)', type: 'vowel' },
    { letter: 'J', word: 'Juliett', pronunciation: '(JEW-LEE-ETT)', type: 'consonant' },
    { letter: 'K', word: 'Kilo', pronunciation: '(KEY-LOH)', type: 'consonant' },
    { letter: 'L', word: 'Lima', pronunciation: '(LEE-MAH)', type: 'consonant' },
    { letter: 'M', word: 'Mike', pronunciation: '(MIKE)', type: 'consonant' },
    { letter: 'N', word: 'November', pronunciation: '(NO-VEM-BER)', type: 'consonant' },
    { letter: 'O', word: 'Oscar', pronunciation: '(OSS-CAR)', type: 'vowel' },
    { letter: 'P', word: 'Papa', pronunciation: '(PAH-PAH)', type: 'consonant' },
    { letter: 'Q', word: 'Quebec', pronunciation: '(KEH-BECK)', type: 'consonant' },
    { letter: 'R', word: 'Romeo', pronunciation: '(ROW-ME-OH)', type: 'consonant' },
    { letter: 'S', word: 'Sierra', pronunciation: '(SEE-AIR-RAH)', type: 'consonant' },
    { letter: 'T', word: 'Tango', pronunciation: '(TANG-GO)', type: 'consonant' },
    { letter: 'U', word: 'Uniform', pronunciation: '(YOU-NEE-FORM)', type: 'vowel' },
    { letter: 'V', word: 'Victor', pronunciation: '(VIK-TOR)', type: 'consonant' },
    { letter: 'W', word: 'Whiskey', pronunciation: '(WISS-KEY)', type: 'consonant' },
    { letter: 'X', word: 'X-ray', pronunciation: '(ECKS-RAY)', type: 'consonant' },
    { letter: 'Y', word: 'Yankee', pronunciation: '(YANG-KEY)', type: 'consonant' },
    { letter: 'Z', word: 'Zulu', pronunciation: '(ZOO-LOO)', type: 'consonant' }
];

const NUMBERS_DATA = [
    { number: '0', word: 'Zero', pronunciation: '(ZE-RO)' },
    { number: '1', word: 'One', pronunciation: '(WUN)' },
    { number: '2', word: 'Two', pronunciation: '(TOO)' },
    { number: '3', word: 'Three', pronunciation: '(TREE)' },
    { number: '4', word: 'Four', pronunciation: '(FOW-ER)' },
    { number: '5', word: 'Five', pronunciation: '(FIFE)' },
    { number: '6', word: 'Six', pronunciation: '(SIX)' },
    { number: '7', word: 'Seven', pronunciation: '(SEV-EN)' },
    { number: '8', word: 'Eight', pronunciation: '(AIT)' },
    { number: '9', word: 'Nine', pronunciation: '(NIN-ER)' }
];

const state = {
    letterFilter: 'all',
    letterSearch: '',
    numberSearch: '',
    foundLetters: new Set(),
};

const letterGrid = document.getElementById('letterGrid');
const numberGrid = document.getElementById('numberGrid');
const searchLetters = document.getElementById('searchLetters');
const searchNumbers = document.getElementById('searchNumbers');
const filterBtns = document.querySelectorAll('[data-filter]');
const resetLettersBtn = document.getElementById('resetLetters');
const resetNumbersBtn = document.getElementById('resetNumbers');
const toast = document.getElementById('toast');
const foundCountEl = document.getElementById('foundCount');
const audioStatus = document.getElementById('audioStatus');

let currentUtterance = null;
let audioStatusTimeout = null;
let toastTimeout = null;

function speakText(text, rate = 0.9) {
    if (!('speechSynthesis' in window)) {
        console.warn('⚠️ Speech Synthesis not supported.');
        return;
    }

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    const cleanText = text.replace(/[\(\)\-]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    showAudioStatus(true);

    utterance.onend = () => showAudioStatus(false);
    utterance.onerror = () => showAudioStatus(false);

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
}

function showAudioStatus(show) {
    clearTimeout(audioStatusTimeout);
    if (show) {
        audioStatus.classList.add('show');
    } else {
        audioStatus.classList.remove('show');
    }
}

function renderLetters() {
    const filtered = LETTERS_DATA.filter(item => {
        if (state.letterFilter === 'vowels' && item.type !== 'vowel') return false;
        if (state.letterFilter === 'consonants' && item.type !== 'consonant') return false;
        const q = state.letterSearch.toLowerCase();
        if (q) {
            return item.letter.toLowerCase().includes(q) || item.word.toLowerCase().includes(q);
        }
        return true;
    });

    letterGrid.innerHTML = filtered.map(item => {
        const isFound = state.foundLetters.has(item.letter);
        const foundClass = isFound ? 'found' : '';
        const badge = item.type === 'vowel'
            ? '<span class="card-badge">Vowel</span>'
            : '<span class="card-badge" style="background:#7f8c8d;">Consonant</span>';
        return `
            <div class="card ${foundClass}" data-letter="${item.letter}" data-word="${item.word}" data-type="${item.type}" role="button" tabindex="0" aria-label="${item.letter} for ${item.word}">
                ${badge}
                <div class="letter">${item.letter}</div>
                <div class="word">${item.word}</div>
                <div class="pronunciation">${item.pronunciation}</div>
                <span class="sound-indicator">🔊</span>
            </div>
        `;
    }).join('');

    document.querySelectorAll('#letterGrid .card').forEach(el => {
        el.removeEventListener('click', clickHandler);
        el.addEventListener('click', clickHandler);
        el.removeEventListener('keydown', keydownHandler);
        el.addEventListener('keydown', keydownHandler);
    });

    updateFoundCount();
}

function clickHandler(e) {
    const el = e.currentTarget;
    const type = el.closest('#letterGrid') ? 'letter' : 'number';
    handleCardClick(el, type);
}

function keydownHandler(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const el = e.currentTarget;
        const type = el.closest('#letterGrid') ? 'letter' : 'number';
        handleCardClick(el, type);
    }
}

function renderNumbers() {
    const filtered = NUMBERS_DATA.filter(item => {
        const q = state.numberSearch.toLowerCase();
        if (q) {
            return item.number.includes(q) || item.word.toLowerCase().includes(q);
        }
        return true;
    });

    numberGrid.innerHTML = filtered.map(item => `
        <div class="card" data-number="${item.number}" data-word="${item.word}" role="button" tabindex="0" aria-label="${item.number} for ${item.word}">
            <span class="card-badge number-badge">Number</span>
            <div class="letter">${item.number}</div>
            <div class="word">${item.word}</div>
            <div class="pronunciation">${item.pronunciation}</div>
            <span class="sound-indicator">🔊</span>
        </div>
    `).join('');

    document.querySelectorAll('#numberGrid .card').forEach(el => {
        el.removeEventListener('click', clickHandler);
        el.addEventListener('click', clickHandler);
        el.removeEventListener('keydown', keydownHandler);
        el.addEventListener('keydown', keydownHandler);
    });
}

function handleCardClick(el, type) {
    if (!el || !el.isConnected) {
        console.warn('⚠️ Card element is invalid.');
        return;
    }

    const letter = el.dataset?.letter || null;
    const word = el.dataset?.word || null;
    const number = el.dataset?.number || null;
    const displayName = letter || number || word || 'Unknown';

    let pronunciation = '';
    try {
        const pronunciationEl = el.querySelector('.pronunciation');
        pronunciation = pronunciationEl?.textContent || '';
    } catch (err) {
        console.warn('⚠️ Could not read pronunciation:', err);
    }

    if (type === 'letter' && letter) {
        state.foundLetters.add(letter);
        el.classList.add('found');
        updateFoundCount();
    }

    const message = `
        <span class="toast-highlight">${displayName}</span>
        &nbsp;→&nbsp; ${word || displayName}
        ${pronunciation ? `&nbsp; ${pronunciation}` : ''}
        &nbsp; 🔊
    `;
    showToast(message);

    const speakWord = word || displayName;
    if (speakWord) {
        try {
            speakText(speakWord, 0.9);
        } catch (err) {
            console.warn('⚠️ Could not speak text:', err);
        }
    }
}

function updateFoundCount() {
    try {
        foundCountEl.textContent = state.foundLetters.size;
    } catch (err) {
        console.warn('⚠️ Could not update found count:', err);
    }
}

function showToast(message) {
    try {
        toast.innerHTML = message;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    } catch (err) {
        console.warn('⚠️ Could not show toast:', err);
    }
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.letterFilter = btn.dataset.filter;
        renderLetters();
    });
});

searchLetters.addEventListener('input', (e) => {
    state.letterSearch = e.target.value.trim();
    renderLetters();
});

searchNumbers.addEventListener('input', (e) => {
    state.numberSearch = e.target.value.trim();
    renderNumbers();
});

resetLettersBtn.addEventListener('click', () => {
    searchLetters.value = '';
    state.letterSearch = '';
    state.letterFilter = 'all';
    filterBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="all"]')?.classList.add('active');
    renderLetters();
});

resetNumbersBtn.addEventListener('click', () => {
    searchNumbers.value = '';
    state.numberSearch = '';
    renderNumbers();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.activeElement === searchLetters || document.activeElement === searchNumbers) {
            document.activeElement.blur();
        }
    }
});

(function initHeaderCanvas() {
    const header = document.getElementById('header');
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    header.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let w, h;

    function resize() {
        const rect = header.getBoundingClientRect();
        w = canvas.width = rect.width;
        h = canvas.height = rect.height;
    }
    resize();
    window.addEventListener('resize', resize);

    class Cloud {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h * 0.7 + h * 0.05;
            this.size = Math.random() * 150 + 60;
            this.speed = Math.random() * 0.25 + 0.08;
            this.opacity = Math.random() * 0.25 + 0.35;
            this.puffs = [];
            const num = Math.floor(Math.random() * 6 + 5);
            for (let i = 0; i < num; i++) {
                this.puffs.push({
                    dx: (Math.random() - 0.5) * this.size * 0.7,
                    dy: (Math.random() - 0.5) * this.size * 0.4,
                    radius: Math.random() * this.size * 0.35 + this.size * 0.15,
                });
            }
        }
        reset() {
            this.x = -200 - Math.random() * 300;
            this.y = Math.random() * h * 0.7 + h * 0.05;
            this.size = Math.random() * 150 + 60;
            this.speed = Math.random() * 0.25 + 0.08;
            this.opacity = Math.random() * 0.25 + 0.35;
        }
        update() {
            this.x += this.speed;
            if (this.x > w + 300) {
                this.reset();
            }
        }
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.shadowColor = 'rgba(255,255,255,0.1)';
            ctx.shadowBlur = 30;

            for (const p of this.puffs) {
                const px = this.x + p.dx;
                const py = this.y + p.dy;
                const r = p.radius;
                const grad = ctx.createRadialGradient(px - r * 0.2, py - r * 0.2, 0, px, py, r);
                grad.addColorStop(0, 'rgba(255,255,255,1)');
                grad.addColorStop(0.4, 'rgba(240,248,255,0.9)');
                grad.addColorStop(0.7, 'rgba(220,235,255,0.7)');
                grad.addColorStop(1, 'rgba(200,220,255,0.2)');
                ctx.beginPath();
                ctx.arc(px, py, r, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }

            ctx.shadowBlur = 0;
            ctx.globalAlpha = this.opacity * 0.25;
            for (const p of this.puffs) {
                const px = this.x + p.dx;
                const py = this.y + p.dy;
                const r = p.radius * 1.3;
                ctx.beginPath();
                ctx.arc(px, py, r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fill();
            }
            ctx.restore();
        }
    }

    const clouds = [];
    const numClouds = 8;
    for (let i = 0; i < numClouds; i++) {
        const c = new Cloud();
        c.x = Math.random() * w * 1.2 - 200;
        clouds.push(c);
    }

    function drawRipples(time) {
        const waterStart = h * 0.45;
        ctx.save();

        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = 'rgba(150,215,255,0.25)';
        ctx.lineWidth = 2;
        for (let y = waterStart; y < h; y += 20) {
            ctx.beginPath();
            for (let x = 0; x < w; x += 2) {
                const wave = Math.sin(x * 0.012 + time * 0.015 + y * 0.008) * 6 + Math.sin(x * 0.008 + time * 0.02 - y * 0.01) * 4;
                const yp = y + wave;
                x === 0 ? ctx.moveTo(x, yp) : ctx.lineTo(x, yp);
            }
            ctx.stroke();
        }

        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = 'rgba(100,180,255,0.18)';
        ctx.lineWidth = 3;
        for (let y = waterStart + 10; y < h; y += 30) {
            ctx.beginPath();
            for (let x = 0; x < w; x += 2) {
                const wave = Math.sin(x * 0.01 + time * 0.01 + y * 0.006) * 10 + Math.cos(x * 0.006 + time * 0.015 - y * 0.008) * 5;
                const yp = y + wave;
                x === 0 ? ctx.moveTo(x, yp) : ctx.lineTo(x, yp);
            }
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawBackground() {
        const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
        sky.addColorStop(0, '#4A90D9');
        sky.addColorStop(0.3, '#6BB3F0');
        sky.addColorStop(0.6, '#87CEEB');
        sky.addColorStop(1, '#B0E0FF');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h * 0.55);

        const water = ctx.createLinearGradient(0, h * 0.45, 0, h);
        water.addColorStop(0, '#5B9BD5');
        water.addColorStop(0.3, '#4A8EC7');
        water.addColorStop(0.7, '#3A7FB8');
        water.addColorStop(1, '#2A6FA8');
        ctx.fillStyle = water;
        ctx.fillRect(0, h * 0.45, w, h * 0.55);

        const trans = ctx.createLinearGradient(0, h * 0.45, 0, h * 0.50);
        trans.addColorStop(0, 'rgba(176,224,255,0)');
        trans.addColorStop(1, 'rgba(91,155,213,0.2)');
        ctx.fillStyle = trans;
        ctx.fillRect(0, h * 0.45, w, h * 0.05);
    }

    let time = 0;

    function animate() {
        drawBackground();
        for (const c of clouds) {
            c.update();
            c.draw(ctx);
        }
        drawRipples(time);
        time++;
        requestAnimationFrame(animate);
    }

    animate();
})();

renderLetters();
renderNumbers();
updateFoundCount();

console.log('📡 ICAO/NATO Alphabet Reference loaded.');
console.log(`📚 ${LETTERS_DATA.length} letters, ${NUMBERS_DATA.length} numbers loaded.`);
console.log('🔊 Click any card to hear the pronunciation (real speech).');
console.log('✅ Found counter tracks your learning progress.');
console.log('🏛️ Supported by: ICAO ✈️ | NATO 🛡️ | IMO 🚢');
