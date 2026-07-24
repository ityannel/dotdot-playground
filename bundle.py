import os
import base64
import re

files_to_bundle = [
    'src/lexer.py',
    'src/parser.py',
    'src/evaluator.py',
    'src/ast_nodes.py',
    'src/environment.py',
    'src/pop_builtins.py',
    'src/__init__.py',
    'poppop.py'
]

file_data = {}
for fpath in files_to_bundle:
    with open(fpath, 'rb') as f:
        file_data[fpath] = base64.b64encode(f.read()).decode('utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# We want to replace the initPyodide function in index.html
js_code = '''
        async function initPyodide() {
            pyodideInstance = await loadPyodide();
            pyodideInstance.FS.mkdir('src');
            
            const b64Data = {
'''
for k, v in file_data.items():
    js_code += f'                "{k}": "{v}",\n'

js_code += '''
            };
            
            function b64DecodeUnicode(str) {
                // Better decode logic for utf-8
                const binString = atob(str);
                const bytes = new Uint8Array(binString.length);
                for (let i = 0; i < binString.length; i++) {
                    bytes[i] = binString.charCodeAt(i);
                }
                return new TextDecoder().decode(bytes);
            }

            for (const [fpath, b64] of Object.entries(b64Data)) {
                pyodideInstance.FS.writeFile(fpath, b64DecodeUnicode(b64));
            }
            
            return pyodideInstance;
        }
'''

new_html = re.sub(r'async function initPyodide\(\) \{[\s\S]*?return pyodideInstance;\s*\}', js_code.strip(), html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print('Bundled successfully!')
