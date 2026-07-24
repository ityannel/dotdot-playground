# PopPop (..) Language

**PopPop** is a radical, pipeline-oriented programming language where **dataflow strictly goes from left to right**. 
If you love functional programming, method chaining, or terminal pipes (`|`), PopPop takes it to the ultimate extreme. There are no nested function calls, no reading inside out—just pure, unapologetic data transformation.

## 🍿 Popcorn — Windows 版のインストール

GitHub の **Releases** から `PopPop-Japanese-Popcorn-1.8.0.vsix` をダウンロードし、VS Code で次の手順を実行してください。

1. 拡張機能ビューを開く。
2. `…` メニューから **Install from VSIX...** を選ぶ。
3. ダウンロードした `.vsix` を選び、VS Code を再読み込みする。

`.pop` または `.poppop` を開くと、色分け、日本語ホバー、データフロー図、実行ボタンを利用できます。Windows 版には PopPop 実行器が同梱されているため、Python の追加インストールは不要です。

## 🚀 The Philosophy
1. **Left-to-Right Dataflow (The Pipeline Principle)**: Everything is a pipeline. Data starts on the left and flows to the right. 
2. **Tacit Programming**: There is no `f(x)` syntax. Period. You push data into functions using the pipeline operator `>>`.
3. **No Variables Before Data**: You cannot declare a variable and assign data to it. The data must exist first, and then it is bound to a name at the end of the pipeline.

## 📦 Features

### The Basics
In PopPop, data flows through pipes `>>` and statements end with a dot `.`.

```poppop
// Traditional: let x = max([1, 2, 3]); print(x);
// PopPop:
[1, 2, 3] >> Max >> x.
x >> Display.
```

### Property & Index Access (`::`)
Access object properties or array indices using the universal accessor `::`.

```poppop
{"name": "Alice", "age": 25} >> user.
user::name >> Display. // Outputs "Alice"

[10, 20, 30] >> arr.
arr::1 >> Display. // Outputs 20
```

### Stream Blocks & Configurable Implicit Variables
Transform data arrays beautifully using Stream Blocks like `Map:`, `Filter:`, `Reduce:`, `Sort:`, and `Group:`. You can explicitly name your variables instead of relying on magic context!

```poppop
// Map with a custom block variable @val
[1, 2, 3] >> Map @val:
    @val * 2 >> Return.
.. >> result.

// Reduce with accumulator @sum and item @val
[10, 20, 30] >> Reduce @sum @val:
    @sum + @val >> Return.
.. >> Display. // 60
```

### Zipping Streams
Process multiple arrays in parallel using the `Zip:` block.

```poppop
([100, 200] & [0.1, 0.2]) >> Zip @price @tax:
    @price * @tax >> Return.
.. >> Display. // [10.0, 40.0]
```

### The Error Catching Pipeline (`>~>`)
Handle exceptions gracefully in the middle of a pipeline. If the operation fails, fallback to the default value!

```poppop
"invalid_number" >> Int >~> 0 >> Display. // Safely outputs 0
```

### Destructuring Assignment
Extract multiple values directly from a list or bundle at the end of your pipeline.

```poppop
("Alice,25" & ",") >> Split >> (name & age).
$"Name: {@::name}, Age: {@::age}" >> Display.
```

### String Interpolation (`$""`)
Embed variables and expressions cleanly into strings using `$"{...}"`.

```poppop
{"user": "Bob", "score": 100} >> data.
$"User {@::data::user} scored {@::data::score} points!" >> Display.
```

## 🛠️ Usage

Run PopPop scripts via the interpreter:

```bash
python poppop.py examples/test_v03.pop
```

## 📂 Structure
- `src/` - The interpreter (Lexer, Parser, Evaluator, AST).
- `examples/` - Example `.pop` scripts showcasing features.
- `poppop.py` - The CLI entrypoint.

## 🤝 Contributing
PopPop is completely Open Source. Fork the repository, create a branch, and help us push the left-to-right paradigm even further!
