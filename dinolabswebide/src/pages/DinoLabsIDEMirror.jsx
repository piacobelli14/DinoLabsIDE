
import React, { useEffect, useRef, useLayoutEffect, forwardRef, useImperativeHandle } from "react";

const DinoLabsIDEMirror = forwardRef(({
  viewCode,
  setViewCode,
  fullCode,
  setFullCode,
  collapsedLines,
  setCollapsedLines,
  currentLanguage,
  searchTerm,
  searchPositions,
  setSearchPositions,
  currentSearchIndex,
  setCurrentSearchIndex,
  handleSearch,
  handleReplace,
  handleReplaceAll,
  containerHeight,
  buffer,
  visibleStartLine,
  visibleEndLine,
  updateVisibleLines,
  renderLineNumbers,
  handleScroll,
  handleKeyDown,
  handleInput,
  preRef,
  textareaRef,
  lineNumberRef,
  highlightedCode,
  displayLines,
  mapping,
  getMaxDigits,
  handleCopyToClipboard,
  copySuccess,
  isSupported,
  forceOpen,
  onForceOpen,
  lineHeight,
  fontSize
}, ref) => {
  const cursorPositionRef = useRef(null);

  useEffect(() => {
    updateVisibleLines();
  }, [lineHeight, fontSize, containerHeight, viewCode, collapsedLines]);

  const handleInputWithCursor = (e) => {
    const textarea = textareaRef.current;
    if (textarea) {
      cursorPositionRef.current = textarea.selectionStart;
    }
    handleInput(e);
  };

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && cursorPositionRef.current !== null) {
      const newPosition = Math.min(cursorPositionRef.current, viewCode.length);
      textarea.setSelectionRange(newPosition, newPosition);
      cursorPositionRef.current = null;
    }
  }, [viewCode]);

  useEffect(() => {
    const handleCopy = (e) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const { selectionStart, selectionEnd } = textarea;
      const viewLines = viewCode.split(/\r?\n/);
      const fullLines = fullCode.split(/\r?\n/);
      let cumulativeLength = 0;
      let startLine = 0;
      let endLine = viewLines.length - 1;

      for (let i = 0; i < viewLines.length; i++) {
        const line = viewLines[i];
        const lineLength = line.length + 1;

        if (selectionStart < cumulativeLength + lineLength) {
          startLine = i;
          break;
        }
        cumulativeLength += lineLength;
      }

      cumulativeLength = 0;

      for (let i = 0; i < viewLines.length; i++) {
        const line = viewLines[i];
        const lineLength = line.length + 1;

        if (selectionEnd <= cumulativeLength + lineLength) {
          endLine = i;
          break;
        }
        cumulativeLength += lineLength;
      }

      const selectedViewLines = viewLines.slice(startLine, endLine + 1);
      const selectedMappingLines = mapping.slice(startLine, endLine + 1);
      const copiedLines = selectedViewLines.map((line, idx) => {
        const mappingLine = selectedMappingLines[idx];
        if (React.isValidElement(mappingLine)) {
          const startLineNumber = parseInt(mappingLine.props['data-start-line'], 10);
          const endLineNumber = parseInt(mappingLine.props['data-end-line'], 10);
          const startIndex = startLineNumber - 1;
          const endIndex = endLineNumber - 1;
          const collapsedContent = fullLines.slice(startIndex, endIndex + 1).join('\n');
          return collapsedContent;
        } else {
          const fullLineIndex = mappingLine - 1;
          return fullLines[fullLineIndex] || '';
        }
      });
      const finalCopiedText = copiedLines.join('\n');
      e.clipboardData.setData('text/plain', finalCopiedText);
      e.preventDefault();
    };

    if (textareaRef.current) {
      textareaRef.current.addEventListener('copy', handleCopy);
    }

    return () => {
      if (textareaRef.current) {
        textareaRef.current.removeEventListener('copy', handleCopy);
      }
    };
  }, [viewCode, mapping, fullCode]);

  useImperativeHandle(ref, () => ({
    jumpToLine: (lineNumber) => {
      const scrollTop = (lineNumber - 1) * lineHeight;
      if (textareaRef.current) {
        textareaRef.current.scrollTop = scrollTop;
      }
      if (preRef.current) {
        preRef.current.scrollTop = scrollTop;
      }
    }
  }));

  return (
    <>
      <div
        className="lineNumberMargin"
        ref={lineNumberRef}
        style={{
          lineHeight: `${lineHeight}px`,
          fontSize: `${fontSize}px`
        }}
        onWheel={(e) => {
          if (textareaRef.current) {
            textareaRef.current.scrollTop += e.deltaY;
            e.preventDefault();
          }
        }}
      >
        {renderLineNumbers(mapping)}
      </div>
      <div className="codeEditorWrapper" style={{ lineHeight: `${lineHeight}px`, fontSize: `${fontSize}px`, position: 'relative' }}>
        <pre
          aria-hidden="true"
          ref={preRef}
          style={{
            position: 'absolute',
            boxSizing: 'border-box',
            overflow: 'auto',
            overflowWrap: 'normal',
            whiteSpace: 'pre',
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
            lineHeight: `${lineHeight}px`,
            fontSize: `${fontSize}px`
          }}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />

        <textarea
          ref={textareaRef}
          value={viewCode}
          onChange={handleInputWithCursor}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          style={{
            position: 'absolute',
            boxSizing: 'border-box',
            overflow: 'auto',
            overflowWrap: 'normal',
            whiteSpace: 'pre',
            resize: 'none',
            border: 'none',
            outline: 'none',
            lineHeight: `${lineHeight}px`,
            fontSize: `${fontSize}px`,
            background: 'transparent',
            color: 'transparent',
            caretColor: 'white',
            width: '100%',
            height: '100%',
          }}
          wrap="off"
          aria-label="Code Editor"
          role="textbox"
        />
      </div>
    </>
  );
});

export default DinoLabsIDEMirror;

