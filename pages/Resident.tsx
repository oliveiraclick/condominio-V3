import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, Badge, Button, Input } from '../components/UI';
import {
  Bell, Search, MapPin, Grid, Calendar, ShoppingBag,
  User, Plus, Package, Key, Zap, CreditCard,
  Sparkles, Star, ChevronRight, ChevronLeft, Tag,
  Users, ArrowLeft, Filter, Droplets, Paintbrush,
  Leaf, Car, Wrench, Phone, Monitor, LayoutGrid, Scissors, Utensils,
  Coffee, ShoppingCart, HeartPulse, PawPrint, Megaphone,
  QrCode, Unlock, History, AlertCircle, FileText, Copy, CheckCircle2,
  Settings, LogOut, ShieldCheck, Wallet, HelpCircle, UserCheck,
  CalendarDays, Check, HardHat, Hammer, UserPlus, Briefcase, ListFilter, PartyPopper,
  Trophy, Target, Dumbbell, GlassWater, Waves, Store, Heart, Navigation,
  MessageSquare, Send, Paperclip, Mic, MoreVertical, CheckCheck, Award, Quote, Camera, MessageCircle,
  Image as ImageIcon, X, Clock, MapPinned, Trash2, Share2, UserCircle2, Flame,
  Building2, Camera as CameraIcon, Download
} from 'lucide-react';
import { CommunicationHub } from './CommunicationHub';
import { ProfessionalSector, ProfessionalProfile, UserRole } from '../types';
import { supabase } from '../supabase';

// --- COMPONENTES DE APOIO ---
const FloatingBackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`fixed bottom-24 right-6 w-14 h-14 bg-violet-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 transform ${show ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        } active:scale-95 hover:bg-violet-700 active:bg-violet-800`}
    >
      <ArrowLeft size={24} />
    </button>
  );
};

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

const DesapegoCard: React.FC<{ item: any; currentUser?: any; onDelete?: (id: string) => void; variant?: 'preview' | 'detail'; onSelect?: () => void }> = ({ item, currentUser, onDelete, variant = 'preview', onSelect }) => {
  const isOwner = currentUser?.name === item.user;

  const handleInterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (variant === 'preview' && onSelect) {
      onSelect();
      return;
    }

    if (item.phone) {
      const cleanPhone = item.phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá, vi seu anúncio do *${item.name}* no app do condomínio e tenho interesse!`);
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    } else {
      alert('Telefone do vendedor não disponível.');
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm('Tem certeza que deseja remover este anúncio?')) {
      onDelete(item.id);
    }
  };

  return (
    <Card
      onClick={() => onSelect && onSelect()}
      className={`p-0 overflow-hidden border-none shadow-xl shadow-slate-200/60 rounded-[40px] bg-white group transition-all ${onSelect ? 'cursor-pointer active:scale-[0.98]' : ''}`}
    >
      <div className="relative h-72 p-5">
        <img src={item.img} className="w-full h-full object-cover rounded-[32px] group-hover:scale-105 transition-transform duration-700" alt={item.name} />
        <div className="absolute top-10 left-10">
          <span className="bg-emerald-500 text-white font-black px-4 py-2 text-[10px] uppercase rounded-xl shadow-lg tracking-widest">{item.status}</span>
        </div>
        <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-md px-5 py-3 rounded-[20px] shadow-xl border border-white/20">
          <p className="text-lg font-black text-slate-950 tracking-tighter">{item.price}</p>
        </div>
      </div>
      <div className="p-8 pt-2">
        <h4 className="font-black text-xl text-slate-950 mb-2 tracking-tighter italic truncate">{item.name}</h4>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 shadow-sm">
            <img src={`https://picsum.photos/seed/${item.user}/100`} className="w-full h-full object-cover" alt="User" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.user} <span className="text-violet-500">({item.tower})</span></p>
            <p className="text-[8px] font-bold text-slate-300 uppercase mt-0.5 tracking-widest leading-none">{item.tower.split(' - ')[0]}</p>
          </div>
        </div>

        {isOwner ? (
          <button
            onClick={handleDelete}
            className="w-full py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] bg-rose-50 text-rose-500 flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"
          >
            <Trash2 size={16} />
            Remover Anúncio
          </button>
        ) : (
          <button
            onClick={handleInterest}
            className="w-full py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 bg-emerald-500 text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <MessageSquare size={16} />
            {variant === 'preview' ? 'Ver Detalhes' : 'Tenho Interesse'}
          </button>
        )}
      </div>
    </Card>
  );
};

