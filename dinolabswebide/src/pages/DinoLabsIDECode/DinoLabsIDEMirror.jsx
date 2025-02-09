import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";

function saveSelection(containerEl) {
  if (!containerEl) return null;
  return {
    start: containerEl.selectionStart,
    end: containerEl.selectionEnd,
  };
}

function restoreSelection(containerEl, savedSel) {
  if (!savedSel || !containerEl) return;
  const { scrollTop, scrollLeft } = containerEl;
  containerEl.selectionStart = savedSel.start;
  containerEl.selectionEnd = savedSel.end;
  containerEl.scrollTop = scrollTop;
  containerEl.scrollLeft = scrollLeft;
}

function offsetToLineCol(text, offset) {
  let idx = 0;
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (offset <= idx + lines[i].length) {
      return { line: i, col: offset - idx };
    }
    idx += lines[i].length + 1;
  }
  return {
    line: lines.length - 1,
    col: lines[lines.length - 1].length,
  };
}

function lineColToOffset(text, line, col) {
  const lines = text.split("\n");
  let sum = 0;
  for (let i = 0; i < line && i < lines.length; i++) {
    sum += lines[i].length + 1;
  }
  return sum + Math.min(col, lines[line].length);
}

function unifyIndentation(line) {
  let i = 0;
  while (i < line.length && (line[i] === " " || line[i] === "\t")) {
    i++;
  }
  const leading = line.slice(0, i);
  const rest = line.slice(i);

  let spaceCount = 0;
  for (let j = 0; j < leading.length; j++) {
    spaceCount += leading[j] === "\t" ? 4 : 1;
  }
  return " ".repeat(spaceCount) + rest;
}

