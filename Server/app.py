import os
import json
import re
import sqlite3

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from pypdf import PdfReader
from dotenv import load_dotenv
from openai import OpenAI


# =========================================================
# CONFIGURATION
# =========================================================

load_dotenv()

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATABASE = os.path.join(BASE_DIR, "resume_analyzer.db")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

ALLOWED_EXTENSIONS = {"pdf"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# =========================================================
# OPENAI CONFIGURATION
# =========================================================

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if OPENAI_API_KEY:
    client = OpenAI(api_key=OPENAI_API_KEY)
else:
    client = None

# Cost-conscious model suitable for a student project.
# You can change this through .env if required.
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")


# =========================================================
# DATABASE
# =========================================================

def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row

    # Enable foreign key support in SQLite
    connection.execute("PRAGMA foreign_keys = ON")

    return connection


def init_db():

    connection = get_db_connection()
    cursor = connection.cursor()

    # -----------------------------------------------------
    # USERS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # -----------------------------------------------------
    # RESUMES
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            resume_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_path TEXT,
            analysis_score REAL,
            analysis_result TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE
        )
    """)

    # -----------------------------------------------------
    # JOB DESCRIPTIONS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS job_descriptions (
            jd_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            resume_id INTEGER,
            job_description TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE,

            FOREIGN KEY (resume_id)
            REFERENCES resumes(resume_id)
            ON DELETE CASCADE
        )
    """)

    # -----------------------------------------------------
    # ANALYSIS HISTORY
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analysis_history (
            history_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            resume_id INTEGER,
            analysis_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE,

            FOREIGN KEY (resume_id)
            REFERENCES resumes(resume_id)
            ON DELETE CASCADE
        )
    """)

    # -----------------------------------------------------
    # MATCHES
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS matches (
            match_id INTEGER PRIMARY KEY AUTOINCREMENT,
            resume_id INTEGER NOT NULL,
            jd_id INTEGER NOT NULL,
            match_score REAL,
            matched_skills TEXT,
            missing_skills TEXT,
            recommendations TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (resume_id)
            REFERENCES resumes(resume_id)
            ON DELETE CASCADE,

            FOREIGN KEY (jd_id)
            REFERENCES job_descriptions(jd_id)
            ON DELETE CASCADE
        )
    """)

    connection.commit()
    connection.close()


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def allowed_file(filename):

    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def extract_pdf_text(file_path):

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text.strip()


def clean_json_response(text):

    """
    Attempts to convert an LLM response into JSON.
    """

    text = text.strip()

    # Remove markdown code fences if present
    text = re.sub(r"^```json\s*", "", text)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    return json.loads(text)


# =========================================================
# BASIC RESUME INFORMATION
# =========================================================

def extract_email(text):

    match = re.search(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        text
    )

    return match.group(0) if match else ""


def extract_phone(text):

    match = re.search(
        r"(\+?\d[\d\s().-]{8,}\d)",
        text
    )

    return match.group(0).strip() if match else ""


# =========================================================
# OPENAI RESUME ANALYSIS
# =========================================================

def analyze_resume_with_ai(resume_text):

    if not client:
        raise RuntimeError(
            "OPENAI_API_KEY is not configured in the .env file."
        )

    prompt = f"""
You are an AI resume analyzer for a college project.

Analyze the resume text below.

Return ONLY valid JSON.

Do not use markdown.
Do not include explanations outside the JSON.

Required JSON structure:

{{
    "score": 0,
    "name": "",
    "email": "",
    "phone": "",
    "skills": [],
    "education": "",
    "experience": "",
    "projects": "",
    "certifications": [],
    "strengths": [],
    "weaknesses": [],
    "suggestions": [],
    "ats_keywords": []
}}

Rules:

1. score must be a number from 0 to 100.
2. Identify technical and professional skills.
3. Extract education information.
4. Extract work/internship experience.
5. Extract projects.
6. Extract certifications if present.
7. Identify resume strengths.
8. Identify weaknesses.
9. Give practical improvement suggestions.
10. Identify important ATS keywords already present.
11. Do not invent information that is not present in the resume.
12. If a section is missing, return an empty string or empty array.

Resume:

--------------------
{resume_text}
--------------------
"""

    response = client.responses.create(
        model=OPENAI_MODEL,
        input=prompt
    )

    result_text = response.output_text

    return clean_json_response(result_text)


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return jsonify({
        "message": "AI Resume Analyzer API is running",
        "status": "success"
    })


