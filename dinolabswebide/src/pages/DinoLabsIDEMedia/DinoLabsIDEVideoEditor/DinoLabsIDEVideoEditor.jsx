import React, { useState, useEffect, useRef } from 'react';
import "../../../styles/mainStyles/DinoLabsIDEMedia.css";
import "../../../styles/helperStyles/Slider.css";
import "../../../styles/helperStyles/Checkbox.css";
import DinoLabsIDEColorPicker from '../../DinoLabsIDEColorPicker.jsx';
import { showDialog } from "../../DinoLabsIDEAlert.jsx";
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
    faPlus, faRepeat, faRotateLeft, faRotateRight, faRulerCombined, faSave, faScissors, faSquare, faSquareCaretLeft,
    faSquareMinus,
    faSquarePlus,
    faSwatchbook, faTabletScreenButton, faTape, faUpDown
} from '@fortawesome/free-solid-svg-icons';
import DinoLabsIDEVideoEditorToolbar from './DinoLabsIDEVideoEditorToolbar';

function formatFileSize(bytes) {
    if (bytes == null) return "N/A";
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return (
        (h > 0 ? String(h).padStart(2, '0') + ':' : '') +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0')
    );
}

function DinoLabsIDEVideoEditor({ fileHandle }) {
    function fitToContainer(frameBarOpen, realW = nativeWidth, realH = nativeHeight) {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.clientWidth;
        let containerHeight = containerRef.current.clientHeight;
        if (frameBarOpen) {
            containerHeight *= 0.85;
        }
        const maxPossibleWidth = containerWidth * 0.7;
        const maxPossibleHeight = containerHeight * 0.7;
        let initWidth = realW;
        let initHeight = realH;
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
    }

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
    const initialMousePosRef = useRef(null);
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
    const [frames, setFrames] = useState([]);
    const [isExtractingFrames, setIsExtractingFrames] = useState(false);
    const [clipStartTime, setClipStartTime] = useState(null);
    const [clipEndTime, setClipEndTime] = useState(null);
    const [originalFileSize, setOriginalFileSize] = useState(null);
    const [originalDuration, setOriginalDuration] = useState(null);
    const [framesPanelMode, setFramesPanelMode] = useState('none');
    const showFrameBar = framesPanelMode !== 'none';
    const framesContainerRef = useRef(null);
    const [clipOverlayLeft, setClipOverlayLeft] = useState(0);
    const [clipOverlayRight, setClipOverlayRight] = useState(0);
    const [isDraggingLeftHandle, setIsDraggingLeftHandle] = useState(false);
    const [isDraggingRightHandle, setIsDraggingRightHandle] = useState(false);
    const [draggedFrameIndex, setDraggedFrameIndex] = useState(null);
    const [dropTargetIndex, setDropTargetIndex] = useState(null);
    const [isRebuildingVideoFromFrames, setIsRebuildingVideoFromFrames] = useState(false);
    const [frameInterval, setFrameInterval] = useState(1);
    const [isClippingVideo, setIsClippingVideo] = useState(false);
    const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  
    useEffect(() => {
        let objectUrl;
        const loadMedia = async () => {
            try {
                const file = typeof fileHandle.getFile === 'function'
                    ? await fileHandle.getFile()
                    : fileHandle;
                objectUrl = URL.createObjectURL(file);
                setUrl(objectUrl);
                setOriginalFileSize(file.size);
                const extension = file.name.split('.').pop().toLowerCase();
                if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(extension)) {
                    setMediaType('video');
                    const tempVideo = document.createElement('video');
                    tempVideo.onloadedmetadata = () => {
                        setNativeWidth(tempVideo.videoWidth);
                        setNativeHeight(tempVideo.videoHeight);
                        fitToContainer(false, tempVideo.videoWidth, tempVideo.videoHeight);
                        setOriginalDuration(tempVideo.duration);
                    };
                    tempVideo.src = objectUrl;
                }
            } catch (error) {
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
  
    useEffect(() => {
        if (showFrameBar) {
            if (videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
            }
            fitToContainer(true);
        } else {
            fitToContainer(false);
        }
    }, [showFrameBar]);
  
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
        setIsCropping(false);
        setCropRect({ x: 0, y: 0, width: 100, height: 100 });
        setCropRotation(0);
        setCircleCrop(false);
        setIsCropDisabled(false);
        fitToContainer(showFrameBar, nativeWidth, nativeHeight);
    };
  
    const downloadVideo = async () => {
        const fileName = fileHandle?.name || 'download';
        const originalExtension = fileName.split('.').pop().toLowerCase();
        let baseName = fileName.replace(/\.[^/.]+$/, "");
        const alertResult = await showDialog({
            title: 'Select Video Type and Scale',
            message: 'Select the video type and scale.',
            inputs: [
                {
                    name: 'fileType',
                    type: 'select',
                    label: 'Video Type',
                    defaultValue: ['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(originalExtension) ? originalExtension : 'mp4',
                    options: [
                        { label: '.mp4', value: 'mp4' },
                        { label: '.mkv', value: 'mkv' },
                        { label: '.avi', value: 'avi' },
                        { label: '.mov', value: 'mov' },
                        { label: '.webm', value: 'webm' }
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
        if (!alertResult) return;
        setIsDownloadingVideo(true);
        const fileType = alertResult.fileType;
        let scaleFactor = 1;
        if (alertResult.scale === '2x') scaleFactor = 2;
        if (alertResult.scale === '3x') scaleFactor = 3;
        const tempVideo = document.createElement('video');
        tempVideo.src = url;
        tempVideo.crossOrigin = 'anonymous';
        tempVideo.style.position = 'fixed';
        tempVideo.style.left = '-9999px';
        tempVideo.style.top = '-9999px';
        tempVideo.muted = true;
        document.body.appendChild(tempVideo);
        await new Promise((res) => {
            tempVideo.onloadeddata = () => res();
        });
        tempVideo.currentTime = 0;
        await new Promise((res) => {
            tempVideo.onseeked = () => res();
        });
        const audioStream = tempVideo.captureStream();
        const audioTracks = audioStream.getAudioTracks();
        const fps = 30;
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = videoWidth * scaleFactor;
        offscreenCanvas.height = videoHeight * scaleFactor;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        let filterString = `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)`;
        if (spread) {
            filterString += ` drop-shadow(0 0 ${spread}px rgba(0,0,0,0.5))`;
        }
        offscreenCtx.filter = filterString;
        offscreenCtx.globalAlpha = opacity / 100;
        offscreenCtx.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2);
        offscreenCtx.rotate(rotation * Math.PI / 180);
        offscreenCtx.scale(flipX * scaleFactor, flipY * scaleFactor);
        const roundedRect = new Path2D();
        if (circleCrop) {
            const radius = Math.min(videoWidth, videoHeight) / 2;
            roundedRect.arc(0, 0, radius, 0, 2 * Math.PI);
        } else if (syncCorners) {
            let radius = borderRadius;
            radius = Math.min(radius, videoWidth/2, videoHeight/2);
            roundedRect.moveTo(-videoWidth / 2 + radius, -videoHeight / 2);
            roundedRect.lineTo(videoWidth / 2 - radius, -videoHeight / 2);
            roundedRect.quadraticCurveTo(videoWidth / 2, -videoHeight / 2, videoWidth / 2, -videoHeight / 2 + radius);
            roundedRect.lineTo(videoWidth / 2, videoHeight / 2 - radius);
            roundedRect.quadraticCurveTo(videoWidth / 2, videoHeight / 2, videoWidth / 2 - radius, videoHeight / 2);
            roundedRect.lineTo(-videoWidth / 2 + radius, videoHeight / 2);
            roundedRect.quadraticCurveTo(-videoWidth / 2, videoHeight / 2, -videoWidth / 2, videoHeight / 2 - radius);
            roundedRect.lineTo(-videoWidth / 2, -videoHeight / 2 + radius);
            roundedRect.quadraticCurveTo(-videoWidth / 2, -videoHeight / 2, -videoWidth / 2 + radius, -videoHeight / 2);
        } else {
            const tl = Math.min(borderTopLeftRadius, videoWidth/2, videoHeight/2);
            const tr = Math.min(borderTopRightRadius, videoWidth/2, videoHeight/2);
            const br = Math.min(borderBottomRightRadius, videoWidth/2, videoHeight/2);
            const bl = Math.min(borderBottomLeftRadius, videoWidth/2, videoHeight/2);
            roundedRect.moveTo(-videoWidth / 2 + tl, -videoHeight / 2);
            roundedRect.lineTo(videoWidth / 2 - tr, -videoHeight / 2);
            roundedRect.quadraticCurveTo(videoWidth / 2, -videoHeight / 2, videoWidth / 2, -videoHeight / 2 + tr);
            roundedRect.lineTo(videoWidth / 2, videoHeight / 2 - br);
            roundedRect.quadraticCurveTo(videoWidth / 2, videoHeight / 2, videoWidth / 2 - br, videoHeight / 2);
            roundedRect.lineTo(-videoWidth / 2 + bl, videoHeight / 2);
            roundedRect.quadraticCurveTo(-videoWidth / 2, videoHeight / 2, -videoWidth / 2, videoHeight / 2 - bl);
            roundedRect.lineTo(-videoWidth / 2, -videoHeight / 2 + tl);
            roundedRect.quadraticCurveTo(-videoWidth / 2, -videoHeight / 2, -videoWidth / 2 + tl, -videoHeight / 2);
        }
        offscreenCtx.clip(roundedRect);
        const recordedStream = offscreenCanvas.captureStream(fps);
        const combinedStream = new MediaStream();
        recordedStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
        audioTracks.forEach(track => combinedStream.addTrack(track));
        const mediaRecorder = new MediaRecorder(combinedStream, {
            mimeType: 'video/webm;codecs=vp9'
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
        tempVideo.play();
        let lastDrawTime = 0;
        const frameInterval = 1000 / fps;
        function drawFrame(timestamp) {
            if (!lastDrawTime) {
                lastDrawTime = timestamp;
            }
            const elapsed = timestamp - lastDrawTime;
            if (elapsed >= frameInterval) {
                offscreenCtx.save();
                offscreenCtx.clearRect(-videoWidth / 2, -videoHeight / 2, videoWidth, videoHeight);
                offscreenCtx.drawImage(tempVideo, -videoWidth / 2, -videoHeight / 2, videoWidth, videoHeight);
                offscreenCtx.restore();
                offscreenCtx.save();
                offscreenCtx.translate(-videoWidth / 2, -videoHeight / 2);
                paths.forEach(p => {
                    offscreenCtx.strokeStyle = p.color;
                    offscreenCtx.lineWidth = p.width;
                    offscreenCtx.lineCap = "round";
                    try {
                        const path2d = new Path2D(p.d);
                        offscreenCtx.stroke(path2d);
                    } catch {}
                });
                if (tempPath) {
                    offscreenCtx.strokeStyle = tempPath.color;
                    offscreenCtx.lineWidth = tempPath.width;
                    offscreenCtx.lineCap = "round";
                    try {
                        const tmp = new Path2D(tempPath.d);
                        offscreenCtx.stroke(tmp);
                    } catch {}
                }
                offscreenCtx.restore();
                lastDrawTime = timestamp;
            }
            if (tempVideo.currentTime < tempVideo.duration - 0.1) {
                requestAnimationFrame(drawFrame);
            } else {
                mediaRecorder.stop();
            }
        }
        requestAnimationFrame(drawFrame);
        await donePromise;
        const finalBlob = new Blob(chunks, { type: 'video/webm' });
        document.body.removeChild(tempVideo);
        const downloadUrl = URL.createObjectURL(finalBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = baseName + '.' + fileType;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsDownloadingVideo(false);
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
        initialMousePosRef.current = { x: e.clientX, y: e.clientY };
        lastResizePosRef.current = { x: e.clientX, y: e.clientY };
        initialSizeRef.current = { width: videoWidth, height: videoHeight };
        initialPosRef.current = { x: panX, y: panY };
        if (maintainAspectRatio) {
            aspectRatioRef.current = videoWidth / videoHeight;
        }
    };
  
    const handleGlobalMouseMove = (e) => {
        if (!resizingRef.current) return;
        const rad = rotation * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const totalDx = e.clientX - initialMousePosRef.current.x;
        const totalDy = e.clientY - initialMousePosRef.current.y;
        const localTotalDx = cos * totalDx + sin * totalDy;
        const localTotalDy = -sin * totalDx + cos * totalDy;
  
        let newWidth, newHeight;
  
        if (maintainAspectRatio) {
            let handleUnit = { x: 0, y: 0 };
            if (resizingCorner === 'bottom-right') {
                handleUnit = { x: 1 / Math.sqrt(2), y: 1 / Math.sqrt(2) };
            } else if (resizingCorner === 'bottom-left') {
                handleUnit = { x: -1 / Math.sqrt(2), y: 1 / Math.sqrt(2) };
            } else if (resizingCorner === 'top-right') {
                handleUnit = { x: 1 / Math.sqrt(2), y: -1 / Math.sqrt(2) };
            } else if (resizingCorner === 'top-left') {
                handleUnit = { x: -1 / Math.sqrt(2), y: -1 / Math.sqrt(2) };
            }
            const effectiveDelta = localTotalDx * handleUnit.x + localTotalDy * handleUnit.y;
            const initialHalfWidth = initialSizeRef.current.width / 2;
            const scale = (initialHalfWidth + effectiveDelta) / initialHalfWidth;
            newWidth = initialSizeRef.current.width * scale;
            newHeight = initialSizeRef.current.height * scale;
        } else {
            let horizontalDelta = 0;
            let verticalDelta = 0;
            if (resizingCorner === 'bottom-right') {
                horizontalDelta = localTotalDx;
                verticalDelta = localTotalDy;
            } else if (resizingCorner === 'bottom-left') {
                horizontalDelta = -localTotalDx;
                verticalDelta = localTotalDy;
            } else if (resizingCorner === 'top-right') {
                horizontalDelta = localTotalDx;
                verticalDelta = -localTotalDy;
            } else if (resizingCorner === 'top-left') {
                horizontalDelta = -localTotalDx;
                verticalDelta = -localTotalDy;
            }
            newWidth = initialSizeRef.current.width + 2 * horizontalDelta;
            newHeight = initialSizeRef.current.height + 2 * verticalDelta;
        }
        newWidth = Math.max(newWidth, 50);
        newHeight = Math.max(newHeight, 50);
        setVideoWidth(newWidth);
        setVideoHeight(newHeight);
        setPanX(initialPosRef.current.x);
        setPanY(initialPosRef.current.y);
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
        if (circleCrop) {
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
        } else {
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
  
    async function performCanvasVideoCrop() {
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
        await new Promise((res) => {
            tempVideo.onseeked = () => res();
        });
        offscreenCtx.save();
        offscreenCtx.drawImage(tempVideo, 0, 0, nativeWidth, nativeHeight);
        offscreenCtx.restore();
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
        let minX, minY, realCropW, realCropH;
        const rad = cropRotation * Math.PI / 180;
        const cx = cropRect.x + cropRect.width / 2;
        const cy = cropRect.y + cropRect.height / 2;
        const corners = [
            { x: cropRect.x, y: cropRect.y },
            { x: cropRect.x + cropRect.width, y: cropRect.y },
            { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height },
            { x: cropRect.x, y: cropRect.y + cropRect.height }
        ];
        const rotatedCorners = cropRotation % 360 !== 0
            ? corners.map(pt => {
                const dx = pt.x - cx;
                const dy = pt.y - cy;
                return {
                    x: (cx + (dx * Math.cos(rad) - dy * Math.sin(rad))) * (nativeWidth / videoWidth),
                    y: (cy + (dx * Math.sin(rad) + dy * Math.cos(rad))) * (nativeHeight / videoHeight)
                };
            })
            : corners.map(pt => ({
                x: pt.x * (nativeWidth / videoWidth),
                y: pt.y * (nativeHeight / videoHeight)
            }));
        const xs = rotatedCorners.map(pt => pt.x);
        const ys = rotatedCorners.map(pt => pt.y);
        minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        realCropW = maxX - minX;
        realCropH = maxY - minY;
        finalCanvas.width = realCropW;
        finalCanvas.height = realCropH;
        const fcCtx = finalCanvas.getContext('2d');
        const finalCanvasStream = finalCanvas.captureStream(fps);
        const finalMediaRecorder = new MediaRecorder(finalCanvasStream, {
            mimeType: 'video/webm; codecs=vp9'
        });
        const finalChunks = [];
        finalMediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                finalChunks.push(e.data);
            }
        };
        let resolveFinalDone;
        const finalDonePromise = new Promise((r) => (resolveFinalDone = r));
        finalMediaRecorder.onstop = () => resolveFinalDone();
        finalMediaRecorder.start();
        let lastDrawTime = 0;
        const frameInterval = 1000 / fps;
        const drawFrame = async (timestamp) => {
            if (!lastDrawTime) lastDrawTime = timestamp;
            const elapsed = timestamp - lastDrawTime;
            if (elapsed >= frameInterval) {
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
                if (circleCrop && cropRotation % 360 === 0) {
                    const rx = realCropW / 2;
                    const ry = realCropH / 2;
                    fcCtx.ellipse(realCropW / 2, realCropH / 2, rx, ry, 0, 0, 2 * Math.PI);
                } else if (circleCrop) {
                    const centerX = realCropW / 2;
                    const centerY = realCropH / 2;
                    const rx = realCropW / 2;
                    const ry = realCropH / 2;
                    fcCtx.ellipse(centerX, centerY, rx, ry, 0, 0, 2 * Math.PI);
                } else {
                    fcCtx.moveTo(rotatedCorners[0].x - minX, rotatedCorners[0].y - minY);
                    fcCtx.lineTo(rotatedCorners[1].x - minX, rotatedCorners[1].y - minY);
                    fcCtx.lineTo(rotatedCorners[2].x - minX, rotatedCorners[2].y - minY);
                    fcCtx.lineTo(rotatedCorners[3].x - minX, rotatedCorners[3].y - minY);
                    fcCtx.closePath();
                }
                fcCtx.clip();
                fcCtx.drawImage(intermediateCanvas, -minX, -minY);
                fcCtx.restore();
                lastDrawTime = timestamp;
            }
            if (tempVideo.currentTime < tempVideo.duration - 0.1) {
                requestAnimationFrame(drawFrame);
            } else {
                finalMediaRecorder.stop();
                mediaRecorder.stop();
            }
        };
        drawFrame();
        await finalDonePromise;
        await donePromise;
        const finalBlob = new Blob(finalChunks, { type: 'video/webm' });
        const newUrl = URL.createObjectURL(finalBlob);
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
    }
  
    const finalizeCrop = async () => {
        if (mediaType !== 'video') {
            return;
        }
        setCropHistory(prev => [
            ...prev,
            { url, panX, panY, videoWidth, videoHeight, nativeWidth, nativeHeight }
        ]);
        await performCanvasVideoCrop();
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
  
    async function extractFramesFromVideo(videoElem, existingFrames = []) {
        const framesArray = [];
        if (!videoElem.duration) return framesArray;
        const oldPausedState = videoElem.paused;
        const oldTime = videoElem.currentTime;
        videoElem.pause();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let framesCount = existingFrames.length;
        if (framesCount === 0) {
            const totalFrames = Math.floor(videoElem.duration / frameInterval);
            framesCount = totalFrames + 1;
        }
        for (let i = 0; i < framesCount; i++) {
            const captureTime = i * frameInterval;
            if (captureTime > videoElem.duration) break;
            videoElem.currentTime = captureTime;
            await new Promise((resolve) => {
                const onSeeked = () => {
                    videoElem.removeEventListener("seeked", onSeeked);
                    resolve();
                };
                videoElem.addEventListener("seeked", onSeeked);
            });
            canvas.width = videoWidth;
            canvas.height = videoHeight;
            ctx.save();
            ctx.filter = `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)${spread ? ` drop-shadow(0 0 ${spread}px rgba(0,0,0,0.5))` : ''}`;
            ctx.globalAlpha = opacity / 100;
            if (syncCorners) {
                const r = borderRadius;
                ctx.beginPath();
                ctx.moveTo(r, 0);
                ctx.lineTo(canvas.width - r, 0);
                ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
                ctx.lineTo(canvas.width, canvas.height - r);
                ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
                ctx.lineTo(r, canvas.height);
                ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
                ctx.lineTo(0, r);
                ctx.quadraticCurveTo(0, 0, r, 0);
                ctx.closePath();
                ctx.clip();
            } else {
                const tl = borderTopLeftRadius;
                const tr = borderTopRightRadius;
                const br = borderBottomRightRadius;
                const bl = borderBottomLeftRadius;
                ctx.beginPath();
                ctx.moveTo(tl, 0);
                ctx.lineTo(canvas.width - tr, 0);
                ctx.quadraticCurveTo(canvas.width, 0, canvas.width, tr);
                ctx.lineTo(canvas.width, canvas.height - br);
                ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - br, canvas.height);
                ctx.lineTo(bl, canvas.height);
                ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - bl);
                ctx.lineTo(0, tl);
                ctx.quadraticCurveTo(0, 0, tl, 0);
                ctx.closePath();
                ctx.clip();
            }
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.scale(flipX, flipY);
            ctx.drawImage(videoElem, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
            ctx.restore();
            ctx.save();
            ctx.filter = "none";
            ctx.globalAlpha = 1;
            const scaleX = canvas.width / nativeWidth;
            const scaleY = canvas.height / nativeHeight;
            ctx.scale(scaleX, scaleY);
            for (let p of paths) {
                const path2d = new Path2D(p.d);
                ctx.lineWidth = p.width;
                ctx.strokeStyle = p.color;
                ctx.lineCap = "round";
                ctx.stroke(path2d);
            }
            if (tempPath) {
                const path2d = new Path2D(tempPath.d);
                ctx.lineWidth = tempPath.width;
                ctx.strokeStyle = tempPath.color;
                ctx.lineCap = "round";
                ctx.stroke(path2d);
            }
            ctx.restore();
            const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
            framesArray.push({ time: captureTime, dataUrl });
        }
        videoElem.currentTime = oldTime;
        if (!oldPausedState) {
            videoElem.play();
        }
        return framesArray;
    }
  
    useEffect(() => {
        if (framesPanelMode !== 'none' && videoRef.current && !isProcessingCrop && !isCropping) {
            (async () => {
                setIsExtractingFrames(true);
                const extracted = await extractFramesFromVideo(videoRef.current, []);
                setFrames(extracted);
                setIsExtractingFrames(false);
            })();
        }
    }, [framesPanelMode, url, isProcessingCrop, isCropping, frameInterval]);
  
    const handleViewFrames = async () => {
        if (!videoRef.current) return;
        setFramesPanelMode(prev => (prev === 'view' ? 'none' : 'view'));
    };
  
    const handleClipFromVideo = () => {
        setClipStartTime(null);
        setClipEndTime(null);
        setFramesPanelMode(prev => (prev === 'clip' ? 'none' : 'clip'));
    };
  
    const handleRearrangeFrames = () => {
        setFramesPanelMode(prev => (prev === 'rearrange' ? 'none' : 'rearrange'));
    };
  
    const handleDragStartFrame = (e, index) => {
        setDraggedFrameIndex(index);
        setDropTargetIndex(null);
    };
  
    const handleDragOverFrame = (e, index) => {
        e.preventDefault();
        setDropTargetIndex(index);
        if (framesContainerRef.current) {
            const rect = framesContainerRef.current.getBoundingClientRect();
            const threshold = 50;
            if (e.clientX < rect.left + threshold) {
                framesContainerRef.current.scrollLeft -= 10;
            } else if (e.clientX > rect.right - threshold) {
                framesContainerRef.current.scrollLeft += 10;
            }
        }
    };
  
    const handleDropFrame = (e, index) => {
        e.preventDefault();
        setFrames(prevFrames => {
            const newFrames = [...prevFrames];
            const [movedFrame] = newFrames.splice(draggedFrameIndex, 1);
            newFrames.splice(index, 0, movedFrame);
            return newFrames.map((frame, i) => ({
                ...frame,
                time: i
            }));
        });
        setDraggedFrameIndex(null);
        setDropTargetIndex(null);
    };
  
    const handleSaveRearrange = async () => {
        try {
            if (frames.length === 0) {
                return;
            }
            setIsRebuildingVideoFromFrames(true);
            const fps = 25;
            const captureDurationPerFrame = 1.0;
            const canvas = document.createElement("canvas");
            canvas.width = videoWidth;
            canvas.height = videoHeight;
            const ctx = canvas.getContext("2d");
            const stream = canvas.captureStream(fps);
            const recorder = new MediaRecorder(stream, {
                mimeType: "video/webm;codecs=vp8",
                videoBitsPerSecond: 2500000
            });
            const chunks = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };
            recorder.onstop = async () => {
                const newBlob = new Blob(chunks, { type: 'video/webm' });
                const newUrl = URL.createObjectURL(newBlob);
                setUrl(newUrl);
                if (videoRef.current) {
                    videoRef.current.src = newUrl;
                    videoRef.current.load();
                    videoRef.current.currentTime = 0;
                    videoRef.current.loop = true;
                    videoRef.current.play();
                    setIsPlaying(true);
                    setIsLooping(true);
                }
                setIsRebuildingVideoFromFrames(false);
                setFramesPanelMode('none');
                setActionMode('Idle');
            };
            recorder.start();
            for (let i = 0; i < frames.length; i++) {
                await new Promise(resolve => {
                    const img = new Image();
                    img.onload = () => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        setTimeout(resolve, captureDurationPerFrame * 1000);
                    };
                    img.src = frames[i].dataUrl;
                });
            }
            recorder.stop();
        } catch (err) {
            setIsRebuildingVideoFromFrames(false);
        }
    };
  
    async function clipVideo(start, end) {
        const videoElem = document.createElement("video");
        videoElem.src = url;
        await new Promise(r => {
            videoElem.onloadedmetadata = r;
        });
        videoElem.currentTime = start;
        await new Promise(r => {
            const onSeeked = () => {
                videoElem.removeEventListener("seeked", onSeeked);
                r();
            };
            videoElem.addEventListener("seeked", onSeeked);
        });
        videoElem.muted = true;
        videoElem.playbackRate = 1;
        const stream = videoElem.captureStream();
        const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8',
            videoBitsPerSecond: 2500000
        });
        const chunks = [];
        return new Promise((resolve) => {
            recorder.ondataavailable = e => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };
            recorder.onstop = async () => {
                const newBlob = new Blob(chunks, { type: 'video/webm' });
                const newUrl = URL.createObjectURL(newBlob);
                resolve(newUrl);
            };
            recorder.start();
            videoElem.play();
            const checkTime = () => {
                if (videoElem.currentTime >= end) {
                    setTimeout(() => {
                        recorder.stop();
                        videoElem.pause();
                    }, 50);
                    return;
                }
                requestAnimationFrame(checkTime);
            };
            requestAnimationFrame(checkTime);
        });
    }
  
    const handleSaveClip = async () => {
        if (clipStartTime !== null && clipEndTime !== null && clipEndTime > clipStartTime) {
            setIsClippingVideo(true);
            const newUrl = await clipVideo(clipStartTime, clipEndTime);
            setIsClippingVideo(false);
            setUrl(newUrl);
            if (videoRef.current) {
                videoRef.current.src = newUrl;
                videoRef.current.load();
                videoRef.current.currentTime = 0;
                videoRef.current.loop = true;
                videoRef.current.play();
                setIsPlaying(true);
                setIsLooping(true);
            }
            setClipStartTime(null);
            setClipEndTime(null);
            setFramesPanelMode('none');
            setActionMode('Idle');
        }
    };
  
    useEffect(() => {
        if (framesContainerRef.current && frames.length > 0 && framesPanelMode === 'clip') {
            const containerRect = framesContainerRef.current.getBoundingClientRect();
            const framesEls = framesContainerRef.current.querySelectorAll('.dinolabsIDEVideoInputBottomBarFrameSupplementImageWrapper');
            let includedTimes = [];
            framesEls.forEach((frameEl, idx) => {
                const frameRect = frameEl.getBoundingClientRect();
                const localLeft = (frameRect.left - containerRect.left) + framesContainerRef.current.scrollLeft;
                const localRight = localLeft + frameRect.width;
                if (localRight >= clipOverlayLeft && localLeft <= clipOverlayRight) {
                    includedTimes.push(frames[idx].time);
                }
            });
            if (includedTimes.length > 0) {
                const minT = Math.min(...includedTimes);
                const maxT = Math.max(...includedTimes);
                setClipStartTime(minT);
                setClipEndTime(maxT);
            } else {
                setClipStartTime(null);
                setClipEndTime(null);
            }
        }
    }, [clipOverlayLeft, clipOverlayRight, frames, framesPanelMode]);
  
    useEffect(() => {
        if (framesPanelMode === 'clip' && framesContainerRef.current) {
            setTimeout(() => {
                setClipOverlayLeft(0);
                setClipOverlayRight(framesContainerRef.current.scrollWidth);
            }, 0);
        }
    }, [framesPanelMode, frames]);
  
    useEffect(() => {
        function onMouseMove(e) {
            if (!framesContainerRef.current) return;
            const rect = framesContainerRef.current.getBoundingClientRect();
            let x = (e.clientX - rect.left) + framesContainerRef.current.scrollLeft;
            const maxWidth = framesContainerRef.current.scrollWidth;
            const threshold = 50;
            if (e.clientX < rect.left + threshold) {
                framesContainerRef.current.scrollLeft -= 10;
            } else if (e.clientX > rect.right - threshold) {
                framesContainerRef.current.scrollLeft += 10;
            }
            x = Math.max(0, Math.min(x, maxWidth));
            if (isDraggingLeftHandle) {
                setClipOverlayLeft(Math.min(x, clipOverlayRight));
            }
            if (isDraggingRightHandle) {
                setClipOverlayRight(Math.max(x, clipOverlayLeft));
            }
        }
        function onMouseUp() {
            setIsDraggingLeftHandle(false);
            setIsDraggingRightHandle(false);
        }
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [isDraggingLeftHandle, isDraggingRightHandle, clipOverlayLeft, clipOverlayRight]);
  
    const handleMouseDownLeft = (e) => {
        e.preventDefault();
        setIsDraggingLeftHandle(true);
    };
  
    const handleMouseDownRight = (e) => {
        e.preventDefault();
        setIsDraggingRightHandle(true);
    };
  
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
        <div className="dinolabsIDEMediaWrapper">
            {(isProcessingCrop || isExtractingFrames || isRebuildingVideoFromFrames || isClippingVideo || isDownloadingVideo) && (
                <div className="dinolabsIDEMediaContentCropIndicator">
                    <div className="loading-circle" />
                </div>
            )}
            <DinoLabsIDEVideoEditorToolbar
                showFrameBar={showFrameBar}
                resetVideo={resetVideo}
                downloadVideo={downloadVideo}
                panX={panX}
                panY={panY}
                setPanX={setPanX}
                setPanY={setPanY}
                maintainAspectRatio={maintainAspectRatio}
                setMaintainAspectRatio={setMaintainAspectRatio}
                videoWidth={videoWidth}
                videoHeight={videoHeight}
                setVideoWidth={setVideoWidth}
                setVideoHeight={setVideoHeight}
                restoreAspectRatioWidth={restoreAspectRatioWidth}
                restoreAspectRatioHeight={restoreAspectRatioHeight}
                actionMode={actionMode}
                setActionMode={setActionMode}
                isCropDisabled={isCropDisabled}
                isCropping={isCropping}
                mediaType={mediaType}
                finalizeCrop={finalizeCrop}
                setCropRect={setCropRect}
                setIsCropping={setIsCropping}
                setCircleCrop={setCircleCrop}
                circleCrop={circleCrop}
                undoCrop={undoCrop}
                undoStroke={undoStroke}
                redoStroke={redoStroke}
                drawColor={drawColor}
                setDrawColor={setDrawColor}
                isDrawColorOpen={isDrawColorOpen}
                setIsDrawColorOpen={setIsDrawColorOpen}
                drawBrushSize={drawBrushSize}
                setDrawBrushSize={setDrawBrushSize}
                highlightColor={highlightColor}
                setHighlightColor={setHighlightColor}
                isHighlightColorOpen={isHighlightColorOpen}
                setIsHighlightColorOpen={setIsHighlightColorOpen}
                highlightBrushSize={highlightBrushSize}
                setHighlightBrushSize={setHighlightBrushSize}
                setOpacity={setOpacity}
                opacity={opacity}
                setHue={setHue}
                hue={hue}
                setSaturation={setSaturation}
                saturation={saturation}
                setBrightness={setBrightness}
                brightness={brightness}
                setContrast={setContrast}
                contrast={contrast}
                setBlur={setBlur}
                blur={blur}
                setSpread={setSpread}
                spread={spread}
                setGrayscale={setGrayscale}
                grayscale={grayscale}
                setSepia={setSepia}
                sepia={sepia}
                syncCorners={syncCorners}
                setSyncCorners={setSyncCorners}
                borderRadius={borderRadius}
                setBorderRadius={setBorderRadius}
                borderTopLeftRadius={borderTopLeftRadius}
                setBorderTopLeftRadius={setBorderTopLeftRadius}
                borderTopRightRadius={borderTopRightRadius}
                setBorderTopRightRadius={setBorderTopRightRadius}
                borderBottomLeftRadius={borderBottomLeftRadius}
                setBorderBottomLeftRadius={setBorderBottomLeftRadius}
                borderBottomRightRadius={borderBottomRightRadius}
                setBorderBottomRightRadius={setBorderBottomRightRadius}
            />
  
            <div className="dinolabsIDEMediaContainerWrapper">
                <div
                    className="dinolabsIDEMediaContainer"
                    style={{ 
                        cursor: 'grab', 
                        height: showFrameBar ? "70%" : "90%",  
                        minHeight: showFrameBar ? "70%" : "90%",
                        maxHeight: showFrameBar ? "70%" : "90%",
                    }}
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
                            transform: `
                            translate(-50%, -50%) 
                            scale(${zoom}, ${zoom}) 
                            rotate(${rotation}deg)
                            `,
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
                                    ${spread ? `drop-shadow(0 0 ${spread}px rgba(0,0,0,0.5))` : ''}
                                `,
                                userSelect: 'none',
                                borderRadius: 'inherit',
                                opacity: opacity / 100,
                                transform: `scale(${flipX}, ${flipY})`
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
                                `,
                                transform: `scale(${flipX}, ${flipY})`,
                                transformBox: 'fill-box',
                                transformOrigin: 'center'
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
                </div>
                {showFrameBar && (
                    <div className="dinolabsIDEVideoInputBottomBarFrameSupplement" ref={framesContainerRef}>
                        {framesPanelMode === 'clip' && (
                            <>
                                <div
                                    className="dinolabsIDEClipSliderTrack"
                                    style={{
                                        left: `${clipOverlayLeft}px`,
                                        width: `${clipOverlayRight - clipOverlayLeft}px`,
                                    }}
                                />
                                <div
                                    className="dinolabsIDEClipSliderBar"
                                    style={{ left: `${clipOverlayLeft - 5}px` }}
                                    onMouseDown={handleMouseDownLeft}
                                />
                                <div
                                    className="dinolabsIDEClipSliderBar"
                                    style={{ left: `${clipOverlayRight - 5}px` }}
                                    onMouseDown={handleMouseDownRight}
                                />
                            </>
                        )}
                        {frames.map((frame, idx) => (
                            <div
                                key={idx}
                                className="dinolabsIDEVideoInputBottomBarFrameSupplementImageWrapper"
                                draggable={framesPanelMode === 'rearrange'}
                                onDragStart={framesPanelMode === 'rearrange' ? (e) => handleDragStartFrame(e, idx) : undefined}
                                onDragOver={framesPanelMode === 'rearrange' ? (e) => handleDragOverFrame(e, idx) : undefined}
                                onDrop={framesPanelMode === 'rearrange' ? (e) => handleDropFrame(e, idx) : undefined}
                                style={{
                                    border: framesPanelMode === 'rearrange' && dropTargetIndex === idx && draggedFrameIndex !== idx
                                        ? '0.2vh dashed rgba(31, 174, 245, 1)'
                                        : 'none', 
                                    backgroundColor: framesPanelMode === 'rearrange' && dropTargetIndex === idx && draggedFrameIndex !== idx
                                        ? 'rgba(255,255,255,0.05)'
                                        : 'rgba(255,255,255,0.0)', 
                                }}
                            >
                                <img
                                    src={frame.dataUrl}
                                    alt={`Frame ${idx}`}
                                    className="dinolabsIDEVideoInputBottomBarFrameSupplementImage"
                                    onClick={() => {
                                        if (videoRef.current) {
                                            videoRef.current.currentTime = frame.time;
                                        }
                                    }}
                                />
                                <span className="dinolabsIDEVideoInputBottomBarFrameSupplementImageText">
                                    {formatTime(frame.time)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="dinolabsIDEVideoInputBottomBar">
                    <div className="dinolabsIDEVideoContentFlexBig">
                        <Tippy content="Rewind 15 Seconds" theme="tooltip-light">
                            <button
                                className="dinolabsIDEVideoButtonSupplementLeading"
                                onClick={handleRewind15}
                                disabled={showFrameBar}
                                style={{ opacity: showFrameBar ? 0.5 : 1.0 }}
                            >
                                <FontAwesomeIcon icon={faBackward} />
                            </button>
                        </Tippy>
                        <Tippy content="Play Video" theme="tooltip-light">
                            <button
                                className="dinolabsIDEVideoButton"
                                onClick={handlePlayVideo}
                                disabled={showFrameBar}
                                style={{ color: '#c0c0c0', opacity: showFrameBar ? 0.5 : 1.0 }}
                            >
                                <FontAwesomeIcon icon={isPlaying ? faSquare : faPlay} />
                            </button>
                        </Tippy>
                        <Tippy content="Loop Video" theme="tooltip-light">
                            <button
                                className="dinolabsIDEVideoButton"
                                onClick={handleToggleLoop}
                                disabled={showFrameBar}
                                style={{ color: isLooping ? '#5c2be2' : '#c0c0c0', opacity: showFrameBar ? 0.5 : 1.0 }}
                            >
                                <FontAwesomeIcon icon={faRepeat} />
                            </button>
                        </Tippy>
                        <Tippy content="Skip 15 Seconds" theme="tooltip-light">
                            <button
                                className="dinolabsIDEVideoButtonSupplementTrailing"
                                onClick={handleSkip15}
                                disabled={showFrameBar}
                                style={{ opacity: showFrameBar ? 0.5 : 1.0 }}
                            >
                                <FontAwesomeIcon icon={faForward} />
                            </button>
                        </Tippy>
                        {[0.5,1.0,1.5,2.0,2.5,3.0].map(rate => (
                            <Tippy key={rate} content={`${rate}x Playback`} theme="tooltip-light">
                                <button
                                    className="dinolabsIDEVideoButtonX"
                                    onClick={() => handleSetPlaybackRate(rate)}
                                    disabled={showFrameBar}
                                    style={{
                                        color: currentPlaybackRate === rate ? '#5c2be2' : '#c0c0c0',
                                        opacity: showFrameBar ? 0.5 : 1.0
                                    }}
                                >
                                    {rate}x
                                </button>
                            </Tippy>
                        ))}
                    </div>
                    <div className="dinolabsIDEVideoContentFlexSmall" style={{ justifyContent: "flex-start" }}>
                        <Tippy content="View Video Frames" theme="tooltip-light">
                            <button 
                                className="dinolabsIDEVideoButtonHelper" 
                                disabled={isCropping ? true : false}
                                style={{ 
                                    color: framesPanelMode === 'view' ? '#5C2BE2' : '#c0c0c0',
                                    opacity: isCropping ? '0.6' : '1.0'
                                }}
                                onClick={handleViewFrames}
                            >
                                <FontAwesomeIcon icon={faFilm} />
                            </button>
                        </Tippy>
                        <Tippy content="Clip From Video" theme="tooltip-light">
                            <button
                                className="dinolabsIDEVideoButtonHelper"
                                disabled={isCropping ? true : false}
                                style={{
                                    color: framesPanelMode === 'clip' ? '#5C2BE2' : '#c0c0c0',
                                    opacity: isCropping ? '0.6' : '1.0'
                                }}
                                onClick={handleClipFromVideo}
                            >
                                <FontAwesomeIcon icon={faScissors} />
                            </button>
                        </Tippy>
                        {(framesPanelMode === 'clip' && clipStartTime !== null && clipEndTime !== null && clipEndTime > clipStartTime) && (
                            <Tippy content="Save Clipped Video" theme="tooltip-light">
                                <button
                                    className="dinolabsIDEVideoButtonHelper"
                                    disabled={isCropping ? true : false}
                                    style={{
                                        opacity: isCropping ? '0.6' : '1.0'
                                    }}
                                    onClick={handleSaveClip}
                                >
                                    <FontAwesomeIcon icon={faSave}/>
                                </button>
                            </Tippy>
                        )}
                        <Tippy content="Rearrange Frames" theme="tooltip-light">
                            <button 
                                className="dinolabsIDEVideoButtonHelper" 
                                disabled={isCropping ? true : false}
                                style={{
                                    opacity: isCropping ? '0.6' : '1.0'
                                }}
                                onClick={handleRearrangeFrames}
                            >
                                <FontAwesomeIcon icon={faTape} />
                            </button>
                        </Tippy>
                        {(framesPanelMode === 'rearrange') && (
                            <Tippy content="Save Reorganized Video" theme="tooltip-light">
                                <button 
                                    className="dinolabsIDEVideoButtonHelper" 
                                    disabled={isCropping ? true : false}
                                    style={{
                                        opacity: isCropping ? '0.6' : '1.0'
                                    }}
                                    onClick={handleSaveRearrange}
                                >
                                    <FontAwesomeIcon icon={faSave}/>
                                </button>
                            </Tippy>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
  
export default DinoLabsIDEVideoEditor;
