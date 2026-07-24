# PopPop 言語 公式仕様書 (The Definitive Guide)

> [!NOTE]
> 本ドキュメントは、データフロー駆動型のプログラミング言語「PopPop」の公式かつ完全な仕様書です。PopPopは、すべての演算と関数の適用をパイプライン演算子（`>>`）を用いて左から右へ記述することを特徴とし、可読性と直感的なデータ操作を極限まで追求したモダンな言語設計となっています。

---

## 1. 言語の哲学と設計思想 (Philosophy & Design Principles)

PopPopは「データは左から右へ流れる」というただ一つのルールを中心に設計されています。

従来の多くのプログラミング言語（C, Java, Pythonなど）では、関数の呼び出しは `func1(func2(value))` のように記述され、評価は「内側から外側へ」「右から左へ」と逆行して行われます。これは、人間の自然な思考の順序（データを用意する $\rightarrow$ 処理Aをする $\rightarrow$ 処理Bをする）と矛盾しています。

PopPopでは、パイプライン演算子 `>>` を用いることで、**思考の順序とコードの記述順序を完全に一致**させました。

### 1.1. Everything is a Pipeline
PopPopにおいては、単なる代入でさえもパイプラインの一部として扱われます。
```poppop
// 従来言語: x = 10;
10 >> x.
```
上記は「10というデータを生成し、変数xに流し込む」というデータの流れをそのまま表しています。

### 1.2. The Bundle Concept
関数の引数が複数ある場合、PopPopはカンマ区切りの引数リストではなく、**「バンドル（Bundle）」**という概念を用います。複数のデータは `&` 演算子によって一つに束ねられ、パイプラインに乗せられます。

---

## 2. 基本構文とデータ型 (Syntax & Data Types)

### 2.1. データ型
PopPopは動的型付け言語であり、背後でPythonの型システムを利用しています。
*   **Number**: 整数および浮動小数点数（例: `42`, `3.14`）
*   **String**: ダブルクォーテーションまたはシングルクォーテーションで囲まれた文字列（例: `"Hello"`, `'World'`）。エスケープシーケンス（`\n`, `\t`など）もサポートされています。
*   **Boolean**: 真偽値。組み込みの `Bool` キャスト等で生成されます。
*   **Array**: カギ括弧で囲まれたデータのリスト（例: `[1, 2, 3]`）
*   **Dictionary (JSON)**: 波括弧で囲まれたキーと値のペア（例: `{"key": "value"}`）

### 2.2. 文の終了 `.`
各ステートメント（パイプラインの終着点）は、必ずピリオド（`.`）で終了します。文末にセミコロン（`;`）を使う言語が多い中、英語の文章のように自然に終端を表現します。
```poppop
"This is a statement" >> Display.
```

### 2.3. ブロックの終了 `..`
制御構文や関数定義など、インデントされたブロックの終端には二重ピリオド（`..`）を用います。これにより、中括弧 `{ }` を使わずに、どこでブロックが終わったのかが視覚的かつ構文的に明確になります。

---

## 3. 制御構造 (Control Flow)

### 3.1. パターンマッチング (`check`)
対象のデータに対して強力な条件分岐を行います。従来の `switch` 文や `if-elif` チェーンをより宣言的に記述できます。

```poppop
score >> check:
    is >= 90: "S" >> Display.
    is >= 80: "A" >> Display.
    is >= 70: "B" >> Display.
    is == 0:  "F" >> Display.
    else:     "C" >> Display.
..
```
**評価ルール**:
*   `is` キーワードの後に条件演算子を記述した場合、直前のデータに対して比較が行われます。
*   値のみ（例: `is 0:`）を記述した場合、完全一致（`==`）がテストされます。
*   どの条件にも合致しない場合は `else:` ブロックが実行されます。

### 3.2. イテレーション (`do each`)
配列などのイテラブルな要素を1つずつ取り出して処理します。ループ内では、暗黙の特殊変数 `@` に現在の要素が格納されます。