# =========================================================
# REGISTER
# =========================================================

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Invalid JSON data"
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({
            "error": "Name, email and password are required"
        }), 400

    if len(password) < 6:
        return jsonify({
            "error": "Password must contain at least 6 characters"
        }), 400

    password_hash = generate_password_hash(password)

    connection = get_db_connection()

    try:

        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO users
            (name, email, password_hash)
            VALUES (?, ?, ?)
        """, (
            name,
            email,
            password_hash
        ))

        connection.commit()

        user_id = cursor.lastrowid

        return jsonify({
            "message": "Registration successful",
            "user_id": user_id
        }), 201

    except sqlite3.IntegrityError:

        return jsonify({
            "error": "Email already registered"
        }), 409

    finally:

        connection.close()


# =========================================================
# LOGIN
# =========================================================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Invalid JSON data"
        }), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    connection = get_db_connection()

    user = connection.execute("""
        SELECT
            user_id,
            name,
            email,
            password_hash
        FROM users
        WHERE email = ?
    """, (email,)).fetchone()

    connection.close()

    if not user:

        return jsonify({
            "error": "Invalid email or password"
        }), 401

    if not check_password_hash(
        user["password_hash"],
        password
    ):

        return jsonify({
            "error": "Invalid email or password"
        }), 401

    return jsonify({
        "message": "Login successful",
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"]
    })


# =========================================================
# ANALYZE RESUME
# =========================================================

@app.route("/analyze", methods=["POST"])
def analyze():

    if "resume" not in request.files:

        return jsonify({
            "error": "No resume file uploaded"
        }), 400

    resume_file = request.files["resume"]

    if resume_file.filename == "":

        return jsonify({
            "error": "No file selected"
        }), 400

    if not allowed_file(resume_file.filename):

        return jsonify({
            "error": "Only PDF files are supported"
        }), 400

    # Optional user ID from frontend
    user_id = request.form.get("user_id")

    try:

        user_id = int(user_id) if user_id else None

    except ValueError:

        user_id = None

    original_name = secure_filename(resume_file.filename)

    # Create a unique filename
    import uuid

    unique_filename = (
        str(uuid.uuid4()) + "_" + original_name
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        unique_filename
    )

    resume_file.save(file_path)

    try:

        # ---------------------------------------------
        # Extract text from PDF
        # ---------------------------------------------

        resume_text = extract_pdf_text(file_path)

        if not resume_text.strip():

            os.remove(file_path)

            return jsonify({
                "error": "Could not extract text from the PDF"
            }), 400

        # ---------------------------------------------
        # AI ANALYSIS
        # ---------------------------------------------

        analysis = analyze_resume_with_ai(resume_text)

        score = analysis.get("score", 0)

        # ---------------------------------------------
        # Save resume
        # ---------------------------------------------

        connection = get_db_connection()

        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO resumes
            (
                user_id,
                filename,
                original_name,
                file_path,
                analysis_score,
                analysis_result
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            unique_filename,
            original_name,
            file_path,
            score,
            json.dumps(analysis)
        ))

        resume_id = cursor.lastrowid

        # ---------------------------------------------
        # Save analysis history
        # ---------------------------------------------

        cursor.execute("""
            INSERT INTO analysis_history
            (
                user_id,
                resume_id,
                analysis_data
            )
            VALUES (?, ?, ?)
        """, (
            user_id,
            resume_id,
            json.dumps(analysis)
        ))

        connection.commit()
        connection.close()

        # ---------------------------------------------
        # Return result to dashboard
        # ---------------------------------------------

        return jsonify({

            "message": "Resume analyzed successfully",

            "resume_id": resume_id,

            "score": score,

            "name": analysis.get("name", ""),

            "email": analysis.get(
                "email",
                extract_email(resume_text)
            ),

            "phone": analysis.get(
                "phone",
                extract_phone(resume_text)
            ),

            "skills": analysis.get("skills", []),

            "education": analysis.get(
                "education",
                ""
            ),

            "experience": analysis.get(
                "experience",
                ""
            ),

            "projects": analysis.get(
                "projects",
                ""
            ),

            "certifications": analysis.get(
                "certifications",
                []
            ),

            "strengths": analysis.get(
                "strengths",
                []
            ),

            "weaknesses": analysis.get(
                "weaknesses",
                []
            ),

            "suggestions": analysis.get(
                "suggestions",
                []
            ),

            "ats_keywords": analysis.get(
                "ats_keywords",
                []
            )

        })

    except Exception as error:

        print("Resume analysis error:", error)

        if os.path.exists(file_path):

            os.remove(file_path)

        return jsonify({
            "error": "Resume analysis failed. Please try again."
        }), 500


# =========================================================
# GET RESUMES
# =========================================================

@app.route("/resumes", methods=["GET"])
def get_resumes():

    user_id = request.args.get("user_id")

    connection = get_db_connection()

    if user_id:

        try:
            user_id = int(user_id)
        except ValueError:
            connection.close()

            return jsonify({
                "error": "Invalid user ID"
            }), 400

        rows = connection.execute("""
            SELECT
                resume_id,
                user_id,
                original_name,
                analysis_score,
                created_at
            FROM resumes
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,)).fetchall()

    else:

        rows = connection.execute("""
            SELECT
                resume_id,
                user_id,
                original_name,
                analysis_score,
                created_at
            FROM resumes
            ORDER BY created_at DESC
        """).fetchall()

    connection.close()

    resumes = [
        dict(row)
        for row in rows
    ]

    return jsonify({
        "resumes": resumes
    })


