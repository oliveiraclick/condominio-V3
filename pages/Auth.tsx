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

const translateError = (error: any): string => {
  const message = error?.message || '';
  if (message.includes('User already registered') || message.includes('already exists')) {
    return 'Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.';
  }
  if (message.includes('Invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Por favor, confirme seu e-mail na sua caixa de entrada antes de entrar.';
  }
  if (message.includes('Password should be at least 6 characters')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (message.includes('should be a valid email')) {
    return 'Digite um e-mail válido.';
  }
  return 'Erro ao conectar. Tente novamente.';
};

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
      <div className="w-40 h-40 bg-white rounded-3xl flex items-center justify-center mb-8 animate-pulse overflow-hidden">
        <img src="/logo.png" alt="Morador Logo" className="w-full h-full object-contain p-4" />
      </div>
      <h1 className="text-4xl font-black italic text-slate-950 mb-2 tracking-tighter uppercase">APP MORADOR</h1>
      <p className="text-violet-600 font-black uppercase text-[10px] tracking-[0.4em] mb-12">Conecte-se. Clicou, Achou.</p>
      <div className="w-full max-w-xs bg-slate-100 h-1 rounded-full overflow-hidden">
        <div className="bg-violet-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export const LoginScreen: React.FC<{ onLogin: (session?: any) => void; onRegister: () => void }> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
        console.warn("Supabase not configured, using mock login.");
        onLogin();
        return;
      }
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      onLogin(data.session); // App.tsx will handle the rest via onAuthStateChange and direct session usage
    } catch (err: any) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col">
      <div className="mt-16 mb-12">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-slate-100 p-3">
          <img src="/logo.png" alt="Morador" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter text-slate-950 mb-2 uppercase">APP MORADOR</h2>
        <p className="text-slate-500 font-medium italic">Faça login para continuar.</p>
      </div>

      <div className="space-y-4 mb-8">
        {error && <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold italic">{error}</div>}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input placeholder="Seu email" className="pl-12" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input type="password" placeholder="Sua senha" className="pl-12" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="text-right">
          <button className="text-violet-600 text-sm font-medium">Esqueceu a senha?</button>
        </div>
      </div>

      <Button fullWidth onClick={handleSignIn} disabled={loading} className="mb-8 font-black uppercase tracking-widest italic">
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>

      <div className="relative mb-8 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <span className="relative px-2 bg-slate-50 text-xs text-slate-400 uppercase tracking-widest font-black italic">Ou</span>
      </div>

      <Button fullWidth variant="secondary" onClick={onRegister} className="bg-white border-2 border-slate-100 text-slate-900 font-black uppercase tracking-widest italic">
        Novo Cadastro
      </Button>

      <div className="flex items-center justify-center gap-2 text-slate-300 mt-auto flex-col text-center">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 opacity-50"></div>
          <p className="text-[10px] font-black uppercase tracking-widest px-2">
            APP MORADOR • Conecte-se. Clicou, Achou.
          </p>
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 opacity-50"></div>
        </div>
      </div>
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-800 mt-1 shadow-sm">v1.0.8</p>
    </div>
  );
};

