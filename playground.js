(() => {
  "use strict";

  const STORAGE = {
    source: "poppop.playground.source.v1",
    theme: "poppop.playground.theme",
    fontSize: "poppop.playground.fontSize",
    lessonIndex: "poppop.playground.lessonIndex.v1",
    lessonProgress: "poppop.playground.lessonProgress.v2",
  };
  const FALLBACK_SOURCE = `[1, 2, 3, 4] >> Map(value):
    value * 2.
.. >> doubled.

doubled >> Display.`;

  const elements = Object.fromEntries(
    [
      "versionBadge", "runtimeDot", "runtimeStatus", "runButton", "stopButton",
      "formatButton", "copyCodeButton", "downloadButton", "fileInput",
      "shareButton", "decreaseFontButton", "increaseFontButton", "themeButton",
      "examplesTab", "referenceTab", "lessonTab", "lessonTabProgress",
      "examplesPanel", "referencePanel", "lessonPanel",
      "exampleSearch", "referenceSearch", "exampleList", "referenceList",
      "lessonProgressText", "lessonProgressBar", "previousLessonButton",
      "lessonTitleButton", "nextLessonButton", "lessonBadge", "lessonTitle",
      "lessonGoal", "lessonChat", "robotAvatar", "openLessonButton", "checkLessonButton",
      "hintButton", "showAnswerButton", "lessonQuestionForm", "lessonQuestion",
      "advanceLessonButton",
      "editor", "editorFallback", "saveStatus", "cursorStatus",
      "characterStatus", "outputPanel", "diagnosticsPanel", "astPanel",
      "diagnosticCount", "copyResultButton", "terminalInputForm",
      "terminalPrompt", "terminalInput", "runState", "runTime", "toast",
    ].map((id) => [id, document.getElementById(id)]),
  );

  let editor = null;
  let worker = null;
  let runtimeReady = false;
  let running = false;
  let sourceChanged = false;
  let saveTimer = null;
  let analysisTimer = null;
  let analysisSequence = 0;
  let latestAnalysis = 0;
  let currentAst = null;
  let currentInputId = null;
  let toastTimer = null;
  let examples = [];
  let galleryLoaded = false;
  let referenceRows = [];
  let runtimeNames = [];
  let currentResultTab = "output";
  let currentSidePanel = "examples";
  let lessons = [];
  let lessonIndex = Number(localStorage.getItem(STORAGE.lessonIndex)) || 0;
  let activeLessonId = null;
  let hintIndex = 0;
  let completedLessons = new Set();
  let robotMoodTimer = null;

  try {
    completedLessons = new Set(
      JSON.parse(localStorage.getItem(STORAGE.lessonProgress) || "[]"),
    );
  } catch {
    completedLessons = new Set();
  }

  function getSharedSource() {
    if (!location.hash.startsWith("#code=")) return null;
    try {
      const encoded = location.hash.slice(6).replace(/-/g, "+").replace(/_/g, "/");
      const binary = atob(encoded);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return null;
    }
  }

  function encodeSource(source) {
    const bytes = new TextEncoder().encode(source);
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function initialSource() {
    return getSharedSource() ?? localStorage.getItem(STORAGE.source) ?? FALLBACK_SOURCE;
  }

  function defineAceMode() {
    if (!window.ace) return;
    ace.define("ace/mode/poppop_highlight_rules", [
      "require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules",
    ], (require, exports) => {
      const oop = require("ace/lib/oop");
      const TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;
      const PopPopHighlightRules = function PopPopHighlightRules() {
        this.$rules = {
          start: [
            { token: "comment", regex: "\\/\\/.*$" },
            { token: "string", regex: '"(?:\\\\.|[^"\\\\])*"|\\\'(?:\\\\.|[^\\\'\\\\])*\\\'' },
            { token: "constant.language", regex: "\\b(?:true|false|null)\\b" },
            { token: "keyword.control", regex: "\\b(?:new|is|else|and|or|not)\\b" },
            { token: "support.function", regex: "\\b[A-Z][A-Za-z0-9_]*\\b" },
            { token: "variable.language", regex: "@" },
            { token: "constant.numeric", regex: "\\b\\d+(?:\\.\\d+)?\\b" },
            { token: "keyword.operator", regex: ">>|::|==|!=|>=|<=|[+\\-*\\/%><]" },
            { token: "punctuation.operator", regex: "\\.\\.|[.():,\\[\\]{}]" },
          ],
        };
        this.normalizeRules();
      };
      oop.inherits(PopPopHighlightRules, TextHighlightRules);
      exports.PopPopHighlightRules = PopPopHighlightRules;
    });
    ace.define("ace/mode/poppop", [
      "require", "exports", "module", "ace/lib/oop", "ace/mode/text",
      "ace/mode/poppop_highlight_rules",
    ], (require, exports) => {
      const oop = require("ace/lib/oop");
      const TextMode = require("ace/mode/text").Mode;
      const Rules = require("ace/mode/poppop_highlight_rules").PopPopHighlightRules;
      const Mode = function Mode() { this.HighlightRules = Rules; };
      oop.inherits(Mode, TextMode);
      Mode.prototype.lineCommentStart = "//";
      Mode.prototype.$id = "ace/mode/poppop";
      exports.Mode = Mode;
    });
  }

  function setupEditor() {
    const source = initialSource();
    if (!window.ace) {
      elements.editor.hidden = true;
      elements.editorFallback.style.display = "block";
      elements.editorFallback.value = source;
      elements.editorFallback.addEventListener("input", onSourceChanged);
      elements.editorFallback.addEventListener("keyup", updateEditorStatus);
      elements.editorFallback.addEventListener("click", updateEditorStatus);
      return;
    }

    defineAceMode();
    ace.config.set("basePath", "https://cdn.jsdelivr.net/npm/ace-builds@1.36.5/src-min-noconflict");
    editor = ace.edit("editor");
    editor.session.setMode("ace/mode/poppop");
    editor.session.setUseSoftTabs(true);
    editor.session.setTabSize(4);
    editor.session.setUseWrapMode(true);
    editor.setShowPrintMargin(false);
    editor.setOptions({
      fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
      fontSize: Number(localStorage.getItem(STORAGE.fontSize)) || 14,
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      scrollPastEnd: 0.25,
    });
    editor.setValue(source, -1);
    editor.session.on("change", onSourceChanged);
    editor.selection.on("changeCursor", updateEditorStatus);
    updateAceTheme();
  }

  function getSource() {
    return editor ? editor.getValue() : elements.editorFallback.value;
  }

  function setSource(source, markChanged = true) {
    if (editor) {
      editor.setValue(source, -1);
      editor.focus();
    } else {
      elements.editorFallback.value = source;
      elements.editorFallback.focus();
      onSourceChanged();
    }
    if (!markChanged) sourceChanged = false;
  }

  function updateEditorStatus() {
    const source = getSource();
    let row = 0;
    let column = 0;
    if (editor) {
      ({ row, column } = editor.getCursorPosition());
    } else {
      const before = source.slice(0, elements.editorFallback.selectionStart);
      const lines = before.split("\n");
      row = lines.length - 1;
      column = lines.at(-1).length;
    }
    elements.cursorStatus.textContent = `行 ${row + 1}, 列 ${column + 1}`;
    elements.characterStatus.textContent = `${source.length} 文字`;
  }

  function onSourceChanged() {
    sourceChanged = true;
    elements.saveStatus.textContent = "保存中…";
    updateEditorStatus();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem(STORAGE.source, getSource());
      elements.saveStatus.textContent = "自動保存済み";
    }, 350);
    scheduleAnalysis();
  }

  function scheduleAnalysis() {
    clearTimeout(analysisTimer);
    if (!runtimeReady || running) return;
    analysisTimer = setTimeout(() => {
      const requestId = ++analysisSequence;
      latestAnalysis = requestId;
      worker.postMessage({ type: "analyze", source: getSource(), requestId });
    }, 550);
  }

  function setRuntimeStatus(kind, text) {
    elements.runtimeDot.className = `status-dot ${kind === "ready" ? "" : kind}`.trim();
    elements.runtimeStatus.textContent = text;
  }

  function createWorker() {
    runtimeReady = false;
    elements.runButton.disabled = true;
    elements.checkLessonButton.disabled = true;
    setRuntimeStatus("loading", "実行環境を準備しています");
    worker = new Worker("playground-worker.js");
    worker.addEventListener("message", handleWorkerMessage);
    worker.addEventListener("error", (event) => {
      finishRun();
      setRuntimeStatus("error", "実行環境を開始できません");
      showDiagnostics([event.message || "Web Worker の起動に失敗しました"]);
    });
  }

  function handleWorkerMessage(event) {
    const message = event.data ?? {};
    if (message.type === "ready") {
      runtimeReady = true;
      elements.runButton.disabled = false;
      elements.versionBadge.textContent = message.displayVersion;
      setRuntimeStatus("ready", "現行 Python 実装に接続済み");
      runtimeNames = [...new Set([
        ...(message.builtins ?? []),
        ...(message.specialForms ?? []),
        ...(message.keywords ?? []),
      ])];
      lessons = message.lessons ?? [];
      if (message.gallery?.length) {
        galleryLoaded = true;
        examples = message.gallery;
        renderExamples();
      }
      lessonIndex = Math.min(Math.max(0, lessonIndex), Math.max(0, lessons.length - 1));
      completedLessons = new Set(
        [...completedLessons].filter((id) => lessons.some((lesson) => lesson.id === id)),
      );
      installCompleter(runtimeNames);
      renderReferences();
      renderLesson();
      scheduleAnalysis();
      return;
    }
    if (message.type === "boot-error") {
      setRuntimeStatus("error", "実行環境の読み込みに失敗");
      showDiagnostics([message.message]);
      return;
    }
    if (message.type === "stream") {
      appendOutput(message.text, message.channel === "stderr");
      return;
    }
    if (message.type === "input") {
      currentInputId = message.id;
      elements.terminalPrompt.textContent = message.prompt || "入力";
      elements.terminalInputForm.hidden = false;
      elements.terminalInput.focus();
      return;
    }
    if (message.type === "analysis" && message.requestId === latestAnalysis) {
      currentAst = message.ast;
      showDiagnostics(message.diagnostics ?? []);
      renderAst(currentAst);
      return;
    }
    if (message.type === "result") {
      currentAst = message.ast;
      renderAst(currentAst);
      showDiagnostics(message.ok ? [] : [message.error]);
      if (message.ok) {
        appendResult(message.result);
        elements.runState.textContent = "完了";
        if (message.lesson) handleLessonResult(message.lesson);
      } else {
        appendOutput(message.error, true);
        elements.runState.textContent = "エラー";
        selectResultTab("diagnostics");
        if (activeLessonId && currentSidePanel === "lesson") {
          robotSpeak(explainLessonError(message.error));
        }
      }
      elements.runTime.textContent = `${message.elapsedMs ?? 0} ms`;
      finishRun();
    }
  }

  function installCompleter(names) {
    if (!editor || !window.ace) return;
    try {
      ace.require("ace/ext/language_tools");
      editor.completers = [{
        getCompletions(_editor, _session, _position, _prefix, callback) {
          callback(null, names.map((name) => ({
            caption: name,
            value: name,
            meta: /^[A-Z]/.test(name) ? "PopPop 処理" : "予約語",
            score: 1000,
          })));
        },
      }];
    } catch {
      // Completion is optional; editing and execution remain available.
    }
  }

  function startRun() {
    if (!runtimeReady || running) return;
    running = true;
    sourceChanged = false;
    clearTimeout(analysisTimer);
    elements.runButton.disabled = true;
    elements.stopButton.disabled = false;
    elements.outputPanel.classList.remove("error");
    elements.outputPanel.textContent = "";
    elements.runState.textContent = "実行中";
    elements.runTime.textContent = "計測中…";
    if (activeLessonId && currentSidePanel === "lesson") {
      setRobotMood("thinking");
    }
    selectResultTab("output");
    elements.checkLessonButton.disabled = true;
    worker.postMessage({
      type: "run",
      source: getSource(),
      lessonId: currentSidePanel === "lesson" ? activeLessonId : null,
    });
  }

  function stopRun() {
    if (!worker) return;
    worker.terminate();
    worker = null;
    elements.terminalInputForm.hidden = true;
    currentInputId = null;
    appendOutput("実行を停止しました。", true);
    elements.runState.textContent = "停止";
    elements.runTime.textContent = "— ms";
    setRobotMood("encourage", 1800);
    finishRun();
    createWorker();
  }

  function finishRun() {
    running = false;
    elements.stopButton.disabled = true;
    elements.runButton.disabled = !runtimeReady;
    elements.checkLessonButton.disabled =
      !runtimeReady || !activeLessonId || currentSidePanel !== "lesson";
    elements.terminalInputForm.hidden = true;
    currentInputId = null;
    if (sourceChanged) scheduleAnalysis();
  }

  function valueText(value) {
    if (value === null) return "null";
    if (value === true) return "true";
    if (value === false) return "false";
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "object") {
      const compact = compactValueText(value);
      return compact.length <= 100 ? compact : JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  function compactValueText(value) {
    if (Array.isArray(value)) {
      return `[${value.map(compactValueText).join(", ")}]`;
    }
    if (value !== null && typeof value === "object") {
      return `{${Object.entries(value).map(([key, item]) =>
        `${JSON.stringify(key)}: ${compactValueText(item)}`).join(", ")}}`;
    }
    if (value === null) return "null";
    if (value === true) return "true";
    if (value === false) return "false";
    return typeof value === "string" ? JSON.stringify(value) : String(value);
  }

  function appendResult(result) {
    const prefix = elements.outputPanel.textContent ? "\n\n" : "";
    elements.outputPanel.textContent += `${prefix}=> ${valueText(result)}`;
  }

  function appendOutput(text, isError = false) {
    const separator = elements.outputPanel.textContent &&
      !elements.outputPanel.textContent.endsWith("\n") ? "\n" : "";
    elements.outputPanel.textContent += `${separator}${text}`;
    elements.outputPanel.classList.toggle("error", isError);
    elements.outputPanel.scrollTop = elements.outputPanel.scrollHeight;
  }

  function showDiagnostics(diagnostics) {
    const items = (diagnostics ?? []).filter(Boolean);
    elements.diagnosticCount.textContent = String(items.length);
    elements.diagnosticsPanel.textContent = items.length
      ? items.map((item, index) => `${index + 1}. ${item}`).join("\n\n")
      : "構文上の問題はありません。";
    elements.diagnosticsPanel.classList.toggle("error", items.length > 0);
    if (editor) {
      editor.session.setAnnotations(items.map((item) => {
        const match = String(item).match(/line\s+(\d+)/i);
        return {
          row: Math.max(0, Number(match?.[1] ?? 1) - 1),
          column: 0,
          text: String(item),
          type: "error",
        };
      }));
    }
  }

  function renderAst(ast) {
    elements.astPanel.textContent = ast
      ? JSON.stringify(ast, null, 2)
      : "有効な構文木はありません。";
  }

  function selectResultTab(name) {
    currentResultTab = name;
    document.querySelectorAll(".result-tab").forEach((button) => {
      const selected = button.dataset.resultTab === name;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    elements.outputPanel.hidden = name !== "output";
    elements.diagnosticsPanel.hidden = name !== "diagnostics";
    elements.astPanel.hidden = name !== "ast";
  }

  function parseSpecification(markdown) {
    const lines = markdown.split(/\r?\n/);
    const foundExamples = [];
    const foundReferences = [];
    let heading = "基本";
    let inCode = false;
    let codeLines = [];

    for (const line of lines) {
      const headingMatch = line.match(/^#{2,4}\s+(.+)$/);
      if (!inCode && headingMatch) heading = headingMatch[1].trim();
      if (line.trim() === "```poppop") {
        inCode = true;
        codeLines = [];
        continue;
      }
      if (inCode && line.trim() === "```") {
        const code = codeLines.join("\n").trim();
        if (code) foundExamples.push({ title: heading, code });
        inCode = false;
        continue;
      }
      if (inCode) codeLines.push(line);

      const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
      if (cells.length === 4 && /^`[^`]+`$/.test(cells[1])) {
        foundReferences.push({
          category: cells[0],
          name: cells[1].slice(1, -1),
          input: cells[2],
          description: cells[3],
        });
      }
    }
    return { examples: foundExamples, references: foundReferences };
  }

  async function loadSpecification() {
    try {
      const url = new URL("poppop_specification.md", location.href);
      url.searchParams.set("spec", String(Date.now()));
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const parsed = parseSpecification(await response.text());
      referenceRows = parsed.references;
      if (!galleryLoaded) {
        examples = friendlySpecificationExamples(parsed.examples);
        renderExamples();
      }
      renderReferences();
    } catch (error) {
      if (!galleryLoaded) {
        examples = [{
          id: "fallback",
          category: "はじめの一歩",
          title: "はじめの一歩｜リストを2倍にしよう",
          description: "Mapを使う短い例です。",
          interactive: false,
          code: FALLBACK_SOURCE,
        }];
        renderExamples();
      }
      elements.referenceList.innerHTML =
        `<p class="muted">仕様書を読み込めませんでした: ${escapeHtml(error.message)}</p>`;
    }
  }

  function friendlySpecificationExamples(items) {
    const counts = new Map();
    return items.map((item, index) => {
      const base = item.title.replace(/^\d+\.\s*/, "").trim() || "基本";
      const count = (counts.get(base) ?? 0) + 1;
      counts.set(base, count);
      const suffix = count > 1 ? ` ${count}` : "";
      return {
        id: `spec-${index}`,
        category: "仕様の例",
        title: `仕様の例｜${base}${suffix}`,
        description: "仕様書に掲載されている実行例です。",
        interactive: false,
        code: item.code,
      };
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function renderExamples() {
    const query = elements.exampleSearch.value.trim().toLowerCase();
    const visible = examples.filter((item) =>
      `${item.category} ${item.title} ${item.description} ${item.code}`
        .toLowerCase().includes(query));
    elements.exampleList.innerHTML = visible.length ? visible.map((item, index) => `
      <button class="example-card" type="button" data-example-index="${examples.indexOf(item)}">
        <span class="example-meta">
          <span class="example-category">${escapeHtml(item.category ?? "例")}</span>
          ${item.interactive ? '<span class="example-interactive">⌨ 入力あり</span>' : ""}
        </span>
        <strong>${escapeHtml(item.title.split("｜").at(-1))}</strong>
        <p>${escapeHtml(item.description ?? "すぐに実行できる例です。")}</p>
      </button>
    `).join("") : '<p class="muted">一致するコード例がありません。</p>';
    elements.exampleList.querySelectorAll("[data-example-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = examples[Number(button.dataset.exampleIndex)];
        setSource(item.code);
        showToast(item.interactive
          ? `「${item.title}」を読み込みました。実行すると入力欄が開きます`
          : `「${item.title}」を読み込みました`);
      });
    });
  }

  function renderReferences() {
    if (!runtimeNames.length || !referenceRows.length) return;
    const implemented = new Set(runtimeNames);
    const query = elements.referenceSearch.value.trim().toLowerCase();
    const visible = referenceRows.filter((item) =>
      implemented.has(item.name) &&
      `${item.category} ${item.name} ${item.input} ${item.description}`.toLowerCase().includes(query));
    elements.referenceList.innerHTML = visible.length ? visible.map((item) => `
      <article class="reference-card">
        <span class="category">${escapeHtml(item.category)}</span>
        <strong>${escapeHtml(item.name)}</strong>
        <p>入力: ${escapeHtml(item.input)}</p>
        <p>${escapeHtml(item.description)}</p>
      </article>
    `).join("") : '<p class="muted">一致する標準関数がありません。</p>';
  }

  function switchSidePanel(panel) {
    currentSidePanel = panel;
    const panels = {
      examples: [elements.examplesTab, elements.examplesPanel],
      reference: [elements.referenceTab, elements.referencePanel],
      lesson: [elements.lessonTab, elements.lessonPanel],
    };
    Object.entries(panels).forEach(([name, [tab, content]]) => {
      const selected = name === panel;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", String(selected));
      content.hidden = !selected;
    });
    document.body.classList.toggle("lesson-open", panel === "lesson");
    elements.checkLessonButton.disabled =
      !runtimeReady || !activeLessonId || panel !== "lesson";
    if (panel === "lesson" && lessons.length && !elements.lessonChat.children.length) {
      introduceCurrentLesson();
    }
  }

  function currentLesson() {
    return lessons[lessonIndex] ?? null;
  }

  function renderLessonProgress() {
    const complete = completedLessons.size;
    const total = lessons.length;
    const percent = total ? (complete / total) * 100 : 0;
    elements.lessonProgressText.textContent = `${complete} / ${total}`;
    elements.lessonTabProgress.textContent = `${complete}/${total}`;
    elements.lessonProgressBar.style.width = `${percent}%`;
  }

  function renderLesson() {
    const lesson = currentLesson();
    renderLessonProgress();
    if (!lesson) {
      elements.lessonTitle.textContent = "準備中…";
      elements.lessonGoal.textContent = "実行環境からレッスンを読み込んでいます。";
      elements.openLessonButton.disabled = true;
      return;
    }
    elements.lessonBadge.textContent = completedLessons.has(lesson.id) ? "✓" : lesson.badge;
    elements.lessonTitle.textContent = lesson.title;
    elements.lessonGoal.textContent = lesson.goal;
    elements.previousLessonButton.disabled = lessonIndex === 0;
    elements.nextLessonButton.disabled = lessonIndex === lessons.length - 1;
    elements.openLessonButton.disabled = false;
    elements.checkLessonButton.disabled =
      !runtimeReady || activeLessonId !== lesson.id || currentSidePanel !== "lesson";
    elements.hintButton.disabled = activeLessonId !== lesson.id;
    elements.showAnswerButton.disabled = activeLessonId !== lesson.id;
    elements.advanceLessonButton.hidden =
      !completedLessons.has(lesson.id) || lessonIndex === lessons.length - 1;
  }

  function clearLessonChat() {
    elements.lessonChat.textContent = "";
  }

  function addChatMessage(text, sender = "robot", style = "") {
    const message = document.createElement("div");
    message.className = `chat-message ${sender} ${style}`.trim();
    if (sender === "robot") {
      const avatar = document.createElement("span");
      avatar.className = "chat-mini-robot";
      avatar.textContent = "P";
      message.appendChild(avatar);
    }
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;
    message.appendChild(bubble);
    elements.lessonChat.appendChild(message);
    elements.lessonChat.scrollTop = elements.lessonChat.scrollHeight;
  }

  function robotSpeak(text, success = false) {
    addChatMessage(text, "robot", success ? "success" : "");
  }

  function setRobotMood(mood = "neutral", duration = 0) {
    clearTimeout(robotMoodTimer);
    elements.robotAvatar.classList.remove("happy", "thinking", "encourage");
    if (mood !== "neutral") elements.robotAvatar.classList.add(mood);
    if (duration) {
      robotMoodTimer = setTimeout(() => {
        elements.robotAvatar.classList.remove("happy", "thinking", "encourage");
      }, duration);
    }
  }

  function introduceCurrentLesson() {
    const lesson = currentLesson();
    if (!lesson) return;
    setRobotMood("neutral");
    clearLessonChat();
    robotSpeak(`${lesson.intro}\n準備ができたら「▶ はじめる」を押してね。`);
  }

  function selectLesson(nextIndex) {
    if (!lessons.length) return;
    lessonIndex = Math.min(Math.max(0, nextIndex), lessons.length - 1);
    activeLessonId = null;
    hintIndex = 0;
    localStorage.setItem(STORAGE.lessonIndex, String(lessonIndex));
    renderLesson();
    introduceCurrentLesson();
  }

  function openCurrentLesson() {
    const lesson = currentLesson();
    if (!lesson) return;
    activeLessonId = lesson.id;
    hintIndex = 0;
    setRobotMood("neutral");
    setSource(lesson.starter);
    renderLesson();
    clearLessonChat();
    robotSpeak(`コードを少し直して、◎ の目標を達成しよう。\nできたら「✓ 答え合わせ」！`);
    showToast(`レッスン「${lesson.title}」を開始しました`);
  }

  function showLessonHint() {
    const lesson = currentLesson();
    if (!lesson || activeLessonId !== lesson.id) return;
    const hints = lesson.hints ?? [];
    if (!hints.length) return;
    setRobotMood("thinking", 1600);
    robotSpeak(`ヒント ${Math.min(hintIndex + 1, hints.length)}：${hints[hintIndex]}`);
    hintIndex = Math.min(hintIndex + 1, hints.length - 1);
  }

  function showLessonAnswer() {
    const lesson = currentLesson();
    if (!lesson || activeLessonId !== lesson.id) return;
    setRobotMood("neutral");
    setSource(lesson.solution);
    robotSpeak("答えを表示したよ。実行して流れを確かめよう！");
  }

  function handleLessonResult(validation) {
    const lesson = currentLesson();
    if (!lesson || activeLessonId !== lesson.id) return;
    if (validation.passed) {
      setRobotMood("happy", 3600);
      completedLessons.add(lesson.id);
      localStorage.setItem(
        STORAGE.lessonProgress,
        JSON.stringify([...completedLessons]),
      );
      robotSpeak(`やったー！ ${validation.message}`, true);
      if (lessonIndex < lessons.length - 1) {
        elements.advanceLessonButton.hidden = false;
      } else {
        robotSpeak("全レッスン完走！ おめでとう！", true);
      }
      renderLesson();
    } else {
      setRobotMood("encourage", 1800);
      robotSpeak(validation.message);
    }
  }

  function explainLessonError(error) {
    const text = String(error ?? "");
    if (text.includes("SyntaxError")) {
      setRobotMood("encourage", 1800);
      return `文法を読み取れなかったよ。\n${text}\n\`. \` や \`..\`、括弧の閉じ忘れを確認してみよう。`;
    }
    if (text.includes("Undefined") || text.includes("not defined")) {
      return `まだ名前が作られていないようです。\n${text}\n名前を付けるパイプが先に実行されているか見てみよう。`;
    }
    return `実行中に問題を見つけました。\n${text}\n慌てなくて大丈夫。ヒントも使えます。`;
  }

  function answerLessonQuestion(question) {
    const lesson = currentLesson();
    const normalized = question.toLowerCase();
    setRobotMood("thinking", 1400);
    if (!lesson) return "レッスンを読み込み中です。少し待ってからもう一度聞いてね。";
    if (/ヒント|hint/.test(normalized)) return lesson.hints?.[hintIndex] ?? lesson.goal;
    if (/エラー|error/.test(normalized)) {
      return elements.diagnosticsPanel.textContent === "構文上の問題はありません。"
        ? "今のところ構文上の問題はありません。実行結果が課題のゴールと同じか確認しよう。"
        : elements.diagnosticsPanel.textContent;
    }
    if (normalized.includes("@")) {
      return "@ はブロックへ渡された現在値です。先頭のパイプでは null になります。この課題では名前付きの値も使えます。";
    }
    if (normalized.includes(">>") || /パイプ/.test(normalized)) {
      return ">> は左の値を右の処理へ渡します。最後が小文字の名前なら、その名前へ現在値を束縛します。";
    }
    if (/map/i.test(question)) return "Map は List の各要素を順番にブロックへ渡し、結果から新しい List を作ります。";
    if (/filter/i.test(question)) return "Filter はブロックが true を返した要素だけを残します。結果は必ず新しい List です。";
    if (/reduce/i.test(question)) return "Reduce の現在値は [accumulator, item] です。名前を付けた場合は name[0] と name[1] で参照します。";
    if (/update/i.test(question)) return "Update は `新しい値 >> 名前::field.` の向きで、元の Dict を変更せず更新後の Dict を返します。";
    if (/check|分岐/i.test(question)) return "Check は上から is を調べ、最初に一致したブロックを実行します。最後の else は必須です。";
    if (/loop|break/i.test(question)) return "Loop はブロックの最後の値を次の状態として繰り返し、値を Break へ渡すと終了します。";
    if (/終|ドット|\./.test(normalized)) return "通常の文は `.`、Map や Check などのブロック全体は `..` で閉じます。改行そのものには構文上の意味がありません。";
    return `いい質問です。今の目標は「${lesson.goal}」です。まず結果を予想して実行し、違ったらヒントを一つずつ使ってみよう。`;
  }

  function showLessonOverview() {
    if (!lessons.length) return;
    const overview = lessons.map((lesson, index) => {
      const mark = completedLessons.has(lesson.id) ? "✓" : index === lessonIndex ? "→" : "・";
      return `${mark} ${lesson.badge} ${lesson.title}`;
    }).join("\n");
    robotSpeak(`基礎コース一覧\n${overview}`);
  }

  function advanceLesson() {
    if (lessonIndex >= lessons.length - 1) return;
    selectLesson(lessonIndex + 1);
    openCurrentLesson();
  }

  function formatSource() {
    let level = 0;
    const formatted = getSource().split(/\r?\n/).map((raw) => {
      const text = raw.trim();
      if (!text) return "";
      if (text.startsWith("..") || /^(is|else)\b/.test(text)) {
        level = Math.max(0, level - 1);
      }
      const line = `${"    ".repeat(level)}${text}`;
      if (text.endsWith(":")) level += 1;
      return line;
    }).join("\n").replace(/\n{3,}/g, "\n\n");
    setSource(formatted);
    showToast("空白とインデントを整えました");
  }

  async function copyText(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message);
    } catch {
      showToast("クリップボードへコピーできませんでした");
    }
  }

  function downloadSource() {
    const blob = new Blob([getSource()], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "main.pop";
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("main.pop を保存しました");
  }

  async function loadFile(file) {
    if (!file) return;
    setSource(await file.text());
    showToast(`${file.name} を読み込みました`);
  }

  async function shareSource() {
    const url = new URL(location.href);
    url.hash = `code=${encodeSource(getSource())}`;
    history.replaceState(null, "", url);
    await copyText(url.href, "共有 URL をコピーしました");
  }

  function changeFont(delta) {
    const current = editor
      ? Number(editor.getOption("fontSize"))
      : Number.parseFloat(getComputedStyle(elements.editorFallback).fontSize);
    const next = Math.min(24, Math.max(11, current + delta));
    if (editor) editor.setOption("fontSize", next);
    else elements.editorFallback.style.fontSize = `${next}px`;
    localStorage.setItem(STORAGE.fontSize, String(next));
    showToast(`文字サイズ: ${next}px`);
  }

  function updateAceTheme() {
    if (!editor) return;
    const light = document.documentElement.dataset.theme === "light";
    editor.setTheme(light ? "ace/theme/github" : "ace/theme/monokai");
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(STORAGE.theme, next);
    updateAceTheme();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("visible");
    toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 2300);
  }

  function bindEvents() {
    elements.runButton.addEventListener("click", startRun);
    elements.stopButton.addEventListener("click", stopRun);
    elements.formatButton.addEventListener("click", formatSource);
    elements.copyCodeButton.addEventListener("click", () =>
      copyText(getSource(), "コードをコピーしました"));
    elements.downloadButton.addEventListener("click", downloadSource);
    elements.fileInput.addEventListener("change", () => loadFile(elements.fileInput.files[0]));
    elements.shareButton.addEventListener("click", shareSource);
    elements.decreaseFontButton.addEventListener("click", () => changeFont(-1));
    elements.increaseFontButton.addEventListener("click", () => changeFont(1));
    elements.themeButton.addEventListener("click", toggleTheme);
    elements.examplesTab.addEventListener("click", () => switchSidePanel("examples"));
    elements.referenceTab.addEventListener("click", () => switchSidePanel("reference"));
    elements.lessonTab.addEventListener("click", () => switchSidePanel("lesson"));
    elements.previousLessonButton.addEventListener("click", () =>
      selectLesson(lessonIndex - 1));
    elements.nextLessonButton.addEventListener("click", () =>
      selectLesson(lessonIndex + 1));
    elements.lessonTitleButton.addEventListener("click", showLessonOverview);
    elements.openLessonButton.addEventListener("click", openCurrentLesson);
    elements.checkLessonButton.addEventListener("click", startRun);
    elements.hintButton.addEventListener("click", showLessonHint);
    elements.showAnswerButton.addEventListener("click", showLessonAnswer);
    elements.advanceLessonButton.addEventListener("click", advanceLesson);
    elements.lessonQuestionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const question = elements.lessonQuestion.value.trim();
      if (!question) return;
      addChatMessage(question, "user");
      elements.lessonQuestion.value = "";
      robotSpeak(answerLessonQuestion(question));
    });
    elements.exampleSearch.addEventListener("input", renderExamples);
    elements.referenceSearch.addEventListener("input", renderReferences);
    document.querySelectorAll(".result-tab").forEach((button) => {
      button.addEventListener("click", () => selectResultTab(button.dataset.resultTab));
    });
    elements.copyResultButton.addEventListener("click", () => {
      const panels = {
        output: elements.outputPanel,
        diagnostics: elements.diagnosticsPanel,
        ast: elements.astPanel,
      };
      copyText(panels[currentResultTab].textContent, "表示内容をコピーしました");
    });
    elements.terminalInputForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (currentInputId === null) return;
      const value = elements.terminalInput.value;
      appendOutput(`${elements.terminalPrompt.textContent}${value}`);
      worker.postMessage({ type: "input-result", id: currentInputId, value });
      currentInputId = null;
      elements.terminalInput.value = "";
      elements.terminalInputForm.hidden = true;
    });
    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        startRun();
      }
      if (event.key === "Escape" && running) stopRun();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        downloadSource();
      }
    });
  }

  document.documentElement.dataset.theme =
    localStorage.getItem(STORAGE.theme) === "light" ? "light" : "dark";
  setupEditor();
  bindEvents();
  updateEditorStatus();
  loadSpecification();
  createWorker();
})();
