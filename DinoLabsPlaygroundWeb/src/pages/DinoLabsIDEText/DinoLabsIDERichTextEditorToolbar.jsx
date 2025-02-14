
import React from "react";
import "../../styles/mainStyles/DinoLabsIDEContent.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import DinoLabsIDEColorPicker from "../DinoLabsIDEColorPicker.jsx";
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
    faSearch,
    faSave
} from "@fortawesome/free-solid-svg-icons";

export default function DinoLabsIDERichTextEditorToolbar(props) {
    return (
        <div className="dinolabsIDEToolBar">
            <div className="dinolabsIDETitleWrapper">
                <FontAwesomeIcon icon={faPenToSquare} className="dinolabsIDEContentFileIcon" />
                <div className="dinolabsIDEFileNameStack">
                    <label className="dinolasIDEFileNameInput">{props.fileName}</label>
                    <div className="dinolabsIDEOperationsButtonsWrapper">
                        <Tippy
                            visible={props.openModal === "file"}
                            onClickOutside={() => props.closeAllMenus()}
                            placement="bottom"
                            interactive
                            className="context-menu-tippy-vertical"
                            content={
                                props.openModal === "file" && (
                                    <div
                                        className="dinolabsIDEEditingContextMenuVertical"
                                        ref={props.fileModalRef}
                                    >
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={props.saveChanges}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faSave} />
                                                {props.saveStatus === "idle" && "Save File"}
                                                {props.saveStatus === "saving" && "Saving..."}
                                                {props.saveStatus === "saved" && "Saved!"}
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={props.handleDownload}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faDownload} />
                                                Download
                                            </span>
                                        </button>
                                    </div>
                                )
                            }
                        >
                            <button
                                className="dinolabsIDEOperationsButton"
                                onMouseDown={e => {
                                    e.preventDefault();
                                    props.storeSelection();
                                }}
                                onClick={() => props.toggleModal("file")}
                                ref={props.fileButtonRef}
                            >
                                File
                            </button>
                        </Tippy>
                        <Tippy
                            visible={props.openModal === "edit"}
                            onClickOutside={() => props.closeAllMenus()}
                            placement="bottom"
                            interactive
                            className="context-menu-tippy-vertical"
                            content={
                                props.openModal === "edit" && (
                                    <div
                                        className="dinolabsIDEEditingContextMenuVertical"
                                        ref={props.editModalRef}
                                    >
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => props.execCommand("undo")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faUndo} />
                                                Undo
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => props.execCommand("redo")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faRedo} />
                                                Redo
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => props.execCommand("cut")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faCut} />
                                                Cut
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => props.execCommand("copy")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faCopy} />
                                                Copy
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={props.handlePaste}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faPaste} />
                                                Paste
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={props.handleSelectAll}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faArrowPointer} />
                                                Select All
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => {
                                                props.closeAllMenus();
                                                props.setShowSearchPanel(true);
                                            }}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faSearch} />
                                                Search/Replace
                                            </span>
                                        </button>
                                    </div>
                                )
                            }
                        >
                            <button
                                className="dinolabsIDEOperationsButton"
                                onMouseDown={e => {
                                    e.preventDefault();
                                    props.storeSelection();
                                }}
                                onClick={() => props.toggleModal("edit")}
                                ref={props.editButtonRef}
                            >
                                Edit
                            </button>
                        </Tippy>
                        <Tippy
                            visible={props.openModal === "insert"}
                            onClickOutside={() => props.closeAllMenus()}
                            placement="bottom"
                            interactive
                            className="context-menu-tippy-vertical"
                            content={
                                props.openModal === "insert" && (
                                    <div
                                        className="dinolabsIDEEditingContextMenuVertical"
                                        ref={props.insertModalRef}
                                    >
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => props.execCommand("insertUnorderedList")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faListUl} />
                                                Bulleted List
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => props.execCommand("insertOrderedList")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faListNumeric} />
                                                Numbered List
                                            </span>
                                        </button>
                                        <Tippy
                                            visible={props.openTablePicker}
                                            onClickOutside={() => {
                                                props.setOpenTablePicker(false);
                                                props.setIsTableFontColorOpen(false);
                                                props.setIsTableBackgroundColorOpen(false);
                                                props.setIsTableBorderColorOpen(false);
                                            }}
                                            placement="right-start"
                                            interactive
                                            className="context-menu-tippy-vertical"
                                            content={
                                                <div className="dinolabsIDEEditingTableGridWrapper">
                                                    <div className="dinolabsIDEEditingTableGrid">
                                                        {Array.from({ length: 80 }).map((_, idx) => {
                                                            const row = Math.floor(idx / 10) + 1;
                                                            const col = (idx % 10) + 1;
                                                            const active = row <= props.tableRows && col <= props.tableCols;
                                                            return (
                                                                <div
                                                                    className="dinolabsIDEEditingTableGridCells"
                                                                    key={idx}
                                                                    onMouseOver={() => {
                                                                        props.setTableRows(row);
                                                                        props.setTableCols(col);
                                                                    }}
                                                                    onClick={() => props.insertTable(props.tableRows, props.tableCols)}
                                                                    style={{
                                                                        background: active ? "#cce5ff" : "#f1f1f1"
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="dinolabsIDEEditingGridLabel">
                                                        {props.tableCols} x {props.tableRows}
                                                    </div>
                                                    <div className="dinolabsIDEEditingGridOperationsFlex">
                                                        <div
                                                            className="dinolabsIDEEditingInputWrapper"
                                                            style={{ border: "none" }}
                                                        >
                                                            <Tippy theme="tooltip-light" content="Font Color" placement="bottom">
                                                                <Tippy
                                                                    content={
                                                                        <DinoLabsIDEColorPicker
                                                                            color={props.tableFontColor}
                                                                            onChange={color => {
                                                                                props.restoreSelection();
                                                                                props.setTableFontColor(color);
                                                                                props.applyExistingTableStyle({ fontColor: color });
                                                                            }}
                                                                        />
                                                                    }
                                                                    visible={props.isTableFontColorOpen}
                                                                    onClickOutside={() => props.setIsTableFontColorOpen(false)}
                                                                    interactive
                                                                    placement="right"
                                                                    className="color-picker-tippy"
                                                                >
                                                                    <div className="dinolabsIDEColorWrapper">
                                                                        <FontAwesomeIcon icon={faFont} />
                                                                        <label
                                                                            className="dinolabsIDEColorPicker"
                                                                            onMouseDown={props.storeSelection}
                                                                            onClick={() => {
                                                                                props.setIsTableFontColorOpen(prev => !prev);
                                                                                props.setIsTableBackgroundColorOpen(false);
                                                                                props.setIsTableBorderColorOpen(false);
                                                                            }}
                                                                            style={{
                                                                                backgroundColor: props.tableFontColor
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </Tippy>
                                                            </Tippy>
                                                        </div>
                                                        <div className="dinolabsIDEEditingInputWrapper">
                                                            <Tippy  theme="tooltip-light" content="Background Color" placement="bottom">
                                                                <Tippy
                                                                    content={
                                                                        <DinoLabsIDEColorPicker
                                                                            color={props.tableBackgroundColor}
                                                                            onChange={color => {
                                                                                props.restoreSelection();
                                                                                props.setTableBackgroundColor(color);
                                                                                props.applyExistingTableStyle({ backgroundColor: color });
                                                                            }}
                                                                        />
                                                                    }
                                                                    visible={props.isTableBackgroundColorOpen}
                                                                    onClickOutside={() => props.setIsTableBackgroundColorOpen(false)}
                                                                    interactive
                                                                    placement="right"
                                                                    className="color-picker-tippy"
                                                                >
                                                                    <div className="dinolabsIDEColorWrapper">
                                                                        <FontAwesomeIcon icon={faDroplet} />
                                                                        <label
                                                                            className="dinolabsIDEColorPicker"
                                                                            onMouseDown={props.storeSelection}
                                                                            onClick={() => {
                                                                                props.setIsTableBackgroundColorOpen(prev => !prev);
                                                                                props.setIsTableFontColorOpen(false);
                                                                                props.setIsTableBorderColorOpen(false);
                                                                            }}
                                                                            style={{
                                                                                backgroundColor: props.tableBackgroundColor
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </Tippy>
                                                            </Tippy>
                                                        </div>
                                                        <div className="dinolabsIDEEditingInputWrapper">
                                                            <Tippy  theme="tooltip-light" content="Border Color" placement="bottom">
                                                                <Tippy
                                                                    content={
                                                                        <DinoLabsIDEColorPicker
                                                                            color={props.tableBorderColor}
                                                                            onChange={color => {
                                                                                props.restoreSelection();
                                                                                props.setTableBorderColor(color);
                                                                                props.applyExistingTableStyle({ borderColor: color });
                                                                            }}
                                                                        />
                                                                    }
                                                                    visible={props.isTableBorderColorOpen}
                                                                    onClickOutside={() => props.setIsTableBorderColorOpen(false)}
                                                                    interactive
                                                                    placement="right"
                                                                    className="color-picker-tippy"
                                                                >
                                                                    <div className="dinolabsIDEColorWrapper">
                                                                        <FontAwesomeIcon icon={faBorderStyle} />
                                                                        <label
                                                                            className="dinolabsIDEColorPicker"
                                                                            onMouseDown={props.storeSelection}
                                                                            onClick={() => {
                                                                                props.setIsTableBorderColorOpen(prev => !prev);
                                                                                props.setIsTableFontColorOpen(false);
                                                                                props.setIsTableBackgroundColorOpen(false);
                                                                            }}
                                                                            style={{
                                                                                backgroundColor: props.tableBorderColor
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </Tippy>
                                                            </Tippy>
                                                        </div>
                                                    </div>
                                                    <div className="dinolabsIDEEditingGridOperationsFlex">
                                                        <div
                                                            className="dinolabsIDEEditingInputWrapper"
                                                            style={{ border: "none" }}
                                                        >
                                                            <Tippy content="Border Width" placement="bottom">
                                                                <select
                                                                    className="dinolabsIDEEditingSelect"
                                                                    style={{ border: "none" }}
                                                                    value={props.tableBorderWidth}
                                                                    onMouseDown={props.storeSelection}
                                                                    onChange={e => {
                                                                        props.restoreSelection();
                                                                        props.setTableBorderWidth(e.target.value);
                                                                        props.applyExistingTableStyle({ borderWidth: e.target.value });
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
                                                className="dinolabsIDEEditingContextMenuButtonWrapper"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => {
                                                    props.setOpenTablePicker(prev => !prev);
                                                    props.setIsTableFontColorOpen(false);
                                                    props.setIsTableBackgroundColorOpen(false);
                                                    props.setIsTableBorderColorOpen(false);
                                                }}
                                                ref={props.tableButtonRef}
                                            >
                                                <span>
                                                    <FontAwesomeIcon icon={faTable} />
                                                    Table
                                                </span>
                                                <FontAwesomeIcon icon={faCaretRight} />
                                            </button>
                                        </Tippy>
                                        <Tippy
                                            visible={props.openSpecialCharPicker}
                                            onClickOutside={() => {
                                                props.setOpenSpecialCharPicker(false);
                                                props.setOpenMathPicker(false);
                                                props.setOpenLatinPicker(false);
                                                props.setOpenGreekPicker(false);
                                                props.setOpenPunctuationPicker(false);
                                            }}
                                            placement="right-start"
                                            interactive
                                            className="context-menu-tippy-vertical"
                                            content={
                                                <div className="dinolabsIDEEditingContextMenuVertical">
                                                    <Tippy
                                                        visible={props.openMathPicker}
                                                        onClickOutside={() => props.setOpenMathPicker(false)}
                                                        placement="right-start"
                                                        interactive
                                                        className="context-menu-tippy-vertical"
                                                        content={
                                                            <div className="dinolabsIDEEditingTableGridWrapper">
                                                                <div className="dinolabsIDEEditingTableGrid">
                                                                    {props.mathSymbols.map(symbol => (
                                                                        <div
                                                                            key={symbol}
                                                                            className="dinolabsIDEEditingTableGridCells"
                                                                            onMouseDown={e => e.preventDefault()}
                                                                            onClick={() => props.insertSpecialCharacter(symbol)}
                                                                        >
                                                                            {symbol}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        }
                                                    >
                                                        <button
                                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                                            onMouseDown={e => e.preventDefault()}
                                                            onClick={() => {
                                                                props.setOpenMathPicker(prev => !prev);
                                                                props.setOpenLatinPicker(false);
                                                                props.setOpenGreekPicker(false);
                                                                props.setOpenPunctuationPicker(false);
                                                            }}
                                                        >
                                                            <span>Math</span>
                                                            <FontAwesomeIcon icon={faCaretRight} />
                                                        </button>
                                                    </Tippy>
                                                    <Tippy
                                                        visible={props.openLatinPicker}
                                                        onClickOutside={() => props.setOpenLatinPicker(false)}
                                                        placement="right-start"
                                                        interactive
                                                        className="context-menu-tippy-vertical"
                                                        content={
                                                            <div className="dinolabsIDEEditingTableGridWrapper">
                                                                <div className="dinolabsIDEEditingTableGrid">
                                                                    {props.latinSymbols.map(symbol => (
                                                                        <div
                                                                            key={symbol}
                                                                            className="dinolabsIDEEditingTableGridCells"
                                                                            onMouseDown={e => e.preventDefault()}
                                                                            onClick={() => props.insertSpecialCharacter(symbol)}
                                                                        >
                                                                            {symbol}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        }
                                                    >
                                                        <button
                                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                                            onMouseDown={e => e.preventDefault()}
                                                            onClick={() => {
                                                                props.setOpenLatinPicker(prev => !prev);
                                                                props.setOpenMathPicker(false);
                                                                props.setOpenGreekPicker(false);
                                                                props.setOpenPunctuationPicker(false);
                                                            }}
                                                        >
                                                            <span>Latin</span>
                                                            <FontAwesomeIcon icon={faCaretRight} />
                                                        </button>
                                                    </Tippy>
                                                    <Tippy
                                                        visible={props.openGreekPicker}
                                                        onClickOutside={() => props.setOpenGreekPicker(false)}
                                                        placement="right-start"
                                                        interactive
                                                        className="context-menu-tippy-vertical"
                                                        content={
                                                            <div className="dinolabsIDEEditingTableGridWrapper">
                                                                <div className="dinolabsIDEEditingTableGrid">
                                                                    {props.greekSymbols.map(symbol => (
                                                                        <div
                                                                            key={symbol}
                                                                            className="dinolabsIDEEditingTableGridCells"
                                                                            onMouseDown={e => e.preventDefault()}
                                                                            onClick={() => props.insertSpecialCharacter(symbol)}
                                                                        >
                                                                            {symbol}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        }
                                                    >
                                                        <button
                                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                                            onMouseDown={e => e.preventDefault()}
                                                            onClick={() => {
                                                                props.setOpenGreekPicker(prev => !prev);
                                                                props.setOpenMathPicker(false);
                                                                props.setOpenLatinPicker(false);
                                                                props.setOpenPunctuationPicker(false);
                                                            }}
                                                        >
                                                            <span>Greek</span>
                                                            <FontAwesomeIcon icon={faCaretRight} />
                                                        </button>
                                                    </Tippy>
                                                    <Tippy
                                                        visible={props.openPunctuationPicker}
                                                        onClickOutside={() => props.setOpenPunctuationPicker(false)}
                                                        placement="right-start"
                                                        interactive
                                                        className="context-menu-tippy-vertical"
                                                        content={
                                                            <div className="dinolabsIDEEditingTableGridWrapper">
                                                                <div className="dinolabsIDEEditingTableGrid">
                                                                    {props.punctuationSymbols.map(symbol => (
                                                                        <div
                                                                            key={symbol}
                                                                            className="dinolabsIDEEditingTableGridCells"
                                                                            onMouseDown={e => e.preventDefault()}
                                                                            onClick={() => props.insertSpecialCharacter(symbol)}
                                                                        >
                                                                            {symbol}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        }
                                                    >
                                                        <button
                                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                                            onMouseDown={e => e.preventDefault()}
                                                            onClick={() => {
                                                                props.setOpenPunctuationPicker(prev => !prev);
                                                                props.setOpenMathPicker(false);
                                                                props.setOpenLatinPicker(false);
                                                                props.setOpenGreekPicker(false);
                                                            }}
                                                        >
                                                            <span>Special Punctuation</span>
                                                            <FontAwesomeIcon icon={faCaretRight} />
                                                        </button>
                                                    </Tippy>
                                                </div>
                                            }
                                        >
                                            <button
                                                className="dinolabsIDEEditingContextMenuButtonWrapper"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => {
                                                    props.setOpenSpecialCharPicker(prev => !prev);
                                                    props.setOpenMathPicker(false);
                                                    props.setOpenLatinPicker(false);
                                                    props.setOpenGreekPicker(false);
                                                    props.setOpenPunctuationPicker(false);
                                                }}
                                                ref={props.specialCharButtonRef}
                                            >
                                                <span>
                                                    <FontAwesomeIcon icon={faIcons} />
                                                    Special Characters
                                                </span>
                                                <FontAwesomeIcon icon={faCaretRight} />
                                            </button>
                                        </Tippy>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                                props.imageInputRef.current.click();
                                                props.closeAllMenus();
                                            }}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faImage} />
                                                Insert Image
                                            </span>
                                        </button>
                                
                                        <Tippy
                                            visible={props.openFormElementsPicker}
                                            onClickOutside={() => {
                                                props.setOpenFormElementsPicker(false);
                                                props.setIsFormElementFontColorOpen(false);
                                                props.setIsFormElementBackgroundColorOpen(false);
                                                props.setIsFormElementBorderColorOpen(false);
                                            }}
                                            placement="right-start"
                                            interactive
                                            className="context-menu-tippy-vertical"
                                            content={
                                                <div className="dinolabsIDEEditingTableGridWrapper">
                                                    <div className="dinolabsIDEEditingGridOperationsStack">
                                                        <button
                                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                                            style={{ paddingLeft: 0, paddingRight: 0 }}
                                                            onMouseDown={e => e.preventDefault()}
                                                            onClick={() => props.insertFormElement("checkbox")}
                                                        >
                                                            <span>Insert Checkbox</span>
                                                        </button>
                                                        <button
                                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                                            style={{ paddingLeft: 0, paddingRight: 0 }}
                                                            onMouseDown={e => e.preventDefault()}
                                                            onClick={() => props.insertFormElement("text")}
                                                        >
                                                            <span>Insert Text Input</span>
                                                        </button>
                                                        <button
                                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                                            style={{ paddingLeft: 0, paddingRight: 0 }}
                                                            onMouseDown={e => e.preventDefault()}
                                                            onClick={() => props.insertFormElement("number")}
                                                        >
                                                            <span>Insert Number Input</span>
                                                        </button>
                                                        <button
                                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                                            style={{ paddingLeft: 0, paddingRight: 0 }}
                                                            onMouseDown={e => e.preventDefault()}
                                                            onClick={() => props.insertFormElement("date")}
                                                        >
                                                            <span>Insert Date Picker</span>
                                                        </button>
                                                    </div>
                                                    <div className="dinolabsIDEEditingGridOperationsFlex">
                                                        <div
                                                            className="dinolabsIDEEditingInputWrapper"
                                                            style={{ border: "none" }}
                                                        >
                                                            <Tippy   theme="tooltip-light" content="Font Color" placement="bottom">
                                                                <Tippy
                                                                    content={
                                                                        <DinoLabsIDEColorPicker
                                                                            color={props.formElementFontColor}
                                                                            onChange={color => {
                                                                                props.restoreSelection();
                                                                                props.setFormElementFontColor(color);
                                                                                props.applyExistingFormElementStyle({ fontColor: color });
                                                                            }}
                                                                        />
                                                                    }
                                                                    visible={props.isFormElementFontColorOpen}
                                                                    onClickOutside={() => props.setIsFormElementFontColorOpen(false)}
                                                                    interactive
                                                                    placement="right"
                                                                    className="color-picker-tippy"
                                                                >
                                                                    <div className="dinolabsIDEColorWrapper">
                                                                        <FontAwesomeIcon icon={faFont} />
                                                                        <label
                                                                            className="dinolabsIDEColorPicker"
                                                                            onMouseDown={e => {
                                                                                e.preventDefault();
                                                                                props.storeSelection();
                                                                            }}
                                                                            onClick={() => {
                                                                                props.setIsFormElementFontColorOpen(prev => !prev);
                                                                                props.setIsFormElementBackgroundColorOpen(false);
                                                                                props.setIsFormElementBorderColorOpen(false);
                                                                            }}
                                                                            style={{
                                                                                backgroundColor: props.formElementFontColor
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </Tippy>
                                                            </Tippy>
                                                        </div>
                                                        <div className="dinolabsIDEEditingInputWrapper">
                                                            <Tippy  theme="tooltip-light" content="Background Color" placement="bottom">
                                                                <Tippy
                                                                    content={
                                                                        <DinoLabsIDEColorPicker
                                                                            color={props.formElementBackgroundColor}
                                                                            onChange={color => {
                                                                                props.restoreSelection();
                                                                                props.setFormElementBackgroundColor(color);
                                                                                props.applyExistingFormElementStyle({ backgroundColor: color });
                                                                            }}
                                                                        />
                                                                    }
                                                                    visible={props.isFormElementBackgroundColorOpen}
                                                                    onClickOutside={() =>
                                                                        props.setIsFormElementBackgroundColorOpen(false)
                                                                    }
                                                                    interactive
                                                                    placement="right"
                                                                    className="color-picker-tippy"
                                                                >
                                                                    <div className="dinolabsIDEColorWrapper">
                                                                        <FontAwesomeIcon icon={faDroplet} />
                                                                        <label
                                                                            className="dinolabsIDEColorPicker"
                                                                            onMouseDown={e => {
                                                                                e.preventDefault();
                                                                                props.storeSelection();
                                                                            }}
                                                                            onClick={() => {
                                                                                props.setIsFormElementBackgroundColorOpen(prev => !prev);
                                                                                props.setIsFormElementFontColorOpen(false);
                                                                                props.setIsFormElementBorderColorOpen(false);
                                                                            }}
                                                                            style={{
                                                                                backgroundColor: props.formElementBackgroundColor
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </Tippy>
                                                            </Tippy>
                                                        </div>
                                                        <div className="dinolabsIDEEditingInputWrapper">
                                                            <Tippy  theme="tooltip-light" content="Border Color" placement="bottom">
                                                                <Tippy
                                                                    content={
                                                                        <DinoLabsIDEColorPicker
                                                                            color={props.formElementBorderColor}
                                                                            onChange={color => {
                                                                                props.restoreSelection();
                                                                                props.setFormElementBorderColor(color);
                                                                                props.applyExistingFormElementStyle({ borderColor: color });
                                                                            }}
                                                                        />
                                                                    }
                                                                    visible={props.isFormElementBorderColorOpen}
                                                                    onClickOutside={() => props.setIsFormElementBorderColorOpen(false)}
                                                                    interactive
                                                                    placement="right"
                                                                    className="color-picker-tippy"
                                                                >
                                                                    <div className="dinolabsIDEColorWrapper">
                                                                        <FontAwesomeIcon icon={faBorderStyle} />
                                                                        <label
                                                                            className="dinolabsIDEColorPicker"
                                                                            onMouseDown={e => {
                                                                                e.preventDefault();
                                                                                props.storeSelection();
                                                                            }}
                                                                            onClick={() => {
                                                                                props.setIsFormElementBorderColorOpen(prev => !prev);
                                                                                props.setIsFormElementFontColorOpen(false);
                                                                                props.setIsFormElementBackgroundColorOpen(false);
                                                                            }}
                                                                            style={{
                                                                                backgroundColor: props.formElementBorderColor
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </Tippy>
                                                            </Tippy>
                                                        </div>
                                                    </div>
                                                    <div className="dinolabsIDEEditingGridOperationsFlex">
                                                        <div
                                                            className="dinolabsIDEEditingInputWrapper"
                                                            style={{ border: "none" }}
                                                        >
                                                            <Tippy content="Border Width" placement="bottom">
                                                                <select
                                                                    className="dinolabsIDEEditingSelect"
                                                                    style={{ border: "none" }}
                                                                    value={props.formElementBorderWidth}
                                                                    onMouseDown={props.storeSelection}
                                                                    onChange={e => {
                                                                        props.restoreSelection();
                                                                        props.setFormElementBorderWidth(e.target.value);
                                                                        props.applyExistingFormElementStyle({ borderWidth: e.target.value });
                                                                    }}
                                                                >
                                                                    <option value="1px">1px</option>
                                                                    <option value="2px">2px</option>
                                                                    <option value="3px">3px</option>
                                                                    <option value="4px">4px</option>
                                                                </select>
                                                            </Tippy>
                                                        </div>
                                                        <div
                                                            className="dinolabsIDEEditingInputWrapper"
                                                            style={{ border: "none" }}
                                                        >
                                                            <Tippy content="Font Size" placement="bottom" theme="tooltip-light">
                                                                <select
                                                                    className="dinolabsIDEEditingSelect"
                                                                    style={{ border: "none" }}
                                                                    value={props.formElementFontSize}
                                                                    onMouseDown={props.storeSelection}
                                                                    onChange={e => {
                                                                        props.restoreSelection();
                                                                        props.setFormElementFontSize(e.target.value);
                                                                        props.applyExistingFormElementStyle({ fontSize: e.target.value });
                                                                    }}
                                                                >
                                                                    <option value="10px">10px</option>
                                                                    <option value="12px">12px</option>
                                                                    <option value="14px">14px</option>
                                                                    <option value="16px">16px</option>
                                                                    <option value="18px">18px</option>
                                                                    <option value="24px">24px</option>
                                                                    <option value="32px">32px</option>
                                                                </select>
                                                            </Tippy>
                                                        </div>
                                                        <div
                                                            className="dinolabsIDEEditingInputWrapper"
                                                            style={{ border: "none" }}
                                                        >
                                                            <Tippy content="Font Weight" placement="bottom" theme="tooltip-light">
                                                                <select
                                                                    className="dinolabsIDEEditingSelect"
                                                                    style={{ border: "none" }}
                                                                    value={props.formElementFontWeight}
                                                                    onMouseDown={props.storeSelection}
                                                                    onChange={e => {
                                                                        props.restoreSelection();
                                                                        props.setFormElementFontWeight(e.target.value);
                                                                        props.applyExistingFormElementStyle({ fontWeight: e.target.value });
                                                                    }}
                                                                >
                                                                    <option value="normal">Normal</option>
                                                                    <option value="bold">Bold</option>
                                                                    <option value="bolder">Bolder</option>
                                                                    <option value="lighter">Lighter</option>
                                                                </select>
                                                            </Tippy>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <button
                                                className="dinolabsIDEEditingContextMenuButtonWrapper"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => {
                                                    props.setOpenFormElementsPicker(prev => !prev);
                                                    props.setIsFormElementFontColorOpen(false);
                                                    props.setIsFormElementBackgroundColorOpen(false);
                                                    props.setIsFormElementBorderColorOpen(false);
                                                }}
                                                ref={props.formElementsButtonRef}
                                            >
                                                <span>
                                                    <FontAwesomeIcon icon={faICursor} />
                                                    Form Elements
                                                </span>
                                                <FontAwesomeIcon icon={faCaretRight} />
                                            </button>
                                        </Tippy>
                                    </div>
                                )
                            }
                        >
                            <button
                                className="dinolabsIDEOperationsButton"
                                onMouseDown={e => {
                                    e.preventDefault();
                                    props.storeSelection();
                                }}
                                onClick={() => props.toggleModal("insert")}
                                ref={props.insertButtonRef}
                            >
                                Insert
                            </button>
                        </Tippy>
                        <Tippy
                            visible={props.openModal === "format"}
                            onClickOutside={() => props.closeAllMenus()}
                            placement="bottom"
                            interactive
                            className="context-menu-tippy-vertical"
                            content={
                                props.openModal === "format" && (
                                    <div
                                        className="dinolabsIDEEditingContextMenuVertical"
                                        ref={props.formatModalRef}
                                    >
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => props.handleAlign("justifyLeft")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faAlignLeft} />
                                                Align Left
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => props.handleAlign("justifyCenter")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faAlignCenter} />
                                                Align Center
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => props.handleAlign("justifyRight")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faAlignRight} />
                                                Align Right
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => props.handleAlign("justifyFull")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faAlignJustify} />
                                                Justify
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => props.execCommand("indent")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faIndent} />
                                                Indent
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => props.execCommand("outdent")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faOutdent} />
                                                Outdent
                                            </span>
                                        </button>
                                    </div>
                                )
                            }
                        >
                            <button
                                className="dinolabsIDEOperationsButton"
                                onMouseDown={e => {
                                    e.preventDefault();
                                    props.storeSelection();
                                }}
                                onClick={() => props.toggleModal("format")}
                                ref={props.formatButtonRef}
                            >
                                Format
                            </button>
                        </Tippy>
                        <Tippy
                            visible={props.openModal === "tools"}
                            onClickOutside={() => props.closeAllMenus()}
                            placement="bottom"
                            interactive
                            className="context-menu-tippy-vertical"
                            content={
                                props.openModal === "tools" && (
                                    <div
                                        className="dinolabsIDEEditingContextMenuVertical"
                                        ref={props.toolsModalRef}
                                    >
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={props.handleWordCount}
                                        >
                                            <span>Word Count</span>
                                        </button>
                                    </div>
                                )
                            }
                        >
                            <button
                                className="dinolabsIDEOperationsButton"
                                onMouseDown={e => {
                                    e.preventDefault();
                                    props.storeSelection();
                                }}
                                onClick={() => props.toggleModal("tools")}
                                ref={props.toolsButtonRef}
                            >
                                Tools
                            </button>
                        </Tippy>
                    </div>
                </div>
            </div>
            <div className="dinolabsIDEEditingButtonsWrapper">
                <div className="dinolabsIDEEditingInputWrapper" style={{ borderLeft: "none" }}>
                    <Tippy content="Decrease Font Size" placement="bottom" theme="tooltip-light">
                        <button
                            className="dinolabsIDEEditingButton"
                            onMouseDown={e => e.preventDefault()}
                            onClick={props.decreaseFontSize}
                        >
                            <FontAwesomeIcon icon={faMinus} />
                        </button>
                    </Tippy>
                    <input
                        className="dinolabsIDEEditingInput"
                        value={`${props.currentFontSize}px`}
                        readOnly
                    />
                    <Tippy content="Increase Font Size" placement="bottom" theme="tooltip-light">
                        <button
                            className="dinolabsIDEEditingButton"
                            onMouseDown={e => e.preventDefault()}
                            onClick={props.increaseFontSize}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </Tippy>
                </div>
                <div className="dinolabsIDEEditingInputWrapper">
                    <Tippy content="Change Font Style" placement="bottom" theme="tooltip-light">
                        <select
                            className="dinolabsIDEEditingSelect"
                            value={props.fontStyle}
                            onMouseDown={props.storeSelection}
                            onChange={props.handleFontStyleChange}
                        >
                            <option value="H1">Header 1</option>
                            <option value="H2">Header 2</option>
                            <option value="H3">Header 3</option>
                            <option value="P">Paragraph</option>
                        </select>
                    </Tippy>
                </div>
                <div className="dinolabsIDEEditingInputWrapper">
                    <Tippy content="Change Font Type" placement="bottom" theme="tooltip-light">
                        <select
                            className="dinolabsIDEEditingSelect"
                            value={props.fontType}
                            onMouseDown={props.storeSelection}
                            onChange={props.handleFontTypeChange}
                        >
                            <option value="Arial">Arial</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Georgia">Georgia</option>
                        </select>
                    </Tippy>
                </div>
                <div className="dinolabsIDEEditingInputWrapper">
                    <Tippy content="Bold " placement="bottom" theme="tooltip-light">
                        <button
                            className="dinolabsIDEEditingButton"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => props.execCommand("bold")}
                        >
                            <FontAwesomeIcon icon={faBold} />
                        </button>
                    </Tippy>
                    <Tippy content="Italicize " placement="bottom" theme="tooltip-light">
                        <button
                            className="dinolabsIDEEditingButton"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => props.execCommand("italic")}
                        >
                            <FontAwesomeIcon icon={faItalic} />
                        </button>
                    </Tippy>
                    <Tippy content="Underline " placement="bottom" theme="tooltip-light">
                        <button
                            className="dinolabsIDEEditingButton"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => props.execCommand("underline")}
                        >
                            <FontAwesomeIcon icon={faUnderline} />
                        </button>
                    </Tippy>
                    <Tippy content="Strikethrough " placement="bottom" theme="tooltip-light">
                        <button
                            className="dinolabsIDEEditingButton"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => props.execCommand("strikeThrough")}
                        >
                            <FontAwesomeIcon icon={faStrikethrough} />
                        </button>
                    </Tippy>
                </div>
                <div className="dinolabsIDEEditingInputWrapper">
                    <Tippy content="Alignment Options" placement="bottom" theme="tooltip-light">
                        <Tippy
                            visible={props.openModal === "align"}
                            onClickOutside={() => props.closeAllMenus()}
                            placement="bottom"
                            interactive
                            className="context-menu-tippy-horizontal"
                            content={
                                props.openModal === "align" && (
                                    <div
                                        className="dinolabsIDEEditingContextMenuHorizontal"
                                        ref={props.alignModalRef}
                                    >
                                        <Tippy content="Align Left" placement="bottom">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => props.handleAlign("justifyLeft")}
                                            >
                                                <FontAwesomeIcon icon={faAlignLeft} />
                                            </button>
                                        </Tippy>
                                        <Tippy content="Align Center" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => props.handleAlign("justifyCenter")}
                                            >
                                                <FontAwesomeIcon icon={faAlignCenter} />
                                            </button>
                                        </Tippy>
                                        <Tippy content="Align Right" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => props.handleAlign("justifyRight")}
                                            >
                                                <FontAwesomeIcon icon={faAlignRight} />
                                            </button>
                                        </Tippy>
                                        <Tippy content="Justify Full" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => props.handleAlign("justifyFull")}
                                            >
                                                <FontAwesomeIcon icon={faAlignJustify} />
                                            </button>
                                        </Tippy>
                                        <Tippy content="Indent" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => props.execCommand("indent")}
                                            >
                                                <FontAwesomeIcon icon={faIndent} />
                                            </button>
                                        </Tippy>
                                        <Tippy content="Outdent" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => props.execCommand("outdent")}
                                            >
                                                <FontAwesomeIcon icon={faOutdent} />
                                            </button>
                                        </Tippy>
                                    </div>
                                )
                            }
                        >
                            <button
                                className="dinolabsIDEEditingButton"
                                onMouseDown={e => {
                                    e.preventDefault();
                                    props.storeSelection();
                                }}
                                onClick={() => props.toggleModal("align")}
                                ref={props.alignButtonRef}
                            >
                                <FontAwesomeIcon icon={faBarsStaggered} />
                            </button>
                        </Tippy>
                    </Tippy>
                    <Tippy content="Line Spacing" placement="bottom" theme="tooltip-light">
                        <Tippy
                            visible={props.openModal === "lineSpacing"}
                            onClickOutside={() => props.closeAllMenus()}
                            placement="bottom"
                            interactive
                            className="context-menu-tippy-horizontal"
                            content={
                                props.openModal === "lineSpacing" && (
                                    <div
                                        className="dinolabsIDEEditingContextMenuHorizontal"
                                        ref={props.lineSpacingModalRef}
                                    >
                                        <Tippy content="1x" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => props.handleLineSpacing("1")}
                                            >
                                                1x
                                            </button>
                                        </Tippy>
                                        <Tippy content="1.5x" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => props.handleLineSpacing("1.5")}
                                            >
                                                1.5x
                                            </button>
                                        </Tippy>
                                        <Tippy content="2x" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => props.handleLineSpacing("2")}
                                            >
                                                2x
                                            </button>
                                        </Tippy>
                                        <Tippy content="2.5x" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => props.handleLineSpacing("2.5")}
                                            >
                                                2.5x
                                            </button>
                                        </Tippy>
                                        <Tippy content="3x" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => props.handleLineSpacing("3")}
                                            >
                                                3x
                                            </button>
                                        </Tippy>
                                    </div>
                                )
                            }
                        >
                            <button
                                className="dinolabsIDEEditingButton"
                                onMouseDown={e => {
                                    e.preventDefault();
                                    props.storeSelection();
                                }}
                                onClick={() => props.toggleModal("lineSpacing")}
                                ref={props.lineSpacingButtonRef}
                            >
                                <FontAwesomeIcon icon={faArrowUpWideShort} />
                            </button>
                        </Tippy>
                    </Tippy>
                    <Tippy content="List Options" placement="bottom" theme="tooltip-light">
                        <Tippy
                            visible={props.openModal === "lists"}
                            onClickOutside={() => props.closeAllMenus()}
                            placement="bottom"
                            interactive
                            className="context-menu-tippy-horizontal"
                            content={
                                props.openModal === "lists" && (
                                    <div
                                        className="dinolabsIDEEditingContextMenuHorizontal"
                                        ref={props.listModalRef}
                                    >
                                        <Tippy content="Bullet List" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => props.execCommand("insertUnorderedList")}
                                            >
                                                <FontAwesomeIcon icon={faListUl} />
                                            </button>
                                        </Tippy>
                                        <Tippy content="Numbered List" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => props.execCommand("insertOrderedList")}
                                            >
                                                <FontAwesomeIcon icon={faListNumeric} />
                                            </button>
                                        </Tippy>
                                    </div>
                                )
                            }
                        >
                            <button
                                className="dinolabsIDEEditingButton"
                                onMouseDown={e => {
                                    e.preventDefault();
                                    props.storeSelection();
                                }}
                                onClick={() => props.toggleModal("lists")}
                                ref={props.listButtonRef}
                            >
                                <FontAwesomeIcon icon={faListUl} />
                            </button>
                        </Tippy>
                    </Tippy>
                </div>
                <div className="dinolabsIDEEditingInputWrapper">
                    <Tippy content="More Options" placement="bottom" theme="tooltip-light">
                        <Tippy
                            visible={props.openModal === "more"}
                            onClickOutside={() => {
                                props.closeAllMenus();
                            }}
                            placement="bottom"
                            interactive
                            className="context-menu-tippy-horizontal"
                            content={
                                props.openModal === "more" && (
                                    <div
                                        className="dinolabsIDEEditingContextMenuHorizontal"
                                        ref={props.moreModalRef}
                                    >
                                        <div
                                            className="dinolabsIDEEditingInputWrapper"
                                            style={{ border: "none" }}
                                        >
                                            <Tippy content=" Color" placement="bottom" theme="tooltip-light">
                                                <Tippy
                                                    content={
                                                        <DinoLabsIDEColorPicker
                                                            color={props.textColor}
                                                            onChange={color => {
                                                                props.restoreSelection();
                                                                props.handleColorChange(color);
                                                            }}
                                                        />
                                                    }
                                                    visible={props.isColorOpen}
                                                    onClickOutside={() => props.setIsColorOpen(false)}
                                                    interactive
                                                    placement="right"
                                                    className="color-picker-tippy"
                                                >
                                                    <div className="dinolabsIDEColorWrapper">
                                                        <FontAwesomeIcon icon={faDroplet} />
                                                        <label
                                                            className="dinolabsIDEColorPicker"
                                                            onMouseDown={props.storeSelection}
                                                            onClick={() => {
                                                                props.setIsColorOpen(prev => !prev);
                                                                props.setIsHighlightColorOpen(false);
                                                            }}
                                                            style={{
                                                                backgroundColor: props.textColor
                                                            }}
                                                        />
                                                    </div>
                                                </Tippy>
                                            </Tippy>
                                        </div>
                                        <div className="dinolabsIDEEditingInputWrapper">
                                            <Tippy content=" Highlight Color" placement="bottom" theme="tooltip-light">
                                                <Tippy
                                                    content={
                                                        <DinoLabsIDEColorPicker
                                                            color={props.textHighlightColor}
                                                            onChange={color => {
                                                                props.restoreSelection();
                                                                props.handleHighlightColorChange(color);
                                                            }}
                                                        />
                                                    }
                                                    visible={props.isHighlightColorOpen}
                                                    onClickOutside={() => props.setIsHighlightColorOpen(false)}
                                                    interactive
                                                    placement="right"
                                                    className="color-picker-tippy"
                                                >
                                                    <div className="dinolabsIDEColorWrapper">
                                                        <FontAwesomeIcon icon={faHighlighter} />
                                                        <label
                                                            className="dinolabsIDEColorPicker"
                                                            onMouseDown={props.storeSelection}
                                                            onClick={() => {
                                                                props.setIsHighlightColorOpen(prev => !prev);
                                                                props.setIsColorOpen(false);
                                                            }}
                                                            style={{
                                                                backgroundColor: props.textHighlightColor
                                                            }}
                                                        />
                                                    </div>
                                                </Tippy>
                                            </Tippy>
                                        </div>
                                        <div className="dinolabsIDEEditingInputWrapper">
                                            <Tippy content="Remove Formatting" placement="bottom" theme="tooltip-light">
                                                <button
                                                    className="dinolabsIDEEditingButton"
                                                    onMouseDown={e => e.preventDefault()}
                                                    onClick={props.handleRemoveFormatting}
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
                                className="dinolabsIDEEditingButton"
                                onMouseDown={e => {
                                    e.preventDefault();
                                    props.storeSelection();
                                }}
                                onClick={() => props.toggleModal("more")}
                                ref={props.moreButtonRef}
                            >
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </button>
                        </Tippy>
                    </Tippy>
                </div>
            </div>
        </div>
    );
}