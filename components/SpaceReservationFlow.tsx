import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '../supabase';

import { Sheet } from './design-system/Sheet';
import { DSButton } from './design-system/Button';
import { DSSelect } from './design-system/Select';
import { Title, Text } from './design-system/Typography';
import { CalendarPicker } from './CalendarPicker';
import { colors, radius, spacing } from './design-system/tokens';

interface CommonArea {
    id: string;
    name: string;
    capacity: number;
    description: string;
    rules?: string;
    image_url?: string;
}

interface ReservationFlowProps {
    open: boolean;
    onClose: () => void;
    currentUserId: string;
}

type Step = 'select-space' | 'select-date' | 'select-time' | 'rules' | 'confirm' | 'success';

export const SpaceReservationFlow: React.FC<ReservationFlowProps> = ({ open, onClose, currentUserId }) => {
    const [step, setStep] = useState<Step>('select-space');
    const [areas, setAreas] = useState<CommonArea[]>([]);
    const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setStep('select-space');
            setSelectedArea(null);
            setSelectedDate(null);
            setSelectedTime('');
            fetchCommonAreas();
        }
    }, [open]);

    const fetchCommonAreas = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('common_areas') // Assuming this is the table name based on search results
                .select('*')
                .order('name');

            if (error) throw error;
            setAreas(data || []);
        } catch (err) {
            console.error('Error loading areas:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectArea = (area: CommonArea) => {
        setSelectedArea(area);
        setStep('select-date');
        setIsCalendarOpen(true);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setIsCalendarOpen(false);
        setStep('select-time');
    };

    const handleConfirmReservation = async () => {
        if (!selectedArea || !selectedDate || !selectedTime) return;
        setLoading(true);

        try {
            // Combine date and time for start/end
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const startDate = new Date(selectedDate);
            startDate.setHours(hours, minutes);

            // Assuming 4 hours duration for example, or fetch from rules
            const endDate = new Date(startDate);
            endDate.setHours(hours + 4, minutes);

            const { error } = await supabase
                .from('reservations')
                .insert({
                    common_area_id: selectedArea.id,
                    resident_id: currentUserId,
                    start_time: startDate.toISOString(),
                    end_time: endDate.toISOString(),
                    status: 'pending' // Default status
                });

            if (error) throw error;
            setStep('success');
        } catch (err) {
            alert('Erro ao realizar reserva. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const timeSlots = [
        { label: '09:00 - 13:00 (Manhã)', value: '09:00' },
        { label: '14:00 - 18:00 (Tarde)', value: '14:00' },
        { label: '19:00 - 23:00 (Noite)', value: '19:00' },
    ];

    const renderHeader = () => {
        switch (step) {
            case 'select-space': return { title: 'Nova Reserva', subtitle: 'Escolha o espaço desejado' };
            case 'select-date': return { title: 'Escolha a Data', subtitle: 'Quando será o evento?' };
            case 'select-time': return { title: 'Horário', subtitle: 'Selecione o período ideal' };
            case 'rules': return { title: 'Regras de Uso', subtitle: 'Leia com atenção' };
            case 'confirm': return { title: 'Confirmar Reserva', subtitle: 'Verifique os detalhes' };
            case 'success': return { title: 'Reserva Realizada!', subtitle: 'Aguardando aprovação' };
        }
    };

    const header = renderHeader();

    return (
        <>
            <Sheet
                open={open}
                onClose={onClose}
                title={header.title}
                subtitle={header.subtitle}
                height="90vh"
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: spacing.lg }}>

                    {/* SELECT SPACE */}
                    {step === 'select-space' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, overflowY: 'auto', paddingBottom: spacing.xl }}>
                            {areas.map(area => (
                                <div
                                    key={area.id}
                                    onClick={() => handleSelectArea(area)}
                                    style={{
                                        border: `1px solid ${colors.neutral[200]}`,
                                        borderRadius: radius.xl,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <div style={{ height: 120, background: colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {area.image_url ? (
                                            <img src={area.image_url} alt={area.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Sparkles size={32} color={colors.neutral[400]} />
                                        )}
                                    </div>
                                    <div style={{ padding: spacing.md }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <Title level={4}>{area.name}</Title>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: colors.neutral[100], padding: '4px 8px', borderRadius: radius.md }}>
                                                <UserIcon size={12} color={colors.neutral[500]} />
                                                <Text variant="caption" weight="bold">{area.capacity}</Text>
                                            </div>
                                        </div>
                                        <Text variant="body" style={{ color: colors.neutral[500], fontSize: 13 }} numberOfLines={2}>
                                            {area.description || 'Espaço disponível para eventos e reuniões.'}
                                        </Text>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SELECT TIME */}
                    {step === 'select-time' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
                            <div style={{
                                padding: spacing.md,
                                background: colors.brand[50],
                                borderRadius: radius.lg,
                                display: 'flex',
                                alignItems: 'center',
                                gap: spacing.md
                            }}>
                                <Calendar size={20} color={colors.brand[600]} />
                                <div>
                                    <Text variant="caption" style={{ color: colors.brand[600], textTransform: 'uppercase' }}>Data Selecionada</Text>
                                    <Text weight="bold" style={{ color: colors.brand[700] }}>
                                        {selectedDate?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </Text>
                                </div>
                                <DSButton variant="ghost" size="sm" onClick={() => setIsCalendarOpen(true)} style={{ marginLeft: 'auto' }}>
                                    Alterar
                                </DSButton>
                            </div>

                            <DSSelect
                                label="Selecione o horário"
                                placeholder="Escolha um período..."
                                options={timeSlots}
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                            />

                            <div style={{ marginTop: 'auto', display: 'flex', gap: spacing.md }}>
                                <DSButton variant="secondary" onClick={() => setStep('select-space')} style={{ flex: 1 }}>
                                    Voltar
                                </DSButton>
                                <DSButton
                                    variant="primary"
                                    disabled={!selectedTime}
                                    onClick={() => setStep('rules')}
                                    style={{ flex: 2 }}
                                >
                                    Continuar
                                </DSButton>
                            </div>
                        </div>
                    )}

                    {/* RULES */}
                    {step === 'rules' && selectedArea && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                            <div style={{
                                padding: spacing.lg,
                                background: colors.neutral[50],
                                borderRadius: radius.xl,
                                border: `1px solid ${colors.neutral[200]}`
                            }}>
                                <Title level={4} style={{ marginBottom: spacing.md }}>Regras de Utilização</Title>
                                <Text style={{ color: colors.neutral[600], whiteSpace: 'pre-wrap' }}>
                                    {selectedArea.rules ||
                                        "1. Respeite o horário de silêncio após as 22h.\n2. Limpeza é de responsabilidade do morador.\n3. Convidados devem ser cadastrados na portaria.\n4. Proibido som automotivo."}
                                </Text>
                            </div>

                            <div style={{ display: 'flex', gap: spacing.sm, padding: spacing.md, background: '#fffbeb', borderRadius: radius.lg, border: '1px solid #fcd34d' }}>
                                <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0 }} />
                                <Text variant="caption" style={{ color: "#b45309" }}>
                                    Ao confirmar, você concorda com todas as regras listadas acima e assume responsabilidade por eventuais danos.
                                </Text>
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', gap: spacing.md }}>
                                <DSButton variant="secondary" onClick={() => setStep('select-time')} style={{ flex: 1 }}>
                                    Voltar
                                </DSButton>
                                <DSButton variant="primary" onClick={() => setStep('confirm')} style={{ flex: 2 }}>
                                    Li e Concordo
                                </DSButton>
                            </div>
                        </div>
                    )}

                    {/* CONFIRM RESERVATION */}
                    {step === 'confirm' && selectedArea && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                            <div style={{
                                padding: spacing.xl,
                                border: `1px solid ${colors.neutral[200]}`,
                                borderRadius: radius.xl,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: spacing.lg
                            }}>
                                <div style={{ display: 'flex', gap: spacing.md }}>
                                    <div style={{ width: 48, height: 48, borderRadius: radius.md, background: colors.brand[50], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MapPin size={24} color={colors.brand[600]} />
                                    </div>
                                    <div>
                                        <Text variant="caption" style={{ color: colors.neutral[500] }}>ESPAÇO</Text>
                                        <Title level={4}>{selectedArea.name}</Title>
                                    </div>
                                </div>

                                <div style={{ height: 1, background: colors.neutral[100] }} />

                                <div style={{ display: 'flex', gap: spacing.md }}>
                                    <div style={{ width: 48, height: 48, borderRadius: radius.md, background: colors.brand[50], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Calendar size={24} color={colors.brand[600]} />
                                    </div>
                                    <div>
                                        <Text variant="caption" style={{ color: colors.neutral[500] }}>DATA E HORÁRIO</Text>
                                        <Title level={4}>
                                            {selectedDate?.toLocaleDateString('pt-BR')}
                                        </Title>
                                        <Text style={{ color: colors.neutral[600] }}>
                                            {selectedTime} h
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', gap: spacing.md }}>
                                <DSButton variant="secondary" onClick={() => setStep('select-time')} style={{ flex: 1 }} disabled={loading}>
                                    Voltar
                                </DSButton>
                                <DSButton
                                    variant="primary"
                                    onClick={handleConfirmReservation}
                                    style={{ flex: 2 }}
                                    disabled={loading}
                                >
                                    {loading ? 'Reservando...' : 'Confirmar Reserva'}
                                </DSButton>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS */}
                    {step === 'success' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing.xl }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: radius.pill,
                                background: '#dcfce7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#16a34a'
                            }}>
                                <CheckCircle size={40} />
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <Title level={2}>Solicitação Enviada!</Title>
                                <Text style={{ color: colors.neutral[500], marginTop: spacing.xs, maxWidth: 300 }}>
                                    Sua reserva foi pré-agendada. Você receberá uma notificação assim que for aprovada pelo síndico.
                                </Text>
                            </div>

                            <div style={{ width: '100%', marginTop: spacing.xl }}>
                                <DSButton fullWidth variant="primary" onClick={onClose}>
                                    Voltar ao Início
                                </DSButton>
                            </div>
                        </div>
                    )}
                </div>
            </Sheet>

            <CalendarPicker
                open={isCalendarOpen}
                onClose={() => {
                    setIsCalendarOpen(false);
                    // If no date selected yet, go back to space selection to avoid getting stuck
                    if (!selectedDate && step === 'select-date') {
                        setStep('select-space');
                    }
                }}
                onSelectDate={handleDateSelect}
                minDate={new Date()}
            />
        </>
    );
};

// Simple User Icon component since it wasn't imported from lucide-react in the top block
const UserIcon = ({ size, color }: { size: number, color: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);
