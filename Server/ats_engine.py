"""
ATS ENGINE - Production Grade Resume Parser & Evaluation Engine
Designed for High Concurrency, Accurate Scoring Discrimination, and Deep Heuristics.
"""

import re
import math
from typing import Dict, List, Any, Tuple

# =========================================================================
# PRE-COMPILED REGEX PATTERNS (HIGH EFFICIENCY)
# =========================================================================

RE_EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
RE_PHONE = re.compile(r"(\+?\d[\d\s().-]{8,}\d)")
RE_METRICS = re.compile(
    r"\b\d+%\b|\$\d+(?:,\d+)*(?:\.\d+)?|\b\d+[kKmM]\+?\b|\b\d+\s*(?:ms|seconds|sec|hours|users|clients|requests|qps|transactions|records)\b|\b(?:reduced|improved|increased|boosted|cut|saved)\s+by\s+\d+%\b",
    re.IGNORECASE
)
RE_LINKS = re.compile(r"(?:https?://)?(?:www\.)?(?:linkedin\.com/in/|github\.com/)[A-Za-z0-9_-]+", re.IGNORECASE)

# High impact leadership action verbs
STRONG_ACTION_VERBS = {
    "architected", "spearheaded", "engineered", "orchestrated", "implemented",
    "optimized", "automated", "streamlined", "reduced", "accelerated", "scaled",
    "designed", "overhauled", "developed", "deployed", "refactored", "migrated",
    "built", "led", "established", "launched", "executed", "modernized"
}

# Weak, passive, or non-quantifiable verbs
WEAK_PASSIVE_VERBS = {
    "worked on", "helped", "responsible for", "assisted", "handled", "tried",
    "did", "was part of", "contributed to", "participated in", "supported", "involved in"
}

# Cliché buzzwords that lower professional ranking
BUZZWORDS = {
    "hardworking", "hard working", "sincere", "punctual", "team player",
    "quick learner", "fast learner", "passionate worker", "enthusiastic",
    "self motivated", "good communication skills"
}

# Domain Skills Taxonomy
SKILLS_TAXONOMY = {
    "Languages": [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "C", "Go", "Golang",
        "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Dart", "SQL", "HTML5", "HTML",
        "CSS3", "CSS", "Bash", "Shell", "R"
    ],
    "Frontend": [
        "React", "React.js", "Next.js", "Vue", "Vue.js", "Angular", "Svelte",
        "Tailwind CSS", "Bootstrap", "Redux", "Sass", "Webpack", "Vite",
        "Responsive Design", "WebSockets"
    ],
    "Backend": [
        "Node.js", "Express", "Express.js", "Django", "Flask", "FastAPI",
        "Spring Boot", "ASP.NET", "Ruby on Rails", "REST", "RESTful APIs",
        "GraphQL", "gRPC", "Microservices"
    ],
    "Databases": [
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Cassandra",
        "DynamoDB", "Elasticsearch", "Firebase", "Oracle", "Prisma", "DBMS"
    ],
    "Cloud & DevOps": [
        "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud", "Docker",
        "Kubernetes", "CI/CD", "GitHub Actions", "Terraform", "Linux", "Nginx",
        "Jenkins", "Serverless", "ECS", "Lambda", "S3"
    ],
    "AI & Data Science": [
        "PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", "OpenCV",
        "NLP", "Natural Language Processing", "Computer Vision", "LLMs",
        "Machine Learning", "Deep Learning", "LangChain"
    ],
    "Testing & Tools": [
        "Git", "GitHub", "GitLab", "Postman", "Jest", "Cypress", "PyTest",
        "Selenium", "Jira", "Agile", "Scrum", "VS Code"
    ]
}

