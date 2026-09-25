/**
 * Main Application Orchestrator for AI Resume Analyzer
 * Connects frontend state, authentication, animations, and live backend services
 */

import { initScannerAnimation } from './scannerAnimation.js';
import { DashboardController } from './dashboard.js';
import { initUploadExperience } from './upload.js';
import { initBulletOptimizer } from './bulletOptimizer.js';
import { initJdMatcher } from './jdMatcher.js';
import { ResumeAnalyzerService } from './apiService.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Sticky Header Scroll Effect
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                siteHeader.classList.add('scrolled');
            } else {
                siteHeader.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // 2. Authentication State Handling in Navigation
    const navActions = document.querySelector('.nav-actions');
    const currentUser = ResumeAnalyzerService.getCurrentUser();

    if (currentUser && navActions) {
        const signInBtn = navActions.querySelector('a[href="login.html"]');
        if (signInBtn) {
            const userBadge = document.createElement('div');
            userBadge.className = 'user-nav-badge';
            userBadge.style.cssText = 'display:flex; align-items:center; gap:0.5rem; font-size:0.875rem; color:#a5b4fc; background:rgba(99,102,241,0.15); padding:0.4rem 0.85rem; border-radius:9999px; border:1px solid rgba(99,102,241,0.3);';
            userBadge.innerHTML = `
                <span>👤</span>
                <strong style="color:#ffffff;">${currentUser.name}</strong>
                <button type="button" id="btnNavSignOut" style="background:none; border:none; color:#f87171; cursor:pointer; font-size:0.75rem; font-weight:700; margin-left:0.35rem; padding:0 0.25rem;" title="Sign Out">✕</button>
            `;
            signInBtn.replaceWith(userBadge);

            const signOutBtn = document.getElementById('btnNavSignOut');
            if (signOutBtn) {
                signOutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    ResumeAnalyzerService.logout();
                    window.location.reload();
                });
            }
        }
    }

    // 3. Backend Health Status Indicator
    const isOnline = await ResumeAnalyzerService.checkHealth();
    const heroTrustBar = document.querySelector('.hero-trust-bar');
    if (heroTrustBar) {
        const statusItem = document.createElement('div');
        statusItem.className = 'trust-item';
        statusItem.innerHTML = isOnline
            ? `<span class="trust-number" style="color:var(--success);">● Active</span><span class="trust-label">Flask AI Backend</span>`
            : `<span class="trust-number" style="color:var(--warning);">○ Ready</span><span class="trust-label">Preview Engine</span>`;
        heroTrustBar.appendChild(statusItem);
    }

    // 4. Mobile Navigation Drawer
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileBackdrop = document.getElementById('mobileNavBackdrop');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    function toggleDrawer(open) {
        if (mobileDrawer && mobileBackdrop) {
            mobileDrawer.classList.toggle('open', open);
            mobileBackdrop.classList.toggle('open', open);
            document.body.style.overflow = open ? 'hidden' : '';
        }
    }

    if (mobileToggle) mobileToggle.addEventListener('click', () => toggleDrawer(true));
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', () => toggleDrawer(false));
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', () => toggleDrawer(false));
    drawerLinks.forEach(link => link.addEventListener('click', () => toggleDrawer(false)));

    // 5. Active Section Intersection Observer for Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    link.classList.toggle('active', href === `#${currentId}`);
                });
            }
        });
    }, { threshold: 0.35 });

    sections.forEach(sec => sectionObserver.observe(sec));

    // 6. Initialize Interactive ATS Scanner HUD
    initScannerAnimation();

    // 7. Initialize Live Analysis Dashboard
    const dashboard = new DashboardController();
    dashboard.render();

    // 8. Initialize Upload Experience with Dashboard Binding
    initUploadExperience(dashboard);

    // 9. Initialize Before/After Bullet Optimizer
    initBulletOptimizer();

    // 10. Initialize Job Description Matcher
    initJdMatcher();
});
