import React from "react";
import "../../styles/mainStyles/DinoLabsIDEContent.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTable,
  faSave,
  faPenToSquare,
  faPlus,
  faFont,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";

export default function DinoLabsIDETabularEditorToolbar(props) {
  return (
    <div className="dinolabsIDEToolBar">
      <div className="dinolabsIDETitleWrapper">
        <FontAwesomeIcon icon={faTable} className="dinolabsIDEContentFileIcon"/>
        <div className="dinolabsIDEFileNameStack">
          <label className="dinolasIDEFileNameInput">{props.fileName}</label>

          <div className="dinolabsIDEOperationsButtonsWrapper">
            <button
                className="dinolabsIDEOperationsButton"
            >
                File
            </button>

            <button
                className="dinolabsIDEOperationsButton"
            >
                Edit
            </button>

            <button
                className="dinolabsIDEOperationsButton"
            >
                Insert
            </button>

            <button
                className="dinolabsIDEOperationsButton"
            >
                Format
            </button>

            <button
                className="dinolabsIDEOperationsButton"
            >
                Tools
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
