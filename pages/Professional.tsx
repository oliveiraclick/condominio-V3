import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge, Input, useToast } from '../components/ui';
import { MuralSkeleton, LeadsSkeleton } from '../components/skeletons';
import {
  BarChart3, Calendar, MessageSquare, Bell,
  TrendingUp, Users, ChevronRight, ChevronLeft, Plus,
  Grid, User, Clock, Check, X, Phone, UserCircle2, CheckCircle2, UserCog,
  Megaphone, MessageCircle, UserCheck, Sparkles,
  LogOut, ArrowLeft, Camera, ShieldCheck, UserPlus, Store, Briefcase, MapPin, Zap, BadgePercent, BookOpen, Star, Wallet, DollarSign, TrendingDown, Menu, Building2
} from 'lucide-react';
import { supabase } from '../supabase';
import { AppFeedbackModal } from '../components/AppFeedbackModal';

// --- NOTIFICATIONS MODAL ---
export const NotificationsModal: React.FC<{ isOpen: boolean; onClose: () => void; userRole?: string; onUpdate?: () => void }> = ({ isOpen, onClose, userRole, onUpdate }) => {
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
      .from('my_unread_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    // Optimistic UI
    setNotifications(prev => prev.filter(n => n.id !== id));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('notification_reads').insert({
        notification_id: id,
        user_id: user.id
      });
      if (error) console.error("Error marking read:", error);
      if (onUpdate) onUpdate();
    }
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
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
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
                  <Badge className={`text-[8px] uppercase px-2 py-1 ${notif.target_role === 'all' ? 'bg-brand-100 text-brand-600' :
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

// --- COMPONENTE COMPARTILHADO: MODAL DE COMPLETAR PERFIL ---
const ProfileCompletionModal: React.FC<{ isOpen: boolean; onClose: () => void; userId: string }> = ({ isOpen, onClose, userId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cpf: '',
    company_name: '',
    company_address: '',
    description: ''
  });

  useEffect(() => {
    if (userId && isOpen) {
      loadProfile();
    }
  }, [userId, isOpen]);

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setFormData({
        cpf: data.cpf || '',
        company_name: data.company_name || '',
        company_address: data.company_address || '',
        description: data.description || ''
      });
    }
  };

  const handleSave = async () => {
    if (!formData.cpf || !formData.company_name) {
      alert('Por favor, preencha o CPF e o Nome da Empresa.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('profiles').update(formData).eq('id', userId);
    if (!error) {
      alert('Perfil atualizado com sucesso!');
      onClose();
      // Optional: trigger reload or callback
      if (window.location.hash.includes('services')) window.location.reload();
    } else {
      alert('Erro ao salvar: ' + error.message);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-8 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} />
          </div>
          <h2 className="text-xl font-black italic uppercase text-slate-900 leading-none">Complete seu Perfil</h2>
          <p className="text-xs text-slate-500 mt-2">Para cadastrar serviços ou produtos, precisamos de alguns dados adicionais.</p>
        </div>
        <div className="space-y-4">
          <Input placeholder="Seu CPF" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} className="h-14" />
          <Input placeholder="Nome da Empresa / Fantasia" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} className="h-14" />
          <Input placeholder="Endereço Comercial" value={formData.company_address} onChange={e => setFormData({ ...formData, company_address: e.target.value })} className="h-14" />

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest">Bio / Apresentação</label>
            <textarea
              placeholder="Fale sobre você ou sua empresa..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-32 bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium resize-none outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-600"
            />
          </div>

          <Button fullWidth onClick={handleSave} disabled={loading} className="h-14 bg-slate-900 text-white font-black uppercase text-xs tracking-widest mt-2">{loading ? 'Salvando...' : 'Salvar Perfil'}</Button>
        </div>
      </div>
    </div>
  );
};

const ProposalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  demand: any;
  currentUser: any;
  onSubmit: () => void;
}> = ({ isOpen, onClose, demand, currentUser, onSubmit }) => {
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!message) {
      alert('Por favor, escreva uma mensagem para sua proposta.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('service_proposals').insert([{
      demand_id: demand.id,
      professional_id: currentUser.id,
      price: price ? parseFloat(price) : null,
      message,
      status: 'pending'
    }]);

    if (!error) {
      alert('Proposta enviada com sucesso!');
      onSubmit();
      onClose();
    } else {
      if (error.code === '23505') {
        alert('Você já enviou uma proposta para esta demanda.');
      } else {
        alert('Erro ao enviar proposta: ' + error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-[24px] flex items-center justify-center mx-auto mb-2 shadow-lg shadow-brand-600/10">
            <Megaphone size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter">Enviar Proposta</h3>
          <p className="text-sm text-slate-500">Para: <span className="font-bold text-slate-900">{demand.profiles?.name}</span> • {demand.category}</p>

          <div className="space-y-4 py-4">
            <div className="text-left">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest">Preço Sugerido (Opcional)</label>
              <Input
                type="number"
                placeholder="R$ 0,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900"
              />
            </div>
            <div className="text-left">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block tracking-widest">Sua Mensagem</label>
              <textarea
                placeholder="Explique como você pode ajudar..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-32 bg-slate-50 border-none rounded-2xl p-6 text-sm font-medium resize-none outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-600"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            fullWidth
            className="h-14 bg-brand-600 text-white font-black uppercase tracking-widest shadow-xl shadow-brand-600/30 active:scale-95 transition-all"
          >
            {loading ? 'Enviando...' : 'Confirmar Proposta'}
          </Button>
          <button onClick={onClose} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const MuralOpportunities: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'my_category' | 'all'>('my_category');
  const [selectedDemand, setSelectedDemand] = useState<any>(null);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const { showToast } = useToast();

  const [myProposals, setMyProposals] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDemands();
    loadMyProposals();
  }, [filter, currentUser]);

  const loadMyProposals = async () => {
    if (!currentUser?.id) return;
    const { data } = await supabase.from('service_proposals').select('demand_id').eq('professional_id', currentUser.id);
    if (data) {
      setMyProposals(new Set(data.map(p => p.demand_id)));
    }
  };

  const loadDemands = async () => {
    setLoading(true);
    let query = supabase
      .from('service_demands')
      .select('*, profiles:resident_id(name, avatar, phone)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    // STRICT FILTER: Only show demands from the professional's category
    if (currentUser?.category) {
      query = query.eq('category', currentUser.category);
    } else {
      // If no category is set, show nothing (or handle specially)
      // For now, we'll let it show all but the UI will warn them
      // actually, let's play safe and show nothing to encourage profile completion
      setDemands([]);
      setLoading(false);
      return;
    }

    const { data } = await query;
    if (data) setDemands(data);
    setLoading(false);
  };

  const handleContact = (demand: any) => {
    const phone = demand.profiles?.phone;
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá ${demand.profiles.name}, vi seu pedido de *${demand.category}* no Mural do condomínio e posso te ajudar!`);
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    } else {
      showToast('Telefone do morador não disponível.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest ml-1">Mural de Oportunidades</h3>
        {currentUser?.category && (
          <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-brand-600 text-white shadow-md shadow-brand-600/20">
            {currentUser.category}
          </span>
        )}
      </div>

      {loading ? (
        <MuralSkeleton />
      ) : demands.length === 0 ? (
        <div className="bg-white p-8 rounded-[24px] shadow-sm text-center">
          <Megaphone size={24} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            {!currentUser?.category ? "Perfil Incompleto" : "Nenhuma oportunidade"}
          </p>
          <p className="text-slate-300 text-[10px] mt-1">
            {!currentUser?.category
              ? "Para ver demandas, atualize seu perfil com sua categoria de serviço."
              : "Avise moradores que você está online!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {demands.map((demand, index) => {
            const hasProposal = myProposals.has(demand.id);
            return (
              <div key={demand.id} style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }} className={`bg-white p-5 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 animate-in slide-in-from-right-4 fade-in ${hasProposal ? 'bg-brand-50/50 shadow-brand-100 ring-1 ring-brand-100' : 'bg-white'}`}>
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img src={demand.profiles?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${demand.profiles?.name}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm italic leading-none">{demand.profiles?.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[9px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded-full inline-block">{demand.category}</p>
                          {hasProposal && (
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check size={8} /> Enviada
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[8px] font-bold text-slate-300 uppercase shrink-0">{new Date(demand.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mb-4 italic">"{demand.description}"</p>

                {hasProposal ? (
                  <button
                    disabled
                    className="w-full h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border border-emerald-100 cursor-not-allowed opacity-80"
                  >
                    <CheckCircle2 size={16} />
                    Proposta Enviada
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedDemand(demand);
                      setProposalModalOpen(true);
                    }}
                    className="w-full h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all active:scale-95"
                  >
                    <Zap size={16} />
                    Enviar Proposta
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedDemand && (
        <ProposalModal
          isOpen={proposalModalOpen}
          onClose={() => {
            setProposalModalOpen(false);
            setSelectedDemand(null);
          }}
          demand={selectedDemand}
          currentUser={currentUser}
          onSubmit={() => {
            loadDemands();
            loadMyProposals();
          }}
        />
      )}
    </div>
  );
};

const LeadsCRM: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadLeads();
  }, [currentUser]);

  const loadLeads = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('professional_leads')
      .select('*, profiles:resident_id(name, avatar, unit, tower)')
      .eq('professional_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (data) setLeads(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest ml-1">Meus Leads (CRM)</h3>
        <button onClick={loadLeads} className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
          <Zap size={16} />
        </button>
      </div>

      {loading ? (
        <LeadsSkeleton />
      ) : leads.length === 0 ? (
        <div className="bg-white p-12 rounded-[24px] shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck size={32} className="text-slate-200" />
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed">Nenhuma interação registrada ainda.</p>
          <p className="text-slate-300 text-[10px] mt-2">Fique 'No Condomínio' para atrair mais clientes!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead, index) => {
            const isAuction = lead.source === 'proposal_accepted';
            return (
              <div key={lead.id} style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }} className="bg-white p-5 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 animate-in slide-in-from-right-4 fade-in group bg-white ring-1 ring-slate-50 hover:ring-brand-100">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
                  <img src={lead.profiles?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.profiles?.name}`} className="w-full h-full object-cover" />
                  <div className={`absolute bottom-0 inset-x-0 h-1 ${isAuction ? 'bg-brand-500' : 'bg-emerald-500'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm italic leading-none">{lead.profiles?.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Unidade {lead.profiles?.unit || '---'} {lead.profiles?.tower || ''}</p>
                    </div>
                    <span className="text-[8px] font-bold text-slate-300 uppercase shrink-0">{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isAuction ? 'bg-brand-50 text-brand-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {isAuction ? 'Leilão Vencido' : 'WhatsApp Direto'}
                    </span>
                    <button
                      onClick={() => window.open(`https://wa.me/55${lead.profiles?.phone?.replace(/\D/g, '')}`, '_blank')}
                      className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition-colors"
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

// --- DASHBOARD DO PROFISSIONAL ---
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
  const [activeTab, setActiveTab] = useState('requests');
  const [showNotifications, setShowNotifications] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(rating || '5.0');
  const [guideCards, setGuideCards] = useState<any[]>([]);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [isOnSite, setIsOnSite] = useState(currentUser?.is_on_site || false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    checkUnread();
  }, []);

  const checkUnread = async () => {
    const { count } = await supabase.from('my_unread_notifications').select('*', { count: 'exact', head: true });
    setUnreadCount(count || 0);
  };

  const handleScrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 240;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    loadGuideCards();
  }, []);

  const loadGuideCards = async () => {
    setLoadingGuide(true);
    const { data } = await supabase.from('pro_guide_cards').select('*').eq('active', true).order('sort_order', { ascending: true });
    if (data) setGuideCards(data);
    setLoadingGuide(false);
  };

  useEffect(() => {
    if (activeTab === 'reviews' && currentUser?.id) {
      supabase.from('reviews')
        .select('*, profiles:reviewer_id(name, avatar)')
        .eq('target_id', currentUser.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) {
            setReviews(data);
            const avg = data.reduce((acc, curr) => acc + curr.rating, 0) / (data.length || 1);
            setAvgRating(data.length ? avg.toFixed(1) : '5.0');
          }
        });
    }
  }, [activeTab, currentUser]);

  const hasInteracted = useRef(false);

  useEffect(() => {
    // Only sync from prop if user hasn't interacted locally to avoid stale overwrites
    if (!hasInteracted.current && currentUser?.is_on_site !== undefined) {
      setIsOnSite(currentUser.is_on_site);
    }
  }, [currentUser?.is_on_site]);

  // --- CALCULATIONS ---
  const totalEarnings = completedServices.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const completedCount = completedServices.length;
  const daysRemaining = subscription?.trialEndsAt
    ? Math.ceil((new Date(subscription.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const isExpired = daysRemaining <= 0 && subscription?.status === 'trial';
  const kiwifyLink = "https://pay.kiwify.com.br/6CblNjX";

  // --- REVIEWS DATA (FETCHED FROM DB) ---
  // Mock removed in favor of real data fetching above

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
      showToast('Serviço aceito! O morador foi notificado.', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 pt-24">
      {/* NOTIFICATIONS MODAL */}
      <NotificationsModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} userRole="professional" onUpdate={checkUnread} />

      <div className="p-6">
        {/* Header */}
        {/* Status Dashboard Header */}
        <div className="flex justify-between items-center mb-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[24px] bg-white border-2 border-slate-100 shadow-xl overflow-hidden p-1">
              <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover rounded-[18px]" alt="Pro" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Painel Pro Prestador</p>
                {currentUser?.is_verified && <Badge variant="secondary" className="bg-blue-100 text-blue-600 text-[8px] h-4 px-1"><ShieldCheck size={8} className="mr-0.5" /> Verificado</Badge>}
              </div>
              <h2 className="font-black text-slate-950 italic tracking-tighter text-2xl leading-none">{currentUser?.name || "Prestador"}</h2>
            </div>
          </div>

          <button onClick={() => setShowNotifications(!showNotifications)} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-transform relative">
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
        </div>

        {/* VISIBILIDADE EM DESTAQUE (PROMOTED) */}
        <div className={`mb-8 p-6 rounded-[32px] border-2 transition-all flex items-center justify-between shadow-lg ${isOnSite ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isOnSite ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-400'}`}>
              <Zap size={24} className={isOnSite ? 'animate-pulse' : ''} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status Presencial</p>
              <h4 className={`font-black uppercase text-xs italic ${isOnSite ? 'text-emerald-700' : 'text-slate-900'}`}>
                {isOnSite ? 'Você está No Condomínio!' : 'Você está no Condomínio agora?'}
              </h4>
            </div>
          </div>
          <button
            onClick={async () => {
              hasInteracted.current = true; // Lock local state against stale props
              const newState = !isOnSite;
              setIsOnSite(newState); // Instant UI feedback
              try {
                const { error } = await supabase.from('profiles').update({ is_on_site: newState }).eq('id', currentUser.id);

                // NOTIFICAÇÃO AUTOMÁTICA (MARKETING HI-LOCAL)
                // Gerada via Database Trigger "on_professional_online"

                if (error) {
                  setIsOnSite(!newState); // Rollback on error
                  console.error('Erro ao atualizar status:', error);
                }
              } catch (e) {
                setIsOnSite(!newState); // Rollback on catch
                console.error(e);
              }
            }}
            className={`w-14 h-8 rounded-full transition-all flex items-center px-1.5 ${isOnSite ? 'bg-emerald-500' : 'bg-slate-200'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isOnSite ? 'translate-x-6' : 'translate-x-0'}`}></div>
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

        {/* PERFORMANCE SECTION */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4 ml-1">Performance (Últimos 30 dias)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Perfil Visto</p>
              <span className="text-2xl font-black text-slate-900 italic tracking-tighter">{currentUser?.views_count || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliques Whats</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-slate-900 italic tracking-tighter">48</span>
                <span className="text-[10px] text-emerald-500 font-bold mb-1">+5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* MURAL DE OPORTUNIDADES (NEW) */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <MuralOpportunities currentUser={currentUser} />
        </div>

        {/* GUIA DO PRESTADOR (DYNAMIC) */}
        <div className="mb-8 relative group">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-widest">Guia do Prestador</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleScrollCarousel('left')}
                className="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 active:scale-90 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => handleScrollCarousel('right')}
                className="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 active:scale-90 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
          >
            {loadingGuide ? (
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
              </div>
            ) : guideCards.length > 0 ? (
              guideCards.map((card) => {
                const Icons: any = { Zap, BadgePercent, Store, Briefcase, BookOpen, Star };
                const IconComponent = Icons[card.icon_name] || BookOpen;

                return (
                  <div key={card.id} className={`min-w-[220px] ${card.bg_color || 'bg-white'} p-5 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:shadow-md`}>
                    <div className={`w-8 h-8 ${card.icon_bg_color || 'bg-slate-100'} ${card.icon_color || 'text-slate-600'} rounded-xl flex items-center justify-center mb-3`}>
                      <IconComponent size={16} />
                    </div>
                    <h4 className={`${card.text_color || 'text-slate-900'} font-black italic uppercase text-xs tracking-tight mb-2`}>{card.title}</h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed">{card.description}</p>
                  </div>
                );
              })
            ) : (
              <div className="text-[10px] font-bold text-slate-300 uppercase py-4">Nenhuma dica disponível</div>
            )}
          </div>
        </div>

        {/* QUICK ACCESS */}
        <div className="mb-10">
          <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4 ml-1">Gerenciamento</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate?.('services')}
              className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center gap-4 active:scale-95 transition-all group"
            >
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-[22px] flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Briefcase size={26} />
              </div>
              <div className="text-center">
                <span className="block font-black text-slate-900 text-sm uppercase mb-1">Meus Serviços</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ajustar Perfil</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate?.('shop')}
              className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center gap-4 active:scale-95 transition-all group"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[22px] flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Store size={26} />
              </div>
              <div className="text-center">
                <span className="block font-black text-slate-900 text-sm uppercase mb-1">Minha Loja</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produtos E-Shop</span>
              </div>
            </button>
          </div>
        </div>

        {/* DASHBOARD TABS (SIMPLIFIED TO REPUTATION & WALLET) */}
        <div className="flex p-1.5 bg-white rounded-3xl mb-8 shadow-sm border border-slate-100">
          <button onClick={() => setActiveTab('reviews')} className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reviews' ? 'bg-amber-400 text-white shadow-lg' : 'text-slate-400'}`}>Reputação</button>
          <button onClick={() => setActiveTab('wallet')} className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'wallet' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>Faturamento</button>
        </div>

        {/* CONTENT: WALLET */}
        {activeTab === 'wallet' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
            <Card className="p-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden rounded-[40px]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Faturamento via Plataforma</p>
              <h2 className="text-5xl font-black tracking-tighter mb-4 italic">R$ {totalEarnings.toFixed(2)}</h2>
              <div className="flex gap-2">
                <div className="px-4 py-1.5 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest">{completedCount} Serviços Finalizados</div>
              </div>
            </Card>
          </div>
        )}

        {/* CONTENT: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center">
              <h2 className="text-6xl font-black text-amber-500 tracking-tighter mb-2 italic">{avgRating}</h2>
              <div className="flex justify-center mb-3 text-amber-400 gap-1.5">
                <StarRating rating={Math.round(parseFloat(avgRating))} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{reviews.length} Depoimentos</p>
            </div>
          </div>
        )}

        {/* CRM DE LEADS (NEW) */}
        <div className="mt-8 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <LeadsCRM currentUser={currentUser} />
        </div>

        {/* FEEDBACK TRIGGER CARD */}
        <div className="mb-12">
          <Card
            onClick={() => setFeedbackOpen(true)}
            className="p-8 border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[40px] shadow-2xl shadow-slate-900/20 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-500/30 transition-all duration-700"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-brand-400 shadow-inner">
                <Sparkles size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none mb-2">💡 Sugestões para o App</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Sua ideia pode ser a próxima funcionalidade do sistema!</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-brand-500 transition-all">
                <ChevronRight size={20} />
              </div>
            </div>
          </Card>
        </div>

        {/* FEEDBACK MODAL */}
        <AppFeedbackModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          currentUser={currentUser}
          userRole="professional"
        />
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
    <div className="min-h-screen bg-[#fcfcfd] pb-32 pt-24">
      <header className="p-6 pt-0 bg-white border-b border-slate-100 sticky top-24 z-40">
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
              ? 'text-brand-600'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] font-black ${filter === tab.id ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'
                }`}>
                {tab.count}
              </span>
            )}
            {filter === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"></div>
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
                  <p className="text-[10px] font-bold text-brand-600 uppercase bg-brand-50 px-2 py-1 rounded-full inline-block mt-1">
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

              {request.scheduled_time && (
                <div className="flex items-center gap-2 text-xs text-brand-600 bg-brand-50 px-3 py-2 rounded-xl">
                  <Calendar size={14} />
                  <span className="font-black uppercase tracking-wider">
                    Horário Agendado: {request.scheduled_time}
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
                  className="w-full h-10 bg-brand-50 text-brand-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-brand-100 active:scale-95 transition-all flex items-center justify-center gap-2"
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


export const ProfessionalServices = ({ currentUser, categories = [] }: any) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price_range: '',
    booking_type: 'whatsapp'
  });



  useEffect(() => {
    loadServices();
  }, []);

  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const checkProfileCompletion = () => {
    if (!currentUser?.cpf || !currentUser?.company_name) {
      setShowCompletionModal(true);
      return false;
    }
    return true;
  };

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

  const handleAddClick = () => {
    if (checkProfileCompletion()) {
      setShowForm(true);
    }
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
      price_range: service.price_range || '',
      booking_type: service.booking_type || 'whatsapp'
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
    setFormData({ title: '', category: '', description: '', price_range: '', booking_type: 'whatsapp' });
    setEditingService(null);
    setShowForm(false);
  };

  // Removed Period Management Functions (loadPeriods, handleManagePeriods, handleAddPeriod, handleDeletePeriod, closePeriodManagement)

  const parentCategories = categories.filter((c: any) => !c.parent_id && c.type === 'service');
  const getSubCategories = (parentId: string) => categories.filter((c: any) => c.parent_id === parentId);

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32 pt-24">
      <header className="p-6 pt-0 bg-white border-b border-slate-100 sticky top-24 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter">Meus Serviços</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{services.length} serviços</p>
          </div>
          <button
            onClick={() => setShowCompletionModal(true)}
            className="w-12 h-12 bg-white text-slate-600 rounded-2xl flex items-center justify-center border border-slate-200 mr-2 active:scale-95 transition-all"
          >
            <UserCog size={24} />
          </button>
          <button
            onClick={handleAddClick}
            className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      {/* Completion Modal */}
      <ProfileCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        userId={currentUser?.id}
      />

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
              {parentCategories.map((parent: any) => {
                const subs = getSubCategories(parent.id);
                if (subs.length > 0) {
                  return (
                    <optgroup key={parent.id} label={parent.name}>
                      {subs.map((sub: any) => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                    </optgroup>
                  );
                }
                return <option key={parent.id} value={parent.name}>{parent.name}</option>;
              })}
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

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tipo de Contato/Reserva</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormData({ ...formData, booking_type: 'whatsapp' })}
                  className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.booking_type === 'whatsapp' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                >
                  WhatsApp (Padrão)
                </button>
                <button
                  onClick={() => setFormData({ ...formData, booking_type: 'agenda' })}
                  className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.booking_type === 'agenda' ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                >
                  Agenda Direta
                </button>
              </div>
              <p className="text-[9px] text-slate-400 italic px-2">
                * O WhatsApp sempre ficará visível. A 'Agenda Direta' habilita a escolha de horários pelo morador.
              </p>
            </div>

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
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge className={`text-[8px] uppercase px-2 py-1 ${service.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {service.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Badge className="text-[8px] uppercase px-2 py-1 bg-slate-100 text-slate-500">
                    {service.booking_type === 'agenda' ? 'Agenda Habilitada' : 'Apenas WhatsApp'}
                  </Badge>
                </div>
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

export const ProfessionalEarnings = ({ currentUser }: any) => {
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
  const [receivables, setReceivables] = useState<any[]>([]);
  const [payables, setPayables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    due_date: '',
    status: 'pending'
  });

  useEffect(() => {
    loadFinancialData();
  }, [currentUser]);

  const loadFinancialData = async () => {
    if (!currentUser?.id) return;
    setLoading(true);

    // Load receivables from completed services (AUTO)
    const { data: services } = await supabase
      .from('service_requests')
      .select('*, profiles:resident_id(name, tower, unit)')
      .eq('provider_id', currentUser.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    // Load manual incomes (NEW)
    const { data: manualIncomes } = await supabase
      .from('professional_expenses') // Using same table, type='income'
      .select('*')
      .eq('professional_id', currentUser.id)
      .eq('type', 'income')
      .order('due_date', { ascending: false });

    let allReceivables: any[] = [];

    if (services) {
      allReceivables = services.map((s: any) => ({
        id: s.id,
        description: s.title || s.description,
        amount: s.price || 0,
        client: s.profiles?.name || 'Cliente',
        location: `${s.profiles?.tower || ''} - ${s.profiles?.unit || ''}`,
        date: s.created_at,
        status: s.payment_status || 'pending',
        type: 'service'
      }));
    }

    if (manualIncomes) {
      const manualMapped = manualIncomes.map((inc: any) => ({
        id: inc.id,
        description: inc.description,
        amount: inc.amount,
        client: 'Manual',
        location: '-',
        date: inc.due_date,
        status: inc.status,
        type: 'manual'
      }));
      allReceivables = [...allReceivables, ...manualMapped];
    }
    // Sort combined
    allReceivables.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setReceivables(allReceivables);


    // Load payables (expenses)
    const { data: expenses } = await supabase
      .from('professional_expenses')
      .select('*')
      .eq('professional_id', currentUser.id)
      .or('type.eq.expense,type.is.null') // Backward compatibility
      .order('due_date', { ascending: false });

    if (expenses) {
      setPayables(expenses);
    }

    setLoading(false);
  };

  const handleAddFinancialItem = async () => {
    if (!formData.description || !formData.amount) {
      alert('Preencha descrição e valor');
      return;
    }

    const type = activeTab === 'receivable' ? 'income' : 'expense';

    const { error } = await supabase.from('professional_expenses').insert([{
      professional_id: currentUser.id,
      description: formData.description,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date || new Date().toISOString(),
      status: formData.status,
      type: type
    }]);

    if (!error) {
      alert(type === 'income' ? 'Receita lançada!' : 'Despesa lançada!');
      setFormData({ description: '', amount: '', due_date: '', status: 'pending' });
      setShowAddForm(false);
      loadFinancialData();
    } else {
      alert('Erro: ' + error.message);
    }
  };


  const handleUpdateStatus = async (id: string, table: string, newStatus: string) => {
    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      loadFinancialData();
    }
  };

  const totalReceivable = receivables.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalPayable = payables.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const balance = totalReceivable - totalPayable;

  const pendingReceivable = receivables.filter(r => r.status === 'pending').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingPayable = payables.filter(p => p.status === 'pending').reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32 pt-24">
      <header className="p-6 pt-0 bg-white border-b border-slate-100 sticky top-24 z-40">
        <div>
          <h2 className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter">Financeiro</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão Financeira</p>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-[32px] shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-90">A Receber</p>
              </div>
              <h3 className="text-4xl font-black italic tracking-tighter mb-1">R$ {totalReceivable.toFixed(2)}</h3>
              <p className="text-xs font-bold opacity-75">Pendente: R$ {pendingReceivable.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-[32px] shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-90">A Pagar</p>
              </div>
              <h3 className="text-4xl font-black italic tracking-tighter mb-1">R$ {totalPayable.toFixed(2)}</h3>
              <p className="text-xs font-bold opacity-75">Pendente: R$ {pendingPayable.toFixed(2)}</p>
            </div>
          </div>

          <div className={`p-6 rounded-[32px] shadow-xl text-white relative overflow-hidden ${balance >= 0 ? 'bg-gradient-to-br from-slate-700 to-slate-900' : 'bg-gradient-to-br from-amber-500 to-amber-600'
            }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-90">Saldo</p>
              </div>
              <h3 className="text-4xl font-black italic tracking-tighter">
                {balance >= 0 ? '+' : ''} R$ {balance.toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1.5 bg-white rounded-3xl shadow-sm border border-slate-100">
          <button
            onClick={() => setActiveTab('receivable')}
            className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'receivable' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'
              }`}
          >
            Contas a Receber
          </button>
          <button
            onClick={() => setActiveTab('payable')}
            className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'payable' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'
              }`}
          >
            Contas a Pagar
          </button>
        </div>

        {/* Add Buttons (for both tabs now) */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className={`w-full h-14 rounded-2xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 ${activeTab === 'receivable'
              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              }`}
          >
            <Plus size={18} />
            {activeTab === 'receivable' ? 'Lançar Receita' : 'Lançar Despesa'}
          </button>
        )}

        {/* Add Expense Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl space-y-4 animate-in slide-in-from-top-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-black italic uppercase ${activeTab === 'receivable' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {activeTab === 'receivable' ? 'Nova Receita' : 'Nova Despesa'}
              </h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <Input
              placeholder="Descrição da despesa"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="h-14 rounded-2xl"
            />

            <Input
              type="number"
              placeholder="Valor (R$)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="h-14 rounded-2xl"
            />

            <Input
              type="date"
              placeholder="Data de vencimento"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="h-14 rounded-2xl"
            />

            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-4 font-bold text-sm outline-none focus:border-rose-500"
            >
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
            </select>

            <Button
              fullWidth
              onClick={handleAddFinancialItem}
              className={`h-14 text-white rounded-2xl uppercase font-black text-xs tracking-widest shadow-xl ${activeTab === 'receivable' ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-rose-600 shadow-rose-600/30'
                }`}
            >
              {activeTab === 'receivable' ? 'Salvar Receita' : 'Salvar Despesa'}
            </Button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'receivable' && (
              receivables.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign size={24} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold text-sm">Nenhuma conta a receber</p>
                  <p className="text-slate-300 text-xs mt-1">Complete serviços para gerar receitas</p>
                </div>
              ) : (
                receivables.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-black text-slate-900 text-base italic tracking-tight">{item.description}</h4>
                        <p className="text-xs text-slate-500 mt-1">{item.client} • {item.location}</p>
                      </div>
                      <Badge className={`text-[8px] uppercase px-2 py-1 ${item.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                        {item.status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor</p>
                        <span className="text-xl font-black text-emerald-600">R$ {item.amount.toFixed(2)}</span>
                      </div>
                      {item.status !== 'paid' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'service_requests', 'paid')}
                          className="h-10 px-4 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 active:scale-95 transition-all"
                        >
                          Marcar como Pago
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'payable' && (
              payables.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign size={24} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold text-sm">Nenhuma despesa cadastrada</p>
                  <p className="text-slate-300 text-xs mt-1">Clique no botão acima para adicionar</p>
                </div>
              ) : (
                payables.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-black text-slate-900 text-base italic tracking-tight">{item.description}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Vencimento: {new Date(item.due_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge className={`text-[8px] uppercase px-2 py-1 ${item.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                        {item.status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor</p>
                        <span className="text-xl font-black text-rose-600">R$ {item.amount.toFixed(2)}</span>
                      </div>
                      {item.status !== 'paid' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'professional_expenses', 'paid')}
                          className="h-10 px-4 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 active:scale-95 transition-all"
                        >
                          Marcar como Pago
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const ProfessionalProfileView = ({ currentUser, categories = [], onLogout }: any) => {
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
    <div className="p-6 pb-32 pt-28">
      <h2 className="text-xl font-black text-slate-900 mb-6">Meu Perfil</h2>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 mb-6 flex flex-col items-center">
        <div
          className="w-32 h-32 rounded-[40px] border-4 border-slate-50 shadow-xl overflow-hidden mb-4 relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
          {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>}
        </div>
        <button onClick={() => fileInputRef.current?.click()} className="text-brand-600 font-bold text-xs uppercase bg-brand-50 px-4 py-2 rounded-lg active:scale-95 transition-transform" disabled={uploading}>
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
            <option value="">Selecione a categoria</option>
            {categories.filter((c: any) => !c.parent_id && c.type === 'service').map((parent: any) => {
              const subs = categories.filter((s: any) => s.parent_id === parent.id);
              if (subs.length > 0) {
                return (
                  <optgroup key={parent.id} label={parent.name}>
                    {subs.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </optgroup>
                );
              }
              return <option key={parent.id} value={parent.name}>{parent.name}</option>;
            })}
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
        <Button
          variant="secondary"
          onClick={async () => {
            if (window.confirm('Sair do App?')) {
              await supabase.auth.signOut();
              localStorage.removeItem('userRole_cache');
              window.location.href = '/';
            }
          }}
          className="w-full border-rose-100 text-rose-500 h-16 bg-white rounded-[24px]"
        >
          Sair da Conta
        </Button>
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

  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const checkProfileCompletion = () => {
    if (!currentUser?.cpf || !currentUser?.company_name) {
      setShowCompletionModal(true);
      return false;
    }
    return true;
  };

  const handleAddClick = () => {
    if (checkProfileCompletion()) {
      setShowForm(true);
    }
  };

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
    <div className="min-h-screen bg-[#fcfcfd] pb-32 pt-24">
      <header className="p-6 pt-0 bg-white border-b border-slate-100 sticky top-24 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter">Minha Loja</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{products.length} produtos</p>
          </div>
          <button
            onClick={handleAddClick}
            className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/30 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      {/* Completion Modal */}
      <ProfileCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        userId={currentUser?.id}
      />

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
              className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium outline-none focus:border-brand-500 resize-none"
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
                className="h-14 bg-slate-50 border border-slate-200 rounded-2xl px-4 font-bold text-sm outline-none focus:border-brand-500"
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
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-brand-400 transition-all bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
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
              className="h-14 bg-brand-600 text-white rounded-2xl uppercase font-black text-xs tracking-widest shadow-xl shadow-brand-600/30"
            >
              {editingProduct ? 'Atualizar' : 'Cadastrar'} Produto
            </Button>
          </div>
        )}

        {/* Lista de Produtos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
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
                    <span className="text-lg font-black text-brand-600">R$ {product.price.toFixed(2)}</span>
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
                  className="flex-1 h-10 bg-brand-50 text-brand-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-brand-100 active:scale-95 transition-all"
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

export const ProfessionalNavigation = ({ activeTab, onChange, currentUser, onLogout }: any) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: Grid, label: 'Início', isPriority: true },
    { id: 'agenda', icon: Calendar, label: 'Agenda', isPriority: true },
    { id: 'earnings', icon: Wallet, label: 'Financeiro', isPriority: true },
    { id: 'services', icon: Briefcase, label: 'Serviços', isPriority: false },
    { id: 'shop', icon: Store, label: 'Loja', isPriority: false },
    { id: 'profile', icon: User, label: 'Perfil', isPriority: false },
  ];

  return (
    <>
      {/* TOP HEADER */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-md z-[60] px-6 py-4 flex justify-between items-center border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-transparent flex items-center justify-center">
            <img src="/logo.png" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-black italic text-slate-900 leading-none tracking-tighter">Morador.app</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Painel Parceiro</p>
          </div>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-all"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* MENU OVERLAY */}
      {
        menuOpen && (
          <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-10 duration-500">
              <div className="p-6 bg-slate-50 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                    <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tighter leading-none">{currentUser?.name || 'Profissional'}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Menu Parceiro</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-4">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChange(item.id);
                      setMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-3xl gap-2 transition-all ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                  >
                    <item.icon size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 pt-2 border-t border-slate-50">
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    else {
                      supabase.auth.signOut().then(() => window.location.reload());
                    }
                  }}
                  className="w-full h-14 bg-rose-50 text-rose-600 rounded-[28px] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] hover:bg-rose-100 transition-all active:scale-95"
                >
                  <LogOut size={18} />
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* BOTTOM NAV */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[98%] max-w-[420px] bg-white shadow-2xl shadow-slate-900/10 border border-slate-100 rounded-[32px] p-2 flex justify-between items-center z-50">

        {/* Priority Items */}
        {navItems.filter(i => i.isPriority).map(item => (
          <button
            key={item.id}
            onClick={() => { onChange(item.id); setMenuOpen(false); }}
            className={`flex-1 relative h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === item.id && !menuOpen ? 'bg-slate-50 text-slate-900' : 'text-slate-300 hover:bg-slate-50'}`}
          >
            <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${activeTab === item.id ? 'text-slate-900' : 'text-slate-300'}`}>
              {item.label}
            </span>
          </button>
        ))}

        {/* Menu Trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`relative w-16 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${menuOpen ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-50'}`}
        >
          <Menu size={24} strokeWidth={menuOpen ? 2.5 : 2} />
          <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${menuOpen ? 'text-white' : 'text-slate-300'}`}>
            Menu
          </span>
        </button>
      </div>
    </>
  );
};
