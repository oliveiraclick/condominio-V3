import React, { useState, useRef, useEffect } from 'react';
import { Scan, Trash2, Plus, ArrowRight, Box, Camera, X, Keyboard } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Sheet } from './design-system/Sheet';
import { DSButton } from './design-system/Button';
import { spacing, colors, radius } from './design-system/tokens';
import { Title, Text } from './design-system/Typography';

// Types
interface ScannedItem {
    code: string;
    source: 'manual' | 'camera';
}

interface BulkScanStepProps {
    open: boolean;
    onClose: () => void;
    onFinish: (items: string[]) => void;
    sessionData: { sender: string; carrier: string };
    loading?: boolean;
}

export const BulkScanStep: React.FC<BulkScanStepProps> = ({
    open,
    onClose,
    onFinish,
    sessionData,
    loading
}) => {
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [currentCode, setCurrentCode] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input when opening or after scan (only if camera is closed)
    useEffect(() => {
        if (open && !isScanning) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open, scannedItems, isScanning]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    const handleAdd = () => {
        if (currentCode.trim()) {
            addItem(currentCode.trim(), 'manual');
            setCurrentCode('');
        }
    };

    const handleCameraScan = (result: any) => {
        if (result && result.length > 0) {
            const val = result[0].rawValue;
            if (val) {
                addItem(val, 'camera');
                setIsScanning(false);
            }
        }
    };

    const addItem = (code: string, source: 'manual' | 'camera') => {
        // Prevent immediate duplicate adds if needed, but allowing for now per user flow
        setScannedItems(prev => [{ code, source }, ...prev]);
        // Optional: Play sound
    };

    const handleRemove = (index: number) => {
        const password = window.prompt("Senha do Supervisor para excluir:");
        if (password === '1234') {
            setScannedItems(prev => prev.filter((_, i) => i !== index));
        } else if (password !== null) {
            alert("Senha incorreta.");
        }
    };

    const finishBatch = () => {
        onFinish(scannedItems.map(i => i.code));
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Leitura de Pacotes"
            subtitle={`Lote: ${sessionData.sender} • ${sessionData.carrier}`}
            height="90vh"
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: spacing.md }}>

                {/* SCANNER INPUT & CAMERA BUTTON */}
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: 'white',
                    paddingBottom: spacing.md,
                    borderBottom: `1px solid ${colors.neutral[100]}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: colors.neutral[50],
                            border: `2px solid ${colors.brand[500]}`,
                            borderRadius: radius.xl,
                            padding: '4px 8px 4px 16px',
                            boxShadow: `0 0 0 4px ${colors.brand[100]}`
                        }}>
                            <Scan size={20} className="text-brand-600 mr-3" />
                            <input
                                ref={inputRef}
                                value={currentCode}
                                onChange={(e) => setCurrentCode(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Bipe ou digite..."
                                style={{
                                    flex: 1,
                                    height: 48,
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    fontWeight: 700,
                                    fontSize: 16,
                                    color: colors.neutral[900],
                                    minWidth: 0
                                }}
                            />
                            <button
                                onClick={handleAdd}
                                disabled={!currentCode.trim()}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: radius.lg,
                                    background: currentCode.trim() ? colors.brand[600] : colors.neutral[200],
                                    color: 'white',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: currentCode.trim() ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                    flexShrink: 0
                                }}
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* CAMERA TOGGLE */}
                        <button
                            onClick={() => setIsScanning(true)}
                            className="bg-brand-50 text-brand-600 hover:bg-brand-100 hover:scale-105 transition-all"
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: radius.xl,
                                border: `1px solid ${colors.brand[200]}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                                cursor: 'pointer'
                            }}
                        >
                            <Camera size={24} />
                        </button>
                    </div>

                    <Text variant="caption" style={{ color: colors.neutral[500], textAlign: 'center' }}>
                        Pressione Enter para adicionar manualmente
                    </Text>
                </div>

                {/* LIST */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {scannedItems.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                            <Box size={48} className="text-slate-300 mb-4" />
                            <Text style={{ textAlign: 'center' }}>Nenhum pacote bipado ainda.<br />Use o leitor, câmera ou digite.</Text>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                            {scannedItems.map((item, idx) => (
                                <div key={`${item.code}-${idx}`} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: spacing.md,
                                    backgroundColor: item.source === 'manual' ? 'white' : '#f0fdf4', // Green tint for camera scan (verified)
                                    border: `1px solid ${item.source === 'manual' ? colors.neutral[200] : '#bbf7d0'}`,
                                    borderRadius: radius.lg,
                                    animation: 'slideIn 0.2s ease-out'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: radius.sm,
                                            background: item.source === 'manual' ? colors.neutral[100] : colors.brand[100],
                                            color: item.source === 'manual' ? colors.neutral[600] : colors.brand[700],
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {item.source === 'manual' ? <Keyboard size={16} /> : <Scan size={16} />}
                                        </div>
                                        <div>
                                            <Text weight="bold" style={{ fontSize: 16 }}>{item.code}</Text>
                                            <Text variant="caption" style={{ fontSize: 10, color: colors.neutral[400], textTransform: 'uppercase' }}>
                                                {item.source === 'manual' ? 'Digitado' : 'Bipado'} #{scannedItems.length - idx}
                                            </Text>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(idx)}
                                        style={{
                                            padding: 8,
                                            color: colors.danger,
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            opacity: 0.6
                                        }}
                                        className="hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div style={{
                    borderTop: `1px solid ${colors.neutral[200]}`,
                    paddingTop: spacing.md,
                    marginTop: 'auto'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                        <Text style={{ color: colors.neutral[500] }}>Total de Volumes</Text>
                        <Title level={2}>{scannedItems.length}</Title>
                    </div>

                    <div style={{ display: 'flex', gap: spacing.md }}>
                        <DSButton variant="secondary" onClick={onClose} disabled={loading} style={{ flex: 1 }}>
                            Cancelar
                        </DSButton>
                        <DSButton
                            variant="primary"
                            fullWidth
                            disabled={scannedItems.length === 0 || loading}
                            onClick={finishBatch}
                            style={{ flex: 2 }}
                            rightIcon={loading ? undefined : <ArrowRight size={18} />}
                        >
                            {loading ? 'Processando...' : `Finalizar Lote (${scannedItems.length})`}
                        </DSButton>
                    </div>
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
                            onScan={handleCameraScan}
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

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Sheet>
    );
};
