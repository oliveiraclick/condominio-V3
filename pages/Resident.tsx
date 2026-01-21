import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, Badge, Button, Input } from '../components/ui';
import {
  Bell, Search, MapPin, Grid, Calendar, ShoppingBag,
  User, Plus, Package, Key, Zap, CreditCard,
  Sparkles, Star, ChevronRight, ChevronLeft, Tag, XCircle,
  Users, ArrowLeft, Filter, Droplets, Paintbrush,
  Leaf, Car, Wrench, Phone, Monitor, LayoutGrid, Scissors, Utensils,
  Coffee, ShoppingCart, HeartPulse, PawPrint, Megaphone,
  QrCode, Unlock, History, AlertCircle, FileText, Copy, CheckCircle2,
  Settings, LogOut, ShieldCheck, Wallet, HelpCircle, UserCheck,
  CalendarDays, Check, HardHat, Hammer, UserPlus, Briefcase, ListFilter, PartyPopper,
  Trophy, Target, Dumbbell, GlassWater, Waves, Store, Heart, Navigation,
  MessageSquare, Send, Paperclip, Mic, MoreVertical, CheckCheck, Award, Quote, Camera, MessageCircle,
  Image as ImageIcon, X, Clock, MapPinned, Trash2, Share2, UserCircle2, Flame,
  Building2, Camera as CameraIcon, Download, Scan, Handshake, BadgeCheck, Menu
} from 'lucide-react';
import { maskPhone } from '../utils/masks';
import { QRCodeSVG } from 'qrcode.react';
import { PackageScanner } from '../components/PackageScanner';
import { CommunicationHub } from './CommunicationHub';
import { ProfessionalSector, ProfessionalProfile, UserRole } from '../types';
import { supabase } from '../supabase';
import { CalendarPicker } from '../components/CalendarPicker';

import { AppFeedbackModal } from '../components/AppFeedbackModal';


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
    <h3 className="text-xl font-bold text-white tracking-tight leading-none">{title}</h3>
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>
      <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl transform transition-transform pointer-events-auto max-h-[85vh] flex flex-col animate-in slide-in-from-bottom">
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0"></div>
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h3 className="text-xl font-black text-white uppercase">Notificações</h3>
          <button onClick={onClose} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/10 transition-colors"><XCircle size={20} /></button>
        </div>

        <div className="space-y-4 overflow-y-auto min-h-0 pb-6">
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-xs">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 space-y-4 opacity-50">
              <Bell size={48} className="mx-auto text-slate-600" />
              <p className="text-sm font-bold text-slate-500">Tudo limpo por aqui!</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 relative group">
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'package' ? 'bg-amber-100 text-amber-600' :
                    n.type === 'access' ? 'bg-emerald-100 text-emerald-600' :
                      n.type === 'notice' ? 'bg-blue-100 text-blue-600' :
                        'bg-brand-100 text-brand-600'
                    }`}>
                    {n.type === 'package' ? <Package size={20} /> :
                      n.type === 'access' ? <Key size={20} /> :
                        n.type === 'notice' ? <Megaphone size={20} /> :
                          <Bell size={20} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm leading-tight mb-1">{n.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-2">{n.message}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {new Date(n.created_at).toLocaleDateString('pt-BR')} às {new Date(n.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button onClick={() => markAsRead(n.id)} className="absolute top-2 right-2 p-2 text-slate-600 hover:text-brand-400 transition-colors">
                    <CheckCircle2 size={16} />
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
      alert('Erro ao autorizar: ' + err.message);
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-t-[40px] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black italic text-white">Vizinhos Autorizados</h3>
          <button onClick={onClose}><XCircle size={32} className="text-slate-500 hover:text-slate-300 transition-colors" /></button>
        </div>

        <div className="bg-white/5 p-6 rounded-[32px] mb-8 space-y-4 border border-white/5">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Adicionar Novo</h4>

          <div className="flex gap-2 items-end">
            <div className="space-y-2 flex-1">
              <Input
                placeholder="Rua (Ex: 1)"
                value={manualEntry.tower}
                onChange={e => setManualEntry({ ...manualEntry, tower: e.target.value })}
                className="h-12 bg-white/5 border-white/10 text-white placeholder-slate-500 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2 flex-1">
              <Input
                placeholder="Casa (Ex: 460)"
                value={manualEntry.unit}
                onChange={e => setManualEntry({ ...manualEntry, unit: e.target.value })}
                className="h-12 bg-white/5 border-white/10 text-white placeholder-slate-500 backdrop-blur-sm"
              />
            </div>
            <Button onClick={authorizeByAddress} disabled={loading} className="h-12 w-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-emerald-200 shadow-lg active:scale-95 transition-all">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={24} strokeWidth={3} />}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2">Autorizações Ativas</h4>
          {authorizations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-xs italic">Ninguém autorizado.</p>
            </div>
          ) : (
            authorizations.map(auth => (
              <div key={auth.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl shadow-sm">
                <div>
                  <h5 className="font-bold text-white text-sm">{auth.grantee?.name}</h5>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">RUA {auth.grantee?.tower}, {auth.grantee?.unit}</p>
                </div>
                <button onClick={() => revokeAuthorization(auth.id)} className="text-rose-400 bg-rose-500/10 p-2 rounded-xl active:scale-95 hover:bg-rose-500/20 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const DigitalIDModal: React.FC<{ isOpen: boolean; onClose: () => void; currentUser: any; onOpenAuth: () => void }> = ({ isOpen, onClose, currentUser, onOpenAuth }) => {
  if (!isOpen) return null;

  const qrValue = `RESIDENT:${currentUser?.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-xs sm:max-w-sm bg-slate-900 border border-white/10 rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-300 mx-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-brand-600"></div>
        <div className="relative flex flex-col items-center">
          <button onClick={onClose} className="absolute top-0 right-0 z-50 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform backdrop-blur-sm">
            <X size={16} strokeWidth={3} />
          </button>

          <div className="w-20 h-20 rounded-[28px] p-1 bg-slate-900 shadow-xl mb-3 mt-6 ring-4 ring-slate-900 z-10">
            <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full rounded-[24px] object-cover bg-slate-800" />
          </div>
          <h2 className="text-xl font-black text-white italic tracking-tighter text-center leading-none">{currentUser?.name}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 mt-1">
            {currentUser?.unit?.toString().toUpperCase().includes('RUA')
              ? `${currentUser.unit}, ${currentUser.tower}`
              : `RUA ${currentUser?.tower || '', currentUser?.unit || ''}`
            }
          </p>

          <div className="p-4 bg-white rounded-[24px] shadow-sm mb-6">
            <QRCodeSVG value={qrValue} size={160} />
          </div>

          <p className="text-center text-slate-400 text-[10px] max-w-[200px] leading-relaxed mb-4">
            Apresente este código na portaria para retirar suas encomendas com segurança.
          </p>

          <Button onClick={onOpenAuth} className="bg-white/10 text-white hover:bg-white/20 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest w-full mb-2 border border-white/5 shadow-lg">
            <Users size={16} className="mr-2" />
            Autorizar Vizinho
          </Button>

          <button onClick={onClose} className="hover:bg-white/5 p-2 rounded-full transition-colors mt-1">
            <XCircle size={24} className="text-slate-500" />
          </button>
        </div>
      </div>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-t-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black italic text-white tracking-tighter">Publicar no Mural</h2>
          <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-white/10">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">O que você precisa?</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border ${category === cat ? 'bg-brand-600 text-white border-brand-600' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Dê mais detalhes</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-[24px] p-5 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-brand-500 text-white placeholder-slate-500"
              placeholder="Ex: Preciso consertar uma torneira na cozinha amanhã de manhã..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button fullWidth className="bg-white text-slate-900 h-16 rounded-[24px] uppercase tracking-widest font-black text-xs hover:bg-slate-200 transition-colors" onClick={handleSubmit} loading={loading}>
            Publicar Agora
          </Button>
        </div>
      </div>
    </div>
  );
};

