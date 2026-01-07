
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

const DesapegoCard: React.FC<{ item: any }> = ({ item }) => {
  const [interestSent, setInterestSent] = useState(false);
  return (
    <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-slate-200/60 rounded-[48px] bg-white group active:scale-[0.98] transition-all">
      <div className="relative h-80 p-6">
        <img src={item.img} className="w-full h-full object-cover rounded-[40px] group-hover:scale-105 transition-transform duration-700" alt={item.name} />
        <div className="absolute top-12 left-12">
          <span className="bg-emerald-500 text-white font-black px-5 py-2 text-[10px] uppercase rounded-xl shadow-xl tracking-widest">{item.status}</span>
        </div>
        <div className="absolute bottom-12 right-12 bg-white/90 backdrop-blur-md px-6 py-3 rounded-[24px] shadow-2xl border border-white/20">
          <p className="text-xl font-black text-slate-950 tracking-tighter">{item.price}</p>
        </div>
      </div>
      <div className="p-10 pt-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-md">
            <img src={`https://picsum.photos/seed/${item.user}/100`} className="w-full h-full object-cover" alt="User" />
          </div>
          <div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.user}</span>
            <p className="text-[9px] font-black text-violet-500 uppercase mt-0.5 tracking-widest">{item.tower}</p>
          </div>
        </div>
        <h4 className="font-black text-2xl text-slate-950 mb-3 tracking-tighter italic">{item.name}</h4>
        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">{item.desc}</p>
        <button
          onClick={() => { setInterestSent(true); setTimeout(() => setInterestSent(false), 3000); }}
          className={`w-full py-6 rounded-[32px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${interestSent ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-white shadow-slate-950/20'}`}
        >
          {interestSent ? 'Interesse Enviado!' : 'Tenho Interesse'}
        </button>
      </div>
    </Card>
  );
};

