import { useState, useEffect, useRef } from "react";
import { 
  Volume2, 
  Mic, 
  MicOff, 
  Languages, 
  FileText, 
  Settings, 
  History, 
  Play, 
  FileAudio, 
  Loader2, 
  Globe 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  getVoiceStatus, 
  transcribeAudio, 
  synthesizeText, 
  translateText, 
  getVoiceSessionHistory,
  type VoiceStatus,
  type VoiceSession 
} from "@/services/voice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VoicePlayground = () => {
  const [activeTab, setActiveTab] = useState("stt");
  const [statusInfo, setStatusInfo] = useState<VoiceStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const { toast } = useToast();

  // STT State
  const [sttFile, setSttFile] = useState<File | null>(null);
  const [sttLang, setSttLang] = useState("en-IN");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // TTS State
  const [ttsText, setTtsText] = useState("");
  const [ttsLang, setTtsLang] = useState("en-IN");
  const [ttsSpeaker, setTtsSpeaker] = useState("shubh");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Translation State
  const [transText, setTransText] = useState("");
  const [transTargetLang, setTransTargetLang] = useState("hi-IN");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedResult, setTranslatedResult] = useState("");

  // History State
  const [sessionId, setSessionId] = useState("default_voice_session");
  const [sessionHistory, setSessionHistory] = useState<VoiceSession | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    getVoiceStatus()
      .then((data) => {
        setStatusInfo(data);
        setIsLoadingStatus(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoadingStatus(false);
      });
  }, []);

  // Audio recording trigger
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const file = new File([audioBlob], "recording.wav", { type: "audio/wav" });
        setSttFile(file);
        
        // Auto trigger transcription
        setIsTranscribing(true);
        try {
          const text = await transcribeAudio(file, sttLang);
          setTranscribedText(text);
          toast({ title: "Transcription Ready", description: "Your audio has been transcribed." });
        } catch (e) {
          toast({ title: "Error", description: "Failed to transcribe audio.", variant: "destructive" });
        } finally {
          setIsTranscribing(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      toast({ title: "Permission Denied", description: "Could not access microphone.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribeFile = async () => {
    if (!sttFile) return;
    setIsTranscribing(true);
    try {
      const text = await transcribeAudio(sttFile, sttLang);
      setTranscribedText(text);
      toast({ title: "Success", description: "Transcribed successfully." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to transcribe file.", variant: "destructive" });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSynthesizeText = async () => {
    if (!ttsText.trim()) return;
    setIsSynthesizing(true);
    setAudioUrl(null);
    try {
      const base64Audio = await synthesizeText(ttsText, ttsLang, ttsSpeaker);
      if (base64Audio) {
        const url = `data:audio/wav;base64,${base64Audio}`;
        setAudioUrl(url);
        toast({ title: "Synthesis Successful", description: "Playing voice output." });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to synthesize speech.", variant: "destructive" });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleTranslate = async () => {
    if (!transText.trim()) return;
    setIsTranslating(true);
    try {
      const translated = await translateText(transText, transTargetLang);
      setTranslatedResult(translated);
      toast({ title: "Translation Completed", description: `Translated to ${transTargetLang}.` });
    } catch (e) {
      toast({ title: "Error", description: "Translation failed.", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFetchHistory = async () => {
    if (!sessionId.trim()) return;
    setIsLoadingHistory(true);
    try {
      const history = await getVoiceSessionHistory(sessionId);
      setSessionHistory(history);
    } catch (e) {
      toast({ title: "Error", description: "Failed to fetch session history.", variant: "destructive" });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const LANGS = [
    { code: "en-IN", label: "English" },
    { code: "hi-IN", label: "Hindi" },
    { code: "ta-IN", label: "Tamil" },
    { code: "te-IN", label: "Telugu" },
    { code: "kn-IN", label: "Kannada" },
    { code: "ml-IN", label: "Malayalam" },
    { code: "mr-IN", label: "Marathi" },
    { code: "gu-IN", label: "Gujarati" },
    { code: "bn-IN", label: "Bengali" }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 md:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Volume2 className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Voice Playground</h1>
          </div>
          <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
            Explore Sarvam AI Speech Synthesis, Transcription, and Indic Translation Pipelines
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
        {/* Main Controls Panel */}
        <div className="glass-card p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-neutral-50 border border-border p-1 h-9 w-full grid grid-cols-4">
              <TabsTrigger value="stt" className="text-2xs">STT (Speech-to-Text)</TabsTrigger>
              <TabsTrigger value="tts" className="text-2xs">TTS (Text-to-Speech)</TabsTrigger>
              <TabsTrigger value="translate" className="text-2xs">Translate</TabsTrigger>
              <TabsTrigger value="history" className="text-2xs">Session Logs</TabsTrigger>
            </TabsList>

            {/* STT Section */}
            <TabsContent value="stt" className="space-y-4 mt-0">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Input Language:</span>
                <select 
                  value={sttLang} 
                  onChange={(e) => setSttLang(e.target.value)}
                  className="w-full input-premium"
                >
                  {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>

              {/* Record block */}
              <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-border rounded">
                <Button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex-1 flex items-center gap-2 justify-center ${isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "btn-secondary"}`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 animate-pulse" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 text-primary" />
                      Record from Microphone
                    </>
                  )}
                </Button>
                <div className="text-3xs font-mono text-neutral-400">OR</div>
                <div className="flex-1">
                  <input 
                    type="file" 
                    id="audio-stt-file" 
                    className="hidden" 
                    onChange={(e) => setSttFile(e.target.files?.[0] || null)}
                    accept="audio/*"
                  />
                  <label 
                    htmlFor="audio-stt-file"
                    className="w-full flex items-center justify-center gap-2 border border-border p-2 rounded hover:bg-neutral-50 cursor-pointer text-xs font-semibold text-neutral-800"
                  >
                    <FileAudio className="h-4 w-4 text-primary" />
                    {sttFile ? sttFile.name : "Select Audio File"}
                  </label>
                </div>
              </div>

              {sttFile && (
                <Button onClick={handleTranscribeFile} disabled={isTranscribing} className="w-full btn-primary">
                  {isTranscribing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Transcribe Uploaded File
                </Button>
              )}

              {transcribedText && (
                <div className="p-4 bg-neutral-50 border border-border rounded mt-4">
                  <span className="text-[9px] font-mono text-primary uppercase">Transcribed Output:</span>
                  <p className="text-xs text-neutral-800 mt-2 leading-relaxed">{transcribedText}</p>
                </div>
              )}
            </TabsContent>

            {/* TTS Section */}
            <TabsContent value="tts" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Target Language:</span>
                  <select 
                    value={ttsLang} 
                    onChange={(e) => setTtsLang(e.target.value)}
                    className="w-full input-premium"
                  >
                    {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Speaker Model:</span>
                  <select 
                    value={ttsSpeaker} 
                    onChange={(e) => setTtsSpeaker(e.target.value)}
                    className="w-full input-premium"
                  >
                    <option value="shubh">Shubh (Default Indic Male)</option>
                    <option value="vatsal">Vatsal (Alternative Male)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Input Text to Synthesize:</span>
                <textarea 
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="e.g. This contract agreement is entered into between the parties on this date."
                  className="w-full input-premium min-h-[100px] py-3 text-xs"
                />
              </div>

              <Button onClick={handleSynthesizeText} disabled={isSynthesizing || !ttsText.trim()} className="w-full btn-primary">
                {isSynthesizing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Synthesize Speech
              </Button>

              {audioUrl && (
                <div className="p-4 bg-neutral-50 border border-border rounded mt-4 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-primary uppercase">Generated Audio:</span>
                  <audio src={audioUrl} controls className="h-9" autoPlay />
                </div>
              )}
            </TabsContent>

            {/* Translation Section */}
            <TabsContent value="translate" className="space-y-4 mt-0">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Target Translation Language:</span>
                <select 
                  value={transTargetLang} 
                  onChange={(e) => setTransTargetLang(e.target.value)}
                  className="w-full input-premium"
                >
                  {LANGS.filter(l => l.code !== 'en-IN').map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Source English Text:</span>
                <textarea 
                  value={transText}
                  onChange={(e) => setTransText(e.target.value)}
                  placeholder="Enter legal sentences to translate into Indic target languages..."
                  className="w-full input-premium min-h-[100px] py-3 text-xs"
                />
              </div>

              <Button onClick={handleTranslate} disabled={isTranslating || !transText.trim()} className="w-full btn-primary">
                {isTranslating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Translate Text
              </Button>

              {translatedResult && (
                <div className="p-4 bg-neutral-50 border border-border rounded mt-4">
                  <span className="text-[9px] font-mono text-primary uppercase">Translated Indic Text:</span>
                  <p className="text-xs text-neutral-800 mt-2 font-semibold leading-relaxed">{translatedResult}</p>
                </div>
              )}
            </TabsContent>

            {/* History Section */}
            <TabsContent value="history" className="space-y-4 mt-0">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Voice session ID..."
                  className="flex-1 input-premium"
                />
                <Button onClick={handleFetchHistory} disabled={isLoadingHistory} className="btn-primary">
                  Fetch Logs
                </Button>
              </div>

              {sessionHistory ? (
                <div className="space-y-3 mt-4">
                  <span className="text-[10px] font-mono text-primary uppercase">Session Timeline Turns:</span>
                  {sessionHistory.turns && sessionHistory.turns.length > 0 ? (
                    sessionHistory.turns.map((turn, idx) => (
                      <div key={idx} className="p-3 bg-neutral-50 border border-border rounded text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400">
                          <span>TURN #{idx + 1}</span>
                          <span>{turn.speaker === 'user' ? 'USER' : 'ASSISTANT'}</span>
                        </div>
                        <p className="text-neutral-800 leading-relaxed">{turn.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-neutral-500">No turns recorded in session yet.</div>
                  )}
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Health & Systems Panel */}
        <div className="space-y-6">
          <div className="glass-card p-5 space-y-4">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Pipeline Engines</span>
            <h3 className="text-xs font-semibold text-neutral-800 uppercase font-mono tracking-wider border-b border-border pb-2.5">Sarvam AI Health</h3>
            
            {isLoadingStatus ? (
              <div className="flex items-center gap-2 py-4 justify-center text-xs text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading voice subsystems...
              </div>
            ) : statusInfo ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-neutral-400 block font-mono text-3xs uppercase">TTS Synthesis Engine:</span>
                  <span className="font-mono text-neutral-900 font-semibold">{statusInfo.tts_engine}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-3xs uppercase">STT Transcription Engine:</span>
                  <span className="font-mono text-neutral-900 font-semibold">{statusInfo.stt_engine}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-3xs uppercase">Subsystem Status:</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-3xs font-mono uppercase mt-1">
                    Ready / Active
                  </Badge>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <Globe size={13} className="text-primary" />
                    <span className="font-mono text-3xs uppercase">Supported Languages ({statusInfo.supported_languages?.length || 10})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(statusInfo.supported_languages || []).map((lang, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-neutral-50 border border-border text-[9px] font-mono rounded text-neutral-600">
                        {lang.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-neutral-500 py-4 text-center">Subsystems disconnected.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePlayground;
export { Loader2 };
