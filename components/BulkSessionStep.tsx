import React, { useState } from 'react';
import { Package, Truck } from 'lucide-react';
import { Sheet } from './design-system/Sheet';
import { DSButton } from './design-system/Button';
import { DSInput } from './design-system/Input';
import { spacing, colors, radius } from './design-system/tokens';
import { Title, Text } from './design-system/Typography';

interface BulkSessionStepProps {
    open: boolean;
    onClose: () => void;
    onContinue: (data: { sender: string; carrier: string }) => void;
}

export const BulkSessionStep: React.FC<BulkSessionStepProps> = ({
    open,
    onClose,
    onContinue,
}) => {
    const [sender, setSender] = useState('');
    const [carrier, setCarrier] = useState('');

    const isValid = sender.trim().length > 0 && carrier.trim().length > 0;

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Nova Remessa"
            subtitle="Identifique a entrega para iniciar"
            height="auto"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>

                <div style={{ padding: spacing.md, backgroundColor: colors.neutral[50], borderRadius: radius.md, border: `1px dashed ${colors.neutral[200]}` }}>
                    <Text variant="caption" style={{ color: colors.neutral[500], textAlign: 'center' }}>
                        Esta informação será aplicada a todos os pacotes deste lote.
                    </Text>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    <DSInput
                        label="Nome da Transportadora"
                        placeholder="Ex: Amazon, Mercado Livre, Loggi"
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        startIcon={<Package size={18} />}
                    />

                    <DSInput
                        label="Nome do Entregador"
                        placeholder="Ex: João da Silva, Placa ABC-1234"
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        startIcon={<Truck size={18} />}
                    />
                </div>

                <div style={{ paddingTop: spacing.sm }}>
                    <DSButton
                        fullWidth
                        size="lg"
                        variant="primary"
                        disabled={!isValid}
                        onClick={() => onContinue({ sender, carrier })}
                    >
                        Iniciar Leitura
                    </DSButton>
                </div>
            </div>
        </Sheet>
    );
};
