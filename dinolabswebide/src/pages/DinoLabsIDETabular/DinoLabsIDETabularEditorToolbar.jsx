import React from "react";
import "../../styles/mainStyles/DinoLabsIDEContent.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSave,
    faDownload,
    faPrint,
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
    faAlignRight
} from "@fortawesome/free-solid-svg-icons";

export default function DinoLabsIDETabularEditorToolbar({
    fileName,
    saveStatus,
    onSave,
    onDownload,
    onPrint,
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
    handleWordCount
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
                                        <button
                                            className="dinolabsIDEEditingContextMenuButtonWrapper"
                                            onMouseDown={() => {
                                                callActionAndBlur(onPrint);
                                            }}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faPrint} />
                                                Print
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
                    </div>
                </div>
            </div>
        </div>
    );
}
