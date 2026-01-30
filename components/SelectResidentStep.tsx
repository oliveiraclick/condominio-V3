import React, { useState, useEffect } from 'react';
import { User, Search, MapPin } from 'lucide-react';
import { supabase } from '../supabase';

import { Sheet } from './design-system/Sheet';
import { Title, Text } from './design-system/Typography';
import { DSInput } from './design-system/Input';
import { DSButton } from './design-system/Button';
import { spacing, colors, radius, shadow } from './design-system/tokens';

interface SelectResidentStepProps {
    open: boolean;
    onClose: () => void;
    onContinue: (resident: any) => void;
    onBack?: () => void;
}

export const SelectResidentStep: React.FC<SelectResidentStepProps> = ({
    open,
    onClose,
    onContinue,
    onBack,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [residents, setResidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedResident, setSelectedResident] = useState<any>(null);

    // Debounced Search
    useEffect(() => {
        const fetchResidents = async () => {
            if (searchTerm.length < 2) {
                setResidents([]);
                return;
            }

            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, name, unit, tower')
                    .eq('role', 'resident')
                    .or(`name.ilike.%${searchTerm}%,unit.ilike.%${searchTerm}%`)
                    .limit(5);

                if (!error && data) {
                    setResidents(data);
                }
            } catch (err) {
                console.error('Error fetching residents', err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResidents, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSelect = (resident: any) => {
        setSelectedResident(resident);
        setSearchTerm(''); // Optional: clear search or keep it
    };

    const handleConfirm = () => {
        if (selectedResident) {
            onContinue(selectedResident);
        }
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Vincular Morador"
            subtitle="Para quem é a encomenda?"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>

                {selectedResident ? (
                    <div style={{
                        backgroundColor: colors.brand[50],
                        borderRadius: radius.lg,
                        padding: spacing.md,
                        border: `1px solid ${colors.brand[200]}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%', backgroundColor: '#ffffff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `1px solid ${colors.brand[100]}`
                            }}>
                                <User size={20} className="text-brand-600" />
                            </div>
                            <div>
                                <Text weight="bold" style={{ color: colors.brand[900] }}>{selectedResident.name}</Text>
                                <Text variant="caption" style={{ color: colors.brand[600] }}>
                                    {selectedResident.unit} - {selectedResident.tower}
                                </Text>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedResident(null)}
                            style={{ color: colors.brand[600], fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' }}
                        >
                            Alterar
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                        <DSInput
                            label="Buscar Morador"
                            placeholder="Nome ou Unidade (ex: 101)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftIcon={<Search size={18} />}
                            fullWidth
                            autoFocus
                        />

                        {loading && <Text variant="caption" style={{ textAlign: 'center', color: colors.neutral[400] }}>Buscando...</Text>}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, maxHeight: 250, overflowY: 'auto' }}>
                            {residents.map((res) => (
                                <div
                                    key={res.id}
                                    onClick={() => handleSelect(res)}
                                    style={{
                                        padding: spacing.md,
                                        backgroundColor: '#ffffff',
                                        border: `1px solid ${colors.neutral[100]}`,
                                        borderRadius: radius.md,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: spacing.md,
                                        cursor: 'pointer',
                                        boxShadow: shadow.sm
                                    }}
                                >
                                    <div style={{ backgroundColor: colors.neutral[100], padding: 8, borderRadius: '50%' }}>
                                        <MapPin size={16} color={colors.neutral[500]} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Text weight="bold" style={{ fontSize: 14 }}>{res.name}</Text>
                                        <Text variant="caption" style={{ color: colors.neutral[500] }}>Unit: {res.unit} • {res.tower}</Text>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                <div style={{ paddingTop: spacing.md, display: 'flex', gap: spacing.md }}>
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
                        disabled={!selectedResident}
                        onClick={handleConfirm}
                    >
                        Confirmar
                    </DSButton>
                </div>
            </div>
        </Sheet>
    );
};
