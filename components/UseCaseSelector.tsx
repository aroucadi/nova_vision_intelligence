"use client";

import { motion } from "framer-motion";
import { FileSearch, Mic, Workflow, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface UseCaseSelectorProps {
    onSelect?: (useCase: "analyze" | "voice" | "automate") => void; // Optional now
}

export function UseCaseSelector({ onSelect }: UseCaseSelectorProps) {
    const cases = [
        {
            id: "analyze",
            title: "Clear Shipment",
            description: "Process Invoices, BOLs, and Customs Docs.",
            icon: <FileSearch className="h-6 w-6 text-violet-400" />,
            gradient: "from-violet-500/20 to-purple-500/20",
            border: "hover:border-violet-500/50",
            href: "/clearance"
        },
        {
            id: "voice",
            title: "Warehouse Voice",
            description: "Track shipments hands-free with Nova Sonic.",
            icon: <Mic className="h-6 w-6 text-pink-400" />,
            gradient: "from-pink-500/20 to-rose-500/20",
            border: "hover:border-pink-500/50",
            href: "/warehouse"
        },
        {
            id: "automate",
            title: "Auto-File Entry",
            description: "Submit declarations to Port Authority.",
            icon: <Workflow className="h-6 w-6 text-cyan-400" />,
            gradient: "from-cyan-500/20 to-emerald-500/20",
            border: "hover:border-cyan-500/50",
            href: "/automate"
        }
    ] as const;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {cases.map((useCase) => (
                <motion.div
                    key={useCase.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Link href={useCase.href}>
                        <Card className={`p-4 cursor-pointer bg-zinc-900/50 border-zinc-800 transition-colors ${useCase.border}`}>
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${useCase.gradient} w-fit mb-3`}>
                                {useCase.icon}
                            </div>
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-white">{useCase.title}</h3>
                                <ArrowRight className="h-4 w-4 text-zinc-600" />
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">{useCase.description}</p>
                        </Card>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
