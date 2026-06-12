import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SLICES_DIR = ROOT / "tools" / "slices"
DATA_DIR = ROOT / "js" / "data"

MODULES = [
    ("words-cet4.js", "CET4_WORDS"),
    ("words-cet6.js", "CET6_WORDS"),
    ("words-ielts.js", "IELTS_WORDS"),
]

REBUILD_OUTPUTS = {"out-04.json", "out-11.json"}

PROPER_NOUNS = {
    "america": "America",
    "britain": "Britain",
    "christ": "Christ",
    "england": "England",
    "europe": "Europe",
    "greece": "Greece",
    "india": "India",
    "jesus": "Jesus",
    "london": "London",
    "oxford": "Oxford",
    "scotland": "Scotland",
    "york": "York",
}


ADVERB_EXAMPLES = {
    "currently": ("The project is currently under review.", "这个项目目前正在审核中。"),
    "truly": ("She was truly grateful for their help.", "她真心感谢他们的帮助。"),
    "widely": ("The method is widely used in schools.", "这种方法在学校里被广泛使用。"),
    "ultimately": ("The team ultimately chose the simpler plan.", "团队最终选择了更简单的方案。"),
    "hence": ("The road was closed, hence the delay.", "道路封闭了，因此出现了延误。"),
    "somewhat": ("His answer was somewhat different from mine.", "他的回答和我的有些不同。"),
    "unfortunately": ("Unfortunately, the train arrived late.", "不幸的是，火车晚点了。"),
    "strongly": ("She strongly supported the new policy.", "她强烈支持这项新政策。"),
    "rapidly": ("The situation changed rapidly overnight.", "局势在一夜之间迅速变化。"),
    "barely": ("He could barely hear her voice.", "他几乎听不见她的声音。"),
    "definitely": ("This book is definitely worth reading.", "这本书绝对值得一读。"),
    "specifically": ("The rule applies specifically to new users.", "这条规则专门适用于新用户。"),
    "practically": ("The room was practically empty by noon.", "到中午时房间几乎空了。"),
    "exclusively": ("The club is exclusively for members.", "这个俱乐部只对会员开放。"),
    "scarcely": ("There was scarcely enough time to finish.", "几乎没有足够的时间完成。"),
    "invariably": ("He invariably arrives ten minutes early.", "他总是提前十分钟到达。"),
}