```poppop
// 1から5までループし、それぞれを2倍して表示する
[1, 5] >> Range >> do each:
    @ * 2 >> Display.
..
```
入れ子になったループの場合でも、直近の `do each` ブロックの要素が `@` にバインドされます。より明示的に扱いたい場合は、ループの先頭で変数に流し込みます（例: `@ >> currentItem.`）。

### 3.3. 無限ループ (`loop`) と終了 (`Break`)
条件なしの無限ループを実行します。特定の条件を満たしたときに組み込み関数 `Break` を使って脱出します。

```poppop
0 >> counter.
loop:
    counter + 1 >> counter.
    counter >> Display.
    counter >> check:
        is >= 10: 1 >> Break.
        else: ""
    ..
..
```
> [!WARNING]
> `Break` は組み込み**関数**として実装されているため、`1 >> Break.` のように何らかの値をパイプライン経由で渡す必要があります（この値は将来的にループの戻り値として利用される設計です）。

---

## 4. 関数定義 (Functions)

新しい関数の定義は `new` キーワードを用います。関数名は大文字で始める（PascalCase）ことが推奨されます。

### 4.1. 基本的な関数
引数はリストや変数のバンドルとして宣言します。
```poppop
(x & y) >> new Add:
    x + y >> Return.
..

(5 & 10) >> Add >> result.
```

### 4.2. 変数のスコープ
PopPopは関数単位のローカルスコープを持ちます。関数内で定義された変数は、関数の外部からはアクセスできません。また、関数の引数はローカル変数として初期化されます。

### 4.3. 早期リターン
関数の途中で処理を終了し、値を返したい場合は `Return` を呼び出します。
```poppop
(age) >> new CheckAge:
    age >> check:
        is < 0:  "Invalid" >> Return.
        is >= 20: "Adult" >> Return.
        else:     "Minor" >> Return.
    ..
..
```

---

## 5. 組み込み関数リファレンス (Built-in Functions)

PopPopには、データの変換や入出力、文字列操作からWebサーバー構築まで、モダンなデータ処理をサポートする多彩な組み込み関数が用意されています。すべて **PascalCase（大文字から始まる）** で統一されています。

### 5.1. 基本・入出力
| 関数名 | 引数の型 | 戻り値の型 | 詳細・エッジケース | 使用例 |
|:---|:---|:---|:---|:---|
| **Display** | Any | Any | データを標準出力に印字します。デバッグ目的でチェーンの中間に挟んでも、入力データがそのまま出力されるため便利です。 | `"Hi" >> Display >> msg.` |
| **Input** | String (Optional) | String | 標準入力を受け取ります。引数がある場合はプロンプトとして表示されます。Playgroundではブラウザのダイアログが表示されます。 | `"Name: " >> Input >> name.` |
| **Return** | Any | None (Breaks flow) | 関数の実行を終了し、値を返します。トップレベルで呼び出すと例外になります。 | `100 >> Return.` |
| **Break** | Any | None (Breaks loop) | `loop` や `do each` を強制終了します。 | `1 >> Break.` |
| **Sleep** | Number | Number | 指定した秒数だけ実行を停止します。同期処理としてブロックします。 | `3 >> Sleep.` |
| **Type** | Any | String | データ型の内部名称（Pythonの型名）を文字列として返します。 | `42 >> Type >> Display.` |

### 5.2. 型変換 (Casting)
PopPopは厳格な型推論を行いませんが、特定の関数の前には明示的なキャストが必要な場合があります。

| 関数名 | 引数の型 | 戻り値の型 | 詳細・エッジケース | 使用例 |
|:---|:---|:---|:---|:---|
| **Int** | String / Float | Integer | 整数に変換します。変換不可能な文字列（例: `"abc"`）が渡されるとパニックエラーになります。 | `"42" >> Int >> num.` |
| **Str** | Any | String | 任意のデータを文字列表現に変換します。配列の文字列化にも利用できます。 | `100 >> Str >> text.` |
| **Bool** | Any | Boolean | 真偽値に変換します。`0`、空文字列、空配列は `False` になります。 | `1 >> Bool >> isTrue.` |

