import React, { useState, useEffect } from 'react';
import { Users, Building, DollarSign, Activity, LayoutGrid, User, ShieldCheck, Plus, Search, ArrowLeft } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { supabase } from '../supabase';

// --- NAVEGAÇÃO SUPER ADMIN (BOTTOM BAR) ---
const SuperAdminNavigation: React.FC<{ activeTab: string; onChange: (tab: string) => void }> = ({ activeTab, onChange }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-5px_30px_rgba(124,58,237,0.15)] border-t border-violet-100 px-6 py-4 flex justify-between items-end z-50 max-w-md mx-auto rounded-t-[32px] mb-0">
    {[
      { id: 'dashboard', icon: <LayoutGrid size={24} />, label: 'Home' },
      { id: 'condos', icon: <Building size={24} />, label: 'Condos' },
      { id: 'users', icon: <Users size={24} />, label: 'Users' },
      { id: 'finance', icon: <DollarSign size={24} />, label: 'Assin.' },
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => onChange(item.id)}
        className={`flex flex-col items-center gap-1 transition-all duration-300 w-12 ${activeTab === item.id ? 'text-violet-600 -translate-y-1' : 'text-violet-200 hover:text-violet-400'}`}
      >
        {item.icon}
        {activeTab === item.id && <div className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce" />}
      </button>
    ))}
  </div>
);

