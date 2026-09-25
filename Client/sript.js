```javascript
const resumeFile = document.getElementById("resumeFile");
const fileName = document.getElementById("fileName");


resumeFile.addEventListener("change", function () {

    if (this.files.length > 0) {

        fileName.innerHTML =
            "Selected: <strong>" +
            this.files[0].name +
            "</strong>";

    }

});


function scrollToUpload() {

    document.getElementById("upload").scrollIntoView({
        behavior: "smooth"
    });

}


function scrollToFeatures() {

    document.getElementById("features").scrollIntoView({
        behavior: "smooth"
    });

}


function analyseResume() {

    if (resumeFile.files.length === 0) {

        alert("Please upload your resume first.");

        return;
    }

    alert(
        "Resume uploaded successfully! " +
        "AI analysis will be connected to the backend."
    );

}
```
