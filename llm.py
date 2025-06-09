from ollama import chat
from ollama import ChatResponse
import json

model = "deepseek-v2:16b"


def generate_shiroi(akai):
    messages = [
        {
            "role": "system",
            "content": "You are a Japanese to Chinese translator. You will be given a sentence or phrase in Japanese and you need to output in this format: \n [{\"word\": word, \"meaning\": meaning_in_chinese,　\"romaji\": romaji}]. Please only output the JSON array without any additional text or explanation."
        }
    ]

    shiroi = []

    for dialog in akai:
        prompt = messages + [
            {
                "role": "user",
                "content": dialog["text"]
            }
        ]

        response: ChatResponse = chat(model=model, messages=prompt)
        if response and response.message and response.message.content:
            content = response.message.content.strip().replace("'", '"') # Ensure double quotes for JSON compatibility
            try:
                result = json.loads(content)
                shiroi.append({
                    "id": dialog["id"],
                    "explanation": result
                })
            except json.JSONDecodeError as e:
                print("Faulty JSON:", content)
                print("Error:", e)
                shiroi.append({
                    "id": dialog["id"],
                    "explanation": [{"word": dialog["text"], "meaning": "Translation error", "romaji": ""}]
                })

    return shiroi

if __name__ == "__main__":
    akai = []

    with open("akai.json", "r", encoding="utf-8") as f:
        akai = json.load(f)

    shiroi_output = generate_shiroi(akai)
    print(json.dumps(shiroi_output, ensure_ascii=False, indent=2))
    
    with open("shiroi_output.json", "w", encoding="utf-8") as f:
        json.dump(shiroi_output, f, ensure_ascii=False, indent=2)