# =========================================================
# JOB DESCRIPTION
# =========================================================

@app.route("/job-description", methods=["POST"])
def save_job_description():

    data = request.get_json(silent=True)

    if not data:

        return jsonify({
            "error": "Invalid JSON data"
        }), 400

    job_description = data.get(
        "job_description",
        ""
    ).strip()

    user_id = data.get("user_id")
    resume_id = data.get("resume_id")

    if not job_description:

        return jsonify({
            "error": "Job description is required"
        }), 400

    connection = get_db_connection()

    try:

        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO job_descriptions
            (
                user_id,
                resume_id,
                job_description
            )
            VALUES (?, ?, ?)
        """, (
            user_id,
            resume_id,
            job_description
        ))

        connection.commit()

        jd_id = cursor.lastrowid

        return jsonify({
            "message": "Job description saved",
            "jd_id": jd_id
        }), 201

    finally:

        connection.close()


# =========================================================
# MATCH RESUME WITH JOB DESCRIPTION USING OPENAI
# =========================================================

@app.route("/match-resume", methods=["POST"])
def match_resume():

    data = request.get_json(silent=True)

    if not data:

        return jsonify({
            "error": "Invalid JSON data"
        }), 400

    resume_id = data.get("resume_id")
    job_description = data.get(
        "job_description",
        ""
    ).strip()

    if not resume_id or not job_description:

        return jsonify({
            "error": "resume_id and job_description are required"
        }), 400

    connection = get_db_connection()

    resume = connection.execute("""
        SELECT *
        FROM resumes
        WHERE resume_id = ?
    """, (resume_id,)).fetchone()

    if not resume:

        connection.close()

        return jsonify({
            "error": "Resume not found"
        }), 404

    # Get complete analysis
    try:

        analysis = json.loads(
            resume["analysis_result"]
        )

    except Exception:

        analysis = {}

    skills = analysis.get(
        "skills",
        []
    )

    resume_summary = resume["analysis_result"]

    connection.close()

    # -----------------------------------------------------
    # OpenAI matching
    # -----------------------------------------------------

    if not client:

        return jsonify({
            "error": "OPENAI_API_KEY is not configured"
        }), 500

    prompt = f"""
