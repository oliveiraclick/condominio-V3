import React from 'react';
import { CheckCircle, Package, User, Truck, FileText, ArrowRight } from 'lucide-react';

import { Sheet } from './design-system/Sheet';
import { Title, Text } from './design-system/Typography';
import { DSButton } from './design-system/Button';
import { spacing, colors, radius, shadow } from './design-system/tokens';

interface ConfirmReceiptStepProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onBack: () => void;
    data: {
        sender: string;
        carrier: string;
        type: string;
        note?: string;
        code: string;
        resident: any;
    };
    loading?: boolean;
}

export const ConfirmReceiptStep: React.FC<ConfirmReceiptStepProps> = ({
    open,
    onClose,
    onConfirm,
    onBack,
    data,
    loading
}) => {
    if (!data || !data.resident) {
        return null;
    }

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Confirmar Recebimento"
            subtitle="Verifique os dados antes de salvar"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>

                {/* SUMMARY CARD */}
                <div style={{
                    backgroundColor: '#ffffff',
                    border: `1px solid ${colors.neutral[200]}`,
                    borderRadius: radius.xl,
                    padding: spacing.lg,
                    boxShadow: shadow.sm,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing.md
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                        <div style={{ padding: 8, backgroundColor: colors.brand[50], borderRadius: radius.md }}>
                            <Package size={20} className="text-brand-600" />
                        </div>
                        <div>
                            <Text variant="caption" style={{ color: colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>Encomenda</Text>
                            <Text weight="bold">{data.sender}</Text>
                            <Text variant="caption" style={{ color: colors.neutral[500] }}>Cód: {data.code}</Text>
                        </div>
                    </div>

                    <div style={{ height: 1, backgroundColor: colors.neutral[100] }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                        <div style={{ padding: 8, backgroundColor: colors.neutral[50], borderRadius: radius.md }}>
                            <User size={20} className="text-neutral-600" />
                        </div>
                        <div>
                            <Text variant="caption" style={{ color: colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destinatário</Text>
                            <Text weight="bold">{data.resident.name}</Text>
                            <Text variant="caption" style={{ color: colors.neutral[500] }}>Apto: {data.resident.unit}</Text>
                        </div>
                    </div>

                    <div style={{ height: 1, backgroundColor: colors.neutral[100] }} />

                    <div style={{ display: 'flex', gap: spacing.lg }}>
                        <div>
                            <Text variant="caption" style={{ color: colors.neutral[500] }}>Transportadora</Text>
                            <Text style={{ fontSize: 13 }}>{data.carrier}</Text>
                        </div>
                        {data.type && (
                            <div>
                                <Text variant="caption" style={{ color: colors.neutral[500] }}>Tipo</Text>
                                <Text style={{ fontSize: 13 }}>{data.type === 'package' ? 'Pacote' : data.type}</Text>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ paddingTop: spacing.md, display: 'flex', gap: spacing.md }}>
                    <DSButton
                        variant="secondary"
                        onClick={onBack}
                        disabled={loading}
                        style={{ flex: 1 }}
                    >
                        Voltar
                    </DSButton>
                    <DSButton
                        style={{ flex: 2 }}
                        size="lg"
                        variant="primary"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Finalizar Recebimento'}
                    </DSButton>
                </div>
            </div>
        </Sheet>
    );
};
