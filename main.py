import whisper
import json
import pyperclip
import time
from moviepy import VideoFileClip
from furigana import furiganify

PROMPT_TEMPLATE = "Please translate this into chinese:\n{}\nand return it in this format: \n [{{'id': id, 'explanation': [{{'word': word, 'meaning': meaning, 'romaji': romaji}}]}}]\nThank you"

def convert_video_to_mp3(filename):
    video = VideoFileClip(filename) 
    video.audio.write_audiofile("output_audio.mp3")

def transcribe():
    # global aoi
    model = whisper.load_model("medium")
    aoi = model.transcribe("output_audio.mp3")
    json_text3 = json.dumps([{"id": text["id"], "text": text["text"]} for text in aoi["segments"]], ensure_ascii=False, indent=2)
    
    prompt = PROMPT_TEMPLATE.format(json_text3)

    print(prompt)
    pyperclip.copy(prompt)

    return aoi

def loadjson(jsonfile, aoi):
    try:
        for index, text1 in enumerate(jsonfile):
            text1.update({"text": aoi["segments"][index]["text"], "time": {"start": aoi["segments"][index]["start"], "end": aoi["segments"][index]["end"]}})
        print(json.dumps(jsonfile, ensure_ascii=False, indent=2))
        
        jsonfile2 = [text1["time"] for text1 in jsonfile]
        print(json.dumps(jsonfile2, ensure_ascii=False, indent=2))

        with open("text2.json", "w", encoding="utf-8") as f:
            json.dump({"0": jsonfile, "1": jsonfile2}, f, ensure_ascii=False, indent=2)
            
    except json.JSONDecodeError as e:
        print(e)

aoi = {}
while True:
    print("1. Convert video to Mp3 files\n2. Transcribe\n3. Load JSON\n4. Generate ruby text")
    input_text = input("Which: ")
    match input_text:
        case "1":
            convert_video_to_mp3(input("Input file name: "))
        case "2":
            aoi_output = input("Transcription output file name: ") or str(time.time()) + ".json"
            aoi = transcribe()

            with open(aoi_output, "w", encoding="utf-8") as f:
                f.write(json.dumps(aoi, ensure_ascii=False, indent=2))
        case "3":
            filename = input("Json File Name: ")
            aoi_file = input("Aoi file Name: ").strip()

            with open(filename, encoding='utf-8') as f:
                jsonfile = json.load(f)

            if aoi_file:
                with open(aoi_file, "r", encoding="utf-8") as f:
                    aoi = json.load(f)

            loadjson(jsonfile, aoi)
        case "4":
            with open("text2.json", "r", encoding="utf-8") as f:
                kuroi = json.load(f)

            for index, text1 in enumerate(kuroi["0"]):
                for word in text1["explanation"]:
                    word["ruby_tag"] = furiganify(word["word"])


            with open("text2.json", "w", encoding="utf-8") as f:
                json.dump(kuroi, f, ensure_ascii=False, indent=2)
            
    


