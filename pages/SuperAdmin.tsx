import React, { useState } from 'react';
import { Users, Building, DollarSign, Activity, Search, ShieldCheck } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { supabase } from '../supabase';

const SectionHeader: React.FC<{ title: string; action?: string; onAction?: () => void }> = ({ title, action, onAction }) => (
  <div className="flex justify-between items-end mb-6 px-1">
    <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none">{title}</h3>
    {action && (
      <button onClick={onAction} className="text-[10px] font-black text-violet-600 uppercase tracking-widest bg-violet-50 px-4 py-2 rounded-xl active:scale-95 transition-all">
        {action}
      </button>
    )}
  </div>
);

export const SuperAdmin: React.FC<{ onLogout: () => void; currentUser: any }> = ({ onLogout, currentUser }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">
      {/* Sidebar Navigation */}
      <div className="w-24 bg-[#0f172a] border-r border-slate-800 flex flex-col items-center py-10 z-50 fixed h-full">
        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-10 shadow-lg shadow-indigo-500/20">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <nav className="flex flex-col gap-8">
          <NavIcon icon={<Activity size={24} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavIcon icon={<Building size={24} />} active={activeTab === 'condos'} onClick={() => setActiveTab('condos')} />
          <NavIcon icon={<Users size={24} />} active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <NavIcon icon={<DollarSign size={24} />} active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-24 bg-slate-900 min-h-screen relative overflow-x-hidden">
        <div className="absolute top-0 right-0 p-8 flex items-center gap-4 z-20">
          <span className="text-sm font-bold text-slate-400 hidden md:block">Olá, {currentUser?.name || 'Admin'}</span>
          <div className="w-10 h-10 bg-slate-700 rounded-full overflow-hidden border-2 border-slate-600">
            <img src={currentUser?.avatar} className="w-full h-full object-cover" />
          </div>
          <button onClick={onLogout} className="text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-widest">Sair</button>
        </div>

        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'condos' && <CondosView />}
        {activeTab === 'finance' && <SubscriptionsView />}
      </div>
    </div>
  );
};

const NavIcon = ({ icon, active, onClick }: any) => (
  <button onClick={onClick} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
    {icon}
  </button>
);

