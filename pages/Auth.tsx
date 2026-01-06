
import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Badge } from '../components/UI';
import {
  Mail, Lock, Chrome, Apple, ArrowLeft, Building2,
  UserCircle, ShieldCheck, User, IdCard, Phone as PhoneIcon,
  MapPin, Heart, Baby, Plus, Trash2, Camera, FileText, Check,
  ChevronRight, Calendar, Zap
} from 'lucide-react';
import { UserRole, Dependent } from '../types';
import { supabase } from '../supabase';


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
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-8 z-50">
      <div className="w-32 h-32 bg-violet-600/10 rounded-3xl flex items-center justify-center mb-8 animate-bounce">
        <Building2 size={64} className="text-violet-600" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">CondoConnect</h1>
      <p className="text-slate-500 text-center mb-12">Smart Living for Your Community</p>

      <div className="w-full max-w-xs bg-slate-100 h-1 rounded-full overflow-hidden">
        <div
          className="bg-violet-600 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};


export const LoginScreen: React.FC<{ onLogin: () => void; onRegister: () => void }> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
      console.warn("Supabase not configured, using mock login.");
      onLogin();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col">
      <div className="mt-16 mb-12">
        <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-600/30">
          <Building2 size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Seja bem-vindo</h2>
        <p className="text-slate-500">Conecte-se com sua comunidade e gerencie sua vida em condomínio.</p>
      </div>

      <div className="space-y-4 mb-8">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold italic">
            {error}
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Seu email"
            className="pl-12"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input
            type="password"
            placeholder="Sua senha"
            className="pl-12"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
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

      <Button
        fullWidth
        variant="secondary"
        onClick={onRegister}
        className="bg-white border-2 border-slate-100 text-slate-900 font-black uppercase tracking-widest italic"
      >
        Novo Cadastro
      </Button>

      <p className="text-center text-slate-400 mt-auto text-[10px] font-black uppercase tracking-widest">
        CondoConnect • Smart Living Core v3.1
      </p>
    </div>
  );
};


