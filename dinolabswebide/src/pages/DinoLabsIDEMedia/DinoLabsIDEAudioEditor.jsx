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
    faBackward,
    faForward,
    faStop,
    faPlay,
    faHeadphones,
    faGaugeHigh,
    faKeyboard,
    faWandMagicSparkles,
    faMicrophoneLines,
    faSliders
} from '@fortawesome/free-solid-svg-icons';

function encodeWav(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.length * numChannels * 2;
    const buffer = new ArrayBuffer(44 + samples);
    const view = new DataView(buffer);

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + samples, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, samples, true);

    let offset = 44;
    const channelData = [];
    for (let c = 0; c < numChannels; c++) {
        channelData.push(audioBuffer.getChannelData(c));
    }
    const len = audioBuffer.length;
    for (let i = 0; i < len; i++) {
        for (let c = 0; c < numChannels; c++) {
            let val = Math.max(-1, Math.min(1, channelData[c][i]));
            val = val < 0 ? val * 32768 : val * 32767;
            view.setInt16(offset, val, true);
            offset += 2;
        }
    }

    return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}

function createReverbImpulseResponse(audioCtx, duration, decay, reverse) {
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioCtx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
        const impulseChannelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            const n = reverse ? length - i : i;
            impulseChannelData[i] =
                (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        }
    }
    return impulse;
}

