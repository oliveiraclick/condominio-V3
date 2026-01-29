import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, QrCode, ClipboardCheck, ArrowUpRight, Search, MapPin, Smartphone, ArrowRight, Package } from 'lucide-react';
import { supabase } from '../supabase';

interface AdminPackageProcessingProps {
    onBack: () => void;
    currentUser: any;
}

export const AdminPackageProcessing: React.FC<AdminPackageProcessingProps> = ({ onBack }) => {
    // State
    const [step, setStep] = useState<'select' | 'form'>('select');
    const [pendingPackages, setPendingPackages] = useState<any[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [residents, setResidents] = useState<any[]>([]);
    const [residentSearch, setResidentSearch] = useState('');
    const [selectedResident, setSelectedResident] = useState<any>(null);
    const [internalCode, setInternalCode] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingPackages();
        fetchResidents();
    }, []);

    const fetchPendingPackages = async () => {
        try {
            const { data, error } = await supabase
                .from('packages')
                .select('*')
                .eq('status', 'pending_processing')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPendingPackages(data || []);
        } catch (err) {
            console.error('Error fetching pending:', err);
        }
    };

    const fetchResidents = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'resident');

            if (error) throw error;
            setResidents(data || []);
        } catch (err) {
            console.error('Error fetching residents:', err);
        }
    };

    const handleSelectPackage = (pkg: any) => {
        setSelectedPackage(pkg);
        setStep('form');
    };

    const handleSaveProcessing = async () => {
        if (!selectedResident || !internalCode || !location) {
            alert('Preencha todos os campos!');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('packages')
                .update({
                    status: 'pending',
                    resident_id: selectedResident.id,
                    internal_code: internalCode,
                    location: location,
                    processed_at: new Date().toISOString(),
                    processed_by: (await supabase.auth.getUser()).data.user?.id
                })
                .eq('id', selectedPackage.id);

            if (error) throw error;

            alert('Encomenda processada e morador notificado!');
            setStep('select');
            setSelectedPackage(null);
            setSelectedResident(null);
            setInternalCode('');
            setLocation('');
            fetchPendingPackages();
        } catch (err) {
            console.error('Error processing:', err);
            alert('Erro ao salvar triagem');
        } finally {
            setLoading(false);
        }
    };

    const filteredResidents = residents.filter(res =>
        res.name.toLowerCase().includes(residentSearch.toLowerCase()) ||
        res.unit?.toString().includes(residentSearch)
    );

    if (step === 'select') {
        return (
            <div className="min-h-screen bg-slate-50 pb-32">
                <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
                    <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={onBack} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-lg font-black italic text-slate-900 uppercase tracking-tighter">Triagem Pendente</h1>
                        </div>
                        <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            {pendingPackages.length} Aguardando
                        </div>
                    </div>
                </div>

                <div className="max-w-xl mx-auto px-6 py-8">
                    {pendingPackages.length === 0 ? (
                        <div className="bg-white p-12 rounded-[40px] text-center border-2 border-dashed border-slate-200 space-y-4">
                            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <ClipboardCheck size={40} />
                            </div>
                            <div>
                                <p className="font-black text-slate-300 uppercase italic text-sm">Tudo Organizado!</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Nenhum volume para triar</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {pendingPackages.map(pkg => (
                                <button
                                    key={pkg.id}
                                    onClick={() => handleSelectPackage(pkg)}
                                    className="w-full bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-all active:scale-[0.98] text-left group overflow-hidden relative"
                                >
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 scale-y-50 group-hover:scale-y-100 transition-transform origin-top"></div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                {pkg.carrier_name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono font-bold">
                                                ID: {pkg.original_code.slice(0, 10)}...
                                            </span>
                                        </div>
                                        <h3 className="font-black text-slate-900 italic uppercase text-sm tracking-tight">Entregador: {pkg.courier_name || 'Não inf.'}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                                            Recebido em {new Date(pkg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(pkg.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:scale-110 transition-all">
                                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep('select')} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-black italic text-slate-900 uppercase tracking-tighter">Detalhes da Triagem</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-6 py-8 space-y-8">

                {/* Package Info Card */}
                <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 scale-150">
                        <Package size={80} className="text-white" />
                    </div>
                    <div className="relative z-10 flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Objeto Selecionado</p>
                            <h2 className="text-lg font-black italic text-white uppercase tracking-tight">{selectedPackage?.original_code}</h2>
                        </div>
                    </div>
                    <div className="relative z-10 grid grid-cols-2 gap-8 border-t border-white/5 pt-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Transportadora</span>
                            <span className="block font-bold text-white uppercase italic">{selectedPackage?.carrier_name}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Entregador</span>
                            <span className="block font-bold text-white uppercase italic">{selectedPackage?.courier_name || 'Não Inf.'}</span>
                        </div>
                    </div>
                </div>

                {/* 1. Internal Code (QR) */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                            <QrCode size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 italic uppercase">1. Etiqueta Interna</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Identificador do Condomínio</p>
                        </div>
                    </div>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Bipe a etiqueta interna..."
                        value={internalCode}
                        onChange={(e) => setInternalCode(e.target.value)}
                        className="w-full h-16 px-6 bg-slate-50 border border-slate-100 rounded-[28px] focus:border-amber-500 focus:bg-white outline-none font-mono text-xl tracking-widest transition-all placeholder:text-slate-300"
                    />
                </div>

                {/* 2. Resident Selection */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 italic uppercase">2. Vincular Morador</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dono da Encomenda</p>
                        </div>
                    </div>

                    {!selectedResident ? (
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Buscar por nome ou unidade..."
                                value={residentSearch}
                                onChange={(e) => setResidentSearch(e.target.value)}
                                className="w-full h-16 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-[28px] focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300 shadow-inner"
                            />
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors" size={20} />

                            {residentSearch.length > 1 && (
                                <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[32px] shadow-2xl border border-slate-100 max-h-72 overflow-y-auto z-20 animate-in slide-in-from-top-4 duration-300">
                                    <div className="p-2 space-y-1">
                                        {filteredResidents.map(res => (
                                            <button
                                                key={res.id}
                                                onClick={() => { setSelectedResident(res); setResidentSearch(''); }}
                                                className="w-full p-4 text-left hover:bg-emerald-50 rounded-2xl flex items-center gap-4 transition-all group/item"
                                            >
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 group-hover/item:border-emerald-100">
                                                    {res.avatar ? <img src={res.avatar} className="w-full h-full object-cover" /> : <User className="w-6 h-6 m-3 text-slate-200" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black text-slate-900 italic uppercase text-sm">{res.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{res.tower} • Unidade {res.unit}</p>
                                                </div>
                                                <ArrowRight size={16} className="text-slate-200 group-hover/item:text-emerald-500 group-hover/item:translate-x-1 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[32px] flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden border-2 border-emerald-200 shadow-sm transition-transform group-hover:scale-105">
                                    {selectedResident.avatar ? <img src={selectedResident.avatar} className="w-full h-full object-cover" /> : <User className="w-7 h-7 m-3.5 text-emerald-200" />}
                                </div>
                                <div>
                                    <p className="font-black text-emerald-900 italic uppercase tracking-tight">{selectedResident.name}</p>
                                    <p className="text-[11px] text-emerald-600 font-black uppercase tracking-widest">{selectedResident.tower} • UNIDADE {selectedResident.unit}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedResident(null)}
                                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 hover:bg-emerald-100 transition-colors shadow-sm"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* 3. Location */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 italic uppercase">3. Localização</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Onde será guardado</p>
                        </div>
                    </div>
                    <input
                        type="text"
                        placeholder="Ex: Prateleira A, Gaveta 4..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full h-16 px-6 bg-slate-50 border border-slate-100 rounded-[28px] focus:border-violet-500 focus:bg-white outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300 shadow-inner"
                    />
                </div>

                {/* Action Button */}
                <div className="pt-8 pb-12">
                    <button
                        onClick={handleSaveProcessing}
                        disabled={loading || !selectedResident || !location || !internalCode}
                        className="w-full h-16 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
                    >
                        {loading ? 'Processando...' : (
                            <>
                                <Smartphone size={18} />
                                Notificar Morador
                            </>
                        )}
                    </button>
                    <p className="text-[9px] text-center font-black text-slate-300 uppercase tracking-widest mt-6">
                        O morador receberá uma notificação push
                    </p>
                </div>

            </div>
        </div>
    );
};
