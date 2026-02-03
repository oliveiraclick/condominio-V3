import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, User, Mail, Lock, Building, Smartphone, CheckCircle, ArrowLeft, Eye, EyeOff, Briefcase, ChevronRight, LogOut } from 'lucide-react';
import { supabase } from '../supabase';
import { maskCPF, maskPhone, maskCNPJ } from '../utils/masks';
import { validateCPF, validateCNPJ } from '../utils/validators';
import { translateError } from '../utils/errorTranslator';

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
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const checkBiometrics = async () => {
            const { available } = await BiometricService.isAvailable();
            const credentials = await BiometricService.getCredentials();
            if (available && credentials) {
                setHasBiometrics(true);
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

        if (error) alert(translateError(error));
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

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-brand-100/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-brand-100/40 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-sm">

                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-white rounded-[32px] border border-slate-100 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                        <Building size={40} className="text-brand-primary" />
                    </div>

                    <h1 className="text-3xl font-black tracking-tighter mb-2 text-brand-700 uppercase">APP MORADOR</h1>
                    <p className="text-brand-500/70 font-bold text-[10px] tracking-[0.3em] uppercase">Conecte-se. Clicou, Achou.</p>
                </div>

                {/* White Card */}
                <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 p-8 border border-slate-100/50">

                    <div className="space-y-5 mb-8">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">E-mail</label>
                            <div className="bg-slate-50/80 hover:bg-slate-100 focus-within:bg-white rounded-xl border border-slate-100 focus-within:border-brand-200 p-1 focus-within:ring-4 focus-within:ring-brand-50 transition-all flex items-center">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-300 h-10 px-3 font-medium text-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Senha</label>
                            <div className="bg-slate-50/80 hover:bg-slate-100 focus-within:bg-white rounded-xl border border-slate-100 focus-within:border-brand-200 p-1 focus-within:ring-4 focus-within:ring-brand-50 transition-all flex items-center">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••"
                                    className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-300 h-10 px-3 font-medium text-sm text-lg tracking-widest"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="pr-3 text-slate-300 hover:text-brand-500 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Meta Actions */}
                    <div className="flex items-center justify-between mb-8">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="w-4 h-4 rounded border border-slate-300 group-hover:border-brand-300 transition-colors" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-500 transition-colors">Lembrar</span>
                        </label>
                        <button className="text-[10px] font-bold text-brand-600 uppercase tracking-wider hover:text-brand-800 transition-colors">
                            Esqueceu?
                        </button>
                    </div>

                    {/* Main Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full h-12 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-purple-600/20 uppercase tracking-wide flex items-center justify-center gap-2"
                        >
                            {loading ? 'Acessando...' : 'Acessar Conta'}
                        </button>

                        <button
                            onClick={onRegister}
                            className="w-full h-12 bg-white border-2 border-brand-600 text-brand-600 rounded-xl font-bold text-sm hover:bg-brand-50 active:scale-[0.98] transition-all uppercase tracking-wide"
                        >
                            Criar Nova Conta
                        </button>
                    </div>

                    {hasBiometrics && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleBiometricLogin}
                                className="w-12 h-12 rounded-full border border-slate-100 bg-slate-50 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all flex items-center justify-center active:scale-95"
                            >
                                <Fingerprint size={20} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-between items-center px-4">
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">v{__APP_VERSION__}</p>

                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg cursor-pointer">
                        <span className="text-amber-300 text-xs">🌙</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- REGISTRATION MODERN (RESIDENT - LIGHT) ---
// Substituído pelo RegistrationFlow.tsx
export const ResidentRegistrationModern: React.FC<{ onFinish: () => void; onBack: () => void }> = ({ onFinish, onBack }) => {
    return null;
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
        } catch (err: any) { alert(translateError(err)); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden text-slate-900 font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/40 rounded-full blur-[100px] translate-x-1/4 -translate-y-1/4 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 px-6 pt-8 pb-4 flex items-center justify-between">
                <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-600 shadow-sm active:scale-95 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex gap-2">
                    {[1, 2].map(s => <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'w-8 bg-brand-600' : 'w-2 bg-slate-200'}`} />)}
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center pointer-events-auto relative z-10 px-6 max-w-sm mx-auto w-full">
                {step === 1 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-100">
                                <Briefcase size={28} className="text-brand-600" />
                            </div>
                            <h2 className="text-2xl font-black uppercase text-brand-700 tracking-tight">Sou Profissional</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Dados Pessoais</p>
                        </div>

                        <div className="space-y-4">
                            <InputModern icon={User} label="Nome Profissional" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                            <InputModern icon={Smartphone} label="Celular" value={formData.phone} onChange={v => setFormData({ ...formData, phone: maskPhone(v) })} />

                            <div className="bg-white rounded-xl border border-slate-100 p-1 flex shadow-sm">
                                <button
                                    onClick={() => setFormData({ ...formData, docType: 'cpf' })}
                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${formData.docType === 'cpf' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    Pessoa Física (CPF)
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, docType: 'cnpj' })}
                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${formData.docType === 'cnpj' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    Empresa (CNPJ)
                                </button>
                            </div>

                            {formData.docType === 'cpf' ? (
                                <InputModern icon={User} label="CPF" value={formData.cpf} onChange={v => setFormData({ ...formData, cpf: maskCPF(v) })} />
                            ) : (
                                <InputModern icon={Building} label="CNPJ" value={formData.cnpj} onChange={v => setFormData({ ...formData, cnpj: maskCNPJ(v) })} />
                            )}

                            <div className="group bg-white rounded-xl border border-slate-200 p-4 shadow-sm focus-within:border-brand-300 transition-colors">
                                <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block font-bold">Categoria</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="bg-transparent border-none outline-none w-full text-base text-slate-900 font-medium">
                                    <option>Limpeza</option><option>Manutenção</option><option>Aulas</option><option>Beleza</option><option>Outros</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-100">
                                <Lock size={28} className="text-brand-600" />
                            </div>
                            <h2 className="text-2xl font-black uppercase text-brand-700 tracking-tight">Acesso</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Defina seu login</p>
                        </div>

                        <div className="space-y-4">
                            <InputModern icon={Mail} label="Email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} />
                            <InputModern icon={Lock} label="Senha" type="password" value={formData.password} onChange={v => setFormData({ ...formData, password: v })} />
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-10 px-6 pb-8 pt-4 max-w-sm mx-auto w-full">
                <button
                    onClick={() => { if (step < 2) setStep(step + 1); else handleRegister(); }}
                    disabled={loading}
                    className="w-full h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center gap-3 font-bold text-sm uppercase tracking-wide shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all disabled:opacity-50 hover:bg-purple-700"
                >
                    <span>{step === 2 ? (loading ? 'Finalizando...' : 'Concluir Cadastro') : 'Continuar'}</span>
                    <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                        {step === 2 ? <CheckCircle size={14} /> : <ArrowRight size={14} />}
                    </div>
                </button>
            </div>
        </div>
    );
};

// Helper Input Component (Light Mode)
const InputModern = ({ icon: Icon, label, value, onChange, type = "text" }: any) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="group bg-white border border-slate-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-brand-500/50 focus-within:border-brand-primary transition-all shadow-sm">
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
            <div className="flex items-center gap-3">
                <Icon size={18} className="text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                <input type={inputType} value={value} onChange={e => onChange(e.target.value)} className="bg-transparent border-none outline-none w-full text-lg placeholder-slate-300 text-slate-900 font-medium" />
                {isPassword && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-brand-primary transition-colors cursor-pointer">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
};

// --- ROLE SELECTION MODERN ---
export const RoleSelectionModern: React.FC<{ onSelect: (role: 'resident' | 'professional') => void; onBack: () => void }> = ({ onSelect, onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 relative overflow-hidden font-sans text-slate-900">
            {/* Header */}
            <div className="w-full max-w-sm flex items-center justify-between pt-4 mb-12">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-brand-600 shadow-sm active:scale-95 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="w-full max-w-sm flex-1">
                <h2 className="text-2xl font-bold text-brand-700 text-center mb-8">
                    Como você quer entrar?
                </h2>

                <div className="space-y-4">
                    {/* Resident Card */}
                    <button
                        onClick={() => onSelect('resident')}
                        className="w-full bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-4 group active:scale-[0.98] transition-all hover:border-brand-200"
                    >
                        <div className="w-14 h-14 rounded-[20px] bg-brand-50 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
                            <User size={28} />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-bold text-slate-900 text-lg">Sou Morador</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Acesse avisos, serviços e o marketplace.</p>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                    </button>

                    {/* Professional Card */}
                    <button
                        onClick={() => onSelect('professional')}
                        className="w-full bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-4 group active:scale-[0.98] transition-all hover:border-brand-200"
                    >
                        <div className="w-14 h-14 rounded-[20px] bg-brand-50 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
                            <Briefcase size={28} />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-bold text-slate-900 text-lg">Sou Profissional</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Gerencie seus serviços e clientes.</p>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full max-w-sm pb-8 flex justify-center flex-col items-center gap-8">
                <button
                    onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
                    className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-widest hover:text-rose-600 transition-colors"
                >
                    <LogOut size={14} />
                    Sair da Conta
                </button>

                <div className="self-end w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                    <span className="text-amber-300 text-sm">🌙</span>
                </div>
            </div>
        </div>
    );
};
