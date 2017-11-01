
document.addEventListener('DOMContentLoaded', pomodoroLandingPage);

// clicking on lets-go button launches the pomodoro
function pomodoroLandingPage() {
    let letsGoButton = document.getElementById("lets_go");
    letsGoButton.addEventListener("click", notificationPermission);
}

function notificationPermission() {
    if (!("Notification" in window)) { // browser doesn't support notifications
        alert("This browser does not support desktop notifications :/");
    }
    else if (Notification.permission === "granted") { // user already granted permissions
        pomodoroMain();
    }
    else if (Notification.permission !== "denied" || Notification.permission === "default") {
        // ask user for permission
        Notification.requestPermission(function(permission) {
            if (permission === "granted") {
                let notification = new Notification("Great, notifications are activated.");
                setTimeout(notification.close.bind(notification), 4000);
                pomodoroMain();
            }
        });
    }
    else if (Notification.permission === "denied") alert("This page currently only works with notifications.");
}

function pomodoroMain() {

    // retrieve necessary buttons
    let descButton            = document.getElementsByClassName("page-description"),
        letsGoButton    = document.getElementById("lets_go"),
        workDescription = document.getElementById("work_description"),
        pauseButton     = document.getElementById("pause_resume"),
        resetButton     = document.getElementById("reset");

    // remove main heading description
    Array.from(descButton).forEach(function(el) {
        $(el).animate({"opacity": "0.1"}, 400, function(){
            this.style.display = "none";
        });
    });

    $(letsGoButton).animate({"opacity": ""}, 350, function() {
        this.style.display = "none";
    });

    // remove "Pomodoro Timer" heading and replace with time
    $("#main_text").animate({"opacity": "0"}, 400, function () {
        this.textContent = "25:00";
    }).animate({"opacity": "1", "bottom": "3rem"}, 400);

    // display "get work done" above timer
    $(workDescription).animate({"opacity": "1"}, 1000);

    // activate pomodoro settings button
    $(".settings").css({
        "display": "inline-block",
        "bottom" : "3rem"
    }).animate({"opacity": "1"}, 500);


}
