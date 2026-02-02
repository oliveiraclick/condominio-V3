import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Camera, Trash2, ImageIcon } from 'lucide-react';
import { supabase } from '../../supabase';
import { Task } from '../../types/tasks';
import { Sheet } from '../design-system/Sheet';
import { DSButton } from '../design-system/Button';
import { DSInput } from '../design-system/Input';
import { Title, Text } from '../design-system/Typography';
import { colors, radius, spacing } from '../design-system/tokens';
import { packagesCache } from '../../cache/packagesCache';

interface TaskCreateFlowProps {
    open: boolean;
    onClose: () => void;
    currentUser: any;
    onSuccess: () => void;
}

type Step = 'basic_info' | 'attachments' | 'classification' | 'confirmation';

export const TaskCreateFlow: React.FC<TaskCreateFlowProps> = ({
    open,
    onClose,
    currentUser,
    onSuccess,
}) => {
    const [step, setStep] = useState<Step>('basic_info');
    const [loading, setLoading] = useState(false);

    // Form data
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState<Task['category']>('manutencao');
    const [priority, setPriority] = useState<Task['priority']>('normal');

    // Attachments
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const titleInputRef = useRef<HTMLInputElement>(null);

    // Reset form on close
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep('basic_info');
                setTitle('');
                setDescription('');
                setLocation('');
                setCategory('manutencao');
                setPriority('normal');
                setImageFile(null);
                setPreviewUrl(null);
            }, 300);
        } else {
            setTimeout(() => titleInputRef.current?.focus(), 100);
        }
    }, [open]);

    const handleCreateTask = async () => {
        if (!title.trim()) {
            alert('Título é obrigatório');
            return;
        }

        setLoading(true);
        try {
            const { data: taskData, error: taskError } = await supabase.from('tasks').insert({
                title: title.trim(),
                description: description.trim() || null,
                location: location.trim() || null,
                category,
                priority,
                status: 'new', // Fixed: usando o status correto do novo sistema
                created_by: currentUser.id,
                requires_approval: false,
            }).select().single();

            if (taskError) throw taskError;

            // 2. Upload and Record Attachment (if any)
            if (imageFile && taskData) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${taskData.id}/${Date.now()}.${fileExt}`;
                const filePath = `task_attachments/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('public') // Assuming 'public' bucket exists or change to 'tasks'
                    .upload(filePath, imageFile);

                if (uploadError) {
                    console.error('Error uploading photo:', uploadError);
                    // Continue anyway, but maybe inform?
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('public')
                        .getPublicUrl(filePath);

                    await supabase.from('task_attachments').insert({
                        task_id: taskData.id,
                        file_url: publicUrl,
                        file_type: 'photo',
                        created_by: currentUser.id
                    });
                }
            }

            // Invalidate cache and force immediate refresh
            packagesCache.invalidate('tasks:all');

            // Trigger parent refresh
            onSuccess();
            onClose();

            // Force immediate refetch by reloading the page section
            window.dispatchEvent(new CustomEvent('tasks:refresh'));
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Erro ao criar tarefa');
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => {
        const headers = {
            basic_info: { title: '1. Informações Básicas', subtitle: 'Descreva a ocorrência' },
            attachments: { title: '2. Foto do Problema', subtitle: 'Registre visualmente' },
            classification: { title: '3. Classificação', subtitle: 'Categoria e prioridade' },
            confirmation: { title: '4. Confirmação', subtitle: 'Revise os dados' },
        };
        const header = headers[step];

        return (
            <div style={{ marginBottom: spacing.xl }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={3}>{header.title}</Title>
                        <Text color="secondary">{header.subtitle}</Text>
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
        );
    };

    const renderBasicInfo = () => (
        <div>
            <DSInput
                ref={titleInputRef}
                label="Título da Tarefa"
                placeholder="Ex: Vazamento no Bloco A"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />

            <DSInput
                label="Descrição (Opcional)"
                placeholder="Descreva o problema em detalhes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
            />

            <DSInput
                label="Localização"
                placeholder="Ex: Portaria, Bloco A - Apto 302, Área de Lazer"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />

            <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.xl }}>
                <DSButton variant="secondary" onClick={onClose} style={{ flex: 1 }}>
                    Cancelar
                </DSButton>
                <DSButton
                    onClick={() => setStep('attachments')}
                    icon={<ArrowRight size={20} />}
                    iconPosition="right"
                    disabled={!title.trim()}
                    style={{ flex: 1 }}
                >
                    Próximo
                </DSButton>
            </div>
        </div>
    );

    const renderAttachments = () => (
        <div>
            <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                    height: '240px',
                    backgroundColor: colors.neutral[50],
                    borderRadius: radius.md,
                    border: `2px dashed ${colors.neutral[300]}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.sm,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    marginBottom: spacing.xl
                }}
            >
                {previewUrl ? (
                    <>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setImageFile(null);
                                setPreviewUrl(null);
                            }}
                            style={{
                                position: 'absolute',
                                top: spacing.md,
                                right: spacing.md,
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            <Trash2 size={20} color={colors.danger} />
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: colors.brand[50],
                            borderRadius: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.brand[600]
                        }}>
                            <Camera size={32} />
                        </div>
                        <Text weight="bold">Tirar ou Selecionar Foto</Text>
                        <Text color="secondary" style={{ fontSize: '12px' }}>Clique aqui para usar a câmera</Text>
                    </>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setImageFile(file);
                            setPreviewUrl(URL.createObjectURL(file));
                        }
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.xl }}>
                <DSButton
                    variant="secondary"
                    onClick={() => setStep('basic_info')}
                    icon={<ArrowLeft size={20} />}
                    style={{ flex: 1 }}
                >
                    Voltar
                </DSButton>
                <DSButton
                    onClick={() => setStep('classification')}
                    icon={<ArrowRight size={20} />}
                    iconPosition="right"
                    style={{ flex: 1 }}
                >
                    {previewUrl ? 'Próximo' : 'Pular Fotos'}
                </DSButton>
            </div>
        </div>
    );

    const renderClassification = () => (
        <div>
            {/* Category */}
            <div style={{ marginBottom: spacing.lg }}>
                <Text weight="bold" style={{ marginBottom: spacing.sm }}>Categoria</Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                    {[
                        { value: 'manutencao', label: '🔧 Manutenção' },
                        { value: 'limpeza', label: '✨ Limpeza' },
                        { value: 'seguranca', label: '🛡️ Segurança' },
                        { value: 'infraestrutura', label: '🏗️ Infraestrutura' },
                        { value: 'outros', label: '📋 Outros' },
                    ].map((cat) => (
                        <label
                            key={cat.value}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: spacing.md,
                                borderRadius: radius.md,
                                border: `2px solid ${category === cat.value ? colors.brand[500] : colors.neutral[200]}`,
                                backgroundColor: category === cat.value ? colors.brand[50] : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <input
                                type="radio"
                                name="category"
                                value={cat.value}
                                checked={category === cat.value}
                                onChange={(e) => setCategory(e.target.value as Task['category'])}
                                style={{ marginRight: spacing.sm }}
                            />
                            <Text weight={category === cat.value ? 'bold' : 'normal'}>{cat.label}</Text>
                        </label>
                    ))}
                </div>
            </div>

            {/* Priority */}
            <div style={{ marginBottom: spacing.lg }}>
                <Text weight="bold" style={{ marginBottom: spacing.sm }}>Prioridade</Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.sm }}>
                    {[
                        { value: 'baixa', label: '🟢 Baixa' },
                        { value: 'normal', label: '🔵 Normal' },
                        { value: 'alta', label: '🟡 Alta' },
                        { value: 'urgente', label: '🔴 Urgente' },
                    ].map((pri) => (
                        <label
                            key={pri.value}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: spacing.md,
                                borderRadius: radius.md,
                                border: `2px solid ${priority === pri.value ? colors.brand[500] : colors.neutral[200]}`,
                                backgroundColor: priority === pri.value ? colors.brand[50] : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <input
                                type="radio"
                                name="priority"
                                value={pri.value}
                                checked={priority === pri.value}
                                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                                style={{ marginRight: spacing.xs }}
                            />
                            <Text weight={priority === pri.value ? 'bold' : 'normal'}>{pri.label}</Text>
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.xl }}>
                <DSButton
                    variant="secondary"
                    onClick={() => setStep('attachments')}
                    icon={<ArrowLeft size={20} />}
                    style={{ flex: 1 }}
                >
                    Voltar
                </DSButton>
                <DSButton
                    onClick={() => setStep('confirmation')}
                    icon={<ArrowRight size={20} />}
                    iconPosition="right"
                    style={{ flex: 1 }}
                >
                    Próximo
                </DSButton>
            </div>
        </div>
    );

    const renderConfirmation = () => (
        <div>
            <div style={{ backgroundColor: colors.neutral[50], padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.xl }}>
                <div style={{ marginBottom: spacing.md }}>
                    <Text color="secondary" style={{ fontSize: '12px' }}>TÍTULO</Text>
                    <Text weight="bold">{title}</Text>
                </div>

                {description && (
                    <div style={{ marginBottom: spacing.md }}>
                        <Text color="secondary" style={{ fontSize: '12px' }}>DESCRIÇÃO</Text>
                        <Text>{description}</Text>
                    </div>
                )}

                {location && (
                    <div style={{ marginBottom: spacing.md }}>
                        <Text color="secondary" style={{ fontSize: '12px' }}>LOCALIZAÇÃO</Text>
                        <Text>{location}</Text>
                    </div>
                )}

                {previewUrl && (
                    <div style={{ marginBottom: spacing.md }}>
                        <Text color="secondary" style={{ fontSize: '12px' }}>FOTO ANEXADA</Text>
                        <div style={{
                            width: '100%',
                            height: '120px',
                            borderRadius: radius.md,
                            overflow: 'hidden',
                            marginTop: spacing.xs,
                            border: `1px solid ${colors.neutral[200]}`
                        }}>
                            <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.md }}>
                    <div>
                        <Text color="secondary" style={{ fontSize: '12px' }}>CATEGORIA</Text>
                        <Text weight="bold">{
                            category === 'manutencao' ? '🔧 Manutenção' :
                                category === 'limpeza' ? '✨ Limpeza' :
                                    category === 'seguranca' ? '🛡️ Segurança' :
                                        category === 'infraestrutura' ? '🏗️ Infraestrutura' : '📋 Outros'
                        }</Text>
                    </div>
                    <div>
                        <Text color="secondary" style={{ fontSize: '12px' }}>PRIORIDADE</Text>
                        <Text weight="bold">{
                            priority === 'baixa' ? '🟢 Baixa' :
                                priority === 'normal' ? '🔵 Normal' :
                                    priority === 'alta' ? '🟡 Alta' : '🔴 Urgente'
                        }</Text>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: spacing.md }}>
                <DSButton
                    variant="secondary"
                    onClick={() => setStep('classification')}
                    icon={<ArrowLeft size={20} />}
                    style={{ flex: 1 }}
                >
                    Voltar
                </DSButton>
                <DSButton
                    onClick={handleCreateTask}
                    icon={<Check size={20} />}
                    iconPosition="right"
                    loading={loading}
                    style={{ flex: 1 }}
                >
                    Criar Tarefa
                </DSButton>
            </div>
        </div>
    );

    return (
        <Sheet open={open} onClose={onClose}>
            {renderHeader()}
            {step === 'basic_info' && renderBasicInfo()}
            {step === 'attachments' && renderAttachments()}
            {step === 'classification' && renderClassification()}
            {step === 'confirmation' && renderConfirmation()}
        </Sheet>
    );
};
