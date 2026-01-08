import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input } from '../components/UI';
import {
  BarChart3, Calendar, MessageSquare, Bell,
  TrendingUp, Users, ChevronRight, ChevronLeft, Plus,
  Grid, User, Clock, Check, X, Phone, UserCircle2, CheckCircle2,
  LogOut, ArrowLeft, Camera, ShieldCheck, UserPlus, Store, Briefcase, MapPin
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

        {/* QUICK ACCESS (NEW) */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4 ml-1">Acesso Rápido</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate?.('services')}
              className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all hover:border-violet-200 group"
            >
              <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
                <Briefcase size={22} />
              </div>
              <div className="text-center">
                <span className="block font-black text-slate-900 text-xs uppercase mb-0.5">Meus Serviços</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Gerenciar</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate?.('shop')}
              className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all hover:border-violet-200 group"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Store size={22} />
              </div>
              <div className="text-center">
                <span className="block font-black text-slate-900 text-xs uppercase mb-0.5">Minha Loja</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Gerenciar</span>
              </div>
            </button>
          </div>
        </div>

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

export const ProfessionalAgenda = ({ currentUser, serviceRequests, onUpdateRequest }: any) => {
  const [filter, setFilter] = useState('pending');

  const filteredRequests = serviceRequests?.filter((req: any) => {
    if (filter === 'pending') return req.status === 'pending';
    if (filter === 'accepted') return req.status === 'accepted' && req.provider_id === currentUser?.id;
    if (filter === 'completed') return req.status === 'completed' && req.provider_id === currentUser?.id;
    return false;
  }) || [];

  const handleAccept = async (requestId: string) => {
    if (onUpdateRequest) {
      await onUpdateRequest(requestId, 'accept');
    }
  };

  const handleReject = async (requestId: string) => {
    if (onUpdateRequest) {
      await onUpdateRequest(requestId, 'reject');
    }
  };

  const handleComplete = async (requestId: string) => {
    const { error } = await supabase
      .from('service_requests')
      .update({ status: 'completed' })
      .eq('id', requestId);

    if (!error && onUpdateRequest) {
      alert('Serviço marcado como concluído!');
      window.location.reload(); // Refresh to update list
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pendentes', count: serviceRequests?.filter((r: any) => r.status === 'pending').length || 0 },
    { id: 'accepted', label: 'Aceitos', count: serviceRequests?.filter((r: any) => r.status === 'accepted' && r.provider_id === currentUser?.id).length || 0 },
    { id: 'completed', label: 'Concluídos', count: serviceRequests?.filter((r: any) => r.status === 'completed' && r.provider_id === currentUser?.id).length || 0 }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <header className="p-6 pt-12 bg-white border-b border-slate-100 sticky top-0 z-40">
        <h2 className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter">Agenda</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Solicitações de serviço</p>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-6 flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`py-4 px-4 font-black text-xs uppercase tracking-wider transition-all relative ${filter === tab.id
              ? 'text-violet-600'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] font-black ${filter === tab.id ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'
                }`}>
                {tab.count}
              </span>
            )}
            {filter === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600"></div>
            )}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold text-sm">Nenhuma solicitação</p>
            <p className="text-slate-300 text-xs mt-1">
              {filter === 'pending' && 'Aguardando novas solicitações'}
              {filter === 'accepted' && 'Nenhum serviço aceito ainda'}
              {filter === 'completed' && 'Nenhum serviço concluído'}
            </p>
          </div>
        ) : (
          filteredRequests.map((request: any) => (
            <div key={request.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-black text-slate-900 text-base italic tracking-tight">{request.title}</h4>
                  <p className="text-[10px] font-bold text-violet-600 uppercase bg-violet-50 px-2 py-1 rounded-full inline-block mt-1">
                    {request.category}
                  </p>
                </div>
                <Badge className={`text-[8px] uppercase px-2 py-1 ${request.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                  request.status === 'accepted' ? 'bg-blue-100 text-blue-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                  {request.status === 'pending' ? 'Pendente' :
                    request.status === 'accepted' ? 'Aceito' : 'Concluído'}
                </Badge>
              </div>

              {request.description && (
                <p className="text-xs text-slate-500">{request.description}</p>
              )}

              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1">
                  <UserCircle2 size={12} />
                  <span>{request.profiles?.name || 'Morador'}</span>
                </div>
                {request.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{request.location}</span>
                  </div>
                )}
              </div>

              {request.scheduled_date && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock size={14} />
                  <span className="font-bold">
                    {new Date(request.scheduled_date).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(request.scheduled_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {/* Actions */}
              {request.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="flex-1 h-10 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Aceitar
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="flex-1 h-10 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Recusar
                  </button>
                </div>
              )}

              {request.status === 'accepted' && (
                <button
                  onClick={() => handleComplete(request.id)}
                  className="w-full h-10 bg-violet-50 text-violet-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-violet-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Marcar como Concluído
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const ProfessionalServices = ({ currentUser }: any) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price_range: ''
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('professional_services')
      .select('*')
      .eq('provider_id', currentUser?.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setServices(data);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.category) {
      alert('Preencha título e categoria');
      return;
    }

    const serviceData = {
      ...formData,
      provider_id: currentUser?.id
    };

    if (editingService) {
      const { error } = await supabase
        .from('professional_services')
        .update(serviceData)
        .eq('id', editingService.id);

      if (!error) {
        alert('Serviço atualizado!');
        loadServices();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('professional_services')
        .insert([serviceData]);

      if (!error) {
        alert('Serviço cadastrado!');
        loadServices();
        resetForm();
      }
    }
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      category: service.category,
      description: service.description || '',
      price_range: service.price_range || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este serviço?')) return;

    const { error } = await supabase
      .from('professional_services')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Serviço excluído!');
      loadServices();
    }
  };

  const toggleActive = async (service: any) => {
    const { error } = await supabase
      .from('professional_services')
      .update({ active: !service.active })
      .eq('id', service.id);

    if (!error) {
      loadServices();
    }
  };

  const resetForm = () => {
    setFormData({ title: '', category: '', description: '', price_range: '' });
    setEditingService(null);
    setShowForm(false);
  };

  const categories = ['Eletricista', 'Encanador', 'Limpeza', 'Jardinagem', 'Pintura', 'Manutenção', 'Beleza', 'Tecnologia', 'Outros'];

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <header className="p-6 pt-12 bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter">Meus Serviços</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{services.length} serviços</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      <div className="p-6 space-y-4">
        {/* Formulário */}
        {showForm && (
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl space-y-4 animate-in slide-in-from-top-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black italic text-slate-900 uppercase">{editingService ? 'Editar' : 'Novo'} Serviço</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <Input
              placeholder="Nome do serviço"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-14 rounded-2xl"
            />

            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-4 font-bold text-sm outline-none focus:border-emerald-500"
            >
              <option value="">Selecione a categoria</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <textarea
              placeholder="Descrição detalhada do serviço"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium outline-none focus:border-emerald-500 resize-none"
            />

            <Input
              placeholder="Faixa de preço (ex: R$ 50 - R$ 150)"
              value={formData.price_range}
              onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
              className="h-14 rounded-2xl"
            />

            <Button
              fullWidth
              onClick={handleSubmit}
              className="h-14 bg-emerald-600 text-white rounded-2xl uppercase font-black text-xs tracking-widest shadow-xl shadow-emerald-600/30"
            >
              {editingService ? 'Atualizar' : 'Cadastrar'} Serviço
            </Button>
          </div>
        )}

        {/* Lista de Serviços */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold text-sm">Nenhum serviço cadastrado</p>
            <p className="text-slate-300 text-xs mt-1">Clique no + para adicionar</p>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-black text-slate-900 text-base italic tracking-tight">{service.title}</h4>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-full inline-block mt-1">{service.category}</p>
                </div>
                <Badge className={`text-[8px] uppercase px-2 py-1 ${service.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {service.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              {service.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{service.description}</p>
              )}

              {service.price_range && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-700">{service.price_range}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => toggleActive(service)}
                  className="flex-1 h-10 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-100 active:scale-95 transition-all"
                >
                  {service.active ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 h-10 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 active:scale-95 transition-all"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="h-10 px-4 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-100 active:scale-95 transition-all"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const ProfessionalEarnings = () => (
  <div className="p-6">
    <h2 className="text-xl font-black text-slate-900 mb-4">Extrato Financeiro</h2>
    <p className="text-gray-500">Detalhamento de ganhos.</p>
  </div>
);

export const ProfessionalProfileView = ({ currentUser, onLogout }: any) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    category: currentUser?.category || '',
    description: currentUser?.description || ''
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase.from('profiles').update({ avatar: data.publicUrl }).eq('id', currentUser.id);
      if (updateError) throw updateError;

      alert('Foto atualizada!');
      window.location.reload();
    } catch (error: any) {
      alert('Erro ao atualizar foto: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({
        name: formData.name,
        phone: formData.phone,
        category: formData.category,
        description: formData.description
      }).eq('id', currentUser.id);

      if (error) throw error;
      alert('Perfil atualizado com sucesso!');
      window.location.reload();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 pb-32">
      <h2 className="text-xl font-black text-slate-900 mb-6">Meu Perfil</h2>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 mb-6 flex flex-col items-center">
        <div
          className="w-32 h-32 rounded-[40px] border-4 border-slate-50 shadow-xl overflow-hidden mb-4 relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
          {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>}
        </div>
        <button onClick={() => fileInputRef.current?.click()} className="text-violet-600 font-bold text-xs uppercase bg-violet-50 px-4 py-2 rounded-lg active:scale-95 transition-transform" disabled={uploading}>
          {uploading ? 'Enviando...' : 'Alterar Foto'}
        </button>
        <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4 mb-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome / Empresa</label>
          <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-14 font-medium" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoria</label>
          <select
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-14 bg-slate-50 rounded-2xl px-4 font-bold text-slate-600 border-none outline-none focus:ring-2 focus:ring-emerald-100"
          >
            {['Manutenção', 'Limpeza', 'Beleza', 'Tecnologia', 'Reformas', 'Outros'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Telefone</label>
          <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="h-14 font-medium" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email</label>
          <Input value={currentUser?.email} readOnly className="h-14 font-medium bg-slate-50 text-slate-400" />
        </div>
      </div>

      <div className="space-y-4">
        <Button fullWidth onClick={handleSave} disabled={loading} className="h-16 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-[24px]">
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
        <Button variant="secondary" onClick={onLogout} className="w-full border-rose-100 text-rose-500 h-16 bg-white rounded-[24px]">Sair da Conta</Button>
      </div>
    </div>
  );
};

export const ProfessionalShop = ({ currentUser }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Outros',
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', currentUser?.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser?.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      setImageFile(file);
    } catch (error: any) {
      alert('Erro ao fazer upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price) {
      alert('Preencha título e preço');
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      vendor_id: currentUser?.id
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (!error) {
        alert('Produto atualizado!');
        loadProducts();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (!error) {
        alert('Produto cadastrado!');
        loadProducts();
        resetForm();
      }
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Produto excluído!');
      loadProducts();
    }
  };

  const toggleAvailability = async (product: any) => {
    const { error } = await supabase
      .from('products')
      .update({ available: !product.available })
      .eq('id', product.id);

    if (!error) {
      loadProducts();
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', price: '', category: 'Outros', image_url: '' });
    setEditingProduct(null);
    setShowForm(false);
    setImageFile(null);
  };

  const categories = ['Alimentos', 'Artesanato', 'Serviços', 'Outros'];

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <header className="p-6 pt-12 bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter">Minha Loja</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{products.length} produtos</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/30 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      <div className="p-6 space-y-4">
        {/* Formulário */}
        {showForm && (
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl space-y-4 animate-in slide-in-from-top-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black italic text-slate-900 uppercase">{editingProduct ? 'Editar' : 'Novo'} Produto</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <Input
              placeholder="Nome do produto"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-14 rounded-2xl"
            />

            <textarea
              placeholder="Descrição (opcional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium outline-none focus:border-violet-500 resize-none"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Preço (R$)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="h-14 rounded-2xl"
              />

              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-14 bg-slate-50 border border-slate-200 rounded-2xl px-4 font-bold text-sm outline-none focus:border-violet-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Upload de Imagem */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Foto do Produto</label>
              <div className="relative">
                {formData.image_url ? (
                  <div className="relative">
                    <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover rounded-2xl" />
                    <button
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 active:scale-95 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-violet-400 transition-all bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-bold text-slate-400">Enviando...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Camera size={32} className="text-slate-300" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clique para adicionar foto</span>
                      </div>
                    )}
                  </label>
                )}
              </div>
            </div>

            <Button
              fullWidth
              onClick={handleSubmit}
              className="h-14 bg-violet-600 text-white rounded-2xl uppercase font-black text-xs tracking-widest shadow-xl shadow-violet-600/30"
            >
              {editingProduct ? 'Atualizar' : 'Cadastrar'} Produto
            </Button>
          </div>
        )}

        {/* Lista de Produtos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold text-sm">Nenhum produto cadastrado</p>
            <p className="text-slate-300 text-xs mt-1">Clique no + para adicionar</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                {product.image_url && (
                  <img src={product.image_url} alt={product.title} className="w-20 h-20 rounded-2xl object-cover bg-slate-100" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-black text-slate-900 text-base italic tracking-tight">{product.title}</h4>
                    <Badge className={`text-[8px] uppercase px-2 py-1 ${product.available ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {product.available ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </div>
                  {product.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-black text-violet-600">R$ {product.price.toFixed(2)}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-full">{product.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleAvailability(product)}
                  className="flex-1 h-10 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-100 active:scale-95 transition-all"
                >
                  {product.available ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 h-10 bg-violet-50 text-violet-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-violet-100 active:scale-95 transition-all"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="h-10 px-4 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-100 active:scale-95 transition-all"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

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
