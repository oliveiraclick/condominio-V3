
import React from 'react';
import { Card, Button, Badge, Input } from '../components/UI';
import {
  BarChart3, Calendar, MessageSquare, Bell,
  TrendingUp, Users, ChevronRight, ChevronLeft, Plus,
  Grid, User, Clock, Check, X, Phone, UserCircle2, CheckCircle2,
  LogOut, ArrowLeft, Camera, ShieldCheck, UserPlus
} from 'lucide-react';

export const ProfessionalDashboard: React.FC<{
  serviceRequests?: any[];
  activeServices?: any[];
  setActiveServices?: any;
  setServiceRequests?: any;
  onUpdateRequest?: (id: number, status: string) => void;
  rating?: string;
  subscription?: { status: string; trialEndsAt: string };
  currentUser?: any;
  onNavigate?: (tab: string) => void;
}> = ({
  serviceRequests = [],
  activeServices = [],
  setActiveServices,
  setServiceRequests,
  onUpdateRequest,
  rating = '5.0',
  subscription,
  currentUser,
  onNavigate
}) => {

    const daysRemaining = subscription?.trialEndsAt
      ? Math.ceil((new Date(subscription.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const isExpired = daysRemaining <= 0 && subscription?.status === 'trial';
    const kiwifyLink = "https://pay.kiwify.com.br/PRESTADOR-PRO";

    if (isExpired) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center bg-[url('https://images.unsplash.com/photo-1635352684813-2d2bf456104c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>
          <div className="relative z-10 bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full">
            <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg shadow-amber-500/30">🔒</div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Período Grátis Expirou</h2>
            <p className="text-sm text-slate-500 font-medium mt-4 leading-relaxed">
              Sua degustação de 60 dias acabou. Para continuar recebendo chamados e vendendo produtos, assine o plano Pro.
            </p>
            <div className="my-8">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">R$ 29,90</span>
              <span className="text-xs font-bold text-slate-400 uppercase">/mês</span>
            </div>
            <Button fullWidth onClick={() => window.open(kiwifyLink, '_blank')} className="h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-emerald-500/30">
              Assinar Agora
            </Button>
            <p className="text-[10px] text-slate-400 mt-6 font-bold">Pagamento seguro via Kiwify</p>
          </div>
        </div>
      );
    }

    const handleAction = (id: number, action: 'accept' | 'reject') => {
      if (action === 'accept') {
        onUpdateRequest?.(id, 'accepted');
        alert('Serviço aceito! O morador foi notificado.');
      } else {
        onUpdateRequest?.(id, 'rejected');
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 pb-32">
        <div className="p-6">
          <div className="flex justify-between items-center mb-10 pt-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-600 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                <img src={currentUser?.avatar || "https://picsum.photos/seed/pro/100"} className="w-full h-full object-cover" alt="Pro" />
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

          <div className="bg-slate-950 rounded-[48px] mb-12 p-10 text-white shadow-2xl shadow-slate-950/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <BarChart3 size={180} />
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Ganhos em Janeiro</p>
            <h3 className="text-4xl font-black italic tracking-tighter">R$ 2.450,00</h3>

            <div className="grid grid-cols-3 gap-3 mt-10 relative z-10">
              {[
                { icon: <BarChart3 size={20} />, label: 'Ganhos', tab: 'earnings' },
                { icon: <Calendar size={20} />, label: 'Agenda', tab: 'agenda' },
                { icon: <MessageSquare size={20} />, label: 'Perfil', tab: 'profile' },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate?.(btn.tab)}
                  className="flex flex-col items-center gap-2 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-[24px] transition-all active:scale-95 border border-white/5"
                >
                  {btn.icon}
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-500">
            {/* SEÇÃO: SERVIÇOS ATIVOS */}
            {activeServices.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Serviços em Execução ({activeServices.length})</h3>
                <div className="space-y-4">
                  {activeServices.map(s => (
                    <div key={s.id} className="bg-white p-6 rounded-[35px] border border-emerald-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center"><CheckCircle2 size={24} /></div>
                        <div><h5 className="font-bold text-slate-900 leading-none">{s.name}</h5><p className="text-[9px] font-black text-slate-400 uppercase mt-1">{s.user} • {s.location}</p></div>
                      </div>
                      <button className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center active:scale-90"><Phone size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEÇÃO: NOVAS SOLICITAÇÕES */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Novas Solicitações ({serviceRequests.length})</h3>
                <button className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Ver Todas</button>
              </div>

              <div className="space-y-6">
                {serviceRequests.length > 0 ? serviceRequests.map((req) => (
                  <Card key={req.id} className="p-8 border-none shadow-2xl shadow-slate-200/50 rounded-[44px] bg-white space-y-8 group">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center text-violet-500 shadow-inner group-hover:bg-violet-600 group-hover:text-white transition-all">
                          <UserCircle2 size={32} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-950 italic text-xl leading-none truncate max-w-[150px]">{req.name}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{req.user} • {req.location}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase bg-slate-50 px-3 py-1.5 rounded-lg">{req.time}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => handleAction(req.id, 'reject')} className="h-16 rounded-[24px] bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <X size={18} /> Recusar
                      </button>
                      <button onClick={() => handleAction(req.id, 'accept')} className="h-16 rounded-[24px] bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                        <Check size={18} /> Aceitar
                      </button>
                    </div>
                  </Card>
                )) : (
                  <div className="py-24 text-center space-y-4">
                    <Clock className="mx-auto text-slate-100" size={80} />
                    <p className="text-slate-300 font-black italic uppercase tracking-widest text-[10px]">Sem solicitações novas.</p>
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
  const dates = Array.from({ length: 7 }, (_, i) => 20 + i);

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="p-6">
        <div className="flex justify-between items-center mb-10 pt-8">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Minha Agenda</h2>
          <div className="flex gap-2">
            <button className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-all"><ChevronLeft size={20} /></button>
            <button className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="bg-white rounded-[44px] p-8 mb-10 border border-slate-100 shadow-2xl shadow-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black text-slate-900 italic text-xl leading-none">Outubro 2024</h4>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <span key={i} className="text-center text-[10px] text-slate-300 font-black uppercase tracking-widest">{d}</span>
            ))}
            {dates.map((d, i) => (
              <button
                key={i}
                className={`h-12 flex items-center justify-center rounded-[18px] text-sm font-black transition-all ${d === 24 ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/30' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          {activeServices.length > 0 ? activeServices.map((service, idx) => (
            <div key={idx} className="flex gap-6 group">
              <div className="flex flex-col items-center pt-2 min-w-[50px]">
                <span className="text-xs font-black text-violet-600 uppercase italic">Hoje</span>
                <div className="w-px flex-1 bg-gradient-to-b from-violet-200 to-transparent my-4"></div>
              </div>
              <div className="flex-1 bg-violet-600 rounded-[44px] p-10 text-white shadow-2xl shadow-violet-600/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                <Badge color="bg-white/20 text-white font-black italic uppercase text-[9px] px-3 py-1">Confirmado</Badge>
                <h4 className="font-black text-2xl italic tracking-tighter mt-6">{service.name}</h4>
                <p className="text-sm text-violet-100 opacity-80 mt-2 font-medium">{service.user} • {service.location}</p>
                <div className="flex gap-4 mt-8">
                  <button className="w-14 h-14 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors flex items-center justify-center"><Phone size={22} /></button>
                  <button className="flex-1 h-14 bg-white text-violet-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Iniciar Serviço</button>
                </div>
              </div>
            </div>
          )) : (
            <div className="flex gap-6 group">
              <div className="flex flex-col items-center pt-2 min-w-[50px]">
                <span className="text-xs font-black text-violet-600 uppercase italic">10:30</span>
                <div className="w-px flex-1 bg-gradient-to-b from-violet-200 to-transparent my-4"></div>
              </div>
              <div className="flex-1 bg-violet-600 rounded-[44px] p-10 text-white shadow-2xl shadow-violet-600/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                <Badge color="bg-white/20 text-white font-black italic uppercase text-[9px] px-3 py-1">Exemplo</Badge>
                <h4 className="font-black text-2xl italic tracking-tighter mt-6">Manutenção de Ar</h4>
                <p className="text-sm text-violet-100 opacity-80 mt-2 font-medium">Sarah Jones • Bloco A - 402</p>
                <div className="flex gap-4 mt-8">
                  <button className="w-14 h-14 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors flex items-center justify-center"><Phone size={22} /></button>
                  <button className="flex-1 h-14 bg-white text-violet-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Iniciar Serviço</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button className="fixed bottom-32 right-8 w-18 h-18 bg-violet-600 rounded-full flex items-center justify-center shadow-2xl shadow-violet-600/40 text-white border-4 border-white active:scale-90 transition-transform z-50">
          <Plus size={36} strokeWidth={3} />
        </button>
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

// --------------------------------------------------------------------------------
// NOVELTY: Component for Professional Profile View
// --------------------------------------------------------------------------------
export const ProfessionalProfileView: React.FC<{ currentUser: any; onLogout: () => void }> = ({ currentUser, onLogout }) => {
  const [view, setView] = React.useState<'main' | 'account' | 'team' | 'privacy'>('main');

  const ProfileDetailHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
    <header className="p-8 pt-16 flex items-center gap-6 bg-white sticky top-0 z-40">
      <button onClick={onBack} className="w-14 h-14 bg-slate-50 rounded-[24px] flex items-center justify-center active:scale-95 transition-all text-slate-900 shadow-sm border border-slate-100">
        <ArrowLeft size={24} />
      </button>
      <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-950">{title}</h2>
    </header>
  );

  if (view === 'account') {
    return (
      <div className="min-h-screen bg-white pb-32 animate-in slide-in-from-right duration-300">
        <ProfileDetailHeader title="Minha Conta" onBack={() => setView('main')} />
        <div className="p-8 space-y-8">
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-[44px] bg-slate-100 overflow-hidden border-4 border-slate-50 shadow-xl">
                <img src={currentUser?.avatar || "https://picsum.photos/seed/pro/200"} className="w-full h-full object-cover" alt="Avatar" />
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                <Camera size={18} />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome / Empresa</label>
              <Input value={currentUser?.name || ''} readOnly className="h-16 rounded-3xl bg-slate-50/50 border-slate-100 px-6 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">E-mail Profissional</label>
              <Input value={currentUser?.email || ''} readOnly className="h-16 rounded-3xl bg-slate-50/50 border-slate-100 px-6 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Telefone Profissional</label>
              <Input value={currentUser?.phone || ''} readOnly className="h-16 rounded-3xl bg-slate-50/50 border-slate-100 px-6 font-bold" />
            </div>
            <div className="pt-6 border-t border-slate-50">
              <Button fullWidth className="bg-slate-950 text-white h-16 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em]">Salvar Alterações</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'team') {
    return (
      <div className="min-h-screen bg-white pb-32 animate-in slide-in-from-right duration-300">
        <ProfileDetailHeader title="Minha Equipe" onBack={() => setView('main')} />
        <div className="p-8 space-y-10">
          <div className="bg-violet-50 p-8 rounded-[40px] border border-violet-100/50">
            <p className="text-[10px] text-violet-600 font-black uppercase tracking-widest mb-2 leading-none">Status da Equipe</p>
            <h4 className="text-2xl font-black italic tracking-tighter text-slate-900">2 Colaboradores Ativos</h4>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] px-2">Integrantes</h4>
            {[
              { name: currentUser?.name || 'Titular', role: 'Administrador', avatar: currentUser?.avatar },
              { name: 'Ricardo Dias', role: 'Assistente', avatar: 'https://picsum.photos/seed/ricardo/100' },
            ].map((member, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden border border-slate-100 shadow-sm">
                    <img src={member.avatar || `https://picsum.photos/seed/${member.name}/100`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 leading-none">{member.name}</h5>
                    <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest mt-1.5 block">{member.role}</span>
                  </div>
                </div>
                {member.role !== 'Administrador' && (
                  <button className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors">
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
            <button className="w-full p-6 border-2 border-dashed border-slate-100 rounded-[32px] flex items-center justify-center gap-3 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:border-violet-200 hover:text-violet-500 hover:bg-violet-50/50 transition-all">
              <UserPlus size={20} /> Adicionar Colaborador
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'privacy') {
    return (
      <div className="min-h-screen bg-white pb-32 animate-in slide-in-from-right duration-300">
        <ProfileDetailHeader title="Privacidade" onBack={() => setView('main')} />
        <div className="p-8 space-y-10">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] px-2">Segurança e Dados</h4>
            {[
              { title: 'Exibir Portfólio', desc: 'Sua galeria visível para todos os moradores.', checked: true },
              { title: 'Notificações de Agenda', desc: 'Alertas de novos serviços e cancelamentos.', checked: true },
              { title: 'Ocultar Preços', desc: 'Mostrar base de preço apenas sob consulta.', checked: false },
              { title: 'Verificação em 2 Etapas', desc: 'Mais segurança para seus ganhos.', checked: true },
            ].map((opt, i) => (
              <div key={i} className="flex items-center justify-between p-7 bg-slate-50 rounded-[35px] border border-slate-50 transition-all">
                <div className="flex-1 pr-6">
                  <h5 className="font-bold text-slate-900 tracking-tight leading-none mb-2">{opt.title}</h5>
                  <p className="text-[10px] text-slate-400 font-medium uppercase leading-tight tracking-wider">{opt.desc}</p>
                </div>
                <div className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${opt.checked ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${opt.checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-slate-50">
            <Button fullWidth className="bg-rose-50 text-rose-500 h-16 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] border-none">Desativar Cadastro Profissional</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="p-8 pt-16 space-y-12">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-[40px] bg-violet-600 border-4 border-slate-50 shadow-2xl flex items-center justify-center overflow-hidden mx-auto">
              <img src={currentUser?.avatar || "https://picsum.photos/seed/pro/200"} className="w-full h-full object-cover" alt="Profile" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl border-4 border-white shadow-lg">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter text-slate-950 leading-none">{currentUser?.name || "Marco Tech"}</h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="bg-violet-100 text-violet-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl tracking-widest">Plano Pro</span>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl tracking-widest">Verificado</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            { label: 'Informações Pessoais', icon: <User size={20} />, onClick: () => setView('account') },
            { label: 'Minha Equipe', icon: <Users size={20} />, onClick: () => setView('team') },
            { label: 'Configurações e Dados', icon: <ShieldCheck size={20} />, onClick: () => setView('privacy') },
            { label: 'Ajuda e Suporte', icon: <Bell size={20} /> },
          ].map((item, i) => (
            <button key={i} onClick={item.onClick} className="flex items-center justify-between p-7 bg-slate-50 rounded-[35px] hover:bg-violet-50 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-violet-600 shadow-sm transition-colors">
                  {item.icon}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-900 tracking-tight leading-none">{item.label}</h4>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-violet-500 transition-all" />
            </button>
          ))}
        </div>

        <Button onClick={onLogout} fullWidth className="bg-rose-50 text-rose-500 border-none h-16 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
          <LogOut size={20} /> Encerrar Sessão
        </Button>
      </div>
    </div>
  );
};

export const ProfessionalNavigation: React.FC<{ activeTab: string; onChange: (tab: string) => void }> = ({ activeTab, onChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center z-40 max-w-md mx-auto">
      <button onClick={() => onChange('dashboard')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-violet-600 scale-105' : 'text-slate-300 hover:text-slate-500'}`}>
        <Grid size={24} />
      </button>
      <button onClick={() => onChange('agenda')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'agenda' ? 'text-violet-600 scale-105' : 'text-slate-300 hover:text-slate-500'}`}>
        <Calendar size={24} />
      </button>
      <button onClick={() => onChange('services')} className={`w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-900/30 -mt-8 border-4 border-white transition-all active:scale-90 ${activeTab === 'services' ? 'bg-violet-600 ring-4 ring-violet-100' : ''}`}>
        <Plus size={24} strokeWidth={3} />
      </button>
      <button onClick={() => onChange('earnings')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'earnings' ? 'text-violet-600 scale-105' : 'text-slate-300 hover:text-slate-500'}`}>
        <TrendingUp size={24} />
      </button>
      <button onClick={() => onChange('profile')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-violet-600 scale-105' : 'text-slate-300 hover:text-slate-500'}`}>
        <User size={24} />
      </button>
    </div>
  );
};
