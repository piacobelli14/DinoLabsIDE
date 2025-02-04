import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { showDialog } from "../DinoLabsIDEAlert.jsx";
import "../../styles/mainStyles/TabularEditorStyles/DinoLabsIDETabularEditor.css";

function sumRange(arr, from, to) {
    let total = 0;
    for (let i = from; i < to; i++) {
        total += arr[i] || 0;
    }
    return total;
}

function getColumnLabel(colIndex) {
    let label = '';
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
    const DATA_ROW_COUNT = 1000;
    const DATA_COL_COUNT = 100;

    function parseCSV(text) {
        const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
        const data = {};
        lines.forEach((line, r) => {
            const cells = line.split(',');
            cells.forEach((cell, c) => {
                if (cell.trim()) {
                    data[`${r},${c}`] = cell.trim();
                }
            });
        });
        return data;
    }
    const parsers = { csv: parseCSV };

    useEffect(() => {
        async function loadFile() {
            try {
                const file =
                    typeof fileHandle?.getFile === 'function'
                        ? await fileHandle.getFile()
                        : fileHandle;
                if (!file) {
                    setLoading(false);
                    return;
                }
                const ext = file.name.split('.').pop().toLowerCase();
                if (!parsers[ext]) throw new Error(`Unsupported file type: .${ext}`);
                const text = await file.text();
                const data = parseCSV(text);
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

    function handleEditCell(row, col, val) {
        setTableData(prev => ({
            ...prev,
            [`${row},${col}`]: val
        }));
    }

    const DEFAULT_ROW_HEIGHT = 24;
    const DEFAULT_COL_WIDTH = 120;
    const [rowHeights, setRowHeights] = useState(
        Array.from({ length: DATA_ROW_COUNT }, () => DEFAULT_ROW_HEIGHT)
    );
    const [colWidths, setColWidths] = useState(
        Array.from({ length: DATA_COL_COUNT }, () => DEFAULT_COL_WIDTH)
    );
    const ROW_HEADER_WIDTH = 60;
    const COLUMN_HEADER_HEIGHT = 32;
    const dataGridRef = useRef(null);
    const gridContainerRef = useRef(null);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    const [activeCell, setActiveCell] = useState({ row: null, col: null });
    const [selection, setSelection] = useState(null);

    useEffect(() => {
        if (selection) {
            setActiveCell({ row: null, col: null });
        }
    }, [selection]);

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
        originalSelection: null
    });

    const [dragData, setDragData] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    function handleSelectionDragMouseDown(e) {
        if (e.button !== 0) return;
        if (e.target !== e.currentTarget) return;
        e.stopPropagation();
        e.preventDefault();
        if (selection && !dragData) {
            const newDragData = {};
            for (let r = selection.top; r <= selection.bottom; r++) {
                for (let c = selection.left; c <= selection.right; c++) {
                    newDragData[`${r},${c}`] = tableDataRef.current[`${r},${c}`] || '';
                }
            }
            setDragData(newDragData);
        }
        setSelectionDrag({
            active: true,
            startX: e.clientX,
            startY: e.clientY,
            originalSelection: selection
        });
    }

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

    const [selectionResize, setSelectionResize] = useState({
        active: false,
        handle: null,
        startX: 0,
        startY: 0,
        initialSelection: null
    });

    function startSelectionResize(handle, e) {
        e.preventDefault();
        e.stopPropagation();
        if (!selection) return;
        setSelectionResize({
            active: true,
            handle,
            startX: e.clientX,
            startY: e.clientY,
            initialSelection: { ...selection }
        });
    }

    useEffect(() => {
        if (!selectionResize.active) return;
        function onSelectionResizeMouseMove(e) {
            const containerRect = gridContainerRef.current.getBoundingClientRect();
            const relativeX = e.clientX - containerRect.left + scrollLeft;
            const relativeY = e.clientY - containerRect.top + scrollTop;
            let { top, left, bottom, right } = selectionResize.initialSelection;
            switch (selectionResize.handle) {
                case 'top': {
                    const newTop = getRowIndexFromPosition(relativeY);
                    top = Math.min(newTop, bottom);
                    break;
                }
                case 'bottom': {
                    const newBottom = getRowIndexFromPosition(relativeY);
                    bottom = Math.max(newBottom, top);
                    break;
                }
                case 'left': {
                    const newLeft = getColIndexFromPosition(relativeX);
                    left = Math.min(newLeft, right);
                    break;
                }
                case 'right': {
                    const newRight = getColIndexFromPosition(relativeX);
                    right = Math.max(newRight, left);
                    break;
                }
                case 'top-left': {
                    const newTop = getRowIndexFromPosition(relativeY);
                    const newLeft = getColIndexFromPosition(relativeX);
                    top = Math.min(newTop, bottom);
                    left = Math.min(newLeft, right);
                    break;
                }
                case 'top-right': {
                    const newTop = getRowIndexFromPosition(relativeY);
                    const newRight = getColIndexFromPosition(relativeX);
                    top = Math.min(newTop, bottom);
                    right = Math.max(newRight, left);
                    break;
                }
                case 'bottom-left': {
                    const newBottom = getRowIndexFromPosition(relativeY);
                    const newLeft = getColIndexFromPosition(relativeX);
                    bottom = Math.max(newBottom, top);
                    left = Math.min(newLeft, right);
                    break;
                }
                case 'bottom-right': {
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
        window.addEventListener('mousemove', onSelectionResizeMouseMove);
        window.addEventListener('mouseup', onSelectionResizeMouseUp, true);
        return () => {
            window.removeEventListener('mousemove', onSelectionResizeMouseMove);
            window.removeEventListener('mouseup', onSelectionResizeMouseUp, true);
        };
    }, [selectionResize, scrollLeft, scrollTop, rowHeights, colWidths]);

    useEffect(() => {
        if (!selectionDrag.active) return;
        function onSelectionDragMouseMove(e) {
            if (dialogOpen) return;
            if (!selectionDrag.active) return;
            const { originalSelection, startX, startY } = selectionDrag;
            const originalTopOffset = sumRange(rowHeights, 0, originalSelection.top);
            const originalLeftOffset = sumRange(colWidths, 0, originalSelection.left);
            const deltaY = e.clientY - startY;
            const deltaX = e.clientX - startX;
            const newTopPixel = originalTopOffset + deltaY;
            const newLeftPixel = originalLeftOffset + deltaX;
            const newTopIndex = getRowIndexFromPosition(newTopPixel);
            const newLeftIndex = getColIndexFromPosition(newLeftPixel);
            const rowCount = originalSelection.bottom - originalSelection.top;
            const colCount = originalSelection.right - originalSelection.left;
            let newTop = newTopIndex;
            let newLeft = newLeftIndex;
            let newBottom = newTop + rowCount;
            let newRight = newLeft + colCount;
            if (newBottom >= DATA_ROW_COUNT) {
                newBottom = DATA_ROW_COUNT - 1;
                newTop = newBottom - rowCount;
            }
            if (newRight >= DATA_COL_COUNT) {
                newRight = DATA_COL_COUNT - 1;
                newLeft = newRight - colCount;
            }
            setSelection({ top: newTop, left: newLeft, bottom: newBottom, right: newRight });
        }
        async function onSelectionDragMouseUp() {
            if (dialogOpen) return;
            setDialogOpen(true);
            if (dragData && selectionDrag.originalSelection && selection) {
                const orig = selectionDrag.originalSelection;
                const dest = selection;
                const offsetRow = dest.top - orig.top;
                const offsetCol = dest.left - orig.left;
                let shouldAlert = false;
                for (let r = dest.top; r <= dest.bottom; r++) {
                    for (let c = dest.left; c <= dest.right; c++) {
                        const destKey = `${r},${c}`;
                        const srcKey = `${r - offsetRow},${c - offsetCol}`;
                        const destVal = (tableDataRef.current[destKey] || "").trim();
                        const srcVal = (dragData[srcKey] || "").trim();
                        if (destVal !== "" && destVal !== srcVal) {
                            shouldAlert = true;
                            break;
                        }
                    }
                    if (shouldAlert) break;
                }
                if (shouldAlert) {
                    const alertResult = await showDialog({
                        title: 'System Alert',
                        message: 'The data being dragged over will be replaced. Do you want to continue?',
                        showCancel: true
                    });
                    if (alertResult === null) {
                        setDragData(null);
                        setSelectionDrag({ active: false, startX: 0, startY: 0, originalSelection: null });
                        setDialogOpen(false);
                        return;
                    }
                }
                const newData = { ...tableDataRef.current };
                for (let r = orig.top; r <= orig.bottom; r++) {
                    for (let c = orig.left; c <= orig.right; c++) {
                        delete newData[`${r},${c}`];
                    }
                }
                for (let r = orig.top; r <= orig.bottom; r++) {
                    for (let c = orig.left; c <= orig.right; c++) {
                        const destKey = `${r + offsetRow},${c + offsetCol}`;
                        newData[destKey] = dragData[`${r},${c}`];
                    }
                }
                setTableData(newData);
                tableDataRef.current = newData;
                dataGridRef.current?.resetAfterRowIndex(0, true);
            }
            setDragData(null);
            setSelectionDrag({ active: false, startX: 0, startY: 0, originalSelection: null });
            setDialogOpen(false);
        }
        window.addEventListener('mousemove', onSelectionDragMouseMove);
        window.addEventListener('mouseup', onSelectionDragMouseUp, true);
        return () => {
            window.removeEventListener('mousemove', onSelectionDragMouseMove);
            window.removeEventListener('mouseup', onSelectionDragMouseUp, true);
        };
    }, [selectionDrag, rowHeights, colWidths, selection, dragData, dialogOpen]);

    const [resizing, setResizing] = useState({
        active: false,
        type: null,
        index: null,
        startPos: 0,
        startSize: 0
    });
    const onGlobalMouseMove = useCallback(
        e => {
            if (!resizing.active) return;
            const { type, index, startPos, startSize } = resizing;
            const delta = type === 'row' ? e.clientY - startPos : e.clientX - startPos;
            let newSize = startSize + delta;
            if (newSize < 10) newSize = 10;
            if (type === 'row') {
                setRowHeights(prev => {
                    const copy = [...prev];
                    copy[index] = newSize;
                    return copy;
                });
                dataGridRef.current?.resetAfterRowIndex(index);
            } else {
                setColWidths(prev => {
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
        window.addEventListener('mousemove', onGlobalMouseMove);
        window.addEventListener('mouseup', onGlobalMouseUpResizing);
        return () => {
            window.removeEventListener('mousemove', onGlobalMouseMove);
            window.removeEventListener('mouseup', onGlobalMouseUpResizing);
        };
    }, [onGlobalMouseMove, onGlobalMouseUpResizing]);

    function startResizingRow(rowIndex, e) {
        e.stopPropagation();
        e.preventDefault();
        setResizing({
            active: true,
            type: 'row',
            index: rowIndex,
            startPos: e.clientY,
            startSize: rowHeights[rowIndex]
        });
    }
    function startResizingCol(colIndex, e) {
        e.stopPropagation();
        e.preventDefault();
        setResizing({
            active: true,
            type: 'col',
            index: colIndex,
            startPos: e.clientX,
            startSize: colWidths[colIndex]
        });
    }

    const columnHeaderRef = useRef(null);
    const rowHeaderRef = useRef(null);
    const [headerDrag, setHeaderDrag] = useState(null);

    function handleColumnHeaderMouseMove(e) {
        if (headerDrag && headerDrag.type === 'col' && columnHeaderRef.current) {
            const rect = columnHeaderRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left + scrollLeft;
            const col = getColIndexFromPosition(x);
            setHeaderDrag(prev => {
                const newDrag = { ...prev, current: col };
                const left = Math.min(newDrag.start, newDrag.current);
                const right = Math.max(newDrag.start, newDrag.current);
                setSelection({ top: 0, left, bottom: DATA_ROW_COUNT - 1, right });
                return newDrag;
            });
        }
    }
    function handleColumnHeaderMouseUp(e) {
        if (headerDrag && headerDrag.type === 'col') {
            setHeaderDrag(null);
        }
    }
    function handleRowHeaderMouseMove(e) {
        if (headerDrag && headerDrag.type === 'row' && rowHeaderRef.current) {
            const rect = rowHeaderRef.current.getBoundingClientRect();
            const y = e.clientY - rect.top + scrollTop;
            const row = getRowIndexFromPosition(y);
            setHeaderDrag(prev => {
                const newDrag = { ...prev, current: row };
                const top = Math.min(newDrag.start, newDrag.current);
                const bottom = Math.max(newDrag.start, newDrag.current);
                setSelection({ top, left: 0, bottom, right: DATA_COL_COUNT - 1 });
                return newDrag;
            });
        }
    }
    function handleRowHeaderMouseUp(e) {
        if (headerDrag && headerDrag.type === 'row') {
            setHeaderDrag(null);
        }
    }

    function handleCellMouseDown(rowIndex, colIndex, e) {
        if (e.button !== 0) return;
        setSelection(null);
        setCellDrag({
            active: true,
            startRow: rowIndex,
            startCol: colIndex,
            startX: e.clientX,
            startY: e.clientY,
            selecting: false
        });
        setActiveCell({ row: rowIndex, col: colIndex });
    }
    function handleCellMouseUp(rowIndex, colIndex, e) {
        e.stopPropagation();
        if (cellDrag.selecting) {
        } else {
            setActiveCell({ row: rowIndex, col: colIndex });
            setSelection(null);
        }
        setCellDrag({
            active: false,
            startRow: null,
            startCol: null,
            startX: 0,
            startY: 0,
            selecting: false
        });
    }
    useEffect(() => {
        function onWindowMouseMove(e) {
            setCellDrag(current => {
                if (!current.active) return current;
                const dx = e.clientX - current.startX;
                const dy = e.clientY - current.startY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (!current.selecting && distance > 5) {
                    return { ...current, selecting: true };
                }
                if (current.selecting) {
                    const containerRect = gridContainerRef.current.getBoundingClientRect();
                    const relativeX = e.clientX - containerRect.left + scrollLeft;
                    const relativeY = e.clientY - containerRect.top + scrollTop;
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
        window.addEventListener('mousemove', onWindowMouseMove);
        window.addEventListener('mouseup', onWindowMouseUp);
        return () => {
            window.removeEventListener('mousemove', onWindowMouseMove);
            window.removeEventListener('mouseup', onWindowMouseUp);
        };
    }, [scrollLeft, scrollTop, rowHeights, colWidths]);

    function moveActiveCellHorizontally(offset) {
        if (activeCell.row === null || activeCell.col === null) return;
        let newCol = activeCell.col + offset;
        if (newCol < 0) newCol = 0;
        if (newCol >= DATA_COL_COUNT) newCol = DATA_COL_COUNT - 1;
        setActiveCell({ row: activeCell.row, col: newCol });
    }
    function moveActiveCellVertically(offset) {
        if (activeCell.row === null || activeCell.col === null) return;
        let newRow = activeCell.row + offset;
        if (newRow < 0) newRow = 0;
        if (newRow >= DATA_ROW_COUNT) newRow = DATA_ROW_COUNT - 1;
        setActiveCell({ row: newRow, col: activeCell.col });
    }

    const renderDataCell = ({ rowIndex, columnIndex, style }) => {
        const key = `${rowIndex},${columnIndex}`;
        if (dragData && selectionDrag.active && selectionDrag.originalSelection && selection) {
            const orig = selectionDrag.originalSelection;
            const dest = selection;
            const offsetRow = dest.top - orig.top;
            const offsetCol = dest.left - orig.left;
            if (
                rowIndex >= dest.top &&
                rowIndex <= dest.bottom &&
                columnIndex >= dest.left &&
                columnIndex <= dest.right
            ) {
                const srcRow = rowIndex - offsetRow;
                const srcCol = columnIndex - offsetCol;
                if (
                    srcRow >= orig.top &&
                    srcRow <= orig.bottom &&
                    srcCol >= orig.left &&
                    srcCol <= orig.right
                ) {
                    const ghostVal = dragData[`${srcRow},${srcCol}`] || '';
                    return (
                        <div style={{ ...style }} className="dinolabsIDETableGhostCell">
                            {ghostVal}
                        </div>
                    );
                }
            }
            if (
                rowIndex >= orig.top &&
                rowIndex <= orig.bottom &&
                columnIndex >= orig.left &&
                columnIndex <= orig.right
            ) {
                return (
                    <div style={{ ...style }} className="dinolabsIDETableEmptyCell" />
                );
            }
        }
        const val = tableDataRef.current[key] || '';
        const inputRef = useRef(null);
        useEffect(() => {
            if (activeCell.row === rowIndex && activeCell.col === columnIndex) {
                if (inputRef.current && document.activeElement !== inputRef.current) {
                    inputRef.current.focus();
                }
            }
        }, [activeCell, rowIndex, columnIndex]);
        return (
            <div
                style={{ ...style }}
                className="dinolabsIDETableCell"
                onMouseDown={e => handleCellMouseDown(rowIndex, columnIndex, e)}
                onMouseUp={e => handleCellMouseUp(rowIndex, columnIndex, e)}
            >
                <input
                    ref={inputRef}
                    type="text"
                    className="dinolabsIDETableCellInput"
                    value={val}
                    onChange={e => handleEditCell(rowIndex, columnIndex, e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.target.blur();
                        } else if (e.key === 'Tab') {
                            e.preventDefault();
                            moveActiveCellHorizontally(1);
                        } else if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            moveActiveCellHorizontally(1);
                        } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            moveActiveCellHorizontally(-1);
                        } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            moveActiveCellVertically(1);
                        } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            moveActiveCellVertically(-1);
                        }
                    }}
                    onFocus={e => {
                        if (!cellDrag.selecting) {
                            if (activeCell.row !== rowIndex || activeCell.col !== columnIndex) {
                                setActiveCell({ row: rowIndex, col: columnIndex });
                            }
                            setSelection(null);
                        } else {
                            e.target.blur();
                        }
                    }}
                    onBlur={() => {
                        setActiveCell({ row: null, col: null });
                    }}
                    draggable={false}
                    onDragStart={e => e.preventDefault()}
                    style={{
                        userSelect: activeCell.row === rowIndex && activeCell.col === columnIndex ? 'text' : 'none',
                        WebkitUserSelect: activeCell.row === rowIndex && activeCell.col === columnIndex ? 'text' : 'none',
                        MozUserSelect: activeCell.row === rowIndex && activeCell.col === columnIndex ? 'text' : 'none'
                    }}
                />
            </div>
        );
    };

    const overlayDynamicStyle = selection
        ? {
            top: sumRange(rowHeights, 0, selection.top) - scrollTop,
            left: sumRange(colWidths, 0, selection.left) - scrollLeft,
            width: sumRange(colWidths, selection.left, selection.right + 1),
            height: sumRange(rowHeights, selection.top, selection.bottom + 1)
        }
        : {};

    const selectionHandles = (
        <>
            <div
                className="dinolabsIDETableSelectionHandleTop"
                onMouseDown={e => startSelectionResize('top', e)}
            />
            <div
                className="dinolabsIDETableSelectionHandleBottom"
                onMouseDown={e => startSelectionResize('bottom', e)}
            />
            <div
                className="dinolabsIDETableSelectionHandleLeft"
                onMouseDown={e => startSelectionResize('left', e)}
            />
            <div
                className="dinolabsIDETableSelectionHandleRight"
                onMouseDown={e => startSelectionResize('right', e)}
            />
            <div
                className="dinolabsIDETableSelectionHandleBottomRight"
                onMouseDown={e => startSelectionResize('bottom-right', e)}
            />
        </>
    );

    return (
        <div
            className="dinolabsIDETableWrapper"
            onSelectStart={e => e.preventDefault()}
            onMouseDown={e => {
                if (e.target.tagName !== 'INPUT') {
                    e.preventDefault();
                    if (window.getSelection) window.getSelection().removeAllRanges();
                }
            }}
            onDragStart={e => {
                if (e.target.tagName !== 'INPUT') {
                    e.preventDefault();
                }
            }}
        >
            {loading && (
                <div className="dinolabsIDETableLoadingMessage">
                    Loading...
                </div>
            )}
            {error && (
                <div className="dinolabsIDETableErrorMessage">
                    {error}
                </div>
            )}
            <div
                className="dinolabsIDETableCornerHeader"
                onMouseDown={e => {
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
                        return (
                            <div
                                key={colIndex}
                                className="dinolabsIDETableColumnHeaderCell"
                                style={{
                                    left: leftOffset,
                                    width: width,
                                    backgroundColor:
                                        selection &&
                                            colIndex >= selection.left &&
                                            colIndex <= selection.right
                                            ? '#444'
                                            : '#333'
                                }}
                                onMouseDown={e => {
                                    setHeaderDrag({ type: 'col', start: colIndex, current: colIndex });
                                    e.preventDefault();
                                }}
                            >
                                {label}
                                <div
                                    className="dinolabsIDETableColumnHeaderResizeHandle"
                                    onMouseDown={e => startResizingCol(colIndex, e)}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
            <div
                ref={rowHeaderRef}
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
                        return (
                            <div
                                key={rowIndex}
                                className="dinolabsIDETableRowHeaderCell"
                                style={{
                                    top: topOffset,
                                    height: height,
                                    backgroundColor:
                                        selection &&
                                            rowIndex >= selection.top &&
                                            rowIndex <= selection.bottom
                                            ? '#3a3a3a'
                                            : '#2c2c2c'
                                }}
                                onMouseDown={e => {
                                    setHeaderDrag({ type: 'row', start: rowIndex, current: rowIndex });
                                    e.preventDefault();
                                }}
                            >
                                {rowIndex + 1}
                                <div
                                    className="dinolabsIDETableRowHeaderResizeHandle"
                                    onMouseDown={e => startResizingRow(rowIndex, e)}
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
                            columnWidth={index => colWidths[index]}
                            rowHeight={index => rowHeights[index]}
                            width={width}
                            height={height}
                            onScroll={({ scrollLeft: sl, scrollTop: st }) => {
                                if (columnHeaderRef.current && columnHeaderRef.current.firstChild) {
                                    columnHeaderRef.current.firstChild.style.transform = `translateX(${-sl}px)`;
                                }
                                if (rowHeaderRef.current && rowHeaderRef.current.firstChild) {
                                    rowHeaderRef.current.firstChild.style.transform = `translateY(${-st}px)`;
                                }
                                setScrollLeft(sl);
                                setScrollTop(st);
                            }}
                        >
                            {renderDataCell}
                        </Grid>
                    )}
                </AutoSizer>
                {selection && (
                    <div style={{ position: 'absolute', top: 0, left: 0 }}>
                        <div
                            className="dinolabsIDETableSelectionOverlay"
                            style={overlayDynamicStyle}
                            onMouseDown={handleSelectionDragMouseDown}
                        >
                            {selectionHandles}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
