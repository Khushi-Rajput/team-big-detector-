/**
 * Interactive Before / After Resume Bullet Optimizer
 */

import { sampleBeforeAfterBullets } from './mockData.js';

export function initBulletOptimizer() {
    const navContainer = document.getElementById('optimizerNav');
    const beforeTextEl = document.getElementById('optimizerBeforeText');
    const afterTextEl = document.getElementById('optimizerAfterText');
    const metricPillEl = document.getElementById('optimizerMetricPill');
    const copyBtn = document.getElementById('optimizerCopyBtn');

    if (!navContainer || !beforeTextEl || !afterTextEl) return;

    let activeIndex = 0;

    function renderActiveBullet(index) {
        activeIndex = index;
        const item = sampleBeforeAfterBullets[index];
        if (!item) return;

        // Render Before
        beforeTextEl.textContent = `"${item.before}"`;

        // Render After with highlighted words
        let markedHtml = item.after;
        item.highlightWords.forEach(phrase => {
            markedHtml = markedHtml.replace(phrase, `<mark>${phrase}</mark>`);
        });
        afterTextEl.innerHTML = `"${markedHtml}"`;

        // Render Metric
        if (metricPillEl) {
            metricPillEl.textContent = item.metric;
        }

        // Update tabs
        const tabBtns = navContainer.querySelectorAll('.optimizer-tab-btn');
        tabBtns.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    }

    // Render Navigation Tabs
    navContainer.innerHTML = sampleBeforeAfterBullets.map((item, idx) => `
        <button class="optimizer-tab-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}">
            ${item.title}
        </button>
    `).join('');

    navContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.optimizer-tab-btn');
        if (btn) {
            const index = parseInt(btn.getAttribute('data-index'), 10);
            renderActiveBullet(index);
        }
    });

    // Copy to clipboard
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const activeItem = sampleBeforeAfterBullets[activeIndex];
            if (!activeItem) return;

            try {
                await navigator.clipboard.writeText(activeItem.after);
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = 'Copied ✓';
                copyBtn.style.background = 'var(--success-light)';
                copyBtn.style.color = 'var(--success)';

                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.background = '';
                    copyBtn.style.color = '';
                }, 2000);
            } catch (err) {
                console.warn('Clipboard write failed:', err);
            }
        });
    }

    // Initial render
    renderActiveBullet(0);
}
