import { useRef, useState, useEffect } from "react";
import { voiceChat, type VoiceChatResult } from "@/services/voice";

export type VoicePhase = "idle" | "listening" | "thinking" | "speaking" | "error";

interface UseHandsFreeVoiceChatOptions {
  /** Language hint for STT/TTS, e.g. "en-IN". Omit to let the backend auto-detect. */
  languageCode?: string;
  /** Milliseconds of silence before a listening turn auto-submits. */
  silenceMs?: number;
  onResult?: (result: VoiceChatResult) => void;
  onError?: (message: string) => void;
}

/**
 * Drives a full-duplex "ChatGPT voice mode" style loop on top of the /voice/chat
 * endpoint: record -> VAD silence auto-stop -> transcribe+answer+synthesize (backend) ->
 * play response -> resume listening, until exit() is called.
 */
export function useHandsFreeVoiceChat(options: UseHandsFreeVoiceChatOptions = {}) {
  const { languageCode, silenceMs = 1500, onResult, onError } = options;

  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const activeRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const sessionIdRef = useRef<string>("");

  function cleanupMic() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
    }
    audioCtxRef.current = null;
  }

  function stopPlayback() {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }
  }

  function exit() {
    activeRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    cleanupMic();
    stopPlayback();
    setPhase("idle");
    setErrorMessage("");
  }

  async function submitTurn(blob: Blob) {
    setPhase("thinking");
    try {
      const result = await voiceChat(blob, sessionIdRef.current, languageCode);
      onResult?.(result);

      if (!activeRef.current) {
        setPhase("idle");
        return;
      }

      if (result.response_audio) {
        setPhase("speaking");
        const audio = new Audio(`data:audio/wav;base64,${result.response_audio}`);
        audioElRef.current = audio;
        audio.onended = () => {
          audioElRef.current = null;
          if (activeRef.current) listenOnce();
          else setPhase("idle");
        };
        audio.onerror = () => {
          audioElRef.current = null;
          if (activeRef.current) listenOnce();
          else setPhase("idle");
        };
        await audio.play();
      } else {
        listenOnce();
      }
    } catch (err: any) {
      const msg = err?.message || "Voice turn failed";
      setPhase("error");
      setErrorMessage(msg);
      onError?.(msg);
      setTimeout(() => exit(), 2000);
    }
  }

  async function listenOnce() {
    if (!activeRef.current) return;
    setPhase("listening");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      const msg = "Microphone access denied";
      setPhase("error");
      setErrorMessage(msg);
      onError?.(msg);
      setTimeout(() => exit(), 2000);
      return;
    }

    if (!activeRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    streamRef.current = stream;

    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
      if (!activeRef.current) return;
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      if (blob.size > 0) {
        submitTurn(blob);
      } else {
        listenOnce();
      }
    };

    recorder.start();

    // Web Audio VAD: auto-stop the turn after a period of silence.
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      let lastSpeechTime = Date.now();

      const checkSilence = () => {
        if (!activeRef.current || recorder.state !== "recording") return;

        analyser.getByteFrequencyData(buffer);
        const average = buffer.reduce((a, b) => a + b, 0) / buffer.length;

        if (average > 8) {
          lastSpeechTime = Date.now();
        } else if (Date.now() - lastSpeechTime > silenceMs) {
          if (recorder.state === "recording") recorder.stop();
          return;
        }

        requestAnimationFrame(checkSilence);
      };

      setTimeout(() => {
        if (activeRef.current && recorder.state === "recording") checkSilence();
      }, 1000);
    } catch (err) {
      console.error("VAD setup error:", err);
    }
  }

  function start() {
    if (activeRef.current) return;
    activeRef.current = true;
    sessionIdRef.current = crypto.randomUUID();
    setErrorMessage("");
    listenOnce();
  }

  /** Force the current listening turn to submit immediately instead of waiting for silence. */
  function stopListeningNow() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  /** Interrupt playback (barge-in) and resume listening right away. */
  function interrupt() {
    stopPlayback();
    if (activeRef.current) listenOnce();
  }

  // Cleanup on unmount only — `exit` is recreated every render, so this must not
  // be in the dependency array or the mic would be torn down on every re-render.
  const exitRef = useRef(exit);
  exitRef.current = exit;
  useEffect(() => {
    return () => exitRef.current();
  }, []);

  return {
    phase,
    errorMessage,
    isActive: phase !== "idle",
    start,
    exit,
    stopListeningNow,
    interrupt,
  };
}
