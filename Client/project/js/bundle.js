/**
 * AI Resume Analyzer - Standalone Unified Client Bundle
 * Runs natively in all browsers across http://, https://, and local file:/// protocols
 */
(function() {
    'use strict';

    // 1. DATA LAYER
    /**
 * Centralized Mock Data & Schema for AI Resume Analyzer
 * Standardized data models designed to directly mirror the future Python backend API
 * Endpoint: POST /api/resume/analyze
 * Endpoint: POST /api/resume/match-jd
 */

const mockResumeData = {
    profile: {
        name: "Alex Morgan",
        role: "Senior Full Stack Software Engineer",
        email: "alex.morgan@domain.com",
        phone: "+1 (555) 382-9014",
        location: "San Francisco, CA (Open to Remote)",
        summary: "Results-driven Software Engineer with 6+ years of experience architecting resilient cloud platforms, high-throughput microservices, and reactive frontend architectures. Proven track record leading cross-functional teams to reduce infrastructure latency by 38% and accelerate release velocity."
    },
    scores: {
        overallScore: 88,
        atsCompatibility: 94,
        keywordMatch: 86,
        skillsMatch: 91,
        structureScore: 92,
        impactScore: 82,
        readabilityScore: 95
    },
    atsBreakdown: [
        {
            category: "File Parseability",
            score: 98,
            status: "passed",
            description: "Clean standard UTF-8 text layer detected. Machine-readable without OCR artifacts."
        },
        {
            category: "Section Hierarchy",
            score: 95,
            status: "passed",
            description: "Standard headers recognized (Summary, Experience, Skills, Education, Projects)."
        },
        {
            category: "Contact Info & Links",
            score: 100,
            status: "passed",
            description: "Valid email, phone, location, and clickable GitHub / LinkedIn URLs detected."
        },
        {
            category: "Chronological Flow",
            score: 90,
            status: "passed",
            description: "Reverse-chronological timeline with clear month/year formatting."
        },
        {
            category: "Quantifiable Impact",
            score: 82,
            status: "warning",
            description: "4 out of 11 bullet points lack numeric business impact or performance metrics."
        },
        {
            category: "Formatting & Tables",
            score: 92,
            status: "passed",
            description: "No risky multi-column floating text boxes, graphics, or nested tables found."
        }
    ],
    detectedSkills: [
        { name: "TypeScript", level: "Expert", category: "Languages", verified: true },
        { name: "Python", level: "Advanced", category: "Languages", verified: true },
        { name: "JavaScript", level: "Expert", category: "Languages", verified: true },
        { name: "React / Next.js", level: "Expert", category: "Frontend", verified: true },
        { name: "Node.js / Express", level: "Advanced", category: "Backend", verified: true },
        { name: "PostgreSQL", level: "Advanced", category: "Databases", verified: true },
        { name: "Docker & Kubernetes", level: "Intermediate", category: "DevOps", verified: true },
        { name: "AWS (S3, Lambda, ECS)", level: "Advanced", category: "Cloud", verified: true },
        { name: "GraphQL & REST APIs", level: "Expert", category: "Architecture", verified: true },
        { name: "Redis Caching", level: "Intermediate", category: "Databases", verified: true },
        { name: "CI/CD (GitHub Actions)", level: "Advanced", category: "DevOps", verified: true },
        { name: "Tailwind CSS", level: "Expert", category: "Frontend", verified: true }
    ],
    missingKeywords: [
        { keyword: "System Design", importance: "High", occurrenceInJD: 6, context: "Distributed systems and fault tolerance" },
        { keyword: "Kafka / Event-Driven", importance: "High", occurrenceInJD: 4, context: "Asynchronous stream processing" },
        { keyword: "Unit / E2E Testing (Jest/Cypress)", importance: "Medium", occurrenceInJD: 3, context: "Automated regression pipelines" },
        { keyword: "Micro-Frontends", importance: "Medium", occurrenceInJD: 2, context: "Modular enterprise UI architecture" },
        { keyword: "SOC 2 / GDPR Compliance", importance: "Low", occurrenceInJD: 1, context: "Data governance standards" }
    ],
    strengths: [
        {
            title: "Strong Action Verb Usage",
            detail: "85% of bullet points begin with decisive action verbs ('Architected', 'Spearheaded', 'Optimized')."
        },
        {
            title: "Exceptional ATS Layout Compliance",
            detail: "Zero decorative icons, tables, or complex layout wraps that scramble ATS parsing parsers."
        },
        {
            title: "Modern In-Demand Tech Stack",
            detail: "Strong alignment with modern cloud native SaaS requirements (TypeScript, Python, Next.js, AWS)."
        },
        {
            title: "Concise Length & Density",
            detail: "Single-page density with 460 words falls squarely within the golden 400-600 word recruiter standard."
        }
    ],
    weaknesses: [
        {
            title: "Missing Metric Benchmarks in Role #2",
            detail: "Earlier frontend engineer position describes responsibilities instead of measurable outcomes.",
            severity: "high"
        },
        {
            title: "Absence of Distributed Messaging Keywords",
            detail: "Target senior roles heavily index Kafka, RabbitMQ, or SQS which are absent in your skills.",
            severity: "medium"
        },
        {
            title: "Vague Professional Summary Ending",
            detail: "Closing sentence lacks target role specificity and key domain specialization.",
            severity: "low"
        }
    ],
    actionableRecommendations: [
        {
            id: "rec-1",
            category: "High Impact",
            title: "Infuse metrics into bullet points using the Google XYZ formula",
            description: "Frame achievements as: Accomplished [X], as measured by [Y], by doing [Z]. For example, mention latency decrease or user growth percentages.",
            originalText: "Maintained cloud infrastructure and resolved backend errors.",
            suggestedText: "Automated infrastructure monitoring across 14 ECS microservices with Datadog, cutting MTTR by 42% and eliminating downtime.",
            impact: "+8 ATS Points"
        },
        {
            id: "rec-2",
            category: "Keyword Optimization",
            title: "Integrate Event-Driven Architecture keywords into your Project section",
            description: "Recruiters and ATS parsers for Senior Backend/Full-Stack positions query for distributed messaging patterns.",
            originalText: "Built API endpoints for order processing.",
            suggestedText: "Designed event-driven order processing pipeline utilizing RabbitMQ & Redis streams, achieving sub-80ms message delivery at 12k RPM.",
            impact: "+6 Match Points"
        },
        {
            id: "rec-3",
            category: "Structural Polish",
            title: "Consolidate Technical Skills by Category",
            description: "Group skills into clear subheadings (Languages, Frameworks, Cloud & Infrastructure, Databases) to assist automated ATS taxonomy filters.",
            impact: "+4 ATS Points"
        }
    ],
    careerMatches: [
        {
            role: "Senior Full Stack Engineer",
            matchRate: 94,
            demand: "Very High",
            avgSalary: "$165k - $210k",
            topKeySkills: ["TypeScript", "Next.js", "Python", "AWS", "PostgreSQL"],
            gapAnalysis: "Well matched. Add 1-2 distributed systems keywords to guarantee interview screening."
        },
        {
            role: "Lead Frontend Architect",
            matchRate: 89,
            demand: "High",
            avgSalary: "$170k - $215k",
            topKeySkills: ["React", "TypeScript", "Performance Optimization", "Design Systems"],
            gapAnalysis: "Exceptional UI leadership metrics. Highlight micro-frontend or monorepo experience."
        },
        {
            role: "Cloud / Platform Engineer",
            matchRate: 83,
            demand: "Critical",
            avgSalary: "$160k - $205k",
            topKeySkills: ["Python", "Docker", "Kubernetes", "CI/CD", "AWS Lambda"],
            gapAnalysis: "Core cloud fundamentals demonstrated; obtain Terraform or Kubernetes certifications."
        }
    ]
};

const sampleBeforeAfterBullets = [
    {
        title: "Backend Development",
        role: "Full Stack Engineer",
        before: "Worked on backend development and created REST APIs for the client application.",
        after: "Architected 18+ high-throughput REST & GraphQL microservices in Node.js & TypeScript, cutting p99 API response latency by 38% for 450,000 MAUs.",
        metric: "+38% Latency Reduction",
        highlightWords: ["Architected", "REST & GraphQL", "cutting p99 API response latency by 38%", "450,000 MAUs"]
    },
    {
        title: "Database Optimization",
        role: "Database / Backend",
        before: "Managed the company database and helped optimize slow database queries.",
        after: "Refactored PostgreSQL indexing strategies and implemented Redis multi-tier caching, reducing database server load by 54% during peak sales traffic.",
        metric: "+54% DB Load Optimization",
        highlightWords: ["Refactored PostgreSQL indexing", "Redis multi-tier caching", "reducing database server load by 54%"]
    },
    {
        title: "Frontend UI Performance",
        role: "Frontend Engineer",
        before: "Made the website faster and redesigned the homepage using React.",
        after: "Spearheaded Next.js migration and asset optimization pipelines, elevating Google Core Web Vitals (LCP) from 3.8s to 1.1s and boosting checkout conversion by 14%.",
        metric: "LCP 3.8s → 1.1s (+14% Conversion)",
        highlightWords: ["Spearheaded Next.js migration", "elevating Google Core Web Vitals (LCP) from 3.8s to 1.1s", "boosting checkout conversion by 14%"]
    }
];

const sampleJobDescriptions = {
    stripe: {
        company: "Stripe",
        title: "Staff Software Engineer - Developer Platform",
        description: `We are looking for a Staff Software Engineer to scale our core developer infrastructure. You will architect distributed systems, improve developer velocity, and maintain 99.999% reliability across millions of global financial transactions.

Required Qualifications:
• 6+ years experience with modern languages (TypeScript, Python, Go, or Ruby).
• Deep understanding of distributed systems, event-driven architectures (Kafka), and cloud infra (AWS/GCP).
• Proven track record optimizing high-throughput APIs and database query performance (PostgreSQL/Redis).
• Strong advocacy for automated testing, CI/CD pipelines, and infrastructure as code.`,
        requiredKeywords: ["Distributed Systems", "TypeScript", "Python", "Kafka", "AWS", "PostgreSQL", "CI/CD", "Redis", "High-Throughput"]
    },
    anthropic: {
        company: "Anthropic",
        title: "Full Stack AI Engineer - Product Interfaces",
        description: `Join Anthropic to design and build world-class user interfaces and interactive agentic platforms for Claude. We seek engineers who bridge intuitive human interfaces with complex, high-throughput LLM pipelines.

Required Qualifications:
• Strong fluency in React/Next.js, TypeScript, and modern CSS systems.
• Experience building streaming web applications (Server-Sent Events, WebSockets, reactive state management).
• Background interfacing with Python backend services, asynchronous queues, and vector databases.
• Obsessive attention to craft, micro-interactions, accessibility (WCAG), and responsive performance.`,
        requiredKeywords: ["React", "Next.js", "TypeScript", "Python", "Streaming UI", "WebSockets", "Accessibility", "Tailwind CSS"]
    },
    vercel: {
        company: "Vercel",
        title: "Senior Cloud Infrastructure & Platform Engineer",
        description: `Build the edge platform powering the modern web. You will build and scale global edge networks, serverless execution environments, and developer workflows.

Required Qualifications:
• Extensive knowledge of Node.js, Go, or Rust runtime internals.
• Production Kubernetes, Docker, container orchestration, and multi-region cloud deployment experience.
• Mastery of HTTP/2, HTTP/3, TLS handshakes, CDN caching strategies, and DNS propagation.
• Demonstrated telemetry and observability experience (Prometheus, OpenTelemetry, Datadog).`,
        requiredKeywords: ["Kubernetes", "Docker", "Node.js", "CDN Caching", "CI/CD", "Observability", "Prometheus", "Cloud Architecture"]
    }
};


    // 2. SCANNER ANIMATION
    /**
 * Interactive Hero ATS Scanner Animation & 3D Tilt HUD
 * Inspired by the reference machine and modern AI SaaS interfaces.
 */

function initScannerAnimation() {
    const scannerMachine = document.getElementById('atsScannerMachine');
    const dialNeedle = document.getElementById('dialNeedle');
    const consoleScore = document.getElementById('consoleScore');
    const consoleProgressBar = document.getElementById('consoleProgressBar');
    const highlightElements = document.querySelectorAll('.highlight-pill');

    if (!scannerMachine) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Subtle 3D Perspective Parallax on Mouse Move
    if (!prefersReducedMotion) {
        const visualWrapper = document.querySelector('.hero-visual-wrapper');
        if (visualWrapper) {
            visualWrapper.addEventListener('mousemove', (e) => {
                const rect = visualWrapper.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Restrained angles (max ~5 degrees)
                const rotateY = (x / (rect.width / 2)) * 5;
                const rotateX = -(y / (rect.height / 2)) * 5;

                scannerMachine.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            visualWrapper.addEventListener('mouseleave', () => {
                scannerMachine.style.transform = 'rotateX(0deg) rotateY(0deg)';
            });
        }
    }

    // 2. Continuous Timed Scanner Loop (Simulating scan phases)
    let scanCycle = 0;
    const scores = [88, 92, 95, 89];

    function runMachineCycle() {
        if (prefersReducedMotion) return;

        scanCycle = (scanCycle + 1) % scores.length;
        const targetScore = scores[scanCycle];

        // Animate Analog Gauge Needle (-45deg to +45deg)
        if (dialNeedle) {
            const needleAngle = -40 + (targetScore / 100) * 80;
            dialNeedle.style.transform = `rotate(${needleAngle}deg)`;
        }

        // Pulse Highlights sequentially
        highlightElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.boxShadow = '0 0 12px rgba(99, 102, 241, 0.5)';
                setTimeout(() => {
                    el.style.boxShadow = 'none';
                }, 1200);
            }, index * 400);
        });

        // Update Console Score
        if (consoleScore) {
            consoleScore.textContent = `${targetScore}/100`;
        }

        if (consoleProgressBar) {
            consoleProgressBar.style.width = `${targetScore}%`;
        }
    }

    // Interval to coordinate scanner cycles every 4.5 seconds
    const intervalId = setInterval(runMachineCycle, 4500);
    // Initial run
    runMachineCycle();

    return () => clearInterval(intervalId);
}


    // 3. API SERVICE LAYER
    /**
 * API Service Layer for AI Resume Analyzer
 * Connects frontend directly with Flask backend at http://127.0.0.1:5000
 * Graceful fallback to rich local simulated engine if backend is offline.
 */


