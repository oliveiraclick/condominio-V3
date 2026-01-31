import React, { useState, useEffect } from 'react';
import { Button, Input } from '../components/ui';
import {
  Mail, Lock, ArrowLeft, Building2,
  UserCircle, ShieldCheck, User, IdCard, Phone as PhoneIcon,
  MapPin, Heart, Baby, Plus, Trash2, Camera, FileText, Check,
  Zap, GraduationCap, Briefcase, LogOut, CircleAlert
} from 'lucide-react';
import { UserRole, Dependent } from '../types';
import { supabase } from '../supabase';
import { maskCPF, maskPhone, maskCNPJ } from '../utils/masks';
import { validateCPF, validateCNPJ } from '../utils/validators';

// --- UTILITÁRIOS DE VALIDAÇÃO ---
const translateError = (error: any): string => {
  const message = error?.message || '';
  if (message.includes('User already registered') || message.includes('already exists')) {
    return 'Este e-mail já está cadastrado. Tente fazer login.';
  }
  if (message.includes('Invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Confirme seu e-mail na sua caixa de entrada antes de entrar.';
  }
  if (message.includes('Password should be at least 6 characters')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (message.includes('valid email')) {
    return 'Digite um e-mail válido.';
  }
  return 'Erro de conexão ou dados inválidos.';
};

// --- COMPONENTE: SPLASH SCREEN ---
export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 3500ms total duration
    // Update every 35ms -> 100 steps
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 200);
          return 100;
        }
        return prev + 1; // 1% per 35ms ~= 3.5s total
      });
    }, 35);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-8 z-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_70%)]"></div>
      <div className="w-40 h-40 bg-white/80 backdrop-blur-xl border border-white/60 rounded-[40px] flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-emerald-500/20 relative z-10">
        <img src="/logo.png" alt="Morador Logo" className="w-full h-full object-contain p-6 drop-shadow-sm" />
      </div>
      <h1 className="text-4xl font-black italic text-slate-900 mb-2 tracking-tighter uppercase relative z-10">APP MORADOR</h1>
      <p className="text-emerald-600 font-black uppercase text-[10px] tracking-[0.4em] mb-12 relative z-10">Conecte-se. Clicou, Achou.</p>
      <div className="w-full max-w-xs bg-slate-200 h-1.5 rounded-full overflow-hidden relative z-10">
        <div className="bg-emerald-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

// --- COMPONENTE: ESQUECI A SENHA ---
const ForgotPassword: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) return alert('Digite seu e-mail.');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/update-password',
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col justify-center animate-in fade-in duration-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 p-8 rounded-[40px] shadow-xl text-center relative z-10">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10 border border-emerald-500/20">
            <Check size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">E-mail Enviado!</h2>
          <p className="text-slate-600 text-sm mb-6">Verifique sua caixa de entrada (e spam) para redefinir sua senha.</p>
          <p className="text-center text-slate-400 text-xs mt-8">Versão 3.0 Pro</p>
          <Button fullWidth onClick={onBack} className="h-14 bg-white/50 text-slate-600 font-bold uppercase rounded-xl hover:bg-white/80 transition-all border border-slate-200">Voltar ao Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col justify-center animate-in fade-in duration-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <header className="mb-8 relative z-10">
        <button onClick={onBack} className="w-10 h-10 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-600 flex items-center justify-center mb-6 active:scale-95 transition-transform hover:bg-slate-50"><ArrowLeft size={20} /></button>
        <h2 className="text-3xl font-black italic text-slate-900 uppercase tracking-tight">Recuperar Senha</h2>
        <p className="text-slate-500 font-medium text-sm mt-2">Digite seu e-mail para receber as instruções.</p>
      </header>

      <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-[32px] shadow-xl space-y-4 mb-6 relative z-10">
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <Input placeholder="Seu e-mail cadastrado" className="pl-12 h-14 bg-white border-slate-100 text-slate-900 placeholder-slate-400 rounded-2xl focus:border-emerald-500/50 focus:bg-white transition-all shadow-sm" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
      </div>

      <Button fullWidth onClick={handleReset} disabled={loading} className="h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 rounded-2xl relative z-10 border-none">
        {loading ? 'Enviando...' : 'Enviar Link'}
      </Button>
    </div>
  );
};