### 5.3. 数値・算術計算
| 関数名 | 引数の型 | 戻り値の型 | 詳細・エッジケース | 使用例 |
|:---|:---|:---|:---|:---|
| **Max** | Array | Number | 配列内の最大値を返します。配列が空の場合はエラーになります。 | `[1, 5, 3] >> Max >> res.` |
| **Min** | Array | Number | 配列内の最小値を返します。配列が空の場合はエラーになります。 | `[1, 5, 3] >> Min >> res.` |
| **Round** | Number | Integer | 四捨五入を行います。 | `3.14 >> Round >> res.` |
| **Abs** | Number | Number | 絶対値を返します。正の数はそのまま返ります。 | `-42 >> Abs >> res.` |
| **Random** | Array | Any | `[min, max]` の範囲配列、または任意の要素リストからランダムな1要素を抽出して返します。 | `[1, 10] >> Random >> rand.` |

### 5.4. 配列・リスト操作
| 関数名 | 引数の型 | 戻り値の型 | 詳細・エッジケース | 使用例 |
|:---|:---|:---|:---|:---|
| **Array** | Array / Number | Array | 次元配列を `0` で初期化生成します。`[3, 3]` なら3x3の行列になります。 | `[2, 3] >> Array >> mat.` |
| **Range** | Array (len 2) | Array | `[start, end]` から整数の連番配列（両端含む）を生成します。 | `[1, 5] >> Range >> lst.` |
| **Length** | Array / String | Integer | 要素数を返します。数値などを渡すとエラーになります。 | `[1,2] >> Length >> len.` |
| **Sort** | Array | Array | 昇順にソートされた新しい配列を返します。元の配列は破壊されません。 | `[3,1] >> Sort >> sorted.` |
| **Reverse** | Array / String | Array/String | 要素の順序を逆にしたものを返します。文字列の反転にも使えます。 | `[1,2] >> Reverse >> rev.` |
| **Append** | Bundle(Array, Any) | Array | 配列の末尾に要素を追加した新しい配列を返します。 | `([1] & 2) >> Append >> arr.` |
| **Slice** | Bundle(Array, Array) | Array | `[start, end]` のインデックスで切り取ります。 | `([1,2,3] & [0,1]) >> Slice.` |
| **Join** | Bundle(Array, String)| String | 配列要素を区切り文字で結合します。 | `(["a", "b"] & ",") >> Join.` |

### 5.5. 文字列操作
| 関数名 | 引数の型 | 戻り値の型 | 詳細・エッジケース | 使用例 |
|:---|:---|:---|:---|:---|
| **Format** | Bundle(String, Args..) | String | `{0}`, `{1}` 形式のプレースホルダーを持つ文字列に、後続の引数を埋め込みます。引数不足はエラーになります。 | `("Hi {0}" & "Bob") >> Format.` |
| **Uppercase** | String | String | 全て大文字化します。 | `"hello" >> Uppercase.` |
| **Lowercase** | String | String | 全て小文字化します。 | `"HELLO" >> Lowercase.` |
| **Split** | Bundle(String, String)| Array | 指定文字で分割します。空文字を指定した場合は1文字ずつ分割されます。 | `("a,b" & ",") >> Split.` |
| **Replace** | Bundle(Str, Str, Str) | String | 対象文字列、検索文字列、置換文字列を順にバンドルします。すべての出現箇所が置換されます。 | `("app" & "p" & "b") >> Replace.` |
| **Contains** | Bundle(Array/Str, Any)| Boolean | 配列や文字列に要素が含まれているかを真偽値で返します。 | `("hello" & "ll") >> Contains.` |

### 5.6. JSON・Web・ファイル・システム (Advanced)
> [!CAUTION]
> ネットワークやファイルIO系の組み込み関数は、実行環境（Playground等のブラウザ環境）によってはCORS制約やファイルシステムサンドボックスの制限を受ける場合があります。

