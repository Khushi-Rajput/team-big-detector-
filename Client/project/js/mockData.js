/**
 * Centralized Mock Data & Schema for AI Resume Analyzer
 * Standardized data models designed to directly mirror the future Python backend API
 * Endpoint: POST /api/resume/analyze
 * Endpoint: POST /api/resume/match-jd
 */

export const mockResumeData = {
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

export const sampleBeforeAfterBullets = [
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

export const sampleJobDescriptions = {
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
