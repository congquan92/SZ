import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldOff, Lock, AlertTriangle, Home } from "lucide-react";

export default function UnauthorizedAccess() {
    // incident id ngẫu nhiên cho vui & copy
    const incidentId = useMemo(() => `INC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`, []);

    // typing lines “terminal”
    const linesFull = useRef<string[]>([
        "[SEC] Initializing countermeasures...",
        "[SEC] Verifying request signature ... FAILED",
        "[SEC] Checking token scope ... INSUFFICIENT",
        "[NIDS] Suspicious pattern detected at /payment/vnpay-return",
        "[WAF] Rule#442 matched: query anomaly",
        "[LOCKDOWN] Revoking session ... OK",
        "[LOCKDOWN] Isolating client route ... OK",
        "[AUDIT] Event stored with incident id:",
        incidentId,
        "[STATUS] ACCESS DENIED — SYSTEM LOCKDOWN ACTIVE",
        "[INFO] Please contact system administrator for access requests.",
        "[INFO] Đề nghị quý khách quay lại trang chủ hoặc liên hệ bộ phận hỗ trợ.",
    ]);

    const [typed, setTyped] = useState<string[]>([]);
    useEffect(() => {
        let i = 0;
        const t = setInterval(() => {
            setTyped((prev) => [...prev, linesFull.current[i]]);
            i++;
            if (i >= linesFull.current.length) clearInterval(t);
        }, 90);
        return () => clearInterval(t);
    }, []);

    // progress “khóa hệ thống”
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        let p = 0;
        const t = setInterval(() => {
            p = Math.min(100, p + Math.random() * 12);
            setProgress(p);
            if (p >= 100) clearInterval(t);
        }, 120);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="relative min-h-[70vh] bg-black text-white overflow-hidden">
            {/* Siren pulse background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-red-900/20 animate-siren" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,0,0,0.12),transparent_60%)]" />
                {/* “mưa trắng” đa lớp */}
                {Array.from({ length: 220 }).map((_, i) => (
                    <span
                        key={i}
                        className="absolute w-px bg-white/40 blur-[0.5px] animate-scan-fast"
                        style={{
                            height: `${40 + Math.random() * 80}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.8 + 0.2,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${0.8 + Math.random() * 1.8}s`,
                        }}
                    />
                ))}
                {/* quét sáng ngang */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-glow" />
                {/* static noise nhẹ */}
                <div className="absolute inset-0 mix-blend-screen opacity-[0.07] noise" />
            </div>

            {/* Header */}
            <div className="relative z-10 container mx-auto px-6 pt-10">
                <div className="flex items-center gap-3">
                    <ShieldOff className="h-10 w-10 text-red-500 drop-shadow-[0_0_12px_rgba(255,0,0,0.7)] animate-pulse" />
                    <h1 className="text-3xl md:text-5xl font-black tracking-[0.2em] text-red-500 drop-shadow-[0_0_16px_rgba(255,0,0,0.6)]">ACCESS DENIED</h1>
                </div>
                <div className="mt-2 flex items-center gap-2 text-red-300/90">
                    <Lock className="h-5 w-5" />
                    <span className="uppercase tracking-widest text-sm">System Lockdown Active</span>
                </div>
            </div>

            {/* Terminal */}
            <div className="relative z-10 container mx-auto px-6 mt-6">
                <div className="rounded-xl border border-red-700/40 bg-black/60 backdrop-blur-[2px] shadow-[0_0_40px_rgba(255,0,0,0.15)]">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-red-700/30">
                        <div className="size-3 rounded-full bg-red-500/80 animate-pulse" />
                        <div className="size-3 rounded-full bg-yellow-500/80" />
                        <div className="size-3 rounded-full bg-green-500/80" />
                        <span className="ml-2 text-sm text-red-200/80">/var/log/security.log</span>
                    </div>
                    <div className="p-4 font-mono text-sm leading-relaxed text-red-100/90">
                        {typed.map((line, idx) => (
                            <div key={idx} className="whitespace-pre-wrap">
                                <span className="text-red-500/80">~$</span> <span>{line}</span>
                            </div>
                        ))}
                        {typed.length < linesFull.current.length && (
                            <div className="mt-1">
                                <span className="text-red-500/80">~$</span> <span className="inline-block w-2 h-4 align-middle bg-red-400 animate-caret" />
                            </div>
                        )}
                    </div>

                    {/* progress lockdown */}
                    <div className="px-4 pb-4">
                        <div className="text-xs text-red-200/70 mb-1 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            <span>Lockdown progress</span>
                            <span className="ml-auto">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full rounded bg-red-900/50 overflow-hidden">
                            <div className="h-full bg-linear-to-r from-red-500 via-red-400 to-red-600 animate-stripe" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button asChild className="bg-red-600 hover:bg-red-700">
                        <Link to="/">
                            <Home className="mr-2 h-4 w-4" />
                            Quay lại trang chủ
                        </Link>
                    </Button>
                    <button className="text-xs text-red-300 underline underline-offset-4 hover:text-red-100" onClick={() => navigator.clipboard.writeText(incidentId).catch(() => {})} title="Copy incident id">
                        Copy Incident ID: <span className="font-mono">{incidentId}</span>
                    </button>
                </div>
            </div>

            {/* Big glitch label */}
            <div className="pointer-events-none select-none absolute inset-x-0 bottom-4 text-center">
                <div className="text-[8vw] md:text-[5vw] font-extrabold tracking-[0.25em] text-red-500/10 glitch">ACCESS DENIED</div>
            </div>

            {/* styles */}
            <style>{`
        @keyframes scan-fast {
          0% { transform: translateY(-100vh); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes glow {
          0%,100% { opacity: 0.08; transform: translateX(-100%); }
          50% { opacity: 0.35; transform: translateX(100%); }
        }
        @keyframes siren {
          0%, 100% { background-color: rgba(185, 28, 28, 0.15); }
          50% { background-color: rgba(239, 68, 68, 0.25); }
        }
        @keyframes caret {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes stripe {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
        .animate-scan-fast { animation: scan-fast linear infinite; }
        .animate-glow { animation: glow 4s linear infinite; }
        .animate-siren { animation: siren 1.6s ease-in-out infinite; }
        .animate-caret { animation: caret 1s steps(2, start) infinite; }
        .animate-stripe { background-size: 40px 40px; background-image: linear-gradient(
            45deg, rgba(255,255,255,0.25) 25%, transparent 25%, transparent 50%,
            rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.25) 75%, transparent 75%, transparent
          ); animation: stripe 1s linear infinite; }

        /* glitch text */
        .glitch {
          position: relative;
          text-shadow:
            2px 0 rgba(255,0,0,0.25),
            -2px 0 rgba(0,255,255,0.2);
          animation: glitch-shake 1.2s infinite;
        }
        @keyframes glitch-shake {
          0% { transform: translate(0,0); }
          20% { transform: translate(-1px,1px); }
          40% { transform: translate(1px,-1px); }
          60% { transform: translate(-0.5px,0.5px); }
          80% { transform: translate(0.5px,-0.5px); }
          100% { transform: translate(0,0); }
        }

        /* subtle noise */
        .noise {
          background-image:
            radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-position: 0 0, 10px 10px;
          background-size: 20px 20px;
        }
      `}</style>
        </div>
    );
}
