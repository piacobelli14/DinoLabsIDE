import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useLayoutEffect,
    useMemo
} from "react";
import { VariableSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import "../../styles/mainStyles/DinoLabsIDEContent.css";
import DinoLabsIDETabularEditorToolbar from "./DinoLabsIDETabularEditorToolbar";
import { showDialog } from "../DinoLabsIDEAlert.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRightFromBracket,
    faSquareMinus,
    faSquarePlus
} from "@fortawesome/free-solid-svg-icons";

const MAX_ROWS = 100000;
const MAX_COLS = 5000;

function sumRange(arr, from, to) {
    let total = 0;
    for (let i = from; i < to; i++) {
        total += arr[i] || 0;
    }
    return total;
}

function sumEffectiveRange(arr, from, to, defaultValue) {
    let total = 0;
    for (let i = from; i < to; i++) {
        total += i < arr.length ? arr[i] : defaultValue;
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

export default function DinoLabsIDETabularEditor({ fileHandle, keyBinds }) {
    const [tableData, setTableData] = useState({});
    const tableDataRef = useRef(tableData);
    useEffect(() => {
        tableDataRef.current = tableData;
    }, [tableData]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [keybindLoading, setKeybindLoading] = useState(false);
    const [numRows, setNumRows] = useState(1000);
    const [numCols, setNumCols] = useState(100);
    const [activeCell, setActiveCell] = useState({ row: null, col: null });
    const [cellEditingValue, setCellEditingValue] = useState("");
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [clipboardData, setClipboardData] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);
    const [openModal, setOpenModal] = useState(null);
    const toggleModal = (modalName) => {
        setOpenModal((prev) => {
            const newModalState = prev === modalName ? null : modalName;
            if (newModalState !== null) {
                setOpenMenu(null);
                setIsColorOpen(false);
                setIsHighlightColorOpen(false);
            }
            return newModalState;
        });
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
    const [selectionDrag, setSelectionDrag] = useState({
        active: false,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        originalSelection: null,
        originalOverlayTop: 0,
        originalOverlayLeft: 0,
        block: null
    });
    const DEFAULT_ROW_HEIGHT = 24;
    const DEFAULT_COL_WIDTH = 120;
    const [rowHeights, setRowHeights] = useState(
        Array.from({ length: numRows }, () => DEFAULT_ROW_HEIGHT)
    );
    const [colWidths, setColWidths] = useState(
        Array.from({ length: numCols }, () => DEFAULT_COL_WIDTH)
    );
    useEffect(() => {
        setRowHeights(Array.from({ length: numRows }, () => DEFAULT_ROW_HEIGHT));
    }, [numRows]);
    useEffect(() => {
        setColWidths(Array.from({ length: numCols }, () => DEFAULT_COL_WIDTH));
    }, [numCols]);
    const cachedRowHeightsRef = useRef([]);
    const rowHeightsCumulative = useMemo(() => {
        if (cachedRowHeightsRef.current.length === 0) {
            let cumulative = [0];
            for (let i = 0; i < rowHeights.length; i++) {
                cumulative.push(cumulative[i] + rowHeights[i]);
            }
            cachedRowHeightsRef.current = cumulative;
            return cumulative;
        }
        if (cachedRowHeightsRef.current.length === rowHeights.length + 1) {
            return cachedRowHeightsRef.current;
        }
        if (rowHeights.length + 1 > cachedRowHeightsRef.current.length) {
            let cumulative = cachedRowHeightsRef.current.slice();
            for (let i = cumulative.length - 1; i < rowHeights.length; i++) {
                cumulative.push(cumulative[i] + rowHeights[i]);
            }
            cachedRowHeightsRef.current = cumulative;
            return cumulative;
        }
        let cumulative = [0];
        for (let i = 0; i < rowHeights.length; i++) {
            cumulative.push(cumulative[i] + rowHeights[i]);
        }
        cachedRowHeightsRef.current = cumulative;
        return cumulative;
    }, [rowHeights]);
    const cachedColWidthsRef = useRef([]);
    const colWidthsCumulative = useMemo(() => {
        if (cachedColWidthsRef.current.length === 0) {
            let cumulative = [0];
            for (let i = 0; i < colWidths.length; i++) {
                cumulative.push(cumulative[i] + colWidths[i]);
            }
            cachedColWidthsRef.current = cumulative;
            return cumulative;
        }
        if (cachedColWidthsRef.current.length === colWidths.length + 1) {
            return cachedColWidthsRef.current;
        }
        if (colWidths.length + 1 > cachedColWidthsRef.current.length) {
            let cumulative = cachedColWidthsRef.current.slice();
            for (let i = cumulative.length - 1; i < colWidths.length; i++) {
                cumulative.push(cumulative[i] + colWidths[i]);
            }
            cachedColWidthsRef.current = cumulative;
            return cumulative;
        }
        let cumulative = [0];
        for (let i = 0; i < colWidths.length; i++) {
            cumulative.push(cumulative[i] + colWidths[i]);
        }
        cachedColWidthsRef.current = cumulative;
        return cumulative;
    }, [colWidths]);
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

    const addRow = useCallback(() => {
        if (numRows < MAX_ROWS) {
            setNumRows((prev) => prev + 1);
            setRowHeights((prev) => [...prev, DEFAULT_ROW_HEIGHT]);
        }
    }, [numRows]);

    const addColumn = useCallback(() => {
        if (numCols < MAX_COLS) {
            setNumCols((prev) => prev + 1);
            setColWidths((prev) => [...prev, DEFAULT_COL_WIDTH]);
        }
    }, [numCols]);

    function moveSelection(originalSelection, rowOffset, colOffset, block, data) {
        const numRowsSel = originalSelection.bottom - originalSelection.top + 1;
        const numColsSel = originalSelection.right - originalSelection.left + 1;
        let rowIndices = Array.from({ length: numRowsSel }, (_, i) => i);
        let colIndices = Array.from({ length: numColsSel }, (_, j) => j);
        if (rowOffset > 0) rowIndices.reverse();
        if (colOffset > 0) colIndices.reverse();
        for (const i of rowIndices) {
            for (const j of colIndices) {
                const destR = originalSelection.top + i + rowOffset;
                const destC = originalSelection.left + j + colOffset;
                data[`${destR},${destC}`] = block[i][j];
            }
        }
        return {
            top: originalSelection.top + rowOffset,
            left: originalSelection.left + colOffset,
            bottom: originalSelection.bottom + rowOffset,
            right: originalSelection.right + colOffset
        };
    }

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

    function captureContainerHTML() {
        const container = tableWrapperContainerRef.current;
        if (!container) return "";
        const clonedContainer = container.cloneNode(true);
        inlineAllStyles(clonedContainer);
        return `
              <!DOCTYPE html>
              <html>
              <head>
              <meta charset="UTF-8">
              <title>${
            fileHandle && fileHandle.name ? fileHandle.name : "Untitled"
        }</title>
              </head>
              <body>
              ${clonedContainer.outerHTML}
              </body>
              </html>
          `;
    }

    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
        };
        document.addEventListener("contextmenu", handleContextMenu);
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, []);

    const decreaseZoom = () => setPageZoom((prev) => Math.max(prev - 10, 10));
    const increaseZoom = () => setPageZoom((prev) => prev + 10);

    const handleFontTypeChange = (e) => {
        const newFontType = e.target.value;
        setFontType(newFontType);
        const sel = selection || storedSelectionRef.current || {
            top: 0,
            left: 0,
            bottom: numRows - 1,
            right: numCols - 1
        };
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
        const sel = selection || storedSelectionRef.current || {
            top: 0,
            left: 0,
            bottom: numRows - 1,
            right: numCols - 1
        };
        setCellFormats((prev) => {
            const newFormats = { ...prev };
            for (let r = sel.top; r <= sel.bottom; r++) {
                for (let c = sel.left; c <= sel.right; c++) {
                    const key = `${r},${c}`;
                    const current = newFormats[key] || {};
                    switch (command) {
                        case "bold":
                            newFormats[key] = {
                                ...current,
                                fontWeight:
                                    current.fontWeight === "bold" ? "normal" : "bold"
                            };
                            break;
                        case "italic":
                            newFormats[key] = {
                                ...current,
                                fontStyle:
                                    current.fontStyle === "italic" ? "normal" : "italic"
                            };
                            break;
                        case "underline":
                            newFormats[key] = {
                                ...current,
                                textDecoration:
                                    current.textDecoration === "underline"
                                        ? "none"
                                        : "underline"
                            };
                            break;
                        case "strikeThrough":
                            newFormats[key] = {
                                ...current,
                                textDecoration:
                                    current.textDecoration === "line-through"
                                        ? "none"
                                        : "line-through"
                            };
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
        const sel = selection || storedSelectionRef.current || {
            top: 0,
            left: 0,
            bottom: numRows - 1,
            right: numCols - 1
        };
        setCellFormats((prevFormats) => {
            const newFormats = { ...prevFormats };
            for (let r = sel.top; r <= sel.bottom; r++) {
                for (let c = sel.left; c <= sel.right; c++) {
                    const key = `${r},${c}`;
                    const current = newFormats[key] || {};
                    newFormats[key] = { ...current, color };
                }
            }
            return newFormats;
        });
    };

    const handleHighlightColorChange = (color) => {
        setTextHighlightColor(color);
        const sel = selection || storedSelectionRef.current || {
            top: 0,
            left: 0,
            bottom: numRows - 1,
            right: numCols - 1
        };
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
        const sel = selection || storedSelectionRef.current || {
            top: 0,
            left: 0,
            bottom: numRows - 1,
            right: numCols - 1
        };
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
                let lines = text.split(/\r?\n/);
                while (lines.length && !lines[lines.length - 1].trim()) {
                    lines.pop();
                }
                const data = {};
                let maxColsFound = 0;
                lines.forEach((line, r) => {
                    const cells = line.split(",");
                    if (cells.length > maxColsFound) maxColsFound = cells.length;
                    cells.forEach((cell, c) => {
                        if (cell.trim()) {
                            data[`${r},${c}`] = cell.trim();
                        }
                    });
                });
                let finalRows = lines.length;
                let finalCols = maxColsFound;
                let alertMessage = "";
                if (finalRows > MAX_ROWS) {
                    finalRows = MAX_ROWS;
                    alertMessage += `Row count exceeds limit and will be truncated to ${MAX_ROWS} rows. `;
                }
                if (finalCols > MAX_COLS) {
                    finalCols = MAX_COLS;
                    alertMessage += `Column count exceeds limit and will be truncated to ${MAX_COLS} columns.`;
                }
                if (alertMessage) {
                    await showDialog({
                        title: "Data Truncation Alert",
                        message: alertMessage
                    });
                    Object.keys(data).forEach((key) => {
                        const [r, c] = key.split(",").map(Number);
                        if (r >= finalRows || c >= finalCols) {
                            delete data[key];
                        }
                    });
                }
                setTableData(data);
                setNumRows(finalRows);
                setNumCols(finalCols);
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

        if (cmdOrCtrl && keyBinds) {
            const k = e.key.toLowerCase();
            if (k === keyBinds.search?.toLowerCase()) {
                e.preventDefault();
                commitActiveCellIfNeeded();
                setShowSearchPanel(true);
                return;
            }
            if (k === keyBinds.save?.toLowerCase()) {
                e.preventDefault();
                setKeybindLoading(true);
                try {
                    await Promise.resolve(handleSave());
                } finally {
                    setKeybindLoading(false);
                }
                return;
            }
            if (k === keyBinds.selectAll?.toLowerCase()) {
                e.preventDefault();
                setKeybindLoading(true);
                try {
                    await Promise.resolve(handleSelectAll());
                } finally {
                    setKeybindLoading(false);
                }
                return;
            }
            if (k === keyBinds.cut?.toLowerCase()) {
                e.preventDefault();
                if (selection) {
                    setKeybindLoading(true);
                    try {
                        await Promise.resolve(handleCut());
                    } finally {
                        setKeybindLoading(false);
                    }
                }
                return;
            }
            if (k === keyBinds.copy?.toLowerCase()) {
                e.preventDefault();
                if (selection) {
                    setKeybindLoading(true);
                    try {
                        await Promise.resolve(handleCopy());
                    } finally {
                        setKeybindLoading(false);
                    }
                }
                return;
            }
            if (k === keyBinds.paste?.toLowerCase()) {
                e.preventDefault();
                if (selection) {
                    setKeybindLoading(true);
                    try {
                        await Promise.resolve(handlePaste());
                    } finally {
                        setKeybindLoading(false);
                    }
                }
                return;
            }
            if (k === keyBinds.undo?.toLowerCase()) {
                e.preventDefault();
                setKeybindLoading(true);
                try {
                    await Promise.resolve(handleUndo());
                } finally {
                    setKeybindLoading(false);
                }
                return;
            }
            if (k === keyBinds.redo?.toLowerCase()) {
                e.preventDefault();
                setKeybindLoading(true);
                try {
                    await Promise.resolve(handleRedo());
                } finally {
                    setKeybindLoading(false);
                }
                return;
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
        let lastNonEmptyRow = -1;
        for (let r = 0; r <= maxRow; r++) {
            let rowCells = [];
            let rowHasContent = false;
            for (let c = 0; c <= maxCol; c++) {
                const value = data[`${r},${c}`] || "";
                if (value !== "") {
                    rowHasContent = true;
                }
                rowCells.push(value);
            }
            if (rowHasContent) {
                lastNonEmptyRow = r;
            }
            lines.push(rowCells.join(","));
        }
        lines = lines.slice(0, lastNonEmptyRow + 1);
        return lines.join("\r\n");
    }

    async function handleDownload() {
        closeAllPopouts();
        setOpenMenu(null);
        const result = await showDialog({
            title: "Download as...",
            message: "Select a file type to download this file as.",
            inputs: [
                {
                    name: "fileType",
                    type: "select",
                    options: [{ label: "CSV (.csv)", value: "csv" }]
                }
            ],
            showCancel: true
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
        closeAllPopouts();
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
            bottom: numRows - 1,
            right: numCols - 1
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
        if (currentResultIndex < 0 || currentResultIndex >= searchResults.length)
            return;
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
        if (e.shiftKey) {
            const anchor = selection
                ? { row: selection.top, col: selection.left }
                : (activeCell.row !== null && activeCell.col !== null
                    ? { row: activeCell.row, col: activeCell.col }
                    : { row: rowIndex, col: colIndex });
            setSelection({
                top: Math.min(anchor.row, rowIndex),
                left: Math.min(anchor.col, colIndex),
                bottom: Math.max(anchor.row, rowIndex),
                right: Math.max(anchor.col, colIndex)
            });
            setActiveCell({ row: null, col: null });
            setCellEditingValue("");
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
                    setCellEditingValue(
                        tableDataRef.current[`${rowIndex},${colIndex}`] || ""
                    );
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
        if (newCol >= numCols && offset > 0 && numCols < MAX_COLS) {
            addColumn();
            newCol = numCols;
        }
        if (newCol < 0) newCol = 0;
        else if (newCol >= numCols) newCol = numCols - 1;
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
        if (newRow >= numRows && offset > 0 && numRows < MAX_ROWS) {
            addRow();
            newRow = numRows;
        }
        if (newRow < 0) newRow = 0;
        else if (newRow >= numRows) newRow = numRows - 1;
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
        const sel = selection || storedSelectionRef.current || {
            top: 0,
            left: 0,
            bottom: numRows - 1,
            right: numCols - 1
        };
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
        closeAllPopouts();
        setOpenMenu(null);
        setOpenModal(null);
        setIsColorOpen(false);
        setIsHighlightColorOpen(false);
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

    const closeAllPopouts = () => {
        setOpenMenu(null);
        setOpenModal(null);
        setIsColorOpen(false);
        setIsHighlightColorOpen(false);
    };

    const [autoSizerDims, setAutoSizerDims] = useState({ width: 0, height: 0 });
    const minNeededCols = useMemo(() => {
        if (!autoSizerDims.width) return 0;
        return Math.ceil(autoSizerDims.width / DEFAULT_COL_WIDTH);
    }, [autoSizerDims.width]);
    const minNeededRows = useMemo(() => {
        if (!autoSizerDims.height) return 0;
        return Math.ceil(autoSizerDims.height / DEFAULT_ROW_HEIGHT);
    }, [autoSizerDims.height]);
    const effectiveCols = Math.max(numCols, minNeededCols);
    const effectiveRows = Math.max(numRows, minNeededRows);

    const getRowHeight = (index) => {
        if (index < rowHeights.length) return rowHeights[index];
        return DEFAULT_ROW_HEIGHT;
    };

    const getColWidth = (index) => {
        if (index < colWidths.length) return colWidths[index];
        return DEFAULT_COL_WIDTH;
    };

    const expandIfNeeded = useCallback(
        (scrollLeft, scrollTop, viewWidth, viewHeight) => {
            const bottomEdge = scrollTop + viewHeight;
            const rightEdge = scrollLeft + viewWidth;
            const totalHeight = rowHeightsCumulative[numRows];
            const totalWidth = colWidthsCumulative[numCols];
            if (bottomEdge > totalHeight && numRows < MAX_ROWS) {
                const extraRowsNeeded = Math.ceil(
                    (bottomEdge - totalHeight) / DEFAULT_ROW_HEIGHT
                );
                const rowsToAdd = Math.min(extraRowsNeeded, MAX_ROWS - numRows);
                setNumRows((prev) => prev + rowsToAdd);
                setRowHeights((prev) => [
                    ...prev,
                    ...Array.from({ length: rowsToAdd }, () => DEFAULT_ROW_HEIGHT)
                ]);
            }
            if (rightEdge > totalWidth && numCols < MAX_COLS) {
                const extraColsNeeded = Math.ceil(
                    (rightEdge - totalWidth) / DEFAULT_COL_WIDTH
                );
                const colsToAdd = Math.min(extraColsNeeded, MAX_COLS - numCols);
                setNumCols((prev) => prev + colsToAdd);
                setColWidths((prev) => [
                    ...prev,
                    ...Array.from({ length: colsToAdd }, () => DEFAULT_COL_WIDTH)
                ]);
            }
        },
        [numRows, numCols, rowHeightsCumulative, colWidthsCumulative]
    );

    const itemData = useMemo(
        () => ({
            tableDataRef,
            cellFormats,
            activeCell,
            cellEditingValue,
            selection,
            searchResults,
            currentResultIndex,
            selectionDrag,
            handleCellMouseDown,
            handleCellMouseUp,
            handleCellDoubleClick,
            onCellValueChange,
            handleCellBlur,
            moveActiveCellHorizontally,
            moveActiveCellVertically,
            isCellInSelection,
            isCellHighlightedBySearch
        }),
        [
            tableDataRef,
            cellFormats,
            activeCell,
            cellEditingValue,
            selection,
            searchResults,
            currentResultIndex,
            selectionDrag
        ]
    );

    const Cell = React.memo(function Cell({ columnIndex, rowIndex, style, data }) {
        const {
            tableDataRef,
            cellFormats,
            activeCell,
            cellEditingValue,
            selectionDrag,
            searchResults,
            currentResultIndex,
            handleCellMouseDown,
            handleCellMouseUp,
            handleCellDoubleClick,
            onCellValueChange,
            handleCellBlur,
            moveActiveCellHorizontally,
            moveActiveCellVertically,
            isCellInSelection,
            isCellHighlightedBySearch
        } = data;
        const key = `${rowIndex},${columnIndex}`;
        const prevCellVal = tableDataRef.current[key] || "";
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
        const outline = cellIsActive
            ? "0.2vh solid #008000"
            : "0.2vh solid transparent";
        const cellValue = tableDataRef.current[key] || "";
        let cellStyle = { ...style, outline, backgroundColor };
        if (
            selectionDrag.active &&
            selectionDrag.originalSelection &&
            rowIndex >= selectionDrag.originalSelection.top &&
            rowIndex <= selectionDrag.originalSelection.bottom &&
            columnIndex >= selectionDrag.originalSelection.left &&
            columnIndex <= selectionDrag.originalSelection.right
        ) {
            cellStyle = {
                ...cellStyle,
                transform: `translate(${selectionDrag.offsetX}px, ${selectionDrag.offsetY}px)`
            };
        }
        return (
            <div
                style={cellStyle}
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
                                if (
                                    [
                                        "s",
                                        "p",
                                        "a",
                                        "x",
                                        "c",
                                        "v",
                                        "z",
                                        "y",
                                        "f"
                                    ].includes(k)
                                ) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.target.blur();
                                    return;
                                }
                            }
                            if (e.key === "Enter") {
                                e.preventDefault();
                                e.target.blur();
                                setTimeout(() => {
                                    moveActiveCellVertically(1);
                                }, 0);
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
    },
    (prevProps, nextProps) => {
        const key = `${prevProps.rowIndex},${prevProps.columnIndex}`;
        const prevValue = prevProps.data.tableDataRef.current[key] || "";
        const nextValue = nextProps.data.tableDataRef.current[key] || "";
        if (prevValue !== nextValue) return false;
        if (prevProps.rowIndex !== nextProps.rowIndex) return false;
        if (prevProps.columnIndex !== nextProps.columnIndex) return false;
        if (prevProps.style.width !== nextProps.style.width) return false;
        if (prevProps.style.height !== nextProps.style.height) return false;
        if (prevProps.style.left !== nextProps.style.left) return false;
        if (prevProps.style.top !== nextProps.style.top) return false;
        const prevData = prevProps.data;
        const nextData = nextProps.data;
        const wasActive =
            prevData.activeCell.row === prevProps.rowIndex &&
            prevData.activeCell.col === prevProps.columnIndex;
        const isActive =
            nextData.activeCell.row === nextProps.rowIndex &&
            nextData.activeCell.col === nextProps.columnIndex;
        if (wasActive !== isActive) return false;
        const prevSelected = prevData.isCellInSelection(
            prevProps.rowIndex,
            prevProps.columnIndex
        );
        const nextSelected = nextData.isCellInSelection(
            nextProps.rowIndex,
            nextProps.columnIndex
        );
        if (prevSelected !== nextSelected) return false;
        const prevHighlight = prevData.isCellHighlightedBySearch(
            prevProps.rowIndex,
            prevProps.columnIndex
        );
        const nextHighlight = nextData.isCellHighlightedBySearch(
            nextProps.rowIndex,
            nextProps.columnIndex
        );
        if (prevHighlight !== nextHighlight) return false;
        if (
            prevData.selectionDrag.active !== nextData.selectionDrag.active ||
            prevData.selectionDrag.offsetX !== nextData.selectionDrag.offsetX ||
            prevData.selectionDrag.offsetY !== nextData.selectionDrag.offsetY
        ) {
            const inSelectionBefore =
                prevData.selectionDrag.originalSelection &&
                prevProps.rowIndex >=
                prevData.selectionDrag.originalSelection.top &&
                prevProps.rowIndex <=
                prevData.selectionDrag.originalSelection.bottom &&
                prevProps.columnIndex >=
                prevData.selectionDrag.originalSelection.left &&
                prevProps.columnIndex <=
                prevData.selectionDrag.originalSelection.right;
            const inSelectionNow =
                nextData.selectionDrag.originalSelection &&
                nextProps.rowIndex >=
                nextData.selectionDrag.originalSelection.top &&
                nextProps.rowIndex <=
                nextData.selectionDrag.originalSelection.bottom &&
                nextProps.columnIndex >=
                nextData.selectionDrag.originalSelection.left &&
                nextProps.columnIndex <=
                nextData.selectionDrag.originalSelection.right;
            if (inSelectionBefore || inSelectionNow) {
                if (inSelectionBefore !== inSelectionNow) {
                    return false;
                }
                if (prevData.selectionDrag.offsetX !== nextData.selectionDrag.offsetX) {
                    return false;
                }
                if (prevData.selectionDrag.offsetY !== nextData.selectionDrag.offsetY) {
                    return false;
                }
            }
        }
        const prevFormat = prevData.cellFormats[key] || {};
        const nextFormat = nextData.cellFormats[key] || {};
        if (
            prevFormat.fontStyle !== nextFormat.fontStyle ||
            prevFormat.fontWeight !== nextFormat.fontWeight ||
            prevFormat.textDecoration !== nextFormat.textDecoration ||
            prevFormat.textAlign !== nextFormat.textAlign ||
            prevFormat.backgroundColor !== nextFormat.backgroundColor ||
            prevFormat.color !== nextFormat.color ||
            prevFormat.fontFamily !== nextFormat.fontFamily
        ) {
            return false;
        }
        if (isActive) {
            if (prevData.cellEditingValue !== nextData.cellEditingValue) return false;
        }
        return true;
    });

    function cellRenderer(props) {
        return <Cell {...props} data={itemData} />;
    }

    function handleSelectionMouseDown(e) {
        if (
            e.target.classList.contains("dinolabsIDETableSelectionHandleTop") ||
            e.target.classList.contains("dinolabsIDETableSelectionHandleBottom") ||
            e.target.classList.contains("dinolabsIDETableSelectionHandleLeft") ||
            e.target.classList.contains("dinolabsIDETableSelectionHandleRight") ||
            e.target.classList.contains("dinolabsIDETableSelectionHandleBottomRight")
        ) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        if (!selection) return;
        const containerRect = gridContainerRef.current.getBoundingClientRect();
        const originalOverlayTop =
            rowHeightsCumulative[selection.top] - scrollPos.current.top;
        const originalOverlayLeft =
            colWidthsCumulative[selection.left] - scrollPos.current.left;
        const snapshot = [];
        for (let r = selection.top; r <= selection.bottom; r++) {
            const rowData = [];
            for (let c = selection.left; c <= selection.right; c++) {
                const key = `${r},${c}`;
                rowData.push(tableDataRef.current[key] ?? "");
            }
            snapshot.push(rowData);
        }
        setSelectionDrag({
            active: true,
            startX: e.clientX,
            startY: e.clientY,
            offsetX: 0,
            offsetY: 0,
            originalSelection: selection,
            originalOverlayTop,
            originalOverlayLeft,
            block: snapshot
        });
    }

    const selectionDragFrameRef = useRef(null);
    useEffect(() => {
        function onMouseMove(e) {
            if (selectionDragFrameRef.current !== null) return;
            selectionDragFrameRef.current = requestAnimationFrame(() => {
                setSelectionDrag((prev) => {
                    if (!prev.active) return prev;
                    const offsetX = e.clientX - prev.startX;
                    const offsetY = e.clientY - prev.startY;
                    return { ...prev, offsetX, offsetY };
                });
                selectionDragFrameRef.current = null;
            });
        }
        function onMouseUp(e) {
            setSelectionDrag((prev) => {
                if (!prev.active) return prev;
                const offsetX = e.clientX - prev.startX;
                const offsetY = e.clientY - prev.startY;
                const colOffset = Math.round(offsetX / DEFAULT_COL_WIDTH);
                const rowOffset = Math.round(offsetY / DEFAULT_ROW_HEIGHT);
                let newSelection = {
                    top: prev.originalSelection.top + rowOffset,
                    left: prev.originalSelection.left + colOffset,
                    bottom: prev.originalSelection.bottom + rowOffset,
                    right: prev.originalSelection.right + colOffset
                };
                if (newSelection.top < 0) {
                    const diff = -newSelection.top;
                    newSelection.top = 0;
                    newSelection.bottom += diff;
                }
                if (newSelection.left < 0) {
                    const diff = -newSelection.left;
                    newSelection.left = 0;
                    newSelection.right += diff;
                }
                if (newSelection.bottom >= numRows) {
                    const diff = newSelection.bottom - (numRows - 1);
                    newSelection.bottom = numRows - 1;
                    newSelection.top -= diff;
                }
                if (newSelection.right >= numCols) {
                    const diff = newSelection.right - (numCols - 1);
                    newSelection.right = numCols - 1;
                    newSelection.left -= diff;
                }
                let newData = { ...tableDataRef.current };
                for (
                    let r = prev.originalSelection.top;
                    r <= prev.originalSelection.bottom;
                    r++
                ) {
                    for (
                        let c = prev.originalSelection.left;
                        c <= prev.originalSelection.right;
                        c++
                    ) {
                        delete newData[`${r},${c}`];
                    }
                }
                const numRowsSel =
                    prev.originalSelection.bottom - prev.originalSelection.top + 1;
                const numColsSel =
                    prev.originalSelection.right - prev.originalSelection.left + 1;
                let rowIndices = Array.from({ length: numRowsSel }, (_, i) => i);
                let colIndices = Array.from({ length: numColsSel }, (_, j) => j);
                if (rowOffset > 0) rowIndices.reverse();
                if (colOffset > 0) colIndices.reverse();
                newSelection = moveSelection(
                    prev.originalSelection,
                    rowOffset,
                    colOffset,
                    prev.block,
                    newData
                );
                pushToUndoStack(tableDataRef.current);
                setTableData(newData);
                setSelection(newSelection);
                return {
                    active: false,
                    startX: 0,
                    startY: 0,
                    offsetX: 0,
                    offsetY: 0,
                    originalSelection: null,
                    originalOverlayTop: 0,
                    originalOverlayLeft: 0,
                    block: null
                };
            });
        }
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [rowHeights, colWidths, numRows, numCols]);

    const mouseMoveFrameRef = useRef(null);
    useEffect(() => {
        function onWindowMouseMove(e) {
            if (mouseMoveFrameRef.current !== null) return;
            mouseMoveFrameRef.current = requestAnimationFrame(() => {
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
                mouseMoveFrameRef.current = null;
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
        let low = 0;
        let high = rowHeightsCumulative.length - 1;
        while (low < high) {
            let mid = Math.floor((low + high) / 2);
            if (rowHeightsCumulative[mid] <= y) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        return Math.max(0, low - 1);
    }

    function getColIndexFromPosition(x) {
        let low = 0;
        let high = colWidthsCumulative.length - 1;
        while (low < high) {
            let mid = Math.floor((low + high) / 2);
            if (colWidthsCumulative[mid] <= x) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        return Math.max(0, low - 1);
    }

    const handleColumnHeaderMouseMove = (e) => {
        if (headerDrag && headerDrag.type === "col" && columnHeaderRef.current) {
            const rect = columnHeaderRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left + scrollPos.current.left;
            const col = getColIndexFromPosition(x);
            setHeaderDrag((prev) => {
                const newDrag = { ...prev, current: col };
                const left = Math.min(newDrag.start, newDrag.current);
                const right = Math.max(newDrag.start, newDrag.current);
                setSelection({ top: 0, left, bottom: numRows - 1, right });
                return newDrag;
            });
        }
    };

    const handleColumnHeaderMouseUp = (e) => {
        e.stopPropagation();
        setHeaderDrag(null);
        setSkipClear(true);
    };

    const handleRowHeaderMouseMove = (e) => {
        if (headerDrag && headerDrag.type === "row" && rowHeaderRef.current) {
            const rect = rowHeaderRef.current.getBoundingClientRect();
            const y = e.clientY - rect.top + scrollPos.current.top;
            const row = getRowIndexFromPosition(y);
            setHeaderDrag((prev) => {
                const newDrag = { ...prev, current: row };
                const top = Math.min(newDrag.start, newDrag.current);
                const bottom = Math.max(newDrag.start, newDrag.current);
                setSelection({ top, left: 0, bottom, right: numCols - 1 });
                return newDrag;
            });
        }
    };

    const handleRowHeaderMouseUp = (e) => {
        e.stopPropagation();
        setHeaderDrag(null);
        setSkipClear(true);
    };

    const handleColumnHeaderMouseDown = (e, colIndex) => {
        commitActiveCellIfNeeded();
        if (colIndex >= numCols) {
            setNumCols(colIndex + 1);
            setColWidths((prev) => {
                const newWidths = [...prev];
                for (let i = newWidths.length; i <= colIndex; i++) {
                    newWidths.push(DEFAULT_COL_WIDTH);
                }
                return newWidths;
            });
        }
        if (
            e.shiftKey &&
            selection &&
            selection.top === 0 &&
            selection.bottom === numRows - 1
        ) {
            const newLeft = Math.min(selection.left, colIndex);
            const newRight = Math.max(selection.right, colIndex);
            setSelection({
                top: 0,
                left: newLeft,
                bottom: numRows - 1,
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
                bottom: numRows - 1,
                right: colIndex
            });
        }
        e.preventDefault();
    };

    const handleRowHeaderMouseDown = (e, rowIndex) => {
        commitActiveCellIfNeeded();
        if (rowIndex >= numRows) {
            setNumRows(rowIndex + 1);
            setRowHeights((prev) => {
                const newHeights = [...prev];
                for (let i = newHeights.length; i <= rowIndex; i++) {
                    newHeights.push(DEFAULT_ROW_HEIGHT);
                }
                return newHeights;
            });
        }
        if (
            e.shiftKey &&
            selection &&
            selection.left === 0 &&
            selection.right === numCols - 1
        ) {
            const newTop = Math.min(selection.top, rowIndex);
            const newBottom = Math.max(selection.bottom, rowIndex);
            setSelection({
                top: newTop,
                left: 0,
                bottom: newBottom,
                right: numCols - 1
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
                right: numCols - 1
            });
        }
        e.preventDefault();
    };

    const [selectionResize, setSelectionResize] = useState({
        active: false,
        handle: null,
        startX: 0,
        startY: 0,
        initialSelection: null
    });

    useEffect(() => {
        if (!selectionResize.active) return;
        function onSelectionResizeMouseMove(e) {
            const containerRect = gridContainerRef.current.getBoundingClientRect();
            const relativeX = e.clientX - containerRect.left + scrollPos.current.left;
            const relativeY = e.clientY - containerRect.top + scrollPos.current.top;
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
            const newTop =
                rowHeightsCumulative[selection.top] - scrollPos.current.top;
            const newLeft =
                colWidthsCumulative[selection.left] - scrollPos.current.left;
            Object.assign(selectionOverlayRef.current.style, {
                top: newTop + "px",
                left: newLeft + "px",
                width:
                    colWidthsCumulative[selection.right + 1] -
                    colWidthsCumulative[selection.left] + "px",
                height:
                    rowHeightsCumulative[selection.bottom + 1] -
                    rowHeightsCumulative[selection.top] + "px"
            });
        }
    }, [selection, rowHeightsCumulative, colWidthsCumulative]);

    return (
        <div
            className="dinolabsIDEContentWrapper"
            onClick={(e) => {
                if (skipClear) {
                    setSkipClear(false);
                    return;
                }
                if (
                    e.target.closest(".toolbar-wrapper") ||
                    e.target.closest(".dinolabsIDEEditingSearchBoxWrapper")
                )
                    return;
                if (
                    e.target.closest(".dinolabsIDETableColumnHeaderCell") ||
                    e.target.closest(".dinolabsIDETableRowHeaderCell") ||
                    e.target.closest(".dinolabsIDETableCornerHeader")
                )
                    return;
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
                {`@keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                  }`}
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
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onCut={handleCut}
                    onCopy={handleCopy}
                    onPaste={handlePaste}
                    onSelectAll={handleSelectAll}
                    onSearchReplace={() => {
                        commitActiveCellIfNeeded();
                        setShowSearchPanel(true);
                    }}
                    openModal={openModal}
                    toggleModal={toggleModal}
                    closeAllMenus={() => {
                        setOpenMenu(null);
                        setOpenModal(null);
                    }}
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
            <div
                className="dinolabsIDETableWrapperContainer"
                ref={tableWrapperContainerRef}
            >
                <div
                    style={{
                        width: `${(100 * 100) / pageZoom}%`,
                        height: `${(100 * 100) / pageZoom}%`
                    }}
                >
                    <div
                        className="dinolabsIDETableWrapper"
                        style={{
                            transform: `scale(${pageZoom / 100})`,
                            transformOrigin: "top left"
                        }}
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
                        <div
                            className="dinolabsIDETableCornerHeader"
                            style={{ zIndex: 10 }}
                            onMouseDown={(e) => {
                                commitActiveCellIfNeeded();
                                if (
                                    selection &&
                                    selection.top === 0 &&
                                    selection.left === 0 &&
                                    selection.bottom === numRows - 1 &&
                                    selection.right === numCols - 1
                                ) {
                                    setSelection(null);
                                } else {
                                    setSelection({
                                        top: 0,
                                        left: 0,
                                        bottom: numRows - 1,
                                        right: numCols - 1
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
                                style={{
                                    width:
                                        effectiveCols <= colWidths.length
                                            ? colWidthsCumulative[effectiveCols]
                                            : colWidthsCumulative[colWidths.length] +
                                              (effectiveCols - colWidths.length) *
                                                  DEFAULT_COL_WIDTH
                                }}
                            >
                                {Array.from({ length: effectiveCols }).map(
                                    (_, colIndex) => {
                                        const leftOffset =
                                            colIndex < colWidths.length
                                                ? colWidthsCumulative[colIndex]
                                                : colWidthsCumulative[colWidths.length] +
                                                  (colIndex - colWidths.length) *
                                                      DEFAULT_COL_WIDTH;
                                        const width =
                                            colIndex < colWidths.length
                                                ? colWidths[colIndex]
                                                : DEFAULT_COL_WIDTH;
                                        const label = getColumnLabel(colIndex);
                                        const isSelectedHeader =
                                            selection &&
                                            colIndex >= selection.left &&
                                            colIndex <= selection.right &&
                                            selection.top === 0 &&
                                            selection.bottom === numRows - 1;
                                        return (
                                            <div
                                                key={colIndex}
                                                className="dinolabsIDETableColumnHeaderCell"
                                                style={{
                                                    left: leftOffset,
                                                    width,
                                                    backgroundColor: isSelectedHeader
                                                        ? "#444"
                                                        : "#333"
                                                }}
                                                onMouseDown={(e) =>
                                                    handleColumnHeaderMouseDown(e, colIndex)
                                                }
                                            >
                                                {label}
                                            </div>
                                        );
                                    }
                                )}
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
                                style={{
                                    height:
                                        effectiveRows <= rowHeights.length
                                            ? rowHeightsCumulative[effectiveRows]
                                            : rowHeightsCumulative[rowHeights.length] +
                                              (effectiveRows - rowHeights.length) *
                                                  DEFAULT_ROW_HEIGHT
                                }}
                            >
                                {Array.from({ length: effectiveRows }).map(
                                    (_, rowIndex) => {
                                        const topOffset =
                                            rowIndex < rowHeights.length
                                                ? rowHeightsCumulative[rowIndex]
                                                : rowHeightsCumulative[rowHeights.length] +
                                                  (rowIndex - rowHeights.length) *
                                                      DEFAULT_ROW_HEIGHT;
                                        const height =
                                            rowIndex < rowHeights.length
                                                ? rowHeights[rowIndex]
                                                : DEFAULT_ROW_HEIGHT;
                                        const isSelectedRow =
                                            selection &&
                                            rowIndex >= selection.top &&
                                            rowIndex <= selection.bottom &&
                                            selection.left === 0 &&
                                            selection.right === numCols - 1;
                                        return (
                                            <div
                                                key={rowIndex}
                                                className="dinolabsIDETableRowHeaderCell"
                                                style={{
                                                    top: topOffset,
                                                    height,
                                                    backgroundColor: isSelectedRow
                                                        ? "#3a3a3a"
                                                        : "#2c2c2c"
                                                }}
                                                onMouseDown={(e) =>
                                                    handleRowHeaderMouseDown(e, rowIndex)
                                                }
                                            >
                                                {rowIndex + 1}
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                        <div
                            ref={gridContainerRef}
                            className="dinolabsIDETableGridContainer"
                        >
                            <AutoSizer>
                                {({ width, height }) => {
                                    if (
                                        width !== autoSizerDims.width ||
                                        height !== autoSizerDims.height
                                    ) {
                                        setAutoSizerDims({ width, height });
                                    }
                                    return (
                                        <Grid
                                            ref={dataGridRef}
                                            columnCount={effectiveCols}
                                            rowCount={effectiveRows}
                                            columnWidth={getColWidth}
                                            rowHeight={getRowHeight}
                                            width={width}
                                            height={height}
                                            itemData={itemData}
                                            onScroll={({ scrollLeft, scrollTop }) => {
                                                if (
                                                    columnHeaderRef.current &&
                                                    columnHeaderRef.current.firstChild
                                                ) {
                                                    columnHeaderRef.current.firstChild.style.transform = `translateX(${-scrollLeft}px)`;
                                                }
                                                if (
                                                    rowHeaderRef.current &&
                                                    rowHeaderRef.current.firstChild
                                                ) {
                                                    rowHeaderRef.current.firstChild.style.transform = `translateY(${-scrollTop}px)`;
                                                }
                                                scrollPos.current.left = scrollLeft;
                                                scrollPos.current.top = scrollTop;
                                                if (selection && selectionOverlayRef.current) {
                                                    const newTop =
                                                        rowHeightsCumulative[selection.top];
                                                    const newLeft =
                                                        colWidthsCumulative[selection.left];
                                                    selectionOverlayRef.current.style.top =
                                                        newTop - scrollTop + "px";
                                                    selectionOverlayRef.current.style.left =
                                                        newLeft - scrollLeft + "px";
                                                }
                                                expandIfNeeded(scrollLeft, scrollTop, width, height);
                                            }}
                                        >
                                            {cellRenderer}
                                        </Grid>
                                    );
                                }}
                            </AutoSizer>
                            {selection && (
                                <div style={{ position: "absolute", top: 0, left: 0 }}>
                                    <div
                                        ref={selectionOverlayRef}
                                        className="dinolabsIDETableSelectionOverlay"
                                        onMouseDown={handleSelectionMouseDown}
                                        style={{
                                            ...overlayDynamicStyle,
                                            zIndex: 0,
                                            cursor: selectionDrag.active
                                                ? "grabbing"
                                                : "grab",
                                            transform: selectionDrag.active
                                                ? `translate(${selectionDrag.offsetX}px, ${selectionDrag.offsetY}px)`
                                                : "none"
                                        }}
                                    >
                                        <div
                                            className="dinolabsIDETableSelectionHandleTop"
                                            onMouseDown={(e) => startSelectionResize("top", e)}
                                        />
                                        <div
                                            className="dinolabsIDETableSelectionHandleBottom"
                                            onMouseDown={(e) =>
                                                startSelectionResize("bottom", e)
                                            }
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
                                            onMouseDown={(e) =>
                                                startSelectionResize("bottom-right", e)
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="dinolabsIDERowColumnOperationsButtonWrapper">
                <button className="dinolabsIDERowColumnOperationsButton" onClick={addRow}>
                    <FontAwesomeIcon icon={faSquarePlus} />
                    Add Row
                </button>
                <button
                    className="dinolabsIDERowColumnOperationsButton"
                    onClick={addColumn}
                >
                    <FontAwesomeIcon icon={faSquareMinus} />
                    Add Column
                </button>
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
                            <FontAwesomeIcon
                                icon={faArrowRightFromBracket}
                                style={{ transform: "scaleX(-1)" }}
                            />
                            Close Search
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
