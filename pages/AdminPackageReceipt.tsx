import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Box, Printer, Trash2, Plus, Barcode, CheckCircle, Package } from 'lucide-react';
import { supabase } from '../supabase';

interface AdminPackageReceiptProps {
    onBack: () => void;
    currentUser: any;
}

export const AdminPackageReceipt: React.FC<AdminPackageReceiptProps> = ({ onBack, currentUser }) => {
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
                status: 'pending_processing', // New status for Step 2
                batch_id: batchId,
                created_at: timestamp,
                updated_at: timestamp
                // resident_id is NULL until processing
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
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10" />
                    </div>

                    <h2 className="text-2xl font-black text-slate-800">Recebimento Concluído!</h2>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 space-y-3 text-left">
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Data:</span>
                            <span className="font-bold text-slate-700">{receiptData.date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Transportadora:</span>
                            <span className="font-bold text-slate-700">{receiptData.carrier}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Entregador:</span>
                            <span className="font-bold text-slate-700">{receiptData.courier}</span>
                        </div>
                        <div className="border-t border-slate-200 my-2 pt-2 flex justify-between items-center">
                            <span className="text-slate-900 font-bold uppercase">Total de Volumes</span>
                            <span className="text-2xl font-black text-brand-600">{receiptData.count}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="flex-1 flex items-center justify-center gap-2 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                        >
                            <Printer className="w-5 h-5" />
                            Imprimir
                        </button>
                        <button
                            onClick={() => setShowReceipt(false)}
                            className="flex-1 h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-brand-600/20"
                        >
                            Novo Lote
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900">Recebimento de Encomendas</h1>
                    </div>
                    <div className="text-xs font-bold bg-brand-100 text-brand-700 px-3 py-1 rounded-full uppercase tracking-wide">
                        Passo 1 de 3
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6 space-y-6">

                {/* Transport Info */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Box className="w-4 h-4" />
                        Dados da Entrega
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Transportadora</label>
                            <input
                                type="text"
                                placeholder="Ex: Correios, DHL, Mercado Livre..."
                                value={carrierName}
                                onChange={(e) => setCarrierName(e.target.value)}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Nome do Entregador</label>
                            <input
                                type="text"
                                placeholder="Nome ou RG do entregador"
                                value={courierName}
                                onChange={(e) => setCourierName(e.target.value)}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-medium transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Scanning Area */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Barcode className="w-4 h-4" />
                        Bipar Pacotes
                    </h2>

                    <form onSubmit={handleAddCode} className="relative">
                        <input
                            ref={codeInputRef}
                            type="text"
                            placeholder={carrierName && courierName ? "Bipe o código de barras aqui..." : "Preencha a transportadora primeiro"}
                            value={currentCode}
                            onChange={(e) => setCurrentCode(e.target.value)}
                            disabled={!carrierName || !courierName}
                            className="w-full h-14 pl-12 pr-4 bg-slate-900 text-white placeholder-slate-500 border-none rounded-2xl focus:ring-4 focus:ring-brand-500/30 outline-none font-mono text-lg tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6" />
                        <button
                            type="submit"
                            disabled={!currentCode.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-0 transition-all shadow-lg shadow-brand-500/30"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </form>

                    <div className="flex justify-between items-center px-2">
                        <span className="text-xs text-slate-400 font-medium">
                            Itens neste lote:
                        </span>
                        <span className="text-2xl font-black text-slate-800">
                            {scannedPackages.length}
                        </span>
                    </div>
                </div>

                {/* List */}
                {scannedPackages.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Histórico do Lote</h3>
                        {scannedPackages.map((code, index) => (
                            <div key={index} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-mono font-bold text-slate-700 truncate text-sm">{code}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Volume {scannedPackages.length - index}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveCode(code)}
                                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-20">
                <div className="max-w-xl mx-auto">
                    <button
                        onClick={handleFinishReceipt}
                        disabled={loading || scannedPackages.length === 0}
                        className="w-full h-14 bg-brand-gradient-horizontal text-brand-contrast rounded-2xl font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-brand-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Salvando...' : `Finalizar Recebimento (${scannedPackages.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};
