
document.addEventListener('DOMContentLoaded', function () {
    let letsGoButton = document.getElementById("lets_go");
    // handling for notification access
    letsGoButton.addEventListener("click", function () {
        if (!("Notification" in window)) {
            alert ("This browser does not support notifications :/");
            renderPage();
        }
        else if (Notification.permission === "granted") renderPage();
        else if (Notification.permission !== "denied" || Notification.permission === "default") {
            // ask user for permission
            Notification.requestPermission(function(permission) {
                if (permission === "granted") {
                    generateNotification("Great, Notifications are enabled.");
                    renderPage();
                }
            });
        } else if (Notification.permission === "denied") renderPage();
    });

    // DOM-Elements
    let descriptionText     = document.getElementsByClassName("page-description"),
        pomodoroSettings    = document.getElementsByClassName("settings"),
        plusButton          = document.getElementsByClassName("plus-button"),
        minusButton         = document.getElementsByClassName("minus-button"),
        workDescription     = document.getElementById("work_description"),
        togglePomodoro      = document.getElementById("pause_resume"),
        resetPomodoro       = document.getElementById("reset"),
        settingsButton      = document.getElementById("general_settings"),
        settingsBox         = document.getElementById("pomodoro_settings"),
        okayButton          = document.getElementById("okay"),
    // pomodoro-flags
        tookBreak            = false, // tookBreak == true -> currently in a break
        pomodoroTimeChanged  = false,
        breakTimeChanged     = false,
    // pomodoro variables
        pomodoroLength       = 1500,
        shortBreakLength     = 300,
        longBreakLength      = 900,
        currentPomodoriCount = 0,
        pomodoriCycleCount   = 4,
        timeLeft             = pomodoroLength,
    // countdown information
        countdownInterval,
        isRunning = false;

    // animations
    function renderPage() {
        // animations
        $(descriptionText).animate({"opacity": "0"}, 200, function(){
            // remove "get started" button.
            $(letsGoButton).animate({"opacity": "0"}, 200, function() {
                this.style.display = "none";
                // remove "Pomodoro Timer" heading and replace with time
                $("#main_text").animate({"opacity": "0"}, 300, function () {
                    this.textContent = convertToMinutes(pomodoroLength);
                }).animate({"opacity": "1", "bottom": "10rem"}, 300, function() {
                    // activate cycles button
                    $("#pomodoros_text").css({"display": "block", "bottom": "13rem"}).animate({"opacity": "1"}, 100, function () {
                        // activate pomodoro settings button
                        $(".settings").css({"display": "inline-block", "bottom" : "10rem"}).animate({"opacity": "1"}, 100);
                    });
                });
            });
        });
    }

    togglePomodoro.addEventListener("click", function () {
        if (!isRunning) {
            $(workDescription).animate({"opacity": "1"}, 300);
            if (timeLeft === pomodoroLength || timeLeft === shortBreakLength || timeLeft === longBreakLength) {
                // instant update when starting the pomodoro section (instead of waiting 1 second i.e. when resuming)
                renderTime(convertToMinutes(--timeLeft));
            } else renderTime(convertToMinutes(timeLeft));
            timeLeft--;
            isRunning = true;
        } else {
            $(workDescription).animate({"opacity": "0"}, 300);
            isRunning = false;
        }
        // clicking the toggle will always change the text, as well as pause or resume the timer
        changeButtonText(this);
        runPomodoro(isRunning);
    });

    resetPomodoro.addEventListener("click", function () {
        $(workDescription).animate({"opacity": "0"}, 300);
        if (isRunning) {
            isRunning = false;
            runPomodoro(isRunning);
        }
        // either reset short break or long break, depending on the type one currently is on
        if (tookBreak) timeLeft = (currentPomodoriCount % pomodoriCycleCount === 0) ? longBreakLength : shortBreakLength;
        else timeLeft = pomodoroLength;
        // these will always happen
        renderTime(convertToMinutes(timeLeft));
        togglePomodoro.textContent = "start";
    });

    settingsButton.addEventListener("click", function() {
        // pause the timer
        if (isRunning) {
            $(workDescription).animate({"opacity": "0"}, 300);
            isRunning = false;
            runPomodoro(isRunning);
        }
        $(pomodoroSettings).animate({"opacity": "0"}, 100, function () {
            this.style.visibility = "hidden";
            settingsBox.style.visibility = "visible";
            $(settingsBox).animate({"opacity": "1"}, 100, function () {
                $(".button-okay").css({"visibility": "visible"}).animate({"opacity": "1"}, 10);
            });
        });
    });

    // increment timers in the settings menu when clicking the plus button
    Array.prototype.forEach.call(plusButton, function (el, i) {
        el.addEventListener("click", function () {
            if (parseInt(el.parentNode.childNodes[7].textContent) < 59)
                el.parentNode.childNodes[7].textContent = (parseInt(el.parentNode.childNodes[7].textContent) + 1);
        });
    });
    // decrement timers in the settings menu when clicking the minus button
    Array.prototype.forEach.call(minusButton, function (el, i) {
        el.addEventListener("click", function () {
            if (parseInt(el.parentNode.childNodes[7].textContent) > 1)
                el.parentNode.childNodes[7].textContent = (parseInt(el.parentNode.childNodes[7].textContent) - 1);
        });
    });
    // update pomodori lengths provided changes have been made
    okayButton.addEventListener("click", function () {
        if (parseInt(document.getElementById("pomodoro_length").textContent) * 60 !== pomodoroLength) {
            pomodoroLength = parseInt(document.getElementById("pomodoro_length").textContent) * 60;
            pomodoroTimeChanged = true;
        }
        if (parseInt(document.getElementById("short_break_length").textContent) * 60 !== shortBreakLength) {
            shortBreakLength = parseInt(document.getElementById("short_break_length").textContent) * 60;
            breakTimeChanged = true;
        }
        if (parseInt(document.getElementById("long_break_length").textContent) * 60 !== longBreakLength) {
            longBreakLength  = parseInt(document.getElementById("long_break_length").textContent) * 60;
            breakTimeChanged = true;
        }
        if (parseInt(document.getElementById("pomodoro_cycle_length").textContent) !== pomodoriCycleCount) {
            pomodoriCycleCount = parseInt(document.getElementById("pomodoro_cycle_length").textContent);
        }

        if (tookBreak) {
            // if break time has been changed during break, reset timer with new time
            timeLeft = (breakTimeChanged) ? (currentPomodoriCount % pomodoriCycleCount === 0) ? longBreakLength : shortBreakLength : timeLeft;
        } else {
            // if pomodoro time has been changed during pomodoro, reset timer with new time
            timeLeft = (pomodoroTimeChanged) ? pomodoroLength: timeLeft;
        }
        // accounting for the way setInterval works
        if (!isRunning) {
            if (tookBreak && (timeLeft === shortBreakLength || timeLeft !== longBreakLength)) {
                timeLeft++;
            } else if (!tookBreak && timeLeft !== pomodoroLength) timeLeft++;
        }
        renderTime(convertToMinutes(timeLeft));

        // go back to pause menu
        $(this).animate({"opacity": "0"}, 50, function () {
            this.style.visibility = "hidden";
            $(settingsBox).animate({"opacity": "0"}, 100, function () {
                this.style.visibility = "hidden";
                if ((tookBreak && breakTimeChanged) || (tookBreak && (timeLeft === longBreakLength || timeLeft === shortBreakLength)) ||
                    (!tookBreak && pomodoroTimeChanged) || (!tookBreak && timeLeft === pomodoroLength))  {
                    togglePomodoro.textContent = "start";
                }
                else togglePomodoro.textContent = "resume";
                $(pomodoroSettings).css({"visibility": "visible"}).animate({"opacity": "1"}, 100);
            });
        });
        // resetting flags (for future changes)
        pomodoroTimeChanged = false;
        breakTimeChanged = false;
    });

    function runPomodoro(flag) {
        if (flag) {
            countdownInterval = setInterval(function () {
                renderTime(convertToMinutes(timeLeft));
                if (timeLeft-- === 0) {
                    clearInterval(countdownInterval);
                    checkPomodoro();
                }
            }, 1000)
        } else {
            clearInterval(countdownInterval);
        }
    }

    function checkPomodoro() {
        if (!tookBreak) { // time for a break
            generateNotification("You deserve a break.");
            $(workDescription).animate({"opacity": "0"}, 200, function () {this.textContent = "Take a break.";}).animate({"opacity": "1"}, 200);
            tookBreak = true;
            document.getElementById("pomodoros_text").textContent = "pomodori: " + ++currentPomodoriCount;
            timeLeft = (currentPomodoriCount % pomodoriCycleCount === 0) ? longBreakLength : shortBreakLength;
        } else { // took a break, now back to work
            generateNotification("Let's get back to work.");
            $(workDescription).animate({"opacity": "0"}, 200, function () {this.textContent = "Get work done.";}).animate({"opacity": "1"}, 200);
            timeLeft = pomodoroLength;
            tookBreak = false;
        }
        timeLeft--;
        runPomodoro(true);
    }
});

// create a notification with given body text
function generateNotification(text) {
    if (Notification.permission === "granted") {
        let notification = new Notification("Pomodoro Timer:", {
            body: text,
            icon: "http://res.cloudinary.com/detqxj5bf/image/upload/v1510792916/pomodoro/mini-tomato.png"
        });
        notification.onclick = function(event) {
            window.focus();
            notification.close();
        };
        setTimeout(notification.close.bind(notification), 5000);
    }
}
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
