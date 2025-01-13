
import React, { useState, useEffect, useRef } from 'react';
import "../../styles/mainStyles/DinoLabsIDEMedia.css";
import "../../styles/helperStyles/Slider.css";
import "../../styles/helperStyles/Checkbox.css";
import DinoLabsIDEColorPicker from '../DinoLabsIDEColorPicker.jsx';
import { showDialog } from "../DinoLabsIDEAlert.jsx";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faArrowRight, faArrowsLeftRightToLine, faArrowsRotate,
    faArrowsUpToLine, faBorderTopLeft, faCircle, faCropSimple, faDownload, faLeftRight,
    faMagnifyingGlassMinus, faMagnifyingGlassPlus, faMinus, faBrush, faPenRuler,
    faPlus, faRightLeft, faRotate, faRotateLeft, faRotateRight, faRuler,
    faRulerCombined, faSave, faSquareCaretLeft, faSwatchbook, faTabletScreenButton, faUpDown,
    faSquarePlus,
    faXmarkCircle
} from '@fortawesome/free-solid-svg-icons';

function DinoLabsIDEAudioEditor({ fileHandle }) {
    const [url, setUrl] = useState(null);
    const [mediaType, setMediaType] = useState(null);

    useEffect(() => {
        const loadMedia = async () => {
            try {
                const file = await fileHandle.getFile();
                const objectUrl = URL.createObjectURL(file);
                setUrl(objectUrl);

                const extension = file.name.split('.').pop().toLowerCase();
                if (['mp3', 'wav', 'flac'].includes(extension)) {
                    setMediaType('video');
                } 

                return () => URL.revokeObjectURL(objectUrl);
            } catch (error) {
                console.error('Failed to load media:', error);
            }
        };
        loadMedia();
    }, [fileHandle]);


    return (
        <div className="media-container audio-container">
            <div className="media-controls">
                <button className="media-button">Download Audio</button>
                <button className="media-button">Loop</button>
            </div>
            <audio src={url} controls className="media-content" />
        </div>
    );
}

export default DinoLabsIDEAudioEditor;