import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, User, Mail, Lock, Building, Smartphone, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabase';

// --- SPLASH SCREEN MODERN ---
export const SplashScreenModern: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setTimeout(onFinish, 4000); // 4 seconds duration
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-950">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className={`absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-violet-600/30 rounded-full blur-[120px] mix-blend-screen transition-all duration-[2000ms] ${mounted ? 'translate-x-10 translate-y-10 opacity-70' : 'opacity-0'}`} />
                <div className={`absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-fuchsia-600/30 rounded-full blur-[120px] mix-blend-screen transition-all duration-[2000ms] delay-300 ${mounted ? '-translate-x-10 -translate-y-10 opacity-70' : 'opacity-0'}`} />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className={`relative mb-8 transition-all duration-1000 ${mounted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                    <div className="relative w-32 h-32 bg-gradient-to-tr from-white/10 to-white/5 backdrop-blur-md rounded-[32px] border border-white/20 flex items-center justify-center shadow-2xl shadow-violet-500/20">
                        <Building size={48} className="text-white drop-shadow-glow" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                        <Sparkles className="text-yellow-300 animate-pulse" size={24} />
                    </div>
                </div>

                <h1 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-white tracking-tighter mb-2 transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    MORADOR
                </h1>
                <p className={`text-sm font-medium text-violet-300 tracking-[0.3em] uppercase transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    Clicou, Achou.
                </p>
            </div>

            <div className="absolute bottom-12 flex flex-col items-center gap-2">
                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-progress origin-left" style={{ animationDuration: '4s' }} />
                </div>
                <span className="text-[10px] text-white/30 uppercase tracking-widest">Carregando Experiência</span>
            </div>
        </div>
    );
};

// --- LOGIN MODERN ---
export const LoginScreenModern: React.FC<{ onLogin: (session: any) => void; onRegister: () => void }> = ({ onLogin, onRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
        else onLogin(data.session);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-900/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-tr from-white/10 to-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/10">
                        <Building size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Bem-vindo</h1>
                    <p className="text-slate-400">Acesse seu condomínio inteligente</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="group bg-transparent border-b border-white/20 p-4 focus-within:border-violet-500 transition-all">
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-slate-400 group-focus-within:text-violet-400 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Email"
                                className="bg-transparent border-none outline-none text-white w-full placeholder-white/20"
                            />
                        </div>
                    </div>

                    <div className="group bg-transparent border-b border-white/20 p-4 focus-within:border-violet-500 transition-all">
                        <div className="flex items-center gap-3">
                            <Lock size={18} className="text-slate-400 group-focus-within:text-violet-400 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Senha"
                                className="bg-transparent border-none outline-none text-white w-full placeholder-white/20"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full h-14 bg-white text-slate-950 rounded-2xl font-bold text-lg mb-4 hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>

                <button
                    onClick={onRegister}
                    className="w-full h-14 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 active:scale-[0.98] transition-all"
                >
                    Criar Nova Conta
                </button>

                <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.2em] mt-8">v1.6.1 • Modern Beta</p>
            </div>
        </div>
    );
};

// --- REGISTRATION MODERN (RESIDENT) ---
export const ResidentRegistrationModern: React.FC<{ onFinish: () => void; onBack: () => void }> = ({ onFinish, onBack }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', unit: '', tower: ''
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
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
        <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden text-white">
            {/* Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/4" />

            {/* Header */}
            <div className="relative z-10 px-6 pt-12 pb-6 flex items-center justify-between">
                <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1 rounded-full transition-all duration-500 ${s <= step ? 'w-8 bg-violet-500' : 'w-2 bg-white/10'}`} />
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center pointer-events-auto relative z-10 px-6">
                {step === 1 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <h2 className="text-3xl font-bold mb-2">Quem é você?</h2>
                        <p className="text-slate-400 mb-8">Vamos começar pelos seus dados básicos.</p>
                        <div className="space-y-4">
                            <InputModern icon={User} label="Nome Completo" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                            <InputModern icon={Smartphone} label="Celular" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} />
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <h2 className="text-3xl font-bold mb-2">Onde você mora?</h2>
                        <p className="text-slate-400 mb-8">Para conectarmos você aos seus vizinhos.</p>
                        <div className="flex gap-4">
                            <InputModern icon={Building} label="Torre" value={formData.tower} onChange={v => setFormData({ ...formData, tower: v })} />
                            <InputModern icon={Building} label="Unidade" value={formData.unit} onChange={v => setFormData({ ...formData, unit: v })} />
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <h2 className="text-3xl font-bold mb-2">Acesso</h2>
                        <p className="text-slate-400 mb-8">Defina seu login seguro.</p>
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
                    className="w-full h-14 bg-white text-slate-950 rounded-2xl flex items-center justify-between px-6 font-bold text-lg hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    <span>{step === 3 ? (loading ? 'Criando...' : 'Finalizar') : 'Continuar'}</span>
                    <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
                        {step === 3 ? <CheckCircle size={18} /> : <ArrowRight size={18} />}
                    </div>
                </button>
            </div>
        </div>
    );
};

// --- REGISTRATION MODERN (PROFESSIONAL) ---
export const ProfessionalRegistrationModern: React.FC<{ onFinish: () => void; onBack: () => void }> = ({ onFinish, onBack }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', category: 'Outros'
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({ email: formData.email, password: formData.password });
            if (error) throw error;
            if (data.user) {
                await supabase.from('profiles').insert([{
                    id: data.user.id, name: formData.name, email: formData.email, phone: formData.phone,
                    role: 'professional', category: formData.category, is_on_site: false, condominium_id: '00000000-0000-0000-0000-000000000000'
                }]);
                onFinish();
            }
        } catch (err: any) { alert(err.message); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden text-white">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/4" />

            {/* Header */}
            <div className="relative z-10 px-6 pt-12 pb-6 flex items-center justify-between">
                <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex gap-2">
                    {[1, 2].map(s => <div key={s} className={`h-1 rounded-full transition-all ${s <= step ? 'w-8 bg-emerald-500' : 'w-2 bg-white/10'}`} />)}
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center pointer-events-auto relative z-10 px-6">
                {step === 1 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <h2 className="text-3xl font-bold mb-2">Parceiro</h2>
                        <p className="text-slate-400 mb-8">Cadastre-se para oferecer serviços.</p>
                        <div className="space-y-4">
                            <InputModern icon={User} label="Nome Profissional" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                            <InputModern icon={Smartphone} label="Celular" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} />
                            <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
                                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Categoria</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="bg-transparent border-none outline-none w-full text-lg text-white [&>option]:text-black">
                                    <option>Limpeza</option><option>Manutenção</option><option>Aulas</option><option>Beleza</option><option>Outros</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <h2 className="text-3xl font-bold mb-2">Acesso</h2>
                        <p className="text-slate-400 mb-8">Dados para entrar no app.</p>
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
                    className="w-full h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-between px-6 font-bold text-lg shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all disabled:opacity-50"
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

// Helper Input Component
const InputModern = ({ icon: Icon, label, value, onChange, type = "text" }: any) => (
    <div className="group bg-transparent border-b border-white/20 p-4 focus-within:border-white transition-all">
        <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
        <div className="flex items-center gap-3">
            <Icon size={18} className="text-slate-400 group-focus-within:text-white transition-colors" />
            <input type={type} value={value} onChange={e => onChange(e.target.value)} className="bg-transparent border-none outline-none w-full text-lg placeholder-white/20 text-white" />
        </div>
    </div>
);
