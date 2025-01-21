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
    faArrowsUpToLine, faBackward, faBorderTopLeft, faCircle, faCropSimple, faDownload, faFilm, faForward, faLeftRight,
    faMagnifyingGlassMinus, faMagnifyingGlassPlus, faMinus,
    faPause,
    faPlay,
    faPlus, faRepeat, faRightLeft, faRotateLeft, faRotateRight, faRulerCombined, faScissors, faSquareCaretLeft,
    faSquareMinus,
    faSquarePlus,
    faSwatchbook, faTabletScreenButton, faTape, faUpDown
} from '@fortawesome/free-solid-svg-icons';

function DinoLabsIDEVideoEditor({ fileHandle }) {
    const [url, setUrl] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [flipX, setFlipX] = useState(1);
    const [flipY, setFlipY] = useState(1);
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(100);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [opacity, setOpacity] = useState(100);
    const [blur, setBlur] = useState(0);
    const [spread, setSpread] = useState(0);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const draggingRef = useRef(false);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const [videoWidth, setVideoWidth] = useState(300);
    const [videoHeight, setVideoHeight] = useState(300);
    const [nativeWidth, setNativeWidth] = useState(300);
    const [nativeHeight, setNativeHeight] = useState(300);
    const [resizingCorner, setResizingCorner] = useState(null);
    const resizingRef = useRef(false);
    const lastResizePosRef = useRef({ x: 0, y: 0 });
    const initialSizeRef = useRef({ width: 300, height: 300 });
    const initialPosRef = useRef({ x: 0, y: 0 });
    const [isCropping, setIsCropping] = useState(false);
    const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 100, height: 100 });
    const [cropRotation, setCropRotation] = useState(0);
    const cropResizingRef = useRef(false);
    const cropResizingCorner = useRef(null);
    const cropLastResizePosRef = useRef({ x: 0, y: 0 });
    const cropInitialRectRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const aspectRatioRef = useRef(1);
    const [grayscale, setGrayscale] = useState(0);
    const [sepia, setSepia] = useState(0);
    const [removeBackground, setRemoveBackground] = useState(false);
    const [cropHistory, setCropHistory] = useState([]);
    const [isCropDisabled, setIsCropDisabled] = useState(false);
    const [circleCrop, setCircleCrop] = useState(false);

    useEffect(() => {
        let objectUrl;
        const loadMedia = async () => {
            try {
                const file = typeof fileHandle.getFile === 'function'
                    ? await fileHandle.getFile()
                    : fileHandle;
                objectUrl = URL.createObjectURL(file);
                setUrl(objectUrl);

                const extension = file.name.split('.').pop().toLowerCase();
                if (['mp4', 'mkv', 'avi', 'mov'].includes(extension)) {
                    setMediaType('video');
                    const video = document.createElement('video');
                    video.onloadedmetadata = () => {
                        setNativeWidth(video.videoWidth);
                        setNativeHeight(video.videoHeight);
                        const scaleFactor = 300 / video.videoHeight;
                        setVideoHeight(300);
                        setVideoWidth(video.videoWidth * scaleFactor);
                    };
                    video.src = objectUrl;
                }
            } catch (error) {
                return;
            }
        };

        loadMedia();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [fileHandle]);

    useEffect(() => {
        const normalizedRotation = rotation % 360;
        const isAtOriginalPosition = normalizedRotation === 0;

        if (isAtOriginalPosition && flipX === 1 && flipY === 1) {
            setIsCropDisabled(false);
        } else {
            setIsCropDisabled(true);
        }
    }, [rotation, flipX, flipY]);

    const resetVideo = () => {
        setZoom(1);
        setRotation(0);
        setFlipX(1);
        setFlipY(1);
        setHue(0);
        setSaturation(100);
        setBrightness(100);
        setContrast(100);
        setOpacity(100);
        setBlur(0);
        setSpread(0);
        setPanX(0);
        setPanY(0);
        const scaleFactor = 300 / nativeHeight;
        setVideoHeight(300);
        setVideoWidth(nativeWidth * scaleFactor);
        setIsCropDisabled(false);
    };

    const downloadVideo = async () => {
        const alertResult = await showDialog({
            title: 'Select Video Type and Scale',
            message: 'Select the video type and scale.',
            inputs: [
                {
                    name: 'fileType',
                    type: 'select',
                    label: 'Video Type',
                    defaultValue: 'mp4',
                    options: [
                        { label: '.mp4', value: 'mp4' }
                    ]
                },
                {
                    name: 'scale',
                    type: 'select',
                    label: 'Scale',
                    defaultValue: '1x',
                    options: [
                        { label: '1x', value: '1x' },
                        { label: '2x', value: '2x' },
                        { label: '3x', value: '3x' }
                    ]
                }
            ],
            showCancel: true
        });

        if (!alertResult) {
            return;
        }

        const fileType = alertResult?.fileType || 'mp4';
        const scale = alertResult?.scale || '1x';

        const scaleFactor = scale === '2x' ? 2 : scale === '3x' ? 3 : 1;
        const mimeType = 'video/mp4';

        // Placeholder for video processing and downloading
    };

    const handleDragStart = (e) => {
        if (isCropping) return;
        draggingRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleDragEnd = () => {
        draggingRef.current = false;
    };

    const handleDragMove = (e) => {
        if (!draggingRef.current) return;
        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;
        setPanX(prev => prev + dx);
        setPanY(prev => prev + dy);
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResizeMouseDown = (corner, e) => {
        if (isCropping) return;
        e.stopPropagation();
        e.preventDefault();
        setResizingCorner(corner);
        resizingRef.current = true;
        lastResizePosRef.current = { x: e.clientX, y: e.clientY };
        initialSizeRef.current = { width: videoWidth, height: videoHeight };
        initialPosRef.current = { x: panX, y: panY };
        if (maintainAspectRatio) {
            aspectRatioRef.current = videoWidth / videoHeight;
        }
    };

    const handleGlobalMouseMove = (e) => {
        if (!resizingRef.current) return;
        const dx = e.clientX - lastResizePosRef.current.x;
        const dy = e.clientY - lastResizePosRef.current.y;
        const rad = rotation * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const localDx = cos * dx + sin * dy;
        const localDy = -sin * dx + cos * dy;
        let newWidth = initialSizeRef.current.width;
        let newHeight = initialSizeRef.current.height;
        let newPanX = initialPosRef.current.x;
        let newPanY = initialPosRef.current.y;

        if (maintainAspectRatio) {
            const ratio = aspectRatioRef.current;
            if (resizingCorner === 'bottom-right') {
                newWidth = initialSizeRef.current.width + localDx;
                newHeight = newWidth / ratio;
            } else if (resizingCorner === 'bottom-left') {
                newWidth = initialSizeRef.current.width - localDx;
                newHeight = newWidth / ratio;
                newPanX = initialPosRef.current.x + localDx;
            } else if (resizingCorner === 'top-right') {
                newWidth = initialSizeRef.current.width + localDx;
                newHeight = newWidth / ratio;
                newPanY = initialPosRef.current.y + (initialSizeRef.current.height - newHeight);
            } else if (resizingCorner === 'top-left') {
                newWidth = initialSizeRef.current.width - localDx;
                newHeight = newWidth / ratio;
                newPanX = initialPosRef.current.x + localDx;
                newPanY = initialPosRef.current.y + (initialSizeRef.current.height - newHeight);
            }
        } else {
            if (resizingCorner === 'bottom-right') {
                newWidth = initialSizeRef.current.width + localDx;
                newHeight = initialSizeRef.current.height + localDy;
            } else if (resizingCorner === 'bottom-left') {
                newWidth = initialSizeRef.current.width - localDx;
                newHeight = initialSizeRef.current.height + localDy;
                newPanX = initialPosRef.current.x + localDx;
            } else if (resizingCorner === 'top-right') {
                newWidth = initialSizeRef.current.width + localDx;
                newHeight = initialSizeRef.current.height - localDy;
                newPanY = initialPosRef.current.y + localDy;
            } else if (resizingCorner === 'top-left') {
                newWidth = initialSizeRef.current.width - localDx;
                newHeight = initialSizeRef.current.height - localDy;
                newPanX = initialPosRef.current.x + localDx;
                newPanY = initialPosRef.current.y + localDy;
            }
        }

        setVideoWidth(Math.max(newWidth, 50));
        setVideoHeight(Math.max(newHeight, 50));
        setPanX(newPanX);
        setPanY(newPanY);
    };

    const handleGlobalMouseUp = () => {
        resizingRef.current = false;
        setResizingCorner(null);
    };

    useEffect(() => {
        const onMouseMove = (e) => handleGlobalMouseMove(e);
        const onMouseUp = () => handleGlobalMouseUp();
        if (resizingRef.current) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [resizingCorner]);

    const restoreAspectRatioWidth = () => {
        const newHeight = videoWidth * (nativeHeight / nativeWidth);
        setVideoHeight(newHeight);
    };

    const restoreAspectRatioHeight = () => {
        const newWidth = videoHeight * (nativeWidth / nativeHeight);
        setVideoWidth(newWidth);
    };

    const handleCropResizeMouseDown = (corner, e) => {
        e.stopPropagation();
        e.preventDefault();
        cropResizingRef.current = true;
        cropResizingCorner.current = corner;
        cropLastResizePosRef.current = { x: e.clientX, y: e.clientY };
        cropInitialRectRef.current = { ...cropRect };
    };

    const handleCropGlobalMouseMove = (e) => {
        if (!cropResizingRef.current) return;
        const dx = e.clientX - cropLastResizePosRef.current.x;
        const dy = e.clientY - cropLastResizePosRef.current.y;
        let { x, y, width, height } = cropInitialRectRef.current;
        if (cropResizingCorner.current === 'bottom-right') {
            width += dx;
            height += dy;
        } else if (cropResizingCorner.current === 'bottom-left') {
            x += dx;
            width -= dx;
            height += dy;
        } else if (cropResizingCorner.current === 'top-right') {
            y += dy;
            width += dx;
            height -= dy;
        } else if (cropResizingCorner.current === 'top-left') {
            x += dx;
            y += dy;
            width -= dx;
            height -= dy;
        }
        if (circleCrop) {
            height = width;
        }
        setCropRect({
            x,
            y,
            width: Math.max(width, 10),
            height: Math.max(height, 10),
        });
    };

    useEffect(() => {
        const onMouseMove = (e) => handleCropGlobalMouseMove(e);
        const onMouseUp = () => { cropResizingRef.current = false; };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    const cropRotatingRef = useRef(false);
    const cropInitialRotation = useRef(0);
    const cropRotationStartAngle = useRef(0);
    const cropRotationCenter = useRef({ x: 0, y: 0 });

    const cropDraggingRef = useRef(false);
    const lastCropDragPosRef = useRef({ x: 0, y: 0 });

    const handleCropMouseDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        cropDraggingRef.current = true;
        lastCropDragPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleCropMouseMove = (e) => {
        if (!cropDraggingRef.current) return;
        const dx = e.clientX - lastCropDragPosRef.current.x;
        const dy = e.clientY - lastCropDragPosRef.current.y;
        lastCropDragPosRef.current = { x: e.clientX, y: e.clientY };
        setCropRect(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    };

    const handleCropMouseUp = () => {
        cropDraggingRef.current = false;
    };

    useEffect(() => {
        const onMouseMove = (e) => handleCropMouseMove(e);
        const onMouseUp = () => handleCropMouseUp();
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    const handleCropRotationMouseDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        cropRotatingRef.current = true;
        const rect = e.currentTarget.parentElement.getBoundingClientRect();
        cropRotationCenter.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        const dx = e.clientX - cropRotationCenter.current.x;
        const dy = e.clientY - cropRotationCenter.current.y;
        cropRotationStartAngle.current = Math.atan2(dy, dx) * (180 / Math.PI);
        cropInitialRotation.current = cropRotation;
    };

    const handleCropGlobalMouseMoveRotation = (e) => {
        if (!cropRotatingRef.current) return;
        const dx = e.clientX - cropRotationCenter.current.x;
        const dy = e.clientY - cropRotationCenter.current.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const deltaAngle = angle - cropRotationStartAngle.current;
        setCropRotation(cropInitialRotation.current + deltaAngle);
    };

    const handleCropGlobalMouseUpRotation = () => {
        cropRotatingRef.current = false;
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleCropGlobalMouseMoveRotation);
        window.addEventListener('mouseup', handleCropGlobalMouseUpRotation);
        return () => {
            window.removeEventListener('mousemove', handleCropGlobalMouseMoveRotation);
            window.removeEventListener('mouseup', handleCropGlobalMouseUpRotation);
        };
    }, []);

    const undoCrop = () => {
        if (cropHistory.length > 0) {
            const previous = cropHistory[cropHistory.length - 1];
            setCropHistory(prev => prev.slice(0, prev.length - 1));
            setUrl(previous.url);
            setPanX(previous.panX);
            setPanY(previous.panY);
            setVideoWidth(previous.videoWidth);
            setVideoHeight(previous.videoHeight);
            setNativeWidth(previous.nativeWidth);
            setNativeHeight(previous.nativeHeight);
            setIsCropping(false);
        }
    };

    return (
        <div className="dinolabsIDEMediaContentWrapper">
            <div className="dinoLabsIDEMediaToolBar">
                <div className="dinolabsIDEMediaCellWrapper">
                    <div className="dinolabsIDEMediaHeaderFlex">
                        <label className="dinolabsIDEMediaCellTitle">
                            <FontAwesomeIcon icon={faTabletScreenButton} />
                            Layout
                        </label>
                        <div className="dinolabsIDEMediaCellFlexSupplement">
                            <Tippy content="Reset Video" theme="tooltip-light">
                                <button onClick={resetVideo} className="dinolabsIDEMediaToolButtonHeader">
                                    <FontAwesomeIcon icon={faArrowsRotate} />
                                </button>
                            </Tippy>
                            <Tippy content="Download Video" theme="tooltip-light">
                                <button onClick={downloadVideo} className="dinolabsIDEMediaToolButtonHeader">
                                    <FontAwesomeIcon icon={faDownload} />
                                </button>
                            </Tippy>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Position
                        </label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <input
                                className="dinolabsIDEMediaPositionInput"
                                type="text"
                                value={`X: ${panX}`}
                                onChange={(e) => {
                                    const newValue = e.target.value.replace(/[^0-9.-]/g, "");
                                    setPanX(Number(newValue));
                                }}
                            />
                            <input
                                className="dinolabsIDEMediaPositionInput"
                                type="text"
                                value={`Y: ${panY}`}
                                onChange={(e) => {
                                    const newValue = e.target.value.replace(/[^0-9.-]/g, "");
                                    setPanY(Number(newValue));
                                }}
                            />
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <div className="dinolabsIDEMediaCellFlex">
                            <Tippy content="Zoom In" theme="tooltip-light">
                                <button onClick={() => setZoom(prev => prev + 0.1)} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                                </button>
                            </Tippy>
                            <Tippy content="Zoom Out" theme="tooltip-light">
                                <button onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
                                </button>
                            </Tippy>
                            <Tippy content="Rotate Left" theme="tooltip-light">
                                <button onClick={() => {
                                    setRotation(prev => prev - 90);
                                    setIsCropping(false);
                                }} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faRotateLeft} />
                                </button>
                            </Tippy>
                            <Tippy content="Rotate Right" theme="tooltip-light">
                                <button onClick={() => {
                                    setRotation(prev => prev + 90);
                                    setIsCropping(false);
                                }} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faRotateRight} />
                                </button>
                            </Tippy>
                            <Tippy content="Flip Horizontally" theme="tooltip-light">
                                <button onClick={() => {
                                    setFlipX(prev => -prev);
                                    setIsCropping(false);
                                }} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faLeftRight} />
                                </button>
                            </Tippy>
                            <Tippy content="Flip Vertically" theme="tooltip-light">
                                <button onClick={() => {
                                    setFlipY(prev => -prev)
                                    setIsCropping(false);
                                }} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faUpDown} />
                                </button>
                            </Tippy>
                        </div>
                    </div>
                </div>
                <div className="dinolabsIDEMediaCellWrapper">
                    <div className="dinolabsIDEMediaHeaderFlex">
                        <label className="dinolabsIDEMediaCellTitle">
                            <FontAwesomeIcon icon={faRulerCombined} />
                            Dimensions
                        </label>
                        <label className="dinolabsIDEConfrmationCheck">
                            <input
                                type="checkbox"
                                className="dinolabsIDESettingsCheckbox"
                                checked={maintainAspectRatio}
                                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                            />
                            <span>
                                Preserve Aspect Ratio
                            </span>
                        </label>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Video Size
                        </label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <input
                                className="dinolabsIDEMediaPositionInput"
                                type="text"
                                value={`W: ${Math.round(videoWidth)}px`}
                                onChange={(e) => {
                                    const newValue = e.target.value.replace(/[^0-9.-]/g, "");
                                    setVideoWidth(Number(newValue));
                                }}
                            />
                            <input
                                className="dinolabsIDEMediaPositionInput"
                                type="text"
                                value={`H: ${Math.round(videoHeight)}px`}
                                onChange={(e) => {
                                    const newValue = e.target.value.replace(/[^0-9.-]/g, "");
                                    setVideoHeight(Number(newValue));
                                }}
                            />
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <div className="dinolabsIDEMediaCellFlex">
                            <Tippy content="Restore Width Based Aspect Ratio" theme="tooltip-light">
                                <button onClick={restoreAspectRatioWidth} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faArrowsLeftRightToLine} />
                                </button>
                            </Tippy>
                            <Tippy content="Restore Height Based Aspect Ratio" theme="tooltip-light">
                                <button onClick={restoreAspectRatioHeight} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faArrowsUpToLine} />
                                </button>
                            </Tippy>
                            <Tippy content="Crop Video" theme="tooltip-light">
                                <button
                                    onClick={() => {
                                        if (isCropDisabled) {
                                            return;
                                        }
                                        if (isCropping) {
                                            const video = document.createElement('video');
                                            video.onloadeddata = () => {
                                                const offscreenCanvas = document.createElement('canvas');
                                                offscreenCanvas.width = nativeWidth;
                                                offscreenCanvas.height = nativeHeight;
                                                const offscreenCtx = offscreenCanvas.getContext('2d');
                                                offscreenCtx.drawImage(video, 0, 0, nativeWidth, nativeHeight);

                                                const scaleX = nativeWidth / videoWidth;
                                                const scaleY = nativeHeight / videoHeight;
                                                const rad = cropRotation * Math.PI / 180;

                                                const cx = cropRect.x + cropRect.width / 2;
                                                const cy = cropRect.y + cropRect.height / 2;

                                                const corners = [
                                                    { x: cropRect.x, y: cropRect.y },
                                                    { x: cropRect.x + cropRect.width, y: cropRect.y },
                                                    { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height },
                                                    { x: cropRect.x, y: cropRect.y + cropRect.height }
                                                ];

                                                const rotatedCorners = corners.map(pt => {
                                                    const dx = pt.x - cx;
                                                    const dy = pt.y - cy;
                                                    return {
                                                        x: (cx + (dx * Math.cos(rad) - dy * Math.sin(rad))) * scaleX,
                                                        y: (cy + (dx * Math.sin(rad) + dy * Math.cos(rad))) * scaleY
                                                    };
                                                });

                                                const xs = rotatedCorners.map(pt => pt.x);
                                                const ys = rotatedCorners.map(pt => pt.y);
                                                const minX = Math.min(...xs);
                                                const maxX = Math.max(...xs);
                                                const minY = Math.min(...ys);
                                                const maxY = Math.max(...ys);
                                                const cropWidth = maxX - minX;
                                                const cropHeight = maxY - minY;

                                                const canvasCrop = document.createElement('canvas');
                                                canvasCrop.width = cropWidth;
                                                canvasCrop.height = cropHeight;
                                                const ctxCrop = canvasCrop.getContext('2d');

                                                ctxCrop.save();
                                                ctxCrop.beginPath();
                                                if (circleCrop) {
                                                    const radius = Math.min(cropWidth, cropHeight) / 2;
                                                    ctxCrop.arc(cropWidth / 2, cropHeight / 2, radius, 0, 2 * Math.PI);
                                                } else {
                                                    ctxCrop.moveTo(rotatedCorners[0].x - minX, rotatedCorners[0].y - minY);
                                                    for (let i = 1; i < rotatedCorners.length; i++) {
                                                        ctxCrop.lineTo(rotatedCorners[i].x - minX, rotatedCorners[i].y - minY);
                                                    }
                                                    ctxCrop.closePath();
                                                }
                                                ctxCrop.clip();

                                                ctxCrop.drawImage(offscreenCanvas, -minX, -minY, nativeWidth, nativeHeight);
                                                ctxCrop.restore();

                                                const newDataUrl = canvasCrop.toDataURL();

                                                setCropHistory(prev => [...prev, { url, panX, panY, videoWidth, videoHeight, nativeWidth, nativeHeight }]);

                                                setUrl(newDataUrl);
                                                setPanX(0);
                                                setPanY(0);
                                                setVideoWidth(cropRect.width);
                                                setVideoHeight(cropRect.height);
                                                setNativeWidth(cropWidth);
                                                setNativeHeight(cropHeight);
                                                setIsCropping(false);
                                            };
                                            video.src = url;
                                        } else {
                                            setCropRect({ x: 0, y: 0, width: videoWidth, height: videoHeight });
                                            setIsCropping(true);
                                            setCircleCrop(false);
                                        }
                                    }}
                                    disabled={isCropDisabled ? true : false}
                                    style={{ "opacity": isCropDisabled ? "0.6" : "1.0", backgroundColor: isCropping ? "#5C2BE2" : "" }}
                                    className="dinolabsIDEMediaToolButton"
                                >
                                    <FontAwesomeIcon icon={faCropSimple} />
                                </button>
                            </Tippy>
                            {isCropping && (
                                <Tippy content="Circle Crop" theme="tooltip-light">
                                    <button
                                        onClick={() => {
                                            setCircleCrop(prev => {
                                                const newVal = !prev;
                                                if (newVal) {
                                                    setCropRect(prevRect => ({ ...prevRect, height: prevRect.width }));
                                                }
                                                return newVal;
                                            })
                                        }}
                                        style={{ backgroundColor: circleCrop ? '#5C2BE2' : '' }}
                                        className="dinolabsIDEMediaToolButton"
                                    >
                                        <FontAwesomeIcon icon={faCircle} />
                                    </button>
                                </Tippy>
                            )}
                            <Tippy content="Undo Crop" theme="tooltip-light">
                                <button onClick={undoCrop} className="dinolabsIDEMediaToolButton"
                                    disabled={isCropDisabled ? true : false}
                                    style={{ "opacity": isCropDisabled ? "0.6" : "1.0" }}
                                >
                                    <FontAwesomeIcon icon={faSquareCaretLeft} />
                                </button>
                            </Tippy>
                        </div>
                    </div>
                    {isCropping && (
                        <div className="dinolabsIDEMediaCellFlexStack">
                            <label className="dinolabsIDEMediaCellFlexTitle">
                                Crop Presets
                            </label>
                            <div className="dinolabsIDEMediaCellFlex">
                                <button className="dinolabsIDEMediaToolButtonText" onClick={() => setCropRect(prev => ({ ...prev, height: prev.width }))}>1:1</button>
                                <button className="dinolabsIDEMediaToolButtonText" onClick={() => setCropRect(prev => ({ ...prev, height: prev.width * (3 / 4) }))}>4:3</button>
                                <button className="dinolabsIDEMediaToolButtonText" onClick={() => setCropRect(prev => ({ ...prev, height: prev.width * (9 / 16) }))}>16:9</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="dinolabsIDEMediaCellWrapper">
                    <div className="dinolabsIDEMediaHeaderFlex">
                        <label className="dinolabsIDEMediaCellTitle">
                            <FontAwesomeIcon icon={faSwatchbook} />
                            Styles
                        </label>
                        <label className="dinolabsIDEConfrmationCheck">
                            <input
                                type="checkbox"
                                className="dinolabsIDESettingsCheckbox"
                                checked={removeBackground}
                                onChange={e => setRemoveBackground(e.target.checked)}
                            />
                            <span>
                                Remove Background
                            </span>
                        </label>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Opacity
                        </label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setOpacity(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    className="dinolabsIDESettingsSlider"
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={opacity}
                                    onChange={(e) => setOpacity(Number(e.target.value))}
                                />
                            </div>
                            <button onClick={() => setOpacity(prev => Math.min(prev + 10, 100))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Hue
                        </label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setHue(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    className="dinolabsIDESettingsSlider"
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={hue}
                                    onChange={(e) => setHue(Number(e.target.value))}
                                />
                            </div>
                            <button onClick={() => setHue(prev => Math.min(prev + 10, 360))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Saturation
                        </label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setSaturation(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    className="dinolabsIDESettingsSlider"
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={saturation}
                                    onChange={(e) => setSaturation(Number(e.target.value))}
                                />
                            </div>
                            <button onClick={() => setSaturation(prev => Math.min(prev + 10, 360))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Brightness
                        </label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setBrightness(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    className="dinolabsIDESettingsSlider"
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={brightness}
                                    onChange={(e) => setBrightness(Number(e.target.value))}
                                />
                            </div>
                            <button onClick={() => setBrightness(prev => Math.min(prev + 10, 360))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Contrast
                        </label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setContrast(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    className="dinolabsIDESettingsSlider"
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={contrast}
                                    onChange={(e) => setContrast(Number(e.target.value))}
                                />
                            </div>
                            <button onClick={() => setContrast(prev => Math.min(prev + 10, 360))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Blur
                        </label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setBlur(prev => Math.max(prev - 1, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    className="dinolabsIDESettingsSlider"
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={blur}
                                    onChange={(e) => setBlur(Number(e.target.value))}
                                />
                            </div>
                            <button onClick={() => setBlur(prev => prev + 1)} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Shadow
                        </label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setSpread(prev => Math.max(prev - 1, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    className="dinolabsIDESettingsSlider"
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={spread}
                                    onChange={(e) => setSpread(Number(e.target.value))}
                                />
                            </div>
                            <button onClick={() => setSpread(prev => prev + 1)} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Grayscale
                        </label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setGrayscale(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    className="dinolabsIDESettingsSlider"
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={grayscale}
                                    onChange={(e) => setGrayscale(Number(e.target.value))}
                                />
                            </div>
                            <button onClick={() => setGrayscale(prev => Math.min(prev + 10, 100))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Sepia
                        </label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setSepia(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    className="dinolabsIDESettingsSlider"
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sepia}
                                    onChange={(e) => setSepia(Number(e.target.value))}
                                />
                            </div>
                            <button onClick={() => setSepia(prev => Math.min(prev + 10, 100))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
            <div
                className="dinolabsIDEMediaContainer"
                style={{
                    cursor: 'grab',
                }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
            >
                <div className="diolabsIDEMediaSupplementalButtonsFlexWrapper">
                    {isCropping && (
                        <div className="diolabsIDEMediaSupplementalButtonsFlex">
                            <button className="dinolabsIDEMediaToolButtonHeader" onClick={() => setCropRect(prev => ({ ...prev, height: prev.width }))}>1:1</button>
                            <button className="dinolabsIDEMediaToolButtonHeader" onClick={() => setCropRect(prev => ({ ...prev, height: prev.width * (3 / 4) }))}>4:3</button>
                            <button className="dinolabsIDEMediaToolButtonHeader" onClick={() => setCropRect(prev => ({ ...prev, height: prev.width * (9 / 16) }))}>16:9</button>
                        </div>
                    )}
                </div>

                <div
                    className="dinolabsIDEImageResizer"
                    style={{
                        top: `calc(50% + ${panY}px)`,
                        left: `calc(50% + ${panX}px)`,
                        width: `${videoWidth}px`,
                        height: `${videoHeight}px`,
                        transform:
                            `translate(-50%, -50%) scale(${flipX * zoom}, ${flipY * zoom}) rotate(${rotation}deg)`,
                    }}
                >
                    <video
                        src={url}
                        controls
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        className="dinolabsIDEMediaContent"
                        style={{
                            width: '100%',
                            height: '100%',
                            filter: `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%) ${(!removeBackground && spread) ? `drop-shadow(0 0 ${spread}px rgba(0,0,0,0.5))` : ''}`,
                            userSelect: 'none',
                            borderRadius: 'inherit',
                            opacity: opacity / 100
                        }}
                    />
                    {!isCropping && (
                        <>
                            <div
                                className="dinolabsIDEMediaResizeHandle top-left"
                                onMouseDown={(e) => handleResizeMouseDown('top-left', e)}
                                style={{ top: '-6px', left: '-6px' }}
                            />
                            <div
                                className="dinolabsIDEMediaResizeHandle top-right"
                                onMouseDown={(e) => handleResizeMouseDown('top-right', e)}
                                style={{ top: '-6px', right: '-6px' }}
                            />
                            <div
                                className="dinolabsIDEMediaResizeHandle bottom-left"
                                onMouseDown={(e) => handleResizeMouseDown('bottom-left', e)}
                                style={{ bottom: '-6px', left: '-6px' }}
                            />
                            <div
                                className="dinolabsIDEMediaResizeHandle bottom-right"
                                onMouseDown={(e) => handleResizeMouseDown('bottom-right', e)}
                                style={{ bottom: '-6px', right: '-6px' }}
                            />
                        </>
                    )}
                    {isCropping && (
                        <div
                            className="dinolabsIDEMediaCropRectangle"
                            style={{
                                position: 'absolute',
                                border: '0.4vh dashed rgba(31, 174, 245, 1)',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                left: cropRect.x,
                                top: cropRect.y,
                                width: cropRect.width,
                                height: cropRect.height,
                                transform: `rotate(${cropRotation}deg)`,
                                borderRadius: circleCrop ? '50%' : '0',
                                zIndex: 10
                            }}
                            onMouseDown={handleCropMouseDown}
                        >
                            <div
                                className="dinolabsIDEMediaResizeHandle top-left"
                                style={{ pointerEvents: 'auto', top: '-8px', left: '-8px' }}
                                onMouseDown={(e) => handleCropResizeMouseDown('top-left', e)}
                            />
                            <div
                                className="dinolabsIDEMediaResizeHandle top-right"
                                style={{ pointerEvents: 'auto', top: '-8px', right: '-8px' }}
                                onMouseDown={(e) => handleCropResizeMouseDown('top-right', e)}
                            />
                            <div
                                className="dinolabsIDEMediaResizeHandle bottom-left"
                                style={{ pointerEvents: 'auto', bottom: '-8px', left: '-8px' }}
                                onMouseDown={(e) => handleCropResizeMouseDown('bottom-left', e)}
                            />
                            <div
                                className="dinolabsIDEMediaResizeHandle bottom-right"
                                style={{ pointerEvents: 'auto', bottom: '-8px', right: '-8px' }}
                                onMouseDown={(e) => handleCropResizeMouseDown('bottom-right', e)}
                            />
                            <div
                                className="dinolabsIDEMediaRotationHandle top-left"
                                style={{ pointerEvents: 'auto', position: 'absolute', top: '-30px', left: '-30px' }}
                                onMouseDown={handleCropRotationMouseDown}
                            />
                            <div
                                className="dinolabsIDEMediaRotationHandle top-right"
                                style={{ pointerEvents: 'auto', position: 'absolute', top: '-30px', right: '-30px' }}
                                onMouseDown={handleCropRotationMouseDown}
                            />
                            <div
                                className="dinolabsIDEMediaRotationHandle bottom-left"
                                style={{ pointerEvents: 'auto', position: 'absolute', bottom: '-30px', left: '-30px' }}
                                onMouseDown={handleCropRotationMouseDown}
                            />
                            <div
                                className="dinolabsIDEMediaRotationHandle bottom-right"
                                style={{ pointerEvents: 'auto', position: 'absolute', bottom: '-30px', right: '-30px' }}
                                onMouseDown={handleCropRotationMouseDown}
                            />
                        </div>
                    )}
                </div>


                <div className="dinolabsIDEVideoInputBottomBar">

                    <>
                        <div className="dinolabsIDEVideoContentFlexBig">
                            <Tippy content="Rewind 15 Seconds" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButtonSupplementLeading">
                                    <FontAwesomeIcon icon={faBackward} />
                                </button>
                            </Tippy>
                            <Tippy content="Play Video" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButton">
                                    <FontAwesomeIcon icon={faPlay} /> {/*faStop*/}
                                </button>
                            </Tippy>
                            <Tippy content="Pause Video" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButton">
                                    <FontAwesomeIcon icon={faPause} />
                                </button>
                            </Tippy>
                            <Tippy content="Loop Video" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButton">
                                    <FontAwesomeIcon icon={faRepeat} />
                                </button>
                            </Tippy>
                            <Tippy content="Skip 15 Seconds" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButtonSupplementTrailing">
                                    <FontAwesomeIcon icon={faForward} />
                                </button>
                            </Tippy>
                            <Tippy content="0.5x Playback" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButtonX">
                                    0.5x
                                </button>
                            </Tippy>
                            <Tippy content="1.0x Playback" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButtonX">
                                    1.0x
                                </button>
                            </Tippy>
                            <Tippy content="1.5x Playback" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButtonX">
                                    1.5x
                                </button>
                            </Tippy>
                            <Tippy content="2.0x Playback" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButtonX">
                                    2.0x
                                </button>
                            </Tippy>
                            <Tippy content="2.5x Playback" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButtonX">
                                    2.5x
                                </button>
                            </Tippy>
                            <Tippy content="3.0x Playback" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButtonX">
                                    3.0x
                                </button>
                            </Tippy>
                        </div>


                        <div className="dinolabsIDEVideoContentFlexSmall" style={{ "justify-content": "flex-start" }}>
                            <Tippy content="View Video Frames" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButtonHelper" style={{ "padding": 0 }}>
                                    <FontAwesomeIcon icon={faFilm} />
                                </button>
                            </Tippy>
                            <Tippy content="Clip From Video" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButtonHelper" style={{ "padding": 0 }}>
                                    <FontAwesomeIcon icon={faScissors} />
                                </button>
                            </Tippy>
                            <Tippy content="Stitch Clips" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButtonHelper" style={{ "padding": 0 }}>
                                    <FontAwesomeIcon icon={faTape} />
                                </button>
                            </Tippy>

                            <Tippy content="Insert Clip Into Video" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButtonHelper" style={{ "padding": 0 }}>
                                    <FontAwesomeIcon icon={faSquarePlus} />
                                </button>
                            </Tippy>

                            <Tippy content="Remove Clip From Video" theme="tooltip-light">
                                <button className="dinolabsIDEVideoButtonHelper" style={{ "padding": 0 }}>
                                    <FontAwesomeIcon icon={faSquareMinus} />
                                </button>
                            </Tippy>
                        </div>



                    </>


                    {/*
                    <label className="dinolabsIDEMediaModeIndicator">
                        <span>
                            {isCropping ? 'Cropping' : 'Idle'}
                        </span>
                    </label>
                    */}
                </div>
            </div>
        </div>
    );
}

export default DinoLabsIDEVideoEditor;
