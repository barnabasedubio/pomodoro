
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

    let descriptionText    = document.getElementsByClassName("page-description"),
        pomodoroSettings   = document.getElementsByClassName("settings"),
        plusButton         = document.getElementsByClassName("plus-button"),
        minusButton        = document.getElementsByClassName("minus-button"),

        workDescription    = document.getElementById("work_description"),
        togglePomodoro     = document.getElementById("pause_resume"),
        resetPomodoro      = document.getElementById("reset"),
        settingsButton     = document.getElementById("general_settings"),
        settingsBox        = document.getElementById("pomodoro_settings"),
        okayButton         = document.getElementById("okay");


    // pomodoro variables
    let pomodoroLength = 15,
        shortBreakLength = 3,
        longBreakLength = 9,
        currentPomodoriCount = 0,
        pomodoriCycleCount = 4,
        tookBreak = false;


    let pomodoroArray = [pomodoroLength, shortBreakLength,
        pomodoroLength, shortBreakLength,
        pomodoroLength, shortBreakLength,
        pomodoroLength, longBreakLength];

    let pomodoroArrayIndex = 0;
    let timeLeft = pomodoroArray[pomodoroArrayIndex % pomodoroArray.length];

    // countdown information
    let countdownInterval,
        isRunning = false,
        initial = true;

    // animations
    function renderPage() {
        // animations
        $(descriptionText).animate({"opacity": "0"}, 200, function(){
            // remove "get started" button.
            $(letsGoButton).animate({"opacity": "0"}, 200, function() {
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
            $(workDescription).animate({"opacity": "0"}, 300);
            changeButtonText(this);
            runPomodoro(false);
            isRunning = false;
        }
    });

    resetPomodoro.addEventListener("click", function () {
        $(workDescription).animate({"opacity": "0"}, 300);
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
            $(workDescription).animate({"opacity": "0"}, 300);
            runPomodoro(false);
            isRunning = false;
        }
        $(pomodoroSettings).animate({"opacity": "0"}, 100, function () {
            this.style.visibility = "hidden";
            settingsBox.style.visibility = "visible";
            $(settingsBox).animate({"opacity": "1"}, 100, function () {
                $(".button-okay").css({"visibility": "visible"}).animate({"opacity": "1"}, 50);
            });
        });
    });

    Array.prototype.forEach.call(plusButton, function (el, i) {
        el.addEventListener("click", function () {
            if (parseInt(el.parentNode.childNodes[7].textContent) < 59)
                el.parentNode.childNodes[7].textContent = (parseInt(el.parentNode.childNodes[7].textContent) + 1);
        });
    });

    Array.prototype.forEach.call(minusButton, function (el, i) {
        el.addEventListener("click", function () {
            if (parseInt(el.parentNode.childNodes[7].textContent) > 1)
                el.parentNode.childNodes[7].textContent = (parseInt(el.parentNode.childNodes[7].textContent) - 1);
        });
    });

    okayButton.addEventListener("click", function () {
        // update pomodori lengths
        pomodoroLength     = parseInt(document.getElementById("pomodoro_length").textContent) * 60;
        shortBreakLength   = parseInt(document.getElementById("short_break_length").textContent) * 60;
        longBreakLength    = parseInt(document.getElementById("long_break_length").textContent) * 60;
        pomodoriCycleCount = parseInt(document.getElementById("pomodoro_cycle_length").textContent) * 60;
        // go back to pause menu
        $(this).animate({"opacity": "0"}, 50, function () {
            this.style.visibility = "hidden";
            $(settingsBox).animate({"opacity": "0"}, 100, function () {
                this.style.visibility = "hidden";
                if (timeLeft !== pomodoroArray[pomodoroArrayIndex % pomodoroArray.length]) {
                    if (togglePomodoro.textContent !== "resume") changeButtonText(togglePomodoro);
                }
                $(pomodoroSettings).css({"visibility": "visible"}).animate({"opacity": "1"}, 100);
            });
        });
    });

    function runPomodoro(flag) {
        if (flag) {
            countdownInterval = setInterval(function () {
                renderTime(convertToMinutes(timeLeft));
                if (timeLeft-- === 0) {
                    clearInterval(countdownInterval);
                    // TODO: send notification / tone
                    checkPomodoro();
                }
            }, 1000)
        } else {
            clearInterval(countdownInterval);
        }
    }

    function checkPomodoro() {
        if (!tookBreak) { // time for a break

            $(workDescription).animate({"opacity": "0"}, 200, function () {
                this.textContent = "Take a break.";
            }).animate({"opacity": "1"}, 200);

            tookBreak = true;
            document.getElementById("pomodoros_text").textContent = "pomodori: " + ++currentPomodoriCount;
            if (currentPomodoriCount % pomodoriCycleCount === 0) {
                timeLeft = longBreakLength; // take a long break
            } else {
                timeLeft = shortBreakLength; // take a short break
            }
        } else { // took a break, now back to work

            $(workDescription).animate({"opacity": "0"}, 200, function () {
                this.textContent = "Get work done.";
            }).animate({"opacity": "1"}, 200);

            timeLeft = pomodoroLength;
            tookBreak = false;
        }
        runPomodoro(true);
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
