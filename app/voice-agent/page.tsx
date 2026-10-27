"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  PhoneOff,
  Brain,
  User,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Mic,
  Activity,
  Zap,
  Star,
  Shield,
  TrendingUp,
} from "lucide-react";

/* ─── Types ─── */
type CallState = "idle" | "connecting" | "active" | "ended";

type Bubble = {
  id: string;
  speaker: "AI" | "User";
  text: string;
  time: string;
  name: string;
};

type CallLog = {
  id: string;
  call_id: string;
  customer_phone?: string;
  customer_name?: string;
  summary?: string;
  sentiment?: string;
  call_status: string;
  duration_seconds?: number;
  property_queried?: string;
  interest_score?: number;
  created_at: string;
};

/* ─── Helpers ─── */
function now() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/* ─── Orbital Ring Component ─── */
function OrbitalRing({
  callState,
  isSpeaking,
}: {
  callState: CallState;
  isSpeaking: boolean;
}) {
  const isActive = callState === "active";
  const isConnecting = callState === "connecting";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 180, height: 180 }}
    >
      {/* Outermost ambient glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: isActive
            ? "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
          filter: "blur(8px)",
          transform: "scale(1.3)",
          transition: "all 0.5s ease",
        }}
      />

      {/* Outer spinning orbit ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 168,
          height: 168,
          border: "1px solid rgba(99,102,241,0.3)",
          borderTopColor: "#6366F1",
          borderRightColor: "rgba(129,140,248,0.6)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Second orbit ring — counter-rotate */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 148,
          height: 148,
          border: "1px dashed rgba(99,102,241,0.2)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      {/* Pulse rings when active */}
      {isActive && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              border: "1px solid rgba(99,102,241,0.4)",
            }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              border: "1px solid rgba(129,140,248,0.3)",
            }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8,
            }}
          />
        </>
      )}

      {/* Connecting spinner */}
      {isConnecting && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 160,
            height: 160,
            border: "2px solid transparent",
            borderTopColor: "#818CF8",
            borderRightColor: "#6366F1",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Inner circle - the clickable phone button */}
      <div
        className="absolute rounded-full"
        style={{
          width: 120,
          height: 120,
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(99,102,241,0.25)",
          backdropFilter: "blur(20px)",
        }}
      />

      {/* Purple glow disc behind icon */}
      <div
        className="absolute rounded-full"
        style={{
          width: 90,
          height: 90,
          background:
            "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(129,140,248,0.1) 50%, transparent 70%)",
        }}
      />

      {/* Phone icon in center */}
      <div className="relative z-10">
        {isActive ? (
          <motion.div
            animate={{ scale: isSpeaking ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
          >
            <Phone className="w-10 h-10" style={{ color: "#6366F1" }} />
          </motion.div>
        ) : (
          <Phone
            className="w-10 h-10"
            style={{ color: isConnecting ? "#F59E0B" : "#4F46E5" }}
          />
        )}
      </div>

      {/* Orbiting dot */}
      <motion.div
        className="absolute"
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#818CF8",
          boxShadow: "0 0 8px rgba(129,140,248,0.8)",
          top: 6,
          left: "50%",
          marginLeft: -4,
          transformOrigin: "4px 84px",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/* ─── Wave Bars ─── */
function WaveformBars({
  active,
  speaking,
}: {
  active: boolean;
  speaking: boolean;
}) {
  const bars = 20;
  const heights = [
    3, 5, 8, 12, 16, 20, 16, 12, 18, 14, 20, 16, 12, 18, 14, 10, 16, 12, 8, 5,
  ];
  return (
    <div
      className="flex items-center gap-0.5 justify-center"
      style={{ height: 36 }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            background: speaking ? "#6366F1" : "rgba(99,102,241,0.7)",
            boxShadow: speaking ? "0 0 6px rgba(99,102,241,0.5)" : "none",
          }}
          animate={
            active
              ? {
                  height: [
                    `${3}px`,
                    `${heights[i % heights.length]}px`,
                    `${3}px`,
                  ],
                  opacity: [0.4, speaking ? 1 : 0.7, 0.4],
                }
              : { height: "4px", opacity: 0.2 }
          }
          transition={
            active
              ? {
                  duration: 0.6 + i * 0.03,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.04,
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

/* ─── Chat bubble ─── */
function ChatBubble({ bubble }: { bubble: Bubble }) {
  const isAI = bubble.speaker === "AI";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-start gap-3 ${isAI ? "flex-row" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      {isAI ? (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
          }}
        >
          <Activity className="w-4 h-4" style={{ color: "#4F46E5" }} />
        </div>
      ) : (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm text-white"
          style={{
            background: "rgba(100,116,139,0.8)",
            border: "1px solid rgba(148,163,184,0.3)",
          }}
        >
          {bubble.name[0]}
        </div>
      )}

      {/* Bubble content */}
      <div
        className={`flex flex-col gap-1 max-w-[72%] ${isAI ? "items-start" : "items-end"}`}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold"
            style={{ color: isAI ? "#4F46E5" : "var(--text-muted)" }}
          >
            {isAI ? "AI Agent" : bubble.name}
          </span>
          <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
            {bubble.time}
          </span>
        </div>
        <div
          className="px-4 py-3 text-sm leading-relaxed"
          style={{
            background: isAI ? "rgba(255,255,255,0.9)" : "rgba(241,245,249,0.9)",
            border: `1px solid ${isAI ? "rgba(99,102,241,0.15)" : "rgba(100,116,180,0.1)"}`,
            borderRadius: isAI ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
            color: "var(--text-primary)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}
        >
          {bubble.text}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── DEMO conversation for idle state ─── */
const DEMO_BUBBLES: Bubble[] = [];

const DEMO_CALLS: CallLog[] = [
  {
    id: "1",
    call_id: "c1",
    customer_name: "Rahul Sharma",
    call_status: "completed",
    duration_seconds: 765,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "2",
    call_id: "c2",
    customer_name: "Arun Kumar",
    call_status: "completed",
    duration_seconds: 512,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: "3",
    call_id: "c3",
    customer_name: "Meena Iyer",
    call_status: "completed",
    duration_seconds: 920,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "4",
    call_id: "c4",
    customer_name: "Vikram Patel",
    call_status: "missed",
    duration_seconds: 0,
    created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
];

const AI_CAPABILITIES = [
  { icon: CheckCircle, label: "Natural conversation" },
  { icon: CheckCircle, label: "Real-time property matching" },
  { icon: CheckCircle, label: "Objection handling" },
  { icon: CheckCircle, label: "Lead qualification" },
  { icon: Star, label: "Smart follow-ups" },
  { icon: Shield, label: "Deal closing assistance" },
];

function formatDur(s: number) {
  if (!s) return "00:00:00";
  const h = Math.floor(s / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((s % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const isToday = new Date().toDateString() === d.toDateString();
  const yesterday =
    new Date(Date.now() - 86400000).toDateString() === d.toDateString();
  const prefix = isToday
    ? "Today"
    : yesterday
      ? "Yesterday"
      : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { prefix, time };
}

function fmtCallDuration(s?: number) {
  if (!s) return "00:00";
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function getErrorMessage(input: unknown): string {
  if (typeof input === "string") return input;
  if (input instanceof Error) return input.message;
  if (input && typeof input === "object") {
    const candidate = input as {
      message?: unknown;
      error?: unknown;
      errorMsg?: unknown;
    };
    if (typeof candidate.message === "string") return candidate.message;
    if (typeof candidate.error === "string") return candidate.error;
    if (candidate.error instanceof Error) return candidate.error.message;
    if (typeof candidate.errorMsg === "string") return candidate.errorMsg;
    try {
      return JSON.stringify(input);
    } catch {
      return "";
    }
  }
  return "";
}

function isIgnorableVoiceAgentError(args: unknown[]) {
  const message = args.map(getErrorMessage).join(" ").toLowerCase();
  if (!message) return false;

  // These are normal Daily.js / Vapi WebRTC teardown messages — not real errors.
  // "meeting ended due to ejection" fires when Daily destroys the call room;
  // it is expected on every normal call end and must not reach the error overlay.
  return [
    "send transport changed to disconnected",
    "recv transport changed to disconnected",
    "meeting ended in error: meeting has ended",
    "meeting ended due to ejection",
    "error unloading krisp processor",
    "wasm_or_worker_not_ready",
  ].some((needle) => message.includes(needle));
}

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function VoiceAgentPage() {
  const [callState, setCallState] = useState<CallState>("idle");
  const [duration, setDuration] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>(DEMO_BUBBLES);
  const [callLogs, setCallLogs] = useState<CallLog[]>(DEMO_CALLS);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [vapiError, setVapiError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const vapiRef = useRef<unknown>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const bubbleIdCounter = useRef(10);
  // Prevents the call-end event handler and endCall() from both scheduling
  // a setTimeout(→idle) at the same time, which corrupts the next call's state.
  const callEndHandledRef = useRef(false);

  const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY ?? "";
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? "";

  /* ── Load logs ── */
  const loadLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch("/api/calls", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) setCallLogs(data.slice(0, 4));
    } catch {
      /* keep demo data */
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Filter expected, non-fatal Daily.js WebRTC transport teardown logs during voice-agent page lifecycle
  useEffect(() => {
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      if (isIgnorableVoiceAgentError(args)) {
        return;
      }
      origError.apply(console, args);
    };
    return () => {
      console.error = origError;
    };
  }, []);

  /* ── Poll while active ── */
  useEffect(() => {
    if (callState !== "active" && callState !== "ended") return;
    const iv = setInterval(loadLogs, 8000);
    return () => clearInterval(iv);
  }, [callState, loadLogs]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [bubbles]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (callState === "active")
      t = setInterval(() => setDuration((d) => d + 1), 1000);
    else if (callState === "idle") setDuration(0);
    return () => clearInterval(t);
  }, [callState]);

  /* ── Cleanup on page unmount ── */
  useEffect(() => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const v = vapiRef.current as any;
      if (v) {
        try {
          v.stop();
        } catch {
          /* noop */
        }
        vapiRef.current = null;
      }
    };
  }, []);

  /* ── Push or merge bubble ── */
  const pushOrMerge = (speaker: "AI" | "User", text: string) => {
    if (!text.trim()) return;
    setBubbles((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.speaker === speaker) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...last,
          text: (last.text + " " + text).trim(),
        };
        return updated;
      }
      bubbleIdCounter.current += 1;
      return [
        ...prev,
        {
          id: `bubble-${bubbleIdCounter.current}`,
          speaker,
          text: text.trim(),
          time: now(),
          name: speaker === "AI" ? "AI Agent" : "You",
        },
      ];
    });
  };

  /* ── Start call ── */
  const startCall = async () => {
    setVapiError("");
    if (!assistantId) {
      setVapiError(
        "Add NEXT_PUBLIC_VAPI_ASSISTANT_ID in .env.local then restart the server.",
      );
      return;
    }
    callEndHandledRef.current = false;
    setCallState("connecting");
    setBubbles([]);
    try {
      let vapi = vapiRef.current as any;
      
      // Initialize Vapi only once per session to prevent WebRTC collision
      if (!vapi) {
        const { default: Vapi } = await import("@vapi-ai/web");
        vapi = new (Vapi as any)(apiKey);
        vapiRef.current = vapi;
        
        vapi.on("call-start", () => setCallState("active"));
        vapi.on("call-end", () => {
          // Guard: if endCall() already initiated this transition, skip.
          if (callEndHandledRef.current) return;
          callEndHandledRef.current = true;
          setCallState("ended");
          setIsSpeaking(false);
          // Null the ref so the NEXT call creates a brand-new Vapi+Daily.js instance.
          // This is the correct fix for "Meeting ended due to ejection" on second calls:
          // Daily.js emits that error when a new call is started on a reused instance
          // whose internal Daily call object wasn't fully torn down.
          vapiRef.current = null;
          setTimeout(() => {
            callEndHandledRef.current = false;
            setCallState("idle");
            loadLogs();
          }, 3500);
        });
        vapi.on("speech-start", () => setIsSpeaking(true));
        vapi.on("speech-end", () => setIsSpeaking(false));
        vapi.on(
          "message",
          (msg: {
            type: string;
            role?: string;
            transcript?: string;
            transcriptType?: string;
          }) => {
            if (msg.type === "transcript" && msg.transcriptType === "final") {
              pushOrMerge(
                msg.role === "assistant" ? "AI" : "User",
                msg.transcript ?? "",
              );
            }
          },
        );
        // Vapi v2: error event fires for mid-call errors
        vapi.on("error", (err: any) => {
          const message = getErrorMessage(err).trim();
          const lowerMessage = message.toLowerCase();
          if (
            !message ||
            lowerMessage === "{}" ||
            lowerMessage === "[object object]" ||
            lowerMessage.includes("meeting has ended") ||
            lowerMessage.includes("disconnected") ||
            lowerMessage.includes("krisp")
          ) {
            return;
          }
          console.warn("Vapi error event:", err);
          // Vapi v2 error shape: { type: string, error: { message, name, stack, ... } }
          // or sometimes a plain string / Error instance
          let errorMessage =
            "Voice connection error. Check microphone permissions and Vapi Dashboard logs.";
          if (typeof err === "string") {
            errorMessage = err;
          } else if (err instanceof Error) {
            errorMessage = err.message;
          } else if (err && typeof err === "object") {
            // Preferred: nested .error.message (Vapi v2 serializeError shape)
            const nested = err.error;
            if (typeof nested === "string") errorMessage = nested;
            else if (nested?.message) errorMessage = String(nested.message);
            else if (err.message) errorMessage = String(err.message);
            else if (err.errorMsg) errorMessage = String(err.errorMsg);
            else errorMessage = JSON.stringify(err);
          }
          setVapiError(errorMessage);
          setCallState("idle");
        });

        // Vapi v2: call-start-failed fires when startup fails BEFORE call-start.
        // evt.error is a plain string per the SDK type definition.
        vapi.on("call-start-failed", (evt: any) => {
          console.warn("Vapi call-start-failed:", evt);
          // Extract the error string directly — evt.error is a string in the SDK.
          const errorStr: string =
            typeof evt?.error === "string"
              ? evt.error
              : evt?.error?.message
                ? String(evt.error.message)
                : `Call start failed at stage: ${evt?.stage ?? "unknown"}`;
          setVapiError(errorStr);
          setCallState("idle");
        });

        // Vapi v2: log success for debugging
        vapi.on("call-start-success", (evt: any) => {
          console.log("Vapi call-start-success:", evt);
        });
      }

      await vapi.start(assistantId);
    } catch (err) {
      if (!isIgnorableVoiceAgentError([err])) {
        console.warn(err);
      }
      setVapiError(
        "Failed to start call. Check your Vapi API key and assistant ID.",
      );
      setCallState("idle");
    }
  };

  /* ── End call ── */
  const endCall = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = vapiRef.current as any;
    // Mark as handled so the 'call-end' event handler (fired by stop()) doesn't
    // create a second parallel setTimeout(→idle). We drive the transition here.
    callEndHandledRef.current = true;
    if (v) {
      try {
        // stop() is async but we don't await — the UI updates immediately.
        // The SDK will fire 'call-end' internally, which we suppress via the ref.
        v.stop();
      } catch {
        /* noop */
      }
      // Null the instance so the next call gets a fresh Vapi+Daily.js object,
      // preventing "Meeting ended due to ejection" on subsequent calls.
      vapiRef.current = null;
    }
    setCallState("ended");
    setIsSpeaking(false);
    setTimeout(() => {
      callEndHandledRef.current = false;
      setCallState("idle");
      loadLogs();
    }, 3500);
  };

  const isLive = callState === "active";

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "transparent" }}
    >
      <div
        className="relative z-10 flex flex-col min-h-screen"
        style={{ paddingTop: 68 }}
      >
        {/* ── PAGE HEADER ── */}
        <div className="px-6 lg:px-8 pt-8 pb-4 max-w-[1400px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <h1
                className="font-display font-black text-4xl"
                style={{ color: "var(--text-primary)" }}
              >
                Voice AI
              </h1>
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#10B981",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse inline-block" />
                Live
              </div>
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              AI-powered voice conversations that close more deals.
            </p>
          </motion.div>

          {/* Error banner */}
          {vapiError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#F87171",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {/* Always render vapiError as a string to prevent React "Objects not valid as React child" crash */}
              {typeof vapiError === "string" ? vapiError : JSON.stringify(vapiError)}
            </motion.div>
          )}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="flex-1 px-6 lg:px-8 pb-6 max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 h-full">
            {/* ════════════════════════════
                LEFT PANEL
            ════════════════════════════ */}
            <div className="flex flex-col gap-4">
              {/* ── AI Voice Agent Card ── */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center p-6"
                style={{
                  background: "var(--glass-2-bg)",
                  border: "1px solid var(--glass-2-border)",
                  borderRadius: 20,
                  backdropFilter: "blur(24px) saturate(150%)",
                  WebkitBackdropFilter: "blur(24px) saturate(150%)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)"
                }}
              >
                {/* Title */}
                <div className="w-full flex items-center gap-2 mb-6">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.3)",
                    }}
                  >
                    <Activity
                      className="w-3.5 h-3.5"
                      style={{ color: "#4F46E5" }}
                    />
                  </div>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    AI Voice Agent
                  </span>
                </div>

                {/* Orbital Ring */}
                <div className="mb-5">
                  <OrbitalRing callState={callState} isSpeaking={isSpeaking} />
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{
                      background: isLive
                        ? "#10B981"
                        : callState === "connecting"
                          ? "#F59E0B"
                          : "#4F46E5",
                      boxShadow: isLive
                        ? "0 0 8px rgba(16,185,129,0.6)"
                        : callState === "connecting"
                          ? "0 0 8px rgba(245,158,11,0.6)"
                          : "0 0 6px rgba(99,102,241,0.5)",
                    }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {isLive
                      ? "Call Active"
                      : callState === "connecting"
                        ? "Connecting…"
                        : callState === "ended"
                          ? "Wrapping Up…"
                          : "Agent is Ready"}
                  </span>
                </div>
                <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>
                  {isLive
                    ? "Click to end the call"
                    : callState === "connecting"
                      ? "Initializing Vapi…"
                      : "Click the button below to start a live AI call."}
                </p>

                {/* CTA Button */}
                <button
                  id="vapi-call-btn"
                  onClick={
                    callState === "idle"
                      ? startCall
                      : callState === "active"
                        ? endCall
                        : undefined
                  }
                  disabled={callState === "connecting" || callState === "ended"}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300"
                  style={
                    isLive
                      ? {
                          background:
                            "linear-gradient(135deg, #EF4444, #DC2626)",
                          color: "white",
                          border: "none",
                          boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
                        }
                      : callState === "connecting"
                        ? {
                            background: "rgba(245,158,11,0.15)",
                            color: "#F59E0B",
                            border: "1px solid rgba(245,158,11,0.3)",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, #6366F1, #4F46E5)",
                            color: "white",
                            border: "none",
                            boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                          }
                  }
                >
                  {/* Wave bars icon */}
                  <div
                    className="flex items-end gap-0.5"
                    style={{ height: 14 }}
                  >
                    {[6, 10, 14, 10, 6].map((h, i) => (
                      <motion.div
                        key={i}
                        style={{
                          width: 3,
                          height: h,
                          borderRadius: 2,
                          background: "currentColor",
                          opacity: 0.8,
                        }}
                        animate={
                          isLive ? { scaleY: [1, 1.8, 1] } : { scaleY: 1 }
                        }
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                  {isLive
                    ? "End Call"
                    : callState === "connecting"
                      ? "Connecting…"
                      : callState === "ended"
                        ? "Wrapping Up…"
                        : "Start AI Voice Call"}
                </button>

                <p
                  className="mt-3 text-[10px] flex items-center gap-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Zap className="w-3 h-3" />
                  Powered by Advanced Voice AI
                </p>

                {/* Waveform */}
                <div className="mt-5 w-full">
                  <WaveformBars active={isLive} speaking={isSpeaking} />
                </div>
              </motion.div>

              {/* ── Duration + Status ── */}
              <div className="grid grid-cols-2 gap-3">
                {/* Duration */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4"
                  style={{
                    background: "var(--glass-2-bg)",
                    border: "1px solid var(--glass-2-border)",
                    borderRadius: 16,
                    backdropFilter: "blur(20px) saturate(150%)",
                    WebkitBackdropFilter: "blur(20px) saturate(150%)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9)"
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock
                      className="w-3.5 h-3.5"
                      style={{ color: "#4F46E5" }}
                    />
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Duration
                    </span>
                  </div>
                  <p
                    className="font-display font-black text-lg tabular-nums"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {isLive ? formatDur(duration) : "00:00:00"}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {isLive ? "Active call" : "Call not started"}
                  </p>
                </motion.div>

                {/* Status */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-4"
                  style={{
                    background: "var(--glass-2-bg)",
                    border: "1px solid var(--glass-2-border)",
                    borderRadius: 16,
                    backdropFilter: "blur(20px) saturate(150%)",
                    WebkitBackdropFilter: "blur(20px) saturate(150%)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9)"
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-3">
                    <Activity
                      className="w-3.5 h-3.5"
                      style={{ color: "#818CF8" }}
                    />
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Status
                    </span>
                  </div>
                  <p
                    className="font-display font-bold text-lg capitalize"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {isLive
                      ? "Active"
                      : callState === "connecting"
                        ? "Dialing"
                        : callState === "ended"
                          ? "Ending"
                          : "Idle"}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {isLive ? "AI speaking" : "Agent is waiting"}
                  </p>
                </motion.div>
              </div>

              {/* ── AI Capabilities ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-5"
                style={{
                  background: "var(--glass-2-bg)",
                  border: "1px solid var(--glass-2-border)",
                  borderRadius: 20,
                  backdropFilter: "blur(20px) saturate(150%)",
                  WebkitBackdropFilter: "blur(20px) saturate(150%)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)"
                }}
              >
                <p
                  className="text-sm font-semibold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  AI Agent Capabilities
                </p>
                <div className="space-y-2.5">
                  {AI_CAPABILITIES.map((cap, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <cap.icon
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: "#6366F1" }}
                      />
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {cap.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Decorative AI orb */}
                <div className="mt-5 flex justify-end">
                  <div className="relative w-20 h-16">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle at 40% 50%, rgba(99,102,241,0.6), rgba(124,58,237,0.4), transparent)",
                        filter: "blur(8px)",
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle at 40% 50%, rgba(129,140,248,0.3), transparent)",
                      }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    {/* Mini wave bars on orb */}
                    <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                      {[4, 8, 12, 10, 8, 12, 8, 5].map((h, i) => (
                        <motion.div
                          key={i}
                          style={{
                            width: 2,
                            borderRadius: 2,
                            background: "rgba(129,140,248,0.8)",
                          }}
                          animate={{
                            height: [`${h * 0.5}px`, `${h}px`, `${h * 0.5}px`],
                          }}
                          transition={{
                            duration: 0.8 + i * 0.1,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.08,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ════════════════════════════
                RIGHT PANEL — Live Chat
            ════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col"
              style={{
                background: "var(--glass-2-bg)",
                border: "1px solid var(--glass-2-border)",
                borderRadius: 20,
                backdropFilter: "blur(24px) saturate(150%)",
                WebkitBackdropFilter: "blur(24px) saturate(150%)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
                minHeight: 520,
              }}
            >
              {/* Chat header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid rgba(100,116,180,0.12)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.3)",
                    }}
                  >
                    <Activity
                      className="w-4 h-4"
                      style={{ color: "#4F46E5" }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Live Conversation
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    color: "#10B981",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse inline-block" />
                  Live
                </div>
              </div>

              {/* Messages area */}
              <div
                ref={transcriptRef}
                className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
                style={{ minHeight: 0 }}
              >
                <AnimatePresence initial={false}>
                  {bubbles.map((b) => (
                    <ChatBubble key={b.id} bubble={b} />
                  ))}
                </AnimatePresence>

                {/* AI typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(99,102,241,0.15)",
                        border: "1px solid rgba(99,102,241,0.3)",
                      }}
                    >
                      <Activity
                        className="w-4 h-4"
                        style={{ color: "#4F46E5" }}
                      />
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
                      style={{
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid rgba(99,102,241,0.15)",
                      }}
                    >
                      <span
                        className="text-[11px] mr-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        AI Agent is typing
                      </span>
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full inline-block"
                          style={{ background: "#4F46E5" }}
                          animate={{
                            opacity: [0.2, 1, 0.2],
                            scale: [0.8, 1.2, 0.8],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Empty state */}
                {bubbles.length === 0 && !isTyping && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.15)",
                      }}
                    >
                      <Phone
                        className="w-8 h-8"
                        style={{ color: "#4F46E5", opacity: 0.5 }}
                      />
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Start a call to see the live conversation here
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ════════════════════════════
              BOTTOM — Recent Calls Strip
          ════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-5"
            style={{
              background: "var(--glass-2-bg)",
              border: "1px solid var(--glass-2-border)",
              borderRadius: 20,
              backdropFilter: "blur(24px) saturate(150%)",
              WebkitBackdropFilter: "blur(24px) saturate(150%)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)"
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(100,116,180,0.12)" }}
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" style={{ color: "#6366F1" }} />
                <span
                  className="font-semibold text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  Recent Calls
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadLogs}
                  disabled={isLoadingLogs}
                  className="transition-colors disabled:opacity-40"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--text-primary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-secondary)")
                  }
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoadingLogs ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Call cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(100,116,180,0.12)]">
              {callLogs.length === 0 ? (
                <div
                  className="col-span-4 px-6 py-8 text-center text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {isLoadingLogs ? "Loading…" : "No calls recorded yet."}
                </div>
              ) : (
                callLogs.map((log, i) => {
                  const { prefix, time } = fmtTime(log.created_at);
                  const isCompleted =
                    log.call_status === "completed" ||
                    log.call_status === "ended";
                  const isMissed = log.call_status === "missed";
                  const statusColor = isCompleted
                    ? "#10B981"
                    : isMissed
                      ? "#EF4444"
                      : "#F59E0B";
                  const statusLabel = isCompleted
                    ? "Completed"
                    : isMissed
                      ? "Missed"
                      : log.call_status;

                  return (
                    <motion.div
                      key={log.id ?? log.call_id ?? i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-4 px-5 py-5 transition-colors cursor-pointer"
                      style={{ background: "transparent" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "rgba(99,102,241,0.03)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "transparent")
                      }
                    >
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: isCompleted
                            ? "rgba(16,185,129,0.1)"
                            : isMissed
                              ? "rgba(239,68,68,0.1)"
                              : "rgba(245,158,11,0.1)",
                          border: `1px solid ${isCompleted ? "rgba(16,185,129,0.2)" : isMissed ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
                        }}
                      >
                        <Phone
                          className="w-4 h-4"
                          style={{ color: statusColor }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p
                            className="font-semibold text-sm truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {log.customer_name ||
                              log.customer_phone ||
                              "Unknown"}
                          </p>
                          <span
                            className="text-[11px] tabular-nums shrink-0"
                            style={{ color: "var(--text-muted)" }}
                          >
                            ⏱ {fmtCallDuration(log.duration_seconds)}
                          </span>
                        </div>
                        <p
                          className="text-[11px] mb-1.5"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {prefix}, {time}
                        </p>
                        <span
                          className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                          style={{
                            background: isCompleted
                              ? "rgba(16,185,129,0.12)"
                              : isMissed
                                ? "rgba(239,68,68,0.12)"
                                : "rgba(245,158,11,0.12)",
                            border: `1px solid ${isCompleted ? "rgba(16,185,129,0.25)" : isMissed ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)"}`,
                            color: statusColor,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
