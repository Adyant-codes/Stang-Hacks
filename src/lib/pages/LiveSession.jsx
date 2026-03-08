import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square, Lightbulb, Radio, Volume2, ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import TipCard from "../components/session/TipCard";
import TranscriptBubble from "../components/session/TranscriptBubble";

export default function LiveSession() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionType = urlParams.get("type") || "casual";
  const sessionTitle = urlParams.get("title") || "Live Session";
  const contactId = urlParams.get("contactId") || "";
  const contactName = urlParams.get("contactName") || "";
  const contextNotes = urlParams.get("context") || "";

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const [tips, setTips] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const tipsEndRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const pauseTimerRef = useRef(null);
  const pendingTranscriptRef = useRef("");
  const navigate = useNavigate();

  // Timer
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isListening]);

  // Auto-scroll tips
  useEffect(() => {
    tipsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tips]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, currentText]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const generateTip = useCallback(async (spokenText) => {
    if (!spokenText.trim() || spokenText.trim().length < 10) return;
    setIsProcessing(true);

    const conversationHistory = transcript.map(t => t.text).join("\n");
    const fullTranscript = conversationHistory + "\n" + spokenText;

    const prompt = `You are Wingman, a subtle real-time social coach whispering in someone's ear during a live ${sessionType} conversation.

${contextNotes ? `Context about the other person: ${contextNotes}` : ""}
${contactName ? `Talking to: ${contactName}` : ""}

Conversation so far:
"${fullTranscript}"

Give ONE brief tip (max 16 words). Sound like a friend whispering, not a coach lecturing. Use casual language. It can be a quick sentence starter they could say, or a one-line nudge. No filler words, just the tip itself.

Categorize it too.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          tip: { type: "string", description: "Brief tip, max 16 words" },
          category: { type: "string", enum: ["suggestion", "conversation", "warning", "empathy"] }
        }
      }
    });

    const newTip = {
      ...result,
      timestamp: formatTime(elapsedSeconds)
    };

    setTips(prev => [...prev, newTip]);
    speakTip(result.tip);
    setIsProcessing(false);
  }, [transcript, sessionType, contextNotes, contactName, elapsedSeconds]);

  const speakTip = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Pick the most natural-sounding voice available
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer natural/neural voices by name
      const preferred = ["Samantha", "Google US English", "Karen", "Moira", "Tessa", "Daniel"];
      for (const name of preferred) {
        const match = voices.find(v => v.name.includes(name));
        if (match) return match;
      }
      // Fallback: first en-US voice
      return voices.find(v => v.lang === "en-US") || voices[0];
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      utterance.voice = pickVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        utterance.voice = pickVoice();
      };
    }

    utterance.rate = 0.92;   // slightly slower = more natural
    utterance.pitch = 1.05;  // very slight lift
    utterance.volume = 0.85;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        const trimmed = final.trim();
        setTranscript(prev => [...prev, { text: trimmed, time: formatTime(elapsedSeconds) }]);
        setCurrentText("");
        // Accumulate text and reset the 3-second pause timer
        pendingTranscriptRef.current += " " + trimmed;
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => {
          const pending = pendingTranscriptRef.current.trim();
          if (pending.length > 10) {
            generateTip(pending);
          }
          pendingTranscriptRef.current = "";
        }, 3000);
      } else {
        setCurrentText(interim);
        // Reset pause timer while speech is still ongoing
        clearTimeout(pauseTimerRef.current);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        console.log("Speech recognition error:", event.error);
      }
    };

    recognition.onend = () => {
      // Restart if still listening
      if (recognitionRef.current && isListening) {
        recognition.start();
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    clearTimeout(pauseTimerRef.current);
    pendingTranscriptRef.current = "";
    setIsListening(false);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const endSession = async () => {
    stopListening();
    
    const sessionData = {
      title: sessionTitle,
      session_type: sessionType,
      contact_id: contactId || undefined,
      contact_name: contactName || undefined,
      status: "completed",
      transcript: transcript.map(t => t.text).join("\n"),
      tips_given: tips,
      context_notes: contextNotes || undefined,
      duration_seconds: elapsedSeconds
    };

    const created = await base44.entities.Session.create(sessionData);
    setSessionId(created.id);
    navigate(createPageUrl("SessionHistory") + `?id=${created.id}`);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))} className="shrink-0 h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                {isListening && (
                  <div className="w-2 h-2 rounded-full bg-red-500 pulse-ring" />
                )}
                <h1 className="text-sm font-semibold text-foreground">{sessionTitle}</h1>
              </div>
              <p className="text-[10px] text-muted-foreground">{sessionType} • {formatTime(elapsedSeconds)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSpeaking && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
                <Volume2 className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-[10px] text-primary font-medium">Speaking</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={endSession}
              className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-lg text-xs gap-1"
            >
              <Square className="w-3 h-3" />
              End
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Transcript Panel */}
        <div className="flex-1 flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-border">
          <div className="px-4 py-2 border-b border-border/50 bg-card/30">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
              <Radio className="w-3 h-3" />
              Live Transcript
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {transcript.length === 0 && !currentText && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Mic className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {isListening ? "Listening for conversation..." : "Tap the mic to start listening"}
                </p>
              </div>
            )}
            {transcript.map((item, i) => (
              <TranscriptBubble key={i} text={item.text} isLatest={i === transcript.length - 1 && !currentText} />
            ))}
            {currentText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-xl bg-secondary/50 border border-border/50 max-w-[85%]"
              >
                <p className="text-sm text-muted-foreground italic">{currentText}...</p>
              </motion.div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>

        {/* Tips Panel */}
        <div className="flex-1 flex flex-col overflow-hidden md:max-w-sm">
          <div className="px-4 py-2 border-b border-border/50 bg-card/30">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
              <Lightbulb className="w-3 h-3 text-primary" />
              AI Tips
              {isProcessing && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {tips.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Lightbulb className="w-8 h-8 text-primary/20 mb-3" />
                <p className="text-sm text-muted-foreground">Tips will appear here as the conversation flows</p>
              </div>
            )}
            <AnimatePresence>
              {tips.map((tip, i) => (
                <TipCard key={i} tip={tip} index={i} />
              ))}
            </AnimatePresence>
            <div ref={tipsEndRef} />
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="shrink-0 px-4 py-4 border-t border-border bg-card/50 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25"
                : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            }`}
          >
            {isListening ? (
              <MicOff className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Mic className="w-6 h-6 text-primary-foreground" />
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          {isListening ? "Tap to pause listening" : "Tap to start listening"}
        </p>
      </div>
    </div>
  );
}