const DashboardView = () => {
  return (
    <div className="p-10 space-y-10 animate-in fade-in zoom-in duration-500">
      <div>
        <h1 className="text-4xl font-black italic tracking-tighter text-white">Platform Overview</h1>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Visão Geral da Plataforma</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard label="Condomínios Ativos" value="12" change="+2 this month" color="bg-indigo-500" />
        <StatCard label="Usuários Totais" value="1,432" change="+120 this week" color="bg-emerald-500" />
        <StatCard label="MRR (Mensal)" value="R$ 24k" change="+15% vs last mo" color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <Card className="p-8 bg-slate-800 border-none rounded-[32px]">
          <h3 className="text-xl font-bold text-white mb-6">Novos Clientes (Ultimos 30 dias)</h3>
          <div className="space-y-4">
            <ListItem title="Vila Verde Residence" subtitle="Plano Pro • 140 Unidades" status="Novo" />
            <ListItem title="Condomínio Solar" subtitle="Plano Basic • 40 Unidades" status="Trial" />
            <ListItem title="Edifício Horizon" subtitle="Plano Enterprise • 300 Unidades" status="Onboarding" />
          </div>
        </Card>
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-10 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 cursor-pointer">
          <div className="relative z-10">
            <h3 className="text-3xl font-black italic tracking-tighter text-white">System Status</h3>
            <p className="text-indigo-200 font-medium mt-2">All systems operational. Database latency: 24ms.</p>
          </div>
          <Activity size={100} className="absolute -right-6 -bottom-6 text-white opacity-10" />
          <div className="relative z-10 mt-10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="font-bold text-white tracking-widest text-xs uppercase">Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CondosView = () => {
  const [condos, setCondos] = useState<any[]>([]);
  const [showNewCondoModal, setShowNewCondoModal] = useState(false);
  const [newCondo, setNewCondo] = useState({ name: '', address: '', plan: 'basic' });

  const fetchCondos = async () => {
    const { data, error } = await supabase.from('condominiums').select('*');
    if (data) setCondos(data);
  };

  React.useEffect(() => {
    fetchCondos();
  }, []);

  const handleCreateCondo = async () => {
    if (!newCondo.name) return alert('Nome obrigatório');

    const { error } = await supabase.from('condominiums').insert([newCondo]);
    if (error) {
      alert('Erro ao criar: ' + error.message);
    } else {
      alert('Condomínio criado com sucesso!');
      setShowNewCondoModal(false);
      setNewCondo({ name: '', address: '', plan: 'basic' });
      fetchCondos();
    }
  };

  return (
    <div className="p-10 space-y-8 animate-in slide-in-from-right-8 duration-500 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white">Gestão de Condomínios</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">SaaS Clients Management</p>
        </div>
        <Button onClick={() => setShowNewCondoModal(true)} className="bg-indigo-600 h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-500 transition-colors">Adicionar Condomínio</Button>
      </div>

      {showNewCondoModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-8 rounded-[32px] w-full max-w-md border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">Novo Condomínio</h3>
            <div className="space-y-4">
              <Input placeholder="Nome do Condomínio" value={newCondo.name} onChange={e => setNewCondo({ ...newCondo, name: e.target.value })} />
              <Input placeholder="Endereço" value={newCondo.address} onChange={e => setNewCondo({ ...newCondo, address: e.target.value })} />
              <select
                className="w-full h-12 bg-slate-900 border border-slate-700 rounded-xl px-4 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
                value={newCondo.plan}
                onChange={e => setNewCondo({ ...newCondo, plan: e.target.value })}
              >
                <option value="basic">Plano Basic</option>
                <option value="pro">Plano Pro</option>
                <option value="enterprise">Plano Enterprise</option>
              </select>
              <div className="flex gap-2 pt-4">
                <Button fullWidth onClick={() => setShowNewCondoModal(false)} className="bg-slate-700 hover:bg-slate-600">Cancelar</Button>
                <Button fullWidth onClick={handleCreateCondo} className="bg-emerald-500 hover:bg-emerald-600">Criar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {condos.map(c => (
          <div key={c.id} className="bg-slate-800 p-6 rounded-[24px] flex items-center justify-between hover:bg-slate-750 transition-colors group cursor-pointer border border-transparent hover:border-slate-600">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 font-bold text-xl">{c.name?.charAt(0)}</div>
              <div>
                <h3 className="font-bold text-white text-lg">{c.name}</h3>
                <p className="text-xs text-slate-400 font-medium">{c.plan} • {c.address || 'Sem endereço'}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${'Active' === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              Active
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const StatCard = ({ label, value, change, color }: any) => (
  <div className="bg-slate-800 p-6 rounded-[32px] border border-slate-700/50 hover:bg-slate-750 transition-all group">
    <div className={`w-10 h-10 ${color} rounded-xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity`}></div>
    <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">{label}</p>
    <span className="text-[10px] font-medium text-emerald-400 mt-4 block">{change}</span>
  </div>
)

const ListItem = ({ title, subtitle, status }: any) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-700/50">
    <div>
      <h4 className="text-sm font-bold text-white">{title}</h4>
      <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
    </div>
    <span className="text-[9px] font-bold text-slate-300 uppercase bg-slate-800 px-2 py-1 rounded-lg">{status}</span>
  </div>
)

const SubscriptionsView = () => {
  const [pros, setPros] = useState<any[]>([]);

  React.useEffect(() => {
    // Mock for now, would fetch from supabase.from('profiles').select('*').eq('role', 'professional')
    setPros([
      { id: 1, name: 'Marco Tech', trial_ends_at: new Date(Date.now() + 15 * 86400000).toISOString(), subscription_status: 'trial' },
      { id: 2, name: 'Jose Encanador', trial_ends_at: new Date(Date.now() - 2 * 86400000).toISOString(), subscription_status: 'expired' }
    ]);
  }, []);

  const extendTrial = (id: number, days: number) => {
    alert(`Simulando extensão de ${days} dias para ID: ${id}.`);
  };

  return (
    <div className="p-10 space-y-8 animate-in slide-in-from-right-8 duration-500">
      <h1 className="text-3xl font-black italic tracking-tighter text-white">Assinaturas & Trials</h1>

      <div className="bg-slate-800 rounded-[32px] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="p-6">Profissional</th>
              <th className="p-6">Status</th>
              <th className="p-6">Fim do Trial</th>
              <th className="p-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {pros.map(p => {
              const daysLeft = Math.ceil((new Date(p.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <tr key={p.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="p-6 font-bold text-white">{p.name}</td>
                  <td className="p-6"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg text-[10px] uppercase font-black">{p.subscription_status}</span></td>
                  <td className="p-6 text-slate-400 text-sm">{new Date(p.trial_ends_at).toLocaleDateString()} <span className={daysLeft < 5 ? 'text-rose-500 font-bold' : 'text-slate-500'}>({daysLeft} dias)</span></td>
                  <td className="p-6 flex gap-2">
                    <button onClick={() => extendTrial(p.id, 15)} className="px-3 py-1.5 bg-indigo-600 rounded-lg text-[10px] font-bold uppercase hover:bg-indigo-500">+15 Dias</button>
                    <button onClick={() => extendTrial(p.id, 30)} className="px-3 py-1.5 bg-indigo-600 rounded-lg text-[10px] font-bold uppercase hover:bg-indigo-500">+30 Dias</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}



