"use client";

import Link from "next/link";
import {
  FileText,
  Mic,
  ArrowRight,
  Activity,
  AlertCircle,
  Brain,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useGlobalPathway } from "@/context/GlobalPathwayContext";
import { SPRING_PHYSICS, STAGGER_CONTAINER, FADE_UP_ITEM, SCALE_UP_ITEM } from "@/components/motion/constants";

export default function DashboardPage() {
  const { metrics, activityLog } = useGlobalPathway();

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
              <Activity className="h-4 w-4 animate-pulse" /> System Operational
            </motion.div>
            <div className="text-sm text-zinc-500">AWS Nova 2 Lite • Stable</div>
          </div>
        </motion.header>

        {/* content container for stagger */}
        <motion.main
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
        >
          {/* Key Metrics (Real-time) */}
          <motion.div variants={STAGGER_CONTAINER} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Nova Vision Processed", value: `${metrics.processedDocs} Docs`, sub: "Last 24h", icon: <Brain className="h-5 w-5 text-violet-400" />, color: "violet" },
              { label: "Nova Act Filings", value: `${metrics.filings} Entries`, sub: "98% Success", icon: <Zap className="h-5 w-5 text-cyan-400" />, color: "cyan" },
              { label: "Compliance Checks", value: `${metrics.flagged} Flagged`, sub: "Requires Review", icon: <AlertCircle className="h-5 w-5 text-amber-400" />, color: "amber" },
              { label: "Voice Queries", value: `${metrics.voiceOps} Ops`, sub: "Floor Staff", icon: <Mic className="h-5 w-5 text-pink-400" />, color: "pink" }
            ].map((metric) => (
              <motion.div key={metric.label} variants={FADE_UP_ITEM}>
                <MetricCard label={metric.label} value={metric.value} sub={metric.sub} icon={metric.icon} />
              </motion.div>
            ))}
          </motion.div>

          {/* Journey Selection */}
          <motion.h2 variants={FADE_UP_ITEM} className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-6">Select Operation Mode</motion.h2>
          <motion.div variants={STAGGER_CONTAINER} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

            {/* Clearance Journey */}
            <motion.div variants={SCALE_UP_ITEM}>
              <Link href="/clearance" className="group">
                <div className="h-full p-8 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5 hover:from-violet-500/10 hover:to-purple-500/10 transition-all relative overflow-hidden ring-1 ring-white/5 hover:ring-violet-500/50">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                    <FileText className="h-32 w-32" />
                  </div>
                  <div className="relative z-10">
                    <div className="p-4 bg-violet-500/20 rounded-2xl w-fit mb-6 ring-1 ring-inset ring-violet-500/20">
                      <FileText className="h-8 w-8 text-violet-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-violet-200 transition-colors">Document Clearance</h3>
                    <p className="text-zinc-400 mb-8 max-w-sm">
                      Autonomous processing of Commercial Invoices and BOLs.
                      <span className="block mt-2 text-xs font-mono text-violet-400/80">Powered by Nova Lite (Vision) + Nova Pro (Reasoning)</span>
                    </p>
                    <div className="flex items-center text-violet-400 font-semibold group-hover:translate-x-2 transition-transform">
                      Start New Entry <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Voice Journey */}
            <motion.div variants={SCALE_UP_ITEM}>
              <Link href="/warehouse" className="group">
                <div className="h-full p-8 rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-rose-500/5 hover:from-pink-500/10 hover:to-rose-500/10 transition-all relative overflow-hidden ring-1 ring-white/5 hover:ring-pink-500/50">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                    <Mic className="h-32 w-32" />
                  </div>
                  <div className="relative z-10">
                    <div className="p-4 bg-pink-500/20 rounded-2xl w-fit mb-6 ring-1 ring-inset ring-pink-500/20">
                      <Mic className="h-8 w-8 text-pink-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-pink-200 transition-colors">Warehouse Voice Ops</h3>
                    <p className="text-zinc-400 mb-8 max-w-sm">
                      Hands-free shipment tracking and status updates.
                      <span className="block mt-2 text-xs font-mono text-pink-400/80">Powered by Nova Sonic (Audio)</span>
                    </p>
                    <div className="flex items-center text-pink-400 font-semibold group-hover:translate-x-2 transition-transform">
                      Activate Copilot <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Live System Activity */}
          <motion.div variants={FADE_UP_ITEM} className="mb-20">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" /> Live AI Activity Log
            </h2>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
              {activityLog.map((log) => (
                <ActivityRow key={log.id} time={log.time} agent={log.agent} action={log.action} status={log.status} />
              ))}
            </div>
          </motion.div>
        </motion.main>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-zinc-900 text-center">
          <p className="text-sm text-zinc-500">NovaVision Logistics OS • Amazon Nova AI Hackathon 2025</p>
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

function ActivityRow({ time, agent, action, status }: { time: string, agent: string, action: string, status: string }) {
  return (
    <div className="flex items-center justify-between text-sm p-3 hover:bg-white/5 rounded-lg transition-colors border-b border-zinc-800/50 last:border-0 hover:scale-[1.01] transition-transform duration-200 cursor-default">
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
      <span className="text-emerald-500/80 text-xs font-medium px-2 py-1 bg-emerald-500/10 rounded-full">{status}</span>
    </div>
  )
}