CUSTOM_EXAMPLES = {
    "environmental": ("The new law sets strict environmental standards.", "新法律制定了严格的环保标准。"),
    "corporate": ("She works in the corporate finance department.", "她在公司财务部门工作。"),
    "conclude": ("The report will conclude with practical advice.", "这份报告将以实用建议作结。"),
    "imply": ("His silence seemed to imply agreement.", "他的沉默似乎暗示了同意。"),
    "illustrate": ("This chart illustrates the rise in sales.", "这张图表说明了销售额的增长。"),
    "locate": ("The app can locate the nearest bus stop.", "这个应用可以找到最近的公交站。"),
    "comfortable": ("These shoes are comfortable for long walks.", "这双鞋适合长时间步行，很舒服。"),
    "investigate": ("Police will investigate the cause of the fire.", "警方将调查火灾原因。"),
    "thick": ("A thick layer of snow covered the road.", "厚厚的一层雪覆盖了道路。"),
    "afford": ("Many students cannot afford a new laptop.", "许多学生买不起一台新笔记本电脑。"),
    "inform": ("Please inform me if the schedule changes.", "如果日程有变，请通知我。"),
    "unique": ("Each student has a unique learning style.", "每个学生都有独特的学习方式。"),
    "ethnic": ("The museum shows ethnic costumes from many regions.", "博物馆展示了许多地区的民族服饰。"),
    "appreciate": ("I appreciate your help with this project.", "我感谢你对这个项目的帮助。"),
    "defend": ("The lawyer tried to defend her client.", "律师努力为她的客户辩护。"),
    "approve": ("The board must approve the budget first.", "董事会必须先批准预算。"),
    "apparent": ("It soon became apparent that he was right.", "很快就明显看出他是对的。"),
    "persuade": ("She tried to persuade him to stay.", "她试图说服他留下。"),
    "steal": ("Someone tried to steal his bicycle.", "有人试图偷他的自行车。"),
    "pursue": ("He decided to pursue a career in medicine.", "他决定从事医学事业。"),
    "jewish": ("The city has a rich Jewish history.", "这座城市有丰富的犹太历史。"),
    "derive": ("Many English words derive from Latin.", "许多英语单词源自拉丁语。"),
    "crazy": ("The crowd went crazy when the band appeared.", "乐队出现时，人群激动得发狂。"),
    "recover": ("She needed two weeks to recover from the flu.", "她需要两周从流感中恢复。"),
    "ancient": ("They found ancient coins near the temple.", "他们在寺庙附近发现了古代硬币。"),
    "golden": ("The field looked golden in the evening light.", "田野在傍晚的光线下显得金黄。"),
    "request": ("He sent a request for more information.", "他发出了获取更多信息的请求。"),
    "solve": ("We need to solve this problem quickly.", "我们需要快速解决这个问题。"),
    "typical": ("This is a typical mistake for beginners.", "这是初学者常犯的典型错误。"),
    "eliminate": ("The new filter can eliminate most noise.", "新的滤镜可以消除大部分噪声。"),
    "attach": ("Please attach the file to your email.", "请把文件附在邮件里。"),
    "grand": ("They held a grand ceremony in the hall.", "他们在大厅举行了盛大的仪式。"),
    "accuse": ("They accuse him of breaking the rules.", "他们指责他违反了规则。"),
    "accompany": ("A guide will accompany us on the tour.", "导游会陪同我们参观。"),
    "withdraw": ("She decided to withdraw from the competition.", "她决定退出比赛。"),
    "cite": ("The article cites several recent studies.", "这篇文章引用了几项最新研究。"),
    "vast": ("The desert covers a vast area.", "这片沙漠覆盖了广阔的区域。"),
    "oppose": ("Many residents oppose the new road plan.", "许多居民反对新的道路规划。"),
    "justify": ("He tried to justify his decision.", "他试图为自己的决定辩解。"),
    "proud": ("She felt proud of her progress.", "她为自己的进步感到自豪。"),
    "occupy": ("The desk occupies too much space.", "这张桌子占用了太多空间。"),
    "enormous": ("The project required an enormous amount of work.", "这个项目需要大量工作。"),
    "invest": ("They plan to invest in clean energy.", "他们计划投资清洁能源。"),
    "administer": ("Nurses administer the medicine twice a day.", "护士每天两次给药。"),
    "indigenous": ("The forest is home to many indigenous plants.", "这片森林有许多本土植物。"),
    "decent": ("He found a decent apartment near school.", "他在学校附近找到了一套不错的公寓。"),
    "convey": ("Her letter failed to convey her real feelings.", "她的信没能传达她真实的感受。"),
    "abolish": ("The country voted to abolish the old law.", "该国投票废除了旧法律。"),
    "delicate": ("The glass bowl is beautiful but delicate.", "这个玻璃碗很漂亮但易碎。"),
    "resume": ("The train service will resume tomorrow.", "列车服务将于明天恢复。"),
    "inherit": ("He will inherit the family business.", "他将继承家族企业。"),
    "dull": ("The lecture was long and dull.", "这场讲座又长又乏味。"),
    "dedicate": ("She will dedicate the book to her parents.", "她会把这本书献给父母。"),
    "carve": ("The artist can carve animals from wood.", "这位艺术家能用木头雕刻动物。"),
    "conceive": ("They conceived a new plan overnight.", "他们一夜之间构思了一个新计划。"),
    "cater": ("The hotel can cater for large conferences.", "这家酒店可以承办大型会议餐饮。"),
    "invisible": ("The virus is invisible to the naked eye.", "这种病毒肉眼看不见。"),
    "neat": ("She keeps her desk neat and organized.", "她把书桌保持得整洁有序。"),
    "isolate": ("Doctors had to isolate the patient.", "医生不得不隔离这名病人。"),
    "envisage": ("It is hard to envisage life without phones.", "很难想象没有手机的生活。"),
    "promising": ("The young player has a promising future.", "这位年轻球员前途很有希望。"),
    "concede": ("He refused to concede defeat.", "他拒绝承认失败。"),
    "disclose": ("The company refused to disclose the details.", "公司拒绝透露细节。"),
    "endorse": ("Several experts endorse this method.", "几位专家支持这种方法。"),
    "bold": ("She made a bold decision to start over.", "她大胆决定重新开始。"),
    "blend": ("Blend the flour and milk until smooth.", "把面粉和牛奶混合至顺滑。"),
    "recipient": ("Each recipient received a confirmation email.", "每位收件人都收到了一封确认邮件。"),
    "flip": ("Flip the card to see the answer.", "翻转卡片查看答案。"),
    "striking": ("The painting uses striking colors.", "这幅画使用了醒目的色彩。"),
    "fascinating": ("The lecture was full of fascinating stories.", "这场讲座充满了引人入胜的故事。"),
    "edit": ("She will edit the article tonight.", "她今晚会编辑这篇文章。"),
    "contemplate": ("He sat by the window to contemplate the future.", "他坐在窗边思考未来。"),
    "decorate": ("They decorate the classroom before the festival.", "他们在节日前装饰教室。"),
    "productive": ("The meeting was short but productive.", "这次会议时间短但很有成效。"),
    "exceptional": ("She showed exceptional talent in music.", "她在音乐方面表现出非凡的才能。"),
    "precious": ("Time with family is precious.", "和家人在一起的时间很宝贵。"),
    "enroll": ("You can enroll in the course online.", "你可以在线报名这门课程。"),
    "conceal": ("He tried to conceal his disappointment.", "他试图掩饰自己的失望。"),
    "incur": ("Late payment may incur extra fees.", "逾期付款可能会产生额外费用。"),
    "occupational": ("The company offers occupational health training.", "公司提供职业健康培训。"),
    "coastal": ("They moved to a quiet coastal town.", "他们搬到一个安静的海滨小镇。"),
    "oversee": ("She was hired to oversee the project.", "她受聘监督这个项目。"),
    "stiff": ("My neck feels stiff after the long flight.", "长途飞行后我的脖子感觉僵硬。"),
    "advertise": ("The shop will advertise its sale online.", "这家商店将在网上宣传促销活动。"),
    "dispose": ("Please dispose of batteries safely.", "请安全处理电池。"),
    "specialize": ("The clinic specializes in eye care.", "这家诊所专门从事眼科护理。"),
}


