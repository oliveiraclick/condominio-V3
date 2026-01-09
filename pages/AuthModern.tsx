import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, User, Mail, Lock, Building, Smartphone, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabase';

// --- SPLASH SCREEN MODERN ---
export const SplashScreenModern: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setTimeout(onFinish, 3000);
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
                        {/* Logo Placeholder - Usando ícone por enquanto */}
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
                    <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-progress origin-left" />
                </div>
                <span className="text-[10px] text-white/30 uppercase tracking-widest">Carregando Experiência</span>
            </div>
        </div>
    );
};

// --- REGISTRATION MODERN (WIZARD) ---
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

            {/* Content */}
            <div className="flex-1 relative z-10 px-6 flex flex-col pointer-events-none"> {/* pointer-events-none no container, auto nos filhos para evitar cliques indesejados no bg ?? nao, melhor normal */}
                <div className="flex-1 flex flex-col justify-center pointer-events-auto">

                    {/* STEP 1: IDENTIFICAÇÃO */}
                    <div className={`transition-all duration-500 absolute inset-0 px-6 flex flex-col justify-center ${step === 1 ? 'opacity-100 translate-x-0' : step < 1 ? 'opacity-0 translate-x-full' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
                        <h2 className="text-3xl font-bold mb-2">Quem é você?</h2>
                        <p className="text-slate-400 mb-8">Vamos começar pelos seus dados básicos.</p>

                        <div className="space-y-4">
                            <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 focus-within:border-violet-500/50 focus-within:bg-white/10 transition-all">
                                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Nome Completo</label>
                                <div className="flex items-center gap-3">
                                    <User size={18} className="text-violet-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-transparent border-none outline-none w-full text-lg placeholder-white/20"
                                        placeholder="Seu nome"
                                    />
                                </div>
                            </div>

                            <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 focus-within:border-violet-500/50 focus-within:bg-white/10 transition-all">
                                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Celular</label>
                                <div className="flex items-center gap-3">
                                    <Smartphone size={18} className="text-violet-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="bg-transparent border-none outline-none w-full text-lg placeholder-white/20"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STEP 2: CONDOMÍNIO */}
                    <div className={`transition-all duration-500 absolute inset-0 px-6 flex flex-col justify-center ${step === 2 ? 'opacity-100 translate-x-0' : step < 2 ? 'opacity-0 translate-x-full' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
                        <h2 className="text-3xl font-bold mb-2">Onde você mora?</h2>
                        <p className="text-slate-400 mb-8">Para conectarmos você aos seus vizinhos.</p>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1 group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 focus-within:border-violet-500/50 focus-within:bg-white/10 transition-all">
                                    <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Torre/Bloco</label>
                                    <div className="flex items-center gap-3">
                                        <Building size={18} className="text-violet-400" />
                                        <input
                                            type="text"
                                            value={formData.tower}
                                            onChange={e => setFormData({ ...formData, tower: e.target.value })}
                                            className="bg-transparent border-none outline-none w-full text-lg placeholder-white/20"
                                            placeholder="Ex: A"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 focus-within:border-violet-500/50 focus-within:bg-white/10 transition-all">
                                    <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Unidade/Apto</label>
                                    <div className="flex items-center gap-3">
                                        <Building size={18} className="text-violet-400" />
                                        <input
                                            type="text"
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                            className="bg-transparent border-none outline-none w-full text-lg placeholder-white/20"
                                            placeholder="Ex: 101"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STEP 3: ACESSO */}
                    <div className={`transition-all duration-500 absolute inset-0 px-6 flex flex-col justify-center ${step === 3 ? 'opacity-100 translate-x-0' : step < 3 ? 'opacity-0 translate-x-full' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
                        <h2 className="text-3xl font-bold mb-2">Dados de Acesso</h2>
                        <p className="text-slate-400 mb-8">Defina seu email e senha segura.</p>

                        <div className="space-y-4">
                            <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 focus-within:border-violet-500/50 focus-within:bg-white/10 transition-all">
                                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Email</label>
                                <div className="flex items-center gap-3">
                                    <Mail size={18} className="text-violet-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-transparent border-none outline-none w-full text-lg placeholder-white/20"
                                        placeholder="exemplo@email.com"
                                    />
                                </div>
                            </div>

                            <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 focus-within:border-violet-500/50 focus-within:bg-white/10 transition-all">
                                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Senha</label>
                                <div className="flex items-center gap-3">
                                    <Lock size={18} className="text-violet-400" />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="bg-transparent border-none outline-none w-full text-lg placeholder-white/20"
                                        placeholder="Min. 6 caracteres"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="relative z-10 px-6 pb-8 pt-4 bg-gradient-to-t from-slate-950 to-transparent">
                <button
                    onClick={() => {
                        if (step < 3) setStep(step + 1);
                        else handleRegister();
                    }}
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-between px-6 font-bold text-lg shadow-xl shadow-violet-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                >
                    <span>{step === 3 ? (loading ? 'Criando Conta...' : 'Finalizar Cadastro') : 'Continuar'}</span>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        {step === 3 ? <CheckCircle size={18} /> : <ArrowRight size={18} />}
                    </div>
                </button>
            </div>
        </div>
    );
};
