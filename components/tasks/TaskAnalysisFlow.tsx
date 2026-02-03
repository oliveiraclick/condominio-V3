import React, { useState } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabase';
import { Task } from '../../types/tasks';
import { Sheet } from '../design-system/Sheet';
import { DSButton } from '../design-system/Button';
import { DSInput } from '../design-system/Input';
import { Title, Text } from '../design-system/Typography';
import { colors, radius, spacing } from '../design-system/tokens';

interface TaskAnalysisFlowProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    currentUser: any;
    onSuccess: () => void;
}

export const TaskAnalysisFlow: React.FC<TaskAnalysisFlowProps> = ({
    open,
    onClose,
    task,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);

    // Analysis Fields
    const [needsQuote, setNeedsQuote] = useState<boolean | null>(null);
    const [inStock, setInStock] = useState<boolean | null>(null);
    const [estimatedCost, setEstimatedCost] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [comments, setComments] = useState('');

    // Routing Fields
    const [nextStatus, setNextStatus] = useState<'executing' | 'evaluating'>('executing');
    const [nextAssignee, setNextAssignee] = useState('');
    const [employees, setEmployees] = useState<any[]>([]);

    // Load employees
    React.useEffect(() => {
        if (open) {
            const fetchEmployees = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, name, role')
                    .in('role', ['admin', 'employee', 'board']) // Assuming board might need to be assigned for approval
                    .order('name');
                if (data) setEmployees(data);
            };
            fetchEmployees();

            // Default assignee to current assigned if available
            if (task?.assigned_to) setNextAssignee(task.assigned_to);
        }
    }, [open, task]);

    // Auto-suggest status based on inputs
    React.useEffect(() => {
        const isComplex = needsQuote === true || (parseFloat(estimatedCost) > 0);
        setNextStatus(isComplex ? 'evaluating' : 'executing');
    }, [needsQuote, estimatedCost]);

    const handleCompleteAnalysis = async () => {
        if (!task) return;
        if (needsQuote === null || inStock === null || !estimatedTime || !nextAssignee) {
            alert('Por favor, preencha todos os campos e selecione o responsável.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    status: nextStatus,
                    needs_quote: needsQuote,
                    requires_approval: needsQuote === true,
                    in_stock: inStock,
                    estimated_cost: parseFloat(estimatedCost) || 0,
                    estimated_time: estimatedTime,
                    analysis_comments: comments,
                    assigned_to: nextAssignee, // Update assignee
                    updated_at: new Date().toISOString()
                })
                .eq('id', task.id);

            if (error) throw error;
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error analyzing task:', error);
            alert('Erro ao salvar análise');
        } finally {
            setLoading(false);
        }
    };

    if (!task) return null;

    return (
        <Sheet open={open} onClose={onClose}>
            <div style={{ marginBottom: spacing.xl }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={3}>Análise & Encaminhamento</Title>
                        <Text color="secondary">Defina o escopo e o próximo responsável</Text>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: spacing.sm }}>
                        <X size={24} color={colors.neutral[600]} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>

                {/* Section 1: Technical Assessment */}
                <div>
                    <Text weight="bold" size="lg" style={{ marginBottom: spacing.md, color: colors.brand[600] }}>1. Avaliação Técnica</Text>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                        <div>
                            <Text weight="bold" style={{ marginBottom: spacing.xs }}>Precisa de cotação externa?</Text>
                            <div style={{ display: 'flex', gap: spacing.md }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
                                    <input type="radio" checked={needsQuote === true} onChange={() => setNeedsQuote(true)} />
                                    <Text>Sim (Requer Aprovação)</Text>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
                                    <input type="radio" checked={needsQuote === false} onChange={() => setNeedsQuote(false)} />
                                    <Text>Não (Execução Direta)</Text>
                                </label>
                            </div>
                        </div>

                        <div>
                            <Text weight="bold" style={{ marginBottom: spacing.xs }}>Material em estoque?</Text>
                            <div style={{ display: 'flex', gap: spacing.md }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
                                    <input type="radio" checked={inStock === true} onChange={() => setInStock(true)} />
                                    <Text>Sim</Text>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer' }}>
                                    <input type="radio" checked={inStock === false} onChange={() => setInStock(false)} />
                                    <Text>Não</Text>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing.md }}>
                            <DSInput
                                label="Custo Estimado (R$)"
                                type="number"
                                placeholder="0.00"
                                value={estimatedCost}
                                onChange={(e) => setEstimatedCost(e.target.value)}
                            />
                            <DSInput
                                label="Tempo Estimado"
                                placeholder="ex: 2h, 45min"
                                value={estimatedTime}
                                onChange={(e) => setEstimatedTime(e.target.value)}
                            />
                        </div>

                        <DSInput
                            label="Observações Técnicas"
                            placeholder="Detalhes sobre materiais, ferramentas ou especificidades..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            multiline
                            rows={3}
                        />
                    </div>
                </div>

                {/* Section 2: Routing */}
                <div>
                    <Text weight="bold" size="lg" style={{ marginBottom: spacing.md, color: colors.brand[600] }}>2. Encaminhamento</Text>

                    <div style={{ display: 'grid', gap: spacing.md }}>
                        <div>
                            <Text weight="bold" style={{ marginBottom: spacing.xs }}>Próxima Fase (Coluna)</Text>
                            <select
                                value={nextStatus}
                                onChange={(e) => setNextStatus(e.target.value as any)}
                                style={{
                                    width: '100%',
                                    padding: spacing.md,
                                    borderRadius: radius.md,
                                    border: `1px solid ${colors.neutral[300]}`,
                                    backgroundColor: 'white',
                                    fontSize: '16px'
                                }}
                            >
                                <option value="executing">Execução (Liberar para fazer)</option>
                                <option value="evaluating">Aprovação (Enviar p/ Diretoria)</option>
                            </select>
                        </div>

                        <div>
                            <Text weight="bold" style={{ marginBottom: spacing.xs }}>Responsável pela Próxima Fase</Text>
                            <select
                                value={nextAssignee}
                                onChange={(e) => setNextAssignee(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: spacing.md,
                                    borderRadius: radius.md,
                                    border: `1px solid ${colors.neutral[300]}`,
                                    backgroundColor: 'white',
                                    fontSize: '16px'
                                }}
                            >
                                <option value="">Selecione um funcionário...</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <div style={{ marginTop: spacing.sm }}>
                    <DSButton
                        fullWidth
                        onClick={handleCompleteAnalysis}
                        loading={loading}
                        disabled={needsQuote === null || inStock === null || !estimatedTime || !nextAssignee}
                        size="lg"
                    >
                        Confirmar e Encaminhar
                    </DSButton>
                </div>
            </div>
        </Sheet>
    );
};
