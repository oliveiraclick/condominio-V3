import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, QrCode, ClipboardCheck, ArrowUpRight, Check, Loader2, UserCheck, Package, CheckCircle2, MapPin } from 'lucide-react';
import { supabase } from '../supabase';

interface AdminPackagePickupProps {
    onBack: () => void;
    currentUser: any;
}

export const AdminPackagePickup: React.FC<AdminPackagePickupProps> = ({ onBack }) => {
    // State
    const [step, setStep] = useState<'scan_resident' | 'verify'>('scan_resident');
    const [residentCode, setResidentCode] = useState('');
    const [selectedResident, setSelectedResident] = useState<any>(null);
    const [residentPackages, setResidentPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Polling interval
    const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

    // Fetch resident by QR Code
    const handleScanResident = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // In a real scenario, the scanner would fill residentCode
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', residentCode.trim())
                .maybeSingle();

            if (error) throw error;
            if (!data) {
                alert('Morador não encontrado!');
                setLoading(false);
                return;
            }

            setSelectedResident(data);
            fetchResidentPackages(data.id);
            setStep('verify');
        } catch (err) {
            console.error(err);
            alert('Erro ao buscar morador');
            setLoading(false);
        }
    };

    const fetchResidentPackages = async (residentId: string) => {
        try {
            const { data, error } = await supabase
                .from('packages')
                .select('*')
                .eq('resident_id', residentId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setResidentPackages(data || []);
        } catch (err) {
            console.error('Error fetching packages:', err);
        }
    };

    const handleForceFinish = async (pkgId: string) => {
        try {
            const { error } = await supabase
                .from('packages')
                .update({
                    status: 'delivered',
                    picked_up_at: new Date().toISOString()
                })
                .eq('id', pkgId);

            if (error) throw error;

            // Refresh list
            if (selectedResident) fetchResidentPackages(selectedResident.id);
        } catch (err) {
            console.error('Error delivering package:', err);
            alert('Erro ao confirmar entrega');
        }
    };

    if (step === 'scan_resident') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col p-6">
                <div className="max-w-md mx-auto w-full space-y-8 pt-12">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">Retirada</h1>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                        <div className="text-center space-y-2">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner mb-6">
                                <QrCode size={40} />
                            </div>
                            <h2 className="text-2xl font-black italic text-slate-900 tracking-tighter uppercase">Identificar Morador</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">Escanei o QR Code do morador<br />para listar suas encomendas</p>
                        </div>

                        <form onSubmit={handleScanResident} className="space-y-4">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="ID do Morador (ou bipe QR)"
                                    value={residentCode}
                                    onChange={(e) => setResidentCode(e.target.value)}
                                    className="w-full h-16 px-14 bg-slate-50 border border-slate-100 rounded-[28px] focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300 shadow-inner"
                                />
                                <QrCode className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !residentCode.trim()}
                                className="w-full h-16 bg-slate-900 text-white rounded-[28px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3 shadow-xl"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>Buscar Encomendas <ArrowUpRight size={18} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Resident Card Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-10 px-6 py-6 transition-all duration-300">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl overflow-hidden border-2 border-emerald-100 shadow-sm transition-transform hover:scale-105">
                            {selectedResident.avatar ? <img src={selectedResident.avatar} className="w-full h-full object-cover" /> : <User className="w-7 h-7 m-3.5 text-emerald-200" />}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 italic uppercase tracking-tighter text-lg leading-none">{selectedResident.name}</p>
                            <p className="text-[11px] text-emerald-600 font-black uppercase tracking-widest mt-1">{selectedResident.tower} • UNIDADE {selectedResident.unit}</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                        <CheckCircle2 size={20} />
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-2">
                        <Package size={18} className="text-slate-400" />
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Volumes Disponíveis</h2>
                    </div>
                </div>

                {residentPackages.length === 0 ? (
                    <div className="bg-white p-12 rounded-[40px] text-center border-2 border-dashed border-slate-200 space-y-4">
                        <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <ClipboardCheck size={40} />
                        </div>
                        <div>
                            <p className="font-black text-slate-300 uppercase italic text-sm">Nada por aqui!</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Nenhuma encomenda aguardando</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {residentPackages.map(pkg => {
                            const isConfirmed = pkg.status === 'delivered';
                            return (
                                <div key={pkg.id} className={`p-6 rounded-[32px] border transition-all duration-500 relative overflow-hidden group ${isConfirmed ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="z-10">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 uppercase tracking-wider">{pkg.carrier_name}</span>
                                                {pkg.location && (
                                                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 flex items-center gap-1.5 uppercase tracking-wider">
                                                        <MapPin size={12} className="stroke-[3]" /> {pkg.location}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-mono text-xl font-black text-slate-900 tracking-tighter italic uppercase">{pkg.internal_code || pkg.original_code}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest italic">Entregue por {pkg.courier_name || 'Desconhecido'}</p>
                                        </div>
                                        {isConfirmed ? (
                                            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in-50">
                                                <CheckCircle2 size={24} />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleForceFinish(pkg.id)}
                                                className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-xl active:scale-95 group-hover:rotate-3"
                                            >
                                                <Check size={28} />
                                            </button>
                                        )}
                                    </div>
                                    {!isConfirmed ? (
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Aguardando Coleta</p>
                                            <button
                                                onClick={() => handleForceFinish(pkg.id)}
                                                className="h-10 px-4 text-[9px] font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all uppercase tracking-widest"
                                            >
                                                Manual
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="pt-4 border-t border-emerald-100 text-[10px] font-black text-emerald-600 flex items-center gap-2 uppercase tracking-[0.2em] italic">
                                            <CheckCircle2 size={12} />
                                            Entregue às {new Date(pkg.picked_up_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {!residentPackages.some(p => p.status === 'pending') && residentPackages.length > 0 && (
                    <div className="pt-8 pb-12 px-6">
                        <button
                            onClick={() => setStep('scan_resident')}
                            className="w-full h-16 bg-emerald-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                            Concluir e Voltar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
