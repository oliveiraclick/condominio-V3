import React, { useState } from 'react';
import { User, Smartphone, MapPin, Building, CheckCircle, ArrowRight, ArrowLeft, Mail, Lock, ShieldCheck, CreditCard } from 'lucide-react';
import { supabase } from '../supabase';

import { Sheet } from './design-system/Sheet';
import { DSButton } from './design-system/Button';
import { DSInput } from './design-system/Input';
import { Title, Text } from './design-system/Typography';
import { colors, radius, spacing } from './design-system/tokens';

import { maskCPF, maskPhone } from '../utils/masks';
import { validateCPF } from '../utils/validators';

interface RegistrationFlowProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'personal' | 'property' | 'account' | 'confirm' | 'success';

// Helper for visual sections
const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        <Title level={4} style={{ color: colors.brand[600], borderLeft: `4px solid ${colors.brand[500]}`, paddingLeft: spacing.sm }}>
            {title}
        </Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {children}
        </div>
    </div>
);

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({ open, onClose, onSuccess }) => {
    const [step, setStep] = useState<Step>('personal');
    const [loading, setLoading] = useState(false);

    // Data State
    const [formData, setFormData] = useState({
        name: '',
        cpf: '',
        phone: '',
        unit: '',
        tower: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });

    // Validation State
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleNext = () => {
        if (validateStep(step)) {
            if (step === 'personal') setStep('property');
            else if (step === 'property') setStep('account');
            else if (step === 'account') setStep('confirm');
        }
    };

    const handleBack = () => {
        if (step === 'property') setStep('personal');
        else if (step === 'account') setStep('property');
        else if (step === 'confirm') setStep('account');
    };

    const validateStep = (currentStep: Step) => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (currentStep === 'personal') {
            if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
            if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
            else if (!validateCPF(formData.cpf)) newErrors.cpf = 'CPF inválido';
            if (!formData.phone) newErrors.phone = 'Celular é obrigatório';
        }

        if (currentStep === 'property') {
            if (!formData.unit) newErrors.unit = 'Unidade é obrigatória';
            if (!formData.tower) newErrors.tower = 'Bloco/Torre é obrigatório';
        }

        if (currentStep === 'account') {
            if (!formData.email) newErrors.email = 'Email é obrigatório';
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';

            if (!formData.password) newErrors.password = 'Senha é obrigatória';
            else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';

            if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = 'Senhas não conferem';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
        } else {
            setErrors({});
        }

        return isValid;
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;

            if (authData.user) {
                const { error: profileError } = await supabase.from('profiles').insert([{
                    id: authData.user.id,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    cpf: formData.cpf,
                    unit: formData.unit,
                    tower: formData.tower,
                    role: 'resident',
                    condominium_id: '00000000-0000-0000-0000-000000000000'
                }]);

                if (profileError) {
                    // Rollback simple (nao deleta user auth por segurança do cliente, mas avisa)
                    throw new Error('Erro ao salvar perfil: ' + profileError.message);
                }

                setStep('success');
            }
        } catch (error: any) {
            alert(error.message || 'Erro ao realizar cadastro');
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => {
        switch (step) {
            case 'personal': return { title: 'Criar Conta', subtitle: 'Passo 1 de 3: Dados Pessoais' };
            case 'property': return { title: 'Onde você mora?', subtitle: 'Passo 2 de 3: Dados do Imóvel' };
            case 'account': return { title: 'Segurança', subtitle: 'Passo 3 de 3: Dados de Acesso' };
            case 'confirm': return { title: 'Revisão', subtitle: 'Confirme seus dados' };
            case 'success': return { title: 'Bem-vindo(a)!', subtitle: 'Cadastro realizado com sucesso' };
        }
    };

    const header = renderHeader();

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title={header.title}
            subtitle={header.subtitle}
            height="95vh"
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: spacing.xl, paddingBottom: spacing.xl }}>

                {/* PROGRESS BAR */}
                {step !== 'success' && (
                    <div style={{ display: 'flex', gap: 4 }}>
                        <div style={{ height: 4, flex: 1, borderRadius: radius.pill, background: step === 'personal' || step === 'property' || step === 'account' || step === 'confirm' ? colors.brand[500] : colors.neutral[200] }} />
                        <div style={{ height: 4, flex: 1, borderRadius: radius.pill, background: step === 'property' || step === 'account' || step === 'confirm' ? colors.brand[500] : colors.neutral[200] }} />
                        <div style={{ height: 4, flex: 1, borderRadius: radius.pill, background: step === 'account' || step === 'confirm' ? colors.brand[500] : colors.neutral[200] }} />
                    </div>
                )}

                <div style={{ flex: 1, overflowY: 'auto' }}>

                    {/* STEP 1: PERSONAL */}
                    {step === 'personal' && (
                        <FormSection title="Sobre Você">
                            <DSInput
                                label="Nome Completo"
                                placeholder="Seu nome"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                error={errors.name}
                                startIcon={<User size={18} />}
                                fullWidth
                            />
                            <DSInput
                                label="CPF"
                                placeholder="000.000.000-00"
                                value={formData.cpf}
                                onChange={e => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                                error={errors.cpf}
                                startIcon={<CreditCard size={18} />}
                                fullWidth
                            />
                            <DSInput
                                label="Celular"
                                placeholder="(00) 00000-0000"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                                error={errors.phone}
                                startIcon={<Smartphone size={18} />}
                                fullWidth
                            />
                        </FormSection>
                    )}

                    {/* STEP 2: PROPERTY */}
                    {step === 'property' && (
                        <FormSection title="Residência">
                            <div style={{ padding: spacing.md, background: colors.brand[50], borderRadius: radius.lg, marginBottom: spacing.md }}>
                                <Text style={{ color: colors.brand[700], fontSize: 13 }}>
                                    Isso ajudará a portaria a identificar você e suas encomendas.
                                </Text>
                            </div>
                            <div style={{ display: 'flex', gap: spacing.md }}>
                                <div style={{ flex: 1 }}>
                                    <DSInput
                                        label="Bloco / Torre"
                                        placeholder="Ex: A"
                                        value={formData.tower}
                                        onChange={e => setFormData({ ...formData, tower: e.target.value })}
                                        error={errors.tower}
                                        startIcon={<Building size={18} />}
                                        fullWidth
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <DSInput
                                        label="Unidade / Apto"
                                        placeholder="Ex: 101"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        error={errors.unit}
                                        startIcon={<MapPin size={18} />}
                                        fullWidth
                                    />
                                </div>
                            </div>
                        </FormSection>
                    )}

                    {/* STEP 3: ACCOUNT */}
                    {step === 'account' && (
                        <FormSection title="Login e Segurança">
                            <DSInput
                                label="Email"
                                placeholder="seu@email.com"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                error={errors.email}
                                startIcon={<Mail size={18} />}
                                fullWidth
                            />
                            <DSInput
                                label="Senha"
                                placeholder="Mínimo 6 caracteres"
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                error={errors.password}
                                startIcon={<Lock size={18} />}
                                fullWidth
                            />
                            <DSInput
                                label="Confirmar Senha"
                                placeholder="Repita a senha"
                                type="password"
                                value={formData.passwordConfirm}
                                onChange={e => setFormData({ ...formData, passwordConfirm: e.target.value })}
                                error={errors.passwordConfirm}
                                startIcon={<ShieldCheck size={18} />}
                                fullWidth
                            />
                        </FormSection>
                    )}

                    {/* STEP 4: CONFIRMATION */}
                    {step === 'confirm' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>

                            <div style={{ background: colors.neutral[50], borderRadius: radius.xl, padding: spacing.lg, border: `1px solid ${colors.neutral[200]}` }}>
                                <Title level={4} style={{ marginBottom: spacing.md }}>Resumo</Title>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                                    <div>
                                        <Text variant="caption">NOME</Text>
                                        <Text weight="bold">{formData.name}</Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <Text variant="caption">CPF</Text>
                                            <Text>{formData.cpf}</Text>
                                        </div>
                                        <div>
                                            <Text variant="caption">CELULAR</Text>
                                            <Text>{formData.phone}</Text>
                                        </div>
                                    </div>
                                    <div style={{ height: 1, background: colors.neutral[200], margin: '8px 0' }} />
                                    <div>
                                        <Text variant="caption">ENDEREÇO</Text>
                                        <Text weight="bold">Bloco {formData.tower} - Apto {formData.unit}</Text>
                                    </div>
                                    <div style={{ height: 1, background: colors.neutral[200], margin: '8px 0' }} />
                                    <div>
                                        <Text variant="caption">EMAIL DE LOGIN</Text>
                                        <Text>{formData.email}</Text>
                                    </div>
                                </div>
                            </div>

                            <Text style={{ textAlign: 'center', fontSize: 12, color: colors.neutral[500] }}>
                                Ao criar a conta, você concorda com os Termos de Uso e Política de Privacidade do Condomínio.
                            </Text>
                        </div>
                    )}

                    {/* STEP 5: SUCCESS */}
                    {step === 'success' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: spacing.lg }}>
                            <div style={{ width: 80, height: 80, borderRadius: radius.pill, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                                <CheckCircle size={40} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <Title level={2}>Tudo pronto!</Title>
                                <Text style={{ color: colors.neutral[500], marginTop: spacing.sm }}>
                                    Seu cadastro foi realizado com sucesso.
                                </Text>
                            </div>
                        </div>
                    )}

                </div>

                {/* FOOTER ACTIONS */}
                <div style={{ marginTop: 'auto', paddingTop: spacing.md }}>
                    {step === 'success' ? (
                        <DSButton fullWidth size="lg" onClick={onSuccess}>
                            Ir para Login
                        </DSButton>
                    ) : (
                        <div style={{ display: 'flex', gap: spacing.md }}>
                            {step !== 'personal' && (
                                <DSButton variant="secondary" onClick={handleBack} disabled={loading} style={{ flex: 1 }}>
                                    <ArrowLeft size={18} />
                                </DSButton>
                            )}
                            <DSButton
                                fullWidth={step === 'personal'}
                                style={{ flex: step === 'personal' ? 1 : 3 }}
                                size="lg"
                                onClick={step === 'confirm' ? handleSubmit : handleNext}
                                disabled={loading}
                                rightIcon={step !== 'confirm' && !loading ? <ArrowRight size={18} /> : undefined}
                            >
                                {step === 'confirm' ? (loading ? 'Criando Conta...' : 'Confirmar e Criar') : 'Continuar'}
                            </DSButton>
                        </div>
                    )}
                </div>

            </div>
        </Sheet>
    );
};
