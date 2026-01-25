import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, User, MapPin, QrCode, Upload, ArrowRight, Package } from 'lucide-react';
import { supabase } from '../supabase';

interface AdminPackageProcessingProps {
    onBack: () => void;
    currentUser: any;
    onNavigate: (tab: string) => void;
}

export const AdminPackageProcessing: React.FC<AdminPackageProcessingProps> = ({ onBack, currentUser, onNavigate }) => {
    // Selection State
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [step, setStep] = useState<'select' | 'details'>('select');

    // Data State
    const [pendingPackages, setPendingPackages] = useState<any[]>([]);
    const [residents, setResidents] = useState<any[]>([]);

    // Form State (Details)
    const [internalCode, setInternalCode] = useState('');
    const [location, setLocation] = useState('');
    const [residentSearch, setResidentSearch] = useState('');
    const [selectedResident, setSelectedResident] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingPackages();
        fetchResidents();
    }, []);

    const fetchPendingPackages = async () => {
        const { data } = await supabase
            .from('packages')
            .select('*')
            .eq('status', 'pending_processing')
            .order('created_at', { ascending: false });
        if (data) setPendingPackages(data);
    };

    const fetchResidents = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, name, tower, unit, avatar')
            .eq('role', 'resident');
        if (data) setResidents(data);
    };

    const handleSelectPackage = (pkg: any) => {
        setSelectedPackage(pkg);
        setInternalCode(''); // Reset for new scan
        setStep('details');
    };

    const handleSaveProcessing = async () => {
        if (!selectedResident || !location || !internalCode) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            // Update Package
            const { error } = await supabase
                .from('packages')
                .update({
                    resident_id: selectedResident.id,
                    internal_code: internalCode,
                    location: location,
                    status: 'awaiting_confirmation', // Ready for resident to pick up
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedPackage.id);

            if (error) throw error;

            // Trigger Push Notification
            supabase.functions.invoke('push', {
                body: {
                    title: 'Encomenda Recebida! 📦',
                    body: `Sua encomenda chegou e está na ${location}. Acesse o app para confirmar.`,
                    target_user_id: selectedResident.id,
                    data: {
                        type: 'package_arrived',
                        packageId: selectedPackage.id
                    }
                }
            }).catch(console.error);

            alert('Pacote processado com sucesso!');
            setSelectedPackage(null);
            setStep('select');
            fetchPendingPackages();

        } catch (error: any) {
            console.error('Error processing package:', error);
            alert('Erro: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredResidents = residents.filter(r =>
        r.name.toLowerCase().includes(residentSearch.toLowerCase()) ||
        r.unit.includes(residentSearch)
    );

    if (step === 'select') {
        return (
            <div className="min-h-screen bg-slate-50 pb-20">
                <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <ArrowLeft className="w-6 h-6 text-slate-600" />
                            </button>
                            <h1 className="text-lg font-bold text-slate-900">Processar Encomendas</h1>
                        </div>
                        <div className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase tracking-wide">
                            Pendentes: {pendingPackages.length}
                        </div>
                    </div>
                </div>

                <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
                    {pendingPackages.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">Nenhum pacote pendente.</p>
                        </div>
                    ) : (
                        pendingPackages.map(pkg => (
                            <button
                                key={pkg.id}
                                onClick={() => handleSelectPackage(pkg)}
                                className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-brand-200 transition-all active:scale-[0.98] text-left group"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg uppercase">
                                            {pkg.carrier_name}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">
                                            {pkg.original_code}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800">Entregue por {pkg.courier_name}</h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Recebido em {new Date(pkg.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600" />
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep('select')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900">Detalhes do Pacote</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6 space-y-6">

                {/* Package Info Card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Objeto Selecionado</p>
                            <p className="font-bold text-slate-800">{selectedPackage?.original_code}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-slate-400 text-xs">Transportadora</span>
                            <span className="font-medium text-slate-700">{selectedPackage?.carrier_name}</span>
                        </div>
                        <div>
                            <span className="block text-slate-400 text-xs">Entregador</span>
                            <span className="font-medium text-slate-700">{selectedPackage?.courier_name}</span>
                        </div>
                    </div>
                </div>

                {/* 1. Internal Code (QR) */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-brand-500" />
                        1. Etiqueta Interna (QR)
                    </label>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Bipe a etiqueta interna..."
                        value={internalCode}
                        onChange={(e) => setInternalCode(e.target.value)}
                        className="w-full h-14 px-4 bg-white border border-slate-200 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none font-mono text-lg transition-all"
                    />
                </div>

                {/* 2. Resident Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                        <User className="w-4 h-4 text-brand-500" />
                        2. Vincular Morador
                    </label>

                    {!selectedResident ? (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar por nome ou unidade..."
                                value={residentSearch}
                                onChange={(e) => setResidentSearch(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 bg-white border border-slate-200 rounded-xl focus:border-brand-500 outline-none transition-all"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />

                            {residentSearch.length > 1 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto z-20">
                                    {filteredResidents.map(res => (
                                        <button
                                            key={res.id}
                                            onClick={() => { setSelectedResident(res); setResidentSearch(''); }}
                                            className="w-full p-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-none flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
                                                {res.avatar ? <img src={res.avatar} className="w-full h-full object-cover" /> : <User className="w-4 h-4 m-2 text-slate-400" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{res.name}</p>
                                                <p className="text-xs text-slate-400">{res.tower} - {res.unit}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full overflow-hidden border border-brand-100">
                                    {selectedResident.avatar ? <img src={selectedResident.avatar} className="w-full h-full object-cover" /> : <User className="w-5 h-5 m-2.5 text-brand-300" />}
                                </div>
                                <div>
                                    <p className="font-bold text-brand-900 text-sm">{selectedResident.name}</p>
                                    <p className="text-xs text-brand-600 font-medium">{selectedResident.tower} - {selectedResident.unit}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedResident(null)}
                                className="text-xs font-bold text-brand-500 hover:text-brand-700 uppercase"
                            >
                                Trocar
                            </button>
                        </div>
                    )}
                </div>

                {/* 3. Location */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-500" />
                        3. Localização no Estoque
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Prateleira A, Bandeja 2..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:border-brand-500 outline-none font-medium transition-all"
                    />
                </div>

            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-20">
                <div className="max-w-xl mx-auto">
                    <button
                        onClick={handleSaveProcessing}
                        disabled={loading}
                        className="w-full h-14 bg-brand-gradient-horizontal text-brand-contrast rounded-2xl font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-brand-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Salvando...' : 'Salvar e Notificar Morador'}
                    </button>
                </div>
            </div>
        </div>
    );
};
