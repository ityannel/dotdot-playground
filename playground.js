(() => {
  "use strict";

  const STORAGE = {
    source: "poppop.playground.source.v2",
    theme: "poppop.playground.theme",
    fontSize: "poppop.playground.fontSize",
    lessonIndex: "poppop.playground.lessonIndex.v1",
    lessonProgress: "poppop.playground.lessonProgress.v2",
    tutorWelcomed: "poppop.playground.tutorWelcomed.v2",
    tutorProfile: "poppop.playground.tutorProfile.v1",
  };
  const FALLBACK_SOURCE = `[1, 2, 3, 4] >> Map(value):
    value * 2.
.. >> doubled.

doubled >> Display.`;
  const LESSON_FEATURES = {
    map: "Map",
    filter: "Filter",
    reduce: "Reduce",
    update: "Update",
    check: "Check",
    function: "new",
    loop: "Loop",
  };

  const elements = Object.fromEntries(
    [
      "runtimeStatus", "runButton", "stopButton",
      "formatButton", "copyCodeButton", "downloadButton", "fileInput",
      "shareButton", "decreaseFontButton", "increaseFontButton", "themeButton",
      "examplesTab", "referenceTab", "lessonTab", "lessonTabProgress",
      "examplesPanel", "referencePanel", "lessonPanel",
      "exampleSearch", "referenceSearch", "exampleList", "referenceList",
      "lessonProgressText", "lessonProgressBar", "previousLessonButton",
      "lessonTitleButton", "nextLessonButton", "lessonBadge", "lessonTitle",
      "lessonGoal", "lessonChat", "robotAvatar", "tutorStatus",
      "tutorWelcome", "tutorSession", "welcomeIntro", "welcomeTutorButton",
      "tutorProfileForm", "tutorGoal", "tutorThinking", "resetLessonButton",
      "checkLessonButton",
      "hintButton", "showAnswerButton", "lessonQuestionForm", "lessonQuestion",
      "aiLessonButton", "advanceLessonButton",
      "editor", "editorFallback", "saveStatus", "cursorStatus",
      "characterStatus", "outputPanel", "diagnosticsPanel", "astPanel",
      "diagnosticCount", "copyResultButton", "resultBody", "terminalInputForm",
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
  let aiLesson = null;
  let tunedLessons = new Map();
  let tuningRequests = new Map();
  let tutorWelcomed = localStorage.getItem(STORAGE.tutorWelcomed) === "yes";
  let tutorProfile = { level: "はじめて", goal: "" };
  let tutorProfileRevision = 0;
  let tutorRequestSequence = 0;
  let geminiRequestQueue = Promise.resolve();
  let lastGeminiRequestAt = 0;

  try {
    completedLessons = new Set(
      JSON.parse(localStorage.getItem(STORAGE.lessonProgress) || "[]"),
    );
  } catch {
    completedLessons = new Set();
  }
  try {
    tutorProfile = {
      ...tutorProfile,
      ...JSON.parse(localStorage.getItem(STORAGE.tutorProfile) || "{}"),
    };
  } catch {
    tutorProfile = { level: "はじめて", goal: "" };
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
            {
              token: ["keyword.operator", "text", "variable.assignment.final"],
              regex: "(>>)(\\s*)(\\(\\s*[a-z_][a-zA-Z0-9_]*\\s*(?:,\\s*[a-z_][a-zA-Z0-9_]*\\s*)+\\))(?=\\s*\\.\\s*(?://.*)?$)",
            },
            {
              token: ["keyword.operator", "text", "variable.assignment.final"],
              regex: "(>>)(\\s*)([a-z_][a-zA-Z0-9_]*)(?=\\s*(?:\\[[^\\]\\r\\n]*\\]\\s*)*\\.\\s*(?://.*)?$)",
            },
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
    elements.runtimeStatus.dataset.runtimeState = kind;
    elements.runtimeStatus.title = text;
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
      elements.resultBody.classList.add("input-active");
      selectResultTab("output");
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
        elements.runState.textContent = "完了";
        if (message.lesson) handleLessonResult(message.lesson);
        else if (
          currentLesson()?.dynamic &&
          activeLessonId === currentLesson()?.id &&
          currentSidePanel === "lesson"
        ) {
          evaluateAiLesson(message.result);
        }
      } else {
        appendOutput(localizeError(message.error), true);
        elements.runState.textContent = "エラー";
        selectResultTab("diagnostics");
        if (activeLessonId && currentSidePanel === "lesson") {
          askRobot("runtime_error", {
            extra: `実行エラー:\n${localizeError(message.error)}`,
            fallback: explainLessonError(message.error),
          });
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
      lessonId:
        currentSidePanel === "lesson" && !currentLesson()?.dynamic
          ? activeLessonId
          : null,
    });
  }

  function stopRun() {
    if (!worker) return;
    worker.terminate();
    worker = null;
    elements.terminalInputForm.hidden = true;
    elements.resultBody.classList.remove("input-active");
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

  function appendOutput(text, isError = false) {
    const separator = elements.outputPanel.textContent &&
      !elements.outputPanel.textContent.endsWith("\n") ? "\n" : "";
    elements.outputPanel.textContent += `${separator}${text}`;
    elements.outputPanel.classList.toggle("error", isError);
    elements.outputPanel.scrollTop = elements.outputPanel.scrollHeight;
  }

  function showDiagnostics(diagnostics) {
    const items = (diagnostics ?? []).filter(Boolean);
    const localizedItems = items.map(localizeError);
    elements.diagnosticCount.textContent = String(items.length);
    elements.diagnosticsPanel.textContent = items.length
      ? localizedItems.map((item, index) => `${index + 1}. ${item}`).join("\n\n")
      : "構文上の問題はありません。";
    elements.diagnosticsPanel.classList.toggle("error", items.length > 0);
    if (editor) {
      editor.session.setAnnotations(items.map((item, index) => {
        const line = window.PopPopLocalization?.errorLine(item);
        return {
          row: Math.max(0, Number(line ?? 1) - 1),
          column: 0,
          text: localizedItems[index],
          type: "error",
        };
      }));
    }
  }

  function localizeError(error) {
    return window.PopPopLocalization?.localizeError(error)
      ?? String(error ?? "不明なエラーが発生しました。");
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
    if (panel === "lesson") {
      renderTutorShell();
      if (tutorWelcomed && lessons.length && !activeLessonId) {
        openCurrentLesson({ introduction: true });
      }
    }
  }

  function currentLesson() {
    const baseLesson = lessons[lessonIndex] ?? null;
    return aiLesson ?? (baseLesson ? tunedLessons.get(baseLesson.id) : null) ?? baseLesson;
  }

  function renderLessonProgress() {
    const complete = completedLessons.size;
    const total = lessons.length;
    const percent = total ? (complete / total) * 100 : 0;
    elements.lessonProgressText.textContent = `${complete} / ${total}`;
    elements.lessonTabProgress.textContent = `${complete}/${total}`;
    elements.lessonProgressBar.style.width = `${percent}%`;
  }

  function renderTutorShell() {
    elements.lessonPanel.classList.toggle("welcome-mode", !tutorWelcomed);
    if (tutorWelcomed) elements.lessonPanel.classList.remove("profile-mode");
    elements.tutorWelcome.hidden = tutorWelcomed;
    elements.tutorSession.hidden = !tutorWelcomed;
  }

  function renderLesson() {
    const lesson = currentLesson();
    renderTutorShell();
    renderLessonProgress();
    if (!lesson) {
      elements.lessonTitle.textContent = "準備中…";
      elements.lessonGoal.textContent = "実行環境からレッスンを読み込んでいます。";
      return;
    }
    elements.lessonBadge.textContent = completedLessons.has(lesson.id) ? "✓" : lesson.badge;
    elements.lessonTitle.textContent = lesson.title;
    elements.lessonGoal.textContent = lesson.goal;
    elements.previousLessonButton.disabled = lessonIndex === 0;
    elements.nextLessonButton.disabled = lessonIndex === lessons.length - 1;
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

  function recentTutorConversation() {
    return [...elements.lessonChat.querySelectorAll(".chat-message")]
      .slice(-6)
      .map((message) => {
        const role = message.classList.contains("user") ? "学習者" : "ロボット君";
        return `${role}: ${message.querySelector(".chat-bubble")?.textContent || ""}`;
      })
      .join("\n");
  }

  function addChatMessage(text, sender = "robot", style = "") {
    const message = document.createElement("div");
    message.className = `chat-message ${sender} ${style}`.trim();
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
    elements.robotAvatar.classList.remove(
      "happy", "thinking", "encourage", "sad", "surprised",
    );
    if (mood !== "neutral") elements.robotAvatar.classList.add(mood);
    if (duration) {
      robotMoodTimer = setTimeout(() => {
        elements.robotAvatar.classList.remove(
          "happy", "thinking", "encourage", "sad", "surprised",
        );
      }, duration);
    }
  }

  function setTutorBusy(busy) {
    elements.tutorStatus.classList.toggle("busy", busy);
    elements.tutorStatus.lastChild.textContent = busy ? " 考えています…" : " Gemini先生";
    elements.tutorThinking.hidden = !busy;
  }

  function selectLesson(nextIndex) {
    if (!lessons.length) return;
    aiLesson = null;
    lessonIndex = Math.min(Math.max(0, nextIndex), lessons.length - 1);
    activeLessonId = null;
    hintIndex = 0;
    localStorage.setItem(STORAGE.lessonIndex, String(lessonIndex));
    renderLesson();
    openCurrentLesson({ introduction: true });
  }

  function showTutorProfile() {
    elements.welcomeIntro.hidden = true;
    elements.tutorProfileForm.hidden = false;
    elements.lessonPanel.classList.add("profile-mode");
    elements.tutorGoal.value = tutorProfile.goal;
    document.querySelectorAll('input[name="tutorLevel"]').forEach((input) => {
      input.checked = input.value === tutorProfile.level;
    });
    elements.tutorGoal.focus();
  }

  function welcomeTutor(event) {
    event.preventDefault();
    const selectedLevel = document.querySelector('input[name="tutorLevel"]:checked');
    tutorProfile = {
      level: selectedLevel?.value || "はじめて",
      goal: elements.tutorGoal.value.trim(),
    };
    localStorage.setItem(STORAGE.tutorProfile, JSON.stringify(tutorProfile));
    tutorProfileRevision += 1;
    tunedLessons.clear();
    tuningRequests.clear();
    tutorWelcomed = true;
    localStorage.setItem(STORAGE.tutorWelcomed, "yes");
    lessonIndex = 0;
    localStorage.setItem(STORAGE.lessonIndex, "0");
    renderTutorShell();
    openCurrentLesson({ introduction: true, firstMeeting: true });
  }

  function resetLessons() {
    if (!confirm("レッスン進捗と、経験レベル・作りたいものなどのAI設定をすべて消しますか？")) return;
    completedLessons.clear();
    tunedLessons.clear();
    tuningRequests.clear();
    aiLesson = null;
    activeLessonId = null;
    hintIndex = 0;
    lessonIndex = 0;
    tutorProfile = { level: "はじめて", goal: "" };
    tutorProfileRevision += 1;
    tutorWelcomed = false;
    tutorRequestSequence += 1;
    localStorage.removeItem(STORAGE.lessonProgress);
    localStorage.removeItem(STORAGE.lessonIndex);
    localStorage.removeItem(STORAGE.tutorProfile);
    localStorage.removeItem(STORAGE.tutorWelcomed);
    elements.tutorProfileForm.reset();
    elements.tutorProfileForm.hidden = true;
    elements.welcomeIntro.hidden = false;
    elements.lessonPanel.classList.remove("profile-mode");
    clearLessonChat();
    setTutorBusy(false);
    setRobotMood("neutral");
    if (lessons[0]) setSource(lessons[0].starter);
    renderLesson();
    showToast("進捗とAI設定をリセットしました");
  }

  function openCurrentLesson({ introduction = false, firstMeeting = false } = {}) {
    const lesson = currentLesson();
    if (!lesson) return;
    activeLessonId = lesson.id;
    hintIndex = 0;
    setRobotMood("neutral");
    setSource(lesson.starter);
    renderLesson();
    clearLessonChat();
    if (introduction) {
      const baseLesson = lessons[lessonIndex];
      const cachedTuning = baseLesson ? tunedLessons.get(baseLesson.id) : null;
      if (!aiLesson && lessonIndex > 0 && !cachedTuning) {
        void tuneLessonForProfile(baseLesson).then(prefetchFollowingLesson);
      } else if (cachedTuning) {
        setRobotMood(cachedTuning.mood || "neutral", 2800);
        robotSpeak(cachedTuning.intro);
        prefetchFollowingLesson();
      } else {
        void askRobot(firstMeeting ? "first_meeting" : "lesson_start", {
          fallback: firstMeeting
            ? `はじめまして！ ロボット君です。\n最初の目標は「${lesson.goal}」。一緒にやってみよう！`
            : `${lesson.intro}\n目標は「${lesson.goal}」。できたら答え合わせしてね。`,
        }).finally(prefetchFollowingLesson);
      }
    }
  }

  function prefetchFollowingLesson() {
    if (!tutorWelcomed || aiLesson) return;
    const nextLesson = lessons[lessonIndex + 1];
    if (!nextLesson || tunedLessons.has(nextLesson.id)) return;
    void tuneLessonForProfile(nextLesson, { background: true });
  }

  async function tuneLessonForProfile(baseLesson, { background = false } = {}) {
    if (!baseLesson || baseLesson.id === lessons[0]?.id) return null;
    const cached = tunedLessons.get(baseLesson.id);
    if (cached) return cached;
    const profileRevision = tutorProfileRevision;
    let request = tuningRequests.get(baseLesson.id);
    if (!request) {
      request = generateTunedLesson(baseLesson)
        .then((tuned) => {
          if (profileRevision !== tutorProfileRevision) return null;
          tunedLessons.set(baseLesson.id, tuned);
          return tuned;
        })
        .finally(() => {
          if (tuningRequests.get(baseLesson.id) === request) {
            tuningRequests.delete(baseLesson.id);
          }
        });
      tuningRequests.set(baseLesson.id, request);
    }
    if (background) {
      try {
        return await request;
      } catch {
        return null;
      }
    }

    setRobotMood("thinking");
    setTutorBusy(true);
    try {
      const tuned = await request;
      if (tuned && activeLessonId === baseLesson.id && !aiLesson) {
        setSource(tuned.starter);
        renderLesson();
        setRobotMood(tuned.mood, 2800);
        robotSpeak(tuned.intro);
      }
      return tuned;
    } catch {
      if (activeLessonId === baseLesson.id && !aiLesson) {
        setRobotMood("encourage", 2200);
        robotSpeak(baseLesson.intro);
      }
      return null;
    } finally {
      setTutorBusy(false);
    }
  }

  async function generateTunedLesson(baseLesson) {
    const requiredFeature = LESSON_FEATURES[baseLesson.id];
    const text = await callGemini(
      [
          "あなたはPopPop言語の教材編集者です。",
          "次の既存レッスンを参考に、学習者一人のための新しい問題を一問だけ作ってください。",
          `今回必ず学ぶ機能は ${requiredFeature} です。starterとsolutionの両方で使ってください。`,
          "元のコードと同じ確実な構文構造を使い、値・変数名・題材・正解条件は変えて構いません。",
          "starterは実行可能だが目標をまだ満たさず、solutionは目標を満たす完成コードにします。",
          "starterとsolutionの最後の文は、必ず `値または変数 >> Display.` にしてください。",
          "改行には構文上の意味がありません。通常の文は `.`、ブロック全体は `..` で閉じます。",
          "小学高学年でも一度で読める、自然で優しい日本語にしてください。",
          "題名は「何を作るか」が分かる18文字以内の表現にし、できれば「〜しよう」で終えてください。",
          "「全員を変換」「非破壊更新」「道を選ぶ」のような直訳調・仕様書調の題名は禁止です。",
          "List、Dict、Boolean、accumulatorなどの専門語は避け、リスト、辞書、true、これまでの結果と書いてください。",
          "一文には一つの行動だけを書き、introは80文字以内、goalは60文字以内、hintsは2個にしてください。",
          "JSONだけを返してください。",
          '形式: {"title":"題名","intro":"導入","goal":"目標","starter":"未完成コード","solution":"完成コード","hints":["ヒント1","ヒント2"],"mood":"neutral"}',
          "moodは neutral, happy, thinking, encourage, surprised のいずれかです。",
          `学習者の経験: ${tutorProfile.level}`,
          `学習者が作りたいもの: ${tutorProfile.goal || "まだ決めていない"}`,
          `元の題名: ${baseLesson.title}`,
          `元の導入: ${baseLesson.intro}`,
          `元の目標: ${baseLesson.goal}`,
          `元のヒント: ${(baseLesson.hints || []).join(" / ")}`,
          `安全な未完成コード例:\n${baseLesson.starter}`,
          `安全な完成コード例:\n${baseLesson.solution}`,
      ].join("\n\n"),
      true,
    );
    const data = parseJsonText(text);
    if (
      !data?.title || !data?.intro || !data?.goal ||
      !data?.starter || !data?.solution || !Array.isArray(data?.hints)
    ) {
      throw new Error("生成した問題を読み取れませんでした");
    }
    if (
      data.hints.length < 2 ||
      !hasFinalDisplay(data.starter) || !hasFinalDisplay(data.solution) ||
      !String(data.starter).includes(requiredFeature) ||
      !String(data.solution).includes(requiredFeature) ||
      String(data.starter).trim() === String(data.solution).trim()
    ) {
      throw new Error("生成した問題がレッスン条件を満たしませんでした");
    }
    const moods = ["neutral", "happy", "thinking", "encourage", "surprised"];
    return {
      ...baseLesson,
      dynamic: true,
      title: String(data.title).slice(0, 40),
      intro: String(data.intro).slice(0, 160),
      goal: String(data.goal).slice(0, 120),
      starter: String(data.starter).trim(),
      solution: String(data.solution).trim(),
      hints: data.hints.slice(0, 2).map((hint) => String(hint).slice(0, 180)),
      mood: moods.includes(data.mood) ? data.mood : "neutral",
    };
  }

  async function showLessonHint() {
    const lesson = currentLesson();
    if (!lesson || activeLessonId !== lesson.id) return;
    const hints = lesson.hints ?? [];
    if (!hints.length) return;
    const hint = hints[hintIndex];
    hintIndex = Math.min(hintIndex + 1, hints.length - 1);
    await askRobot("hint", {
      extra: `教材のヒント: ${hint}`,
      fallback: `ここに注目してみよう：${hint}`,
    });
  }

  async function showLessonAnswer() {
    const lesson = currentLesson();
    if (!lesson || activeLessonId !== lesson.id) return;
    setSource(lesson.solution);
    await askRobot("answer_revealed", {
      fallback: "答えを表示したよ。実行して、値の流れを一緒に確かめよう。",
    });
  }

  async function handleLessonResult(validation) {
    const lesson = currentLesson();
    if (!lesson || activeLessonId !== lesson.id) return;
    if (validation.passed) {
      completedLessons.add(lesson.id);
      localStorage.setItem(
        STORAGE.lessonProgress,
        JSON.stringify([...completedLessons]),
      );
      if (lessonIndex < lessons.length - 1) {
        elements.advanceLessonButton.hidden = false;
      }
      renderLesson();
      await askRobot(
        lessonIndex < lessons.length - 1 ? "correct" : "course_complete",
        {
          extra: `実行環境の判定: ${validation.message}`,
          fallback: lessonIndex < lessons.length - 1
            ? `正解！ ${validation.message} 次もきっとできるよ。`
            : `全レッスン完走！ ${validation.message} 本当におめでとう！`,
          success: true,
        },
      );
    } else {
      await askRobot("incorrect", {
        extra: `実行環境の判定: ${validation.message}`,
        fallback: `${validation.message}\nあと少し。コードの流れを一緒に見直そう。`,
      });
    }
  }

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async function callGeminiOnce(promptText, jsonMode = false) {
    const proxyResponse = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptText, json: jsonMode }),
    }).catch(() => null);
    if (proxyResponse?.ok) {
      const payload = await proxyResponse.json();
      return payload.text?.trim() || null;
    }
    const detail = await proxyResponse?.json().catch(() => ({}));
    const error = new Error(detail?.error || "Gemini先生に接続できませんでした");
    error.status = proxyResponse?.status || 0;
    error.retryAfter = Number(proxyResponse?.headers.get("retry-after")) || 0;
    throw error;
  }

  function callGemini(promptText, jsonMode = false) {
    const run = async () => {
      const minimumInterval = 6500;
      const remaining = minimumInterval - (Date.now() - lastGeminiRequestAt);
      if (remaining > 0) await wait(remaining);
      lastGeminiRequestAt = Date.now();
      try {
        return await callGeminiOnce(promptText, jsonMode);
      } catch (error) {
        if (error.status !== 429) throw error;
        const retryDelay = Math.max(12000, error.retryAfter * 1000);
        await wait(retryDelay);
        lastGeminiRequestAt = Date.now();
        return callGeminiOnce(promptText, jsonMode);
      }
    };
    const request = geminiRequestQueue.then(run, run);
    geminiRequestQueue = request.catch(() => null);
    return request;
  }

  function parseJsonText(text) {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : null;
    }
  }

  function hasFinalDisplay(source) {
    return />>\s*Display\.\s*$/.test(String(source || ""));
  }

  async function askRobot(event, {
    extra = "",
    fallback = "いっしょに考えてみよう。",
    success = false,
  } = {}) {
    const lesson = currentLesson();
    const requestId = ++tutorRequestSequence;
    setRobotMood("thinking");
    setTutorBusy(true);
    try {
      const text = await callGemini(
        [
          "あなたはPopPop Playgroundに住む、親しみやすいロボット先生です。",
          "幼すぎない、短く自然な日本語で話します。1回の発言は原則80文字以内です。",
          "ユーザーの答えを奪わず、次の一歩が分かる言葉を選びます。",
          "正誤は与えられた実行環境の判定に必ず従い、自分で覆しません。",
          "状況に合う表情をあなた自身で選んでください。",
          "moodは neutral, happy, thinking, encourage, sad, surprised のいずれかです。",
          "JSONだけを返してください。",
          '形式: {"message":"画面に表示する発言","mood":"表情"}',
          `出来事: ${event}`,
          `学習者の経験: ${tutorProfile.level}`,
          `学習者が作りたいもの: ${tutorProfile.goal || "まだ決めていない"}`,
          `レッスン: ${lesson?.title || "なし"}`,
          `目標: ${lesson?.goal || "なし"}`,
          `現在のコード:\n${getSource()}`,
          `直前の会話:\n${recentTutorConversation() || "なし"}`,
          extra,
        ].filter(Boolean).join("\n\n"),
        true,
      );
      if (requestId !== tutorRequestSequence) return;
      const data = parseJsonText(text);
      const moods = new Set(["neutral", "happy", "thinking", "encourage", "sad", "surprised"]);
      const mood = moods.has(data?.mood) ? data.mood : success ? "happy" : "neutral";
      const message = String(data?.message || fallback).trim().slice(0, 240);
      setRobotMood(mood, mood === "thinking" ? 1800 : 3200);
      robotSpeak(message, success || mood === "happy");
    } catch {
      if (requestId !== tutorRequestSequence) return;
      setRobotMood(success ? "happy" : "encourage", 2400);
      robotSpeak(fallback, success);
    } finally {
      if (requestId === tutorRequestSequence) setTutorBusy(false);
    }
  }

  async function evaluateAiLesson(result) {
    const lesson = currentLesson();
    if (!lesson?.dynamic) return;
    const requestId = ++tutorRequestSequence;
    setRobotMood("thinking");
    setTutorBusy(true);
    try {
      const text = await callGemini(
        [
          "あなたはPopPop言語の練習問題を採点する先生です。",
          "完成例との文字列一致ではなく、目標を達成しているかで判定してください。",
          "JSONだけを返してください。",
          '形式: {"passed":true,"message":"80文字以内の講評","mood":"happy"}',
          "moodは happy, encourage, thinking, surprised のいずれかです。",
          `目標: ${lesson.goal}`,
          `完成例:\n${lesson.solution}`,
          `ユーザーのコード:\n${getSource()}`,
          `実行結果: ${JSON.stringify(result)}`,
        ].join("\n\n"),
        true,
      );
      if (requestId !== tutorRequestSequence) return;
      const data = parseJsonText(text);
      const passed = data?.passed === true;
      if (passed && lessons.some((baseLesson) => baseLesson.id === lesson.id)) {
        completedLessons.add(lesson.id);
        localStorage.setItem(
          STORAGE.lessonProgress,
          JSON.stringify([...completedLessons]),
        );
        elements.advanceLessonButton.hidden = lessonIndex >= lessons.length - 1;
        renderLesson();
      }
      const mood = ["happy", "encourage", "thinking", "surprised"].includes(data?.mood)
        ? data.mood
        : passed ? "happy" : "encourage";
      setRobotMood(mood, 3200);
      robotSpeak(
        String(data?.message || (passed ? "目標達成！ よくできました。" : "あと少し。出力を見直してみよう。")).slice(0, 240),
        passed,
      );
    } catch {
      setRobotMood("encourage", 2400);
      robotSpeak("実行できたね。出力と目標が同じになっているか、見比べてみよう。");
    } finally {
      if (requestId === tutorRequestSequence) setTutorBusy(false);
    }
  }

  async function createAiLesson() {
    setRobotMood("thinking");
    setTutorBusy(true);
    try {
      const text = await callGemini(
        [
          "あなたはPopPop言語のやさしい先生です。",
          "初心者向けの短い練習問題を1つ作ってください。",
          "PopPopは `>>` で値を流し、通常の文は `.`、ブロック全体は `..` で閉じます。",
          "使えるもの: Display, Map(name):, Filter(name):, Reduce(name):, Check(name): is ... else:, Update(name):, Fork(name):, Range, Sum, Length, Random, Get。",
          "最終結果は必ず `>> Display.` で表示してください。",
          `学習者の経験は「${tutorProfile.level}」です。難しさと説明量を合わせてください。`,
          `作りたいものは「${tutorProfile.goal || "まだ決めていない"}」です。できるだけ近い題材にしてください。`,
          "JSONだけを返してください。",
          '形式: {"title":"短いタイトル","goal":"目標","starter":"未完成コード","solution":"完成コード","hints":["ヒント1","ヒント2"]}',
        ].join("\n"),
        true,
      );
      const data = parseJsonText(text);
      if (!data?.starter || !data?.solution || !data?.goal) throw new Error("AIの問題形式を読み取れませんでした");
      if (!hasFinalDisplay(data.starter) || !hasFinalDisplay(data.solution)) {
        throw new Error("最後に Display を使う問題を作れませんでした");
      }
      aiLesson = {
        id: `ai-${Date.now()}`,
        dynamic: true,
        badge: "AI",
        title: data.title || "AI問題",
        goal: data.goal,
        intro: "Geminiが作ったその場限りの問題です。",
        starter: data.starter,
        solution: data.solution,
        hints: Array.isArray(data.hints) ? data.hints : [],
      };
      activeLessonId = aiLesson.id;
      hintIndex = 0;
      setSource(aiLesson.starter);
      renderLesson();
      clearLessonChat();
      await askRobot("ai_lesson_created", {
        extra: `あなたが作った新しい問題の目標: ${aiLesson.goal}`,
        fallback: `${aiLesson.title}\n${aiLesson.goal}\nできたら答え合わせしてね。`,
      });
    } catch (error) {
      setRobotMood("encourage", 1800);
      robotSpeak("今は新しい問題を作れなかったよ。少し時間をおいて、もう一度試してね。");
    } finally {
      setTutorBusy(false);
    }
  }

  function explainLessonError(error) {
    const text = String(error ?? "");
    const localized = localizeError(error);
    if (text.includes("SyntaxError")) {
      setRobotMood("encourage", 1800);
      return `文法を読み取れなかったよ。\n${localized}\n\`. \` や \`..\`、括弧の閉じ忘れを確認してみよう。`;
    }
    if (text.includes("Undefined") || text.includes("not defined")) {
      return `まだ名前が作られていないようです。\n${localized}\n名前を付けるパイプが先に実行されているか見てみよう。`;
    }
    return `実行中に問題を見つけました。\n${localized}\n慌てなくて大丈夫。ヒントも使えます。`;
  }

  async function answerLessonQuestion(question) {
    const lesson = currentLesson();
    if (!lesson) {
      robotSpeak("レッスンを準備しています。少し待ってね。");
      return;
    }
    const requestId = ++tutorRequestSequence;
    setRobotMood("thinking");
    setTutorBusy(true);
    try {
      const text = await callGemini(
        [
          "あなたはPopPop Playgroundに住むロボット先生です。",
          "短く自然な日本語で、質問に直接答えてください。",
          "完成コードを丸ごと渡さず、理解できる次の一手を示してください。",
          "PopPopでは改行に構文上の意味はなく、通常の文は .、ブロック全体は .. で閉じます。",
          ">> は左の値を右へ流します。すべての標準関数は元の値を破壊しません。",
          "不確かな仕様を作らず、分からない場合は仕様書を確認するよう伝えてください。",
          "JSONだけを返してください。",
          '形式: {"message":"回答","mood":"neutral"}',
          "moodは neutral, happy, thinking, encourage, sad, surprised のいずれかです。",
          `学習者の経験: ${tutorProfile.level}`,
          `学習者が作りたいもの: ${tutorProfile.goal || "まだ決めていない"}`,
          `現在の目標: ${lesson.goal}`,
          `現在のコード:\n${getSource()}`,
          `診断:\n${elements.diagnosticsPanel.textContent}`,
          `直前の会話:\n${recentTutorConversation() || "なし"}`,
          `質問: ${question}`,
        ].join("\n\n"),
        true,
      );
      if (requestId !== tutorRequestSequence) return;
      const data = parseJsonText(text);
      const moods = ["neutral", "happy", "thinking", "encourage", "sad", "surprised"];
      const mood = moods.includes(data?.mood) ? data.mood : "neutral";
      setRobotMood(mood, 3000);
      robotSpeak(String(data?.message || "もう少し詳しく教えてくれる？").slice(0, 320));
    } catch {
      if (requestId !== tutorRequestSequence) return;
      setRobotMood("sad", 2400);
      robotSpeak("うまく考えを届けられなかったよ。少し待って、もう一度聞いてみてね。");
    } finally {
      if (requestId === tutorRequestSequence) setTutorBusy(false);
    }
  }

  function showLessonOverview() {
    if (!lessons.length) return;
    const overview = lessons.map((lesson, index) => {
      const mark = completedLessons.has(lesson.id) ? "✓" : index === lessonIndex ? "→" : "・";
      return `${mark} ${lesson.badge} ${lesson.title}`;
    }).join("\n");
    askRobot("course_overview", {
      extra: `コース一覧:\n${overview}`,
      fallback: `基礎コース一覧\n${overview}`,
    });
  }

  function advanceLesson() {
    if (lessonIndex >= lessons.length - 1) return;
    selectLesson(lessonIndex + 1);
  }

  function formatSource() {
    const formatter = window.PopPopFormatter;
    if (!formatter) {
      showToast("整形機能を読み込めませんでした");
      return;
    }
    const formatted = formatter.formatDocument(getSource(), 4);
    setSource(formatted);
    showToast("VS Codeと同じ規則でコードを整えました ✦");
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
    document.addEventListener("keydown", (event) => {
      if (event.shiftKey && event.altKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        formatSource();
      }
    });
    elements.examplesTab.addEventListener("click", () => switchSidePanel("examples"));
    elements.referenceTab.addEventListener("click", () => switchSidePanel("reference"));
    elements.lessonTab.addEventListener("click", () => switchSidePanel("lesson"));
    elements.previousLessonButton.addEventListener("click", () =>
      selectLesson(lessonIndex - 1));
    elements.nextLessonButton.addEventListener("click", () =>
      selectLesson(lessonIndex + 1));
    elements.lessonTitleButton.addEventListener("click", showLessonOverview);
    elements.welcomeTutorButton.addEventListener("click", showTutorProfile);
    elements.tutorProfileForm.addEventListener("submit", welcomeTutor);
    elements.resetLessonButton.addEventListener("click", resetLessons);
    elements.checkLessonButton.addEventListener("click", startRun);
    elements.hintButton.addEventListener("click", showLessonHint);
    elements.showAnswerButton.addEventListener("click", showLessonAnswer);
    elements.aiLessonButton.addEventListener("click", createAiLesson);
    elements.advanceLessonButton.addEventListener("click", advanceLesson);
    elements.lessonQuestionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const question = elements.lessonQuestion.value.trim();
      if (!question) return;
      addChatMessage(question, "user");
      elements.lessonQuestion.value = "";
      answerLessonQuestion(question);
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
      elements.resultBody.classList.remove("input-active");
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
