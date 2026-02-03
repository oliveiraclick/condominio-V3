import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Sheet } from '../components/design-system/Sheet';
import { DSButton } from '../components/design-system/Button';
import { DSInput } from '../components/design-system/Input';
import { DSSelect } from '../components/design-system/Select';
import { Title, Text } from '../components/design-system/Typography';
import { Card as DSCard } from '../components/design-system/Card';
import { colors, radius, spacing, shadow } from '../components/design-system/tokens';

// Legacy imports to keep app running during refactor
// Legacy imports removed
// import { Card, Badge, Button, Input } from '../components/ui';

import {
  Bell, Search, MapPin, Grid, Calendar, ShoppingBag,
  User, Plus, Package, Key, Zap, CreditCard, Home,
  Sparkles, Star, ChevronRight, ChevronLeft, Tag, XCircle,
  Users, ArrowLeft, MoreHorizontal, Filter, Droplets, Paintbrush,
  Leaf, Car, Wrench, Phone, Monitor, LayoutGrid, Scissors, Utensils,
  Coffee, ShoppingCart, HeartPulse, PawPrint, Megaphone,
  QrCode, Unlock, History, AlertCircle, FileText, Copy, CheckCircle2,
  Settings, LogOut, ShieldCheck, Wallet, HelpCircle, UserCheck,
  CalendarDays, Check, HardHat, Hammer, UserPlus, Briefcase, ListFilter, PartyPopper,
  Trophy, Target, Dumbbell, GlassWater, Waves, Store, Heart, Navigation, Activity,
  MessageSquare, Send, Paperclip, Mic, MoreVertical, CheckCheck, Award, Quote, Camera, MessageCircle,
  Image as ImageIcon, X, Clock, MapPinned, Trash2, Share2, UserCircle2, Flame,
  Building2, Camera as CameraIcon, Download, Scan, Handshake, BadgeCheck, Menu, ChevronDown
} from 'lucide-react';
import { maskPhone } from '../utils/masks';
import { translateError } from '../utils/errorTranslator';
import { QRCodeSVG } from 'qrcode.react';
import { PackageScanner } from '../components/PackageScanner';
import { CommunicationHub } from './CommunicationHub';
import { ProfessionalSector, ProfessionalProfile, UserRole } from '../types';
import { supabase } from '../supabase';
import { CalendarPicker } from '../components/CalendarPicker';
import { NewsTicker } from '../components/NewsTicker';

import { AppFeedbackModal } from '../components/AppFeedbackModal';
import { ResidentHeader } from '../components/ResidentHeader';
import { BiometricService } from '../services/BiometricService';
import { Fingerprint } from 'lucide-react';
import { SpaceReservationFlow } from '../components/SpaceReservationFlow';


// --- COMPONENTES DE APOIO ---
export const FloatingBackButton: React.FC<{ onClick: () => void; visible?: boolean }> = ({ onClick, visible = true }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 100);
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
      className={`fixed bottom-24 right-6 w-14 h-14 bg-brand-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 transform ${show && visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        } active:scale-95 hover:bg-brand-700 active:bg-brand-800`}
    >
      <ArrowLeft size={24} />
    </button>
  );
};

export const SectionHeader: React.FC<{ title: string; onAction?: () => void; actionLabel?: string }> = ({ title, onAction, actionLabel }) => (
  <div className="flex justify-between items-end mb-6 px-1">
    <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none">{title}</h3>
    {actionLabel && (
      <button onClick={onAction} className="text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 px-4 py-2 rounded-xl active:scale-95 transition-all">
        {actionLabel}
      </button>
    )}
  </div>
);