// --- COMPONENTE PRINCIPAL ---
export const SuperAdmin: React.FC<{ onLogout: () => void; currentUser: any }> = ({ onLogout, currentUser }) => {
  const [activeTab, setActiveTabRaw] = useState('dashboard');
  const [history, setHistory] = useState<string[]>(['dashboard']);

  // Navigation Helpers (consistent with App.tsx)
  const pushScreen = (tab: string) => {
    setHistory(prev => [...prev, tab]);
    setActiveTabRaw(tab);
  };

  const baseScreen = (tab: string) => {
    setHistory([tab]);
    setActiveTabRaw(tab);
  };

  const goBack = () => {
    setHistory(prev => {
      if (prev.length <= 1) return prev;
      const newHist = prev.slice(0, -1);
      setActiveTabRaw(newHist[newHist.length - 1]);
      return newHist;
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView onNavigate={pushScreen} currentUser={currentUser} onLogout={onLogout} />;
      case 'condos': return <CondosView onNavigate={pushScreen} />;
      case 'users': return <UsersView onBack={goBack} />;
      case 'finance': return <SubscriptionsView onBack={goBack} />;
      default: return <DashboardView onNavigate={pushScreen} currentUser={currentUser} onLogout={onLogout} />;
    }
  };

  return (
    <div className="relative max-w-md mx-auto shadow-2xl min-h-screen bg-[#f8fafc] overflow-hidden border-x border-slate-100 flex flex-col">
      <div className="flex-1 pb-24 overflow-y-auto no-scrollbar">
        {renderContent()}
      </div>
      <SuperAdminNavigation activeTab={activeTab} onChange={baseScreen} />
    </div>
  );
};

// --- VIEWS ---

const DashboardView = ({ onNavigate, currentUser, onLogout }: any) => (
  <div className="p-6 space-y-6 animate-in fade-in zoom-in duration-500">
    <header className="flex justify-between items-center pt-8">
      <div>
        <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">Super Painel</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gestão Geral</p>
      </div>
      <div className="flex items-center gap-2">
        <img src={currentUser?.avatar} className="w-10 h-10 rounded-full border border-slate-200" />
        <button onClick={onLogout} className="w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center text-rose-500"><ArrowLeft size={16} className="rotate-180" /></button>
      </div>
    </header>

    <div className="grid grid-cols-2 gap-4">
      <StatCard label="Condomínios" value="12" color="bg-violet-500" />
      <StatCard label="Usuários" value="1,4k" color="bg-emerald-500" />
      <StatCard label="MRR (Mês)" value="R$ 24k" color="bg-indigo-500" className="col-span-2" />
    </div>

    <Card className="p-6 bg-white border-none shadow-sm rounded-[32px]">
      <h3 className="text-lg font-black italic text-slate-900 mb-4">Novos Clientes</h3>
      <div className="space-y-4">
        <ListItem title="Vila Verde Residence" subtitle="140 Unidades • Pro" status="Novo" />
        <ListItem title="Condomínio Solar" subtitle="40 Unidades • Basic" status="Trial" />
      </div>
    </Card>
  </div>
);

const CondosView = ({ onNavigate }: any) => {
  const [condos, setCondos] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newCondo, setNewCondo] = useState({ name: '', address: '', plan: 'basic' });

  useEffect(() => {
    supabase.from('condominiums').select('*').then(({ data }) => data && setCondos(data));
  }, []);

  const handleCreate = async () => {
    if (!newCondo.name) return;
    const { error } = await supabase.from('condominiums').insert([newCondo]);
    if (!error) { setShowNew(false); alert('Criado!'); window.location.reload(); }
  };

  return (
    <div className="p-6 space-y-6 pt-12 animate-in slide-in-from-right-8">
      <div className="flex justify-between items-end">
        <h1 className="text-2xl font-black italic text-slate-900 uppercase">Condomínios</h1>
        <button onClick={() => setShowNew(true)} className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-200"><Plus size={24} /></button>
      </div>

      {showNew && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 space-y-4 animate-in zoom-in-95">
          <h3 className="font-bold text-slate-900">Novo Condomínio</h3>
          <Input placeholder="Nome" value={newCondo.name} onChange={e => setNewCondo({ ...newCondo, name: e.target.value })} />
          <Input placeholder="Endereço" value={newCondo.address} onChange={e => setNewCondo({ ...newCondo, address: e.target.value })} />
          <Button fullWidth onClick={handleCreate} className="bg-slate-900 text-white h-12 uppercase font-black text-xs">Salvar</Button>
          <button onClick={() => setShowNew(false)} className="w-full text-center text-xs text-slate-400 font-bold uppercase mt-2">Cancelar</button>
        </div>
      )}

      <div className="space-y-3">
        {condos.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400">{c.name?.[0]}</div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{c.plan} • {c.address}</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SubscriptionsView = ({ onBack }: any) => {
  const [pros, setPros] = useState<any[]>([]);

  useEffect(() => {
    setPros([
      { id: 1, name: 'Marco Tech', trial_ends_at: new Date(Date.now() + 15 * 86400000).toISOString(), subscription_status: 'trial' },
      { id: 2, name: 'Jose Encanador', trial_ends_at: new Date(Date.now() - 2 * 86400000).toISOString(), subscription_status: 'expired' }
    ]);
  }, []);

  return (
    <div className="p-6 space-y-6 pt-12 animate-in slide-in-from-right-8">
      <h1 className="text-2xl font-black italic text-slate-900 uppercase">Assinaturas</h1>
      <div className="space-y-3">
        {pros.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-900">{p.name}</h4>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${p.subscription_status === 'trial' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>{p.subscription_status}</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Expira em: {new Date(p.trial_ends_at).toLocaleDateString()}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-violet-50 text-violet-600 h-8 rounded-xl text-[10px] font-black uppercase">+15 Dias</button>
              <button className="flex-1 bg-violet-50 text-violet-600 h-8 rounded-xl text-[10px] font-black uppercase">+30 Dias</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UsersView = ({ onBack }: any) => (
  <div className="p-6 space-y-6 pt-12 animate-in slide-in-from-right-8">
    <h1 className="text-2xl font-black italic text-slate-900 uppercase">Usuários</h1>
    <div className="bg-white p-8 rounded-3xl text-center border border-slate-50">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><Users size={32} /></div>
      <h3 className="font-bold text-slate-900">Em Breve</h3>
      <p className="text-xs text-slate-400 mt-1">Gestão completa de usuários.</p>
    </div>
  </div>
);

// --- COMPONENTES UI AUXILIARES ---
const StatCard = ({ label, value, color, className }: any) => (
  <div className={`p-4 rounded-[24px] bg-white shadow-sm border border-slate-50 ${className}`}>
    <div className={`w-8 h-8 rounded-xl ${color} opacity-20 mb-2`}></div>
    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

const ListItem = ({ title, subtitle, status }: any) => (
  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
    <div>
      <h4 className="text-xs font-bold text-slate-900">{title}</h4>
      <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
    </div>
    <span className="text-[9px] font-bold text-slate-400 uppercase bg-white px-2 py-1 rounded-lg border border-slate-100">{status}</span>
  </div>
);
