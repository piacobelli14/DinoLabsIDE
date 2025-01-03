import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import {
  faA,
  faArrowDown,
  faArrowUp,
  faCopy,
  faExclamationTriangle,
  faList,
  faMagnifyingGlass,
  faMagnifyingGlassPlus,
  faSquare,
  faTableColumns,
  faXmark,
  faCode
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DinoLabsIDEMirror from "./DinoLabsIDEMirror";
import { syntaxHighlight, escapeRegExp } from "./DinoLabsIDEParser";

const undoStackMap = {};
const redoStackMap = {};

let editorIdCounter = 0;
const generateEditorId = () => {
  editorIdCounter += 1;
  return `dinolabs-editor-${editorIdCounter}`;
};

const languageImageMap = {
  JavaScript: "javascript.svg",
  TypeScript: "typescript.svg",
  HTML: "html.svg",
  CSS: "css.svg",
  JSON: "json.svg",
  XML: "xml.svg",
  Python: "python.svg",
  PHP: "php.svg",
  Swift: "swift.svg",
  C: "c.svg",
  "C++": "c++.svg",
  "C#": "csharp.svg"
};

const DinoLabsIDEMarkdown = forwardRef(({
  fileContent,
  detectedLanguage,
  forceOpen,
  onForceOpen,
  searchTerm,
  setSearchTerm,
  replaceTerm,
  setReplaceTerm,
  searchPositions,
  setSearchPositions,
  currentSearchIndex,
  setCurrentSearchIndex,
  onSplit,
  disableSplit,
  paneIndex,
  tabId, 
  isSearchOpen, 
  isReplaceOpen, 
  setTabSearchOpen, 
  setTabReplaceOpen,
  onEdit,
  onSave,     
  fileHandle,
  isGlobalSearchActive,
  lintProblems,
}, ref) => {
  const lineNumberRef = useRef(null);
  const lineNumbersContentRef = useRef(null);
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const searchInputRef = useRef(null);
  const debounceTimer = useRef(null);
  const scrollLeftRef = useRef(0);
  const savedScrollTopRef = useRef(0);
  const isSettingContentRef = useRef(false); 
  const editorId = useRef(generateEditorId()).current;
  const [fullCode, setFullCode] = useState("");
  const [viewCode, setViewCode] = useState("");
  const [collapsedLines, setCollapsedLines] = useState(new Set());
  const [currentLanguage, setCurrentLanguage] = useState(detectedLanguage || "Unknown");
  const [visibleStartLine, setVisibleStartLine] = useState(0);
  const [visibleEndLine, setVisibleEndLine] = useState(0);
  const [lineHeight, setLineHeight] = useState(24); 
  const [containerHeight, setContainerHeight] = useState(400);
  const buffer = 5;
  const [isSearchOpenInternal, setIsSearchOpenInternal] = useState(isSearchOpen || false); 
  const [isReplaceOpenInternal, setIsReplaceOpenInternal] = useState(isReplaceOpen || false); 
  const [copySuccess, setCopySuccess] = useState("");
  const [saveStatus, setSaveStatus] = useState(""); 
  const [lineNumberMappings, setLineNumberMappings] = useState([]);
  const [isCaseSensitiveSearch, setIsCaseSensitiveSearch] = useState(true); 
  const getMaxDigits = (number) => { return String(number).length; };

  if (!undoStackMap[tabId]) {
    undoStackMap[tabId] = [];
  }
  if (!redoStackMap[tabId]) {
    redoStackMap[tabId] = [];
  }

  const mirrorRef = useRef(null);
  const [activeLineNumber, setActiveLineNumber] = useState(null);

  useImperativeHandle(ref, () => ({
    setContent: (newContent) => {
      const previousState = { fullCode, collapsedLines: new Set(collapsedLines) }; 
      undoStackMap[tabId].push(previousState);
      redoStackMap[tabId] = [];
      isSettingContentRef.current = true;
      setFullCode(newContent);
      const { displayedLines, lineNumberMappings } = generateViewCode(newContent, collapsedLines);
      setViewCode(displayedLines.join('\n'));
      setLineNumberMappings(lineNumberMappings);
      setCollapsedLines(new Set());
      setSearchPositions([]);
      setCurrentSearchIndex(-1);
      setActiveLineNumber(null); 
      updateVisibleLines();

      if (textareaRef.current) {
        textareaRef.current.value = displayedLines.join('\n');
      }
      isSettingContentRef.current = false;
      onEdit(paneIndex, tabId, previousState, { fullCode: newContent, collapsedLines: new Set(collapsedLines) });
    },
    handleUndo: () => {
      handleUndo();
    },
    handleRedo: () => {
      handleRedo();
    },
    jumpToLine: (lineNumber) => {
      if (mirrorRef.current && typeof mirrorRef.current.jumpToLine === 'function') {
        mirrorRef.current.jumpToLine(lineNumber);
        setActiveLineNumber(lineNumber);
      }
    }
  }));

  useEffect(() => {
    if (isSettingContentRef.current) {
      if (searchTerm) {
        handleSearch(fullCode);
      }
      isSettingContentRef.current = false;
      return;
    }

    const trimmedContent = (fileContent || "").replace(/[\n\r]+$/, "");
    setFullCode(trimmedContent);
    
    const { displayedLines, lineNumberMappings } = generateViewCode(trimmedContent, collapsedLines);
    setViewCode(displayedLines.join('\n'));
    setLineNumberMappings(lineNumberMappings);
    setCollapsedLines(new Set());
    setSearchPositions([]);
    setCurrentSearchIndex(-1);
    setActiveLineNumber(null);
    updateVisibleLines();
    if (textareaRef.current) {
      textareaRef.current.value = displayedLines.join('\n');
    }
  }, [fileContent, forceOpen]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm, isCaseSensitiveSearch]);

  useEffect(() => {
    setIsSearchOpenInternal(isSearchOpen);
  }, [isSearchOpen]);

  useEffect(() => {
    setIsReplaceOpenInternal(isReplaceOpen);
  }, [isReplaceOpen]);

  useEffect(() => {
    if (currentSearchIndex >= 0 && searchPositions.length > 0) {
      const currentMatch = searchPositions[currentSearchIndex];
      highlightSearchResult(currentMatch);
    }
  }, [currentSearchIndex, searchPositions]);

  const handleKeyDown = (event) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? event.metaKey : event.ctrlKey;

    if (modifier) {
      switch (event.key.toLowerCase()) {
        case 's': 
          event.preventDefault();
          handleSave();
          break;
        case 'z':
          event.preventDefault();
          handleUndo();
          break;
        case 'y':
          event.preventDefault();
          handleRedo();
          break;
        case 'x':
          event.preventDefault();
          handleCut();
          break;
        case 'c':
          event.preventDefault();
          handleCopy();
          break;
        case 'v':
          event.preventDefault();
          handlePaste();
          break;
        case 'a':
          event.preventDefault();
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(0, viewCode.length);
          }
          break;
        case 'f':
          event.preventDefault();
          openSearch();
          break;
        default:
          break;
      }
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const { selectionStart, selectionEnd } = event.target;
      const tabCharacter = "    ";

      const updatedViewCode =
        viewCode.substring(0, selectionStart) +
        tabCharacter +
        viewCode.substring(selectionEnd);

      undoStackMap[tabId].push({ fullCode, collapsedLines: new Set(collapsedLines) });
      redoStackMap[tabId] = [];

      setViewCode(updatedViewCode);
      setFullCode(mapViewToFullCode(updatedViewCode, fullCode, collapsedLines));
      setLineNumberMappings(generateViewCode(updatedViewCode, collapsedLines).lineNumberMappings);
      if (!isSettingContentRef.current) {
        onEdit(paneIndex, tabId, { fullCode, collapsedLines: new Set(collapsedLines) }, { fullCode: mapViewToFullCode(updatedViewCode, fullCode, collapsedLines), collapsedLines: new Set(collapsedLines) });
      }

      setTimeout(() => {
        event.target.selectionStart = event.target.selectionEnd =
          selectionStart + tabCharacter.length;
      }, 0);
      updateVisibleLines();
    }
  };

  const handleInput = (event) => {
    if (!isSettingContentRef.current) {
      const previousState = { fullCode, collapsedLines: new Set(collapsedLines) };
      const updatedViewCode = event.target.value;
      const updatedViewLines = updatedViewCode.split(/\r?\n/);
      const originalViewLines = viewCode.split(/\r?\n/);
      const newViewLines = [...updatedViewLines]; 

      let isValid = true;

      newViewLines.forEach((line, idx) => {
        if (originalViewLines[idx] && originalViewLines[idx].trim() === '...') {
          const expectedIndent = getIndentLevel(originalViewLines[idx]) + 4;
          const actualIndent = getIndentLevel(line);
          if (line.trim() !== '...' || actualIndent !== expectedIndent) {
            newViewLines[idx] = ' '.repeat(expectedIndent) + '...';
            isValid = false;
          }
        }
      });

      if (!isValid) {
        setViewCode(newViewLines.join('\n'));
        return;
      }

      const newFullCode = updatedViewCode;
      setViewCode(updatedViewCode);
      setFullCode(newFullCode);
      setLineNumberMappings(generateViewCode(updatedViewCode, collapsedLines).lineNumberMappings);
      setSearchPositions([]);
      setCurrentSearchIndex(-1);
      setActiveLineNumber(null);
      updateVisibleLines();

      undoStackMap[tabId].push({ fullCode, collapsedLines: new Set(collapsedLines) });
      redoStackMap[tabId] = [];

      onEdit(paneIndex, tabId, previousState, { fullCode: newFullCode, collapsedLines: new Set(collapsedLines) });
    }
  };

  const handleUndo = () => {
    if (undoStackMap[tabId].length === 0) return;
    const previousState = undoStackMap[tabId].pop();
    redoStackMap[tabId].push({ fullCode, collapsedLines: new Set(collapsedLines) });
    isSettingContentRef.current = true;
    setFullCode(previousState.fullCode);
    setCollapsedLines(new Set(previousState.collapsedLines));
    
    const { displayedLines, lineNumberMappings } = generateViewCode(previousState.fullCode, previousState.collapsedLines);
    setViewCode(displayedLines.join('\n'));
    setLineNumberMappings(lineNumberMappings);
    setActiveLineNumber(null);
    
    updateVisibleLines();
    
    onEdit(
      paneIndex,
      tabId,
      { fullCode, collapsedLines: new Set(collapsedLines) }, 
      { fullCode: previousState.fullCode, collapsedLines: new Set(previousState.collapsedLines) }
    );
  };

  const handleRedo = () => {
    if (redoStackMap[tabId].length === 0) return;
    const nextState = redoStackMap[tabId].pop();
    undoStackMap[tabId].push({ fullCode, collapsedLines: new Set(collapsedLines) });
    isSettingContentRef.current = true;
    setFullCode(nextState.fullCode);
    setCollapsedLines(new Set(nextState.collapsedLines));
    
    const { displayedLines, lineNumberMappings } = generateViewCode(nextState.fullCode, nextState.collapsedLines);
    setViewCode(displayedLines.join('\n'));
    setLineNumberMappings(lineNumberMappings);
    setActiveLineNumber(null);
    updateVisibleLines();
    
    onEdit(
      paneIndex,
      tabId,
      { fullCode, collapsedLines: new Set(collapsedLines) }, 
      { fullCode: nextState.fullCode, collapsedLines: new Set(nextState.collapsedLines) } 
    );
  };

  const handleCut = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const { selectionStart, selectionEnd } = textarea;
      const selectedText = viewCode.substring(selectionStart, selectionEnd);

      if (selectedText) {
        const previousState = { fullCode, collapsedLines: new Set(collapsedLines) };
        undoStackMap[tabId].push(previousState); 
        redoStackMap[tabId] = []; 

        const updatedViewCode =
          viewCode.substring(0, selectionStart) +
          viewCode.substring(selectionEnd);

        setViewCode(updatedViewCode);
        setFullCode(mapViewToFullCode(updatedViewCode, fullCode, collapsedLines));
        setLineNumberMappings(generateViewCode(updatedViewCode, collapsedLines).lineNumberMappings);
        setSearchPositions([]);
        setCurrentSearchIndex(-1);
        setActiveLineNumber(null);

        navigator.clipboard.writeText(selectedText).then(() => {
          setCopySuccess("Cut to clipboard!");
          setTimeout(() => {
            setCopySuccess("");
          }, 2000);
        });
        onEdit(paneIndex, tabId, previousState, { fullCode: mapViewToFullCode(updatedViewCode, fullCode, collapsedLines), collapsedLines: new Set(collapsedLines) });
      }
    }
  };

  const handleCopy = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd } = textarea;
    const viewLines = viewCode.split(/\r?\n/);
    const fullLines = fullCode.split(/\r?\n/);

    let startLine = 0;
    let endLine = viewLines.length - 1;

    let currentLength = 0;
    for (let i = 0; i < viewLines.length; i++) {
      const lineLength = viewLines[i].length + 1; 
      if (selectionStart < currentLength + lineLength) {
        startLine = i;
        break;
      }
      currentLength += lineLength;
    }

    currentLength = 0;
    for (let i = 0; i < viewLines.length; i++) {
      const lineLength = viewLines[i].length + 1;
      if (selectionEnd <= currentLength + lineLength) {
        endLine = i;
        break;
      }
      currentLength += lineLength;
    }

    const selectedViewLines = viewLines.slice(startLine, endLine + 1);
    const selectedMappingLines = lineNumberMappings.slice(startLine, endLine + 1);
    const copiedLines = selectedViewLines.map((line, idx) => {
      const mappingLine = lineNumberMappings[startLine + idx];
      if (React.isValidElement(mappingLine)) {
        const startLineNumber = parseInt(mappingLine.props['data-start-line'], 10);
        const endLineNumber = parseInt(mappingLine.props['data-end-line'], 10);
        const collapsedContent = fullLines.slice(startLineNumber - 1, endLineNumber).join('\n');
        return collapsedContent;
      } else {
        const fullLineIndex = mappingLine - 1;
        return fullLines[fullLineIndex] || '';
      }
    });
    const finalCopiedText = copiedLines.join('\n');

    navigator.clipboard.writeText(finalCopiedText).then(() => {
      setCopySuccess("Copied to clipboard!");
      setTimeout(() => {
        setCopySuccess("");
      }, 2000);
    }).catch(() => {
      setCopySuccess("Failed to copy!");
      setTimeout(() => {
        setCopySuccess("");
      }, 2000);
    });
  };

  const handlePaste = () => {
    if (textareaRef.current) {
      navigator.clipboard.readText().then((text) => {
        const textarea = textareaRef.current;
        const { selectionStart, selectionEnd } = textarea;

        const previousState = { fullCode, collapsedLines: new Set(collapsedLines) };
        undoStackMap[tabId].push(previousState); 
        redoStackMap[tabId] = [];

        const updatedViewCode =
          viewCode.substring(0, selectionStart) +
          text +
          viewCode.substring(selectionEnd);

        setViewCode(updatedViewCode);
        setFullCode(mapViewToFullCode(updatedViewCode, fullCode, collapsedLines));
        setLineNumberMappings(generateViewCode(updatedViewCode, collapsedLines).lineNumberMappings);
        setSearchPositions([]);
        setCurrentSearchIndex(-1);
        setActiveLineNumber(null);
        updateVisibleLines();
        onEdit(paneIndex, tabId, previousState, { fullCode: mapViewToFullCode(updatedViewCode, fullCode, collapsedLines), collapsedLines: new Set(collapsedLines) });
      }).catch(() => {
        setCopySuccess("Failed to paste!");
        setTimeout(() => {
          setCopySuccess("");
        }, 2000);
      });
    }
  };

  const openSearch = () => {
    setIsSearchOpenInternal(true);
    setTabSearchOpen(true);
    setIsReplaceOpenInternal(false);
    setTabReplaceOpen(false);
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 0);
    }
  };

  const generateViewCode = (fullCode, collapsedSet) => {
    const lines = fullCode.split(/\r?\n/);
    const displayedLines = [];
    const lineNumberMappings = [];
    const skippedLines = new Set();

    for (let i = 0; i < lines.length; i++) {
      if (skippedLines.has(i)) continue;

      if (collapsedSet.has(i)) {
        const parentLine = lines[i];
        if (parentLine.trim() === "") {
          displayedLines.push(parentLine);
          lineNumberMappings.push(i + 1);
          continue;
        }

        displayedLines.push(parentLine);
        lineNumberMappings.push(i + 1);

        const blockLines = getBlockLines(fullCode, i);
        if (blockLines.length > 0) {
          const startLineNumber = blockLines[0] + 1;
          const endLineNumber = blockLines[blockLines.length - 1] + 1;
          const currentIndent = getIndentLevel(parentLine);
          const ellipsisIndent = ' '.repeat(currentIndent + 4); 

          displayedLines.push(ellipsisIndent + '...');
          lineNumberMappings.push(
            <span key={`mapping-${i}-${editorId}`} data-start-line={startLineNumber} data-end-line={endLineNumber}>
              {startLineNumber} ... {endLineNumber}
            </span>
          );
          blockLines.forEach(line => skippedLines.add(line));
        }
      } else {
        displayedLines.push(lines[i]);
        lineNumberMappings.push(i + 1);
      }
    }

    while (displayedLines.length > 0) {
      const lastLine = displayedLines[displayedLines.length - 1].trim();
      const lastMapping = lineNumberMappings[lineNumberMappings.length - 1];
      
      if ((lastLine === '...' || lastLine === '') && !React.isValidElement(lastMapping)) {
        displayedLines.pop();
        lineNumberMappings.pop();
      } else {
        break; 
      }
    }

    return { displayedLines, lineNumberMappings };
  };

  const mapViewToFullCode = (updatedViewCode, currentFullCode, collapsedSet) => {
    const viewLines = updatedViewCode.split(/\r?\n/);
    const fullLines = currentFullCode.split(/\r?\n/);
    const newFullLines = [];
    let fullIndex = 0;
  
    for (let viewIndex = 0; viewIndex < viewLines.length; viewIndex++) {
      const viewLine = viewLines[viewIndex];

      if (viewLine.trim() === '...') {
        const collapsedRange = lineNumberMappings[viewIndex];
        if (React.isValidElement(collapsedRange)) {
          const startLineNumber = parseInt(collapsedRange.props['data-start-line'], 10);
          const endLineNumber = parseInt(collapsedRange.props['data-end-line'], 10);
          newFullLines.push(...fullLines.slice(startLineNumber - 1, endLineNumber));
          fullIndex = endLineNumber;
        }
      } else {
        if (fullIndex < fullLines.length) {
          newFullLines.push(fullLines[fullIndex]);
          fullIndex++;
        } else {
          newFullLines.push(viewLine);
        }
      }
    }

    while (fullIndex < fullLines.length) {
      newFullLines.push(fullLines[fullIndex]);
      fullIndex++;
    }

    return newFullLines.join('\n');
  };

  const updateVisibleLines = () => {
    if (!lineNumberRef.current) return;

    const scrollTop = lineNumberRef.current.scrollTop;
    const startLine = Math.floor(scrollTop / lineHeight) - buffer;
    const visibleLineCount = Math.ceil(containerHeight / lineHeight) + 2 * buffer;

    const newVisibleStartLine = Math.max(0, startLine);
    const newVisibleEndLine = Math.min(newVisibleStartLine + visibleLineCount, viewCode.split(/\r?\n/).length);

    setVisibleStartLine(newVisibleStartLine);
    setVisibleEndLine(newVisibleEndLine);
  };

  const handleScrollSync = () => {
    if (textareaRef.current && lineNumberRef.current && preRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      lineNumberRef.current.scrollTop = scrollTop;
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
      scrollLeftRef.current = textareaRef.current.scrollLeft;
    }
  };

  const hasCollapsibleBlock = (lines, lineIndex) => {
    if (lineIndex >= lines.length - 1) return false;
    const currentLine = lines[lineIndex];
    if (currentLine.trim() === "") return false; 
    const currentIndent = getIndentLevel(currentLine);

    for (let i = lineIndex + 1; i < lines.length; i++) {
      if (lines[i].trim() === "") continue;
      const indent = getIndentLevel(lines[i]);
      if (indent > currentIndent) return true;
      if (indent <= currentIndent) break;
    }
    return false;
  };

  const toggleCollapse = (startLineIndex) => {
    if (textareaRef.current) {
      savedScrollTopRef.current = textareaRef.current.scrollTop;
    }

    const newCollapsedLines = new Set(collapsedLines);

    if (newCollapsedLines.has(startLineIndex)) {
      newCollapsedLines.delete(startLineIndex);
    } else {
      newCollapsedLines.add(startLineIndex);
    }

    undoStackMap[tabId].push({ fullCode, collapsedLines: new Set(collapsedLines) }); 
    redoStackMap[tabId] = [];
    setCollapsedLines(newCollapsedLines);
    setActiveLineNumber(null);
    const { displayedLines, lineNumberMappings } = generateViewCode(fullCode, newCollapsedLines);
    
    setViewCode(displayedLines.join('\n'));
    setLineNumberMappings(lineNumberMappings);
    updateVisibleLines();
  };

  const renderLineNumbers = (lineNumberMappings) => {
      const totalLines = lineNumberMappings.length;
      const totalHeight = totalLines * lineHeight;

      const startLine = visibleStartLine;
      const endLine = Math.min(visibleEndLine, totalLines);

      const visibleLines = lineNumberMappings.slice(startLine, endLine);

      return (
          <div style={{ height: totalHeight, position: 'relative', width: '100%' }}>
              <div style={{ height: startLine * lineHeight }}></div>
              <div
                  ref={lineNumbersContentRef}
                  className="lineNumberContainer"
                  style={{ position: 'relative' }}
              >
                  {visibleLines.map((lineNumber, index) => {
                      const actualIndex = startLine + index;
                      const isRange = React.isValidElement(lineNumber) && typeof lineNumber.props.children === 'object';

                      if (isRange) {
                          const content = lineNumber; 
                          return (
                              <div
                                  key={`range-${actualIndex}-${editorId}`}
                                  className="lineNumber collapsedIndicator"
                                  style={{
                                      height: `${lineHeight}px`,
                                  }}
                              >
                                  <Tippy content={`Collapsed block from line ${content.props['data-start-line']} to line ${content.props['data-end-line']}`} theme="tooltip-light">
                                      <span className="ellipsisCaret">
                                          {content}
                                      </span>
                                  </Tippy>
                              </div>
                          );
                      }

                      const problemsForLine = lintProblems.filter(problem => problem.line === lineNumber);
                      let dotColor = null;
                      if (problemsForLine.some(problem => problem.severity === 'error')) {
                          dotColor = '#E54B4B'; 
                      } else if (problemsForLine.some(problem => problem.severity === 'warning')) {
                          dotColor = '#EFDE2A'; 
                      }

                      return (
                          <div
                              key={`line-${lineNumber}-${actualIndex}-${editorId}`}
                              className={`lineNumber ${lineNumber === activeLineNumber ? 'activeLineNumber' : ''}`}
                              style={{
                                  height: `${lineHeight}px`,
                                  lineHeight: `${lineHeight}px`,
                              }}
                          >
                              <span className="numberText">
                                  {lineNumber}

                                  {dotColor && (
                                    <span 
                                        className="lineProblemDot" 
                                        style={{
                                            backgroundColor: dotColor,
                                        }}
                                    />
                                )}
                              </span>

                              

                              {!isRange && hasCollapsibleBlock(fullCode.split(/\r?\n/), lineNumber - 1) && (
                                  <span
                                      className={`lineCaret ${collapsedLines.has(lineNumber - 1) ? "collapsed" : "expanded"}`}
                                      onClick={() => toggleCollapse(lineNumber - 1)}
                                  >
                                      {collapsedLines.has(lineNumber - 1) ? "▶" : "▼"}
                                  </span>
                              )}
                          </div>
                      );
                  })}
              </div>
              <div style={{ height: (totalLines - endLine) * lineHeight }}></div>
          </div>
      );
  };


  const isSupported = currentLanguage !== "Unknown";

  const handleSearch = (codeToSearch = fullCode) => {
    if (!searchTerm) {
      setSearchPositions([]);
      setCurrentSearchIndex(-1);
      return;
    }

    let regexFlags = '';
    if (!isCaseSensitiveSearch) {
      regexFlags += 'i';
    }

    try {
      const regex = new RegExp(escapeRegExp(searchTerm), regexFlags);
      const matches = [];

      const lines = codeToSearch.split(/\r?\n/);
      lines.forEach((line, index) => {
        if (regex.test(line) && line.trim() !== '') {
          matches.push({ lineNumber: index + 1 });
        }
      });

      setSearchPositions(matches);
      if (matches.length > 0) {
        setCurrentSearchIndex(0);
      } else {
        setCurrentSearchIndex(-1);
      }
    } catch (error) {
      setSearchPositions([]);
      setCurrentSearchIndex(-1);
    }
  };

  const highlightSearchResult = (position) => {
    if (textareaRef.current) {
      const lineNumber = position.lineNumber;
      scrollToPosition(lineNumber);
      ensureLineVisible(lineNumber);
      setActiveLineNumber(lineNumber);
    }
  };

  const handleNextSearch = () => {
    if (searchPositions.length === 0) return;
    const nextIndex = (currentSearchIndex + 1) % searchPositions.length;
    setCurrentSearchIndex(nextIndex);
  };

  const handlePrevSearch = () => {
    if (searchPositions.length === 0) return;
    const prevIndex = (currentSearchIndex - 1 + searchPositions.length) % searchPositions.length;
    setCurrentSearchIndex(prevIndex);
  };

  const handleEnterSearch = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNextSearch();
    }
  };

  const scrollToPosition = (lineNumber) => {
    if (!textareaRef.current || !preRef.current) return;
    const textarea = textareaRef.current;
    const computedStyle = window.getComputedStyle(textarea);
    let lh = parseInt(computedStyle.lineHeight, 10);
    if (isNaN(lh)) {
      const fontSize = parseInt(computedStyle.fontSize, 10);
      lh = fontSize * 1.2;
    }
    const buffer = 3;

    const targetScrollTop = (lineNumber - 1 - buffer) * lh;
    const maxScrollTop = textarea.scrollHeight - textarea.clientHeight;

    const newScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));
    textarea.scrollTo({
      top: newScrollTop,
      behavior: 'smooth'
    });
    preRef.current.scrollTo({
      top: newScrollTop,
      behavior: 'smooth'
    });
  };

  const ensureLineVisible = (lineNumber) => {
    const currentVisibleStart = visibleStartLine;
    const currentVisibleEnd = visibleEndLine;
    if (lineNumber < currentVisibleStart + 1 || lineNumber > currentVisibleEnd) {
      const newVisibleStartLine = Math.max(lineNumber - Math.ceil((containerHeight / lineHeight) / 2) - buffer, 0);
      setVisibleStartLine(newVisibleStartLine);
      setVisibleEndLine(newVisibleStartLine + Math.ceil(containerHeight / lineHeight) + 2 * buffer);
    }
  };

  const handleReplace = () => {
    if (currentSearchIndex === -1 || searchPositions.length === 0) return;
    const currentMatch = searchPositions[currentSearchIndex];
    const lineNumber = currentMatch.lineNumber;
    const lines = fullCode.split(/\r?\n/);
    const lineIndex = lineNumber - 1;
    const line = lines[lineIndex];
    const regex = isCaseSensitiveSearch
      ? new RegExp(escapeRegExp(searchTerm), 'g')
      : new RegExp(escapeRegExp(searchTerm), 'gi');
    const replacement = replaceTerm !== undefined ? replaceTerm : "";
    const newLine = line.replace(regex, replacement);
    lines[lineIndex] = newLine;
    const newFullCode = lines.join('\n');

    const previousState = { fullCode, collapsedLines: new Set(collapsedLines) };
    undoStackMap[tabId].push(previousState); 
    redoStackMap[tabId] = [];
    setFullCode(newFullCode);
    setViewCode(generateViewCode(newFullCode, collapsedLines).displayedLines.join('\n'));
    setLineNumberMappings(generateViewCode(newFullCode, collapsedLines).lineNumberMappings);
    setActiveLineNumber(null);

    const updatedSearchPositions = searchPositions.filter((_, idx) => idx !== currentSearchIndex);
    setSearchPositions(updatedSearchPositions);

    let newIndex = currentSearchIndex;
    if (currentSearchIndex >= updatedSearchPositions.length) {
      newIndex = updatedSearchPositions.length - 1;
    }
    setCurrentSearchIndex(newIndex >= 0 ? newIndex : -1);

    isSettingContentRef.current = true;
    onEdit(paneIndex, tabId, previousState, { fullCode: newFullCode, collapsedLines: new Set(collapsedLines) });

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    handleSearch(newFullCode);
  };

  const handleReplaceAll = () => {
    if (searchPositions.length === 0) return;

    const regex = isCaseSensitiveSearch
      ? new RegExp(escapeRegExp(searchTerm), 'g')
      : new RegExp(escapeRegExp(searchTerm), 'gi');
    const replacement = replaceTerm !== undefined ? replaceTerm : "";
    const newFullCode = fullCode.replace(regex, replacement);
    const previousState = { fullCode, collapsedLines: new Set(collapsedLines) };
    undoStackMap[tabId].push(previousState); 
    redoStackMap[tabId] = []; 

    setFullCode(newFullCode);
    setViewCode(generateViewCode(newFullCode, collapsedLines).displayedLines.join('\n'));
    setLineNumberMappings(generateViewCode(newFullCode, collapsedLines).lineNumberMappings);
    setSearchPositions([]);
    setCurrentSearchIndex(-1);
    setActiveLineNumber(null);

    isSettingContentRef.current = true;
    onEdit(paneIndex, tabId, previousState, { fullCode: newFullCode, collapsedLines: new Set(collapsedLines) });

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    handleSearch(newFullCode);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullCode);
      setCopySuccess("Code copied to clipboard!");
      setTimeout(() => setCopySuccess(""), 3000);
    } catch (err) {
      setCopySuccess("Failed to copy code.");
      setTimeout(() => setCopySuccess(""), 3000);
    }
  };

  const handleSave = async () => {
    if (!fileHandle) {
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }

    try {
      const writable = await fileHandle.createWritable();
      await writable.write(fullCode);
      await writable.close();

      if (onSave) {
        onSave(paneIndex, tabId, fullCode);
      }

      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  useEffect(() => {
    updateVisibleLines();
    let animationFrameId = null;

    const handleScrollEvent = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(() => {
        updateVisibleLines();
      });
    };

    if (lineNumberRef.current) {
      lineNumberRef.current.addEventListener('scroll', handleScrollEvent);
      textareaRef.current.addEventListener('scroll', handleScrollSync);
    }

    return () => {
      if (lineNumberRef.current) {
        lineNumberRef.current.removeEventListener('scroll', handleScrollEvent);
        textareaRef.current.removeEventListener('scroll', handleScrollSync);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [lineHeight, containerHeight, viewCode, collapsedLines]);

  const localSearchDisabled = !!isGlobalSearchActive;

  return (
    <div className="codeEditorContainer" style={{ fontFamily: 'monospace', height: '100%', width: '100%' }}>
      
      <div className="codeEditorLanguageIndicator">
        <div
          className={
            (!isSearchOpenInternal && !isReplaceOpenInternal) || isGlobalSearchActive
              ? "codeEditorLanguageFlex"
              : "codeEditorLanguageFlexSupplement"
          }
          style={{
            padding:
              (!isSearchOpenInternal && !isReplaceOpenInternal) || isGlobalSearchActive
                ? 0
                : "",
          }}
        >
          {(isSearchOpenInternal || isReplaceOpenInternal) && !isGlobalSearchActive && (
            <label className="codeEditorLanguageText">
              {languageImageMap[currentLanguage] ? (
                <img
                  src={`/language-images/${languageImageMap[currentLanguage]}`}
                  alt={`${currentLanguage} icon`}
                  className="language-icon"
                />
              ) : (
                <FontAwesomeIcon icon={faCode} className="language-icon" />
              )}

              <strong>{currentLanguage}</strong>
            </label>
          )}

          <div
            className="codeEditorSearchButtonFlex"
            style={{
              flexDirection:
                (!isSearchOpenInternal && !isReplaceOpenInternal) || isGlobalSearchActive
                  ? "column"
                  : "",
              marginRight: disableSplit ? "0" : "",
            }}
          >
            {isSearchOpenInternal && !isGlobalSearchActive ? (
              <Tippy content={"Close"} theme="tooltip-light">
                <button
                  type="button"
                  className="codeEditorSearchButton"
                  onClick={() => {
                    setIsSearchOpenInternal(false);
                    setTabSearchOpen(false);
                    setIsReplaceOpenInternal(false);
                    setTabReplaceOpen(false);
                    setSearchTerm("");
                    setReplaceTerm("");
                    setSearchPositions([]);
                    setCurrentSearchIndex(-1);
                    setActiveLineNumber(null);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={isGlobalSearchActive}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </Tippy>
            ) : (
              <Tippy content={"Search"} theme="tooltip-light">
                <button
                  type="button"
                  className="codeEditorSearchButton"
                  onClick={() => {
                    if (!isGlobalSearchActive) {
                      setIsSearchOpenInternal(true);
                      setTabSearchOpen(true);
                      setIsReplaceOpenInternal(false);
                      setTabReplaceOpen(false);
                    }
                  }}
                  style={{
                    opacity: isGlobalSearchActive ? "0.6" : "1.0",
                    cursor: isGlobalSearchActive ? "not-allowed" : "pointer",
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={isGlobalSearchActive}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </Tippy>
            )}

            {isReplaceOpenInternal && !isGlobalSearchActive ? (
              <Tippy content={"Close"} theme="tooltip-light">
                <button
                  type="button"
                  className="codeEditorSearchButton"
                  onClick={() => {
                    setIsReplaceOpenInternal(false);
                    setTabReplaceOpen(false);
                    setIsSearchOpenInternal(false);
                    setTabSearchOpen(false);
                    setSearchTerm("");
                    setReplaceTerm("");
                    setSearchPositions([]);
                    setCurrentSearchIndex(-1);
                    setActiveLineNumber(null);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={isGlobalSearchActive}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </Tippy>
            ) : (
              <Tippy content={"Search & Replace"} theme="tooltip-light">
                <button
                  type="button"
                  className="codeEditorSearchButton"
                  onClick={() => {
                    if (!isGlobalSearchActive) {
                      setIsReplaceOpenInternal(true);
                      setTabReplaceOpen(true);
                      setIsSearchOpenInternal(false);
                      setTabSearchOpen(false);
                    }
                  }}
                  style={{
                    opacity: isGlobalSearchActive ? "0.6" : "1.0",
                    cursor: isGlobalSearchActive ? "not-allowed" : "pointer",
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={isGlobalSearchActive}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                </button>
              </Tippy>
            )}

            <Tippy
              content={
                copySuccess === "Code copied to clipboard!"
                  ? "Copied to Clipboard!"
                  : copySuccess === "Cut to clipboard!"
                  ? "Cut to Clipboard!"
                  : copySuccess === "Failed to copy!"
                  ? "Failed to copy!"
                  : copySuccess === "Failed to paste!"
                  ? "Failed to paste!"
                  : "Copy to Clipboard"
              }
              theme="tooltip-light"
            >
              <button
                type="button"
                className="codeEditorSearchButton"
                onClick={handleCopyToClipboard}
                title="Copy Code to Clipboard"
                onMouseDown={(e) => e.preventDefault()}
                disabled={isGlobalSearchActive}
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </Tippy>

            <Tippy content={"Split Tabs"} theme="tooltip-light">
              <button
                type="button"
                className="codeEditorSearchButton"
                onClick={onSplit}
                disabled={disableSplit || isGlobalSearchActive}
                style={{
                  cursor:
                    disableSplit || isGlobalSearchActive ? "not-allowed" : "pointer",
                  opacity:
                    disableSplit || isGlobalSearchActive ? 0.5 : 1,
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <FontAwesomeIcon icon={faTableColumns} />
              </button>
            </Tippy>
          </div>
        </div>

        {(isSearchOpenInternal || isReplaceOpenInternal) && !isGlobalSearchActive && (
          <div className="codeEditorLanguageFlexSupplement">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleEnterSearch}
              ref={searchInputRef}
              className="codeEditorSearchBox"
              style={{ fontFamily: "monospace" }}
              disabled={isGlobalSearchActive}
            />

            <div className="codeEditorSearchOperationsButtonWrapperMini">
              <Tippy content={"Case Sensitive"} theme="tooltip-light">
                <button
                  type="button"
                  className="codeEditorSearchOperationsButton"
                  onClick={() => setIsCaseSensitiveSearch(!isCaseSensitiveSearch)}
                  title="Toggle Case Sensitivity"
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={isGlobalSearchActive}
                >
                  <FontAwesomeIcon
                    icon={faA}
                    style={{
                      color: isCaseSensitiveSearch ? "#AD6ADD" : "",
                    }}
                  />
                </button>
              </Tippy>

              <Tippy content={"Next"} theme="tooltip-light">
                <button
                  type="button"
                  className="codeEditorSearchOperationsButton"
                  onClick={handleNextSearch}
                  title="Next Search Result"
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={isGlobalSearchActive}
                >
                  <FontAwesomeIcon icon={faArrowDown} />
                </button>
              </Tippy>

              <Tippy content={"Previous"} theme="tooltip-light">
                <button
                  type="button"
                  className="codeEditorSearchOperationsButton"
                  onClick={handlePrevSearch}
                  title="Previous Search Result"
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={isGlobalSearchActive}
                >
                  <FontAwesomeIcon icon={faArrowUp} />
                </button>
              </Tippy>
            </div>
          </div>
        )}

        {isReplaceOpenInternal && !isGlobalSearchActive && (
          <div className="codeEditorLanguageFlexSupplement">
            <input
              type="text"
              placeholder="Replace..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              className="codeEditorSearchBox"
              style={{ fontFamily: "monospace" }}
              disabled={isGlobalSearchActive}
            />

            <div className="codeEditorSearchOperationsButtonWrapperMini">
              <Tippy content={"Replace Selection"} theme="tooltip-light">
                <button
                  type="button"
                  className="codeEditorSearchOperationsButton"
                  onClick={handleReplace}
                  title="Replace Current Match"
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={isGlobalSearchActive}
                >
                  <FontAwesomeIcon icon={faSquare} />
                </button>
              </Tippy>

              <Tippy content={"Replace All Occurrences"} theme="tooltip-light">
                <button
                  type="button"
                  className="codeEditorSearchOperationsButton"
                  onClick={handleReplaceAll}
                  title="Replace All Matches"
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={isGlobalSearchActive}
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </Tippy>
            </div>
          </div>
        )}

        {(isReplaceOpenInternal || isSearchOpenInternal) && !isGlobalSearchActive && (
          <div className="codeEditorLanguageFlex">
            {searchPositions.length > 0 && (
              <span className="codeEditorSearchMatchIndicator">
                {currentSearchIndex + 1} of {searchPositions.length} results found
              </span>
            )}
          </div>
        )}
      </div>


      {isSupported || forceOpen ? (
        <DinoLabsIDEMirror
          viewCode={viewCode}
          setViewCode={setViewCode}
          fullCode={fullCode}
          setFullCode={setFullCode}
          collapsedLines={collapsedLines}
          setCollapsedLines={setCollapsedLines}
          currentLanguage={currentLanguage}
          searchTerm={searchTerm}
          searchPositions={searchPositions}
          setSearchPositions={setSearchPositions}
          currentSearchIndex={currentSearchIndex}
          setCurrentSearchIndex={setCurrentSearchIndex}
          handleSearch={handleSearch}
          handleReplace={handleReplace}
          handleReplaceAll={handleReplaceAll}
          lineHeight={lineHeight}
          containerHeight={containerHeight}
          buffer={buffer}
          visibleStartLine={visibleStartLine}
          visibleEndLine={visibleEndLine}
          updateVisibleLines={updateVisibleLines}
          renderLineNumbers={renderLineNumbers}
          handleScroll={handleScrollSync}
          handleKeyDown={handleKeyDown}
          handleInput={handleInput}
          preRef={preRef}
          textareaRef={textareaRef}
          lineNumberRef={lineNumberRef}
          highlightedCode={syntaxHighlight(viewCode, currentLanguage.toLowerCase(), searchTerm, isCaseSensitiveSearch, activeLineNumber)}
          displayLines={{ displayedLines: viewCode, lineNumberMappings: lineNumberMappings }}
          mapping={lineNumberMappings}
          getMaxDigits={getMaxDigits}
          handleCopyToClipboard={handleCopyToClipboard}
          copySuccess={copySuccess}
          isSupported={isSupported}
          forceOpen={forceOpen}
          onForceOpen={onForceOpen}
          paneIndex={paneIndex}
          tabId={tabId}
          onEdit={onEdit} 
          onSave={onSave} 
          fileHandle={fileHandle}
          editorId={editorId} 
          ref={mirrorRef}
        />
      ) : (
        <div className="dinolabsIDEUnsupportedWrapper">
          <FontAwesomeIcon icon={faExclamationTriangle} className="dinolabsIDEUnsupportedIcon" />
          <label className="dinolabsIDEUnsupportedMessage">
            The content of this file type is unsupported.
          </label>
          <button className="dinolabsIDETryToOpenButton" onClick={onForceOpen}>
            Try to open anyway.
          </button>
        </div>
      )}
    </div>
  );
});

const getBlockLines = (codeStr, lineIndex) => {
  const lines = codeStr.split(/\r?\n/);
  const startIndent = getIndentLevel(lines[lineIndex]);
  const blockLines = [];

  for (let i = lineIndex + 1; i < lines.length; i++) {
    const currentLine = lines[i];
    const trimmedLine = currentLine.trim();

    if (trimmedLine === "") {
      blockLines.push(i);
      continue;
    }

    const currentIndent = getIndentLevel(currentLine);

    if (currentIndent > startIndent) {
      blockLines.push(i);
    } else {
      break; 
    }
  }

  return blockLines;
};

const getIndentLevel = (line) => {
  const match = line.match(/^\s*/);
  return match ? match[0].replace(/\t/g, "    ").length : 0;
};

export default DinoLabsIDEMarkdown;
