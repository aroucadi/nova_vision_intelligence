"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Box,
    Container,
    Database,
    FileText,
    LayoutDashboard,
    RefreshCw,
    Search,
    Server,
    Truck,
    AlertCircle,
    CheckCircle2,
    Package
} from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used for toasts based on package.json

// Types
import { CustomsEntry } from "@/lib/services/customs-service";
import { WarehouseItem } from "@/lib/services/warehouse-service";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"overview" | "customs" | "warehouse">("overview");
    const [isLoading, setIsLoading] = useState(false);

    // Data State
    const [customsEntries, setCustomsEntries] = useState<CustomsEntry[]>([]);
    const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Parallel fetch
            const [customsRes, warehouseRes] = await Promise.all([
                fetch("/api/sandbox/customs"),
                fetch("/api/sandbox/warehouse")
            ]);

            const customsData = await customsRes.json();
            const warehouseData = await warehouseRes.json();

            setCustomsEntries(customsData.entries || []);
            setWarehouseItems(warehouseData.items || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 5 seconds for "Real-time" feel
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSeed = async () => {
        setIsLoading(true);
        try {
            await fetch("/api/sandbox/warehouse", {
                method: "POST",
                body: JSON.stringify({ action: "seed" })
            });
            toast.success("Warehouse seeded successfully");
            fetchData();
        } catch (error) {
            toast.error("Seed failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-pink-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
                            <Server className="h-6 w-6 text-pink-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                                System Internals
                            </h1>
                            <p className="text-zinc-500 text-sm">Logistics Infrastructure & Sandbox Control</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={fetchData}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
                        </button>
                        <button
                            onClick={handleSeed}
                            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-medium transition-all"
                        >
                            Seed Demo Data
                        </button>
                    </div>
                </header>

                {/* Navigation */}
                <nav className="flex gap-2 mb-8 p-1 bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-800/50 w-fit">
                    {[
                        { id: "overview", label: "Overview", icon: LayoutDashboard },
                        { id: "customs", label: "Customs ACE", icon: FileText },
                        { id: "warehouse", label: "Warehouse ERP", icon: Database },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                relative px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
                                ${activeTab === tab.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"}
                            `}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-zinc-800 rounded-lg shadow-sm"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <tab.icon className="h-4 w-4" /> {tab.label}
                            </span>
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <main>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "overview" && (
                                <OverviewTab customs={customsEntries} warehouse={warehouseItems} />
                            )}
                            {activeTab === "customs" && (
                                <CustomsTab data={customsEntries} />
                            )}
                            {activeTab === "warehouse" && (
                                <WarehouseTab data={warehouseItems} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

// --- Sub-Components ---

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`h-6 w-6 ${color.replace("bg-", "text-")}`} />
            </div>
            <div>
                <p className="text-zinc-500 text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
}

function OverviewTab({ customs, warehouse }: { customs: CustomsEntry[], warehouse: WarehouseItem[] }) {
    const activeShipments = customs.filter(c => c.status !== "RELEASED").length;
    const lowStockItems = warehouse.filter(w => w.status === "LOW_STOCK").length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Active Shipments"
                    value={activeShipments}
                    icon={Truck}
                    color="bg-blue-500"
                />
                <StatCard
                    label="Total Inventory Value"
                    value={`$${warehouse.reduce((acc, i) => acc + (i.quantity * 50), 0).toLocaleString()}`} // Mock value
                    icon={Database}
                    color="bg-emerald-500"
                />
                <StatCard
                    label="Low Stock Alerts"
                    value={lowStockItems}
                    icon={AlertCircle}
                    color="bg-amber-500"
                />
            </div>
        </div>
    );
}

function CustomsTab({ data }: { data: CustomsEntry[] }) {
    return (
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                    <tr>
                        <th className="p-4 font-medium">Entry #</th>
                        <th className="p-4 font-medium">Importer</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Duty</th>
                        <th className="p-4 font-medium text-right">Items</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                    {data.map((entry) => (
                        <tr key={entry.entryNumber} className="hover:bg-zinc-800/20 transition-colors">
                            <td className="p-4 font-mono text-xs text-zinc-300">{entry.entryNumber}</td>
                            <td className="p-4 text-white">{entry.importer}</td>
                            <td className="p-4">
                                <span className={`
                                    px-2 py-1 rounded-full text-xs font-medium border
                                    ${entry.status === "RELEASED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        entry.status === "FILED" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                            "bg-zinc-800 text-zinc-400 border-zinc-700"}
                                `}>
                                    {entry.status}
                                </span>
                            </td>
                            <td className="p-4 text-zinc-400">${entry.totalDuty.toFixed(2)}</td>
                            <td className="p-4 text-right text-zinc-500">{entry.items.length} items</td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-zinc-500">
                                No customs entries found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function WarehouseTab({ data }: { data: WarehouseItem[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item) => (
                <div key={item.sku} className="group p-4 bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/50 hover:border-pink-500/30 rounded-xl transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-zinc-800 rounded-lg">
                                <Package className="h-4 w-4 text-zinc-400 group-hover:text-pink-400 transition-colors" />
                            </div>
                            <span className="font-mono text-xs text-zinc-500">{item.sku}</span>
                        </div>
                        <span className={`
                            text-xs font-medium px-2 py-0.5 rounded
                            ${item.status === "IN_STOCK" ? "text-emerald-400 bg-emerald-500/10" :
                                item.status === "LOW_STOCK" ? "text-amber-400 bg-amber-500/10" :
                                    "text-red-400 bg-red-500/10"}
                        `}>
                            {item.quantity} units
                        </span>
                    </div>
                    <h3 className="font-medium text-white mb-1 truncate">{item.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                            <Box className="h-3 w-3" /> {item.location}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
