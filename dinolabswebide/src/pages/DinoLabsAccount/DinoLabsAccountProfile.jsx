import React, { useState, useEffect } from "react";
import "../../styles/mainStyles/AccountStyles/DinoLabsIDEAccount.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import {
  faA,
  faArrowDown,
  faArrowUp,
  faCopy,
  faExclamationTriangle,
  faList,
  faMagnifyingGlass,
  faMagnifyingGlassPlus,
  faSquare,
  faTableColumns,
  faXmark,
  faCode 
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DinoLabsIDEAccount = ({ onClose }) => {

    return (
        <div className="dinolabsIDESettingsContainer">
            <button className="dinolabsIDESettingsCloseButton" onClick={onClose}> 
                Close Profile
            </button>
        </div>
    ); 
}; 

export default DinoLabsIDEAccount; 


