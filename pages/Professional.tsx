import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input } from '../components/UI';
import {
  BarChart3, Calendar, MessageSquare, Bell,
  TrendingUp, Users, ChevronRight, ChevronLeft, Plus,
  Grid, User, Clock, Check, X, Phone, UserCircle2, CheckCircle2,
  LogOut, ArrowLeft, Camera, ShieldCheck, UserPlus, Store, Briefcase
} from 'lucide-react';
import { supabase } from '../supabase';

// --- NOTIFICATIONS MODAL ---
const NotificationsModal: React.FC<{ isOpen: boolean; onClose: () => void; userRole: string }> = ({ isOpen, onClose, userRole }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sent_notifications')
      .select('*')
      .or(`target_role.eq.all,target_role.eq.${userRole}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data && !error) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom-8 duration-300 pb-24" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-[40px] z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black italic text-slate-900 tracking-tighter">Notificações</h2>
            <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center active:scale-90 transition-all">
              <X size={20} className="text-slate-600" />
            </button>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
            {notifications.length} mensagens
          </p>
        </div>

        {/* Content with smooth scroll */}
        <div
          className="overflow-y-auto p-6 space-y-4"
          style={{
            maxHeight: 'calc(100vh - 280px)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <style>{`
            .overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold text-sm">Nenhuma notificação</p>
              <p className="text-slate-300 text-xs mt-1">Você está em dia!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="bg-slate-50 p-5 rounded-[28px] border border-slate-100 space-y-3 animate-in slide-in-from-bottom-2 relative group">
                <div className="flex justify-between items-start gap-3">
                  <h4 className="font-black text-slate-900 text-base italic tracking-tight flex-1">{notif.title}</h4>
                  <Badge className={`text-[8px] uppercase px-2 py-1 ${notif.target_role === 'all' ? 'bg-violet-100 text-violet-600' :
                    notif.target_role === 'resident' ? 'bg-blue-100 text-blue-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                    {notif.target_role === 'all' ? 'Geral' : notif.target_role === 'resident' ? 'Moradores' : 'Profissionais'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{notif.body}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Clock size={12} />
                    {new Date(notif.created_at).toLocaleDateString('pt-BR')} às {new Date(notif.created_at).toLocaleTimeString('pt-BR').slice(0, 5)}
                  </div>
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                  >
                    Marcar Lido
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};


// --- HELPER COMPONENT: STAR RATING ---
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex text-amber-400">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className="text-sm">{star <= rating ? '★' : '☆'}</span>
    ))}
  </div>
);

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
  completedServices?: any[];
}> = ({ serviceRequests = [], activeServices = [], onUpdateRequest, subscription, currentUser, onNavigate, setActiveServices, setServiceRequests, rating, completedServices = [] }) => {

  // --- STATE ---
  const [activeTab, setActiveTab] = useState('requests'); // requests, active, wallet, reviews
  const [showNotifications, setShowNotifications] = useState(false);

  // --- CALCULATIONS ---
  const totalEarnings = completedServices.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const completedCount = completedServices.length;
  const daysRemaining = subscription?.trialEndsAt
    ? Math.ceil((new Date(subscription.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const isExpired = daysRemaining <= 0 && subscription?.status === 'trial';
  const kiwifyLink = "https://pay.kiwify.com.br/PRESTADOR-PRO";

  // --- REVIEWS DATA (MOCK FOR NOW, WOULD FETCH REAL) ---
  const [reviews, setReviews] = useState([
    { id: 1, user: 'Ana Maria', rating: 5, comment: 'Excelente profissional! Chegou no horário.', date: 'Ontem' },
    { id: 2, user: 'Dr. Roberto', rating: 4, comment: 'Bom serviço, mas demorou um pouco.', date: '3 dias atrás' }
  ]);
  const averageRating = 4.8;

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
      {/* NOTIFICATIONS MODAL */}
      <NotificationsModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} userRole="professional" />

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pt-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-600 border-4 border-white shadow-xl overflow-hidden">
              <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover" alt="Pro" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Painel Profissional</p>
                {currentUser?.is_verified && <Badge variant="secondary" className="bg-blue-100 text-blue-600 text-[8px] h-4 px-1"><ShieldCheck size={8} className="mr-0.5" /> Verificado</Badge>}
              </div>
              <h2 className="font-black text-slate-950 italic tracking-tighter text-xl leading-none">{currentUser?.name || "Prestador"}</h2>
            </div>
          </div>
          <button onClick={() => setShowNotifications(!showNotifications)} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-transform relative">
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
        </div>

        {/* Trial Banner */}
        {subscription?.status === 'trial' && daysRemaining > 0 && (
          <div className="mb-8 bg-amber-50 border border-amber-100 p-4 rounded-[32px] flex items-center justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
            <div className="pl-4">
              <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Período de Teste</p>
              <h4 className="font-bold text-slate-900 text-sm italic">Restam {daysRemaining} dias grátis</h4>
            </div>
            <Button onClick={() => window.open(kiwifyLink, '_blank')} className="h-10 bg-amber-400 text-amber-950 font-black uppercase text-[10px] rounded-xl px-4 shadow-lg shadow-amber-400/20">
              Assinar Agora
            </Button>
          </div>
        )}

        {/* DASHBOARD TABS */}
        <div className="flex p-1 bg-white rounded-2xl mb-6 shadow-sm border border-slate-100">
          <button onClick={() => setActiveTab('requests')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Novos ({serviceRequests.length})</button>
          <button onClick={() => setActiveTab('active')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Agenda ({activeServices.length})</button>
          <button onClick={() => setActiveTab('wallet')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'wallet' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-400 hover:bg-slate-50'}`}>Carteira</button>
          <button onClick={() => setActiveTab('reviews')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reviews' ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30' : 'text-slate-400 hover:bg-slate-50'}`}>Reput.</button>
        </div>

        {/* CONTENT: WALLET */}
        {activeTab === 'wallet' && (
          <div className="animate-in fade-in zoom-in duration-300 space-y-4">
            <Card className="p-6 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo Total (Estimado)</p>
              <h2 className="text-4xl font-black tracking-tighter mb-4">R$ {totalEarnings.toFixed(2)}</h2>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold uppercase">{completedCount} Serviços Realizados</div>
              </div>
            </Card>
            <h3 className="font-black italic text-slate-900 text-lg mt-6">Histórico Recente</h3>
            {completedServices.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-8">Nenhum serviço finalizado ainda.</p>
            ) : (
              completedServices.map((service, i) => (
                <div key={i} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{service.title || 'Serviço'}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(service.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-emerald-600 font-black">+ R$ {service.price}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* CONTENT: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="animate-in fade-in zoom-in duration-300 space-y-4">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-center">
              <h2 className="text-5xl font-black text-amber-500 tracking-tighter mb-2">{averageRating}</h2>
              <div className="flex justify-center mb-2 text-amber-400 gap-1">
                <StarRating rating={Math.round(averageRating)} />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{reviews.length} Avaliações</p>
            </div>

            <h3 className="font-black italic text-slate-900 text-lg mt-6">Comentários</h3>
            {reviews.map(review => (
              <div key={review.id} className="bg-white p-5 rounded-3xl border border-slate-50 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 text-sm">{review.user}</h4>
                  <span className="text-[10px] text-slate-300 font-bold uppercase">{review.date}</span>
                </div>
                <StarRating rating={review.rating} />
                <p className="text-xs text-slate-500 leading-relaxed">"{review.comment}"</p>
              </div>
            ))}
          </div>
        )}

        {/* CONTENT: REQUESTS & ACTIVE (Keep logic) */}
        {(activeTab === 'requests' || activeTab === 'active') && (
          <div className="space-y-4 mt-6">
            {activeTab === 'requests' && serviceRequests.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><MessageSquare size={24} /></div>
                <p className="text-slate-400 text-xs font-bold uppercase">Nenhum serviço pendente</p>
              </div>
            )}
            {activeTab === 'active' && activeServices.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><Calendar size={24} /></div>
                <p className="text-slate-400 text-xs font-bold uppercase">Agenda vazia</p>
              </div>
            )}

            {(activeTab === 'requests' ? serviceRequests : activeServices).map((request) => (
              <div key={request.id} className={`bg-white p-6 rounded-[32px] border shadow-sm relative overflow-hidden ${request.priority === 'urgent' ? 'border-rose-100' : 'border-slate-50'}`}>
                {request.priority === 'urgent' && <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl">Urgente</div>}
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">
                    {request.type === 'manutencao' ? '🔧' : request.type === 'limpeza' ? '🧹' : '📦'}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg italic tracking-tight">{request.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 mb-4 leading-relaxed">{request.description}</p>
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 mb-4">
                      <Clock size={16} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">{request.date} • {request.time}</span>
                    </div>
                    {activeTab === 'active' ? (
                      <Button variant="secondary" className="w-full bg-emerald-50 text-emerald-600 border-emerald-100 h-10 font-black uppercase text-[10px]">
                        <CheckCircle2 size={16} className="mr-2" /> Em Andamento
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={() => handleAction(request.id, 'reject')} variant="secondary" className="flex-1 bg-slate-100 text-slate-500 border-none font-black uppercase text-[10px] h-10">Recusar</Button>
                        <Button onClick={() => handleAction(request.id, 'accept')} className="flex-1 bg-slate-900 text-white font-black uppercase text-[10px] h-10">Aceitar</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- RESTORED EXPORTS FOR NAVIGATION ---
export const ProfessionalAgenda = () => (
  <div className="p-6">
    <h2 className="text-xl font-black text-slate-900 mb-4">Agenda</h2>
    <p className="text-gray-500">Funcionalidade de Agenda Completa em Breve.</p>
  </div>
);

export const ProfessionalServices = () => (
  <div className="p-6">
    <h2 className="text-xl font-black text-slate-900 mb-4">Meus Serviços</h2>
    <p className="text-gray-500">Gerenciamento de tipos de serviço.</p>
  </div>
);

export const ProfessionalEarnings = () => (
  <div className="p-6">
    <h2 className="text-xl font-black text-slate-900 mb-4">Extrato Financeiro</h2>
    <p className="text-gray-500">Detalhamento de ganhos.</p>
  </div>
);

export const ProfessionalProfileView = ({ currentUser, onLogout }: any) => (
  <div className="p-6">
    <h2 className="text-xl font-black text-slate-900 mb-4">Meu Perfil</h2>
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4 overflow-hidden">
        <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-center font-bold text-lg">{currentUser?.name}</h3>
      <p className="text-center text-slate-400 text-sm">{currentUser?.email}</p>
    </div>
    <Button variant="secondary" onClick={onLogout} className="w-full border-rose-100 text-rose-500">Sair da Conta</Button>
  </div>
);

export const ProfessionalShop = () => (
  <div className="p-6">
    <h2 className="text-xl font-black text-slate-900 mb-4">Loja</h2>
    <p className="text-gray-500">Loja de produtos para profissionais.</p>
  </div>
);

export const ProfessionalNavigation = ({ activeTab, onChange }: any) => {
  const navItems = [
    { id: 'dashboard', icon: Grid, label: 'Início' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'services', icon: Briefcase, label: 'Serviços' },
    { id: 'shop', icon: Store, label: 'Loja' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-5px_30px_rgba(124,58,237,0.15)] border-t border-violet-100 px-6 py-4 flex justify-between items-end z-50 max-w-md mx-auto rounded-t-[32px] mb-0">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? '-translate-y-2' : ''}`}
          >
            <div className={`p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30' : 'text-slate-300 hover:text-slate-600'}`}>
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            {isActive && <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 animate-in fade-in slide-in-from-bottom-2">{item.label}</span>}
          </button>
        );
      })}
    </div>
  );
};
