（すべての仕様と関数の知識を総動員し、本章ではPopPopの実用例とアーキテクチャに迫ります。）

# パート5: 実世界のアプリケーションとPyodide Webアーキテクチャ

## 5.1 PopPop (..) 言語ディープチュートリアル

**PopPop** 言語チュートリアルへようこそ！PopPopは、データフローを強く意識し、ボイラープレート（定型コード）を減らし、コードが左から右へと物語のように読めるように設計されています。

このディープダイブでは、PopPopの核となる哲学や独自の構文要素について解説し、定番のFizzBuzzやモダンなREST APIなどの実践的な例を構築します。

---

### コアコンセプト

#### パイプライン演算子 (`>>`)
PopPopでは、データはある操作から次の操作へとシームレスに流れます。パイプライン演算子 `>>` は、左側の結果を右側の入力として渡します。これにより、関数呼び出しの深いネストを排除できます。

```poppop
# 代わりに: print(filter(map(data, uppercase), is_valid))
data >> map(uppercase) >> filter(is_valid) >> print()
```

#### 暗黙の変数 (`@`)
パイプライン内で作業する際、小さく無名な操作を定義する必要がよくあります。PopPopでは、パイプラインの**現在のアイテム**を参照するための `@` を導入しており、明示的なラムダ変数宣言（`x >> x.name` など）の必要をなくしています。

```poppop
users >> filter(@.age >= 20) >> map(@.name) >> print()
```

#### 文字列補間 (`{::key}`)
PopPopは文字列補間に `{::variable}` を使用します。`::` を使うことで、標準的なブロックやオブジェクトの波括弧 `{}` とデータバインディングを明確に区別し、パーサーに優しく、即座に認識できるようにしています。

```poppop
name = "Alice"
greeting = "Hello, {::name}! You are processing item #{::@.id}."
```

---

### 例1: PopPopでのFizzBuzz

定番のFizzBuzzの実装で、これらの機能がどのように組み合わさるか見てみましょう。パイプラインと暗黙の変数が、ロジックをいかに宣言的で美しくしているかに注目してください。

```poppop
# 1から100までの範囲を生成し、それをmap関数にパイプする
1..100 >> map(
    if @ % 15 == 0: 
        "FizzBuzz"
    elif @ % 3 == 0: 
        "Fizz"
    elif @ % 5 == 0: 
        "Buzz"
    else: 
        @
) >> print()
```

**動作の仕組み:**
1. `1..100` は数値のストリームを生成します。
2. `>> map(...)` は各数値を1つずつ処理します。
3. `map` の内部では、`@` 記号は現在評価されている数値を暗黙的に参照します。
4. `map` の結果は文字列と数値のストリームになり、それが出力のために `print()` にパイプされます。

---

### 例2: REST APIの構築

PopPopのパイプラインアーキテクチャは、Webサーバーにおけるリクエスト/レスポンスのライフサイクルに最適です。架空の `web` モジュールを使って小さなREST APIを構築してみましょう。

```poppop
import web

# ポート8080でサーバーを初期化する
web.server(port=8080)
    # シンプルなGETエンドポイントを定義する
    >> route("GET", "/api/hello")
    >> handle(
        # @ は入力されたRequestオブジェクトを暗黙的に参照する
        response = {
            "status": "success",
            "message": "Hello, {::@.query.name | 'Guest'}!"
        }
        @ >> web.json(response)
    )
    
    # 要求された数値までのFizzBuzzを返すエンドポイントを定義する
    >> route("GET", "/api/fizzbuzz/{max}")
    >> handle(
        # リクエストから 'max' パラメータを抽出し、デフォルトを100とする
        limit = @.params.max | 100
        
        # PopPopの標準的なデータフローを使用してFizzBuzz配列を構築する
        result = 1..limit >> map(
            if @ % 15 == 0: "FizzBuzz"
            elif @ % 3 == 0: "Fizz"
            elif @ % 5 == 0: "Buzz"
            else: @
        ) >> collect()
        
        # JSONレスポンスを送信する
        @ >> web.json({ "data": result })
    )
    
    # 最後に、接続のリスニングを開始する
    >> start()
```

