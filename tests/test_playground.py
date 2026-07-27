from pathlib import Path
from zipfile import ZipFile

from poppop_lang.version import DISPLAY_VERSION
from tools.build_playground_runtime import build_archive


ROOT = Path(__file__).resolve().parents[1]


def test_release_identity_is_visible_to_the_playground():
    assert DISPLAY_VERSION == "v0.0.0.1 - PopCorn"
    assert DISPLAY_VERSION in (ROOT / "poppop_specification.md").read_text(
        encoding="utf-8"
    )


def test_playground_runtime_archive_contains_every_python_module(tmp_path):
    output = tmp_path / "poppop-runtime.zip"
    build_archive(output)
    expected = {
        path.relative_to(ROOT).as_posix()
        for path in (ROOT / "poppop_lang").rglob("*.py")
    }
    with ZipFile(output) as archive:
        assert set(archive.namelist()) == expected


def test_playground_uses_the_current_runtime_and_specification():
    worker = (ROOT / "playground-worker.js").read_text(encoding="utf-8")
    application = (ROOT / "playground.js").read_text(encoding="utf-8")
    assert "poppop-runtime.zip" in worker
    assert 'cache: "no-store"' in worker
    assert "poppop_specification.md" in application
    assert 'cache: "no-store"' in application
    assert "handleLessonResult" in application
    assert '"lessons": public_lessons()' in worker
    assert '"gallery": public_gallery()' in worker
    assert "friendlySpecificationExamples" in application