// --- HOME PRINCIPAL ---
export const ResidentHome: React.FC<{
  onNavigate: (target: string) => void;
  onSelectCategory: (cat: string) => void;
  packages: any[];
  setPackages: (pkgs: any[]) => void;
  desapegos: any[];
  serviceRequests: any[];
  activeServices: any[];
  currentUser: any;
  notifications?: any[];
  onClearNotifications?: () => void;
}> = ({ onNavigate, onSelectCategory, packages = [], setPackages, desapegos = [], serviceRequests = [], activeServices = [], currentUser, notifications = [], onClearNotifications }) => {
  const myPackages = packages.filter(p => p.unit === (currentUser?.unit || '402-B'));
  const [showNotifications, setShowNotifications] = useState(false);

  const managementActions = [
    { icon: <History size={24} />, label: 'Minhas Atividades', target: 'booking' },
    { icon: <Wallet size={24} />, label: 'Financeiro', target: 'financeiro' },
    { icon: <Key size={24} />, label: 'Controle de Acesso', target: 'acesso' },
    { icon: <CalendarDays size={24} />, label: 'Reservas', target: 'condo-agenda' },
    { icon: <AlertCircle size={24} />, label: 'Ocorrências', target: 'chamado' },
    { icon: <Users size={24} />, label: 'Assembleias', target: 'assemblies' },
  ];

  const serviceCategories = [
    { icon: <Paintbrush size={24} />, label: 'Pintura', cat: 'Limpeza' },
    { icon: <Zap size={24} />, label: 'Elétrica', cat: 'Reparos' },
    { icon: <Droplets size={24} />, label: 'Hydráulica', cat: 'Reparos' },
    { icon: <Wrench size={24} />, label: 'Manutenção', cat: 'Reparos' },
    { icon: <Scissors size={24} />, label: 'Beleza', cat: 'Beleza' },
    { icon: <Utensils size={24} />, label: 'Cozinha', cat: 'Gastronomia' },
  ];

  const shopItems = [
    { id: 's1', name: 'Padaria Splendido', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', tag: 'Aberto', desc: 'Pães artesanais e café fresco' },
    { id: 's2', name: 'Mercadinho 24h', img: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80', tag: 'Self-service', desc: 'Conveniência total no seu prédio' },
    { id: 's3', name: 'Lavanderia Express', img: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80', tag: 'Aberto', desc: 'Lavagem e secagem profissional' },
  ];

  const messages = [
    { title: 'Manutenção Preventiva', text: 'Amanhã teremos manutenção nos elevadores da Torre A.', time: '10 min atrás', type: 'AVISO' },
    { title: 'Nova Assembleia', text: 'Convocação para reunião extraordinária no dia 15/01.', time: '2h atrás', type: 'EVENTO' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      {/* 1. CABEÇALHO PREMIUM */}
      <div className="bg-white p-6 pt-12 rounded-b-[40px] shadow-sm border-b border-slate-100 relative z-50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-violet-100 shadow-xl">
              <img src={currentUser?.avatar || "https://picsum.photos/seed/alex/150"} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-black text-slate-950 text-2xl tracking-tighter leading-none italic">Olá, {currentUser?.name?.split(' ')[0] || 'Morador'}!</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                <MapPin size={10} className="text-violet-500" /> {currentUser?.condo || 'Condomínio'} • {currentUser?.unit || '---'}-{currentUser?.tower || '-'}
              </p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-all relative"
            >
              <Bell size={24} />
              {notifications.length > 0 && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-14 w-80 bg-white rounded-[32px] shadow-2xl border border-slate-100 p-4 animate-in slide-in-from-top-4 fade-in duration-200 z-[100]">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h4 className="font-black text-slate-900 italic text-sm">Notificações</h4>
                  <button onClick={onClearNotifications} className="text-[10px] text-violet-600 font-bold uppercase hover:bg-violet-50 px-2 py-1 rounded-lg transition-colors">Limpar</button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto w-full pr-1">
                  {notifications.length > 0 ? notifications.map((n: any) => (
                    <div key={n.id} className={`p-3 rounded-2xl flex gap-3 ${n.read ? 'bg-transparent' : 'bg-violet-50'}`}>
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.read ? 'bg-slate-200' : 'bg-violet-500'}`}></div>
                      <div className="flex-1">
                        <h5 className={`text-xs font-bold leading-tight ${n.read ? 'text-slate-500' : 'text-slate-900'}`}>{n.title}</h5>
                        <p className="text-[10px] text-slate-400 leading-snug mt-1">{n.desc}</p>
                        <span className="text-[9px] text-slate-300 font-bold mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-6">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tudo limpo por aqui</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors" size={18} />
          <Input
            placeholder="O que você precisa hoje?"
            className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-violet-100 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && alert('Busca iniciada: ' + e.currentTarget.value + '. Feature em desenvolvimento.')}
          />
        </div>
      </div>

      <div className="p-6 space-y-12">
        {/* 2. GESTÃO CONDÔMINO */}
        <div>
          <SectionHeader title="Gestão Condômino" />
          <div className="grid grid-cols-3 gap-3">
            {managementActions.map((act, i) => (
              <button key={i} onClick={() => onNavigate(act.target)} className="bg-white p-5 rounded-[32px] flex flex-col items-center gap-3 shadow-sm border border-slate-50 active:scale-95 transition-all">
                <div className="text-violet-600 bg-violet-50 w-12 h-12 rounded-2xl flex items-center justify-center">{act.icon}</div>
                <span className="text-[10px] font-black text-slate-600 text-center uppercase tracking-tighter leading-tight whitespace-pre-wrap">{act.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. PRESTADORES POR CATEGORIA */}
        <div>
          <SectionHeader title="Prestadores de Serviços" action="Ver Todos" onAction={() => onNavigate('market')} />
          <div className="grid grid-cols-3 gap-3">
            {serviceCategories.map((cat, i) => (
              <button key={i} onClick={() => onSelectCategory(cat.cat)} className="bg-white p-5 rounded-[32px] flex flex-col items-center gap-3 shadow-sm border border-slate-50 active:scale-95 transition-all">
                <div className="text-emerald-600 bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center">{cat.icon}</div>
                <span className="text-[10px] font-black text-slate-600 text-center uppercase tracking-tighter leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. E-SHOP (B2C Ecosystem) */}
        <div>
          <SectionHeader title="E-Shop: Parceiros" action="Oportunidades" onAction={() => onNavigate('market')} />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4 px-1">Compre direto de empresas parceiras</p>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
            {shopItems.map((shop, i) => (
              <div key={i} onClick={() => onNavigate('shop-detail')} className="min-w-[240px] h-56 rounded-[40px] overflow-hidden relative group active:scale-95 transition-all shadow-xl cursor-pointer">
                <img src={shop.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={shop.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                <div className="absolute top-6 right-6 bg-violet-600 text-white px-4 py-1.5 rounded-full shadow-lg">
                  <span className="text-[9px] font-black uppercase tracking-widest">{shop.tag}</span>
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                  <h4 className="font-black text-white text-xl tracking-tighter italic leading-none">{shop.name}</h4>
                  <p className="text-[10px] text-white/70 font-medium mt-2 line-clamp-1">{shop.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. MURAL DO DESAPEGO (C2C Resident to Resident) */}
        <div>
          <SectionHeader title="Mural do Desapego" action="Anunciar" onAction={() => onNavigate('create-desapego')} />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 px-1">Negocie direto com seus vizinhos</p>
          <div className="space-y-6">
            {desapegos.slice(0, 2).map((item) => (
              <DesapegoCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* 6. MENSAGENS DO CONDOMÍNIO */}
        <div>
          <SectionHeader title="Comunicados Oficiais" />
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} onClick={() => alert('Abrindo: ' + msg.title)} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-start gap-4 active:scale-98 transition-all cursor-pointer">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${msg.type === 'AVISO' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                  <Megaphone size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900 text-base tracking-tight">{msg.title}</h4>
                    <span className="text-[9px] font-black text-slate-300 uppercase">{msg.time}</span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ENCOMENDAS */}
        {myPackages.length > 0 && (
          <div className="bg-slate-950 rounded-[48px] p-8 text-white shadow-2xl shadow-slate-950/20 relative overflow-hidden group animate-in zoom-in duration-500">
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-[60px] -mr-16 -mt-16"></div>
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-[24px] flex items-center justify-center border border-white/10"><Package size={28} className="text-violet-400" /></div>
              <div>
                <h3 className="font-black text-xl tracking-tight leading-none">Encomenda Chegou!</h3>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-2">
                  {myPackages.length === 1 ? `Locker ${myPackages[0].locker} • Torre A` : `${myPackages.length} Encomendas aguardando`}
                </p>
              </div>
            </div>
            <button onClick={() => setPackages && setPackages(packages.filter(p => p.unit !== '402-B'))} className="w-full py-5 bg-violet-600 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-violet-600/30 active:scale-[0.98] transition-all">Liberar Retirada</button>
          </div>
        )}

      </div>

      <button onClick={() => onNavigate('create-desapego')} className="fixed bottom-28 right-8 w-18 h-18 bg-violet-600 rounded-full flex items-center justify-center shadow-2xl shadow-violet-600/40 text-white border-4 border-white active:scale-90 transition-transform z-50">
        <Plus size={36} strokeWidth={3} />
      </button>
    </div>
  );
};

export const Marketplace: React.FC<{ onNavigate: (t: string) => void; onSelectCategory: (cat: string) => void }> = ({ onNavigate, onSelectCategory }) => {
  const categories = [
    { id: '1', name: 'Alimentação', icon: <Utensils size={28} />, bg: 'bg-orange-50', color: 'text-orange-600' },
    { id: '2', name: 'Manutenção', icon: <Wrench size={28} />, bg: 'bg-blue-50', color: 'text-blue-600' },
    { id: '3', name: 'Limpeza', icon: <Droplets size={28} />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { id: '4', name: 'Estética', icon: <Scissors size={28} />, bg: 'bg-rose-50', color: 'text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <header className="p-6 pt-12 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-40">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase">Marketplace</h2>
        <ShoppingBag className="text-violet-600" size={24} />
      </header>
      <div className="p-6 space-y-10">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors" size={20} />
          <Input placeholder="Qual serviço você precisa?" className="h-18 pl-14 rounded-[30px] border-none shadow-2xl shadow-slate-100" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => onSelectCategory(cat.name)} className={`${cat.bg} p-8 rounded-[40px] flex flex-col gap-4 text-left group active:scale-95 transition-all border-2 border-transparent hover:border-white hover:shadow-xl`}>
              <div className={`${cat.color} group-hover:scale-110 transition-transform`}>{cat.icon}</div>
              <h4 className={`font-black italic text-lg tracking-tight leading-none ${cat.color}`}>{cat.name}</h4>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ServicosFullView: React.FC<{ initialCategory: string; onBack: () => void; onNavigate: (t: string) => void; onServiceRequest: (req: any) => void }> = ({ initialCategory, onBack, onServiceRequest }) => {
  const pros = [
    { id: 1, name: 'Marcos Silva', sector: 'Hidráulica', rating: 4.8, img: 'https://picsum.photos/seed/pro1/100', price: 'Sob Consulta' },
    { id: 2, name: 'Juliana Mendes', sector: 'Limpeza Profissional', rating: 5.0, img: 'https://picsum.photos/seed/pro2/100', price: 'R$ 120/visita' }
  ];

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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-90"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">{initialCategory}</h2>
      </header>
      <div className="p-6 space-y-6">
        {pros.map(pro => (
          <Card key={pro.id} className="p-8 border-none shadow-xl rounded-[44px] bg-white space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-18 h-18 rounded-[28px] overflow-hidden border-2 border-slate-50 shadow-sm"><img src={pro.img} className="w-full h-full object-cover" /></div>
              <div className="flex-1">
                <h4 className="font-black text-slate-900 italic text-xl leading-none">{pro.name}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-100">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[10px] font-black">{pro.rating}</span>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{pro.sector}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base de Preço</span>
              <span className="font-black text-slate-900 italic">{pro.price}</span>
            </div>
            <Button fullWidth onClick={() => handleRequest(pro.name)} className="h-15 rounded-[22px] bg-violet-600 text-white text-[10px] font-black uppercase tracking-[0.2em]">Solicitar Agora</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const DesapegoFullView: React.FC<{ onBack: () => void; desapegos: any[] }> = ({ onBack, desapegos }) => (
  <div className="min-h-screen bg-slate-50 pb-32">
    <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
      <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-90"><ArrowLeft size={20} /></button>
      <h2 className="text-xl font-black italic uppercase">Desapego</h2>
    </header>
    <div className="p-6 space-y-10">
      {desapegos.map(item => <DesapegoCard key={item.id} item={item} />)}
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

export const ResidentProfile: React.FC<{ currentUser: any }> = ({ currentUser: profile }) => {
  const [view, setView] = useState<'main' | 'account' | 'family' | 'privacy'>('main');

  const handleLogout = async () => {
    console.log('🔵 [AUTH] Saindo do sistema...');
    await supabase.auth.signOut();
    window.location.reload();
  };

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
                <img src={profile?.avatar || `https://picsum.photos/seed/${profile?.name}/200`} className="w-full h-full object-cover" alt="Avatar" />
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                <Camera size={18} />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome Completo</label>
              <Input value={profile?.name || ''} readOnly className="h-16 rounded-3xl bg-slate-50/50 border-slate-100" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">E-mail</label>
              <Input value={profile?.email || ''} readOnly className="h-16 rounded-3xl bg-slate-50/50 border-slate-100" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Telefone (Fixo/Móvel)</label>
              <Input value={profile?.phone || '(11) 99999-9999'} readOnly className="h-16 rounded-3xl bg-slate-50/50 border-slate-100" />
            </div>
            <div className="pt-6 border-t border-slate-50">
              <Button fullWidth className="bg-slate-950 text-white h-16 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em]">Salvar Alterações</Button>
              <p className="text-center text-[9px] text-slate-400 font-bold uppercase mt-6 tracking-widest px-8 leading-relaxed">Alguns dados só podem ser alterados via administração do condomínio.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'family') {
    return (
      <div className="min-h-screen bg-white pb-32 animate-in slide-in-from-right duration-300">
        <ProfileDetailHeader title="Minha Família" onBack={() => setView('main')} />
        <div className="p-8 space-y-10">
          <div className="bg-violet-50 p-8 rounded-[40px] border border-violet-100/50">
            <p className="text-[10px] text-violet-600 font-black uppercase tracking-widest mb-2 leading-none">Status da Unidade</p>
            <h4 className="text-2xl font-black italic tracking-tighter text-slate-900">{profile?.unit || '---'}-{profile?.tower || '-'} • 3 Dependentes</h4>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] px-2">Integrantes</h4>
            {[
              { name: profile?.name || 'Titular', role: 'Titular', avatar: profile?.avatar },
              { name: 'Maria Oliveira', role: 'Cônjuge', avatar: 'https://picsum.photos/seed/maria/100' },
              { name: 'Pedro Santos', role: 'Filho', avatar: 'https://picsum.photos/seed/pedro/100' },
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
                {member.role !== 'Titular' && (
                  <button className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors">
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
            <button className="w-full p-6 border-2 border-dashed border-slate-100 rounded-[32px] flex items-center justify-center gap-3 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:border-violet-200 hover:text-violet-500 hover:bg-violet-50/50 transition-all">
              <UserPlus size={20} /> Adicionar Dependente
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
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] px-2">Configurações de Dados</h4>
            {[
              { title: 'Perfil Público', desc: 'Permitir que vizinhos vejam seu perfil no Mural.', checked: true },
              { title: 'Notificações Push', desc: 'Alertas de avisos, encomendas e reservas.', checked: true },
              { title: 'Compartilhar Telefone', desc: 'Mostrar número apenas para outros moradores.', checked: false },
              { title: 'Biometria Facial', desc: 'Usar FaceID/Digital para acesso ao condomínio.', checked: true },
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
            <Button fullWidth className="bg-rose-50 text-rose-500 h-16 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] border-none">Excluir Minha Conta Permanentemente</Button>
            <p className="text-center text-[9px] text-slate-400 font-bold uppercase mt-6 tracking-widest px-8 leading-relaxed">Esta ação é irreversível e removerá todos os seus dados do sistema.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      {/* Header Profile Premium */}
      <div className="h-64 bg-violet-600 relative overflow-visible shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent"></div>

        {/* Avatar Container: Overflow visible to avoid cutting */}
        <div className="absolute -bottom-16 left-10 w-32 h-32 rounded-[44px] border-[6px] border-[#f8fafc] bg-white overflow-hidden shadow-2xl z-20 transition-transform hover:scale-105 duration-500">
          <img src={profile?.avatar || `https://picsum.photos/seed/${profile?.name}/200`} alt="Me" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="pt-20 px-10 space-y-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-950 leading-none">{profile?.name || 'Seu Nome'}</h2>
          <div className="flex items-center gap-3 mt-4">
            <span className="bg-violet-100 text-violet-700 font-black text-[10px] px-3 py-1 rounded-lg uppercase tracking-widest">{profile?.role || 'Residente'}</span>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <MapPin size={12} className="text-violet-500" /> {profile?.condo || 'Vila Verde'} • {profile?.unit || '---'} {profile?.tower || '-'}
            </p>
          </div>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] px-2">Menu de Painel</h4>
          <div className="grid gap-3">
            {[
              { icon: <Settings size={22} />, label: 'Minha Conta', desc: 'Dados pessoais e segurança', onClick: () => setView('account') },
              { icon: <Users size={22} />, label: 'Minha Família', desc: 'Gerenciar dependentes', onClick: () => setView('family') },
              { icon: <ShieldCheck size={22} />, label: 'Privacidade', desc: 'Configurações de dados', onClick: () => setView('privacy') },
              { icon: <LogOut size={22} />, label: 'Sair do Sistema', color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Encerrar sessão atual', onClick: handleLogout }
            ].map((it, i) => (
              <button
                key={i}
                onClick={it.onClick}
                className="w-full p-6 bg-white rounded-[32px] flex items-center justify-between group shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all border border-slate-50 active:scale-[0.98]"
              >
                <div className="flex items-center gap-5 text-left">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 ${it.bg || 'bg-slate-50'} ${it.color || 'text-slate-400'}`}>
                    {it.icon}
                  </div>
                  <div>
                    <span className={`text-base font-black italic block ${it.color || 'text-slate-900'} leading-none mb-1`}>{it.label}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{it.desc}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-200 group-hover:bg-violet-50 group-hover:text-violet-400 transition-colors">
                  <ChevronRight size={20} />
                </div>
              </button>
            ))}
          </div>
        </div>
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
            <div className="absolute top-0 right-0 p-8 opacity-5 text-violet-600">
              <Building2 size={80} />
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

export const ShopDetailPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="min-h-screen bg-white pb-32">
    <div className="h-80 relative">
      <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" />
      <button onClick={onBack} className="absolute top-12 left-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white active:scale-90"><ArrowLeft /></button>
    </div>
    <div className="-mt-12 bg-white rounded-t-[48px] p-8 relative z-10 min-h-screen space-y-8">
      <div className="flex justify-between items-start">
        <h2 className="text-3xl font-black italic tracking-tighter w-2/3 leading-none">Padaria Splendido</h2>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Aberto</div>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {['Pães', 'Cafés', 'Doces', 'Salgados'].map(t => <span key={t} className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{t}</span>)}
      </div>
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Destaques de Hoje</h4>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 p-4 rounded-[24px] border border-slate-50 shadow-sm active:scale-[0.98]">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl"></div>
            <div className="flex-1 py-1">
              <h5 className="font-bold text-slate-900 italic">Combo Café da Manhã</h5>
              <p className="text-xs text-slate-400 mt-1">Pão na chapa + Café com leite média.</p>
              <p className="text-emerald-600 font-black mt-2">R$ 12,50</p>
            </div>
            <button className="self-end w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center"><Plus size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- NAVEGAÇÃO RESIDENTE ---
export const AppNavigation: React.FC<{ activeTab: string; onChange: (tab: string) => void }> = ({ activeTab, onChange }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-10 py-5 flex justify-between items-center z-40 max-w-md mx-auto">
    {[
      { id: 'home', icon: <LayoutGrid size={26} />, label: 'Início' },
      { id: 'market', icon: <ShoppingBag size={26} />, label: 'Market' },
      { id: 'booking', icon: <CalendarDays size={26} />, label: 'Reservas' },
      { id: 'profile', icon: <User size={26} />, label: 'Perfil' },
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => onChange(item.id)}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-violet-600 scale-110' : 'text-slate-300'}`}
      >
        {item.icon}
        <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
      </button>
    ))}
  </div>
);
