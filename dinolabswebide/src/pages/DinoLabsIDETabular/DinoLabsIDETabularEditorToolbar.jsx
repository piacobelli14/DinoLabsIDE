
import React from "react";
import "../../styles/mainStyles/DinoLabsIDEContent.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import DinoLabsIDEColorPicker from "../DinoLabsIDEColorPicker.jsx";
import {
    faSave,
    faDownload,
    faUndo,
    faRedo,
    faCut,
    faCopy,
    faPaste,
    faArrowPointer,
    faSearch,
    faPenToSquare,
    faAlignLeft,
    faAlignCenter,
    faAlignRight,
    faMinus,
    faPlus,
    faBarsStaggered,
    faBold,
    faItalic,
    faUnderline,
    faStrikethrough,
    faEraser,
    faDroplet,
    faHighlighter,
    faEllipsisV
} from "@fortawesome/free-solid-svg-icons";

export default function DinoLabsIDETabularEditorToolbar({
    fileName,
    saveStatus,
    onSave,
    onDownload,
    onUndo,
    onRedo,
    onCut,
    onCopy,
    onPaste,
    onSelectAll,
    onSearchReplace,
    openMenu,
    setOpenMenu,
    openModal,
    toggleModal,
    closeAllMenus,
    storeSelection,
    formatModalRef,
    formatButtonRef,
    toolsModalRef,
    toolsButtonRef,
    handleAlign,
    handleWordCount,
    decreaseZoom,
    increaseZoom,
    currentZoom,
    fontType,
    handleFontTypeChange,
    execCommand,
    isColorOpen,
    setIsColorOpen,
    isHighlightColorOpen,
    setIsHighlightColorOpen,
    handleColorChange,
    textColor,
    handleHighlightColorChange,
    textHighlightColor,
    handleRemoveFormatting,
    alignModalRef,
    alignButtonRef,
    moreModalRef,
    moreButtonRef,
    restoreSelection,
    handleBorders,
    insertModalRef,
    insertButtonRef
}) {
    const callActionAndBlur = (action) => {
        action();
        setTimeout(() => {
            if (document.activeElement) {
                document.activeElement.blur();
            }
        }, 0);
    };

    const toggleMenu = (menuName) => {
        setOpenMenu((prev) => (prev === menuName ? null : menuName));
    };

    const closeAllMenusInternal = () => {
        setOpenMenu(null);
        closeAllMenus();
    };

    return (
        <div className="dinolabsIDEToolBar">
            <div className="dinolabsIDETitleWrapper">
                <FontAwesomeIcon icon={faPenToSquare} className="dinolabsIDEContentFileIcon" />
                <div className="dinolabsIDEFileNameStack">
                    <label className="dinolasIDEFileNameInput">
                        {fileName}
                    </label>
                    <div className="dinolabsIDEOperationsButtonsWrapper">
                        <Tippy
                            visible={openMenu === "file"}
                            onClickOutside={() => closeAllMenusInternal()}
                            placement="bottom"
                            interactive
                            trigger="manual"
                            className="context-menu-tippy-vertical"
                            content={
                                openMenu === "file" && (
                                    <div className="dinolabsIDEEditingContextMenuVertical">
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(onSave);
                                            }}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faSave} />
                                                {saveStatus === "idle" && "Save File"}
                                                {saveStatus === "saving" && "Saving..."}
                                                {saveStatus === "saved" && "Saved!"}
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(onDownload);
                                            }}
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
                                onClick={() => toggleMenu("file")}
                            >
                                File
                            </button>
                        </Tippy>
                        <Tippy
                            visible={openMenu === "edit"}
                            onClickOutside={() => closeAllMenusInternal()}
                            placement="bottom"
                            interactive
                            trigger="manual"
                            className="context-menu-tippy-vertical"
                            content={
                                openMenu === "edit" && (
                                    <div className="dinolabsIDEEditingContextMenuVertical">
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(onUndo);
                                            }}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faUndo} />
                                                Undo
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(onRedo);
                                            }}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faRedo} />
                                                Redo
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(onCut);
                                            }}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faCut} />
                                                Cut
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(onCopy);
                                            }}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faCopy} />
                                                Copy
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(onPaste);
                                            }}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faPaste} />
                                                Paste
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(onSelectAll);
                                            }}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faArrowPointer} />
                                                Select All
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(onSearchReplace);
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
                                onClick={() => toggleMenu("edit")}
                            >
                                Edit
                            </button>
                        </Tippy>

                        <Tippy
                            visible={openModal === "format"}
                            onClickOutside={() => closeAllMenusInternal()}
                            placement="bottom"
                            interactive
                            className="context-menu-tippy-vertical"
                            content={
                                openModal === "format" && (
                                    <div
                                        className="dinolabsIDEEditingContextMenuVertical"
                                        ref={formatModalRef}
                                    >
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => handleAlign("justifyLeft")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faAlignLeft} />
                                                Align Left
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => handleAlign("justifyCenter")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faAlignCenter} />
                                                Align Center
                                            </span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={() => handleAlign("justifyRight")}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faAlignRight} />
                                                Align Right
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
                                    storeSelection();
                                }}
                                onClick={() => toggleModal("format")}
                                ref={formatButtonRef}
                            >
                                Format
                            </button>
                        </Tippy>
                        <Tippy
                            visible={openModal === "tools"}
                            onClickOutside={() => closeAllMenusInternal()}
                            placement="bottom"
                            interactive
                            className="context-menu-tippy-vertical"
                            content={
                                openModal === "tools" && (
                                    <div
                                        className="dinolabsIDEEditingContextMenuVertical"
                                        ref={toolsModalRef}
                                    >
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onClick={handleWordCount}
                                        >
                                            <span>Cell Count</span>
                                        </button>
                                    </div>
                                )
                            }
                        >
                            <button
                                className="dinolabsIDEOperationsButton"
                                onMouseDown={e => {
                                    e.preventDefault();
                                    storeSelection();
                                }}
                                onClick={() => toggleModal("tools")}
                                ref={toolsButtonRef}
                            >
                                Tools
                            </button>
                        </Tippy>
                        <Tippy
                            visible={openModal === "insert"}
                            onClickOutside={() => closeAllMenusInternal()}
                            placement="bottom"
                            interactive
                            className="context-menu-tippy-vertical"
                            content={
                                openModal === "insert" && (
                                    <div
                                        className="dinolabsIDEEditingContextMenuVertical"
                                        ref={insertModalRef}
                                    >
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(() => handleBorders("allBorders"));
                                            }}
                                        >
                                            <span>All Borders</span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(() => handleBorders("outsideBorders"));
                                            }}
                                        >
                                            <span>Outside Borders</span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(() => handleBorders("topBorder"));
                                            }}
                                        >
                                            <span>Top Border</span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(() => handleBorders("bottomBorder"));
                                            }}
                                        >
                                            <span>Bottom Border</span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(() => handleBorders("leftBorder"));
                                            }}
                                        >
                                            <span>Left Border</span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(() => handleBorders("rightBorder"));
                                            }}
                                        >
                                            <span>Right Border</span>
                                        </button>
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(() => handleBorders("noBorders"));
                                            }}
                                        >
                                            <span>No Borders</span>
                                        </button>
                                    </div>
                                )
                            }
                        >
                            <button
                                className="dinolabsIDEOperationsButton"
                                onMouseDown={e => {
                                    e.preventDefault();
                                    storeSelection();
                                }}
                                onClick={() => toggleModal("insert")}
                                ref={insertButtonRef}
                            >
                                Insert
                            </button>
                        </Tippy>
                    </div>
                </div>
            </div>
            <div className="dinolabsIDEEditingButtonsWrapper">
                <div className="dinolabsIDEEditingInputWrapper" style={{ borderLeft: "none" }}>
                    <Tippy content="Decrease Zoom" placement="bottom" theme="tooltip-light">
                        <button
                            className="dinolabsIDEEditingButton"
                            onMouseDown={e => e.preventDefault()}
                            onClick={decreaseZoom}
                        >
                            <FontAwesomeIcon icon={faMinus} />
                        </button>
                    </Tippy>
                    <input
                        className="dinolabsIDEEditingInput"
                        value={`${currentZoom}%`}
                        readOnly
                    />
                    <Tippy content="Increase Zoom" placement="bottom" theme="tooltip-light">
                        <button
                            className="dinolabsIDEEditingButton"
                            onMouseDown={e => e.preventDefault()}
                            onClick={increaseZoom}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </Tippy>
                </div>
                <div className="dinolabsIDEEditingInputWrapper">
                    <Tippy content="Change Font Type" placement="bottom" theme="tooltip-light">
                        <select
                            className="dinolabsIDEEditingSelect"
                            value={fontType}
                            onMouseDown={storeSelection}
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
                <div className="dinolabsIDEEditingInputWrapper">
                    <Tippy content="Bold " placement="bottom" theme="tooltip-light">
                        <button
                            className="dinolabsIDEEditingButton"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => execCommand("bold")}
                        >
                            <FontAwesomeIcon icon={faBold} />
                        </button>
                    </Tippy>
                    <Tippy content="Italicize " placement="bottom" theme="tooltip-light">
                        <button
                            className="dinolabsIDEEditingButton"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => execCommand("italic")}
                        >
                            <FontAwesomeIcon icon={faItalic} />
                        </button>
                    </Tippy>
                    <Tippy content="Underline " placement="bottom" theme="tooltip-light">
                        <button
                            className="dinolabsIDEEditingButton"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => execCommand("underline")}
                        >
                            <FontAwesomeIcon icon={faUnderline} />
                        </button>
                    </Tippy>
                    <Tippy content="Strikethrough " placement="bottom" theme="tooltip-light">
                        <button
                            className="dinolabsIDEEditingButton"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => execCommand("strikeThrough")}
                        >
                            <FontAwesomeIcon icon={faStrikethrough} />
                        </button>
                    </Tippy>
                </div>
                <div className="dinolabsIDEEditingInputWrapper">
                    <Tippy content="Alignment Options" placement="bottom" theme="tooltip-light">
                        <Tippy
                            visible={openModal === "align"}
                            onClickOutside={() => closeAllMenus()}
                            placement="bottom"
                            interactive
                            className="context-menu-tippy-horizontal"
                            content={
                                openModal === "align" && (
                                    <div
                                        className="dinolabsIDEEditingContextMenuHorizontal"
                                        ref={alignModalRef}
                                    >
                                        <Tippy content="Align Left" placement="bottom">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => handleAlign("justifyLeft")}
                                            >
                                                <FontAwesomeIcon icon={faAlignLeft} />
                                            </button>
                                        </Tippy>
                                        <Tippy content="Align Center" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => handleAlign("justifyCenter")}
                                            >
                                                <FontAwesomeIcon icon={faAlignCenter} />
                                            </button>
                                        </Tippy>
                                        <Tippy content="Align Right" placement="bottom" theme="tooltip-light">
                                            <button
                                                className="dinolabsIDEEditingButton"
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => handleAlign("justifyRight")}
                                            >
                                                <FontAwesomeIcon icon={faAlignRight} />
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
                                    storeSelection();
                                }}
                                onClick={() => toggleModal("align")}
                                ref={alignButtonRef}
                            >
                                <FontAwesomeIcon icon={faBarsStaggered} />
                            </button>
                        </Tippy>
                    </Tippy>
                </div>
                <div className="dinolabsIDEEditingInputWrapper">
                    <Tippy content="Text Color" placement="bottom" theme="tooltip-light">
                        <Tippy
                            content={
                                <DinoLabsIDEColorPicker
                                    color={textColor}
                                    onChange={color => {
                                        restoreSelection();
                                        handleColorChange(color);
                                    }}
                                />
                            }
                            visible={isColorOpen}
                            onClickOutside={() => setIsColorOpen(false)}
                            interactive
                            placement="right"
                            className="color-picker-tippy"
                        >
                            <div className="dinolabsIDEColorWrapper">
                                <FontAwesomeIcon icon={faDroplet} />
                                <label
                                    className="dinolabsIDEColorPicker"
                                    onMouseDown={storeSelection}
                                    onClick={() => {
                                        setIsColorOpen(prev => !prev);
                                        setIsHighlightColorOpen(false);
                                    }}
                                    style={{
                                        backgroundColor: textColor
                                    }}
                                />
                            </div>
                        </Tippy>
                    </Tippy>
                </div>
                <div className="dinolabsIDEEditingInputWrapper">
                    <Tippy content="Highlight Color" placement="bottom" theme="tooltip-light">
                        <Tippy
                            content={
                                <DinoLabsIDEColorPicker
                                    color={textHighlightColor}
                                    onChange={color => {
                                        restoreSelection();
                                        handleHighlightColorChange(color);
                                    }}
                                />
                            }
                            visible={isHighlightColorOpen}
                            onClickOutside={() => setIsHighlightColorOpen(false)}
                            interactive
                            placement="right"
                            className="color-picker-tippy"
                        >
                            <div className="dinolabsIDEColorWrapper">
                                <FontAwesomeIcon icon={faHighlighter} />
                                <label
                                    className="dinolabsIDEColorPicker"
                                    onMouseDown={storeSelection}
                                    onClick={() => {
                                        setIsHighlightColorOpen(prev => !prev);
                                        setIsColorOpen(false);
                                    }}
                                    style={{
                                        backgroundColor: textHighlightColor
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
                            onClick={handleRemoveFormatting}
                        >
                            <FontAwesomeIcon icon={faEraser} />
                        </button>
                    </Tippy>
                </div>
            </div>
        </div>
    );
}
