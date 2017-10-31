
document.addEventListener('DOMContentLoaded', pomodoroLandingPage);

// clicking on lets-go button launches the pomodoro
function pomodoroLandingPage() {
    let letsGoButton = document.getElementsByClassName("lets-go");
    Array.from(letsGoButton).forEach(function(element) {
        element.addEventListener("click", notificationPermission);
    });
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
    // ask for permission to allow notifications
    // alert("notification should close in 4 seconds");
    let mainText = document.getElementById("main_text");

}