export const DesapegoCard: React.FC<{ item: any; onClick: () => void }> = ({ item, onClick }) => {
  return (
    <Card
      onClick={onClick}
      className={`p-0 overflow-hidden border border-white/10 shadow-xl shadow-slate-900/60 rounded-[40px] bg-white/5 backdrop-blur-3xl group transition-all cursor-pointer active:scale-[0.98]`}
    >
      <div className="relative h-72 p-5">
        <img src={item.img} className="w-full h-full object-cover rounded-[32px] group-hover:scale-105 transition-transform duration-700" alt={item.name} />
        <div className="absolute top-10 left-10">
          <span className="bg-emerald-500 text-white font-black px-4 py-2 text-[10px] uppercase rounded-xl shadow-lg tracking-widest">{item.status}</span>
        </div>
        <div className="absolute bottom-10 right-10 bg-slate-950/80 backdrop-blur-md px-5 py-3 rounded-[20px] shadow-xl border border-white/20">
          <p className="text-lg font-black text-white tracking-tighter">{item.price}</p>
        </div>
      </div>
      <div className="p-8 pt-2">
        <h4 className="font-black text-xl text-white mb-2 tracking-tighter italic truncate">{item.name}</h4>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shadow-sm bg-white/10">
            <img src={`https://picsum.photos/seed/${item.user}/100`} className="w-full h-full object-cover" alt="User" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.user} <span className="text-brand-400">
              {item.unit && item.unit.toUpperCase().includes('CASA')
                ? `, Rua ${item.tower}, ${item.unit.replace(/casa/i, '').trim()}`
                : item.tower ? `, ${item.tower} - ${item.unit}` : ''}
            </span></p>
          </div>
        </div>

        <button
          onClick={onClick}
          className="w-full py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 bg-emerald-500 text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <MessageSquare size={16} />
          Ver Detalhes
        </button>
      </div>
    </Card>
  );
};