def display_word(word):
    return PROPER_NOUNS.get(word, word)


def meaning_phrase(item):
    value = item.get("meaning", "")
    value = re.sub(r"\b(n|v|vt|vi|adj|adv|a|ad|prep|pron|conj|num|int)\.\s*", "", value, flags=re.I)
    value = re.sub(r"\s+", " ", value).strip()
    first = re.split(r"[；;，,、\s]", value)[0].strip()
    return first or item["word"]


def generated_example(item):
    word = item["word"]
    shown = display_word(word)
    pos = item.get("pos", "").lower()
    meaning = meaning_phrase(item)
    selector = item["id"] % 4

    if word in CUSTOM_EXAMPLES:
        example, example_cn = CUSTOM_EXAMPLES[word]
        return {"id": item["id"], "example": example, "exampleCn": example_cn}

    if word in ADVERB_EXAMPLES:
        example, example_cn = ADVERB_EXAMPLES[word]
        return {"id": item["id"], "example": example, "exampleCn": example_cn}

    if "adv" in pos:
        examples = [
            (f"The issue was {shown} discussed at the meeting.", f"这个问题在会上被{meaning}地讨论了。"),
            (f"She answered {shown} when the teacher called on her.", f"老师点到她时，她{meaning}地作了回答。"),
            (f"The plan changed {shown} after the new data arrived.", f"新数据到来后，计划{meaning}地发生了变化。"),
            (f"He explained the decision {shown} and clearly.", f"他{meaning}而清楚地解释了这个决定。"),
        ]
    elif pos.startswith("adj") or pos.startswith("a."):
        examples = [
            (f"The project required a {shown} approach from the team.", f"这个项目需要团队采取{meaning}的方法。"),
            (f"Her response sounded {shown} in that situation.", f"在那种情况下，她的回应显得很{meaning}。"),
            (f"They needed a more {shown} solution to the problem.", f"他们需要一个更{meaning}的解决方案。"),
            (f"The result was {shown} enough for everyone to notice.", f"结果足够{meaning}，大家都注意到了。"),
        ]
    elif pos.startswith("vt"):
        examples = [
            (f"The team decided to {shown} the issue before Friday.", f"团队决定在周五前{meaning}这个问题。"),
            (f"Please {shown} the document carefully before you send it.", f"发送之前，请仔细{meaning}这份文件。"),
            (f"She tried to {shown} her idea during the meeting.", f"她试图在会议中{meaning}自己的想法。"),
            (f"The manager asked him to {shown} the request today.", f"经理要求他今天{meaning}这个请求。"),
        ]
    elif pos.startswith("vi"):
        examples = [
            (f"They managed to {shown} after several attempts.", f"经过几次尝试后，他们终于能够{meaning}。"),
            (f"The situation may {shown} if no one takes action.", f"如果没人采取行动，情况可能会{meaning}。"),
            (f"She learned to {shown} under pressure.", f"她学会了在压力下{meaning}。"),
            (f"The group continued to {shown} until the work was done.", f"这个小组继续{meaning}，直到工作完成。"),
        ]
    elif pos.startswith("v."):
        examples = [
            (f"They tried to {shown} the problem before noon.", f"他们试图在中午前{meaning}这个问题。"),
            (f"The method can {shown} when conditions are right.", f"条件合适时，这种方法可以{meaning}。"),
            (f"She wanted to {shown} without wasting time.", f"她想不浪费时间地{meaning}。"),
            (f"The class learned how to {shown} in a simple exercise.", f"全班通过一个简单练习学习如何{meaning}。"),
        ]
    else:
        article = "" if shown != word or word.endswith("s") else "the "
        examples = [
            (f"The report explained {article}{shown} in simple language.", f"这份报告用简单语言解释了{meaning}。"),
            (f"The team focused on {article}{shown} during the meeting.", f"团队在会议中重点关注了{meaning}。"),
            (f"She noticed {article}{shown} while reviewing the notes.", f"她复习笔记时注意到了{meaning}。"),
            (f"The story treated {article}{shown} as an important detail.", f"这个故事把{meaning}当作一个重要细节。"),
        ]

    example, example_cn = examples[selector]
    return {"id": item["id"], "example": example, "exampleCn": example_cn}