export const ResidentRegistration: React.FC<{ onFinish: (data: any) => void; onBack: () => void }> = ({ onFinish, onBack }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', cpf: '', rg: '', phone: '',
    condo: '', tower: '', unit: '', spouse: '',
    dependents: [] as Dependent[],
    docs: { rg: false, cpf: false, residence: false }
  });
  const [condos, setCondos] = useState<any[]>([]);

  useEffect(() => {
    const fetchCondos = async () => {
      const { data } = await supabase.from('condominiums').select('*').eq('status', 'active');
      if (data && data.length > 0) {
        setCondos(data);
      } else {
        // Fallback or Mock if DB empty
        setCondos([
          { id: '1', name: 'Vila Verde Residence', type: 'vertical' },
          { id: '2', name: 'Splendido Residencial', type: 'vertical' },
          { id: '3', name: 'Grand Park', type: 'horizontal' }
        ]);
      }
    };
    fetchCondos();
  }, []);

  const selectedCondoData = condos.find(c => c.id === formData.condo);
  const isHorizontal = selectedCondoData?.type === 'horizontal';
  const labelTower = isHorizontal ? 'Número' : 'Torre / Bloco';
  const placeholderTower = isHorizontal ? 'Ex: 1200' : 'Bloco A';
  const labelUnit = isHorizontal ? 'Rua / Alameda' : 'Unidade';
  const placeholderUnit = isHorizontal ? 'Ex: Rua das Flores' : 'Apto 101';

  const handleFinish = async () => {
    if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
      console.warn("Supabase not configured, using mock registration.");
      onFinish(formData);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let userId = '';
      let sessionExists = false;

      // 0. CHECK FOR EXISTING SESSION (Robust Logic)
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        console.log('🔵 [RES REG] Usuário já autenticado, pulando signUp:', currentUser.id);
        userId = currentUser.id;
        sessionExists = true;
        // Update metadata just in case
        await supabase.auth.updateUser({
          data: {
            full_name: formData.name,
            role: UserRole.RESIDENT,
            tower: formData.tower,
            unit: formData.unit
          }
        });
      } else {
        // 1. Normal SignUp
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: UserRole.RESIDENT,
              tower: formData.tower,
              unit: formData.unit
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          userId = authData.user.id;
          sessionExists = !!authData.session;
        }
      }

      if (userId) {
        if (sessionExists) {
          // 2. Upsert Profile
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            name: formData.name,
            email: formData.email,
            role: UserRole.RESIDENT,
            condo_id: formData.condo,
            tower: formData.tower,
            unit: formData.unit,
            phone: formData.phone,
            cpf: formData.cpf,
            is_free: true
          });

          if (profileError) throw profileError;

          // 3. Save Dependents (if any)
          if (formData.dependents.length > 0) {
            const depsToInsert = formData.dependents.map(d => ({
              profile_id: userId,
              name: d.name,
              kinship: d.kinship,
              birth_date: d.birthDate
            }));
            const { error: depsError } = await supabase.from('dependents').insert(depsToInsert);
            if (depsError) throw depsError; // Non-fatal but could log
          }

          onFinish(formData);
        } else {
          alert("✅ Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar.");
          onBack();
        }
      }
    } catch (err: any) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  const addDependent = () => {
    const newDep: Dependent = { id: Math.random().toString(), name: '', kinship: 'Filho(a)', birthDate: '' };
    setFormData({ ...formData, dependents: [...formData.dependents, newDep] });
  };

  const removeDependent = (id: string) => {
    setFormData({ ...formData, dependents: formData.dependents.filter(d => d.id !== id) });
  };

  const updateDependent = (id: string, field: keyof Dependent, value: string) => {
    setFormData({
      ...formData,
      dependents: formData.dependents.map(d => d.id === id ? { ...d, [field]: value } : d)
    });
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-10 px-2">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' : 'bg-slate-100 text-slate-400'}`}>
            {step > s ? <Check size={16} /> : s}
          </div>
          {s < 4 && <div className={`w-12 h-1 mx-2 rounded-full ${step > s ? 'bg-violet-600' : 'bg-slate-100'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-24 flex flex-col">
      <header className="p-6 pt-12 flex items-center gap-4">
        <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 italic uppercase">Cadastro Morador</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Etapa {step} de 4</p>
        </div>
      </header>

      <div className="px-6 flex-1 overflow-y-auto no-scrollbar">
        {step < 5 && renderStepIndicator()}
        {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold italic">{error}</div>}

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-black text-slate-950 italic tracking-tighter">Dados de Acesso</h3>
            <Input placeholder="E-mail" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <Input type="password" placeholder="Senha" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            <Input placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <Input placeholder="Telefone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            <Input placeholder="CPF" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-black text-slate-950 italic tracking-tighter">Onde você mora?</h3>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Selecione o Condomínio</label>
              <select
                value={formData.condo}
                onChange={e => setFormData({ ...formData, condo: e.target.value })}
                className="w-full h-14 bg-slate-50 rounded-2xl px-4 font-bold text-slate-900 border-r-[16px] border-transparent outline-none"
              >
                <option value="">Selecione...</option>
                {condos.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{labelUnit}</label>
                <Input placeholder={placeholderUnit} value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{labelTower}</label>
                <Input placeholder={placeholderTower} value={formData.tower} onChange={e => setFormData({ ...formData, tower: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
            <h3 className="text-2xl font-black text-slate-950 italic tracking-tighter">Núcleo Familiar</h3>
            <Input placeholder="Nome do Cônjuge (opcional)" value={formData.spouse} onChange={e => setFormData({ ...formData, spouse: e.target.value })} />

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dependentes</p>
                <button onClick={addDependent} className="text-violet-600 text-[10px] font-black uppercase flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-lg"><Plus size={12} /> Adicionar</button>
              </div>
              {formData.dependents.map((dep) => (
                <div key={dep.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                  <Input placeholder="Nome" value={dep.name} onChange={e => updateDependent(dep.id, 'name', e.target.value)} />
                  <div className="flex gap-2">
                    <Input type="date" value={dep.birthDate} onChange={e => updateDependent(dep.id, 'birthDate', e.target.value)} />
                    <select value={dep.kinship} onChange={e => updateDependent(dep.id, 'kinship', e.target.value as any)} className="bg-slate-50 rounded-xl px-2 text-xs font-bold">
                      <option>Filho(a)</option>
                      <option>Parente</option>
                      <option>Outro</option>
                    </select>
                    <button onClick={() => removeDependent(dep.id)} className="text-rose-500 p-2"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-black text-slate-950 italic tracking-tighter">Documentação (Opcional)</h3>
            <div className="space-y-4">
              {[
                { key: 'rg', label: 'RG ou CNH', icon: <IdCard size={24} /> },
                { key: 'residence', label: 'Comp. Residência', icon: <MapPin size={24} /> }
              ].map((doc) => (
                <button
                  key={doc.key}
                  onClick={() => setFormData({ ...formData, docs: { ...formData.docs, [doc.key]: true } })}
                  className={`w-full p-4 rounded-2xl border-2 border-dashed flex items-center gap-4 ${formData.docs[doc.key as keyof typeof formData.docs] ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200'}`}
                >
                  {formData.docs[doc.key as keyof typeof formData.docs] ? <Check size={24} /> : doc.icon}
                  <span className="font-bold text-sm">{doc.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="p-6">
        <Button fullWidth onClick={step === 4 ? handleFinish : () => setStep(step + 1)} disabled={loading} className="h-14 rounded-2xl font-black uppercase tracking-widest">
          {loading ? 'Salvando...' : step === 4 ? 'Finalizar Cadastro' : 'Próxima Etapa'}
        </Button>
      </footer>
    </div>
  );
};

export const ProfessionalRegistration: React.FC<{ onFinish: (data: any) => void; onBack: () => void }> = ({ onFinish, onBack }) => {
  // Professional Registration reusing similar logic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', cpf: '', category: 'Manutenção',
    docs: { rg: false, cpf: false, license: false }
  });

  const handleFinish = async () => {
    if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
      onFinish(formData);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let userId = '';
      let sessionExists = false;

      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        userId = currentUser.id;
        sessionExists = true;
        await supabase.auth.updateUser({
          data: {
            full_name: formData.name,
            role: UserRole.PROFESSIONAL,
            phone: formData.phone,
            category: formData.category
          }
        });
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: UserRole.PROFESSIONAL,
              phone: formData.phone,
              category: formData.category
            }
          }
        });
        if (authError) throw authError;
        if (authData.user) {
          userId = authData.user.id;
          sessionExists = !!authData.session;
        }
      }

      if (userId && sessionExists) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: userId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          category: formData.category,
          role: UserRole.PROFESSIONAL
        });
        if (profileError) throw profileError;
        onFinish(formData);
      } else if (userId && !sessionExists) {
        alert("✅ Cadastro realizado! Verifique seu e-mail.");
        onBack();
      }
    } catch (err: any) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
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

        {step === 1 && (
          <div className="space-y-4">
            <Input placeholder="Nome / Empresa" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <Input placeholder="E-mail" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <Input type="password" placeholder="Senha" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            <Input placeholder="Telefone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Categoria</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full h-14 bg-slate-50 rounded-2xl px-4 font-bold text-slate-600">
                <option value="Manutenção">Manutenção</option>
                <option value="Limpeza">Limpeza</option>
                <option value="Beleza">Beleza</option>
                <option value="Tecnologia">Tecnologia</option>
              </select>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black">Documentos</h3>
            <p className="text-sm text-slate-500">Opcional para validação.</p>
            {[
              { key: 'rg', label: 'RG / CNH' },
              { key: 'license', label: 'Certificados' }
            ].map((doc) => (
              <button key={doc.key} onClick={() => setFormData({ ...formData, docs: { ...formData.docs, [doc.key]: true } })}
                className={`w-full p-4 rounded-2xl border-2 border-dashed flex items-center gap-4 ${formData.docs[doc.key as keyof typeof formData.docs] ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200'}`}>
                {formData.docs[doc.key as keyof typeof formData.docs] ? <Check size={24} /> : <FileText size={24} />}
                <span className="font-bold text-sm">{doc.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <footer className="p-6">
        <Button fullWidth onClick={step === 2 ? handleFinish : () => setStep(2)} disabled={loading}>
          {loading ? 'Salvando...' : step === 2 ? 'Finalizar' : 'Próxima'}
        </Button>
      </footer>
    </div>
  );
}

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
