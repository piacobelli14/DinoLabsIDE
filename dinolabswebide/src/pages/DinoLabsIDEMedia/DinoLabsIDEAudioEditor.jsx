import React, { useState, useEffect, useRef } from 'react';
import "../../styles/mainStyles/DinoLabsIDEMedia.css";
import "../../styles/helperStyles/Slider.css";
import "../../styles/helperStyles/Checkbox.css";
import { showDialog } from "../DinoLabsIDEAlert.jsx";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowsRotate,
    faDownload,
    faMinus,
    faPlus,
    faRepeat,
    faTabletScreenButton,
    faBackward,
    faForward,
    faSave,
    faStop,
    faPlay,
    faHeadphones
} from '@fortawesome/free-solid-svg-icons';

function formatTime(totalSeconds) {
    if (!totalSeconds || isNaN(totalSeconds)) return "00:00";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return (
        (h > 0 ? String(h).padStart(2, '0') + ':' : '') +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0')
    );
}

function DinoLabsIDEAudioEditor({ fileHandle }) {
    const [url, setUrl] = useState(null);
    const [audioName, setAudioName] = useState("audio");
    const [originalFileSize, setOriginalFileSize] = useState(null);
    const audioRef = useRef(null);
    const canvasRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [currentPlaybackRate, setCurrentPlaybackRate] = useState(1.0);
    const [volume, setVolume] = useState(100);

    const [audioDuration, setAudioDuration] = useState(0);

    const [waveformData, setWaveformData] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const file =
                    typeof fileHandle.getFile === "function"
                        ? await fileHandle.getFile()
                        : fileHandle;
                setAudioName(file.name || "audio");
                setOriginalFileSize(file.size);
                const objectUrl = URL.createObjectURL(file);
                setUrl(objectUrl);
                const arrayBuffer = await file.arrayBuffer();
                const offlineCtx =
                    new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100 * 40, 44100);
                const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);
                const rawData = audioBuffer.getChannelData(0);
                const samples = 1000;
                const blockSize = Math.floor(rawData.length / samples);
                const filteredData = [];
                for (let i = 0; i < samples; i++) {
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(rawData[i * blockSize + j]);
                    }
                    filteredData.push(sum / blockSize);
                }
                setWaveformData(filteredData);
                return () => {
                    URL.revokeObjectURL(objectUrl);
                };
            } catch (err) {
                console.error("Error loading audio file", err);
            }
        })();
    }, [fileHandle]);

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setAudioDuration(audioRef.current.duration || 0);
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleLoop = () => {
        if (!audioRef.current) return;
        // Toggle the looping state. The onEnded handler will use this value.
        setIsLooping(!isLooping);
    };

    const setPlaybackRateHandler = (rate) => {
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
        }
        setCurrentPlaybackRate(rate);
    };

    const skipForward = (seconds = 5) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.min(
                audioRef.current.duration,
                audioRef.current.currentTime + seconds
            );
        }
    };

    const skipBackward = (seconds = 5) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seconds);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || waveformData.length === 0) return;
        const ctx = canvas.getContext("2d");

        const drawWaveform = () => {
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);
            ctx.beginPath();
            const sliceWidth = width / waveformData.length;
            for (let i = 0; i < waveformData.length; i++) {
                const amplitude = waveformData[i];
                const y = height / 2 - amplitude * (height / 2);
                const x = i * sliceWidth;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.strokeStyle = "#5C2BE2";
            ctx.lineWidth = 2;
            ctx.stroke();
            if (audioRef.current) {
                const progress = audioRef.current.currentTime / audioDuration;
                const xPos = progress * width;
                ctx.beginPath();
                ctx.moveTo(xPos, 0);
                ctx.lineTo(xPos, height);
                ctx.strokeStyle = "red";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        };

        let animationFrameId;
        const animate = () => {
            drawWaveform();
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, [waveformData, audioDuration]);

    const handleDownloadAudio = async () => {
        const baseName = audioName.replace(/\.[^/.]+$/, "");
        const alertResult = await showDialog({
            title: "Select Audio Type",
            message: "Select the audio type to export.",
            inputs: [
                {
                    name: "fileType",
                    type: "select",
                    label: "Audio Type",
                    defaultValue: "webm",
                    options: [
                        { label: ".webm", value: "webm" },
                        { label: ".mp3", value: "mp3" },
                        { label: ".wav", value: "wav" }
                    ]
                }
            ],
            showCancel: true
        });
        if (!alertResult) return;
        const fileType = alertResult.fileType;
        const finalName = baseName + "." + fileType;
        const audioElem = audioRef.current;
        if (!audioElem) return;
        audioElem.pause();
        audioElem.currentTime = 0;
        await new Promise((res) => {
            const onSeeked = () => {
                audioElem.removeEventListener("seeked", onSeeked);
                res();
            };
            audioElem.addEventListener("seeked", onSeeked);
        });
        const stream = audioElem.captureStream();
        const recorder = new MediaRecorder(stream);
        const chunks = [];
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };
        recorder.onstop = () => {
            const finalBlob = new Blob(chunks, { type: "audio/webm" });
            const downloadUrl = URL.createObjectURL(finalBlob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = finalName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        recorder.start();
        audioElem.play();
        const checkIfDone = () => {
            if (!audioElem || audioElem.currentTime >= audioElem.duration - 0.1) {
                setTimeout(() => {
                    recorder.stop();
                    audioElem.pause();
                }, 50);
                return;
            }
            requestAnimationFrame(checkIfDone);
        };
        requestAnimationFrame(checkIfDone);
    };

    return (
        <div className="dinolabsIDEMediaContentWrapper">
            <div className="dinoLabsIDEMediaToolBar">
                <div className="dinolabsIDEMediaCellWrapper">
                    <div className="dinolabsIDEMediaHeaderFlex">
                        <label className="dinolabsIDEMediaCellTitle">
                            <FontAwesomeIcon icon={faHeadphones} />
                            Audio
                        </label>
                        <div className="dinolabsIDEMediaCellFlexSupplement">
                            <Tippy content="Download Audio" theme="tooltip-light">
                                <button onClick={handleDownloadAudio} className="dinolabsIDEMediaToolButtonHeader">
                                    <FontAwesomeIcon icon={faDownload} />
                                </button>
                            </Tippy>
                            <Tippy content="Reset Audio" theme="tooltip-light">
                                <button
                                    onClick={() => {
                                        if (audioRef.current) {
                                            audioRef.current.src = url;
                                            audioRef.current.load();
                                            setIsPlaying(false);
                                            setIsLooping(false);
                                        }
                                    }}
                                    className="dinolabsIDEMediaToolButtonHeader"
                                >
                                    <FontAwesomeIcon icon={faArrowsRotate} />
                                </button>
                            </Tippy>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">
                            Volume
                        </label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button onClick={() => setVolume((prev) => Math.max(prev - 10, 0))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={(e) => setVolume(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button onClick={() => setVolume((prev) => Math.min(prev + 10, 100))} className="dinolabsIDEMediaToolButton">
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="dinolabsIDEMediaContainerWrapper">
                <div className="dinolabsIDEMediaContainer" style={{ height: "90%" }}>
                    <audio
                        src={url}
                        ref={audioRef}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => {
                            if (isLooping) {
                                audioRef.current.play();
                            } else {
                                setIsPlaying(false);
                            }
                        }}
                        style={{ display: "none" }}
                    />
                    <canvas
                        ref={canvasRef}
                        width={1000}
                        height={200}
                        style={{ width: "100%", height: "100%" }}
                    />
                </div>
                <div className="dinolabsIDEVideoInputBottomBar">
                    <div className="dinolabsIDEVideoContentFlexBig">
                        <Tippy content="Rewind 5 Seconds" theme="tooltip-light">
                            <button onClick={() => skipBackward(5)} className="dinolabsIDEVideoButtonSupplementLeading">
                                <FontAwesomeIcon icon={faBackward} />
                            </button>
                        </Tippy>
                        <Tippy content={isPlaying ? "Pause" : "Play"} theme="tooltip-light">
                            <button onClick={togglePlay} className="dinolabsIDEVideoButton">
                                <FontAwesomeIcon icon={isPlaying ? faStop : faPlay} />
                            </button>
                        </Tippy>
                        <Tippy content="Loop" theme="tooltip-light">
                            <button
                                onClick={toggleLoop}
                                className="dinolabsIDEVideoButton"
                                style={{ color: isLooping ? "#5C2BE2" : "" }}
                            >
                                <FontAwesomeIcon icon={faRepeat} />
                            </button>
                        </Tippy>
                        <Tippy content="Skip 5 Seconds" theme="tooltip-light">
                            <button onClick={() => skipForward(5)} className="dinolabsIDEVideoButtonSupplementTrailing">
                                <FontAwesomeIcon icon={faForward} />
                            </button>
                        </Tippy>
                        {[0.5, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                            <Tippy key={rate} content={`${rate}x Playback`} theme="tooltip-light">
                                <button
                                    className="dinolabsIDEVideoButtonX"
                                    onClick={() => setPlaybackRateHandler(rate)}
                                    style={{
                                        color: currentPlaybackRate === rate ? "#5C2BE2" : ""
                                    }}
                                >
                                    {rate}x
                                </button>
                            </Tippy>
                        ))}
                    </div>
                    <div className="dinolabsIDEVideoContentFlexSmall" style={{ justifyContent: "flex-start" }}>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DinoLabsIDEAudioEditor;
