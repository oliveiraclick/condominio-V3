import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { supabase } from '../../supabase';
import { Task } from '../../types/tasks';
import { Sheet } from '../design-system/Sheet';
import { DSButton } from '../design-system/Button';
import { DSInput } from '../design-system/Input';
import { Title, Text } from '../design-system/Typography';
import { colors, radius, spacing } from '../design-system/tokens';
import { packagesCache } from '../../cache/packagesCache';

interface TaskTriageFlowProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    currentUser: any;
    onSuccess: () => void;
}

export const TaskTriageFlow: React.FC<TaskTriageFlowProps> = ({
    open,
    onClose,
    task,
    currentUser,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);

    // Form fields in mandatory order with auto-save
    const [description, setDescription] = useState(() => {
        if (typeof window !== 'undefined' && task) {
            const saved = localStorage.getItem(`triage_description_${task.id}`);
            return saved || task.description || '';
        }
        return '';
    });
    const [location, setLocation] = useState(() => {
        if (typeof window !== 'undefined' && task) {
            const saved = localStorage.getItem(`triage_location_${task.id}`);
            return saved || task.location || '';
        }
        return '';
    });
    const [deadlineDays, setDeadlineDays] = useState<number>(() => {
        if (typeof window !== 'undefined' && task) {
            const saved = localStorage.getItem(`triage_deadline_${task.id}`);
            return saved ? parseInt(saved) : 3;
        }
        return 3;
    });
    const [assignedTo, setAssignedTo] = useState<string>(() => {
        if (typeof window !== 'undefined' && task) {
            const saved = localStorage.getItem(`triage_assigned_${task.id}`);
            return saved || task.assigned_to || '';
        }
        return '';
    });
    const [requiresApproval, setRequiresApproval] = useState(() => {
        if (typeof window !== 'undefined' && task) {
            const saved = localStorage.getItem(`triage_approval_${task.id}`);
            return saved === 'true' || task.requires_approval || false;
        }
        return false;
    });

    const [employees, setEmployees] = useState<any[]>([]);

    // Auto-save: Salva todos os campos automaticamente
    useEffect(() => {
        if (task && open) {
            if (description) localStorage.setItem(`triage_description_${task.id}`, description);
            if (location) localStorage.setItem(`triage_location_${task.id}`, location);
            localStorage.setItem(`triage_deadline_${task.id}`, deadlineDays.toString());
            if (assignedTo) localStorage.setItem(`triage_assigned_${task.id}`, assignedTo);
            localStorage.setItem(`triage_approval_${task.id}`, requiresApproval.toString());
        }
    }, [description, location, deadlineDays, assignedTo, requiresApproval, task, open]);

    // Fetch employees when modal opens
    useEffect(() => {
        if (open) {
            fetchEmployees();
        }
    }, [open]);

    const fetchEmployees = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('role', 'employee')
            .order('name');
        if (data) setEmployees(data);
    };

    // Validation
    const isFormValid = () => {
        return (
            location.trim() !== '' &&
            deadlineDays >= 1 && deadlineDays <= 30 &&
            assignedTo !== ''
        );
    };

    const handleCompleteTriage = async () => {
        if (!isFormValid()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + deadlineDays);

            // System decides: needs evaluation based on category complexity
            const needsEvaluation = task?.category === 'infraestrutura' || task?.category === 'seguranca';
            const newStatus = needsEvaluation ? 'evaluating' : 'executing';

            const { error } = await supabase
                .from('tasks')
                .update({
                    description: description.trim() || null,
                    location: location.trim(),
                    due_date: dueDate.toISOString(),
                    assigned_to: assignedTo,
                    requires_approval: requiresApproval,
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', task?.id);

            if (error) throw error;

            // Limpa todos os rascunhos salvos
            if (task) {
                localStorage.removeItem(`triage_description_${task.id}`);
                localStorage.removeItem(`triage_location_${task.id}`);
                localStorage.removeItem(`triage_deadline_${task.id}`);
                localStorage.removeItem(`triage_assigned_${task.id}`);
                localStorage.removeItem(`triage_approval_${task.id}`);
            }

            packagesCache.invalidate('tasks:all');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error completing triage:', error);
            alert('Erro ao concluir triagem');
        } finally {
            setLoading(false);
        }
    };

    if (!task) return null;

    return (
        <Sheet open={open} onClose={onClose}>
            {/* Header */}
            <div style={{ marginBottom: spacing.xl }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={3}>Triagem de Chamado</Title>
                        <Text color="secondary">Classificar corretamente o chamado uma única vez</Text>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: spacing.sm,
                        }}
                    >
                        <X size={24} color={colors.neutral[600]} />
                    </button>
                </div>
            </div>

            {/* Task Info */}
            <div style={{
                backgroundColor: colors.neutral[50],
                padding: spacing.md,
                borderRadius: radius.md,
                marginBottom: spacing.lg
            }}>
                <Text weight="bold" style={{ marginBottom: spacing.xs }}>{task.title}</Text>
                <Text size="sm" color="secondary">Categoria: {task.category}</Text>
            </div>

            {/* Form Fields - Mandatory Order */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                {/* 1. Descrição */}
                <DSInput
                    label="Descrição"
                    placeholder="Descreva o problema de forma objetiva"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                />

                {/* 2. Local */}
                <DSInput
                    label="Local *"
                    placeholder="Ex: Casa 12 / Área comum / Portaria"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                />

                {/* 3. Prazo */}
                <div>
                    <Text weight="bold" style={{ marginBottom: spacing.sm }}>
                        Prazo máximo para conclusão *
                    </Text>
                    <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.xs }}>
                        {[1, 3, 7, 15, 30].map((days) => (
                            <button
                                key={days}
                                onClick={() => setDeadlineDays(days)}
                                style={{
                                    flex: 1,
                                    padding: spacing.sm,
                                    borderRadius: radius.md,
                                    border: `2px solid ${deadlineDays === days ? colors.brand[500] : colors.neutral[200]}`,
                                    backgroundColor: deadlineDays === days ? colors.brand[50] : '#ffffff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Text weight={deadlineDays === days ? 'bold' : 'normal'}>
                                    {days} {days === 1 ? 'dia' : 'dias'}
                                </Text>
                            </button>
                        ))}
                    </div>
                    <DSInput
                        type="number"
                        placeholder="Ou digite (1-30 dias)"
                        value={deadlineDays.toString()}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val >= 1 && val <= 30) setDeadlineDays(val);
                        }}
                        min={1}
                        max={30}
                    />
                </div>

                {/* 4. Responsável */}
                <div>
                    <Text weight="bold" style={{ marginBottom: spacing.sm }}>
                        Responsável *
                    </Text>
                    <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        style={{
                            width: '100%',
                            padding: spacing.md,
                            borderRadius: radius.md,
                            border: `1px solid ${colors.neutral[300]}`,
                            fontSize: '16px',
                            backgroundColor: '#ffffff',
                        }}
                    >
                        <option value="">Selecione um funcionário interno</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 5. Requer aprovação */}
                <div style={{
                    backgroundColor: colors.neutral[50],
                    padding: spacing.md,
                    borderRadius: radius.md,
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={requiresApproval}
                            onChange={(e) => setRequiresApproval(e.target.checked)}
                            style={{ marginRight: spacing.sm, width: '20px', height: '20px' }}
                        />
                        <div>
                            <Text weight="bold">Requer aprovação da diretoria ao final?</Text>
                            <Text size="sm" color="secondary">
                                Se marcado, a tarefa precisará de aprovação após a conclusão
                            </Text>
                        </div>
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.xl }}>
                <DSButton
                    variant="secondary"
                    onClick={onClose}
                    style={{ flex: 1 }}
                >
                    Cancelar
                </DSButton>
                <DSButton
                    onClick={handleCompleteTriage}
                    icon={<Check size={20} />}
                    iconPosition="right"
                    loading={loading}
                    disabled={!isFormValid()}
                    style={{ flex: 1 }}
                >
                    Concluir Triagem
                </DSButton>
            </div>

            {/* Validation message */}
            {!isFormValid() && (
                <Text size="sm" color="secondary" style={{ textAlign: 'center', marginTop: spacing.sm }}>
                    Preencha todos os campos obrigatórios para continuar
                </Text>
            )}
        </Sheet>
    );
};
