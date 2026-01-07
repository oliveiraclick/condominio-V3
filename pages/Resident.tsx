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
  MessageSquare, Send, Paperclip, Mic, MoreVertical, CheckCheck, Award, Quote, Camera,
  Image as ImageIcon, X, Clock, MapPinned, Trash2, Share2, UserCircle2, Flame,
  Building2, Camera as CameraIcon, Download
} from 'lucide-react';
import { ProfessionalSector, ProfessionalProfile, UserRole } from '../types';
import { supabase } from '../supabase';

// --- COMPONENTES DE APOIO ---

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

const DesapegoCard: React.FC<{ item: any; currentUser?: any; onDelete?: (id: string) => void }> = ({ item, currentUser, onDelete }) => {
  const isOwner = currentUser?.name === item.user; // Idealmente usar ID, mas name serve por enquanto dado o backend atual

  const handleInterest = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <Card className="p-0 overflow-hidden border-none shadow-xl shadow-slate-200/60 rounded-[40px] bg-white group active:scale-[0.98] transition-all">
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
            Tenho Interesse
          </button>
        )}
      </div>
    </Card>
  );
};

// --- HOME DO MORADOR ---
export const ResidentHome: React.FC<{
  onNavigate: (target: string) => void;
  onSelectCategory: (cat: string) => void;
  packages: any[];
  setPackages: (pkgs: any[]) => void;
  desapegos: any[];
  currentUser: any;
  notifications?: any[];
  // Legacy props kept for compatibility if passed, though optionally used
  serviceRequests?: any[];
  activeServices?: any[];
  onClearNotifications?: () => void;
  onSelectDesapego?: (item: any) => void;
  products?: any[]; // Added products prop
}> = ({ onNavigate, onSelectCategory, packages = [], setPackages, desapegos = [], currentUser, notifications = [], onSelectDesapego, products = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentDesapegoIndex, setCurrentDesapegoIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<'prestadores' | 'gestao'>('prestadores');
  const myPackages = packages.filter(p => p.unit === (currentUser?.unit || ''));

  // Get a featured product (e.g., the last one added, or random)
  const featuredProduct = products.length > 0 ? products[products.length - 1] : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      {/* HEADER DINÂMICO */}
      <div className="bg-violet-600 p-6 pt-12 rounded-b-[40px] shadow-sm border-b border-violet-500">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-violet-400/30 shadow-xl bg-white/10 backdrop-blur-sm">
              <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-black text-white text-2xl tracking-tighter leading-none italic">Olá, {currentUser?.name?.split(' ')[0] || 'Morador'}!</h2>
              <p className="text-[10px] text-violet-200 font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                <MapPin size={10} className="text-violet-200" /> {currentUser?.condo || 'Meu Condomínio'} • {currentUser?.unit || '---'}
              </p>
            </div>
          </div>
          <button onClick={() => setShowNotifications(!showNotifications)} className="w-12 h-12 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center relative active:bg-white/20 transition-all">
            <Bell size={24} className="text-white" />
            {notifications.length > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-amber-400 rounded-full"></span>}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300" size={18} />
          <Input placeholder="O que você precisa hoje?" className="pl-12 h-14 bg-white/10 border-none rounded-2xl font-medium text-white placeholder-violet-200/70 focus:bg-white/20 transition-all" />
        </div>
      </div>

      <div className="p-6 space-y-12">
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

        {/* E-SHOP (Dinâmico) */}
        <div>
          <SectionHeader title="e-Shop" action="Ver Todos" onAction={() => onNavigate('shop-detail')} />
          <div
            onClick={() => onNavigate('shop-detail')}
            className="bg-white p-6 rounded-[36px] shadow-sm border border-slate-50 flex items-center gap-6 active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-20 h-20 rounded-2xl bg-orange-50 text-orange-500 overflow-hidden relative flex items-center justify-center">
              {featuredProduct?.image_url ? (
                <img src={featuredProduct.image_url} className="w-full h-full object-cover" />
              ) : (
                <Store size={32} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-black text-slate-950 text-xl italic tracking-tight line-clamp-1">
                  {featuredProduct ? featuredProduct.title : "Marketplace"}
                </h4>
                {featuredProduct && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Novo</span>}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium line-clamp-2">
                {featuredProduct ? featuredProduct.description : "Encontre produtos e serviços dos seus vizinhos e comércio local."}
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-950 rounded-full flex items-center justify-center text-white shrink-0">
              <ChevronRight size={18} />
            </div>
          </div>
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
    window.location.reload();
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

export const ServicosFullView: React.FC<{ initialCategory: string; onBack: () => void; onNavigate: (t: string) => void; onServiceRequest: (req: any) => void; services?: any[] }> = ({ initialCategory, onBack, onServiceRequest, services = [] }) => {
  // Fallback mocks if no services passed (or filtered list)
  const filteredPros = services.filter(s => s.category === initialCategory);
  const displayPros = filteredPros.length > 0 ? filteredPros : [
    { id: 1, providerName: 'Marcos Silva', category: 'Hidráulica', rating: 4.8, img: 'https://picsum.photos/seed/pro1/100', price: 'Sob Consulta', providerPhone: '5511999999999' },
    { id: 2, providerName: 'Juliana Mendes', category: 'Limpeza Profissional', rating: 5.0, img: 'https://picsum.photos/seed/pro2/100', price: 'R$ 120/visita', providerPhone: '5511999999999' }
  ].filter(s => s.category === initialCategory || initialCategory === 'Todos');

  const handleRequest = (proName: string) => {
    onServiceRequest({
      id: Date.now(),
      name: `Serviço em ${initialCategory}`,
      user: 'Alex Ferreira',
      time: 'Agora',
      location: 'Torre B - 402',
      status: 'pending'
    });
    alert(`Solicitação enviada para ${proName}! Ele entrará em contato em breve.`);
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone?.replace(/\D/g, '');
    if (cleanPhone) window.open(`https://wa.me/${cleanPhone}`, '_blank');
    else alert('Telefone não disponível');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-90"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">{initialCategory}</h2>
      </header>
      <div className="p-6 space-y-6">
        {displayPros.length > 0 ? displayPros.map(pro => (
          <Card key={pro.id} className="p-8 border-none shadow-xl rounded-[44px] bg-white space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 rounded-[28px] overflow-hidden border-2 border-slate-50 shadow-sm">
                <img src={pro.img || `https://picsum.photos/seed/${pro.id}/100`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-900 italic text-xl leading-none">{pro.providerName || pro.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-100">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[10px] font-black">{pro.rating || 5.0}</span>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{pro.category || pro.sector}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base de Preço</span>
              <span className="font-black text-slate-900 italic">{pro.price}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => openWhatsApp(pro.providerPhone)} className="h-14 rounded-[22px] bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 space-x-2">
                <MessageSquare size={16} />
                <span>WhatsApp</span>
              </Button>
              <Button onClick={() => handleRequest(pro.providerName)} className="h-14 rounded-[22px] bg-violet-600/10 text-violet-600 text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all active:scale-95">
                Solicitar
              </Button>
            </div>
          </Card>
        )) : (
          <div className="text-center py-10 text-slate-300 font-bold">Nenhum prestador encontrado nesta categoria.</div>
        )}
      </div>
    </div>
  );
};

export const DesapegoFullView: React.FC<{ onBack: () => void; desapegos: any[]; currentUser?: any; onDelete?: (id: string) => void; onSelect?: (item: any) => void }> = ({ onBack, desapegos, currentUser, onDelete, onSelect }) => (
  <div className="min-h-screen bg-slate-50 pb-32">
    <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
      <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-90"><ArrowLeft size={20} /></button>
      <h2 className="text-xl font-black italic uppercase">Desapego</h2>
    </header>
    <div className="p-6 space-y-10">
      {desapegos.map(item => (
        <div key={item.id} onClick={() => onSelect && onSelect(item)}>
          <DesapegoCard item={item} currentUser={currentUser} onDelete={onDelete} variant="preview" />
        </div>
      ))}
    </div>
  </div>
);

export const DesapegoDetailView: React.FC<{ onBack: () => void; item: any; currentUser?: any; onDelete?: (id: string) => void }> = ({ onBack, item, currentUser, onDelete }) => (
  <div className="min-h-screen bg-slate-50 pb-32">
    <header className="p-6 pt-12 flex items-center gap-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
      <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-sm"><ArrowLeft size={20} /></button>
      <h2 className="text-xl font-black italic uppercase tracking-tight">Detalhes do Produto</h2>
    </header>
    <div className="p-6 animate-in slide-in-from-bottom-4">
      {item ? <DesapegoCard item={item} currentUser={currentUser} onDelete={onDelete} variant="detail" /> : <p>Item não encontrado.</p>}
      <div className="mt-8 space-y-4">
        <div className="bg-white p-6 rounded-[32px] shadow-sm">
          <h3 className="font-bold text-slate-900 mb-2">Descrição do Vendedor</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{item?.desc || 'Sem descrição.'}</p>
        </div>
      </div>
    </div>
  </div>
);

export const CreateDesapegoPage: React.FC<{ onBack: () => void; onAdd: (item: any) => void; currentUser: any }> = ({ onBack, onAdd, currentUser }) => {
  const [form, setForm] = useState({ name: '', price: '', desc: '', status: 'USADO' });
  const [image, setImage] = useState<string | null>(null);

  const handlePublish = () => {
    if (!form.name || !form.price) return;
    const newItem = {
      id: Date.now(),
      name: form.name,
      price: form.price.toLowerCase().includes('r$') ? form.price : `R$ ${form.price}`,
      status: form.status,
      user: currentUser?.name || 'Morador',
      tower: currentUser?.tower || '---',
      img: image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
      desc: form.desc
    };
    onAdd(newItem);
    alert('Anúncio publicado com sucesso! Seus vizinhos já podem ver seu desapego.');
    onBack();
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
          onClick={() => setImage('https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?auto=format&fit=crop&w=600&q=80')}
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
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Até 5 fotos do produto</p>
              </div>
            </>
          )}
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
          <Button fullWidth onClick={handlePublish} className="h-20 rounded-[32px] bg-slate-950 text-white text-[13px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-950/20 active:scale-[0.98]">Publicar Desapego</Button>
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

export const CondoAgendaPage: React.FC<{ onBack: () => void; reservations: any[]; setReservations: any; commonAreas: any[] }> = ({ onBack, reservations, setReservations, commonAreas }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [date, setDate] = useState('');
  const [dateFiltered, setDateFiltered] = useState(false);

  // Group by category
  const categories = Array.from(new Set(commonAreas.map(a => a.category || 'Outros')));

  const handleReserve = () => {
    if (!selectedArea || !date) return;

    // Check if already reserved
    const isTaken = reservations.some(r => r.areaId === selectedArea.id && r.date === date);
    if (isTaken) {
      alert('Este espaço já está reservado nesta data. Por favor escolha outra data.');
      return;
    }

    setReservations([...reservations, {
      id: Date.now(),
      area: selectedArea.name,
      areaId: selectedArea.id,
      date: date,
      resident: 'Alex Ferreira', // Mock
      unit: '402-B'
    }]);
    alert('Reserva solicitada com sucesso!');
    setSelectedArea(null);
    setDate('');
    setDateFiltered(false);
  };

  const handleDateFilter = (d: string) => {
    setDate(d);
    setDateFiltered(true);
  };

  const filteredAreas = selectedCategory
    ? commonAreas.filter(a => (a.category || 'Outros') === selectedCategory)
    : [];

  // Filter available areas if date is selected
  const availableAreas = dateFiltered && date
    ? filteredAreas.filter(area => !reservations.some(r => r.areaId === area.id && r.date === date))
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

              <Button fullWidth onClick={handleReserve} className="bg-violet-600 h-16 rounded-[28px] uppercase tracking-[0.2em] font-black text-xs shadow-xl shadow-violet-600/30">Confirmar Reserva</Button>
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

export const ShopDetailPage: React.FC<{ onBack: () => void; products?: any[] }> = ({ onBack, products = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="h-80 relative">
        <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20"></div>
        <button onClick={onBack} className="absolute top-12 left-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white active:scale-90"><ArrowLeft /></button>
        <div className="absolute bottom-16 left-8 right-8 text-white">
          <h2 className="text-4xl font-black italic tracking-tighter leading-none mb-2">e-Shop</h2>
          <p className="font-medium opacity-90">Produtos e Serviços do Condomínio</p>
        </div>
      </div>

      <div className="-mt-10 px-6 relative z-20 mb-6">
        <div className="bg-white p-4 rounded-3xl shadow-xl flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por produto ou prestador..."
            className="flex-1 outline-none text-slate-700 font-bold placeholder:text-slate-300 placeholder:font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-t-[48px] relative z-10 min-h-screen px-6 space-y-8">
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
          {['Todos', 'Pães', 'Cafés', 'Doces', 'Salgados'].map(t => <span key={t} className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{t}</span>)}
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            {searchTerm ? `Resultados: ${filteredProducts.length}` : `Destaques (${filteredProducts.length})`}
          </h4>

          {filteredProducts.length > 0 ? filteredProducts.map(p => (
            <div key={p.id} className="flex gap-4 p-4 rounded-[24px] border border-slate-50 shadow-sm active:scale-[0.98]">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden relative group">
                {p.image_url ? (
                  <img src={p.image_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={24} /></div>
                )}
              </div>
              <div className="flex-1 py-1">
                <div className="flex justify-between items-start">
                  <h5 className="font-bold text-slate-900 italic line-clamp-1">{p.title}</h5>
                  {p.profiles?.name && <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">{p.profiles.name}</span>}
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description || "Sem descrição."}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-emerald-600 font-black">R$ {p.price?.toFixed(2)}</p>
                  <button className="w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-violet-600/20 active:scale-90 transition-all"><Plus size={16} /></button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300"><Search size={24} /></div>
              <p className="text-slate-400 font-bold text-sm">Nenhum produto encontrado.</p>
              <p className="text-slate-300 text-xs mt-1">Tente buscar por outro termo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export const PersonalDataPage: React.FC<{ onBack: () => void; currentUser: any }> = ({ onBack, currentUser }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-90 transition-transform"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase">Dados Pessoais</h2>
      </header>
      <div className="p-6 space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-[40px] border-4 border-white shadow-xl overflow-hidden mb-4">
            <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover" />
          </div>
          <button className="text-violet-600 font-bold text-xs uppercase bg-violet-50 px-4 py-2 rounded-lg">Alterar Foto</button>
        </div>

        <div className="space-y-6 bg-white p-8 rounded-[40px] shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
            <Input defaultValue={currentUser?.name} className="h-14 font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Unidade</label>
              <Input defaultValue={currentUser?.unit} readOnly className="h-14 font-medium bg-slate-50 text-slate-500" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Torre/Bloco</label>
              <Input defaultValue={currentUser?.tower || 'A'} readOnly className="h-14 font-medium bg-slate-50 text-slate-500" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email</label>
            <Input defaultValue="morador@email.com" className="h-14 font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Telefone</label>
            <Input defaultValue="(11) 99999-9999" className="h-14 font-medium" />
          </div>
        </div>

        <Button fullWidth className="h-16 rounded-[24px] bg-slate-900 text-white font-black uppercase text-xs tracking-widest">Salvar Alterações</Button>
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
  <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-8 py-5 flex justify-between items-center z-40 max-w-md mx-auto">
    {[
      { id: 'home', icon: <LayoutGrid size={26} /> },
      { id: 'market', icon: <ShoppingBag size={26} /> },
      { id: 'booking', icon: <CalendarDays size={26} /> },
      { id: 'profile', icon: <User size={26} /> },
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => onChange(item.id)}
        className={`flex flex-col items-center transition-all ${activeTab === item.id ? 'text-violet-600 scale-110' : 'text-slate-300'}`}
      >
        {item.icon}
      </button>
    ))}
  </div>
);
