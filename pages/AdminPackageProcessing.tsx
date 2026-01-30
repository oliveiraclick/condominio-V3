import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, User, QrCode, ClipboardCheck, Search, MapPin, Smartphone, ArrowRight, Package, ScanLine, X, Loader2, CheckCircle2, Camera } from 'lucide-react';
import { supabase } from '../supabase';
import { Scanner } from '@yudiel/react-qr-scanner';

interface AdminPackageProcessingProps {
    onBack: () => void;
    currentUser: any;
}

export const AdminPackageProcessing: React.FC<AdminPackageProcessingProps> = ({ onBack }) => {
    // UI States
    const [step, setStep] = useState<'search' | 'link' | 'resident' | 'location'>('search');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Data States
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [residents, setResidents] = useState<any[]>([]);
    const [selectedResident, setSelectedResident] = useState<any>(null);

    // Inputs
    const [searchCode, setSearchCode] = useState('');
    const [internalCode, setInternalCode] = useState('');
    const [residentSearch, setResidentSearch] = useState('');
    const [location, setLocation] = useState('');

    // Scanner State
    const [activeScanner, setActiveScanner] = useState<'search' | 'internal' | null>(null);

    // Refs for Focus Management
    const searchInputRef = useRef<HTMLInputElement>(null);
    const internalInputRef = useRef<HTMLInputElement>(null);
    const residentInputRef = useRef<HTMLInputElement>(null);
    const locationInputRef = useRef<HTMLInputElement>(null);

    // Initial Load & Draft Recovery
    useEffect(() => {
        fetchResidents();

        // Recover Draft
        const savedDraft = localStorage.getItem('triage_draft');
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                if (parsed.step) setStep(parsed.step);
                if (parsed.selectedPackage) setSelectedPackage(parsed.selectedPackage);
                if (parsed.internalCode) setInternalCode(parsed.internalCode);
                if (parsed.selectedResident) setSelectedResident(parsed.selectedResident);
                if (parsed.location) setLocation(parsed.location);
            } catch (e) {
                console.error('Error parsing draft', e);
            }
        }
    }, []);

    // Save Draft on Change
    useEffect(() => {
        const draft = {
            step,
            selectedPackage,
            internalCode,
            selectedResident,
            location
        };
        // Only save if we are past the initial step or have some data
        if (step !== 'search' || selectedPackage) {
            localStorage.setItem('triage_draft', JSON.stringify(draft));
        }
    }, [step, selectedPackage, internalCode, selectedResident, location]);

    // Auto-focus logic based on Step
    useEffect(() => {
        if (step === 'search') setTimeout(() => searchInputRef.current?.focus(), 100);
        if (step === 'link') setTimeout(() => internalInputRef.current?.focus(), 100);
        if (step === 'resident') setTimeout(() => residentInputRef.current?.focus(), 100);
        if (step === 'location') setTimeout(() => locationInputRef.current?.focus(), 100);
    }, [step]);

    const fetchResidents = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'resident');
        if (data) setResidents(data);
    };

    // STEP 1: FIND PACKAGE (BIP 1)
    const handleSearchStart = async (code: string) => {
        if (!code.trim()) return;
        setLoading(true);
        try {
            // Find package by original_code (Carrier Barcode)
            const { data, error } = await supabase
                .from('packages')
                .select('*')
                .eq('original_code', code)
                .eq('status', 'pending_processing')
                .single();

            if (data) {
                setSelectedPackage(data);
                setSearchCode(''); // Clear for next clear view
                setStep('link'); // Go to link step
            } else {
                alert('❌ Pacote não encontrado ou já processado!');
                setSearchCode('');
                searchInputRef.current?.focus();
            }
        } catch (e) {
            alert('Erro ao buscar pacote.');
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: LINK INTERNAL TAG (BIP 2)
    const handleLinkInternal = (code: string) => {
        if (!code.trim()) return;
        setInternalCode(code);
        setStep('resident'); // Go to resident step
    };

    // STEP 3: LINK RESIDENT
    const handleSelectResident = (res: any) => {
        setSelectedResident(res);
        setStep('location'); // Go to location step
    };

    // STEP 4: SAVE EVERYTHING
    const handleFinish = async () => {
        if (!selectedPackage || !internalCode || !selectedResident || !location) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('packages')
                .update({
                    resident_id: selectedResident.id,
                    internal_code: internalCode,
                    location: location,
                    status: 'pending', // Ready for pickup
                    processed_at: new Date().toISOString(),
                    processed_by: (await supabase.auth.getUser()).data.user?.id
                })
                .eq('id', selectedPackage.id);

            if (error) throw error;

            // Success! Reset everything for next package
            localStorage.removeItem('triage_draft'); // Clear draft
            setSuccessMessage(`✅ Triagem Concluída!`);
            setTimeout(() => setSuccessMessage(''), 3000);

            // Reset States
            setSelectedPackage(null);
            setSelectedResident(null);
            setInternalCode('');
            setResidentSearch('');
            setLocation('');
            setStep('search'); // Ready for next cycle

        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle Camera Scan
    const handleScan = (results: any[]) => {
        if (results && results.length > 0) {
            const raw = results[0].rawValue;
            if (activeScanner === 'search') {
                setSearchCode(raw);
                handleSearchStart(raw);
            } else if (activeScanner === 'internal') {
                setInternalCode(raw);
                handleLinkInternal(raw);
            }
            setActiveScanner(null);
        }
    };

    // Filter Residents
    const filteredResidents = residents.filter(r =>
        r.name?.toLowerCase().includes(residentSearch.toLowerCase()) ||
        r.unit?.toLowerCase().includes(residentSearch.toLowerCase()) ||
        r.tower?.toLowerCase().includes(residentSearch.toLowerCase())
    ).slice(0, 5); // Limit to 5 for speed

    return (
        <div className="min-h-screen bg-slate-50 pb-32 font-sans selection:bg-brand-500/30">
            {/* Scanner Modal */}
            {activeScanner && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
                    <div className="relative flex-1 bg-black">
                        <button
                            onClick={() => setActiveScanner(null)}
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
                                {activeScanner === 'search' ? 'Bipe o Pacote Original' : 'Bipe a Etiqueta Interna'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {successMessage && (
                <div className="fixed top-0 left-0 right-0 bg-emerald-500 text-white p-6 text-center font-black uppercase tracking-widest z-50 animate-in slide-in-from-top-full shadow-2xl text-sm flex items-center justify-center gap-3">
                    <CheckCircle2 size={24} />
                    {successMessage}
                </div>
            )}

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all border border-slate-200 shadow-sm text-slate-600 active:scale-95">
                        <ArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">Triagem Flash</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modo Produtividade</p>
                    </div>
                </div>
                {selectedPackage && (
                    <div className="hidden sm:block px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Processando</p>
                        <p className="font-mono font-bold text-slate-700 tracking-widest">{selectedPackage.original_code.slice(0, 12)}...</p>
                    </div>
                )}
            </div>

            <div className="max-w-xl mx-auto p-6 space-y-6 mt-2">

                {/* Progress Indicators */}
                <div className="flex gap-2 mb-8 px-2">
                    {['search', 'link', 'resident', 'location'].map((s, i) => {
                        const isActive = s === step;
                        const isPast = ['search', 'link', 'resident', 'location'].indexOf(step) > i;
                        return (
                            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${isActive ? 'bg-slate-900' : isPast ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                        );
                    })}
                </div>

                {/* STEP 1: SEARCH (SCAN 1) */}
                {step === 'search' && (
                    <div className="space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="text-center py-4">
                            <div className="w-24 h-24 bg-slate-100 text-slate-900 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-200 border border-slate-200 animate-pulse">
                                <Camera size={48} />
                            </div>
                            <h2 className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter">Bipe o Pacote</h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest mt-2 text-[10px]">Etiqueta da Transportadora</p>
                        </div>

                        <div className="relative group">
                            <input
                                ref={searchInputRef}
                                autoFocus
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSearchStart(searchCode);
                                }}
                                className="w-full h-24 bg-white border-2 border-slate-200 rounded-[32px] px-8 pl-8 pr-24 text-2xl font-mono text-center tracking-widest text-slate-900 focus:border-slate-900 focus:shadow-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                                placeholder="BIP AQUI"
                            />
                            <button
                                onClick={() => setActiveScanner('search')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-20 h-20 bg-slate-900 text-white rounded-[24px] flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                            >
                                <Camera size={32} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: LINK (SCAN 2) */}
                {step === 'link' && (
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8 animate-in slide-in-from-right-8 duration-300">
                        {/* Summary Card */}
                        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-900 shrink-0 shadow-sm border border-slate-100"><Package size={28} /></div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pacote Identificado</p>
                                <h3 className="font-bold text-slate-900 text-base truncate">{selectedPackage?.carrier_name}</h3>
                                <p className="text-xs text-slate-500 font-mono tracking-wider truncate text-ellipsis">{selectedPackage?.original_code}</p>
                            </div>
                        </div>

                        <div className="text-center py-2">
                            <div className="w-24 h-24 bg-slate-100 text-slate-900 rounded-[32px] flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                                <Camera size={48} />
                            </div>
                            <h2 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">Etiqueta Interna</h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest mt-1 text-[10px]">Vincule nosso QR Code</p>
                        </div>

                        <div className="relative group">
                            <input
                                ref={internalInputRef}
                                autoFocus
                                value={internalCode}
                                onChange={(e) => setInternalCode(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleLinkInternal(internalCode);
                                }}
                                className="w-full h-24 bg-white border-2 border-slate-200 rounded-[32px] px-8 pl-8 pr-24 text-2xl font-mono text-center tracking-widest text-slate-900 focus:border-slate-900 focus:shadow-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                                placeholder="QR CODE"
                            />
                            <button
                                onClick={() => setActiveScanner('internal')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-20 h-20 bg-slate-900 text-white rounded-[24px] flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                            >
                                <Camera size={32} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: RESIDENT */}
                {step === 'resident' && (
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Origem</p>
                                <p className="font-bold text-slate-900 text-xs truncate font-mono">{selectedPackage?.original_code?.slice(-6)}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-1">Interno</p>
                                <p className="font-bold text-slate-900 text-xs truncate font-mono">{internalCode}</p>
                            </div>
                        </div>

                        <div className="text-center pt-2">
                            <h2 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">Destinatário</h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest mt-1 text-[10px]">Quem vai receber?</p>
                        </div>

                        <div className="relative">
                            <input
                                ref={residentInputRef}
                                autoFocus
                                value={residentSearch}
                                onChange={(e) => setResidentSearch(e.target.value)}
                                className="w-full h-24 bg-slate-50 border-2 border-slate-200 rounded-[24px] px-8 pl-8 pr-14 text-2xl font-bold text-slate-900 focus:border-brand-600 focus:bg-white focus:shadow-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                                placeholder="Nome, Bloco ou Unidade..."
                            />
                            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                        </div>

                        <div className="space-y-3">
                            {filteredResidents.map(res => (
                                <button
                                    key={res.id}
                                    onClick={() => handleSelectResident(res)}
                                    className="w-full bg-white p-4 rounded-2xl border border-slate-100 hover:border-brand-300 hover:bg-brand-50/30 transition-all flex items-center justify-between group active:scale-[0.98]"
                                >
                                    <div className="text-left flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                                            {res.unit}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 italic text-base leading-tight">{res.name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{res.tower}</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 4: LOCATION */}
                {step === 'location' && (
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-8 animate-in slide-in-from-right-8 duration-300">
                        <div className="bg-brand-900 p-8 rounded-[24px] flex items-center gap-6 shadow-xl shadow-brand-900/20 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <User size={100} />
                            </div>
                            <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white"><User size={32} /></div>
                            <div className="relative z-10">
                                <h3 className="font-black text-white text-xl italic">{selectedResident?.name}</h3>
                                <p className="text-[10px] text-brand-200 font-bold uppercase tracking-widest mt-1">Unidade {selectedResident?.unit} • {selectedResident?.tower}</p>
                            </div>
                        </div>

                        <div className="text-center py-2">
                            <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-[24px] flex items-center justify-center mx-auto mb-4 border border-brand-200 shadow-sm animate-bounce-slow">
                                <MapPin size={40} />
                            </div>
                            <h2 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">Armazenamento</h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest mt-1 text-[10px]">Onde vai ficar guardado?</p>
                        </div>

                        <input
                            ref={locationInputRef}
                            autoFocus
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleFinish();
                            }}
                            className="w-full h-24 bg-slate-50 border-2 border-slate-200 rounded-[24px] px-8 text-2xl font-bold text-center text-slate-900 focus:border-brand-600 focus:bg-white focus:shadow-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                            placeholder="Ex: P-01, Box A"
                        />

                        <button
                            onClick={handleFinish}
                            className="w-full h-16 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm"
                        >
                            <CheckCircle2 size={20} />
                            Confirmar & Finalizar
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
