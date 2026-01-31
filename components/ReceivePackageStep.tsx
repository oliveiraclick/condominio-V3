import React, { useState } from 'react';
import { Package, Truck, FileText } from 'lucide-react';

import { Sheet } from './design-system/Sheet';
import { Title, Text } from './design-system/Typography';
import { DSInput } from './design-system/Input';
import { DSSelect } from './design-system/Select';
import { DSButton } from './design-system/Button';
import { spacing, colors, radius } from './design-system/tokens';

interface ReceivePackageStepProps {
    open: boolean;
    onClose: () => void;
    onContinue: (data: {
        sender: string;
        carrier: string;
        type: string;
        note?: string;
    }) => void;
}

export const ReceivePackageStep: React.FC<ReceivePackageStepProps> = ({
    open,
    onClose,
    onContinue,
}) => {
    const [sender, setSender] = useState('');
    const [carrier, setCarrier] = useState('');
    const [type, setType] = useState('');
    const [note, setNote] = useState('');

    const isValid = sender.trim() !== '' && carrier.trim() !== '' && type !== '';

    const handleSubmit = () => {
        if (isValid) {
            onContinue({ sender, carrier, type, note });
        }
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Nova Encomenda"
            subtitle="Preencha os dados do recebimento"
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing.lg,
                }}
            >
                {/* SEÇÃO 1: REMETENTE & TRANSPORTADORA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    <DSInput
                        label="Nome da Transportadora"
                        placeholder="Ex: Amazon, Mercado Livre, Loggi"
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        startIcon={<Package size={18} />}
                    />

                    <DSInput
                        label="NOME DO ENTREGADOR"
                        placeholder="Ex: João da Silva, Motoboy"
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        startIcon={<Truck size={18} />}
                    />
                </div>

                {/* SEÇÃO 2: TIPO E OBSERVAÇÃO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    <DSSelect
                        label="O que é?"
                        placeholder="Selecione o tipo"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        options={[
                            { label: '📦 Caixa / Pacote', value: 'package' },
                            { label: '✉️ Envelope / Documento', value: 'document' },
                            { label: '🍔 Delivery / Comida', value: 'food' },
                            { label: '💊 Farmácia / Medicamentos', value: 'pharmacy' },
                            { label: '❓ Outros', value: 'other' },
                        ]}
                    />

                    <DSInput
                        label="Observação (Opcional)"
                        placeholder="Ex: Deixar na portaria, frágil..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        startIcon={<FileText size={18} />}
                    />
                </div>

                {/* INFO EXTRA */}
                <div
                    style={{
                        padding: spacing.md,
                        background: colors.neutral[50],
                        borderRadius: radius.sm,
                        border: `1px dashed ${colors.neutral[200]}`,
                    }}
                >
                    <Text variant="caption" style={{ textAlign: 'center', color: colors.neutral[500] }}>
                        Ao continuar, você poderá selecionar o morador e notificar a chegada.
                    </Text>
                </div>

                {/* AÇÃO PRINCIPAL */}
                <div style={{ paddingTop: spacing.sm }}>
                    <DSButton
                        fullWidth
                        size="lg"
                        variant="primary"
                        disabled={!isValid}
                        onClick={handleSubmit}
                    >
                        Continuar para Destinatário
                    </DSButton>
                </div>
            </div>
        </Sheet>
    );
};
