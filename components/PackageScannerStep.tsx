import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Camera, X, Barcode } from 'lucide-react';

import { Sheet } from './design-system/Sheet';
import { Title, Text } from './design-system/Typography';
import { DSInput } from './design-system/Input';
import { DSButton } from './design-system/Button';
import { spacing, colors, radius } from './design-system/tokens';

interface PackageScannerStepProps {
    open: boolean;
    onClose: () => void;
    onContinue: (code: string) => void;
    onBack?: () => void;
}

export const PackageScannerStep: React.FC<PackageScannerStepProps> = ({
    open,
    onClose,
    onContinue,
    onBack,
}) => {
    const [code, setCode] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    const handleScan = (result: any) => {
        if (result && result.length > 0) {
            const val = result[0].rawValue;
            if (val) {
                setCode(val);
                setIsScanning(false);
            }
        }
    };

    const handleConfirm = () => {
        if (code.trim()) {
            onContinue(code);
        }
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Escanear Código"
            subtitle="Identifique a encomenda"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>

                {/* SCANNER TRIGGER CARD */}
                <div
                    onClick={() => setIsScanning(true)}
                    style={{
                        backgroundColor: colors.brand[50],
                        borderRadius: radius.xl,
                        border: `1px dashed ${colors.brand[200]}`,
                        padding: spacing.xl,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: spacing.md,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: colors.brand[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.brand[600]
                    }}>
                        <Camera size={32} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Text weight="bold" style={{ color: colors.brand[700] }}>Toque para abrir a Câmera</Text>
                        <Text variant="caption" style={{ color: colors.brand[500] }}>Ler código de barras ou QR Code</Text>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                    <div style={{ flex: 1, height: 1, backgroundColor: colors.neutral[200] }} />
                    <Text variant="caption" style={{ color: colors.neutral[400] }}>OU DIGITE MANUALMENTE</Text>
                    <div style={{ flex: 1, height: 1, backgroundColor: colors.neutral[200] }} />
                </div>

                <DSInput
                    label="Código de Rastreio"
                    placeholder="Ex: BR123456789BR"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    leftIcon={<Barcode size={18} />}
                    fullWidth
                    autoFocus
                />

                <div style={{ paddingTop: spacing.sm, display: 'flex', gap: spacing.md }}>
                    {onBack && (
                        <DSButton
                            variant="secondary"
                            onClick={onBack}
                            style={{ flex: 1 }}
                        >
                            Voltar
                        </DSButton>
                    )}
                    <DSButton
                        fullWidth={!onBack}
                        style={onBack ? { flex: 2 } : {}}
                        size="lg"
                        variant="primary"
                        disabled={!code.trim()}
                        onClick={handleConfirm}
                    >
                        Confirmar Código
                    </DSButton>
                </div>
            </div>

            {/* FULL SCREEN SCANNER OVERLAY */}
            {isScanning && (
                <div className="fixed inset-0 z-[60] bg-black flex flex-col">
                    <div className="relative flex-1 bg-black">
                        <button
                            onClick={() => setIsScanning(false)}
                            className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white"
                        >
                            <X size={24} />
                        </button>
                        <Scanner
                            onScan={handleScan}
                            allowMultiple={true}
                            scanDelay={2000}
                        />
                        <div className="absolute bottom-24 left-0 right-0 text-center pointer-events-none">
                            <p className="text-white font-bold bg-black/50 inline-block px-6 py-3 rounded-full backdrop-blur text-sm uppercase tracking-widest border border-white/10">
                                Aponte para o código
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Sheet>
    );
};
