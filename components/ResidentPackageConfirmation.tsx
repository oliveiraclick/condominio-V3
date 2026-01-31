import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { Sheet } from './design-system/Sheet';
import { DSButton } from './design-system/Button';
import { Title, Text } from './design-system/Typography';
import { colors, radius, spacing } from './design-system/tokens';

interface PackageData {
    id: string;
    original_code: string;
    internal_code?: string;
    carrier_name?: string;
}

interface PickupRequest {
    id: string;
    employee_id: string;
    package_ids: string[];
    status: string;
    created_at: string;
}

interface ResidentPackageConfirmationProps {
    open: boolean;
    onClose: () => void;
    residentId: string;
}

export const ResidentPackageConfirmation: React.FC<ResidentPackageConfirmationProps> = ({
    open,
    onClose,
    residentId
}) => {
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [request, setRequest] = useState<PickupRequest | null>(null);
    const [packages, setPackages] = useState<PackageData[]>([]);

    useEffect(() => {
        if (open && residentId) {
            loadPendingRequest();
        }
    }, [open, residentId]);

    const loadPendingRequest = async () => {
        setLoading(true);
        try {
            const { data: requestData } = await supabase
                .from('package_pickup_requests')
                .select('*')
                .eq('resident_id', residentId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (requestData) {
                setRequest(requestData);

                const { data: packagesData } = await supabase
                    .from('packages')
                    .select('id, original_code, internal_code, carrier_name')
                    .in('id', requestData.package_ids);

                setPackages(packagesData || []);
            }
        } catch (err) {
            console.error('Error loading request:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!request) return;

        setConfirming(true);
        try {
            const { error: updateError } = await supabase
                .from('package_pickup_requests')
                .update({
                    status: 'confirmed',
                    confirmed_at: new Date().toISOString()
                })
                .eq('id', request.id);

            if (updateError) throw updateError;

            const { error: packagesError } = await supabase
                .from('packages')
                .update({
                    status: 'delivered',
                    picked_up_at: new Date().toISOString()
                })
                .in('id', request.package_ids);

            if (packagesError) throw packagesError;

            setConfirmed(true);
            setTimeout(() => {
                onClose();
                setConfirmed(false);
                setRequest(null);
                setPackages([]);
            }, 2000);

        } catch (err) {
            console.error('Error confirming:', err);
            alert('Erro ao confirmar recebimento. Tente novamente.');
        } finally {
            setConfirming(false);
        }
    };

    if (confirmed) {
        return (
            <Sheet open={open} onClose={onClose} height="60vh">
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.xl,
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: colors.brand[50],
                        color: colors.brand[600],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CheckCircle size={40} />
                    </div>
                    <div>
                        <Title level={2}>Recebimento Confirmado!</Title>
                        <Text style={{ marginTop: spacing.sm, color: colors.neutral[600] }}>
                            Suas encomendas foram registradas como entregues.
                        </Text>
                    </div>
                </div>
            </Sheet>
        );
    }

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Confirmar Recebimento"
            subtitle="Verifique as encomendas que você está recebendo"
            height="75vh"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, height: '100%' }}>

                {loading ? (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: spacing.md
                    }}>
                        <Loader2 className="animate-spin" size={24} style={{ color: colors.brand[600] }} />
                        <Text>Carregando...</Text>
                    </div>
                ) : !request ? (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: spacing.xl
                    }}>
                        <Text style={{ color: colors.neutral[500] }}>
                            Nenhuma solicitação de confirmação pendente.
                        </Text>
                    </div>
                ) : (
                    <>
                        <div style={{
                            padding: spacing.md,
                            backgroundColor: colors.neutral[50],
                            borderRadius: radius.lg,
                            border: `1px solid ${colors.neutral[200]}`
                        }}>
                            <Text variant="caption" weight="bold" style={{ textTransform: 'uppercase', color: colors.neutral[500] }}>
                                VOCÊ ESTÁ RECEBENDO:
                            </Text>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                            {packages.map(pkg => (
                                <div
                                    key={pkg.id}
                                    style={{
                                        padding: spacing.md,
                                        backgroundColor: 'white',
                                        border: `1px solid ${colors.neutral[200]}`,
                                        borderRadius: radius.lg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: spacing.md
                                    }}
                                >
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: radius.sm,
                                        backgroundColor: colors.brand[50],
                                        color: colors.brand[600],
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Package size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Text weight="bold">
                                            {pkg.internal_code || pkg.original_code}
                                        </Text>
                                        <Text variant="caption" style={{ color: colors.neutral[500] }}>
                                            {pkg.carrier_name || 'Transportadora'}
                                        </Text>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            padding: spacing.lg,
                            backgroundColor: colors.neutral[50],
                            borderRadius: radius.lg,
                            border: `1px solid ${colors.neutral[200]}`
                        }}>
                            <Text variant="caption" style={{ color: colors.neutral[600] }}>
                                Ao confirmar, você declara que recebeu {packages.length} {packages.length === 1 ? 'encomenda' : 'encomendas'} em mãos.
                            </Text>
                        </div>

                        <div style={{ display: 'flex', gap: spacing.md, paddingTop: spacing.md, borderTop: `1px solid ${colors.neutral[200]}` }}>
                            <DSButton
                                variant="secondary"
                                onClick={onClose}
                                style={{ flex: 1 }}
                                disabled={confirming}
                            >
                                Cancelar
                            </DSButton>
                            <DSButton
                                variant="primary"
                                onClick={handleConfirm}
                                style={{ flex: 2 }}
                                loading={confirming}
                                leftIcon={<CheckCircle size={18} />}
                            >
                                Confirmar Recebimento
                            </DSButton>
                        </div>
                    </>
                )}
            </div>
        </Sheet>
    );
};
