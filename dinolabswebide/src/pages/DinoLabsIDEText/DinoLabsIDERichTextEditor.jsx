import React, { useEffect, useRef, useState } from "react";
import "../../styles/mainStyles/TextEditorStyles/DinoLabsIDERichTextEditor.css";
import DinoLabsIDEColorPicker from '../DinoLabsIDEColorPicker.jsx';
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
    faChevronRight, 
    faDownload, 
    faDroplet, 
    faEllipsisV, 
    faEraser, 
    faFile, 
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
    faSearch,
    faSync
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

    const styleMap = {
        H1: { fontSize: "32px", fontWeight: "bold" },
        H2: { fontSize: "24px", fontWeight: "bold" },
        H3: { fontSize: "20px", fontWeight: "bold" },
        P:  { fontSize: "16px", fontWeight: "normal" }
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
            if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
                savedRangeRef.current = range.cloneRange();
            }
        };
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openModal) {
                let modalRef = null;
                let buttonRef = null;

                if (openModal === 'align') {
                    modalRef = alignModalRef.current;
                    buttonRef = alignButtonRef.current;
                } else if (openModal === 'lineSpacing') {
                    modalRef = lineSpacingModalRef.current;
                    buttonRef = lineSpacingButtonRef.current;
                } else if (openModal === 'lists') {
                    modalRef = listModalRef.current;
                    buttonRef = listButtonRef.current;
                } else if (openModal === 'more') {
                    modalRef = moreModalRef.current;
                    buttonRef = moreButtonRef.current;
                } 
                else if (openModal === 'file') {
                    modalRef = fileModalRef.current;
                    buttonRef = fileButtonRef.current;
                } else if (openModal === 'edit') {
                    modalRef = editModalRef.current;
                    buttonRef = editButtonRef.current;
                } else if (openModal === 'insert') {
                    modalRef = insertModalRef.current;
                    buttonRef = insertButtonRef.current;
                } else if (openModal === 'format') {
                    modalRef = formatModalRef.current;
                    buttonRef = formatButtonRef.current;
                } else if (openModal === 'tools') {
                    modalRef = toolsModalRef.current;
                    buttonRef = toolsButtonRef.current;
                }

                if (
                    modalRef && !modalRef.contains(event.target) &&
                    buttonRef && !buttonRef.contains(event.target)
                ) {
                    setOpenModal(null);
                    if (openModal === 'more') {
                        setIsTextColorOpen(false);
                        setIsTextHighlightColorOpen(false);
                    }
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openModal]);

    const restoreSelection = () => {
        const selection = window.getSelection();
        if (savedRangeRef.current) {
            selection.removeAllRanges();
            selection.addRange(savedRangeRef.current);
        }
    };

    const execCommand = (command, value = null) => {
        restoreSelection();
        document.execCommand(command, false, value);
    };

    function getParagraphsInSelection() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return [];
        const range = selection.getRangeAt(0);

        const walker = document.createTreeWalker(
            range.commonAncestorContainer,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => range.intersectsNode(node)
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_REJECT
            }
        );

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

    const setParagraphStyle = (styleObj) => {
        const paragraphs = getParagraphsInSelection();
        paragraphs.forEach((p) => {
            Object.entries(styleObj).forEach(([prop, val]) => {
                p.style[prop] = val;
            });
        });
    };

    const applyLineSpacing = (spacing) => {
        const paragraphs = getParagraphsInSelection();
        paragraphs.forEach(p => {
            p.style.lineHeight = spacing;
        });
    };

    const handleFontStyleChange = (e) => {
        const desiredStyle = e.target.value;
        setFontStyle(desiredStyle);
        restoreSelection();
        setParagraphStyle(styleMap[desiredStyle]);
    };

    const applyFontFamily = (font) => {
        restoreSelection();
        document.execCommand("styleWithCSS", false, true);
        document.execCommand("fontName", false, font);
    };

    const handleFontTypeChange = (e) => {
        const type = e.target.value;
        setFontType(type);
        applyFontFamily(type);
    };

    const handleLineSpacing = (spacing) => {
        restoreSelection();
        document.execCommand('formatBlock', false, 'p');
        applyLineSpacing(spacing);
        setOpenModal(null);
    };

    const applyFontSize = (size) => {
        execCommand("fontSize", 7);
        const fontElements = editorRef.current.getElementsByTagName("font");
        for (let i = 0; i < fontElements.length; i++) {
            if (fontElements[i].size === "7") {
                fontElements[i].removeAttribute("size");
                fontElements[i].style.fontSize = `${size}px`;
            }
        }
    };

    const decreaseFontSize = (e) => {
        e.preventDefault();
        setCurrentFontSize((prevSize) => {
            const newSize = Math.max(8, prevSize - 2);
            applyFontSize(newSize);
            return newSize;
        });
    };

    const increaseFontSize = (e) => {
        e.preventDefault();
        setCurrentFontSize((prevSize) => {
            const newSize = Math.min(72, prevSize + 2);
            applyFontSize(newSize);
            return newSize;
        });
    };

    const toggleModal = (modalName) => {
        setOpenModal((prev) => {
            const newModal = prev === modalName ? null : modalName;
            if (prev === 'more' && newModal !== 'more') {
                setIsTextColorOpen(false);
                setIsTextHighlightColorOpen(false);
            }
            return newModal;
        });
    };

    const handleAlign = (alignment) => {
        execCommand(alignment);
        setOpenModal(null);
    };

    const handleTextColorChange = (color) => {
        setTextColor(color);
        execCommand("foreColor", color);
    };

    const handleTextHighlightColorChange = (color) => {
        setTextHighlightColor(color);
        execCommand("hiliteColor", color);
    };

    const handleDownload = async () => {
        const result = await showDialog({
            title: 'Download as...',
            message: 'Select a file type to download this file as.',
            inputs: [
                {
                    name: 'fileType',
                    type: 'select',
                    options: [
                        { label: 'Plain Text (.txt)', value: 'txt' },
                        { label: 'Markdown (.md)', value: 'md' }
                    ]
                }
            ],
            showCancel: true
        });
        if (result) {
            const content = editorRef.current.innerText;
            const fileExtension = result.fileType === 'md' ? 'md' : 'txt';
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName.replace(/\.[^/.]+$/, '') + '.' + fileExtension;
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // ----- Updated for Edit functionality -----
    const handleSelectAll = () => {
        if (!editorRef.current) return;
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };

    const handlePaste = async () => {
      restoreSelection();
      try {
        const text = await navigator.clipboard.readText();
        document.execCommand('insertText', false, text);
      } catch (err) {
        console.error("Failed to paste from clipboard: ", err);
      }
    };

    const handleSearch = async () => {
      const result = await showDialog({
        title: 'Search',
        message: 'Enter search term:',
        inputs: [
          { name: 'searchTerm', type: 'text', defaultValue: '' }
        ],
        showCancel: true
      });
      if (!result) return;
      const { searchTerm } = result;
      if (!searchTerm.trim()) return;

      // Placeholder for actual search logic
      alert(`Searching for "${searchTerm}"...`);
    };

    const handleSearchReplace = async () => {
      const result = await showDialog({
        title: 'Search & Replace',
        message: 'Enter search term and replace value:',
        inputs: [
          { name: 'searchTerm', type: 'text', defaultValue: '' },
          { name: 'replaceTerm', type: 'text', defaultValue: '' }
        ],
        showCancel: true
      });
      if (!result) return;
      const { searchTerm, replaceTerm } = result;
      if (!searchTerm.trim()) return;

      // Placeholder for actual search & replace logic
      alert(`Replacing "${searchTerm}" with "${replaceTerm}"...`);
    };
    // -----------------------------------------

    if (error) {
        return; 
    }

    return (
        <div className="dinolabsIDETextWrapper">
            <div className="dinolabsIDETextToolBar">
                <div className="dinolabsIDETextTitleWrapper"> 
                    <FontAwesomeIcon icon={faPenToSquare} className="dinolabsIDETextFileIcon"/>
                    <div className="dinolabsIDEFileNameStack">
                        <label className="dinolasIDETextFileNameInput">
                            {fileName}
                        </label> 
                        <div className="dinolabsIDETextOperationsButtonsWrapper"> 
                            <Tippy
                                visible={openModal === 'file'}
                                onClickOutside={() => setOpenModal(null)}
                                placement="bottom"
                                interactive={true}
                                className="context-menu-tippy-vertical"
                                content={
                                    openModal === 'file' && (
                                        <div 
                                            className="dinolabsIDETextEditingContextMenuVertical"
                                            ref={fileModalRef}
                                        >
                                            <button 
                                                className="dinolabsIDETextEditingContextMenuButtonWrapper"
                                                onClick={handleDownload}
                                            > 
                                                <span>
                                                    <FontAwesomeIcon icon={faDownload}/>
                                                    Download
                                                </span>
                                                <FontAwesomeIcon icon={faCaretRight}/>
                                            </button>

                                            <button 
                                                className="dinolabsIDETextEditingContextMenuButtonWrapper"
                                                onClick={handlePrint}
                                            > 
                                                <span>
                                                    <FontAwesomeIcon icon={faDownload}/>
                                                    Print
                                                </span>
                                                <FontAwesomeIcon icon={faCaretRight}/>
                                            </button>
                                        </div>
                                    )
                                }
                            >
                                <button
                                    className="dinolabsIDETextOperationsButton"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => toggleModal('file')}
                                    ref={fileButtonRef}
                                >
                                    File
                                </button>
                            </Tippy>

                            <Tippy
                                visible={openModal === 'edit'}
                                onClickOutside={() => setOpenModal(null)}
                                placement="bottom"
                                interactive={true}
                                className="context-menu-tippy-vertical"
                                content={
                                    openModal === 'edit' && (
                                        <div 
                                            className="dinolabsIDETextEditingContextMenuVertical"
                                            ref={editModalRef}
                                        >
                                            <button 
                                                className="dinolabsIDETextEditingContextMenuButtonWrapper"
                                                onClick={() => execCommand("undo")}
                                            > 
                                                <span>
                                                    <FontAwesomeIcon icon={faUndo}/>
                                                    Undo
                                                </span>
                                                <FontAwesomeIcon icon={faCaretRight}/>
                                            </button>

                                            <button 
                                                className="dinolabsIDETextEditingContextMenuButtonWrapper"
                                                onClick={() => execCommand("redo")}
                                            > 
                                                <span>
                                                    <FontAwesomeIcon icon={faRedo}/>
                                                    Redo
                                                </span>
                                                <FontAwesomeIcon icon={faCaretRight}/>
                                            </button>

                                            <button 
                                                className="dinolabsIDETextEditingContextMenuButtonWrapper"
                                                onClick={() => execCommand("cut")}
                                            > 
                                                <span>
                                                    <FontAwesomeIcon icon={faCut}/>
                                                    Cut
                                                </span>
                                                <FontAwesomeIcon icon={faCaretRight}/>
                                            </button>

                                            <button 
                                                className="dinolabsIDETextEditingContextMenuButtonWrapper"
                                                onClick={() => execCommand("copy")}
                                            > 
                                                <span>
                                                    <FontAwesomeIcon icon={faCopy}/>
                                                    Copy
                                                </span>
                                                <FontAwesomeIcon icon={faCaretRight}/>
                                            </button>

                                            {/* Updated paste button to custom paste handler */}
                                            <button 
                                                className="dinolabsIDETextEditingContextMenuButtonWrapper"
                                                onClick={handlePaste}
                                            > 
                                                <span>
                                                    <FontAwesomeIcon icon={faPaste}/>
                                                    Paste
                                                </span>
                                                <FontAwesomeIcon icon={faCaretRight}/>
                                            </button>

                                            <button 
                                                className="dinolabsIDETextEditingContextMenuButtonWrapper"
                                                onClick={handleSelectAll}
                                            > 
                                                <span>
                                                    <FontAwesomeIcon icon={faArrowPointer}/>
                                                    Select All
                                                </span>
                                                <FontAwesomeIcon icon={faCaretRight}/>
                                            </button>

                                            {/* Converted to use custom dialog */}
                                            <button 
                                                className="dinolabsIDETextEditingContextMenuButtonWrapper"
                                                onClick={handleSearch}
                                            > 
                                                <span>
                                                    <FontAwesomeIcon icon={faSearch}/>
                                                    Search
                                                </span>
                                                <FontAwesomeIcon icon={faCaretRight}/>
                                            </button>

                                            <button 
                                                className="dinolabsIDETextEditingContextMenuButtonWrapper"
                                                onClick={handleSearchReplace}
                                            > 
                                                <span>
                                                    <FontAwesomeIcon icon={faSync}/>
                                                    Search & Replace
                                                </span>
                                                <FontAwesomeIcon icon={faCaretRight}/>
                                            </button>
                                        </div>
                                    )
                                }
                            >
                                <button
                                    className="dinolabsIDETextOperationsButton"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => toggleModal('edit')}
                                    ref={editButtonRef}
                                >
                                    Edit
                                </button>
                            </Tippy>

                            <Tippy
                                visible={openModal === 'insert'}
                                onClickOutside={() => setOpenModal(null)}
                                placement="bottom"
                                interactive={true}
                                className="context-menu-tippy-vertical"
                                content={
                                    openModal === 'insert' && (
                                        <div 
                                            className="dinolabsIDETextEditingContextMenuVertical"
                                            ref={insertModalRef}
                                        >
                                        </div>
                                    )
                                }
                            >
                                <button
                                    className="dinolabsIDETextOperationsButton"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => toggleModal('insert')}
                                    ref={insertButtonRef}
                                >
                                    Insert
                                </button>
                            </Tippy>

                            <Tippy
                                visible={openModal === 'format'}
                                onClickOutside={() => setOpenModal(null)}
                                placement="bottom"
                                interactive={true}
                                className="context-menu-tippy-vertical"
                                content={
                                    openModal === 'format' && (
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
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => toggleModal('format')}
                                    ref={formatButtonRef}
                                >
                                    Format
                                </button>
                            </Tippy>
                            
                            <Tippy
                                visible={openModal === 'tools'}
                                onClickOutside={() => setOpenModal(null)}
                                placement="bottom"
                                interactive={true}
                                className="context-menu-tippy-vertical"
                                content={
                                    openModal === 'tools' && (
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
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => toggleModal('tools')}
                                    ref={toolsButtonRef}
                                >
                                    Tools
                                </button>
                            </Tippy>
                        </div>
                    </div>
                </div>
                <div className="dinolabsIDETextEditingButtonsWrapper">
                    <div className="dinolabsIDETextEditingInputWrapper" style={{"borderLeft": "none"}}>  
                        <Tippy content="Decrease Font Size" theme="tooltip-light" placement="bottom">
                            <button
                                className="dinolabsIDETextEditingButton"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={decreaseFontSize}
                            >
                                <FontAwesomeIcon icon={faMinus}/>
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
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={increaseFontSize}
                            >
                                <FontAwesomeIcon icon={faPlus}/>
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
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { execCommand("bold"); }}
                            >
                                <FontAwesomeIcon icon={faBold}/>
                            </button>
                        </Tippy>
                        <Tippy content="Italicize Text" theme="tooltip-light" placement="bottom">
                            <button
                                className="dinolabsIDETextEditingButton"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { execCommand("italic"); }}
                            >
                                <FontAwesomeIcon icon={faItalic}/>
                            </button>
                        </Tippy>
                        <Tippy content="Underline Text" theme="tooltip-light" placement="bottom">
                            <button
                                className="dinolabsIDETextEditingButton"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { execCommand("underline"); }}
                            >
                                <FontAwesomeIcon icon={faUnderline}/>
                            </button>
                        </Tippy>
                        <Tippy content="Strikethrough Text" theme="tooltip-light" placement="bottom">
                            <button
                                className="dinolabsIDETextEditingButton"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { execCommand("strikeThrough"); }}
                            >
                                <FontAwesomeIcon icon={faStrikethrough}/>
                            </button>
                        </Tippy>
                    </div>

                    <div className="dinolabsIDETextEditingInputWrapper">    
                        <Tippy content="Alignment Options" theme="tooltip-light" placement="bottom">
                            <Tippy
                                visible={openModal === 'align'}
                                onClickOutside={() => setOpenModal(null)}
                                placement="bottom"
                                interactive={true}
                                className="context-menu-tippy-horizontal"
                                content={
                                    openModal === 'align' && (
                                        <div className="dinolabsIDETextEditingContextMenuHorizontal" 
                                            ref={alignModalRef}
                                        >
                                            <Tippy content="Align Left" theme="tooltip-light" placement="bottom">
                                                <button
                                                    className="dinolabsIDETextEditingButton" 
                                                    onMouseDown={(e) => e.preventDefault()} 
                                                    onClick={() => handleAlign("justifyLeft")}
                                                >
                                                    <FontAwesomeIcon icon={faAlignLeft}/>
                                                </button>
                                            </Tippy>
                                            <Tippy content="Align Center" theme="tooltip-light" placement="bottom">
                                                <button
                                                    className="dinolabsIDETextEditingButton"
                                                    onMouseDown={(e) => e.preventDefault()} 
                                                    onClick={() => handleAlign("justifyCenter")}
                                                >
                                                    <FontAwesomeIcon icon={faAlignCenter}/>
                                                </button>
                                            </Tippy>
                                            <Tippy content="Align Right" theme="tooltip-light" placement="bottom">
                                                <button
                                                    className="dinolabsIDETextEditingButton"
                                                    onMouseDown={(e) => e.preventDefault()} 
                                                    onClick={() => handleAlign("justifyRight")}
                                                >
                                                    <FontAwesomeIcon icon={faAlignRight}/>
                                                </button>
                                            </Tippy>
                                            <Tippy content="Justify Full" theme="tooltip-light" placement="bottom">
                                                <button
                                                    className="dinolabsIDETextEditingButton"
                                                    onMouseDown={(e) => e.preventDefault()} 
                                                    onClick={() => handleAlign("justifyFull")}
                                                >
                                                    <FontAwesomeIcon icon={faAlignJustify}/>
                                                </button>
                                            </Tippy>
                                            <Tippy content="Indent" theme="tooltip-light" placement="bottom">
                                                <button
                                                    className="dinolabsIDETextEditingButton"
                                                    onMouseDown={(e) => e.preventDefault()} 
                                                    onClick={() => execCommand("indent")}
                                                >
                                                    <FontAwesomeIcon icon={faIndent}/>
                                                </button>
                                            </Tippy>
                                            <Tippy content="Outdent" theme="tooltip-light" placement="bottom">
                                                <button
                                                    className="dinolabsIDETextEditingButton"
                                                    onMouseDown={(e) => e.preventDefault()} 
                                                    onClick={() => execCommand("outdent")}
                                                >
                                                    <FontAwesomeIcon icon={faOutdent}/>
                                                </button>
                                            </Tippy>
                                        </div>
                                    )
                                }
                            >
                                <button
                                    className="dinolabsIDETextEditingButton"
                                    onClick={() => toggleModal('align')}
                                    ref={alignButtonRef}
                                >
                                    <FontAwesomeIcon icon={faBarsStaggered}/>
                                </button>
                            </Tippy>
                        </Tippy>

                        <Tippy content="Line Spacing" theme="tooltip-light" placement="bottom">
                            <Tippy
                                visible={openModal === 'lineSpacing'}
                                onClickOutside={() => setOpenModal(null)}
                                placement="bottom"
                                interactive={true}
                                className="context-menu-tippy-horizontal"
                                content={
                                    openModal === 'lineSpacing' && (
                                        <div className="dinolabsIDETextEditingContextMenuHorizontal"
                                            ref={lineSpacingModalRef}
                                        >
                                            <Tippy content="1x" theme="tooltip-light" placement="bottom">
                                                <button
                                                    className="dinolabsIDETextEditingButton"
                                                    onMouseDown={(e) => e.preventDefault()} 
                                                    onClick={() => handleLineSpacing("1")}
                                                >
                                                    1x
                                                </button>
                                            </Tippy> 
                                            <Tippy content="1.5x" theme="tooltip-light" placement="bottom">
                                                <button
                                                    className="dinolabsIDETextEditingButton"
                                                    onMouseDown={(e) => e.preventDefault()} 
                                                    onClick={() => handleLineSpacing("1.5")}
                                                >
                                                    1.5x
                                                </button>
                                            </Tippy>
                                            <Tippy content="2x" theme="tooltip-light" placement="bottom">
                                                <button
                                                    className="dinolabsIDETextEditingButton"
                                                    onMouseDown={(e) => e.preventDefault()} 
                                                    onClick={() => handleLineSpacing("2")}
                                                >
                                                    2x
                                                </button>
                                            </Tippy>
                                            <Tippy content="2.5x" theme="tooltip-light" placement="bottom">
                                                <button
                                                    className="dinolabsIDETextEditingButton"
                                                    onMouseDown={(e) => e.preventDefault()} 
                                                    onClick={() => handleLineSpacing("2.5")}
                                                >
                                                    2.5x
                                                </button>
                                            </Tippy>
                                            <Tippy content="3x" theme="tooltip-light" placement="bottom">
                                                <button
                                                    className="dinolabsIDETextEditingButton"
                                                    onMouseDown={(e) => e.preventDefault()} 
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
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => toggleModal('lineSpacing')}
                                    ref={lineSpacingButtonRef}
                                >
                                    <FontAwesomeIcon icon={faArrowUpWideShort}/>
                                </button>
                            </Tippy>
                        </Tippy>

                        <Tippy content="List Options" theme="tooltip-light" placement="bottom">
                            <Tippy
                                visible={openModal === 'lists'}
                                onClickOutside={() => setOpenModal(null)}
                                placement="bottom"
                                interactive={true}
                                className="context-menu-tippy-horizontal"
                                content={
                                    openModal === 'lists' && (
                                        <div className="dinolabsIDETextEditingContextMenuHorizontal"
                                            ref={listModalRef}
                                        >
                                            <Tippy content="Bullet List" theme="tooltip-light" placement="bottom">
                                                <button
                                                    className="dinolabsIDETextEditingButton"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => execCommand('insertUnorderedList')}
                                                >
                                                    <FontAwesomeIcon icon={faListUl}/>
                                                </button>
                                            </Tippy>
                                            <Tippy content="Numbered List" theme="tooltip-light" placement="bottom">
                                                <button
                                                    className="dinolabsIDETextEditingButton"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => execCommand('insertOrderedList')}
                                                >
                                                    <FontAwesomeIcon icon={faListNumeric}/>
                                                </button>
                                            </Tippy>
                                        </div>
                                    )
                                }
                            >
                                <button
                                    className="dinolabsIDETextEditingButton"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => toggleModal('lists')}
                                    ref={listButtonRef}
                                >
                                    <FontAwesomeIcon icon={faListUl}/>
                                </button>
                            </Tippy>
                        </Tippy>
                    </div>

                    <div className="dinolabsIDETextEditingInputWrapper">
                        <Tippy content="More Options" theme="tooltip-light" placement="bottom">
                            <Tippy
                                visible={openModal === 'more'}
                                onClickOutside={() => { 
                                    setOpenModal(null); 
                                    setIsTextColorOpen(false);
                                    setIsTextHighlightColorOpen(false);
                                }}
                                placement="bottom"
                                interactive={true}
                                className="context-menu-tippy-horizontal"
                                content={
                                    openModal === 'more' && (
                                        <div className="dinolabsIDETextEditingContextMenuHorizontal"
                                            ref={moreModalRef}
                                        >
                                            <div
                                                className="dinolabsIDETextEditingInputWrapper"
                                                style={{"border": "none"}}
                                            >
                                                <Tippy content="Text Color" theme="tooltip-light" placement="bottom">
                                                    <Tippy
                                                        content={
                                                            <DinoLabsIDEColorPicker
                                                                color={textColor}
                                                                onChange={handleTextColorChange}
                                                            />
                                                        }
                                                        visible={isTextColorOpen}
                                                        onClickOutside={() => setIsTextColorOpen(false)}
                                                        interactive={true}
                                                        placement="right"
                                                        className="color-picker-tippy"
                                                    >
                                                        <div className="dinolabsIDETextColorWrapper">
                                                            <FontAwesomeIcon icon={faDroplet}/>
                                                            <label
                                                                className="dinolabsIDETextColorPicker"
                                                                onClick={() => setIsTextColorOpen((prev) => !prev)}
                                                                style={{
                                                                    backgroundColor: textColor,
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
                                                                onChange={handleTextHighlightColorChange}
                                                            />
                                                        }
                                                        visible={isTextHighlightColorOpen}
                                                        onClickOutside={() => setIsTextHighlightColorOpen(false)}
                                                        interactive={true}
                                                        placement="right"
                                                        className="color-picker-tippy"
                                                    >
                                                        <div className="dinolabsIDETextColorWrapper">
                                                            <FontAwesomeIcon icon={faHighlighter}/>
                                                            <label
                                                                className="dinolabsIDETextColorPicker"
                                                                onClick={() => setIsTextHighlightColorOpen((prev) => !prev)}
                                                                style={{
                                                                    backgroundColor: textHighlightColor,
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
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => execCommand("removeFormat")}
                                                    >
                                                        <FontAwesomeIcon icon={faEraser}/>
                                                    </button>
                                                </Tippy>
                                            </div>
                                        </div>
                                    )
                                }
                            >
                                <button
                                    className="dinolabsIDETextEditingButton"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => toggleModal('more')}
                                    ref={moreButtonRef}
                                >
                                    <FontAwesomeIcon icon={faEllipsisV}/>
                                </button>
                            </Tippy>
                        </Tippy>
                    </div>
                </div>
            </div>

            <div className="dinolabsIDETextEditorWrapper"> 
                <div className="dinolabsIDETextTipMargin"> </div>
                <div className="dinolabsIDeTextEditorStack"> 
                    <div className="dinoLabsTextEditorTopBar"> </div>
                    <div
                        className="dinolabsIDETextEditor"
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        dangerouslySetInnerHTML={{ __html: initialHTML }}
                        onInput={() => onSave(editorRef.current.innerHTML)}
                    />
                    <div className="dinoLabsTextEditorBottomBar"> </div>
                </div>
                <div className="dinolabsIDETextCommentMargin"> </div>
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
