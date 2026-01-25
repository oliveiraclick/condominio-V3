import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, QrCode, ClipboardCheck, ArrowUpRight, Check, Loader2 } from 'lucide-react';
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
            // Assume Resident QR contains their UUID or a specific code
            // For now, let's search by ID
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
            .eq('status', 'awaiting_confirmation')
            .order('created_at', { ascending: false });

        if (data) setResidentPackages(data);
        setLoading(false);
    };

    // Poll for status updates (when resident confirms on their phone)
    useEffect(() => {
        if (step === 'verify' && selectedResident && residentPackages.length > 0) {
            const interval = setInterval(async () => {
                const { data } = await supabase
                    .from('packages')
                    .select('id, status, confirmed_by_resident_at')
                    .in('id', residentPackages.map(p => p.id));

                if (data) {
                    setResidentPackages(prev => prev.map(p => {
                        const updated = data.find(u => u.id === p.id);
                        return updated ? { ...p, status: updated.status, confirmed_by_resident_at: updated.confirmed_by_resident_at } : p;
                    }));

                    // Check if all confirmed
                    const allDone = data.every(p => p.status === 'completed');
                    if (allDone && data.length > 0) {
                        // Optional: Auto finish or show success toast
                    }
                }
            }, 3000); // 3 seconds poll

            setPollInterval(interval);
            return () => clearInterval(interval);
        }
    }, [step, selectedResident, residentPackages.length]);


    const handleForceFinish = async (pkgId: string) => {
        if (!confirm('Confirmar entrega manualmente (sem app do morador)?')) return;

        const { error } = await supabase.rpc('confirm_package_pickup', {
            p_package_id: pkgId,
            p_resident_id: selectedResident.id
        });

        if (error) alert('Erro: ' + error.message);
        else fetchResidentPackages(selectedResident.id);
    };

    if (step === 'scan_resident') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Retirada de Encomendas</h1>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
                    <div className="w-24 h-24 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center animate-pulse">
                        <QrCode className="w-12 h-12" />
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black text-slate-900">Mire no QR do Morador</h2>
                        <p className="text-slate-500">Peça para o morador apresentar a identidade digital.</p>
                    </div>

                    <form onSubmit={handleScanResident} className="w-full max-w-sm">
                        <input
                            autoFocus
                            type="text"
                            placeholder="... ou digite o ID"
                            value={residentCode}
                            onChange={(e) => setResidentCode(e.target.value)}
                            className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-4 text-center font-mono text-lg focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!residentCode || loading}
                            className="mt-4 w-full h-12 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                        >
                            {loading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : 'Buscar'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep('scan_resident')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden">
                                {selectedResident.avatar ? <img src={selectedResident.avatar} className="w-full h-full object-cover" /> : <User className="w-5 h-5 m-2.5 text-slate-400" />}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm leading-tight">{selectedResident.name}</p>
                                <p className="text-xs text-slate-500">{selectedResident.tower} - {selectedResident.unit}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6 space-y-6">

                {/* List of Pending Packages */}
                <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs ml-2">Encomendas Disponíveis ({residentPackages.length})</h3>

                {residentPackages.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-400">
                        <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma encomenda pendente para este morador.</p>
                    </div>
                ) : (
                    residentPackages.map(pkg => {
                        const isConfirmed = pkg.status === 'completed';
                        return (
                            <div key={pkg.id} className={`p-5 rounded-2xl border transition-all ${isConfirmed ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 uppercase">{pkg.carrier_name}</span>
                                            {pkg.location && <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> {pkg.location}</span>}
                                        </div>
                                        <h3 className="font-mono text-lg font-bold text-slate-800 tracking-tight">{pkg.internal_code || pkg.original_code}</h3>
                                        <p className="text-xs text-slate-400 mt-1">Entregue por {pkg.courier_name}</p>
                                    </div>
                                    {isConfirmed && (
                                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                            <Check className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                {!isConfirmed ? (
                                    <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
                                        <div className="flex-1 flex items-center gap-2 text-brand-600 text-xs font-bold animate-pulse">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Aguardando aceite do morador...
                                        </div>
                                        <button
                                            onClick={() => handleForceFinish(pkg.id)}
                                            className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            Entrega Manual
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Confirmado {new Date(pkg.confirmed_by_resident_at).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
