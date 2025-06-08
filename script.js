const video = document.getElementById("video");

video.addEventListener("loadedmetadata", function () {
    document.getElementById("range").max = video.duration;
    document.getElementById("end_time").innerText = minuteSecond(
        video.duration
    );
    updateText();
});

video.addEventListener("timeupdate", function () {
    document.getElementById("range").value = video.currentTime;
    document.getElementById("current_time").innerText = minuteSecond(
        video.currentTime
    );
    checkIfInTime();
});

document.getElementById("playpause").addEventListener("click", function () {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
});

document.getElementById("range").addEventListener("click", function () {
    video.currentTime = this.value;
});

let text = null;
let text2 = null;

fetch("text2.json")
    .then(response => response.json())
    .then(data => {
        text = data["0"];
        text2 = data["1"];
    });

let previous = 0;
let currentIndex = 0;
let empty = false;
let delay = 0;

function checkIfInTime() {
    let currentTime = video.currentTime - delay;
    if (
        currentTime < text2[previous]["start"] ||
        currentTime > text2[previous]["end"]
    ) {
        empty = true;
        text2.some((element, index) => {
            if (currentTime > element.start && currentTime < element.end) {
                previous = index;
                currentIndex = index;
                updateText();
                empty = false;
                return true;
            }
        });
    }
}

function updateText() {
    let divstuff = "";
    text[currentIndex]["explanation"].forEach(element => {
        divstuff +=
            `<div class="text_2">
            <div class="text_3">
                <p title="` +
            element.romaji +
            `">` +
            (element.ruby_tag ? element.ruby_tag : element.word) +
            `</p>
            </div>
            <div class="text_3_2">
                <p>` +
            element.meaning +
            `</p>
            </div>
        </div>`;
    });

    document.getElementById("text").innerHTML = divstuff;
    document.getElementById("text").style.gridTemplateColumns = "auto "
        .repeat(text[currentIndex]["explanation"].length)
        .trim();
}

function minuteSecond(second) {
    return (
        Math.floor(second / 60) +
        ":" +
        (Math.floor(second % 60) < 10
            ? "0" + Math.floor(second % 60)
            : Math.floor(second % 60))
    );
}

document.getElementById("forward").addEventListener("click", function () {
    if (empty) {
        if (currentIndex > 0) {
            previous -= 1;
            currentIndex -= 1;
        }
    }

    video.currentTime = text2[currentIndex]["start"] + delay - 0.5;
    updateText();
});
