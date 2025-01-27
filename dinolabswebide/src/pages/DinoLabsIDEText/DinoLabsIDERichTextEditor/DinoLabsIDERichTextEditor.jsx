import React, { useEffect, useRef, useState } from "react";
import "../../../styles/mainStyles/TextEditorStyles/DinoLabsIDERichTextEditor.css";
import DinoLabsIDEColorPicker from "../../DinoLabsIDEColorPicker.jsx";
import { showDialog } from "../../DinoLabsIDEAlert.jsx";
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
    faBorderStyle,
    faIcons,
    faICursor,
    faImage,
    faBorderTopLeft,
    faArrowsDownToLine
} from "@fortawesome/free-solid-svg-icons";
import DinoLabsIDERichTextEditorToolbar from "./DinoLabsIDERichTextEditorToolbar";

export default function DinoLabsIDERichTextEditor({ fileHandle, onSave }) {
    const editorRef = useRef(null);
    const savedRangeRef = useRef(null);
    const imageInputRef = useRef(null);
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

    const [openSpecialCharPicker, setOpenSpecialCharPicker] = useState(false);
    const specialCharButtonRef = useRef(null);
    const [openMathPicker, setOpenMathPicker] = useState(false);
    const [openLatinPicker, setOpenLatinPicker] = useState(false);
    const [openGreekPicker, setOpenGreekPicker] = useState(false);
    const [openPunctuationPicker, setOpenPunctuationPicker] = useState(false);
    const mathSymbols = [
        "∀", "∁", "∂", "∃", "∄", "∅", "∆", "∇", "∈", "∉", "∊", "∋", "∌", "∍", "∎", "∏", "∐", "∑", "−", "±", "÷", "×", "⋅", "√", "∛", "∜", "∝", "∞", "∟", "∠", "∢", "∣", "∧", "∨", "¬", "∩", "∪", "∫", "∬", "∭", "∮", "∯", "∰", "∱", "∲", "∳", "∴", "∵", "∶", "∷", "∸", "∹", "∺", "∻", "∼", "∽", "≁", "≂", "≃", "≄", "≅", "≆", "≇", "≈", "≉", "≊", "≋", "≌", "≍", "≎", "≏", "≐", "≑", "≒", "≓", "≔", "≕", "≖", "≗", "≘", "≙", "≚", "≛", "≜", "≝", "≞", "≟", "≠", "≡", "≤", "≥", "≦", "≧", "≨", "≩", "≪", "≫", "≬", "≭", "≮", "≯", "≰", "≱"
    ];
    const latinSymbols = [
        "À", "Á", "Â", "Ã", "Ä", "Å", "Æ", "Ç", "È", "É", "Ê", "Ë", "Ì", "Í", "Î", "Ï", "Ñ", "Ò", "Ó", "Ô", "Õ", "Ö", "Ù", "Ú", "Û", "Ü", "Ý", "ß", "à", "á", "â", "ã", "ä", "å", "æ", "ç", "è", "é", "ê", "ë", "ì", "í", "î", "ï", "ñ", "ò", "ó", "ô", "õ", "ö", "ù", "ú", "û", "ü", "ý", "ÿ"
    ];
    const greekSymbols = [
        "Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ", "Ν", "Ξ", "Ο", "Π", "Ρ", "Σ", "Τ", "Υ", "Φ", "Χ", "Ψ", "Ω",
        "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω"
    ];
    const punctuationSymbols = [
        "…", "—", "–", "‘", "’", "“", "”", "«", "»", "¡", "¿", "§", "¶", "•", "†", "‡"
    ];

    const [openFormElementsPicker, setOpenFormElementsPicker] = useState(false);
    const [formElementFontColor, setFormElementFontColor] = useState("#000000");
    const [isFormElementFontColorOpen, setIsFormElementFontColorOpen] = useState(false);
    const [formElementBackgroundColor, setFormElementBackgroundColor] = useState("#ffffff");
    const [isFormElementBackgroundColorOpen, setIsFormElementBackgroundColorOpen] = useState(false);
    const [formElementBorderColor, setFormElementBorderColor] = useState("#cccccc");
    const [isFormElementBorderColorOpen, setIsFormElementBorderColorOpen] = useState(false);
    const [formElementBorderWidth, setFormElementBorderWidth] = useState("1px");
    const formElementsButtonRef = useRef(null);
    const [formElementFontSize, setFormElementFontSize] = useState("16px");
    const [formElementFontWeight, setFormElementFontWeight] = useState("normal");

    const styleMap = {
        H1: { fontSize: "32px", fontWeight: "bold" },
        H2: { fontSize: "24px", fontWeight: "bold" },
        H3: { fontSize: "20px", fontWeight: "bold" },
        P:  { fontSize: "16px", fontWeight: "normal" }
    };

    useEffect(() => {
        const handleAlertShow = () => closeAllMenus();
        window.addEventListener("alertWillShow", handleAlertShow);
        return () => window.removeEventListener("alertWillShow", handleAlertShow);
    }, []);

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
        setOpenSpecialCharPicker(false);
        setOpenMathPicker(false);
        setOpenLatinPicker(false);
        setOpenGreekPicker(false);
        setOpenPunctuationPicker(false);
        setOpenFormElementsPicker(false);
        setIsFormElementFontColorOpen(false);
        setIsFormElementBackgroundColorOpen(false);
        setIsFormElementBorderColorOpen(false);
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

    function getSelectedTableCells() {
        restoreSelection();
        const selection = window.getSelection();
        if (!selection.rangeCount) return [];
        const range = selection.getRangeAt(0);
        const allCells = [...editorRef.current.querySelectorAll("td, th")];
        return allCells.filter(cell => range.intersectsNode(cell));
    }

    function getSelectedFormElements() {
        restoreSelection();
        const selection = window.getSelection();
        if (!selection.rangeCount) return [];
        const range = selection.getRangeAt(0);
        const allFormEls = [...editorRef.current.querySelectorAll("input, select, textarea")];
        return allFormEls.filter(el => range.intersectsNode(el));
    }

    function applyExistingTableStyle({
        borderColor,
        borderWidth,
        backgroundColor,
        fontColor
    }) {
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

    function applyExistingFormElementStyle({
        fontColor,
        backgroundColor,
        borderColor,
        borderWidth,
        fontSize,
        fontWeight
    }) {
        const inputs = getSelectedFormElements();
        if (!inputs.length) return;
        inputs.forEach(inp => {
            if (fontColor !== undefined) inp.style.color = fontColor;
            if (backgroundColor !== undefined) inp.style.backgroundColor = backgroundColor;
            if (borderColor !== undefined) inp.style.borderColor = borderColor;
            if (borderWidth !== undefined) inp.style.borderWidth = borderWidth;
            if (fontSize !== undefined) inp.style.fontSize = fontSize;
            if (fontWeight !== undefined) inp.style.fontWeight = fontWeight;
        });
        onSave(editorRef.current.innerHTML);
    }

    function handleFontStyleChange(e) {
        restoreSelection();
        setFontStyle(e.target.value);
        const paragraphs = getParagraphsInSelection();
        const styleObj = styleMap[e.target.value] || styleMap["P"];
        paragraphs.forEach(p => {
            Object.entries(styleObj).forEach(([prop, val]) => {
                p.style[prop] = val;
            });
        });
    }

    function getParagraphsInSelection() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return [];
        const range = selection.getRangeAt(0);

        const walker = document.createTreeWalker(
            range.commonAncestorContainer,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: node => (range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
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

    function applyFontFamily(font) {
        restoreSelection();
        document.execCommand("styleWithCSS", false, true);
        document.execCommand("fontName", false, font);
    }

    function handleFontTypeChange(e) {
        restoreSelection();
        setFontType(e.target.value);
        applyFontFamily(e.target.value);
    }

    function handleLineSpacing(spacing) {
        restoreSelection();
        document.execCommand("formatBlock", false, "p");
        applyLineSpacing(spacing);
        closeAllMenus();
    }

    function applyLineSpacing(spacing) {
        const paragraphs = getParagraphsInSelection();
        paragraphs.forEach(p => {
            p.style.lineHeight = spacing;
        });
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

    function applyFontSize(size) {
        restoreSelection();
        execCommand("fontSize", 7);
        const fontElements = editorRef.current.getElementsByTagName("font");
        for (let i = 0; i < fontElements.length; i++) {
            if (fontElements[i].size === "7") {
                fontElements[i].removeAttribute("size");
                fontElements[i].style.fontSize = `${size}px`;
            }
        }
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
                setOpenSpecialCharPicker(false);
                setOpenMathPicker(false);
                setOpenLatinPicker(false);
                setOpenGreekPicker(false);
                setOpenPunctuationPicker(false);
                setOpenFormElementsPicker(false);
                setIsFormElementFontColorOpen(false);
                setIsFormElementBackgroundColorOpen(false);
                setIsFormElementBorderColorOpen(false);
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
        } catch {}
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
            resizer.style.right = "-6px";
            resizer.style.bottom = "-6px";
            resizer.style.zIndex = 2;
            resizer.style.background = "rgba(0,0,0,0.4)";
            resizer.style.borderRadius = "50%";

            cell.style.position = "relative";
            let startX;
            let startWidth;
            const onMouseDown = e => {
                e.preventDefault();
                e.stopPropagation();
                startX = e.pageX;
                startWidth = parseInt(document.defaultView.getComputedStyle(cell).width, 10);
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            };
            const onMouseMove = e => {
                const width = startWidth + (e.pageX - startX);
                cell.style.width = `${width}px`;
            };
            const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };
            resizer.addEventListener("mousedown", onMouseDown);
            cell.appendChild(resizer);
        });
    }

    function handleRemoveFormatting() {
        restoreSelection();
        document.execCommand("removeFormat");
        const cells = getSelectedTableCells();
        if (!cells.length) {
            onSave(editorRef.current.innerHTML);
            return;
        }
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

    function insertSpecialCharacter(character) {
        restoreSelection();
        document.execCommand("insertText", false, character);
        onSave(editorRef.current.innerHTML);
    }

    function insertFormElement(type) {
        restoreSelection();
        const input = document.createElement("input");
        input.type = type;
        input.style.color = formElementFontColor;
        input.style.backgroundColor = formElementBackgroundColor;
        input.style.borderWidth = formElementBorderWidth;
        input.style.borderColor = formElementBorderColor;
        input.style.borderStyle = "solid";
        input.style.margin = "2px";
        input.style.padding = "2px";
        input.style.fontSize = formElementFontSize;
        input.style.fontWeight = formElementFontWeight;

        if (type === "text") {
            input.placeholder = "Enter text";
        } else if (type === "number") {
            input.placeholder = "Enter number";
        }

        document.execCommand("insertHTML", false, input.outerHTML);
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

    function handleWordCount() {
        const text = editorRef.current.innerText.trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        showDialog({
            title: "Word Count",
            message: "Your word count is: " + wordCount
        });
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = evt => {
                insertResizableImage(evt.target.result, file.name);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = "";
    }

    function insertResizableImage(imgSrc, alt) {
        restoreSelection();
        const wrapper = document.createElement("span");
        wrapper.contentEditable = false;
        wrapper.style.display = "inline-block";
        wrapper.style.position = "relative";
        wrapper.style.margin = "5px";

        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = alt || "Uploaded image";
        img.style.display = "block";
        img.style.width = "300px";
        img.style.height = "auto";
        img.style.cursor = "default";

        const resizer = document.createElement("div");
        resizer.style.position = "absolute";
        resizer.style.right = "0";
        resizer.style.bottom = "0";
        resizer.style.width = "10px";
        resizer.style.height = "10px";
        resizer.style.cursor = "se-resize";
        resizer.style.background = "#000";

        let isResizing = false;
        let originalWidth = 0;
        let originalX = 0;

        resizer.onmousedown = function(e) {
            isResizing = true;
            originalWidth = img.offsetWidth;
            originalX = e.pageX;
            e.preventDefault();
        };

        document.addEventListener("mousemove", function(e) {
            if (!isResizing) return;
            const width = originalWidth + (e.pageX - originalX);
            if (width > 50) {
                img.style.width = width + "px";
            }
        });

        document.addEventListener("mouseup", function() {
            isResizing = false;
            onSave(editorRef.current.innerHTML);
        });

        wrapper.appendChild(img);
        wrapper.appendChild(resizer);

        const range = window.getSelection().getRangeAt(0);
        range.deleteContents();
        range.insertNode(wrapper);
        onSave(editorRef.current.innerHTML);
    }

    if (error) {
        return null;
    }

    return (
        <div className="dinolabsIDETextWrapper">
            <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                style={{ display: "none" }}
                onChange={handleImageUpload}
            />
            <DinoLabsIDERichTextEditorToolbar
                fileName={fileName}
                openModal={openModal}
                fileModalRef={fileModalRef}
                editModalRef={editModalRef}
                insertModalRef={insertModalRef}
                formatModalRef={formatModalRef}
                toolsModalRef={toolsModalRef}
                fileButtonRef={fileButtonRef}
                editButtonRef={editButtonRef}
                insertButtonRef={insertButtonRef}
                formatButtonRef={formatButtonRef}
                toolsButtonRef={toolsButtonRef}
                alignButtonRef={alignButtonRef}
                alignModalRef={alignModalRef}
                lineSpacingButtonRef={lineSpacingButtonRef}
                lineSpacingModalRef={lineSpacingModalRef}
                listButtonRef={listButtonRef}
                listModalRef={listModalRef}
                moreButtonRef={moreButtonRef}
                moreModalRef={moreModalRef}
                specialCharButtonRef={specialCharButtonRef}
                tableButtonRef={tableButtonRef}
                formElementsButtonRef={formElementsButtonRef}
                restoreSelection={restoreSelection}
                applyExistingTableStyle={applyExistingTableStyle}
                applyExistingFormElementStyle={applyExistingFormElementStyle}
                openTablePicker={openTablePicker}
                setOpenTablePicker={setOpenTablePicker}
                tableRows={tableRows}
                setTableRows={setTableRows}
                tableCols={tableCols}
                setTableCols={setTableCols}
                tableFontColor={tableFontColor}
                setTableFontColor={setTableFontColor}
                isTableFontColorOpen={isTableFontColorOpen}
                setIsTableFontColorOpen={setIsTableFontColorOpen}
                tableBackgroundColor={tableBackgroundColor}
                setTableBackgroundColor={setTableBackgroundColor}
                isTableBackgroundColorOpen={isTableBackgroundColorOpen}
                setIsTableBackgroundColorOpen={setIsTableBackgroundColorOpen}
                tableBorderColor={tableBorderColor}
                setTableBorderColor={setTableBorderColor}
                isTableBorderColorOpen={isTableBorderColorOpen}
                setIsTableBorderColorOpen={setIsTableBorderColorOpen}
                tableBorderWidth={tableBorderWidth}
                setTableBorderWidth={setTableBorderWidth}
                insertTable={insertTable}
                openSpecialCharPicker={openSpecialCharPicker}
                setOpenSpecialCharPicker={setOpenSpecialCharPicker}
                openMathPicker={openMathPicker}
                setOpenMathPicker={setOpenMathPicker}
                openLatinPicker={openLatinPicker}
                setOpenLatinPicker={setOpenLatinPicker}
                openGreekPicker={openGreekPicker}
                setOpenGreekPicker={setOpenGreekPicker}
                openPunctuationPicker={openPunctuationPicker}
                setOpenPunctuationPicker={setOpenPunctuationPicker}
                mathSymbols={mathSymbols}
                latinSymbols={latinSymbols}
                greekSymbols={greekSymbols}
                punctuationSymbols={punctuationSymbols}
                insertSpecialCharacter={insertSpecialCharacter}
                imageInputRef={imageInputRef}
                openFormElementsPicker={openFormElementsPicker}
                setOpenFormElementsPicker={setOpenFormElementsPicker}
                formElementFontColor={formElementFontColor}
                setFormElementFontColor={setFormElementFontColor}
                isFormElementFontColorOpen={isFormElementFontColorOpen}
                setIsFormElementFontColorOpen={setIsFormElementFontColorOpen}
                formElementBackgroundColor={formElementBackgroundColor}
                setFormElementBackgroundColor={setFormElementBackgroundColor}
                isFormElementBackgroundColorOpen={isFormElementBackgroundColorOpen}
                setIsFormElementBackgroundColorOpen={setIsFormElementBackgroundColorOpen}
                formElementBorderColor={formElementBorderColor}
                setFormElementBorderColor={setFormElementBorderColor}
                isFormElementBorderColorOpen={isFormElementBorderColorOpen}
                setIsFormElementBorderColorOpen={setIsFormElementBorderColorOpen}
                formElementBorderWidth={formElementBorderWidth}
                setFormElementBorderWidth={setFormElementBorderWidth}
                formElementFontSize={formElementFontSize}
                setFormElementFontSize={setFormElementFontSize}
                formElementFontWeight={formElementFontWeight}
                setFormElementFontWeight={setFormElementFontWeight}
                insertFormElement={insertFormElement}
                execCommand={execCommand}
                handlePaste={handlePaste}
                handleSelectAll={handleSelectAll}
                handleDownload={handleDownload}
                handlePrint={handlePrint}
                storeSelection={storeSelection}
                toggleModal={toggleModal}
                closeAllMenus={closeAllMenus}
                handleAlign={handleAlign}
                handleWordCount={handleWordCount}
                handleFontStyleChange={handleFontStyleChange}
                handleFontTypeChange={handleFontTypeChange}
                handleLineSpacing={handleLineSpacing}
                decreaseFontSize={decreaseFontSize}
                increaseFontSize={increaseFontSize}
                currentFontSize={currentFontSize}
                fontStyle={fontStyle}
                fontType={fontType}
                textColor={textColor}
                setIsTextColorOpen={setIsTextColorOpen}
                isTextColorOpen={isTextColorOpen}
                textHighlightColor={textHighlightColor}
                setIsTextHighlightColorOpen={setIsTextHighlightColorOpen}
                isTextHighlightColorOpen={isTextHighlightColorOpen}
                handleTextColorChange={handleTextColorChange}
                handleTextHighlightColorChange={handleTextHighlightColorChange}
                handleRemoveFormatting={handleRemoveFormatting}
            />
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
                        onInput={() => {
                            onSave(editorRef.current.innerHTML);
                        }}
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
