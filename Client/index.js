const fileInput = document.getElementById("resumeFile");
const fileName = document.getElementById("fileName");

fileInput.addEventListener("change", function () {

    if (this.files.length > 0) {
        fileName.innerText =
            "Selected file: " + this.files[0].name;
    }

});


function analyseResume() {

    if (fileInput.files.length === 0) {

        alert("Please upload your resume first.");

        return;
    }

    alert("Resume uploaded successfully! AI analysis will start.");

    document.getElementById("analysis").scrollIntoView({
        behavior: "smooth"
    });
}