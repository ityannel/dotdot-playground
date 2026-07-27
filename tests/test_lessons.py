import asyncio

from poppop_lang.cli import evaluate
from poppop_lang.lessons import LESSONS, public_lessons, validate_lesson


def test_all_lesson_solutions_run_and_pass():
    for lesson in LESSONS:
        result = asyncio.run(evaluate(lesson["solution"]))
        validation = validate_lesson(lesson["id"], lesson["solution"], result)
        assert validation["passed"], lesson["id"]


def test_starters_do_not_already_pass():
    for lesson in LESSONS:
        result = asyncio.run(evaluate(lesson["starter"]))
        validation = validate_lesson(lesson["id"], lesson["starter"], result)
        assert not validation["passed"], lesson["id"]


def test_public_lessons_do_not_duplicate_validation_values():
    lessons = public_lessons()
    assert len(lessons) == len(LESSONS)
    assert all("expected" not in lesson for lesson in lessons)
    assert all("required" not in lesson for lesson in lessons)
