import codecs

html_content = '''<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PopPop Terminal</title>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'JetBrains Mono', monospace;
            background: #000000;
            color: #d4d4d4;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        /* ── Header ── */
        header {
            padding: 0.75rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #1e1e1e;
            border-bottom: 1px solid #333;
        }

        .logo {
            font-size: 1.1rem;
            font-weight: 700;
            color: #00ff00;
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .shortcut-hint {
            font-size: 0.75rem;
            color: #666;
        }

        button, select {
            font-family: 'JetBrains Mono', monospace;
            background: #252526;
            color: #d4d4d4;
            border: 1px solid #3c3c3c;
            padding: 0.4rem 0.8rem;
            font-size: 0.85rem;
            cursor: pointer;
        }
        button:hover, select:hover { background: #333; }
        
        .run-btn { color: #00ff00; border-color: #005500; }
        .run-btn:hover { background: #002200; }
        .run-btn.running { opacity: 0.5; pointer-events: none; }
        
        .clear-btn { color: #ff5555; border-color: #550000; }
        .clear-btn:hover { background: #220000; }

        /* ── Main Layout ── */
        .main-container {
            display: flex;
            flex: 1;
            padding: 0;
            height: calc(100vh - 46px - 26px); /* Header + Footer */
        }

        .panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            border-right: 1px solid #333;
        }
        .panel:last-child { border-right: none; }

        .panel-header {
            padding: 0.4rem 1rem;
            font-size: 0.8rem;
            color: #888;
            background: #252526;
            border-bottom: 1px solid #333;
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        
        .tab-btn {
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 0.2rem 0;
            border-bottom: 2px solid transparent;
        }
        .tab-btn.active {
            color: #00ff00;
            border-bottom-color: #00ff00;
        }

        /* ── Editor ── */
        .editor-wrap {
            position: relative;
            flex: 1;
            overflow: hidden;
            background: #1e1e1e;
        }
        .editor-wrap pre,
        .editor-wrap textarea {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.95rem;
            line-height: 1.6;
            padding: 1rem;
            margin: 0;
            border: none;
            white-space: pre-wrap;
            word-wrap: break-word;
            tab-size: 4;
        }
        .editor-wrap pre {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            overflow: auto;
            pointer-events: none;
            color: transparent;
            background: transparent;
        }
        .editor-wrap textarea {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            resize: none;
            outline: none;
            background: transparent;
            color: transparent;
            caret-color: #d4d4d4;
            z-index: 2;
        }

        /* ── Syntax Highlighting (Dark Theme) ── */
        .hl-keyword   { color: #c586c0; font-weight: bold; } /* Purple */
        .hl-builtin   { color: #4ec9b0; } /* Cyan */
        .hl-string    { color: #ce9178; } /* Orange */
        .hl-number    { color: #b5cea8; } /* Light Green */
        .hl-operator  { color: #d4d4d4; } /* White */
        .hl-comment   { color: #6a9955; font-style: italic; } /* Green */
        .hl-implicit  { color: #9cdcfe; } /* Light Blue */
        .hl-dot       { color: #d4d4d4; }
        .hl-text      { color: #d4d4d4; }

        /* ── Console / Flow ── */
        .console, .flow-view {
            flex: 1;
            padding: 1rem;
            font-size: 0.9rem;
            line-height: 1.5;
            overflow-y: auto;
            background: #000000;
        }
        .flow-view { display: none; background: #0a0a0a; }
        
        .console-output { color: #d4d4d4; white-space: pre-wrap; }
        .console-error { color: #f44747; margin-top: 1rem; white-space: pre-wrap; }
        .console-welcome { color: #666; font-style: italic; }
        
        .loading { display: none; color: #00ff00; }

        /* ── Status bar ── */
        .status-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.2rem 1rem;
            font-size: 0.75rem;
            background: #007acc;
            color: #ffffff;
        }

        /* ── AST Visualizer CSS ── */
        .ast-node {
            display: inline-block;
            border: 1px solid #444;
            background: #1e1e1e;
            padding: 0.5rem 1rem;
            margin: 0.5rem;
            border-radius: 4px;
            color: #00ff00;
            text-align: center;
        }
        .ast-label { font-size: 0.8rem; color: #888; display: block; margin-bottom: 0.2rem; }
        .ast-arrow {
            display: inline-block;
            color: #555;
            font-weight: bold;
            margin: 0 0.2rem;
        }
        .ast-block {
            border: 1px dashed #555;
            padding: 1rem;
            margin: 0.5rem;
            background: #111;
        }
        .ast-block-title { color: #c586c0; font-size: 0.8rem; margin-bottom: 0.5rem; }

        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: #1e1e1e; }
        ::-webkit-scrollbar-thumb { background: #424242; }
        ::-webkit-scrollbar-thumb:hover { background: #4f4f4f; }
    </style>
<script src="https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js"></script>
</head>
<body>
    <header>
        <div class="logo">
            root@poppop:~#
        </div>
        <div class="header-actions">
            <select id="sample-select">
                <option value="hello">hello.pop</option>
                <option value="basic">basics.pop</option>
                <option value="pipeline">pipeline.pop</option>
                <option value="check">check.pop</option>
                <option value="map_filter">map_filter.pop</option>
                <option value="reduce">reduce.pop</option>
                <option value="fork">fork.pop</option>
                <option value="customfunc">function.pop</option>
                <option value="interactive">interactive.pop</option>
                <option value="empty">empty.pop</option>
            </select>
            <button class="clear-btn" id="clear-btn">[ CLEAR ]</button>
            <span class="shortcut-hint">^Enter = Run</span>
            <button class="run-btn" id="run-btn">[ RUN ]</button>
        </div>
    </header>

    <div class="main-container">
        <div class="panel">
            <div class="panel-header">~/editor.pop</div>
            <div class="editor-wrap">
                <pre id="highlight-layer"><code id="highlight-code"></code></pre>
                <textarea id="code-editor" spellcheck="false"></textarea>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header">
                <button class="tab-btn active" id="tab-console">stdout</button>
                <button class="tab-btn" id="tab-flow">dataflow_viz</button>
            </div>
            
            <div class="console" id="console-view">
                <div id="loading" class="loading">Executing...</div>
                <div id="output" class="console-output console-welcome">Ready.</div>
                <div id="error" class="console-error" style="display: none;"></div>
            </div>
            
            <div class="flow-view" id="flow-view">
                <div id="flow-content" style="color:#666;">Run code to see the data flow...</div>
            </div>
        </div>
    </div>

    <div class="status-bar">
        <span>NORMAL</span>
        <span id="line-info">Ln 1, Col 1</span>
    </div>

    <script>
        // ── Syntax Highlighting ──
        const KEYWORDS = ['check', 'is', 'else', 'end', 'do', 'each', 'loop', 'break', 'new', 'must', 'be'];
        const BUILTINS = ['Display', 'Input', 'Int', 'Str', 'Return', 'Break', 'Fetch', 'FromJson', 'ToJson', 'Format', 'Type', 'Range', 'Array', 'Set', 'Len', 'Append', 'Serve', 'PostFetch', 'Import', 'Keys', 'Values', 'Slice', 'Join', 'Split', 'Replace', 'Contains', 'Upper', 'Lower', 'Trim', 'Map', 'Filter', 'Sort', 'Reverse', 'Sum', 'Min', 'Max', 'Unique', 'Flat', 'Zip', 'Enumerate'];

        function escapeHtml(text) {
            return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function highlightCode(code) {
            const lines = code.split('\\n');
            return lines.map(line => {
                let result = '';
                let i = 0;
                while (i < line.length) {
                    if (line[i] === '/' && line[i+1] === '/') {
                        result += '<span class="hl-comment">' + escapeHtml(line.substring(i)) + '</span>';
                        i = line.length;
                        continue;
                    }
                    if (line[i] === '"' || line[i] === "'") {
                        const quote = line[i];
                        let j = i + 1;
                        while (j < line.length && line[j] !== quote) j++;
                        j++;
                        result += '<span class="hl-string">' + escapeHtml(line.substring(i, j)) + '</span>';
                        i = j;
                        continue;
                    }
                    if (/[0-9]/.test(line[i]) && (i === 0 || /[\\s\\[\\(,\\>\\>:=!<>+\\-*/%&]/.test(line[i-1]))) {
                        let j = i;
                        while (j < line.length && /[0-9.]/.test(line[j])) j++;
                        result += '<span class="hl-number">' + escapeHtml(line.substring(i, j)) + '</span>';
                        i = j;
                        continue;
                    }
                    if (line[i] === '@') {
                        let j = i + 1;
                        while (j < line.length && /[a-zA-Z0-9_.]/.test(line[j])) j++;
                        result += '<span class="hl-implicit">' + escapeHtml(line.substring(i, j)) + '</span>';
                        i = j;
                        continue;
                    }
                    if (line[i] === '>' && line[i+1] === '>') {
                        result += '<span class="hl-operator">&gt;&gt;</span>';
                        i += 2;
                        continue;
                    }
                    if ('+-*/%&!=<>'.includes(line[i])) {
                        let op = line[i];
                        if (i + 1 < line.length && '='.includes(line[i+1])) { op += line[i+1]; i++; }
                        result += '<span class="hl-operator">' + escapeHtml(op) + '</span>';
                        i++;
                        continue;
                    }
                    if (line[i] === '.' && line[i+1] === '.') {
                        result += '<span class="hl-keyword">..</span>';
                        i += 2;
                        continue;
                    }
                    if (line[i] === '.' && (i + 1 >= line.length || /[\\s\\n]/.test(line[i+1]))) {
                        result += '<span class="hl-dot">.</span>';
                        i++;
                        continue;
                    }
                    if (/[a-zA-Z_]/.test(line[i])) {
                        let j = i;
                        while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++;
                        const word = line.substring(i, j);
                        if (KEYWORDS.includes(word.toLowerCase())) {
                            result += '<span class="hl-keyword">' + escapeHtml(word) + '</span>';
                        } else if (BUILTINS.includes(word)) {
                            result += '<span class="hl-builtin">' + escapeHtml(word) + '</span>';
                        } else {
                            result += '<span class="hl-text">' + escapeHtml(word) + '</span>';
                        }
                        i = j;
                        continue;
                    }
                    result += '<span class="hl-text">' + escapeHtml(line[i]) + '</span>';
                    i++;
                }
                return result;
            }).join('\\n');
        }

        const editor = document.getElementById("code-editor");
        const highlightCode_el = document.getElementById("highlight-code");
        const highlightLayer = document.getElementById("highlight-layer");

        const SAMPLES = {
            hello: `// 👋 Welcome to PopPop Terminal
"Hello, PopPop!" >> Display.

42 >> answer.
"答え: {0}" & answer >> Format >> Display.
`,
            basic: `[3, 1, 4, 1, 5, 9] >> Sort >> Reverse >> data.
"降順: {0}" & data >> Format >> Display.
`,
            pipeline: `"hello, world" >> Upper >> msg.
"大文字: {0}" & msg >> Format >> Display.

-42 >> Abs >> Display.
`,
            check: `42 >> check:
    is > 100: "大きい！" >> Display.
    is 42:    "人生、宇宙、すべての答え！" >> Display.
    else:     "普通の数字" >> Display.
..
`,
            map_filter: `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
>> Filter:
    @ % 2 == 0 >> Return.
..
>> Map:
    @ * @ >> Return.
..
>> Display.
`,
            reduce: `[1, 2, 3, 4, 5] >> Reduce:
    @[0] + @[1] >> Return.
.. >> result.
"合計: {0}" & result >> Format >> Display.
`,
            fork: `[1, 2, 3, 4, 5] >> Fork:
    @ >> Sum >> Display.
    @ >> Max >> Display.
    @ >> Min >> Display.
..
`,
            customfunc: `(int a & int b) >> new Plus:
    a + b >> Return.
end.

(10 & 20) >> Plus >> Display.
`,
            interactive: `"何が食べたいですか?: " >> Input >> answer.
answer >> check:
    is "カレーライス": "カレー！" >> Display.
    else: "あっそ" >> Display.
..
`,
            empty: ``
        };

        const sampleSelect = document.getElementById('sample-select');
        sampleSelect.addEventListener('change', (e) => {
            if (SAMPLES[e.target.value] !== undefined) {
                editor.value = SAMPLES[e.target.value];
                syncHighlight();
                updateLineInfo();
            }
        });

        editor.value = SAMPLES.hello;

        function syncHighlight() { highlightCode_el.innerHTML = highlightCode(editor.value) + '\n'; }
        function syncScroll() { highlightLayer.scrollTop = editor.scrollTop; highlightLayer.scrollLeft = editor.scrollLeft; }

        editor.addEventListener('input', syncHighlight);
        editor.addEventListener('scroll', syncScroll);
        syncHighlight();

        const lineInfo = document.getElementById('line-info');
        function updateLineInfo() {
            const val = editor.value.substring(0, editor.selectionStart);
            const lines = val.split('\n');
            lineInfo.textContent = `Ln ${lines.length}, Col ${lines[lines.length-1].length + 1}`;
        }
        editor.addEventListener('input', updateLineInfo);
        editor.addEventListener('click', updateLineInfo);
        editor.addEventListener('keyup', updateLineInfo);

        // ── Tabs ──
        const tabConsole = document.getElementById('tab-console');
        const tabFlow = document.getElementById('tab-flow');
        const viewConsole = document.getElementById('console-view');
        const viewFlow = document.getElementById('flow-view');

        tabConsole.onclick = () => {
            tabConsole.classList.add('active'); tabFlow.classList.remove('active');
            viewConsole.style.display = 'block'; viewFlow.style.display = 'none';
        };
        tabFlow.onclick = () => {
            tabFlow.classList.add('active'); tabConsole.classList.remove('active');
            viewFlow.style.display = 'block'; viewConsole.style.display = 'none';
        };

        // ── Visualizer Logic ──
        function renderAST(astJson) {
            let html = '';
            try {
                const ast = JSON.parse(astJson);
                if (ast.error) {
                    return `<div style="color:red">Parse Error: ${escapeHtml(ast.error)}</div>`;
                }
                
                function renderNode(node) {
                    if (!node || typeof node !== 'object') return escapeHtml(String(node));
                    
                    if (node.type === 'Program') {
                        return node.statements.map(renderNode).join('<hr style="border:0; border-top:1px dashed #333; margin:1rem 0;">');
                    }
                    else if (node.type === 'Pipeline') {
                        let html = '';
                        for (let i = 0; i < node.nodes.length; i++) {
                            html += renderNode(node.nodes[i]);
                            if (i < node.ops.length) {
                                html += `<span class="ast-arrow">>></span>`;
                            }
                        }
                        return html;
                    }
                    else if (node.type === 'LiteralNode') {
                        return `<div class="ast-node"><span class="ast-label">Literal</span>${escapeHtml(String(node.value))}</div>`;
                    }
                    else if (node.type === 'VariableNode' || node.type === 'ImplicitVariableNode') {
                        return `<div class="ast-node"><span class="ast-label">${node.type === 'VariableNode' ? 'Var' : 'Implicit'}</span>${escapeHtml(node.name)}</div>`;
                    }
                    else if (node.type === 'FunctionCallNode') {
                        return `<div class="ast-node"><span class="ast-label">Call</span>${escapeHtml(node.name)}()</div>`;
                    }
                    else if (node.type === 'BlockNode') {
                        let pipelines = node.pipelines.map(renderNode).join('<br>');
                        return `<div class="ast-block">${pipelines}</div>`;
                    }
                    else if (node.type === 'CheckBlock') {
                        let branches = node.branches.map(b => {
                            let cond = b.condition ? "is " + renderNode(b.condition) : "else";
                            return `<div style="margin-left: 1rem;"><strong>${cond}:</strong> ${renderNode(b.body)}</div>`;
                        }).join('');
                        return `<div class="ast-block"><div class="ast-block-title">check:</div>${branches}</div>`;
                    }
                    else if (node.type === 'ForkBlock') {
                        return `<div class="ast-block"><div class="ast-block-title">Fork:</div>${node.pipelines.map(renderNode).join('')}</div>`;
                    }
                    else {
                        return `<div class="ast-node"><span class="ast-label">${node.type}</span>...</div>`;
                    }
                }
                
                html = renderNode(ast);
            } catch (e) {
                html = `<div style="color:red">Visualizer Error: ${escapeHtml(e.message)}</div>`;
            }
            return html;
        }

        // ── Pyodide Setup ──
        let pyodideReadyPromise;
        let pyodideInstance;

        async function initPyodide() {
            pyodideInstance = await loadPyodide();
            const files = ['lexer.py', 'parser.py', 'evaluator.py', 'ast_nodes.py', 'environment.py', 'poppop.py'];
            await Promise.all(files.map(async (f) => {
                let res = await fetch('src/' + f + '?t=' + Date.now());
                if (!res.ok) throw new Error(`Failed to load ${f}`);
                let text = await res.text();
                pyodideInstance.FS.writeFile(f, text);
            }));
            return pyodideInstance;
        }
        
        pyodideReadyPromise = initPyodide();

        document.getElementById('run-btn').addEventListener('click', async () => {
            const runBtn = document.getElementById('run-btn');
            const outputEl = document.getElementById('output');
            const errorEl = document.getElementById('error');
            const loadingEl = document.getElementById('loading');
            const flowContent = document.getElementById('flow-content');
            const code = editor.value;

            outputEl.textContent = '';
            outputEl.classList.remove('console-welcome');
            errorEl.style.display = 'none';
            loadingEl.style.display = 'block';
            runBtn.classList.add('running');
            flowContent.innerHTML = '<span style="color:#666">Analyzing...</span>';

            try {
                await pyodideReadyPromise;
                
                pyodideInstance.FS.writeFile('playground.pop', code);
                
                const result = await pyodideInstance.runPythonAsync(`
import sys
import poppop
from io import StringIO
from js import prompt as js_prompt

import builtins
_original_input = builtins.input
def _browser_input(p=""):
    result = js_prompt(str(p))
    if result is None: return ""
    return result
builtins.input = _browser_input

sys.stdout = StringIO()
sys.stderr = StringIO()

ast_json = "{}"
try:
    with open('playground.pop', 'r', encoding='utf-8') as f:
        source = f.read()
    
    ast_json = poppop.get_ast_json(source)
    poppop.run_code(source)
except Exception as e:
    import traceback
    traceback.print_exc()

out = sys.stdout.getvalue()
err = sys.stderr.getvalue()
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
builtins.input = _original_input

(out, err, ast_json)
                \);

                const stdout = result.get(0);
                const stderr = result.get(1);
                const astJson = result.get(2);

                if (stdout) { outputEl.textContent = stdout; }
                if (stderr) { errorEl.textContent = stderr; errorEl.style.display = 'block'; }
                if (!stdout && !stderr) { outputEl.textContent = " "; }
                
                flowContent.innerHTML = renderAST(astJson);

            } catch (err) {
                errorEl.textContent = "Error executing code:\\n" + err;
                errorEl.style.display = 'block';
            } finally {
                loadingEl.style.display = 'none';
                runBtn.classList.remove('running');
            }
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            editor.value = "";
            syncHighlight();
            updateLineInfo();
        });
        
        editor.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault(); document.getElementById('run-btn').click();
            }
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 4;
                syncHighlight();
            }
        });
        updateLineInfo();
    </script>
</body>
</html>'''

with codecs.open("index.html", "w", "utf-8") as f:
    f.write(html_content)