const DinoLabsIDEMirror = forwardRef(function DinoLabsIDEMirror(
  {
    viewCode,
    setViewCode,
    handleInput,
    handleKeyDown,
    highlightedCode,
    fontSize,
    lineHeight,
    editorId,
    disableFocus,
    keyBinds,
    lintErrors = [],
  },
  ref
) {
  const containerRef = useRef(null);
  const highlightRef = useRef(null);
  const textareaRef = useRef(null);
  const lastSavedSelRef = useRef(null);
  const isUpdatingContentRef = useRef(false);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const [contextMenuState, setContextMenuState] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const commandChainRef = useRef(Promise.resolve());

  function queueCommand(fn) {
    commandChainRef.current = commandChainRef.current.then(fn);
  }

  function pushUndoSnapshot() {
    const sel = saveSelection(textareaRef.current);
    undoStackRef.current.push({ code: viewCode, sel });
  }

  function doUndo() {
    return new Promise((resolve) => {
      if (!undoStackRef.current.length) {
        resolve();
        return;
      }
      const textEl = textareaRef.current;
      if (!textEl) {
        resolve();
        return;
      }
      const currentSel = saveSelection(textEl);
      redoStackRef.current.push({ code: viewCode, sel: currentSel });

      const prev = undoStackRef.current.pop();
      const st = textEl.scrollTop;
      const sl = textEl.scrollLeft;

      setViewCode(prev.code);
      handleInput({ target: { value: prev.code } });

      if (prev.sel) {
        lastSavedSelRef.current = prev.sel;
        restoreSelection(textEl, prev.sel);
      }
      textEl.scrollTop = st;
      textEl.scrollLeft = sl;
      resolve();
    });
  }

  function doRedo() {
    return new Promise((resolve) => {
      if (!redoStackRef.current.length) {
        resolve();
        return;
      }
      const textEl = textareaRef.current;
      if (!textEl) {
        resolve();
        return;
      }
      const currentSel = saveSelection(textEl);
      undoStackRef.current.push({ code: viewCode, sel: currentSel });

      const next = redoStackRef.current.pop();
      const st = textEl.scrollTop;
      const sl = textEl.scrollLeft;

      setViewCode(next.code);
      handleInput({ target: { value: next.code } });

      if (next.sel) {
        lastSavedSelRef.current = next.sel;
        restoreSelection(textEl, next.sel);
      }
      textEl.scrollTop = st;
      textEl.scrollLeft = sl;
      resolve();
    });
  }

  function doPaste(selStart, selEnd) {
    return new Promise(async (resolve) => {
      const textEl = textareaRef.current;
      if (!textEl) {
        resolve();
        return;
      }
      pushUndoSnapshot();

      const st = textEl.scrollTop;
      const sl = textEl.scrollLeft;

      const clipText = await navigator.clipboard.readText();
      const original = viewCode;

      let updated = original.slice(0, selStart) + original.slice(selEnd);
      updated =
        updated.slice(0, selStart) + clipText + updated.slice(selStart);

      const newCaret = selStart + clipText.length;
      setViewCode(updated);
      handleInput({ target: { value: updated } });

      lastSavedSelRef.current = { start: newCaret, end: newCaret };
      restoreSelection(textEl, lastSavedSelRef.current);

      textEl.scrollTop = st;
      textEl.scrollLeft = sl;
      resolve();
    });
  }

  function doCut(selStart, selEnd) {
    return new Promise(async (resolve) => {
      if (selStart === selEnd) {
        resolve();
        return;
      }
      const textEl = textareaRef.current;
      if (!textEl) {
        resolve();
        return;
      }
      pushUndoSnapshot();

      const st = textEl.scrollTop;
      const sl = textEl.scrollLeft;

      const original = viewCode;
      const cutText = original.slice(selStart, selEnd);
      await navigator.clipboard.writeText(cutText);

      const updated = original.slice(0, selStart) + original.slice(selEnd);
      setViewCode(updated);
      handleInput({ target: { value: updated } });

      lastSavedSelRef.current = { start: selStart, end: selStart };
      restoreSelection(textEl, lastSavedSelRef.current);

      textEl.scrollTop = st;
      textEl.scrollLeft = sl;
      resolve();
    });
  }

  function doCopy(selStart, selEnd) {
    return new Promise(async (resolve) => {
      if (selStart === selEnd) {
        resolve();
        return;
      }
      const selectedText = viewCode.slice(selStart, selEnd);
      await navigator.clipboard.writeText(selectedText);
      resolve();
    });
  }

  function doSelectAll() {
    return new Promise((resolve) => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
      resolve();
    });
  }

  function doEnter() {
    return new Promise((resolve) => {
      const textEl = textareaRef.current;
      if (!textEl) {
        resolve();
        return;
      }
      const selObj = saveSelection(textEl);
      if (!selObj) {
        resolve();
        return;
      }
      pushUndoSnapshot();

      const st = textEl.scrollTop;
      const sl = textEl.scrollLeft;

      isUpdatingContentRef.current = true;
      try {
        const { start, end } = selObj;
        const text = viewCode;
        const { line } = offsetToLineCol(text, start);

        const lineStartOffset = lineColToOffset(text, line, 0);
        const lineFragment = text.slice(lineStartOffset, start);
        const indentMatch = lineFragment.match(/^[ \t]+/);
        const indentation = indentMatch ? indentMatch[0] : "";
        const insertion = "\n" + indentation;

        const newText = text.slice(0, start) + insertion + text.slice(end);
        const newPosition = start + insertion.length;

        setViewCode(newText);
        handleInput({ target: { value: newText } });

        lastSavedSelRef.current = { start: newPosition, end: newPosition };
        restoreSelection(textEl, lastSavedSelRef.current);
      } finally {
        isUpdatingContentRef.current = false;
      }

      textEl.scrollTop = st;
      textEl.scrollLeft = sl;
      resolve();
    });
  }

  function doBackspace() {
    return new Promise((resolve) => {
      const textEl = textareaRef.current;
      if (!textEl) {
        resolve();
        return;
      }
      const selObj = saveSelection(textareaRef.current);
      if (!selObj) {
        resolve();
        return;
      }
      pushUndoSnapshot();

      const st = textEl.scrollTop;
      const sl = textEl.scrollLeft;

      let { start, end } = selObj;
      const original = viewCode;

      if (start !== end) {
        const updated = original.slice(0, start) + original.slice(end);
        setViewCode(updated);
        handleInput({ target: { value: updated } });
        lastSavedSelRef.current = { start, end: start };
        restoreSelection(textEl, lastSavedSelRef.current);
      } else if (start > 0) {
        const updated = original.slice(0, start - 1) + original.slice(start);
        const newCaret = start - 1;
        setViewCode(updated);
        handleInput({ target: { value: updated } });
        lastSavedSelRef.current = { start: newCaret, end: newCaret };
        restoreSelection(textEl, lastSavedSelRef.current);
      }

      textEl.scrollTop = st;
      textEl.scrollLeft = sl;
      resolve();
    });
  }

  function doTab(shiftKey) {
    return new Promise((resolve) => {
      const textEl = textareaRef.current;
      if (!textEl) {
        resolve();
        return;
      }
      const selObj = saveSelection(textEl);
      if (!selObj) {
        resolve();
        return;
      }
      pushUndoSnapshot();

      const st = textEl.scrollTop;
      const sl = textEl.scrollLeft;

      let { start, end } = selObj;
      if (start > end) [start, end] = [end, start];
      const code = viewCode;

      if (start === end) {
        if (!shiftKey) {
          const updated = code.slice(0, start) + "    " + code.slice(start);
          const newCaret = start + 4;
          setViewCode(updated);
          handleInput({ target: { value: updated } });

          lastSavedSelRef.current = { start: newCaret, end: newCaret };
          restoreSelection(textEl, lastSavedSelRef.current);
        } else {
          let backtrack = 0;
          let idx = start - 1;
          while (backtrack < 4 && idx >= 0 && code[idx] === " ") {
            idx--;
            backtrack++;
          }
          if (backtrack > 0) {
            const updated =
              code.slice(0, start - backtrack) + code.slice(start);
            const newCaret = start - backtrack;
            setViewCode(updated);
            handleInput({ target: { value: updated } });

            lastSavedSelRef.current = { start: newCaret, end: newCaret };
            restoreSelection(textEl, lastSavedSelRef.current);
          }
        }
      } else {
        const startLC = offsetToLineCol(code, start);
        const endLC = offsetToLineCol(code, end);

        const startLine = Math.min(startLC.line, endLC.line);
        const endLine = Math.max(startLC.line, endLC.line);

        const lines = code.split("\n");
        for (let i = startLine; i <= endLine; i++) {
          if (!shiftKey) {
            lines[i] = "    " + lines[i];
          } else if (lines[i].startsWith("    ")) {
            lines[i] = lines[i].slice(4);
          } else if (lines[i].startsWith("\t")) {
            lines[i] = lines[i].slice(1);
          }
        }
        const updated = lines.join("\n");
        setViewCode(updated);
        handleInput({ target: { value: updated } });

        const shiftAmount = shiftKey ? -4 : 4;
        let newStartLC = { ...startLC };
        let newEndLC = { ...endLC };

        newStartLC.col = Math.max(0, newStartLC.col + shiftAmount);
        newEndLC.col = Math.max(0, newEndLC.col + shiftAmount);

        const newSelStart = lineColToOffset(updated, newStartLC.line, newStartLC.col);
        const newSelEnd = lineColToOffset(updated, newEndLC.line, newEndLC.col);

        lastSavedSelRef.current = { start: newSelStart, end: newSelEnd };
        restoreSelection(textEl, lastSavedSelRef.current);
      }

      textEl.scrollTop = st;
      textEl.scrollLeft = sl;
      resolve();
    });
  }

  function handleKeyDownInternal(e) {
    const selObj = saveSelection(textareaRef.current);
    if (!selObj) {
      handleKeyDown(e);
      return;
    }
    let { start, end } = selObj;
    if (start > end) [start, end] = [end, start];

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const keyLower = e.key.toLowerCase();

    if (!keyBinds) {
      handleKeyDown(e);
      return;
    }

    if (isCtrlOrCmd && keyLower === keyBinds.undo?.toLowerCase()) {
      e.preventDefault();
      queueCommand(() => doUndo());
    } else if (isCtrlOrCmd && keyLower === keyBinds.redo?.toLowerCase()) {
      e.preventDefault();
      queueCommand(() => doRedo());
    } else if (isCtrlOrCmd && keyLower === keyBinds.paste?.toLowerCase()) {
      e.preventDefault();
      queueCommand(() => doPaste(start, end));
    } else if (isCtrlOrCmd && keyLower === keyBinds.cut?.toLowerCase()) {
      e.preventDefault();
      queueCommand(() => doCut(start, end));
    } else if (isCtrlOrCmd && keyLower === keyBinds.copy?.toLowerCase()) {
      e.preventDefault();
      queueCommand(() => doCopy(start, end));
    } else if (isCtrlOrCmd && keyLower === keyBinds.selectAll?.toLowerCase()) {
      e.preventDefault();
      queueCommand(() => doSelectAll());
    } else if (e.key === "Enter") {
      e.preventDefault();
      queueCommand(() => doEnter());
    } else if (e.key === "Backspace") {
      e.preventDefault();
      queueCommand(() => doBackspace());
    } else if (e.key === "Tab") {
      e.preventDefault();
      queueCommand(() => doTab(e.shiftKey));
    } else {
      handleKeyDown(e);
    }
  }

  function handleKeyUp() {
    if (lastSavedSelRef.current && textareaRef.current) {
      restoreSelection(textareaRef.current, lastSavedSelRef.current);
    }
  }

  function handleTextAreaScroll() {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }

  function handleTextAreaChange() {
    if (!isUpdatingContentRef.current) {
      const raw = textareaRef.current.value || "";
      const s = saveSelection(textareaRef.current);

      setViewCode(raw);
      handleInput({ target: { value: raw } });

      if (s) {
        lastSavedSelRef.current = s;
        restoreSelection(textareaRef.current, s);
      }
    }
  }

  useEffect(() => {
    if (!highlightRef.current) return;
    const splitted = highlightedCode.includes("<br")
      ? highlightedCode.split(/<br\s*\/?>/gi)
      : highlightedCode.split(/\r\n|\r|\n/);
    const highlightLines = splitted.map((line) =>
      line.trim() === "" ? "\u200B" : line
    );

    let finalHTML = "";
    for (let i = 0; i < highlightLines.length; i++) {
      const style = `
        display:block;
        margin:0; padding:0;
        line-height:${lineHeight}px;
        letter-spacing:0;
        font-family:monospace;
        white-space: pre;
      `;
      if (highlightLines[i] === "\u200B") {
        finalHTML += `<span style="white-space:pre; ${style}">\u200B<br></span>`;
      } else {
        finalHTML += `<span style="white-space:pre; ${style}">${highlightLines[i]}\n</span>`;
      }
    }
    highlightRef.current.innerHTML = finalHTML;

    if (!disableFocus && lastSavedSelRef.current && textareaRef.current) {
      setTimeout(() => {
        restoreSelection(textareaRef.current, lastSavedSelRef.current);
        lastSavedSelRef.current = null;
      }, 0);
    }
  }, [viewCode, lineHeight, highlightedCode, disableFocus]);

  function handleContextMenu(e) {
    e.preventDefault();
    const menuWidth = 120;
    const menuHeight = 180;
    let x = e.clientX;
    let y = e.clientY;
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight;
    }
    setContextMenuState({ visible: true, x, y });
  }

  useEffect(() => {
    const hideContextMenu = () =>
      setContextMenuState({ visible: false, x: 0, y: 0 });
    window.addEventListener("click", hideContextMenu);
    return () => window.removeEventListener("click", hideContextMenu);
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    function handleCopyOrCut(e) {
      e.preventDefault();
      const sel = saveSelection(el);
      if (!sel) return;
      let { start, end } = sel;
      if (start > end) [start, end] = [end, start];
      const selectedText = el.value.slice(start, end);
      if (selectedText.length > 0) {
        e.clipboardData.setData("text/plain", selectedText);
        if (e.type === "cut") {
          queueCommand(() => doCut(start, end));
        }
      }
    }

    el.addEventListener("copy", handleCopyOrCut);
    el.addEventListener("cut", handleCopyOrCut);
    return () => {
      el.removeEventListener("copy", handleCopyOrCut);
      el.removeEventListener("cut", handleCopyOrCut);
    };
  }, [viewCode, handleInput, setViewCode]);

  const splitted = highlightedCode.includes("<br")
    ? highlightedCode.split(/<br\s*\/?>/gi)
    : highlightedCode.split(/\r\n|\r|\n/);
  const lines = splitted.map((l) => (l === "" ? "\u200B" : l));

  const lineElements = lines.map((lineHtml, i) => {
    const lineNumber = i + 1;
    const hasError = lintErrors.some((e) => e.line === lineNumber);
    return (
      <div
        key={`line-${lineNumber}-${editorId}`}
        data-line-number={lineNumber}
        className={`codeLine${hasError ? " errorHighlight" : ""}`}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}px`,
        }}
      >
        <div className="lineNumberMarginWrapper">{lineNumber}</div>
        <div
          className="lineEditorWrapper"
          dangerouslySetInnerHTML={{ __html: lineHtml + "\n" }}
        />
      </div>
    );
  });

  function doPasteAtCursor() {
    const sel = saveSelection(textareaRef.current);
    if (!sel) return;
    queueCommand(() => doPaste(sel.start, sel.end));
  }

  function doCutSelection() {
    const sel = saveSelection(textareaRef.current);
    if (!sel) return;
    let { start, end } = sel;
    if (start !== end) {
      queueCommand(() => doCut(start, end));
    }
  }

  function doCopySelection() {
    const sel = saveSelection(textareaRef.current);
    if (!sel) return;
    let { start, end } = sel;
    if (start < end) {
      queueCommand(() => doCopy(start, end));
    }
  }

  useImperativeHandle(ref, () => ({
    selectAll() {
      doSelectAll();
    },
    pasteAtCursor(text) {
      const selObj = saveSelection(textareaRef.current);
      if (!selObj) return;
      pushUndoSnapshot();

      queueCommand(async () => {
        const textEl = textareaRef.current;
        if (!textEl) return;

        const st = textEl.scrollTop;
        const sl = textEl.scrollLeft;

        let { start, end } = selObj;
        if (start > end) [start, end] = [end, start];

        const original = viewCode;
        let updated = original.slice(0, start) + original.slice(end);
        updated = updated.slice(0, start) + text + updated.slice(start);

        const newCaret = start + text.length;
        setViewCode(updated);
        handleInput({ target: { value: updated } });

        lastSavedSelRef.current = { start: newCaret, end: newCaret };
        restoreSelection(textEl, lastSavedSelRef.current);

        textEl.scrollTop = st;
        textEl.scrollLeft = sl;
      });
    },
    getCodeContent() {
      return viewCode;
    },
    jumpToLine(lineNum) {
      ensureVisible(lineNum);
    },
    ensureVisible(lineNum) {
      if (!containerRef.current) return;
      const lineEl = containerRef.current.querySelector(
        `[data-line-number="${lineNum}"]`
      );
      if (lineEl) {
        lineEl.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    },
    doUndo,
    doRedo,
    doPasteAtCursor,
    doCutSelection,
    doCopySelection,
    doSelectAll,
  }));

  function ensureVisible(lineNumber) {
    if (!containerRef.current) return;
    const lineEl = containerRef.current.querySelector(
      `[data-line-number="${lineNumber}"]`
    );
    if (lineEl) {
      lineEl.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  return (
    <div
      ref={containerRef}
      onContextMenu={handleContextMenu}
      className="scriptEditorContainer"
    >
      <div className="scriptEditorSubContainer">
        {lineElements}
        <pre
          ref={highlightRef}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeight}px`,
          }}
        />
        <textarea
          ref={textareaRef}
          value={viewCode}
          onChange={handleTextAreaChange}
          onKeyDown={handleKeyDownInternal}
          onKeyUp={handleKeyUp}
          onScroll={handleTextAreaScroll}
          spellCheck={false}
          wrap="off"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeight}px`,
          }}
          disabled={disableFocus}
        />
      </div>

      {contextMenuState.visible && (
        <ul
          className="dinolabsIDEMarkdownContextMenu"
          style={{
            top: contextMenuState.y,
            left: contextMenuState.x,
          }}
        >
          <li
            onClick={(e) => {
              e.stopPropagation();
              const sel = saveSelection(textareaRef.current);
              if (!sel) return;
              let { start, end } = sel;
              if (start > end) [start, end] = [end, start];
              const selectedText = textareaRef.current.value.slice(start, end);
              if (selectedText) {
                navigator.clipboard.writeText(selectedText);
              } else {
                navigator.clipboard.writeText(textareaRef.current.value);
              }
              setContextMenuState({ visible: false, x: 0, y: 0 });
            }}
            className="dinolabsIDEMarkdownContextMenuItem"
          >
            Copy
          </li>
          <li
            onClick={(e) => {
              e.stopPropagation();
              const selObj = saveSelection(textareaRef.current);
              if (!selObj) return;
              let { start, end } = selObj;
              if (start > end) [start, end] = [end, start];

              navigator.clipboard.readText().then((clipText) => {
                queueCommand(async () => {
                  pushUndoSnapshot();
                  const textEl = textareaRef.current;
                  if (!textEl) return;

                  const st = textEl.scrollTop;
                  const sl = textEl.scrollLeft;

                  const original = viewCode;
                  let updated = original.slice(0, start) + original.slice(end);
                  updated =
                    updated.slice(0, start) +
                    clipText +
                    updated.slice(start);

                  const newCaret = start + clipText.length;
                  setViewCode(updated);
                  handleInput({ target: { value: updated } });

                  lastSavedSelRef.current = { start: newCaret, end: newCaret };
                  restoreSelection(textEl, lastSavedSelRef.current);

                  textEl.scrollTop = st;
                  textEl.scrollLeft = sl;
                });
              });

              setContextMenuState({ visible: false, x: 0, y: 0 });
            }}
            className="dinolabsIDEMarkdownContextMenuItem"
          >
            Paste
          </li>
          <li
            onClick={(e) => {
              e.stopPropagation();
              const selObj = saveSelection(textareaRef.current);
              if (!selObj) return;
              let { start, end } = selObj;
              if (start !== end) {
                queueCommand(() => doCut(start, end));
              }
              setContextMenuState({ visible: false, x: 0, y: 0 });
            }}
            className="dinolabsIDEMarkdownContextMenuItem"
          >
            Cut
          </li>
          <li
            onClick={(e) => {
              e.stopPropagation();
              queueCommand(() => doUndo());
              setContextMenuState({ visible: false, x: 0, y: 0 });
            }}
            className="dinolabsIDEMarkdownContextMenuItem"
          >
            Undo
          </li>
          <li
            onClick={(e) => {
              e.stopPropagation();
              queueCommand(() => doRedo());
              setContextMenuState({ visible: false, x: 0, y: 0 });
            }}
            style={{ border: "none" }}
            className="dinolabsIDEMarkdownContextMenuItem"
          >
            Redo
          </li>
        </ul>
      )}
    </div>
  );
});

export default DinoLabsIDEMirror;