// --- NOTIFICATIONS MODAL ---
export const NotificationsModal: React.FC<{ isOpen: boolean; onClose: () => void; currentUser: any; onUpdate?: () => void }> = ({ isOpen, onClose, currentUser, onUpdate }) => {
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
    // Optimistic UI Update
    setNotifications(prev => prev.filter(n => n.id !== id));

    // Persist to DB
    const { error } = await supabase.from('notification_reads').insert({
      notification_id: id,
      user_id: currentUser.id
    });
    if (!error && onUpdate) onUpdate();
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onClose={onClose} title="Notificações">
      <div className="space-y-4 pb-6">
        {loading ? (
          <div className="text-center py-8">
            <Text variant="caption" style={{ color: colors.neutral[500] }}>Carregando...</Text>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 space-y-4 opacity-50">
            <Bell size={48} className="mx-auto" style={{ color: colors.neutral[300] }} />
            <Text variant="body" weight="bold" style={{ color: colors.neutral[400] }}>Tudo limpo por aqui!</Text>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} style={{
              backgroundColor: 'white',
              padding: spacing.md,
              borderRadius: radius.lg,
              border: `1px solid ${colors.neutral[100]}`,
              position: 'relative',
              boxShadow: shadow.sm
            }}>
              <div className="flex gap-3">
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor: n.type === 'package' ? colors.brand[100] :
                    n.type === 'access' ? colors.success ? colors.success + '20' : '#dcfce7' : // Fallback if success color is strictly hex
                      colors.neutral[100],
                  color: n.type === 'package' ? colors.brand[600] :
                    n.type === 'access' ? colors.success || '#16a34a' :
                      colors.neutral[600]
                }}>
                  {n.type === 'package' ? <Package size={20} /> :
                    n.type === 'access' ? <Key size={20} /> :
                      n.type === 'notice' ? <Megaphone size={20} /> :
                        <Bell size={20} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <Text variant="body" weight="bold" style={{ color: colors.neutral[800], marginBottom: 4, lineHeight: 1.2 }}>{n.title}</Text>
                  <Text variant="caption" style={{ color: colors.neutral[500], marginBottom: 8, display: 'block' }}>{n.message}</Text>
                  <Text variant="caption" style={{ color: colors.neutral[400], fontSize: 10 }}>
                    {new Date(n.created_at).toLocaleDateString('pt-BR')} às {new Date(n.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </div>
                <button onClick={() => markAsRead(n.id)} style={{ position: 'absolute', top: 8, right: 8, padding: 8, color: colors.neutral[400] }}>
                  <CheckCircle2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Sheet>
  );
};

// --- AUTHORIZATION MODAL ---
export const AuthorizationModal: React.FC<{ isOpen: boolean; onClose: () => void; currentUser: any }> = ({ isOpen, onClose, currentUser }) => {
  const [authorizations, setAuthorizations] = useState<any[]>([]);
  const [manualEntry, setManualEntry] = useState({ tower: '', unit: '' }); // Changed to manual entry
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAuthorizations();
    }
  }, [isOpen]);

  const loadAuthorizations = async () => {
    const { data } = await supabase
      .from('package_authorizations')
      .select('*, grantee:grantee_id(id, name, unit, tower)')
      .eq('grantor_id', currentUser.id)
      .eq('status', 'active');

    if (data) setAuthorizations(data);
  };

  const authorizeByAddress = async () => {
    if (!manualEntry.tower || !manualEntry.unit) {
      alert('Preencha Rua e Casa!');
      return;
    }

    setLoading(true);

    try {
      // 1. Find the neighbor by address
      const { data: neighbors } = await supabase
        .from('profiles')
        .select('id, name, unit, tower')
        .eq('role', 'resident')
        .eq('tower', manualEntry.tower)
        .eq('unit', manualEntry.unit)
        .neq('id', currentUser.id); // Cannot authorize self

      if (!neighbors || neighbors.length === 0) {
        alert('Morador não encontrado neste endereço.');
        setLoading(false);
        return;
      }

      // If multiple people live there (e.g. husband/wife), we authorize ALL of them or just ask user?
      // For simplicity/security, let's authorize the first one found or handled better.
      // Actually, typically we authorize a specific person, but here we can authorize the first valid profile found at that address.
      // Let's list found residents if > 1, or just pick the first.

      const neighbor = neighbors[0]; // Picking the first verified resident at that address

      // 2. Check overlap
      const exists = authorizations.find(a => a.grantee_id === neighbor.id);
      if (exists) {
        alert(`O morador ${neighbor.name} (Rua ${neighbor.tower} - ${neighbor.unit}) já está autorizado.`);
        setLoading(false);
        return;
      }

      // 3. Insert Authorization
      const { error } = await supabase.from('package_authorizations').insert([{
        grantor_id: currentUser.id,
        grantee_id: neighbor.id,
        status: 'active'
      }]);

      if (error) throw error;

      alert(`Autorizado com sucesso: ${neighbor.name}`);
      setManualEntry({ tower: '', unit: '' });
      loadAuthorizations();

    } catch (err: any) {
      alert(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  const revokeAuthorization = async (id: string) => {
    await supabase.from('package_authorizations').update({ status: 'revoked' }).eq('id', id);
    loadAuthorizations();
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onClose={onClose} title="Autorizar Vizinho">
      <div className="space-y-6 pb-6">
        <div className="bg-slate-50 p-6 rounded-[24px] mb-4 space-y-4 border border-slate-100">
          <Title variant="section" align="left">Adicionar Novo</Title>
          <div className="flex gap-2 items-end">
            <div className="space-y-2 flex-1">
              <DSInput
                placeholder="Rua (Ex: 1)"
                value={manualEntry.tower}
                onChange={e => setManualEntry({ ...manualEntry, tower: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="space-y-2 flex-1">
              <DSInput
                placeholder="Casa (Ex: 460)"
                value={manualEntry.unit}
                onChange={e => setManualEntry({ ...manualEntry, unit: e.target.value })}
                className="bg-white"
              />
            </div>
            <DSButton
              onClick={authorizeByAddress}
              disabled={loading}
              variant="primary"
              style={{ width: 56, height: 56, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={24} strokeWidth={3} />}
            </DSButton>
          </div>
        </div>

        <div className="space-y-4">
          <Title variant="section" align="left">Autorizações Ativas</Title>
          {authorizations.length === 0 ? (
            <div className="text-center py-8">
              <Text variant="caption" style={{ color: colors.neutral[400] }}>Ninguém autorizado.</Text>
            </div>
          ) : (
            authorizations.map(auth => (
              <div key={auth.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div>
                  <h5 className="font-bold text-slate-800 text-sm">{auth.grantee?.name}</h5>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">RUA {auth.grantee?.tower}, {auth.grantee?.unit}</p>
                </div>
                <button onClick={() => revokeAuthorization(auth.id)} className="text-rose-500 bg-rose-50 p-2 rounded-xl active:scale-95 hover:bg-rose-100 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Sheet>
  );
};

export const DigitalIDModal: React.FC<{ isOpen: boolean; onClose: () => void; currentUser: any; onOpenAuth: () => void }> = ({ isOpen, onClose, currentUser, onOpenAuth }) => {
  if (!isOpen) return null;

  const qrValue = `RESIDENT:${currentUser?.id}`;

  return (
    <Sheet open={isOpen} onClose={onClose} title="Id Individual">
      <div className="relative flex flex-col items-center pb-8">
        <div className="w-24 h-24 rounded-[28px] p-1 bg-white shadow-xl mb-4 mt-2 ring-4 ring-slate-50 z-10">
          <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full rounded-[24px] object-cover bg-slate-50" />
        </div>

        <Title size="xl" style={{ marginBottom: 4 }}>{currentUser?.name}</Title>

        <Text variant="caption" weight="bold" style={{ textTransform: 'uppercase', color: colors.neutral[500], letterSpacing: 1 }}>
          {currentUser?.unit?.toString().toUpperCase().includes('RUA')
            ? `${currentUser.unit}, ${currentUser.tower}`
            : `Rua: ${currentUser?.unit || ''} - Torre: ${currentUser?.tower || ''}`
          }
        </Text>

        <div className="p-4 bg-white rounded-[24px] shadow-sm my-6 border border-slate-100 ring-4 ring-slate-50">
          <QRCodeSVG value={qrValue} size={180} />
        </div>

        <Text variant="caption" style={{ textAlign: 'center', maxWidth: 220, marginBottom: 24, color: colors.neutral[500] }}>
          Apresente este código na portaria para retirar suas encomendas com segurança.
        </Text>

        <DSButton
          onClick={onOpenAuth}
          fullWidth
          variant="primary"
          startIcon={<Users size={18} />}
          style={{ backgroundColor: '#7C3AED', borderColor: '#7C3AED' }}
        >
          Autorizar Vizinho
        </DSButton>
      </div>
    </Sheet>
  );
};

export const MuralDemandModal: React.FC<{ isOpen: boolean; onClose: () => void; onPost: (category: string, description: string) => void; categories: string[] }> = ({ isOpen, onClose, onPost, categories }) => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!category || !description) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    await onPost(category, description);
    setLoading(false);
    onClose();
    setCategory('');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onClose={onClose} title="Publicar no Mural">
      <div className="space-y-6 pb-6">
        <div>
          <Title variant="section" align="left">O que você precisa?</Title>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${category === cat ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Title variant="section" align="left">Dê mais detalhes</Title>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-[24px] p-5 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 placeholder-slate-400 mt-2"
            placeholder="Ex: Preciso consertar uma torneira na cozinha amanhã de manhã..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <DSButton fullWidth variant="primary" onClick={handleSubmit} loading={loading}>
          Publicar Agora
        </DSButton>
      </div>
    </Sheet>
  );
};

export const DesapegoCard: React.FC<{ item: any; onClick: () => void }> = ({ item, onClick }) => {
  return (
    <DSCard
      onClick={onClick}
      className={`p-0 overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/60 rounded-[40px] bg-white group transition-all cursor-pointer active:scale-[0.98]`}
      style={{ padding: 0 }}
    >
      <div className="relative h-72 p-5">
        <img src={item.img} className="w-full h-full object-cover rounded-[32px] group-hover:scale-105 transition-transform duration-700" alt={item.name} />
        <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-md px-5 py-3 rounded-[20px] shadow-xl border border-slate-200">
          <p className="text-lg font-black text-slate-900 tracking-tighter">{item.price}</p>
        </div>
      </div>
      <div className="p-8 pt-2">
        <h4 className="font-black text-xl text-slate-900 mb-2 tracking-tighter italic truncate">{item.name}</h4>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 shadow-sm bg-slate-100">
            <img src={item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user}`} className="w-full h-full object-cover" alt="User" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{item.user} <span className="text-brand-600">
              {item.unit && item.unit.toUpperCase().includes('CASA')
                ? `, Rua ${item.tower}, ${item.unit.replace(/casa/i, '').trim()}`
                : item.tower ? `, ${item.tower} - ${item.unit}` : ''}
            </span></p>
          </div>
        </div>

        <DSButton
          onClick={onClick}
          fullWidth
          variant="primary"
          style={{ borderRadius: 24, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', backgroundColor: colors.success, boxShadow: `0 10px 20px -10px ${colors.success}` }}
        >
          <span className="flex items-center gap-2 justify-center">
            <MessageSquare size={16} />
            Ver Detalhes
          </span>
        </DSButton>
      </div>
    </DSCard>
  );
};

// --- HOME DO MORADOR ---
// --- REVIEW MODAL ---
export const ReviewModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (rating: number, comment: string) => void; proName: string }> = ({ isOpen, onClose, onSubmit, proName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onClose={onClose} title="Avaliar Serviço" height="auto">
      <div className="text-center space-y-4 pb-6">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-amber-500/20 border border-amber-500/20">
          <Star size={32} fill="currentColor" />
        </div>
        <Text variant="body" style={{ color: colors.neutral[500] }}>Como foi o atendimento de <span className="font-bold text-slate-900">{proName}</span>?</Text>

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
          className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-amber-400 transition-all font-medium text-slate-900 placeholder-slate-400"
        />

        <DSButton onClick={() => onSubmit(rating, comment)} fullWidth variant="warning" size="lg">
          Enviar Avaliação
        </DSButton>
      </div>
    </Sheet>
  );
};


export const ProfessionalDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; professional: any }> = ({ isOpen, onClose, professional }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);

  // Mock data to match the design EXACTLY where real data is missing
  const MOCK = {
    timeInCondo: '4 anos',
    servicesCount: '120+',
    images: [
      'https://images.unsplash.com/photo-1540932296774-84d48ed32c36?auto=format&fit=crop&q=80&w=400', // Lamp
      'https://images.unsplash.com/photo-1558402529-d2638a7023e9?auto=format&fit=crop&q=80&w=400', // Panel
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400'  // Tools
    ]
  };

  useEffect(() => {
    if (isOpen && professional?.id) {
      fetchData();
    }
  }, [isOpen, professional]);

  const fetchData = async () => {
    // Fetch Rating
    const { data: ratingData } = await supabase.from('reviews').select('rating').eq('target_id', professional.id);
    if (ratingData && ratingData.length > 0) {
      const avg = ratingData.reduce((acc, curr) => acc + curr.rating, 0) / ratingData.length;
      setRating(avg);
      setReviewsCount(ratingData.length);
    } else {
      setRating(4.9); // Mock default high rating for UI match if none
      setReviewsCount(15);
    }

    // Fetch Reviews List
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, reviewer:reviewer_id(name)')
      .eq('target_id', professional.id)
      .order('created_at', { ascending: false });

    if (reviewsData) {
      setReviews(reviewsData);
    }
  };

  if (!isOpen || !professional) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white sm:max-w-md sm:mx-auto flex flex-col h-full animate-in slide-in-from-bottom-5">
      {/* 1. HEADER CUSTOMIZADO */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-50 sticky top-0 bg-white z-20">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-brand-600 hover:bg-slate-100 active:scale-95 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Perfil do Prestador</span>
        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-brand-600 hover:bg-slate-100 active:scale-95 transition-transform">
          <Share2 size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        {/* 2. HERO SECTION */}
        <div className="flex flex-col items-center pt-6 px-6 text-center">
          {/* Avatar with Status Dot */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full p-1 bg-white shadow-xl shadow-slate-200">
              <img
                src={professional.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${professional.name}`}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {/* Green Dot */}
            <div className="absolute bottom-2 right-1 w-6 h-6 bg-emerald-500 rounded-full border-[3px] border-white" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">{professional.name}</h1>

          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={14} className="text-brand-600 fill-brand-600" />
            <span className="text-brand-600 font-bold text-sm">{professional.category || 'Prestador Verificado'}</span>
          </div>

          <p className="text-sm text-slate-400 font-medium mb-6">
            {professional.company_name ? `Sócio-proprietário da ${professional.company_name}` : 'Profissional Autônomo'}
          </p>

          {/* Social Proof Pill */}
          <div className="bg-purple-100 rounded-full px-6 py-2 mb-8 flex items-center justify-center gap-[-8px]">
            {/* Mock Avatars */}
            <div className="flex -space-x-2 mr-3">
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" /></div>
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" /></div>
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" /></div>
            </div>
            <span className="text-[10px] font-black text-brand-600 uppercase tracking-tight">Recomendado por {reviewsCount} vizinhos</span>
          </div>

          {/* 3. STATS ROW */}
          <div className="w-full grid grid-cols-3 gap-3 mb-8">
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-3 flex flex-col items-center justify-center h-24">
              <span className="text-brand-600 font-black text-lg mb-1">{MOCK.timeInCondo}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase text-center leading-tight">No Condomínio</span>
            </div>
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-3 flex flex-col items-center justify-center h-24">
              <span className="text-brand-600 font-black text-lg mb-1">{MOCK.servicesCount}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase text-center leading-tight">Serviços</span>
            </div>
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-3 flex flex-col items-center justify-center h-24">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-brand-600 font-black text-lg">{rating?.toFixed(1) || '4.9'}</span>
                <Star size={12} className="text-brand-600 fill-brand-600 mb-1" />
              </div>
              <span className="text-[9px] text-slate-400 font-bold uppercase text-center leading-tight">Avaliação</span>
            </div>
          </div>
        </div>

        {/* 4. CONTENT SECTIONS */}
        <div className="px-6 space-y-8">

          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Sobre o Profissional</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {professional.description || 'Especialista em instalações elétricas residenciais com foco em automação e segurança. Atuo no Splendido há 4 anos, garantindo serviços rápidos, limpos e com garantia total. Conheço toda a infraestrutura elétrica das torres.'}
            </p>
          </div>

          {/* Trust Seal */}
          <div className="bg-brand-50 rounded-2xl p-4 flex items-center gap-4 border border-brand-100">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-200">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-brand-900 text-sm mb-0.5">Selo de Confiança Splendido</h4>
              <p className="text-xs text-brand-700/80 font-medium">Cadastro ativo na portaria e documentos verificados.</p>
            </div>
          </div>

          {/* Portfolio / Services */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold text-slate-900">Serviços no Prédio</h3>
              <button className="text-brand-600 text-xs font-bold hover:underline">Ver todos</button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar snap-x">
              {MOCK.images.map((img, i) => (
                <div key={i} className="min-w-[140px] h-32 rounded-2xl overflow-hidden shadow-md snap-start">
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Avaliações Recentes</h3>
            {reviews.length > 0 ? (
              <div className="w-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{reviews[0].reviewer?.name || 'Dona Maria'}</span>
                    <span className="bg-slate-100 text-slate-500 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase">APT 12</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill={s <= (reviews[0].rating || 5) ? "currentColor" : "none"} />)}
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic leading-relaxed">
                  "{reviews[0].comment || 'Excelente profissional, muito educado e deixou tudo limpo. Instalou os lustres da sala perfeitamente.'}"
                </p>
              </div>
            ) : (
              // Mock Review if empty
              <div className="w-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Dona Maria</span>
                    <span className="bg-slate-100 text-slate-500 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase">APT 12</span>
                  </div>
                  <div className="flex text-amber-400">
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic leading-relaxed">
                  "Excelente profissional, muito educado e deixou tudo limpo. Instalou os lustres da sala perfeitamente."
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 sm:max-w-md sm:mx-auto z-40 pb-safe">
        <div className="flex gap-3">
          <button
            className="flex-1 bg-brand-600 text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-200 active:scale-[0.98] transition-all"
            onClick={() => alert('Agendamento iniciado')}
          >
            <Calendar size={20} />
            AGENDAR VISITA
          </button>
          <button
            className="w-14 h-14 bg-white border-2 border-brand-100 text-brand-600 rounded-2xl flex items-center justify-center active:scale-[0.98] transition-all"
            onClick={() => {
              const phone = professional.phone ? professional.phone.replace(/\D/g, '') : '';
              if (phone) window.open(`https://wa.me/55${phone}`, '_blank');
              else alert('Telefone indisponível');
            }}
          >
            <MessageSquare size={24} />
          </button>
        </div>
        {/* Trust text */}
        <div className="flex items-center justify-center gap-1.5 mt-3 opacity-60">
          <ShieldCheck size={12} className="text-slate-400" />
          <span className="text-[10px] text-slate-400 font-medium">Pagamento liberado apenas após aprovação</span>
        </div>
      </div>

    </div>
  );
};


export const ResidentHome: React.FC<{
  onNavigate: (target: string) => void;
  onSelectCategory: (cat: string, search?: string) => void;
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
  onPostMuralDemand: (category: string, description: string) => void;
  muralCategories: string[];
  activeTab?: string;
}> = ({ onNavigate, onSelectCategory, packages = [], setPackages, desapegos = [], currentUser, notifications = [], serviceRequests = [], activeServices = [], onSelectDesapego, products = [], onSelectProduct, onSitePros = [], onPostMuralDemand, muralCategories, categories = [], activeTab, onClearNotifications }) => {
  const [selectedPro, setSelectedPro] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentDesapegoIndex, setCurrentDesapegoIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<'prestadores' | 'gestao'>('prestadores');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequestToReview, setSelectedRequestToReview] = useState<any>(null);
  const [homeSearch, setHomeSearch] = useState('');
  const [muralOpen, setMuralOpen] = useState(false);
  const [digitalIdOpen, setDigitalIdOpen] = useState(false);
  const [showPackageAlert, setShowPackageAlert] = useState(false); // Controls Banner
  const [showPackageModal, setShowPackageModal] = useState(false); // Controls Modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [localPackages, setLocalPackages] = useState<any[]>([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Random Initial Index & Auto-Rotation for Desapego
  useEffect(() => {
    if (desapegos.length > 0) {
      // 1. Random Start (Only if not already set/interacted - simple approach: just randomize on mount/change)
      // Actually, standard practice is to just start random
      setCurrentDesapegoIndex(Math.floor(Math.random() * desapegos.length));

      // 2. Auto Rotation
      const interval = setInterval(() => {
        setCurrentDesapegoIndex(prev => (prev === desapegos.length - 1 ? 0 : prev + 1));
      }, 5000); // 5 seconds

      return () => clearInterval(interval);
    }
  }, [desapegos.length]); // Depend only on length to avoid reset on index change

  // OPTIMIZATION: Removed redundant fetch. Now uses 'packages' prop from App.tsx.
  // Real-time subscription kept for instant updates (Handshake)
  useEffect(() => {
    if (!currentUser?.id) return;

    // Check prop for Alert
    const pending = packages.filter(p => p.status === 'pending' || p.status === 'awaiting_confirmation');
    if (pending.length > 0) {
      setShowPackageAlert(true);
      if (pending.some(p => p.status === 'awaiting_confirmation')) {
        setShowPackageModal(true);
      } else {
        const hasSeenModal = sessionStorage.getItem('hasSeenPackageModal');
        if (!hasSeenModal) {
          setShowPackageModal(true);
          sessionStorage.setItem('hasSeenPackageModal', 'true');
        }
      }
    } else {
      setShowPackageAlert(false);
    }

    // Real-time Subscription (Optional: could also be lifted, but keeping here for focused UI update)
    const channel = supabase
      .channel('resident-packages-home')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'packages'
      }, (payload) => {
        const isMine = payload.new.resident_id === currentUser.id || payload.new.picked_up_by === currentUser.id;
        if (isMine && payload.new.status === 'awaiting_confirmation') {
          setShowPackageModal(true);
          setShowPackageAlert(true);
        }
        // Ideally we should call onRefresh() to update App state
        if (isMine && onClearNotifications) onClearNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser, packages]); // Added packages dependency

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleHomeSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && homeSearch.trim()) {
      onSelectCategory('Todos', homeSearch.trim());
    }
  };

  const handleConfirmHandshake = async (pkgId: string) => {
    const { error } = await supabase.rpc('resident_confirm_receipt', {
      p_package_id: pkgId
    });

    if (!error) {
      alert('Entrega confirmada! Obrigado.');
      // Refresh
      if (onClearNotifications) onClearNotifications();
    } else {
      alert(translateError(error));
    }
  };

  // Filter for completed requests that haven't been reviewed (Database-backed check)
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
      // Mark request as reviewed in DB
      await supabase.from('service_requests').update({ reviewed: true }).eq('id', selectedRequestToReview.id);

      alert('Avaliação enviada com sucesso! Obrigado.');
      setReviewModalOpen(false);
      // Refresh local data if possible, or wait for subscription
      if (typeof window !== 'undefined' && (window as any).refreshAppData) {
        (window as any).refreshAppData();
      }
    } else {
      alert(translateError(error));
    }
  };

  const featuredProduct = products.length > 0 ? products[products.length - 1] : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-32 relative w-full overflow-x-hidden">
      {/* HEADER: ON-SITE BANNER REMOVED AS REQUESTED */}

      {/* WEB-ONLY PROMOTIONAL BANNER */}
      <div className="hidden lg:block w-full bg-gradient-to-r from-brand-900 to-slate-900 text-white overflow-hidden shadow-xl mb-6 relative">
        <div className="max-w-7xl mx-auto px-8 py-12 flex items-center justify-between relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles size={14} className="text-brand-400" />
              <span>CondoHub Web</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter mb-4 leading-tight">
              Gerencie seu condomínio <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-400">com mais conforto.</span>
            </h1>
            <p className="text-slate-400 text-lg sm:max-w-lg mb-8 leading-relaxed">
              Aproveite a visualização expandida do seu painel no computador. Mais espaço, mais clareza, a mesma agilidade.
            </p>
            <div className="flex gap-4">
              <button className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-brand-500/20 transition-all active:scale-95">
                Ver Novidades
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm backdrop-blur-sm transition-all active:scale-95">
                Documentação
              </button>
            </div>
          </div>

          {/* Decorative Illustration for Banner */}
          <div className="hidden xl:block relative">
            <div className="w-80 h-80 bg-brand-500/20 rounded-full blur-3xl absolute -top-10 -right-10"></div>
            <div className="relative bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[32px] shadow-2xl skew-y-3 -rotate-6 transform hover:rotate-0 hover:skew-y-0 transition-all duration-700 cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white">
                  <Building2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Condomínio Seguro</h4>
                  <p className="text-xs text-slate-400">Status: Monitorado</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="w-48 h-2 bg-white/10 rounded-full"></div>
                <div className="w-32 h-2 bg-white/10 rounded-full"></div>
                <div className="w-40 h-2 bg-white/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-900/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>

      {/* PACKAGE ALERT BANNER (Persistent Strip) */}
      {showPackageAlert && (
        <div className="bg-amber-400 p-4 px-6 flex items-center justify-between shadow-sm relative z-30 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
              <Package size={16} className="text-amber-950" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-900 leading-none mb-0.5">
                {localPackages.some(p => p.status === 'awaiting_confirmation') ? 'Aperto de Mão!' : 'Encomendas'}
              </p>
              <p className="text-xs font-bold text-amber-950">
                {localPackages.some(p => p.status === 'awaiting_confirmation') ? 'Responda na portaria agora' : 'Aguardando retirada'}
              </p>
            </div>
          </div>
          <button onClick={() => setShowPackageModal(true)} className="bg-black/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-amber-950 hover:bg-black/20 transition-all">
            {localPackages.some(p => p.status === 'awaiting_confirmation') ? 'Confirmar' : 'Ver'}
          </button>
        </div>
      )}

      {/* REVIEWS MODAL */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        proName={selectedRequestToReview?.providerName || 'Profissional'}
      />

      {/* PROFESSIONAL DETAIL MODAL (NEW) */}
      <ProfessionalDetailModal
        isOpen={!!selectedPro}
        onClose={() => setSelectedPro(null)}
        professional={selectedPro}
      />

      {/* FEEDBACK MODAL */}
      <AppFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        currentUser={currentUser}
        userRole="resident"
      />

      {/* NOTIFICATIONS MODAL */}
      <NotificationsModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} currentUser={currentUser} onUpdate={onClearNotifications} />

      {/* MURAL MODAL */}
      <MuralDemandModal isOpen={muralOpen} onClose={() => setMuralOpen(false)} onPost={onPostMuralDemand} categories={muralCategories} />

      {/* PACKAGE ALERT MODAL - PREMIUM REDESIGN */}
      {showPackageModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300 bg-slate-950/40 backdrop-blur-xl">
          <div className="absolute inset-0 z-0" onClick={() => setShowPackageModal(false)}></div>
          <div className="bg-white/90 backdrop-blur-2xl rounded-[48px] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden border border-white/20 scale-in-center z-10">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"></div>

            {localPackages.some(p => p.status === 'awaiting_confirmation') ? (
              /* HANDSHAKE MODE - FUTURISTIC */
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-amber-500/10 rounded-[32px] flex items-center justify-center mx-auto text-amber-600 mb-2 border border-amber-500/20 shadow-inner relative z-10">
                    <Handshake size={48} className="animate-pulse" />
                  </div>
                  {/* Decorative Rings */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-amber-500/10 rounded-full animate-ping"></div>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
                    Aperto de Mão<br /><span className="text-amber-500">Digital</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3 px-2">
                    O funcionário está com seu pacote agora.<br />Confirme para autorizar a entrega.
                  </p>
                </div>

                <div className="space-y-2">
                  {localPackages.filter(p => p.status === 'awaiting_confirmation').map(p => (
                    <div key={p.id} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 transition-all hover:bg-white hover:shadow-sm">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm leading-none">
                        <Package size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-800 italic truncate uppercase tracking-tight">{p.description}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Aguardando seu OK</p>
                      </div>
                      <BadgeCheck size={20} className="text-emerald-500 animate-bounce" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  <DSButton
                    fullWidth
                    onClick={() => {
                      localPackages.filter(p => p.status === 'awaiting_confirmation').forEach(p => handleConfirmHandshake(p.id));
                      setShowPackageModal(false);
                    }}
                    variant="primary"
                    style={{ height: 64, borderRadius: 24, fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: colors.success, boxShadow: `0 10px 20px -10px ${colors.success}` }}
                  >
                    <span className="flex items-center gap-2 justify-center">
                      <Check size={20} className="stroke-[3]" /> Sim, Recebi agora
                    </span>
                  </DSButton>
                  <button onClick={() => setShowPackageModal(false)} className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none hover:text-slate-600 transition-colors">
                    Não estou com ele
                  </button>
                </div>
              </div>
            ) : (
              /* NORMAL PENDING MODE - UNBOXING */
              <div className="space-y-8 py-2">
                <div className="relative flex justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-[40px] flex items-center justify-center text-blue-500 shadow-xl border border-white relative z-10 transform -rotate-6">
                    <Package size={48} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white z-20 font-black italic text-xs animate-bounce">
                    {localPackages.length}
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
                    Suas Encomendas<br /><span className="text-blue-500">Chegaram!</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 leading-relaxed">
                    Você tem {localPackages.length} {localPackages.length === 1 ? 'volume' : 'volumes'} prontos para retirada<br />na portaria principal.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <DSButton
                    fullWidth
                    onClick={() => { setShowPackageModal(false); setDigitalIdOpen(true); }}
                    variant="primary"
                    style={{ height: 64, borderRadius: 24, fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'linear-gradient(to right, #2563eb, #06b6d4)' }}
                  >
                    <span className="flex items-center gap-3 justify-center">
                      <QrCode size={22} /> Gerar meu QR de Coleta
                    </span>
                  </DSButton>

                  <button
                    onClick={() => setShowPackageModal(false)}
                    className="w-full py-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-slate-500 transition-colors"
                  >
                    Lembrar mais tarde
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DIGITAL ID MODAL */}
      <DigitalIDModal isOpen={digitalIdOpen} onClose={() => setDigitalIdOpen(false)} currentUser={currentUser} onOpenAuth={() => setAuthModalOpen(true)} />

      {/* AUTHORIZATION MODAL */}
      <AuthorizationModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} currentUser={currentUser} />

      {/* PACKAGE SCANNER MODAL */}
      <PackageScanner
        isOpen={activeTab === 'scanner-encomenda' || (window.location.hash === '#scanner')}
        onClose={() => { window.location.hash = ''; onNavigate('home'); }}
        currentUser={currentUser}
      />

      {/* HEADER DIN�MICO */}
      {/* STANDARD HEADER */}
      <ResidentHeader
        onQrCodeClick={() => setDigitalIdOpen(true)}
        onNotificationsClick={() => setShowNotifications(true)}
        notificationCount={notifications.length}
      />

      {/* GREETING & SEARCH SECTION */}
      <div className="px-6 pb-6 pt-2 bg-white rounded-b-[40px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] mb-8 relative z-30">
        <div className="mb-6">
          <p className="text-slate-500 font-medium text-sm mb-1 ml-1">Olá, {currentUser?.name?.split(' ')[0]}</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">O que você <br />precisa hoje?</h2>
        </div>

        <div className="relative group" onClick={() => onSelectCategory('Todos')}>
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-hover:text-brand-500 transition-colors" size={24} />
          </div>
          <input
            type="text"
            readOnly
            placeholder="Procurar produto ou serviço..."
            className="w-full h-16 pl-14 pr-6 rounded-[24px] bg-slate-50 border-none text-slate-900 placeholder:text-slate-400 focus:ring-0 text-base font-medium shadow-inner transition-all group-hover:bg-slate-100 cursor-pointer"
            value={homeSearch}
            onChange={(e) => setHomeSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 right-4 flex items-center">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300">
              <Mic size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-12">
        {/* CARROSSEL DE MURAL (ADVERTISING) */}
        {/* CARROSSEL DE MURAL (ADVERTISING) */}
        <BannerCarousel />

        {/* NEWS TICKER (PLANTÃO CONDOMÍNIO) */}
        <NewsTicker userRole="resident" />

        {/* PRESTADORES NO LOCAL (NEW) */}
        {onSitePros.length > 0 && (
          <div className="animate-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Prestadores no Condomínio</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {onSitePros.map((pro, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedPro(pro); // OPEN MODAL
                  }}
                  className="min-w-[140px] bg-white p-4 rounded-[24px] border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col items-center gap-3 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner">
                    <img
                      src={pro.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pro.name}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>

                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {pro.category || 'Prestador'}
                    </p>
                    <h4 className="font-black text-slate-900 text-xs leading-tight line-clamp-1">
                      {pro.name || 'Prestador'}
                    </h4>
                  </div>

                  <button
                    onClick={async (e) => {
                      e.stopPropagation();

                      if (pro.phone && currentUser?.id) {
                        const cleanPhone = pro.phone.replace(/\D/g, '');

                        await supabase.from('professional_leads').insert([{
                          professional_id: pro.id,
                          resident_id: currentUser.id,
                          source: 'whatsapp_click',
                          metadata: { origin: 'home_onsite_banner' }
                        }]);

                        window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                      } else {
                        alert('Telefone não disponível para este prestador.');
                      }
                    }}
                    className="mt-1 w-full py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-colors"
                  >
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
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Avalie seu Atendimento</h3>
            </div>
            <div className="space-y-4">
              {completedRequests.map((req, i) => (
                <div key={i} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-lg shadow-amber-500/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concluído em {new Date(req.created_at).toLocaleDateString('pt-BR')}</p>
                    <h4 className="font-black text-slate-900 text-sm mt-1">{req.title}</h4>
                    <p className="text-xs text-slate-500">Com {req.providerName || 'Prestador'}</p>
                  </div>
                  <DSButton onClick={() => { setSelectedRequestToReview(req); setReviewModalOpen(true); }} variant="secondary" style={{ backgroundColor: colors.warning, color: '#451a03', borderRadius: 12, padding: '8px 20px', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Avaliar
                  </DSButton>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* ATALHOS RÁPIDOS (COM ABAS) */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100/50 backdrop-blur-md border border-slate-200 rounded-2xl">
            <button
              onClick={() => setActiveSection('prestadores')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSection === 'prestadores' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Prestadores
            </button>
            <button
              onClick={() => setActiveSection('gestao')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSection === 'gestao' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Gestão Condomínio
            </button>
          </div>

          {/* Conteúdo Dinâmico */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeSection === 'gestao' ? (
              <div>
                <SectionHeader title="Gestão Condomínio" actionLabel="Ver Todos" onAction={() => onNavigate('home')} />
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: <Key size={20} />, label: 'Acessos', target: 'acesso', color: 'text-brand-600', bg: 'bg-brand-50' },
                    { icon: <CalendarDays size={20} />, label: 'Reservas', target: 'condo-agenda', color: 'text-amber-600', bg: 'bg-amber-50' },
                    { icon: <CreditCard size={20} />, label: 'Financeiro', target: 'financeiro', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { icon: <FileText size={20} />, label: 'Documentos', target: 'financeiro', color: 'text-blue-600', bg: 'bg-blue-50' }, // Financeiro handles documents usually or there is a docs page
                    { icon: <MessageSquare size={20} />, label: 'Fale com Cond.', target: 'chamado', color: 'text-cyan-600', bg: 'bg-cyan-50' },
                    { icon: <Scan size={20} />, label: 'Retirar Encomenda', target: 'scanner-encomenda', color: 'text-slate-600', bg: 'bg-slate-100 transition-colors group-hover:bg-slate-200' },
                  ].map((act, i) => (
                    <button key={i} onClick={() => onNavigate(act.target)} className="bg-white backdrop-blur-md p-3 py-4 rounded-[24px] flex flex-col items-center gap-2 shadow-sm border border-slate-100 active:scale-95 transition-all group hover:shadow-md hover:bg-slate-50">
                      <div className={`${act.color} ${act.bg} w-10 h-10 rounded-xl flex items-center justify-center`}>{act.icon}</div>
                      <span className="text-[9px] font-black text-slate-600 uppercase text-center tracking-tight leading-none line-clamp-2">{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <SectionHeader title="Prestadores" actionLabel="Ver Todos" onAction={() => onSelectCategory('Todos')} />
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: <Leaf size={20} />, label: 'Jardim', category: 'Jardinagem', color: 'text-green-600', bg: 'bg-green-50' },
                    { icon: <Zap size={20} />, label: 'Eletricista', category: 'Eletricista', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { icon: <Droplets size={20} />, label: 'Limpeza', category: 'Limpeza', color: 'text-cyan-600', bg: 'bg-cyan-50' },
                    { icon: <Wrench size={20} />, label: 'Reparos', category: 'Manutenção', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  ].map((act, i) => {
                    // Check if category exists in DB (case-insensitive or exact)
                    const dbCat = categories.find(c => c.name.toLowerCase() === act.category.toLowerCase());
                    const finalCategory = dbCat ? dbCat.name : act.category;

                    return (
                      <button key={i} onClick={() => onSelectCategory(finalCategory)} className="bg-white backdrop-blur-md p-3 py-4 rounded-[24px] flex flex-col items-center gap-2 shadow-sm border border-slate-100 active:scale-95 transition-all hover:shadow-md hover:bg-slate-50">
                        <div className={`${act.color} ${act.bg} w-10 h-10 rounded-xl flex items-center justify-center`}>{act.icon}</div>
                        <span className="text-[9px] font-black text-slate-600 uppercase text-center tracking-tight leading-none line-clamp-2">{act.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )
            }
          </div>
        </div>

        {/* E-SHOP (Carousel Dinâmico) */}
        <div>
          <SectionHeader title="Vitrine E-shop" actionLabel="Ver Todos" onAction={() => onNavigate('shop-detail')} />
          {products.length > 0 ? (
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {products.map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSelectProduct && onSelectProduct(item)}
                  className="min-w-[45%] bg-white p-4 rounded-[32px] shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col gap-3 active:scale-95 transition-all cursor-pointer relative hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-full h-32 rounded-2xl bg-slate-50 overflow-hidden relative flex items-center justify-center border border-slate-100">
                    {item.image_url ? (
                      <img src={item.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <Store size={24} className="text-slate-300" />
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black italic text-slate-900">{typeof item.price === 'number' ? `R$ ${item.price}` : item.price}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm italic tracking-tight line-clamp-1">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">por {item.profiles?.name?.split(' ')[0] || 'Vizinho'}</p>
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
              className="bg-white p-6 rounded-[36px] shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-6 active:scale-95 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400/20 to-orange-500/20 text-orange-500 overflow-hidden relative flex items-center justify-center border border-orange-100">
                <Store size={32} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-slate-900 text-xl italic tracking-tight line-clamp-1">
                    Marketplace
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium line-clamp-2">
                  Encontre produtos e serviços dos seus vizinhos e comércio local.
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                <ChevronRight size={18} />
              </div>
            </div>
          )}
        </div>


        {/* FEEDBACK TRIGGER CARD (MOVED HERE) */}
        {/* FEEDBACK TRIGGER CARD MOVED UP */}

        {/* FEEDBACK TRIGGER CARD (BANNER AZUL - SUGESTÕES) */}
        <div className="py-2">
          <DSCard
            onClick={() => setFeedbackOpen(true)}
            className="p-8 bg-brand-gradient text-brand-contrast rounded-[48px] shadow-2xl shadow-brand-glow border-none relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/30 transition-all duration-700"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-brand-400 shadow-inner">
                <Sparkles size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none mb-2">💡 Ajude a melhorar o App</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Sua ideia pode ser a próxima funcionalidade do sistema!</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-brand-500 transition-all">
                <ChevronRight size={20} />
              </div>
            </div>
          </DSCard>
        </div >

        {/* MURAL DO DESAPEGO (CARROSSEL ÚNICO) */}
        < div >
          <SectionHeader title="Vitrine Desapego" actionLabel="Ver Todos" onAction={() => onNavigate('desapegos-all')} />

          <div className="relative group">
            {desapegos.length > 0 && (
              <div className="transform transition-all duration-300">
                <DesapegoCard item={desapegos[currentDesapegoIndex]} onClick={() => onSelectDesapego && onSelectDesapego(desapegos[currentDesapegoIndex])} />
              </div>
            )}

            {/* Navigation Arrows */}
            {desapegos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentDesapegoIndex(prev => prev === 0 ? desapegos.length - 1 : prev - 1); }}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur shadow-xl rounded-full flex items-center justify-center text-slate-900 active:scale-90 transition-all z-30 border border-slate-200"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentDesapegoIndex(prev => prev === desapegos.length - 1 ? 0 : prev + 1); }}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur shadow-xl rounded-full flex items-center justify-center text-slate-900 active:scale-90 transition-all z-30 border border-slate-200"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {desapegos.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {desapegos.map((_, idx) => (
                  <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx === currentDesapegoIndex ? 'w-6 bg-brand-primary' : 'w-2 bg-brand-100/50'}`} />
                ))}
              </div>
            )}
          </div>
        </div >

        {/* FEEDBACK TRIGGER CARD (MOVED UP) */}
        < div className="pb-12" >
          {/* Card moved up, keeping div for spacing padding if needed, or remove completely? 
               The original had pb-12. Let's keep a spacer or just remove the content. 
               Cleaner to just remove the card content since it's above now. 
               The pb-12 was likely for bottom scrolling space. Let's keep a spacer.
           */}
        </div >

        {/* FEEDBACK MODAL */}
        < AppFeedbackModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          currentUser={currentUser}
          userRole="resident"
        />
      </div >
    </div >
  );
};

// --- PERFIL DO MORADOR ---
// --- PERFIL DO MORADOR ---
export const ResidentProfile: React.FC<{ currentUser: any; onNavigate: (t: string) => void }> = ({ currentUser, onNavigate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    const checkBio = async () => {
      const creds = await BiometricService.getCredentials();
      setBiometricsEnabled(!!creds);
    };
    checkBio();
  }, []);

  const handleToggleBiometrics = async () => {
    if (biometricsEnabled) {
      if (window.confirm('Deseja desativar o acesso por biometria?')) {
        await BiometricService.deleteCredentials();
        setBiometricsEnabled(false);
      }
    } else {
      const { available } = await BiometricService.isAvailable();
      if (!available) {
        alert('Biometria não disponível neste dispositivo.');
        return;
      }

      const pass = window.prompt('Para ativar, confirme sua senha atual:');
      if (pass) {
        try {
          await BiometricService.saveCredentials(currentUser.email, pass);
          setBiometricsEnabled(true);
          alert('Login biométrico ativado!');
        } catch (e) {
          alert('Erro ao salvar credenciais.');
        }
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair?')) {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase.from('profiles').update({ avatar: publicUrl }).eq('id', currentUser.id);
      if (updateError) throw updateError;

      alert('Foto atualizada com sucesso!');
      window.location.reload(); // Simple reload to refresh app state
    } catch (error: any) {
      alert(translateError(error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-32 font-sans">
      {/* HEADER */}
      <ResidentHeader
        onQrCodeClick={() => { }}
        onNotificationsClick={() => { }}
        notificationCount={0}
      />

      {/* HERO CARD */}
      <div className="bg-[#bd69f6]"> {/* Using a lighter purple to match 'Splendido' image roughly, or main brand color */}
        <div className="bg-[#7c3aed] p-8 pb-10 flex flex-row items-center justify-between shadow-lg"> {/* Main brand purple */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-lg relative cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`}
                className="w-full h-full object-cover"
              />
              {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white shadow-sm">{currentUser?.name || 'Morador'}</h2>
              <p className="text-xs text-purple-200 font-medium">Morador - {currentUser?.unit || '---'}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('personal-data')}
            className="bg-white text-[#7c3aed] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-md active:scale-95 transition-all whitespace-nowrap"
          >
            Editar Perfil
          </button>
        </div>
      </div>

      {/* VERIFICATION STRIP */}
      <div className="bg-[#facc15] py-3 px-6 flex items-center justify-between shadow-sm relative z-10">
        <span className="text-xs font-black italic text-slate-900 tracking-wider">CONTA VERIFICADA</span>
        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-[#facc15]">
          <Check size={14} strokeWidth={4} />
        </div>
      </div>

      {/* ACTIVITY LIST */}
      <div className="p-6 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Minhas Atividades</h3>
          <button className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest">VER TODAS</button>
        </div>

        <div className="space-y-3">
          {/* Common Card Style */}
          {[
            { label: 'Meus Anúncios', icon: <Tag size={20} className="text-[#a855f7]" />, bg: 'bg-[#f3e8ff]', onClick: () => onNavigate('market') }, // Purple-100/500
            { label: 'Minhas Compras', icon: <ShoppingBag size={20} className="text-[#a855f7]" />, bg: 'bg-[#f3e8ff]', onClick: () => onNavigate('market') },
            { label: 'Meus Agendamentos', icon: <CalendarDays size={20} className="text-[#a855f7]" />, bg: 'bg-[#f3e8ff]', onClick: () => onNavigate('resident-bookings') },
            { label: 'Configurações', icon: <Settings size={20} className="text-[#a855f7]" />, bg: 'bg-[#f3e8ff]', onClick: () => onNavigate('privacy') },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={item.onClick}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg}`}>
                  {item.icon}
                </div>
                <span className="text-sm font-bold text-slate-700">{item.label}</span>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </div>
          ))}

          {/* Additional Options (Logout/Bio) kept but styled consistently or pushed to Settings? 
                 The mock only showed 4 items. putting Biometrics/Logout inside 'Configurações' would be cleaner, 
                 but for now let's append them or handle them. 
                 Let's add a separate section or just append them for functionality preservation.
             */}

        </div>

        {/* Functionality Buttons (Logout/Bio) - Preserved for utility but styled minimally below */}
        <div className="pt-4 grid grid-cols-2 gap-3">
          <button
            onClick={handleToggleBiometrics}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${biometricsEnabled ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-slate-100 text-slate-400'}`}
          >
            <Fingerprint size={24} />
            <span className="text-[10px] font-black uppercase">{biometricsEnabled ? 'Bio Ativada' : 'Ativar Bio'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-4 rounded-2xl border border-rose-100 bg-rose-50 text-rose-500 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <LogOut size={24} />
            <span className="text-[10px] font-black uppercase">Sair</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export const Marketplace: React.FC<{
  onNavigate: (t: string) => void;
  onSelectCategory: (cat: string) => void;
  services?: any[];
  products?: any[];
  categories?: any[];
}> = ({ onNavigate, onSelectCategory, products, categories = [] }) => {
  const displayCategories = categories.length > 0 ? categories.slice(0, 4) : [
    { id: '1', name: 'Alimentação', icon: <Utensils size={28} />, bg: 'bg-orange-50', color: 'text-orange-600' },
    { id: '2', name: 'Manutenção', icon: <Wrench size={28} />, bg: 'bg-blue-50', color: 'text-blue-600' },
    { id: '3', name: 'Limpeza', icon: <Droplets size={28} />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { id: '4', name: 'Estética', icon: <Scissors size={28} />, bg: 'bg-rose-50', color: 'text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-32">

      <ResidentHeader
        onQrCodeClick={() => { }}
        onNotificationsClick={() => { }}
        notificationCount={0}
      />
      <div className="px-6 py-4 flex items-center gap-4 border-b border-slate-100 sticky top-[88px] bg-slate-50 z-30 transition-all">
        <button onClick={() => onNavigate('home')} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-slate-200"><ArrowLeft size={20} className="text-slate-600" /></button>
        <div className="flex-1 flex items-center justify-between">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">e-Shop</h2>
          <ShoppingBag className="text-brand-600" size={24} />
        </div>
      </div>
      <div className="p-6 space-y-10">
        <div className="relative group" onClick={() => onNavigate('shop-detail')}>
          <DSInput
            readOnly
            placeholder="Qual serviço você precisa?"
            startIcon={<Search size={20} />}
            style={{ height: 72, borderRadius: 30, backgroundColor: 'white', border: `1px solid ${colors.neutral[200]}`, boxShadow: shadow.md, cursor: 'pointer', pointerEvents: 'none' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {displayCategories.map((cat, idx) => (
            <button
              key={cat.id || idx}
              onClick={() => onSelectCategory(cat.name)}
              className={`${cat.bg ? 'bg-white' : 'bg-white'} p-8 rounded-[40px] flex flex-col gap-4 text-left group active:scale-95 transition-all border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 relative overflow-hidden backdrop-blur-md`}
            >
              {cat.icon_url ? (
                <img src={cat.icon_url} className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
              ) : (
                <div className={`${cat.color?.replace('text-slate-600', 'text-slate-600') || 'text-slate-600'} group-hover:scale-110 transition-transform`}>
                  {cat.icon || <Package size={28} />}
                </div>
              )}
              <h4 className={`font-black italic text-lg tracking-tight leading-none ${cat.color ? 'text-slate-900' : 'text-slate-900'}`}>{cat.name}</h4>
            </button>
          ))}
        </div>

        {products && products.length > 0 && (
          <div>
            <SectionHeader title="Destaques e-Shop" />
            <div className="space-y-4">
              {products.map((item, i) => (
                <div key={i} className="bg-white backdrop-blur-xl p-4 rounded-[32px] flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-colors">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                    <img src={item.image_url || item.img} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 italic truncate">{item.title || item.name}</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{typeof item.price === 'number' ? `R$ ${item.price.toFixed(2)}` : item.price}</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-1 truncate">Vendedor: {item.profiles?.name || item.user || 'e-Shop'}</p>
                  </div>
                  <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 flex-shrink-0 border border-slate-200 hover:bg-slate-200">
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

export const ServicosFullView: React.FC<{ initialCategory: string; initialSearch?: string; onBack: () => void; onNavigate: (t: string) => void; onServiceRequest: (req: any) => void; services?: any[]; currentUser: any; categories?: any[]; setMuralOpen?: (open: boolean) => void }> = ({ initialCategory, initialSearch = '', onBack, onServiceRequest, services = [], currentUser, categories = [], setMuralOpen }) => {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedPro, setSelectedPro] = useState<any>(null);


  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  const handleProClick = async (pro: any) => {
    setSelectedPro(pro);

    try {
      if (pro.provider_id || pro.id) {
        await supabase.rpc('increment_profile_view', { profile_uuid: pro.provider_id || pro.id });
      }
    } catch (err) {
      console.error('Error logging view:', err);
    }
  };


  // CATEGORY DEFINITIONS (Icons & Colors)
  const categoryConfig: any = {
    'Jardinagem': { icon: <Leaf size={28} />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    'Eletricista': { icon: <Zap size={28} />, color: 'text-amber-500', bg: 'bg-amber-100' },
    'Limpeza': { icon: <Droplets size={28} />, color: 'text-blue-500', bg: 'bg-blue-100' },
    'Pintor': { icon: <Paintbrush size={28} />, color: 'text-pink-500', bg: 'bg-pink-100' },
    'Manutenção': { icon: <Wrench size={28} />, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    'Tecnologia': { icon: <Monitor size={28} />, color: 'text-slate-700', bg: 'bg-slate-200' },
    'Beleza': { icon: <Scissors size={28} />, color: 'text-rose-500', bg: 'bg-rose-100' },
    'Encanador': { icon: <Wrench size={28} />, color: 'text-cyan-600', bg: 'bg-cyan-100' }, // Added Encanador
    'Pós Obra': { icon: <Home size={28} />, color: 'text-slate-600', bg: 'bg-slate-200' }, // Added Pós Obra
    'Outros': { icon: <MoreHorizontal size={28} />, color: 'text-slate-500', bg: 'bg-slate-200' },
  };

  const getCatConfig = (cat: string) => categoryConfig[cat] || categoryConfig['Outros'];

  // Extract unique categories from services or use defaults
  const availableCategories = useMemo(() => {
    // Merge config keys with any extra categories found in services
    const serviceCats = new Set(services.map(s => s.category));
    const configCats = Object.keys(categoryConfig); // Use all defined configs to match mockup structure if possible
    // Prefer config order
    const ordered = ['Jardinagem', 'Eletricista', 'Limpeza', 'Pintor', 'Manutenção', 'Tecnologia', 'Beleza', 'Encanador', 'Pós Obra', 'Outros'];
    const otherCats = Array.from(serviceCats).filter(c => !ordered.includes(c));

    // Combine ordered defaults + any others found in data
    return [...ordered, ...otherCats];
  }, [services]);

  // FILTERED LIST - SMART SEARCH IMPLEMENTATION
  const filteredPros = useMemo(() => {
    let filtered = services;

    // Filter by Category (Active Category Tab)
    if (activeCategory !== 'Todos') {
      const targetCats = [activeCategory];
      // Include sub-categories if activeCategory is a parent
      const catObj = categories.find(c => c.name === activeCategory);
      if (catObj) {
        const children = categories.filter(c => c.parent_id === catObj.id).map(c => c.name);
        targetCats.push(...children);
      }
      filtered = filtered.filter(s => targetCats.includes(s.category));
    }

    // Filter by Search (Name, Description, OR Smart Category Match)
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();

      // Find relevant category names based on search term (Parent -> Children)
      const relevantCatNames = new Set<string>();
      const matchedCats = categories.filter(c => c.name.toLowerCase().includes(lower));

      matchedCats.forEach(c => {
        relevantCatNames.add(c.name);
        // If it's a parent, add its children
        categories.filter(child => child.parent_id === c.id).forEach(child => relevantCatNames.add(child.name));
      });

      filtered = filtered.filter(s =>
        (s.title && s.title.toLowerCase().includes(lower)) ||
        (s.name && s.name.toLowerCase().includes(lower)) ||
        (s.providerName && s.providerName.toLowerCase().includes(lower)) ||
        (s.category && s.category.toLowerCase().includes(lower)) ||
        relevantCatNames.has(s.category) ||
        (s.description && s.description.toLowerCase().includes(lower)) ||
        (Array.isArray(s.specialties) && s.specialties.some((tag: string) => tag && tag.toLowerCase().includes(lower)))
      );
    }
    return filtered;
  }, [services, activeCategory, searchTerm, categories]);


  const openWhatsApp = async (phone: string, proId: string) => {
    const cleanPhone = phone?.replace(/\D/g, '');
    if (cleanPhone) {
      // Registrar Lead (CRM)
      if (currentUser?.id) {
        await supabase.from('professional_leads').insert([{
          professional_id: proId,
          resident_id: currentUser.id,
          source: 'whatsapp_click',
          metadata: { origin: 'serviços_full', category: activeCategory }
        }]);
      }
      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    } else {
      alert('Telefone não disponível');
    }
  };

  // --- VIEW: CATEGORY GRID (When 'Todos' is Active AND no search term that forces a list) ---
  const showCategoryGrid = activeCategory === 'Todos' && !searchTerm;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 font-sans">

      {/* STANDARD HEADER */}
      <ResidentHeader
        onQrCodeClick={() => { }}
        onNotificationsClick={() => { }}
        notificationCount={1}
        className="backdrop-blur-md bg-white/90"
      />

      <div className="px-6 py-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">CATEGORIAS DE SERVIÇOS</h2>

        {/* SEARCH BAR */}
        <DSInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Busque por serviço..."
          startIcon={<Search size={20} className="text-slate-400" />}
          style={{ borderRadius: 8, backgroundColor: 'white', border: '1px solid #E2E8F0', height: 48, fontSize: 13 }}
          wrapperClassName="mb-6 shadow-sm"
        />

        {/* CONTENT */}
        {showCategoryGrid ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Map through extracted categories */}
              {availableCategories.length > 0 ? availableCategories.map((cat) => {
                const conf = getCatConfig(cat);
                const count = services.filter(s => s.category === cat).length;

                // Skip if logic to hide empty optional, but mockup shows placeholders.
                // Mockup layout: Square card, white, shadow-sm. Icon in colored square box centered.

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="bg-white aspect-square rounded-[20px] shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 active:scale-95 transition-all hover:shadow-md group"
                  >
                    <div className={`w-14 h-14 ${conf.bg} ${conf.color} rounded-lg flex items-center justify-center text-3xl mb-1`}>
                      {conf.icon}
                    </div>
                    <div className="text-center">
                      <h4 className="font-bold text-[#6366f1] text-[11px] uppercase tracking-wide px-2 leading-tight">{cat}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{count} Profissionais</p>
                    </div>
                  </button>
                );
              }) : (
                <div className="col-span-2 text-center py-12 text-slate-400">
                  <p className="text-sm">Nenhuma categoria encontrada.</p>
                </div>
              )}
            </div>

            {/* YELLOW CTA BANNER */}
            <div className="bg-[#fbdb40] rounded-lg p-6 text-center shadow-sm">
              <h3 className="text-slate-900 font-black text-xs uppercase tracking-wide mb-1">PRECISA DE OUTRA COISA?</h3>
              <button onClick={() => setMuralOpen && setMuralOpen(true)} className="text-slate-800 underline font-bold text-[10px] uppercase tracking-widest hover:text-black">
                ENTRE EM CONTATO
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER FOR LIST VIEW */}
            {activeCategory !== 'Todos' && (
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setActiveCategory('Todos')} className="text-slate-400 font-bold text-xs uppercase hover:text-[#6366f1]">Categorias</button>
                <ChevronRight size={12} className="text-slate-300" />
                <span className="text-[#6366f1] font-bold text-xs uppercase">{activeCategory}</span>
              </div>
            )}

            {filteredPros.length > 0 ? filteredPros.map(pro => (
              <DSCard
                key={pro.id}
                className="p-0 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-[32px] bg-white overflow-hidden group cursor-pointer hover:shadow-xl transition-all active:scale-[0.98]"
                style={{ padding: 0 }}
                onClick={() => handleProClick(pro)}
              >
                {/* ... Existing Card Design (Keep consistent with previous update or refine slightly to match 'Splendido' clean vibe) ... */}
                {/* Reusing previous good card design but ensuring colors match Splendido purple */}
                <div className="p-6 pb-0 flex items-start gap-5">
                  <div className="w-20 h-20 rounded-[20px] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100">
                    <img src={pro.avatar || pro.img || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pro.providerName}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex gap-2 mb-2">
                          <div className="bg-indigo-50 text-indigo-600 text-[9px] uppercase tracking-widest px-2 py-1 rounded hover:bg-indigo-100 font-bold">{pro.category || 'Geral'}</div>
                          {pro.is_on_site && (
                            <div className="bg-emerald-500 text-white text-[9px] uppercase tracking-widest px-2 py-1 animate-pulse flex items-center gap-1 rounded font-bold">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div> No Local
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-800 text-lg leading-none truncate mb-1">{pro.providerName || pro.title}</h4>
                      </div>
                    </div>
                    {pro.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-700">{pro.rating}</span>
                        <span className="text-[10px] text-slate-400">({pro.reviews_count || 12})</span>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed font-medium">{pro.title} - {pro.description || 'Profissional verificado.'}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">A partir de</p>
                    <p className="font-black text-slate-900 text-base">{pro.price_range || pro.price || 'A Combinar'}</p>
                  </div>
                  <div className="flex gap-2">
                    <DSButton
                      onClick={(e) => { e.stopPropagation(); openWhatsApp(pro.providerPhone, pro.id); }}
                      variant="primary"
                      style={{ height: 44, backgroundColor: '#6366f1', padding: '0 20px', borderRadius: 12, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                      <Phone size={16} className="mr-2" /> Agendar
                    </DSButton>
                  </div>
                </div>
              </DSCard>
            )) : (
              <div className="text-center py-20 pb-0">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Search size={32} className="text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg">Nenhum profissional</h3>
                <p className="text-slate-400 text-sm mt-1 mb-6">Tente outra categoria.</p>
                <button onClick={() => { setActiveCategory('Todos'); setSearchTerm(''); }} className="text-[#6366f1] font-bold uppercase text-xs tracking-widest hover:underline bg-indigo-50 px-6 py-3 rounded-lg">
                  Ver Todos
                </button>
              </div>
            )}
          </div>
        )}
      </div>


      {/* PROFESSIONAL DETAIL MODAL */}
      {selectedPro && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedPro(null)}></div>
          <div className="relative w-full max-w-md bg-white backdrop-blur-2xl rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom-10 duration-300 overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="h-48 relative">
              <div className="absolute inset-0 bg-[#6366f1]"></div>
              {selectedPro.photos?.[0] && <img src={selectedPro.photos[0]} className="w-full h-full object-cover opacity-50" />}
              <button
                onClick={() => setSelectedPro(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-black/10 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/20 transition-colors z-20 border border-white/20"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-8 pb-10 -mt-16 relative z-10">
              <div className="w-28 h-28 rounded-[32px] border-4 border-white shadow-xl bg-white overflow-hidden mb-6 relative">
                {selectedPro.is_on_site && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full z-10 animate-pulse"></div>
                )}
                <img src={selectedPro.avatar || selectedPro.img || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPro.providerName}`} className="w-full h-full object-cover" />
              </div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{selectedPro.providerName || selectedPro.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div style={{ backgroundColor: '#EEF2FF', color: '#6366f1', border: `1px solid #E0E7FF`, padding: '4px 8px', borderRadius: radius.sm, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{selectedPro.category}</div>
                    {selectedPro.is_on_site && <div style={{ backgroundColor: colors.success + '10', color: colors.success, border: `1px solid ${colors.success + '20'}`, padding: '4px 8px', borderRadius: radius.sm, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} className="animate-pulse">No Condomínio!</div>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-lg font-black text-slate-900">{selectedPro.rating || '4.8'}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Avaliações</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Sobre o Profissional</h4>
                  <p className="text-slate-600 leading-relaxed font-medium">{selectedPro.description || 'Profissional verificado do condomínio.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <Clock size={20} className="text-[#6366f1] mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</p>
                    <p className="font-bold text-slate-700">Seg - Sex, 08h-18h</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <MapPin size={20} className="text-[#6366f1] mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atende</p>
                    <p className="font-bold text-slate-700">Todas as Torres</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                  <div className="flex gap-3">
                    <DSButton
                      fullWidth
                      style={{ height: 56, backgroundColor: '#6366f1', borderRadius: 16, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      onClick={() => openWhatsApp(selectedPro.providerPhone, selectedPro.id)}
                    >
                      <Phone className="mr-2" size={18} /> WhatsApp
                    </DSButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DesapegoFullView: React.FC<{ onBack: () => void; desapegos: any[]; currentUser?: any; onDelete?: (id: string) => void; onSelect?: (item: any) => void }> = ({ onBack, desapegos, currentUser, onDelete, onSelect }) => (
  <div className="min-h-screen bg-transparent pb-32">
    <FloatingBackButton onClick={onBack} />
    <ResidentHeader
      onQrCodeClick={() => { }}
      onNotificationsClick={() => { }}
      notificationCount={0}
    />
    <header className="p-6 flex items-center gap-4 bg-transparent border-b border-slate-200 sticky top-[88px] z-30 backdrop-blur-md">
      <button onClick={onBack} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center active:scale-95 transition-all hover:bg-slate-200 text-slate-600 shadow-sm border border-slate-200"><ArrowLeft size={24} /></button>
      <h2 className="text-xl font-black italic uppercase text-slate-900">Mural do Desapego</h2>
    </header>
    <div className="p-6 space-y-8">
      {desapegos.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <p className="text-slate-400 font-bold">Nenhum item anunciado.</p>
        </div>
      ) : (
        desapegos.map(item => (
          <div key={item.id}>
            <DesapegoCard item={item} onClick={() => onSelect && onSelect(item)} />
          </div>
        ))
      )}
    </div>
  </div>
);

export const DesapegoDetailView: React.FC<{ onBack: () => void; item: any; currentUser?: any; onDelete?: (id: string) => void }> = ({ onBack, item, currentUser, onDelete }) => {
  if (!item) return <div className="p-10 text-white">Item não encontrado. <button onClick={onBack}>Voltar</button></div>;

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
      <ResidentHeader
        onQrCodeClick={() => { }}
        onNotificationsClick={() => { }}
        notificationCount={0}
      />
      <div className="h-96 relative bg-slate-100">
        <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-white/90"></div>
        <button onClick={onBack} className="absolute top-12 left-6 w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-900 active:scale-95 shadow-lg border border-white/50 z-50 hover:bg-white"><ArrowLeft /></button>

        <div className="absolute bottom-8 left-6 right-6">
          <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg mb-3 inline-block">{item.status}</span>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10 w-full rounded-t-[40px] bg-white backdrop-blur-3xl border-t border-slate-100 shadow-2xl">
        <div className="flex justify-between items-start mb-4 pt-6">
          <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none max-w-[70%]">{item.name}</h2>
          <div className="bg-slate-50 px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
            <p className="font-black text-slate-900 text-lg tracking-tight">{item.price}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-6 border-y border-slate-100 mb-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
            <img src={`https://picsum.photos/seed/${item.user}/100`} className="w-full h-full object-cover" alt={item.user} />
          </div>
          <div>
            <p className="text-xs text-slate-900 font-bold">Vendido por {item.user}</p>
            <p className="text-[10px] text-slate-500 font-medium">
              {item.unit && item.unit.toUpperCase().includes('CASA')
                ? `Rua ${item.tower}, ${item.unit.replace(/casa/i, '').trim()}`
                : `${item.tower || ''} - ${item.unit || 'Morador Verificado'}`}
            </p>
          </div>
          {!isOwner && (
            <button onClick={handleInterest} className="ml-auto w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center active:scale-90 transition-all border border-emerald-100 hover:bg-emerald-100">
              <MessageSquare size={18} />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-900">Sobre o produto</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{item.desc || 'Sem descrição detalhada.'}</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
        {isOwner ? (
          <DSButton fullWidth onClick={handleDelete} variant="secondary" style={{ height: 64, borderRadius: 24, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12, fontWeight: 900, color: colors.danger, backgroundColor: colors.danger + '10' }}>
            <Trash2 size={18} className="mr-2" /> Remover Anúncio
          </DSButton>
        ) : (
          <DSButton fullWidth onClick={handleInterest} variant="primary" style={{ height: 64, borderRadius: 24, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12, fontWeight: 900, backgroundColor: colors.success }}>
            <MessageSquare size={18} className="mr-2" /> Tenho Interesse
          </DSButton>
        )}
      </div>
    </div>
  );
};
export const CreateDesapegoPage: React.FC<{ onBack: () => void; onAdd: (item: any) => void; currentUser: any; onNavigate: (t: string) => void }> = ({ onBack, onAdd, currentUser, onNavigate }) => {
  const [form, setForm] = useState({ name: '', price: '', desc: '', category: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('PRODUTO'); // Visual tab state matching reference

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
      status: 'USADO', // Default for desapego
      user: currentUser?.name || 'Morador',
      tower: currentUser?.tower || '---',
      img: image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
      image_file: imageFile,
      desc: form.desc,
      category: form.category || 'Outros'
    };

    await onAdd(newItem);
    setIsSubmitting(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setImage(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-32 font-sans relative">
      {/* HEADER */}
      {/* HEADER */}
      <ResidentHeader
        onQrCodeClick={() => { }}
        onNotificationsClick={() => { }}
        notificationCount={0}
      />
      <header className="px-6 py-4 flex items-center justify-between bg-white sticky top-[88px] z-30 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-black italic text-slate-900 tracking-tighter uppercase">Anunciar Item</h1>
        </div>
      </header>

      {/* TABS (Visual only for Desapego to match style) */}
      <div className="bg-[#f8f9fc] px-6 py-4">
        <div className="bg-slate-200/50 p-1 rounded-full flex">
          {['PRODUTO', 'FOTOS', 'REVISÃO'].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'PRODUTO' ? 'bg-[#7c3aed] text-white shadow-md' : 'text-slate-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* HERO / PHOTO UPLOAD */}
      <div className="bg-[#7c3aed] pt-8 pb-12 px-6 text-center relative overflow-hidden">
        <div className="w-20 h-20 bg-white/20 rounded-3xl mx-auto flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
          {image ? (
            <img src={image} className="w-full h-full object-cover rounded-3xl" />
          ) : (
            <Camera size={32} className="text-white" />
          )}
        </div>
        <h2 className="text-lg font-black italic text-white mb-6 uppercase tracking-tight">IMAGEM PRINCIPAL DO PRODUTO</h2>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-white text-[#7c3aed] px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          {image ? 'Alterar Foto' : 'Selecionar'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>

      {/* YELLOW BANNER */}
      <div className="bg-[#facc15] py-3 px-6 -mt-4 relative z-10 shadow-sm mx-0">
        <span className="text-xs font-black text-[#854d0e] uppercase tracking-widest">DADOS COMERCIAIS</span>
      </div>

      {/* FORM */}
      <div className="p-6 space-y-6 bg-[#f8f9fc]">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Nome do Produto</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Cadeira de Escritório"
              className="w-full h-14 rounded-2xl border border-slate-200 px-4 font-bold text-slate-700 focus:border-[#7c3aed] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Preço de Venda (R$)</label>
            <input
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              placeholder="0,00"
              type="number"
              className="w-full h-14 rounded-2xl border border-slate-200 px-4 font-bold text-slate-700 focus:border-[#7c3aed] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Categoria</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full h-14 rounded-2xl border border-slate-200 px-4 font-bold text-slate-700 focus:border-[#7c3aed] outline-none appearance-none bg-white"
              >
                <option value="">Selecione a categoria</option>
                <option value="Móveis">Móveis</option>
                <option value="Eletrônicos">Eletrônicos</option>
                <option value="Infantil">Infantil</option>
                <option value="Outros">Outros</option>
              </select>
              <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Descrição</label>
            <textarea
              value={form.desc}
              onChange={e => setForm({ ...form, desc: e.target.value })}
              placeholder="Descreva o estado do item..."
              className="w-full h-24 rounded-2xl border border-slate-200 p-4 font-medium text-slate-700 focus:border-[#7c3aed] outline-none resize-none"
            />
          </div>

        </div>

        <button
          onClick={handlePublish}
          disabled={isSubmitting}
          className="w-full h-16 bg-[#7c3aed] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-purple-200 active:scale-95 transition-all mt-4"
        >
          {isSubmitting ? 'Publicando...' : 'PUBLICAR ANÚNCIO'}
        </button>
      </div>

      <AppNavigation
        activeTab="create-desapego"
        onChange={onNavigate}
        currentUser={currentUser}
      />
    </div>
  );
};

export const AcessoPage: React.FC<{ onBack: () => void; accessList?: any[]; onAddAccess?: (access: any) => void; currentUser: any }> = ({ onBack, accessList = [], onAddAccess, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'visita' | 'encomenda'>('visita');
  const [authorizations, setAuthorizations] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', type: 'Visita', date: '' });

  // Neighbor Search State
  const [neighborSearch, setNeighborSearch] = useState('');
  const [foundNeighbors, setFoundNeighbors] = useState<any[]>([]);
  const [selectedNeighbor, setSelectedNeighbor] = useState<any>(null);

  useEffect(() => {
    if (currentUser?.id) {
      loadAuthorizations();
    }
  }, [currentUser]);

  // Search Neighbors Effect
  useEffect(() => {
    if (neighborSearch.length > 2) {
      const search = async () => {
        const { data } = await supabase.from('profiles')
          .select('id, name, unit, tower')
          .eq('role', 'resident')
          .neq('id', currentUser.id) // Exclude self
          .or(`name.ilike.%${neighborSearch}%,unit.ilike.%${neighborSearch}%`)
          .limit(5);
        if (data) setFoundNeighbors(data);
      };
      const timeout = setTimeout(search, 500);
      return () => clearTimeout(timeout);
    } else {
      setFoundNeighbors([]);
    }
  }, [neighborSearch, currentUser]);

  const loadAuthorizations = async () => {
    const { data } = await supabase
      .from('package_authorizations')
      .select('*, grantee:grantee_id(id, name, unit, tower)')
      .eq('grantor_id', currentUser.id)
      .eq('status', 'active');

    if (data) setAuthorizations(data);
  };

  const revokeAuthorization = async (id: string) => {
    if (!confirm('Revogar autorização?')) return;
    await supabase.from('package_authorizations').update({ status: 'revoked' }).eq('id', id);
    loadAuthorizations();
  };

  const handleAuthorizeVisitor = () => {
    if (!form.name || !form.date) { alert('Preencha nome e data'); return; }
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
      alert('Acesso de visitante autorizado!');
      setForm({ name: '', type: 'Visita', date: '' });
    }
  };

  const handleAuthorizeNeighbor = async () => {
    if (!selectedNeighbor) { alert('Selecione um vizinho'); return; }

    const { error } = await supabase.from('package_authorizations').insert([{
      grantor_id: currentUser.id,
      grantee_id: selectedNeighbor.id,
      status: 'active'
    }]);

    if (!error) {
      alert(`Autorização concedida para ${selectedNeighbor.name}!`);
      setSelectedNeighbor(null);
      setNeighborSearch('');
      loadAuthorizations();
    } else {
      alert(translateError(error));
    }
  };

  const myVisitorAccess = accessList.filter(a => a.residentId === (currentUser?.id || '1'));

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <FloatingBackButton onClick={onBack} />
      <header className="p-6 pt-12 flex items-center gap-4 bg-white/80 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md">
        <DSButton onClick={onBack} variant="ghost" style={{ width: 40, height: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={24} />
        </DSButton>
        <Title size="xl">Controle de Acesso</Title>
      </header>

      <div className="p-6 space-y-6">
        {/* TABS */}
        <div className="flex p-1 bg-white border border-slate-200 rounded-2xl">
          <button onClick={() => setActiveTab('visita')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'visita' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>
            Visitantes
          </button>
          <button onClick={() => setActiveTab('encomenda')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'encomenda' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>
            Encomendas
          </button>
        </div>

        {activeTab === 'visita' ? (
          <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
            <DSCard className="p-8 space-y-6">
              <div className="flex items-center gap-2">
                <Key className="text-brand-600" size={20} />
                <Title level={3}>Novo Visitante</Title>
              </div>

              <DSInput
                placeholder="Nome do Visitante / Prestador"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <DSSelect
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  options={['Visita', 'Serviço', 'Delivery']}
                />
                <DSInput
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <DSButton fullWidth onClick={handleAuthorizeVisitor} variant="primary">Autorizar Entrada</DSButton>
            </DSCard>

            <div className="space-y-4">
              <Title variant="section" align="left">Histórico de Visitantes</Title>
              {myVisitorAccess.length === 0 ? <Text variant="caption" style={{ textAlign: 'center', color: colors.neutral[400] }}>Nenhum acesso registrado.</Text> : (
                myVisitorAccess.map((acc: any, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{acc.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{acc.type} • {acc.date}</p>
                    </div>
                    <div style={{ backgroundColor: colors.success + '20', color: colors.success, padding: '4px 8px', borderRadius: radius.pill, fontSize: 10, fontWeight: 'bold' }}>AUTORIZADO</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <DSCard className="p-8 space-y-6 relative overflow-visible">
              <div className="flex items-center gap-2">
                <Package className="text-amber-500" size={20} />
                <Title level={3}>Autorizar Vizinho</Title>
              </div>
              <Text variant="caption">Permita que um vizinho retire suas encomendas na portaria ou lockers.</Text>

              <div className="relative">
                <DSInput
                  placeholder="Buscar vizinho (Nome ou Unidade)..."
                  value={neighborSearch}
                  onChange={e => setNeighborSearch(e.target.value)}
                />

                {/* SUGGESTIONS */}
                {foundNeighbors.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    {foundNeighbors.map(nb => (
                      <button key={nb.id} onClick={() => { setSelectedNeighbor(nb); setNeighborSearch(nb.name); setFoundNeighbors([]); }} className="w-full text-left p-4 hover:bg-slate-50 border-b border-slate-100 last:border-none flex justify-between items-center group">
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{nb.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase">UNID: {nb.unit} • {nb.tower}</p>
                        </div>
                        <Plus size={16} className="text-slate-400 group-hover:text-brand-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedNeighbor && (
                <div className="bg-brand-50 border border-brand-100 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-black">{selectedNeighbor.name[0]}</div>
                  <div>
                    <p className="text-xs font-bold text-brand-900">Selecionado: {selectedNeighbor.name}</p>
                    <p className="text-[10px] text-brand-500 uppercase">Confirmar autorização?</p>
                  </div>
                </div>
              )}

              <DSButton fullWidth onClick={handleAuthorizeNeighbor} disabled={!selectedNeighbor} variant="warning">Conceder Acesso</DSButton>
            </DSCard>

            <div className="space-y-4">
              <Title variant="section" align="left">Vizinhos Autorizados</Title>
              {authorizations.length === 0 ? (
                <div className="text-center py-8">
                  <Text variant="caption" style={{ color: colors.neutral[400] }}>Nenhum vizinho autorizado.</Text>
                </div>
              ) : (
                authorizations.map(auth => (
                  <div key={auth.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/20">
                        {auth.grantee?.name?.[0]}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">{auth.grantee?.name}</h5>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">CASA {auth.grantee?.unit}</p>
                      </div>
                    </div>
                    <button onClick={() => revokeAuthorization(auth.id)} className="text-rose-500 bg-rose-50 w-10 h-10 rounded-xl active:scale-95 hover:bg-rose-100 transition-colors flex items-center justify-center border border-rose-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export const FinanceiroPage: React.FC<{ onBack: () => void; invoices?: any[] }> = ({ onBack, invoices = [] }) => {
  const pending = invoices.find(i => i.status === 'Pendente');
  const paid = invoices.filter(i => i.status === 'Pago');

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <FloatingBackButton onClick={onBack} />
      <header className="p-6 pt-24 flex items-center gap-4 bg-white/80 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm">
        <DSButton onClick={onBack} variant="ghost" style={{ width: 40, height: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={24} />
        </DSButton>
        <Title size="xl">Boleto Digital</Title>
      </header>
      <div className="p-6 space-y-8 animate-in slide-in-from-right-4">
        {pending ? (
          <DSCard className="p-10 bg-brand-gradient-horizontal text-brand-contrast border-none shadow-2xl shadow-brand-glow rounded-[48px] relative overflow-hidden" style={{ minHeight: 400, justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <Text variant="caption" weight="bold" style={{ textTransform: 'uppercase', opacity: 0.8, marginBottom: 8, color: 'white' }}>{pending.title}</Text>
            <h3 className="text-4xl font-black italic tracking-tighter">R$ {pending.value}</h3>
            <Text variant="caption" style={{ opacity: 0.9, marginTop: 8, color: 'white' }}>Vence em: {new Date(pending.dueDate).toLocaleDateString('pt-BR')}</Text>
            <div className="mt-8 flex gap-3">
              <DSButton variant="secondary" onClick={() => alert('Código copiado!')} fullWidth>
                Copia Código
              </DSButton>
              <button className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center active:scale-95 transition-all hover:bg-white/30 text-white"><Download size={20} /></button>
            </div>
          </DSCard>
        ) : (
          <div className="p-10 bg-emerald-500 text-white rounded-[48px] text-center space-y-4 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 size={48} className="mx-auto" />
            <p className="font-black italic text-xl">Tudo em dia!</p>
            <p className="text-xs opacity-80">Você não possui faturas pendentes.</p>
          </div>
        )}

        <div className="space-y-4">
          <Title variant="section" align="left">Histórico</Title>
          {paid.length === 0 ? <p className="text-center text-slate-400 font-bold italic py-4">Nenhum histórico disponível.</p> : paid.map((inv) => (
            <div key={inv.id} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Check size={24} /></div>
                <div><h5 className="font-bold text-slate-900">{inv.title}</h5><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pago em {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</p></div>
              </div>
              <span className="font-bold text-slate-500">R$ {inv.value}</span>
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
    <div className="min-h-screen bg-slate-50 pb-32">
      <FloatingBackButton onClick={onBack} />
      <header className="p-6 pt-24 flex items-center gap-4 bg-white/80 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md">
        <DSButton onClick={onBack} variant="ghost" style={{ width: 40, height: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={24} />
        </DSButton>
        <Title size="xl">Atendimento</Title>
      </header>

      <div className="p-6 space-y-8">
        {!isNew ? (
          <>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-500/20 text-center relative overflow-hidden border border-white/20">
              <div className="relative z-10">
                <MessageSquare className="mx-auto text-white/80 mb-4" size={48} />
                <h3 className="text-2xl font-black italic tracking-tight">Fale com a Adm</h3>
                <p className="text-sm font-medium text-white/70 mt-2 leading-relaxed max-w-xs mx-auto">Relate problemas, faça sugestões ou tire dúvidas diretamente com a administração.</p>
                <DSButton fullWidth onClick={() => setIsNew(true)} variant="secondary" style={{ marginTop: 32, fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }} className="shadow-lg">Abrir Chamado</DSButton>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Meus Chamados</h4>
              {myRequests.length === 0 ? <p className="text-center text-slate-400 font-bold italic py-8">Nenhum chamado aberto.</p> : myRequests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-[32px] border border-slate-100 space-y-3 shadow-md hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-slate-900 italic">{req.title}</h5>
                    <div style={{
                      backgroundColor: req.status === 'Concluído' ? colors.success + '20' : colors.brand[50], // Success 20 or Brand 50
                      color: req.status === 'Concluído' ? colors.success : colors.brand[600],
                      border: `1px solid ${req.status === 'Concluído' ? colors.success + '30' : colors.brand[100]}`,
                      padding: '4px 8px',
                      borderRadius: radius.sm,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>{req.status}</div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{req.description}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.category} – {req.date}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <DSCard className="p-8 space-y-6 animate-in slide-in-from-bottom-4 relative overflow-visible">
            <div className="flex items-center gap-3 mb-2">
              <DSButton onClick={() => setIsNew(false)} variant="ghost" style={{ width: 40, height: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={20} />
              </DSButton>
              <Title level={3}>Novo Chamado</Title>
            </div>

            <DSInput
              label="Título"
              placeholder="Ex: Lâmpada queimada"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            <DSSelect
              label="Categoria"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              options={['Manutenção', 'Limpeza', 'Segurança', 'Sugestão', 'Reclamação']}
            />

            <DSInput
              label="Descrição"
              placeholder="Descreva a situação..."
              multiline
              value={form.desc}
              onChange={e => setForm({ ...form, desc: e.target.value })}
              style={{ height: 120 }}
            />

            <DSButton fullWidth onClick={handleOpen} variant="primary">Enviar para Adm</DSButton>
          </DSCard>
        )}
      </div>
    </div>
  );
};

export const ServiceRequestsPage: React.FC<{ onBack: () => void; serviceRequests: any[]; currentUser: any }> = ({ onBack, serviceRequests, currentUser }) => {
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Manutenção', desc: '' });

  const handleOpen = async () => {
    if (form.title && form.desc) {
      // Registrar no banco (Simulação ou Supabase dependendo da implementação)
      alert('Chamado aberto com sucesso!');
      setIsNew(false);
      setForm({ title: '', category: 'Manutenção', desc: '' });
    }
  };

  const myRequests = serviceRequests.filter(req => req.unit === (currentUser?.unit || '---'));

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <header className="p-6 pt-24 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-95 transition-all"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase">Atendimento</h2>
      </header>

      <div className="p-6 space-y-8">
        {!isNew ? (
          <>
            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-900/20 text-center relative overflow-hidden">
              <div className="relative z-10">
                <MessageSquare className="mx-auto text-brand-400 mb-4" size={48} />
                <h3 className="text-2xl font-black italic tracking-tight">Fale com a Adm</h3>
                <p className="text-sm font-medium text-slate-400 mt-2 leading-relaxed max-w-xs mx-auto">Relate problemas, faça sugestões ou tire dúvidas diretamente com a administração.</p>
                <DSButton fullWidth onClick={() => setIsNew(true)} variant="primary" style={{ marginTop: spacing.xl, height: 56, borderRadius: 24, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12, fontWeight: 900 }}>Abrir Chamado</DSButton>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Meus Chamados</h4>
              {myRequests.length === 0 ? <p className="text-center text-slate-300 font-bold italic py-8">Nenhum chamado aberto.</p> : myRequests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-[32px] border border-slate-100 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-slate-900 italic">{req.title}</h5>
                    <div style={{
                      backgroundColor: req.status === 'Concluído' ? colors.success + '20' : colors.brand[50],
                      color: req.status === 'Concluído' ? colors.success : colors.brand[600],
                      padding: '4px 8px',
                      borderRadius: radius.sm,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>{req.status}</div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{req.description}</p>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{req.category} – {req.date}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <DSCard className="p-8 space-y-6 animate-in slide-in-from-bottom-4 relative overflow-visible">
            <div className="flex items-center gap-3 mb-2">
              <DSButton onClick={() => setIsNew(false)} variant="ghost" style={{ width: 40, height: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={20} />
              </DSButton>
              <Title level={3}>Novo Chamado</Title>
            </div>

            <DSInput
              label="Título"
              placeholder="Ex: Lâmpada queimada"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            <DSSelect
              label="Categoria"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              options={['Manutenção', 'Limpeza', 'Segurança', 'Sugestão', 'Reclamação']}
            />

            <DSInput
              label="Descrição"
              placeholder="Descreva a situação..."
              multiline
              value={form.desc}
              onChange={e => setForm({ ...form, desc: e.target.value })}
              style={{ height: 120 }}
            />

            <DSButton fullWidth onClick={handleOpen} variant="primary">Enviar para Adm</DSButton>
          </DSCard>
        )}
      </div>
    </div>
  );
};

export const MinhasDemandasPage: React.FC<{ onBack: () => void; currentUser: any; demands?: any[]; proposals?: any[]; onRefresh?: () => void }> = ({ onBack, currentUser, demands = [], proposals = [], onRefresh }) => {
  // Uses lifted state (demands/proposals) to avoid fetch on mount
  const [selectedDemand, setSelectedDemand] = useState<any>(null);

  // Derive proposals for selected demand
  const activeProposals = useMemo(() => {
    if (!selectedDemand) return [];
    return proposals.filter(p => p.demand_id === selectedDemand.id);
  }, [selectedDemand, proposals]);

  const handleCloseDemand = async (id: string) => {
    if (!confirm('Deseja encerrar esta demanda?')) return;
    const { error } = await supabase.from('service_demands').update({ status: 'closed' }).eq('id', id);
    if (!error) {
      alert('Demanda encerrada!');
      if (onRefresh) onRefresh();
    }
  };

  const handleAcceptProposal = async (proposal: any) => {
    if (!confirm(`Aceitar proposta de ${proposal.profiles?.name}?`)) return;

    // 1. Create Service Request (Accepted)
    const { error } = await supabase.from('service_requests').insert([{
      resident_id: currentUser.id,
      provider_id: proposal.professional_id,
      category: proposal.profiles?.category || 'Serviço',
      title: 'Proposta Aceita via Mural',
      description: `Proposta aceita no valor de R$ ${proposal.price}. Mensagem: ${proposal.message}`,
      status: 'accepted',
      unit: currentUser?.unit,
      location: `${currentUser?.tower} - ${currentUser?.unit}`
    }]);

    if (!error) {
      // 2. Update Demand to Closed (or maintain open?) - Usually close it
      await supabase.from('service_demands').update({ status: 'closed' }).eq('id', proposal.demand_id);

      // 3. Update proposal status
      await supabase.from('service_proposals').update({ status: 'accepted' }).eq('id', proposal.id);

      // 4. Registrar Lead (CRM)
      await supabase.from('professional_leads').insert([{
        professional_id: proposal.professional_id,
        resident_id: currentUser.id,
        source: 'proposal_accepted',
        metadata: { origin: 'auction_acceptance', demand_id: proposal.demand_id }
      }]);

      // 5. Open WhatsApp
      const cleanPhone = proposal.profiles?.phone?.replace(/\D/g, '');
      if (cleanPhone) {
        const message = encodeURIComponent(`Olá ${proposal.profiles.name}, aceitei sua proposta no Mural para o serviço de *${proposal.profiles.category}*!`);
        window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
      }

      alert('Proposta aceita! O profissional entrará em contato.');
      if (onRefresh) onRefresh();
    } else {
      alert(translateError(error));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="p-6 pt-12 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
        <DSButton onClick={onBack} variant="ghost" style={{ width: 40, height: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={24} />
        </DSButton>
        <Title size="xl">Minhas Demandas</Title>
      </header>

      <div className="p-6 space-y-6">
        {demands.length === 0 ? (
          <div className="bg-white/5 rounded-[32px] p-8 text-center border border-white/10">
            <Megaphone size={48} className="text-slate-600 mx-auto mb-4 opacity-50" />
            <Title level={3} style={{ color: 'white' }}>Nenhuma demanda ativa</Title>
            <Text variant="caption" style={{ color: colors.neutral[400] }}>Publique no Mural para receber propostas.</Text>
          </div>
        ) : (
          demands.map(demand => {
            const demandProposals = proposals.filter(p => p.demand_id === demand.id);
            return (
              <div key={demand.id} className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div style={{
                    backgroundColor: demand.status === 'open' ? colors.success + '20' : colors.neutral[700],
                    color: demand.status === 'open' ? colors.success : colors.neutral[400],
                    border: `1px solid ${demand.status === 'open' ? colors.success + '20' : 'transparent'}`,
                    padding: '4px 8px',
                    borderRadius: radius.pill,
                    fontSize: 10,
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {demand.status === 'open' ? 'Aberta' : 'Encerrada'}
                  </div>
                  {demand.status === 'open' && (
                    <button onClick={() => handleCloseDemand(demand.id)} className="text-xs text-rose-400 font-bold hover:underline">
                      Encerrar
                    </button>
                  )}
                </div>

                <div>
                  <h4 className="font-black text-white italic text-lg decoration-slice">{demand.category}</h4>
                  <p className="text-sm text-slate-300 mt-1 line-clamp-2">{demand.description}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">
                    {new Date(demand.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Proposals Section */}
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MessageCircle size={14} />
                      Propostas ({demandProposals.length})
                    </h5>
                  </div>

                  {demandProposals.length > 0 ? (
                    <div className="space-y-3">
                      {demandProposals.map(prop => (
                        <div key={prop.id} className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                {prop.profiles?.avatar ? <img src={prop.profiles.avatar} className="w-full h-full object-cover" /> : <User size={16} className="m-auto text-slate-400" />}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">{prop.profiles?.name}</p>
                                <p className="text-[10px] text-brand-400 font-black">R$ {prop.price}</p>
                              </div>
                            </div>
                            <DSButton onClick={() => handleAcceptProposal(prop)} variant="secondary" size="sm" style={{ height: 32, fontSize: 10, padding: '0 12px' }}>
                              Aceitar
                            </DSButton>
                          </div>
                          <p className="text-xs text-slate-300 italic">"{prop.message}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Nenhuma proposta ainda.</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
};

export const CondoAgendaPage: React.FC<{ onBack: () => void; reservations: any[]; onAddReservation: (res: any) => void; commonAreas: any[]; onNavigate?: (s: string) => void; currentUser: any }> = ({ onBack, reservations, onAddReservation, commonAreas, onNavigate, currentUser }) => {
  const [isReservationFlowOpen, setIsReservationFlowOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'GOURMET' | 'ESPORTE' | 'SOCIAL'>('GOURMET');

  // Filter areas
  const filteredAreas = commonAreas.filter(area => {
    // 1. Category Filter
    const cat = (area.category || '').toUpperCase();
    let matchesCategory = false;

    if (activeCategory === 'GOURMET') {
      matchesCategory = cat.includes('GOURMET') || cat.includes('FESTA') || cat.includes('CHURRAS') || cat.includes('PUB') || cat.includes('QUIOSQUE');
      // If no category logic found in DB, default to showing everything in gourmet for now, OR validade by name
      if (!matchesCategory && !area.category) matchesCategory = true;
    } else if (activeCategory === 'ESPORTE') {
      matchesCategory = cat.includes('ESPORTE') || cat.includes('QUADRA') || cat.includes('PISCINA') || cat.includes('ACADEMIA');
    } else if (activeCategory === 'SOCIAL') {
      matchesCategory = cat.includes('SOCIAL') || cat.includes('REUNIÃO') || cat.includes('JOGOS') || cat.includes('BRINQUEDOTECA');
    }

    // 2. Search Filter
    const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-32 font-sans">
      {/* HEADER */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between bg-white sticky top-0 z-40">
        <div>
          <h1 className="text-2xl font-black italic text-[#6d28d9] tracking-tighter" style={{ fontFamily: 'Inter, sans-serif' }}>SPLENDIDO</h1>
          <p className="text-sm text-slate-500 font-medium">Reservas de Espaços</p>
        </div>
        <div className="flex gap-3">
          <button className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600">
            <QrCode size={20} />
          </button>
          <button className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* SEARCH */}
      <div className="px-6 py-2 bg-[#f8f9fc]">
        <div className="bg-white rounded-full px-4 py-3 flex items-center gap-3 shadow-sm border border-slate-100">
          <Search size={20} className="text-slate-400" />
          <input
            type="text"
            placeholder="Qual espaço você quer reservar?"
            className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABS */}
      <div className="px-6 py-2 overflow-x-auto no-scrollbar bg-[#f8f9fc]">
        <div className="flex bg-slate-200/50 p-1 rounded-lg">
          {['GOURMET', 'ESPORTE', 'SOCIAL'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab as any)}
              className={`flex-1 py-2 px-4 rounded-md text-[11px] font-bold transition-all ${activeCategory === tab
                ? (tab === 'GOURMET' ? 'bg-[#7c3aed] text-white shadow-md' : 'bg-white text-slate-700 shadow-sm') // Custom active state per request style? actually just using purple for active
                : 'text-slate-500 hover:text-slate-700'
                }`}
              style={activeCategory === tab ? { backgroundColor: '#6d28d9', color: 'white' } : {}}
            >
              {tab === 'GOURMET' ? 'ÁREAS GOURMET' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="p-6">
        <div className="w-full bg-[#6d28d9] rounded-[32px] p-8 text-center relative overflow-hidden shadow-xl shadow-purple-200">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 text-white">
              <Calendar size={32} strokeWidth={2.5} />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Agende seu Espaço</h2>
            <p className="text-purple-100 text-sm mb-6 max-w-[240px] leading-relaxed">
              Reserve salão de festas, churrasqueira e outros espaços de forma rápida e fácil.
            </p>

            <button
              onClick={() => setIsReservationFlowOpen(true)}
              className="bg-white text-[#6d28d9] font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg hover:bg-slate-50 active:scale-95 transition-all"
            >
              Nova Reserva
            </button>
          </div>
        </div>
      </div>

      {/* LIST HEADER */}
      <div className="bg-[#facc15] py-2 px-6 mb-4">
        <span className="text-[10px] font-black text-[#854d0e] uppercase tracking-widest">
          ESPAÇOS DISPONÍVEIS
        </span>
      </div>

      {/* LIST */}
      <div className="px-6 space-y-4">
        {filteredAreas.length > 0 ? (
          filteredAreas.map(area => (
            <div
              key={area.id}
              onClick={() => setIsReservationFlowOpen(true)} // In future: open specific area
              className="bg-white p-4 rounded-3xl shadow-sm border border-slate-50 flex items-center justify-between cursor-pointer active:scale-95 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#f8fafc] rounded-2xl flex items-center justify-center p-2">
                  {area.photos?.[0] ? (
                    <img src={area.photos[0]} className="w-full h-full object-contain mix-blend-multiply" />
                  ) : (
                    <div className="text-slate-300">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-[#6d28d9] font-bold text-lg">{area.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {activeCategory}
                  </p>
                </div>
              </div>
              <div className="pr-2">
                <ChevronRight size={20} className="text-slate-300" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 opacity-50">
            <p className="text-slate-400 text-sm">Nenhum espaço encontrado nesta categoria.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      <SpaceReservationFlow
        open={isReservationFlowOpen}
        onClose={() => setIsReservationFlowOpen(false)}
        currentUserId={currentUser?.id}
      />

      <AppNavigation
        activeTab="condo-agenda"
        onChange={(tab) => onNavigate?.(tab)}
        currentUser={currentUser}
      />
    </div>
  );
};

export const ResidentBookings: React.FC<{ onBack: () => void; reservations: any[]; currentUser: any; onRefresh: () => void }> = ({ onBack, reservations, currentUser, onRefresh }) => {
  const myReservations = reservations.filter(r => r.resident_id === currentUser.id);

  const handleCancel = async (id: number) => {
    if (window.confirm('Deseja realmente cancelar este agendamento?')) {
      try {
        const { error } = await supabase.from('reservations').update({ status: 'cancelled' }).eq('id', id);
        if (error) throw error;
        alert('Reserva cancelada com sucesso!');
        onRefresh();
      } catch (e: any) {
        alert(translateError(e));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-600"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase text-slate-900">Meus Agendamentos</h2>
      </header>
      <div className="p-6 space-y-6 animate-in slide-in-from-right-4">
        {myReservations.length > 0 ? myReservations.map((r) => (
          <DSCard key={r.id} className="p-8 border border-slate-100 shadow-xl rounded-[44px] bg-white relative overflow-hidden group">
            <div className="absolute top-4 right-4 w-24 h-24 opacity-5">
              <img src="/logo.png" className="w-full h-full object-contain filter grayscale" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local da Reserva</p>
            <h4 className="text-2xl font-black italic tracking-tight text-slate-900">{r.area}</h4>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data</p>
                <p className="font-bold text-slate-900">{new Date(r.date).toLocaleDateString('pt-BR')}</p>
                {r.start_time && (
                  <p className="text-[10px] text-brand-400 font-bold uppercase mt-1">
                    {r.start_time.slice(0, 5)} - {r.end_time?.slice(0, 5)}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div style={{
                  backgroundColor: r.status === 'cancelled' ? colors.danger + '20' : colors.success + '20',
                  color: r.status === 'cancelled' ? colors.danger : colors.success,
                  border: `1px solid ${r.status === 'cancelled' ? colors.danger + '20' : colors.success + '20'}`,
                  padding: '4px 8px',
                  borderRadius: radius.pill,
                  fontSize: 10,
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {r.status === 'cancelled' ? 'CANCELADA' : 'CONFIRMADA'}
                </div>
                {r.status !== 'cancelled' && (
                  <button onClick={() => handleCancel(r.id)} className="text-[9px] font-black text-rose-400 uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-rose-300">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </DSCard>
        )) : (
          <div className="py-24 text-center space-y-4">
            <Calendar className="mx-auto text-slate-700" size={80} />
            <p className="text-slate-500 font-black italic uppercase tracking-widest text-[10px]">Nenhuma reserva agendada.</p>
          </div>
        )}
      </div>
    </div>
  );
};


export const AssembliesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="min-h-screen bg-slate-50 pb-32">
    <header className="p-6 pt-12 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
      <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-95 text-white hover:bg-white/10"><ArrowLeft size={20} /></button>
      <h2 className="text-xl font-black italic uppercase text-slate-900">Assembleias</h2>
    </header>
    <div className="p-6 space-y-6">
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="w-14 h-14 bg-brand-500/10 text-brand-400 rounded-2xl flex items-center justify-center border border-brand-500/20"><Users size={28} /></div>
          <div style={{
            backgroundColor: colors.success + '20',
            color: colors.success,
            border: `1px solid ${colors.success + '20'}`,
            padding: '4px 8px',
            borderRadius: radius.pill,
            fontSize: 10,
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>Aberta</div>
        </div>
        <div>
          <h4 className="font-black text-slate-900 italic text-lg decoration-slice">AGO: Previso Oramentria 2026</h4>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1">15/01/2026  19:30</p>
        </div>
        <DSButton fullWidth variant="secondary" style={{ borderRadius: 24, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ver Pauta e Votar</DSButton>
      </div>
      <div className="text-center py-10">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Histrico de Atas disponvel no portal web.</p>
      </div>
    </div>
  </div>
);

export const ShopDetailPage: React.FC<{ onBack: () => void; products?: any[]; onSelectProduct?: (p: any) => void; categories?: any[]; selectedCategory?: string; onSelectCategory?: (c: string) => void }> = ({ onBack, products = [], onSelectProduct, categories = [], selectedCategory = 'Todos', onSelectCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const displayCategories = ['Todos', ...categories.map(c => c.name)];
  const activeCategoryData = categories.find(c => c.name === selectedCategory);

  const filteredProducts = products.filter(p => {
    const lower = searchTerm.toLowerCase();
    const matchesSearch = (p.title && p.title.toLowerCase().includes(lower)) ||
      (p.description && p.description.toLowerCase().includes(lower)) ||
      (p.profiles && p.profiles.name && p.profiles.name.toLowerCase().includes(lower));

    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <ResidentHeader
        onQrCodeClick={() => { }}
        onNotificationsClick={() => { }}
        notificationCount={0}
      />
      {/* Search Header for Shop */}
      <div className="sticky top-[88px] z-30 px-6 py-2 bg-slate-50/90 backdrop-blur-md mb-0">
        {/* Optional sub-header if needed, but the design has a hero. Let's keep it simple. */}
      </div>
      <div className="h-64 relative bg-brand-600 overflow-hidden">
        {activeCategoryData?.image_url ? (
          <div className="absolute inset-0 bg-cover bg-center animate-in fade-in duration-700" style={{ backgroundImage: `url(${activeCategoryData.image_url})` }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-slate-950/90 backdrop-blur-[1px]"></div>
          </div>
        ) : (
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        )}

        <button onClick={onBack} className="absolute top-12 left-6 w-12 h-12 bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center text-white active:scale-90 z-20 border border-white/10 hover:bg-black/60"><ArrowLeft /></button>
        <div className="absolute bottom-12 left-8 right-8 text-white z-10">
          <h2 className="text-4xl font-black italic tracking-tighter leading-none mb-2">{selectedCategory === 'Todos' ? 'e-Shop' : selectedCategory}</h2>
          <p className="font-medium opacity-80 text-brand-100">Encontre de tudo no seu condomínio.</p>
        </div>
      </div>

      <div className="px-6 -mt-8 relative z-20 mb-6">
        <div className="bg-white/10 p-4 rounded-3xl shadow-xl shadow-black/20 flex items-center gap-3 border border-white/10 backdrop-blur-xl">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar produtos e serviços..."
            className="flex-1 outline-none text-white font-bold placeholder:text-slate-400 placeholder:font-medium bg-transparent"
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
              className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === t ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 border-brand-500' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
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
              className="bg-white/5 p-4 rounded-[32px] border border-white/10 shadow-sm active:scale-[0.98] transition-all flex gap-4 cursor-pointer hover:bg-white/10"
            >
              <div className="w-24 h-24 bg-white/5 rounded-2xl overflow-hidden relative group shrink-0 border border-white/5">
                {p.image_url ? (
                  <img src={p.image_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600"><Store size={24} /></div>
                )}
              </div>
              <div className="flex-1 py-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h5 className="font-black text-white italic text-lg leading-tight line-clamp-2">{p.title}</h5>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                    {p.category}
                  </span>
                  {p.profiles?.name && <span className="text-[9px] font-bold text-slate-500">por {p.profiles.name.split(' ')[0]}</span>}
                </div>

                <div className="flex justify-between items-end mt-3">
                  <p className="text-emerald-400 font-black text-lg tracking-tight">R$ {typeof p.price === 'number' ? p.price.toFixed(2) : p.price}</p>
                  <button className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-white/20">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-slate-600 border border-white/5"><Search size={24} /></div>
              <p className="text-slate-500 font-bold text-sm">Nenhum produto encontrado.</p>
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
      <ResidentHeader
        onQrCodeClick={() => { }}
        onNotificationsClick={() => { }}
        notificationCount={0}
      />
      <div className="h-[50vh] relative bg-slate-900 rounded-b-[48px] shadow-2xl shadow-black/50 overflow-hidden group border-b border-white/5">
        {item.image_url ? (
          <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700">
            <Store size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 opacity-90"></div>
        <button onClick={onBack} className="absolute top-6 left-6 w-12 h-12 bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center text-white active:scale-90 shadow-lg border border-white/10 hover:bg-black/60 transition-all z-[30]"><ArrowLeft /></button>
      </div>

      <div className="px-6 -mt-16 relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl shadow-black/50 border border-white/10">
          <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">{item.category}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none mb-6">{item.title}</h2>

          <div className="flex items-center gap-4 pb-6 border-b border-white/5 mb-6">
            <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden border border-white/10">
              <img src={`https://picsum.photos/seed/${item.vendor_id}/100`} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm text-white font-bold">Vendido por {item.profiles?.name || 'Vendedor Parceiro'}</p>
              {item.profiles?.unit ? (
                <p className="text-[10px] text-slate-400 font-medium font-bold uppercase tracking-wide">Residente • {item.profiles.tower || ''} {item.profiles.unit}</p>
              ) : (
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Loja Verificada</p>
              )}
            </div>
          </div>

          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Sobre este item</h3>
          <p className="text-slate-300 leading-relaxed text-sm font-medium mb-10">
            {item.description || "Sem descrição detalhada."}
          </p>

          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Valor Total</p>
              <p className="text-3xl font-black text-emerald-400 tracking-tighter">R$ {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</p>
            </div>
            <DSButton
              onClick={handleContact}
              variant="primary"
              fullWidth
              style={{ flex: 1, height: 56, borderRadius: 16, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              startIcon={<MessageCircle size={18} />}
            >
              Tenho Interesse
            </DSButton>
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
      alert(translateError(error));
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
        condominium_id: formData.condo || null
      }).eq('id', currentUser.id);

      if (error) throw error;
      alert('Dados atualizados com sucesso! O aplicativo será recarregado para aplicar as mudanças.');
      window.location.reload();
    } catch (err: any) {
      alert(translateError(err));
    } finally {
      setLoading(false);
    }
  };


  const selectedCondoData = condos.find(c => c.id === formData.condo);
  const isHorizontal = selectedCondoData?.type === 'horizontal';

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="p-6 pt-24 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
        <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-90 transition-transform hover:bg-white/10 text-slate-900 bg-slate-200 hover:bg-slate-300"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase text-slate-900">Dados Pessoais</h2>
      </header>
      <div className="p-6 space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-[40px] border-4 border-white shadow-xl overflow-hidden mb-4 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
            {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="text-brand-600 font-bold text-xs uppercase bg-brand-50 px-4 py-2 rounded-lg active:scale-95 transition-transform hover:bg-brand-100" disabled={uploading}>
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

        <div className="space-y-6 bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
          <DSInput
            label="Nome Completo"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />

          <DSSelect
            label="Condomínio"
            disabled
            value={formData.condo}
            options={[{ label: selectedCondoData?.name || 'Carregando...', value: formData.condo }]}
          />

          <div className="grid grid-cols-2 gap-4">
            <DSInput
              label={isHorizontal ? 'Rua/Alameda' : 'Apto/Unidade'}
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value })}
            />
            <DSInput
              label={isHorizontal ? 'Número' : 'Bloco/Torre'}
              value={formData.tower}
              onChange={e => setFormData({ ...formData, tower: e.target.value })}
            />
          </div>

          <DSInput
            label="Email"
            value={formData.email}
            readOnly
            style={{ backgroundColor: colors.neutral[100], color: colors.neutral[400] }}
          />

          <DSInput
            label="WhatsApp"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
          />
        </div>

        <DSButton fullWidth onClick={handleSave} disabled={loading} variant="primary" style={{ height: 64, borderRadius: 28, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 12, fontWeight: 900 }}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </DSButton>

        <button
          onClick={async () => {
            if (confirm('ATENÇÃO: Deseja realmente excluir sua conta permanentemente? Esta ação não pode ser desfeita.')) {
              if (confirm('Tem certeza absoluta? Todos os seus dados serão apagados.')) {
                setLoading(true);
                const { error } = await supabase.rpc('delete_client_user');
                if (error) {
                  alert(translateError(error));
                  setLoading(false);
                } else {
                  alert('Conta excluída com sucesso.');
                  await supabase.auth.signOut();
                  window.location.reload();
                }
              }
            }
          }}
          className="w-full h-14 mt-4 bg-rose-500/10 text-rose-500 rounded-[28px] flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] hover:bg-rose-500/20 transition-all active:scale-95 border border-rose-500/20"
        >
          <Trash2 size={18} />
          Excluir Minha Conta
        </button>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <ResidentHeader
        onQrCodeClick={() => { }}
        onNotificationsClick={() => { }}
        notificationCount={0}
      />
      <header className="p-6 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-[88px] z-30 backdrop-blur-md">
        <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-90 transition-transform hover:bg-white/10 text-white"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase text-slate-900">Privacidade</h2>
      </header>
      <div className="p-6 space-y-6">
        <div className="bg-white/5 p-8 rounded-[40px] shadow-sm space-y-8 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">Perfil Público</h4>
              <p className="text-xs text-slate-400 max-w-[200px] mt-1">Permitir que outros moradores vejam seu nome e unidade</p>
            </div>
            <div className="w-14 h-8 bg-emerald-500 rounded-full p-1 flex justify-end cursor-pointer"><div className="w-6 h-6 bg-white rounded-full shadow-sm"></div></div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">Notificações Push</h4>
              <p className="text-xs text-slate-400 max-w-[200px] mt-1">Receber avisos de encomendas e visitantes</p>
            </div>
            <div className="w-14 h-8 bg-emerald-500 rounded-full p-1 flex justify-end cursor-pointer"><div className="w-6 h-6 bg-white rounded-full shadow-sm"></div></div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">Mostrar Telefone</h4>
              <p className="text-xs text-slate-400 max-w-[200px] mt-1">Permitir que prestadores vejam seu contato</p>
            </div>
            <div className="w-14 h-8 bg-slate-700 rounded-full p-1 flex justify-start cursor-pointer"><div className="w-6 h-6 bg-white/50 rounded-full shadow-sm"></div></div>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-500 uppercase font-bold tracking-widest px-10">Qualquer mudança pode levar alguns minutos para refletir no sistema.</p>
      </div>
    </div>
  );
};

// --- NAVEGA��O ---
// --- NAVIGATION WITH HAMBURGER MENU ---
export const AppNavigation: React.FC<{ activeTab: string; onChange: (tab: string) => void; currentUser?: any; onLogout?: () => void; onNotifications?: () => void }> = ({ activeTab, onChange, currentUser, onNotifications }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-6 py-2 pb-6 flex justify-between items-end z-50 rounded-t-[30px]">

      <button
        onClick={() => onChange('home')}
        className={`flex-1 flex flex-col items-center gap-1.5 transition-all outline-none ${activeTab === 'home' || activeTab === 'resident' ? 'text-[#7C3AED]' : 'text-purple-200 hover:text-purple-300'}`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'home' ? 'bg-purple-50' : ''}`}>
          <Home size={26} strokeWidth={activeTab === 'home' ? 0 : 2.5} fill={activeTab === 'home' ? "currentColor" : "none"} />
        </div>
        <span className={`text-[10px] font-bold ${activeTab === 'home' ? 'opacity-100' : 'opacity-80'}`}>Início</span>
      </button>

      <button
        onClick={() => onChange('condo-agenda')}
        className={`flex-1 flex flex-col items-center gap-1.5 transition-all outline-none ${activeTab === 'condo-agenda' ? 'text-[#7C3AED]' : 'text-purple-200 hover:text-purple-300'}`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'condo-agenda' ? 'bg-purple-50' : ''}`}>
          <CalendarDays size={26} strokeWidth={activeTab === 'condo-agenda' ? 0 : 2.5} fill={activeTab === 'condo-agenda' ? "currentColor" : "none"} />
        </div>
        <span className={`text-[10px] font-bold ${activeTab === 'condo-agenda' ? 'opacity-100' : 'opacity-80'}`}>Agenda</span>
      </button>

      <div className="-mt-14 relative z-10 mx-2 group">
        <button
          onClick={() => onChange('create-desapego')}
          className="w-16 h-16 bg-[#7C3AED] rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-500/40 border-[6px] border-slate-50 active:scale-90 transition-transform hover:scale-105"
        >
          <Plus size={32} strokeWidth={3} className="stroke-white" />
        </button>
      </div>

      <button
        onClick={onNotifications ? onNotifications : () => onChange('chamado')}
        className={`flex-1 flex flex-col items-center gap-1.5 transition-all outline-none ${activeTab === 'chamado' ? 'text-[#7C3AED]' : 'text-purple-200 hover:text-purple-300'}`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'chamado' ? 'bg-purple-50' : ''}`}>
          <Megaphone size={26} strokeWidth={activeTab === 'chamado' ? 0 : 2.5} fill={activeTab === 'chamado' ? "currentColor" : "none"} />
        </div>
        <span className={`text-[10px] font-bold ${activeTab === 'chamado' ? 'opacity-100' : 'opacity-80'}`}>Avisos</span>
      </button>

      <button
        onClick={() => onChange('profile')}
        className={`flex-1 flex flex-col items-center gap-1.5 transition-all outline-none ${activeTab === 'profile' ? 'text-[#7C3AED]' : 'text-purple-200 hover:text-purple-300'}`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-purple-50' : ''}`}>
          <User size={26} strokeWidth={activeTab === 'profile' ? 0 : 2.5} fill={activeTab === 'profile' ? "currentColor" : "none"} />
        </div>
        <span className={`text-[10px] font-bold ${activeTab === 'profile' ? 'opacity-100' : 'opacity-80'}`}>Perfil</span>
      </button>

    </div>
  );
};

export const BannerCarousel: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadBanners = async () => {
      const { data } = await supabase.from('banners').select('*').eq('active', true).order('display_order', { ascending: true });
      if (data && data.length > 0) setBanners(data);
    };
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length === 0) return (
    <div className="w-full h-40 bg-slate-100 rounded-none animate-pulse flex items-center justify-center">
      <span className="text-slate-300 font-bold uppercase text-xs tracking-widest">Carregando Novidades...</span>
    </div>
  );

  // FORCE DUPLICATION FOR DEMO IF ONLY 1 BANNER (To show rotation)
  const displayBanners = banners.length === 1 ? [...banners, { ...banners[0], id: 'dummy-2', title: banners[0].title, image_url: banners[0].image_url }] : banners;

  return (
    <div className="relative w-full h-56 md:h-64 shadow-sm group bg-slate-900 overflow-hidden">
      {displayBanners.map((banner, index) => (
        <div
          key={banner.id || index}
          onClick={() => banner.link_url && window.open(banner.link_url, '_blank')}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'}`}
        >
          <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover opacity-90" />

          {/* Gradient Overlay Improved */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-6 pb-10">
            <div className={`transition-all duration-700 delay-300 ${index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

              {banner.title && <h3 className="text-white font-black italic text-2xl md:text-3xl drop-shadow-xl leading-none mb-1 max-w-sm">{banner.title}</h3>}
              {banner.link_url && (
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-1 mt-2 group-hover:text-brand-400 transition-colors">Saiba Mais <ChevronRight size={12} className="text-brand-400" /></span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Modern Dots Indicator */}
      {displayBanners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
          {displayBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm ${idx === currentIndex ? 'bg-brand-400 w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};


