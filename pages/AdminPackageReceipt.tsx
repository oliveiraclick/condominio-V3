import React, { useState } from 'react';
import { ArrowLeft, PackageCheck } from 'lucide-react';
import { supabase } from '../supabase';

// Importing Steps
import { ReceivePackageStep } from '../components/ReceivePackageStep';
import { PackageScannerStep } from '../components/PackageScannerStep';
import { SelectResidentStep } from '../components/SelectResidentStep';
import { ConfirmReceiptStep } from '../components/ConfirmReceiptStep';

import { Title, Text } from '../components/design-system/Typography';
import { DSButton } from '../components/design-system/Button';

interface AdminPackageReceiptProps {
    onBack: () => void;
    currentUser: any;
    onNavigateProcessing: () => void;
}

export const AdminPackageReceipt: React.FC<AdminPackageReceiptProps> = ({ onBack, currentUser }) => {
    // Stage State: 0 = Initial Overview, 1 = Data, 2 = Scan, 3 = Resident, 4 = Confirm, 5 = Success
    const [step, setStep] = useState(0);

    // Data Collection State
    const [receiptData, setReceiptData] = useState<{
        sender: string;
        carrier: string;
        type: string;
        note?: string;
        code: string;
        resident: any;
    }>({
        sender: '',
        carrier: '',
        type: 'package',
        code: '',
        resident: null
    });

    const [loading, setLoading] = useState(false);

    // --- STEP HANDLERS ---

    // Step 1: Data Entry
    const handleDataContinue = (data: { sender: string; carrier: string; type: string; note?: string }) => {
        setReceiptData(prev => ({ ...prev, ...data }));
        setStep(2);
    };

    // Step 2: Scanner
    const handleScanContinue = (code: string) => {
        setReceiptData(prev => ({ ...prev, code }));
        setStep(3);
    };

    // Step 3: Resident
    const handleResidentContinue = (resident: any) => {
        setReceiptData(prev => ({ ...prev, resident }));
        setStep(4);
    };

    // Step 4: Final Submission
    const handleFinalConfirm = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.from('packages').insert([{
                tracking_code: receiptData.code,
                carrier: receiptData.carrier,
                sender: receiptData.sender,
                type: receiptData.type,
                notes: receiptData.note,
                resident_id: receiptData.resident.id,
                unit: receiptData.resident.unit,
                tower: receiptData.resident.tower,
                status: 'pending',
                received_by: currentUser.id,
                received_at: new Date().toISOString()
            }]);

            if (error) throw error;

            setStep(5); // Success State

        } catch (err: any) {
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setReceiptData({
            sender: '',
            carrier: '',
            type: 'package',
            code: '',
            resident: null
        });
        setStep(1);
    };

    // --- RENDER ---

    // Success Screen
    if (step === 5) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pb-32">
                <div className="bg-white w-full max-w-sm p-8 rounded-[40px] shadow-xl border border-slate-100 text-center space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-inner">
                        <PackageCheck className="w-10 h-10" />
                    </div>
                    <Title level={2}>Sucesso!</Title>
                    <Text>Encomenda registrada e morador notificado.</Text>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <Text weight="bold" style={{ fontSize: 18 }}>{receiptData.resident.name}</Text>
                        <Text variant="caption">Apto {receiptData.resident.unit}</Text>
                    </div>

                    <DSButton fullWidth size="lg" onClick={handleReset}>
                        Receber Nova Encomenda
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
                    <Title level={3}>Nova Encomenda</Title>
                    <Text style={{ maxWidth: 250 }}>Inicie o processo de recebimento guiado para garantir todos os dados.</Text>

                    <DSButton size="lg" className="w-64 mt-4" onClick={() => setStep(1)}>
                        Iniciar Recebimento
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

            <ReceivePackageStep
                open={step === 1}
                onClose={onBack}
                onContinue={handleDataContinue}
            />

            <PackageScannerStep
                open={step === 2}
                onClose={() => setStep(1)}
                onBack={() => setStep(1)}
                onContinue={handleScanContinue}
            />

            <SelectResidentStep
                open={step === 3}
                onClose={() => setStep(2)}
                onBack={() => setStep(2)}
                onContinue={handleResidentContinue}
            />

            <ConfirmReceiptStep
                open={step === 4}
                onClose={() => setStep(3)}
                onBack={() => setStep(3)}
                onConfirm={handleFinalConfirm}
                data={receiptData}
                loading={loading}
            />
        </div>
    );
};
