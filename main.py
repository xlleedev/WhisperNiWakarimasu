import whisper
import json
from moviepy import VideoFileClip

def convert_video_to_mp3(filename):
    video = VideoFileClip(filename) 
    video.audio.write_audiofile("output_audio.mp3")
def transcribe():
    global aoi
    model = whisper.load_model("medium")
    aoi = model.transcribe("output_audio.mp3")
    json_text3 = json.dumps([{"id": text["id"], "text": text["text"]} for text in aoi["segments"]], ensure_ascii=False, indent=2)
    print(f"Please translate this into chinese:\n{json_text3}\nand return it in this format: \n [{{'id': id, 'explanation': [{{'word': word, 'meaning': meaning, 'ruby_tag': false/rubytaginhtmlforkanji, 'romaji': romaji}}]}}]\nThank you")
def loadjson(jsonfile):
    global text
    global aoi

    try:
        for index, text1 in enumerate(jsonfile):
            text1.update({"text": aoi["segments"][index]["text"], "time": {"start": aoi["segments"][index]["start"], "end": aoi["segments"][index]["end"]}})
        print(json.dumps(jsonfile, ensure_ascii=False, indent=2))
        
        jsonfile2 = []
        for text1 in jsonfile:
            jsonfile2.append(text1["time"])
        print(json.dumps(jsonfile2, ensure_ascii=False, indent=2))

        with open("text2.json", "w", encoding="utf-8") as f:
            json.dump({"0": jsonfile, "1": jsonfile2}, f, ensure_ascii=False, indent=2)
    except json.JSONDecodeError as e:
        print(e)

aoi = ""
text= ""
while True:
    print("1. Convert video to Mp3 files\n2. Transcribe\n3. Load JSON")
    input_text = str(input("Which: "))
    if input_text == "1":
        convert_video_to_mp3(str(input("Input file name: "))) 
    elif input_text == "2":
        transcribe()
    elif input_text == "3":
        filename = str(input("Json File Name: "))
        with open(filename) as f:
            jsonfile = json.load(f)
        loadjson(jsonfile)
    


