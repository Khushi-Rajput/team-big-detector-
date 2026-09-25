/**
 * Interactive Resume Upload Manager
 * Handles Drag & Drop, validation, multi-stage progress, and triggers dashboard updates
 */

import { ResumeAnalyzerService } from './apiService.js';

export function initUploadExperience(dashboardInstance) {
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
