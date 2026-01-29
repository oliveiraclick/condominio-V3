import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, User, Mail, Lock, Building, Smartphone, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabase';
import { maskCPF, maskPhone, maskCNPJ } from '../utils/masks';
import { validateCPF, validateCNPJ } from '../utils/validators';

// --- SPLASH SCREEN MODERN (LIGHT) ---
export const SplashScreenModern: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setTimeout(onFinish, 4000); // 4 seconds duration
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-50">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className={`absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-brand-100/50 rounded-full blur-[100px] transition-all duration-[2000ms] ${mounted ? 'translate-x-10 translate-y-10 opacity-70' : 'opacity-0'}`} />
                <div className={`absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-brand-100/50 rounded-full blur-[100px] transition-all duration-[2000ms] delay-300 ${mounted ? '-translate-x-10 -translate-y-10 opacity-70' : 'opacity-0'}`} />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className={`relative mb-8 transition-all duration-1000 ${mounted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                    <div className="absolute inset-0 bg-brand-500/10 blur-xl rounded-full" />
                    <div className="relative w-32 h-32 bg-white rounded-[32px] border border-slate-100 flex items-center justify-center shadow-2xl shadow-brand-glow">
                        <Building size={48} className="text-brand-primary drop-shadow-sm" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                        <Sparkles className="text-amber-400 animate-pulse" size={24} />
                    </div>
                </div>

                <h1 className={`text-5xl font-black text-slate-900 tracking-tighter mb-2 transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    MORADOR
                </h1>
                <p className={`text-sm font-bold text-slate-400 tracking-[0.4em] uppercase transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    Clicou, Achou.
                </p>
            </div>

            <div className="absolute bottom-12 flex flex-col items-center gap-2">
                <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-gradient-horizontal animate-progress origin-left" style={{ animationDuration: '4s' }} />
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Carregando Experiência</span>
            </div>
        </div>
    );
};

import { BiometricService } from '../services/BiometricService';
import { Fingerprint } from 'lucide-react';

// --- LOGIN MODERN (LIGHT THEME) ---
export const LoginScreenModern: React.FC<{ onLogin: (session: any) => void; onRegister: () => void }> = ({ onLogin, onRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasBiometrics, setHasBiometrics] = useState(false);

    useEffect(() => {
        const checkBiometrics = async () => {
            const { available } = await BiometricService.isAvailable();
            const credentials = await BiometricService.getCredentials();
            if (available && credentials) {
                setHasBiometrics(true);
                // Opcional: Tentar login automático via biometria ao abrir se preferir
            }
        };
        checkBiometrics();
    }, []);

    const handleLogin = async (e?: any, forcedEmail?: string, forcedPassword?: string) => {
        if (e) e.preventDefault();
        setLoading(true);
        const loginEmail = forcedEmail || email;
        const loginPass = forcedPassword || password;

        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPass
        });

        if (error) alert(error.message);
        else onLogin(data.session);
        setLoading(false);
    };

    const handleBiometricLogin = async () => {
        const credentials = await BiometricService.getCredentials();
        if (!credentials) return;

        const authenticated = await BiometricService.authenticate();
        if (authenticated) {
            handleLogin(null, credentials.username, credentials.password);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-slate-900">
            {/* Background Effects (Subtle for Light Mode) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-blue-200/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-amber-200/30 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="w-24 h-24 bg-white rounded-[32px] border border-slate-100 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                        <Building size={40} className="text-brand-primary" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter mb-2 text-slate-900">Bem-vindo</h1>
                    <p className="text-slate-500 font-medium text-sm">Acesse seu condomínio exclusivo</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 focus-within:ring-2 focus-within:ring-brand-500 transition-all flex items-center">
                        <div className="w-12 h-12 flex items-center justify-center text-slate-400">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email"
                            className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 h-12 font-medium"
                        />
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 focus-within:ring-2 focus-within:ring-brand-500 transition-all flex items-center">
                        <div className="w-12 h-12 flex items-center justify-center text-slate-400">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Senha"
                            className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 h-12 font-medium"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mb-4">
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-slate-900/20"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>

                    {hasBiometrics && (
                        <button
                            onClick={handleBiometricLogin}
                            disabled={loading}
                            title="Entrar com Biometria"
                            className="w-14 h-14 bg-white border border-slate-200 text-slate-900 rounded-2xl flex items-center justify-center hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm"
                        >
                            <Fingerprint size={24} />
                        </button>
                    )}
                </div>

                <button
                    onClick={onRegister}
                    className="w-full h-14 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] transition-all"
                >
                    Criar Nova Conta
                </button>

                <p className="text-center text-[10px] text-slate-300 uppercase tracking-[0.2em] mt-8 font-bold">v{__APP_VERSION__}</p>
            </div>
        </div>
    );
};

// --- REGISTRATION MODERN (RESIDENT - LIGHT) ---
export const ResidentRegistrationModern: React.FC<{ onFinish: () => void; onBack: () => void }> = ({ onFinish, onBack }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', unit: '', tower: '', cpf: ''
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!validateCPF(formData.cpf)) {
            alert('CPF inválido.');
            return;
        }
        setLoading(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });
            if (authError) throw authError;

            if (authData.user) {
                await supabase.from('profiles').insert([{
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
                onFinish();
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden text-slate-900">
            {/* Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/50 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-100/50 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/4" />

            {/* Header */}
            <div className="relative z-10 px-6 pt-12 pb-6 flex items-center justify-between">
                <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1 rounded-full transition-all duration-500 ${s <= step ? 'w-8 bg-brand-primary' : 'w-2 bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center pointer-events-auto relative z-10 px-6">
                {step === 1 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <h2 className="text-3xl font-bold mb-2 text-slate-900">Quem é você?</h2>
                        <p className="text-slate-500 mb-8">Vamos começar pelos seus dados básicos.</p>
                        <div className="space-y-4">
                            <InputModern icon={User} label="Nome Completo" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                            <InputModern icon={Smartphone} label="Celular" value={formData.phone} onChange={v => setFormData({ ...formData, phone: maskPhone(v) })} />
                            <InputModern icon={User} label="CPF" value={formData.cpf} onChange={v => setFormData({ ...formData, cpf: maskCPF(v) })} />
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <h2 className="text-3xl font-bold mb-2 text-slate-900">Onde você mora?</h2>
                        <p className="text-slate-500 mb-8">Para conectarmos você aos seus vizinhos.</p>
                        <div className="flex gap-4">
                            <InputModern icon={Building} label="Torre" value={formData.tower} onChange={v => setFormData({ ...formData, tower: v })} />
                            <InputModern icon={Building} label="Unidade" value={formData.unit} onChange={v => setFormData({ ...formData, unit: v })} />
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <h2 className="text-3xl font-bold mb-2 text-slate-900">Acesso</h2>
                        <p className="text-slate-500 mb-8">Defina seu login seguro.</p>
                        <div className="space-y-4">
                            <InputModern icon={Mail} label="Email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} />
                            <InputModern icon={Lock} label="Senha" type="password" value={formData.password} onChange={v => setFormData({ ...formData, password: v })} />
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-10 px-6 pb-8 pt-4">
                <button
                    onClick={() => { if (step < 3) setStep(step + 1); else handleRegister(); }}
                    disabled={loading}
                    className="w-full h-14 bg-brand-gradient text-brand-contrast rounded-2xl flex items-center justify-between px-6 font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-brand-glow border-none"
                >
                    <span>{step === 3 ? (loading ? 'Criando...' : 'Finalizar') : 'Continuar'}</span>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        {step === 3 ? <CheckCircle size={18} className="stroke-brand-contrast" /> : <ArrowRight size={18} className="stroke-brand-contrast" />}
                    </div>
                </button>
            </div>
        </div>
    );
};

// --- REGISTRATION MODERN (PROFESSIONAL - LIGHT) ---
export const ProfessionalRegistrationModern: React.FC<{ onFinish: () => void; onBack: () => void }> = ({ onFinish, onBack }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', category: 'Outros',
        cpf: '', cnpj: '', docType: 'cpf' as 'cpf' | 'cnpj'
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (formData.docType === 'cpf' && !validateCPF(formData.cpf)) {
            alert('CPF inválido.'); return;
        }
        if (formData.docType === 'cnpj' && !validateCNPJ(formData.cnpj)) {
            alert('CNPJ inválido.'); return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({ email: formData.email, password: formData.password });
            if (error) throw error;
            if (data.user) {
                await supabase.from('profiles').insert([{
                    id: data.user.id, name: formData.name, email: formData.email, phone: formData.phone,
                    cpf: formData.docType === 'cpf' ? formData.cpf : null,
                    cnpj: formData.docType === 'cnpj' ? formData.cnpj : null,
                    role: 'professional', category: formData.category, is_on_site: false, condominium_id: '00000000-0000-0000-0000-000000000000'
                }]);
                onFinish();
            }
        } catch (err: any) { alert(err.message); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden text-slate-900">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/4" />

            {/* Header */}
            <div className="relative z-10 px-6 pt-12 pb-6 flex items-center justify-between">
                <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex gap-2">
                    {[1, 2].map(s => <div key={s} className={`h-1 rounded-full transition-all ${s <= step ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-200'}`} />)}
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center pointer-events-auto relative z-10 px-6">
                {step === 1 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <h2 className="text-3xl font-bold mb-2 text-slate-900">Parceiro</h2>
                        <p className="text-slate-500 mb-8">Cadastre-se para oferecer serviços.</p>
                        <div className="space-y-4">
                            <InputModern icon={User} label="Nome Profissional" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                            <InputModern icon={Smartphone} label="Celular" value={formData.phone} onChange={v => setFormData({ ...formData, phone: maskPhone(v) })} />

                            <div className="flex gap-4 px-1">
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 font-medium">
                                    <input type="radio" checked={formData.docType === 'cpf'} onChange={() => setFormData({ ...formData, docType: 'cpf' })} /> CPF
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 font-medium">
                                    <input type="radio" checked={formData.docType === 'cnpj'} onChange={() => setFormData({ ...formData, docType: 'cnpj' })} /> CNPJ
                                </label>
                            </div>

                            {formData.docType === 'cpf' ? (
                                <InputModern icon={User} label="CPF" value={formData.cpf} onChange={v => setFormData({ ...formData, cpf: maskCPF(v) })} />
                            ) : (
                                <InputModern icon={Building} label="CNPJ" value={formData.cnpj} onChange={v => setFormData({ ...formData, cnpj: maskCNPJ(v) })} />
                            )}
                            <div className="group bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Categoria</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="bg-transparent border-none outline-none w-full text-lg text-slate-900">
                                    <option>Limpeza</option><option>Manutenção</option><option>Aulas</option><option>Beleza</option><option>Outros</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <h2 className="text-3xl font-bold mb-2 text-slate-900">Acesso</h2>
                        <p className="text-slate-500 mb-8">Dados para entrar no app.</p>
                        <div className="space-y-4">
                            <InputModern icon={Mail} label="Email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} />
                            <InputModern icon={Lock} label="Senha" type="password" value={formData.password} onChange={v => setFormData({ ...formData, password: v })} />
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-10 px-6 pb-8 pt-4">
                <button
                    onClick={() => { if (step < 2) setStep(step + 1); else handleRegister(); }}
                    disabled={loading}
                    className="w-full h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-between px-6 font-bold text-lg shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    <span>{step === 2 ? (loading ? 'Finalizando...' : 'Concluir') : 'Continuar'}</span>
                    <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
                        {step === 2 ? <CheckCircle size={18} /> : <ArrowRight size={18} />}
                    </div>
                </button>
            </div>
        </div>
    );
};

// Helper Input Component (Light Mode)
const InputModern = ({ icon: Icon, label, value, onChange, type = "text" }: any) => (
    <div className="group bg-white border border-slate-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-brand-500/50 focus-within:border-brand-primary transition-all shadow-sm">
        <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
        <div className="flex items-center gap-3">
            <Icon size={18} className="text-slate-400 group-focus-within:text-brand-primary transition-colors" />
            <input type={type} value={value} onChange={e => onChange(e.target.value)} className="bg-transparent border-none outline-none w-full text-lg placeholder-slate-300 text-slate-900 font-medium" />
        </div>
    </div>
);
