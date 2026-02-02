import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, AlertCircle, Sparkles, User, CheckCircle, Utensils, Trophy, Clock, Info } from 'lucide-react';
import { supabase } from '../supabase';

import { Sheet } from './design-system/Sheet';
import { DSButton } from './design-system/Button';
import { DSSelect } from './design-system/Select';
import { Title, Text } from './design-system/Typography';
import { CalendarPicker } from './CalendarPicker';
import { colors, radius, spacing, shadow } from './design-system/tokens';

interface CommonArea {
    id: string;
    name: string;
    capacity: number;
    description: string;
    rules?: string;
    image_url?: string;
}

interface Reservation {
    id: string;
    common_area_id: string;
    start_time: string;
    end_time: string;
    status: string;
}

interface ReservationFlowProps {
    open: boolean;
    onClose: () => void;
    currentUserId: string;
    currentUser?: any;
}

type Step = 'select-category' | 'select-date' | 'list-availability' | 'details' | 'confirm' | 'success';
type Category = 'gourmet' | 'sports';

export const SpaceReservationFlow: React.FC<ReservationFlowProps> = ({ open, onClose, currentUserId, currentUser }) => {
    const [step, setStep] = useState<Step>('select-category');
    const [category, setCategory] = useState<Category | null>(null);

    const [areas, setAreas] = useState<CommonArea[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);

    // Selection State
    const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [isWaitlist, setIsWaitlist] = useState(false); // If user is trying to join waitlist

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setStep('select-category');
            setCategory(null);
            setSelectedArea(null);
            setSelectedDate(null);
            setSelectedTime('');
            setIsWaitlist(false);
            fetchCommonAreas();
        }
    }, [open]);

    // Fetch areas once
    const fetchCommonAreas = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('common_areas')
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

    // Fetch reservations for a specific date
    const fetchReservationsForDate = async (date: Date) => {
        setLoading(true);
        try {
            const dateStr = date.toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('reservations')
                .select('*')
                .eq('date', dateStr)
                .neq('status', 'cancelled') // Ignore cancelled
                .neq('status', 'denied');    // Ignore denied

            if (error) throw error;
            setReservations(data || []);
        } catch (err) {
            console.error('Error fetching reservations:', err);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleCategorySelect = (cat: Category) => {
        setCategory(cat);
        // Immediately trigger calendar
        setIsCalendarOpen(true);
        setStep('select-date');
    };

    const handleDateSelect = async (date: Date) => {
        setSelectedDate(date);
        setIsCalendarOpen(false);
        await fetchReservationsForDate(date);
        setStep('list-availability');
    };

    const handleAreaClick = (area: CommonArea, status: 'free' | 'booked') => {
        setSelectedArea(area);
        setIsWaitlist(status === 'booked');

        // If Gourmet (Full Day), we auto-fill default time
        if (status === 'free' && category === 'gourmet') {
            setSelectedTime('08:00'); // Default start
        }
        setStep('details');
    };

    const handleConfirmReservation = async () => {
        if (!selectedArea || !selectedDate) return;

        // Validation for 'free' bookings
        if (!isWaitlist && category === 'sports' && !selectedTime) {
            alert("Selecione um horário.");
            return;
        }

        setLoading(true);

        try {
            let startTime = '08:00:00';
            let endTime = '23:00:00';

            if (category === 'sports' && selectedTime) {
                const hour = parseInt(selectedTime.split(':')[0]);
                startTime = `${hour.toString().padStart(2, '0')}:00:00`;
                endTime = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
            }

            const { error } = await supabase
                .from('reservations')
                .insert({
                    area_id: selectedArea.id,
                    resident_id: currentUserId,
                    date: selectedDate.toISOString().split('T')[0],
                    start_time: startTime,
                    end_time: endTime,
                    time_slot: null, // Avoid check_time_slot_or_times constraint violation
                    status: isWaitlist ? 'waiting_list' : 'pending',
                    unit: currentUser?.unit || null,
                    tower: currentUser?.tower || null
                });

            if (error) throw error;
            setStep('success');
        } catch (err: any) {
            alert('Erro ao realizar operação: ' + (err.message || 'Tente novamente.'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Helpers ---

    const getFilteredAreas = () => {
        if (!category) return [];
        return areas.filter(area => {
            const lowerName = area.name.toLowerCase();
            if (category === 'gourmet') {
                return lowerName.includes('gourmet') || lowerName.includes('festa') || lowerName.includes('churras') || lowerName.includes('pub') || lowerName.includes('quiosque') || lowerName.includes('espaco') || lowerName.includes('cozinha');
            } else {
                return lowerName.includes('quadra') || lowerName.includes('piscina') || lowerName.includes('academia') || lowerName.includes('esporte') || lowerName.includes('jogo') || lowerName.includes('campo');
            }
        });
    };

    const isAreaBooked = (areaId: string) => {
        if (!selectedDate) return false;

        // For Gourmet (Day), any reservation blocks it
        if (category === 'gourmet') {
            return reservations.some(r => r.area_id === areaId);
        }

        // For Sports (Hourly), check if "busy" (e.g., > 12h booked)
        if (category === 'sports') {
            const resCount = reservations.filter(r => r.area_id === areaId).length;
            return resCount >= 14;
        }

        return reservations.some(r => r.area_id === areaId);
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let i = 8; i <= 21; i++) {
            const time = `${i.toString().padStart(2, '0')}:00`;
            const isTaken = reservations.some(r => {
                if (r.area_id !== selectedArea?.id) return false;
                // Compare hour string with start_time (HH:MM:SS)
                return r.start_time?.startsWith(time);
            });

            if (!isTaken) {
                slots.push({ label: `${time} - ${i + 1}:00`, value: time });
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    // --- Render ---

    const renderHeader = () => {
        switch (step) {
            case 'select-category': return { title: 'Nova Reserva', subtitle: 'Qual tipo de espaço você precisa?' };
            case 'select-date': return { title: 'Escolha a Data', subtitle: 'Para quando é a reserva?' };
            case 'list-availability': return {
                title: selectedDate?.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }),
                subtitle: `Disponibilidade - ${category === 'gourmet' ? 'Gourmet' : 'Esportes'}`
            };
            case 'details': return { title: selectedArea?.name, subtitle: isWaitlist ? 'Entrar na Lista de Espera' : 'Detalhes e Horário' };
            case 'confirm': return { title: 'Confirmar', subtitle: 'Revise os dados' };
            case 'success': return { title: 'Sucesso!', subtitle: '' };
            default: return { title: 'Nova Reserva', subtitle: '' };
        }
    };

    const header = renderHeader();
    if (!open) return null;

    return (
        <>
            <Sheet
                open={open}
                onClose={onClose}
                title={header.title}
                subtitle={header.subtitle}
                height="90vh"
            >
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: spacing.lg }}>

                    {/* STEP 1: CATEGORY */}
                    {step === 'select-category' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, marginTop: spacing.lg }}>
                            <div
                                onClick={() => handleCategorySelect('gourmet')}
                                style={{
                                    padding: spacing.xl,
                                    backgroundColor: colors.brand[50],
                                    borderRadius: radius.xl,
                                    border: `1px solid ${colors.brand[100]}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: spacing.lg,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    boxShadow: shadow.sm
                                }}
                            >
                                <div style={{
                                    width: 64, height: 64, borderRadius: '50%', backgroundColor: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: shadow.sm
                                }}>
                                    <Utensils size={32} color={colors.brand[600]} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Title level={4} style={{ color: colors.brand[900], marginBottom: 4 }}>Área Gourmet</Title>
                                    <Text style={{ color: colors.brand[700], fontSize: 13 }}>Dia Completo (Quiosques, Salão...)</Text>
                                </div>
                            </div>

                            <div
                                onClick={() => handleCategorySelect('sports')}
                                style={{
                                    padding: spacing.xl,
                                    backgroundColor: colors.neutral[50], // Different color theme
                                    borderRadius: radius.xl,
                                    border: `1px solid ${colors.neutral[200]}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: spacing.lg,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    boxShadow: shadow.sm
                                }}
                            >
                                <div style={{
                                    width: 64, height: 64, borderRadius: '50%', backgroundColor: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: shadow.sm
                                }}>
                                    <Trophy size={32} color={colors.neutral[600]} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Title level={4} style={{ color: colors.neutral[900], marginBottom: 4 }}>Esporte e Lazer</Title>
                                    <Text style={{ color: colors.neutral[600], fontSize: 13 }}>Reserva por Hora (Quadras...)</Text>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DATE (Handled by CalendarPicker mostly, but placeholder here if needed) */}
                    {step === 'select-date' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
                            <DSButton onClick={() => setIsCalendarOpen(true)} variant="secondary">
                                Reabrir Calendário
                            </DSButton>
                        </div>
                    )}

                    {/* STEP 3: LIST AVAILABILITY */}
                    {step === 'list-availability' && (
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing.md, paddingBottom: spacing.lg }}>
                            {/* Date Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing.sm, borderBottom: `1px solid ${colors.neutral[100]}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                                    <Calendar size={16} color={colors.neutral[500]} />
                                    <Text weight="medium">{selectedDate?.toLocaleDateString('pt-BR')}</Text>
                                </div>
                                <DSButton variant="ghost" size="sm" onClick={() => setIsCalendarOpen(true)}>Alterar</DSButton>
                            </div>

                            {getFilteredAreas().length > 0 ? getFilteredAreas()
                                .sort((a, b) => {
                                    const bookedA = isAreaBooked(a.id);
                                    const bookedB = isAreaBooked(b.id);
                                    if (bookedA === bookedB) return 0;
                                    return bookedA ? 1 : -1;
                                })
                                .map(area => {
                                    const booked = isAreaBooked(area.id);
                                    return (
                                        <div
                                            key={area.id}
                                            onClick={() => handleAreaClick(area, booked ? 'booked' : 'free')}
                                            style={{
                                                backgroundColor: 'white',
                                                borderRadius: radius.lg,
                                                border: `1px solid ${booked ? colors.neutral[200] : colors.brand[100]}`,
                                                padding: spacing.md,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                boxShadow: shadow.sm,
                                                opacity: booked ? 0.9 : 1
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                                                {/* Status Indicator */}
                                                <div style={{
                                                    width: 12, height: 12, borderRadius: '50%',
                                                    backgroundColor: booked ? '#ef4444' : '#22c55e',
                                                    boxShadow: `0 0 0 2px ${booked ? '#fecaca' : '#bbf7d0'}`
                                                }} />

                                                <div>
                                                    <Title level={5} style={{ marginBottom: 0 }}>{area.name}</Title>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                        <User size={12} color={colors.neutral[400]} />
                                                        <Text variant="caption">{area.capacity} pessoas</Text>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                {booked ? (
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: 4 }}>
                                                        LOCADO
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', backgroundColor: '#f0fdf4', padding: '2px 6px', borderRadius: 4 }}>
                                                        LIVRE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }) : (
                                <div style={{ padding: spacing.xl, textAlign: 'center', color: colors.neutral[500] }}>
                                    <Text>Nenhum espaço encontrado nesta categoria.</Text>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4: DETAILS & BOOKING */}
                    {step === 'details' && selectedArea && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {/* Area Image */}
                                <div style={{
                                    height: 200, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.lg,
                                    backgroundColor: colors.neutral[100], position: 'relative'
                                }}>
                                    {selectedArea.image_url ? (
                                        <img src={selectedArea.image_url} alt={selectedArea.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <Sparkles size={48} color={colors.neutral[300]} />
                                        </div>
                                    )}
                                    {isWaitlist && (
                                        <div style={{
                                            position: 'absolute', top: 12, right: 12,
                                            backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white',
                                            padding: '4px 12px', borderRadius: radius.pill,
                                            fontWeight: 'bold', fontSize: 12, backdropFilter: 'blur(4px)'
                                        }}>
                                            Sem Vagas
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.lg }}>
                                    <div style={{ flex: 1, padding: spacing.md, backgroundColor: colors.neutral[50], borderRadius: radius.lg }}>
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                                            <User size={16} color={colors.neutral[500]} />
                                            <Text weight="bold">{selectedArea.capacity}</Text>
                                        </div>
                                        <Text variant="caption">Capacidade</Text>
                                    </div>

                                    {!isWaitlist && (
                                        <div style={{ flex: 1, padding: spacing.md, backgroundColor: colors.neutral[50], borderRadius: radius.lg }}>
                                            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                                                <Clock size={16} color={colors.neutral[500]} />
                                                <Text weight="bold">{category === 'gourmet' ? 'Dia Todo' : '1 hora'}</Text>
                                            </div>
                                            <Text variant="caption">Duração</Text>
                                        </div>
                                    )}
                                </div>

                                <Title level={4} style={{ marginBottom: spacing.sm }}>Sobre o espaço</Title>
                                <Text style={{ color: colors.neutral[600], marginBottom: spacing.lg, lineHeight: 1.5 }}>
                                    {selectedArea.description || 'Espaço completo para seu evento ou atividade.'}
                                </Text>

                                {/* If NOT waitlist, show booking options */}
                                {!isWaitlist && (
                                    <>
                                        <Title level={4} style={{ marginBottom: spacing.sm }}>
                                            {category === 'gourmet' ? 'Período' : 'Horários Disponíveis'}
                                        </Title>

                                        {category === 'gourmet' ? (
                                            <div style={{ padding: spacing.md, backgroundColor: colors.brand[50], borderRadius: radius.lg, border: `1px solid ${colors.brand[200]}` }}>
                                                <Text style={{ color: colors.brand[800], fontWeight: 500 }}>
                                                    Reserva válida para o dia todo (08:00 - 23:00)
                                                </Text>
                                            </div>
                                        ) : (
                                            <DSSelect
                                                label=""
                                                value={selectedTime}
                                                onChange={(e) => setSelectedTime(e.target.value)}
                                                options={timeSlots}
                                                placeholder="Selecione um horário..."
                                            />
                                        )}
                                    </>
                                )}

                                {/* If Waitlist, show info */}
                                {isWaitlist && (
                                    <div style={{
                                        padding: spacing.md, backgroundColor: '#fff7ed',
                                        border: '1px solid #ffedd5', borderRadius: radius.lg,
                                        display: 'flex', gap: spacing.md
                                    }}>
                                        <Info size={20} color="#ea580c" />
                                        <div style={{ flex: 1 }}>
                                            <Text weight="bold" style={{ color: '#9a3412', marginBottom: 2 }}>Lista de Espera</Text>
                                            <Text style={{ fontSize: 12, color: '#c2410c' }}>
                                                Este espaço já está reservado. Ao entrar na fila, você será notificado caso haja desistência.
                                            </Text>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTop: `1px solid ${colors.neutral[100]}`, display: 'flex', gap: spacing.md }}>
                                <DSButton variant="secondary" onClick={() => setStep('list-availability')} style={{ flex: 1 }}>
                                    Voltar
                                </DSButton>
                                <DSButton
                                    variant={isWaitlist ? 'secondary' : 'primary'}
                                    onClick={handleConfirmReservation}
                                    style={{ flex: 2 }}
                                    disabled={loading}
                                >
                                    {loading ? 'Processando...' : isWaitlist ? 'Entrar na Fila' : 'Confirmar Reserva'}
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
                                backgroundColor: isWaitlist ? '#fff7ed' : '#dcfce7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isWaitlist ? '#ea580c' : '#16a34a'
                            }}>
                                {isWaitlist ? <Clock size={40} /> : <CheckCircle size={40} />}
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <Title level={2}>{isWaitlist ? 'Adicionado à Fila!' : 'Solicitação Enviada!'}</Title>
                                <Text style={{ color: colors.neutral[500], marginTop: spacing.xs, maxWidth: 300 }}>
                                    {isWaitlist
                                        ? 'Você será avisado se o horário vagar.'
                                        : 'Sua reserva foi pré-agendada. Aguarde a aprovação.'}
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
                    // If canceling calendar execution without date, go back
                    if (!selectedDate && step === 'select-date') {
                        setStep('select-category');
                    }
                }}
                onSelectDate={handleDateSelect}
                minDate={new Date()}
            />
        </>
    );
};
