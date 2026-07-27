# PopPop

> Experimental alpha — the syntax and runtime may change.

Current release: **v0.0.0.1 - PopCorn**

PopPop is a small, pipeline-oriented programming language. Values move from
left to right through `>>`, and each statement ends with `.`.

```poppop
[1, 2, 3] >> Map:
    @ * 2.
.. >> doubled.

doubled >> Display.
```

The current interpreter is implemented in Python. PopPop is a language
experiment, not a production runtime or security sandbox.

## Install

PopPop requires Python 3.10 or newer.

```bash
python -m pip install .
poppop --version
```

For development:

```bash
python -m pip install -e ".[dev]"
python -m pytest
```

## Run

```bash
poppop program.pop
```

Start the REPL by running `poppop` without a file. Use `:quit` to exit.

From a source checkout, `python poppop.py program.pop` is also supported.

## Playground

The browser Playground runs the same Python lexer, parser, evaluator, and
built-ins as the command-line interpreter through Pyodide. Its examples and
function reference are loaded from the current
`poppop_specification.md`, rather than maintained as a separate language copy.
The **ロボット君** tab provides eight interactive Japanese lessons. Exercises
are evaluated by the real interpreter, with conversational feedback, hints,
answers, error guidance, and progress saved in the browser.

The example gallery uses consistent Japanese category names and includes
FizzBuzz, a fortune teller, number guessing, rock-paper-scissors, a dice game,
a quiz, a countdown, and smaller pipeline exercises.

Start it locally from the repository root:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. Opening `index.html` directly is not
supported because browsers block the source requests used by the runtime.

GitHub Pages is rebuilt automatically after relevant files are pushed to
`main` or `master`. The deployment packages every current `poppop_lang`
Python module, so newly added interpreter modules are included without editing
the Playground loader.

## Language status

The language is documented in
[poppop_specification.md](poppop_specification.md).

The repository also contains the optional Japanese VS Code extension in
`vscode-poppop`.

## Safety

PopPop code can access the file system and network through built-ins such as
`Fetch`, `PostFetch`, and `WriteFile`. Only run programs you trust. See
[SECURITY.md](SECURITY.md).

## License

MIT
