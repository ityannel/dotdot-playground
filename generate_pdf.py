import asyncio
from playwright.async_api import async_playwright
import markdown

md_text = """
# PopPop (.pop) Language Specification

PopPop (ポップポップ) 🎈 is a modern, pipe-oriented programming language designed for data processing.

## Philosophy

"Data enters, logic pops, insights expand."

PopPop emphasizes data streams, declarative pipelines, and lazy evaluation, making it ideal for robust and efficient processing tasks.

## Syntax Overview

### Comments
Comments start with `\/\/`:
```poppop
\/\/ This is a comment
```

### Pipelines
Data flows from left to right using the `>>` operator.
```poppop
10 >> Add(5) >> Display.
```

### Streams
Data streams and lists are defined using square brackets:
```poppop
[1, 2, 3] >> Map(x -> x * 2) >> Display.
```

### Functions
Custom functions can be defined seamlessly:
```poppop
[1, 2] >> Map(n -> n + 1) >> Display.
```
"""

html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @import url('https://cdn.jsdelivr.net/npm/line-seed-jp/dist/line-seed-jp.css');
        body {{
            font-family: 'LINE Seed JP', sans-serif;
            padding: 40px;
            color: #333;
            line-height: 1.6;
        }}
        h1, h2, h3 {{
            color: #2c3e50;
        }}
        code {{
            background: #f4f4f4;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: 'Courier New', Courier, monospace;
        }}
        pre code {{
            display: block;
            padding: 10px;
            white-space: pre-wrap;
        }}
    </style>
</head>
<body>
    {markdown.markdown(md_text, extensions=['fenced_code'])}
</body>
</html>
"""

async def generate_pdf():
    with open("spec_temp.html", "w", encoding="utf-8") as f:
        f.write(html_content)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        import os
        file_url = f"file:///{os.path.abspath('spec_temp.html').replace('\\\\', '/')}"
        await page.goto(file_url)
        # Wait for the font to load
        await page.wait_for_timeout(2000)
        await page.pdf(path="poppop_specification.pdf", format="A4", print_background=True)
        await browser.close()
        print("poppop_specification.pdf generated successfully.")

asyncio.run(generate_pdf())
