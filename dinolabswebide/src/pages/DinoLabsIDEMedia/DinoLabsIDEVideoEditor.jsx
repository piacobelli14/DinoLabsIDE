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
    faArrowsUpToLine, faBackward, faBorderTopLeft, faBrush, faCircle,
    faCropSimple, faDownload, faFilm, faForward, faLeftRight,
    faMagnifyingGlassMinus, faMagnifyingGlassPlus, faMinus,
    faPause,
    faPlay,
    faPlus, faRepeat, faRotateLeft, faRotateRight, faRulerCombined, faScissors, faSquare, faSquareCaretLeft,
    faSquareMinus,
    faSquarePlus,
    faSwatchbook, faTabletScreenButton, faTape, faUpDown
} from '@fortawesome/free-solid-svg-icons';

function DinoLabsIDEVideoEditor({ fileHandle }) {
    const [url, setUrl] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const videoRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [flipX, setFlipX] = useState(1);
    const [flipY, setFlipY] = useState(1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [videoWidth, setVideoWidth] = useState(300);
    const [videoHeight, setVideoHeight] = useState(300);
    const [nativeWidth, setNativeWidth] = useState(300);
    const [nativeHeight, setNativeHeight] = useState(300);
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const aspectRatioRef = useRef(1);
    const [resizingCorner, setResizingCorner] = useState(null);
    const resizingRef = useRef(false);
    const lastResizePosRef = useRef({ x: 0, y: 0 });
    const initialSizeRef = useRef({ width: 300, height: 300 });
    const initialPosRef = useRef({ x: 0, y: 0 });
    const draggingRef = useRef(false);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(100);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [opacity, setOpacity] = useState(100);
    const [blur, setBlur] = useState(0);
    const [spread, setSpread] = useState(0);
    const [grayscale, setGrayscale] = useState(0);
    const [sepia, setSepia] = useState(0);
    const [borderRadius, setBorderRadius] = useState(0);
    const [borderTopLeftRadius, setBorderTopLeftRadius] = useState(0);
    const [borderTopRightRadius, setBorderTopRightRadius] = useState(0);
    const [borderBottomLeftRadius, setBorderBottomLeftRadius] = useState(0);
    const [borderBottomRightRadius, setBorderBottomRightRadius] = useState(0);
    const [syncCorners, setSyncCorners] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 100, height: 100 });
    const [cropRotation, setCropRotation] = useState(0);
    const [circleCrop, setCircleCrop] = useState(false);
    const [isCropDisabled, setIsCropDisabled] = useState(false);
    const [cropHistory, setCropHistory] = useState([]);
    const cropResizingRef = useRef(false);
    const cropResizingCorner = useRef(null);
    const cropLastResizePosRef = useRef({ x: 0, y: 0 });
    const cropInitialRectRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const cropRotatingRef = useRef(false);
    const cropInitialRotation = useRef(0);
    const cropRotationStartAngle = useRef(0);
    const cropRotationCenter = useRef({ x: 0, y: 0 });
    const [paths, setPaths] = useState([]);
    const [undonePaths, setUndonePaths] = useState([]);
    const [tempPath, setTempPath] = useState(null);
    const isDrawingRef = useRef(false);
    const currentPathPoints = useRef([]);
    const [drawColor, setDrawColor] = useState('#5C2BE2');
    const [highlightColor, setHighlightColor] = useState('#00ff624d');
    const [drawBrushSize, setDrawBrushSize] = useState(4);
    const [highlightBrushSize, setHighlightBrushSize] = useState(4);
    const [isDrawColorOpen, setIsDrawColorOpen] = useState(false);
    const [isHighlightColorOpen, setIsHighlightColorOpen] = useState(false);
    const [actionMode, setActionMode] = useState('Idle');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlaybackRate, setCurrentPlaybackRate] = useState(1.0);
    const [isLooping, setIsLooping] = useState(false);
    const [isProcessingCrop, setIsProcessingCrop] = useState(false);
    const containerRef = useRef(null);

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
                    const tempVideo = document.createElement('video');
                    tempVideo.onloadedmetadata = () => {
                        setNativeWidth(tempVideo.videoWidth);
                        setNativeHeight(tempVideo.videoHeight);
                        const containerWidth = containerRef.current?.clientWidth || 800;
                        const containerHeight = containerRef.current?.clientHeight || 600;
                        const maxPossibleWidth = containerWidth * 0.7;
                        const maxPossibleHeight = containerHeight * 0.7;
                        let initWidth = tempVideo.videoWidth;
                        let initHeight = tempVideo.videoHeight;
                        const widthRatio = initWidth / maxPossibleWidth;
                        const heightRatio = initHeight / maxPossibleHeight;
                        if (widthRatio > 1 || heightRatio > 1) {
                            const ratio = Math.max(widthRatio, heightRatio);
                            initWidth /= ratio;
                            initHeight /= ratio;
                        }
                        setVideoWidth(initWidth);
                        setVideoHeight(initHeight);
                    };
                    tempVideo.src = objectUrl;
                }
            } catch (error) {}
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
        setPanX(0);
        setPanY(0);
        setHue(0);
        setSaturation(100);
        setBrightness(100);
        setContrast(100);
        setOpacity(100);
        setBlur(0);
        setSpread(0);
        setGrayscale(0);
        setSepia(0);
        setBorderRadius(0);
        setBorderTopLeftRadius(0);
        setBorderTopRightRadius(0);
        setBorderBottomLeftRadius(0);
        setBorderBottomRightRadius(0);
        setSyncCorners(false);
        setPaths([]);
        setUndonePaths([]);
        setTempPath(null);
        setActionMode('Idle');
        const containerWidth = containerRef.current?.clientWidth || 800;
        const containerHeight = containerRef.current?.clientHeight || 600;
        const maxPossibleWidth = containerWidth * 0.7;
        const maxPossibleHeight = containerHeight * 0.7;
        let initWidth = nativeWidth;
        let initHeight = nativeHeight;
        const widthRatio = initWidth / maxPossibleWidth;
        const heightRatio = initHeight / maxPossibleHeight;
        if (widthRatio > 1 || heightRatio > 1) {
            const ratio = Math.max(widthRatio, heightRatio);
            initWidth /= ratio;
            initHeight /= ratio;
        }
        setVideoWidth(initWidth);
        setVideoHeight(initHeight);
        setIsCropDisabled(false);
        setIsCropping(false);
        setCropRect({ x: 0, y: 0, width: 100, height: 100 });
        setCropRotation(0);
        setCircleCrop(false);
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
                    options: [{ label: '.mp4', value: 'mp4' }]
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
        if (!alertResult) return;
        alert("Download not yet implemented—would finalize or re-encode here.");
    };

    const handleDragStart = (e) => {
        if (isCropping) return;
        if (actionMode !== 'Idle') return;
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
        if (isCropping || actionMode !== 'Idle') return;
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
                newWidth += localDx;
                newHeight = newWidth / ratio;
            } else if (resizingCorner === 'bottom-left') {
                newWidth -= localDx;
                newHeight = newWidth / ratio;
            } else if (resizingCorner === 'top-right') {
                newWidth += localDx;
                newHeight = newWidth / ratio;
            } else if (resizingCorner === 'top-left') {
                newWidth -= localDx;
                newHeight = newWidth / ratio;
            }
        } else {
            if (resizingCorner === 'bottom-right') {
                newWidth += localDx;
                newHeight += localDy;
            } else if (resizingCorner === 'bottom-left') {
                newWidth -= localDx;
                newHeight += localDy;
                newPanX += localDx;
            } else if (resizingCorner === 'top-right') {
                newWidth += localDx;
                newHeight -= localDy;
                newPanY += localDy;
            } else if (resizingCorner === 'top-left') {
                newWidth -= localDx;
                newHeight -= localDy;
                newPanX += localDx;
                newPanY += localDy;
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
        width = Math.max(width, 10);
        height = Math.max(height, 10);
        setCropRect({ x, y, width, height });
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

    const cropDraggingRefLocal = useRef(false);
    const lastCropDragPosRef = useRef({ x: 0, y: 0 });

    const handleCropMouseDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        cropDraggingRefLocal.current = true;
        lastCropDragPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleCropMouseMove = (e) => {
        if (!cropDraggingRefLocal.current) return;
        const dx = e.clientX - lastCropDragPosRef.current.x;
        const dy = e.clientY - lastCropDragPosRef.current.y;
        lastCropDragPosRef.current = { x: e.clientX, y: e.clientY };
        setCropRect(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    };

    const handleCropMouseUp = () => {
        cropDraggingRefLocal.current = false;
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
        cropRotationCenter.current = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
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
            const prev = cropHistory[cropHistory.length - 1];
            setCropHistory(old => old.slice(0, old.length - 1));
            setUrl(prev.url);
            setPanX(prev.panX);
            setPanY(prev.panY);
            setVideoWidth(prev.videoWidth);
            setVideoHeight(prev.videoHeight);
            setNativeWidth(prev.nativeWidth);
            setNativeHeight(prev.nativeHeight);
            setIsCropping(false);
        }
    };

    const getSvgPoint = (e) => {
        const svg = e.currentTarget;
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        const ctm = svg.getScreenCTM().inverse();
        return point.matrixTransform(ctm);
    };

    const handleSvgMouseDown = (e) => {
        if (actionMode === 'Drawing' || actionMode === 'Highlighting') {
            isDrawingRef.current = true;
            const { x, y } = getSvgPoint(e);
            currentPathPoints.current = [{ x, y }];
            setUndonePaths([]);
        }
    };

    const handleSvgMouseMove = (e) => {
        if (!isDrawingRef.current) return;
        if (actionMode === 'Drawing' || actionMode === 'Highlighting') {
            const { x, y } = getSvgPoint(e);
            currentPathPoints.current.push({ x, y });
            const pts = currentPathPoints.current;
            if (pts.length > 1) {
                let d = `M ${pts[0].x} ${pts[0].y}`;
                for (let i = 1; i < pts.length - 1; i++) {
                    let x_mid = (pts[i].x + pts[i + 1].x) / 2;
                    let y_mid = (pts[i].y + pts[i + 1].y) / 2;
                    d += ` Q ${pts[i].x} ${pts[i].y} ${x_mid} ${y_mid}`;
                }
                d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
                setTempPath({
                    d,
                    color: actionMode === 'Drawing' ? drawColor : highlightColor,
                    width: actionMode === 'Drawing' ? drawBrushSize : highlightBrushSize
                });
            }
        }
    };

    const handleSvgMouseUp = () => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        const pts = currentPathPoints.current;
        if (pts.length > 1) {
            let d = `M ${pts[0].x} ${pts[0].y}`;
            for (let i = 1; i < pts.length - 1; i++) {
                let x_mid = (pts[i].x + pts[i + 1].x) / 2;
                let y_mid = (pts[i].y + pts[i + 1].y) / 2;
                d += ` Q ${pts[i].x} ${pts[i].y} ${x_mid} ${y_mid}`;
            }
            d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
            const newPath = {
                d,
                color: actionMode === 'Drawing' ? drawColor : highlightColor,
                width: actionMode === 'Drawing' ? drawBrushSize : highlightBrushSize
            };
            setPaths(prev => [...prev, newPath]);
        }
        setTempPath(null);
        currentPathPoints.current = [];
    };

    const undoStroke = () => {
        setPaths(prev => {
            if (prev.length === 0) return prev;
            const newPaths = [...prev];
            const undoneStroke = newPaths.pop();
            setUndonePaths(ups => [...ups, undoneStroke]);
            return newPaths;
        });
    };

    const redoStroke = () => {
        setUndonePaths(prev => {
            if (prev.length === 0) return prev;
            const newUndone = [...prev];
            const strokeToRedo = newUndone.pop();
            setPaths(ps => [...ps, strokeToRedo]);
            return newUndone;
        });
    };

    const performCanvasVideoCrop = async () => {
        setIsProcessingCrop(true);
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = nativeWidth;
        offscreenCanvas.height = nativeHeight;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        let filterString = `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)`;
        if (spread) {
            filterString += ` drop-shadow(0 0 ${spread}px rgba(0,0,0,0.5))`;
        }
        offscreenCtx.filter = filterString;
        offscreenCtx.globalAlpha = opacity / 100;
        const tempVideo = document.createElement('video');
        tempVideo.src = url;
        tempVideo.crossOrigin = 'anonymous';
        tempVideo.controls = false;
        tempVideo.style.position = 'fixed';
        tempVideo.style.left = '-9999px';
        tempVideo.style.top = '-9999px';
        document.body.appendChild(tempVideo);
        await new Promise((res) => {
            tempVideo.onloadeddata = () => res();
        });
        tempVideo.currentTime = 0;
        tempVideo.play();
        const audioStream = tempVideo.captureStream();
        const audioTracks = audioStream.getAudioTracks();
        const fps = 30;
        const mainCanvasStream = offscreenCanvas.captureStream(fps);
        const videoTracks = mainCanvasStream.getVideoTracks();
        const combinedStream = new MediaStream();
        videoTracks.forEach(t => combinedStream.addTrack(t));
        audioTracks.forEach(t => combinedStream.addTrack(t));
        const mediaRecorder = new MediaRecorder(combinedStream, {
            mimeType: 'video/webm; codecs=vp9'
        });
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };
        let resolveDone;
        const donePromise = new Promise((r) => (resolveDone = r));
        mediaRecorder.onstop = () => resolveDone();
        mediaRecorder.start();
        const intermediateCanvas = document.createElement('canvas');
        intermediateCanvas.width = nativeWidth;
        intermediateCanvas.height = nativeHeight;
        const icCtx = intermediateCanvas.getContext('2d');
        const finalCanvas = document.createElement('canvas');
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
                x: (cx + (dx * Math.cos(rad) - dy * Math.sin(rad))) * (nativeWidth / videoWidth),
                y: (cy + (dx * Math.sin(rad) + dy * Math.cos(rad))) * (nativeHeight / videoHeight)
            };
        });
        const xs = rotatedCorners.map(pt => pt.x);
        const ys = rotatedCorners.map(pt => pt.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const realCropW = maxX - minX;
        const realCropH = maxY - minY;
        finalCanvas.width = realCropW;
        finalCanvas.height = realCropH;
        const fcCtx = finalCanvas.getContext('2d');
        const finalStream = finalCanvas.captureStream(fps);
        const finalTracks = finalStream.getVideoTracks();
        const combinedFinal = new MediaStream();
        finalTracks.forEach(t => combinedFinal.addTrack(t));
        audioTracks.forEach(t => combinedFinal.addTrack(t));
        const finalRecorder = new MediaRecorder(combinedFinal, {
            mimeType: 'video/webm; codecs=vp9'
        });
        const finalChunks = [];
        finalRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                finalChunks.push(e.data);
            }
        };
        let resolveFinalDone;
        const finalDonePromise = new Promise((r) => (resolveFinalDone = r));
        finalRecorder.onstop = () => resolveFinalDone();
        finalRecorder.start();
        let lastFrameTime = performance.now();
        const frameInterval = 1000 / fps;
        const drawFrame = () => {
            if (tempVideo.paused || tempVideo.ended) {
                return;
            }
            const now = performance.now();
            if (now - lastFrameTime >= frameInterval) {
                lastFrameTime = now;
                icCtx.save();
                icCtx.clearRect(0, 0, nativeWidth, nativeHeight);
                icCtx.filter = filterString;
                icCtx.globalAlpha = opacity / 100;
                icCtx.drawImage(tempVideo, 0, 0, nativeWidth, nativeHeight);
                icCtx.restore();
                icCtx.save();
                paths.forEach(p => {
                    icCtx.strokeStyle = p.color;
                    icCtx.lineWidth = p.width;
                    icCtx.lineCap = "round";
                    try {
                        const path2d = new Path2D(p.d);
                        icCtx.stroke(path2d);
                    } catch {}
                });
                if (tempPath) {
                    icCtx.strokeStyle = tempPath.color;
                    icCtx.lineWidth = tempPath.width;
                    icCtx.lineCap = "round";
                    try {
                        const tmp = new Path2D(tempPath.d);
                        icCtx.stroke(tmp);
                    } catch {}
                }
                icCtx.restore();
                fcCtx.save();
                fcCtx.clearRect(0, 0, realCropW, realCropH);
                fcCtx.beginPath();
                if (circleCrop) {
                    const radius = Math.min(realCropW, realCropH) / 2;
                    fcCtx.arc(realCropW / 2, realCropH / 2, radius, 0, 2*Math.PI);
                } else {
                    if (syncCorners) {
                        let r = Math.min(borderRadius, realCropW / 2, realCropH / 2);
                        fcCtx.moveTo(r, 0);
                        fcCtx.lineTo(realCropW - r, 0);
                        fcCtx.quadraticCurveTo(realCropW, 0, realCropW, r);
                        fcCtx.lineTo(realCropW, realCropH - r);
                        fcCtx.quadraticCurveTo(realCropW, realCropH, realCropW - r, realCropH);
                        fcCtx.lineTo(r, realCropH);
                        fcCtx.quadraticCurveTo(0, realCropH, 0, realCropH - r);
                        fcCtx.lineTo(0, r);
                        fcCtx.quadraticCurveTo(0, 0, r, 0);
                    } else {
                        const tl = Math.min(borderTopLeftRadius, realCropW/2, realCropH/2);
                        const tr = Math.min(borderTopRightRadius, realCropW/2, realCropH/2);
                        const br = Math.min(borderBottomRightRadius, realCropW/2, realCropH/2);
                        const bl = Math.min(borderBottomLeftRadius, realCropW/2, realCropH/2);
                        fcCtx.moveTo(tl, 0);
                        fcCtx.lineTo(realCropW - tr, 0);
                        fcCtx.quadraticCurveTo(realCropW, 0, realCropW, tr);
                        fcCtx.lineTo(realCropW, realCropH - br);
                        fcCtx.quadraticCurveTo(realCropW, realCropH, realCropW - br, realCropH);
                        fcCtx.lineTo(bl, realCropH);
                        fcCtx.quadraticCurveTo(0, realCropH, 0, realCropH - bl);
                        fcCtx.lineTo(0, tl);
                        fcCtx.quadraticCurveTo(0, 0, tl, 0);
                    }
                }
                fcCtx.clip();
                fcCtx.drawImage(
                    intermediateCanvas,
                    -minX, -minY
                );
                fcCtx.restore();
            }
            requestAnimationFrame(drawFrame);
        };
        requestAnimationFrame(drawFrame);
        await new Promise((resEnd) => {
            tempVideo.onended = () => resEnd();
        });
        finalRecorder.stop();
        await finalDonePromise;
        const mergedBlob = new Blob(finalChunks, { type: 'video/webm' });
        const newUrl = URL.createObjectURL(mergedBlob);
        document.body.removeChild(tempVideo);
        setCropHistory(prev => [
            ...prev,
            { url, panX, panY, videoWidth, videoHeight, nativeWidth, nativeHeight }
        ]);
        setUrl(newUrl);
        setNativeWidth(realCropW);
        setNativeHeight(realCropH);
        const containerWidth = containerRef.current?.clientWidth || 800;
        const containerHeight = containerRef.current?.clientHeight || 600;
        const maxPossibleWidth = containerWidth * 0.7;
        const maxPossibleHeight = containerHeight * 0.7;
        let initWidth = realCropW;
        let initHeight = realCropH;
        const widthRatio = initWidth / maxPossibleWidth;
        const heightRatio = initHeight / maxPossibleHeight;
        if (widthRatio > 1 || heightRatio > 1) {
            const ratio = Math.max(widthRatio, heightRatio);
            initWidth /= ratio;
            initHeight /= ratio;
        }
        setVideoWidth(initWidth);
        setVideoHeight(initHeight);
        setPanX(0);
        setPanY(0);
        setIsCropping(false);
        setIsProcessingCrop(false);
        setPaths([]);
        setUndonePaths([]);
        setTempPath(null);
        setActionMode('Idle');
    };

    const finalizeCrop = async () => {
        if (mediaType !== 'video') {
            alert("Non-video cropping not implemented in this snippet.");
            return;
        }
        setCropHistory(prev => [
            ...prev,
            { url, panX, panY, videoWidth, videoHeight, nativeWidth, nativeHeight }
        ]);
        await performCanvasVideoCrop();
    };

    const handleRewind15 = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 15);
        }
    };

    const handlePlayVideo = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleToggleLoop = () => {
        if (!videoRef.current) return;
        const newVal = !videoRef.current.loop;
        videoRef.current.loop = newVal;
        setIsLooping(newVal);
    };

    const handleSkip15 = () => {
        if (videoRef.current && videoRef.current.duration) {
            videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 15);
        }
    };

    const handleSetPlaybackRate = (rate) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
        setCurrentPlaybackRate(rate);
    };

    const handleViewFrames = () => { console.log("View frames clicked (placeholder)."); };

    const handleClipFromVideo = () => { console.log("Clip from video clicked (placeholder)."); };

    const handleStitchClips = () => { console.log("Stitch clips clicked (placeholder)."); };

    const handleInsertClip = () => { console.log("Insert clip clicked (placeholder)."); };

    const handleRemoveClip = () => { console.log("Remove clip clicked (placeholder)."); };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.currentTime = 0;
            videoRef.current.loop = true;
            setIsLooping(true);
            videoRef.current.play();
            setIsPlaying(true);
        }
    }, [url]);

    const handleCropRotationMouseDownHandler = (e) => {
        handleCropRotationMouseDown(e);
    };

    return (
        <div className="dinolabsIDEMediaContentWrapper">
            {isProcessingCrop && (
                <div className="dinolabsIDEMediaContentCropIndicator">
                    <div className="loading-circle" />
                </div>
            )}
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
                        <label className="dinolabsIDEMediaCellFlexTitle">Position</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <input
                                className="dinolabsIDEMediaPositionInput"
                                type="text"
                                value={`X: ${panX}`}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.-]/g, "");
                                    setPanX(Number(val));
                                }}
                            />
                            <input
                                className="dinolabsIDEMediaPositionInput"
                                type="text"
                                value={`Y: ${panY}`}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.-]/g, "");
                                    setPanY(Number(val));
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
                                <button onClick={() => { setRotation(r => r - 90); setIsCropping(false); }} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faRotateLeft} />
                                </button>
                            </Tippy>
                            <Tippy content="Rotate Right" theme="tooltip-light">
                                <button onClick={() => { setRotation(r => r + 90); setIsCropping(false); }} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faRotateRight} />
                                </button>
                            </Tippy>
                            <Tippy content="Flip Horizontally" theme="tooltip-light">
                                <button onClick={() => { setFlipX(prev => -prev); setIsCropping(false); }} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faLeftRight} />
                                </button>
                            </Tippy>
                            <Tippy content="Flip Vertically" theme="tooltip-light">
                                <button onClick={() => { setFlipY(prev => -prev); setIsCropping(false); }} className="dinolabsIDEMediaToolButton">
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
                            <span>Preserve Aspect Ratio</span>
                        </label>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Video Size</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <input
                                className="dinolabsIDEMediaPositionInput"
                                type="text"
                                value={`W: ${Math.round(videoWidth)}px`}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.-]/g, "");
                                    setVideoWidth(Number(val));
                                }}
                            />
                            <input
                                className="dinolabsIDEMediaPositionInput"
                                type="text"
                                value={`H: ${Math.round(videoHeight)}px`}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.-]/g, "");
                                    setVideoHeight(Number(val));
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
                                    onClick={async () => {
                                        if (actionMode === 'Drawing' || actionMode === 'Highlighting') return;
                                        if (isCropDisabled) return;
                                        if (isCropping) {
                                            if (mediaType === 'video') {
                                                await finalizeCrop();
                                            } else {
                                                alert("Non-video cropping not implemented.");
                                            }
                                        } else {
                                            setCropRect({ x: 0, y: 0, width: videoWidth, height: videoHeight });
                                            setIsCropping(true);
                                            setCircleCrop(false);
                                            setActionMode('Cropping');
                                        }
                                    }}
                                    disabled={isCropDisabled || actionMode === 'Drawing' || actionMode === 'Highlighting'}
                                    style={{
                                        opacity: (isCropDisabled || actionMode === 'Drawing' || actionMode === 'Highlighting') ? "0.6" : "1.0",
                                        backgroundColor: isCropping ? "#5C2BE2" : ""
                                    }}
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
                                                    setCropRect(pr => ({...pr, height: pr.width}));
                                                }
                                                return newVal;
                                            });
                                        }}
                                        style={{ backgroundColor: circleCrop ? '#5C2BE2' : '' }}
                                        className="dinolabsIDEMediaToolButton"
                                    >
                                        <FontAwesomeIcon icon={faCircle} />
                                    </button>
                                </Tippy>
                            )}
                            <Tippy content="Undo Crop" theme="tooltip-light">
                                <button
                                    onClick={undoCrop}
                                    disabled={isCropDisabled}
                                    style={{ opacity: isCropDisabled ? "0.6" : "1.0" }}
                                    className="dinolabsIDEMediaToolButton"
                                >
                                    <FontAwesomeIcon icon={faSquareCaretLeft} />
                                </button>
                            </Tippy>
                        </div>
                    </div>
                    {isCropping && (
                        <div className="dinolabsIDEMediaCellFlexStack">
                            <label className="dinolabsIDEMediaCellFlexTitle">Crop Presets</label>
                            <div className="dinolabsIDEMediaCellFlex">
                                <button
                                    className="dinolabsIDEMediaToolButtonText"
                                    onClick={() => setCropRect(prev => ({
                                        ...prev, height: prev.width
                                    }))}
                                >
                                    1:1
                                </button>
                                <button
                                    className="dinolabsIDEMediaToolButtonText"
                                    onClick={() => setCropRect(prev => ({
                                        ...prev, height: prev.width * (3/4)
                                    }))}
                                >
                                    4:3
                                </button>
                                <button
                                    className="dinolabsIDEMediaToolButtonText"
                                    onClick={() => setCropRect(prev => ({
                                        ...prev, height: prev.width * (9/16)
                                    }))}
                                >
                                    16:9
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="dinolabsIDEMediaCellWrapper">
                    <div className="dinolabsIDEMediaHeaderFlex">
                        <label className="dinolabsIDEMediaCellTitle">
                            <FontAwesomeIcon icon={faBrush} />
                            Drawing
                        </label>
                        <div className="dinolabsIDEMediaCellFlexSupplement">
                            <Tippy content="Undo Marks" theme="tooltip-light">
                                <button onClick={undoStroke} className="dinolabsIDEMediaToolButtonHeader">
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                </button>
                            </Tippy>
                            <Tippy content="Redo Marks" theme="tooltip-light">
                                <button onClick={redoStroke} className="dinolabsIDEMediaToolButtonHeader">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </button>
                            </Tippy>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Draw on Video</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setActionMode(prev => prev === 'Drawing' ? 'Idle' : 'Drawing')}
                                style={{ backgroundColor: actionMode === "Drawing" ? "#5C2BE2" : "", opacity: isCropping ? "0.6" : "1.0" }}
                                disabled={isCropping}
                                className="dinolabsIDEMediaToolButtonBig"
                            >
                                Draw
                            </button>
                            <Tippy
                                content={<DinoLabsIDEColorPicker color={drawColor} onChange={setDrawColor} />}
                                visible={isDrawColorOpen}
                                onClickOutside={() => setIsDrawColorOpen(false)}
                                interactive
                                placement="right"
                                className="color-picker-tippy"
                            >
                                <label
                                    className="dinolabsIDEMediaColorPicker"
                                    onClick={() => setIsDrawColorOpen(prev => !prev)}
                                    style={{ backgroundColor: drawColor }}
                                />
                            </Tippy>
                            <div className="dinolabsIDEMediaBrushSizeFlex">
                                {[{size:1,label:'XS'},{size:2,label:'S'},{size:4,label:'M'},{size:6,label:'L'},{size:8,label:'XL'}].map(opt => (
                                    <button
                                        key={opt.size}
                                        onClick={() => setDrawBrushSize(opt.size)}
                                        style={{ backgroundColor: drawBrushSize === opt.size ? '#5C2BE2' : '' }}
                                        className="dinolabsIDEMediaToolButtonMini"
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Highlight on Video</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setActionMode(prev => prev === 'Highlighting' ? 'Idle' : 'Highlighting')}
                                style={{ backgroundColor: actionMode === "Highlighting" ? "#5C2BE2" : "", opacity: isCropping ? "0.6" : "1.0" }}
                                disabled={isCropping}
                                className="dinolabsIDEMediaToolButtonBig"
                            >
                                Highlight
                            </button>
                            <Tippy
                                content={<DinoLabsIDEColorPicker color={highlightColor} onChange={setHighlightColor} />}
                                visible={isHighlightColorOpen}
                                onClickOutside={() => setIsHighlightColorOpen(false)}
                                interactive
                                placement="right"
                                className="color-picker-tippy"
                            >
                                <label
                                    className="dinolabsIDEMediaColorPicker"
                                    onClick={() => setIsHighlightColorOpen(prev => !prev)}
                                    style={{ backgroundColor: highlightColor }}
                                />
                            </Tippy>
                            <div className="dinolabsIDEMediaBrushSizeFlex">
                                {[{size:1,label:'XS'},{size:2,label:'S'},{size:4,label:'M'},{size:6,label:'L'},{size:8,label:'XL'}].map(opt => (
                                    <button
                                        key={opt.size}
                                        onClick={() => setHighlightBrushSize(opt.size)}
                                        style={{ backgroundColor: highlightBrushSize === opt.size ? '#5C2BE2' : '' }}
                                        className="dinolabsIDEMediaToolButtonMini"
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="dinolabsIDEMediaCellWrapper">
                    <div className="dinolabsIDEMediaHeaderFlex">
                        <label className="dinolabsIDEMediaCellTitle">
                            <FontAwesomeIcon icon={faSwatchbook} />
                            Styles
                        </label>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Opacity</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setOpacity(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={opacity}
                                    onChange={(e) => setOpacity(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button onClick={() => setOpacity(prev => Math.min(prev + 10, 100))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Hue</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setHue(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={hue}
                                    onChange={(e) => setHue(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button onClick={() => setHue(prev => Math.min(prev + 10, 360))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Saturation</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setSaturation(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={saturation}
                                    onChange={(e) => setSaturation(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button onClick={() => setSaturation(prev => Math.min(prev + 10, 360))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Brightness</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setBrightness(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={brightness}
                                    onChange={(e) => setBrightness(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button onClick={() => setBrightness(prev => Math.min(prev + 10, 360))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Contrast</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setContrast(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={contrast}
                                    onChange={(e) => setContrast(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button onClick={() => setContrast(prev => Math.min(prev + 10, 360))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Blur</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setBlur(prev => Math.max(prev - 1, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={blur}
                                    onChange={(e) => setBlur(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button onClick={() => setBlur(prev => prev + 1)} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Shadow</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setSpread(prev => Math.max(prev - 1, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={spread}
                                    onChange={(e) => setSpread(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button onClick={() => setSpread(prev => prev + 1)} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Grayscale</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setGrayscale(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={grayscale}
                                    onChange={(e) => setGrayscale(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button onClick={() => setGrayscale(prev => Math.min(prev + 10, 100))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Sepia</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setSepia(prev => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sepia}
                                    onChange={(e) => setSepia(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button onClick={() => setSepia(prev => Math.min(prev + 10, 100))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="dinolabsIDEMediaCellWrapper">
                    <div className="dinolabsIDEMediaHeaderFlex">
                        <label className="dinolabsIDEMediaCellTitle">
                            <FontAwesomeIcon icon={faBorderTopLeft} />
                            Corner Rounding
                        </label>
                        <label className="dinolabsIDEConfrmationCheck">
                            <input
                                type="checkbox"
                                className="dinolabsIDESettingsCheckbox"
                                checked={syncCorners}
                                onChange={(e) => {
                                    setSyncCorners(e.target.checked);
                                    if (e.target.checked) {
                                        const v = borderRadius || borderTopLeftRadius || 0;
                                        const limited = Math.min(v, 100);
                                        setBorderRadius(limited);
                                        setBorderTopLeftRadius(limited);
                                        setBorderTopRightRadius(limited);
                                        setBorderBottomLeftRadius(limited);
                                        setBorderBottomRightRadius(limited);
                                    }
                                }}
                            />
                            <span>Sync Corners</span>
                        </label>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Corner Radii</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            {syncCorners ? (
                                <input
                                    className="dinolabsIDEMediaPositionInput"
                                    type="text"
                                    value={`Corner: ${borderRadius}px`}
                                    onChange={(e) => {
                                        const newVal = e.target.value.replace(/[^0-9]/g, "");
                                        let val = Number(newVal);
                                        val = Math.min(val, 100);
                                        setBorderRadius(val);
                                        setBorderTopLeftRadius(val);
                                        setBorderTopRightRadius(val);
                                        setBorderBottomLeftRadius(val);
                                        setBorderBottomRightRadius(val);
                                    }}
                                />
                            ) : (
                                <div className="dinolabsIDECornerInputGridWrapper">
                                    <div className="dinolabsIDECornerInputFlex">
                                        <input
                                            className="dinolabsIDEMediaPositionInput"
                                            type="text"
                                            value={`TL: ${borderTopLeftRadius}px`}
                                            onChange={(e) => {
                                                const nVal = e.target.value.replace(/[^0-9]/g, "");
                                                let v = Number(nVal);
                                                v = Math.min(v, 100);
                                                setBorderTopLeftRadius(v);
                                            }}
                                        />
                                        <input
                                            className="dinolabsIDEMediaPositionInput"
                                            type="text"
                                            value={`TR: ${borderTopRightRadius}px`}
                                            onChange={(e) => {
                                                const nVal = e.target.value.replace(/[^0-9]/g, "");
                                                let v = Number(nVal);
                                                v = Math.min(v, 100);
                                                setBorderTopRightRadius(v);
                                            }}
                                        />
                                    </div>
                                    <div className="dinolabsIDECornerInputFlex">
                                        <input
                                            className="dinolabsIDEMediaPositionInput"
                                            type="text"
                                            value={`BL: ${borderBottomLeftRadius}px`}
                                            onChange={(e) => {
                                                const nVal = e.target.value.replace(/[^0-9]/g, "");
                                                let v = Number(nVal);
                                                v = Math.min(v, 100);
                                                setBorderBottomLeftRadius(v);
                                            }}
                                        />
                                        <input
                                            className="dinolabsIDEMediaPositionInput"
                                            type="text"
                                            value={`BR: ${borderBottomRightRadius}px`}
                                            onChange={(e) => {
                                                const nVal = e.target.value.replace(/[^0-9]/g, "");
                                                let v = Number(nVal);
                                                v = Math.min(v, 100);
                                                setBorderBottomRightRadius(v);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="dinolabsIDEMediaContainer"
                style={{ cursor: 'grab' }}
                ref={containerRef}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
            >
                <div
                    className="dinolabsIDEImageResizer"
                    style={{
                        top: `calc(50% + ${panY}px)`,
                        left: `calc(50% + ${panX}px)`,
                        width: `${videoWidth}px`,
                        height: `${videoHeight}px`,
                        transform: `translate(-50%, -50%) scale(${flipX * zoom}, ${flipY * zoom}) rotate(${rotation}deg)`,
                        overflow: 'visible',
                        borderRadius: syncCorners
                            ? `${borderRadius}px`
                            : `${borderTopLeftRadius}px ${borderTopRightRadius}px ${borderBottomRightRadius}px ${borderBottomLeftRadius}px`
                    }}
                >
                    <video
                        src={url}
                        ref={videoRef}
                        controls
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        className="dinolabsIDEMediaContent"
                        style={{
                            width: '100%',
                            height: '100%',
                            filter: `
                                hue-rotate(${hue}deg)
                                saturate(${saturation}%)
                                brightness(${brightness}%)
                                contrast(${contrast}%)
                                blur(${blur}px)
                                grayscale(${grayscale}%)
                                sepia(${sepia}%)
                                ${(spread) ? `drop-shadow(0 0 ${spread}px rgba(0,0,0,0.5))` : ''}
                            `,
                            userSelect: 'none',
                            borderRadius: 'inherit',
                            opacity: opacity / 100
                        }}
                    />
                    {!isCropping && (actionMode === 'Idle') && (
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
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                left: cropRect.x,
                                top: cropRect.y,
                                width: cropRect.width,
                                height: cropRect.height,
                                transform: `rotate(${cropRotation}deg)`,
                                zIndex: 10,
                                borderRadius: circleCrop ? '50%' : '0'
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
                                onMouseDown={handleCropRotationMouseDownHandler}
                            />
                            <div
                                className="dinolabsIDEMediaRotationHandle top-right"
                                style={{ pointerEvents: 'auto', position: 'absolute', top: '-30px', right: '-30px' }}
                                onMouseDown={handleCropRotationMouseDownHandler}
                            />
                            <div
                                className="dinolabsIDEMediaRotationHandle bottom-left"
                                style={{ pointerEvents: 'auto', position: 'absolute', bottom: '-30px', left: '-30px' }}
                                onMouseDown={handleCropRotationMouseDownHandler}
                            />
                            <div
                                className="dinolabsIDEMediaRotationHandle bottom-right"
                                style={{ pointerEvents: 'auto', position: 'absolute', bottom: '-30px', right: '-30px' }}
                                onMouseDown={handleCropRotationMouseDownHandler}
                            />
                        </div>
                    )}
                    <svg
                        viewBox={`0 0 ${nativeWidth} ${nativeHeight}`}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: (actionMode !== 'Idle') ? 'auto' : 'none',
                            cursor: (actionMode === 'Drawing') ? 'crosshair' : (actionMode === 'Highlighting') ? 'pointer' : 'default',
                            filter: `
                                hue-rotate(${hue}deg)
                                saturate(${saturation}%)
                                brightness(${brightness}%)
                                contrast(${contrast}%)
                                blur(${blur}px)
                                grayscale(${grayscale}%)
                                sepia(${sepia}%)
                            `
                        }}
                        onMouseDown={handleSvgMouseDown}
                        onMouseMove={handleSvgMouseMove}
                        onMouseUp={handleSvgMouseUp}
                    >
                        {paths.map((p, idx) => (
                            <path
                                key={idx}
                                d={p.d}
                                stroke={p.color}
                                strokeWidth={p.width}
                                fill="none"
                                strokeLinecap="round"
                            />
                        ))}
                        {tempPath && (
                            <path
                                d={tempPath.d}
                                stroke={tempPath.color}
                                strokeWidth={tempPath.width}
                                fill="none"
                                strokeLinecap="round"
                            />
                        )}
                    </svg>
                </div>
                <div className="dinolabsIDEVideoInputBottomBar">
                    <div className="dinolabsIDEVideoContentFlexBig">
                        <Tippy content="Rewind 15 Seconds" theme="tooltip-light">
                            <button className="dinolabsIDEVideoButtonSupplementLeading" onClick={handleRewind15}>
                                <FontAwesomeIcon icon={faBackward} />
                            </button>
                        </Tippy>
                        <Tippy content="Play Video" theme="tooltip-light">
                            <button className="dinolabsIDEVideoButton" onClick={handlePlayVideo} style={{ color: '#c0c0c0' }}>
                                <FontAwesomeIcon icon={isPlaying ? faSquare : faPlay} />
                            </button>
                        </Tippy>
                        <Tippy content="Loop Video" theme="tooltip-light">
                            <button className="dinolabsIDEVideoButton" onClick={handleToggleLoop} style={{ color: isLooping ? '#5c2be2' : '#c0c0c0' }}>
                                <FontAwesomeIcon icon={faRepeat} />
                            </button>
                        </Tippy>
                        <Tippy content="Skip 15 Seconds" theme="tooltip-light">
                            <button className="dinolabsIDEVideoButtonSupplementTrailing" onClick={handleSkip15}>
                                <FontAwesomeIcon icon={faForward} />
                            </button>
                        </Tippy>
                        {[0.5,1.0,1.5,2.0,2.5,3.0].map(rate => (
                            <Tippy key={rate} content={`${rate}x Playback`} theme="tooltip-light">
                                <button
                                    className="dinolabsIDEVideoButtonX"
                                    onClick={() => handleSetPlaybackRate(rate)}
                                    style={{ color: currentPlaybackRate === rate ? '#5c2be2' : '#c0c0c0' }}
                                >
                                    {rate}x
                                </button>
                            </Tippy>
                        ))}
                    </div>
                    <div className="dinolabsIDEVideoContentFlexSmall" style={{ justifyContent: "flex-start" }}>
                        <Tippy content="View Video Frames" theme="tooltip-light">
                            <button className="dinolabsIDEVideoButtonHelper" style={{ padding:0 }} onClick={handleViewFrames}>
                                <FontAwesomeIcon icon={faFilm} />
                            </button>
                        </Tippy>
                        <Tippy content="Clip From Video" theme="tooltip-light">
                            <button className="dinolabsIDEVideoButtonHelper" style={{ padding:0 }} onClick={handleClipFromVideo}>
                                <FontAwesomeIcon icon={faScissors} />
                            </button>
                        </Tippy>
                        <Tippy content="Stitch Clips" theme="tooltip-light">
                            <button className="dinolabsIDEVideoButtonHelper" style={{ padding:0 }} onClick={handleStitchClips}>
                                <FontAwesomeIcon icon={faTape} />
                            </button>
                        </Tippy>
                        <Tippy content="Insert Clip Into Video" theme="tooltip-light">
                            <button className="dinolabsIDEVideoButtonHelper" style={{ padding:0 }} onClick={handleInsertClip}>
                                <FontAwesomeIcon icon={faSquarePlus} />
                            </button>
                        </Tippy>
                        <Tippy content="Remove Clip From Video" theme="tooltip-light">
                            <button className="dinolabsIDEVideoButtonHelper" style={{ padding:0 }} onClick={handleRemoveClip}>
                                <FontAwesomeIcon icon={faSquareMinus} />
                            </button>
                        </Tippy>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DinoLabsIDEVideoEditor;
