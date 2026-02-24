"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Mic,
  ArrowRight,
  Activity,
  AlertCircle,
  Brain,
  Zap,
  Mail,
  Send,
  Eye,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useGlobalPathway, PulseItem } from "@/context/GlobalPathwayContext";
import { toast } from "sonner";
import { SPRING_PHYSICS, STAGGER_CONTAINER, FADE_UP_ITEM, SCALE_UP_ITEM } from "@/components/motion/constants";

export default function DashboardPage() {
  const { metrics, activityLog, intelligencePulse, refreshPulse } = useGlobalPathway();

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-violet-500/30">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_PHYSICS}
          className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Command Center</h1>
            <p className="text-zinc-400">Overview of global logistics operations.</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium flex items-center gap-2 border border-emerald-500/20 cursor-default"
            >
              <Activity className="h-4 w-4 animate-pulse" /> Network Health: Optimal
            </motion.div>
            <div className="text-sm text-zinc-500 text-right">
              <span className="block font-medium text-zinc-300">Global Trade Lifecycle Agent</span>
              <span>Active Compliance Monitoring</span>
            </div>
          </div>
        </motion.header>

        {/* content container for stagger */}
        <motion.main
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
        >
          {/* Key Metrics (Real-time) */}
          <motion.div variants={STAGGER_CONTAINER} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
            {[
              { label: "Audit Throughput", value: `${metrics.processedDocs} Shipments`, sub: "24h Volume", icon: <Brain className="h-5 w-5 text-violet-400" />, color: "violet" },
              { label: "Successful Filings", value: `${metrics.filings} Transmitted`, sub: "98.2% Accuracy", icon: <Zap className="h-5 w-5 text-cyan-400" />, color: "cyan" },
              { label: "Compliance Risk", value: `${metrics.flagged} Alerts`, sub: "Human-in-the-Loop", icon: <AlertCircle className="h-5 w-5 text-amber-400" />, color: "amber" },
              { label: "Floor Verifications", value: `${metrics.voiceOps} Handled`, sub: "Operational Velocity", icon: <Mic className="h-5 w-5 text-pink-400" />, color: "pink" }
            ].map((metric) => (
              <motion.div key={metric.label} variants={FADE_UP_ITEM} className="col-span-1">
                <MetricCard label={metric.label} value={metric.value} sub={metric.sub} icon={metric.icon} />
              </motion.div>
            ))}

            {/* LIVE SYSTEM PULSE WIDGET */}
            <motion.div variants={FADE_UP_ITEM} className="col-span-1 md:col-span-5">
              <IntelligencePulse pulses={intelligencePulse} />
            </motion.div>

          </motion.div>

          {/* Journey Section */}
          <motion.h2 variants={FADE_UP_ITEM} className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-6">Global Trade Lifecycle Journey</motion.h2>
          <motion.div variants={STAGGER_CONTAINER} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">

            {/* Step 1: Ingest */}
            <motion.div variants={SCALE_UP_ITEM}>
              <Link href="/clearance" className="group block h-full">
                <div className="h-full p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="text-xs font-mono text-violet-500 mb-2">PHASE 01</div>
                    <h3 className="text-lg font-bold mb-1 text-white flex items-center justify-between">
                      Document Intake <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-xs text-zinc-500">Commercial Invoices, BOLs & Packing Lists.</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Step 2: Audit */}
            <motion.div variants={SCALE_UP_ITEM}>
              <div className="h-full p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-xs font-mono text-zinc-600 mb-2">PHASE 02</div>
                  <h3 className="text-lg font-bold mb-1 text-zinc-400">Compliance Audit</h3>
                  <p className="text-xs text-zinc-600">Automated HS Code classification & risk detection.</p>
                </div>
              </div>
            </motion.div>

            {/* Step 3: File */}
            <motion.div variants={SCALE_UP_ITEM}>
              <div className="h-full p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-xs font-mono text-zinc-600 mb-2">PHASE 03</div>
                  <h3 className="text-lg font-bold mb-1 text-zinc-400">Intelligent Filing</h3>
                  <p className="text-xs text-zinc-600">Autonomous EDI transmission to port authorities.</p>
                </div>
              </div>
            </motion.div>

            {/* Step 4: Verify */}
            <motion.div variants={SCALE_UP_ITEM}>
              <Link href="/warehouse" className="group block h-full">
                <div className="h-full p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="text-xs font-mono text-pink-500 mb-2">PHASE 04</div>
                    <h3 className="text-lg font-bold mb-1 text-white flex items-center justify-between">
                      Floor Verification <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-xs text-zinc-500">Hands-free voice stock check & verification.</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Live System Activity & Claims */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {/* Activity Log */}
            <motion.div variants={FADE_UP_ITEM} className="lg:col-span-2">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" /> Live AI Activity Log
              </h2>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
                {activityLog.length > 0 ? (
                  activityLog.map((log) => (
                    <ActivityRow
                      key={log.id}
                      time={log.time}
                      agent={log.agent}
                      action={log.action}
                      status={log.status}
                      reasoning={log.reasoning}
                    />
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm text-center py-4">No recent activity detected.</p>
                )}
              </div>
            </motion.div>

            {/* AI Claims Inbox (H.I.T.L) */}
            <motion.div variants={FADE_UP_ITEM} className="lg:col-span-1">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Brain className="h-4 w-4 text-violet-400" /> Pending Claims (H.I.T.L)
              </h2>
              <div className="bg-zinc-900/30 border border-violet-500/10 rounded-2xl p-6 h-full backdrop-blur-sm">
                <div className="space-y-4">
                  <ClaimInbox />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.main>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-zinc-900 text-center">
          <p className="text-sm text-zinc-500">Autonomous Logistics OS • Global Trade Intelligence • 2025</p>
        </footer>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between hover:bg-zinc-900 transition-colors group">
      <div>
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1 group-hover:text-zinc-400">{label}</p>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-xs text-zinc-600 font-mono">{sub}</p>
      </div>
      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 group-hover:border-zinc-700 transition-colors">
        {icon}
      </div>
    </div>
  )
}

function ClaimInbox() {
  const { claims, sendClaim } = useGlobalPathway();
  const [viewingClaim, setViewingClaim] = React.useState<string | null>(null);
  const [sendingId, setSendingId] = React.useState<string | null>(null);

  const handleSend = async (id: string) => {
    setSendingId(id);
    toast.promise(sendClaim(id), {
      loading: 'Transmitting claim to vendor via SES...',
      success: 'Claim sent successfully!',
      error: 'Failed to transmit claim.',
    });
    // The promise is handled by toast, but we need to clear sending state
    try {
      await sendClaim(id);
    } finally {
      setSendingId(null);
    }
  };

  if (claims.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="p-3 bg-zinc-950 rounded-full border border-zinc-900 mb-3">
          <Mail className="h-5 w-5 text-zinc-700" />
        </div>
        <p className="text-zinc-500 text-sm">No claims pending review.</p>
        <p className="text-zinc-700 text-xs mt-1">Discrepancies from voice will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {claims.map((claim) => (
        <div key={claim.id} className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 hover:border-violet-500/30 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-violet-400">#{claim.shipmentId}</span>
            <Badge variant="outline" className={claim.status === 'SENT' ? 'text-emerald-400 border-emerald-500/20' : 'text-amber-400 border-amber-500/20'}>
              {claim.status}
            </Badge>
          </div>
          <p className="text-sm font-medium text-white line-clamp-1 mb-1">{claim.vendor}</p>
          <p className="text-xs text-zinc-500 mb-4">{claim.vendorEmail}</p>

          <div className="flex gap-2">
            <button
              onClick={() => setViewingClaim(claim.id)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 border border-zinc-800"
            >
              <Eye className="h-3 w-3" /> Review
            </button>
            {claim.status === 'PENDING' && (
              <button
                onClick={() => handleSend(claim.id)}
                disabled={sendingId === claim.id}
                className="flex-1 px-3 py-1.5 rounded-lg bg-violet-600/20 text-xs font-medium text-violet-400 hover:bg-violet-600/30 transition-colors flex items-center justify-center gap-2 border border-violet-500/20 disabled:opacity-50"
              >
                <Send className={`h-3 w-3 ${sendingId === claim.id ? 'animate-pulse' : ''}`} />
                {sendingId === claim.id ? 'Sending...' : 'Send'}
              </button>
            )}
          </div>

          {/* Expanded Review Modal (Simulated) */}
          {viewingClaim === claim.id && (
            <div className="mt-4 p-3 rounded-lg bg-zinc-900 border border-zinc-800 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase">AI Drafted Email</span>
                <button onClick={() => setViewingClaim(null)} className="text-zinc-500 hover:text-white">×</button>
              </div>
              <div className="p-3 bg-zinc-950 rounded border border-zinc-800 max-h-40 overflow-y-auto">
                <pre className="text-[10px] text-zinc-400 font-mono whitespace-pre-wrap leading-relaxed">
                  {claim.draft}
                </pre>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function IntelligencePulse({ pulses }: { pulses: PulseItem[] }) {
  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 backdrop-blur-sm overflow-hidden relative group">
      <div className="p-4 border-b border-violet-500/10 flex items-center justify-between">
        <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
          <Activity className="h-3 w-3 animate-pulse" /> Real-World Intelligence Pulse (Nova Sentinel)
        </h3>
        <span className="text-[10px] text-zinc-500 font-mono italic">Live RSS: gCaptain Maritime Feed</span>
      </div>
      <div className="flex overflow-x-auto p-4 gap-4 no-scrollbar">
        {pulses.map((pulse, i) => (
          <div key={pulse.id || i} className="min-w-[300px] bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-4 flex flex-col justify-between hover:border-violet-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className={`
                                ${pulse.risk === 'HIGH' ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' : ''}
                                ${pulse.risk === 'MEDIUM' ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' : ''}
                                ${pulse.risk === 'LOW' ? 'text-zinc-400 border-zinc-500/20 bg-zinc-500/5' : ''}
                            `}>
                  {pulse.risk} Risk
                </Badge>
                <span className="text-[10px] text-zinc-600 font-mono">{pulse.timestamp}</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-2 line-clamp-2">{pulse.headline}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed italic mb-3">"{pulse.pulse}"</p>
            </div>
            <div className="pt-3 border-t border-zinc-800/50">
              <p className="text-[9px] font-bold text-violet-500 uppercase tracking-tighter mb-1">Agentic Recommendation</p>
              <p className="text-[11px] text-zinc-300 font-medium">{pulse.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityRow({ time, agent, action, status, reasoning }: { time: string, agent: string, action: string, status: string, reasoning?: string }) {
  const [showTrace, setShowTrace] = React.useState(false);

  return (
    <div className="group/row">
      <div
        onClick={() => reasoning && setShowTrace(!showTrace)}
        className="flex items-center justify-between text-sm p-3 hover:bg-white/5 rounded-lg transition-all border-b border-zinc-800/50 last:border-0 hover:scale-[1.01] duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 font-mono w-20">{time}</span>
          <Badge variant="outline" className={`
                            ${agent === 'Nova Act' ? 'text-cyan-400 border-cyan-500/20' : ''}
                            ${agent === 'Nova Pro' ? 'text-violet-400 border-violet-500/20' : ''}
                            ${agent === 'Nova Vision' ? 'text-blue-400 border-blue-500/20' : ''}
                            ${agent === 'Nova Sonic' ? 'text-pink-400 border-pink-500/20' : ''}
                        `}>{agent}</Badge>
          <span className="text-zinc-300">{action}</span>
        </div>
        <div className="flex items-center gap-3">
          {reasoning && (
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter group-hover/row:text-violet-400/70 transition-colors flex items-center gap-1">
              <Brain className="h-3 w-3" /> {showTrace ? 'Hide Trace' : 'View Trace'}
            </span>
          )}
          <span className="text-emerald-500/80 text-xs font-medium px-2 py-1 bg-emerald-500/10 rounded-full">{status}</span>
        </div>
      </div>

      <AnimatePresence>
        {showTrace && reasoning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING_PHYSICS}
            className="overflow-hidden"
          >
            <div className="mx-3 mb-3 p-4 bg-zinc-950 border border-violet-500/20 rounded-xl relative">
              <div className="absolute top-2 right-2 opacity-10">
                <Brain className="h-12 w-12 text-violet-400" />
              </div>
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Zap className="h-3 w-3" /> Agentic Chain-of-Thought
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono italic">
                "{reasoning}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
