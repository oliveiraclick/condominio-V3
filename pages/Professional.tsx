import React, { useState } from 'react';
import { Card, Button, Badge, Input } from '../components/UI';
import {
  BarChart3, Calendar, MessageSquare, Bell,
  TrendingUp, Users, ChevronRight, ChevronLeft, Plus,
  Grid, User, Clock, Check, X, Phone, UserCircle2, CheckCircle2,
  LogOut, ArrowLeft, Camera, ShieldCheck, UserPlus, Store
} from 'lucide-react';

export const ProfessionalDashboard: React.FC<{
  serviceRequests?: any[];
  activeServices?: any[];
  onUpdateRequest?: (id: number, status: string) => void;
  subscription?: { status: string; trialEndsAt: string };
  currentUser?: any;
  onNavigate?: (tab: string) => void;
  setActiveServices?: any;
  setServiceRequests?: any;
  rating?: string;
}> = ({
  serviceRequests = [],
  activeServices = [],
  onUpdateRequest,
  subscription,
  currentUser,
  onNavigate
}) => {

    const daysRemaining = subscription?.trialEndsAt
      ? Math.ceil((new Date(subscription.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const isExpired = daysRemaining <= 0 && subscription?.status === 'trial';
    const kiwifyLink = "https://pay.kiwify.com.br/PRESTADOR-PRO";

    // BLOQUEIO DE ASSINATURA EXPIROU
    if (isExpired) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1635352684813-2d2bf456104c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="relative z-10 bg-white p-10 rounded-[48px] shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-amber-400 rounded-[30px] flex items-center justify-center mx-auto mb-6 text-3xl shadow-xl shadow-amber-500/20">🔒</div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Acesso Bloqueado</h2>
            <p className="text-sm text-slate-500 font-medium mt-4 leading-relaxed">
              Sua degustação gratuita de 60 dias expirou. Assine agora para continuar recebendo serviços.
            </p>
            <div className="my-8 py-6 border-y border-slate-50">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">R$ 29,90</span>
              <span className="text-xs font-bold text-slate-400 uppercase ml-2">/mês</span>
            </div>
            <Button fullWidth onClick={() => window.open(kiwifyLink, '_blank')} className="h-16 bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-emerald-500/30 active:scale-95 transition-all">
              Ativar Plano Pro
            </Button>
          </div>
        </div>
      );
    }

    const handleAction = (id: number, action: 'accept' | 'reject') => {
      onUpdateRequest?.(id, action === 'accept' ? 'accepted' : 'rejected');
      if (action === 'accept') {
        alert('Serviço aceito! O morador foi notificado em tempo real.');
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 pb-32">
        <div className="p-6">
          <div className="flex justify-between items-center mb-10 pt-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-600 border-4 border-white shadow-xl overflow-hidden">
                <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover" alt="Pro" />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Painel Profissional</p>
                <h2 className="font-black text-slate-950 italic tracking-tighter text-xl leading-none">{currentUser?.name || "Prestador"}</h2>
              </div>
            </div>
            <button className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-transform">
              <Bell size={22} />
            </button>
          </div>

          <div className="bg-slate-950 rounded-[48px] mb-12 p-10 text-white shadow-2xl shadow-slate-950/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BarChart3 size={200} />
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Ganhos Disponíveis</p>
            <h3 className="text-4xl font-black italic tracking-tighter">R$ 2.450,00</h3>

            <div className="grid grid-cols-3 gap-3 mt-10">
              {[
                { icon: <BarChart3 size={20} />, label: 'Ganhos', tab: 'earnings' },
                { icon: <Calendar size={20} />, label: 'Agenda', tab: 'agenda' },
                { icon: <UserCircle2 size={20} />, label: 'Perfil', tab: 'profile' },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate?.(btn.tab)}
                  className="flex flex-col items-center gap-2 py-5 bg-white/5 hover:bg-white/10 rounded-[24px] transition-all active:scale-95 border border-white/5"
                >
                  {btn.icon}
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            {/* SERVIÇOS ATIVOS */}
            {activeServices.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Execução ({activeServices.length})</h3>
                <div className="space-y-4">
                  {activeServices.map(s => (
                    <div key={s.id} className="bg-white p-6 rounded-[35px] border border-emerald-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center"><CheckCircle2 size={24} /></div>
                        <div>
                          <h5 className="font-bold text-slate-900 leading-none">{s.name}</h5>
                          <p className="text-[9px] font-black text-slate-400 uppercase mt-1">{s.user} • {s.location}</p>
                        </div>
                      </div>
                      <button className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center active:scale-90"><Phone size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOVAS SOLICITAÇÕES */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Chamados em Aberto</h3>
              <div className="space-y-6">
                {serviceRequests.length > 0 ? serviceRequests.map((req) => (
                  <Card key={req.id} className="p-8 border-none shadow-2xl shadow-slate-200/40 rounded-[44px] bg-white space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center text-violet-500">
                          <UserCircle2 size={32} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-950 italic text-xl leading-none">{req.name}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{req.user} • {req.location}</p>
                        </div>
                      </div>
                      <Badge color="bg-violet-50 text-violet-600">NOVO</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => handleAction(req.id, 'reject')} className="h-16 rounded-[24px] bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest">Recusar</button>
                      <button onClick={() => handleAction(req.id, 'accept')} className="h-16 rounded-[24px] bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Aceitar</button>
                    </div>
                  </Card>
                )) : (
                  <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                    <Clock className="mx-auto text-slate-100 mb-4" size={60} />
                    <p className="text-slate-300 font-black italic uppercase tracking-widest text-[10px]">Aguardando novos chamados...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export const ProfessionalAgenda: React.FC<{ activeServices?: any[] }> = ({ activeServices = [] }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="p-6">
        <header className="flex justify-between items-center mb-10 pt-8">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Minha Agenda</h2>
        </header>

        <div className="bg-white rounded-[44px] p-8 mb-10 border border-slate-100 shadow-xl">
          <h4 className="font-black text-slate-900 italic text-xl mb-8">Outubro 2024</h4>
          <div className="grid grid-cols-7 gap-3">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
              <span key={d} className="text-center text-[10px] text-slate-300 font-black uppercase">{d}</span>
            ))}
            {Array.from({ length: 7 }, (_, i) => 20 + i).map(d => (
              <button key={d} className={`h-12 rounded-2xl flex items-center justify-center font-black ${d === 24 ? 'bg-violet-600 text-white' : 'text-slate-400'}`}>{d}</button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {activeServices.length > 0 ? activeServices.map((s, i) => (
            <div key={i} className="bg-violet-600 rounded-[44px] p-8 text-white shadow-xl">
              <Badge color="bg-white/20 text-white text-[9px]">Confirmado</Badge>
              <h4 className="font-black text-2xl italic mt-4">{s.name}</h4>
              <p className="text-sm opacity-80 mt-1">{s.user} • {s.location}</p>
              <Button className="mt-6 bg-white text-violet-600 w-full h-14 rounded-2xl font-black uppercase text-[10px]">Iniciar Agora</Button>
            </div>
          )) : (
            <p className="text-center text-slate-300 font-bold uppercase text-[10px] py-10 italic">Nenhum compromisso hoje.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProfessionalProfileView: React.FC<{ currentUser: any; onLogout: () => void }> = ({ currentUser, onLogout }) => {
  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="p-8 pt-20 text-center">
        <div className="w-28 h-28 rounded-[40px] bg-violet-600 border-4 border-slate-50 shadow-2xl mx-auto overflow-hidden">
          <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-3xl font-black italic mt-6 text-slate-900">{currentUser?.name || "Marco Tech"}</h2>
        <div className="flex justify-center gap-2 mt-2">
          <Badge color="bg-violet-100 text-violet-600">PLANO PRO</Badge>
          <Badge color="bg-emerald-100 text-emerald-600">VERIFICADO</Badge>
        </div>
      </div>

      <div className="px-8 mt-12 space-y-4">
        {[
          { label: 'Dados da Empresa', icon: <User size={20} /> },
          { label: 'Minha Equipe', icon: <Users size={20} /> },
          { label: 'Segurança', icon: <ShieldCheck size={20} /> },
        ].map((item, i) => (
          <button key={i} className="w-full p-6 bg-slate-50 rounded-[30px] flex items-center justify-between group hover:bg-violet-50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-violet-600 shadow-sm">{item.icon}</div>
              <span className="font-bold text-slate-900">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>
        ))}
        <Button onClick={onLogout} fullWidth className="bg-rose-50 text-rose-500 h-16 rounded-[28px] text-[10px] font-black uppercase mt-8 border-none">Sair da Conta</Button>
      </div>
    </div>
  );
};

export const ProfessionalNavigation: React.FC<{ activeTab: string; onChange: (tab: string) => void }> = ({ activeTab, onChange }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center z-40 max-w-md mx-auto">
    {[
      { id: 'dashboard', icon: <Grid size={24} /> },
      { id: 'agenda', icon: <Calendar size={24} /> },
      { id: 'shop', icon: <Store size={24} /> },
      { id: 'earnings', icon: <TrendingUp size={24} /> },
      { id: 'profile', icon: <User size={24} /> },
    ].map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex items-center justify-center transition-all ${tab.id === 'shop'
          ? 'w-14 h-14 bg-violet-600 text-white rounded-full -mt-10 border-4 border-white shadow-xl'
          : activeTab === tab.id ? 'text-violet-600 scale-110' : 'text-slate-300'
          }`}
      >
        {tab.icon}
      </button>
    ))}
  </div>
);

// --------------------------------------------------------------------------------
// NOVELTY: Component for Managing Shop Products (Mini-Ecommerce)
// --------------------------------------------------------------------------------
export const ProfessionalShop: React.FC<{
  products: any[];
  onAddProduct: (p: any) => void;
  onDeleteProduct: (id: string) => void;
  onToggleStatus: (product: any) => void;
}> = ({ products = [], onAddProduct, onDeleteProduct, onToggleStatus }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ title: '', price: '', desc: '', category: 'Outros' });

  const handleSave = () => {
    if (!form.title || !form.price) return;
    onAddProduct({
      ...form,
      price: parseFloat(form.price.replace(',', '.')),
      image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' // Placeholder for now
    });
    setIsAdding(false);
    setForm({ title: '', price: '', desc: '', category: 'Outros' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="p-6 pt-12">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Meus Produtos</h2>
          <button onClick={() => setIsAdding(true)} className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all">
            <Plus size={24} />
          </button>
        </header>

        {isAdding && (
          <div className="bg-white p-6 rounded-[32px] shadow-xl border border-emerald-100 mb-8 animate-in fade-in slide-in-from-top-4 space-y-4">
            <h4 className="font-bold text-slate-900">Novo Produto</h4>

            <div className="h-40 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
              <Camera size={24} />
              <span className="text-[10px] font-black uppercase mt-2">Adicionar Foto</span>
            </div>

            <input placeholder="Nome do Produto (Ex: Pão Caseiro)" className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />

            <div className="flex gap-4">
              <input placeholder="Preço (Ex: 15,00)" className="flex-1 h-12 bg-slate-50 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              <select className="flex-1 h-12 bg-slate-50 rounded-xl px-4 text-sm font-medium outline-none" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="Outros">Outros</option>
                <option value="Alimentação">Alimentação</option>
                <option value="Artesanato">Artesanato</option>
                <option value="Serviços">Serviços</option>
              </select>
            </div>

            <textarea placeholder="Descrição (Opcional)" className="w-full h-24 bg-slate-50 rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />

            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsAdding(false)} className="flex-1 h-12 rounded-xl text-slate-400 font-bold text-xs uppercase bg-slate-50">Cancelar</button>
              <button onClick={handleSave} className="flex-1 h-12 rounded-xl text-white font-bold text-xs uppercase bg-emerald-600 shadow-lg shadow-emerald-600/20">Criar Produto</button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {products.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex gap-4 items-center group">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden relative">
                <img src={p.image_url} className="w-full h-full object-cover" />
                {!p.available && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-[8px] font-black text-white uppercase">Pausado</span></div>}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 truncate">{p.title}</h4>
                <p className="text-emerald-600 font-black text-sm">R$ {p.price?.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => onToggleStatus(p)} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${p.available ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {p.available ? 'Ativo' : 'Pausado'}
                  </button>
                  <button onClick={() => onDeleteProduct(p.id)} className="w-8 h-8 flex items-center justify-center text-rose-500 bg-rose-50 rounded-lg">
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && !isAdding && (
            <div className="text-center py-20 text-slate-400 font-bold italic text-xs uppercase">
              <Store className="mx-auto mb-4 text-slate-200" size={64} />
              Sua loja está vazia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------------
// NOVELTY: Component for Managing Services
// --------------------------------------------------------------------------------
export const ProfessionalServices: React.FC<{
  services: any[];
  onAddService: (s: any) => void;
  onDeleteService: (id: string) => void;
}> = ({ services = [], onAddService, onDeleteService }) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const [form, setForm] = React.useState({ title: '', category: 'Reparos', desc: '', price_range: '' });

  const handleSave = () => {
    if (!form.title || !form.price_range) return;
    onAddService(form);
    setIsAdding(false);
    setForm({ title: '', category: 'Reparos', desc: '', price_range: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="p-6 pt-12">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Meus Serviços</h2>
          <button onClick={() => setIsAdding(true)} className="w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all">
            <Plus size={24} />
          </button>
        </header>

        {isAdding && (
          <div className="bg-white p-6 rounded-[32px] shadow-xl border border-violet-100 mb-8 animate-in fade-in slide-in-from-top-4 space-y-4">
            <h4 className="font-bold text-slate-900">Novo Serviço</h4>
            <input placeholder="Título (Ex: Eletricista)" className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500/20" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input placeholder="Preço (Ex: R$ 150 - R$ 300)" className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500/20" value={form.price_range} onChange={e => setForm({ ...form, price_range: e.target.value })} />
            <select className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-medium outline-none" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="Reparos">Reparos</option>
              <option value="Eletricista">Eletricista</option>
              <option value="Encanador">Encanador</option>
              <option value="Limpeza">Limpeza</option>
              <option value="Clima">Clima (Ar Condicionado)</option>
              <option value="Pintura">Pintura</option>
              <option value="Jardinagem">Jardinagem</option>
            </select>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsAdding(false)} className="flex-1 h-12 rounded-xl text-slate-400 font-bold text-xs uppercase bg-slate-50">Cancelar</button>
              <button onClick={handleSave} className="flex-1 h-12 rounded-xl text-white font-bold text-xs uppercase bg-violet-600 shadow-lg shadow-violet-600/20">Salvar</button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {services.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center group">
              <div>
                <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest bg-violet-50 px-2 py-1 rounded-lg">{s.category}</span>
                <h4 className="font-bold text-slate-900 mt-2">{s.title}</h4>
                <p className="text-xs text-slate-400 font-medium">{s.price_range}</p>
              </div>
              <button onClick={() => onDeleteService(s.id)} className="w-10 h-10 bg-slate-50 text-rose-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 active:scale-95">
                <X size={18} />
              </button>
            </div>
          ))}
          {services.length === 0 && !isAdding && (
            <div className="text-center py-20 text-slate-400 font-bold italic text-xs uppercase">Você ainda não cadastrou serviços.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------------
// NOVELTY: Component for Professional Earnings
// --------------------------------------------------------------------------------
export const ProfessionalEarnings: React.FC = () => {
  const transactions = [
    { id: 1, service: 'Instalação Elétrica', user: 'Alex F.', amount: 250, date: '05 Jan', status: 'completed' },
    { id: 2, service: 'Reparo Hidráulico', user: 'Clara M.', amount: 180, date: '04 Jan', status: 'completed' },
    { id: 3, service: 'Pintura de Parede', user: 'Roberto S.', amount: 450, date: '02 Jan', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="p-6 pt-12">
        <header className="mb-10 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2">Total Acumulado</p>
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-950 leading-none">R$ 2.450,00</h2>
          <div className="flex justify-center gap-4 mt-8">
            <div className="bg-emerald-50 px-4 py-2 rounded-xl"><p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">+ R$ 880,00 este mês</p></div>
          </div>
        </header>

        <div className="bg-white rounded-[44px] p-8 border border-slate-100 shadow-xl space-y-8">
          <h3 className="font-black text-slate-900 italic text-sm tracking-tight">Últimas Transações</h3>
          <div className="space-y-6">
            {transactions.map(t => (
              <div key={t.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm leading-none">{t.service}</h5>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-1.5">{t.user} • {t.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900 italic tracking-tighter">R$ {t.amount.toFixed(2)}</span>
                  <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${t.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{t.status === 'completed' ? 'Recebido' : 'Pendente'}</p>
                </div>
              </div>
            ))}
          </div>
          <Button fullWidth className="bg-slate-900 text-white h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest italic">Ver Extrato Completo</Button>
        </div>
      </div>
    </div>
  );
};
