import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Box, Printer, Trash2, Plus, Barcode, CheckCircle, Package, ArrowRight } from 'lucide-react';
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

    // UI State
    const [loading, setLoading] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);

    const codeInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus barcode input
    useEffect(() => {
        if (carrierName && courierName) {
            codeInputRef.current?.focus();
        }
    }, [carrierName, courierName, scannedPackages]);

    const handleAddCode = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!currentCode.trim()) return;

        // Prevent duplicates in current batch
        if (scannedPackages.includes(currentCode.trim())) {
            alert('Este código já foi bipado neste lote.');
            setCurrentCode('');
            return;
        }

        setScannedPackages(prev => [currentCode.trim(), ...prev]);
        setCurrentCode('');
        // Keep focus
        codeInputRef.current?.focus();
    };

    const handleRemoveCode = (codeToRemove: string) => {
        setScannedPackages(prev => prev.filter(code => code !== codeToRemove));
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
                created_at: timestamp,
                updated_at: timestamp
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
                            className="h-14 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Printer size={16} /> Imprimir
                        </button>
                        <button
                            onClick={() => onNavigateProcessing()}
                            className="h-14 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-500 transition-all active:scale-95 shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                        >
                            Ir p/ Triagem <ArrowRight size={16} />
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
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-black italic text-slate-900 uppercase tracking-tighter">Recebimento</h1>
                    </div>
                    <div className="text-[10px] font-black bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-brand-100 shadow-sm">
                        Digital Handshake • Passo 1/3
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-6 py-8 space-y-8">

                {/* Transport Info */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center">
                            <Box size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 italic uppercase">Dados da Entrega</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Transportadora & Entregador</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transportadora</label>
                            <input
                                type="text"
                                placeholder="Ex: Mercado Livre, Amazon, Correios..."
                                value={carrierName}
                                onChange={(e) => setCarrierName(e.target.value)}
                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:border-brand-500 focus:bg-white outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entregador (Opcional)</label>
                            <input
                                type="text"
                                placeholder="Nome do entregador..."
                                value={courierName}
                                onChange={(e) => setCourierName(e.target.value)}
                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:border-brand-500 focus:bg-white outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Scanning Area */}
                <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Barcode size={80} className="text-white" />
                    </div>

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 text-white rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Barcode size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white italic uppercase">Bipar Pacotes</h2>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest italic">Aponte o leitor para o código</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddCode} className="relative z-10">
                        <input
                            ref={codeInputRef}
                            type="text"
                            placeholder={carrierName ? "Aguardando BIP..." : "Preencha a transportadora"}
                            value={currentCode}
                            onChange={(e) => setCurrentCode(e.target.value)}
                            disabled={!carrierName}
                            className="w-full h-16 pl-14 pr-6 bg-white/10 text-white border-2 border-white/10 rounded-[28px] focus:border-brand-500 focus:bg-white/20 outline-none font-mono text-xl tracking-widest transition-all placeholder:text-white/20 disabled:opacity-20"
                        />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30">
                            <Plus size={20} />
                        </div>
                    </form>

                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Volumes Coletados</p>
                            <p className="text-4xl font-black italic text-white tracking-tighter leading-none mt-1">{scannedPackages.length}</p>
                        </div>
                        <div className="flex -space-x-3">
                            {Array.from({ length: Math.min(scannedPackages.length, 5) }).map((_, i) => (
                                <div key={i} className="w-10 h-10 bg-brand-500 rounded-xl border-4 border-slate-900 flex items-center justify-center text-white scale-90">
                                    <Package size={14} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* List */}
                {scannedPackages.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">Histórico do Lote</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {scannedPackages.map((code, index) => (
                                <div key={index} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-brand-200 transition-all animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                            <Package size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-mono font-bold text-slate-900 truncate tracking-tight">{code}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Volume #{scannedPackages.length - index}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveCode(code)}
                                        className="w-10 h-10 rounded-xl bg-rose-50 text-rose-400 opacity-0 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-600 transition-all flex items-center justify-center"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Action Button */}
                <div className="pt-8 pb-12">
                    <button
                        onClick={handleFinishReceipt}
                        disabled={loading || scannedPackages.length === 0}
                        className="w-full h-16 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-violet-500/20 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
                    >
                        {loading ? 'Salvando...' : (
                            <>
                                Finalizar Recebimento ({scannedPackages.length})
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                    <p className="text-[9px] text-center font-black text-slate-300 uppercase tracking-widest mt-6">
                        Confirme os volumes bipados acima
                    </p>
                </div>

            </div>
        </div>
    );
};
