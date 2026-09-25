/**
 * Job Description Matching Showcase
 */

import { sampleJobDescriptions } from './mockData.js';
import { ResumeAnalyzerService } from './apiService.js';

export function initJdMatcher() {
    const presetButtons = document.querySelectorAll('.jd-preset-btn');
    const textarea = document.getElementById('jdTextarea');
    const runBtn = document.getElementById('btnRunJdMatch');
    const scoreEl = document.getElementById('jdMatchScore');
    const roleTitleEl = document.getElementById('jdRoleTitle');
    const matchedPillsEl = document.getElementById('jdMatchedPills');
    const missingPillsEl = document.getElementById('jdMissingPills');
    const recommendationEl = document.getElementById('jdRecommendation');

    if (!textarea || !runBtn) return;

    let currentPreset = 'stripe';

    // Preset button click
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentPreset = btn.getAttribute('data-preset');
            const data = sampleJobDescriptions[currentPreset];
            if (data) {
                textarea.value = data.description;
                executeMatch(currentPreset);
            }
        });
    });

    runBtn.addEventListener('click', () => {
        executeMatch(currentPreset);
    });

    async function executeMatch(presetKey) {
        runBtn.textContent = 'Comparing Skills...';
        runBtn.disabled = true;

        try {
            const result = await ResumeAnalyzerService.matchJobDescription(textarea.value, presetKey);

            if (scoreEl) scoreEl.textContent = `${result.matchScore}%`;
            if (roleTitleEl) roleTitleEl.textContent = `${result.company} • ${result.targetRole}`;
            
            if (matchedPillsEl) {
                matchedPillsEl.innerHTML = result.matchingKeywords.map(kw => `
                    <span class="tag-chip matched">✓ ${kw}</span>
                `).join('');
            }

            if (missingPillsEl) {
                missingPillsEl.innerHTML = result.missingKeywords.map(kw => `
                    <span class="tag-chip missing">+ ${kw}</span>
                `).join('');
            }

            if (recommendationEl) {
                recommendationEl.textContent = result.recommendation;
            }
        } finally {
            runBtn.textContent = 'Re-Analyze Match →';
            runBtn.disabled = false;
        }
    }

    // Initialize with Stripe preset
    if (sampleJobDescriptions.stripe) {
        textarea.value = sampleJobDescriptions.stripe.description;
        executeMatch('stripe');
    }
}