// --- COMPONENTE: LOGIN ---
export const LoginScreen: React.FC<{ onLogin: (session?: any) => void; onRegister: () => void }> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('condo_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Preencha todos os campos para entrar.');
      return;
    }
    setLoading(true);
    setError(null);

    // Save or Clear Email
    if (rememberMe) {
      localStorage.setItem('condo_saved_email', email);
    } else {
      localStorage.removeItem('condo_saved_email');
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      // TRACK LOGIN
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.session.user.id).single();
      if (profile) {
        await supabase.from('login_history').insert([{
          user_id: data.session.user.id,
          role: profile.role,
          condo_id: profile.condominium_id
        }]);
      }

      onLogin(data.session);
    } catch (err: any) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  if (view === 'forgot') {
    return <ForgotPassword onBack={() => setView('login')} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center p-6 bg-slate-50">
      {/* PREMIUM BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-slate-50"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_70%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(59,130,246,0.1),transparent_60%)]"></div>
      </div>

      {/* GLASS CARD */}
      <div className="relative z-10 w-full max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-700">
        {/* LOGO HEADER */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10 rotate-3 transform hover:rotate-6 transition-transform duration-500">
            <img src="/logo.png" alt="Logo" className="w-[85%] h-[85%] object-contain drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase drop-shadow-sm">
            App <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">Morador</span>
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">Conecte-se. Clicou, Achou.</p>
        </div>

        {/* LOGIN FORM - GLASS */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/50 p-2 rounded-[40px] shadow-xl overflow-hidden">
          <div className="bg-white/50 p-6 rounded-[32px] border border-white space-y-4 shadow-inner">

            {/* ERROR ALERT */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-wide flex items-center gap-3 animate-shake">
                <ShieldCheck size={16} />
                {error}
              </div>
            )}

            {/* EMAIL INPUT */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">E-mail</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-focus-within:text-emerald-600 group-focus-within:bg-emerald-50 transition-all duration-300">
                  <Mail size={18} />
                </div>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className="pl-16 h-14 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-2xl focus:bg-white focus:border-emerald-500/50 font-medium transition-all shadow-sm"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">Senha</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-focus-within:text-emerald-600 group-focus-within:bg-emerald-50 transition-all duration-300">
                  <Lock size={18} />
                </div>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-16 h-14 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-2xl focus:bg-white focus:border-emerald-500/50 font-medium transition-all shadow-sm"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* ACTIONS: REMEMBER ME & FORGOT PASSWORD */}
            <div className="flex items-center justify-between px-1 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group select-none opacity-80 hover:opacity-100 transition-opacity">
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${rememberMe ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-slate-300 group-hover:border-slate-400'}`}>
                  {rememberMe && <Check size={12} className="text-white" strokeWidth={4} />}
                </div>
                <input type="checkbox" className="hidden" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lembrar</span>
              </label>
              <button
                onClick={() => setView('forgot')}
                className="text-[10px] font-black text-emerald-600 uppercase tracking-wider hover:text-emerald-500 transition-colors"
              >
                Esqueceu?
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 space-y-3">
              <Button
                fullWidth
                onClick={handleSignIn}
                disabled={loading}
                className="h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black uppercase tracking-[0.2em] italic shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-xs rounded-2xl border-none"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </div>
                ) : 'Acessar Conta'}
              </Button>

              <button
                onClick={onRegister}
                className="w-full h-14 rounded-2xl border border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 transition-all bg-white"
              >
                Criar Nova Conta
              </button>
            </div>

          </div>
        </div>

        {/* VERSION LABEL */}
        <p className="text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.4em] mt-8 opacity-60 hover:opacity-100 transition-opacity">
          v{__APP_VERSION__}
        </p>

      </div>
    </div>
  );
};