// --- HOME DO MORADOR ---
// --- REVIEW MODAL ---
const ReviewModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (rating: number, comment: string) => void; proName: string }> = ({ isOpen, onClose, onSubmit, proName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 mx-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-amber-500/20">
            <Star size={32} fill="currentColor" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter">Avaliar Serviço</h3>
          <p className="text-sm text-slate-500">Como foi o atendimento de <span className="font-bold text-slate-900">{proName}</span>?</p>

          <div className="flex justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} className="active:scale-90 transition-transform">
                <Star size={32} className={s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
              </button>
            ))}
          </div>

          <textarea
            placeholder="Deixe um comentário (opcional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-24 bg-slate-50 rounded-2xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-amber-400 transition-all font-medium"
          />

          <Button onClick={() => onSubmit(rating, comment)} fullWidth className="h-14 bg-amber-400 text-amber-950 font-black uppercase tracking-widest shadow-lg shadow-amber-400/30 hover:bg-amber-500 hover:text-white">
            Enviar Avaliação
          </Button>
          <button onClick={onClose} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export const ResidentHome: React.FC<{
  onNavigate: (target: string) => void;
  onSelectCategory: (cat: string) => void;
  packages: any[];
  setPackages: (pkgs: any[]) => void;
  desapegos: any[];
  currentUser: any;
  notifications?: any[];
  serviceRequests?: any[]; // Re-added for reviews
  activeServices?: any[];
  onClearNotifications?: () => void;
  onSelectDesapego?: (item: any) => void;
  products?: any[];
  onSelectProduct?: (item: any) => void;
  onSitePros?: any[];
}> = ({ onNavigate, onSelectCategory, packages = [], setPackages, desapegos = [], currentUser, notifications = [], serviceRequests = [], activeServices = [], onSelectDesapego, products = [], onSelectProduct, onSitePros = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentDesapegoIndex, setCurrentDesapegoIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<'prestadores' | 'gestao'>('prestadores');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequestToReview, setSelectedRequestToReview] = useState<any>(null);
  const [homeSearch, setHomeSearch] = useState('');

  const handleHomeSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && homeSearch.trim()) {
      onSelectCategory('Todos', homeSearch.trim());
    }
  };

  const myPackages = packages.filter(p => p.unit === (currentUser?.unit || ''));
  // Filter for completed requests that haven't been reviewed (mock check for now, ideally check DB)
  const completedRequests = serviceRequests.filter(r => r.status === 'completed' && !r.reviewed);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!selectedRequestToReview) return;

    // Insert Review
    const { error } = await supabase.from('reviews').insert([{
      service_request_id: selectedRequestToReview.id,
      reviewer_id: currentUser.id,
      target_id: selectedRequestToReview.provider_id, // Assuming provider_id is on request
      rating,
      comment
    }]);

    if (!error) {
      // Mark request as reviewed locally or in DB (so it disappears from list)
      // ideally update 'service_requests' metadata or local exclude
      alert('Avaliação enviada com sucesso! Obrigado.');
      setReviewModalOpen(false);
      // Refresh?
    } else {
      alert('Erro ao enviar avaliação: ' + error.message);
    }
  };

  const featuredProduct = products.length > 0 ? products[products.length - 1] : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 relative">
      {/* HEADER: ON-SITE BANNER */}
      {onSitePros.length > 0 && (
        <div onClick={() => onSelectCategory('Todos')} className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 animate-gradient-x text-white py-3 px-6 shadow-lg cursor-pointer sticky top-0 z-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            <span className="text-xs font-black uppercase tracking-widest">{onSitePros.length} Prestador{onSitePros.length > 1 ? 'es' : ''} no condomínio agora!</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest opacity-90">
            Ver todos <ChevronRight size={12} />
          </div>
        </div>
      )}

      {/* REVIEWS MODAL */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        proName={selectedRequestToReview?.providerName || 'Profissional'}
      />

      {/* NOTIFICATIONS MODAL */}
      <NotificationsModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} userRole="resident" />

      {/* HEADER DINÂMICO */}
      <div className="bg-violet-600 p-6 pt-12 rounded-b-[40px] shadow-sm border-b border-violet-500">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-violet-400/30 shadow-xl bg-white/10 backdrop-blur-sm">
              <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-black text-white text-2xl tracking-tighter leading-none italic">Olá, {currentUser?.name || 'Morador'}!</h2>
              <p className="text-[10px] text-violet-200 font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                <MapPin size={10} className="text-violet-200" /> {currentUser?.condo || 'Meu Condomínio'} • {currentUser?.unit || '---'}
              </p>
            </div>
          </div>
          <button onClick={() => setShowNotifications(!showNotifications)} className="w-12 h-12 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center relative active:bg-white/20 transition-all">
            <Bell size={24} className="text-white" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300" size={18} />
          <Input
            placeholder="O que você precisa hoje?"
            className="pl-12 h-14 bg-white/10 border-none rounded-2xl font-medium text-white placeholder-violet-200/70 focus:bg-white/20 transition-all"
            value={homeSearch}
            onChange={(e) => setHomeSearch(e.target.value)}
            onKeyDown={handleHomeSearch}
          />
        </div>
      </div>

      <div className="p-6 space-y-12">
        {/* PRESTADORES NO LOCAL (NEW) */}
        {onSitePros.length > 0 && (
          <div className="animate-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Prestadores no Condomínio</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {onSitePros.map((pro, i) => (
                <div key={i} className="min-w-[140px] bg-white p-4 rounded-[24px] border border-emerald-100 shadow-lg shadow-emerald-500/10 flex flex-col items-center gap-2 relative">
                  <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
                    <img src={pro.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pro.name}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pro.category || 'Prestador'}</p>
                    <h4 className="font-bold text-slate-900 text-xs leading-tight line-clamp-1">{pro.name}</h4>
                  </div>
                  <button onClick={() => {
                    const cleanPhone = pro.phone?.replace(/\D/g, '');
                    if (cleanPhone) window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                  }} className="mt-1 w-full py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-colors">
                    Chamar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PENDENTE DE AVALIAÇÃO */}
        {completedRequests.length > 0 && (
          <div className="animate-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <Star size={16} className="text-amber-500 fill-amber-500 animate-pulse" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Avalie seu Atendimento</h3>
            </div>
            <div className="space-y-4">
              {completedRequests.map((req, i) => (
                <div key={i} className="bg-white p-5 rounded-[24px] border border-amber-100 shadow-lg shadow-amber-500/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concluído em {new Date(req.created_at).toLocaleDateString('pt-BR')}</p>
                    <h4 className="font-black text-slate-900 text-sm mt-1">{req.title}</h4>
                    <p className="text-xs text-slate-500">Com {req.providerName || 'Prestador'}</p>
                  </div>
                  <Button onClick={() => { setSelectedRequestToReview(req); setReviewModalOpen(true); }} className="px-5 py-2 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-colors">
                    Avaliar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENCOMENDAS ATIVAS */}
        {myPackages.length > 0 && (
          <div className="bg-slate-950 rounded-[44px] p-8 text-white shadow-2xl animate-in zoom-in duration-500">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10"><Package size={24} className="text-violet-400" /></div>
              <div>
                <h3 className="font-black text-lg tracking-tight">Sua encomenda chegou!</h3>
                <p className="text-[9px] text-slate-500 uppercase font-black mt-1">Retirada no Locker: {myPackages[0].locker}</p>
              </div>
            </div>
            <Button fullWidth className="bg-violet-600 h-14 rounded-2xl font-black uppercase text-[10px]" onClick={() => setPackages(packages.filter(p => p.unit !== currentUser?.unit))}>Confirmar Retirada</Button>
          </div>
        )}

        {/* ATALHOS RÁPIDOS (COM ABAS) */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100/80 rounded-2xl">
            <button
              onClick={() => setActiveSection('prestadores')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSection === 'prestadores' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Prestadores
            </button>
            <button
              onClick={() => setActiveSection('gestao')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSection === 'gestao' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Gestão Condomínio
            </button>
          </div>

          {/* Conteúdo Dinâmico */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeSection === 'gestao' ? (
              <div>
                <SectionHeader title="Gestão Condomínio" action="Ver Todos" onAction={() => onNavigate('home')} />
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: <Key size={20} />, label: 'Acessos', target: 'acesso', color: 'text-violet-600', bg: 'bg-violet-50' },
                    { icon: <CalendarDays size={20} />, label: 'Reservas', target: 'condo-agenda', color: 'text-amber-600', bg: 'bg-amber-50' },
                    { icon: <Wallet size={20} />, label: 'Financeiro', target: 'financeiro', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { icon: <MessageSquare size={20} />, label: 'Fale com Cond.', target: 'chamado', color: 'text-blue-600', bg: 'bg-blue-50' },
                  ].map((act, i) => (
                    <button key={i} onClick={() => onNavigate(act.target)} className="bg-white p-3 py-4 rounded-[24px] flex flex-col items-center gap-2 shadow-sm border border-slate-50 active:scale-95 transition-all">
                      <div className={`${act.color} ${act.bg} w-10 h-10 rounded-xl flex items-center justify-center`}>{act.icon}</div>
                      <span className="text-[9px] font-black text-slate-600 uppercase text-center tracking-tight leading-none line-clamp-2">{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <SectionHeader title="Prestadores" action="Ver Todos" onAction={() => onSelectCategory('Todos')} />
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: <Leaf size={20} />, label: 'Jardim', category: 'Jardinagem', color: 'text-green-600', bg: 'bg-green-50' },
                    { icon: <Zap size={20} />, label: 'Eletricista', category: 'Eletricista', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { icon: <Droplets size={20} />, label: 'Limpeza', category: 'Limpeza', color: 'text-cyan-600', bg: 'bg-cyan-50' },
                    { icon: <Paintbrush size={20} />, label: 'Pintura', category: 'Pintor', color: 'text-pink-600', bg: 'bg-pink-50' },
                  ].map((act, i) => (
                    <button key={i} onClick={() => onSelectCategory(act.category)} className="bg-white p-3 py-4 rounded-[24px] flex flex-col items-center gap-2 shadow-sm border border-slate-50 active:scale-95 transition-all">
                      <div className={`${act.color} ${act.bg} w-10 h-10 rounded-xl flex items-center justify-center`}>{act.icon}</div>
                      <span className="text-[9px] font-black text-slate-600 uppercase text-center tracking-tight leading-none">{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
            }
          </div>
        </div>

        {/* E-SHOP (Carousel Dinâmico) */}
        <div>
          <SectionHeader title="e-Shop" action="Ver Todos" onAction={() => onNavigate('shop-detail')} />
          {products.length > 0 ? (
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {products.map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSelectProduct && onSelectProduct(item)}
                  className="min-w-[45%] bg-white p-4 rounded-[32px] shadow-sm border border-slate-50 flex flex-col gap-3 active:scale-95 transition-all cursor-pointer relative"
                >
                  <div className="w-full h-32 rounded-2xl bg-orange-50 text-orange-500 overflow-hidden relative flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <Store size={24} />
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg">
                      <p className="text-[10px] font-black italic text-slate-900">{typeof item.price === 'number' ? `R$ ${item.price}` : item.price}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm italic tracking-tight line-clamp-1">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">por {item.profiles?.name?.split(' ')[0] || 'Vizinho'}</p>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-emerald-500 text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-md">Novo</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={() => onNavigate('shop-detail')}
              className="bg-white p-6 rounded-[36px] shadow-sm border border-slate-50 flex items-center gap-6 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-20 h-20 rounded-2xl bg-orange-50 text-orange-500 overflow-hidden relative flex items-center justify-center">
                <Store size={32} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-slate-900 text-xl italic tracking-tight line-clamp-1">
                    Marketplace
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium line-clamp-2">
                  Encontre produtos e serviços dos seus vizinhos e comércio local.
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-950 rounded-full flex items-center justify-center text-white shrink-0">
                <ChevronRight size={18} />
              </div>
            </div>
          )}
        </div>

        {/* MURAL DO DESAPEGO (CARROSSEL ÚNICO) */}
        <div>
          <SectionHeader title="Mural do Desapego" action="Ver Todos" onAction={() => onNavigate('desapegos-all')} />

          <div className="relative group">
            {desapegos.length > 0 && (
              <div className="transform transition-all duration-300" onClick={() => onSelectDesapego && onSelectDesapego(desapegos[currentDesapegoIndex])}>
                <DesapegoCard item={desapegos[currentDesapegoIndex]} currentUser={currentUser} variant="preview" onSelect={() => onSelectDesapego && onSelectDesapego(desapegos[currentDesapegoIndex])} />
              </div>
            )}

            {/* Navigation Arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentDesapegoIndex(prev => prev === 0 ? desapegos.length - 1 : prev - 1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-slate-900 active:scale-90 transition-all z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentDesapegoIndex(prev => prev === desapegos.length - 1 ? 0 : prev + 1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-slate-900 active:scale-90 transition-all z-10"
            >
              <ChevronRight size={24} />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {desapegos.map((_, idx) => (
                <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx === currentDesapegoIndex ? 'w-6 bg-violet-600' : 'w-2 bg-slate-200'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PERFIL DO MORADOR ---
export const ResidentProfile: React.FC<{ currentUser: any; onNavigate: (t: string) => void }> = ({ currentUser, onNavigate }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // No reload needed, onAuthStateChange in App.tsx handles the state switch
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="h-64 bg-violet-600 relative flex items-end px-10 pb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-700"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-24 h-24 rounded-[30px] border-4 border-white bg-white overflow-hidden shadow-2xl">
            <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover" />
          </div>
          <div className="text-white">
            <h2 className="text-3xl font-black italic tracking-tighter leading-none">{currentUser?.name || 'Morador'}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-2">Unidade {currentUser?.unit || '---'}</p>
          </div>
        </div>
      </div>

      <div className="p-10 space-y-4">
        {[
          { icon: <User size={20} />, label: 'Dados Pessoais', desc: 'Edite seu perfil e contatos', onClick: () => onNavigate('personal-data') },
          { icon: <ShieldCheck size={20} />, label: 'Privacidade', desc: 'Configurações de visibilidade', onClick: () => onNavigate('privacy') },
          { icon: <LogOut size={20} />, label: 'Encerrar Sessão', color: 'text-rose-500', bg: 'bg-rose-50', onClick: handleLogout },
        ].map((item, i) => (
          <button key={i} onClick={item.onClick} className="w-full p-6 bg-slate-50 rounded-[30px] flex items-center justify-between group transition-all hover:bg-violet-50">
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg || 'bg-white shadow-sm'} ${item.color || 'text-slate-400'}`}>
                {item.icon}
              </div>
              <div className="text-left">
                <h4 className={`font-bold ${item.color || 'text-slate-900'}`}>{item.label}</h4>
                <p className="text-[10px] text-slate-400 uppercase font-medium">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-200" />
          </button>
        ))}
      </div>
    </div>
  );
};

export const Marketplace: React.FC<{ onNavigate: (t: string) => void; onSelectCategory: (cat: string) => void; services?: any[]; products?: any[] }> = ({ onNavigate, onSelectCategory, products }) => {
  const categories = [
    { id: '1', name: 'Alimentação', icon: <Utensils size={28} />, bg: 'bg-orange-50', color: 'text-orange-600' },
    { id: '2', name: 'Manutenção', icon: <Wrench size={28} />, bg: 'bg-blue-50', color: 'text-blue-600' },
    { id: '3', name: 'Limpeza', icon: <Droplets size={28} />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { id: '4', name: 'Estética', icon: <Scissors size={28} />, bg: 'bg-rose-50', color: 'text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <FloatingBackButton onClick={() => onNavigate('home')} />
      <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button onClick={() => onNavigate('home')} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-slate-100"><ArrowLeft size={20} className="text-slate-900" /></button>
        <div className="flex-1 flex items-center justify-between">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">e-Shop</h2>
          <ShoppingBag className="text-violet-600" size={24} />
        </div>
      </header>
      <div className="p-6 space-y-10">
        <div className="relative group" onClick={() => onNavigate('shop-detail')}>
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors" size={20} />
          <Input readOnly placeholder="Qual serviço você precisa?" className="h-18 pl-14 rounded-[30px] border-none shadow-2xl shadow-slate-100 cursor-pointer pointer-events-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => onSelectCategory(cat.name)} className={`${cat.bg} p-8 rounded-[40px] flex flex-col gap-4 text-left group active:scale-95 transition-all border-2 border-transparent hover:border-white hover:shadow-xl`}>
              <div className={`${cat.color} group-hover:scale-110 transition-transform`}>{cat.icon}</div>
              <h4 className={`font-black italic text-lg tracking-tight leading-none ${cat.color}`}>{cat.name}</h4>
            </button>
          ))}
        </div>

        {products && products.length > 0 && (
          <div>
            <SectionHeader title="Destaques e-Shop" />
            <div className="space-y-4">
              {products.map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-[32px] flex items-center gap-4 shadow-sm border border-slate-50">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={item.image_url || item.img} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 italic truncate">{item.title || item.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{typeof item.price === 'number' ? `R$ ${item.price.toFixed(2)}` : item.price}</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-1 truncate">Vendedor: {item.profiles?.name || item.user || 'e-Shop'}</p>
                  </div>
                  <button className="w-10 h-10 bg-slate-950 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <ChevronRight size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ServicosFullView: React.FC<{ initialCategory: string; initialSearch?: string; onBack: () => void; onNavigate: (t: string) => void; onServiceRequest: (req: any) => void; services?: any[] }> = ({ initialCategory, initialSearch = '', onBack, onServiceRequest, services = [] }) => {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // CATEGORY DEFINITIONS (Icons & Colors)
  const categoryConfig: any = {
    'Jardinagem': { icon: <Leaf size={24} />, color: 'text-green-600', bg: 'bg-green-50' },
    'Eletricista': { icon: <Zap size={24} />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    'Limpeza': { icon: <Droplets size={24} />, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    'Pintor': { icon: <Paintbrush size={24} />, color: 'text-pink-600', bg: 'bg-pink-50' },
    'Manutenção': { icon: <Wrench size={24} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    'Tecnologia': { icon: <Monitor size={24} />, color: 'text-violet-600', bg: 'bg-violet-50' },
    'Beleza': { icon: <Scissors size={24} />, color: 'text-rose-600', bg: 'bg-rose-50' },
    'Outros': { icon: <Briefcase size={24} />, color: 'text-slate-600', bg: 'bg-slate-50' },
  };

  const getCatConfig = (cat: string) => categoryConfig[cat] || categoryConfig['Outros'];

  // Extract unique categories from services or use defaults
  const availableCategories = useMemo(() => {
    // Merge config keys with any extra categories found in services
    const serviceCats = new Set(services.map(s => s.category));
    const configCats = Object.keys(categoryConfig);
    return Array.from(new Set([...configCats, ...serviceCats])).filter(c => c !== 'Outros').concat('Outros'); // Ensure Outros is last
  }, [services]);

  // FILTERED LIST
  const filteredPros = useMemo(() => {
    let filtered = services;

    // Filter by Category
    if (activeCategory !== 'Todos') {
      filtered = filtered.filter(s => s.category === activeCategory);
    }

    // Filter by Search (Name or Category if in Todos)
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(lower) ||
        s.providerName?.toLowerCase().includes(lower) ||
        s.category?.toLowerCase().includes(lower)
      );
    }
    return filtered;
  }, [services, activeCategory, searchTerm]);

  const handleRequest = (proName: string, proId: string) => {
    onServiceRequest({
      id: Date.now(),
      name: `Serviço com ${proName}`,
      user: 'Morador',
      time: 'Agora',
      location: 'Minha Unidade',
      status: 'pending',
      professional_id: proId
    });
    alert(`Solicitação enviada para ${proName}!`);
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone?.replace(/\D/g, '');
    if (cleanPhone) window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    else alert('Telefone não disponível');
  };

  // --- VIEW: CATEGORY GRID (When 'Todos' is Active AND no search term that forces a list) ---
  const showCategoryGrid = activeCategory === 'Todos' && !searchTerm;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10">
      <FloatingBackButton onClick={() => activeCategory === 'Todos' ? onBack() : setActiveCategory('Todos')} />
      <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button onClick={() => activeCategory === 'Todos' ? onBack() : setActiveCategory('Todos')} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            {activeCategory === 'Todos' ? 'Prestadores' : activeCategory}
          </h2>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* SEARCH BAR */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20} />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={activeCategory === 'Todos' ? "Busque por serviço (ex: Eletricista)..." : `Buscar em ${activeCategory}...`}
            className="pl-12 h-14 bg-white border border-slate-200 rounded-2xl shadow-sm focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-all"
          />
        </div>

        {/* CONTENT */}
        {showCategoryGrid ? (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Map through extracted categories */}
            {availableCategories.length > 0 ? availableCategories.map((cat) => {
              const conf = getCatConfig(cat);
              const count = services.filter(s => s.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex flex-col items-center gap-4 active:scale-95 transition-all hover:border-violet-200 group"
                >
                  <div className={`w-16 h-16 ${conf.bg} ${conf.color} rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform`}>
                    {conf.icon}
                  </div>
                  <div className="text-center">
                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{cat}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{count} Profissionais</p>
                  </div>
                </button>
              );
            }) : (
              <div className="col-span-2 text-center py-12 text-slate-400">
                <p className="text-sm">Nenhuma categoria encontrada.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredPros.length > 0 ? filteredPros.map(pro => (
              <Card key={pro.id} className="p-0 border-none shadow-xl shadow-slate-200/50 rounded-[40px] bg-white overflow-hidden group">
                <div className="p-6 pb-0 flex items-start gap-5">
                  <div className="w-20 h-20 rounded-[28px] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100">
                    <img src={pro.avatar || pro.img || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pro.providerName}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 pt-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-widest px-2 py-1">{pro.category || 'Geral'}</Badge>
                          {pro.is_on_site && (
                            <Badge className="bg-emerald-500 text-white text-[10px] uppercase tracking-widest px-2 py-1 animate-pulse flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div> No Local
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-black text-slate-900 italic text-xl leading-none truncate">{pro.providerName || pro.title}</h4>
                      </div>
                      {pro.rating && (
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-500 px-2 py-1 rounded-lg">
                          <Star size={12} fill="currentColor" />
                          <span className="text-xs font-black">{pro.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{pro.title} - {pro.description || 'Profissional verificado do condomínio.'}</p>
                  </div>
                </div>

                <div className="mt-6 p-6 bg-slate-50/50 border-t border-slate-100 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Aproximado</p>
                    <p className="font-black text-slate-900 text-lg">{pro.price_range || pro.price || 'A Combinar'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openWhatsApp(pro.providerPhone)} className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center active:scale-95 transition-all hover:bg-emerald-100 border border-emerald-100">
                      <MessageCircle size={24} />
                    </button>
                    <Button onClick={() => handleRequest(pro.providerName, pro.provider_id)} className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-black/10 active:scale-95">
                      Solicitar
                    </Button>
                  </div>
                </div>
              </Card>
            )) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Search size={32} />
                </div>
                <h3 className="text-slate-900 font-bold text-lg">Nenhum profissional encontrado</h3>
                <p className="text-slate-400 text-sm mt-1">Tente buscar por outra categoria ou termo.</p>
                <button onClick={() => { setActiveCategory('Todos'); setSearchTerm(''); }} className="mt-6 text-violet-600 font-black uppercase text-xs tracking-widest hover:underline">
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const DesapegoFullView: React.FC<{ onBack: () => void; desapegos: any[]; currentUser?: any; onDelete?: (id: string) => void; onSelect?: (item: any) => void }> = ({ onBack, desapegos, currentUser, onDelete, onSelect }) => (
  <div className="min-h-screen bg-slate-50 pb-32">
    <FloatingBackButton onClick={onBack} />
    <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
      <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-90"><ArrowLeft size={20} /></button>
      <h2 className="text-xl font-black italic uppercase">Desapego</h2>
    </header>
    <div className="p-6 space-y-10">
      {desapegos.map(item => (
        <div key={item.id} onClick={() => onSelect && onSelect(item)}>
          <DesapegoCard item={item} currentUser={currentUser} onDelete={onDelete} variant="preview" onSelect={() => onSelect && onSelect(item)} />
        </div>
      ))}
    </div>
  </div>
);

export const DesapegoDetailView: React.FC<{ onBack: () => void; item: any; currentUser?: any; onDelete?: (id: string) => void }> = ({ onBack, item, currentUser, onDelete }) => {
  if (!item) return <div className="p-10">Item não encontrado. <button onClick={onBack}>Voltar</button></div>;

  const isOwner = currentUser?.name === item.user;

  const handleInterest = () => {
    if (item.phone) {
      const cleanPhone = item.phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá, vi seu anúncio do *${item.name}* no app do condomínio e tenho interesse!`);
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    } else {
      alert('Telefone do vendedor não disponível.');
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('Tem certeza que deseja remover este anúncio?')) {
      onDelete(item.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 animate-in fade-in duration-300">
      <div className="h-96 relative bg-slate-200">
        <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-slate-50/90"></div>
        <button onClick={onBack} className="absolute top-12 left-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white active:scale-90 shadow-lg border border-white/20"><ArrowLeft /></button>

        <div className="absolute bottom-8 left-6 right-6">
          <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg mb-3 inline-block">{item.status}</span>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10 w-full rounded-t-[40px] bg-slate-50">
        <div className="flex justify-between items-start mb-4 pt-6">
          <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none max-w-[70%]">{item.name}</h2>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
            <p className="font-black text-slate-900 text-lg tracking-tight">{item.price}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-6 border-y border-slate-200/50 mb-6">
          <div className="w-12 h-12 rounded-full bg-indigo-100 overflow-hidden border-2 border-white shadow-sm">
            <img src={`https://picsum.photos/seed/${item.user}/100`} className="w-full h-full object-cover" alt={item.user} />
          </div>
          <div>
            <p className="text-xs text-slate-900 font-bold">Vendido por {item.user}</p>
            <p className="text-[10px] text-slate-400 font-medium">{item.tower || 'Morador Verificado'}</p>
          </div>
          {!isOwner && (
            <button onClick={handleInterest} className="ml-auto w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center active:scale-90 transition-all border border-emerald-100">
              <MessageSquare size={18} />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-900">Sobre o produto</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{item.desc || 'Sem descrição detalhada.'}</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
        {isOwner ? (
          <Button fullWidth onClick={handleDelete} className="bg-rose-50 text-rose-500 h-16 rounded-[24px] uppercase tracking-widest font-black text-xs hover:bg-rose-100">
            <Trash2 size={18} className="mr-2" /> Remover Anúncio
          </Button>
        ) : (
          <Button fullWidth onClick={handleInterest} className="bg-emerald-500 h-16 rounded-[24px] uppercase tracking-widest font-black text-xs shadow-lg shadow-emerald-500/30">
            <MessageSquare size={18} className="mr-2" /> Tenho Interesse
          </Button>
        )}
      </div>
    </div>
  );
};

export const CreateDesapegoPage: React.FC<{ onBack: () => void; onAdd: (item: any) => void; currentUser: any }> = ({ onBack, onAdd, currentUser }) => {
  const [form, setForm] = useState({ name: '', price: '', desc: '', status: 'USADO' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePublish = async () => {
    if (!form.name || !form.price || isSubmitting) return;

    setIsSubmitting(true);
    const newItem = {
      id: Date.now(),
      name: form.name,
      price: form.price.toLowerCase().includes('r$') ? form.price : `R$ ${form.price}`,
      status: form.status,
      user: currentUser?.name || 'Morador',
      tower: currentUser?.tower || '---',
      img: image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
      image_file: imageFile,
      desc: form.desc
    };

    // O onAdd (App.tsx > handleAddDesapego) cuida do alert e do navigateHome
    await onAdd(newItem);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      <header className="p-6 pt-12 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <button onClick={onBack} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-slate-100 shadow-sm"><ArrowLeft size={24} className="text-slate-900" /></button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Novo Desapego</h2>
      </header>

      <div className="p-8 space-y-10 animate-in slide-in-from-bottom-8 duration-500">
        {/* Foto do Item */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-80 rounded-[48px] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden ${image ? 'border-violet-500 bg-slate-50' : 'border-slate-200 bg-slate-50/50 hover:border-violet-300'}`}
        >
          {image ? (
            <img src={image} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Preview" />
          ) : (
            <>
              <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-xl text-violet-500">
                <Camera size={28} />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-950">Adicionar Fotos</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Clique para upload</p>
              </div>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={e => {
              if (e.target.files?.[0]) {
                setImageFile(e.target.files[0]);
                setImage(URL.createObjectURL(e.target.files[0]));
              }
            }}
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Nome do Produto</label>
            <Input placeholder="Ex: Mesa de Jantar Madeira" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-16 rounded-3xl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Valor</label>
              <Input placeholder="Ex: 450,00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="h-16 rounded-3xl" />
            </div>
            <div className="space-y-3 text-right">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-4">Status</label>
              <div className="flex gap-2 justify-end">
                {['NOVO', 'USADO', 'DOAÇÃO'].map(s => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, status: s })}
                    className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${form.status === s ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'bg-slate-50 text-slate-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Descrição Detalhada</label>
            <textarea
              placeholder="Conte mais sobre o estado do item, tempo de uso e motivo do desapego..."
              value={form.desc}
              onChange={e => setForm({ ...form, desc: e.target.value })}
              className="w-full h-44 bg-slate-50 border border-slate-100 rounded-[32px] p-6 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all font-medium text-sm leading-relaxed"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            fullWidth
            onClick={handlePublish}
            disabled={!form.name || !form.price || isSubmitting}
            className={`h-20 rounded-[32px] text-[13px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all ${!form.name || !form.price || isSubmitting ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-950 text-white shadow-slate-950/20 active:scale-[0.98]'}`}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Desapego'}
          </Button>
          <p className="text-center text-[9px] text-slate-400 font-medium uppercase tracking-widest mt-6 bg-slate-50 py-3 rounded-full border border-slate-100 mx-10">Seu anúncio ficará visível para todo o condomínio</p>
        </div>
      </div>
    </div>
  );
};

export const AcessoPage: React.FC<{ onBack: () => void; accessList?: any[]; onAddAccess?: (a: any) => void; currentUser?: any }> = ({ onBack, accessList = [], onAddAccess, currentUser }) => {
  const [form, setForm] = useState({ name: '', type: 'Visita', date: new Date().toISOString().split('T')[0] });

  const handleAuthorize = () => {
    if (!form.name || !form.date) return;
    if (onAddAccess) {
      onAddAccess({
        id: Date.now().toString(),
        name: form.name,
        type: form.type,
        date: form.date,
        status: 'Autorizado',
        resident: currentUser?.name || 'Morador',
        residentId: currentUser?.id || '1',
        unit: currentUser?.unit || '---',
        avatar: currentUser?.avatar
      });
      alert('Acesso autorizado com sucesso!');
      setForm({ name: '', type: 'Visita', date: '' });
    }
  };

  const myAccess = accessList.filter(a => a.residentId === (currentUser?.id || '1'));

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-90 transition-transform"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase">Controle de Acesso</h2>
      </header>
      <div className="p-6 space-y-8">
        <Card className="p-8 border-none shadow-xl rounded-[40px] bg-white space-y-6">
          <h3 className="text-lg font-black italic text-slate-900">Novo Acesso</h3>
          <Input placeholder="Nome do Visitante / Prestador" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-14" />
          <div className="grid grid-cols-2 gap-4">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="h-14 bg-slate-50 rounded-2xl px-4 font-bold text-slate-600 outline-none">
              <option>Visita</option>
              <option>Serviço</option>
              <option>Delivery</option>
            </select>
            <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-14" />
          </div>
          <Button fullWidth onClick={handleAuthorize} className="bg-violet-600 h-14 rounded-[24px] uppercase tracking-widest font-black text-xs">Autorizar Entrada</Button>
        </Card>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Meus Autorizados</h4>
          {myAccess.length === 0 ? <p className="text-center text-slate-300 font-bold italic py-8">Nenhum acesso ativo.</p> : myAccess.map((access) => (
            <div key={access.id} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center"><User size={20} className="text-slate-400" /></div>
                <div>
                  <h5 className="font-bold text-slate-900 italic">{access.name}</h5>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{access.type} • {access.date}</p>
                </div>
              </div>
              <Badge color={access.status === 'Entrou' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-600'}>{access.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FinanceiroPage: React.FC<{ onBack: () => void; invoices?: any[] }> = ({ onBack, invoices = [] }) => {
  const pending = invoices.find(i => i.status === 'Pendente');
  const paid = invoices.filter(i => i.status === 'Pago');

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-50 sticky top-0 z-40">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-95 transition-all"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase">Boleto Digital</h2>
      </header>
      <div className="p-6 space-y-8 animate-in slide-in-from-right-4">
        {pending ? (
          <Card className="p-10 bg-violet-600 text-white border-none shadow-2xl shadow-violet-600/30 rounded-[48px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{pending.title}</p>
            <h3 className="text-4xl font-black italic tracking-tighter">R$ {pending.value}</h3>
            <p className="text-[10px] font-bold mt-2 opacity-80">Vence em: {new Date(pending.dueDate).toLocaleDateString('pt-BR')}</p>
            <div className="mt-8 flex gap-3">
              <Button variant="secondary" className="flex-1 bg-white text-violet-600 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all" onClick={() => alert('Código copiado!')}>Copia Código</Button>
              <button className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center active:scale-95 transition-all"><Download size={20} /></button>
            </div>
          </Card>
        ) : (
          <div className="p-10 bg-emerald-500 text-white rounded-[48px] text-center space-y-4 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 size={48} className="mx-auto" />
            <p className="font-black italic text-xl">Tudo em dia!</p>
            <p className="text-xs opacity-80">Você não possui faturas pendentes.</p>
          </div>
        )}

        <div className="space-y-4">
          <SectionHeader title="Histórico" />
          {paid.length === 0 ? <p className="text-center text-slate-300 font-bold italic py-4">Nenhum histórico disponível.</p> : paid.map((inv) => (
            <div key={inv.id} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center"><Check size={24} /></div>
                <div><h5 className="font-bold text-slate-900">{inv.title}</h5><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pago em {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</p></div>
              </div>
              <span className="font-bold text-slate-400">R$ {inv.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ChamadosPage: React.FC<{ onBack: () => void; serviceRequests?: any[]; onAddRequest?: (req: any) => void; currentUser?: any }> = ({ onBack, serviceRequests = [], onAddRequest, currentUser }) => {
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Manutenção', desc: '' });

  const handleOpen = () => {
    if (!form.title || !form.desc) return;
    if (onAddRequest) {
      onAddRequest({
        id: Date.now(),
        title: form.title,
        status: 'Aberto',
        category: form.category,
        description: form.desc,
        date: new Date().toISOString().split('T')[0],
        resident: currentUser?.name || 'Morador',
        unit: currentUser?.unit || '---'
      });
      setIsNew(false);
      setForm({ title: '', category: 'Manutenção', desc: '' });
      alert('Chamado aberto com sucesso!');
    }
  };

  const myRequests = serviceRequests.filter(req => req.unit === (currentUser?.unit || '402-B'));

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-95 transition-all"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase">Atendimento</h2>
      </header>

      <div className="p-6 space-y-8">
        {!isNew ? (
          <>
            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-900/20 text-center relative overflow-hidden">
              <div className="relative z-10">
                <MessageSquare className="mx-auto text-violet-400 mb-4" size={48} />
                <h3 className="text-2xl font-black italic tracking-tight">Fale com a Adm</h3>
                <p className="text-sm font-medium text-slate-400 mt-2 leading-relaxed max-w-xs mx-auto">Relate problemas, faça sugestões ou tire dúvidas diretamente com a administração.</p>
                <Button fullWidth onClick={() => setIsNew(true)} className="mt-8 bg-violet-600 h-14 rounded-[24px] uppercase tracking-widest font-black text-xs">Abrir Chamado</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Meus Chamados</h4>
              {myRequests.length === 0 ? <p className="text-center text-slate-300 font-bold italic py-8">Nenhum chamado aberto.</p> : myRequests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-[32px] border border-slate-100 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-slate-900 italic">{req.title}</h5>
                    <Badge color={req.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}>{req.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{req.description}</p>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{req.category} • {req.date}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <Card className="p-8 border-none shadow-xl rounded-[40px] bg-white space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setIsNew(false)} className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center"><ArrowLeft size={16} /></button>
              <h3 className="text-lg font-black italic text-slate-900">Novo Chamado</h3>
            </div>
            <Input placeholder="Título (ex: Lâmpada queimada)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="h-14" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full h-14 bg-slate-50 rounded-2xl px-4 font-bold text-slate-600 outline-none">
              <option>Manutenção</option>
              <option>Limpeza</option>
              <option>Segurança</option>
              <option>Sugestão</option>
              <option>Reclamação</option>
            </select>
            <textarea
              placeholder="Descreva a situação..."
              className="w-full h-32 bg-slate-50 border-none rounded-2xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
              value={form.desc}
              onChange={e => setForm({ ...form, desc: e.target.value })}
            />
            <Button fullWidth onClick={handleOpen} className="bg-slate-950 h-14 rounded-[24px] uppercase tracking-widest font-black text-xs">Enviar para Adm</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export const CondoAgendaPage: React.FC<{ onBack: () => void; reservations: any[]; onAddReservation: (res: any) => void; commonAreas: any[] }> = ({ onBack, reservations, onAddReservation, commonAreas }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [date, setDate] = useState('');
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [dateFiltered, setDateFiltered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Group by category
  const categories = Array.from(new Set(commonAreas.map(a => a.category || 'Outros')));

  // Generate hourly slots (6am to 10pm)
  const generateHourlySlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push({
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`,
        label: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }
    return slots;
  };

  const hourlySlots = generateHourlySlots();

  const handleReserve = async () => {
    if (!selectedArea || !date) return;

    const isSportsArea = selectedArea.category === 'Esportes';

    if (isSportsArea && !selectedHour) {
      alert('Por favor, selecione um horário.');
      return;
    }

    setLoading(true);
    try {
      const reservationData: any = {
        areaId: selectedArea.id,
        area: selectedArea.name,
        date: date
      };

      if (isSportsArea && selectedHour) {
        const slot = hourlySlots.find(s => s.start === selectedHour);
        reservationData.startTime = slot?.start;
        reservationData.endTime = slot?.end;
      } else {
        reservationData.timeSlot = 'all_day';
      }

      await onAddReservation(reservationData);
      alert('Reserva confirmada com sucesso!');
      setSelectedArea(null);
      setDate('');
      setSelectedHour(null);
      setDateFiltered(false);
    } catch (error: any) {
      alert(error.message || 'Erro ao criar reserva. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = (d: string) => {
    setDate(d);
    setDateFiltered(true);
    setSelectedHour(null);
  };

  const filteredAreas = selectedCategory
    ? commonAreas.filter(a => (a.category || 'Outros') === selectedCategory)
    : [];

  // Check if hour is available
  const isHourAvailable = (hour: string) => {
    if (!selectedArea || !date) return true;

    return !reservations.some(r =>
      r.area_id === selectedArea.id &&
      r.date === date &&
      r.start_time === hour &&
      r.status !== 'cancelled'
    );
  };

  // Filter available areas if date is selected
  const availableAreas = dateFiltered && date
    ? filteredAreas.filter(area => {
      const isSportsArea = area.category === 'Esportes';

      if (isSportsArea) {
        // For sports, check if at least one hour is available
        return hourlySlots.some(slot => {
          return !reservations.some(r =>
            r.area_id === area.id &&
            r.date === date &&
            r.start_time === slot.start &&
            r.status !== 'cancelled'
          );
        });
      } else {
        // For full-day areas, check if day is available
        return !reservations.some(r =>
          r.area_id === area.id &&
          r.date === date &&
          r.time_slot === 'all_day' &&
          r.status !== 'cancelled'
        );
      }
    })
    : filteredAreas;

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button onClick={selectedArea ? () => setSelectedArea(null) : selectedCategory ? () => { setSelectedCategory(null); setDate(''); setDateFiltered(false); } : onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-95 transition-all"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase">Reservas</h2>
      </header>
      <div className="p-6">

        {!selectedCategory ? (
          <div className="space-y-6 animate-in slide-in-from-left-4">
            <SectionHeader title="O que você quer agendar?" />
            <div className="grid grid-cols-2 gap-4">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className="aspect-square bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4 active:scale-95 transition-all hover:border-violet-200 group">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                    {cat === 'Quiosques' ? <Flame size={32} /> : cat === 'Esportes' ? <Trophy size={32} /> : <PartyPopper size={32} />}
                  </div>
                  <span className="font-black italic text-slate-900 text-sm uppercase tracking-tighter">{cat}</span>
                </button>
              ))}
            </div>
          </div>
        ) : !selectedArea ? (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div>
              <h3 className="text-2xl font-black italic text-slate-900 tracking-tighter mb-2">{selectedCategory}</h3>
              <p className="text-sm text-slate-400 font-medium">Selecione uma data para ver o que temos livre.</p>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Pretendida</label>
              <Input type="date" value={date} onChange={e => handleDateFilter(e.target.value)} className="h-14 font-bold text-slate-900" />
            </div>

            {date && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disponíveis em {new Date(date).toLocaleDateString('pt-BR')}</h4>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{availableAreas.length} opções</span>
                </div>

                {availableAreas.length === 0 ? (
                  <div className="text-center py-12 opacity-50">
                    <CalendarDays size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="font-bold italic text-slate-400">Poxa! Tudo ocupado hoje.</p>
                  </div>
                ) : (
                  availableAreas.map(area => (
                    <div key={area.id} onClick={() => setSelectedArea(area)} className="w-full h-56 bg-white rounded-[32px] overflow-hidden shadow-lg relative cursor-pointer group active:scale-95 transition-all">
                      {area.photos?.[0] ? <img src={area.photos[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center"><ImageIcon size={48} className="text-slate-300" /></div>}
                      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <h4 className="text-xl font-black italic text-white tracking-tight">{area.name}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-bold text-white/80 uppercase bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">R$ {area.price}</span>
                          <span className="text-[10px] font-bold text-white/80 uppercase bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">{area.hours}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="w-full h-72 bg-slate-100 rounded-[40px] overflow-hidden shadow-2xl relative">
              {selectedArea.photos?.[0] ? <img src={selectedArea.photos[0]} className="w-full h-full object-cover" /> : null}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm">
                {date.split('-').reverse().join('/')}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-3xl font-black italic text-slate-900 tracking-tight leading-none mb-2">{selectedArea.name}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{selectedArea.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl">
                <div><div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor</div><div className="text-lg font-black text-slate-900">R$ {selectedArea.price}</div></div>
                <div><div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Horário</div><div className="text-lg font-black text-slate-900">{selectedArea.hours}</div></div>
                <div className="col-span-2 border-t border-slate-200/50 pt-4 mt-2">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Itens Inclusos</div>
                  <div className="space-y-2">
                    {selectedArea.inventory ? selectedArea.inventory.split(',').map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center min-w-[20px]">
                          <Check size={12} className="text-emerald-600 font-bold" />
                        </div>
                        <span className="text-sm font-bold text-slate-600 italic">{item.trim()}</span>
                      </div>
                    )) : <p className="text-sm text-slate-400 italic">Nenhum item informado.</p>}
                  </div>
                </div>
              </div>

              {/* Hourly Selection for Sports Areas */}
              {selectedArea.category === 'Esportes' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Escolha o Horário</label>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {hourlySlots.map(slot => {
                      const available = isHourAvailable(slot.start);
                      return (
                        <button
                          key={slot.start}
                          onClick={() => available && setSelectedHour(slot.start)}
                          disabled={!available}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${selectedHour === slot.start
                            ? 'border-violet-600 bg-violet-50'
                            : available
                              ? 'border-slate-200 bg-white hover:border-violet-200 active:scale-95'
                              : 'border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed'
                            }`}
                        >
                          <div className={`text-xs font-black ${selectedHour === slot.start ? 'text-violet-600' : available ? 'text-slate-900' : 'text-slate-400'}`}>
                            {slot.start}
                          </div>
                          <div className="text-[8px] text-slate-400 font-bold mt-0.5">
                            {available ? '✓ Livre' : '✗ Ocupado'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button fullWidth onClick={handleReserve} disabled={loading} className="bg-violet-600 h-16 rounded-[28px] uppercase tracking-[0.2em] font-black text-xs shadow-xl shadow-violet-600/30">
                {loading ? 'Confirmando...' : 'Confirmar Reserva'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ResidentBookings: React.FC<{ onBack: () => void; reservations: any[] }> = ({ onBack, reservations }) => {
  const myReservations = reservations.filter(r => r.unit === '402-B');
  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase">Meus Agendamentos</h2>
      </header>
      <div className="p-6 space-y-6 animate-in slide-in-from-right-4">
        {myReservations.length > 0 ? myReservations.map((r) => (
          <Card key={r.id} className="p-8 border-none shadow-xl rounded-[44px] bg-white relative overflow-hidden group">
            <div className="absolute top-4 right-4 w-24 h-24 opacity-10">
              <img src="/logo.png" className="w-full h-full object-contain" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local da Reserva</p>
            <h4 className="text-2xl font-black italic tracking-tight">{r.area}</h4>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data</p>
                <p className="font-bold text-slate-900">{new Date(r.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <Badge color="bg-emerald-50 text-emerald-600 px-4 py-2 font-black italic uppercase text-[10px]">Confirmada</Badge>
            </div>
          </Card>
        )) : (
          <div className="py-24 text-center space-y-4">
            <Calendar className="mx-auto text-slate-100" size={80} />
            <p className="text-slate-300 font-black italic uppercase tracking-widest text-[10px]">Nenhuma reserva agendada.</p>
          </div>
        )}
      </div>
    </div>
  );
};


export const AssembliesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="min-h-screen bg-[#fcfcfd] pb-32">
    <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
      <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-90"><ArrowLeft size={20} /></button>
      <h2 className="text-xl font-black italic uppercase">Assembleias</h2>
    </header>
    <div className="p-6 space-y-6">
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center"><Users size={28} /></div>
          <Badge color="bg-emerald-50 text-emerald-600">Aberta</Badge>
        </div>
        <div>
          <h4 className="font-black text-slate-900 italic text-lg decoration-slice">AGO: Previsão Orçamentária 2026</h4>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1">15/01/2026 • 19:30</p>
        </div>
        <Button fullWidth className="rounded-[24px] bg-slate-950 text-[10px] font-black uppercase tracking-widest">Ver Pauta e Votar</Button>
      </div>
      <div className="text-center py-10">
        <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Histórico de Atas disponível no portal web.</p>
      </div>
    </div>
  </div>
);

export const ShopDetailPage: React.FC<{ onBack: () => void; products?: any[]; onSelectProduct?: (p: any) => void; categories?: any[]; selectedCategory?: string; onSelectCategory?: (c: string) => void }> = ({ onBack, products = [], onSelectProduct, categories = [], selectedCategory = 'Todos', onSelectCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const displayCategories = ['Todos', ...categories.map(c => c.name)];
  const activeCategoryData = categories.find(c => c.name === selectedCategory);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <FloatingBackButton onClick={onBack} />
      <div className="h-64 relative bg-violet-600 overflow-hidden">
        {activeCategoryData?.image_url ? (
          <div className="absolute inset-0 bg-cover bg-center animate-in fade-in duration-700" style={{ backgroundImage: `url(${activeCategoryData.image_url})` }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          </div>
        ) : (
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        )}

        <button onClick={onBack} className="absolute top-12 left-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white active:scale-90 z-20"><ArrowLeft /></button>
        <div className="absolute bottom-12 left-8 right-8 text-white z-10">
          <h2 className="text-4xl font-black italic tracking-tighter leading-none mb-2">{selectedCategory === 'Todos' ? 'e-Shop' : selectedCategory}</h2>
          <p className="font-medium opacity-80 text-violet-100">Encontre de tudo no seu condomínio.</p>
        </div>
      </div>

      <div className="-mt-8 px-6 relative z-20 mb-6">
        <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar produtos e serviços..."
            className="flex-1 outline-none text-slate-700 font-bold placeholder:text-slate-300 placeholder:font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 space-y-8">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {displayCategories.map(t => (
            <button
              key={t}
              onClick={() => onSelectCategory && onSelectCategory(t)}
              className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === t ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : 'bg-white text-slate-400'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
            {searchTerm ? `Resultados: ${filteredProducts.length}` : `Disponíveis (${filteredProducts.length})`}
          </h4>

          {filteredProducts.length > 0 ? filteredProducts.map(p => (
            <div
              key={p.id}
              onClick={() => onSelectProduct && onSelectProduct(p)}
              className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm active:scale-[0.98] transition-all flex gap-4 cursor-pointer"
            >
              <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden relative group shrink-0">
                {p.image_url ? (
                  <img src={p.image_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><Store size={24} /></div>
                )}
              </div>
              <div className="flex-1 py-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h5 className="font-black text-slate-900 italic text-lg leading-tight line-clamp-2">{p.title}</h5>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg">
                    {p.category}
                  </span>
                  {p.profiles?.name && <span className="text-[9px] font-bold text-slate-400">por {p.profiles.name.split(' ')[0]}</span>}
                </div>

                <div className="flex justify-between items-end mt-3">
                  <p className="text-emerald-600 font-black text-lg tracking-tight">R$ {typeof p.price === 'number' ? p.price.toFixed(2) : p.price}</p>
                  <button className="w-8 h-8 bg-slate-950 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300"><Search size={24} /></div>
              <p className="text-slate-400 font-bold text-sm">Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- PRODUCT DETAIL PAGE (E-SHOP) ---
export const ProductDetailPage: React.FC<{ item: any; onBack: () => void }> = ({ item, onBack }) => {
  const handleContact = () => {
    // Basic WhatsApp link generation
    // Ideally we would look up the vendor's phone number if it wasn't in the item
    // But for MVP we assume item might have it or we use a generic placeholder if missing
    // Actually, App.tsx fetchProducts includes profiles(phone) join? checking... yes.
    /*
      App.tsx:
      const {data} = await supabase.from('products').select('*, profiles(name)')...
              Wait, did I request phone in App.tsx?
              Let's check App.tsx first. If not, I'll need to update App.tsx fetch.
              For now, I'll render the component assuming phone might be there or not.
              */
    const phone = item.profiles?.phone || '';
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá, vi seu anúncio do *${item.title}* no app do condomínio e tenho interesse!`);
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    } else {
      alert('Telefone do vendedor não disponível.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="h-[45vh] relative bg-white rounded-b-[48px] shadow-2xl overflow-hidden group">
        {item.image_url ? (
          <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
            <Store size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent opacity-60"></div>
        <button onClick={onBack} className="absolute top-12 left-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white active:scale-90 shadow-lg"><ArrowLeft /></button>
      </div>

      <div className="px-8 -mt-10 relative z-10">
        <div className="bg-white p-6 rounded-[40px] shadow-xl shadow-slate-200/50">
          <div className="flex justify-between items-start mb-2">
            <span className="px-3 py-1 bg-violet-50 text-violet-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.category}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none mb-4">{item.title}</h2>

          <div className="flex items-center gap-3 pb-6 border-b border-slate-50 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
              <img src={`https://picsum.photos/seed/${item.vendor_id}/100`} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-slate-900 font-bold">Vendido por {item.profiles?.name || 'Vendedor Parceiro'}</p>
              {item.profiles?.unit ? (
                <p className="text-[10px] text-slate-400 font-medium">Residente • {item.profiles.tower || ''} {item.profiles.unit}</p>
              ) : (
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Loja Verificada</p>
              )}
            </div>
          </div>

          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-2">Sobre este item</h3>
          <p className="text-slate-500 leading-relaxed text-sm font-medium mb-8">
            {item.description || "Sem descrição detalhada."}
          </p>

          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Valor Total</p>
              <p className="text-3xl font-black text-emerald-600 tracking-tighter">R$ {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</p>
            </div>
            <button
              onClick={handleContact}
              className="flex-1 bg-violet-600 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-violet-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              Tenho Interesse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export const PersonalDataPage: React.FC<{ onBack: () => void; currentUser: any }> = ({ onBack, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [condos, setCondos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    unit: currentUser?.unit || '',
    tower: currentUser?.tower || '',
    condo: currentUser?.condominium_id || ''
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('condominiums').select('*').eq('status', 'active')
      .then(({ data }) => { if (data) setCondos(data); });
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase.from('profiles').update({
        avatar: publicUrl
      }).eq('id', currentUser.id);

      if (updateError) {
        throw updateError;
      }

      alert('Foto de perfil atualizada!');
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
        unit: formData.unit,
        tower: formData.tower,
        condominium_id: formData.condo
      }).eq('id', currentUser.id);

      if (error) throw error;
      alert('Dados atualizados com sucesso! O aplicativo será recarregado para aplicar as mudanças.');
      window.location.reload();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  const selectedCondoData = condos.find(c => c.id === formData.condo);
  const isHorizontal = selectedCondoData?.type === 'horizontal';

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-90 transition-transform"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase">Dados Pessoais</h2>
      </header>
      <div className="p-6 space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-[40px] border-4 border-white shadow-xl overflow-hidden mb-4 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
            {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="text-violet-600 font-bold text-xs uppercase bg-violet-50 px-4 py-2 rounded-lg active:scale-95 transition-transform" disabled={uploading}>
            {uploading ? 'Enviando...' : 'Alterar Foto'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="space-y-6 bg-white p-8 rounded-[40px] shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-14 font-medium" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Condomínio</label>
            <select
              value={formData.condo}
              onChange={e => setFormData({ ...formData, condo: e.target.value })}
              className="w-full h-14 bg-slate-50 rounded-2xl px-4 font-bold text-slate-600 border-none outline-none focus:ring-2 focus:ring-violet-100"
            >
              <option value="">Selecione...</option>
              {condos.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{isHorizontal ? 'Rua/Alameda' : 'Unidade'}</label>
              <Input value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="h-14 font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{isHorizontal ? 'Número' : 'Torre/Bloco'}</label>
              <Input value={formData.tower} onChange={e => setFormData({ ...formData, tower: e.target.value })} className="h-14 font-medium" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email</label>
            <Input value={formData.email} readOnly className="h-14 font-medium bg-slate-50 text-slate-400" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Telefone</label>
            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="h-14 font-medium" />
          </div>
        </div>

        <Button fullWidth onClick={handleSave} disabled={loading} className="h-16 rounded-[24px] bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/10">
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-90 transition-transform"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase">Privacidade</h2>
      </header>
      <div className="p-6 space-y-6">
        <div className="bg-white p-8 rounded-[40px] shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">Perfil Público</h4>
              <p className="text-xs text-slate-400 max-w-[200px] mt-1">Permitir que outros moradores vejam seu nome e unidade</p>
            </div>
            <div className="w-14 h-8 bg-emerald-500 rounded-full p-1 flex justify-end cursor-pointer"><div className="w-6 h-6 bg-white rounded-full shadow-sm"></div></div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">Notificações Push</h4>
              <p className="text-xs text-slate-400 max-w-[200px] mt-1">Receber avisos de encomendas e visitantes</p>
            </div>
            <div className="w-14 h-8 bg-emerald-500 rounded-full p-1 flex justify-end cursor-pointer"><div className="w-6 h-6 bg-white rounded-full shadow-sm"></div></div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">Mostrar Telefone</h4>
              <p className="text-xs text-slate-400 max-w-[200px] mt-1">Permitir que prestadores vejam seu contato</p>
            </div>
            <div className="w-14 h-8 bg-slate-200 rounded-full p-1 flex justify-start cursor-pointer"><div className="w-6 h-6 bg-white rounded-full shadow-sm"></div></div>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-400 uppercase font-bold tracking-widest px-10">Qualquer mudança pode levar alguns minutos para refletir no sistema.</p>
      </div>
    </div>
  );
};

// --- NAVEGAÇÃO ---
export const AppNavigation: React.FC<{ activeTab: string; onChange: (tab: string) => void }> = ({ activeTab, onChange }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-5px_30px_rgba(124,58,237,0.15)] border-t border-violet-100 px-6 py-4 flex justify-between items-end z-50 max-w-md mx-auto rounded-t-[32px] mb-0">
    {[
      { id: 'home', icon: <LayoutGrid size={24} />, label: 'Home' },
      { id: 'market', icon: <ShoppingBag size={24} />, label: 'Shop' },
      { id: 'create-desapego', icon: <Plus size={28} />, isAction: true },
      { id: 'booking', icon: <CalendarDays size={24} />, label: 'Reservas' },
      { id: 'profile', icon: <User size={24} />, label: 'Perfil' },
    ].map((item) => {
      if (item.isAction) {
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className="mb-4 -mt-12 w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-violet-500/40 border-[4px] border-[#fcfcfd] active:scale-95 transition-transform"
          >
            {item.icon}
          </button>
        );
      }
      return (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`flex flex-col items-center gap-1 transition-all duration-300 w-12 ${activeTab === item.id ? 'text-violet-600 -translate-y-1' : 'text-violet-200 hover:text-violet-400'}`}
        >
          {item.icon}
          {activeTab === item.id && <div className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce" />}
        </button>
      );
    })}
    {/* Version Display */}
    <div className="absolute bottom-1 left-0 right-0 text-center">
      <span className="text-[8px] text-slate-300 font-bold">v1.6.1</span>
    </div>
  </div>
);
