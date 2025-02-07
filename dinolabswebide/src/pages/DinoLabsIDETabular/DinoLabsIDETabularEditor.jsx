import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useLayoutEffect
} from "react";
import { VariableSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import "../../styles/mainStyles/DinoLabsIDEContent.css";
import DinoLabsIDETabularEditorToolbar from "./DinoLabsIDETabularEditorToolbar";
import { showDialog } from "../DinoLabsIDEAlert.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

function sumRange(arr, from, to) {
    let total = 0;
    for (let i = from; i < to; i++) {
        total += arr[i] || 0;
    }
    return total;
}

function getColumnLabel(colIndex) {
    let label = "";
    colIndex++;
    while (colIndex > 0) {
        colIndex--;
        label = String.fromCharCode(65 + (colIndex % 26)) + label;
        colIndex = Math.floor(colIndex / 26);
    }
    return label;
}

export default function PinnedHeadersSheet({ fileHandle }) {
    const [tableData, setTableData] = useState({});
    const tableDataRef = useRef(tableData);
    useEffect(() => {
        tableDataRef.current = tableData;
    }, [tableData]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [keybindLoading, setKeybindLoading] = useState(false);
    const DATA_ROW_COUNT = 1000;
    const DATA_COL_COUNT = 100;
    const [activeCell, setActiveCell] = useState({ row: null, col: null });
    const [cellEditingValue, setCellEditingValue] = useState("");
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [clipboardData, setClipboardData] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);
    const [openModal, setOpenModal] = useState(null);
    const toggleModal = (modalName) => {
        setOpenModal((prev) => (prev === modalName ? null : modalName));
    };
    const formatModalRef = useRef(null);
    const formatButtonRef = useRef(null);
    const toolsModalRef = useRef(null);
    const toolsButtonRef = useRef(null);
    const storedSelectionRef = useRef(null);
    const storeSelection = () => {
        storedSelectionRef.current = selection;
    };
    const [cellFormats, setCellFormats] = useState({});
    const [saveStatus, setSaveStatus] = useState("idle");
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [replaceTerm, setReplaceTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [searchPanelPos, setSearchPanelPos] = useState({ x: 100, y: 100 });
    const [searchPanelDragging, setSearchPanelDragging] = useState(false);
    const [searchPanelOffset, setSearchPanelOffset] = useState({ x: 0, y: 0 });
    const searchPanelRef = useRef(null);
    const [selection, setSelection] = useState(null);
    const [skipClear, setSkipClear] = useState(false);
    const [cellDrag, setCellDrag] = useState({
        active: false,
        startRow: null,
        startCol: null,
        startX: 0,
        startY: 0,
        selecting: false
    });
    const [selectionResize, setSelectionResize] = useState({
        active: false,
        handle: null,
        startX: 0,
        startY: 0,
        initialSelection: null
    });
    const [resizing, setResizing] = useState({
        active: false,
        type: null,
        index: null,
        startPos: 0,
        startSize: 0
    });
    const DEFAULT_ROW_HEIGHT = 24;
    const DEFAULT_COL_WIDTH = 120;
    const [rowHeights, setRowHeights] = useState(
        Array.from({ length: DATA_ROW_COUNT }, () => DEFAULT_ROW_HEIGHT)
    );
    const [colWidths, setColWidths] = useState(
        Array.from({ length: DATA_COL_COUNT }, () => DEFAULT_COL_WIDTH)
    );
    const gridContainerRef = useRef(null);
    const tableWrapperContainerRef = useRef(null);
    const dataGridRef = useRef(null);
    const scrollPos = useRef({ left: 0, top: 0 });
    const columnHeaderRef = useRef(null);
    const rowHeaderRef = useRef(null);
    const [headerDrag, setHeaderDrag] = useState(null);
    const [pageZoom, setPageZoom] = useState(100);
    const [fontType, setFontType] = useState("Arial");
    const [textColor, setTextColor] = useState("#f5f5f5");
    const [textHighlightColor, setTextHighlightColor] = useState("transparent");
    const [isColorOpen, setIsColorOpen] = useState(false);
    const [isHighlightColorOpen, setIsHighlightColorOpen] = useState(false);
    const alignModalRef = useRef(null);
    const alignButtonRef = useRef(null);
    const moreModalRef = useRef(null);
    const moreButtonRef = useRef(null);

    function inlineAllStyles(element) {
        const computedStyle = window.getComputedStyle(element);
        let styleString = "";
        for (let i = 0; i < computedStyle.length; i++) {
            const prop = computedStyle[i];
            styleString += `${prop}: ${computedStyle.getPropertyValue(prop)}; `;
        }
        element.setAttribute("style", styleString);
        for (let i = 0; i < element.children.length; i++) {
            inlineAllStyles(element.children[i]);
        }
    }

    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    const decreaseZoom = () => setPageZoom(prev => Math.max(prev - 10, 10));
    const increaseZoom = () => setPageZoom(prev => prev + 10);

    const handleFontTypeChange = (e) => {
        const newFontType = e.target.value;
        setFontType(newFontType);
        const sel = selection || storedSelectionRef.current || { top: 0, left: 0, bottom: DATA_ROW_COUNT - 1, right: DATA_COL_COUNT - 1 };
        setCellFormats((prevFormats) => {
            const newFormats = { ...prevFormats };
            for (let r = sel.top; r <= sel.bottom; r++) {
                for (let c = sel.left; c <= sel.right; c++) {
                    const key = `${r},${c}`;
                    const current = newFormats[key] || {};
                    newFormats[key] = { ...current, fontFamily: newFontType };
                }
            }
            return newFormats;
        });
    };

    const execCommand = (command) => {
        const sel = selection || storedSelectionRef.current || { top: 0, left: 0, bottom: DATA_ROW_COUNT - 1, right: DATA_COL_COUNT - 1 };
        setCellFormats((prev) => {
            const newFormats = { ...prev };
            for (let r = sel.top; r <= sel.bottom; r++) {
                for (let c = sel.left; c <= sel.right; c++) {
                    const key = `${r},${c}`;
                    const current = newFormats[key] || {};
                    switch (command) {
                        case "bold":
                            newFormats[key] = { ...current, fontWeight: current.fontWeight === "bold" ? "normal" : "bold" };
                            break;
                        case "italic":
                            newFormats[key] = { ...current, fontStyle: current.fontStyle === "italic" ? "normal" : "italic" };
                            break;
                        case "underline":
                            newFormats[key] = { ...current, textDecoration: current.textDecoration === "underline" ? "none" : "underline" };
                            break;
                        case "strikeThrough":
                            newFormats[key] = { ...current, textDecoration: current.textDecoration === "line-through" ? "none" : "line-through" };
                            break;
                        default:
                            break;
                    }
                }
            }
            return newFormats;
        });
    };

    const handleColorChange = (color) => {
        setTextColor(color);
        const sel = selection || storedSelectionRef.current || { top: 0, left: 0, bottom: DATA_ROW_COUNT - 1, right: DATA_COL_COUNT - 1 };
        setCellFormats((prevFormats) => {
             const newFormats = { ...prevFormats };
             for (let r = sel.top; r <= sel.bottom; r++) {
                 for (let c = sel.left; c <= sel.right; c++) {
                     const key = `${r},${c}`;
                     const current = newFormats[key] || {};
                     newFormats[key] = { ...current, color: color };
                 }
             }
             return newFormats;
        });
    };

    const handleHighlightColorChange = (color) => {
        setTextHighlightColor(color);
        const sel = selection || storedSelectionRef.current || { top: 0, left: 0, bottom: DATA_ROW_COUNT - 1, right: DATA_COL_COUNT - 1 };
        setCellFormats((prevFormats) => {
             const newFormats = { ...prevFormats };
             for (let r = sel.top; r <= sel.bottom; r++) {
                 for (let c = sel.left; c <= sel.right; c++) {
                     const key = `${r},${c}`;
                     const current = newFormats[key] || {};
                     newFormats[key] = { ...current, backgroundColor: color };
                 }
             }
             return newFormats;
        });
    };

    const handleRemoveFormatting = () => {
        const sel = selection || storedSelectionRef.current || { top: 0, left: 0, bottom: DATA_ROW_COUNT - 1, right: DATA_COL_COUNT - 1 };
        setCellFormats((prev) => {
            const newFormats = { ...prev };
            for (let r = sel.top; r <= sel.bottom; r++) {
                for (let c = sel.left; c <= sel.right; c++) {
                    const key = `${r},${c}`;
                    newFormats[key] = {};
                }
            }
            return newFormats;
        });
    };

    const restoreSelection = () => {
        if (storedSelectionRef.current) {
            setSelection(storedSelectionRef.current);
            storedSelectionRef.current = null;
        }
    };

    useEffect(() => {
        async function loadFile() {
            try {
                const file =
                    typeof fileHandle?.getFile === "function"
                        ? await fileHandle.getFile()
                        : fileHandle;
                if (!file) {
                    setLoading(false);
                    return;
                }
                const ext = file.name.split(".").pop().toLowerCase();
                if (!["csv"].includes(ext)) {
                    throw new Error(`Unsupported file type: .${ext}`);
                }
                const text = await file.text();
                const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
                const data = {};
                lines.forEach((line, r) => {
                    const cells = line.split(",");
                    cells.forEach((cell, c) => {
                        if (cell.trim()) {
                            data[`${r},${c}`] = cell.trim();
                        }
                    });
                });
                setTableData(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        if (fileHandle) {
            loadFile();
        } else {
            setLoading(false);
        }
    }, [fileHandle]);

    async function handleGlobalKeyDown(e) {
        const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
        const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
        if (cmdOrCtrl) {
            const key = e.key.toLowerCase();
            switch (key) {
                case "s":
                    e.preventDefault();
                    setKeybindLoading(true);
                    try {
                        await Promise.resolve(handleSave());
                    } finally {
                        setKeybindLoading(false);
                    }
                    break;
                case "p":
                    e.preventDefault();
                    setKeybindLoading(true);
                    try {
                        await Promise.resolve(handlePrint());
                    } finally {
                        setKeybindLoading(false);
                    }
                    break;
                case "a":
                    e.preventDefault();
                    setKeybindLoading(true);
                    try {
                        await Promise.resolve(handleSelectAll());
                    } finally {
                        setKeybindLoading(false);
                    }
                    break;
                case "x":
                    e.preventDefault();
                    if (selection) {
                        setKeybindLoading(true);
                        try {
                            await Promise.resolve(handleCut());
                        } finally {
                            setKeybindLoading(false);
                        }
                    }
                    break;
                case "c":
                    e.preventDefault();
                    if (selection) {
                        setKeybindLoading(true);
                        try {
                            await Promise.resolve(handleCopy());
                        } finally {
                            setKeybindLoading(false);
                        }
                    }
                    break;
                case "v":
                    e.preventDefault();
                    if (selection) {
                        setKeybindLoading(true);
                        try {
                            await Promise.resolve(handlePaste());
                        } finally {
                            setKeybindLoading(false);
                        }
                    }
                    break;
                case "z":
                    e.preventDefault();
                    setKeybindLoading(true);
                    try {
                        if (e.shiftKey) {
                            await Promise.resolve(handleRedo());
                        } else {
                            await Promise.resolve(handleUndo());
                        }
                    } finally {
                        setKeybindLoading(false);
                    }
                    break;
                case "y":
                    e.preventDefault();
                    setKeybindLoading(true);
                    try {
                        await Promise.resolve(handleRedo());
                    } finally {
                        setKeybindLoading(false);
                    }
                    break;
                case "f":
                    e.preventDefault();
                    setKeybindLoading(true);
                    try {
                        setShowSearchPanel(true);
                    } finally {
                        setKeybindLoading(false);
                    }
                    break;
                default:
                    break;
            }
        }
    }

    const handleKeyDownRef = useRef(handleGlobalKeyDown);
    useEffect(() => {
        handleKeyDownRef.current = handleGlobalKeyDown;
    });
    useEffect(() => {
        function keydownWrapper(e) {
            return handleKeyDownRef.current(e);
        }
        document.addEventListener("keydown", keydownWrapper, true);
        return () => {
            document.removeEventListener("keydown", keydownWrapper, true);
        };
    }, []);

    function pushToUndoStack(oldData) {
        setUndoStack((prev) => [...prev, oldData]);
        setRedoStack([]);
    }

    function commitActiveCellIfNeeded() {
        if (activeCell.row !== null && activeCell.col !== null) {
            const key = `${activeCell.row},${activeCell.col}`;
            const oldVal = tableDataRef.current[key] || "";
            if (oldVal !== cellEditingValue) {
                pushToUndoStack(tableDataRef.current);
                setTableData((prev) => ({
                    ...prev,
                    [key]: cellEditingValue
                }));
            }
            setActiveCell({ row: null, col: null });
        }
    }

    function handleSave() {
        if (!fileHandle) return;
        setSaveStatus("saving");
        (async () => {
            try {
                const csv = generateCSV(tableDataRef.current);
                const writable = await fileHandle.createWritable();
                await writable.write(csv);
                await writable.close();
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 1500);
            } catch (err) {
                setSaveStatus("idle");
            }
        })();
    }

    function generateCSV(data) {
        let maxRow = 0;
        let maxCol = 0;
        Object.keys(data).forEach((key) => {
            const [r, c] = key.split(",").map(Number);
            if (r > maxRow) maxRow = r;
            if (c > maxCol) maxCol = c;
        });
        let lines = [];
        for (let r = 0; r <= maxRow; r++) {
            let rowCells = [];
            for (let c = 0; c <= maxCol; c++) {
                rowCells.push(data[`${r},${c}`] || "");
            }
            lines.push(rowCells.join(","));
        }
        return lines.join("\r\n");
    }

    async function handleDownload() {
        setOpenMenu(null);
        const result = await showDialog({
            title: "Download as...",
            message: "Select a file type to download this file as.",
            inputs: [
                {
                    name: "fileType",
                    type: "select",
                    options: [
                        { label: "CSV (.csv)", value: "csv" }
                    ],
                },
            ],
            showCancel: true,
        });
        if (result) {
            const fileName =
                fileHandle && fileHandle.name
                    ? fileHandle.name.replace(/\.[^/.]+$/, "")
                    : "Untitled";
            const content = generateCSV(tableDataRef.current);
            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            linkDownload(url, fileName + ".csv");
        }
    }

    function linkDownload(url, fileName) {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    }

    function handlePrint() {
        window.print();
    }

    function handleCut() {
        commitActiveCellIfNeeded();
        if (!selection) return;
        const clip = {};
        for (let r = selection.top; r <= selection.bottom; r++) {
            for (let c = selection.left; c <= selection.right; c++) {
                const key = `${r},${c}`;
                clip[key] = tableDataRef.current[key] || "";
            }
        }
        setClipboardData(clip);
        const newData = { ...tableDataRef.current };
        for (let r = selection.top; r <= selection.bottom; r++) {
            for (let c = selection.left; c <= selection.right; c++) {
                delete newData[`${r},${c}`];
            }
        }
        pushToUndoStack(tableDataRef.current);
        setTableData(newData);
        setSelection((old) => (old ? { ...old } : null));
    }

    function handleCopy() {
        commitActiveCellIfNeeded();
        if (!selection) return;
        const clip = {};
        for (let r = selection.top; r <= selection.bottom; r++) {
            for (let c = selection.left; c <= selection.right; c++) {
                const key = `${r},${c}`;
                clip[key] = tableDataRef.current[key] || "";
            }
        }
        setClipboardData(clip);
    }

    async function handlePaste() {
        commitActiveCellIfNeeded();
        if (!selection || !clipboardData) return;
        const newData = { ...tableDataRef.current };
        let minRow = Infinity;
        let maxRow = -Infinity;
        let minCol = Infinity;
        let maxCol = -Infinity;
        Object.keys(clipboardData).forEach((key) => {
            const [r, c] = key.split(",").map(Number);
            if (r < minRow) minRow = r;
            if (r > maxRow) maxRow = r;
            if (c < minCol) minCol = c;
            if (c > maxCol) maxCol = c;
        });
        const clipRowSpan = maxRow - minRow + 1;
        const clipColSpan = maxCol - minCol + 1;
        const destRowStart = selection.top;
        const destColStart = selection.left;
        let shouldAlert = false;
        for (let r = 0; r < clipRowSpan; r++) {
            for (let c = 0; c < clipColSpan; c++) {
                const destKey = `${destRowStart + r},${destColStart + c}`;
                const destVal = (tableDataRef.current[destKey] || "").trim();
                const srcVal =
                    (clipboardData[`${minRow + r},${minCol + c}`] || "").trim();
                if (destVal !== "" && destVal !== srcVal) {
                    shouldAlert = true;
                    break;
                }
            }
            if (shouldAlert) break;
        }
        if (shouldAlert) {
            const result = await showDialog({
                title: "System Alert",
                message:
                    "The data being pasted over will be replaced. Do you want to continue?",
                showCancel: true
            });
            if (result === null) return;
        }
        for (let r = 0; r < clipRowSpan; r++) {
            for (let c = 0; c < clipColSpan; c++) {
                const srcKey = `${minRow + r},${minCol + c}`;
                const destKey = `${destRowStart + r},${destColStart + c}`;
                if (clipboardData[srcKey] !== undefined) {
                    newData[destKey] = clipboardData[srcKey];
                } else {
                    delete newData[destKey];
                }
            }
        }
        pushToUndoStack(tableDataRef.current);
        setTableData(newData);
        setSelection((old) => (old ? { ...old } : null));
        setActiveCell({ row: null, col: null });
        if (document.activeElement) document.activeElement.blur();
    }

    function handleUndo() {
        commitActiveCellIfNeeded();
        if (undoStack.length === 0) return;
        const prevData = undoStack[undoStack.length - 1];
        setUndoStack((s) => s.slice(0, s.length - 1));
        setRedoStack((r) => [...r, tableDataRef.current]);
        setTableData(prevData);
        setSelection((old) => (old ? { ...old } : null));
    }

    function handleRedo() {
        commitActiveCellIfNeeded();
        if (redoStack.length === 0) return;
        const nextData = redoStack[redoStack.length - 1];
        setRedoStack((r) => r.slice(0, r.length - 1));
        setUndoStack((s) => [...s, tableDataRef.current]);
        setTableData(nextData);
        setSelection((old) => (old ? { ...old } : null));
    }

    function handleSelectAll() {
        commitActiveCellIfNeeded();
        setSelection({
            top: 0,
            left: 0,
            bottom: DATA_ROW_COUNT - 1,
            right: DATA_COL_COUNT - 1
        });
    }

    function highlightAll(term) {
        commitActiveCellIfNeeded();
        if (!term) {
            setSearchResults([]);
            setCurrentResultIndex(-1);
            return;
        }
        const newResults = [];
        const compareTerm = caseSensitive ? term : term.toLowerCase();
        Object.keys(tableDataRef.current).forEach((key) => {
            const originalVal = tableDataRef.current[key];
            if (!originalVal) return;
            const compareVal = caseSensitive ? originalVal : originalVal.toLowerCase();
            let startIndex = 0;
            while (true) {
                const foundPos = compareVal.indexOf(compareTerm, startIndex);
                if (foundPos === -1) break;
                const [r, c] = key.split(",").map(Number);
                newResults.push({
                    row: r,
                    col: c,
                    indexInCell: foundPos,
                    length: term.length
                });
                startIndex = foundPos + term.length;
            }
        });
        setSearchResults(newResults);
        if (newResults.length > 0) {
            setCurrentResultIndex(0);
        } else {
            setCurrentResultIndex(-1);
        }
    }

    function goToNext() {
        if (!searchResults.length) return;
        setCurrentResultIndex((prev) => (prev + 1) % searchResults.length);
    }

    function goToPrevious() {
        if (!searchResults.length) return;
        setCurrentResultIndex(
            (prev) => (prev - 1 + searchResults.length) % searchResults.length
        );
    }

    function replaceCurrent() {
        commitActiveCellIfNeeded();
        if (currentResultIndex < 0 || currentResultIndex >= searchResults.length) return;
        const result = searchResults[currentResultIndex];
        const oldVal = tableDataRef.current[`${result.row},${result.col}`] || "";
        const before = oldVal.slice(0, result.indexInCell);
        const after = oldVal.slice(result.indexInCell + result.length);
        const newVal = before + replaceTerm + after;
        pushToUndoStack(tableDataRef.current);
        const updated = { ...tableDataRef.current };
        updated[`${result.row},${result.col}`] = newVal;
        setTableData(updated);
        setTimeout(() => {
            highlightAll(searchTerm);
        }, 0);
    }

    function replaceAll() {
        commitActiveCellIfNeeded();
        if (!searchResults.length) return;
        pushToUndoStack(tableDataRef.current);
        const updated = { ...tableDataRef.current };
        for (const result of searchResults) {
            const key = `${result.row},${result.col}`;
            const oldVal = updated[key] || "";
            if (!oldVal) continue;
            updated[key] = caseSensitive
                ? oldVal.replaceAll(searchTerm, replaceTerm)
                : doCaseInsensitiveReplace(oldVal, searchTerm, replaceTerm);
        }
        setTableData(updated);
        setTimeout(() => {
            highlightAll(searchTerm);
        }, 0);
    }

    function doCaseInsensitiveReplace(sourceStr, searchStr, replaceStr) {
        const lowerSrc = sourceStr.toLowerCase();
        const lowerSearch = searchStr.toLowerCase();
        let idx = 0;
        let result = "";
        let lastPos = 0;
        while ((idx = lowerSrc.indexOf(lowerSearch, lastPos)) !== -1) {
            result += sourceStr.slice(lastPos, idx) + replaceStr;
            lastPos = idx + searchStr.length;
        }
        result += sourceStr.slice(lastPos);
        return result;
    }

    useEffect(() => {
        function onKeyDown(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === "f") {
                e.preventDefault();
                setShowSearchPanel(true);
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    function handleSearchPanelMouseDown(e) {
        if (e.target !== searchPanelRef.current) return;
        setSearchPanelDragging(true);
        setSearchPanelOffset({
            x: e.clientX - searchPanelPos.x,
            y: e.clientY - searchPanelPos.y
        });
    }

    function handleSearchPanelMouseMove(e) {
        if (!searchPanelDragging) return;
        const newX = e.clientX - searchPanelOffset.x;
        const newY = e.clientY - searchPanelOffset.y;
        setSearchPanelPos({ x: newX, y: newY });
    }

    function handleSearchPanelMouseUp() {
        setSearchPanelDragging(false);
    }

    useEffect(() => {
        function onMouseMove(e) {
            handleSearchPanelMouseMove(e);
        }
        function onMouseUp() {
            handleSearchPanelMouseUp();
        }
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [searchPanelDragging, searchPanelOffset]);

    function handleCellDoubleClick(rowIndex, colIndex) {
        commitActiveCellIfNeeded();
        setActiveCell({ row: rowIndex, col: colIndex });
        setCellEditingValue(tableDataRef.current[`${rowIndex},${colIndex}`] || "");
    }

    function handleCellMouseDown(rowIndex, colIndex, e) {
        if (e.button !== 0) return;
        if (e.shiftKey && activeCell.row !== null && activeCell.col !== null) {
            setSelection({
                top: Math.min(activeCell.row, rowIndex),
                left: Math.min(activeCell.col, colIndex),
                bottom: Math.max(activeCell.row, rowIndex),
                right: Math.max(activeCell.col, colIndex)
            });
            setActiveCell({ row: rowIndex, col: colIndex });
            setCellEditingValue(tableDataRef.current[`${rowIndex},${colIndex}`] || "");
            return;
        }
        if (!(activeCell.row === rowIndex && activeCell.col === colIndex)) {
            commitActiveCellIfNeeded();
        }
        setCellDrag({
            active: true,
            startRow: rowIndex,
            startCol: colIndex,
            startX: e.clientX,
            startY: e.clientY,
            selecting: false
        });
    }

    function handleCellMouseUp(rowIndex, colIndex, e) {
        setCellDrag((prev) => {
            if (prev.active && !prev.selecting) {
                if (
                    selection &&
                    rowIndex >= selection.top &&
                    rowIndex <= selection.bottom &&
                    colIndex >= selection.left &&
                    colIndex <= selection.right
                ) {
                    setSelection(null);
                    setActiveCell({ row: null, col: null });
                    setCellEditingValue("");
                } else {
                    setSelection({
                        top: rowIndex,
                        left: colIndex,
                        bottom: rowIndex,
                        right: colIndex
                    });
                    setActiveCell({ row: rowIndex, col: colIndex });
                    setCellEditingValue(tableDataRef.current[`${rowIndex},${colIndex}`] || "");
                }
            }
            return {
                active: false,
                startRow: null,
                startCol: null,
                startX: 0,
                startY: 0,
                selecting: false
            };
        });
    }

    function onCellValueChange(e) {
        setCellEditingValue(e.target.value);
    }

    function handleCellBlur(e) {
        if (e.relatedTarget) {
            const nextCell = e.relatedTarget.closest(".dinolabsIDETableCell");
            const thisCell = e.target.closest(".dinolabsIDETableCell");
            if (nextCell === thisCell) {
                return;
            }
        }
        commitActiveCellIfNeeded();
    }

    function isCellInSelection(rowIndex, colIndex) {
        if (!selection) return false;
        return (
            rowIndex >= selection.top &&
            rowIndex <= selection.bottom &&
            colIndex >= selection.left &&
            colIndex <= selection.right
        );
    }

    function isCellHighlightedBySearch(rowIndex, columnIndex) {
        const foundIndexes = searchResults.filter(
            (res) => res.row === rowIndex && res.col === columnIndex
        );
        if (!foundIndexes.length) return false;
        if (
            currentResultIndex >= 0 &&
            currentResultIndex < searchResults.length &&
            searchResults[currentResultIndex].row === rowIndex &&
            searchResults[currentResultIndex].col === columnIndex
        ) {
            return "current";
        }
        return "matched";
    }

    function moveActiveCellHorizontally(offset) {
        if (activeCell.row === null || activeCell.col === null) return;
        let newCol = activeCell.col + offset;
        if (newCol < 0) newCol = 0;
        if (newCol >= DATA_COL_COUNT) newCol = DATA_COL_COUNT - 1;
        setActiveCell({ row: activeCell.row, col: newCol });
        const newKey = `${activeCell.row},${newCol}`;
        setCellEditingValue(tableDataRef.current[newKey] || "");
        setSelection({
            top: activeCell.row,
            left: newCol,
            bottom: activeCell.row,
            right: newCol
        });
    }

    function moveActiveCellVertically(offset) {
        if (activeCell.row === null || activeCell.col === null) return;
        let newRow = activeCell.row + offset;
        if (newRow < 0) newRow = 0;
        if (newRow >= DATA_ROW_COUNT) newRow = DATA_ROW_COUNT - 1;
        setActiveCell({ row: newRow, col: activeCell.col });
        const newKey = `${newRow},${activeCell.col}`;
        setCellEditingValue(tableDataRef.current[newKey] || "");
        setSelection({
            top: newRow,
            left: activeCell.col,
            bottom: newRow,
            right: activeCell.col
        });
    }

    const handleAlign = (alignCommand) => {
        const alignMap = {
            justifyLeft: "left",
            justifyCenter: "center",
            justifyRight: "right"
        };
        const textAlign = alignMap[alignCommand];
        const sel = selection || storedSelectionRef.current || { top: 0, left: 0, bottom: DATA_ROW_COUNT - 1, right: DATA_COL_COUNT - 1 };
        setCellFormats((prev) => {
            const newFormats = { ...prev };
            for (let r = sel.top; r <= sel.bottom; r++) {
                for (let c = sel.left; c <= sel.right; c++) {
                    const key = `${r},${c}`;
                    newFormats[key] = { ...(newFormats[key] || {}), textAlign };
                }
            }
            return newFormats;
        });
        setOpenModal(null);
    };

    const handleWordCount = async () => {
        let count = 0;
        if (selection || storedSelectionRef.current) {
            const sel = selection || storedSelectionRef.current;
            for (let r = sel.top; r <= sel.bottom; r++) {
                for (let c = sel.left; c <= sel.right; c++) {
                    const key = `${r},${c}`;
                    if (tableData[key] && tableData[key].trim() !== "") {
                        count++;
                    }
                }
            }
            await showDialog({
                title: "Cell Count",
                message: `Non-empty cells in selection: ${count}`
            });
        } else {
            Object.values(tableData).forEach((value) => {
                if (value.trim() !== "") count++;
            });
            await showDialog({
                title: "Cell Count",
                message: `Non-empty cells in table: ${count}`
            });
        }
    };

    const renderDataCell = ({ rowIndex, columnIndex, style }) => {
        const key = `${rowIndex},${columnIndex}`;
        const cellIsActive =
            activeCell.row === rowIndex && activeCell.col === columnIndex;
        const isSelected = isCellInSelection(rowIndex, columnIndex);
        const searchHighlightStatus = isCellHighlightedBySearch(rowIndex, columnIndex);
        const cellFormat = cellFormats[key] || {};
        let backgroundColor = cellFormat.backgroundColor || "transparent";
        if (searchHighlightStatus === "matched") {
            backgroundColor = "rgba(255,255,0,0.2)";
        } else if (searchHighlightStatus === "current") {
            backgroundColor = "rgba(255,255,0,0.5)";
        } else if (!cellFormat.backgroundColor && isSelected && !cellIsActive) {
            backgroundColor = "rgba(255,255,255,0.1)";
        }
        const outline = cellIsActive ? "0.2vh solid #008000" : "0.2vh solid transparent";
        const cellValue = tableDataRef.current[key] || "";
        return (
            <div
                style={{
                    ...style,
                    outline,
                    backgroundColor
                }}
                className="dinolabsIDETableCell"
                onMouseDown={(e) => handleCellMouseDown(rowIndex, columnIndex, e)}
                onMouseUp={(e) => handleCellMouseUp(rowIndex, columnIndex, e)}
                onDoubleClick={() => handleCellDoubleClick(rowIndex, columnIndex)}
            >
                {cellIsActive ? (
                    <input
                        type="text"
                        className="dinolabsIDETableCellInput"
                        value={cellEditingValue}
                        onChange={onCellValueChange}
                        onBlur={handleCellBlur}
                        onKeyDown={(e) => {
                            if (e.ctrlKey || e.metaKey) {
                                const k = e.key.toLowerCase();
                                if (["s","p","a","x","c","v","z","y","f"].includes(k)) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.target.blur();
                                    return;
                                }
                            }
                            if (e.key === "Enter") {
                                e.target.blur();
                            } else if (e.key === "Tab") {
                                e.preventDefault();
                                e.target.blur();
                                moveActiveCellHorizontally(1);
                            } else if (
                                e.key === "ArrowRight" &&
                                e.target.selectionStart === e.target.value.length
                            ) {
                                e.preventDefault();
                                e.target.blur();
                                moveActiveCellHorizontally(1);
                            } else if (
                                e.key === "ArrowLeft" &&
                                e.target.selectionStart === 0
                            ) {
                                e.preventDefault();
                                e.target.blur();
                                moveActiveCellHorizontally(-1);
                            } else if (
                                e.key === "ArrowDown" &&
                                e.target.selectionStart === e.target.value.length
                            ) {
                                e.preventDefault();
                                e.target.blur();
                                moveActiveCellVertically(1);
                            } else if (
                                e.key === "ArrowUp" &&
                                e.target.selectionStart === 0
                            ) {
                                e.preventDefault();
                                e.target.blur();
                                moveActiveCellVertically(-1);
                            }
                        }}
                        style={{
                            userSelect: "text",
                            WebkitUserSelect: "text",
                            MozUserSelect: "text"
                        }}
                        autoFocus
                    />
                ) : (
                    <div
                        className="dinolabsIDETableCellContent"
                        style={{
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            MozUserSelect: "none",
                            width: "100%",
                            height: "100%",
                            cursor: "default",
                            ...cellFormat
                        }}
                    >
                        {cellValue}
                    </div>
                )}
            </div>
        );
    };

    useEffect(() => {
        function onWindowMouseMove(e) {
            setCellDrag((current) => {
                if (!current.active) return current;
                const dx = e.clientX - current.startX;
                const dy = e.clientY - current.startY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (!current.selecting && distance > 5) {
                    return { ...current, selecting: true };
                }
                if (current.selecting) {
                    const containerRect = gridContainerRef.current.getBoundingClientRect();
                    const relativeX =
                        e.clientX - containerRect.left + scrollPos.current.left;
                    const relativeY =
                        e.clientY - containerRect.top + scrollPos.current.top;
                    const currentRow = getRowIndexFromPosition(relativeY);
                    const currentCol = getColIndexFromPosition(relativeX);
                    const newSelection = {
                        top: Math.min(current.startRow, currentRow),
                        left: Math.min(current.startCol, currentCol),
                        bottom: Math.max(current.startRow, currentRow),
                        right: Math.max(current.startCol, currentCol)
                    };
                    setSelection(newSelection);
                }
                return current;
            });
        }
        function onWindowMouseUp() {
            setCellDrag({
                active: false,
                startRow: null,
                startCol: null,
                startX: 0,
                startY: 0,
                selecting: false
            });
        }
        window.addEventListener("mousemove", onWindowMouseMove);
        window.addEventListener("mouseup", onWindowMouseUp);
        return () => {
            window.removeEventListener("mousemove", onWindowMouseMove);
            window.removeEventListener("mouseup", onWindowMouseUp);
        };
    }, [rowHeights, colWidths]);

    function getRowIndexFromPosition(y) {
        let cumulative = 0;
        for (let i = 0; i < rowHeights.length; i++) {
            cumulative += rowHeights[i];
            if (y < cumulative) return i;
        }
        return rowHeights.length - 1;
    }

    function getColIndexFromPosition(x) {
        let cumulative = 0;
        for (let i = 0; i < colWidths.length; i++) {
            cumulative += colWidths[i];
            if (x < cumulative) return i;
        }
        return colWidths.length - 1;
    }

    const onGlobalMouseMove = useCallback(
        (e) => {
            if (!resizing.active) return;
            const { type, index, startPos, startSize } = resizing;
            const delta = type === "row" ? e.clientY - startPos : e.clientX - startPos;
            let newSize = startSize + delta;
            if (newSize < 10) newSize = 10;
            if (type === "row") {
                setRowHeights((prev) => {
                    const copy = [...prev];
                    copy[index] = newSize;
                    return copy;
                });
                dataGridRef.current?.resetAfterRowIndex(index);
            } else {
                setColWidths((prev) => {
                    const copy = [...prev];
                    copy[index] = newSize;
                    return copy;
                });
                dataGridRef.current?.resetAfterColumnIndex(index);
            }
        },
        [resizing]
    );

    const onGlobalMouseUpResizing = useCallback(() => {
        if (resizing.active) {
            setResizing({
                active: false,
                type: null,
                index: null,
                startPos: 0,
                startSize: 0
            });
        }
    }, [resizing]);

    useEffect(() => {
        window.addEventListener("mousemove", onGlobalMouseMove);
        window.addEventListener("mouseup", onGlobalMouseUpResizing);
        return () => {
            window.removeEventListener("mousemove", onGlobalMouseMove);
            window.removeEventListener("mouseup", onGlobalMouseUpResizing);
        };
    }, [onGlobalMouseMove, onGlobalMouseUpResizing]);

    function startResizingRow(rowIndex, e) {
        e.stopPropagation();
        e.preventDefault();
        commitActiveCellIfNeeded();
        setResizing({
            active: true,
            type: "row",
            index: rowIndex,
            startPos: e.clientY,
            startSize: rowHeights[rowIndex]
        });
    }

    function startResizingCol(colIndex, e) {
        e.stopPropagation();
        e.preventDefault();
        commitActiveCellIfNeeded();
        setResizing({
            active: true,
            type: "col",
            index: colIndex,
            startPos: e.clientX,
            startSize: colWidths[colIndex]
        });
    }

    function handleColumnHeaderMouseMove(e) {
        if (headerDrag && headerDrag.type === "col" && columnHeaderRef.current) {
            const rect = columnHeaderRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left + scrollPos.current.left;
            const col = getColIndexFromPosition(x);
            setHeaderDrag((prev) => {
                const newDrag = { ...prev, current: col };
                const left = Math.min(newDrag.start, newDrag.current);
                const right = Math.max(newDrag.start, newDrag.current);
                setSelection({ top: 0, left, bottom: DATA_ROW_COUNT - 1, right });
                return newDrag;
            });
        }
    }

    function handleColumnHeaderMouseUp(e) {
        e.stopPropagation();
        setHeaderDrag(null);
        setSkipClear(true);
    }

    function handleRowHeaderMouseMove(e) {
        if (headerDrag && headerDrag.type === "row" && rowHeaderRef.current) {
            const rect = rowHeaderRef.current.getBoundingClientRect();
            const y = e.clientY - rect.top + scrollPos.current.top;
            const row = getRowIndexFromPosition(y);
            setHeaderDrag((prev) => {
                const newDrag = { ...prev, current: row };
                const top = Math.min(newDrag.start, newDrag.current);
                const bottom = Math.max(newDrag.start, newDrag.current);
                setSelection({ top, left: 0, bottom, right: DATA_COL_COUNT - 1 });
                return newDrag;
            });
        }
    }

    function handleRowHeaderMouseUp(e) {
        e.stopPropagation();
        setHeaderDrag(null);
        setSkipClear(true);
    }

    const handleColumnHeaderMouseDown = (e, colIndex) => {
        commitActiveCellIfNeeded();
        if (e.shiftKey && selection && selection.top === 0 && selection.bottom === DATA_ROW_COUNT - 1) {
            const newLeft = Math.min(selection.left, colIndex);
            const newRight = Math.max(selection.right, colIndex);
            setSelection({
                top: 0,
                left: newLeft,
                bottom: DATA_ROW_COUNT - 1,
                right: newRight
            });
            setHeaderDrag({
                type: "col",
                start: selection.left,
                current: colIndex
            });
        } else {
            setHeaderDrag({
                type: "col",
                start: colIndex,
                current: colIndex
            });
            setSelection({
                top: 0,
                left: colIndex,
                bottom: DATA_ROW_COUNT - 1,
                right: colIndex
            });
        }
        e.preventDefault();
    };

    const handleRowHeaderMouseDown = (e, rowIndex) => {
        commitActiveCellIfNeeded();
        if (e.shiftKey && selection && selection.left === 0 && selection.right === DATA_COL_COUNT - 1) {
            const newTop = Math.min(selection.top, rowIndex);
            const newBottom = Math.max(selection.bottom, rowIndex);
            setSelection({
                top: newTop,
                left: 0,
                bottom: newBottom,
                right: DATA_COL_COUNT - 1
            });
            setHeaderDrag({
                type: "row",
                start: selection.top,
                current: rowIndex
            });
        } else {
            setHeaderDrag({
                type: "row",
                start: rowIndex,
                current: rowIndex
            });
            setSelection({
                top: rowIndex,
                left: 0,
                bottom: rowIndex,
                right: DATA_COL_COUNT - 1
            });
        }
        e.preventDefault();
    };

    useEffect(() => {
        if (!selectionResize.active) return;
        function onSelectionResizeMouseMove(e) {
            const containerRect = gridContainerRef.current.getBoundingClientRect();
            const relativeX =
                e.clientX - containerRect.left + scrollPos.current.left;
            const relativeY =
                e.clientY - containerRect.top + scrollPos.current.top;
            let { top, left, bottom, right } = selectionResize.initialSelection;
            switch (selectionResize.handle) {
                case "top": {
                    const newTop = getRowIndexFromPosition(relativeY);
                    top = Math.min(newTop, bottom);
                    break;
                }
                case "bottom": {
                    const newBottom = getRowIndexFromPosition(relativeY);
                    bottom = Math.max(newBottom, top);
                    break;
                }
                case "left": {
                    const newLeft = getColIndexFromPosition(relativeX);
                    left = Math.min(newLeft, right);
                    break;
                }
                case "right": {
                    const newRight = getColIndexFromPosition(relativeX);
                    right = Math.max(newRight, left);
                    break;
                }
                case "top-left": {
                    const newTop = getRowIndexFromPosition(relativeY);
                    const newLeft = getColIndexFromPosition(relativeX);
                    top = Math.min(newTop, bottom);
                    left = Math.min(newLeft, right);
                    break;
                }
                case "top-right": {
                    const newTop = getRowIndexFromPosition(relativeY);
                    const newRight = getColIndexFromPosition(relativeX);
                    top = Math.min(newTop, bottom);
                    right = Math.max(newRight, left);
                    break;
                }
                case "bottom-left": {
                    const newBottom = getRowIndexFromPosition(relativeY);
                    const newLeft = getColIndexFromPosition(relativeX);
                    bottom = Math.max(newBottom, top);
                    left = Math.min(newLeft, right);
                    break;
                }
                case "bottom-right": {
                    const newBottom = getRowIndexFromPosition(relativeY);
                    const newRight = getColIndexFromPosition(relativeX);
                    bottom = Math.max(newBottom, top);
                    right = Math.max(newRight, left);
                    break;
                }
                default:
                    break;
            }
            setSelection({ top, left, bottom, right });
        }
        function onSelectionResizeMouseUp() {
            setSelectionResize({
                active: false,
                handle: null,
                startX: 0,
                startY: 0,
                initialSelection: null
            });
        }
        window.addEventListener("mousemove", onSelectionResizeMouseMove);
        window.addEventListener("mouseup", onSelectionResizeMouseUp);
        return () => {
            window.removeEventListener("mousemove", onSelectionResizeMouseMove);
            window.removeEventListener("mouseup", onSelectionResizeMouseUp);
        };
    }, [selectionResize, rowHeights, colWidths]);

    function startSelectionResize(handle, e) {
        e.preventDefault();
        e.stopPropagation();
        if (!selection) return;
        commitActiveCellIfNeeded();
        setActiveCell({ row: null, col: null });
        setSelectionResize({
            active: true,
            handle,
            startX: e.clientX,
            startY: e.clientY,
            initialSelection: { ...selection }
        });
    }

    const selectionOverlayRef = useRef(null);
    const overlayDynamicStyle = selection
        ? {
              width: sumRange(colWidths, selection.left, selection.right + 1),
              height: sumRange(rowHeights, selection.top, selection.bottom + 1)
          }
        : {};

    useLayoutEffect(() => {
        if (selection && selectionOverlayRef.current) {
            const newTop = sumRange(rowHeights, 0, selection.top) - scrollPos.current.top;
            const newLeft = sumRange(colWidths, 0, selection.left) - scrollPos.current.left;
            Object.assign(selectionOverlayRef.current.style, {
                top: newTop + "px",
                left: newLeft + "px",
                width: sumRange(colWidths, selection.left, selection.right + 1) + "px",
                height: sumRange(rowHeights, selection.top, selection.bottom + 1) + "px"
            });
        }
    }, [selection, rowHeights, colWidths]);

    useEffect(() => {
        if (dataGridRef.current) {
            dataGridRef.current.resetAfterRowIndex(0, true);
        }
    }, [tableData]);

    return (
        <div
            className="dinolabsIDEContentWrapper"
            onClick={(e) => {
                if (skipClear) {
                    setSkipClear(false);
                    return;
                }
                if (
                    e.target.closest('.toolbar-wrapper') ||
                    e.target.closest('.dinolabsIDEEditingSearchBoxWrapper')
                ) return;
                if (
                    e.target.closest('.dinolabsIDETableColumnHeaderCell') ||
                    e.target.closest('.dinolabsIDETableRowHeaderCell') ||
                    e.target.closest('.dinolabsIDETableCornerHeader')
                ) return;
                if (e.detail > 1) return;
                if (activeCell.row === null && activeCell.col === null && selection) {
                    setSelection(null);
                } else if (activeCell.row !== null || activeCell.col !== null) {
                    const cell = e.target.closest(".dinolabsIDETableCell");
                    const input = e.target.closest(".dinolabsIDETableCellInput");
                    if (!cell && !input) {
                        commitActiveCellIfNeeded();
                    }
                }
            }}
        >
            <style>
                {`@keyframes spin {0% { transform: rotate(0deg); }100% { transform: rotate(360deg); }}`}
            </style>
            <div className="toolbar-wrapper">
                <DinoLabsIDETabularEditorToolbar
                    fileName={
                        fileHandle && fileHandle.name ? fileHandle.name : "Untitled Table"
                    }
                    saveStatus={saveStatus}
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                    onSave={handleSave}
                    onDownload={handleDownload}
                    onPrint={handlePrint}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onCut={handleCut}
                    onCopy={handleCopy}
                    onPaste={handlePaste}
                    onSelectAll={handleSelectAll}
                    onSearchReplace={() => setShowSearchPanel(true)}
                    openModal={openModal}
                    toggleModal={toggleModal}
                    closeAllMenus={() => { setOpenMenu(null); setOpenModal(null); }}
                    storeSelection={storeSelection}
                    formatModalRef={formatModalRef}
                    formatButtonRef={formatButtonRef}
                    toolsModalRef={toolsModalRef}
                    toolsButtonRef={toolsButtonRef}
                    handleAlign={handleAlign}
                    handleWordCount={handleWordCount}
                    decreaseZoom={decreaseZoom}
                    increaseZoom={increaseZoom}
                    currentZoom={pageZoom}
                    fontType={fontType}
                    handleFontTypeChange={handleFontTypeChange}
                    execCommand={execCommand}
                    isColorOpen={isColorOpen}
                    setIsColorOpen={setIsColorOpen}
                    isHighlightColorOpen={isHighlightColorOpen}
                    setIsHighlightColorOpen={setIsHighlightColorOpen}
                    handleColorChange={handleColorChange}
                    textColor={textColor}
                    handleHighlightColorChange={handleHighlightColorChange}
                    textHighlightColor={textHighlightColor}
                    handleRemoveFormatting={handleRemoveFormatting}
                    alignModalRef={alignModalRef}
                    alignButtonRef={alignButtonRef}
                    moreModalRef={moreModalRef}
                    moreButtonRef={moreButtonRef}
                    restoreSelection={restoreSelection}
                />
            </div>
            <div className="dinolabsIDETableWrapperContainer" ref={tableWrapperContainerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
                <div style={{ width: `${100 * 100 / pageZoom}%`, height: `${100 * 100 / pageZoom}%` }}>
                    <div
                        className="dinolabsIDETableWrapper"
                        style={{ transform: `scale(${pageZoom / 100})`, transformOrigin: "top left" }}
                        onSelectStart={(e) => e.preventDefault()}
                        onMouseDown={(e) => {
                            if (e.target.tagName !== "INPUT") {
                                if (window.getSelection) {
                                    window.getSelection().removeAllRanges();
                                }
                            }
                        }}
                        onMouseDownCapture={(e) => {
                            if (e.target.tagName !== "INPUT") {
                                if (window.getSelection) {
                                    window.getSelection().removeAllRanges();
                                }
                            }
                        }}
                        onDragStart={(e) => {
                            if (e.target.tagName !== "INPUT") {
                                e.preventDefault();
                            }
                        }}
                    >
                        {loading && <div className="dinolabsIDETableLoadingMessage">Loading...</div>}
                        {error && <div className="dinolabsIDETableErrorMessage">{error}</div>}
                        <div
                            className="dinolabsIDETableCornerHeader"
                            style={{ zIndex: 10 }}
                            onMouseDown={(e) => {
                                commitActiveCellIfNeeded();
                                if (
                                    selection &&
                                    selection.top === 0 &&
                                    selection.left === 0 &&
                                    selection.bottom === DATA_ROW_COUNT - 1 &&
                                    selection.right === DATA_COL_COUNT - 1
                                ) {
                                    setSelection(null);
                                } else {
                                    setSelection({
                                        top: 0,
                                        left: 0,
                                        bottom: DATA_ROW_COUNT - 1,
                                        right: DATA_COL_COUNT - 1
                                    });
                                }
                                e.preventDefault();
                            }}
                        />
                        <div
                            ref={columnHeaderRef}
                            style={{ zIndex: 10 }}
                            onMouseMove={handleColumnHeaderMouseMove}
                            onMouseUp={handleColumnHeaderMouseUp}
                            className="dinolabsIDETableColumnHeaderContainer"
                        >
                            <div
                                className="dinolabsIDETableColumnHeaderContent"
                                style={{ width: sumRange(colWidths, 0, DATA_COL_COUNT) }}
                            >
                                {Array.from({ length: DATA_COL_COUNT }).map((_, colIndex) => {
                                    const leftOffset = sumRange(colWidths, 0, colIndex);
                                    const width = colWidths[colIndex];
                                    const label = getColumnLabel(colIndex);
                                    const isSelectedHeader =
                                        selection &&
                                        colIndex >= selection.left &&
                                        colIndex <= selection.right &&
                                        selection.top === 0 &&
                                        selection.bottom === DATA_ROW_COUNT - 1;
                                    return (
                                        <div
                                            key={colIndex}
                                            className="dinolabsIDETableColumnHeaderCell"
                                            style={{
                                                left: leftOffset,
                                                width: width,
                                                backgroundColor: isSelectedHeader ? "#444" : "#333"
                                            }}
                                            onMouseDown={(e) => handleColumnHeaderMouseDown(e, colIndex)}
                                        >
                                            {label}
                                            <div
                                                className="dinolabsIDETableColumnHeaderResizeHandle"
                                                onMouseDown={(e) => startResizingCol(colIndex, e)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div
                            ref={rowHeaderRef}
                            style={{ zIndex: 10 }}
                            onMouseMove={handleRowHeaderMouseMove}
                            onMouseUp={handleRowHeaderMouseUp}
                            className="dinolabsIDETableRowHeaderContainer"
                        >
                            <div
                                className="dinolabsIDETableRowHeaderContent"
                                style={{ height: sumRange(rowHeights, 0, DATA_ROW_COUNT) }}
                            >
                                {Array.from({ length: DATA_ROW_COUNT }).map((_, rowIndex) => {
                                    const topOffset = sumRange(rowHeights, 0, rowIndex);
                                    const height = rowHeights[rowIndex];
                                    const isSelectedRow =
                                        selection &&
                                        rowIndex >= selection.top &&
                                        rowIndex <= selection.bottom &&
                                        selection.left === 0 &&
                                        selection.right === DATA_COL_COUNT - 1;
                                    return (
                                        <div
                                            key={rowIndex}
                                            className="dinolabsIDETableRowHeaderCell"
                                            style={{
                                                top: topOffset,
                                                height: height,
                                                backgroundColor: isSelectedRow ? "#3a3a3a" : "#2c2c2c"
                                            }}
                                            onMouseDown={(e) => handleRowHeaderMouseDown(e, rowIndex)}
                                        >
                                            {rowIndex + 1}
                                            <div
                                                className="dinolabsIDETableRowHeaderResizeHandle"
                                                onMouseDown={(e) => startResizingRow(rowIndex, e)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div ref={gridContainerRef} className="dinolabsIDETableGridContainer">
                            <AutoSizer>
                                {({ width, height }) => (
                                    <Grid
                                        ref={dataGridRef}
                                        columnCount={DATA_COL_COUNT}
                                        rowCount={DATA_ROW_COUNT}
                                        columnWidth={(index) => colWidths[index]}
                                        rowHeight={(index) => rowHeights[index]}
                                        width={width}
                                        height={height}
                                        onScroll={({ scrollLeft: sl, scrollTop: st }) => {
                                            if (
                                                columnHeaderRef.current &&
                                                columnHeaderRef.current.firstChild
                                            ) {
                                                columnHeaderRef.current.firstChild.style.transform =
                                                    `translateX(${-sl}px)`;
                                            }
                                            if (
                                                rowHeaderRef.current &&
                                                rowHeaderRef.current.firstChild
                                            ) {
                                                rowHeaderRef.current.firstChild.style.transform =
                                                    `translateY(${-st}px)`;
                                            }
                                            scrollPos.current.left = sl;
                                            scrollPos.current.top = st;
                                            if (selection && selectionOverlayRef.current) {
                                                const newTop =
                                                    sumRange(rowHeights, 0, selection.top) - st;
                                                const newLeft =
                                                    sumRange(colWidths, 0, selection.left) - sl;
                                                selectionOverlayRef.current.style.top = `${newTop}px`;
                                                selectionOverlayRef.current.style.left = `${newLeft}px`;
                                            }
                                        }}
                                    >
                                        {renderDataCell}
                                    </Grid>
                                )}
                            </AutoSizer>
                            {selection && (
                                <div style={{ position: "absolute", top: 0, left: 0 }}>
                                    <div
                                        ref={selectionOverlayRef}
                                        className="dinolabsIDETableSelectionOverlay"
                                        style={{ ...overlayDynamicStyle, zIndex: 0 }}
                                    >
                                        <div
                                            className="dinolabsIDETableSelectionHandleTop"
                                            onMouseDown={(e) => startSelectionResize("top", e)}
                                        />
                                        <div
                                            className="dinolabsIDETableSelectionHandleBottom"
                                            onMouseDown={(e) => startSelectionResize("bottom", e)}
                                        />
                                        <div
                                            className="dinolabsIDETableSelectionHandleLeft"
                                            onMouseDown={(e) => startSelectionResize("left", e)}
                                        />
                                        <div
                                            className="dinolabsIDETableSelectionHandleRight"
                                            onMouseDown={(e) => startSelectionResize("right", e)}
                                        />
                                        <div
                                            className="dinolabsIDETableSelectionHandleBottomRight"
                                            onMouseDown={(e) => startSelectionResize("bottom-right", e)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {showSearchPanel && (
                <div
                    ref={searchPanelRef}
                    className="dinolabsIDEEditingSearchBoxWrapper"
                    style={{
                        position: "absolute",
                        top: searchPanelPos.y,
                        left: searchPanelPos.x,
                        zIndex: 9999
                    }}
                    onMouseDown={handleSearchPanelMouseDown}
                >
                    <div className="dinolabsIDEEditngSearchBarWrapper">
                        <label className="dinolabsIDEEditingSearchLabel">
                            Search:
                            <span>
                                <input
                                    className="dinolabsIDESettingsCheckbox"
                                    type="checkbox"
                                    checked={caseSensitive}
                                    onChange={(e) => setCaseSensitive(e.target.checked)}
                                />
                                Case Sensitive
                            </span>
                        </label>
                        <input
                            className="dinolabsIDEEditingSearchInput"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="dinolabsIDEEditingSearchOperationsButtonWrapper">
                            <button
                                className="dinolabsIDEEditingSearchOperationsButton"
                                onClick={() => highlightAll(searchTerm)}
                            >
                                Search
                            </button>
                            <button
                                className="dinolabsIDEEditingSearchOperationsButton"
                                onClick={goToPrevious}
                            >
                                Prev
                            </button>
                            <button
                                className="dinolabsIDEEditingSearchOperationsButton"
                                onClick={goToNext}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEEditngSearchBarWrapper">
                        <label className="dinolabsIDEEditingSearchLabel">
                            Replace:
                        </label>
                        <input
                            className="dinolabsIDEEditingSearchInput"
                            type="text"
                            value={replaceTerm}
                            onChange={(e) => setReplaceTerm(e.target.value)}
                        />
                        <div className="dinolabsIDEEditingSearchOperationsButtonWrapper">
                            <button
                                className="dinolabsIDEEditingSearchOperationsButton"
                                onClick={replaceCurrent}
                            >
                                Replace
                            </button>
                            <button
                                className="dinolabsIDEEditingSearchOperationsButton"
                                onClick={replaceAll}
                            >
                                Replace All
                            </button>
                        </div>
                    </div>
                    <div
                        className="dinolabsIDEEditingSearchOperationsButtonWrapper"
                        style={{ justifyContent: "center" }}
                    >
                        <button
                            className="dinolabsIDEEditingSearchOperationsButton"
                            onClick={() => {
                                setShowSearchPanel(false);
                                setSearchResults([]);
                                setCurrentResultIndex(-1);
                            }}
                        >
                            <FontAwesomeIcon icon={faArrowRightFromBracket} style={{ transform: "scaleX(-1)" }} />
                            Close Search
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
