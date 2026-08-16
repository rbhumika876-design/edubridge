// Welcome Message
let email = localStorage.getItem("userEmail") || "Student";
document.getElementById("userName").innerHTML = "Welcome, " + email;

// Dashboard Cards
document.getElementById("videos").innerText =
localStorage.getItem("videosCompleted") || 0;

document.getElementById("tests").innerText =
localStorage.getItem("testsTaken") || 0;

document.getElementById("average").innerText =
(localStorage.getItem("averageScore") || 0) + "%";

// Progress Bar
let progress = parseInt(localStorage.getItem("overallProgress")) || 40;

document.getElementById("progressBar").value = progress;
document.getElementById("progressText").innerText = progress + "%";

// Change Progress Bar Color
if (progress >= 80) {
    document.getElementById("progressText").style.color = "green";
} else if (progress >= 50) {
    document.getElementById("progressText").style.color = "orange";
} else {
    document.getElementById("progressText").style.color = "red";
}

// Performance Chart
const ctx = document.getElementById("performanceChart");

new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["Videos", "Tests", "Average"],
        datasets: [{
            label: "Student Performance",
            data: [
                parseInt(localStorage.getItem("videosCompleted")) || 0,
                parseInt(localStorage.getItem("testsTaken")) || 0,
                parseInt(localStorage.getItem("averageScore")) || 0
            ]
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});