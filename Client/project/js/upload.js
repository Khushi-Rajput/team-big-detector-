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
            const mockFile = new File(["sample resume content"], "Alex_Morgan_Senior_Software_Engineer_Resume.pdf", { type: "application/pdf" });
            handleFileUpload(mockFile);
        });
    }

    async function handleFileUpload(file) {
        // Validate file type
        const validExtensions = ['.pdf', '.docx', '.doc'];
        const isExtensionValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!isExtensionValid) {
            alert('Please upload a valid resume file in PDF, DOC, or DOCX format.');
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
