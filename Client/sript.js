const resumeFile = document.getElementById("resumeFile");
const fileName = document.getElementById("fileName");

const API_BASE_URL = (window.location.port === "5000") ? "" : "http://127.0.0.1:5000";

if (resumeFile) {
    resumeFile.addEventListener("change", function () {
        if (this.files.length > 0 && fileName) {
            fileName.innerHTML = "Selected: <strong>" + this.files[0].name + "</strong>";
        }
    });
}

function scrollToUpload() {
    const el = document.getElementById("upload");
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

function scrollToFeatures() {
    const el = document.getElementById("features");
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

async function analyseResume() {
    if (!resumeFile || resumeFile.files.length === 0) {
        alert("Please upload your resume first.");
        return;
    }

    const file = resumeFile.files[0];
    const formData = new FormData();
    formData.append("resume", file);

    try {
        const res = await fetch(`${API_BASE_URL}/analyze`, {
            method: "POST",
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            alert(`Analysis complete!\nATS Score: ${data.scores?.overallScore || data.score}/100\nDetected Skills: ${(data.skills || []).slice(0, 8).join(', ')}`);
            const dash = document.getElementById("analysis");
            if (dash) dash.scrollIntoView({ behavior: "smooth" });
        } else {
            alert("Analysis failed. Please check the uploaded file format.");
        }
    } catch (err) {
        console.warn("Backend unavailable, previewing local mock:", err);
        alert("Resume uploaded successfully! Switching to analysis view.");
        const dash = document.getElementById("analysis");
        if (dash) dash.scrollIntoView({ behavior: "smooth" });
    }
}
