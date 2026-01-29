import React, { useState, useRef, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ArrowLeft, Box, Printer, Trash2, Plus, Barcode, CheckCircle, Package, ArrowRight, Camera, X, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';

interface AdminPackageReceiptProps {
    onBack: () => void;
    currentUser: any;
    onNavigateProcessing: () => void;
}

export const AdminPackageReceipt: React.FC<AdminPackageReceiptProps> = ({ onBack, currentUser, onNavigateProcessing }) => {
    // Form State
    const [carrierName, setCarrierName] = useState('');
    const [courierName, setCourierName] = useState('');
    const [currentCode, setCurrentCode] = useState('');
    const [scannedPackages, setScannedPackages] = useState<string[]>([]);

    // Scanner State
    const [isScanning, setIsScanning] = useState(false);

    // UI State
    const [loading, setLoading] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState({ count: 0, batchId: '', carrier: '' });

    // LOAD DRAFT FROM LOCAL STORAGE
    useEffect(() => {
        const saved = localStorage.getItem('packageReceiptDraft');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.scannedPackages?.length > 0 || parsed.carrierName) {
                    setScannedPackages(parsed.scannedPackages || []);
                    setCarrierName(parsed.carrierName || '');
                    setCourierName(parsed.courierName || '');
                    // Quiet recovery (no alert needed for seamless flow)
                }
            } catch (e) {
                console.error("Error loading draft", e);
            }
        }
    }, []);

    // SAVE DRAFT TO LOCAL STORAGE AUTO
    useEffect(() => {
        if (scannedPackages.length > 0 || carrierName || courierName) {
            localStorage.setItem('packageReceiptDraft', JSON.stringify({
                scannedPackages,
                carrierName,
                courierName,
                timestamp: new Date().getTime()
            }));
        } else {
            // If all fields are empty, clear the draft
            localStorage.removeItem('packageReceiptDraft');
        }
    }, [scannedPackages, carrierName, courierName]);

    const codeInputRef = useRef<HTMLInputElement>(null);

    // Auth Modal State
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [supervisorPassword, setSupervisorPassword] = useState('');
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Auto-focus barcode input
    useEffect(() => {
        if (carrierName && !isScanning && !authModalOpen) {
            const active = document.activeElement;
            const isFormInput = active instanceof HTMLInputElement && (active.placeholder.includes("Transportadora") || active.placeholder.includes("Entregador") || active.type === "password");

            if (!isFormInput) {
                codeInputRef.current?.focus();
            }
        }
    }, [scannedPackages, isScanning, authModalOpen]);

    const playBeep = () => {
        const beep = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        beep.play().catch(e => console.error("Audio play error", e));
    };

    const processCode = (code: string) => {
        if (!code) return;
        const cleanCode = code.trim();

        if (scannedPackages.includes(cleanCode)) {
            alert('❌ ERRO: Este pacote JÁ FOI BIPADO neste lote!');
            return;
        }

        playBeep();
        setScannedPackages(prev => [cleanCode, ...prev]);
        setCurrentCode('');
    };

    const handleAddCode = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!currentCode.trim()) return;
        processCode(currentCode);
    };

    const handleRequestDelete = (code: string) => {
        setItemToDelete(code);
        setSupervisorPassword('');
        setAuthModalOpen(true);
    };

    const handleConfirmDelete = (e?: React.FormEvent) => {
        e?.preventDefault();
        // Hardcoded Pin for MVP "Supervisor"
        if (supervisorPassword === '1234') {
            if (itemToDelete) {
                setScannedPackages(prev => prev.filter(code => code !== itemToDelete));
            }
            setAuthModalOpen(false);
            setItemToDelete(null);
            setSupervisorPassword('');
        } else {
            alert('Senha incorreta! Chame o supervisor.');
            setSupervisorPassword('');
        }
    };

    const handleFinishReceipt = async () => {
        if (!carrierName || !courierName) {
            alert('Preencha os dados da transportadora.');
            return;
        }
        if (scannedPackages.length === 0) {
            alert('Bipe pelo menos um pacote.');
            return;
        }

        setLoading(true);
        try {
            const batchId = crypto.randomUUID();
            const timestamp = new Date().toISOString();

            // Prepare Insert Data
            const inserts = scannedPackages.map(code => ({
                original_code: code,
                carrier_name: carrierName,
                courier_name: courierName,
                status: 'pending_processing',
                batch_id: batchId,
                created_at: timestamp
            }));

            const { error } = await supabase.from('packages').insert(inserts);

            if (error) throw error;

            setReceiptData({
                batchId,
                count: scannedPackages.length,
                carrier: carrierName,
                courier: courierName,
                date: new Date().toLocaleString()
            });
            setShowReceipt(true);
            setScannedPackages([]);
            setCarrierName('');
            setCourierName('');
            localStorage.removeItem('packageReceiptDraft'); // Clear draft
        } catch (error: any) {
            console.error('Error saving batch:', error);
            alert('Erro ao salvar lote: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (showReceipt) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pb-32">
                <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl border border-slate-100 text-center space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-inner">
                        <CheckCircle className="w-10 h-10" />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-3xl font-black italic text-slate-900 tracking-tighter uppercase">Recebido!</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lote #{receiptData.batchId.split('-')[0]}</p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-4 text-left shadow-inner">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-black text-slate-400 uppercase tracking-widest">Transportadora</span>
                            <span className="font-bold text-slate-900 italic">{receiptData.carrier}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-black text-slate-400 uppercase tracking-widest">Volumes</span>
                            <span className="text-2xl font-black text-brand-600 italic tracking-tighter">{receiptData.count}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => window.print()}
                            className="h-16 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Printer size={18} /> Imprimir
                        </button>
                        <button
                            onClick={() => onNavigateProcessing()}
                            className="h-16 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-500 transition-all active:scale-95 shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                        >
                            Ir p/ Triagem <ArrowRight size={18} />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowReceipt(false)}
                        className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                    >
                        Novo Lote de Entrada
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32 font-sans">

            {/* Camera Scanner Modal */}
            {isScanning && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
                    <div className="relative flex-1 bg-black">
                        <button
                            onClick={() => setIsScanning(false)}
                            className="absolute top-6 right-6 z-50 w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
                        >
                            <X size={28} />
                        </button>
                        <Scanner
                            onScan={(result) => {
                                if (result && result.length > 0) {
                                    const val = result[0].rawValue;
                                    if (val) processCode(val);
                                }
                            }}
                            allowMultiple={true}
                            scanDelay={2000} // Wait 2s before scanning same code again
                        />
                        <div className="absolute bottom-24 left-0 right-0 text-center pointer-events-none">
                            <p className="text-white font-bold bg-black/50 inline-block px-6 py-3 rounded-full backdrop-blur text-sm uppercase tracking-widest border border-white/10">
                                Aponte para o código de barras
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm active:scale-95"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">Recebimento</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Handshake</p>
                        </div>
                    </div>
                    {scannedPackages.length > 0 && (
                        <button
                            onClick={() => {
                                if (window.confirm('Deseja descartar este rascunho e começar do zero?')) {
                                    setScannedPackages([]);
                                    setCarrierName('');
                                    setCourierName('');
                                    localStorage.removeItem('packageReceiptDraft');
                                }
                            }}
                            className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-xl mx-auto px-6 py-8 space-y-8">

                {/* Transport Info Card */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
                            <Box size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 italic uppercase tracking-tight">Dados da Entrega</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Transportadora</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <input
                            type="text"
                            placeholder="Nome da Transportadora"
                            value={carrierName}
                            onChange={(e) => setCarrierName(e.target.value)}
                            className="w-full h-24 px-8 bg-slate-50 border-2 border-slate-200 rounded-[32px] focus:border-slate-900 focus:bg-white outline-none font-bold text-xl text-slate-900 transition-all placeholder:text-slate-300 shadow-sm"
                        />
                        <input
                            type="text"
                            placeholder="Entregador (Opcional)"
                            value={courierName}
                            onChange={(e) => setCourierName(e.target.value)}
                            className="w-full h-24 px-8 bg-slate-50 border-2 border-slate-200 rounded-[32px] focus:border-slate-900 focus:bg-white outline-none font-bold text-xl text-slate-900 transition-all placeholder:text-slate-300 shadow-sm"
                        />
                    </div>
                </div>

                {/* Scanning Area */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                    <div className="text-center py-2">
                        <div className="w-24 h-24 bg-slate-100 text-slate-900 rounded-[32px] flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm animate-pulse">
                            <Camera size={48} />
                        </div>
                        <h2 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">Bipar Pacotes</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest mt-1 text-[10px]">Use a câmera ou scanner USB</p>
                    </div>

                    <form onSubmit={handleAddCode} className="relative group">
                        <input
                            ref={codeInputRef}
                            type="text"
                            placeholder={carrierName ? "BIPAR AGORA" : "Preencha acima"}
                            value={currentCode}
                            onChange={(e) => setCurrentCode(e.target.value)}
                            disabled={!carrierName}
                            className="w-full h-24 bg-white border-2 border-slate-200 rounded-[32px] px-8 pl-8 pr-24 text-2xl font-mono text-center tracking-widest text-slate-900 focus:border-slate-900 focus:shadow-2xl outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-300 shadow-sm"
                        />
                        {/* Camera Trigger Button */}
                        <button
                            type="button"
                            onClick={() => {
                                if (!carrierName) {
                                    alert("Preencha a transportadora antes de iniciar a câmera.");
                                    return;
                                }
                                setIsScanning(true);
                            }}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-20 h-20 rounded-[24px] flex items-center justify-center transition-all ${carrierName ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                            title="Abrir Câmera"
                        >
                            <Camera size={32} />
                        </button>
                    </form>

                    <div className="flex justify-between items-end px-4">
                        <div className="mb-2">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Volumes Coletados</p>
                            <p className="text-5xl font-black italic text-slate-900 tracking-tighter leading-none mt-1">{scannedPackages.length}</p>
                        </div>
                        <div className="flex -space-x-3 mb-2">
                            {Array.from({ length: Math.min(scannedPackages.length, 5) }).map((_, i) => (
                                <div key={i} className="w-10 h-10 bg-emerald-500 rounded-xl border-4 border-white flex items-center justify-center text-white shadow-sm">
                                    <Package size={14} />
                                </div>
                            ))}
                            {scannedPackages.length > 5 && (
                                <div className="w-10 h-10 bg-slate-100 rounded-xl border-4 border-white flex items-center justify-center text-slate-400 font-bold text-xs shadow-sm">
                                    +{scannedPackages.length - 5}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleFinishReceipt}
                            disabled={loading || scannedPackages.length === 0}
                            className="w-full h-20 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-sm hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-30 disabled:hover:bg-slate-900 shadow-xl shadow-slate-900/20"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    <span className="font-bold">FINALIZAR LOTE</span>
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">
                                        {scannedPackages.length}
                                    </span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* List */}
                {scannedPackages.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 italic opacity-50">Histórico Recente</h3>
                        <div className="space-y-3">
                            {scannedPackages.map((code, index) => (
                                <div key={index} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all animate-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="flex items-center gap-5 overflow-hidden">
                                        <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            <Package size={24} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-mono font-bold text-slate-900 text-lg truncate tracking-tight">{code}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Volume #{scannedPackages.length - index}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRequestDelete(code)}
                                        className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-400 opacity-0 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-600 transition-all flex items-center justify-center active:scale-90"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Auth Modal for Deletion */}
            {
                authModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-sm p-8 rounded-[40px] shadow-2xl scale-100 animate-in zoom-in-95 duration-200 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">Autorização</h3>
                                <button onClick={() => setAuthModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                                <p className="text-xs text-rose-800 font-bold leading-relaxed text-center">
                                    A exclusão de pacotes processados requer senha de supervisor.
                                </p>
                            </div>

                            <form onSubmit={handleConfirmDelete} className="space-y-6">
                                <div>
                                    <input
                                        autoFocus
                                        type="password"
                                        placeholder="PIN Supervisor"
                                        value={supervisorPassword}
                                        onChange={(e) => setSupervisorPassword(e.target.value)}
                                        className="w-full h-20 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-rose-500 focus:bg-white outline-none font-black text-3xl text-slate-900 tracking-[0.5em] text-center shadow-inner"
                                        maxLength={4}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full h-16 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 active:scale-95"
                                >
                                    Confirmar Exclusão
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

        </div >
    );
};
