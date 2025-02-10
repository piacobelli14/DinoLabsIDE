import React from 'react';
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTabletScreenButton, 
    faArrowsRotate, 
    faDownload, 
    faRulerCombined, 
    faArrowsLeftRightToLine, 
    faArrowsUpToLine, 
    faCropSimple, 
    faCircle, 
    faSquareCaretLeft, 
    faBrush, 
    faArrowLeft, 
    faArrowRight, 
    faMinus, 
    faPlus, 
    faSwatchbook, 
    faBorderTopLeft 
} from '@fortawesome/free-solid-svg-icons';
import DinoLabsIDEColorPicker from '../../DinoLabsIDEColorPicker.jsx';

const DinoLabsIDEVideoEditorToolbar = ({
  showFrameBar,
  resetVideo,
  downloadVideo,
  panX,
  panY,
  setPanX,
  setPanY,
  maintainAspectRatio,
  setMaintainAspectRatio,
  videoWidth,
  videoHeight,
  setVideoWidth,
  setVideoHeight,
  restoreAspectRatioWidth,
  restoreAspectRatioHeight,
  actionMode,
  setActionMode,
  isCropDisabled,
  isCropping,
  mediaType,
  finalizeCrop,
  setCropRect,
  setIsCropping,
  setCircleCrop,
  circleCrop,
  undoCrop,
  undoStroke,
  redoStroke,
  drawColor,
  setDrawColor,
  isDrawColorOpen,
  setIsDrawColorOpen,
  drawBrushSize,
  setDrawBrushSize,
  highlightColor,
  setHighlightColor,
  isHighlightColorOpen,
  setIsHighlightColorOpen,
  highlightBrushSize,
  setHighlightBrushSize,
  setOpacity,
  opacity,
  setHue,
  hue,
  setSaturation,
  saturation,
  setBrightness,
  brightness,
  setContrast,
  contrast,
  setBlur,
  blur,
  setSpread,
  spread,
  setGrayscale,
  grayscale,
  setSepia,
  sepia,
  syncCorners,
  setSyncCorners,
  borderRadius,
  setBorderRadius,
  borderTopLeftRadius,
  setBorderTopLeftRadius,
  borderTopRightRadius,
  setBorderTopRightRadius,
  borderBottomLeftRadius,
  setBorderBottomLeftRadius,
  borderBottomRightRadius,
  setBorderBottomRightRadius
}) => {
  return (
    <div
      className="dinoLabsIDEMediaToolBar"
      style={{
        pointerEvents: showFrameBar ? 'none' : 'auto',
        opacity: showFrameBar ? 0.4 : 1.0,
      }}
    >
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
                      return;
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
                  opacity: (isCropDisabled || actionMode === 'Drawing' || actionMode === 'Highlighting') ? '0.6' : '1.0',
                  backgroundColor: isCropping ? '#5C2BE2' : '',
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
                    setCircleCrop((prev) => !prev);
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
                style={{ opacity: isCropDisabled ? '0.6' : '1.0' }}
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
                onClick={() =>
                  setCropRect((prev) => ({
                    ...prev,
                    height: prev.width,
                  }))
                }
              >
                1:1
              </button>
              <button
                className="dinolabsIDEMediaToolButtonText"
                onClick={() =>
                  setCropRect((prev) => ({
                    ...prev,
                    height: prev.width * (3 / 4),
                  }))
                }
              >
                4:3
              </button>
              <button
                className="dinolabsIDEMediaToolButtonText"
                onClick={() =>
                  setCropRect((prev) => ({
                    ...prev,
                    height: prev.width * (9 / 16),
                  }))
                }
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
              onClick={() => setActionMode((prev) => (prev === 'Drawing' ? 'Idle' : 'Drawing'))}
              style={{ backgroundColor: actionMode === 'Drawing' ? '#5C2BE2' : '', opacity: isCropping ? '0.6' : '1.0' }}
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
                onClick={() => setIsDrawColorOpen((prev) => !prev)}
                style={{ backgroundColor: drawColor }}
              />
            </Tippy>
            <div className="dinolabsIDEMediaBrushSizeFlex">
              {[
                { size: 1, label: 'XS' },
                { size: 2, label: 'S' },
                { size: 4, label: 'M' },
                { size: 6, label: 'L' },
                { size: 8, label: 'XL' },
              ].map((opt) => (
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
              onClick={() => setActionMode((prev) => (prev === 'Highlighting' ? 'Idle' : 'Highlighting'))}
              style={{ backgroundColor: actionMode === 'Highlighting' ? '#5C2BE2' : '', opacity: isCropping ? '0.6' : '1.0' }}
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
                onClick={() => setIsHighlightColorOpen((prev) => !prev)}
                style={{ backgroundColor: highlightColor }}
              />
            </Tippy>
            <div className="dinolabsIDEMediaBrushSizeFlex">
              {[
                { size: 1, label: 'XS' },
                { size: 2, label: 'S' },
                { size: 4, label: 'M' },
                { size: 6, label: 'L' },
                { size: 8, label: 'XL' },
              ].map((opt) => (
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
            <button onClick={() => setOpacity((prev) => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
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
            <button onClick={() => setOpacity((prev) => Math.min(prev + 10, 100))} className="dinolabsIDEMediaToolButton">
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
        <div className="dinolabsIDEMediaCellFlexStack">
          <label className="dinolabsIDEMediaCellFlexTitle">Hue</label>
          <div className="dinolabsIDEMediaCellFlex">
            <button onClick={() => setHue((prev) => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
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
            <button onClick={() => setHue((prev) => Math.min(prev + 10, 360))} className="dinolabsIDEMediaToolButton">
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
        <div className="dinolabsIDEMediaCellFlexStack">
          <label className="dinolabsIDEMediaCellFlexTitle">Saturation</label>
          <div className="dinolabsIDEMediaCellFlex">
            <button onClick={() => setSaturation((prev) => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
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
            <button onClick={() => setSaturation((prev) => Math.min(prev + 10, 360))} className="dinolabsIDEMediaToolButton">
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
        <div className="dinolabsIDEMediaCellFlexStack">
          <label className="dinolabsIDEMediaCellFlexTitle">Brightness</label>
          <div className="dinolabsIDEMediaCellFlex">
            <button onClick={() => setBrightness((prev) => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
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
            <button onClick={() => setBrightness((prev) => Math.min(prev + 10, 360))} className="dinolabsIDEMediaToolButton">
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
        <div className="dinolabsIDEMediaCellFlexStack">
          <label className="dinolabsIDEMediaCellFlexTitle">Contrast</label>
          <div className="dinolabsIDEMediaCellFlex">
            <button onClick={() => setContrast((prev) => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
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
            <button onClick={() => setContrast((prev) => Math.min(prev + 10, 360))} className="dinolabsIDEMediaToolButton">
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
        <div className="dinolabsIDEMediaCellFlexStack">
          <label className="dinolabsIDEMediaCellFlexTitle">Blur</label>
          <div className="dinolabsIDEMediaCellFlex">
            <button onClick={() => setBlur((prev) => Math.max(prev - 1, 0))} className="dinolabsIDEMediaToolButton">
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
            <button onClick={() => setBlur((prev) => prev + 1)} className="dinolabsIDEMediaToolButton">
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
        <div className="dinolabsIDEMediaCellFlexStack">
          <label className="dinolabsIDEMediaCellFlexTitle">Shadow</label>
          <div className="dinolabsIDEMediaCellFlex">
            <button onClick={() => setSpread((prev) => Math.max(prev - 1, 0))} className="dinolabsIDEMediaToolButton">
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
            <button onClick={() => setSpread((prev) => prev + 1)} className="dinolabsIDEMediaToolButton">
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
        <div className="dinolabsIDEMediaCellFlexStack">
          <label className="dinolabsIDEMediaCellFlexTitle">Grayscale</label>
          <div className="dinolabsIDEMediaCellFlex">
            <button onClick={() => setGrayscale((prev) => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
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
            <button onClick={() => setGrayscale((prev) => Math.min(prev + 10, 100))} className="dinolabsIDEMediaToolButton">
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
        <div className="dinolabsIDEMediaCellFlexStack">
          <label className="dinolabsIDEMediaCellFlexTitle">Sepia</label>
          <div className="dinolabsIDEMediaCellFlex">
            <button onClick={() => setSepia((prev) => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
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
            <button onClick={() => setSepia((prev) => Math.min(prev + 10, 100))} className="dinolabsIDEMediaToolButton">
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
  );
};

export default DinoLabsIDEVideoEditorToolbar;