// --- HOME DO MORADOR ---
// --- REVIEW MODAL ---
export const ReviewModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (rating: number, comment: string) => void; proName: string }> = ({ isOpen, onClose, onSubmit, proName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 mx-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-amber-500/20 border border-amber-500/20">
            <Star size={32} fill="currentColor" />
          </div>
          <h3 className="text-2xl font-black text-white italic tracking-tighter">Avaliar Serviço</h3>
          <p className="text-sm text-slate-400">Como foi o atendimento de <span className="font-bold text-white">{proName}</span>?</p>

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
            className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-amber-400 transition-all font-medium text-white placeholder-slate-500"
          />

          <Button onClick={() => onSubmit(rating, comment)} fullWidth className="h-14 bg-amber-400 text-amber-950 font-black uppercase tracking-widest shadow-lg shadow-amber-400/30 hover:bg-amber-500 hover:text-white">
            Enviar Avaliação
          </Button>
          <button onClick={onClose} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export const ProfessionalDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; professional: any }> = ({ isOpen, onClose, professional }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);

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
      setRating(null);
      setReviewsCount(0);
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">

        {/* HEADER: Avatar & Info */}
        <div className="flex flex-col items-center shrink-0">
          {/* Avatar - Smaller & Focused */}
          <div className="w-24 h-24 bg-white/10 rounded-[24px] overflow-hidden shadow-md border-4 border-white/10 relative z-10 mb-3">
            <img
              src={professional.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${professional.name}`}
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div className="text-center space-y-1 w-full">
            <h2 className="text-2xl font-black text-white italic tracking-tighter leading-none">
              {professional.name}
            </h2>
            <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 inline-block">
              {professional.category || 'Prestador'}
            </span>
          </div>

          {/* BIG STARS */}
          <div className="flex items-center justify-center gap-1 py-4">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={24} fill={rating && s <= Math.round(rating) ? "#fbbf24" : "none"} className={rating && s <= Math.round(rating) ? "text-amber-400" : "text-white/20"} strokeWidth={3} />
            ))}
          </div>
          <p className="text-xs font-bold text-slate-400 -mt-2 mb-4">
            {rating ? rating.toFixed(1) : 'Novo'} • {reviewsCount} avaliações
          </p>
        </div>

        {/* SCROLLABLE CONTENT: Description & Reviews */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 -mr-2 min-h-0">
          {/* Description */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sobre</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {professional.description || 'Este profissional ainda não adicionou uma descrição detalhada.'}
            </p>
          </div>

          {/* Reviews List */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 sticky top-0 bg-slate-900 py-2 z-10">
              O que dizem os vizinhos
            </h4>
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">Nenhuma avaliação ainda.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-white/5 border border-white/5 rounded-2xl p-3 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-white">{rev.reviewer?.name || 'Vizinho'}</span>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={10} fill={s <= rev.rating ? "currentColor" : "none"} className={s <= rev.rating ? "" : "text-white/20"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{rev.comment || 'Sem comentário.'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-4 shrink-0 grid gap-2">
          <button
            onClick={() => {
              if (professional.phone) {
                const cleanPhone = professional.phone.replace(/\D/g, '');
                window.open(`https://wa.me/55${cleanPhone}`, '_blank');
              } else {
                alert('Telefone indisponível');
              }
            }}
            className="h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[20px] flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all w-full"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle size={18} className="text-white" fill="currentColor" />
            </div>
            <span className="font-black uppercase tracking-widest text-xs">Chamar no WhatsApp</span>
          </button>

          <button onClick={onClose} className="h-10 text-slate-400 font-bold uppercase tracking-widest text-xs hover:bg-white/5 rounded-xl transition-colors">
            Fechar
          </button>
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
    const { error } = await supabase
      .from('packages')
      .update({ status: 'delivered' })
      .eq('id', pkgId);

    if (!error) {
      alert('Entrega confirmada! Obrigado.');
      // Local state will refresh via subscription/useEffect
      // Force immediate refresh of localPackages if possible (the subscription handles it but safety first)
      const { data } = await supabase
        .from('packages')
        .select('*')
        .or(`resident_id.eq.${currentUser.id},picked_up_by.eq.${currentUser.id}`)
        .in('status', ['pending', 'awaiting_confirmation']);
      if (data) setLocalPackages(data);
    } else {
      alert('Erro ao confirmar: ' + error.message);
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
      alert('Erro ao enviar avaliação: ' + error.message);
    }
  };

  const featuredProduct = products.length > 0 ? products[products.length - 1] : null;

  return (
    <div className="min-h-screen bg-transparent pb-32 relative w-full overflow-x-hidden">
      {/* HEADER: ON-SITE BANNER REMOVED AS REQUESTED */}

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
          <button onClick={() => setShowPackageModal(true)} className="bg-black/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-amber-950">
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
                  <Button
                    fullWidth
                    onClick={() => {
                      localPackages.filter(p => p.status === 'awaiting_confirmation').forEach(p => handleConfirmHandshake(p.id));
                      setShowPackageModal(false);
                    }}
                    className="h-16 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-sm rounded-3xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 group overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2 justify-center">
                      <Check size={20} className="stroke-[3]" /> Sim, Recebi agora
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </Button>
                  <button onClick={() => setShowPackageModal(false)} className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none hover:text-slate-600 transition-colors">
                    Não estou com ele
                  </button>
                </div>
              </div>
            ) : (
              /* NORMAL PENDING MODE - UNBOXING */
              <div className="space-y-8 py-2">
                <div className="relative flex justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[40px] flex items-center justify-center text-amber-500 shadow-xl border border-white relative z-10 transform -rotate-6">
                    <Package size={48} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white z-20 font-black italic text-xs animate-bounce">
                    {localPackages.length}
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
                    Suas Encomendas<br /><span className="text-amber-500">Chegaram!</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 leading-relaxed">
                    Você tem {localPackages.length} {localPackages.length === 1 ? 'volume' : 'volumes'} prontos para retirada<br />na portaria principal.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <Button
                    fullWidth
                    onClick={() => { setShowPackageModal(false); setDigitalIdOpen(true); }}
                    className="h-16 bg-slate-950 hover:bg-black text-white font-black uppercase tracking-widest text-sm rounded-3xl shadow-2xl relative overflow-hidden group transition-all active:scale-95"
                  >
                    <span className="relative z-10 flex items-center gap-3 justify-center">
                      <QrCode size={22} /> Gerar meu QR de Coleta
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </Button>

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
      <div className="bg-primary pt-24 rounded-b-[40px] shadow-sm border-b border-primary relative overflow-visible mb-12">
        {/* WATERMARK SYMBOL (Novo) */}
        {(currentUser?.symbol_url || currentUser?.symbol) && (
          <div
            className="absolute inset-0 z-0 pointer-events-none rounded-b-[40px] overflow-hidden"
            style={{ opacity: (currentUser.symbol_opacity || 15) / 100 }}
          >
            <img
              src={currentUser.symbol_url || currentUser.symbol}
              className="absolute inset-0 w-full h-full object-cover"
              alt="Background Branding"
              style={{
                transform: 'scale(1.2)'
              }}
              onError={(e) => {
                // Hide watermark on image load error
                e.currentTarget.parentElement!.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="px-6 pb-20 relative z-10">
          <div className="flex items-center justify-between mb-8">
            {/* Left Side: Avatar & Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-white/20 shadow-xl bg-white/10 backdrop-blur-sm">
                <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white italic tracking-tighter">Olá, {currentUser?.name?.split(' ')[0]}</h1>
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={12} className="text-white/70" />
                  {currentUser?.unit?.toString().toUpperCase().includes('RUA')
                    ? `${currentUser.unit}, ${currentUser.tower}`
                    : `RUA ${currentUser?.tower || ''}, ${currentUser?.unit || ''}`
                  }
                </p>
              </div>
            </div>

            {/* Right Side: Actions (Logo removed) */}
            <div className="flex items-center gap-3">
              <button onClick={() => setDigitalIdOpen(true)} className="bg-white p-2.5 rounded-xl shadow-sm active:scale-95 transition-all">
                <QrCode size={20} className="text-slate-900" />
              </button>

              <button onClick={() => setShowNotifications(!showNotifications)} className="w-12 h-12 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center relative active:bg-white/20 transition-all">
                <Bell size={24} className="text-white" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
              </button>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => onSelectCategory('Todos', homeSearch.trim())}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 active:scale-90 transition-transform"
            >
              <Search className="text-white/70" size={18} />
            </button>
            <Input
              placeholder="Procurar produto ou serviço..."
              className="pl-12 h-14 bg-white/10 border-none rounded-2xl font-medium text-white placeholder:text-white/60 focus:bg-white/20 transition-all font-sans"
              value={homeSearch}
              onChange={(e) => setHomeSearch(e.target.value)}
              onKeyDown={handleHomeSearch}
            />
          </div>
        </div>

        {/* LOGO CENTRALIZADA (BAIXO) */}
        {currentUser?.logo && currentUser.logo.trim() && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full p-2 shadow-xl flex items-center justify-center z-20">
            <img
              src={currentUser.logo}
              className="w-full h-full object-contain"
              alt="Logo"
              onError={(e) => {
                // Hide logo on image load error
                e.currentTarget.parentElement!.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="p-6 space-y-12">
        {/* CARROSSEL DE MURAL (ADVERTISING) */}
        <BannerCarousel />

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
                  className="min-w-[140px] bg-white/5 backdrop-blur-xl p-4 rounded-[24px] border border-white/10 shadow-lg flex flex-col items-center gap-3 cursor-pointer hover:bg-white/10 transition-all active:scale-95"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 relative">
                    <img
                      src={pro.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pro.name}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                  </div>

                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {pro.category || 'Prestador'}
                    </p>
                    <h4 className="font-black text-white text-xs leading-tight line-clamp-1">
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
                <div key={i} className="bg-white/5 backdrop-blur-xl p-5 rounded-[24px] border border-white/10 shadow-lg shadow-amber-500/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concluído em {new Date(req.created_at).toLocaleDateString('pt-BR')}</p>
                    <h4 className="font-black text-white text-sm mt-1">{req.title}</h4>
                    <p className="text-xs text-slate-400">Com {req.providerName || 'Prestador'}</p>
                  </div>
                  <Button onClick={() => { setSelectedRequestToReview(req); setReviewModalOpen(true); }} className="px-5 py-2 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-colors">
                    Avaliar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* ATALHOS RÁPIDOS (COM ABAS) */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
            <button
              onClick={() => setActiveSection('prestadores')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSection === 'prestadores' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Prestadores
            </button>
            <button
              onClick={() => setActiveSection('gestao')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSection === 'gestao' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
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
                    { icon: <Key size={20} />, label: 'Acessos', target: 'acesso', color: 'text-brand-400', bg: 'bg-brand-500/20' },
                    { icon: <CalendarDays size={20} />, label: 'Reservas', target: 'condo-agenda', color: 'text-amber-400', bg: 'bg-amber-500/20' },
                    { icon: <CreditCard size={20} />, label: 'Financeiro', target: 'financeiro', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
                    { icon: <FileText size={20} />, label: 'Documentos', target: 'financeiro', color: 'text-blue-400', bg: 'bg-blue-500/20' }, // Financeiro handles documents usually or there is a docs page
                    { icon: <MessageSquare size={20} />, label: 'Fale com Cond.', target: 'chamado', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
                    { icon: <Scan size={20} />, label: 'Retirar Encomenda', target: 'scanner-encomenda', color: 'text-slate-100', bg: 'bg-slate-800 transition-colors group-hover:bg-slate-700' },
                  ].map((act, i) => (
                    <button key={i} onClick={() => onNavigate(act.target)} className="bg-white/5 backdrop-blur-md p-3 py-4 rounded-[24px] flex flex-col items-center gap-2 shadow-lg border border-white/10 active:scale-95 transition-all group hover:bg-white/10">
                      <div className={`${act.color} ${act.bg} w-10 h-10 rounded-xl flex items-center justify-center`}>{act.icon}</div>
                      <span className="text-[9px] font-black text-slate-300 uppercase text-center tracking-tight leading-none line-clamp-2">{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <SectionHeader title="Prestadores" actionLabel="Ver Todos" onAction={() => onSelectCategory('Todos')} />
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: <Leaf size={20} />, label: 'Jardim', category: 'Jardinagem', color: 'text-green-400', bg: 'bg-green-500/20' },
                    { icon: <Zap size={20} />, label: 'Eletricista', category: 'Eletricista', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
                    { icon: <Droplets size={20} />, label: 'Limpeza', category: 'Limpeza', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
                    { icon: <Wrench size={20} />, label: 'Reparos', category: 'Manutenção', color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
                  ].map((act, i) => {
                    // Check if category exists in DB (case-insensitive or exact)
                    const dbCat = categories.find(c => c.name.toLowerCase() === act.category.toLowerCase());
                    const finalCategory = dbCat ? dbCat.name : act.category;

                    return (
                      <button key={i} onClick={() => onSelectCategory(finalCategory)} className="bg-white/5 backdrop-blur-md p-3 py-4 rounded-[24px] flex flex-col items-center gap-2 shadow-lg border border-white/10 active:scale-95 transition-all hover:bg-white/10">
                        <div className={`${act.color} ${act.bg} w-10 h-10 rounded-xl flex items-center justify-center`}>{act.icon}</div>
                        <span className="text-[9px] font-black text-slate-300 uppercase text-center tracking-tight leading-none line-clamp-2">{act.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )
            }
          </div>
        </div>

        {/* E-SHOP (Carousel Din�mico) */}
        <div>
          <SectionHeader title="e-Shop" actionLabel="Ver Todos" onAction={() => onNavigate('shop-detail')} />
          {products.length > 0 ? (
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {products.map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSelectProduct && onSelectProduct(item)}
                  className="min-w-[45%] bg-white/5 backdrop-blur-xl p-4 rounded-[32px] shadow-lg border border-white/10 flex flex-col gap-3 active:scale-95 transition-all cursor-pointer relative hover:bg-white/10"
                >
                  <div className="w-full h-32 rounded-2xl bg-white/5 overflow-hidden relative flex items-center justify-center border border-white/5">
                    {item.image_url ? (
                      <img src={item.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <Store size={24} className="text-white/20" />
                    )}
                    <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur px-2 py-1 rounded-lg border border-white/10">
                      <p className="text-[10px] font-black italic text-white">{typeof item.price === 'number' ? `R$ ${item.price}` : item.price}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm italic tracking-tight line-clamp-1">{item.title}</h4>
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
              className="bg-white/5 backdrop-blur-xl p-6 rounded-[36px] shadow-lg border border-white/10 flex items-center gap-6 active:scale-95 transition-all cursor-pointer hover:bg-white/10"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400/20 to-orange-500/20 text-orange-400 overflow-hidden relative flex items-center justify-center border border-white/5">
                <Store size={32} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-white text-xl italic tracking-tight line-clamp-1">
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

        {/* MURAL DO DESAPEGO (CARROSSEL �NICO) */}
        <div>
          <SectionHeader title="Mural do Desapego" actionLabel="Ver Todos" onAction={() => onNavigate('desapegos-all')} />

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
                  <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx === currentDesapegoIndex ? 'w-6 bg-brand-500' : 'w-2 bg-white/20'}`} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FEEDBACK TRIGGER CARD */}
        <div className="pb-12">
          <Card
            onClick={() => setFeedbackOpen(true)}
            className="p-8 border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[40px] shadow-2xl shadow-slate-900/20 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-500/30 transition-all duration-700"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-brand-400 shadow-inner">
                <Sparkles size={32} />
              </div> {/* Closing div for the Sparkles container */}
              <div className="flex-1">
                <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none mb-2">💡 Ajude a melhorar o App</h3>
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
          userRole="resident"
        />
      </div>
    </div >
  );
};

// --- PERFIL DO MORADOR ---
// --- PERFIL DO MORADOR ---
export const ResidentProfile: React.FC<{ currentUser: any; onNavigate: (t: string) => void }> = ({ currentUser, onNavigate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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
      alert('Erro ao atualizar foto: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-32">
      <div className="h-64 bg-brand-600 relative flex items-end px-10 pb-10 pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-indigo-700"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-[30px] border-4 border-white/20 bg-white/10 overflow-hidden shadow-2xl relative backdrop-blur-md">
              <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover" />
              {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-white border border-white/20">
              <Camera size={20} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </div>
          <div className="text-white">
            <h2 className="text-3xl font-black italic tracking-tighter leading-none italic">{currentUser?.name || 'Morador'}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-2">Unidade {currentUser?.unit || '---'}</p>
          </div>
        </div>
      </div>

      <div className="p-10 space-y-4">
        {[
          { icon: <User size={20} />, label: 'Dados Pessoais', desc: 'Edite seu perfil e contatos', onClick: () => onNavigate('personal-data') },
          { icon: <ShieldCheck size={20} />, label: 'Privacidade', desc: 'Configurações de visibilidade', onClick: () => onNavigate('privacy') },
          { icon: <LogOut size={20} />, label: 'Encerrar Sessão', color: 'text-rose-400', bg: 'bg-rose-500/10', onClick: handleLogout },
        ].map((item, i) => (
          <button key={i} onClick={item.onClick} className="w-full p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] flex items-center justify-between group transition-all hover:bg-white/10">
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg || 'bg-white/10 shadow-sm'} ${item.color || 'text-slate-300'}`}>
                {item.icon}
              </div>
              <div className="text-left">
                <h4 className={`font-bold ${item.color || 'text-white'}`}>{item.label}</h4>
                <p className="text-[10px] text-slate-400 uppercase font-medium">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500" />
          </button>
        ))}
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
    <div className="min-h-screen bg-transparent pb-32">
      <FloatingBackButton onClick={() => onNavigate('home')} />
      <header className="p-6 pt-safe-offset flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-sm">
        <button onClick={() => onNavigate('home')} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-white/10"><ArrowLeft size={20} className="text-white" /></button>
        <div className="flex-1 flex items-center justify-between">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">e-Shop</h2>
          <ShoppingBag className="text-brand-400" size={24} />
        </div>
      </header>
      <div className="p-6 space-y-10">
        <div className="relative group" onClick={() => onNavigate('shop-detail')}>
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-400 transition-colors" size={20} />
          <Input readOnly placeholder="Qual serviço você precisa?" className="h-18 pl-14 rounded-[30px] border border-white/10 bg-white/10 text-white placeholder:text-slate-500 shadow-xl shadow-slate-900/20 cursor-pointer pointer-events-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {displayCategories.map((cat, idx) => (
            <button
              key={cat.id || idx}
              onClick={() => onSelectCategory(cat.name)}
              className={`${cat.bg ? 'bg-white/5' : 'bg-white/5'} p-8 rounded-[40px] flex flex-col gap-4 text-left group active:scale-95 transition-all border border-white/10 hover:border-white/20 hover:bg-white/10 relative overflow-hidden backdrop-blur-md`}
            >
              {cat.icon_url ? (
                <img src={cat.icon_url} className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
              ) : (
                <div className={`${cat.color?.replace('text-slate-600', 'text-slate-300') || 'text-slate-300'} group-hover:scale-110 transition-transform`}>
                  {cat.icon || <Package size={28} />}
                </div>
              )}
              <h4 className={`font-black italic text-lg tracking-tight leading-none ${cat.color ? 'text-white' : 'text-white'}`}>{cat.name}</h4>
            </button>
          ))}
        </div>

        {products && products.length > 0 && (
          <div>
            <SectionHeader title="Destaques e-Shop" />
            <div className="space-y-4">
              {products.map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl p-4 rounded-[32px] flex items-center gap-4 shadow-lg border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 flex-shrink-0 border border-white/10">
                    <img src={item.image_url || item.img} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white italic truncate">{item.title || item.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{typeof item.price === 'number' ? `R$ ${item.price.toFixed(2)}` : item.price}</p>
                    <p className="text-[10px] text-slate-500 uppercase mt-1 truncate">Vendedor: {item.profiles?.name || item.user || 'e-Shop'}</p>
                  </div>
                  <button className="w-10 h-10 bg-slate-950 rounded-full flex items-center justify-center text-white flex-shrink-0 border border-white/10">
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
    if (initialSearch) setSearchTerm(initialSearch);
  }, [initialSearch]);

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
    'Jardinagem': { icon: <Leaf size={24} />, color: 'text-green-400', bg: 'bg-green-500/20' },
    'Eletricista': { icon: <Zap size={24} />, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    'Limpeza': { icon: <Droplets size={24} />, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    'Pintor': { icon: <Paintbrush size={24} />, color: 'text-pink-400', bg: 'bg-pink-500/20' },
    'Manutenção': { icon: <Wrench size={24} />, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    'Tecnologia': { icon: <Monitor size={24} />, color: 'text-brand-400', bg: 'bg-brand-500/20' },
    'Beleza': { icon: <Scissors size={24} />, color: 'text-rose-400', bg: 'bg-rose-500/20' },
    'Outros': { icon: <Briefcase size={24} />, color: 'text-slate-400', bg: 'bg-slate-500/20' },
  };

  const getCatConfig = (cat: string) => categoryConfig[cat] || categoryConfig['Outros'];

  // Extract unique categories from services or use defaults
  const availableCategories = useMemo(() => {
    // Merge config keys with any extra categories found in services
    const serviceCats = new Set(services.map(s => s.category));
    const configCats = Object.keys(categoryConfig);
    return Array.from(new Set([...configCats, ...serviceCats])).filter(c => c !== 'Outros').concat('Outros'); // Ensure Outros is last
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
    <div className="min-h-screen bg-transparent pb-32">
      <FloatingBackButton onClick={() => activeCategory === 'Todos' ? onBack() : setActiveCategory('Todos')} />
      <header className="p-6 pt-24 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-sm">
        <button onClick={() => activeCategory === 'Todos' ? onBack() : setActiveCategory('Todos')} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-white/10">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">
            {activeCategory === 'Todos' ? 'Prestadores' : activeCategory}
          </h2>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* SEARCH BAR */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-400 transition-colors" size={20} />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={activeCategory === 'Todos' ? "Busque por serviço (ex: Eletricista)..." : `Buscar em ${activeCategory}...`}
            className="pl-12 h-14 bg-white/5 border border-white/10 rounded-2xl shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white placeholder-slate-500"
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
                  className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-lg flex flex-col items-center gap-4 active:scale-95 transition-all hover:bg-white/10 group backdrop-blur-md"
                >
                  <div className={`w-16 h-16 ${conf.bg?.replace('bg-', 'bg-') || 'bg-white/10'} ${conf.color?.replace('text-', 'text-') || 'text-white'} rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform`}>
                    {conf.icon}
                  </div>
                  <div className="text-center">
                    <h4 className="font-black text-white text-sm uppercase tracking-tight">{cat}</h4>
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
              <Card
                key={pro.id}
                className="p-0 border border-white/10 shadow-xl shadow-slate-900/50 rounded-[40px] bg-white/5 overflow-hidden group cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98] backdrop-blur-md"
                onClick={() => handleProClick(pro)}
              >
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

                <div className="mt-6 p-6 bg-slate-950/30 border-t border-white/5 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Aproximado</p>
                    <p className="font-black text-white text-lg">{pro.price_range || pro.price || 'A Combinar'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openWhatsApp(pro.providerPhone, pro.id); }}
                      className="flex-1 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-emerald-500 hover:text-white px-4 font-bold text-xs uppercase tracking-widest"
                    >
                      <Phone size={18} className="mr-2" /> WhatsApp
                    </button>
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
                <button onClick={() => { setActiveCategory('Todos'); setSearchTerm(''); }} className="mt-6 text-brand-600 font-black uppercase text-xs tracking-widest hover:underline">
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MURAL DE DEMANDAS - MOVED HERE */}
      <div className="mt-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone size={14} className="text-brand-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-400">Não achou?</span>
            </div>
            <h3 className="font-black text-lg italic leading-tight mb-1">Mural de Oportunidades</h3>
            <p className="text-slate-400 text-[10px] max-w-[180px]">Publique o que precisa e receba propostas.</p>
          </div>
          <button
            onClick={() => setMuralOpen(true)}
            className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/40 active:scale-90 transition-all shrink-0"
          >
            <Plus size={24} className="text-white" />
          </button>
        </div>
      </div>

      {/* PROFESSIONAL DETAIL MODAL */}
      {selectedPro && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPro(null)}></div>
          <div className="relative w-full max-w-md bg-slate-950/90 backdrop-blur-2xl rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom-10 duration-300 overflow-hidden max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="h-48 relative">
              <div className="absolute inset-0 bg-brand-600"></div>
              {selectedPro.photos?.[0] && <img src={selectedPro.photos[0]} className="w-full h-full object-cover opacity-50" />}
              <button
                onClick={() => setSelectedPro(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors z-20 border border-white/10"
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
                  <h2 className="text-2xl font-black italic text-white tracking-tight leading-none">{selectedPro.providerName || selectedPro.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-brand-500/20 text-brand-300 border border-brand-500/30">{selectedPro.category}</Badge>
                    {selectedPro.is_on_site && <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">No Condomínio!</Badge>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    <span className="text-lg font-black text-white">{selectedPro.rating || '4.8'}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Avaliações</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Sobre o Profissional</h4>
                  <p className="text-slate-300 leading-relaxed font-medium">{selectedPro.description || 'Profissional verificado do condomínio.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                    <Clock size={20} className="text-brand-400 mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</p>
                    <p className="font-bold text-slate-300">Seg - Sex, 08h-18h</p>
                  </div>
                  <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                    <MapPin size={20} className="text-brand-400 mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atende</p>
                    <p className="font-bold text-slate-300">Todas as Torres</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                  <div className="flex gap-3">
                    <Button
                      fullWidth
                      className="h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20"
                      onClick={() => openWhatsApp(selectedPro.providerPhone, selectedPro.id)}
                    >
                      <Phone className="mr-2" size={18} /> WhatsApp
                    </Button>
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
  <div className="min-h-screen bg-slate-950 pb-32">
    <FloatingBackButton onClick={onBack} />
    <header className="p-6 pt-12 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-50 backdrop-blur-md">
      <button onClick={onBack} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center active:scale-95 transition-all hover:bg-white/10 text-white shadow-sm border border-white/5"><ArrowLeft size={24} /></button>
      <h2 className="text-xl font-black italic uppercase text-white">Mural do Desapego</h2>
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
    <div className="min-h-screen bg-transparent pb-32 animate-in fade-in duration-300">
      <div className="h-96 relative bg-slate-900">
        <img src={item.img} className="w-full h-full object-cover opacity-80" alt={item.name} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-slate-900/90"></div>
        <button onClick={onBack} className="absolute top-12 left-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white active:scale-95 shadow-lg border border-white/10 z-50"><ArrowLeft /></button>

        <div className="absolute bottom-8 left-6 right-6">
          <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg mb-3 inline-block">{item.status}</span>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10 w-full rounded-t-[40px] bg-slate-950/80 backdrop-blur-3xl border-t border-white/10">
        <div className="flex justify-between items-start mb-4 pt-6">
          <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none max-w-[70%]">{item.name}</h2>
          <div className="bg-white/10 px-4 py-2 rounded-2xl shadow-sm border border-white/10">
            <p className="font-black text-white text-lg tracking-tight">{item.price}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-6 border-y border-white/10 mb-6">
          <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden border border-white/10 shadow-sm">
            <img src={`https://picsum.photos/seed/${item.user}/100`} className="w-full h-full object-cover" alt={item.user} />
          </div>
          <div>
            <p className="text-xs text-white font-bold">Vendido por {item.user}</p>
            <p className="text-[10px] text-slate-400 font-medium">
              {item.unit && item.unit.toUpperCase().includes('CASA')
                ? `Rua ${item.tower}, ${item.unit.replace(/casa/i, '').trim()}`
                : `${item.tower || ''} - ${item.unit || 'Morador Verificado'}`}
            </p>
          </div>
          {!isOwner && (
            <button onClick={handleInterest} className="ml-auto w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center active:scale-90 transition-all border border-emerald-500/30">
              <MessageSquare size={18} />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-white">Sobre o produto</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{item.desc || 'Sem descrição detalhada.'}</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 z-50">
        {isOwner ? (
          <Button fullWidth onClick={handleDelete} className="bg-rose-500/10 text-rose-400 h-16 rounded-[24px] uppercase tracking-widest font-black text-xs hover:bg-rose-500/20 border border-rose-500/20">
            <Trash2 size={18} className="mr-2" /> Remover Anúncio
          </Button>
        ) : (
          <Button fullWidth onClick={handleInterest} className="bg-emerald-500 h-16 rounded-[24px] uppercase tracking-widest font-black text-xs shadow-lg shadow-emerald-500/30 text-white">
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
    <div className="min-h-screen bg-transparent pb-10">
      <header className="p-6 pt-12 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-50 backdrop-blur-md">
        <button onClick={onBack} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shadow-sm hover:bg-white/10 transition-all active:scale-95 text-white border border-white/5"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Novo Desapego</h2>
      </header>

      <div className="p-8 space-y-10 animate-in slide-in-from-bottom-8 duration-500">
        {/* Foto do Item */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-80 rounded-[48px] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden ${image ? 'border-brand-500 bg-white/5' : 'border-white/10 bg-white/5 hover:border-brand-400'}`}
        >
          {image ? (
            <img src={image} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Preview" />
          ) : (
            <>
              <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center shadow-xl text-brand-400 border border-white/10">
                <Camera size={28} />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-black uppercase tracking-widest text-white">Adicionar Fotos</p>
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
            <Input placeholder="Ex: Mesa de Jantar Madeira" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-16 rounded-3xl bg-white/5 border-white/10 text-white placeholder-slate-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Valor</label>
              <Input placeholder="Ex: 450,00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="h-16 rounded-3xl bg-white/5 border-white/10 text-white placeholder-slate-500" />
            </div>
            <div className="space-y-3 text-right">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-4">Status</label>
              <div className="flex gap-2 justify-end">
                {['NOVO', 'USADO', 'DOAÇÃO'].map(s => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, status: s })}
                    className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${form.status === s ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-white/5 text-slate-400 border border-white/5'}`}
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
              className="w-full h-44 bg-white/5 border border-white/10 rounded-[32px] p-6 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-brand-600 transition-all font-medium text-sm leading-relaxed"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            fullWidth
            onClick={handlePublish}
            disabled={!form.name || !form.price || isSubmitting}
            className={`h-20 rounded-[32px] text-[13px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all ${!form.name || !form.price || isSubmitting ? 'bg-white/10 text-slate-500 cursor-not-allowed shadow-none' : 'bg-white text-slate-900 shadow-white/10 active:scale-[0.98]'}`}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Desapego'}
          </Button>
          <p className="text-center text-[9px] text-slate-400 font-medium uppercase tracking-widest mt-6 bg-white/5 py-3 rounded-full border border-white/5 mx-10">Seu anúncio ficará visível para todo o condomínio</p>
        </div>
      </div>
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
      alert('Erro ao autorizar: ' + error.message);
    }
  };

  const myVisitorAccess = accessList.filter(a => a.residentId === (currentUser?.id || '1'));

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      <header className="p-6 pt-12 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
        <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-95 transition-transform hover:bg-white/10"><ArrowLeft size={20} className="text-white" /></button>
        <h2 className="text-xl font-black italic uppercase text-white">Controle de Acesso</h2>
      </header>

      <div className="p-6 space-y-6">
        {/* TABS */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
          <button onClick={() => setActiveTab('visita')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'visita' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            Visitantes
          </button>
          <button onClick={() => setActiveTab('encomenda')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'encomenda' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            Encomendas
          </button>
        </div>

        {activeTab === 'visita' ? (
          <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
            <Card className="p-8 border border-white/10 shadow-xl rounded-[40px] bg-white/5 space-y-6 backdrop-blur-3xl">
              <h3 className="text-lg font-black italic text-white flex items-center gap-2"><Key className="text-brand-400" size={20} /> Novo Visitante</h3>
              <Input placeholder="Nome do Visitante / Prestador" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-14 bg-white/5 border-white/10 text-white placeholder-slate-500" />
              <div className="grid grid-cols-2 gap-4">
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="h-14 bg-white/5 rounded-2xl px-4 font-bold text-white outline-none border border-white/10">
                  <option className="bg-slate-900">Visita</option>
                  <option className="bg-slate-900">Serviço</option>
                  <option className="bg-slate-900">Delivery</option>
                </select>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-14 bg-white/5 border-white/10 text-white" />
              </div>
              <Button fullWidth onClick={handleAuthorizeVisitor} className="bg-brand-600 h-14 rounded-[24px] uppercase tracking-widest font-black text-xs hover:bg-brand-500 transition-colors">Autorizar Entrada</Button>
            </Card>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Histórico de Visitantes</h4>
              {myVisitorAccess.length === 0 ? <p className="text-center text-slate-500 text-xs italic py-4">Nenhum acesso registrado.</p> : (
                myVisitorAccess.map((acc: any, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div>
                      <p className="font-bold text-white text-sm">{acc.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{acc.type} • {acc.date}</p>
                    </div>
                    <Badge color="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">AUTORIZADO</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <Card className="p-8 border border-white/10 shadow-xl rounded-[40px] bg-white/5 space-y-6 backdrop-blur-3xl relative overflow-visible">
              <h3 className="text-lg font-black italic text-white flex items-center gap-2"><Package className="text-amber-400" size={20} /> Autorizar Vizinho</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Permita que um vizinho retire suas encomendas na portaria ou lockers.</p>

              <div className="relative">
                <Input
                  placeholder="Buscar vizinho (Nome ou Unidade)..."
                  value={neighborSearch}
                  onChange={e => setNeighborSearch(e.target.value)}
                  className="h-14 bg-white/5 border-white/10 text-white placeholder-slate-500"
                />

                {/* SUGGESTIONS */}
                {foundNeighbors.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    {foundNeighbors.map(nb => (
                      <button key={nb.id} onClick={() => { setSelectedNeighbor(nb); setNeighborSearch(nb.name); setFoundNeighbors([]); }} className="w-full text-left p-4 hover:bg-white/10 border-b border-white/5 last:border-none flex justify-between items-center group">
                        <div>
                          <p className="font-bold text-white group-hover:text-brand-400 transition-colors">{nb.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase">UNID: {nb.unit} • {nb.tower}</p>
                        </div>
                        <Plus size={16} className="text-slate-500 group-hover:text-brand-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedNeighbor && (
                <div className="bg-brand-500/10 border border-brand-500/20 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-black">{selectedNeighbor.name[0]}</div>
                  <div>
                    <p className="text-xs font-bold text-white">Selecionado: {selectedNeighbor.name}</p>
                    <p className="text-[10px] text-brand-300 uppercase">Confirmar autorização?</p>
                  </div>
                </div>
              )}

              <Button fullWidth onClick={handleAuthorizeNeighbor} disabled={!selectedNeighbor} className="bg-amber-500 h-14 rounded-[24px] uppercase tracking-widest font-black text-xs hover:bg-amber-400 transition-colors text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed">Conceder Acesso</Button>
            </Card>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Vizinhos Autorizados</h4>
              {authorizations.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-xs italic">Nenhum vizinho autorizado.</p>
                </div>
              ) : (
                authorizations.map(auth => (
                  <div key={auth.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/20">
                        {auth.grantee?.name?.[0]}
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-sm">{auth.grantee?.name}</h5>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">CASA {auth.grantee?.unit}</p>
                      </div>
                    </div>
                    <button onClick={() => revokeAuthorization(auth.id)} className="text-rose-400 bg-rose-500/10 w-10 h-10 rounded-xl active:scale-95 hover:bg-rose-500/20 transition-colors flex items-center justify-center">
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
    <div className="min-h-screen bg-slate-950 pb-32">
      <header className="p-6 pt-24 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
        <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-95 transition-all hover:bg-white/10"><ArrowLeft size={20} className="text-white" /></button>
        <h2 className="text-xl font-black italic uppercase text-white">Boleto Digital</h2>
      </header>
      <div className="p-6 space-y-8 animate-in slide-in-from-right-4">
        {pending ? (
          <Card className="p-10 bg-brand-600 text-white border-none shadow-2xl shadow-brand-600/30 rounded-[48px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{pending.title}</p>
            <h3 className="text-4xl font-black italic tracking-tighter">R$ {pending.value}</h3>
            <p className="text-[10px] font-bold mt-2 opacity-80">Vence em: {new Date(pending.dueDate).toLocaleDateString('pt-BR')}</p>
            <div className="mt-8 flex gap-3">
              <Button variant="secondary" className="flex-1 bg-white text-brand-600 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all" onClick={() => alert('Código copiado!')}>Copia Código</Button>
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
          {paid.length === 0 ? <p className="text-center text-slate-500 font-bold italic py-4">Nenhum histórico disponível.</p> : paid.map((inv) => (
            <div key={inv.id} className="bg-white/5 p-6 rounded-[32px] border border-white/10 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center"><Check size={24} /></div>
                <div><h5 className="font-bold text-white">{inv.title}</h5><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pago em {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</p></div>
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
    <div className="min-h-screen bg-slate-950 pb-32">
      <header className="p-6 pt-24 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
        <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-95 transition-all hover:bg-white/10"><ArrowLeft size={20} className="text-white" /></button>
        <h2 className="text-xl font-black italic uppercase text-white">Atendimento</h2>
      </header>

      <div className="p-6 space-y-8">
        {!isNew ? (
          <>
            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-900/40 text-center relative overflow-hidden border border-white/5">
              <div className="relative z-10">
                <MessageSquare className="mx-auto text-brand-400 mb-4" size={48} />
                <h3 className="text-2xl font-black italic tracking-tight">Fale com a Adm</h3>
                <p className="text-sm font-medium text-slate-400 mt-2 leading-relaxed max-w-xs mx-auto">Relate problemas, faça sugestões ou tire dúvidas diretamente com a administração.</p>
                <Button fullWidth onClick={() => setIsNew(true)} className="mt-8 bg-brand-600 h-14 rounded-[24px] uppercase tracking-widest font-black text-xs hover:bg-brand-500">Abrir Chamado</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Meus Chamados</h4>
              {myRequests.length === 0 ? <p className="text-center text-slate-500 font-bold italic py-8">Nenhum chamado aberto.</p> : myRequests.map((req) => (
                <div key={req.id} className="bg-white/5 p-6 rounded-[32px] border border-white/10 space-y-3 shadow-md">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-white italic">{req.title}</h5>
                    <Badge color={req.status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}>{req.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{req.description}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{req.category} – {req.date}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <Card className="p-8 border border-white/10 shadow-xl rounded-[40px] bg-white/5 space-y-6 animate-in slide-in-from-bottom-4 backdrop-blur-3xl">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setIsNew(false)} className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 text-white"><ArrowLeft size={16} /></button>
              <h3 className="text-lg font-black italic text-white">Novo Chamado</h3>
            </div>
            <Input placeholder="Título (ex: Lâmpada queimada)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="h-14 bg-white/5 border-white/10 text-white placeholder-slate-500" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full h-14 bg-white/5 rounded-2xl px-4 font-bold text-white outline-none border border-white/10">
              <option className="bg-slate-900">Manutenção</option>
              <option className="bg-slate-900">Limpeza</option>
              <option className="bg-slate-900">Segurança</option>
              <option className="bg-slate-900">Sugestão</option>
              <option className="bg-slate-900">Reclamação</option>
            </select>
            <textarea
              placeholder="Descreva a situação..."
              className="w-full h-32 bg-white/5 border-none rounded-2xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none text-white placeholder-slate-500"
              value={form.desc}
              onChange={e => setForm({ ...form, desc: e.target.value })}
            />
            <Button fullWidth onClick={handleOpen} className="bg-white text-slate-900 h-14 rounded-[24px] uppercase tracking-widest font-black text-xs hover:bg-slate-200 transition-colors">Enviar para Adm</Button>
          </Card>
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
                <Button fullWidth onClick={() => setIsNew(true)} className="mt-8 bg-brand-600 h-14 rounded-[24px] uppercase tracking-widest font-black text-xs">Abrir Chamado</Button>
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
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{req.category} – {req.date}</p>
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
              className="w-full h-32 bg-slate-50 border-none rounded-2xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
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
      alert('Erro: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      <header className="p-6 pt-12 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
        <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-95 text-white hover:bg-white/10"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase text-white">Minhas Demandas</h2>
      </header>

      <div className="p-6 space-y-6">
        {demands.length === 0 ? (
          <div className="bg-white/5 rounded-[32px] p-8 text-center border border-white/10">
            <Megaphone size={48} className="text-slate-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-white font-bold text-lg">Nenhuma demanda ativa</h3>
            <p className="text-slate-400 text-sm mt-2">Publique no Mural para receber propostas.</p>
          </div>
        ) : (
          demands.map(demand => {
            const demandProposals = proposals.filter(p => p.demand_id === demand.id);
            return (
              <div key={demand.id} className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <Badge color={demand.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'}>
                    {demand.status === 'open' ? 'Aberta' : 'Encerrada'}
                  </Badge>
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
                            <Button onClick={() => handleAcceptProposal(prop)} className="h-8 px-3 text-[10px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                              Aceitar
                            </Button>
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

export const CondoAgendaPage: React.FC<{ onBack: () => void; reservations: any[]; onAddReservation: (res: any) => void; commonAreas: any[]; onNavigate?: (s: string) => void }> = ({ onBack, reservations, onAddReservation, commonAreas, onNavigate }) => {
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

    const isHourly = selectedArea.reservation_type === 'hourly';

    if (isHourly && !selectedHour) {
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

      if (isHourly && selectedHour) {
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
      const isHourly = area.reservation_type === 'hourly';

      if (isHourly) {
        // For hourly areas, check if at least one hour is available
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
    <div className="min-h-screen bg-slate-950 pb-32">
      <header className="p-6 pt-12 flex items-center justify-between bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={selectedArea ? () => setSelectedArea(null) : selectedCategory ? () => { setSelectedCategory(null); setDate(''); setDateFiltered(false); } : onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-95 transition-all text-white hover:bg-white/10"><ArrowLeft size={20} /></button>
          <h2 className="text-xl font-black italic uppercase text-white">Reservas</h2>
        </div>
        <button
          onClick={() => onNavigate?.('resident-bookings')}
          className="flex items-center gap-2 bg-brand-500/10 text-brand-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all border border-brand-500/20"
        >
          <Calendar size={14} />
          Meus Agendamentos
        </button>
      </header>
      <div className="p-6">

        {!selectedCategory ? (
          <div className="space-y-6 animate-in slide-in-from-left-4">
            <SectionHeader title="O que você quer agendar?" />
            <div className="grid grid-cols-2 gap-4">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className="aspect-square bg-white/5 rounded-[40px] border border-white/10 shadow-sm flex flex-col items-center justify-center gap-4 active:scale-95 transition-all hover:border-brand-500/30 group">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-brand-500/10 group-hover:text-brand-400 transition-colors border border-white/5">
                    {cat === 'Quiosques' ? <Flame size={32} /> : cat === 'Esportes' ? <Trophy size={32} /> : <PartyPopper size={32} />}
                  </div>
                  <span className="font-black italic text-white text-sm uppercase tracking-tighter">{cat}</span>
                </button>
              ))}
            </div>
          </div>
        ) : !selectedArea ? (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div>
              <h3 className="text-2xl font-black italic text-white tracking-tighter mb-2">{selectedCategory}</h3>
              <p className="text-sm text-slate-400 font-medium">Selecione uma data para ver o que temos livre.</p>
            </div>

            <div className="bg-white/5 p-6 rounded-[32px] shadow-sm border border-white/10 space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Pretendida</label>
              <Input type="date" value={date} onChange={e => handleDateFilter(e.target.value)} className="h-14 font-bold text-white bg-white/5 border-white/10" />
            </div>

            {date && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disponíveis em {new Date(date).toLocaleDateString('pt-BR')}</h4>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">{availableAreas.length} opções</span>
                </div>

                {availableAreas.length === 0 ? (
                  <div className="text-center py-12 opacity-50">
                    <CalendarDays size={48} className="mx-auto mb-4 text-slate-500" />
                    <p className="font-bold italic text-slate-500">Poxa! Tudo ocupado hoje.</p>
                  </div>
                ) : (
                  availableAreas.map(area => (
                    <div key={area.id} onClick={() => setSelectedArea(area)} className="w-full h-56 bg-white/5 rounded-[32px] overflow-hidden shadow-lg relative cursor-pointer group active:scale-95 transition-all border border-white/10">
                      {area.photos?.[0] ? <img src={area.photos[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center"><ImageIcon size={48} className="text-slate-600" /></div>}
                      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                        <h4 className="text-xl font-black italic text-white tracking-tight">{area.name}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-bold text-white/80 uppercase bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">R$ {area.price}</span>
                          <span className="text-[10px] font-bold text-white/80 uppercase bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">{area.hours}</span>
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
            <div className="w-full h-72 bg-slate-800 rounded-[40px] overflow-hidden shadow-2xl relative border border-white/5">
              {selectedArea.photos?.[0] ? <img src={selectedArea.photos[0]} className="w-full h-full object-cover" /> : null}
              <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm text-white border border-white/10">
                {date.split('-').reverse().join('/')}
              </div>
            </div>

            <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 shadow-sm space-y-6 backdrop-blur-sm">
              <div>
                <h3 className="text-3xl font-black italic text-white tracking-tight leading-none mb-2">{selectedArea.name}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{selectedArea.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                <div><div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor</div><div className="text-lg font-black text-white">R$ {selectedArea.price}</div></div>
                <div><div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Horário</div><div className="text-lg font-black text-white">{selectedArea.hours}</div></div>
                <div className="col-span-2 border-t border-white/5 pt-4 mt-2">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Itens Inclusos</div>
                  <div className="space-y-2">
                    {selectedArea.inventory ? selectedArea.inventory.split(',').map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center min-w-[20px]">
                          <Check size={12} className="text-emerald-400 font-bold" />
                        </div>
                        <span className="text-sm font-bold text-slate-300 italic">{item.trim()}</span>
                      </div>
                    )) : <p className="text-sm text-slate-500 italic">Nenhum item informado.</p>}
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
                          className={`p-3 rounded-xl border transition-all text-center ${selectedHour === slot.start
                            ? 'border-brand-500 bg-brand-500/20 shadow-[0_0_15px_rgba(234,88,12,0.3)]'
                            : available
                              ? 'border-white/10 bg-white/5 hover:bg-white/10 active:scale-95'
                              : 'border-white/5 bg-slate-900/50 opacity-40 cursor-not-allowed'
                            }`}
                        >
                          <div className={`text-xs font-black ${selectedHour === slot.start ? 'text-brand-400' : available ? 'text-white' : 'text-slate-500'}`}>
                            {slot.start}
                          </div>
                          <div className="text-[8px] text-slate-500 font-bold mt-0.5">
                            {available ? '● Livre' : '● Ocupado'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button fullWidth onClick={handleReserve} disabled={loading} className="bg-brand-600 h-16 rounded-[28px] uppercase tracking-[0.2em] font-black text-xs shadow-xl shadow-brand-600/30 hover:bg-brand-500 transition-all">
                {loading ? 'Confirmando...' : 'Confirmar Reserva'}
              </Button>
            </div>
          </div>
        )}
      </div>
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
        alert('Erro ao cancelar: ' + e.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      <header className="p-6 pt-24 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
        <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 text-white"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase text-white">Meus Agendamentos</h2>
      </header>
      <div className="p-6 space-y-6 animate-in slide-in-from-right-4">
        {myReservations.length > 0 ? myReservations.map((r) => (
          <Card key={r.id} className="p-8 border border-white/10 shadow-xl rounded-[44px] bg-white/5 relative overflow-hidden group">
            <div className="absolute top-4 right-4 w-24 h-24 opacity-5">
              <img src="/logo.png" className="w-full h-full object-contain filter invert" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local da Reserva</p>
            <h4 className="text-2xl font-black italic tracking-tight text-white">{r.area}</h4>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data</p>
                <p className="font-bold text-white">{new Date(r.date).toLocaleDateString('pt-BR')}</p>
                {r.start_time && (
                  <p className="text-[10px] text-brand-400 font-bold uppercase mt-1">
                    {r.start_time.slice(0, 5)} - {r.end_time?.slice(0, 5)}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge color={r.status === 'cancelled' ? "bg-rose-500/20 text-rose-500 border border-rose-500/20" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"}>
                  {r.status === 'cancelled' ? 'CANCELADA' : 'CONFIRMADA'}
                </Badge>
                {r.status !== 'cancelled' && (
                  <button onClick={() => handleCancel(r.id)} className="text-[9px] font-black text-rose-400 uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-rose-300">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </Card>
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
  <div className="min-h-screen bg-slate-950 pb-32">
    <header className="p-6 pt-12 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
      <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-95 text-white hover:bg-white/10"><ArrowLeft size={20} /></button>
      <h2 className="text-xl font-black italic uppercase text-white">Assembleias</h2>
    </header>
    <div className="p-6 space-y-6">
      <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div className="w-14 h-14 bg-brand-500/10 text-brand-400 rounded-2xl flex items-center justify-center border border-brand-500/20"><Users size={28} /></div>
          <Badge color="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">Aberta</Badge>
        </div>
        <div>
          <h4 className="font-black text-white italic text-lg decoration-slice">AGO: Previs�o Or�ament�ria 2026</h4>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1">15/01/2026 � 19:30</p>
        </div>
        <Button fullWidth className="rounded-[24px] bg-slate-800 text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-slate-700 transition-colors">Ver Pauta e Votar</Button>
      </div>
      <div className="text-center py-10">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Hist�rico de Atas dispon�vel no portal web.</p>
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
    <div className="min-h-screen bg-slate-950 pb-32">
      <FloatingBackButton onClick={onBack} />
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
    <div className="min-h-screen bg-slate-950 pb-32">
      <div className="h-[50vh] relative bg-slate-900 rounded-b-[48px] shadow-2xl shadow-black/50 overflow-hidden group border-b border-white/5 mt-20">
        {item.image_url ? (
          <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700">
            <Store size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 opacity-90"></div>
        <button onClick={onBack} className="fixed top-24 left-6 w-12 h-12 bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center text-white active:scale-90 shadow-lg border border-white/10 hover:bg-black/60 transition-all z-[100]"><ArrowLeft /></button>
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
            <button
              onClick={handleContact}
              className="flex-1 bg-brand-600 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-600/40 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-brand-500 border border-white/10"
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
      alert('Dados atualizados com sucesso! O aplicativo ser� recarregado para aplicar as mudan�as.');
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
    <div className="min-h-screen bg-slate-950 pb-32">
      <header className="p-6 pt-24 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
        <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-90 transition-transform hover:bg-white/10 text-white"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase text-white">Dados Pessoais</h2>
      </header>
      <div className="p-6 space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-[40px] border-4 border-white/10 shadow-xl overflow-hidden mb-4 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
            {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="text-brand-400 font-bold text-xs uppercase bg-brand-500/10 px-4 py-2 rounded-lg active:scale-95 transition-transform hover:bg-brand-500/20" disabled={uploading}>
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

        <div className="space-y-6 bg-white/5 p-8 rounded-[40px] shadow-sm border border-white/10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-14 font-medium bg-white/5 border-white/10 text-white placeholder-slate-500" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Condomínio</label>
            <select
              disabled
              className="w-full h-14 bg-slate-900/50 text-slate-500 rounded-2xl px-4 font-bold border border-white/5 outline-none appearance-none"
            >
              <option>{selectedCondoData?.name || 'Carregando...'}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{isHorizontal ? 'Rua/Alameda' : 'Apto/Unidade'}</label>
              <Input value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="h-14 font-medium bg-white/5 border-white/10 text-white placeholder-slate-500" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{isHorizontal ? 'Número' : 'Bloco/Torre'}</label>
              <Input value={formData.tower} onChange={e => setFormData({ ...formData, tower: e.target.value })} className="h-14 font-medium bg-white/5 border-white/10 text-white placeholder-slate-500" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email</label>
            <Input value={formData.email} readOnly className="h-14 font-medium bg-slate-900/50 text-slate-500 border-white/5" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">WhatsApp</label>
            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })} className="h-14 font-medium bg-white/5 border-white/10 text-white placeholder-slate-500" />
          </div>
        </div>

        <Button fullWidth onClick={handleSave} disabled={loading} className="h-16 bg-indigo-600 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-500">
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>

        <button
          onClick={async () => {
            if (confirm('ATENÇÃO: Deseja realmente excluir sua conta permanentemente? Esta ação não pode ser desfeita.')) {
              if (confirm('Tem certeza absoluta? Todos os seus dados serão apagados.')) {
                setLoading(true);
                const { error } = await supabase.rpc('delete_client_user');
                if (error) {
                  alert('Erro ao excluir: ' + error.message);
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
    <div className="min-h-screen bg-slate-950 pb-32">
      <header className="p-6 pt-24 flex items-center gap-4 bg-transparent border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
        <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-90 transition-transform hover:bg-white/10 text-white"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase text-white">Privacidade</h2>
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
export const AppNavigation: React.FC<{ activeTab: string; onChange: (tab: string) => void; currentUser?: any; onLogout?: () => void }> = ({ activeTab, onChange, currentUser, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [condoName, setCondoName] = useState<string>('');

  useEffect(() => {
    if (currentUser?.condominium_id) {
      supabase.from('condominiums').select('name').eq('id', currentUser.condominium_id).single()
        .then(({ data }) => { if (data) setCondoName(data.name); });
    }
  }, [currentUser?.condominium_id]);

  // Full list of navigation items
  const navItems = [
    { id: 'home', icon: LayoutGrid, label: 'Home', isPriority: true },
    { id: 'create-desapego', icon: Plus, label: 'Anunciar', isPriority: true, isAction: true },
    { id: 'market', icon: ShoppingBag, label: 'Shop', isPriority: false },
    { id: 'profile', icon: User, label: 'Perfil', isPriority: false },
    { id: 'resident-bookings', icon: Calendar, label: 'Meus Agendamentos', isPriority: false },
    { id: 'desapegos-all', icon: Tag, label: 'Desapego', isPriority: false },
    // You can add more secondary items here if needed in future
  ];

  return (
    <>
      {/* TOP HEADER - Added via Navigation to share state */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md z-[60] px-6 py-4 flex justify-between items-center border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none tracking-tighter">Condomínio</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{condoName || 'Carregando...'}</p>
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
      {menuOpen && (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-10 duration-500">
            <div className="p-6 bg-slate-50 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-lg">
                  <UserCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter leading-none">{currentUser?.name || 'Morador'}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Menu Principal</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-4">
              {navItems.filter(i => !i.isAction).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onChange(item.id);
                    setMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl gap-2 transition-all ${activeTab === item.id ? 'bg-brand-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
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
                    // Fallback logout if prop not provided (though proper way is via prop)
                    supabase.auth.signOut().then(() => window.location.reload());
                  }
                }}
                className="w-full h-14 bg-rose-50 text-rose-600 rounded-[28px] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] hover:bg-rose-100 transition-all active:scale-95"
              >
                <LogOut size={18} />
                Sair do App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[98%] max-w-[420px] bg-slate-950/80 backdrop-blur-2xl shadow-2xl shadow-black/50 border border-white/10 rounded-[32px] p-2 flex justify-between items-center z-50">

        {/* Priority Items (Left Side) - Home & Booking */}
        {navItems.filter(i => i.isPriority && !i.isAction).slice(0, 2).map(item => (
          <button
            key={item.id}
            onClick={() => { onChange(item.id); setMenuOpen(false); }}
            className={`relative min-w-[64px] h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === item.id && !menuOpen ? 'bg-brand-500/20 text-brand-400' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
          >
            <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${activeTab === item.id ? 'text-brand-400' : 'text-slate-500'}`}>
              {item.label}
            </span>
          </button>
        ))}

        {/* Action Button (Center) */}
        {navItems.find(i => i.isAction) && (
          <button
            onClick={() => { onChange('create-desapego'); setMenuOpen(false); }}
            className="mb-8 w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-brand-600/40 border-[4px] border-slate-900 active:scale-95 transition-transform"
          >
            <Plus size={28} />
          </button>
        )}

        {/* Menu Trigger (Right Side) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`relative min-w-[64px] h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${menuOpen ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
        >
          <Menu size={24} strokeWidth={menuOpen ? 2.5 : 2} />
          <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${menuOpen ? 'text-white' : 'text-slate-500'}`}>
            Menu
          </span>
        </button>

      </div>
    </>
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
    <div className="w-full h-40 bg-slate-100 rounded-[32px] animate-pulse flex items-center justify-center">
      <span className="text-slate-300 font-bold uppercase text-xs tracking-widest">Carregando Novidades...</span>
    </div>
  );

  return (
    <div className="relative w-full h-48 md:h-56 rounded-[32px] overflow-hidden shadow-lg group">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          onClick={() => banner.link_url && window.open(banner.link_url, '_blank')}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100 z-10 cursor-pointer' : 'opacity-0 z-0'}`}
        >
          <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div>
              {banner.title && <h3 className="text-white font-black italic text-xl md:text-2xl drop-shadow-lg">{banner.title}</h3>}
              {banner.link_url && (
                <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1 block">Saiba Mais &rarr;</span>
              )}
            </div>
          </div>
        </div>
      ))}

      {banners.length > 1 && (
        <div className="absolute bottom-4 right-6 z-20 flex gap-2">
          {banners.map((_, idx) => (
            <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/40'}`} />
          ))}
        </div>
      )}
    </div>
  );
};


