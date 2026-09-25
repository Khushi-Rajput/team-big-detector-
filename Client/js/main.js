/**
 * Main Application Orchestrator for AI Resume Analyzer
 */

import { initScannerAnimation } from './scannerAnimation.js';
import { DashboardController } from './dashboard.js';
import { initUploadExperience } from './upload.js';
import { initBulletOptimizer } from './bulletOptimizer.js';
import { initJdMatcher } from './jdMatcher.js';

document.addEventListener('DOMContentLoaded', () => {
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

    // 2. Mobile Navigation Drawer
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

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => toggleDrawer(true));
    }
    if (drawerCloseBtn) {
        drawerCloseBtn.addEventListener('click', () => toggleDrawer(false));
    }
    if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', () => toggleDrawer(false));
    }
    drawerLinks.forEach(link => {
        link.addEventListener('click', () => toggleDrawer(false));
    });

    // 3. Active Section Intersection Observer for Navigation
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

    // 4. Initialize Interactive ATS Scanner HUD
    initScannerAnimation();

    // 5. Initialize Live Analysis Dashboard
    const dashboard = new DashboardController();
    dashboard.render();

    // 6. Initialize Upload Experience with Dashboard Binding
    initUploadExperience(dashboard);

    // 7. Initialize Before/After Bullet Optimizer
    initBulletOptimizer();

    // 8. Initialize Job Description Matcher
    initJdMatcher();
});