function detectApiBaseUrl() {
    if (typeof window !== 'undefined') {
        // If served on Flask port 5000 directly, use relative URLs
        if (window.location.port === '5000') {
            return '';
        }
        // Otherwise (e.g. VS Code Live Server 5500, port 3000, 8080, or file://)
        return 'http://127.0.0.1:5000';
    }
    return 'http://127.0.0.1:5000';
}

const API_CONFIG = {
    USE_REAL_BACKEND: true,
    API_BASE_URL: detectApiBaseUrl(),
    SIMULATED_DELAY_MS: 300
};

class ResumeAnalyzerService {
    static currentResumeId = null;
    static lastAnalysis = null;
    static isBackendOnline = null;

    /**
     * Checks if the Flask backend server is alive
     */
    static async checkHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${API_CONFIG.API_BASE_URL}/health`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            ResumeAnalyzerService.isBackendOnline = res.ok;
            return res.ok;
        } catch {
            ResumeAnalyzerService.isBackendOnline = false;
            return false;
        }
    }

    /**
     * Analyzes a resume file with optional job description text.
     * @param {File|Blob|string} file 
     * @param {string} [jobDescription]
     * @param {function} [onProgress] Callback receiving ({ stage, percent, message })
     * @returns {Promise<typeof mockResumeData>}
     */
    static async analyzeResume(file, jobDescription = '', onProgress = null) {
        // Realistic multi-stage UI progression
        const stages = [
            { percent: 25, stage: 'uploading', message: 'Encrypting and transferring resume payload...' },
            { percent: 50, stage: 'parsing', message: 'Extracting UTF-8 text layer and structural headers...' },
            { percent: 75, stage: 'evaluating', message: 'Running ATS parser compliance and tokenizing skills...' },
            { percent: 90, stage: 'scoring', message: 'Benchmarking against 120,000+ senior engineering profiles...' },
            { percent: 100, stage: 'complete', message: 'AI Diagnostic Report generated successfully!' }
        ];

        let stageIdx = 0;
        const progressTimer = setInterval(() => {
            if (stageIdx < stages.length && onProgress) {
                onProgress(stages[stageIdx]);
                stageIdx++;
            }
        }, 220);

        if (API_CONFIG.USE_REAL_BACKEND) {
            try {
                const formData = new FormData();
                formData.append('resume', file);
                if (jobDescription) {
                    formData.append('jobDescription', jobDescription);
                }

                // Attach current user id if logged in
                const user = ResumeAnalyzerService.getCurrentUser();
                if (user && user.user_id) {
                    formData.append('user_id', user.user_id);
                }

                const response = await fetch(`${API_CONFIG.API_BASE_URL}/analyze`, {
                    method: 'POST',
                    body: formData
                });

                clearInterval(progressTimer);
                if (onProgress) onProgress(stages[stages.length - 1]);

                if (response.ok) {
                    const result = await response.json();
                    ResumeAnalyzerService.currentResumeId = result.resume_id || null;
                    ResumeAnalyzerService.lastAnalysis = result;
                    ResumeAnalyzerService.isBackendOnline = true;
                    return result;
                } else {
                    const errJson = await response.json().catch(() => ({}));
                    console.warn('Backend returned error, falling back to simulated data:', errJson);
                }
            } catch (networkError) {
                clearInterval(progressTimer);
                console.warn('Could not connect to Flask backend at', API_CONFIG.API_BASE_URL, networkError);
                ResumeAnalyzerService.isBackendOnline = false;
            }
        }

        // Fallback / Offline Demo Processing
        clearInterval(progressTimer);
        for (const step of stages) {
            if (onProgress) onProgress(step);
            await new Promise((r) => setTimeout(r, 120));
        }

        const customizedResult = JSON.parse(JSON.stringify(mockResumeData));
        if (file && file.name) {
            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
            customizedResult.meta = {
                fileName: file.name,
                fileSize: file.size ? `${(file.size / 1024).toFixed(1)} KB` : '420 KB',
                uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                inferredTitle: cleanName
            };
        }
        ResumeAnalyzerService.lastAnalysis = customizedResult;
        return customizedResult;
    }

    /**
     * Matches a candidate's resume with a target job description
     * @param {string} jdText 
     * @param {string} [presetKey] 
     */
    static async matchJobDescription(jdText, presetKey = 'stripe') {
        if (API_CONFIG.USE_REAL_BACKEND) {
            try {
                const candidateSkills = (ResumeAnalyzerService.lastAnalysis?.detectedSkills || mockResumeData.detectedSkills).map(s => s.name);
                const payload = {
                    job_description: jdText,
                    resume_id: ResumeAnalyzerService.currentResumeId || null,
                    candidate_skills: candidateSkills
                };

                const res = await fetch(`${API_CONFIG.API_BASE_URL}/match-resume`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const data = await res.json();
                    return data;
                }
            } catch (err) {
                console.warn('Backend match unavailable, using local calculation:', err);
            }
        }

        // Local fallback calculation
        await new Promise((r) => setTimeout(r, 300));
        const preset = sampleJobDescriptions[presetKey] || sampleJobDescriptions.stripe;
        const targetKeywords = preset.requiredKeywords;
        
        const candidateSkills = (ResumeAnalyzerService.lastAnalysis?.detectedSkills || mockResumeData.detectedSkills).map(s => s.name.toLowerCase());
        const matching = [];
        const missing = [];

        targetKeywords.forEach(kw => {
            const lower = kw.toLowerCase();
            const isMatch = candidateSkills.some(cs => cs.includes(lower) || lower.includes(cs));
            if (isMatch) {
                matching.push(kw);
            } else {
                missing.push(kw);
            }
        });

        const matchScore = Math.round((matching.length / targetKeywords.length) * 100);

        return {
            matchScore,
            targetRole: preset.title,
            company: preset.company,
            matchingKeywords: matching,
            missingKeywords: missing,
            totalEvaluated: targetKeywords.length,
            recommendation: matchScore >= 75
                ? "Excellent match! Your resume contains the core tech stack requirements for this role."
                : "Moderate match. We strongly recommend embedding the missing keywords into your experience bullets."
        };
    }

    /**
     * AI Bullet Optimizer
     * @param {string} bullet 
     * @param {string} [role] 
     */
    static async optimizeBullet(bullet, role = 'Software Engineer') {
        if (API_CONFIG.USE_REAL_BACKEND) {
            try {
                const res = await fetch(`${API_CONFIG.API_BASE_URL}/optimize-bullet`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bullet, role })
                });
                if (res.ok) {
                    return await res.json();
                }
            } catch (err) {
                console.warn('Bullet optimizer backend error, using client fallback:', err);
            }
        }
        return {
            before: bullet,
            after: `Architected and optimized ${bullet}, cutting p99 latency by 36% for 280k active users.`,
            metric: "+36% Measured Efficiency",
            highlightWords: ["Architected and optimized", "cutting p99 latency by 36%"]
        };
    }

    /**
     * User Authentication Helpers
     */
    static getCurrentUser() {
        try {
            const stored = localStorage.getItem('resume_user') || localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }

    static setCurrentUser(user) {
        if (user) {
            localStorage.setItem('resume_user', JSON.stringify(user));
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('resume_user');
            localStorage.removeItem('user');
        }
    }

    static logout() {
        ResumeAnalyzerService.setCurrentUser(null);
    }
}


    // 4. LIVE DASHBOARD CONTROLLER
    /**
 * Live Interactive Resume Analysis Dashboard Controller
 */


class DashboardController {
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


    // 5. UPLOAD EXPERIENCE
    /**
 * Interactive Resume Upload Manager
 * Handles Drag & Drop, validation, multi-stage progress, and triggers dashboard updates
 */


function initUploadExperience(dashboardInstance) {
    const dropzone = document.getElementById('resumeDropzone');
    const fileInput = document.getElementById('resumeFileInput');
    const processingBox = document.getElementById('uploadProcessingBox');
    const progressFill = document.getElementById('processingProgressFill');
    const progressPercent = document.getElementById('processingPercent');
    const statusMessage = document.getElementById('processingStatusMsg');
    const sampleDemoBtn = document.getElementById('btnSampleDemo');

    if (!dropzone || !fileInput) return;

    // Drag & Drop Listeners
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    dropzone.addEventListener('click', (e) => {
        if (e.target !== fileInput && !e.target.closest('button')) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Quick Test with Sample Profile Button
    if (sampleDemoBtn) {
        sampleDemoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const sampleResumeText = `ALEX MORGAN
Senior Full Stack Software Engineer
Email: alex.morgan@domain.com | Phone: (555) 382-9014 | Location: San Francisco, CA
LinkedIn: linkedin.com/in/alexmorgan | GitHub: github.com/alexmorgan

SUMMARY
Results-driven Software Engineer with 6+ years of experience architecting resilient cloud platforms, high-throughput microservices, and reactive frontend architectures. Proven track record leading cross-functional teams to reduce infrastructure latency by 38% and accelerate release velocity.

EXPERIENCE
Senior Software Engineer | TechScale Inc. | 2022 - Present
- Architected 18+ high-throughput REST and GraphQL microservices in Node.js & TypeScript, cutting p99 API response latency by 38% for 450,000 MAUs.
- Refactored PostgreSQL indexing strategies and implemented Redis multi-tier caching, reducing database server load by 54% during peak sales traffic.
- Spearheaded Next.js migration and asset optimization pipelines, elevating Google Core Web Vitals (LCP) from 3.8s to 1.1s and boosting conversion by 14%.
- Led automated test coverage expansion with Jest and Cypress to 88%.

Software Engineer | CloudSphere Solutions | 2019 - 2022
- Developed scalable backend services using Python, Flask, and PostgreSQL for enterprise client management.
- Built containerized CI/CD pipelines with Docker and GitHub Actions, slashing deployment cycle times by 45%.
- Integrated AWS S3 and Lambda serverless functions handling 2TB+ weekly file processing.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2015 - 2019

TECHNICAL SKILLS
Languages: TypeScript, Python, JavaScript, SQL, HTML5, CSS3, Bash
Frontend: React, Next.js, Redux, Tailwind CSS
Backend: Node.js, Express, Flask, GraphQL, REST APIs
Databases & Cloud: PostgreSQL, Redis, MongoDB, AWS, Docker, Kubernetes, CI/CD, Git`;

            const mockFile = new File([sampleResumeText], "Alex_Morgan_Senior_Software_Engineer_Resume.txt", { type: "text/plain" });
            handleFileUpload(mockFile);
        });
    }

    async function handleFileUpload(file) {
        // Validate file type
        const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
        const isExtensionValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!isExtensionValid) {
            alert('Please upload a valid resume file in PDF, TXT, DOC, or DOCX format.');
            return;
        }

        // Validate size (10 MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds the 10 MB limit. Please select a smaller document.');
            return;
        }

        // Show Processing UI
        if (processingBox) {
            processingBox.style.display = 'block';
        }

        try {
            const analysisResult = await ResumeAnalyzerService.analyzeResume(file, '', (progress) => {
                if (progressFill) progressFill.style.width = `${progress.percent}%`;
                if (progressPercent) progressPercent.textContent = `${progress.percent}%`;
                if (statusMessage) {
                    statusMessage.innerHTML = `<span class="spinner-icon"></span> ${progress.message}`;
                }
            });

            // Completed! Transition to dashboard
            setTimeout(() => {
                if (dashboardInstance) {
                    dashboardInstance.render(analysisResult);
                }

                // Smooth scroll to analysis dashboard
                const dashboardEl = document.getElementById('analysis');
                if (dashboardEl) {
                    dashboardEl.scrollIntoView({ behavior: 'smooth' });
                }

                // Reset processing box after completion
                setTimeout(() => {
                    if (processingBox) processingBox.style.display = 'none';
                    if (progressFill) progressFill.style.width = '0%';
                }, 1000);
            }, 600);

        } catch (error) {
            console.error('Analysis failed:', error);
            if (statusMessage) {
                statusMessage.innerHTML = `<span style="color:var(--danger)">⚠ Error analyzing resume: ${error.message}</span>`;
            }
        }
    }
}


    // 6. BULLET OPTIMIZER
    /**
 * Interactive Before / After Resume Bullet Optimizer
 */


function initBulletOptimizer() {
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


    // 7. JOB DESCRIPTION MATCHER
    /**
 * Job Description Matching Showcase
 */


function initJdMatcher() {
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


    // 8. MASTER ORCHESTRATOR
    /**
 * Main Application Orchestrator for AI Resume Analyzer
 * Connects frontend state, authentication, animations, and live backend services
 */


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

})();
