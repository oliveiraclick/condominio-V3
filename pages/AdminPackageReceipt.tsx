import React, { useState } from 'react';
import { ArrowLeft, PackageCheck, Printer } from 'lucide-react';
import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

// Importing Steps
import { BulkSessionStep } from '../components/BulkSessionStep';
import { BulkScanStep } from '../components/BulkScanStep';

import { Title, Text } from '../components/design-system/Typography';
import { DSButton } from '../components/design-system/Button';

interface AdminPackageReceiptProps {
    onBack: () => void;
    currentUser: any;
    onNavigateProcessing: () => void;
}

export const AdminPackageReceipt: React.FC<AdminPackageReceiptProps> = ({ onBack, currentUser, onNavigateProcessing }) => {
    // Stage State: 0 = Initial, 1 = Session, 2 = Scan, 3 = Success
    const [step, setStep] = useState(0);

    // Data State
    const [sessionData, setSessionData] = useState<{ sender: string; carrier: string }>({ sender: '', carrier: '' });
    const [scannedItems, setScannedItems] = useState<string[]>([]);
    const [batchId, setBatchId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // --- STEP HANDLERS ---

    // Step 1: Session Data (Started)
    const handleSessionContinue = (data: { sender: string; carrier: string }) => {
        setSessionData(data);
        setStep(2); // Go to Scan
    };

    // Step 2: Finalize Batch
    const handleBatchFinish = async (items: string[]) => {
        if (items.length === 0) return;
        setScannedItems(items);
        setLoading(true);

        const newBatchId = uuidv4();
        const now = new Date().toISOString();

        try {
            const records = items.map(code => ({
                original_code: code,
                courier_name: sessionData.carrier, // Entregador
                carrier_name: sessionData.sender,   // Transportadora
                status: 'pending_processing',
                received_by: currentUser?.id,
                received_at: now,
                batch_id: newBatchId
            }));

            const { error } = await supabase.from('packages').insert(records);

            if (error) throw error;

            setBatchId(newBatchId);
            setStep(3); // Success State

        } catch (err: any) {
            console.error(err);
            alert('Erro ao salvar lote: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSessionData({ sender: '', carrier: '' });
        setScannedItems([]);
        setBatchId('');
        setStep(1);
    };

    const handlePrint = () => {
        window.print();
    };

    // --- RENDER ---

    // Success Screen
    if (step === 3) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pb-32">
                <div className="bg-white w-full max-w-sm p-8 rounded-[40px] shadow-xl border border-slate-100 text-center space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-inner">
                        <PackageCheck className="w-10 h-10" />
                    </div>
                    <Title level={2}>Lote Registrado!</Title>
                    <Text>
                        <span className="font-bold text-slate-900">{scannedItems.length} pacotes</span> registrados com sucesso.
                    </Text>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Transportadora:</span>
                            <span className="font-bold text-slate-900">{sessionData.sender}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Entregador:</span>
                            <span className="font-bold text-slate-900">{sessionData.carrier}</span>
                        </div>
                        <div className="flex justify-between text-xs border-t pt-2 mt-2 border-slate-200">
                            <span className="text-slate-500">ID Lote:</span>
                            <span className="font-mono text-slate-400 text-[10px]">{batchId.slice(0, 8)}...</span>
                        </div>
                    </div>

                    <DSButton fullWidth variant="secondary" onClick={handlePrint} leftIcon={<Printer size={18} />}>
                        Imprimir Comprovante
                    </DSButton>

                    <DSButton fullWidth size="lg" onClick={handleReset}>
                        Novo Recebimento
                    </DSButton>

                    <button onClick={onBack} className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">
                        Voltar ao Menu
                    </button>
                </div>
            </div>
        );
    }

    if (step === 0) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onBack} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100"><ArrowLeft size={20} /></button>
                    <Title level={2}>Recebimento</Title>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center gap-6 text-center">
                    <div className="w-24 h-24 bg-brand-50 rounded-[32px] flex items-center justify-center text-brand-600 mb-4 shadow-sm border border-brand-100">
                        <PackageCheck size={48} />
                    </div>
                    <Title level={3}>Recebimento em Lote</Title>
                    <Text style={{ maxWidth: 280 }}>
                        Registre múltiplos pacotes de uma única entrega. Ideal para Correios e grandes volumes.
                    </Text>

                    <DSButton size="lg" className="w-64 mt-4" onClick={() => setStep(1)}>
                        Iniciar Lote
                    </DSButton>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-6 opacity-30 pointer-events-none filter blur-sm">
                <Title level={2}>Recebimento</Title>
            </div>

            <BulkSessionStep
                open={step === 1}
                onClose={onBack}
                onContinue={handleSessionContinue}
            />

            <BulkScanStep
                open={step === 2}
                onClose={() => setStep(1)}
                onFinish={handleBatchFinish}
                sessionData={sessionData}
                loading={loading}
            />
        </div>
    );
};
