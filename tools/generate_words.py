import csv
import json
import re
import sys
from pathlib import Path


TARGETS = [
    ("cet4", "CET4", "CET4_WORDS", 1, 1000),
    ("cet6", "CET6", "CET6_WORDS", 1001, 1000),
    ("ielts", "IELTS", "IELTS_WORDS", 2001, 1000),
]

POS_PATTERN = re.compile(r"^(?P<pos>n|v|vt|vi|adj|adv|a|ad|prep|pron|conj|num|int)\.\s*(?P<body>.+)", re.I)
WORD_PATTERN = re.compile(r"^[a-z]{3,18}$")


def clean_text(value):
    value = re.sub(r"\[[^\]]+\]", "", value or "")
    value = value.replace("\\n", "\n")
    value = re.sub(r"\s+", " ", value)
    return value.strip(" ;,，；")


def parse_translation(value):
    lines = []
    for raw in (value or "").splitlines():
        line = raw.strip()
        if not line or "网络" in line:
            continue
        line = clean_text(line)
        if line:
            lines.append(line)

    detected_pos = ""
    meanings = []
    for line in lines:
        match = POS_PATTERN.match(line)
        if match:
            pos = match.group("pos").lower()
            detected_pos = detected_pos or ("adj." if pos == "a" else f"{pos}.")
            meanings.append(match.group("body"))
        else:
            meanings.append(line)

    merged = "；".join(meanings[:2])
    merged = re.sub(r"^(n|v|vt|vi|adj|adv|a|ad|prep|pron|conj|num|int)\.\s*", "", merged, flags=re.I)
    parts = [clean_text(part) for part in re.split(r"[;,，；]", merged) if clean_text(part)]
    meaning = "；".join(parts[:4])
    return detected_pos or "n.", meaning


def score(row):
    values = []
    for key in ("bnc", "frq"):
        try:
            number = int(row.get(key) or 0)
        except ValueError:
            number = 0
        if number > 0:
            values.append(number)
    return min(values) if values else 999999


def make_example(word):
    return f"I wrote the word {word} in my vocabulary notebook."


def make_example_cn(word):
    return f"我把 {word} 这个词写进了词汇笔记。"


def normalize(row):
    word = (row.get("word") or "").strip().lower()
    if not WORD_PATTERN.fullmatch(word):
        return None

    phonetic = clean_text(row.get("phonetic"))
    translation = row.get("translation") or ""
    pos, meaning = parse_translation(translation)
    if not phonetic or not meaning:
        return None

    if not phonetic.startswith("/"):
        phonetic = f"/{phonetic}/"

    return {
        "word": word,
        "phonetic": phonetic,
        "pos": pos,
        "meaning": meaning,
        "example": make_example(word),
        "exampleCn": make_example_cn(word),
        "_score": score(row),
        "_tags": set((row.get("tag") or "").split()),
    }


def pick_words(rows, tag, level, start_id, count, used):
    candidates = [
        row
        for row in rows
        if tag in row["_tags"] and row["word"] not in used and len(row["meaning"]) <= 46
    ]
    candidates.sort(key=lambda item: (item["_score"], len(item["word"]), item["word"]))
    picked = candidates[:count]
    if len(picked) < count:
        raise RuntimeError(f"Only picked {len(picked)} words for {level}")

    words = []
    for offset, item in enumerate(picked):
        used.add(item["word"])
        words.append(
            {
                "id": start_id + offset,
                "word": item["word"],
                "phonetic": item["phonetic"],
                "pos": item["pos"],
                "meaning": item["meaning"],
                "example": item["example"],
                "exampleCn": item["exampleCn"],
                "level": level,
            }
        )
    return words


def write_module(path, export_name, words):
    data = json.dumps(words, ensure_ascii=False, separators=(",", ":"))
    path.write_text(f"export const {export_name} = {data};\n", encoding="utf-8")


def main():
    if len(sys.argv) != 3:
        print("Usage: python tools/generate_words.py <ecdict.csv> <output-dir>")
        return 2

    csv_path = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    output_dir.mkdir(parents=True, exist_ok=True)

    rows = []
    seen = set()
    with csv_path.open("r", encoding="utf-8", newline="") as handle:
        for raw in csv.DictReader(handle):
            item = normalize(raw)
            if not item or item["word"] in seen:
                continue
            seen.add(item["word"])
            rows.append(item)

    used = set()
    generated = []
    for tag, level, export_name, start_id, count in TARGETS:
        words = pick_words(rows, tag, level, start_id, count, used)
        filename = f"words-{tag}.js"
        write_module(output_dir / filename, export_name, words)
        generated.append((level, len(words), filename))

    for level, count, filename in generated:
        print(f"{level}: {count} -> {filename}")


if __name__ == "__main__":
    raise SystemExit(main())
