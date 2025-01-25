import React, { useEffect, useRef, useState } from "react";
import "../../styles/mainStyles/TextEditorStyles/DinoLabsIDERichTextEditor.css";
import DinoLabsIDEColorPicker from "../DinoLabsIDEColorPicker.jsx";
import { showDialog } from "../DinoLabsIDEAlert.jsx";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignCenter,
  faAlignJustify,
  faAlignLeft,
  faAlignRight,
  faArrowUpWideShort,
  faBarsStaggered,
  faBold,
  faCaretRight,
  faDownload,
  faDroplet,
  faEllipsisV,
  faEraser,
  faFont,
  faHighlighter,
  faIndent,
  faItalic,
  faListNumeric,
  faListUl,
  faMinus,
  faOutdent,
  faPenToSquare,
  faPlus,
  faStrikethrough,
  faUnderline,
  faUndo,
  faRedo,
  faCut,
  faCopy,
  faPaste,
  faArrowPointer,
  faTable,
  faBorderStyle
} from "@fortawesome/free-solid-svg-icons";

export default function DinoLabsIDERichTextEditor({ fileHandle, onSave }) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [initialHTML, setInitialHTML] = useState("<p>Loading...</p>");
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(null);
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const [fontStyle, setFontStyle] = useState("P");
  const [fontType, setFontType] = useState("Arial");
  const [fileName, setFileName] = useState(fileHandle.name);

  const alignButtonRef = useRef(null);
  const lineSpacingButtonRef = useRef(null);
  const listButtonRef = useRef(null);
  const moreButtonRef = useRef(null);
  const alignModalRef = useRef(null);
  const lineSpacingModalRef = useRef(null);
  const listModalRef = useRef(null);
  const moreModalRef = useRef(null);
  const fileButtonRef = useRef(null);
  const fileModalRef = useRef(null);
  const editButtonRef = useRef(null);
  const editModalRef = useRef(null);
  const insertButtonRef = useRef(null);
  const insertModalRef = useRef(null);
  const formatButtonRef = useRef(null);
  const formatModalRef = useRef(null);
  const toolsButtonRef = useRef(null);
  const toolsModalRef = useRef(null);

  const [textColor, setTextColor] = useState("#000000");
  const [isTextColorOpen, setIsTextColorOpen] = useState(false);
  const [textHighlightColor, setTextHighlightColor] = useState("#ffffff");
  const [isTextHighlightColorOpen, setIsTextHighlightColorOpen] = useState(false);

  const [openTablePicker, setOpenTablePicker] = useState(false);
  const tableButtonRef = useRef(null);
  const [tableRows, setTableRows] = useState(1);
  const [tableCols, setTableCols] = useState(1);

  const [tableFontColor, setTableFontColor] = useState("#000000");
  const [isTableFontColorOpen, setIsTableFontColorOpen] = useState(false);
  const [tableBackgroundColor, setTableBackgroundColor] = useState("#ffffff");
  const [isTableBackgroundColorOpen, setIsTableBackgroundColorOpen] = useState(false);
  const [tableBorderColor, setTableBorderColor] = useState("#cccccc");
  const [isTableBorderColorOpen, setIsTableBorderColorOpen] = useState(false);
  const [tableBorderWidth, setTableBorderWidth] = useState("1px");

  const styleMap = {
    H1: { fontSize: "32px", fontWeight: "bold" },
    H2: { fontSize: "24px", fontWeight: "bold" },
    H3: { fontSize: "20px", fontWeight: "bold" },
    P: { fontSize: "16px", fontWeight: "normal" }
  };

  useEffect(() => {
    if (!fileHandle) return;
    (async () => {
      try {
        const file = await fileHandle.getFile();
        const arrBuf = await file.arrayBuffer();
        const bytes = new Uint8Array(arrBuf);
        const text = new TextDecoder().decode(bytes);
        const ext = (fileHandle.name || "").split(".").pop().toLowerCase();
        if (ext === "txt" || ext === "md") {
          const paragraphs = text
            .split(/\r?\n\s*\r?\n/g)
            .map(block => block.replace(/\r?\n/g, " "));
          const processedHtml = paragraphs
            .map(para => {
              const trimmed = para.trim();
              if (!trimmed) {
                return `<p><br/></p>`;
              } else {
                return `<p>${escapeHtml(trimmed)}</p>`;
              }
            })
            .join("\n");
          setInitialHTML(processedHtml);
        } else {
          setInitialHTML(
            `
            <p style="color:gray;">Unsupported extension ".${ext}". We only handle .txt/.md here.<br/>
            Displaying raw text below:</p>
            <hr/>
            <pre>${escapeHtml(text)}</pre>
            `
          );
        }
      } catch (err) {
        setError("Error loading file: " + (err.message || String(err)));
      }
    })();
  }, [fileHandle]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      if (
        editorRef.current &&
        editorRef.current.contains(range.commonAncestorContainer)
      ) {
        savedRangeRef.current = range.cloneRange();
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = event => {
      if (openModal) {
        let modalRef = null;
        let buttonRef = null;
        if (openModal === "align") {
          modalRef = alignModalRef.current;
          buttonRef = alignButtonRef.current;
        } else if (openModal === "lineSpacing") {
          modalRef = lineSpacingModalRef.current;
          buttonRef = lineSpacingButtonRef.current;
        } else if (openModal === "lists") {
          modalRef = listModalRef.current;
          buttonRef = listButtonRef.current;
        } else if (openModal === "more") {
          modalRef = moreModalRef.current;
          buttonRef = moreButtonRef.current;
        } else if (openModal === "file") {
          modalRef = fileModalRef.current;
          buttonRef = fileButtonRef.current;
        } else if (openModal === "edit") {
          modalRef = editModalRef.current;
          buttonRef = editButtonRef.current;
        } else if (openModal === "insert") {
          modalRef = insertModalRef.current;
          buttonRef = insertButtonRef.current;
        } else if (openModal === "format") {
          modalRef = formatModalRef.current;
          buttonRef = formatButtonRef.current;
        } else if (openModal === "tools") {
          modalRef = toolsModalRef.current;
          buttonRef = toolsButtonRef.current;
        }
        if (
          modalRef &&
          !modalRef.contains(event.target) &&
          buttonRef &&
          !buttonRef.contains(event.target)
        ) {
          closeAllMenus();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openModal]);

  function closeAllMenus() {
    setOpenModal(null);
    setOpenTablePicker(false);
    setIsTextColorOpen(false);
    setIsTextHighlightColorOpen(false);
    setIsTableFontColorOpen(false);
    setIsTableBackgroundColorOpen(false);
    setIsTableBorderColorOpen(false);
  }

  function storeSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    const selection = window.getSelection();
    if (savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
  }

  function execCommand(command, value = null) {
    restoreSelection();
    document.execCommand(command, false, value);
  }

  function getParagraphsInSelection() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return [];
    const range = selection.getRangeAt(0);
    const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, {
      acceptNode: node => (range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
    });
    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }
    const paragraphSet = new Set();
    textNodes.forEach(node => {
      let parent = node.parentNode;
      while (parent && parent !== editorRef.current && parent.nodeName !== "P") {
        parent = parent.parentNode;
      }
      if (parent && parent.nodeName === "P") {
        paragraphSet.add(parent);
      }
    });
    return Array.from(paragraphSet);
  }

  function getSelectedTableCells() {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection.rangeCount) return [];
    const range = selection.getRangeAt(0);
    const allCells = [...editorRef.current.querySelectorAll("td, th")];
    const selectedCells = allCells.filter(cell => range.intersectsNode(cell));
    return selectedCells;
  }

  function setParagraphStyle(styleObj) {
    const paragraphs = getParagraphsInSelection();
    paragraphs.forEach(p => {
      Object.entries(styleObj).forEach(([prop, val]) => {
        p.style[prop] = val;
      });
    });
  }

  function applyLineSpacing(spacing) {
    const paragraphs = getParagraphsInSelection();
    paragraphs.forEach(p => {
      p.style.lineHeight = spacing;
    });
  }

  function handleFontStyleChange(e) {
    const desiredStyle = e.target.value;
    setFontStyle(desiredStyle);
    restoreSelection();
    setParagraphStyle(styleMap[desiredStyle]);
  }

  function applyFontFamily(font) {
    restoreSelection();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("fontName", false, font);
  }

  function handleFontTypeChange(e) {
    const type = e.target.value;
    setFontType(type);
    applyFontFamily(type);
  }

  function handleLineSpacing(spacing) {
    restoreSelection();
    document.execCommand("formatBlock", false, "p");
    applyLineSpacing(spacing);
    closeAllMenus();
  }

  function applyFontSize(size) {
    execCommand("fontSize", 7);
    const fontElements = editorRef.current.getElementsByTagName("font");
    for (let i = 0; i < fontElements.length; i++) {
      if (fontElements[i].size === "7") {
        fontElements[i].removeAttribute("size");
        fontElements[i].style.fontSize = `${size}px`;
      }
    }
  }

  function decreaseFontSize(e) {
    e.preventDefault();
    setCurrentFontSize(prevSize => {
      const newSize = Math.max(8, prevSize - 2);
      applyFontSize(newSize);
      return newSize;
    });
  }

  function increaseFontSize(e) {
    e.preventDefault();
    setCurrentFontSize(prevSize => {
      const newSize = Math.min(72, prevSize + 2);
      applyFontSize(newSize);
      return newSize;
    });
  }

  function toggleModal(modalName) {
    setOpenModal(prev => {
      const newModal = prev === modalName ? null : modalName;
      if (newModal === null) {
        closeAllMenus();
      } else {
        setOpenTablePicker(false);
        setIsTextColorOpen(false);
        setIsTextHighlightColorOpen(false);
        setIsTableFontColorOpen(false);
        setIsTableBackgroundColorOpen(false);
        setIsTableBorderColorOpen(false);
      }
      return newModal;
    });
  }

  function handleAlign(alignment) {
    execCommand(alignment);
    closeAllMenus();
  }

  function handleTextColorChange(color) {
    setTextColor(color);
    execCommand("foreColor", color);
    onSave(editorRef.current.innerHTML);
  }

  function handleTextHighlightColorChange(color) {
    setTextHighlightColor(color);
    execCommand("hiliteColor", color);
    onSave(editorRef.current.innerHTML);
  }

  async function handleDownload() {
    const result = await showDialog({
      title: "Download as...",
      message: "Select a file type to download this file as.",
      inputs: [
        {
          name: "fileType",
          type: "select",
          options: [
            { label: "Plain Text (.txt)", value: "txt" },
            { label: "Markdown (.md)", value: "md" }
          ]
        }
      ],
      showCancel: true
    });
    if (result) {
      const content = editorRef.current.innerText;
      const fileExtension = result.fileType === "md" ? "md" : "txt";
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName.replace(/\.[^/.]+$/, "") + "." + fileExtension;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleSelectAll() {
    if (!editorRef.current) return;
    const range = document.createRange();
    range.selectNodeContents(editorRef.current);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  async function handlePaste() {
    restoreSelection();
    try {
      const text = await navigator.clipboard.readText();
      document.execCommand("insertText", false, text);
    } catch (err) {}
  }

  function makeColumnsResizable(tableEl) {
    const firstRow = tableEl.querySelector("tr");
    if (!firstRow) return;
    const cells = firstRow.querySelectorAll("td, th");
    cells.forEach(cell => {
      const resizer = document.createElement("div");
      resizer.style.width = "10px";
      resizer.style.cursor = "col-resize";
      resizer.style.position = "absolute";
      resizer.style.top = "0";
      resizer.style.right = "0";
      resizer.style.bottom = "0";
      resizer.style.zIndex = 2;
      cell.style.position = "relative";
      let startX;
      let startWidth;
      const onMouseDown = e => {
        e.preventDefault();
        startX = e.pageX;
        startWidth = parseInt(document.defaultView.getComputedStyle(cell).width, 10);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };
      const onMouseMove = e => {
        const width = startWidth + (e.pageX - startX);
        cell.style.width = width + "px";
      };
      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      resizer.addEventListener("mousedown", onMouseDown);
      cell.appendChild(resizer);
    });
  }

  function insertTable(rows, cols) {
    const tableEl = document.createElement("table");
    tableEl.style.borderCollapse = "collapse";
    tableEl.style.tableLayout = "fixed";
    tableEl.style.width = "auto";
    tableEl.style.margin = "0 0";
    tableEl.style.border = `${tableBorderWidth} solid ${tableBorderColor}`;
    tableEl.style.fontSize = "inherit";
    tableEl.style.lineHeight = "inherit";
    tableEl.dataset.fontColor = tableFontColor;
    tableEl.dataset.backgroundColor = tableBackgroundColor;
    tableEl.dataset.borderColor = tableBorderColor;
    tableEl.dataset.borderWidth = tableBorderWidth;
    for (let r = 0; r < rows; r++) {
      const rowEl = document.createElement("tr");
      for (let c = 0; c < cols; c++) {
        const cellEl = document.createElement("td");
        cellEl.contentEditable = "true";
        cellEl.style.border = `${tableBorderWidth} solid ${tableBorderColor}`;
        cellEl.style.padding = "10px";
        cellEl.style.width = "90px";
        cellEl.style.height = "28px";
        cellEl.style.verticalAlign = "top";
        cellEl.style.color = tableFontColor;
        cellEl.style.backgroundColor = tableBackgroundColor;
        cellEl.innerHTML = "&nbsp;";
        rowEl.appendChild(cellEl);
      }
      tableEl.appendChild(rowEl);
    }
    setTimeout(() => makeColumnsResizable(tableEl), 50);
    if (savedRangeRef.current) {
      restoreSelection();
      const tempDiv = document.createElement("div");
      tempDiv.appendChild(tableEl);
      document.execCommand("insertHTML", false, tempDiv.innerHTML);
    } else {
      editorRef.current.appendChild(tableEl);
      editorRef.current.focus();
    }
    setOpenTablePicker(false);
    onSave(editorRef.current.innerHTML);
  }

  function applyExistingTableStyle({ borderColor, borderWidth, backgroundColor, fontColor }) {
    const cells = getSelectedTableCells();
    if (!cells.length) return;
    const visitedTables = new Set();
    cells.forEach(cell => {
      const table = cell.closest("table");
      if (table) visitedTables.add(table);
    });
    visitedTables.forEach(table => {
      if (borderColor !== undefined) {
        table.style.borderColor = borderColor;
        table.dataset.borderColor = borderColor;
      }
      if (borderWidth !== undefined) {
        table.style.borderWidth = borderWidth;
        table.dataset.borderWidth = borderWidth;
      }
      if (fontColor !== undefined) {
        table.dataset.fontColor = fontColor;
      }
      if (backgroundColor !== undefined) {
        table.dataset.backgroundColor = backgroundColor;
      }
      const allCells = table.querySelectorAll("td,th");
      allCells.forEach(c => {
        if (borderColor !== undefined) {
          c.style.borderColor = borderColor;
        }
        if (borderWidth !== undefined) {
          c.style.borderWidth = borderWidth;
        }
      });
    });
    cells.forEach(cell => {
      if (fontColor !== undefined) cell.style.color = fontColor;
      if (backgroundColor !== undefined) cell.style.backgroundColor = backgroundColor;
    });
    onSave(editorRef.current.innerHTML);
  }

  function handleRemoveFormatting() {
    restoreSelection();
    document.execCommand("removeFormat");
    const cells = getSelectedTableCells();
    if (!cells.length) return onSave(editorRef.current.innerHTML);
    const visitedTables = new Set();
    cells.forEach(cell => {
      const tbl = cell.closest("table");
      if (tbl) visitedTables.add(tbl);
    });
    visitedTables.forEach(table => {
      const bc = table.dataset.borderColor || "#cccccc";
      const bw = table.dataset.borderWidth || "1px";
      const fc = table.dataset.fontColor || "#000000";
      const bgc = table.dataset.backgroundColor || "#ffffff";
      table.style.border = `${bw} solid ${bc}`;
      const allCells = table.querySelectorAll("td,th");
      allCells.forEach(c => {
        if (!c.style.border) c.style.border = `${bw} solid ${bc}`;
        c.style.borderColor = bc;
        c.style.borderWidth = bw;
      });
      cells.forEach(c => {
        if (c.closest("table") === table) {
          c.style.color = fc;
          c.style.backgroundColor = bgc;
        }
      });
    });
    onSave(editorRef.current.innerHTML);
  }

  function handleKeyDown(e) {
    if (e.key === "Tab") {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      let cell = selection.anchorNode;
      while (cell && cell.nodeName !== "TD" && cell.nodeName !== "TH") {
        cell = cell.parentNode;
      }
      if (cell && (cell.nodeName === "TD" || cell.nodeName === "TH")) {
        e.preventDefault();
        let targetCell;
        if (!e.shiftKey) {
          targetCell = cell.nextElementSibling;
          if (!targetCell) {
            const nextRow = cell.parentNode.nextElementSibling;
            if (nextRow) {
              targetCell = nextRow.cells[0];
            }
          }
        } else {
          targetCell = cell.previousElementSibling;
          if (!targetCell) {
            const prevRow = cell.parentNode.previousElementSibling;
            if (prevRow) {
              targetCell = prevRow.cells[prevRow.cells.length - 1];
            }
          }
        }
        if (targetCell) {
          const range = document.createRange();
          range.selectNodeContents(targetCell);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else {
        e.preventDefault();
        execCommand("insertText", "\t");
      }
    }
  }

  if (error) {
    return null;
  }

  return (
    <div className="dinolabsIDETextWrapper">
      <div className="dinolabsIDETextToolBar">
        <div className="dinolabsIDETextTitleWrapper">
          <FontAwesomeIcon icon={faPenToSquare} className="dinolabsIDETextFileIcon" />
          <div className="dinolabsIDEFileNameStack">
            <label className="dinolasIDETextFileNameInput">
              {fileName}
            </label>
            <div className="dinolabsIDETextOperationsButtonsWrapper">
              <Tippy
                visible={openModal === "file"}
                onClickOutside={() => closeAllMenus()}
                placement="bottom"
                interactive={true}
                className="context-menu-tippy-vertical"
                content={
                  openModal === "file" && (
                    <div
                      className="dinolabsIDETextEditingContextMenuVertical"
                      ref={fileModalRef}
                    >
                      <button
                        className="dinolabsIDETextEditingContextMenuButtonWrapper"
                        onClick={handleDownload}
                      >
                        <span>
                          <FontAwesomeIcon icon={faDownload} />
                          Download
                        </span>
                        <FontAwesomeIcon icon={faCaretRight} />
                      </button>
                      <button
                        className="dinolabsIDETextEditingContextMenuButtonWrapper"
                        onClick={handlePrint}
                      >
                        <span>
                          <FontAwesomeIcon icon={faDownload} />
                          Print
                        </span>
                        <FontAwesomeIcon icon={faCaretRight} />
                      </button>
                    </div>
                  )
                }
              >
                <button
                  className="dinolabsIDETextOperationsButton"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => toggleModal("file")}
                  ref={fileButtonRef}
                >
                  File
                </button>
              </Tippy>
              <Tippy
                visible={openModal === "edit"}
                onClickOutside={() => closeAllMenus()}
                placement="bottom"
                interactive={true}
                className="context-menu-tippy-vertical"
                content={
                  openModal === "edit" && (
                    <div
                      className="dinolabsIDETextEditingContextMenuVertical"
                      ref={editModalRef}
                    >
                      <button
                        className="dinolabsIDETextEditingContextMenuButtonWrapper"
                        onClick={() => execCommand("undo")}
                      >
                        <span>
                          <FontAwesomeIcon icon={faUndo} />
                          Undo
                        </span>
                        <FontAwesomeIcon icon={faCaretRight} />
                      </button>
                      <button
                        className="dinolabsIDETextEditingContextMenuButtonWrapper"
                        onClick={() => execCommand("redo")}
                      >
                        <span>
                          <FontAwesomeIcon icon={faRedo} />
                          Redo
                        </span>
                        <FontAwesomeIcon icon={faCaretRight} />
                      </button>
                      <button
                        className="dinolabsIDETextEditingContextMenuButtonWrapper"
                        onClick={() => execCommand("cut")}
                      >
                        <span>
                          <FontAwesomeIcon icon={faCut} />
                          Cut
                        </span>
                        <FontAwesomeIcon icon={faCaretRight} />
                      </button>
                      <button
                        className="dinolabsIDETextEditingContextMenuButtonWrapper"
                        onClick={() => execCommand("copy")}
                      >
                        <span>
                          <FontAwesomeIcon icon={faCopy} />
                          Copy
                        </span>
                        <FontAwesomeIcon icon={faCaretRight} />
                      </button>
                      <button
                        className="dinolabsIDETextEditingContextMenuButtonWrapper"
                        onClick={handlePaste}
                      >
                        <span>
                          <FontAwesomeIcon icon={faPaste} />
                          Paste
                        </span>
                        <FontAwesomeIcon icon={faCaretRight} />
                      </button>
                      <button
                        className="dinolabsIDETextEditingContextMenuButtonWrapper"
                        onClick={handleSelectAll}
                      >
                        <span>
                          <FontAwesomeIcon icon={faArrowPointer} />
                          Select All
                        </span>
                        <FontAwesomeIcon icon={faCaretRight} />
                      </button>
                    </div>
                  )
                }
              >
                <button
                  className="dinolabsIDETextOperationsButton"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => toggleModal("edit")}
                  ref={editButtonRef}
                >
                  Edit
                </button>
              </Tippy>
              <Tippy
                visible={openModal === "insert"}
                onClickOutside={() => closeAllMenus()}
                placement="bottom"
                interactive={true}
                className="context-menu-tippy-vertical"
                content={
                  openModal === "insert" && (
                    <div
                      className="dinolabsIDETextEditingContextMenuVertical"
                      ref={insertModalRef}
                    >
                      <button
                        className="dinolabsIDETextEditingContextMenuButtonWrapper"
                        onClick={() => execCommand("insertUnorderedList")}
                      >
                        <span>
                          <FontAwesomeIcon icon={faListUl} />
                          Bulleted List
                        </span>
                        <FontAwesomeIcon icon={faCaretRight} />
                      </button>
                      <button
                        className="dinolabsIDETextEditingContextMenuButtonWrapper"
                        onClick={() => execCommand("insertOrderedList")}
                      >
                        <span>
                          <FontAwesomeIcon icon={faListNumeric} />
                          Numbered List
                        </span>
                        <FontAwesomeIcon icon={faCaretRight} />
                      </button>
                      <Tippy
                        visible={openTablePicker}
                        onClickOutside={() => {
                          setOpenTablePicker(false);
                          setIsTableFontColorOpen(false);
                          setIsTableBackgroundColorOpen(false);
                          setIsTableBorderColorOpen(false);
                        }}
                        placement="right-start"
                        interactive={true}
                        className="context-menu-tippy-vertical"
                        content={
                          <div className="dinolabsIDETextEditingTableGridWrapper">
                            <div className="dinolabsIDETextEditingTableGrid">
                              {Array.from({ length: 80 }).map((_, idx) => {
                                const row = Math.floor(idx / 10) + 1;
                                const col = (idx % 10) + 1;
                                const active = row <= tableRows && col <= tableCols;
                                return (
                                  <div
                                    className="dinolabsIDETextEditingTableGridCells"
                                    key={idx}
                                    onMouseOver={() => {
                                      setTableRows(row);
                                      setTableCols(col);
                                    }}
                                    onClick={() => insertTable(tableRows, tableCols)}
                                    style={{
                                      background: active ? "#cce5ff" : "#f1f1f1"
                                    }}
                                  />
                                );
                              })}
                            </div>
                            <div className="dinolabsIDETextEditingGridLabel">
                              {tableCols} x {tableRows}
                            </div>
                            <div className="dinolabsIDETextEditingGridOperationsFlex">
                              <div
                                className="dinolabsIDETextEditingInputWrapper"
                                style={{ border: "none" }}
                              >
                                <Tippy content="Font Color" theme="tooltip-light" placement="bottom">
                                  <Tippy
                                    content={
                                      <DinoLabsIDEColorPicker
                                        color={tableFontColor}
                                        onChange={color => {
                                          restoreSelection();
                                          setTableFontColor(color);
                                          applyExistingTableStyle({ fontColor: color });
                                        }}
                                      />
                                    }
                                    visible={isTableFontColorOpen}
                                    onClickOutside={() => setIsTableFontColorOpen(false)}
                                    interactive={true}
                                    placement="right"
                                    className="color-picker-tippy"
                                  >
                                    <div className="dinolabsIDETextColorWrapper">
                                      <FontAwesomeIcon icon={faFont} />
                                      <label
                                        className="dinolabsIDETextColorPicker"
                                        onMouseDown={e => {
                                          e.preventDefault();
                                          storeSelection();
                                        }}
                                        onClick={() => {
                                          setIsTableFontColorOpen(prev => !prev);
                                          setIsTableBackgroundColorOpen(false);
                                          setIsTableBorderColorOpen(false);
                                        }}
                                        style={{
                                          backgroundColor: tableFontColor
                                        }}
                                      />
                                    </div>
                                  </Tippy>
                                </Tippy>
                              </div>
                              <div className="dinolabsIDETextEditingInputWrapper">
                                <Tippy content="Background Color" theme="tooltip-light" placement="bottom">
                                  <Tippy
                                    content={
                                      <DinoLabsIDEColorPicker
                                        color={tableBackgroundColor}
                                        onChange={color => {
                                          restoreSelection();
                                          setTableBackgroundColor(color);
                                          applyExistingTableStyle({ backgroundColor: color });
                                        }}
                                      />
                                    }
                                    visible={isTableBackgroundColorOpen}
                                    onClickOutside={() => setIsTableBackgroundColorOpen(false)}
                                    interactive={true}
                                    placement="right"
                                    className="color-picker-tippy"
                                  >
                                    <div className="dinolabsIDETextColorWrapper">
                                      <FontAwesomeIcon icon={faDroplet} />
                                      <label
                                        className="dinolabsIDETextColorPicker"
                                        onMouseDown={e => {
                                          e.preventDefault();
                                          storeSelection();
                                        }}
                                        onClick={() => {
                                          setIsTableBackgroundColorOpen(prev => !prev);
                                          setIsTableFontColorOpen(false);
                                          setIsTableBorderColorOpen(false);
                                        }}
                                        style={{
                                          backgroundColor: tableBackgroundColor
                                        }}
                                      />
                                    </div>
                                  </Tippy>
                                </Tippy>
                              </div>
                              <div className="dinolabsIDETextEditingInputWrapper">
                                <Tippy content="Border Color" theme="tooltip-light" placement="bottom">
                                  <Tippy
                                    content={
                                      <DinoLabsIDEColorPicker
                                        color={tableBorderColor}
                                        onChange={color => {
                                          restoreSelection();
                                          setTableBorderColor(color);
                                          applyExistingTableStyle({ borderColor: color });
                                        }}
                                      />
                                    }
                                    visible={isTableBorderColorOpen}
                                    onClickOutside={() => setIsTableBorderColorOpen(false)}
                                    interactive={true}
                                    placement="right"
                                    className="color-picker-tippy"
                                  >
                                    <div className="dinolabsIDETextColorWrapper">
                                      <FontAwesomeIcon icon={faBorderStyle} />
                                      <label
                                        className="dinolabsIDETextColorPicker"
                                        onMouseDown={e => {
                                          e.preventDefault();
                                          storeSelection();
                                        }}
                                        onClick={() => {
                                          setIsTableBorderColorOpen(prev => !prev);
                                          setIsTableFontColorOpen(false);
                                          setIsTableBackgroundColorOpen(false);
                                        }}
                                        style={{
                                          backgroundColor: tableBorderColor
                                        }}
                                      />
                                    </div>
                                  </Tippy>
                                </Tippy>
                              </div>
                            </div>

                            <div className="dinolabsIDETextEditingGridOperationsFlex"> 
                                <div className="dinolabsIDETextEditingInputWrapper">
                                    <Tippy content="Border Width" theme="tooltip-light" placement="bottom">
                                        <select
                                            className="dinolabsIDETextEditingSelect" style={{"border": "none"}}
                                            value={tableBorderWidth}
                                            onMouseDown={e => {
                                                e.preventDefault();
                                                storeSelection();
                                            }}
                                            onChange={e => {
                                                restoreSelection();
                                                setTableBorderWidth(e.target.value);
                                                applyExistingTableStyle({ borderWidth: e.target.value });
                                            }}
                                        >
                                            <option value="1px">1px</option>
                                            <option value="2px">2px</option>
                                            <option value="3px">3px</option>
                                            <option value="4px">4px</option>
                                        </select>
                                    </Tippy>
                                </div>
                            </div>
                          </div>
                        }
                      >
                        <button
                          className="dinolabsIDETextEditingContextMenuButtonWrapper"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            setOpenTablePicker(prev => !prev);
                            setIsTableFontColorOpen(false);
                            setIsTableBackgroundColorOpen(false);
                            setIsTableBorderColorOpen(false);
                          }}
                          ref={tableButtonRef}
                        >
                          <span>
                            <FontAwesomeIcon icon={faTable} />
                            Table
                          </span>
                          <FontAwesomeIcon icon={faCaretRight} />
                        </button>
                      </Tippy>
                    </div>
                  )
                }
              >
                <button
                  className="dinolabsIDETextOperationsButton"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => toggleModal("insert")}
                  ref={insertButtonRef}
                >
                  Insert
                </button>
              </Tippy>
              <Tippy
                visible={openModal === "format"}
                onClickOutside={() => closeAllMenus()}
                placement="bottom"
                interactive={true}
                className="context-menu-tippy-vertical"
                content={
                  openModal === "format" && (
                    <div
                      className="dinolabsIDETextEditingContextMenuVertical"
                      ref={formatModalRef}
                    >
                    </div>
                  )
                }
              >
                <button
                  className="dinolabsIDETextOperationsButton"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => toggleModal("format")}
                  ref={formatButtonRef}
                >
                  Format
                </button>
              </Tippy>
              <Tippy
                visible={openModal === "tools"}
                onClickOutside={() => closeAllMenus()}
                placement="bottom"
                interactive={true}
                className="context-menu-tippy-vertical"
                content={
                  openModal === "tools" && (
                    <div
                      className="dinolabsIDETextEditingContextMenuVertical"
                      ref={toolsModalRef}
                    >
                    </div>
                  )
                }
              >
                <button
                  className="dinolabsIDETextOperationsButton"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => toggleModal("tools")}
                  ref={toolsButtonRef}
                >
                  Tools
                </button>
              </Tippy>
            </div>
          </div>
        </div>
        <div className="dinolabsIDETextEditingButtonsWrapper">
          <div className="dinolabsIDETextEditingInputWrapper" style={{ borderLeft: "none" }}>
            <Tippy content="Decrease Font Size" theme="tooltip-light" placement="bottom">
              <button
                className="dinolabsIDETextEditingButton"
                onMouseDown={e => e.preventDefault()}
                onClick={decreaseFontSize}
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
            </Tippy>
            <input
              className="dinolabsIDETextEditingInput"
              value={`${currentFontSize}px`}
              readOnly
            />
            <Tippy content="Increase Font Size" theme="tooltip-light" placement="bottom">
              <button
                className="dinolabsIDETextEditingButton"
                onMouseDown={e => e.preventDefault()}
                onClick={increaseFontSize}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </Tippy>
          </div>
          <div className="dinolabsIDETextEditingInputWrapper">
            <Tippy content="Change Font Style" theme="tooltip-light" placement="bottom">
              <select
                className="dinolabsIDETextEditingSelect"
                value={fontStyle}
                onChange={handleFontStyleChange}
              >
                <option value="H1">Header 1</option>
                <option value="H2">Header 2</option>
                <option value="H3">Header 3</option>
                <option value="P">Paragraph</option>
              </select>
            </Tippy>
          </div>
          <div className="dinolabsIDETextEditingInputWrapper">
            <Tippy content="Change Font Type" theme="tooltip-light" placement="bottom">
              <select
                className="dinolabsIDETextEditingSelect"
                value={fontType}
                onChange={handleFontTypeChange}
              >
                <option value="Arial">Arial</option>
                <option value="Courier New">Courier New</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
              </select>
            </Tippy>
          </div>
          <div className="dinolabsIDETextEditingInputWrapper">
            <Tippy content="Bold Text" theme="tooltip-light" placement="bottom">
              <button
                className="dinolabsIDETextEditingButton"
                onMouseDown={e => e.preventDefault()}
                onClick={() => execCommand("bold")}
              >
                <FontAwesomeIcon icon={faBold} />
              </button>
            </Tippy>
            <Tippy content="Italicize Text" theme="tooltip-light" placement="bottom">
              <button
                className="dinolabsIDETextEditingButton"
                onMouseDown={e => e.preventDefault()}
                onClick={() => execCommand("italic")}
              >
                <FontAwesomeIcon icon={faItalic} />
              </button>
            </Tippy>
            <Tippy content="Underline Text" theme="tooltip-light" placement="bottom">
              <button
                className="dinolabsIDETextEditingButton"
                onMouseDown={e => e.preventDefault()}
                onClick={() => execCommand("underline")}
              >
                <FontAwesomeIcon icon={faUnderline} />
              </button>
            </Tippy>
            <Tippy content="Strikethrough Text" theme="tooltip-light" placement="bottom">
              <button
                className="dinolabsIDETextEditingButton"
                onMouseDown={e => e.preventDefault()}
                onClick={() => execCommand("strikeThrough")}
              >
                <FontAwesomeIcon icon={faStrikethrough} />
              </button>
            </Tippy>
          </div>
          <div className="dinolabsIDETextEditingInputWrapper">
            <Tippy content="Alignment Options" theme="tooltip-light" placement="bottom">
              <Tippy
                visible={openModal === "align"}
                onClickOutside={() => closeAllMenus()}
                placement="bottom"
                interactive={true}
                className="context-menu-tippy-horizontal"
                content={
                  openModal === "align" && (
                    <div
                      className="dinolabsIDETextEditingContextMenuHorizontal"
                      ref={alignModalRef}
                    >
                      <Tippy content="Align Left" theme="tooltip-light" placement="bottom">
                        <button
                          className="dinolabsIDETextEditingButton"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleAlign("justifyLeft")}
                        >
                          <FontAwesomeIcon icon={faAlignLeft} />
                        </button>
                      </Tippy>
                      <Tippy content="Align Center" theme="tooltip-light" placement="bottom">
                        <button
                          className="dinolabsIDETextEditingButton"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleAlign("justifyCenter")}
                        >
                          <FontAwesomeIcon icon={faAlignCenter} />
                        </button>
                      </Tippy>
                      <Tippy content="Align Right" theme="tooltip-light" placement="bottom">
                        <button
                          className="dinolabsIDETextEditingButton"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleAlign("justifyRight")}
                        >
                          <FontAwesomeIcon icon={faAlignRight} />
                        </button>
                      </Tippy>
                      <Tippy content="Justify Full" theme="tooltip-light" placement="bottom">
                        <button
                          className="dinolabsIDETextEditingButton"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleAlign("justifyFull")}
                        >
                          <FontAwesomeIcon icon={faAlignJustify} />
                        </button>
                      </Tippy>
                      <Tippy content="Indent" theme="tooltip-light" placement="bottom">
                        <button
                          className="dinolabsIDETextEditingButton"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => execCommand("indent")}
                        >
                          <FontAwesomeIcon icon={faIndent} />
                        </button>
                      </Tippy>
                      <Tippy content="Outdent" theme="tooltip-light" placement="bottom">
                        <button
                          className="dinolabsIDETextEditingButton"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => execCommand("outdent")}
                        >
                          <FontAwesomeIcon icon={faOutdent} />
                        </button>
                      </Tippy>
                    </div>
                  )
                }
              >
                <button
                  className="dinolabsIDETextEditingButton"
                  onClick={() => toggleModal("align")}
                  ref={alignButtonRef}
                >
                  <FontAwesomeIcon icon={faBarsStaggered} />
                </button>
              </Tippy>
            </Tippy>
            <Tippy content="Line Spacing" theme="tooltip-light" placement="bottom">
              <Tippy
                visible={openModal === "lineSpacing"}
                onClickOutside={() => closeAllMenus()}
                placement="bottom"
                interactive={true}
                className="context-menu-tippy-horizontal"
                content={
                  openModal === "lineSpacing" && (
                    <div
                      className="dinolabsIDETextEditingContextMenuHorizontal"
                      ref={lineSpacingModalRef}
                    >
                      <Tippy content="1x" theme="tooltip-light" placement="bottom">
                        <button
                          className="dinolabsIDETextEditingButton"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleLineSpacing("1")}
                        >
                          1x
                        </button>
                      </Tippy>
                      <Tippy content="1.5x" theme="tooltip-light" placement="bottom">
                        <button
                          className="dinolabsIDETextEditingButton"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleLineSpacing("1.5")}
                        >
                          1.5x
                        </button>
                      </Tippy>
                      <Tippy content="2x" theme="tooltip-light" placement="bottom">
                        <button
                          className="dinolabsIDETextEditingButton"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleLineSpacing("2")}
                        >
                          2x
                        </button>
                      </Tippy>
                      <Tippy content="2.5x" theme="tooltip-light" placement="bottom">
                        <button
                          className="dinolabsIDETextEditingButton"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleLineSpacing("2.5")}
                        >
                          2.5x
                        </button>
                      </Tippy>
                      <Tippy content="3x" theme="tooltip-light" placement="bottom">
                        <button
                          className="dinolabsIDETextEditingButton"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleLineSpacing("3")}
                        >
                          3x
                        </button>
                      </Tippy>
                    </div>
                  )
                }
              >
                <button
                  className="dinolabsIDETextEditingButton"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => toggleModal("lineSpacing")}
                  ref={lineSpacingButtonRef}
                >
                  <FontAwesomeIcon icon={faArrowUpWideShort} />
                </button>
              </Tippy>
            </Tippy>
            <Tippy content="List Options" theme="tooltip-light" placement="bottom">
              <Tippy
                visible={openModal === "lists"}
                onClickOutside={() => closeAllMenus()}
                placement="bottom"
                interactive={true}
                className="context-menu-tippy-horizontal"
                content={
                  openModal === "lists" && (
                    <div
                      className="dinolabsIDETextEditingContextMenuHorizontal"
                      ref={listModalRef}
                    >
                      <Tippy content="Bullet List" theme="tooltip-light" placement="bottom">
                        <button
                          className="dinolabsIDETextEditingButton"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => execCommand("insertUnorderedList")}
                        >
                          <FontAwesomeIcon icon={faListUl} />
                        </button>
                      </Tippy>
                      <Tippy content="Numbered List" theme="tooltip-light" placement="bottom">
                        <button
                          className="dinolabsIDETextEditingButton"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => execCommand("insertOrderedList")}
                        >
                          <FontAwesomeIcon icon={faListNumeric} />
                        </button>
                      </Tippy>
                    </div>
                  )
                }
              >
                <button
                  className="dinolabsIDETextEditingButton"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => toggleModal("lists")}
                  ref={listButtonRef}
                >
                  <FontAwesomeIcon icon={faListUl} />
                </button>
              </Tippy>
            </Tippy>
          </div>
          <div className="dinolabsIDETextEditingInputWrapper">
            <Tippy content="More Options" theme="tooltip-light" placement="bottom">
              <Tippy
                visible={openModal === "more"}
                onClickOutside={() => {
                  closeAllMenus();
                }}
                placement="bottom"
                interactive={true}
                className="context-menu-tippy-horizontal"
                content={
                  openModal === "more" && (
                    <div
                      className="dinolabsIDETextEditingContextMenuHorizontal"
                      ref={moreModalRef}
                    >
                      <div
                        className="dinolabsIDETextEditingInputWrapper"
                        style={{ border: "none" }}
                      >
                        <Tippy content="Text Color" theme="tooltip-light" placement="bottom">
                          <Tippy
                            content={
                              <DinoLabsIDEColorPicker
                                color={textColor}
                                onChange={color => {
                                  restoreSelection();
                                  handleTextColorChange(color);
                                }}
                              />
                            }
                            visible={isTextColorOpen}
                            onClickOutside={() => setIsTextColorOpen(false)}
                            interactive={true}
                            placement="right"
                            className="color-picker-tippy"
                          >
                            <div className="dinolabsIDETextColorWrapper">
                              <FontAwesomeIcon icon={faDroplet} />
                              <label
                                className="dinolabsIDETextColorPicker"
                                onMouseDown={e => {
                                  e.preventDefault();
                                  storeSelection();
                                }}
                                onClick={() => {
                                  setIsTextColorOpen(prev => !prev);
                                  setIsTextHighlightColorOpen(false);
                                }}
                                style={{
                                  backgroundColor: textColor
                                }}
                              />
                            </div>
                          </Tippy>
                        </Tippy>
                      </div>
                      <div className="dinolabsIDETextEditingInputWrapper">
                        <Tippy content="Text Highlight Color" theme="tooltip-light" placement="bottom">
                          <Tippy
                            content={
                              <DinoLabsIDEColorPicker
                                color={textHighlightColor}
                                onChange={color => {
                                  restoreSelection();
                                  handleTextHighlightColorChange(color);
                                }}
                              />
                            }
                            visible={isTextHighlightColorOpen}
                            onClickOutside={() => setIsTextHighlightColorOpen(false)}
                            interactive={true}
                            placement="right"
                            className="color-picker-tippy"
                          >
                            <div className="dinolabsIDETextColorWrapper">
                              <FontAwesomeIcon icon={faHighlighter} />
                              <label
                                className="dinolabsIDETextColorPicker"
                                onMouseDown={e => {
                                  e.preventDefault();
                                  storeSelection();
                                }}
                                onClick={() => {
                                  setIsTextHighlightColorOpen(prev => !prev);
                                  setIsTextColorOpen(false);
                                }}
                                style={{
                                  backgroundColor: textHighlightColor
                                }}
                              />
                            </div>
                          </Tippy>
                        </Tippy>
                      </div>
                      <div className="dinolabsIDETextEditingInputWrapper">
                        <Tippy content="Remove Formatting" theme="tooltip-light" placement="bottom">
                          <button
                            className="dinolabsIDETextEditingButton"
                            onMouseDown={e => e.preventDefault()}
                            onClick={handleRemoveFormatting}
                          >
                            <FontAwesomeIcon icon={faEraser} />
                          </button>
                        </Tippy>
                      </div>
                    </div>
                  )
                }
              >
                <button
                  className="dinolabsIDETextEditingButton"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => toggleModal("more")}
                  ref={moreButtonRef}
                >
                  <FontAwesomeIcon icon={faEllipsisV} />
                </button>
              </Tippy>
            </Tippy>
          </div>
        </div>
      </div>
      <div className="dinolabsIDETextEditorWrapper">
        <div className="dinolabsIDETextTipMargin"></div>
        <div className="dinolabsIDeTextEditorStack">
          <div className="dinoLabsTextEditorTopBar"></div>
          <div
            className="dinolabsIDETextEditor"
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: initialHTML }}
            onInput={() => onSave(editorRef.current.innerHTML)}
            onKeyDown={handleKeyDown}
          />
          <div className="dinoLabsTextEditorBottomBar"></div>
        </div>
        <div className="dinolabsIDETextCommentMargin"></div>
      </div>
    </div>
  );
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
