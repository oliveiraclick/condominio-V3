import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Calendar, Package, ChevronDown, ChevronUp, Search, CalendarDays, Box, Truck } from 'lucide-react';
import { supabase } from '../supabase';

interface PackageData {
    id: string;
    original_code: string;
    carrier_name?: string;
    courier_name?: string;
    batch_id?: string;
    created_at: string;
    status: string;
}

interface Batch {
    batch_id: string;
    date: Date;
    carrier: string;
    courier: string;
    items: PackageData[];
    total: number;
}

interface AdminPackageBatchesProps {
    onBack: () => void;
}

export const AdminPackageBatches: React.FC<AdminPackageBatchesProps> = ({ onBack }) => {
    const [loading, setLoading] = useState(false);
    const [rawPackages, setRawPackages] = useState<PackageData[]>([]);

    // Date Filter State
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());

    // Generate Month Options (Last 12 months)
    const monthOptions = useMemo(() => {
        const options = [];
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            options.push({
                value: { month: d.getMonth(), year: d.getFullYear() },
                label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
            });
        }
        return options;
    }, []);

    useEffect(() => {
        fetchPackages();
    }, [selectedMonth, selectedYear]);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            // Calculate start and end of selected month
            const startDate = new Date(selectedYear, selectedMonth, 1);
            const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

            const { data, error } = await supabase
                .from('packages')
                .select('*')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRawPackages(data || []);
        } catch (err) {
            console.error('Error fetching batches:', err);
        } finally {
            setLoading(false);
        }
    };

    // Group by Batch ID
    const batches = useMemo(() => {
        const grouped: Record<string, Batch> = {};

        rawPackages.forEach(pkg => {
            // If no batch_id (legacy), group by day+hour or put in "Avulso"
            // For now, let's look for batch_id. If missing, we might group by timestamp proximity?
            // Let's rely on batch_id first.
            const batchKey = pkg.batch_id || `avulso-${new Date(pkg.created_at).toLocaleDateString()}`;

            if (!grouped[batchKey]) {
                grouped[batchKey] = {
                    batch_id: batchKey,
                    date: new Date(pkg.created_at),
                    carrier: pkg.carrier_name || 'Desconhecida',
                    courier: pkg.courier_name || 'Não Inf.',
                    items: [],
                    total: 0
                };
            }
            grouped[batchKey].items.push(pkg);
            grouped[batchKey].total++;
        });

        // Convert to array and sort by date desc
        return Object.values(grouped).sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [rawPackages]);

    // Expand State
    const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

    const toggleBatch = (id: string) => {
        setExpandedBatch(prev => prev === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-black italic text-slate-900 uppercase tracking-tighter">Histórico de Lotes</h1>
                    </div>

                    {/* Month Selector */}
                    <div className="relative">
                        <select
                            className="appearance-none bg-slate-100 pl-4 pr-10 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-brand-500/20 border-transparent focus:bg-white transition-all cursor-pointer"
                            value={JSON.stringify({ month: selectedMonth, year: selectedYear })}
                            onChange={(e) => {
                                const val = JSON.parse(e.target.value);
                                setSelectedMonth(val.month);
                                setSelectedYear(val.year);
                            }}
                        >
                            {monthOptions.map((opt, i) => (
                                <option key={i} value={JSON.stringify(opt.value)}>{opt.label}</option>
                            ))}
                        </select>
                        <CalendarDays size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

                {loading ? (
                    <div className="text-center py-20">
                        <p className="text-slate-400 font-bold animate-pulse">Carregando lotes...</p>
                    </div>
                ) : batches.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <Box size={40} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum lote neste período</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {batches.map((batch) => (
                            <div
                                key={batch.batch_id}
                                className={`bg-white rounded-[32px] border transition-all overflow-hidden ${expandedBatch === batch.batch_id ? 'border-brand-200 shadow-xl shadow-brand-500/10 ring-1 ring-brand-100' : 'border-slate-100 shadow-sm hover:border-slate-200'}`}
                            >
                                <div
                                    onClick={() => toggleBatch(batch.batch_id)}
                                    className="p-6 cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${batch.batch_id.startsWith('avulso') ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-brand-50 border-brand-100 text-brand-600'}`}>
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-slate-900 italic uppercase">{batch.carrier}</h3>
                                                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    {batch.date.toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1"><Truck size={12} /> {batch.courier}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="font-bold text-slate-700">{batch.total} Volumes</span>
                                                {batch.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-all ${expandedBatch === batch.batch_id ? 'rotate-180 bg-brand-50 text-brand-600' : 'text-slate-400'}`}>
                                        <ChevronDown size={16} />
                                    </div>
                                </div>

                                {/* Expanded Items details */}
                                {expandedBatch === batch.batch_id && (
                                    <div className="bg-slate-50/50 border-t border-slate-100 p-4 space-y-2 animate-in slide-in-from-top-2">
                                        {batch.items.map((pkg, idx) => (
                                            <div key={pkg.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono font-bold text-slate-500">#{idx + 1}</span>
                                                    <span className="font-bold text-slate-900">{pkg.original_code || 'Sem código'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${pkg.status === 'pending_processing' ? 'bg-amber-50 text-amber-600' :
                                                        pkg.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                                                            'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {pkg.status === 'pending_processing' ? 'Triagem' : pkg.status === 'delivered' ? 'Entregue' : pkg.status}
                                                    </span>
                                                    {/* We could add delete/edit buttons here later */}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
