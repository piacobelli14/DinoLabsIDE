import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
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
  faCode,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DinoLabsIDEMirror from "./DinoLabsIDEMirror";
import { syntaxHighlight, escapeRegExp } from "./DinoLabsIDEParser";
import useAuth from "../UseAuth";

const languageImageMap = {
  Javascript: "javascript.svg",
  Typescript: "typescript.svg",
  HTML: "html.svg",
  CSS: "css.svg",
  JSON: "json.svg",
  XML: "xml.svg",
  Python: "python.svg",
  PHP: "php.svg",
  Swift: "swift.svg",
  C: "c.svg",
  "C++": "c++.svg",
  "C#": "csharp.svg",
  "Monkey C": "monkeyc.svg",
  Rust: "rust.svg",
  Bash: "bash.svg",
  Shell: "shell.svg",
  SQL: "sql.svg",
  Markdown: "markdown.svg",
  Text: "txtExtension.svg",
};

let editorIdCounter = 0;
const generateEditorId = () => {
  editorIdCounter += 1;
  return `dinolabs-editor-${editorIdCounter}`;
};

const DinoLabsIDEMarkdown = forwardRef(
  (
    {
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
      keyBinds,
      colorTheme,
    },
    ref
  ) => {
    const { token, userID, organizationID } = useAuth();
    const scrollContainerRef = useRef(null);
    const searchInputRef = useRef(null);
    const debounceTimer = useRef(null);
    const isSettingContentRef = useRef(false);
    const mirrorRef = useRef(null);
    const editorId = useRef(generateEditorId()).current;
    const [fullCode, setFullCode] = useState("");
    const [viewCode, setViewCode] = useState("");
    const [highlightedCode, setHighlightedCode] = useState("");
    const [currentLanguage, setCurrentLanguage] = useState(
      detectedLanguage || "Unknown"
    );
    const [copySuccess, setCopySuccess] = useState("");
    const [saveStatus, setSaveStatus] = useState("");
    const [isCaseSensitiveSearch, setIsCaseSensitiveSearch] = useState(true);
    const [lineHeight, setLineHeight] = useState(24);
    const [fontSize, setFontSize] = useState(13);
    const [isSearchOpenInternal, setIsSearchOpenInternal] = useState(isSearchOpen || false);
    const [isReplaceOpenInternal, setIsReplaceOpenInternal] = useState(isReplaceOpen || false);
    const [activeLineNumber, setActiveLineNumber] = useState(null);
    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const [isSearchBoxFocused, setIsSearchBoxFocused] = useState(false);

    useEffect(() => {
      const handleResize = () => setScreenSize(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    function getVirtualizedItemHeight(size) {
      if (size < 499) {
        return { lineHeight: 18, fontSize: 12 };
      } else if (size >= 500 && size <= 699) {
        return { lineHeight: 20, fontSize: 12 };
      } else if (size >= 700 && size <= 1299) {
        return { lineHeight: 24, fontSize: 13 };
      } else if (size >= 1300 && size <= 1699) {
        return { lineHeight: 28, fontSize: 15 };
      } else if (size >= 1700 && size <= 2199) {
        return { lineHeight: 35, fontSize: 18 };
      } else if (size >= 2200 && size <= 2599) {
        return { lineHeight: 45, fontSize: 22 };
      } else if (size >= 2600 && size <= 3899) {
        return { lineHeight: 70, fontSize: 30 };
      } else if (size >= 3900 && size <= 5299) {
        return { lineHeight: 80, fontSize: 35 };
      } else {
        return { lineHeight: 18, fontSize: 12 };
      }
    }

    useEffect(() => {
      const { lineHeight, fontSize } = getVirtualizedItemHeight(screenSize);
      setLineHeight(lineHeight);
      setFontSize(fontSize);
    }, [screenSize]);

    useEffect(() => {
      const themeLinkId = "mirror-theme-css";
      let link = document.getElementById(themeLinkId);
      if (!link) {
        link = document.createElement("link");
        link.id = themeLinkId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      let themeFile;
      if (colorTheme === "DarkTheme") {
        themeFile = "DarkTheme.css";
      } else if (colorTheme === "LightTheme") {
        themeFile = "LightTheme.css";
      } else {
        themeFile = "DefaultTheme.css";
      }
      link.href = `../styles/mainStyles/MirrorThemes/${themeFile}`;
    }, [colorTheme]);

    useImperativeHandle(ref, () => ({
      setContent: (newContent) => {
        setFullCode(newContent);
        setViewCode(newContent);
        setSearchPositions([]);
        setCurrentSearchIndex(-1);
        setActiveLineNumber(null);
        onEdit(paneIndex, tabId, { fullCode }, { fullCode: newContent });
      },
      jumpToLine: (lineNumber) => {
        setActiveLineNumber(lineNumber);
        mirrorRef.current?.ensureVisible?.(lineNumber);
        mirrorRef.current?.jumpToLine?.(lineNumber);
      },
      selectAll: () => {
        mirrorRef.current?.selectAll?.();
      },
      pasteAtCursor: (text) => {
        mirrorRef.current?.pasteAtCursor?.(text);
      },
    }));

    useEffect(() => {
      setFullCode(fileContent || "");
      setViewCode(fileContent || "");
      setSearchPositions([]);
      setCurrentSearchIndex(-1);
      setActiveLineNumber(null);

      if (mirrorRef.current?.setContent) {
        mirrorRef.current.setContent(fileContent || "");
      }
    }, [fileContent, forceOpen]);

    useEffect(() => {
      if (currentLanguage === "Unknown") {
        const escaped = viewCode
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        setHighlightedCode(escaped);
      } else {
        const highlighted = syntaxHighlight(
          viewCode,
          currentLanguage.toLowerCase(),
          searchTerm,
          isCaseSensitiveSearch,
          activeLineNumber
        );
        setHighlightedCode(highlighted);
      }
    }, [
      viewCode,
      currentLanguage,
      searchTerm,
      isCaseSensitiveSearch,
      activeLineNumber,
    ]);

    useEffect(() => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        performSearch();
      }, 300);

      return () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
      };
    }, [fullCode, searchTerm, isCaseSensitiveSearch]);

    useEffect(() => {
      if (
        isSearchBoxFocused &&
        currentSearchIndex >= 0 &&
        currentSearchIndex < searchPositions.length
      ) {
        const match = searchPositions[currentSearchIndex];
        highlightSearchResult(match);
      }
    }, [currentSearchIndex, searchPositions, isSearchBoxFocused]);

    useEffect(() => {
      setIsSearchOpenInternal(isSearchOpen);
    }, [isSearchOpen]);

    useEffect(() => {
      setIsReplaceOpenInternal(isReplaceOpen);
    }, [isReplaceOpen]);

    const highlightSearchResult = (pos) => {
      setActiveLineNumber(pos.lineNumber);
      mirrorRef.current?.jumpToLine(pos.lineNumber);
    };

    const clickEnterSearch = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        performNextSearch();
      }
    };

    const performSearch = () => {
      if (!searchTerm) {
        setSearchPositions([]);
        setCurrentSearchIndex(-1);
        return;
      }
      let flags = isCaseSensitiveSearch ? "" : "i";
      const safeTerm = escapeRegExp(searchTerm);

      try {
        const re = new RegExp(safeTerm, flags);
        const lines = fullCode.split("\n");
        const matches = [];
        for (let i = 0; i < lines.length; i++) {
          if (re.test(lines[i])) {
            matches.push({ lineNumber: i + 1 });
          }
        }
        setSearchPositions(matches);
        setCurrentSearchIndex(matches.length > 0 ? 0 : -1);
      } catch (err) {
        setSearchPositions([]);
        setCurrentSearchIndex(-1);
      }
    };

    const performNextSearch = () => {
      if (searchPositions.length === 0) return;
      let newIndex = currentSearchIndex + 1;
      if (newIndex >= searchPositions.length) {
        newIndex = 0;
      }
      setCurrentSearchIndex(newIndex);
    };

    const performPreviousSearch = () => {
      if (searchPositions.length === 0) return;
      let newIndex = currentSearchIndex - 1;
      if (newIndex < 0) {
        newIndex = searchPositions.length - 1;
      }
      setCurrentSearchIndex(newIndex);
    };

    const performReplace = () => {
      if (currentSearchIndex === -1 || searchPositions.length === 0) return;
      const currentMatch = searchPositions[currentSearchIndex];
      const lineNumber = currentMatch.lineNumber;
      const lines = fullCode.split("\n");
      const lineIndex = lineNumber - 1;

      const regexFlags = isCaseSensitiveSearch ? "" : "i";
      const regex = new RegExp(escapeRegExp(searchTerm), regexFlags);

      lines[lineIndex] = lines[lineIndex].replace(regex, replaceTerm ?? "");
      const updatedCode = lines.join("\n");

      setFullCode(updatedCode);
      setViewCode(updatedCode);
      setActiveLineNumber(null);

      const newPositions = [...searchPositions];
      newPositions.splice(currentSearchIndex, 1);

      let newIdx = currentSearchIndex;
      if (newIdx >= newPositions.length) {
        newIdx = newPositions.length - 1;
      }

      setSearchPositions(newPositions);
      setCurrentSearchIndex(newIdx);
    };

    const performReplaceAll = () => {
      if (searchPositions.length === 0) return;
      const flags = isCaseSensitiveSearch ? "g" : "gi";
      const regex = new RegExp(escapeRegExp(searchTerm), flags);
      const updatedCode = fullCode.replace(regex, replaceTerm ?? "");

      setFullCode(updatedCode);
      setViewCode(updatedCode);
      setSearchPositions([]);
      setCurrentSearchIndex(-1);
      setActiveLineNumber(null);
    };

    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modifier = isMac ? event.metaKey : event.ctrlKey;
      if (modifier && keyBinds) {
        const key = event.key.toLowerCase();
        if (key === keyBinds.save?.toLowerCase()) {
          event.preventDefault();
          saveFile();
        } else if (key === keyBinds.search?.toLowerCase()) {
          event.preventDefault();
          openSearch();
        }
      }
    };

    const handleInput = (event) => {
      if (!isSettingContentRef.current) {
        const updatedViewCode = event.target.value;
        setFullCode(updatedViewCode);
        setViewCode(updatedViewCode);
        onEdit(paneIndex, tabId, { fullCode }, { fullCode: updatedViewCode });
      }
    };

    const openSearch = () => {
      setIsSearchOpenInternal(true);
      setTabSearchOpen(true);
      setIsReplaceOpenInternal(false);
      setTabReplaceOpen(false);

      if (searchInputRef.current) {
        setTimeout(() => searchInputRef.current.focus(), 0);
      }
    };

    const copyToClipboard = async () => {
      try {
        const selText = window.getSelection().toString();
        if (selText) {
          await navigator.clipboard.writeText(selText);
          setCopySuccess("Copied selection to Clipboard!");
        } else {
          await navigator.clipboard.writeText(fullCode);
          setCopySuccess("Copied to Clipboard!");
        }
      } catch {
        setCopySuccess("Failed to copy!");
      } finally {
        setTimeout(() => setCopySuccess(""), 2000);
      }
    };

    const saveFile = async () => {
      if (!fileHandle) {
        setSaveStatus("No file handle available.");
        setTimeout(() => setSaveStatus(""), 3000);
        return;
      }
      try {
        setSaveStatus("Saving...");
        const writable = await fileHandle.createWritable();
        await writable.write(fullCode);
        await writable.close();

        await fetch(
          "https://www.dinolaboratories.com/dinolabs/dinolabs-web-api/save-file-edit",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              organizationID,
              userID,
              language: currentLanguage,
              script_name: fileHandle.name || "unknown_script_name",
              timestamp: new Date().toISOString(),
            }),
          }
        );

        if (onSave) {
          onSave(paneIndex, tabId, fullCode);
        }
        setSaveStatus("Save successful!");
        setTimeout(() => setSaveStatus(""), 3000);
      } catch {
        setSaveStatus("Save failed!");
        setTimeout(() => setSaveStatus(""), 3000);
      }
    };

    const isSupported = currentLanguage !== "Unknown" || forceOpen;

    useEffect(() => {
      function handleGlobalKeyDown(e) {
        if (isSearchBoxFocused && !isGlobalSearchActive && (e.ctrlKey || e.metaKey) && keyBinds) {
          const keyLower = e.key.toLowerCase();
          if (keyLower === keyBinds.undo?.toLowerCase()) {
            e.preventDefault();
            mirrorRef.current?.doUndo();
          } else if (keyLower === keyBinds.redo?.toLowerCase()) {
            e.preventDefault();
            mirrorRef.current?.doRedo();
          } else if (keyLower === keyBinds.paste?.toLowerCase()) {
            e.preventDefault();
            mirrorRef.current?.doPasteAtCursor();
          } else if (keyLower === keyBinds.cut?.toLowerCase()) {
            e.preventDefault();
            mirrorRef.current?.doCutSelection();
          } else if (keyLower === keyBinds.copy?.toLowerCase()) {
            e.preventDefault();
            mirrorRef.current?.doCopySelection();
          } else if (keyLower === keyBinds.selectAll?.toLowerCase()) {
            e.preventDefault();
            mirrorRef.current?.doSelectAll();
          }
        }
      }
      window.addEventListener("keydown", handleGlobalKeyDown, true);
      return () => {
        window.removeEventListener("keydown", handleGlobalKeyDown, true);
      };
    }, [
      isSearchBoxFocused,
      isGlobalSearchActive,
      keyBinds,
    ]);

    return (
      <div
        className="codeEditorContainer"
        style={{
          fontFamily: "monospace",
          height: "100%",
          width: "100%",
          paddingLeft: 0,
          boxSizing: "border-box",
        }}
      >
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
                <Tippy content="Close" theme="tooltip-light">
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
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </Tippy>
              ) : (
                <Tippy content="Search" theme="tooltip-light">
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
                      opacity: isGlobalSearchActive ? 0.6 : 1.0,
                      cursor: isGlobalSearchActive ? "not-allowed" : "pointer",
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </Tippy>
              )}

              {isReplaceOpenInternal && !isGlobalSearchActive ? (
                <Tippy content="Close" theme="tooltip-light">
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
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </Tippy>
              ) : (
                <Tippy content="Search & Replace" theme="tooltip-light">
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
                      opacity: isGlobalSearchActive ? 0.6 : 1.0,
                      cursor: isGlobalSearchActive ? "not-allowed" : "pointer",
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                  </button>
                </Tippy>
              )}

              <Tippy content={copySuccess || "Copy to Clipboard"} theme="tooltip-light">
                <button
                  type="button"
                  className="codeEditorSearchButton"
                  onClick={copyToClipboard}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{
                    opacity: isGlobalSearchActive ? 0.6 : 1.0,
                    cursor: isGlobalSearchActive ? "not-allowed" : "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </Tippy>

              <Tippy content="Split Tabs" theme="tooltip-light">
                <button
                  type="button"
                  className="codeEditorSearchButton"
                  onClick={onSplit}
                  disabled={disableSplit || isGlobalSearchActive}
                  style={{
                    cursor: disableSplit || isGlobalSearchActive ? "not-allowed" : "pointer",
                    opacity: disableSplit || isGlobalSearchActive ? 0.5 : 1,
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
                onKeyDown={clickEnterSearch}
                ref={searchInputRef}
                className="codeEditorSearchBox"
                style={{ fontFamily: "monospace" }}
                onFocus={() => setIsSearchBoxFocused(true)}
                onBlur={() => setIsSearchBoxFocused(false)}
              />

              <div className="codeEditorSearchOperationsButtonWrapperMini">
                <Tippy content="Case Sensitive" theme="tooltip-light">
                  <button
                    type="button"
                    className="codeEditorSearchOperationsButton"
                    onClick={() => setIsCaseSensitiveSearch(!isCaseSensitiveSearch)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <FontAwesomeIcon
                      icon={faA}
                      style={{ color: isCaseSensitiveSearch ? "#AD6ADD" : "" }}
                    />
                  </button>
                </Tippy>

                <Tippy content="Next" theme="tooltip-light">
                  <button
                    type="button"
                    className="codeEditorSearchOperationsButton"
                    onClick={performNextSearch}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <FontAwesomeIcon icon={faArrowDown} />
                  </button>
                </Tippy>

                <Tippy content="Previous" theme="tooltip-light">
                  <button
                    type="button"
                    className="codeEditorSearchOperationsButton"
                    onClick={performPreviousSearch}
                    onMouseDown={(e) => e.preventDefault()}
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
                onFocus={() => setIsSearchBoxFocused(true)}
                onBlur={() => setIsSearchBoxFocused(false)}
              />

              <div className="codeEditorSearchOperationsButtonWrapperMini">
                <Tippy content="Replace Selection" theme="tooltip-light">
                  <button
                    type="button"
                    className="codeEditorSearchOperationsButton"
                    onClick={performReplace}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <FontAwesomeIcon icon={faSquare} />
                  </button>
                </Tippy>

                <Tippy content="Replace All Occurrences" theme="tooltip-light">
                  <button
                    type="button"
                    className="codeEditorSearchOperationsButton"
                    onClick={performReplaceAll}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <FontAwesomeIcon icon={faList} />
                  </button>
                </Tippy>
              </div>
            </div>
          )}

          {(isReplaceOpenInternal || isSearchOpenInternal) && !isGlobalSearchActive && (
            <div className="codeEditorLanguageFlex">
              {searchPositions.length > 0 && currentSearchIndex >= 0 && (
                <span className="codeEditorSearchMatchIndicator">
                  {currentSearchIndex + 1} of {searchPositions.length} results found
                </span>
              )}
              {searchPositions.length === 0 && <span className="codeEditorSearchMatchIndicator">No matches found</span>}
            </div>
          )}
        </div>

        {isSupported ? (
          <div
            ref={scrollContainerRef}
            style={{
              width: "100%",
              height: "auto",
              overflow: "auto",
              position: "relative",
              paddingLeft: 0,
              boxSizing: "border-box",
              color: "white",
            }}
          >
            <DinoLabsIDEMirror
              ref={mirrorRef}
              viewCode={viewCode}
              setViewCode={setViewCode}
              handleInput={handleInput}
              handleKeyDown={handleKeyDown} 
              highlightedCode={highlightedCode}
              fontSize={fontSize}
              lineHeight={lineHeight}
              activeLineNumber={activeLineNumber}
              editorId={editorId}
              disableFocus={isSearchBoxFocused}
              keyBinds={keyBinds}
            />
          </div>
        ) : (
          <div className="dinolabsIDEUnsupportedWrapper">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="dinolabsIDEUnsupportedIcon"
            />
            <label className="dinolabsIDEUnsupportedMessage">
              The content of this file type is unsupported.
            </label>
            <button className="dinolabsIDETryToOpenButton" onClick={onForceOpen}>
              Try to open anyway.
            </button>
          </div>
        )}

        {saveStatus && (
          <div className="dinolabsIDEaveStatusIndicator">{saveStatus}</div>
        )}
      </div>
    );
  }
);

export default DinoLabsIDEMarkdown;
