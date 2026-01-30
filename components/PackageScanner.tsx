import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { X, CheckCircle2, ScanLine } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Camera } from '@capacitor/camera';

import { Sheet } from './design-system/Sheet';
import { DSButton } from './design-system/Button';
import { Title, Text } from './design-system/Typography';
import { colors, radius, spacing } from './design-system/tokens';

export const PackageScanner: React.FC<{ isOpen: boolean; onClose: () => void; currentUser: any }> = ({ isOpen, onClose, currentUser }) => {
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const checkPermission = async () => {
                try {
                    const status = await Camera.checkPermissions();
                    if (status.camera === 'granted') {
                        setPermissionGranted(true);
                    } else {
                        const request = await Camera.requestPermissions({ permissions: ['camera'] });
                        if (request.camera === 'granted' || request.camera === 'limited') {
                            setPermissionGranted(true);
                        } else {
                            alert('Precisamos da permissão da câmera para ler o QR Code.');
                            onClose();
                        }
                    }
                } catch (e) {
                    console.error("Erro ao verificar permissão nativa:", e);
                    setPermissionGranted(true); // Fallback
                }
            };
            checkPermission();
        } else {
            // Reset states when closed
            setSuccess(false);
            setScannedData(null);
        }
    }, [isOpen]);

    const handleScan = async (text: string) => {
        if (text && !isProcessing && !success) {
            setIsProcessing(true);
            setScannedData(text);

            try {
                const { data, error } = await supabase.rpc('pickup_package', { qr_text: text });

                if (error) throw new Error(error.message);

                if (data && !data.success) {
                    throw new Error(data.message);
                }

                setSuccess(true);

            } catch (error: any) {
                alert(error.message);
                setScannedData(null);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // Custom rendering for the Scanner content to fit inside Sheet
    return (
        <Sheet
            open={isOpen}
            onClose={onClose}
            title={success ? "Confirmado!" : "Scanner"}
            subtitle={success ? "Retirada registrada" : "Aponte para o QR Code"}
            height="90vh"
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: spacing.lg }}>

                {success ? (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: spacing.xl
                    }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: radius.pill,
                            background: colors.success + '20', // Using hex opacity or similar, assuming success is hex
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.success
                        }}>
                            <CheckCircle2 size={40} />
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <Title level={3}>Sucesso!</Title>
                            <Text variant="body" style={{ color: colors.neutral[500], marginTop: spacing.xs }}>
                                Encomenda retirada corretamente.
                            </Text>
                        </div>

                        <div style={{
                            width: '100%',
                            padding: spacing.md,
                            background: colors.neutral[50],
                            borderRadius: radius.lg,
                            border: `1px solid ${colors.neutral[200]}`
                        }}>
                            <Text variant="caption" style={{ color: colors.neutral[400], marginBottom: 4 }}>RETIRADO POR</Text>
                            <Text variant="body" weight="bold" style={{ color: colors.neutral[900] }}>
                                {currentUser.name || 'Morador'}
                            </Text>
                            <Text variant="caption" style={{ color: colors.neutral[500] }}>
                                {currentUser.phone || 'Sem celular'}
                            </Text>

                            <div style={{ height: 1, background: colors.neutral[200], margin: `${spacing.sm} 0` }} />

                            <Text variant="caption" style={{ color: colors.neutral[400], marginBottom: 4 }}>DATA</Text>
                            <Text variant="body" weight="medium" style={{ color: colors.neutral[900] }}>
                                {new Date().toLocaleString('pt-BR')}
                            </Text>
                        </div>

                        <div style={{ width: '100%', marginTop: 'auto' }}>
                            <DSButton fullWidth variant="primary" onClick={onClose}>
                                Fechar
                            </DSButton>
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                        {permissionGranted ? (
                            <div style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '1',
                                borderRadius: radius.xl,
                                overflow: 'hidden',
                                background: 'black'
                            }}>
                                <Scanner
                                    onScan={(result) => result?.[0]?.rawValue && handleScan(result[0].rawValue)}
                                    onError={(error: any) => console.log(error)}
                                    constraints={{ facingMode: 'environment' }}
                                    styles={{ container: { width: '100%', height: '100%' } }}
                                    components={{ finder: false }}
                                />

                                {/* Overlay Visual */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none'
                                }}>
                                    <div style={{
                                        width: '70%',
                                        height: '70%',
                                        border: `2px solid rgba(255,255,255,0.8)`,
                                        borderRadius: radius.lg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <ScanLine size={48} color="rgba(255,255,255,0.5)" className="animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: colors.neutral[100],
                                borderRadius: radius.xl
                            }}>
                                <Text>Aguardando câmera...</Text>
                            </div>
                        )}

                        <Text variant="caption" style={{ textAlign: 'center', color: colors.neutral[500] }}>
                            Aponte a câmera para o QR Code da etiqueta da encomenda.
                        </Text>

                        {isProcessing && (
                            <div style={{
                                padding: spacing.sm,
                                background: colors.brand[50],
                                borderRadius: radius.md,
                                textAlign: 'center'
                            }}>
                                <Text variant="label" style={{ color: colors.brand[600] }}>Processando...</Text>
                            </div>
                        )}

                        <div style={{ marginTop: 'auto' }}>
                            <DSButton fullWidth variant="secondary" onClick={onClose}>
                                Cancelar
                            </DSButton>
                        </div>
                    </div>
                )}
            </div>
        </Sheet>
    );
};
