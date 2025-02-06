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
    faPenToSquare
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
    setOpenMenu
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

    const closeAllMenus = () => {
        setOpenMenu(null);
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
                            onClickOutside={() => closeAllMenus()}
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
                            onClickOutside={() => closeAllMenus()}
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
                    </div>
                </div>
            </div>
        </div>
    );
}
