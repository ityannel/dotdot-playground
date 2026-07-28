"""Interactive lessons shipped with the PopPop runtime.

Keeping these definitions beside the interpreter lets the browser tutor use
the same release archive as the language itself.
"""

from __future__ import annotations

from typing import Any


LESSONS = (
    {
        "id": "pipeline",
        "title": "Hello, World!",
        "badge": "01",
        "intro": "最初の一問です。文字列を Display へ流して、画面に表示してみよう。",
        "goal": '"Hello, World!" と表示してください。',
        "starter": '"Hello" >> Display.',
        "solution": '"Hello, World!" >> Display.',
        "hints": (
            "`>> Display.` の左側にある文字列が、そのまま出力されます。",
            '文字列を `"Hello, World!"` に書き換えてみましょう。',
        ),
        "expected": "Hello, World!",
        "required": (">>", "Display", '"Hello, World!"'),
        "success": "Hello, World! PopPopの最初のプログラムが動きました。",
    },
    {
        "id": "map",
        "title": "Mapで全員を変換",
        "badge": "02",
        "intro": "Map は List の各要素に同じ処理を行い、新しい List を返すよ。",
        "goal": "各要素を2倍にして、[2, 4, 6] を作ってください。",
        "starter": (
            "[1, 2, 3] >> Map(value):\n"
            "    value + 1.\n"
            ".. >> doubled.\n\n"
            "doubled >> Display."
        ),
        "solution": (
            "[1, 2, 3] >> Map(value):\n"
            "    value * 2.\n"
            ".. >> doubled.\n\n"
            "doubled >> Display."
        ),
        "hints": (
            "ブロック内の value は、List から取り出された現在の要素です。",
            "`value + 1` を `value * 2` に変えてみましょう。",
        ),
        "expected": [2, 4, 6],
        "required": ("Map", "*", "Display"),
        "success": "大成功！ Map は元の List を変えず、新しい List を作ります。",
    },
    {
        "id": "filter",
        "title": "Filterで選び出す",
        "badge": "03",
        "intro": "Filter は、条件が true になった要素だけを残す処理だよ。",
        "goal": "[1, 2, 3, 4] から偶数だけを残してください。",
        "starter": (
            "[1, 2, 3, 4] >> Filter(value):\n"
            "    value > 2.\n"
            ".. >> evens.\n\n"
            "evens >> Display."
        ),
        "solution": (
            "[1, 2, 3, 4] >> Filter(value):\n"
            "    value % 2 == 0.\n"
            ".. >> evens.\n\n"
            "evens >> Display."
        ),
        "hints": (
            "偶数は、2で割った余りが0になる数です。",
            "条件を `value % 2 == 0` にしてみましょう。",
        ),
        "expected": [2, 4],
        "required": ("Filter", "%", "==", "Display"),
        "success": "正解！ Filter のブロックは必ず Boolean を返します。",
    },
    {
        "id": "reduce",
        "title": "Reduceでまとめる",
        "badge": "04",
        "intro": "Reduce の現在値は [これまでの結果, 次の要素] という List だよ。",
        "goal": "四つの数値を足し、合計10を作ってください。",
        "starter": (
            "[1, 2, 3, 4] >> Reduce(state):\n"
            "    state[0] * state[1].\n"
            ".. >> total.\n\n"
            "total >> Display."
        ),
        "solution": (
            "[1, 2, 3, 4] >> Reduce(state):\n"
            "    state[0] + state[1].\n"
            ".. >> total.\n\n"
            "total >> Display."
        ),
        "hints": (
            "`state[0]` が accumulator、`state[1]` が次の要素です。",
            "二つを `+` で足してください。",
        ),
        "expected": 10,
        "required": ("Reduce", "state[0]", "state[1]", "+", "Display"),
        "success": "合計できました！ 最初の要素が最初の accumulator になります。",
    },
    {
        "id": "update",
        "title": "辞書を非破壊更新",
        "badge": "05",
        "intro": "Update は元の Dict を残したまま、更新後の Dict を作るよ。",
        "goal": "score を15にし、active を true にしてください。",
        "starter": (
            '{"name": "Ada", "score": 10} >> Update(user):\n'
            "    11 >> user::score.\n"
            ".. >> updated.\n\n"
            "updated >> Display."
        ),
        "solution": (
            '{"name": "Ada", "score": 10} >> Update(user):\n'
            "    15 >> user::score.\n"
            "    true >> user::active.\n"
            ".. >> updated.\n\n"
            "updated >> Display."
        ),
        "hints": (
            "更新は `新しい値 >> user::フィールド名.` の向きです。",
            "`15 >> user::score.` と `true >> user::active.` を並べましょう。",
        ),
        "expected": {"name": "Ada", "score": 15, "active": True},
        "required": ("Update", "::score", "::active", "Display"),
        "success": "できました！ 元の Dict は変更されず、updated が新しく作られます。",
    },
    {
        "id": "check",
        "title": "Checkで道を選ぶ",
        "badge": "06",
        "intro": "Check は上から条件を調べ、最初に一致した道だけを実行するよ。",
        "goal": "2を small に分類してください。else は必ず残します。",
        "starter": (
            "2 >> Check(value):\n"
            "    is 0:\n"
            '        "zero".\n'
            "    else:\n"
            '        "unknown".\n'
            ".. >> label.\n\n"
            "label >> Display."
        ),
        "solution": (
            "2 >> Check(value):\n"
            "    is 0:\n"
            '        "zero".\n'
            "    is 1 or 2 or 3:\n"
            '        "small".\n'
            "    else:\n"
            '        "large".\n'
            ".. >> label.\n\n"
            "label >> Display."
        ),
        "hints": (
            "`is 1 or 2 or 3:` で候補のどれかに一致するか調べられます。",
            "新しい is 分岐の中から文字列 `\"small\"` を返してください。",
        ),
        "expected": "small",
        "required": ("Check", "is 1 or 2 or 3", "else", "Display"),
        "success": "分岐成功！ 一致しなかった場合のために else は必須です。",
    },
    {
        "id": "function",
        "title": "自分の関数を作る",
        "badge": "07",
        "intro": "`new` を使うと、何度でも使える自分の処理を定義できるよ。",
        "goal": "AddTwo が二つの入力を足して30を返すようにしてください。",
        "starter": (
            "(left, right) >> new AddTwo:\n"
            "    left - right.\n"
            "..\n\n"
            "(10, 20) >> AddTwo >> total.\n"
            "total >> Display."
        ),
        "solution": (
            "(left, right) >> new AddTwo:\n"
            "    left + right.\n"
            "..\n\n"
            "(10, 20) >> AddTwo >> total.\n"
            "total >> Display."
        ),
        "hints": (
            "関数の最後の値は暗黙に関数結果になります。",
            "`left - right` の演算子を `+` に変えてください。",
        ),
        "expected": 30,
        "required": ("new AddTwo", "left + right", "Display"),
        "success": "関数が完成！ 最後の値を返すだけなら Return は省略できます。",
    },
    {
        "id": "loop",
        "title": "Loopを止める",
        "badge": "08",
        "intro": "Loop は状態を繰り返し渡し、Break を受け取るまで進み続けるよ。",
        "goal": "0から1ずつ増やし、5になったら止めてください。",
        "starter": (
            "0 >> Loop(state):\n"
            "    state >> Check(value):\n"
            "        is value >= 3:\n"
            "            value >> Break.\n"
            "        else:\n"
            "            value + 1.\n"
            "    ..\n"
            ".. >> result.\n\n"
            "result >> Display."
        ),
        "solution": (
            "0 >> Loop(state):\n"
            "    state >> Check(value):\n"
            "        is value >= 5:\n"
            "            value >> Break.\n"
            "        else:\n"
            "            value + 1.\n"
            "    ..\n"
            ".. >> result.\n\n"
            "result >> Display."
        ),
        "hints": (
            "Break に渡した値が Loop 全体の結果になります。",
            "停止条件の3を5に変えてください。止まらなくなったら上の「停止」を押せます。",
        ),
        "expected": 5,
        "required": ("Loop", "Break", "value >= 5", "Display"),
        "success": "全レッスン修了！ Loop と Break を安全に扱えました。",
    },
)


def public_lessons() -> list[dict[str, Any]]:
    """Return JSON-safe lesson data for the Playground."""

    private = {"expected", "required"}
    return [
        {key: value for key, value in lesson.items() if key not in private}
        for lesson in LESSONS
    ]


def validate_lesson(lesson_id: str, source: str, result: Any) -> dict[str, Any]:
    """Validate a successful evaluation against one lesson."""

    lesson = next((item for item in LESSONS if item["id"] == lesson_id), None)
    if lesson is None:
        return {"passed": False, "message": "レッスン情報を確認できませんでした。"}

    missing = [text for text in lesson["required"] if text not in source]
    if missing:
        return {
            "passed": False,
            "message": f"結果に近づいています。今回は `{missing[0]}` を使ってみましょう。",
        }

    if result != lesson["expected"] or type(result) is not type(lesson["expected"]):
        return {
            "passed": False,
            "message": (
                f"もう一歩です。今の結果は {result!r}。"
                "課題のゴールをもう一度確認してみましょう。"
            ),
        }

    return {"passed": True, "message": lesson["success"]}
