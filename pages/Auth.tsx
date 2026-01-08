import React, { useState, useEffect } from 'react';
import { Button, Input } from '../components/UI';
import {
  Mail, Lock, ArrowLeft, Building2,
  UserCircle, ShieldCheck, User, IdCard, Phone as PhoneIcon,
  MapPin, Heart, Baby, Plus, Trash2, Camera, FileText, Check,
  Zap, GraduationCap, Briefcase
} from 'lucide-react';
import { UserRole, Dependent } from '../types';
import { supabase } from '../supabase';

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
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-8 z-50">
      <div className="w-40 h-40 bg-white rounded-[40px] flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-violet-100">
        <img src="/logo.png" alt="Morador Logo" className="w-full h-full object-contain p-6" />
      </div>
      <h1 className="text-4xl font-black italic text-slate-950 mb-2 tracking-tighter uppercase">APP MORADOR</h1>
      <p className="text-violet-600 font-black uppercase text-[10px] tracking-[0.4em] mb-12">Conecte-se. Clicou, Achou.</p>
      <div className="w-full max-w-xs bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div className="bg-violet-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

// --- COMPONENTE: LOGIN ---
export const LoginScreen: React.FC<{ onLogin: (session?: any) => void; onRegister: () => void }> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Preencha todos os campos para entrar.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      onLogin(data.session);
    } catch (err: any) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col justify-center animate-in fade-in duration-500">
      <div className="mb-12">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white p-4">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter text-slate-950 mb-2 uppercase">Entrar</h2>
        <p className="text-slate-500 font-medium italic">Bem-vindo de volta ao seu condomínio.</p>
      </div>

      <div className="space-y-4 mb-8">
        {error && <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold italic animate-shake">{error}</div>}
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
          <Input placeholder="Seu e-mail" className="pl-12 h-14 bg-white border-none shadow-sm" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
          <Input type="password" placeholder="Sua senha" className="pl-12 h-14 bg-white border-none shadow-sm" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="w-full text-right text-violet-600 text-xs font-black uppercase tracking-widest mt-2">Esqueceu a senha?</button>
      </div>

      <Button fullWidth onClick={handleSignIn} disabled={loading} className="h-16 bg-slate-950 text-white font-black uppercase tracking-[0.2em] italic shadow-2xl shadow-slate-900/20 mb-6">
        {loading ? 'Validando...' : 'Entrar Agora'}
      </Button>

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
        <span className="relative px-4 bg-slate-50 mx-auto block w-fit text-[10px] text-slate-400 uppercase font-black italic">Novo por aqui?</span>
      </div>

      <Button fullWidth variant="secondary" onClick={onRegister} className="h-16 bg-white border-2 border-slate-200 text-slate-900 font-black uppercase tracking-widest italic hover:border-violet-600 transition-all">
        Criar Nova Conta
      </Button>

      <p className="text-center text-[9px] text-slate-300 font-black uppercase tracking-[0.4em] mt-12">v1.1.7 • App Morador</p>
    </div>
  );
};