export const ResidentRegistration: React.FC<{ onFinish: (data: any) => void; onBack: () => void }> = ({ onFinish, onBack }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
    rg: '',
    phone: '',
    condo: 'Splendido Residencial',
    tower: '',
    unit: '',
    spouse: '',
    dependents: [] as Dependent[],
    docs: { rg: false, cpf: false, residence: false }
  });

  const handleFinish = async () => {
    if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
      console.warn("Supabase not configured, using mock registration.");
      onFinish(formData);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Criar usuário no Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Salvar Perfil Detalhado
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: formData.name,
            email: formData.email,
            cpf: formData.cpf,
            rg: formData.rg,
            phone: formData.phone,
            tower: formData.tower,
            unit: formData.unit,
            spouse_name: formData.spouse,
            role: UserRole.RESIDENT,
            is_free: true
          });

        if (profileError) throw profileError;

        // 3. Salvar Dependentes
        if (formData.dependents.length > 0) {
          const depsToInsert = formData.dependents.map(d => ({
            profile_id: authData.user?.id,
            name: d.name,
            kinship: d.kinship,
            birth_date: d.birthDate
          }));

          const { error: depsError } = await supabase
            .from('dependents')
            .insert(depsToInsert);

          if (depsError) throw depsError;
        }

        onFinish(formData);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar cadastro.');
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
        <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-900 shadow-sm active:scale-90 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 italic tracking-tighter leading-none">Cadastro Morador</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Etapa {step} de 4</p>
        </div>
      </header>

      <div className="px-6 flex-1 overflow-y-auto no-scrollbar">
        {renderStepIndicator()}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-black text-slate-950 italic tracking-tighter">Dados de Acesso</h3>
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold italic">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <Input placeholder="E-mail" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="pl-12 h-14" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <Input type="password" placeholder="Senha" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="pl-12 h-14" />
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <Input placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="pl-12 h-14" />
              </div>
              <div className="relative">
                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <Input placeholder="CPF" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} className="pl-12 h-14" />
              </div>
              <div className="relative">
                <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <Input placeholder="Telefone / WhatsApp" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="pl-12 h-14" />
              </div>
            </div>
          </div>
        )}


        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-black text-slate-950 italic tracking-tighter">Localização</h3>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <Building2 className="text-violet-600" size={24} />
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Condomínio</p>
                  <p className="font-bold text-slate-900">{formData.condo}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Torre / Bloco</label>
                  <Input placeholder="Ex: B" value={formData.tower} onChange={e => setFormData({ ...formData, tower: e.target.value })} className="h-14" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Unidade / Apto</label>
                  <Input placeholder="Ex: 402" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="h-14" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
            <h3 className="text-2xl font-black text-slate-950 italic tracking-tighter">Núcleo Familiar</h3>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cônjuge / Parceiro(a)</p>
              <div className="relative">
                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
                <Input placeholder="Nome do Cônjuge (opcional)" value={formData.spouse} onChange={e => setFormData({ ...formData, spouse: e.target.value })} className="pl-12 h-14" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filhos e Outros Dependentes</p>
                <button onClick={addDependent} className="text-violet-600 text-[10px] font-black uppercase flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-lg"><Plus size={12} /> Adicionar</button>
              </div>

              {formData.dependents.length === 0 && (
                <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                  <p className="text-xs text-slate-400 italic">Nenhum dependente adicionado.</p>
                </div>
              )}

              <div className="space-y-4">
                {formData.dependents.map((dep) => (
                  <div key={dep.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Baby className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={18} />
                        <Input
                          placeholder="Nome do Filho(a)"
                          value={dep.name}
                          onChange={e => updateDependent(dep.id, 'name', e.target.value)}
                          className="pl-12 h-12 text-sm border-none bg-slate-50"
                        />
                      </div>
                      <button onClick={() => removeDependent(dep.id)} className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center active:scale-90 transition-transform"><Trash2 size={18} /></button>
                    </div>
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <Input
                          type="date"
                          placeholder="Nascimento"
                          value={dep.birthDate}
                          onChange={e => updateDependent(dep.id, 'birthDate', e.target.value)}
                          className="pl-12 h-12 text-xs border-none bg-slate-50"
                        />
                      </div>
                      <select
                        value={dep.kinship}
                        onChange={e => updateDependent(dep.id, 'kinship', e.target.value as any)}
                        className="bg-slate-50 rounded-xl px-4 text-[10px] font-black uppercase text-slate-500 outline-none border-none h-12"
                      >
                        <option>Filho(a)</option>
                        <option>Parente</option>
                        <option>Outro</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-black text-slate-950 italic tracking-tighter">Documentação</h3>
            <p className="text-sm text-slate-500 font-medium italic leading-relaxed">Para validação da sua conta, anexe fotos nítidas dos documentos originais.</p>

            <div className="space-y-4">
              {[
                { key: 'rg', label: 'RG ou CNH (Frente e Verso)', icon: <IdCard size={24} /> },
                { key: 'cpf', label: 'CPF (Caso não tenha no RG)', icon: <FileText size={24} /> },
                { key: 'residence', label: 'Comprovante de Residência', icon: <MapPin size={24} /> }
              ].map((doc) => (
                <button
                  key={doc.key}
                  onClick={() => setFormData({ ...formData, docs: { ...formData.docs, [doc.key]: true } })}
                  className={`w-full p-6 rounded-[32px] border-2 border-dashed flex items-center justify-between group transition-all ${formData.docs[doc.key as keyof typeof formData.docs] ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-violet-200'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${formData.docs[doc.key as keyof typeof formData.docs] ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-300 group-hover:text-violet-500 transition-colors'}`}>
                      {formData.docs[doc.key as keyof typeof formData.docs] ? <Check size={28} /> : doc.icon}
                    </div>
                    <div className="text-left">
                      <h4 className={`font-black tracking-tight italic ${formData.docs[doc.key as keyof typeof formData.docs] ? 'text-emerald-700' : 'text-slate-900'}`}>{doc.label}</h4>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formData.docs[doc.key as keyof typeof formData.docs] ? 'ARQUIVO CARREGADO' : 'CLIQUE PARA ANEXAR'}</p>
                    </div>
                  </div>
                  {!formData.docs[doc.key as keyof typeof formData.docs] && <Camera className="text-slate-300" size={20} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="p-6 bg-white border-t border-slate-50">
        <Button
          fullWidth
          onClick={step === 4 ? handleFinish : () => setStep(step + 1)}
          disabled={loading}
          className="h-16 rounded-[24px] bg-slate-950 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 italic"
        >
          {loading ? 'Processando...' : (step === 4 ? 'Finalizar Cadastro' : 'Próxima Etapa')}
        </Button>

      </footer>
    </div>
  );
};

export const RoleSelection: React.FC<{ onSelect: (role: UserRole) => void }> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col overflow-y-auto no-scrollbar pb-16">
      <div className="mb-12 shrink-0">
        <button className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center mb-12">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-center mb-2 text-slate-900 italic tracking-tighter">Como você quer entrar?</h2>
        <p className="text-slate-500 text-center text-sm">Escolha o perfil que deseja acessar agora.</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => onSelect(UserRole.RESIDENT)}
          className="w-full p-6 bg-white border border-slate-100 shadow-sm rounded-3xl flex items-center gap-4 text-left hover:border-violet-600 hover:ring-2 hover:ring-violet-100 transition-all group"
        >
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center group-hover:bg-violet-600 transition-colors">
            <UserCircle size={32} className="text-violet-600 group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 tracking-tight leading-none mb-1">Sou Morador</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Acesse avisos, serviços e o marketplace do prédio.</p>
          </div>
        </button>

        <button
          onClick={() => onSelect(UserRole.PROFESSIONAL)}
          className="w-full p-6 bg-white border border-slate-100 shadow-sm rounded-3xl flex items-center gap-4 text-left hover:border-violet-600 hover:ring-2 hover:ring-violet-100 transition-all group"
        >
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
            <Building2 size={32} className="text-emerald-600 group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 tracking-tight leading-none mb-1">Sou Profissional</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Gerencie agendamentos e ofereça seus serviços.</p>
          </div>
        </button>

        <button
          onClick={() => onSelect(UserRole.ADMIN)}
          className="w-full p-6 bg-white border border-slate-100 shadow-sm rounded-3xl flex items-center gap-4 text-left hover:border-violet-600 hover:ring-2 hover:ring-violet-100 transition-all group"
        >
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center group-hover:bg-violet-600 transition-colors">
            <ShieldCheck size={32} className="text-violet-600 group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 tracking-tight leading-none mb-1 italic">Administrador</h3>
            <p className="text-slate-500 text-xs leading-relaxed">Gestão de moradores, avisos e financeiro.</p>
          </div>
        </button>

        <div className="h-px bg-slate-100 my-4 mx-4"></div>

        <button
          onClick={() => onSelect(UserRole.SUPER_ADMIN)}
          className="w-full p-6 bg-slate-900 border border-slate-800 shadow-xl rounded-3xl flex items-center gap-4 text-left hover:ring-2 hover:ring-cyan-400 transition-all group"
        >
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center">
            <Zap size={32} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white tracking-tight leading-none mb-1 italic">SUPER ADM</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Plataforma, SaaS e Marketplace Global.</p>
          </div>
        </button>
      </div>
    </div>
  );
};
