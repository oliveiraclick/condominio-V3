import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, User } from 'lucide-react';
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

type Step = 'review' | 'assign' | 'approval' | 'confirm';

export const TaskTriageFlow: React.FC<TaskTriageFlowProps> = ({
    open,
    onClose,
    task,
    currentUser,
    onSuccess,
}) => {
    const [step, setStep] = useState<Step>('review');
    const [loading, setLoading] = useState(false);

    const [priority, setPriority] = useState<Task['priority']>('normal');
    const [deadlineDays, setDeadlineDays] = useState<number>(3); // Default 3 days
    const [assignedTo, setAssignedTo] = useState<string>('');
    const [requiresApproval, setRequiresApproval] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (task && open) {
            setPriority(task.priority);
            setAssignedTo(task.assigned_to || '');
            setRequiresApproval(task.requires_approval);
        }
    }, [task, open]);

    useEffect(() => {
        if (open && step === 'assign') {
            fetchEmployees();
        }
    }, [open, step]);

    const fetchEmployees = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, name, role')
            .in('role', ['admin', 'employee'])
            .order('name');

        if (data) setEmployees(data);
    };

    const handleCompleteTriage = async () => {
        if (!task || !assignedTo) {
            alert('Selecione um responsável');
            return;
        }

        setLoading(true);
        try {
            // Default to 'analysis' unless supervisor explicitly sets urgency/approval
            // But per requirement, simple routine tasks go to analysis first?
            // Actually, Triage sends to Analysis.
            // Wait, user said "Supervisor opens demand -> Reclassifies (Deadline) -> Chooses responsible -> Sends (Change Phase)".
            // Usually this means sending to the Responsible person.
            // If the responsible needs to ANALYZE first, we send to 'analysis'.

            const nextStatus = 'analysis';

            // Calculate due date
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + deadlineDays);

            const { error } = await supabase
                .from('tasks')
                .update({
                    priority, // Keep existing priority or default
                    due_date: dueDate.toISOString(),
                    assigned_to: assignedTo,
                    requires_approval: requiresApproval,
                    status: nextStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', task.id);

            if (error) throw error;

            // Send notification to assigned user
            if (assignedTo) {
                supabase.functions.invoke('push', {
                    body: {
                        title: '📋 Nova Tarefa Atribuída',
                        body: `Você foi atribuído à tarefa: ${task.title}`,
                        target_user_id: assignedTo,
                        data: { type: 'task_assigned', task_id: task.id }
                    }
                }).catch(err => console.error('Push Error:', err));
            }

            packagesCache.invalidate('tasks:all');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error completing triage:', error);
            alert('Erro ao completar triagem');
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => {
        const headers = {
            review: { title: '1. Revisar Informações', subtitle: 'Confirme os dados da tarefa' },
            assign: { title: '2. Atribuir Responsável', subtitle: 'Selecione quem executará' },
            approval: { title: '3. Configurar Aprovação', subtitle: 'Requer aprovação da diretoria?' },
            confirm: { title: '4. Confirmar Triagem', subtitle: 'Revise e finalize' },
        };
        const header = headers[step];

        return (
            <div style={{ marginBottom: spacing.xl }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={3}>{header.title}</Title>
                        <Text color="secondary">{header.subtitle}</Text>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: spacing.sm }}>
                        <X size={24} color={colors.neutral[600]} />
                    </button>
                </div>
            </div>
        );
    };

    const renderReview = () => (
        <div>
            <div style={{ backgroundColor: colors.neutral[50], padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.lg }}>
                <Text weight="bold" style={{ fontSize: '18px', marginBottom: spacing.md }}>{task?.title}</Text>
                {task?.description && <Text color="secondary" style={{ marginBottom: spacing.md }}>{task.description}</Text>}
                {task?.location && (
                    <div style={{ marginTop: spacing.md }}>
                        <Text color="secondary" style={{ fontSize: '12px' }}>LOCALIZAÇÃO</Text>
                        <Text>{task.location}</Text>
                    </div>
                )}
            </div>

            {/* Deadline Selection */}
            <div style={{ marginBottom: spacing.lg }}>
                <Text weight="bold" style={{ marginBottom: spacing.sm }}>Definir Prazo</Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing.sm }}>
                    {[1, 3, 7, 14, 21, 30].map((days) => (
                        <label
                            key={days}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: spacing.md,
                                borderRadius: radius.md,
                                border: `2px solid ${deadlineDays === days ? colors.brand[500] : colors.neutral[200]}`,
                                backgroundColor: deadlineDays === days ? colors.brand[50] : '#ffffff',
                                cursor: 'pointer',
                            }}
                        >
                            <input
                                type="radio"
                                name="deadline"
                                value={days}
                                checked={deadlineDays === days}
                                onChange={() => setDeadlineDays(days)}
                                style={{ display: 'none' }}
                            />
                            <Text weight={deadlineDays === days ? 'bold' : 'normal'}>{days} dias</Text>
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: spacing.md }}>
                <DSButton variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</DSButton>
                <DSButton onClick={() => setStep('assign')} icon={<ArrowRight size={20} />} iconPosition="right" style={{ flex: 1 }}>
                    Próximo
                </DSButton>
            </div>
        </div>
    );

    const renderAssign = () => {
        const filteredEmployees = employees.filter(e =>
            e.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div>
                <DSInput
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginBottom: spacing.md }}
                />

                <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: spacing.lg }}>
                    {filteredEmployees.map(emp => (
                        <div
                            key={emp.id}
                            onClick={() => setAssignedTo(emp.id)}
                            style={{
                                padding: spacing.md,
                                borderRadius: radius.md,
                                border: `2px solid ${assignedTo === emp.id ? colors.brand[500] : colors.neutral[200]}`,
                                backgroundColor: assignedTo === emp.id ? colors.brand[50] : '#ffffff',
                                marginBottom: spacing.sm,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: spacing.sm,
                            }}
                        >
                            <User size={20} color={assignedTo === emp.id ? colors.brand[500] : colors.neutral[600]} />
                            <div>
                                <Text weight={assignedTo === emp.id ? 'bold' : 'normal'}>{emp.name}</Text>
                                <Text color="secondary" style={{ fontSize: '12px' }}>
                                    {emp.role === 'admin' ? 'Administrador' : 'Funcionário'}
                                </Text>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: spacing.md }}>
                    <DSButton variant="secondary" onClick={() => setStep('review')} icon={<ArrowLeft size={20} />} style={{ flex: 1 }}>
                        Voltar
                    </DSButton>
                    <DSButton onClick={() => setStep('approval')} icon={<ArrowRight size={20} />} iconPosition="right" disabled={!assignedTo} style={{ flex: 1 }}>
                        Próximo
                    </DSButton>
                </div>
            </div>
        );
    };

    const renderApproval = () => (
        <div>
            <label
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: spacing.lg,
                    borderRadius: radius.md,
                    border: `2px solid ${requiresApproval ? '#fbbf24' : colors.neutral[200]}`, // warning hex
                    backgroundColor: requiresApproval ? '#fffbeb' : '#ffffff',
                    cursor: 'pointer',
                    marginBottom: spacing.lg,
                }}
            >
                <input
                    type="checkbox"
                    checked={requiresApproval}
                    onChange={(e) => setRequiresApproval(e.target.checked)}
                    style={{ marginRight: spacing.md, marginTop: '4px' }}
                />
                <div>
                    <Text weight="bold">Requer aprovação da diretoria</Text>
                    <Text color="secondary" style={{ fontSize: '14px', marginTop: spacing.xs }}>
                        Marque esta opção se a tarefa precisa ser aprovada antes de ser considerada concluída
                    </Text>
                </div>
            </label>

            {requiresApproval && (
                <div style={{ padding: spacing.md, backgroundColor: '#fffbeb', borderRadius: radius.md, marginBottom: spacing.lg }}>
                    <Text color="secondary" style={{ fontSize: '14px' }}>
                        ⚠️ Esta tarefa irá para o status "Aguardando Aprovação" após ser concluída pelo responsável
                    </Text>
                </div>
            )}

            <div style={{ display: 'flex', gap: spacing.md }}>
                <DSButton variant="secondary" onClick={() => setStep('assign')} icon={<ArrowLeft size={20} />} style={{ flex: 1 }}>
                    Voltar
                </DSButton>
                <DSButton onClick={() => setStep('confirm')} icon={<ArrowRight size={20} />} iconPosition="right" style={{ flex: 1 }}>
                    Próximo
                </DSButton>
            </div>
        </div>
    );

    const renderConfirm = () => {
        const assignedEmployee = employees.find(e => e.id === assignedTo);

        return (
            <div>
                <div style={{ backgroundColor: colors.neutral[50], padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.lg }}>
                    <div style={{ marginBottom: spacing.md }}>
                        <Text color="secondary" style={{ fontSize: '12px' }}>TAREFA</Text>
                        <Text weight="bold">{task?.title}</Text>
                    </div>

                    <div style={{ marginBottom: spacing.md }}>
                        <Text color="secondary" style={{ fontSize: '12px' }}>PRAZO</Text>
                        <Text weight="bold">{deadlineDays} dias</Text>
                    </div>

                    <div style={{ marginBottom: spacing.md }}>
                        <Text color="secondary" style={{ fontSize: '12px' }}>RESPONSÁVEL</Text>
                        <Text weight="bold">{assignedEmployee?.name}</Text>
                    </div>

                    <div>
                        <Text color="secondary" style={{ fontSize: '12px' }}>APROVAÇÃO</Text>
                        <Text weight="bold">{requiresApproval ? '✅ Requer aprovação' : '❌ Não requer'}</Text>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: spacing.md }}>
                    <DSButton variant="secondary" onClick={() => setStep('approval')} icon={<ArrowLeft size={20} />} style={{ flex: 1 }}>
                        Voltar
                    </DSButton>
                    <DSButton onClick={handleCompleteTriage} icon={<Check size={20} />} iconPosition="right" loading={loading} style={{ flex: 1 }}>
                        Finalizar Triagem
                    </DSButton>
                </div>
            </div>
        );
    };

    if (!task) return null;

    return (
        <Sheet open={open} onClose={onClose}>
            <div style={{ paddingBottom: '120px' }}>
                {renderHeader()}
                {step === 'review' && renderReview()}
                {step === 'assign' && renderAssign()}
                {step === 'approval' && renderApproval()}
                {step === 'confirm' && renderConfirm()}
            </div>
        </Sheet>
    );
};
