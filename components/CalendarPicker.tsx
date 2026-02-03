import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

import { Sheet } from './design-system/Sheet';
import { DSButton } from './design-system/Button';
import { Title, Text } from './design-system/Typography';
import { colors, radius } from './design-system/tokens';

interface CalendarPickerProps {
    open: boolean;
    onSelectDate: (date: Date) => void;
    onClose: () => void;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[];
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
    open, // Now controlled via prop
    onSelectDate,
    onClose,
    minDate = new Date(),
    maxDate,
    disabledDates = [],
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days: (Date | null)[] = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const isDateDisabled = (date: Date | null) => {
        if (!date) return true;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        if (disabledDates.some(d => d.toDateString() === date.toDateString()))
            return true;

        return false;
    };

    const days = getDaysInMonth(currentMonth);

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Escolha a data"
            subtitle="Agendamento"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* HEADER DO MÊS */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() =>
                            setCurrentMonth(
                                new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                            )
                        }
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 8 }}
                    >
                        <ChevronLeft size={20} color={colors.brand[600]} />
                    </button>

                    <Title level={4} style={{ textAlign: 'center', color: colors.brand[900] }}>
                        {monthNames[currentMonth.getMonth()].toUpperCase()} <span style={{ color: colors.brand[400] }}>{currentMonth.getFullYear()}</span>
                    </Title>

                    <button
                        onClick={() =>
                            setCurrentMonth(
                                new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                            )
                        }
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 8 }}
                    >
                        <ChevronRight size={20} color={colors.brand[600]} />
                    </button>
                </div>

                {/* DIAS DA SEMANA */}
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map(day => (
                        <Text
                            key={day}
                            variant="caption"
                            style={{ textAlign: 'center', color: colors.brand[400] }}
                        >
                            {day}
                        </Text>
                    ))}
                </div>

                {/* CALENDÁRIO */}
                <div className="grid grid-cols-7 gap-2">
                    {days.map((date, i) => {
                        const disabled = isDateDisabled(date);
                        const selected =
                            date &&
                            selectedDate &&
                            date.toDateString() === selectedDate.toDateString();

                        return (
                            <button
                                key={i}
                                disabled={disabled}
                                onClick={() => date && setSelectedDate(date)}
                                style={{
                                    aspectRatio: '1',
                                    borderRadius: radius.md,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    background: selected ? colors.brand[600] : 'transparent',
                                    color: selected
                                        ? '#fff'
                                        : disabled
                                            ? colors.neutral[300]
                                            : colors.neutral[700],
                                    border: 'none',
                                    outline: 'none',
                                    cursor: disabled ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {date?.getDate()}
                            </button>
                        );
                    })}
                </div>

                {/* CONFIRMAR */}
                <div style={{ paddingTop: 8 }}>
                    <DSButton
                        fullWidth
                        disabled={!selectedDate}
                        onClick={() => selectedDate && onSelectDate(selectedDate)}
                        size="lg"
                    >
                        {selectedDate
                            ? `Confirmar ${selectedDate.toLocaleDateString('pt-BR')}`
                            : 'Selecione uma data'}
                    </DSButton>
                </div>

            </div>
        </Sheet>
    );
};