| 関数名 | 引数の型 | 戻り値の型 | 詳細・エッジケース | 使用例 |
|:---|:---|:---|:---|:---|
| **ToJson** | Any | String | データをJSON形式の文字列にシリアライズします。 | `{"a": 1} >> ToJson >> json.` |
| **FromJson** | String | Dictionary | JSON文字列をパースして構造データ（辞書や配列）に戻します。パース失敗時はエラー。 | `jsonStr >> FromJson >> obj.` |
| **Now** | Any | Number | 現在のUNIXタイムスタンプを秒単位（浮動小数点）で返します。 | `"" >> Now >> timestamp.` |
| **Fetch** | String | String | URLからHTTP GETリクエストを行い、レスポンスボディを文字列として返します。ローカルファイルパスの場合は内容を読み込みます。 | `"https://..." >> Fetch >> html.` |
| **PostFetch** | Bundle(Str, Dict, Str)| String | URL、HTTPヘッダー辞書、リクエストボディの3点をバンドルしてPOST送信します。REST API連携用。 | `(url & head & body) >> PostFetch.` |
| **WriteFile** | Bundle(Str, Str) | String | ファイルパスと書き込む内容をバンドルします。上書き保存されます。 | `("Hello" & "out.txt") >> WriteFile.` |
| **Import** | String | Any | 別ファイルのPopPopスクリプトを読み込み、現在のグローバル環境で評価します。モジュールの分割に不可欠です。 | `"math.pop" >> Import.` |
| **Serve** | Bundle(Num, String) | Number | 指定したポート番号で、指定した関数をハンドラとする内蔵HTTPサーバーを起動します。関数にはリクエスト情報辞書が渡されます。 | `(8080 & "App") >> Serve.` |

---

## 6. 実践的なコード例 (Examples)

### 6.1. FizzBuzzの実装
PopPopの強力なパターンマッチングとイテレーションを組み合わせたFizzBuzzの実装例です。

```poppop
[1, 100] >> Range >> do each:
    @ >> check:
        is % 15 == 0: "FizzBuzz" >> Display.
        is % 3 == 0:  "Fizz" >> Display.
        is % 5 == 0:  "Buzz" >> Display.
        else:         @ >> Display.
    ..
..
```

### 6.2. 簡易WebAPIサーバーの構築
`Serve` 組み込み関数を利用すると、たった数行でHTTPサーバーを立ち上げることができます。

```poppop
// リクエストを処理する関数
(req) >> new MyApi:
    "Request received from {0}" & req["client"] >> Format >> Display.
    
    // JSONレスポンスを組み立てる
    {"status": 200, "headers": {"Content-Type": "application/json"}, "body": '{"message": "Hello from PopPop"}'} >> Return.
..

// ポート8080でサーバーを起動
(8080 & "MyApi") >> Serve.
```

---

## 7. 実行環境とアーキテクチャ (Architecture & Playground)

PopPop言語は、専用のPythonインタプリタによって解析・実行されます。

1.  **Lexer (字句解析)**: `.poppop` ファイル内のコードをトークン列に分解します。
2.  **Parser (構文解析)**: トークン列からAST（抽象構文木）を構築します。この際、`>>` 演算子の結合規則などが処理されます。
3.  **Evaluator (評価器)**: ASTをトラバースし、各ノードを評価します。

### Web Playground (Pyodide)
PopPopは、ブラウザ内でPythonを直接実行する技術である **Pyodide** に完全対応しています。バックエンドサーバーを持たないサーバーレス構成であるため、悪意のあるコードによるRCE（リモートコード実行）のリスクがゼロであり、GitHub Pages等で安全かつ無期限にホスティングすることが可能です。

公式Playgroundへのアクセスはこちら: [https://ityannel.github.io/poppop-playground/](https://ityannel.github.io/poppop-playground/)

---
*(End of Document)*
