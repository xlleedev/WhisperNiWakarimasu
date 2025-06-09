import pykakasi

def furiganify(word):
    kakasi = pykakasi.kakasi()
    html = ""

    result = kakasi.convert(word)
    for item in result:
        surface = item['orig']
        reading = item['hira']
        if surface != reading:
            html += f"<ruby>{surface}<rt>{reading}</rt></ruby>"
        else:
            html += surface

    return html

if __name__ == "__main__":
    # Example usage:
    words = {"勉強", "日本語", "食べる"}
    print(furiganify(words))