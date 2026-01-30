import React, { useState } from 'react';
import { Package, Truck, FileText } from 'lucide-react';

import { Sheet } from './design-system/Sheet';
import { Title, Text } from './design-system/Typography';
import { DSInput } from './design-system/Input';
import { DSSelect } from './design-system/Select';
import { DSButton } from './design-system/Button';
import { spacing, colors } from './design-system/tokens';

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
                        label="Quem enviou? (Remetente)"
                        placeholder="Ex: Amazon, Mercado Livre, Shopee"
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        leftIcon={<Package size={18} />}
                        fullWidth
                    />

                    <DSInput
                        label="Quem entregou? (Transportadora)"
                        placeholder="Ex: Correios, Jadlog, Motoboy"
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        leftIcon={<Truck size={18} />}
                        fullWidth
                    />
                </div>

                {/* SEÇÃO 2: TIPO E OBSERVAÇÃO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    <DSSelect
                        label="O que é?"
                        placeholder="Selecione o tipo"
                        value={type}
                        onChange={setType}
                        options={[
                            { label: '📦 Caixa / Pacote', value: 'package' },
                            { label: '✉️ Envelope / Documento', value: 'document' },
                            { label: 'food Delivery / Comida', value: 'food' },
                            { label: '💊 Farmácia / Medicamentos', value: 'pharmacy' },
                            { label: '❓ Outros', value: 'other' },
                        ]}
                    />

                    <DSInput
                        label="Observação (Opcional)"
                        placeholder="Ex: Deixar na portaria, frágil..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        leftIcon={<FileText size={18} />}
                        fullWidth
                    />
                </div>

                {/* INFO EXTRA */}
                <div
                    style={{
                        padding: spacing.md,
                        background: colors.neutral[50],
                        borderRadius: 12, // Using hardcoded value here as radius.md/lg might be strings with 'px'
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
