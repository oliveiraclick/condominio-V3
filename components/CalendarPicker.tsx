import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';

interface CalendarPickerProps {
    onSelectDate: (date: Date) => void;
    onClose: () => void;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[];
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
    onSelectDate,
    onClose,
    minDate = new Date(),
    maxDate,
    disabledDates = []
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const isDateDisabled = (date: Date | null): boolean => {
        if (!date) return true;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        // Disable if before minDate
        if (minDate && date < minDate) return true;

        // Disable if after maxDate
        if (maxDate && date > maxDate) return true;

        // Disable if in disabledDates array
        if (disabledDates.some(d => d.toDateString() === date.toDateString())) return true;

        return false;
    };

    const handleDateClick = (date: Date | null) => {
        if (!date || isDateDisabled(date)) return;
        setSelectedDate(date);
    };

    const handleConfirm = () => {
        if (selectedDate) {
            onSelectDate(selectedDate);
        }
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const days = getDaysInMonth(currentMonth);

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-white rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom-10 duration-300 p-8 pb-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic text-slate-900 tracking-tight">Escolha a Data</h3>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Agendamento</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={goToPreviousMonth}
                        className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h4>
                    <button
                        onClick={goToNextMonth}
                        className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 gap-2 mb-3">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-8">
                    {days.map((date, index) => {
                        const isDisabled = isDateDisabled(date);
                        const isSelected = date && selectedDate && date.toDateString() === selectedDate.toDateString();
                        const isToday = date && date.toDateString() === new Date().toDateString();

                        return (
                            <button
                                key={index}
                                onClick={() => handleDateClick(date)}
                                disabled={isDisabled}
                                className={`
                  aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all
                  ${!date ? 'invisible' : ''}
                  ${isDisabled ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-brand-50 hover:text-brand-600 active:scale-95'}
                  ${isSelected ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : ''}
                  ${isToday && !isSelected ? 'border-2 border-brand-600' : ''}
                `}
                            >
                                {date ? date.getDate() : ''}
                            </button>
                        );
                    })}
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handleConfirm}
                    disabled={!selectedDate}
                    className={`
            w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm transition-all
            ${selectedDate
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 active:scale-95'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }
          `}
                >
                    {selectedDate ? `Confirmar ${selectedDate.toLocaleDateString('pt-BR')}` : 'Selecione uma data'}
                </button>
            </div>
        </div>
    );
};
