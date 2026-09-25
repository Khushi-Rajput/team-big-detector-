/**
 * API Service Layer for AI Resume Analyzer
 * Isolates data fetching and state transitions.
 * When the Python backend is implemented, toggle USE_REAL_BACKEND to true
 * or update the API_BASE_URL.
 */

import { mockResumeData, sampleJobDescriptions } from './mockData.js';

export const API_CONFIG = {
    USE_REAL_BACKEND: false,
    API_BASE_URL: '/api',
    SIMULATED_DELAY_MS: 1600
};

export class ResumeAnalyzerService {
    /**
     * Analyzes a resume file with optional job description text.
     * @param {File|Blob|string} file 
     * @param {string} [jobDescription]
     * @param {function} [onProgress] Callback receiving ({ stage, percent, message })
     * @returns {Promise<typeof mockResumeData>}
     */
    static async analyzeResume(file, jobDescription = '', onProgress = null) {
        if (API_CONFIG.USE_REAL_BACKEND) {
            const formData = new FormData();
            formData.append('resume', file);
            if (jobDescription) {
                formData.append('jobDescription', jobDescription);
            }

            const response = await fetch(`${API_CONFIG.API_BASE_URL}/resume/analyze`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        }

        // Realistic Simulated Multi-Stage Async Processing
        const stages = [
            { percent: 20, stage: 'uploading', message: 'Encrypting and transferring resume payload...' },
            { percent: 45, stage: 'parsing', message: 'Extracting UTF-8 text layer and structural headers...' },
            { percent: 70, stage: 'evaluating', message: 'Running ATS parser compliance and tokenizing keywords...' },
            { percent: 90, stage: 'scoring', message: 'Benchmarking against 120,000+ senior engineering profiles...' },
            { percent: 100, stage: 'complete', message: 'AI Diagnostic Report generated successfully!' }
        ];

        for (const step of stages) {
            if (onProgress) {
                onProgress(step);
            }
            // Delay per step for realistic feel
            await new Promise((resolve) => setTimeout(resolve, 380));
        }

        // Deep clone mock data so modifications don't mutate base model
        const customizedResult = JSON.parse(JSON.stringify(mockResumeData));
        
        // If user uploaded a file with a name, adapt the profile name or details
        if (file && file.name) {
            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
            customizedResult.meta = {
                fileName: file.name,
                fileSize: file.size ? `${(file.size / 1024).toFixed(1)} KB` : '420 KB',
                uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                inferredTitle: cleanName
            };
        }

        return customizedResult;
    }

    /**
     * Matches a candidate's resume with a target job description
     * @param {string} jdText 
     * @param {string} [presetKey] 
     */
    static async matchJobDescription(jdText, presetKey = 'stripe') {
        await new Promise((r) => setTimeout(r, 600));

        const preset = sampleJobDescriptions[presetKey] || sampleJobDescriptions.stripe;
        const targetKeywords = preset.requiredKeywords;
        
        const candidateSkills = mockResumeData.detectedSkills.map(s => s.name.toLowerCase());
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
            recommendation: matchScore >= 80 
                ? "Excellent match! Your resume contains the core tech stack requirements for this role."
                : "Moderate match. We strongly recommend embedding the missing keywords into your experience bullets."
        };
    }
}
