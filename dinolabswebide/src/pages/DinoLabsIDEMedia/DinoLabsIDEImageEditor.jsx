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
    faXmarkCircle,
    faBackward,
    faForward,
    faPlay,
    faPause
} from '@fortawesome/free-solid-svg-icons';

function DinoLabsIDEImageEditor({ fileHandle }) {
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
    const [imageWidth, setImageWidth] = useState(450);
    const [imageHeight, setImageHeight] = useState(450);
    const [nativeWidth, setNativeWidth] = useState(450);
    const [nativeHeight, setNativeHeight] = useState(450);
    const [resizingCorner, setResizingCorner] = useState(null);
    const resizingRef = useRef(false);
    const lastResizePosRef = useRef({ x: 0, y: 0 });
    const initialSizeRef = useRef({ width: 450, height: 450 });
    const initialPosRef = useRef({ x: 0, y: 0 });
    const [isCropping, setIsCropping] = useState(false);
    const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 100, height: 100 });
    const [cropRotation, setCropRotation] = useState(0);
    const cropResizingRef = useRef(false);
    const cropResizingCorner = useRef(null);
    const cropLastResizePosRef = useRef({ x: 0, y: 0 });
    const cropInitialRectRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const [actionMode, setActionMode] = useState('Idle');
    const [drawColor, setDrawColor] = useState('#5C2BE2');
    const [highlightColor, setHighlightColor] = useState('#00ff624d');
    const [paths, setPaths] = useState([]);
    const [undonePaths, setUndonePaths] = useState([]);
    const [tempPath, setTempPath] = useState(null);
    const isDrawingRef = useRef(false);
    const currentPathPoints = useRef([]);
    const [borderRadius, setBorderRadius] = useState(0);
    const [borderTopLeftRadius, setBorderTopLeftRadius] = useState(0);
    const [borderTopRightRadius, setBorderTopRightRadius] = useState(0);
    const [borderBottomLeftRadius, setBorderBottomLeftRadius] = useState(0);
    const [borderBottomRightRadius, setBorderBottomRightRadius] = useState(0);
    const [syncCorners, setSyncCorners] = useState(false);
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const aspectRatioRef = useRef(1);
    const [grayscale, setGrayscale] = useState(0);
    const [sepia, setSepia] = useState(0);
    const [drawBrushSize, setDrawBrushSize] = useState(4);
    const [highlightBrushSize, setHighlightBrushSize] = useState(4);
    const [cropHistory, setCropHistory] = useState([]);
    const [textOverlays, setTextOverlays] = useState([]);
    const [selectedTextId, setSelectedTextId] = useState(null);
    const [focusedTextId, setFocusedTextId] = useState(null);
    const [isDrawColorOpen, setIsDrawColorOpen] = useState(false);
    const [isHighlightColorOpen, setIsHighlightColorOpen] = useState(false);
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
            if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp'].includes(extension)) {
              setMediaType('image');
              const img = new Image();
              img.onload = () => {
                setNativeWidth(img.naturalWidth);
                setNativeHeight(img.naturalHeight);
                const scaleFactor = 450 / img.naturalHeight;
                setImageHeight(450);
                setImageWidth(img.naturalWidth * scaleFactor);
              };
              img.src = objectUrl;
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

    const resetImage = () => {
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
        setBorderRadius(0);
        setBorderTopLeftRadius(0);
        setBorderTopRightRadius(0);
        setBorderBottomLeftRadius(0);
        setBorderBottomRightRadius(0);
        setPaths([]);
        setUndonePaths([]);
        const scaleFactor = 450 / nativeHeight;
        setImageHeight(450);
        setImageWidth(nativeWidth * scaleFactor);
        setIsCropDisabled(false);
    };

    const downloadImage = async () => {
        const alertResult = await showDialog({
            title: 'Select Image Type and Scale',
            message: 'Select the image type and scale.',
            inputs: [
                {
                    name: 'fileType',
                    type: 'select',
                    label: 'Image Type',
                    defaultValue: 'png',  
                    options: [
                        { label: '.png', value: 'png' },
                        { label: '.jpg', value: 'jpg' },
                        { label: '.jpeg', value: 'jpeg' },
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
    
        const fileType = alertResult?.fileType || 'png'; 
        const scale = alertResult?.scale || '1x';         
    
        const scaleFactor = scale === '2x' ? 2 : scale === '3x' ? 3 : 1;
        const mimeType = (fileType === 'jpg' || fileType === 'jpeg') ? 'image/jpeg' : 'image/png';
        
        const canvas = document.createElement('canvas');
        canvas.width = imageWidth * scaleFactor;
        canvas.height = imageHeight * scaleFactor;
        const ctx = canvas.getContext('2d');
        
        let filterString = `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)`;
        if (spread) {
            filterString += ` drop-shadow(0 0 ${spread}px rgba(0,0,0,0.5))`;
        }
        ctx.filter = filterString;
        ctx.globalAlpha = opacity / 100;
    
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.scale(flipX * zoom * scaleFactor, flipY * zoom * scaleFactor);
    
        const roundedRect = new Path2D();
        if (circleCrop) {
            const radius = Math.min(imageWidth, imageHeight) / 2;
            roundedRect.arc(0, 0, radius, 0, 2 * Math.PI);
        } else if (syncCorners) {
            let radius = borderRadius;
            radius = Math.min(radius, imageWidth/2, imageHeight/2);
            roundedRect.moveTo(-imageWidth / 2 + radius, -imageHeight / 2);
            roundedRect.lineTo(imageWidth / 2 - radius, -imageHeight / 2);
            roundedRect.quadraticCurveTo(imageWidth / 2, -imageHeight / 2, imageWidth / 2, -imageHeight / 2 + radius);
            roundedRect.lineTo(imageWidth / 2, imageHeight / 2 - radius);
            roundedRect.quadraticCurveTo(imageWidth / 2, imageHeight / 2, imageWidth / 2 - radius, imageHeight / 2);
            roundedRect.lineTo(-imageWidth / 2 + radius, imageHeight / 2);
            roundedRect.quadraticCurveTo(-imageWidth / 2, imageHeight / 2, -imageWidth / 2, imageHeight / 2 - radius);
            roundedRect.lineTo(-imageWidth / 2, -imageHeight / 2 + radius);
            roundedRect.quadraticCurveTo(-imageWidth / 2, -imageHeight / 2, -imageWidth / 2 + radius, -imageHeight / 2);
        } else {
            const tl = Math.min(borderTopLeftRadius, imageWidth/2, imageHeight/2);
            const tr = Math.min(borderTopRightRadius, imageWidth/2, imageHeight/2);
            const br = Math.min(borderBottomRightRadius, imageWidth/2, imageHeight/2);
            const bl = Math.min(borderBottomLeftRadius, imageWidth/2, imageHeight/2);
            roundedRect.moveTo(-imageWidth / 2 + tl, -imageHeight / 2);
            roundedRect.lineTo(imageWidth / 2 - tr, -imageHeight / 2);
            roundedRect.quadraticCurveTo(imageWidth / 2, -imageHeight / 2, imageWidth / 2, -imageHeight / 2 + tr);
            roundedRect.lineTo(imageWidth / 2, imageHeight / 2 - br);
            roundedRect.quadraticCurveTo(imageWidth / 2, imageHeight / 2, imageWidth / 2 - br, imageHeight / 2);
            roundedRect.lineTo(-imageWidth / 2 + bl, imageHeight / 2);
            roundedRect.quadraticCurveTo(-imageWidth / 2, imageHeight / 2, -imageWidth / 2, imageHeight / 2 - bl);
            roundedRect.lineTo(-imageWidth / 2, -imageHeight / 2 + tl);
            roundedRect.quadraticCurveTo(-imageWidth / 2, -imageHeight / 2, -imageWidth / 2 + tl, -imageHeight / 2);
        }
        ctx.clip(roundedRect);
    
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            ctx.drawImage(img, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
    
            ctx.save();
            ctx.translate(-imageWidth / 2, -imageHeight / 2);
            paths.forEach(pathData => {
                ctx.strokeStyle = pathData.color;
                ctx.lineWidth = pathData.width;
                ctx.lineCap = "round";
                try {
                    const p = new Path2D(pathData.d);
                    ctx.stroke(p);
                } catch (err) {
                    return; 
                }
            });
            if(tempPath) {
                ctx.strokeStyle = tempPath.color;
                ctx.lineWidth = tempPath.width;
                ctx.lineCap = "round";
                try {
                    const p = new Path2D(tempPath.d);
                    ctx.stroke(p);
                } catch (err) {
                    return;
                }
            }
            ctx.restore();
    
            const dataUrl = canvas.toDataURL(mimeType);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = fileHandle.name ? fileHandle.name.replace(/\.\w+$/, '.' + fileType) : 'edited_image.' + fileType;
            link.click();
        };
        img.src = url;
    };

    const handleDragStart = (e) => {
        if (actionMode !== 'Idle' || selectedTextId) return;
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
        if (actionMode !== 'Idle') return;
        if (isCropping) return;
        e.stopPropagation();
        e.preventDefault();
        setResizingCorner(corner);
        resizingRef.current = true;
        lastResizePosRef.current = { x: e.clientX, y: e.clientY };
        initialSizeRef.current = { width: imageWidth, height: imageHeight };
        initialPosRef.current = { x: panX, y: panY };
        if (maintainAspectRatio) {
            aspectRatioRef.current = imageWidth / imageHeight;
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
            } else if (resizingCorner === 'top-right') {
                newWidth = initialSizeRef.current.width + localDx;
                newHeight = newWidth / ratio;
            } else if (resizingCorner === 'top-left') {
                newWidth = initialSizeRef.current.width - localDx;
                newHeight = newWidth / ratio;
            }
        } else {
            if (resizingCorner === 'bottom-right') {
                newWidth = initialSizeRef.current.width + localDx;
                newHeight = initialSizeRef.current.height + localDy;
            } else if (resizingCorner === 'bottom-left') {
                newWidth = initialSizeRef.current.width - localDx;
                newHeight = initialSizeRef.current.height + localDy;
            } else if (resizingCorner === 'top-right') {
                newWidth = initialSizeRef.current.width + localDx;
                newHeight = initialSizeRef.current.height - localDy;
            } else if (resizingCorner === 'top-left') {
                newWidth = initialSizeRef.current.width - localDx;
                newHeight = initialSizeRef.current.height - localDy;
            }
        }

        setImageWidth(Math.max(newWidth, 50));
        setImageHeight(Math.max(newHeight, 50));
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
        const newHeight = imageWidth * (nativeHeight / nativeWidth);
        setImageHeight(newHeight);
    };

    const restoreAspectRatioHeight = () => {
        const newWidth = imageHeight * (nativeWidth / nativeHeight);
        setImageWidth(newWidth);
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
    const cropRotationCenter = useRef({ x:0, y:0 });

    const cropDraggingRef = useRef(false);
    const lastCropDragPosRef = useRef({ x: 0, y: 0 });

    const handleCropMouseDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        cropDraggingRef.current = true;
        lastCropDragPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleCropMouseMove = (e) => {
        if(!cropDraggingRef.current) return;
        const dx = e.clientX - lastCropDragPosRef.current.x;
        const dy = e.clientY - lastCropDragPosRef.current.y;
        lastCropDragPosRef.current = { x: e.clientX, y: e.clientY };
        setCropRect(prev => ({...prev, x: prev.x + dx, y: prev.y + dy}));
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
        cropRotationCenter.current = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
        const dx = e.clientX - cropRotationCenter.current.x;
        const dy = e.clientY - cropRotationCenter.current.y;
        cropRotationStartAngle.current = Math.atan2(dy, dx) * (180/Math.PI);
        cropInitialRotation.current = cropRotation;
    };

    const handleCropGlobalMouseMoveRotation = (e) => {
        if(!cropRotatingRef.current) return;
        const dx = e.clientX - cropRotationCenter.current.x;
        const dy = e.clientY - cropRotationCenter.current.y;
        const angle = Math.atan2(dy, dx) * (180/Math.PI);
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

    const getSvgPoint = (e) => {
        const svg = e.currentTarget;
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        const ctm = svg.getScreenCTM().inverse();
        return point.matrixTransform(ctm);
    };

    const handleSvgMouseDown = (e) => {
        const { x, y } = getSvgPoint(e);
        if (actionMode === 'Drawing' || actionMode === 'Highlighting') {
            isDrawingRef.current = true;
            currentPathPoints.current = [{ x, y }];
            setUndonePaths([]);
        }
    };

    const handleSvgMouseMove = (e) => {
        if (isDrawingRef.current && (actionMode === 'Drawing' || actionMode === 'Highlighting')) {
            const { x, y } = getSvgPoint(e);
            currentPathPoints.current.push({ x, y });
            const pts = currentPathPoints.current;
            if(pts.length > 1) {
                let d = `M ${pts[0].x} ${pts[0].y}`;
                for(let i = 1; i < pts.length - 1; i++){
                    let x_mid = (pts[i].x + pts[i+1].x) / 2;
                    let y_mid = (pts[i].y + pts[i+1].y) / 2;
                    d += ` Q ${pts[i].x} ${pts[i].y} ${x_mid} ${y_mid}`;
                }
                d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
                setTempPath({
                    d,
                    color: actionMode === 'Drawing' ? drawColor : highlightColor,
                    width: actionMode === 'Highlighting' ? highlightBrushSize : drawBrushSize
                });
            }
        }
    };

    const handleSvgMouseUp = (e) => {
        if (isDrawingRef.current && (actionMode === 'Drawing' || actionMode === 'Highlighting')) {
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
                    width: actionMode === 'Highlighting' ? highlightBrushSize : drawBrushSize
                };
                setPaths(prev => [...prev, newPath]);
            }
            setTempPath(null);
            currentPathPoints.current = [];
        }
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

    const undoCrop = () => {
        if (cropHistory.length > 0) {
            const previous = cropHistory[cropHistory.length - 1];
            setCropHistory(prev => prev.slice(0, prev.length - 1));
            setUrl(previous.url);
            setPanX(previous.panX);
            setPanY(previous.panY);
            setImageWidth(previous.imageWidth);
            setImageHeight(previous.imageHeight);
            setNativeWidth(previous.nativeWidth);
            setNativeHeight(previous.nativeHeight);
            setPaths(previous.paths);
            setUndonePaths(previous.undonePaths);
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
                            <Tippy content="Reset Image" theme="tooltip-light">
                                <button onClick={resetImage} className="dinolabsIDEMediaToolButtonHeader">
                                    <FontAwesomeIcon icon={faArrowsRotate} />
                                </button>
                            </Tippy>

                            <Tippy content="Download Image" theme="tooltip-light">
                                <button onClick={downloadImage} className="dinolabsIDEMediaToolButtonHeader">
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
                            Image Size
                        </label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <input
                                className="dinolabsIDEMediaPositionInput"
                                type="text"
                                value={`W: ${Math.round(imageWidth)}px`}
                                onChange={(e) => {
                                    const newValue = e.target.value.replace(/[^0-9.-]/g, "");
                                    setImageWidth(Number(newValue));
                                }}
                            />
                            <input
                                className="dinolabsIDEMediaPositionInput"
                                type="text"
                                value={`H: ${Math.round(imageHeight)}px`}
                                onChange={(e) => {
                                    const newValue = e.target.value.replace(/[^0-9.-]/g, "");
                                    setImageHeight(Number(newValue));
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
                            <Tippy content="Crop Image" theme="tooltip-light">
                                <button
                                    onClick={() => {
                                        if (actionMode === 'Drawing' || actionMode === 'Highlighting') return;
                                        if (isCropDisabled) {
                                            return;
                                        }

                                        if (isCropping) {
                                            const img = new Image();
                                            img.onload = () => {
                                                const offscreenCanvas = document.createElement('canvas');
                                                offscreenCanvas.width = nativeWidth;
                                                offscreenCanvas.height = nativeHeight;
                                                const offscreenCtx = offscreenCanvas.getContext('2d');
                                                offscreenCtx.drawImage(img, 0, 0, nativeWidth, nativeHeight);
                                                offscreenCtx.save();
                                                paths.forEach(pathData => {
                                                    offscreenCtx.strokeStyle = pathData.color;
                                                    offscreenCtx.lineWidth = pathData.width;
                                                    offscreenCtx.lineCap = "round";
                                                    try {
                                                        const p = new Path2D(pathData.d);
                                                        offscreenCtx.stroke(p);
                                                    } catch (err) {
                                                        return;
                                                    }
                                                });
                                                if(tempPath) {
                                                    offscreenCtx.strokeStyle = tempPath.color;
                                                    offscreenCtx.lineWidth = tempPath.width;
                                                    offscreenCtx.lineCap = "round";
                                                    try {
                                                        const p = new Path2D(tempPath.d);
                                                        offscreenCtx.stroke(p);
                                                    } catch (err) {
                                                        return;
                                                    }
                                                }
                                                offscreenCtx.restore();
                                                
                                                const scaleX = nativeWidth / imageWidth;
                                                const scaleY = nativeHeight / imageHeight;
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
                                                if(circleCrop) {
                                                    const radius = Math.min(cropWidth, cropHeight) / 2;
                                                    ctxCrop.arc(cropWidth/2, cropHeight/2, radius, 0, 2*Math.PI);
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

                                                setCropHistory(prev => [...prev, { url, panX, panY, imageWidth, imageHeight, nativeWidth, nativeHeight, paths, undonePaths }]);

                                                setUrl(newDataUrl);
                                                setPanX(0);
                                                setPanY(0);
                                                setImageWidth(cropRect.width);
                                                setImageHeight(cropRect.height);
                                                setNativeWidth(cropWidth);
                                                setNativeHeight(cropHeight);
                                                setIsCropping(false);
                                                setPaths([]);
                                                setUndonePaths([]);
                                                setIsDrawColorOpen(false);
                                                setIsHighlightColorOpen(false);
                                                setActionMode(prev => prev === 'Cropping' ? 'Idle' : 'Cropping');
                                            };
                                            img.src = url;
                                        } else {
                                            setCropRect({ x: 0, y: 0, width: imageWidth, height: imageHeight });
                                            setIsCropping(true);
                                            setCircleCrop(false);
                                            setIsDrawColorOpen(false);
                                            setIsHighlightColorOpen(false);
                                            setActionMode(prev => prev === 'Cropping' ? 'Idle' : 'Cropping');
                                        }
                                    }}
                                    disabled={(isCropDisabled || actionMode === 'Drawing' || actionMode === 'Highlighting') ? true : false}
                                    style={{ "opacity": (isCropDisabled || actionMode === 'Drawing' || actionMode === 'Highlighting') ? "0.6" : "1.0", backgroundColor: isCropping ? "#5C2BE2" : "" }}
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
                                            if(newVal) {
                                                setCropRect(prevRect => ({...prevRect, height: prevRect.width}));
                                            }
                                            return newVal;
                                        })
                                        }}
                                        style={{ backgroundColor: circleCrop ? '#5C2BE2' : '' }}
                                        className="dinolabsIDEMediaToolButton"
                                    >
                                        <FontAwesomeIcon icon={faCircle}/>
                                    </button>
                                </Tippy>
                            )}
                            <Tippy content="Undo Crop" theme="tooltip-light">
                                <button onClick={undoCrop} className="dinolabsIDEMediaToolButton"
                                    disabled={isCropDisabled ? true : false}
                                    style={{ "opacity": isCropDisabled ? "0.6" : "1.0"}}
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
                                <button className="dinolabsIDEMediaToolButtonText" onClick={() => setCropRect(prev => ({...prev, height: prev.width}))}>1:1</button>
                                <button className="dinolabsIDEMediaToolButtonText" onClick={() => setCropRect(prev => ({...prev, height: prev.width * (3/4)}))}>4:3</button>
                                <button className="dinolabsIDEMediaToolButtonText" onClick={() => setCropRect(prev => ({...prev, height: prev.width * (9/16)}))}>16:9</button>
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
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Draw on Image
                        </label>
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
                                content={
                                    <DinoLabsIDEColorPicker
                                        color={drawColor}
                                        onChange={setDrawColor}
                                    />
                                }
                                visible={isDrawColorOpen}
                                onClickOutside={() => setIsDrawColorOpen(false)}
                                interactive={true}
                                placement="right"
                                className="color-picker-tippy"
                            >
                                <label
                                    className="dinolabsIDEMediaColorPicker"
                                    onClick={() => setIsDrawColorOpen((prev) => !prev)}
                                    style={{
                                        backgroundColor: drawColor,
                                    }}
                                />
                            </Tippy>

                            <div className="dinolabsIDEMediaBrushSizeFlex">
                                {[{size:1,label:'XS'},{size:2,label:'S'},{size:4,label:'M'},{size:6,label:'L'},{size:8,label:'XL'}].map(opt => (
                                    <button key={opt.size}
                                    onClick={() => setDrawBrushSize(opt.size)}
                                    style={{
                                        backgroundColor: drawBrushSize === opt.size ? '#5C2BE2' : ''
                                    }}
                                    className="dinolabsIDEMediaToolButtonMini"
                                    >
                                    {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                    </div>

                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Highlight on Image
                        </label>
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
                                content={
                                    <DinoLabsIDEColorPicker
                                        color={highlightColor}
                                        onChange={setHighlightColor}
                                    />
                                }
                                visible={isHighlightColorOpen}
                                onClickOutside={() => setIsHighlightColorOpen(false)}
                                interactive={true}
                                placement="right"
                                className="color-picker-tippy"
                            >
                                <label
                                    className="dinolabsIDEMediaColorPicker"
                                    onClick={() => setIsHighlightColorOpen((prev) => !prev)}
                                    style={{
                                        backgroundColor: highlightColor,
                                    }}
                                />
                            </Tippy>

                            <div className="dinolabsIDEMediaBrushSizeFlex">
                                {[{size:1,label:'XS'},{size:2,label:'S'},{size:4,label:'M'},{size:6,label:'L'},{size:8,label:'XL'}].map(opt => (
                                    <button key={opt.size}
                                    onClick={() => setHighlightBrushSize(opt.size)}
                                    style={{
                                        backgroundColor: highlightBrushSize === opt.size ? '#5C2BE2' : ''
                                    }}
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
                                        const radius = borderRadius || borderTopLeftRadius || 0;
                                        const limited = Math.min(radius, 100);
                                        setBorderRadius(limited);
                                        setBorderTopLeftRadius(limited);
                                        setBorderTopRightRadius(limited);
                                        setBorderBottomLeftRadius(limited);
                                        setBorderBottomRightRadius(limited);
                                    }
                                }}
                            />
                            <span>
                                Sync Corners
                            </span>
                        </label>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Corner Radii
                        </label>
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
                                                const newVal = e.target.value.replace(/[^0-9]/g, "");
                                                let val = Number(newVal);
                                                val = Math.min(val, 100);
                                                setBorderTopLeftRadius(val);
                                            }}
                                        />
                                        <input
                                            className="dinolabsIDEMediaPositionInput"
                                            type="text"
                                            value={`TR: ${borderTopRightRadius}px`}
                                            onChange={(e) => {
                                                const newVal = e.target.value.replace(/[^0-9]/g, "");
                                                let val = Number(newVal);
                                                val = Math.min(val, 100);
                                                setBorderTopRightRadius(val);
                                            }}
                                        />
                                    </div>

                                    <div className="dinolabsIDECornerInputFlex">
                                        <input
                                            className="dinolabsIDEMediaPositionInput"
                                            type="text"
                                            value={`BL: ${borderBottomLeftRadius}px`}
                                            onChange={(e) => {
                                                const newVal = e.target.value.replace(/[^0-9]/g, "");
                                                let val = Number(newVal);
                                                val = Math.min(val, 100);
                                                setBorderBottomLeftRadius(val);
                                            }}
                                        />
                                        <input
                                            className="dinolabsIDEMediaPositionInput"
                                            type="text"
                                            value={`BR: ${borderBottomRightRadius}px`}
                                            onChange={(e) => {
                                                const newVal = e.target.value.replace(/[^0-9]/g, "");
                                                let val = Number(newVal);
                                                val = Math.min(val, 100);
                                                setBorderBottomRightRadius(val);
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
                style={{
                    cursor: 'grab',
                }}
                onMouseDown={(e) => {
                    if (focusedTextId && !e.target.closest(`[data-text-id="${focusedTextId}"]`)) {
                        setFocusedTextId(null);
                        setSelectedTextId(null);
                    }
                    handleDragStart(e);
                }}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
            >
                <div
                    className="dinolabsIDEImageResizer"
                    style={{
                        top: `calc(50% + ${panY}px)`,
                        left: `calc(50% + ${panX}px)`,
                        width: `${imageWidth}px`,
                        height: `${imageHeight}px`,
                        transform: `
                        translate(-50%, -50%) 
                        scale(${flipX * zoom}, ${flipY * zoom}) 
                        rotate(${rotation}deg)
                        `,
                        borderRadius: syncCorners
                            ? `${borderRadius}px`
                            : `${borderTopLeftRadius}px ${borderTopRightRadius}px ${borderBottomRightRadius}px ${borderBottomLeftRadius}px`
                    }}
                >
                    <img
                        src={url}
                        alt="Media content"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        className="dinolabsIDEMediaContent"
                        style={{
                            width: '100%',
                            height: '100%',
                            filter: `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%) ${(spread) ? `drop-shadow(0 0 ${spread}px rgba(0,0,0,0.5))` : ''}`,
                            userSelect: 'none',
                            borderRadius: 'inherit',
                            opacity: opacity / 100
                        }}
                    />
                    
                    
                    {!isCropping && actionMode === 'Idle' && (
                        <>
                        <div
                            className="dinolabsIDEMediaResizeHandle top-left"
                            onMouseDown={(e) => handleResizeMouseDown('top-left', e)}
                            style={{ top: `-6px`, left: `-6px` }}
                        />
                        <div
                            className="dinolabsIDEMediaResizeHandle top-right"
                            onMouseDown={(e) => handleResizeMouseDown('top-right', e)}
                            style={{ top: `-6px`, right: `-6px` }}
                        />
                        <div
                            className="dinolabsIDEMediaResizeHandle bottom-left"
                            onMouseDown={(e) => handleResizeMouseDown('bottom-left', e)}
                            style={{ bottom: `-6px`, left: `-6px` }}
                        />
                        <div
                            className="dinolabsIDEMediaResizeHandle bottom-right"
                            onMouseDown={(e) => handleResizeMouseDown('bottom-right', e)}
                            style={{ bottom: `-6px`, right: `-6px` }}
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
                                style={{ pointerEvents: 'auto', top: `-8px`, left: `-8px` }}
                                onMouseDown={(e) => handleCropResizeMouseDown('top-left', e)}
                            />
                            <div
                                className="dinolabsIDEMediaResizeHandle top-right"
                                style={{ pointerEvents: 'auto', top: `-8px`, right: `-8px` }}
                                onMouseDown={(e) => handleCropResizeMouseDown('top-right', e)}
                            />
                            <div
                                className="dinolabsIDEMediaResizeHandle bottom-left"
                                style={{ pointerEvents: 'auto', bottom: `-8px`, left: `-8px` }}
                                onMouseDown={(e) => handleCropResizeMouseDown('bottom-left', e)}
                            />
                            <div
                                className="dinolabsIDEMediaResizeHandle bottom-right"
                                style={{ pointerEvents: 'auto', bottom: `-8px`, right: `-8px` }}
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
                    <svg
                        viewBox={`0 0 ${nativeWidth} ${nativeHeight}`}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: actionMode !== 'Idle' ? 'auto' : 'none',
                            cursor: actionMode === 'Drawing' ? 'crosshair' : actionMode === 'Highlighting' ? 'pointer' : 'default',
                            filter: `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)`
                        }}
                        onMouseDown={handleSvgMouseDown}
                        onMouseMove={handleSvgMouseMove}
                        onMouseUp={handleSvgMouseUp}
                    >
                        {paths.map((pathData, index) => (
                            <path
                                key={index}
                                d={pathData.d}
                                stroke={pathData.color}
                                strokeWidth={pathData.width}
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
                    <div> 
                    </div>
                    <label className="dinolabsIDEMediaModeIndicator">
                        <span>
                        {isCropping ? 'Cropping' : 'Idle'}
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
}

export default DinoLabsIDEImageEditor;
