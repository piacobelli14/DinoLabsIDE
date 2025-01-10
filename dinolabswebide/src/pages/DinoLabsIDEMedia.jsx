import React, { useState, useEffect, useRef } from 'react';
import "../styles/mainStyles/DinoLabsIDEMedia.css";
import "../styles/helperStyles/Slider.css";
import "../styles/helperStyles/Checkbox.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faArrowsLeftRightToLine, faArrowsRotate, faArrowsUpToLine, faBorderTopLeft, faCropSimple, faDownload, faLeftRight, faMagnifyingGlassMinus, faMagnifyingGlassPlus, faMinus, faPalette, faPenRuler, faPlus, faRightLeft, faRotate, faRotateLeft, faRotateRight, faRuler, faRulerCombined, faSave, faSwatchbook, faTabletScreenButton, faUpDown } from '@fortawesome/free-solid-svg-icons';

function DinoLabsIDEMedia({ fileHandle }) {
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
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const draggingRef = useRef(false);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const [imageWidth, setImageWidth] = useState(300);
    const [imageHeight, setImageHeight] = useState(300);
    const [nativeWidth, setNativeWidth] = useState(300);
    const [nativeHeight, setNativeHeight] = useState(300);
    const [resizingCorner, setResizingCorner] = useState(null);
    const resizingRef = useRef(false);
    const lastResizePosRef = useRef({ x: 0, y: 0 });
    const initialSizeRef = useRef({ width: 300, height: 300 });
    const initialPosRef = useRef({ x: 0, y: 0 });
    const [isCropping, setIsCropping] = useState(false);
    const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 100, height: 100 });
    const cropResizingRef = useRef(false);
    const cropResizingCorner = useRef(null);
    const cropLastResizePosRef = useRef({ x: 0, y: 0 });
    const cropInitialRectRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const [actionMode, setActionMode] = useState('Idle');
    const [drawColor, setDrawColor] = useState('#4B0082');
    const [highlightColor, setHighlightColor] = useState('#FFFF00');
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

    useEffect(() => {
        const loadMedia = async () => {
            try {
                const file = await fileHandle.getFile();
                const objectUrl = URL.createObjectURL(file);
                setUrl(objectUrl);

                const extension = file.name.split('.').pop().toLowerCase();
                if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp'].includes(extension)) {
                    setMediaType('image');
                    const img = new Image();
                    img.onload = () => {
                        setNativeWidth(img.naturalWidth);
                        setNativeHeight(img.naturalHeight);
                        const scaleFactor = 300 / img.naturalHeight;
                        setImageHeight(300);
                        setImageWidth(img.naturalWidth * scaleFactor);
                    };
                    img.src = objectUrl;
                } else if (['mp4', 'mkv', 'avi', 'mov'].includes(extension)) {
                    setMediaType('video');
                } else if (['mp3', 'wav', 'flac'].includes(extension)) {
                    setMediaType('audio');
                }

                return () => URL.revokeObjectURL(objectUrl);
            } catch (error) {
                console.error('Failed to load media:', error);
            }
        };
        loadMedia();
    }, [fileHandle]);

    const resetImage = () => {
        setZoom(1);
        setRotation(0);
        setFlipX(1);
        setFlipY(1);
        setHue(0);
        setSaturation(100);
        setBrightness(100);
        setContrast(100);
        setPanX(0);
        setPanY(0);
        setBorderRadius(0);
        setBorderTopLeftRadius(0);
        setBorderTopRightRadius(0);
        setBorderBottomLeftRadius(0);
        setBorderBottomRightRadius(0);
        const scaleFactor = 300 / nativeHeight;
        setImageHeight(300);
        setImageWidth(nativeWidth * scaleFactor);
    };

    const downloadImage = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileHandle.name;
        link.click();
    };

    const handleDragStart = (e) => {
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
        if (actionMode !== 'Idle') return;
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
        let newWidth = initialSizeRef.current.width;
        let newHeight = initialSizeRef.current.height;
        let newPanX = initialPosRef.current.x;
        let newPanY = initialPosRef.current.y;

        if (maintainAspectRatio) {
            const ratio = aspectRatioRef.current;
            if (resizingCorner === 'bottom-right') {
                newWidth = initialSizeRef.current.width + dx;
                newHeight = newWidth / ratio;
            } else if (resizingCorner === 'bottom-left') {
                newWidth = initialSizeRef.current.width - dx;
                newHeight = newWidth / ratio;
                newPanX = initialPosRef.current.x + dx;
            } else if (resizingCorner === 'top-right') {
                newWidth = initialSizeRef.current.width + dx;
                newHeight = newWidth / ratio;
                newPanY = initialPosRef.current.y + (initialSizeRef.current.height - newHeight);
            } else if (resizingCorner === 'top-left') {
                newWidth = initialSizeRef.current.width - dx;
                newHeight = newWidth / ratio;
                newPanX = initialPosRef.current.x + dx;
                newPanY = initialPosRef.current.y + (initialSizeRef.current.height - newHeight);
            }
        } else {
            const dy = e.clientY - lastResizePosRef.current.y;
            if (resizingCorner === 'bottom-right') {
                newWidth = initialSizeRef.current.width + dx;
                newHeight = initialSizeRef.current.height + dy;
            } else if (resizingCorner === 'bottom-left') {
                newWidth = initialSizeRef.current.width - dx;
                newHeight = initialSizeRef.current.height + dy;
                newPanX = initialPosRef.current.x + dx;
            } else if (resizingCorner === 'top-right') {
                newWidth = initialSizeRef.current.width + dx;
                newHeight = initialSizeRef.current.height - dy;
                newPanY = initialPosRef.current.y + dy;
            } else if (resizingCorner === 'top-left') {
                newWidth = initialSizeRef.current.width - dx;
                newHeight = initialSizeRef.current.height - dy;
                newPanX = initialPosRef.current.x + dx;
                newPanY = initialPosRef.current.y + dy;
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

        setCropRect({
            x,
            y,
            width: Math.max(width, 10),
            height: Math.max(height, 10)
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
            currentPathPoints.current = [`M${x} ${y}`];
            setUndonePaths([]);
        }
    };

    const handleSvgMouseMove = (e) => {
        if (isDrawingRef.current && (actionMode === 'Drawing' || actionMode === 'Highlighting')) {
            const { x, y } = getSvgPoint(e);
            currentPathPoints.current.push(`L${x} ${y}`);
            const d = currentPathPoints.current.join(' ');
            setTempPath({ d, color: actionMode === 'Drawing' ? drawColor : highlightColor, width: actionMode === 'Highlighting' ? 10 : 2 });
        }
    };

    const handleSvgMouseUp = (e) => {
        if (isDrawingRef.current && (actionMode === 'Drawing' || actionMode === 'Highlighting')) {
            isDrawingRef.current = false;
            if (tempPath) {
                setPaths(prev => [...prev, tempPath]);
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

    if (!url) return <div>Loading media...</div>;

    if (mediaType === 'image') {
        return (
            <div className="dinolabsIDEMediaContentWrapper">
                <div className="dinoLabsIDEMediaToolBar">

                    <div className="dinolabsIDEMediaCellWrapper"> 

                        <div className="dinolabsIDEMediaHeaderFlex">
                            <label className="dinolabsIDEMediaCellTitle"> 
                                <FontAwesomeIcon icon={faTabletScreenButton}/>
                                Layout
                            </label> 

                            <div className="dinolabsIDEMediaCellFlexSupplement">
                                <Tippy content="Reset Image" theme="tooltip-light">
                                    <button onClick={resetImage} className="dinolabsIDEMediaToolButtonHeader">
                                        <FontAwesomeIcon icon={faArrowsRotate}/>
                                    </button>
                                </Tippy>

                                <Tippy content="Save to Original File" theme="tooltip-light">
                                    <button className="dinolabsIDEMediaToolButtonHeader">
                                        <FontAwesomeIcon icon={faSave}/>
                                    </button>
                                </Tippy>

                                <Tippy content="Download Image" theme="tooltip-light">
                                    <button onClick={downloadImage} className="dinolabsIDEMediaToolButtonHeader">
                                        <FontAwesomeIcon icon={faDownload}/>
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
                                    const newValue = e.target.value.replace(/[^0-9.-]/g, ""); // Remove non-numeric characters
                                    setPanX(Number(newValue));
                                    }}
                                />

                                <input
                                    className="dinolabsIDEMediaPositionInput"
                                    type="text"
                                    value={`Y: ${panY}`}
                                    onChange={(e) => {
                                    const newValue = e.target.value.replace(/[^0-9.-]/g, ""); // Remove non-numeric characters
                                    setPanY(Number(newValue));
                                    }}
                                />
                            </div>
                        </div>

                        <div className="dinolabsIDEMediaCellFlexStack">
                            <div className="dinolabsIDEMediaCellFlex">
                                <Tippy content="Zoom In" theme="tooltip-light">
                                    <button onClick={() => setZoom(prev => prev + 0.1)} className="dinolabsIDEMediaToolButton">
                                        <FontAwesomeIcon icon={faMagnifyingGlassPlus}/>
                                    </button>
                                </Tippy>

                                <Tippy content="Zoom Out" theme="tooltip-light">
                                    <button onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))} className="dinolabsIDEMediaToolButton">
                                        <FontAwesomeIcon icon={faMagnifyingGlassMinus}/>
                                    </button>
                                </Tippy>

                                <Tippy content="Rotate Left" theme="tooltip-light">
                                    <button onClick={() => setRotation(prev => prev - 90)} className="dinolabsIDEMediaToolButton">
                                        <FontAwesomeIcon icon={faRotateLeft}/>
                                    </button>
                                </Tippy>

                                <Tippy content="Rotate Right" theme="tooltip-light">
                                    <button onClick={() => setRotation(prev => prev + 90)} className="dinolabsIDEMediaToolButton">
                                        <FontAwesomeIcon icon={faRotateRight}/>
                                    </button>
                                </Tippy>

                                <Tippy content="Flip Horizontally" theme="tooltip-light">
                                    <button onClick={() => setFlipX(prev => -prev)} className="dinolabsIDEMediaToolButton">
                                        <FontAwesomeIcon icon={faLeftRight}/>
                                    </button>
                                </Tippy>
                                
                                <Tippy content="Flip Vertically" theme="tooltip-light">
                                    <button onClick={() => setFlipY(prev => -prev)} className="dinolabsIDEMediaToolButton">
                                        <FontAwesomeIcon icon={faUpDown}/>
                                    </button>
                                </Tippy>
                            </div>
                            
                        </div>


                    </div>

                    <div className="dinolabsIDEMediaCellWrapper"> 
                        <div className="dinolabsIDEMediaHeaderFlex">
                            <label className="dinolabsIDEMediaCellTitle"> 
                                <FontAwesomeIcon icon={faRulerCombined}/>
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

                        <div className="dinolabsIDEMediaCellFlex">
                            <Tippy content="Restore Width Based Aspect Ratio" theme="tooltip-light">
                                <button onClick={restoreAspectRatioWidth} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faArrowsLeftRightToLine}/>
                                </button>
                            </Tippy>

                            <Tippy content="Restore Height Based Aspect Ratio" theme="tooltip-light">
                                <button onClick={restoreAspectRatioHeight} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faArrowsUpToLine}/>
                                </button>
                            </Tippy>

                            <Tippy content="Crop Image" theme="tooltip-light">

                                <button
                                    onClick={() => {
                                        if (isCropping) {
                                            const img = new Image();
                                            img.onload = () => {
                                                const scaleX = nativeWidth / imageWidth;
                                                const scaleY = nativeHeight / imageHeight;
                                                const sx = cropRect.x * scaleX;
                                                const sy = cropRect.y * scaleY;
                                                const sw = cropRect.width * scaleX;
                                                const sh = cropRect.height * scaleY;
                                                const canvas = document.createElement('canvas');
                                                canvas.width = sw;
                                                canvas.height = sh;
                                                const ctx = canvas.getContext('2d');
                                                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
                                                const newDataUrl = canvas.toDataURL();
                                                setUrl(newDataUrl);
                                                setPanX(0);
                                                setPanY(0);
                                                setImageWidth(cropRect.width);
                                                setImageHeight(cropRect.height);
                                                setNativeWidth(sw);
                                                setNativeHeight(sh);
                                                setIsCropping(false);
                                            };
                                            img.src = url;
                                        } else {
                                            setCropRect({ x: 0, y: 0, width: imageWidth, height: imageHeight });
                                            setIsCropping(true);
                                        }
                                    }}
                                    style={{"background-color": isCropping ? "#5C2BE2" : ""}}
                                    className="dinolabsIDEMediaToolButton"
                                >
                                    <FontAwesomeIcon icon={faCropSimple}/>
                                </button>
                            </Tippy>
                        </div>
                    </div>

                    <div className="dinolabsIDEMediaCellWrapper"> 
                        <div className="dinolabsIDEMediaHeaderFlex">
                            <label className="dinolabsIDEMediaCellTitle"> 
                                <FontAwesomeIcon icon={faPalette}/>
                                Drawing
                            </label> 

                            <div className="dinolabsIDEMediaCellFlexSupplement">
                                <Tippy content="Undo Marks" theme="tooltip-light">
                                    <button onClick={undoStroke} className="dinolabsIDEMediaToolButtonHeader">
                                        <FontAwesomeIcon icon={faArrowLeft}/>
                                    </button>
                                </Tippy>

                                <Tippy content="Redo Marks" theme="tooltip-light">
                                    <button onClick={redoStroke} className="dinolabsIDEMediaToolButtonHeader">
                                        <FontAwesomeIcon icon={faArrowRight}/>
                                    </button>
                                </Tippy>
                            </div>
                        </div>

                        <div className="dinolabsIDEMediaCellFlexStack">
                            <label className="dinolabsIDEMediaCellFlexTitle"> 
                                Draw on Image
                            </label>

                            <div className="dinolabsIDEMediaCellFlex">
                                <button onClick={() => setActionMode(prev => prev === 'Drawing' ? 'Idle' : 'Drawing')} style={{"backgroundColor": actionMode === "Drawing" ? "#5C2BE2" : ""}} className="dinolabsIDEMediaToolButtonBig">Draw</button>
                                <input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="dinolabsIDEMediaColorPicker" />
                            </div>
                        </div>


                        <div className="dinolabsIDEMediaCellFlexStack">
                            <label className="dinolabsIDEMediaCellFlexTitle"> 
                                Highlight on Image
                            </label>

                            <div className="dinolabsIDEMediaCellFlex">
                                <button onClick={() => setActionMode(prev => prev === 'Highlighting' ? 'Idle' : 'Highlighting')} style={{"backgroundColor": actionMode === "Highlighting" ? "#5C2BE2" : ""}} className="dinolabsIDEMediaToolButtonBig">Highlight</button>
                                <input type="color" value={highlightColor} onChange={(e) => setHighlightColor(e.target.value)} className="dinolabsIDEMediaColorPicker" />
                            </div>
                        </div>

                        
                    </div>

                    <div className="dinolabsIDEMediaCellWrapper"> 
                        
                        <div className="dinolabsIDEMediaHeaderFlex">
                            <label className="dinolabsIDEMediaCellTitle"> 
                                <FontAwesomeIcon icon={faSwatchbook}/>
                                Styles
                            </label> 
                        </div>

                        <div className="dinolabsIDEMediaCellFlexStack">
                            <label className="dinolabsIDEMediaCellFlexTitle"> 
                                Hue
                            </label>

                            <div className="dinolabsIDEMediaCellFlex">
                                <button onClick={() => setHue(prev => prev - 10)} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faMinus}/>
                                </button>
                                <div className="dinolabsIDEMediaSliderWrapper"> 
                                <input className="dinolabsIDESettingsSlider" type="range" min="0" max="360" value={hue} onChange={(e) => setHue(Number(e.target.value))} />
                                </div>
                                <button onClick={() => setHue(prev => prev + 10)} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faPlus}/>
                                </button>
                            </div>
                        </div>

                        <div className="dinolabsIDEMediaCellFlexStack">
                            <label className="dinolabsIDEMediaCellFlexTitle"> 
                                Saturation
                            </label>

                            <div className="dinolabsIDEMediaCellFlex">
                                <button onClick={() => setSaturation(prev => prev - 10)} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faMinus}/>
                                </button>
                                <div className="dinolabsIDEMediaSliderWrapper"> 
                                <input className="dinolabsIDESettingsSlider" type="range" min="0" max="360" value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} />
                                </div>
                                <button onClick={() => setSaturation(prev => prev + 10)} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faPlus}/>
                                </button>
                            </div>
                        </div>

                        <div className="dinolabsIDEMediaCellFlexStack">
                            <label className="dinolabsIDEMediaCellFlexTitle"> 
                                Brightness
                            </label>

                            <div className="dinolabsIDEMediaCellFlex">
                                <button onClick={() => setBrightness(prev => prev - 10)} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faMinus}/>
                                </button>
                                <div className="dinolabsIDEMediaSliderWrapper"> 
                                    <input className="dinolabsIDESettingsSlider" type="range" min="0" max="360" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} />
                                </div>
                                <button onClick={() => setBrightness(prev => prev + 10)} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faPlus}/>
                                </button>
                            </div>
                        </div>

                        <div className="dinolabsIDEMediaCellFlexStack">
                            <label className="dinolabsIDEMediaCellFlexTitle"> 
                                Contrast
                            </label>

                            <div className="dinolabsIDEMediaCellFlex">
                                <button onClick={() => setContrast(prev => prev - 10)} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faMinus}/>
                                </button>
                                <div className="dinolabsIDEMediaSliderWrapper"> 
                                    <input className="dinolabsIDESettingsSlider" type="range" min="0" max="360" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} />
                                </div>
                                <button onClick={() => setContrast(prev => prev + 10)} className="dinolabsIDEMediaToolButton">
                                    <FontAwesomeIcon icon={faPlus}/>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="dinolabsIDEMediaCellWrapper"> 
                        <div className="dinolabsIDEMediaHeaderFlex">
                            <label className="dinolabsIDEMediaCellTitle"> 
                                <FontAwesomeIcon icon={faBorderTopLeft}/>
                                Corner Rounding
                            </label> 


                            <label className="dinolabsIDEConfrmationCheck">
                                <input
                                    type="checkbox"
                                    className="dinolabsIDESettingsCheckbox"
                                    checked={maintainAspectRatio}
                                    onChange={(e) => {
                                        setSyncCorners(e.target.checked);
                                        if (e.target.checked) {
                                            setBorderRadius(borderTopLeftRadius);
                                            setBorderTopRightRadius(borderTopLeftRadius);
                                            setBorderBottomLeftRadius(borderTopLeftRadius);
                                            setBorderBottomRightRadius(borderTopLeftRadius);
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
                                        <input className="dinolabsIDEMediaPositionInput" type="number" min="0" max="100" value={borderRadius} onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setBorderRadius(val);
                                            setBorderTopLeftRadius(val);
                                            setBorderTopRightRadius(val);
                                            setBorderBottomLeftRadius(val);
                                            setBorderBottomRightRadius(val);
                                        }} />
                                    ) : (
                                        <>
                                            <input className="dinolabsIDEMediaPositionInputMini" type="number" min="0" max="100" value={borderTopLeftRadius} onChange={(e) => setBorderTopLeftRadius(Number(e.target.value))} />
                                            <input className="dinolabsIDEMediaPositionInputMini" type="number" min="0" max="100" value={borderTopRightRadius} onChange={(e) => setBorderTopRightRadius(Number(e.target.value))} />
                                            <input className="dinolabsIDEMediaPositionInputMini" type="number" min="0" max="100" value={borderBottomLeftRadius} onChange={(e) => setBorderBottomLeftRadius(Number(e.target.value))} />
                                            <input className="dinolabsIDEMediaPositionInputMini" type="number" min="0" max="100" value={borderBottomRightRadius} onChange={(e) => setBorderBottomRightRadius(Number(e.target.value))} />
                                        </>
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
                    onMouseDown={handleDragStart}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                >
                    <div className="dinolabsIDEMediaExportActionsWrapper"> 
                        <div className="dinolabsIDEMediaExportActionsWrapperFlex"> 
                            <label className="dinolabsIDEMediaModeIndicator">
                                {actionMode}
                            </label>
                           
                        </div>
                    </div>

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
                            borderRadius: borderRadius > 0 
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
                                filter: `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%) contrast(${contrast}%)`,
                                userSelect: 'none',
                                borderRadius: 'inherit'
                            }}
                        />
                        <div
                            className="dinolabsIDEMediaResizeHandle top-left"
                            onMouseDown={(e) => handleResizeMouseDown('top-left', e)}
                        />
                        <div
                            className="dinolabsIDEMediaResizeHandle top-right"
                            onMouseDown={(e) => handleResizeMouseDown('top-right', e)}
                        />
                        <div
                            className="dinolabsIDEMediaResizeHandle bottom-left"
                            onMouseDown={(e) => handleResizeMouseDown('bottom-left', e)}
                        />
                        <div
                            className="dinolabsIDEMediaResizeHandle bottom-right"
                            onMouseDown={(e) => handleResizeMouseDown('bottom-right', e)}
                        />

                        {isCropping && (
                            <div
                                className="dinolabsIDEMediaCropRectangle"
                                style={{
                                    position: 'absolute',
                                    border: '0.4vh dashed rgba(31, 174, 245, 1)',
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    boxSizing: 'none',
                                    left: cropRect.x,
                                    top: cropRect.y,
                                    width: cropRect.width,
                                    height: cropRect.height,
                                    pointerEvents: 'none'
                                }}
                            >
                                <div
                                    className="dinolabsIDEMediaResizeHandle top-left"
                                    style={{ pointerEvents: 'auto' }}
                                    onMouseDown={(e) => handleCropResizeMouseDown('top-left', e)}
                                />
                                <div
                                    className="dinolabsIDEMediaResizeHandle top-right"
                                    style={{ pointerEvents: 'auto' }}
                                    onMouseDown={(e) => handleCropResizeMouseDown('top-right', e)}
                                />
                                <div
                                    className="dinolabsIDEMediaResizeHandle bottom-left"
                                    style={{ pointerEvents: 'auto' }}
                                    onMouseDown={(e) => handleCropResizeMouseDown('bottom-left', e)}
                                />
                                <div
                                    className="dinolabsIDEMediaResizeHandle bottom-right"
                                    style={{ pointerEvents: 'auto' }}
                                    onMouseDown={(e) => handleCropResizeMouseDown('bottom-right', e)}
                                />
                            </div>
                        )}

                        <svg
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: actionMode !== 'Idle' ? 'auto' : 'none',
                                cursor: actionMode === 'Drawing' ? 'crosshair' : actionMode === 'Highlighting' ? 'pointer' : 'default'
                            }}
                            onMouseDown={handleSvgMouseDown}
                            onMouseMove={handleSvgMouseMove}
                            onMouseUp={handleSvgMouseUp}
                        >
                            {paths.map((pathData, index) => (
                                <path key={index} d={pathData.d} stroke={pathData.color} strokeWidth={pathData.width} fill="none" strokeLinecap="round" />
                            ))}
                            {tempPath && (
                                <path d={tempPath.d} stroke={tempPath.color} strokeWidth={tempPath.width} fill="none" strokeLinecap="round" />
                            )}
                        </svg>
                    </div>
                </div>
            </div>
        );
    } else if (mediaType === 'video') {
        return (
            <div className="media-container video-container">
                <div className="media-controls">
                    <button className="media-button">Download Video</button>
                    <button className="media-button">Full Screen</button>
                </div>
                <video src={url} controls className="media-content" />
            </div>
        );
    } else if (mediaType === 'audio') {
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
    return <div>Unsupported media type.</div>;
}

export default DinoLabsIDEMedia;
