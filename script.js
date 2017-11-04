
document.addEventListener('DOMContentLoaded', function () {
    let letsGoButton = document.getElementById("lets_go");

    letsGoButton.addEventListener("click", function () {
        if (!("Notification" in window)) alert ("This browser does not support notifications :/");
        else if (Notification.permission === "granted") renderPage();
        else if (Notification.permission !== "denied" || Notification.permission === "default") {
            // ask user for permission
            Notification.requestPermission(function(permission) {
                if (permission === "granted") {
                    let notification = new Notification("Great, notifications are activated.");
                    setTimeout(notification.close.bind(notification), 4000);
                    renderPage();
                }
            });
        } else if (Notification.permission === "denied") alert ("This page currently only works with notifications on.");
    });

    let descButton       = document.getElementsByClassName("page-description"),
        workDescription  = document.getElementById("work_description"),
        togglePomodoro = document.getElementById("pause_resume"),
        resetPomodoro = document.getElementById("reset"),
        settingsButton = document.getElementById("general_settings");

    // pomodoro variables
    let pomodoroLength = 1500,
        breakLength = 300,
        longBreakLength = 900;

    let pomodoroArray = [pomodoroLength, breakLength,
        pomodoroLength, breakLength,
        pomodoroLength, breakLength,
        pomodoroLength, longBreakLength];

    let pomodoroArrayIndex = 0;
    let timeLeft = pomodoroArray[pomodoroArrayIndex % pomodoroArray.length];

    // countdown information
    let countdownInterval;
    let isRunning = false,
        initial = true;

    // animations
    function renderPage() {
        // animations
        $(descButton).animate({"opacity": "0"}, 200, function(){
            // remove "get started" button.
            $(letsGoButton).animate({"opacity": ""}, 200, function() {
                this.style.display = "none";
                this.style.display = "none";
                // remove "Pomodoro Timer" heading and replace with time
                $("#main_text").animate({"opacity": "0"}, 300, function () {
                    this.textContent = "25:00";
                }).animate({"opacity": "1", "bottom": "10rem"}, 300, function() {
                    // activate cycles button
                    $("#pomodoros_text").css({
                        "display": "block",
                        "bottom": "13rem"
                    }).animate({"opacity": "1"}, 100, function () {
                        // activate pomodoro settings button
                        $(".settings").css({
                            "display": "inline-block",
                            "bottom" : "10rem"
                        }).animate({"opacity": "1"}, 100);
                    });
                });
            });
        });
    }

    togglePomodoro.addEventListener("click", function () {
        if (!isRunning) {
            $(workDescription).animate({"opacity": "1"}, 300);
            if (timeLeft === pomodoroArray[pomodoroArrayIndex % pomodoroArray.length]) {
                renderTime(convertToMinutes(--timeLeft));
                timeLeft--;
                initial = false;
            }
            changeButtonText(this);
            runPomodoro(true);
            isRunning = true;
        } else {
            changeButtonText(this);
            runPomodoro(false);
            isRunning = false;
        }
    });

    resetPomodoro.addEventListener("click", function () {
        timeLeft = pomodoroArray[pomodoroArrayIndex % pomodoroArray.length];
        renderTime(convertToMinutes(timeLeft));
        if (isRunning) {
            runPomodoro(false);
            isRunning = false;
        }
        togglePomodoro.textContent = "start";
    });

    settingsButton.addEventListener("click", function() {
        // pause the timer
        if (isRunning) {
            runPomodoro(false);
            isRunning = false;
        }
        // open settings box
    });


    function runPomodoro(flag) {
        if (flag) {
            countdownInterval = setInterval(function () {
                renderTime(convertToMinutes(timeLeft));
                if (--timeLeft === 0) {
                    clearInterval(countdownInterval);
                }
            }, 1000)
        } else {
            clearInterval(countdownInterval);
        }
    }

});

// change pause_resume button to apt text
function changeButtonText(button) {
    if (button.textContent === "start") button.textContent = "pause";
    else if (button.textContent === "pause") button.textContent = "resume";
    else if (button.textContent === "resume") button.textContent = "pause";
}
// displays time on title tag and main header
function renderTime(time) {
    document.getElementById("main_text").textContent = time;
    document.getElementsByTagName("title")[0].textContent = time;
}
// receives a number as input and returns the corresponding minute
function convertToMinutes(seconds) {
    let minuteString = "";
    let minuteVal = seconds / 60;
    if (seconds % 60 === 0) minuteString = minuteVal.toString() + ":00";
    else {
        let minuteStringMinute = minuteVal.toString().split(".")[0];
        let minuteStringSecond = minuteVal.toString().split(".")[1];
        minuteStringSecond = Math.round((parseFloat(("0." + minuteStringSecond)) * 60)).toString();
        if (minuteStringSecond.length === 1) minuteStringSecond = "0" + minuteStringSecond;
        minuteString = minuteStringMinute + ":" + minuteStringSecond;
    }
    return minuteString;
}