**APIの例からの重要なポイント:**
- **ルートのチェーン:** サーバーオブジェクトは `route()` と `handle()` の定義を通って簡単に流れます。
- **リクエストコンテキスト:** `handle()` ブロック内では、`@` はHTTPリクエストを表します。`@.query.name` や `@.params.max` に簡単にアクセスできます。
- **インラインのデフォルト値:** フォールバック値として使用される `|` 演算子に注目してください（`@.query.name | 'Guest'`）。
- **クリーンなJSON補間:** `{::@.query.name}` は、リクエストデータをレスポンス文字列に完璧に注入します。

---

## 5.2 Pyodideとブラウザ統合アーキテクチャ

プレイグラウンドのアーキテクチャは、Pyodide（WebAssemblyベースのブラウザ向けPythonディストリビューション）を活用して、Pythonベースの言語インタプリタを完全にクライアント側で実行します。これにより、コード評価のためのバックエンドサーバーが不要になります。

### 1. ブラウザ内の仮想ファイルシステム（VFS）のセットアップ
アプリケーションがロードされると、JavaScriptはPyodideを初期化し（`loadPyodide()`）、`pyodideInstance.FS` を使用してブラウザのメモリ内に仮想ファイルシステムを即座に構築します。
* `src/` ディレクトリを作成します。
* コアとなるPythonソースファイル（`lexer.py`、`parser.py`、`evaluator.py`、`ast_nodes.py` など）とメインのエントリーファイル（`poppop.py`）をWebサーバーから動的にフェッチします。
* `FS.writeFile()` を使用して、これらのスクリプトを直接PyodideのVFSに書き込みます。これにより、ブラウザのサンドボックス内にインタプリタのエコシステム全体が再現され、Pythonはそれらをネイティブモジュールとしてインポートできるようになります。

### 2. コード評価のワークフロー
ユーザーがプレイグラウンドのUIで「Run（実行）」をクリックしたとき:
* Aceエディタの内容は、一時ファイル（`playground.poppop`）としてVFSに書き込まれます。
* JavaScriptは `pyodideInstance.runPythonAsync()` を呼び出し、ブリッジ用のPythonスクリプトを実行します。
* このブリッジスクリプトはVFSから `playground.poppop` を読み込み、コアインタプリタを呼び出します（例: `await poppop.run_code(source)`）。

### 3. リアルタイムI/Oリダイレクト（Python ↔ JS ブリッジ）
ターミナルの出力が瞬時に感じられるように、Pyodideの相互運用モジュール（`import js`）を使用して、Pythonの標準出力を直接DOMにブリッジします。
* Pyodideの内部では、`sys.stdout` と `sys.stderr` はカスタムの `RealtimeOutput` クラスによってオーバーライドされます。
* 言語評価器が `print()` を呼び出すと、このカスタムクラスの `write()` メソッドに渡されます。
* `write()` メソッドはグローバルなJavaScript関数 `window.appendTerminalOutput(s)` を直接呼び出し、出力ストリームをリアルタイムでDOMのコンソールウィンドウ要素に即座に追加します。

### 4. ASTの抽出とMermaid.jsビジュアライザ
このアーキテクチャは、抽象構文木（AST）のライブ視覚化もサポートしています。
* Pythonのブリッジスクリプトは単にコードを実行するだけでなく、シリアライズ関数（`poppop.get_ast_json(source)`）を呼び出してソースをパースし、ASTのJSON表現を出力します。
* このJSON文字列は、Pyodideの境界を越えてJavaScriptレイヤーに返されます。
* フロントエンドはその後、カスタムのJavaScriptトラバーサル関数（`buildMermaidGraph()`）を実行し、ASTのJSONをMermaid.jsのダイアグラム定義にマッピングして、出力とともにパイプラインフローのグラフィックを即座にレンダリングします。

これにより、トークン化や評価に関するPythonの堅牢なロジックの恩恵を受けながら、モダンなWebアプリケーションのサンドボックス化された、非常に高速でインタラクティブなユーザー体験を提供できます。


（以上でPopPop公式仕様書の全章を終わります。）