def write_out_file(path, rows):
    lines = ["["]
    for index, row in enumerate(rows):
        suffix = "," if index < len(rows) - 1 else ""
        lines.append(json.dumps(row, ensure_ascii=False) + suffix)
    lines.append("]")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def ensure_missing_outputs():
    generated = []
    for slice_path in sorted(SLICES_DIR.glob("slice-*.json")):
        out_path = SLICES_DIR / slice_path.name.replace("slice-", "out-")
        if out_path.exists() and out_path.name not in REBUILD_OUTPUTS:
            continue
        rows = json.loads(slice_path.read_text(encoding="utf-8"))
        examples = [generated_example(item) for item in rows]
        write_out_file(out_path, examples)
        generated.append(out_path.name)
    return generated


def load_examples():
    examples = {}
    for out_path in sorted(SLICES_DIR.glob("out-*.json")):
        rows = json.loads(out_path.read_text(encoding="utf-8"))
        for row in rows:
            word_id = row["id"]
            if word_id in examples:
                raise ValueError(f"Duplicate example id: {word_id}")
            examples[word_id] = {"example": row["example"], "exampleCn": row["exampleCn"]}
    return examples


def read_module(path, export_name):
    text = path.read_text(encoding="utf-8")
    pattern = rf"^export const {re.escape(export_name)} = (.*);\n?$"
    match = re.match(pattern, text, flags=re.S)
    if not match:
        raise ValueError(f"Unexpected module format: {path}")
    return json.loads(match.group(1))


def write_module(path, export_name, words):
    data = json.dumps(words, ensure_ascii=False, separators=(",", ":"))
    path.write_text(f"export const {export_name} = {data};\n", encoding="utf-8")


def apply_examples(examples):
    updated = 0
    total = 0
    for filename, export_name in MODULES:
        path = DATA_DIR / filename
        words = read_module(path, export_name)
        for word in words:
            total += 1
            replacement = examples.get(word["id"])
            if not replacement:
                raise ValueError(f"Missing example for id {word['id']} ({word['word']})")
            if word.get("example") != replacement["example"] or word.get("exampleCn") != replacement["exampleCn"]:
                updated += 1
            word.update(replacement)
        write_module(path, export_name, words)
    return updated, total


def main():
    generated = ensure_missing_outputs()
    examples = load_examples()
    if len(examples) != 3000:
        raise ValueError(f"Expected 3000 examples, found {len(examples)}")
    updated, total = apply_examples(examples)
    print(f"generated: {', '.join(generated) if generated else 'none'}")
    print(f"examples: {len(examples)}")
    print(f"updated words: {updated}/{total}")


if __name__ == "__main__":
    main()
