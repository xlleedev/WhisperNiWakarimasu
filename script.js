class VideoHandler {
    constructor(init, element) {
        this.init = init;
        this.element = element;
        this.video_url = "honeylemon.mp4";
        this.bind_function();
        this.init_event_listener();
        this.load_video();
    }
    bind_function() {
        this.loadedmetadata = this.loadedmetadata.bind(this);
        this.timeupdate = this.timeupdate.bind(this);
    }
    init_event_listener() {
        this.element.addEventListener("loadedmetadata", this.loadedmetadata);
        this.element.addEventListener("timeupdate", this.timeupdate);
    }
    loadedmetadata() {
        this.init.RangeSliderHandler.element.max = this.element.duration;
        this.init.RangeStartEndHandler.end_element.innerText = this.init.ContentProcessor.minuteSecond(this.element.duration);
        this.init.ContentProcessor.updateText(); 
    }
    timeupdate() {
        document.getElementById("range").value = this.element.currentTime;
        this.init.RangeStartEndHandler.start_element.innerText = this.init.ContentProcessor.minuteSecond(
            this.element.currentTime
        );
        this.init.ContentProcessor.checkIfInTime();
    }
    load_video() {
        this.element.src = this.video_url;
        this.element.load();
    }
}
class RangeSliderHandler {
    constructor(init, element) {
        this.init = init;
        this.element = element;
        this.bind_function();
        this.init_event_listener();
    }
    bind_function() {
        this.click = this.click.bind(this);
    }
    init_event_listener() {
        this.element.addEventListener("click", this.click);
    }
    click() {
        this.init.VideoHandler.element.currentTime = this.element.value;
    }
}
class RangeStartEndHandler {
    constructor (init, start_element, end_element) {
        this.init = init;
        this.start_element = start_element;
        this.end_element = end_element;
    }
}
class PlayPauseButtonHandler {
    constructor(init, element) {
        this.init = init;
        this.element = element;
        this.bind_function();
        this.init_event_listener();
    }
    bind_function() {
        this.click = this.click.bind(this);
    }
    init_event_listener() {
        this.element.addEventListener("click", this.click)
    }
    click() {
        if (this.init.VideoHandler.element.paused) {
            this.init.VideoHandler.element.play();
        } else {
            this.init.VideoHandler.element.pause();
        }   
    }
}
class ForwardButtonHandler {
    constructor(init, element) {
        this.init = init;
        this.element = element;
        this.bind_function();
        this.init_event_listener();
    }
    bind_function() {
        this.click = this.click.bind(this);
    }
    init_event_listener() {
        this.element.addEventListener("click", this.click);
    }
    click() {
        if (this.init.ContentProcessor.empty) {
            if (this.init.ContentProcessor.currentIndex > 0) {
                this.init.ContentProcessor.previous -= 1;
                this.init.ContentProcessor.currentIndex -= 1;
            }
        }
        this.init.VideoHandler.element.currentTime = this.init.ProcessData.data["1"][this.init.ContentProcessor.currentIndex]["start"] + this.init.ContentProcessor.delay - 0.5;
        this.init.ContentProcessor.updateText();
    }
}
class ContentProcessor {
    constructor(init) {
        this.init = init;
        this.empty = false
        this.previous = 0;
        this.currentIndex = 0;
        this.delay = 0;
        this.bind_function();
    }
    bind_function() {
        this.check_data = this.check_data.bind(this);
        this.checkIfInTime = this.checkIfInTime.bind(this);
        this.updateText = this.updateText.bind(this);
    }
    checkIfInTime() {
        let currentTime = this.init.VideoHandler.element.currentTime - this.delay;
        if (!this.check_data(this.checkIfInTime)) return;
        let data = this.init.ProcessData.data["1"];
        if (currentTime < data[this.previous]["start"] || currentTime > data[this.previous]["end"]) {
            this.empty = true;
            data.some((element, index) => {
                if (currentTime > element.start && currentTime < element.end) {
                    this.previous = index;
                    this.currentIndex = index;
                    this.updateText();
                    this.empty = false;
                    return true;
                }
            });
        }
    }
    updateText() {
        let divstuff = ""; 
        if (!this.check_data(this.updateText)) return;
        let data = this.init.ProcessData.data["0"];
        data[this.currentIndex]["explanation"].forEach(element => {
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
        document.getElementById("text").style.gridTemplateColumns = "auto ".repeat(data[this.currentIndex]["explanation"].length).trim();
    }
    minuteSecond(second) {
        return (
            Math.floor(second / 60) +
            ":" +
            (Math.floor(second % 60) < 10
                ? "0" + Math.floor(second % 60)
                : Math.floor(second % 60))
        );
    }
    check_data(callback) {
        if (this.init.ProcessData.data == undefined) {
            console.log("Cannot retrieve data. Retry");
            this.init.ProcessData.retry(callback);
            return false;
        } else {
            return true;
        }
    }
}
class ProcessData {
    constructor(init) {
        this.init = init;
        this.data_url = "text2.json";
        this.retried = false;
        this.fetch_data();
    }
    async fetch_data() {
        console.log("retrieving data");
        try {
            const response = await fetch(this.data_url);
            const data = await response.json();
            this.data = data;
        } catch (e) {
            console.log(e);
        }
    }
    retry(callback) {
        if (this.retried) {
            console.log("Retrying after 5 seconds");
            setTimeout(() => {
                this.fetch_data();
                callback();
            }, 5000)
        } else {
            this.retried = true;
            this.fetch_data();
            callback();
        }
    }
}
class Init {
    constructor() {
        this.ProcessData = new ProcessData(this);
        this.RangeSliderHandler = new RangeSliderHandler(this, document.getElementById("range"));
        this.RangeStartEndHandler = new RangeStartEndHandler(this, document.getElementById("current_time"), document.getElementById("end_time"));
        this.PlayPauseButtonHandler = new PlayPauseButtonHandler(this, document.getElementById("playpause"));
        this.ForwardButtonHandler = new ForwardButtonHandler(this, document.getElementById("forward"));
        this.ContentProcessor = new ContentProcessor(this);
        this.VideoHandler = new VideoHandler(this, document.getElementById("video"));
    }
} 
init = new Init();