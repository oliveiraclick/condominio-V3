import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, QrCode, ClipboardCheck, ArrowUpRight, Check, Loader2, CheckCircle2, Package, MapPin, X, Camera } from 'lucide-react';
import { supabase } from '../supabase';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useResidentCache } from '../components/hooks/useResidentCache';

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

    const { getResident } = useResidentCache();

    // Scanner
    const [showScanner, setShowScanner] = useState(false);

    // Initial Load & Draft Recovery
    useEffect(() => {
        const savedDraft = localStorage.getItem('pickup_draft');
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                if (parsed.step) setStep(parsed.step);
                if (parsed.residentCode) setResidentCode(parsed.residentCode);
                if (parsed.selectedResident) {
                    setSelectedResident(parsed.selectedResident);
                    fetchResidentPackages(parsed.selectedResident.id);
                }
            } catch (e) {
                console.error('Error recovering draft', e);
            }
        }
    }, []);

    // Save Draft
    useEffect(() => {
        const draft = {
            step,
            residentCode,
            selectedResident
        };
        if (step !== 'scan_resident' || residentCode) {
            localStorage.setItem('pickup_draft', JSON.stringify(draft));
        }
    }, [step, residentCode, selectedResident]);

    // Handle Camera Scan
    const handleScan = (results: any[]) => {
        if (results && results.length > 0) {
            const raw = results[0].rawValue;
            if (raw) {
                setResidentCode(raw);
                setShowScanner(false);
                if (raw.length > 5) {
                    handleScanResident(null, raw);
                }
            }
        }
    };

    const handleScanResident = async (e: React.FormEvent | null, codeOverride?: string) => {
        if (e) e.preventDefault();
        const codeToSearch = (codeOverride || residentCode).trim();

        if (!codeToSearch) return;

        setLoading(true);

        try {
            const data = await getResident(codeToSearch);

            if (!data) {
                alert('Morador não encontrado! Verifique o código.');
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
        // OPTIMISTIC UI (Step 2)
        // 1. Snapshot previous state
        const previousPackages = [...residentPackages];

        // 2. Optimistic Update
        const optimisticUpdate = residentPackages.map(p =>
            p.id === pkgId
                ? { ...p, status: 'delivered', picked_up_at: new Date().toISOString() }
                : p
        );
        setResidentPackages(optimisticUpdate);

        try {
            // 3. API Call
            const { error } = await supabase
                .from('packages')
                .update({
                    status: 'delivered',
                    picked_up_at: new Date().toISOString()
                })
                .eq('id', pkgId);

            if (error) throw error;

            // NO RE-FETCH (Step 1) - We rely on local state update success

        } catch (err) {
            console.error('Error delivering package:', err);
            alert('Erro ao confirmar entrega');
            // 4. Rollback on Error
            setResidentPackages(previousPackages);
        }
    };

    const handleBack = () => {
        if (step === 'verify') {
            setStep('scan_resident');
            setSelectedResident(null);
            setResidentPackages([]);
            setResidentCode('');
            localStorage.removeItem('pickup_draft');
        } else {
            onBack();
        }
    };

    const handleFinishAll = () => {
        setStep('scan_resident');
        setSelectedResident(null);
        setResidentPackages([]);
        setResidentCode('');
        localStorage.removeItem('pickup_draft');
    };

    if (step === 'scan_resident') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col p-6">
                {showScanner && (
                    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
                        <div className="relative flex-1 bg-black">
                            <button
                                onClick={() => setShowScanner(false)}
                                className="absolute top-6 right-6 z-50 w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
                            >
                                <X size={28} />
                            </button>
                            <Scanner
                                onScan={handleScan}
                                allowMultiple={true}
                                scanDelay={2000}
                            />
                            <div className="absolute bottom-24 left-0 right-0 text-center pointer-events-none">
                                <p className="text-white font-bold bg-black/50 inline-block px-6 py-3 rounded-full backdrop-blur text-sm uppercase tracking-widest border border-white/10">
                                    Bipe o QR Code do Morador
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-w-md mx-auto w-full space-y-8 pt-6">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBack} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">Retirada</h1>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-2">
                            <div className="w-24 h-24 bg-slate-100 text-slate-900 rounded-[32px] flex items-center justify-center mx-auto shadow-sm border border-slate-200 mb-6 animate-pulse">
                                <Camera size={48} />
                            </div>
                            <h2 className="text-xl font-black italic text-slate-900 tracking-tighter uppercase">Identificar</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">Escanei o QR Code do morador</p>
                        </div>

                        <form onSubmit={(e) => handleScanResident(e)} className="space-y-6">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="ID ou Bipe QR..."
                                    value={residentCode}
                                    onChange={(e) => setResidentCode(e.target.value)}
                                    className="w-full h-24 bg-white border-2 border-slate-200 rounded-[32px] px-8 pl-8 pr-24 text-2xl font-mono text-center tracking-widest text-slate-900 focus:border-slate-900 focus:shadow-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-20 h-20 flex items-center justify-center bg-slate-900 rounded-[24px] text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                                >
                                    <Camera size={32} />
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !residentCode.trim()}
                                className="w-full h-20 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-sm hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>BUSCAR AGORA <ArrowUpRight size={24} /></>
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
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-10 px-6 py-4 shadow-sm transition-all duration-300">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBack} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-all">
                            <ArrowLeft size={24} />
                        </button>
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl overflow-hidden border-2 border-emerald-100 shadow-sm">
                            {selectedResident.avatar ? <img src={selectedResident.avatar} className="w-full h-full object-cover" /> : <User className="w-6 h-6 m-3 text-emerald-300" />}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 italic uppercase tracking-tighter text-lg leading-none">{selectedResident.name}</p>
                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">UNIDADE {selectedResident.unit}</p>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-inner">
                        <CheckCircle2 size={24} />
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
                    <div className="bg-white p-12 rounded-[40px] text-center border-2 border-dashed border-slate-200 space-y-4 animate-in zoom-in-95">
                        <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
                            <ClipboardCheck size={48} />
                        </div>
                        <div>
                            <p className="font-black text-slate-300 uppercase italic text-sm">Nada consta</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tudo entregue!</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {residentPackages.map((pkg, idx) => {
                            const isConfirmed = pkg.status === 'delivered';
                            return (
                                <div key={pkg.id} className={`p-6 rounded-[32px] border transition-all duration-500 relative overflow-hidden group animate-in slide-in-from-bottom-4 ${isConfirmed ? 'bg-emerald-50 border-emerald-100 opacity-80' : 'bg-white border-slate-100 shadow-sm hover:border-emerald-200'}`} style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="z-10">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 uppercase tracking-wider">{pkg.carrier_name}</span>
                                                {pkg.location && (
                                                    <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 flex items-center gap-1.5 uppercase tracking-wider border border-slate-200">
                                                        <MapPin size={10} className="stroke-[3]" /> {pkg.location}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-mono text-2xl font-black text-slate-900 tracking-tighter italic uppercase">{pkg.internal_code || pkg.original_code}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest italic">Courier: {pkg.courier_name || 'N/A'}</p>
                                        </div>
                                        {isConfirmed ? (
                                            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in-50">
                                                <CheckCircle2 size={28} />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleForceFinish(pkg.id)}
                                                className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-xl active:scale-95 group-hover:rotate-3 shadow-slate-900/10"
                                            >
                                                <Check size={32} />
                                            </button>
                                        )}
                                    </div>
                                    {!isConfirmed ? (
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">Aguardando Retirada</p>
                                            <button
                                                onClick={() => handleForceFinish(pkg.id)}
                                                className="h-10 px-4 text-[9px] font-black text-slate-400 hover:text-white hover:bg-emerald-500 rounded-xl transition-all uppercase tracking-widest"
                                            >
                                                Entregar Agora
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="pt-4 border-t border-emerald-100 text-[10px] font-black text-emerald-600 flex items-center gap-2 uppercase tracking-[0.2em] italic">
                                            <CheckCircle2 size={14} />
                                            Entregue às {new Date(pkg.picked_up_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="pt-8 pb-12 px-2">
                    <button
                        onClick={handleFinishAll}
                        className="w-full h-20 bg-emerald-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all hover:bg-emerald-500"
                    >
                        Concluir Atendimento
                    </button>
                </div>
            </div>
        </div>
    );
};