// --- COMPONENTE: SETUP DE USUÁRIOS DE TESTE ---
const CreateTestUsers: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [log, setLog] = useState<string[]>([]);

  const createUsers = async () => {
    setStatus('loading');
    setLog([]);
    const users = [
      { email: 'morador@morador.app', pass: '102030', role: UserRole.RESIDENT, name: 'Morador Teste', unit: '101', tower: 'A' },
      { email: 'prestador@morador.app', pass: '102030', role: UserRole.PROFESSIONAL, name: 'Prestador Teste', category: 'Manutenção' },
      { email: 'adm@morador.app', pass: '102030', role: UserRole.ADMIN, name: 'Síndico Teste' },
      { email: 'sadm@morador.app', pass: '102030', role: UserRole.SUPER_ADMIN, name: 'Super Admin' },
    ];

    try {
      for (const u of users) {
        setLog(prev => [...prev, `Criando ${u.email}...`]);

        // 1. Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: u.email,
          password: u.pass,
          options: {
            data: { full_name: u.name, role: u.role }
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setLog(prev => [...prev, `⚠️ ${u.email} já existe. Tentando atualizar perfil...`]);
            // Tenta recuperar ID se possível? Não dá sem login.
            // Mas se já existe, podemos tentar fazer login para pegar o ID?
            // Simplificação: Assume que se existe, o usuário deve fazer login manual.
            // Mas podemos tentar UPDATE na tabela profiles se soubermos o ID? Não sabemos.
            continue;
          } else {
            throw error;
          }
        }

        if (data.user) {
          // 2. Setup Profile immediatelly
          const profileData: any = {
            id: data.user.id,
            email: u.email,
            name: u.name,
            role: u.role,
            is_free: true
          };

          if (u.role === UserRole.RESIDENT) {
            profileData.unit = u.unit;
            profileData.tower = u.tower;
          }
          if (u.role === UserRole.PROFESSIONAL) {
            profileData.category = u.category;
            profileData.subscription_status = 'trial';
            profileData.trial_ends_at = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
          }

          const { error: profileError } = await supabase.from('profiles').upsert(profileData);
          if (profileError) {
            console.error('Erro ao criar perfil:', profileError);
            setLog(prev => [...prev, `❌ Erro perfil ${u.email}: ${profileError.message}`]);
          } else {
            setLog(prev => [...prev, `✅ ${u.email} criado com sucesso!`]);
          }
        }
      }
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setLog(prev => [...prev, `❌ Erro Geral: ${err.message}`]);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
        <p className="text-emerald-700 font-bold text-xs">Usuários Criados!</p>
        <div className="text-[10px] text-emerald-600 mt-2 text-left space-y-1">
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={createUsers}
        disabled={status === 'loading'}
        className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
      >
        {status === 'loading' ? 'Criando...' : '⚙️ Configurar Usuários de Teste'}
      </button>
      {status === 'loading' && (
        <div className="mt-2 text-[9px] text-slate-400 font-mono text-left bg-slate-50 p-2 rounded-lg">
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  );
};


// --- COMPONENTE: REGISTRO DE MORADOR (REMOVIDO - USANDO NOVA FLOW) ---
// A lógica antiga foi substituída pelo componente RegistrationFlow.tsx
// Mantemos apenas a interface para compatibilidade se necessário, mas o uso principal será via RegistrationFlow.
export const ResidentRegistration: React.FC<{ onFinish: (data: any) => void; onBack: () => void }> = ({ onFinish, onBack }) => {
  // Wrapper simples para manter a assinatura se algo depender dela, 
  // mas idealmente o RegistrationFlow deve ser chamado diretamente.
  return null;
};

// --- COMPONENTE: REGISTRO DE PROFISSIONAL (MANTIDO) ---
export const ProfessionalRegistration: React.FC<{ onFinish: (data: any) => void; onBack: () => void }> = ({ onFinish, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', cpf: '', cnpj: '', docType: 'cpf' as 'cpf' | 'cnpj', category: 'Manutenção',
    company_name: '', company_address: '',
    docs: { rg: false, cpf: false, license: false }
  });

  useEffect(() => {
    supabase.from('categories').select('*').eq('type', 'service').order('name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCategories(data);
          setFormData(prev => ({ ...prev, category: data[0].name }));
        }
      });
  }, []);

  const handleFinish = async () => {
    setLoading(true);
    setError(null);

    // Validation
    if (formData.docType === 'cpf' && !validateCPF(formData.cpf)) {
      setError('CPF inválido.');
      setLoading(false);
      return;
    }
    if (formData.docType === 'cnpj' && !validateCNPJ(formData.cnpj)) {
      setError('CNPJ inválido.');
      setLoading(false);
      return;
    }

    try {
      let userId = '';
      let sessionExists = false;

      // Check Existing User
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        userId = currentUser.id;
        sessionExists = true;
        await supabase.auth.updateUser({ data: { full_name: formData.name, role: UserRole.PROFESSIONAL, phone: formData.phone, category: formData.category } });
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email, password: formData.password,
          options: { data: { full_name: formData.name, role: UserRole.PROFESSIONAL, phone: formData.phone, category: formData.category, company_name: formData.company_name } }
        });
        if (authError) throw authError;
        if (authData.user) { userId = authData.user.id; sessionExists = !!authData.session; }
      }

      if (userId && sessionExists) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: userId, name: formData.name, email: formData.email, phone: formData.phone,
          cpf: formData.docType === 'cpf' ? formData.cpf : null,
          cnpj: formData.docType === 'cnpj' ? formData.cnpj : null,
          category: formData.category, role: UserRole.PROFESSIONAL,
          company_name: formData.company_name, company_address: formData.company_address,
          // CRITICAL: Set 60 Days Free Trial
          trial_ends_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          subscription_status: 'trial'
        });
        if (profileError) throw profileError;
        onFinish(formData);
      } else if (userId && !sessionExists) {
        alert("✅ Cadastro realizado! Verifique seu e-mail.");
        onBack();
      }
    } catch (err: any) { setError(translateError(err)); } finally { setLoading(false); }
  };


  const [showSuggestions, setShowSuggestions] = useState(false);

  // Normalization Logic
  const handleCategoryBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      if (formData.category) {
        const match = categories.find(c => c.name.toLowerCase() === formData.category.toLowerCase());
        if (match) {
          setFormData(prev => ({ ...prev, category: match.name }));
        }
      }
    }, 200);
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(formData.category.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(16,185,129,0.05),transparent_60%)]"></div>

      <header className="p-6 pt-12 flex items-center gap-4 relative z-10 border-b border-slate-200">
        <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-lg hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h2 className="text-xl font-black text-slate-800 italic uppercase tracking-tight">Cadastro Profissional</h2>
      </header>
      <div className="px-6 flex-1 overflow-y-auto relative z-10">
        {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold italic border border-rose-100">{error}</div>}
        <div className="mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Briefcase size={20} /></div>
          <div><h4 className="font-black text-emerald-700 text-sm uppercase italic">Teste Grátis por 60 Dias!</h4><p className="text-emerald-600/80 text-xs">Cadastre-se agora e aproveite 2 meses sem mensalidade.</p></div>
        </div>
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 pb-8">

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">1. Dados Pessoais</h3>
              <Input placeholder="Nome Completo do Responsável" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-14 font-medium bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500/50 shadow-sm" />
              <Input placeholder="WhatsApp" value={formData.phone} onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })} className="h-14 font-medium bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500/50 shadow-sm" />

              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="docType" checked={formData.docType === 'cpf'} onChange={() => setFormData({ ...formData, docType: 'cpf' })} className="accent-emerald-500" />
                  <span className="text-xs font-bold text-slate-500">Pessoa Física (CPF)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="docType" checked={formData.docType === 'cnpj'} onChange={() => setFormData({ ...formData, docType: 'cnpj' })} className="accent-emerald-500" />
                  <span className="text-xs font-bold text-slate-500">Empresa (CNPJ)</span>
                </label>
              </div>

              {formData.docType === 'cpf' ? (
                <Input placeholder="CPF" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: maskCPF(e.target.value) })} className="h-14 font-medium bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500/50 shadow-sm" />
              ) : (
                <Input placeholder="CNPJ" value={formData.cnpj} onChange={e => setFormData({ ...formData, cnpj: maskCNPJ(e.target.value) })} className="h-14 font-medium bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500/50 shadow-sm" />
              )}
            </div>

            {/* Seção 2: Acesso */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">2. Dados de Acesso</h3>
              <Input placeholder="Seu melhor e-mail" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="h-14 font-medium bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500/50 shadow-sm" />
              <Input type="password" placeholder="Crie uma senha segura" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="h-14 font-medium bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500/50 shadow-sm" />
            </div>

            {/* Seção 3: Profissional */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">3. Perfil Profissional</h3>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Categoria de Serviço</label>
                <div className="relative">
                  <Input
                    placeholder="Ex: Eletricista, Encanador..."
                    value={formData.category}
                    onChange={e => {
                      setFormData({ ...formData, category: e.target.value });
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={handleCategoryBlur}
                    className="h-14 font-medium bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500/50 shadow-sm"
                  />
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto z-50">
                      {filteredCategories.length > 0 ? filteredCategories.map(c => (
                        <button
                          key={c.id}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-600 font-medium text-sm transition-colors border-b border-slate-100 last:border-none"
                          onClick={() => {
                            setFormData({ ...formData, category: c.name });
                            setShowSuggestions(false);
                          }}
                        >
                          {c.name}
                        </button>
                      )) : (
                        <div className="px-4 py-3 text-xs text-slate-500 font-medium italic">
                          Nova categoria: "{formData.category}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black">Documentos</h3>
            {[{ key: 'rg', label: 'RG / CNH' }, { key: 'license', label: 'Certificados' }].map((doc) => (
              <button key={doc.key} onClick={() => setFormData({ ...formData, docs: { ...formData.docs, [doc.key]: true } })} className={`w-full p-4 rounded-2xl border-2 border-dashed flex items-center gap-4 ${formData.docs[doc.key as keyof typeof formData.docs] ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200'}`}>
                {formData.docs[doc.key as keyof typeof formData.docs] ? <Check size={24} /> : <FileText size={24} />}
                <span className="font-bold text-sm">{doc.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <footer className="p-6">
        <Button fullWidth onClick={step === 2 ? handleFinish : () => setStep(2)} disabled={loading}>{loading ? 'Salvando...' : step === 2 ? 'Finalizar' : 'Próxima'}</Button>
      </footer>
    </div>
  );
}

// --- COMPONENTE: SELEÇÃO DE PERFIL (MANTIDO) ---
export const RoleSelection: React.FC<{ onSelect: (role: UserRole) => void; onBack: () => void }> = ({ onSelect, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col">
      <button onClick={onBack} className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center mb-12">
        <ArrowLeft size={20} className="text-slate-600" />
      </button>
      <h2 className="text-2xl font-bold text-center mb-8 italic text-slate-900 tracking-tighter">Como você quer entrar?</h2>
      <div className="space-y-4">
        <button onClick={() => onSelect(UserRole.RESIDENT)} className="w-full p-6 bg-white rounded-3xl flex items-center gap-4 text-left border border-slate-100 shadow-sm hover:border-brand-600 hover:ring-2 hover:ring-brand-100 transition-all group">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-600 transition-colors">
            <UserCircle size={32} className="text-brand-600 group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 tracking-tight mb-1">Sou Morador</h3>
            <p className="text-slate-500 text-xs">Acesse avisos, serviços e o marketplace.</p>
          </div>
        </button>
        <button onClick={() => onSelect(UserRole.PROFESSIONAL)} className="w-full p-6 bg-white rounded-3xl flex items-center gap-4 text-left border border-slate-100 shadow-sm hover:border-emerald-600 hover:ring-2 hover:ring-emerald-100 transition-all group">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
            <Briefcase size={32} className="text-emerald-600 group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 tracking-tight mb-1">Sou Profissional</h3>
            <p className="text-slate-500 text-xs">Gerencie seus serviços e clientes.</p>
          </div>
        </button>
        <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} className="w-full p-4 mt-8 rounded-2xl flex items-center justify-center gap-2 text-rose-500 font-bold uppercase text-xs tracking-widest hover:bg-rose-50 transition-colors">
          <LogOut size={16} />
          Sair da Conta
        </button>
      </div>
    </div>
  );
};