function DinoLabsIDEAudioEditor({ fileHandle }) {
    const [url, setUrl] = useState(null);
    const [audioName, setAudioName] = useState("audio");
    const [originalFileSize, setOriginalFileSize] = useState(null);
    const audioRef = useRef(null);
    const waveformCanvasRef = useRef(null);
    const spectrogramSetupRef = useRef(null);
    const frequencyBarsCanvasRef = useRef(null);
    const frequencyBarsSetupRef = useRef(null);
    const oscilloscopeCanvasRef = useRef(null);
    const oscilloscopeSetupRef = useRef(null);
    const loudnessCanvasRef = useRef(null);
    const loudnessSetupRef = useRef(null);
    const stereoLeftCanvasRef = useRef(null);
    const stereoLeftSetupRef = useRef(null);
    const stereoRightCanvasRef = useRef(null);
    const stereoRightSetupRef = useRef(null);
    const phaseScopeCanvasRef = useRef(null);
    const phaseScopeSetupRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isLooping, setIsLooping] = useState(true);
    const [currentPlaybackRate, setCurrentPlaybackRate] = useState(1.0);
    const [volume, setVolume] = useState(100);
    const [audioDuration, setAudioDuration] = useState(0);
    const [waveformData, setWaveformData] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const [bass, setBass] = useState(0);
    const [mid, setMid] = useState(0);
    const [treble, setTreble] = useState(0);
    const [vocalBoost, setVocalBoost] = useState(0);
    const [vocalIsolation, setVocalIsolation] = useState(4);
    const [echo, setEcho] = useState(0);
    const [reverb, setReverb] = useState(0);
    const [pitchShift, setPitchShift] = useState(0);

    const [attack, setAttack] = useState(5.0);
    const [decay, setDecay] = useState(5.0);
    const [sustain, setSustain] = useState(0.1);
    const [release, setRelease] = useState(5.0);
    const reverbBufferRef = useRef(null);

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
                const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
                    1,
                    44100 * 40,
                    44100
                );
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
                return;
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
            releaseEnvelope();
            audioRef.current.pause();
        } else {
            applyEnvelope();
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleLoop = () => {
        if (!audioRef.current) return;
        setIsLooping(!isLooping);
    };

    const setPlaybackRateHandler = (rate) => {
        if (audioRef.current) {
            audioRef.current.playbackRate = rate * Math.pow(2, pitchShift / 12);
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
            audioRef.current.currentTime = Math.max(
                0,
                audioRef.current.currentTime - seconds
            );
        }
    };

    useEffect(() => {
        if (!audioRef.current) return;
        const ratio = Math.pow(2, pitchShift / 12);
        audioRef.current.playbackRate = currentPlaybackRate * ratio;
    }, [pitchShift, currentPlaybackRate]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    const setTimeFromMouse = (e) => {
        if (!audioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const fraction = x / rect.width;
        audioRef.current.currentTime = fraction * audioRef.current.duration;
    };

    const handleWaveformMouseDown = (e) => {
        setIsDragging(true);
        setTimeFromMouse(e);
    };

    const handleWaveformMouseMove = (e) => {
        if (isDragging) {
            setTimeFromMouse(e);
        }
    };

    const handleWaveformMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const canvas = waveformCanvasRef.current;
        if (!canvas || waveformData.length === 0) return;
        const ctx = canvas.getContext("2d");
        const maxVal = Math.max(...waveformData);
        let animationFrameId;
    
        function drawWaveform() {
            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const dpr = window.devicePixelRatio || 1;
            const centerY = height / 2;
            const scaleFactor = 0.6; 
    
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, width, height);
    
            const sliceWidth = width / waveformData.length;
            ctx.beginPath();
            ctx.moveTo(0, centerY);

            for (let i = 0; i < waveformData.length; i++) {
                const amplitude = waveformData[i] / maxVal;
                const scaled = amplitude * centerY * scaleFactor;
                const x = i * sliceWidth;
                const y = centerY - scaled;
                ctx.lineTo(x, y);
            }
    
            for (let i = waveformData.length - 1; i >= 0; i--) {
                const amplitude = waveformData[i] / maxVal;
                const scaled = amplitude * centerY * scaleFactor;
                const x = i * sliceWidth;
                const y = centerY + scaled;
                ctx.lineTo(x, y);
            }
    
            ctx.closePath();
            ctx.fillStyle = "rgba(0, 255, 215, 0.4)";
            ctx.fill();
    
            ctx.strokeStyle = "rgba(0, 255, 215, 1)";
            ctx.lineWidth = 1;
            ctx.stroke();
    
            if (audioRef.current) {
                const progress = audioRef.current.currentTime / audioDuration;
                const xPos = progress * width;
                ctx.beginPath();
                ctx.moveTo(xPos, 0);
                ctx.lineTo(xPos, height);
                ctx.strokeStyle = "rgba(0, 255, 215, 0.8)";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
    
            animationFrameId = requestAnimationFrame(drawWaveform);
        }
    
        drawWaveform();
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [waveformData, audioDuration]);

    useEffect(() => {
        if (!audioRef.current || audioDuration <= 0) return;
        if (spectrogramSetupRef.current) return;

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let source;
        try {
            source = audioCtx.createMediaElementSource(audioRef.current);
        } catch (err) {
            return;
        }

        if (!reverbBufferRef.current) {
            reverbBufferRef.current = createReverbImpulseResponse(audioCtx, 5, 3, false);
        }

        const analyserMaster = audioCtx.createAnalyser();
        analyserMaster.fftSize = 2048;
        analyserMaster.smoothingTimeConstant = 0.9;

        const envelopeGainNode = audioCtx.createGain();
        envelopeGainNode.gain.value = 0.0001;

        analyserMaster.connect(audioCtx.destination);

        const bassFilter = audioCtx.createBiquadFilter();
        bassFilter.type = "lowshelf";
        bassFilter.frequency.value = 200;
        bassFilter.gain.value = 0;

        const midFilter = audioCtx.createBiquadFilter();
        midFilter.type = "peaking";
        midFilter.frequency.value = 1000;
        midFilter.gain.value = 0;
        midFilter.Q.value = 1;

        const trebleFilter = audioCtx.createBiquadFilter();
        trebleFilter.type = "highshelf";
        trebleFilter.frequency.value = 3000;
        trebleFilter.gain.value = 0;

        const bandStopFilter = audioCtx.createBiquadFilter();
        bandStopFilter.type = "peaking";
        bandStopFilter.gain.value = -30;
        bandStopFilter.frequency.value = 1200;
        bandStopFilter.Q.value = 4;

        const vocalFilter = audioCtx.createBiquadFilter();
        vocalFilter.type = "bandpass";
        vocalFilter.frequency.value = 1200;
        vocalFilter.Q.value = 4;

        const vocalGainNode = audioCtx.createGain();
        vocalGainNode.gain.value = 1;

        const preEffectMix = audioCtx.createGain();

        source.connect(bassFilter);
        bassFilter.connect(midFilter);
        midFilter.connect(trebleFilter);
        trebleFilter.connect(bandStopFilter);
        bandStopFilter.connect(preEffectMix);

        trebleFilter.connect(vocalFilter);
        vocalFilter.connect(vocalGainNode);
        vocalGainNode.connect(preEffectMix);

        const finalMix = audioCtx.createGain();
        preEffectMix.connect(finalMix);

        const delayNode = audioCtx.createDelay();
        delayNode.delayTime.value = 0.3;

        const delayFeedbackGain = audioCtx.createGain();
        delayFeedbackGain.gain.value = 0;
        delayNode.connect(delayFeedbackGain);
        delayFeedbackGain.connect(delayNode);

        const echoMixGain = audioCtx.createGain();
        echoMixGain.gain.value = 0;
        preEffectMix.connect(delayNode);
        delayNode.connect(echoMixGain);
        echoMixGain.connect(finalMix);

        const convolverNode = audioCtx.createConvolver();
        convolverNode.buffer = reverbBufferRef.current;

        const reverbMixGain = audioCtx.createGain();
        reverbMixGain.gain.value = 0;
        preEffectMix.connect(convolverNode);
        convolverNode.connect(reverbMixGain);
        reverbMixGain.connect(finalMix);

        finalMix.connect(envelopeGainNode);
        envelopeGainNode.connect(analyserMaster);

        const freqAnalyser = audioCtx.createAnalyser();
        freqAnalyser.fftSize = 2048;
        freqAnalyser.smoothingTimeConstant = 0.9;
        source.connect(freqAnalyser);

        const loudnessAnalyser = audioCtx.createAnalyser();
        loudnessAnalyser.fftSize = 1024;
        source.connect(loudnessAnalyser);

        const oscAnalyser = audioCtx.createAnalyser();
        oscAnalyser.fftSize = 1024;
        oscAnalyser.smoothingTimeConstant = 0.9;
        source.connect(oscAnalyser);

        const channelSplitter = audioCtx.createChannelSplitter(2);
        source.connect(channelSplitter);

        const leftAnalyser = audioCtx.createAnalyser();
        leftAnalyser.fftSize = 1024;
        const rightAnalyser = audioCtx.createAnalyser();
        rightAnalyser.fftSize = 1024;

        channelSplitter.connect(leftAnalyser, 0);
        channelSplitter.connect(rightAnalyser, 1);

        spectrogramSetupRef.current = {
            audioCtx,
            source,
            analyserMaster,
            freqAnalyser,
            loudnessAnalyser,
            oscAnalyser,
            channelSplitter,
            leftAnalyser,
            rightAnalyser,
            envelopeGainNode,
            bassFilter,
            midFilter,
            trebleFilter,
            bandStopFilter,
            vocalFilter,
            vocalGainNode,
            preEffectMix,
            finalMix,
            delayNode,
            delayFeedbackGain,
            echoMixGain,
            convolverNode,
            reverbMixGain
        };

        return () => {
            try {
                if (source) source.disconnect();
                freqAnalyser?.disconnect();
                loudnessAnalyser?.disconnect();
                oscAnalyser?.disconnect();
                channelSplitter?.disconnect();
                leftAnalyser?.disconnect();
                rightAnalyser?.disconnect();
                bassFilter?.disconnect();
                midFilter?.disconnect();
                trebleFilter?.disconnect();
                bandStopFilter?.disconnect();
                vocalFilter?.disconnect();
                vocalGainNode?.disconnect();
                delayNode?.disconnect();
                delayFeedbackGain?.disconnect();
                echoMixGain?.disconnect();
                convolverNode?.disconnect();
                reverbMixGain?.disconnect();
                preEffectMix?.disconnect();
                finalMix?.disconnect();
                analyserMaster?.disconnect();
                if (spectrogramSetupRef.current?.audioCtx.state !== "closed") {
                    spectrogramSetupRef.current.audioCtx.close();
                }
            } catch (err) {
                return;
            }
            spectrogramSetupRef.current = null;
        };
    }, [audioDuration]);

    const applyEnvelope = () => {
        if (!spectrogramSetupRef.current) return;
        const { audioCtx, envelopeGainNode } = spectrogramSetupRef.current;
        if (!audioCtx || !envelopeGainNode) return;

        const now = audioCtx.currentTime;
        envelopeGainNode.gain.cancelScheduledValues(now);
        envelopeGainNode.gain.setValueAtTime(0.0001, now);
        envelopeGainNode.gain.exponentialRampToValueAtTime(1, now + attack);

        const endOfDecay = now + attack + decay;
        let sustainLevel = sustain;
        if (sustainLevel < 0.0001) sustainLevel = 0.0001;
        envelopeGainNode.gain.exponentialRampToValueAtTime(sustainLevel, endOfDecay);
    };

    const releaseEnvelope = () => {
        if (!spectrogramSetupRef.current) return;
        const { audioCtx, envelopeGainNode } = spectrogramSetupRef.current;
        if (!audioCtx || !envelopeGainNode) return;

        const now = audioCtx.currentTime;
        envelopeGainNode.gain.cancelScheduledValues(now);
        const currentVal = envelopeGainNode.gain.value < 0.0001
            ? 0.0001
            : envelopeGainNode.gain.value;
        envelopeGainNode.gain.setValueAtTime(currentVal, now);
        envelopeGainNode.gain.exponentialRampToValueAtTime(0.0001, now + release);
    };

    useEffect(() => {
        if (isPlaying) {
            applyEnvelope();
        }
    }, [attack, decay, sustain, release, isPlaying]);

    useEffect(() => {
        if (!spectrogramSetupRef.current) return;
        spectrogramSetupRef.current.bassFilter.gain.value = bass;
    }, [bass]);

    useEffect(() => {
        if (!spectrogramSetupRef.current) return;
        spectrogramSetupRef.current.midFilter.gain.value = mid;
    }, [mid]);

    useEffect(() => {
        if (!spectrogramSetupRef.current) return;
        spectrogramSetupRef.current.trebleFilter.gain.value = treble;
    }, [treble]);

    useEffect(() => {
        if (!spectrogramSetupRef.current) return;
        spectrogramSetupRef.current.vocalGainNode.gain.value = Math.pow(10, vocalBoost / 20);
    }, [vocalBoost]);

    useEffect(() => {
        if (!spectrogramSetupRef.current) return;
        spectrogramSetupRef.current.vocalFilter.Q.value = vocalIsolation;
        spectrogramSetupRef.current.bandStopFilter.Q.value = vocalIsolation;
    }, [vocalIsolation]);

    useEffect(() => {
        if (!spectrogramSetupRef.current) return;
        const { delayFeedbackGain, echoMixGain } = spectrogramSetupRef.current;
        const echoVal = echo / 100;
        delayFeedbackGain.gain.value = echoVal;
        echoMixGain.gain.value = echoVal;
    }, [echo]);

    useEffect(() => {
        if (!spectrogramSetupRef.current) return;
        spectrogramSetupRef.current.reverbMixGain.gain.value = reverb / 100;
    }, [reverb]);

    useEffect(() => {
        if (!audioRef.current || audioDuration <= 0) return;
        if (!spectrogramSetupRef.current) return;
        if (frequencyBarsSetupRef.current) return;

        const freqAnalyser = spectrogramSetupRef.current.freqAnalyser;
        if (!freqAnalyser) return;

        const canvas = frequencyBarsCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const bufferLength = freqAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let animationFrameId;

        function drawFrequencyBars() {
            freqAnalyser.getByteFrequencyData(dataArray);

            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            ctx.clearRect(0, 0, rect.width, rect.height);
            const barWidth = rect.width / bufferLength;

            for (let i = 0; i < bufferLength; i++) {
                const magnitude = dataArray[i] / 255;
                const barHeight = magnitude * rect.height;
                ctx.fillStyle = `hsl(${magnitude * 240}, 100%, 50%)`;
                ctx.fillRect(
                    i * barWidth,
                    rect.height - barHeight,
                    barWidth,
                    barHeight
                );
            }

            animationFrameId = requestAnimationFrame(drawFrequencyBars);
        }

        drawFrequencyBars();
        frequencyBarsSetupRef.current = { animationFrameId };

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            frequencyBarsSetupRef.current = null;
        };
    }, [audioDuration]);

    useEffect(() => {
        if (!audioRef.current || audioDuration <= 0) return;
        if (!spectrogramSetupRef.current) return;
        if (oscilloscopeSetupRef.current) return;

        const oscAnalyser = spectrogramSetupRef.current.oscAnalyser;
        if (!oscAnalyser) return;

        const canvas = oscilloscopeCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const bufferLength = oscAnalyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        const handleDraw = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            ctx.clearRect(0, 0, rect.width, rect.height);

            const thresholds = [0.25, 0.5, 0.75];
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = "rgba(83, 232, 209, 0.3)";

            thresholds.forEach((t) => {
                const yPos = rect.height / 2 - t * (rect.height / 2);
                ctx.beginPath();
                ctx.moveTo(0, yPos);
                ctx.lineTo(rect.width, yPos);
                ctx.stroke();

                const yNeg = rect.height / 2 + t * (rect.height / 2);
                ctx.beginPath();
                ctx.moveTo(0, yNeg);
                ctx.lineTo(rect.width, yNeg);
                ctx.stroke();
            });

            ctx.setLineDash([]);

            oscAnalyser.getByteTimeDomainData(dataArray);

            ctx.beginPath();
            const sliceWidth = rect.width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = (dataArray[i] - 128) / 128;
                const y = (v * rect.height) / 2 + rect.height / 2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                x += sliceWidth;
            }

            ctx.lineTo(rect.width, rect.height / 2);
            ctx.strokeStyle = "rgba(83, 232, 209, 1.0)";
            ctx.lineWidth = 1;
            ctx.stroke();

            requestAnimationFrame(handleDraw);
        };

        handleDraw();
        oscilloscopeSetupRef.current = { running: true };

        return () => {
            oscilloscopeSetupRef.current = null;
        };
    }, [audioDuration]);

    useEffect(() => {
        if (!audioRef.current || audioDuration <= 0) return;
        if (!spectrogramSetupRef.current) return;
        if (loudnessSetupRef.current) return;

        const loudnessAnalyser = spectrogramSetupRef.current.loudnessAnalyser;
        if (!loudnessAnalyser) return;

        const dataArray = new Uint8Array(loudnessAnalyser.fftSize);
        const canvas = loudnessCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const totalBars = 20;

        const drawLoudness = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            loudnessAnalyser.getByteTimeDomainData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const val = dataArray[i] - 128;
                sum += val * val;
            }
            let rms = (Math.sqrt(sum / dataArray.length) / 128) * 4;
            if (rms > 1) rms = 1;

            const activeBars = Math.floor(rms * totalBars);

            ctx.clearRect(0, 0, rect.width, rect.height);

            const barHeight = rect.height / totalBars;

            for (let i = 0; i < totalBars; i++) {
                const y = rect.height - (i + 1) * barHeight;
                if (i < activeBars) {
                    const ratio = i / (totalBars - 1);
                    const hue = 160 + ratio * 20;
                    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                } else {
                    ctx.fillStyle = "#444";
                }
                ctx.fillRect(0, y, rect.width, barHeight - 1);
            }

            requestAnimationFrame(drawLoudness);
        };

        drawLoudness();
        loudnessSetupRef.current = { running: true };

        return () => {
            loudnessSetupRef.current = null;
        };
    }, [audioDuration]);

    useEffect(() => {
        if (!audioRef.current || audioDuration <= 0) return;
        if (!spectrogramSetupRef.current) return;
        if (stereoLeftSetupRef.current) return;

        const { leftAnalyser } = spectrogramSetupRef.current;
        if (!leftAnalyser) return;

        const canvas = stereoLeftCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const dataArray = new Uint8Array(leftAnalyser.fftSize);
        const totalBars = 20;

        const drawLeftMeter = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            leftAnalyser.getByteTimeDomainData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const val = dataArray[i] - 128;
                sum += val * val;
            }
            let rmsLeft = (Math.sqrt(sum / dataArray.length) / 128) * 4;
            if (rmsLeft > 1) rmsLeft = 1;

            const activeBarsLeft = Math.floor(rmsLeft * totalBars);

            ctx.clearRect(0, 0, rect.width, rect.height);

            const barHeight = rect.height / totalBars;

            for (let i = 0; i < totalBars; i++) {
                const y = rect.height - (i + 1) * barHeight;
                if (i < activeBarsLeft) {
                    const ratio = i / (totalBars - 1);
                    const hue = 150 + ratio * 20;
                    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                } else {
                    ctx.fillStyle = "#444";
                }
                ctx.fillRect(0, y, rect.width, barHeight - 1);
            }

            requestAnimationFrame(drawLeftMeter);
        };

        drawLeftMeter();
        stereoLeftSetupRef.current = { running: true };

        return () => {
            stereoLeftSetupRef.current = null;
        };
    }, [audioDuration]);

    useEffect(() => {
        if (!audioRef.current || audioDuration <= 0) return;
        if (!spectrogramSetupRef.current) return;
        if (stereoRightSetupRef.current) return;

        const { rightAnalyser } = spectrogramSetupRef.current;
        if (!rightAnalyser) return;

        const canvas = stereoRightCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const dataArray = new Uint8Array(rightAnalyser.fftSize);
        const totalBars = 20;

        const drawRightMeter = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            rightAnalyser.getByteTimeDomainData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const val = dataArray[i] - 128;
                sum += val * val;
            }
            let rmsRight = (Math.sqrt(sum / dataArray.length) / 128) * 4;
            if (rmsRight > 1) rmsRight = 1;

            const activeBarsRight = Math.floor(rmsRight * totalBars);

            ctx.clearRect(0, 0, rect.width, rect.height);

            const barHeight = rect.height / totalBars;

            for (let i = 0; i < totalBars; i++) {
                const y = rect.height - (i + 1) * barHeight;
                if (i < activeBarsRight) {
                    const ratio = i / (totalBars - 1);
                    const hue = 170 + ratio * 20;
                    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                } else {
                    ctx.fillStyle = "#444";
                }
                ctx.fillRect(0, y, rect.width, barHeight - 1);
            }

            requestAnimationFrame(drawRightMeter);
        };

        drawRightMeter();
        stereoRightSetupRef.current = { running: true };

        return () => {
            stereoRightSetupRef.current = null;
        };
    }, [audioDuration]);

    useEffect(() => {
        if (!audioRef.current || audioDuration <= 0) return;
        if (!spectrogramSetupRef.current) return;
        if (phaseScopeSetupRef.current) return;

        const { leftAnalyser, rightAnalyser } = spectrogramSetupRef.current;
        if (!leftAnalyser || !rightAnalyser) return;

        const canvas = phaseScopeCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const bufferLength = leftAnalyser.fftSize;
        const leftData = new Uint8Array(bufferLength);
        const rightData = new Uint8Array(bufferLength);

        const drawPhaseScope = () => {
            leftAnalyser.getByteTimeDomainData(leftData);
            rightAnalyser.getByteTimeDomainData(rightData);

            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            ctx.clearRect(0, 0, rect.width, rect.height);

            ctx.strokeStyle = "rgba(100, 100, 100, 0.2)";
            ctx.beginPath();
            ctx.moveTo(0, rect.height / 2);
            ctx.lineTo(rect.width, rect.height / 2);
            ctx.moveTo(rect.width / 2, 0);
            ctx.lineTo(rect.width / 2, rect.height);
            ctx.stroke();

            ctx.fillStyle = "rgba(0, 255, 215, 0.7)";
            for (let i = 0; i < bufferLength; i += 2) {
                const xVal = (leftData[i] - 128) / 128;
                const yVal = (rightData[i] - 128) / 128;
                const xPos = xVal * (rect.width / 2) + rect.width / 2;
                const yPos = yVal * (rect.height / 2) + rect.height / 2;
                ctx.fillRect(xPos, yPos, 1.5, 1.5);
            }

            requestAnimationFrame(drawPhaseScope);
        };

        drawPhaseScope();
        phaseScopeSetupRef.current = { running: true };

        return () => {
            phaseScopeSetupRef.current = null;
        };
    }, [audioDuration]);

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
                    defaultValue: "wav",
                    options: [
                        { label: ".wav", value: "wav" },
                        { label: ".mp3", value: "mp3" },
                        { label: ".flac", value: "flac" }
                    ]
                }
            ],
            showCancel: true
        });
        if (!alertResult) return;

        const fileType = alertResult.fileType;
        const finalName = baseName + "." + fileType;

        if (!spectrogramSetupRef.current) return;
        const liveCtx = spectrogramSetupRef.current.audioCtx;
        if (!liveCtx) return;

        const durationSeconds = audioRef.current?.duration || 10;
        const sampleRate = liveCtx.sampleRate || 44100;
        const offlineCtx = new OfflineAudioContext(
            2,
            Math.ceil(durationSeconds * sampleRate),
            sampleRate
        );

        const file =
            typeof fileHandle.getFile === "function"
                ? await fileHandle.getFile()
                : fileHandle;
        const fileArrayBuffer = await file.arrayBuffer();
        const audioBuffer = await offlineCtx.decodeAudioData(fileArrayBuffer);

        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;

        let convBuffer = reverbBufferRef.current;
        if (!convBuffer) {
            convBuffer = createReverbImpulseResponse(offlineCtx, 5, 3, false);
        }
        const convolverNode = offlineCtx.createConvolver();
        convolverNode.buffer = convBuffer;
        const reverbMixGain = offlineCtx.createGain();
        reverbMixGain.gain.value = reverb / 100;

        const envelopeGainNode = offlineCtx.createGain();
        envelopeGainNode.gain.value = 1;

        const bassFilter = offlineCtx.createBiquadFilter();
        bassFilter.type = "lowshelf";
        bassFilter.frequency.value = 200;
        bassFilter.gain.value = bass;

        const midFilter = offlineCtx.createBiquadFilter();
        midFilter.type = "peaking";
        midFilter.frequency.value = 1000;
        midFilter.gain.value = mid;
        midFilter.Q.value = 1;

        const trebleFilter = offlineCtx.createBiquadFilter();
        trebleFilter.type = "highshelf";
        trebleFilter.frequency.value = 3000;
        trebleFilter.gain.value = treble;

        const bandStopFilter = offlineCtx.createBiquadFilter();
        bandStopFilter.type = "peaking";
        bandStopFilter.gain.value = -30;
        bandStopFilter.frequency.value = 1200;
        bandStopFilter.Q.value = vocalIsolation;

        const vocalFilter = offlineCtx.createBiquadFilter();
        vocalFilter.type = "bandpass";
        vocalFilter.frequency.value = 1200;
        vocalFilter.Q.value = vocalIsolation;

        const vocalGainNode = offlineCtx.createGain();
        vocalGainNode.gain.value = Math.pow(10, vocalBoost / 20);

        const preEffectMix = offlineCtx.createGain();
        const finalMix = offlineCtx.createGain();

        const delayNode = offlineCtx.createDelay();
        delayNode.delayTime.value = 0.3;

        const delayFeedbackGain = offlineCtx.createGain();
        delayFeedbackGain.gain.value = echo / 100;
        delayNode.connect(delayFeedbackGain);
        delayFeedbackGain.connect(delayNode);

        const echoMixGain = offlineCtx.createGain();
        echoMixGain.gain.value = echo / 100;

        source.connect(bassFilter);
        bassFilter.connect(midFilter);
        midFilter.connect(trebleFilter);
        trebleFilter.connect(bandStopFilter);
        bandStopFilter.connect(preEffectMix);

        trebleFilter.connect(vocalFilter);
        vocalFilter.connect(vocalGainNode);
        vocalGainNode.connect(preEffectMix);

        preEffectMix.connect(finalMix);

        preEffectMix.connect(delayNode);
        delayNode.connect(echoMixGain);
        echoMixGain.connect(finalMix);

        preEffectMix.connect(convolverNode);
        convolverNode.connect(reverbMixGain);
        reverbMixGain.connect(finalMix);

        finalMix.connect(envelopeGainNode);
        envelopeGainNode.connect(offlineCtx.destination);

        envelopeGainNode.gain.setValueAtTime(0.0001, 0);
        envelopeGainNode.gain.exponentialRampToValueAtTime(1, attack);
        envelopeGainNode.gain.exponentialRampToValueAtTime(
            Math.max(sustain, 0.0001),
            attack + decay
        );

        const totalDur = audioBuffer.duration;
        const fadeStart = totalDur - release;
        if (fadeStart > attack + decay) {
            envelopeGainNode.gain.setValueAtTime(
                Math.max(sustain, 0.0001),
                fadeStart
            );
            envelopeGainNode.gain.exponentialRampToValueAtTime(
                0.0001,
                fadeStart + release
            );
        }

        source.playbackRate.value = Math.pow(2, pitchShift / 12);
        source.start(0);

        const renderedBuffer = await offlineCtx.startRendering();
        const wavBlob = encodeWav(renderedBuffer);

        const downloadUrl = URL.createObjectURL(wavBlob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = finalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
    };

    const handleResetAll = () => {
        if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.load();
            audioRef.current.playbackRate = 1.0;
        }
        setIsPlaying(false);
        setIsLooping(false);
        setVolume(100);
        setBass(0);
        setMid(0);
        setTreble(0);
        setVocalBoost(0);
        setVocalIsolation(4);
        setEcho(0);
        setReverb(0);
        setPitchShift(0);
        setCurrentPlaybackRate(1.0);
        setAttack(5.0);
        setDecay(5.0);
        setSustain(0.1);
        setRelease(5.0);
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
                            <Tippy content="Download Audio (Offline Render)" theme="tooltip-light">
                                <button onClick={handleDownloadAudio} className="dinolabsIDEMediaToolButtonHeader">
                                    <FontAwesomeIcon icon={faDownload} />
                                </button>
                            </Tippy>
                            <Tippy content="Reset All" theme="tooltip-light">
                                <button
                                    onClick={handleResetAll}
                                    className="dinolabsIDEMediaToolButtonHeader"
                                >
                                    <FontAwesomeIcon icon={faArrowsRotate} />
                                </button>
                            </Tippy>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Volume</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setVolume((prev) => Math.max(prev - 10, 0))}
                                className="dinolabsIDEMediaToolButton"
                            >
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
                            <button
                                onClick={() => setVolume((prev) => Math.min(prev + 10, 100))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="dinolabsIDEMediaCellWrapper">
                    <div className="dinolabsIDEMediaHeaderFlex">
                        <label className="dinolabsIDEMediaCellTitle">
                            <FontAwesomeIcon icon={faGaugeHigh} />
                            Pitch
                        </label>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Pitch Shift (semitones)</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setPitchShift((prev) => Math.max(prev - 1, -12))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="-12"
                                    max="12"
                                    value={pitchShift}
                                    onChange={(e) => setPitchShift(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button
                                onClick={() => setPitchShift((prev) => Math.min(prev + 1, 12))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                </div> 
                <div className="dinolabsIDEMediaCellWrapper">
                    <div className="dinolabsIDEMediaHeaderFlex">
                        <label className="dinolabsIDEMediaCellTitle">
                            <FontAwesomeIcon icon={faKeyboard} />
                            EQ
                        </label>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Bass</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setBass((prev) => Math.max(prev - 1, -30))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="-30"
                                    max="30"
                                    value={bass}
                                    onChange={(e) => setBass(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button
                                onClick={() => setBass((prev) => Math.min(prev + 1, 30))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Mid</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setMid((prev) => Math.max(prev - 1, -30))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="-30"
                                    max="30"
                                    value={mid}
                                    onChange={(e) => setMid(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button
                                onClick={() => setMid((prev) => Math.min(prev + 1, 30))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Treble</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setTreble((prev) => Math.max(prev - 1, -30))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="-30"
                                    max="30"
                                    value={treble}
                                    onChange={(e) => setTreble(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button
                                onClick={() => setTreble((prev) => Math.min(prev + 1, 30))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="dinolabsIDEMediaCellWrapper">
                    <div className="dinolabsIDEMediaHeaderFlex">
                        <label className="dinolabsIDEMediaCellTitle">
                            <FontAwesomeIcon icon={faWandMagicSparkles} />
                            Effects
                        </label>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Echo</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setEcho((prev) => Math.max(prev - 5, 0))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={echo}
                                    onChange={(e) => setEcho(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button
                                onClick={() => setEcho((prev) => Math.min(prev + 5, 100))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Reverb</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setReverb((prev) => Math.max(prev - 5, 0))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={reverb}
                                    onChange={(e) => setReverb(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button
                                onClick={() => setReverb((prev) => Math.min(prev + 5, 100))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="dinolabsIDEMediaCellWrapper">
                    <div className="dinolabsIDEMediaHeaderFlex">
                        <label className="dinolabsIDEMediaCellTitle">
                            <FontAwesomeIcon icon={faMicrophoneLines} />
                            Vocals
                        </label>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Vocal Boost (dB)</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setVocalBoost((prev) => Math.max(prev - 1, -30))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    min="-30"
                                    max="30"
                                    value={vocalBoost}
                                    onChange={(e) => setVocalBoost(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button
                                onClick={() => setVocalBoost((prev) => Math.min(prev + 1, 30))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Vocal Isolation (Q)</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setVocalIsolation((prev) => Math.max(prev - 0.1, 0.5))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    step="0.1"
                                    min="0.5"
                                    max="20"
                                    value={vocalIsolation}
                                    onChange={(e) => setVocalIsolation(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button
                                onClick={() => setVocalIsolation((prev) => Math.min(prev + 0.1, 20))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="dinolabsIDEMediaCellWrapper">
                    <div className="dinolabsIDEMediaHeaderFlex">
                        <label className="dinolabsIDEMediaCellTitle">
                            <FontAwesomeIcon icon={faSliders} />
                            ADSR
                        </label>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Attack (s)</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setAttack((prev) => Math.max(prev - 1, 0))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    step="1"
                                    min="0"
                                    max="10"
                                    value={attack}
                                    onChange={(e) => setAttack(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button
                                onClick={() => setAttack((prev) => Math.min(prev + 1, 10))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Decay (s)</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setDecay((prev) => Math.max(prev - 1, 0))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    step="1"
                                    min="0"
                                    max="10"
                                    value={decay}
                                    onChange={(e) => setDecay(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button
                                onClick={() => setDecay((prev) => Math.min(prev + 1, 10))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Sustain (gain)</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setSustain((prev) => Math.max(prev - 0.1, 0))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    step="0.1"
                                    min="0"
                                    max="1"
                                    value={sustain}
                                    onChange={(e) => setSustain(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button
                                onClick={() => setSustain((prev) => Math.min(prev + 0.1, 1))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                    <div className="dinolabsIDEMediaCellFlexStack">
                        <label className="dinolabsIDEMediaCellFlexTitle">Release (s)</label>
                        <div className="dinolabsIDEMediaCellFlex">
                            <button
                                onClick={() => setRelease((prev) => Math.max(prev - 1, 0))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <div className="dinolabsIDEMediaSliderWrapper">
                                <input
                                    type="range"
                                    step="1"
                                    min="0"
                                    max="10"
                                    value={release}
                                    onChange={(e) => setRelease(Number(e.target.value))}
                                    className="dinolabsIDESettingsSlider"
                                />
                            </div>
                            <button
                                onClick={() => setRelease((prev) => Math.min(prev + 1, 10))}
                                className="dinolabsIDEMediaToolButton"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="dinolabsIDEMediaContainerWrapper">
                <div className="dinolabsIDEMediaContainer" style={{ height: "90%" }}>
                    <div className="dinolabsIDEMediaContainerInnerStack">
                        <Tippy content="Waveform: X = time (s), Y = amplitude" theme="tooltip-light">
                            <canvas
                                className="dinolabsIDEAudioWaveformDisplayBig"
                                ref={waveformCanvasRef}
                                style={{ "background-color": "rgba(83, 232, 209, 0.3)" }}
                                onMouseDown={handleWaveformMouseDown}
                                onMouseMove={handleWaveformMouseMove}
                                onMouseUp={handleWaveformMouseUp}
                            />
                        </Tippy>

                        <Tippy content="Oscilloscope: X = samples, Y = amplitude" theme="tooltip-light">
                            <canvas
                                className="dinolabsIDEAudioWaveformDisplayBig"
                                ref={oscilloscopeCanvasRef}
                                style={{ "background-color": "#111", "border-top": "none" }}
                            />
                        </Tippy>

                        <div className="dinolabsIDEAudioWaveformDisplayFlex" style={{height: "100%" }}>
                            <Tippy content="Frequency Bars: X = freq, Y = magnitude" theme="tooltip-light">
                                <canvas
                                    className="dinolabsIDEAudioWaveformDisplaySmall"
                                    ref={frequencyBarsCanvasRef}
                                    style={{ width: "95%", height: "100%", "background-color": "#111", "border-top": "none" }}
                                />
                            </Tippy>
                            <Tippy content="Loudness Meter" theme="tooltip-light">
                                <canvas
                                    className="dinolabsIDEAudioWaveformDisplaySmall"
                                    ref={loudnessCanvasRef}
                                    style={{ width: "5%", height: "100%", "background-color": "#111", "border-top": "none", "border-left": "none" }}
                                />
                            </Tippy>
                        </div>
                        <div className="dinolabsIDEAudioWaveformDisplayFlex" style={{height: "100%" }}>
                            <Tippy content="Phase Scope (Left vs. Right)" theme="tooltip-light">
                                <canvas
                                    className="dinolabsIDEAudioWaveformDisplaySmall"
                                    ref={phaseScopeCanvasRef}
                                    style={{ width: "90%", height: "100%", "background-color": "#111", "border-top": "none" }}
                                />
                            </Tippy>
                            <Tippy content="Stereo Left Channel" theme="tooltip-light">
                                <canvas
                                    className="dinolabsIDEAudioWaveformDisplaySmall"
                                    ref={stereoLeftCanvasRef}
                                    style={{ width: "5%", height: "100%", "background-color": "#111", "border-top": "none", "border-left": "none" }}
                                />
                            </Tippy>
                            <Tippy content="Stereo Right Channel" theme="tooltip-light">
                                <canvas
                                    className="dinolabsIDEAudioWaveformDisplaySmall"
                                    ref={stereoRightCanvasRef}
                                    style={{ width: "5%", height: "100%", "background-color": "#111", "border-top": "none", "border-left": "none" }}
                                />
                            </Tippy>
                        </div>
                    </div>
                    <audio
                        src={url}
                        ref={audioRef}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => {
                            if (isLooping && audioRef.current) {
                                audioRef.current.currentTime = 0;
                                applyEnvelope();
                                audioRef.current.play();
                            } else {
                                releaseEnvelope();
                                setTimeout(() => setIsPlaying(false), release * 1000);
                            }
                        }}
                        style={{ display: "none" }}
                    />
                </div>
                <div className="dinolabsIDEVideoInputBottomBar">
                    <div className="dinolabsIDEVideoContentFlexBig">
                        <Tippy content="Rewind 5 Seconds" theme="tooltip-light">
                            <button
                                onClick={() => skipBackward(5)}
                                className="dinolabsIDEVideoButtonSupplementLeading"
                            >
                                <FontAwesomeIcon icon={faBackward} />
                            </button>
                        </Tippy>
                        <Tippy content={isPlaying ? "Pause" : "Play"} theme="tooltip-light">
                            <button
                                onClick={togglePlay}
                                className="dinolabsIDEVideoButton"
                            >
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
                            <button
                                onClick={() => skipForward(5)}
                                className="dinolabsIDEVideoButtonSupplementTrailing"
                            >
                                <FontAwesomeIcon icon={faForward} />
                            </button>
                        </Tippy>
                        {[0.5, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                            <Tippy key={rate} content={`${rate}x Playback`} theme="tooltip-light">
                                <button
                                    className="dinolabsIDEVideoButtonX"
                                    onClick={() => setPlaybackRateHandler(rate)}
                                    style={{ color: currentPlaybackRate === rate ? "#5C2BE2" : "" }}
                                >
                                    {rate}x
                                </button>
                            </Tippy>
                        ))}
                    </div>
                    <div
                        className="dinolabsIDEVideoContentFlexSmall"
                        style={{ justifyContent: "flex-start" }}
                    >
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DinoLabsIDEAudioEditor;