// --- COMPONENTE: REGISTRO DE MORADOR (COM SAFEGUARDS) ---
export const ResidentRegistration: React.FC<{ onFinish: (data: any) => void; onBack: () => void }> = ({ onFinish, onBack }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [condos, setCondos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', cpf: '', rg: '', phone: '',
    condo: '', tower: '', unit: '', spouse: '',
    dependents: [] as Dependent[],
    docs: { rg: false, residence: false }
  });

  useEffect(() => {
    supabase.from('condominiums').select('*').eq('status', 'active')
      .then(({ data }) => data && setCondos(data));
  }, []);

  const selectedCondoData = condos.find(c => c.id === formData.condo);
  const isHorizontal = selectedCondoData?.type === 'horizontal';

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      let userId = '';
      let sessionExists = false;

      // 1. BLINDAGEM: Verifica se já existe sessão ativa "fantasma"
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        // Se já está logado, aproveita a sessão para evitar erro de "User already registered"
        userId = currentUser.id;
        sessionExists = true;
        // Atualiza metadados apenas
        await supabase.auth.updateUser({
          data: { full_name: formData.name, role: UserRole.RESIDENT, tower: formData.tower, unit: formData.unit }
        });
      } else {
        // Se não está logado, tenta criar
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.name, role: UserRole.RESIDENT, tower: formData.tower, unit: formData.unit } }
        });

        if (authError) throw authError;

        if (authData.user) {
          userId = authData.user.id;
          sessionExists = !!authData.session;
        }
      }

      // 2. Cria/Atualiza Perfil se tivermos um ID
      if (userId) {
        // Se tiver sessão, salva o perfil direto
        if (sessionExists) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            name: formData.name,
            email: formData.email,
            role: UserRole.RESIDENT,
            condominium_id: formData.condo,
            tower: formData.tower,
            unit: formData.unit,
            phone: formData.phone,
            cpf: formData.cpf,
            is_free: true // Garante acesso free básico
          });
          if (profileError) throw profileError;

          // Salva dependentes
          if (formData.dependents.length > 0) {
            await supabase.from('dependents').insert(
              formData.dependents.map(d => ({ profile_id: userId, name: d.name, kinship: d.kinship, birth_date: d.birthDate }))
            );
          }

          onFinish(formData);
        } else {
          // Sem sessão (Email confirmation required)
          alert("✅ Quase lá! Enviamos um e-mail de confirmação para " + formData.email + ". Verifique-o para ativar sua conta.");
          onBack();
        }
      }
    } catch (err: any) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col">
      <header className="p-8 pt-12 flex items-center gap-4 bg-white border-b border-slate-50">
        <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">Cadastro</h2>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4].map(i => <div key={i} className={`h-1 rounded-full transition-all ${step >= i ? 'w-6 bg-violet-600' : 'w-2 bg-slate-100'}`} />)}
          </div>
        </div>
      </header>

      <div className="px-8 flex-1 overflow-y-auto pt-8 pb-32 no-scrollbar">
        {error && <div className="mb-6 p-5 bg-rose-50 text-rose-600 rounded-3xl text-xs font-bold italic border border-rose-100">{error}</div>}

        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black italic text-slate-900 uppercase">1. Dados Pessoais</h3>
            <Input placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-16 rounded-3xl px-6" />
            <Input placeholder="Seu melhor e-mail" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="h-16 rounded-3xl px-6" />
            <Input type="password" placeholder="Crie uma senha segura" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="h-16 rounded-3xl px-6" />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="CPF" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} className="h-16 rounded-3xl px-6" />
              <Input placeholder="WhatsApp" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="h-16 rounded-3xl px-6" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black italic text-slate-900 uppercase">2. Localização</h3>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Escolha seu Condomínio</label>
              <select value={formData.condo} onChange={e => setFormData({ ...formData, condo: e.target.value })} className="w-full h-16 bg-white rounded-3xl px-6 font-bold shadow-sm border-none outline-none focus:ring-2 focus:ring-violet-100">
                <option value="">Selecione na lista...</option>
                {condos.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{isHorizontal ? 'Rua/Alameda' : 'Apto/Unidade'}</label>
                <Input placeholder="Ex: 402" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="h-16 rounded-3xl px-6" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{isHorizontal ? 'Número' : 'Bloco/Torre'}</label>
                <Input placeholder="Ex: Torre A" value={formData.tower} onChange={e => setFormData({ ...formData, tower: e.target.value })} className="h-16 rounded-3xl px-6" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black italic text-slate-900 uppercase">3. Dependentes</h3>
            <Button onClick={() => setFormData({ ...formData, dependents: [...formData.dependents, { id: Math.random().toString(), name: '', kinship: 'Filho(a)', birthDate: '' }] })} className="bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl w-full border-none">
              <Plus size={16} className="mr-2" /> Adicionar Dependente
            </Button>
            <div className="space-y-4">
              {formData.dependents.map(dep => (
                <div key={dep.id} className="bg-white p-6 rounded-[32px] shadow-sm space-y-4 border border-slate-50 relative animate-in zoom-in-95">
                  <button onClick={() => setFormData({ ...formData, dependents: formData.dependents.filter(d => d.id !== dep.id) })} className="absolute top-4 right-4 text-rose-300 hover:text-rose-500"><Trash2 size={18} /></button>
                  <Input placeholder="Nome Completo" value={dep.name} onChange={e => setFormData({ ...formData, dependents: formData.dependents.map(d => d.id === dep.id ? { ...d, name: e.target.value } : d) })} className="h-12 border-slate-100 rounded-2xl" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="date" value={dep.birthDate} onChange={e => setFormData({ ...formData, dependents: formData.dependents.map(d => d.id === dep.id ? { ...d, birthDate: e.target.value } : d) })} className="h-12 border-slate-100 rounded-2xl" />
                    <select className="bg-slate-50 rounded-2xl px-4 text-xs font-bold border-none" value={dep.kinship} onChange={e => setFormData({ ...formData, dependents: formData.dependents.map(d => d.id === dep.id ? { ...d, kinship: e.target.value as any } : d) })}>
                      <option>Filho(a)</option><option>Cônjuge</option><option>Outro</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black italic text-slate-900 uppercase">4. Validação</h3>
            <p className="text-sm text-slate-400 font-medium italic">Opcional: Anexe documentos para acelerar sua aprovação.</p>
            <div className="grid grid-cols-1 gap-4">
              {[{ k: 'rg', l: 'RG / CNH' }, { k: 'res', l: 'Comprovante' }].map(d => (
                <button key={d.k} onClick={() => setFormData({ ...formData, docs: { ...formData.docs, [d.k === 'rg' ? 'rg' : 'residence']: true } })} className={`h-24 rounded-[32px] border-2 border-dashed flex items-center justify-center gap-4 transition-all ${formData.docs[d.k === 'rg' ? 'rg' : 'residence'] ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'bg-white border-slate-200 text-slate-300 hover:border-violet-300'}`}>
                  {formData.docs[d.k === 'rg' ? 'rg' : 'residence'] ? <Check size={28} /> : <Camera size={28} />}
                  <span className="font-black uppercase text-[10px] tracking-widest">{d.l}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="p-8 bg-white border-t border-slate-50 fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40">
        <Button fullWidth onClick={step === 4 ? handleFinish : () => setStep(step + 1)} disabled={loading} className="h-16 rounded-3xl bg-slate-950 text-white font-black uppercase tracking-[0.2em] italic shadow-2xl shadow-slate-900/20 active:scale-95 transition-all">
          {loading ? 'Processando...' : step === 4 ? 'Finalizar Cadastro' : 'Próxima Etapa'}
        </Button>
      </footer>
    </div>
  );
};

// --- COMPONENTE: REGISTRO DE PROFISSIONAL (MANTIDO) ---
export const ProfessionalRegistration: React.FC<{ onFinish: (data: any) => void; onBack: () => void }> = ({ onFinish, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', cpf: '', category: 'Manutenção',
    docs: { rg: false, cpf: false, license: false }
  });

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
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
          options: { data: { full_name: formData.name, role: UserRole.PROFESSIONAL, phone: formData.phone, category: formData.category } }
        });
        if (authError) throw authError;
        if (authData.user) { userId = authData.user.id; sessionExists = !!authData.session; }
      }

      if (userId && sessionExists) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: userId, name: formData.name, email: formData.email, phone: formData.phone, cpf: formData.cpf,
          category: formData.category, role: UserRole.PROFESSIONAL,
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

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-24 flex flex-col">
      <header className="p-6 pt-12 flex items-center gap-4">
        <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-slate-900 italic uppercase">Cadastro Profissional</h2>
      </header>
      <div className="px-6 flex-1 overflow-y-auto">
        {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold italic">{error}</div>}
        <div className="mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Briefcase size={20} /></div>
          <div><h4 className="font-black text-emerald-900 text-sm uppercase italic">Teste Grátis por 60 Dias!</h4><p className="text-emerald-700 text-xs">Cadastre-se agora e aproveite 2 meses sem mensalidade.</p></div>
        </div>
        {step === 1 && (
          <div className="space-y-4">
            <Input placeholder="Nome / Empresa" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <Input placeholder="E-mail" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <Input type="password" placeholder="Senha" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            <Input placeholder="Telefone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Categoria</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full h-14 bg-slate-50 rounded-2xl px-4 font-bold text-slate-600">
                <option value="Manutenção">Manutenção</option><option value="Limpeza">Limpeza</option><option value="Beleza">Beleza</option><option value="Tecnologia">Tecnologia</option>
              </select>
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
        <button onClick={() => onSelect(UserRole.RESIDENT)} className="w-full p-6 bg-white rounded-3xl flex items-center gap-4 text-left border border-slate-100 shadow-sm hover:border-violet-600 hover:ring-2 hover:ring-violet-100 transition-all group">
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center group-hover:bg-violet-600 transition-colors">
            <UserCircle size={32} className="text-violet-600 group-hover:text-white" />
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
        <button onClick={() => onSelect(UserRole.ADMIN)} className="w-full p-6 bg-white rounded-3xl flex items-center gap-4 text-left border border-slate-100 shadow-sm hover:border-violet-600 hover:ring-2 hover:ring-violet-100 transition-all group">
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center group-hover:bg-violet-600 transition-colors">
            <ShieldCheck size={32} className="text-violet-600 group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 tracking-tight mb-1">Administrador</h3>
            <p className="text-slate-500 text-xs">Gestão do condomínio e moradores.</p>
          </div>
        </button>
        <div className="w-full h-px bg-slate-200 my-4"></div>
        <button onClick={() => onSelect(UserRole.SUPER_ADMIN)} className="w-full p-6 bg-slate-900 rounded-3xl flex items-center gap-4 text-left shadow-lg hover:ring-2 hover:ring-cyan-400 transition-all group">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center">
            <Zap size={32} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white tracking-tight mb-1">SUPER ADM</h3>
            <p className="text-slate-400 text-xs">Painel geral do sistema.</p>
          </div>
        </button>
      </div>
    </div>
  );
};
