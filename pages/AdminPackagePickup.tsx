import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, QrCode, ClipboardCheck, ArrowUpRight, Check, Loader2, UserCheck, Package, CheckCircle2 } from 'lucide-react';
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
        const { data } = await supabase
            .from('packages')
            .select('*')
            .eq('resident_id', residentId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (data) setResidentPackages(data);
        setLoading(false);
    };

    // Poll for status updates (Awaiting Handshake)
    useEffect(() => {
        if (step === 'verify' && selectedResident && residentPackages.length > 0) {
            const interval = setInterval(async () => {
                const { data } = await supabase
                    .from('packages')
                    .select('id, status, picked_up_at')
                    .in('id', residentPackages.map(p => p.id));

                if (data) {
                    setResidentPackages(prev => prev.map(p => {
                        const updated = data.find(u => u.id === p.id);
                        return updated ? { ...p, status: updated.status, picked_up_at: updated.picked_up_at } : p;
                    }));
                }
            }, 3000);

            setPollInterval(interval);
            return () => clearInterval(interval);
        }
    }, [step, selectedResident, residentPackages.length]);


    const handleForceFinish = async (pkgId: string) => {
        if (!confirm('Confirmar entrega manualmente (sem handshake)?')) return;

        const { error } = await supabase
            .from('packages')
            .update({
                status: 'delivered',
                picked_up_at: new Date().toISOString(),
                picked_up_by: selectedResident.id
            })
            .eq('id', pkgId);

        if (error) alert('Erro: ' + error.message);
        else fetchResidentPackages(selectedResident.id);
    };

    if (step === 'scan_resident') {
        return (
            <div className="min-h-screen bg-slate-50 pb-32">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={onBack} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-lg font-black italic text-slate-900 uppercase tracking-tighter">Retirada</h1>
                        </div>
                        <div className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-emerald-100 shadow-sm text-center">
                            Digital Handshake • Passo 3/3
                        </div>
                    </div>
                </div>

                <div className="max-w-xl mx-auto px-6 flex flex-col items-center justify-center pt-16 space-y-12">
                    <div className="relative">
                        <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-[40px] flex items-center justify-center animate-pulse shadow-inner rotate-3 transition-transform hover:rotate-0">
                            <QrCode size={48} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-emerald-600 border border-emerald-50">
                            <UserCheck size={24} />
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-black italic text-slate-900 tracking-tighter uppercase">Identidade Digital</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Escaneie o QR Code do App do Morador</p>
                    </div>

                    <form onSubmit={handleScanResident} className="w-full space-y-4">
                        <div className="relative group">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Aguardando QR Code..."
                                value={residentCode}
                                onChange={(e) => setResidentCode(e.target.value)}
                                className="w-full h-20 bg-white border border-slate-100 rounded-[32px] px-8 text-center font-mono text-2xl tracking-[0.2em] focus:border-emerald-500 focus:bg-emerald-50/10 outline-none transition-all shadow-sm placeholder:text-slate-200"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!residentCode || loading}
                            className="w-full h-16 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Validar Identidade'}
                        </button>
                    </form>

                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center max-w-[200px]">
                        O aperto de mão digital garante 100% de segurança na entrega
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setStep('scan_resident')} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                            <ArrowLeft size={18} />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                                {selectedResident.avatar ? <img src={selectedResident.avatar} className="w-full h-full object-cover" /> : <User className="w-6 h-6 m-3 text-slate-200" />}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 italic uppercase text-sm leading-none">{selectedResident.name}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{selectedResident.tower} • UNID {selectedResident.unit}</p>
                            </div>
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
                                            <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center border border-slate-100">
                                                <Package size={24} />
                                            </div>
                                        )}
                                    </div>

                                    {!isConfirmed ? (
                                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
                                                        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] animate-pulse">Aperto de Mão Digital</span>
                                                    <span className="text-[10px] text-slate-400 font-bold">Aguardando aceite do morador...</span>
                                                </div>
                                            </div>
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
            </div>

            {!residentPackages.some(p => p.status === 'pending') && residentPackages.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-8 z-20">
                    <button
                        onClick={() => setStep('scan_resident')}
                        className="w-full h-16 bg-emerald-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                        Concluir e Voltar
                    </button>
                </div>
            )}
        </div>
    );
};