You are an AI resume-job matching system.

Compare the resume analysis with the job description.

Return ONLY valid JSON.

Required format:

{{
    "match_score": 0,
    "matched_skills": [],
    "missing_skills": [],
    "recommendations": []
}}

Rules:

1. match_score must be between 0 and 100.
2. Identify skills that are present in the resume and relevant to the job.
3. Identify important skills required by the job but missing from the resume.
4. Give practical recommendations.
5. Do not invent resume information.
6. Base the comparison on the supplied resume analysis and job description.

Resume Analysis:
----------------
{resume_summary}
----------------

Job Description:
----------------
{job_description}
----------------
"""

    try:

        response = client.responses.create(
            model=OPENAI_MODEL,
            input=prompt
        )

        match_result = clean_json_response(
            response.output_text
        )

    except Exception as error:

        print("OpenAI matching error:", error)

        return jsonify({
            "error": "AI matching failed"
        }), 500

    # -----------------------------------------------------
    # Save match
    # -----------------------------------------------------

    connection = get_db_connection()

    cursor = connection.cursor()

    # Save job description
    cursor.execute("""
        INSERT INTO job_descriptions
        (
            resume_id,
            job_description
        )
        VALUES (?, ?)
    """, (
        resume_id,
        job_description
    ))

    jd_id = cursor.lastrowid

    # Save match result
    cursor.execute("""
        INSERT INTO matches
        (
            resume_id,
            jd_id,
            match_score,
            matched_skills,
            missing_skills,
            recommendations
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        resume_id,
        jd_id,
        match_result.get("match_score", 0),
        json.dumps(
            match_result.get(
                "matched_skills",
                []
            )
        ),
        json.dumps(
            match_result.get(
                "missing_skills",
                []
            )
        ),
        json.dumps(
            match_result.get(
                "recommendations",
                []
            )
        )
    ))

    connection.commit()

    match_id = cursor.lastrowid

    connection.close()

    return jsonify({

        "message": "Resume matched successfully",

        "match_id": match_id,

        "match_score": match_result.get(
            "match_score",
            0
        ),

        "matched_skills": match_result.get(
            "matched_skills",
            []
        ),

        "missing_skills": match_result.get(
            "missing_skills",
            []
        ),

        "recommendations": match_result.get(
            "recommendations",
            []
        )

    })


# =========================================================
# ANALYSIS HISTORY
# =========================================================

@app.route("/history/<int:user_id>", methods=["GET"])
def get_history(user_id):

    connection = get_db_connection()

    rows = connection.execute("""
        SELECT
            h.history_id,
            h.resume_id,
            h.analysis_data,
            h.created_at,
            r.original_name,
            r.analysis_score
        FROM analysis_history h
        LEFT JOIN resumes r
            ON h.resume_id = r.resume_id
        WHERE h.user_id = ?
        ORDER BY h.created_at DESC
    """, (user_id,)).fetchall()

    connection.close()

    history = []

    for row in rows:

        item = dict(row)

        try:
            item["analysis_data"] = json.loads(
                item["analysis_data"]
            )
        except Exception:
            pass

        history.append(item)

    return jsonify({
        "history": history
    })


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "running",
        "database": "SQLite",
        "ai": "OpenAI API" if client else "Not configured"
    })


# =========================================================
# START APPLICATION
# =========================================================

if __name__ == "__main__":

    init_db()

    print("=" * 55)
    print("AI RESUME ANALYZER")
    print("=" * 55)

    print("Database:", DATABASE)

    if client:
        print("OpenAI API: Configured")
    else:
        print("OpenAI API: NOT CONFIGURED")

    print("Server: http://127.0.0.1:5000")

    print("=" * 55)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )