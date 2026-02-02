import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Sheet } from '../design-system/Sheet';
import { Title, Text } from '../design-system/Typography';
import { DSButton } from '../design-system/Button';
import { colors, spacing, radius } from '../design-system/tokens';
import { CheckCircle, XCircle, User, Loader2, MapPin } from 'lucide-react';

interface PendingApprovalsModalProps {
    open: boolean;
    onClose: () => void;
}

export const PendingApprovalsModal: React.FC<PendingApprovalsModalProps> = ({ open, onClose }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchPendingUsers = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (data) setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        if (open) fetchPendingUsers();
    }, [open]);

    const handleAction = async (userId: string, action: 'approved' | 'rejected') => {
        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status: action })
                .eq('id', userId);

            if (error) throw error;

            // Refresh list
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error(err);
            alert('Erro ao processar ação');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Aprovações Pendentes"
            subtitle="Libere ou recuse novos cadastros"
            height="80vh"
        >
            <div style={{ paddingBottom: spacing.xl }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: spacing.xl }}>
                        <Loader2 className="animate-spin text-slate-400" />
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.neutral[500] }}>
                        <CheckCircle size={48} style={{ margin: '0 auto', marginBottom: spacing.md, opacity: 0.2 }} />
                        <Text>Nenhum cadastro pendente.</Text>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                        {users.map(user => (
                            <div key={user.id} style={{
                                padding: spacing.md,
                                border: `1px solid ${colors.neutral[200]}`,
                                borderRadius: radius.lg,
                                background: colors.neutral[50]
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
                                    <div style={{
                                        width: 40, height: 40,
                                        borderRadius: radius.pill,
                                        background: colors.brand[100],
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: colors.brand[600]
                                    }}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <Text weight="bold" style={{ display: 'block' }}>{user.name}</Text>
                                        <Text variant="caption" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <MapPin size={12} />
                                            {user.tower} - {user.unit}
                                        </Text>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: spacing.sm }}>
                                    <DSButton
                                        variant="secondary"
                                        size="sm"
                                        fullWidth
                                        onClick={() => handleAction(user.id, 'rejected')}
                                        disabled={!!actionLoading}
                                        style={{ color: colors.danger, background: '#fee2e2', border: 'none' }}
                                    >
                                        Recusar
                                    </DSButton>
                                    <DSButton
                                        size="sm"
                                        fullWidth
                                        onClick={() => handleAction(user.id, 'approved')}
                                        disabled={!!actionLoading}
                                        isLoading={actionLoading === user.id}
                                    >
                                        Aprovar
                                    </DSButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Sheet>
    );
};
