
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

    // initialize necessary buttons
    let mainText        = document.getElementById("main_text"),
        descButton      = document.getElementsByClassName("page-description"),
        letsGoButton    = document.getElementById("lets_go"),
        workDescription = document.getElementById("work_description"),
        startButton     = document.getElementById("pause_resume");

    // remove "maximize work output text"
    $(descButton).animate({"opacity": "0"}, 200, function(){
        // remove "get started" button   -- 1.
        $(letsGoButton).animate({"opacity": ""}, 200, function() {
            this.style.display = "none";
            this.style.display = "none";
            // remove "Pomodoro Timer" heading and replace with time
            $("#main_text").animate({"opacity": "0"}, 300, function () {
                this.textContent = "25:00";
            }).animate({"opacity": "1", "bottom": "3rem"}, 300, function() {
                // activate cycles button
                $("#pomodoros_text").css({
                    "display": "block",
                    "bottom": "6rem"
                }).animate({"opacity": "1"}, 100, function () {
                    // activate pomodoro settings button
                    $(".settings").css({
                        "display": "inline-block",
                        "bottom" : "3rem"
                    }).animate({"opacity": "1"}, 100, function () {
                        // display "get work done" above timer
                        $(workDescription).animate({"opacity": "1"}, 300);
                    });
                });
            });
        });
    });

    /*
    let pomodoroArray = [1500, 300, 1500, 300, 1500, 300, 1500, 900]; // default pomodoro "hyperperiod" in seconds
    let counter = 0;
    while (counter > -1) {
        let index = counter % pomodoroArray.length;
        countDown(index);
        counter++;
    } */

    startButton.addEventListener("click", function () {
        renderTime(convertToMinutes(1500-1));
        countDown(1500-2);
    });
}

function renderTime(time) {
    document.getElementById("main_text").textContent = time;
    document.getElementsByTagName("title")[0].textContent = time;
}

// uses JS's setInterval function to imitate seconds going by
function countDown(seconds) {
    let counter = seconds;
    let interval = setInterval(function() {
        renderTime(convertToMinutes(counter));
        if (counter-- === 0) clearInterval(interval);
    }, 1000);
}

// receives a number as input and returns the corresponding minute
function convertToMinutes(seconds) {
    let minuteString = "";

    let minuteVal = seconds / 60;

    if (seconds % 60 === 0){
        minuteString = minuteVal.toString() + ":00";
    } else {
        let minuteStringMinute = minuteVal.toString().split(".")[0];
        let minuteStringSecond = minuteVal.toString().split(".")[1];
        minuteStringSecond = Math.round((parseFloat(("0." + minuteStringSecond)) * 60)).toString();
        if (minuteStringSecond.length === 1) minuteStringSecond = "0" + minuteStringSecond;

        minuteString = minuteStringMinute + ":" + minuteStringSecond;
    }
    return minuteString;
}