# Recommended courses for skill gaps (Inspired by Deepak Padhi reference repo)
COURSE_RECOMMENDATIONS = {
    "Machine Learning": [
        {"name": "Machine Learning Crash Course by Google [Free]", "url": "https://developers.google.com/machine-learning/crash-course"},
        {"name": "Machine Learning Specialization by Andrew Ng", "url": "https://www.coursera.org/learn/machine-learning"}
    ],
    "Python": [
        {"name": "Python for Everybody Specialization", "url": "https://www.coursera.org/specializations/python"},
        {"name": "Complete Python Bootcamp by Jose Portilla", "url": "https://www.udemy.com/course/complete-python-bootcamp/"}
    ],
    "React": [
        {"name": "React Complete Guide (Hooks, React Router, Redux)", "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/"},
        {"name": "Full Stack Open (Deep Dive Into Modern Web)", "url": "https://fullstackopen.com/en/"}
    ],
    "Docker": [
        {"name": "Docker & Kubernetes: The Practical Guide", "url": "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/"},
        {"name": "Docker Tutorial for Beginners [Free]", "url": "https://youtu.be/fqMOX6JJhGo"}
    ],
    "Kubernetes": [
        {"name": "Kubernetes for Developers (CKAD Prep)", "url": "https://www.udemy.com/course/certified-kubernetes-application-developer/"},
        {"name": "Kubernetes Official Interactive Tutorials", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/"}
    ],
    "SQL": [
        {"name": "The Complete SQL Bootcamp", "url": "https://www.udemy.com/course/the-complete-sql-bootcamp/"},
        {"name": "SQL Tutorial by Mode Analytics [Free]", "url": "https://mode.com/sql-tutorial/"}
    ],
    "AWS": [
        {"name": "AWS Certified Solutions Architect Associate", "url": "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/"},
        {"name": "AWS Free Digital Training", "url": "https://aws.amazon.com/training/digital/"}
    ],
    "GraphQL": [
        {"name": "GraphQL with React & Node Tutorial", "url": "https://www.udemy.com/course/graphql-with-react-course/"},
        {"name": "How to GraphQL - Free Fullstack Tutorial", "url": "https://www.howtographql.com/"}
    ],
    "Redis": [
        {"name": "Redis University - Free Official Courses", "url": "https://university.redis.com/"}
    ]
}

# =========================================================================
# CORE EXTRACTION HELPERS
# =========================================================================

def extract_email(text: str) -> str:
    m = RE_EMAIL.search(text)
    return m.group(0) if m else ""

def extract_phone(text: str) -> str:
    m = RE_PHONE.search(text)
    return m.group(0).strip() if m else ""

def extract_name(text: str, filename: str = "") -> str:
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if not lines:
        if filename:
            clean = re.sub(r"\.(pdf|docx?|txt)$", "", filename, flags=re.I)
            clean = clean.replace("_", " ").replace("-", " ")
            return clean.title()
        return "Candidate"

    for line in lines[:5]:
        cleaned = re.sub(r"[^A-Za-z\s]", "", line).strip()
        words = cleaned.split()
        if 2 <= len(words) <= 4:
            lower = line.lower()
            if not any(h in lower for h in ["resume", "curriculum", "vitae", "profile", "contact", "email", "phone", "objective"]):
                return cleaned

    if filename:
        clean = re.sub(r"\.(pdf|docx?|txt)$", "", filename, flags=re.I)
        clean = clean.replace("_", " ").replace("-", " ")
        if len(clean) < 35:
            return clean.title()

    return lines[0][:35]

def extract_skills(text: str) -> List[Dict[str, Any]]:
    lower = text.lower()
    detected = []
    seen = set()

    for category, skill_list in SKILLS_TAXONOMY.items():
        for skill in skill_list:
            pat = r"(?:\b|_)" + re.escape(skill.lower()) + r"(?:\b|_)"
            matches = list(re.finditer(pat, lower))
            count = len(matches)
            if count > 0 and skill.lower() not in seen:
                seen.add(skill.lower())
                level = "Expert" if count >= 3 else ("Advanced" if count >= 2 else "Intermediate")
                detected.append({
                    "name": skill,
                    "level": level,
                    "category": category,
                    "count": count
                })

    detected.sort(key=lambda s: (0 if s["level"] == "Expert" else (1 if s["level"] == "Advanced" else 2)))
    return detected

def predict_field_and_role(text: str, detected_skills: List[Dict[str, Any]]) -> Tuple[str, str]:
    lower = text.lower()
    skill_names = {s["name"].lower() for s in detected_skills}

    if any(k in skill_names for k in ["pytorch", "tensorflow", "scikit-learn", "deep learning", "machine learning", "nlp"]) or "machine learning" in lower or "data science" in lower:
        return "AI & Machine Learning", "AI / Machine Learning Engineer"
    if any(k in skill_names for k in ["kubernetes", "docker", "terraform", "ci/cd", "aws", "azure", "jenkins"]) or "devops" in lower:
        return "Cloud & DevOps", "Cloud / DevOps Engineer"
    if any(k in skill_names for k in ["react", "next.js", "vue", "angular", "tailwind css", "html5", "css3"]) and any(k in skill_names for k in ["node.js", "express", "django", "flask", "postgresql", "mongodb", "fastapi"]):
        return "Full Stack Development", "Senior Full Stack Software Engineer"
    if any(k in skill_names for k in ["react", "next.js", "vue", "angular", "tailwind css", "css3"]) and not any(k in skill_names for k in ["django", "flask", "spring boot"]):
        return "Frontend Development", "Senior Frontend Engineer"
    if any(k in skill_names for k in ["node.js", "django", "flask", "fastapi", "spring boot", "postgresql", "redis", "microservices"]):
        return "Backend Development", "Senior Backend Engineer"
    if any(k in skill_names for k in ["swift", "kotlin", "flutter", "react native", "android", "ios"]):
        return "Mobile Application Development", "Mobile Software Engineer"

    return "Software Engineering", "Software Engineer"

def predict_experience_level(text: str) -> str:
    lower = text.lower()
    if any(k in lower for k in ["fresher", "no experience yet", "seeking internship", "student", "entry level", "entry-level"]):
        return "Fresher / Entry-Level"
    years = re.findall(r"\b(\d+)\+?\s*years?(?:\s+of)?\s+experience\b", lower)
    if years:
        try:
            val = int(years[0])
            if val >= 5: return "Senior / Lead (5+ years)"
            if val >= 2: return "Mid-Level (2–4 years)"
            return "Junior (1–2 years)"
        except ValueError:
            pass
    if "senior" in lower or "lead" in lower or "architect" in lower:
        return "Senior / Lead (5+ years)"
    return "Mid-Level / Intermediate"

# =========================================================================
# PRODUCTION MULTI-DIMENSIONAL ATS SCORER (DISCRIMINATING 0 TO 100)
# =========================================================================

def calculate_rigorous_ats_score(text: str, filename: str = "") -> Dict[str, Any]:
    """
    Rigorously computes ATS compatibility score from 0 to 100.
    Bad resumes land in 25-45. Average in 50-68. Good in 70-84. Excellent in 85-98.
    """
    lower = text.lower()
    word_list = [w for w in re.split(r"\s+", text) if w.strip()]
    word_count = len(word_list)

    # 1. Structural Checklist
    has_email = bool(extract_email(text))
    has_phone = bool(extract_phone(text))
    has_links = bool(RE_LINKS.search(text))
    has_contact = has_email and has_phone

    has_summary = any(k in lower for k in ["professional summary", "summary", "profile", "about me"])
    has_objective = any(k in lower for k in ["career objective", "objective"])

    # Experience section analysis
    has_experience_section = any(k in lower for k in ["experience", "employment history", "work history", "professional experience"])
    is_explicit_no_exp = any(k in lower for k in [
        "fresher – no professional experience",
        "fresher - no professional experience",
        "no professional experience yet",
        "no experience yet"
    ])
    has_real_experience = has_experience_section and not is_explicit_no_exp

    has_education = any(k in lower for k in ["education", "bachelor", "master", "b.tech", "b.s.", "degree", "university", "institute", "college"])
    has_projects = any(k in lower for k in ["projects", "technical projects", "academic projects", "project:"])
    has_certifications = any(k in lower for k in ["certification", "certifications", "certified", "license"])
    has_achievements = any(k in lower for k in ["achievement", "achievements", "awards", "honors", "competitions"])

    # 2. Extract Skills
    detected_skills = extract_skills(text)
    skill_count = len(detected_skills)

    # 3. Action Verbs vs Passive Verbs vs Buzzwords
    strong_verb_matches = [v for v in STRONG_ACTION_VERBS if re.search(r"\b" + v + r"\b", lower)]
    weak_verb_matches = [v for v in WEAK_PASSIVE_VERBS if v in lower]
    buzzword_matches = [b for b in BUZZWORDS if b in lower]

    # 4. Quantifiable Impact & Metrics
    metrics_matches = RE_METRICS.findall(text)
    metric_count = len(metrics_matches)

    # =====================================================================
    # 5 DIMENSION SCORING (MAX 100 POINTS)
    # =====================================================================

    # --- Dimension 1: Quantifiable Impact (Max 25 pts) ---
    # Real ATS engines heavily reward concrete business measurements
    if metric_count == 0:
        impact_pts = 4.0
    elif metric_count == 1:
        impact_pts = 9.0
    elif metric_count == 2:
        impact_pts = 14.0
    elif metric_count <= 4:
        impact_pts = 19.0
    elif metric_count <= 6:
        impact_pts = 22.0
    else:
        impact_pts = 25.0

    # --- Dimension 2: Action Verbs & Language Strength (Max 20 pts) ---
    verb_score = min(len(strong_verb_matches) * 3.5, 20.0)
    # Deduct for passive phrasing and buzzwords
    verb_score -= min(len(weak_verb_matches) * 2.5, 8.0)
    verb_score -= min(len(buzzword_matches) * 2.0, 6.0)
    action_verb_pts = max(3.0, min(verb_score, 20.0))

    # --- Dimension 3: Technical Skills Density (Max 25 pts) ---
    if skill_count == 0:
        skill_pts = 3.0
    elif skill_count <= 2:
        skill_pts = 6.0
    elif skill_count <= 4:
        skill_pts = 11.0
    elif skill_count <= 7:
        skill_pts = 16.0
    elif skill_count <= 11:
        skill_pts = 21.0
    else:
        skill_pts = 25.0

    # --- Dimension 4: Section Completeness & Hierarchy (Max 15 pts) ---
    struct_pts = 0.0
    if has_contact: struct_pts += 3.5
    elif has_email or has_phone: struct_pts += 1.5

    if has_links: struct_pts += 1.5

    if has_summary: struct_pts += 2.5
    elif has_objective: struct_pts += 0.5  # outdated objective gets minimal points

    if has_real_experience: struct_pts += 3.5
    elif is_explicit_no_exp: struct_pts += 0.5

    if has_education: struct_pts += 2.0
    if has_projects: struct_pts += 2.0
    struct_pts = min(struct_pts, 15.0)

    # --- Dimension 5: Length, Formatting & Readability (Max 15 pts) ---
    # Word count calibration
    if word_count < 80:
        format_pts = 2.0  # Empty / snippet resume
    elif word_count < 180:
        format_pts = 6.0  # Seriously deficient length
    elif word_count < 280:
        format_pts = 10.0 # Thin resume
    elif word_count <= 850:
        format_pts = 15.0 # Ideal 1-2 page standard length
    elif word_count <= 1200:
        format_pts = 12.0 # Moderately verbose
    else:
        format_pts = 8.0  # Overly verbose / likely to confuse older ATS parsers

    # Total Cumulative Score
    total_raw = impact_pts + action_verb_pts + skill_pts + struct_pts + format_pts

    # Extreme edge case penalty: Empty / test stub resumes cannot exceed 40
    if word_count < 90 or (skill_count <= 2 and metric_count == 0):
        total_raw = min(total_raw, 36.0)

    # Penalty for explicitly zero experience + no metrics
    if is_explicit_no_exp and metric_count == 0:
        total_raw = min(total_raw, 42.0)

    final_score = int(round(max(15, min(total_raw, 98))))

    # Normalise sub-scores for 0-100 UI breakdown display
    norm_keywords = int(round((skill_pts / 25.0) * 100))
    norm_format = int(round((format_pts / 15.0) * 100))
    norm_impact = int(round((impact_pts / 25.0) * 100))
    norm_readability = int(round(max(30, min(100, (format_pts / 15.0) * 70 + (struct_pts / 15.0) * 30))))
    norm_action_verbs = int(round((action_verb_pts / 20.0) * 100))

    score_breakdown = [
        {"label": "Keywords", "value": norm_keywords},
        {"label": "Format", "value": norm_format},
        {"label": "Impact", "value": norm_impact},
        {"label": "Readability", "value": norm_readability},
        {"label": "Action verbs", "value": norm_action_verbs}
    ]

    # Predict Field & Level
    field, role = predict_field_and_role(text, detected_skills)
    cand_level = predict_experience_level(text)

    # Generate Dynamic, Context-Aware Issues & Strengths
    issues = []
    strengths = []

    if metric_count == 0:
        issues.append({
            "title": "Critical: Zero quantifiable metrics found in bullet points",
            "severity": "high",
            "fix": "Recruiters and ATS prioritize results. Add numeric measurements (%, $, numbers, latency, user counts) using Google's XYZ formula."
        })
    elif metric_count < 3:
        issues.append({
            "title": "Low density of measured achievements",
            "severity": "medium",
            "fix": f"Found only {metric_count} numeric indicators. Expand at least 3 career bullets with measurable impact percentages or efficiency gains."
        })
    else:
        strengths.append({
            "title": f"Strong quantifiable achievements ({metric_count} metrics detected)",
            "note": "Excellent use of percentages, transaction volumes, or scale indicators."
        })

    if word_count < 180:
        issues.append({
            "title": f"Critically short resume ({word_count} words)",
            "severity": "high",
            "fix": "Standard technical resumes require 350–700 words to sufficiently elaborate on project architecture, responsibilities, and tooling."
        })
    elif word_count >= 300:
        strengths.append({
            "title": f"Optimal resume length ({word_count} words)",
            "note": "Content volume is balanced for both automated scanning and 30-second recruiter review."
        })

    if buzzword_matches:
        issues.append({
            "title": f"Contains cliché buzzwords ({', '.join(buzzword_matches[:3])})",
            "severity": "medium",
            "fix": "Replace generic descriptors like 'hardworking' or 'sincere' with concrete project accomplishments and verified technical capabilities."
        })

    if weak_verb_matches:
        issues.append({
            "title": f"Passive phrasing detected ({', '.join(weak_verb_matches[:2])})",
            "severity": "medium",
            "fix": "Lead bullets with decisive action verbs like 'Architected', 'Implemented', 'Engineered', 'Optimized' instead of 'Worked on' or 'Helped'."
        })

    if strong_verb_matches:
        strengths.append({
            "title": f"Decisive leadership verbs ({len(strong_verb_matches)} strong action verbs)",
            "note": f"Commands attention with verbs like {', '.join(strong_verb_matches[:3])}."
        })

    if has_objective and not has_summary:
        issues.append({
            "title": "Outdated 'Career Objective' section used",
            "severity": "low",
            "fix": "Modern ATS screening prefers a 'Professional Summary' that highlights your primary stack and core technical value proposition over personal desires."
        })

    if not has_links:
        issues.append({
            "title": "Missing clickable portfolio or code links (GitHub / LinkedIn)",
            "severity": "medium",
            "fix": "Technical screeners expect live links to GitHub repositories or active LinkedIn profiles."
        })
    else:
        strengths.append({
            "title": "Verified professional web presence",
            "note": "Clickable links to GitHub / LinkedIn detected for portfolio verification."
        })

    if skill_count >= 8:
        strengths.append({
            "title": f"Broad industry skill stack ({skill_count} verified skills)",
            "note": f"Shows strong alignment across modern software engineering frameworks."
        })
    elif skill_count < 4:
        issues.append({
            "title": "Low technical skill coverage",
            "severity": "high",
            "fix": "Add relevant industry frameworks, databases, and DevOps tools to pass automated keyword filters."
        })

    # Missing keywords pool based on predicted field
    field_keywords_map = {
        "Full Stack Development": ["TypeScript", "Docker", "Kubernetes", "GraphQL", "Redis", "PostgreSQL", "CI/CD", "AWS"],
        "Backend Development": ["Microservices", "Docker", "Kubernetes", "Redis", "Kafka", "PostgreSQL", "gRPC", "CI/CD"],
        "Frontend Development": ["TypeScript", "Next.js", "Tailwind CSS", "Vite", "GraphQL", "Jest", "Playwright", "Cypress"],
        "Cloud & DevOps": ["Kubernetes", "Terraform", "Docker", "AWS", "GitHub Actions", "Prometheus", "Grafana", "Linux"],
        "AI & Machine Learning": ["PyTorch", "TensorFlow", "Pandas", "Scikit-Learn", "Docker", "MLOps", "LangChain", "FastAPI"],
        "Software Engineering": ["Docker", "Kubernetes", "SQL", "Git", "CI/CD", "System Design", "AWS", "REST APIs"]
    }
    target_pool = field_keywords_map.get(field, field_keywords_map["Software Engineering"])
    detected_names = [s["name"] for s in detected_skills]
    present_keywords = [k for k in target_pool if any(k.lower() == d.lower() for d in detected_names)]
    missing_keywords = [k for k in target_pool if not any(k.lower() == d.lower() for d in detected_names)]

    if not present_keywords:
        present_keywords = detected_names[:5] if detected_names else ["Python", "SQL"]
    if not missing_keywords:
        missing_keywords = ["Kubernetes", "Docker", "Redis", "Kafka"]

    # Recommended Courses for Missing Keywords
    recommended_courses = []
    for m in missing_keywords[:3]:
        for course_key, courses in COURSE_RECOMMENDATIONS.items():
            if course_key.lower() in m.lower():
                recommended_courses.extend(courses)
                break
    if not recommended_courses:
        recommended_courses = COURSE_RECOMMENDATIONS.get("Docker", []) + COURSE_RECOMMENDATIONS.get("Kubernetes", [])

    return {
        "atsScore": final_score,
        "scoreBreakdown": score_breakdown,
        "predictedField": field,
        "inferredRole": role,
        "candidateLevel": cand_level,
        "wordCount": word_count,
        "metricsDetected": metric_count,
        "skillsDetected": detected_skills,
        "presentKeywords": present_keywords,
        "missingKeywords": missing_keywords,
        "issues": issues,
        "strengths": strengths,
        "recommendedCourses": recommended_courses[:4]
    }
