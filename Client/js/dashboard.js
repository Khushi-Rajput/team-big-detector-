/**
 * Live Interactive Resume Analysis Dashboard Controller
 */

import { mockResumeData } from './mockData.js';

export class DashboardController {
    constructor() {
        this.currentData = mockResumeData;
        this.initElements();
        this.attachTabEvents();
    }

    initElements() {
        this.overallScoreEl = document.getElementById('dashOverallScore');
        this.overallCircleEl = document.getElementById('dashOverallCircle');
        
        this.atsScoreEl = document.getElementById('dashAtsScore');
        this.atsCircleEl = document.getElementById('dashAtsCircle');
        
        this.keywordsScoreEl = document.getElementById('dashKeywordsScore');
        this.keywordsCircleEl = document.getElementById('dashKeywordsCircle');
        
        this.skillsScoreEl = document.getElementById('dashSkillsScore');
        this.skillsCircleEl = document.getElementById('dashSkillsCircle');

        this.candidateNameEl = document.getElementById('dashCandidateName');
        this.candidateRoleEl = document.getElementById('dashCandidateRole');

        // Tab buttons and panels
        this.tabButtons = document.querySelectorAll('.dashboard-tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel-content');
    }

    attachTabEvents() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabId) {
        this.tabButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-tab') === tabId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        this.tabPanels.forEach(panel => {
            const isActive = panel.id === `tab-${tabId}`;
            panel.classList.toggle('active', isActive);
        });
    }

    /**
     * Updates and animates the dashboard with new analysis data
     * @param {typeof mockResumeData} data 
     */
    render(data = this.currentData) {
        this.currentData = data;

        // 1. Update Candidate Metadata
        if (this.candidateNameEl && data.profile) {
            this.candidateNameEl.textContent = data.meta?.inferredTitle || data.profile.name;
        }
        if (this.candidateRoleEl && data.profile) {
            this.candidateRoleEl.textContent = data.meta ? `${data.profile.role} • ${data.meta.fileName || ''}` : data.profile.role;
        }

        // 2. Animate Circular Radial Gauges (Circumference ~226 for r=36)
        this.setRadialScore(this.overallScoreEl, this.overallCircleEl, data.scores.overallScore);
        this.setRadialScore(this.atsScoreEl, this.atsCircleEl, data.scores.atsCompatibility);
        this.setRadialScore(this.keywordsScoreEl, this.keywordsCircleEl, data.scores.keywordMatch);
        this.setRadialScore(this.skillsScoreEl, this.skillsCircleEl, data.scores.skillsMatch);

        // 3. Render Tab Contents
        this.renderAtsTab(data.atsBreakdown);
        this.renderSkillsTab(data.detectedSkills, data.missingKeywords);
        this.renderStrengthsTab(data.strengths, data.weaknesses);
        this.renderRecommendationsTab(data.actionableRecommendations);
        this.renderCareerTab(data.careerMatches);
    }

    setRadialScore(numberEl, circleEl, score) {
        if (!numberEl || !circleEl) return;
        
        // Counter animation
        let count = 0;
        const target = score;
        const duration = 1200;
        const stepTime = Math.max(Math.floor(duration / target), 12);
        
        const timer = setInterval(() => {
            count += 1;
            numberEl.textContent = count;
            if (count >= target) {
                clearInterval(timer);
                numberEl.textContent = target;
            }
        }, stepTime);

        // SVG stroke-dashoffset (226 is 2 * PI * 36)
        const circumference = 226;
        const offset = circumference - (score / 100) * circumference;
        circleEl.style.strokeDashoffset = offset;
    }

    renderAtsTab(checklist) {
        const container = document.getElementById('atsChecklistContainer');
        if (!container || !checklist) return;

        container.innerHTML = checklist.map(item => `
            <div class="ats-check-card">
                <div class="check-icon-circle ${item.status === 'passed' ? 'pass' : 'warn'}">
                    ${item.status === 'passed' ? '✓' : '⚠'}
                </div>
                <div class="check-content">
                    <h5>
                        ${item.category}
                        <span style="font-size:0.75rem; color:${item.status === 'passed' ? 'var(--success)' : 'var(--warning)'}; font-weight:700;">
                            ${item.score}%
                        </span>
                    </h5>
                    <p>${item.description}</p>
                </div>
            </div>
        `).join('');
    }

    renderSkillsTab(skills, missingKeywords) {
        const skillsContainer = document.getElementById('detectedSkillsList');
        const missingContainer = document.getElementById('missingKeywordsList');

        if (skillsContainer && skills) {
            skillsContainer.innerHTML = skills.map(s => `
                <span class="tag-chip matched">
                    ✓ ${s.name} <small style="opacity:0.75; font-size:0.65rem;">(${s.level})</small>
                </span>
            `).join('');
        }

        if (missingContainer && missingKeywords) {
            missingContainer.innerHTML = missingKeywords.map(mk => `
                <div class="keyword-gap-item">
                    <div>
                        <div class="keyword-gap-title">${mk.keyword}</div>
                        <div class="keyword-gap-meta">${mk.context}</div>
                    </div>
                    <span class="tag-chip missing">
                        +${mk.occurrenceInJD} in target JDs
                    </span>
                </div>
            `).join('');
        }
    }

    renderStrengthsTab(strengths, weaknesses) {
        const strContainer = document.getElementById('strengthsList');
        const weakContainer = document.getElementById('weaknessesList');

        if (strContainer && strengths) {
            strContainer.innerHTML = strengths.map(st => `
                <div class="insight-item strength">
                    <h6>✓ ${st.title}</h6>
                    <p>${st.detail}</p>
                </div>
            `).join('');
        }

        if (weakContainer && weaknesses) {
            weakContainer.innerHTML = weaknesses.map(wk => `
                <div class="insight-item weakness">
                    <h6>⚠ ${wk.title} <span style="font-size:0.7rem; color:var(--warning); text-transform:uppercase;">[${wk.severity}]</span></h6>
                    <p>${wk.detail}</p>
                </div>
            `).join('');
        }
    }

    renderRecommendationsTab(recommendations) {
        const container = document.getElementById('recommendationsList');
        if (!container || !recommendations) return;

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="rec-header">
                    <div class="rec-title-group">
                        <h6>${rec.title}</h6>
                        <span style="font-size:0.75rem; color:var(--text-muted);">${rec.category}</span>
                    </div>
                    <span class="rec-impact-badge">${rec.impact}</span>
                </div>
                <p class="rec-desc">${rec.description}</p>
                ${rec.originalText ? `
                    <div class="rec-diff-box">
                        <div class="diff-line del">- Before: "${rec.originalText}"</div>
                        <div class="diff-line add">+ AI Suggestion: "${rec.suggestedText}"</div>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    renderCareerTab(matches) {
        const container = document.getElementById('careerMatchesContainer');
        if (!container || !matches) return;

        container.innerHTML = matches.map(cm => `
            <div class="career-card">
                <div class="career-role-title">${cm.role}</div>
                <div class="career-salary">${cm.avgSalary}</div>
                <div class="career-metric-row">
                    <span>Match Probability:</span>
                    <strong>${cm.matchRate}%</strong>
                </div>
                <div class="career-metric-row">
                    <span>Market Demand:</span>
                    <strong style="color:var(--success);">${cm.demand}</strong>
                </div>
                <div class="career-metric-row">
                    <span>Top Keywords:</span>
                    <span>${cm.topKeySkills.slice(0, 3).join(', ')}</span>
                </div>
                <div class="career-gap-note">
                    <strong>AI Gap Note:</strong> ${cm.gapAnalysis}
                </div>
            </div>
        `).join('');
    }
}
