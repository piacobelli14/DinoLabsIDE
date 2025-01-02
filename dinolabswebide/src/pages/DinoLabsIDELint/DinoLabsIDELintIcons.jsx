import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTimesCircle, 
    faExclamationTriangle, 
    faInfoCircle, 
    faCheckCircle, 
    faBug, 
    faFilter, 
    faDownload, 
    faSearch, 
    faFileExport, 
    faTriangleExclamation 
} from '@fortawesome/free-solid-svg-icons';

const icons = {
    error: <FontAwesomeIcon icon={faTriangleExclamation}/>,
    warning: <FontAwesomeIcon icon={faExclamationTriangle}/>,
    info: <FontAwesomeIcon icon={faInfoCircle}/>,
    bug: <FontAwesomeIcon icon={faBug}/>,
    filter: <FontAwesomeIcon icon={faFilter}/>,
    download: <FontAwesomeIcon icon={faDownload}/>,
    search: <FontAwesomeIcon icon={faSearch}/>,
};

export default icons;
