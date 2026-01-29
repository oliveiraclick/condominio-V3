import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, Badge, Button, Input } from '../components/ui';
import { supabase } from '../supabase';
import {
  LayoutDashboard, Users, Megaphone, Key, CalendarDays,
  MessageSquare, Wallet, Package, ArrowLeft, Search,
  Plus, MoreVertical, CheckCircle2, XCircle, Bell,
  MapPin, Filter, UserPlus, FileText, Upload, Send,
  Download, FileSpreadsheet, Layers, QrCode, Scan,
  Car, UserCheck, Clock, ShieldAlert, Wrench, ChevronRight,
  DoorOpen, Hash, UserCircle2, Info, AlertCircle, Check,
  TrendingUp, TrendingDown, Trash2, Edit3, Phone,
  ClipboardCheck, HardHat, Hammer, HelpCircle, Trophy,
  Activity, Shield, Camera, Image as ImageIcon,
  Droplets, Leaf, Waves, Heart, Baby, Calendar, Mail, IdCard,
  Lock, Settings, Eye, EyeOff, User, Paperclip, Mic, CheckCheck,
  Briefcase, Share2, X, PartyPopper, Save, Building2, UserCog, Flame, Dumbbell, LogOut, ListFilter, Box
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';

// Dedicated Package Components
import { AdminPackageReceipt } from './AdminPackageReceipt';
import { AdminPackageProcessing } from './AdminPackageProcessing';
import { AdminPackagePickup } from './AdminPackagePickup';

export const AdminNavigation: React.FC<{ activeTab: string; onChange: (tab: string) => void }> = ({ activeTab, onChange }) => {
  if (['admin-packages', 'package-receipt', 'package-processing', 'package-pickup', 'admin-packages-receipt', 'admin-packages-processing', 'admin-packages-pickup'].includes(activeTab)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-4 flex justify-between items-center z-40 max-w-md mx-auto">
      {[
        { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: 'Início' },
        { id: 'residents', icon: <Users size={24} />, label: 'Moradores' },
        { id: 'messages', icon: <MessageSquare size={24} />, label: 'Chat' },
        { id: 'system-users', icon: <Lock size={24} />, label: 'Acessos' },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-blue-600 scale-110 drop-shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          {item.icon}
          <span className="text-[10px] font-bold uppercase">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

const AdminHeader: React.FC<{ title: string; onBack?: () => void; rightElement?: React.ReactNode }> = ({ title, onBack, rightElement }) => (
  <header className="p-6 pt-12 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between sticky top-0 z-50 shadow-sm">
    <div className="flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 border border-slate-200">
          <ArrowLeft size={20} />
        </button>
      )}
      <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">{title}</h2>
    </div>
    {rightElement}
  </header>
);

const SectionHeader: React.FC<{ title: string; action?: string; onAction?: () => void }> = ({ title, action, onAction }) => (
  <div className="flex justify-between items-end mb-6 px-1">
    <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-none">{title}</h3>
    {action && (
      <button onClick={onAction} className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl active:scale-95 transition-all hover:bg-blue-100 border border-blue-100 shadow-sm">
        {action}
      </button>
    )}
  </div>
);

// --- DASHBOARD ADMIN REDESIGNED ---
export const AdminDashboard: React.FC<{ onNavigate: (t: string) => void, onLogout: () => void }> = ({ onNavigate, onLogout }) => {
  const [counts, setCounts] = useState({ residents: 0, reservations: 0, pendencies: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Residents Count
      const { count: resCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'resident');

      // 2. Reservations Today
      const today = new Date().toISOString().split('T')[0];
      const { count: reserveCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

      // 3. Pendencies (Open/Pending Requests)
      const { count: pendingCount } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'open', 'Aberto', 'Em Análise']); // Add all "pending" statuses used

      setCounts({
        residents: resCount || 0,
        reservations: reserveCount || 0,
        pendencies: pendingCount || 0
      });
    };

    fetchStats();

    // Subscribe to realtime changes (Optional but cool)
    const channel = supabase
      .channel('admin-dashboard-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, fetchStats)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats = [
    { label: 'Moradores', value: counts.residents, icon: <Users size={16} />, color: 'bg-blue-500' },
    { label: 'Reservas Hoje', value: counts.reservations, icon: <CalendarDays size={16} />, color: 'bg-emerald-500' },
    { label: 'Pendências', value: counts.pendencies, icon: <AlertCircle size={16} />, color: 'bg-amber-500' },
  ];

  const operationalGroups = [
    {
      title: 'Operações Diárias',
      items: [
        { id: 'access', icon: <Key size={24} />, label: 'Portaria & Acessos', desc: 'Controle de visitantes', target: 'admin-access', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { id: 'packages', icon: <Package size={24} />, label: 'Encomendas', desc: 'Gestão de recebidos', target: 'admin-packages', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { id: 'reserves', icon: <CalendarDays size={24} />, label: 'Reservas', desc: 'Áreas comuns', target: 'admin-reservations', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      ]
    },
    {
      title: 'Gestão & Comunidade',
      items: [
        { id: 'residents', icon: <Users size={24} />, label: 'Moradores', desc: 'Base de condôminos', target: 'admin-residents', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { id: 'finance', icon: <Wallet size={24} />, label: 'Financeiro', desc: 'Cobranças e taxas', target: 'admin-finance', color: 'text-slate-400', bg: 'bg-slate-500/10' },
        { id: 'notices', icon: <Megaphone size={24} />, label: 'Mural de Avisos', desc: 'Comunicados gerais', target: 'admin-notices', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { id: 'banners', icon: <ImageIcon size={24} />, label: 'Banners App', desc: 'Carrossel Home', target: 'admin-banners', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { id: 'categories', icon: <Layers size={24} />, label: 'Categorias', desc: 'Serviços e áreas', target: 'admin-categories', color: 'text-pink-400', bg: 'bg-pink-500/10' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans selection:bg-blue-500/30 text-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 pt-12 pb-8 px-8 rounded-b-[40px] shadow-2xl mb-8 relative overflow-hidden border-b border-blue-400">
        {/* WATERMARK SYMBOL */}
        {(onNavigate as any).currentUser?.symbol_url && (
          <div
            className="absolute inset-0 z-0 pointer-events-none rounded-b-[40px] overflow-hidden flex items-center justify-center p-12"
            style={{ opacity: ((onNavigate as any).currentUser.symbol_opacity || 15) / 100 }}
          >
            <img
              src={(onNavigate as any).currentUser.symbol_url}
              className="w-full h-full object-contain grayscale opacity-20 invert"
              alt="Background Branding"
            />
          </div>
        )}
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black italic text-white tracking-tighter">Painel Admin</h2>
            <p className="text-brand-100 font-medium text-sm mt-1">Gestão Completa do Condomínio</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
            <Building2 className="text-white" size={24} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md group hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full bg-white`}></div>
                <span className="text-[9px] font-black uppercase text-white/70 tracking-widest">{stat.label}</span>
              </div>
              <p className="text-xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-8">
        {operationalGroups.map((group, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">{group.title}</h3>
            <div className="grid grid-cols-2 gap-3">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.target)}
                  className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col gap-3 group active:scale-95 transition-all hover:bg-slate-50 hover:shadow-md text-left relative overflow-hidden"
                >
                  <div className={`w-12 h-12 ${item.bg.replace('/10', '/20')} ${item.color.replace('text-', 'text-')} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{item.label}</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{item.desc}</p>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* System & Logout */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('profile')}
              className="bg-white p-5 rounded-[24px] shadow-sm flex items-center gap-4 group active:scale-95 transition-all border border-slate-100 hover:bg-slate-50"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                <UserCircle2 size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-black text-slate-900 text-sm">Meu Perfil</h4>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest">Configurações</p>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="bg-rose-50 p-5 rounded-[24px] border border-rose-100 flex items-center gap-4 group active:scale-95 transition-all hover:bg-rose-100"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
                <LogOut size={20} />
              </div>
              <div className="text-left group-hover:text-rose-600">
                <h4 className="font-black text-rose-500 text-sm group-hover:text-rose-600">Sair</h4>
                <p className="text-[9px] text-rose-400 uppercase tracking-widest group-hover:text-rose-500">Encerrar</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- COMPONENTE GESTÃO DE ESPAÇOS ---
export const AdminCommonAreas: React.FC<{ commonAreas: any[]; setCommonAreas: any; onUpdateArea?: (a: any) => void }> = ({ commonAreas, setCommonAreas, onUpdateArea }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', desc: '', price: '', hours: '', inventory: '', photo: '', category: 'Gourmet',
    reservation_type: 'full_day', available_start_time: '06:00:00', available_end_time: '22:00:00'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!form.name) return;
    setUploading(true);

    try {
      let publicUrl = form.photo;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const bucketName = 'common_areas';

        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, imageFile);

        if (uploadError) {
          const { error: retryError } = await supabase.storage.from('public').upload(`areas/${filePath}`, imageFile);
          if (retryError) throw uploadError;
          const { data } = supabase.storage.from('public').getPublicUrl(`areas/${filePath}`);
          publicUrl = data.publicUrl;
        } else {
          const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
          publicUrl = data.publicUrl;
        }
      }

      if (!publicUrl) publicUrl = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';

      const payload = {
        name: form.name,
        description: form.desc,
        price: parseFloat(form.price.toString().replace(',', '.')) || 0,
        hours: form.hours,
        inventory: form.inventory,
        category: form.category || 'Gourmet',
        reservation_type: form.reservation_type || 'full_day',
        available_start_time: form.available_start_time,
        available_end_time: form.available_end_time,
        photos: [publicUrl]
      };

      if (editingId) {
        const { error } = await supabase.from('common_areas').update(payload).eq('id', editingId);
        if (error) throw error;
        setCommonAreas(commonAreas.map(a => a.id === editingId ? { ...a, ...payload, desc: payload.description } : a));
      } else {
        const { data, error } = await supabase.from('common_areas').insert([payload]).select();
        if (error) throw error;
        if (data) setCommonAreas([...commonAreas, { ...data[0], desc: data[0].description }]);
      }

      setIsAdding(false);
      setEditingId(null);
      setForm({ name: '', desc: '', price: '', hours: '', inventory: '', photo: '', category: 'Gourmet', reservation_type: 'full_day', available_start_time: '06:00:00', available_end_time: '22:00:00' });
      setImageFile(null);
      alert('Área salva com sucesso!');

    } catch (error: any) {
      alert('Erro ao salvar área: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (area: any) => {
    setForm({
      name: area.name,
      desc: area.description || area.desc || '',
      price: area.price || '',
      hours: area.hours || '',
      inventory: area.inventory || '',
      photo: area.photos?.[0] || '',
      category: area.category || 'Gourmet',
      reservation_type: area.reservation_type || 'full_day',
      available_start_time: area.available_start_time || '06:00:00',
      available_end_time: area.available_end_time || '22:00:00'
    });
    setEditingId(area.id);
    setIsAdding(true);
    setImageFile(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir esta área? Isso pode afetar reservas futuras.')) {
      try {
        const { error } = await supabase.from('common_areas').delete().eq('id', id);
        if (error) throw error;
        setCommonAreas(commonAreas.filter(a => a.id !== id));
      } catch (error: any) {
        alert('Erro ao excluir: ' + error.message);
      }
    }
  };

  const gourmetAreas = commonAreas.filter(a => !a.category || a.category === 'Gourmet');
  const sportsAreas = commonAreas.filter(a => a.category === 'Esportes');

  const renderAreaCard = (area: any) => (
    <div key={area.id} onClick={() => startEdit(area)} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center justify-between shadow-lg shadow-slate-200/50 group cursor-pointer hover:bg-slate-50 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-100 text-slate-400 flex items-center justify-center">
          {area.photos?.[0] ? <img src={area.photos[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>}
        </div>
        <div>
          <h5 className="font-black text-slate-900 italic leading-none">{area.name}</h5>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest truncate max-w-[200px]">
            {area.reservation_type === 'hourly' ? 'POR HORA' : 'DIA INTEIRO'} • {area.hours} • R$ {area.price}
          </p>
          <p className="text-[9px] text-slate-500 truncate max-w-[200px] mt-0.5">{area.inventory}</p>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); handleDelete(area.id); }} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 hover:bg-rose-100 border border-slate-100">
        <Trash2 size={18} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center px-2">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configuração de Espaços</h4>
        <button onClick={() => { setIsAdding(true); setEditingId(null); setForm({ name: '', desc: '', price: '', hours: '', inventory: '', photo: '', category: 'Gourmet', reservation_type: 'full_day', available_start_time: '06:00:00', available_end_time: '22:00:00' }); }} className="text-[10px] font-black text-brand-600 uppercase bg-brand-50 px-4 py-2 rounded-xl active:scale-95 transition-all flex items-center gap-1 border border-brand-100">
          <Plus size={14} /> Novo Espaço
        </button>
      </div>

      {isAdding && (
        <Card className="p-8 space-y-4 border border-slate-200 bg-white rounded-[40px] animate-in slide-in-from-top-4 shadow-2xl relative z-20">
          <h3 className="text-lg font-black italic text-slate-900">{editingId ? 'Editar Espaço' : 'Novo Espaço'}</h3>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-40 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white hover:border-brand-500 transition-all overflow-hidden relative"
          >
            {imageFile ? (
              <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" />
            ) : form.photo ? (
              <img src={form.photo} className="w-full h-full object-cover opacity-50" />
            ) : (
              <>
                <Camera className="text-brand-400" size={32} />
                <span className="text-[10px] font-bold text-brand-400 uppercase">Toque para adicionar foto</span>
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
                  setForm({ ...form, photo: '' });
                }
              }}
            />
          </div>

          <Input placeholder="Nome da Área (Ex: Salão de Festas)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-14 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white" />
          <Input placeholder="URL da Foto (Opcional se enviou arquivo)" value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} className="h-14 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white" />

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Categoria</label>
            <select
              className="w-full h-14 bg-slate-50 rounded-2xl px-4 font-bold text-slate-900 outline-none border border-slate-200 focus:border-brand-500 focus:bg-white"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              <option value="Gourmet" className="bg-white">Gourmet & Festas</option>
              <option value="Esportes" className="bg-white">Esportes & Lazer</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">Tipo de Reserva</label>
              <select
                className="w-full h-14 bg-slate-50 rounded-2xl px-4 font-bold text-slate-900 outline-none border border-slate-200 focus:border-brand-500 focus:bg-white"
                value={form.reservation_type}
                onChange={e => setForm({ ...form, reservation_type: e.target.value })}
              >
                <option value="full_day" className="bg-white">Dia Inteiro</option>
                <option value="hourly" className="bg-white">Por Hora</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">Preço (R$ 0,00)</label>
              <Input placeholder="Preço (R$ 0,00)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="h-14 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white" />
            </div>
          </div>

          {form.reservation_type === 'hourly' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Abre às</label>
                <Input type="time" value={form.available_start_time} onChange={e => setForm({ ...form, available_start_time: e.target.value })} className="h-14 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Fecha às</label>
                <Input type="time" value={form.available_end_time} onChange={e => setForm({ ...form, available_end_time: e.target.value })} className="h-14 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white" />
              </div>
            </div>
          )}

          <Input placeholder="Horário Texto (Ex: 08h - 22h)" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} className="h-14 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white" />
          <Input placeholder="Inventário (Ex: 50 cadeiras, 1 freezer)" value={form.inventory} onChange={e => setForm({ ...form, inventory: e.target.value })} className="h-14 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white" />
          <Input placeholder="Descrição / Regras" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} className="h-14 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white" />

          <div className="flex gap-3 pt-2">
            <Button fullWidth variant="secondary" onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-slate-50 text-slate-400 hover:text-slate-600 border-slate-200">Cancelar</Button>
            <Button fullWidth onClick={handleSave} disabled={uploading} className="bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/20">
              {uploading ? 'Enviando...' : 'Salvar'}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-8">
        {gourmetAreas.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-black text-slate-800 italic text-lg flex items-center gap-2"><PartyPopper size={20} className="text-brand-500" /> Gourmet & Festas</h3>
            {gourmetAreas.map(renderAreaCard)}
          </div>
        )}

        {sportsAreas.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-black text-slate-800 italic text-lg flex items-center gap-2"><Dumbbell size={20} className="text-emerald-500" /> Esportes & Lazer</h3>
            {sportsAreas.map(renderAreaCard)}
          </div>
        )}

        {gourmetAreas.length === 0 && sportsAreas.length === 0 && !isAdding && (
          <div className="text-center py-10 text-slate-500 font-bold italic">Nenhuma área cadastrada.</div>
        )}
      </div>
    </div>
  );
};

// --- RESERVAS (ADMIN) ---
export const AdminReservations: React.FC<{ onBack: () => void; reservations: any[]; setReservations: any; commonAreas: any[]; setCommonAreas: any; onUpdateArea?: (a: any) => void }> = ({ onBack, reservations, setReservations, commonAreas, setCommonAreas, onUpdateArea }) => {
  const [view, setView] = useState<'list' | 'config' | 'check'>('list');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Gourmet' | 'Esportes' | null>(null);

  const handleCancel = async (id: number) => {
    if (window.confirm('Confirmar cancelamento desta reserva no sistema?')) {
      try {
        const { error } = await supabase.from('reservations').delete().eq('id', id);
        if (error) throw error;
        setReservations(reservations.filter(r => r.id !== id));
        alert('Reserva removida com sucesso diretamente no banco.');
      } catch (e: any) {
        alert('Erro ao excluir do banco: ' + e.message);
      }
    }
  };

  const getHeaderTitle = () => {
    if (view === 'config') return 'CONFIGURAÇÃO';
    if (view === 'check') return 'DISPONIBILIDADE';
    return 'GESTÃO DE RESERVAS';
  };

  const filteredAreas = selectedCategory
    ? commonAreas.filter(a => (a.category || 'Gourmet') === selectedCategory)
    : [];

  const checkAvailability = (areaName: string) => {
    if (!selectedDate) return null;
    // Normalizing date strings to compare YYYY-MM-DD
    const targetDate = selectedDate;
    const res = reservations.find(r => {
      const rDate = new Date(r.date).toISOString().split('T')[0];
      return r.area === areaName && rDate === targetDate;
    });
    return res ? res : null; // Returns reservation if exists
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <AdminHeader
        title={getHeaderTitle()}
        onBack={view === 'list' ? onBack : () => { setView('list'); setSelectedCategory(null); setSelectedDate(''); }}
        rightElement={
          view === 'list' ? (
            <div className="flex gap-2">
              <button onClick={() => setView('check')} className="text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-2 rounded-xl active:scale-95 transition-all border border-brand-100">
                Nova Consulta
              </button>
              <button onClick={() => setView('config')} className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white px-3 py-2 rounded-xl active:scale-95 transition-all border border-slate-200">
                Configurar
              </button>
            </div>
          ) : null
        }
      />
      <div className="p-6 space-y-8">

        {view === 'config' && (
          <AdminCommonAreas commonAreas={commonAreas} setCommonAreas={setCommonAreas} onUpdateArea={onUpdateArea} />
        )}

        {view === 'check' && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            {/* Category Selection */}
            {!selectedCategory ? (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setSelectedCategory('Gourmet')} className="h-40 bg-white rounded-[32px] border-2 border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center gap-4 hover:border-brand-500 hover:shadow-2xl transition-all active:scale-95 group">
                  <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center border border-brand-100 group-hover:scale-110 transition-transform">
                    <PartyPopper size={32} />
                  </div>
                  <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Gourmet & Festas</span>
                </button>
                <button onClick={() => setSelectedCategory('Esportes')} className="h-40 bg-white rounded-[32px] border-2 border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center gap-4 hover:border-emerald-500 hover:shadow-2xl transition-all active:scale-95 group">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                    <Dumbbell size={32} />
                  </div>
                  <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Esportes & Lazer</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setSelectedCategory(null)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-600 transition-colors border border-slate-200 shadow-sm">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <h3 className="text-lg font-black italic text-slate-900">{selectedCategory}</h3>
                </div>

                {/* Date Picker */}
                <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-100 backdrop-blur-sm">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Selecione uma Data</label>
                  <input
                    type="date"
                    className="w-full h-14 bg-slate-50 rounded-2xl px-4 font-bold text-slate-900 outline-none border border-slate-200 focus:border-brand-500"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                {/* Results List */}
                {selectedDate && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Disponibilidade</h4>
                    {filteredAreas.map(area => {
                      const reservation = checkAvailability(area.name);
                      return (
                        <div key={area.id} className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg backdrop-blur-sm ${reservation ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-100">
                              {area.photos?.[0] ? <img src={area.photos[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="text-slate-400" /></div>}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{area.name}</p>
                              {reservation && <p className="text-[10px] font-bold text-rose-500 uppercase">Reservado: {reservation.resident} (Casa {reservation.unit})</p>}
                              {!reservation && <p className="text-[10px] font-bold text-emerald-500 uppercase">Disponível</p>}
                            </div>
                          </div>
                          {reservation ? <X size={20} className="text-rose-500" /> : <CheckCheck size={20} className="text-emerald-500" />}
                        </div>
                      );
                    })}
                    {filteredAreas.length === 0 && <p className="text-center text-slate-400 text-xs italic">Nenhuma área nesta categoria.</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {view === 'list' && (
          <>
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden border border-brand-500">
              <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-4 text-white">Status do Condomínio</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-black italic tracking-tighter text-white">{reservations.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-1 text-brand-100">Reservas Ativas</p>
                  </div>
                  <CalendarDays className="text-white opacity-20" size={64} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Agenda Confirmada</h4>
              {reservations.length > 0 ? reservations.map((r) => (
                <Card key={r.id} className="p-8 border border-slate-100 shadow-lg shadow-slate-200/50 rounded-[48px] space-y-6 animate-in slide-in-from-bottom-4 bg-white backdrop-blur-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[24px] flex items-center justify-center shadow-sm border border-blue-100">
                        <PartyPopper size={32} />
                      </div>
                      <div>
                        <h5 className="text-xl font-black text-slate-900 italic tracking-tight">{r.area}</h5>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          Morador: <span className="text-slate-900">{r.resident}</span>
                        </p>
                        <p className="text-[9px] font-black text-brand-600 uppercase tracking-widest leading-none mt-1">Casa {r.unit}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100">ATIVO</Badge>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-3xl flex items-center justify-between border border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Agendada</p>
                      <p className="font-black text-slate-900 italic text-lg">{new Date(r.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Clock className="text-slate-400" size={32} />
                  </div>

                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => handleCancel(r.id)}
                    className="py-5 border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl active:scale-95 transition-all hover:bg-rose-50"
                  >
                    Remover Reserva
                  </Button>
                </Card>
              )) : (
                <div className="py-24 text-center">
                  <CalendarDays className="mx-auto text-slate-200 mb-6" size={80} />
                  <p className="text-slate-400 font-black italic uppercase tracking-widest text-[10px]">Sem reservas no momento.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- LISTA DE MORADORES (Atualizado com versão simplificada) ---
export const AdminResidents: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [residents, setResidents] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'resident').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setResidents(data);
      });
  }, []);

  const filtered = residents.filter(r =>
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.unit?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <AdminHeader title="Moradores" onBack={onBack} />
      <div className="p-6 space-y-6">
        <div className="relative">
          <Input placeholder="Buscar por nome ou unidade..." className="pl-12 h-14" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        </div>
        <div className="space-y-4">
          {filtered.length === 0 && <p className="text-center text-slate-300 font-bold italic py-8">Nenhum morador encontrado.</p>}

          {filtered.map(res => (
            <div key={res.id} className="bg-white p-6 rounded-[32px] border flex items-center justify-between shadow-sm hover:border-brand-200 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
                  {res.avatar ? <img src={res.avatar} className="w-full h-full object-cover" /> : <span className="font-black text-slate-300">{res.name?.[0]}</span>}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 italic">{res.name}</h4>
                  <p className="text-[10px] font-bold text-brand-500 uppercase">Casa {res.unit || '---'} • Rua {res.tower || ''}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-200 group-hover:text-brand-400 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- PORTARIA FAST ---
export const AdminAccess: React.FC<{ onBack: () => void; accessList?: any[]; onCheckIn?: (id: string) => void }> = ({ onBack, accessList = [], onCheckIn }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Group accesses by resident
  const residents = Array.from(new Set(accessList.map(a => a.residentId))).map(id => {
    const access = accessList.find(a => a.residentId === id);
    return {
      id: access.residentId,
      name: access.resident,
      unit: access.unit,
      avatar: access.avatar || `https://picsum.photos/seed/${access.resident}/100`,
      clearances: accessList.filter(a => a.residentId === id)
    };
  });

  const filteredResidents = residents.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <AdminHeader title="PORTARIA FAST" onBack={onBack} />
      <div className="p-6 space-y-8">
        <Input placeholder="Digite o nome do Morador ou Unidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-20 bg-white rounded-[35px] shadow-2xl shadow-slate-200/40 text-lg font-bold italic" />
        <div className="space-y-10">
          {filteredResidents.length === 0 ? <p className="text-center text-slate-300 font-bold italic">Nenhum morador encontrado.</p> : filteredResidents.map((res) => (
            <div key={res.id} className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100"><img src={res.avatar} className="w-full h-full object-cover" /></div>
                <div><h4 className="text-sm font-black text-slate-900 italic">{res.name}</h4><p className="text-[9px] font-black text-brand-500 uppercase tracking-widest">Unidade {res.unit}</p></div>
              </div>
              <div className="space-y-3 pl-2">
                {res.clearances.map((clearance) => (
                  <div key={clearance.id} className={`p-6 rounded-[40px] border shadow-sm flex items-center justify-between transition-all ${clearance.status === 'Entrou' ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}`}>
                    <div>
                      <h5 className="text-sm font-black text-slate-900 italic">{clearance.name}</h5>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{clearance.type}</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">• {clearance.date}</span>
                      </div>
                    </div>
                    {clearance.status === 'Entrou' ? (
                      <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Check-in OK</div>
                    ) : (
                      <button onClick={() => onCheckIn && onCheckIn(clearance.id)} className="w-12 h-12 rounded-2xl bg-slate-950 text-white active:scale-90 transition-all flex items-center justify-center shadow-lg shadow-slate-900/20">
                        <Check size={24} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- ENCOMENDAS (COM APERTO DE MÃO DIGITAL) ---

export const AdminPackages: React.FC<{ onBack: () => void; onNavigate: (t: string) => void; currentUser: any }> = ({ onBack, onNavigate, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'receipt' | 'processing' | 'pickup'>('receipt');

  return (
    <div className="min-h-screen bg-slate-50">
      {activeTab === 'receipt' && (
        <AdminPackageReceipt
          onBack={onBack}
          currentUser={currentUser}
          onNavigateProcessing={() => setActiveTab('processing')}
        />
      )}
      {activeTab === 'processing' && (
        <AdminPackageProcessing
          onBack={() => setActiveTab('receipt')}
          currentUser={currentUser}
          onNavigate={(tab) => {
            if (tab === 'admin-packages-pickup') setActiveTab('pickup');
            else onNavigate(tab);
          }}
        />
      )}
      {activeTab === 'pickup' && (
        <AdminPackagePickup
          onBack={() => setActiveTab('processing')}
          currentUser={currentUser}
        />
      )}

      {/* Modern Floating Tab Bar for Packages */}
      <div className="fixed bottom-8 left-6 right-6 z-50 pointer-events-none flex justify-center">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 px-6 py-3 flex items-center gap-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] pointer-events-auto transition-all animate-in slide-in-from-bottom-8 relative overflow-hidden group">
          <div className="absolute top-0 right-4 px-2 py-0.5 bg-violet-500/10 text-[6px] font-black text-violet-500/40 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">V2.4.4</div>

          <button
            onClick={() => setActiveTab('receipt')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'receipt' ? 'text-violet-600 scale-110' : 'text-slate-400 hover:text-slate-500'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'receipt' ? 'bg-violet-50' : 'bg-transparent'}`}>
              <Box size={20} className={activeTab === 'receipt' ? "fill-violet-200/50" : ""} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Receber</span>
          </button>

          <div className="w-[1px] h-6 bg-slate-200/50"></div>

          <button
            onClick={() => setActiveTab('processing')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'processing' ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-500'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'processing' ? 'bg-blue-50' : 'bg-transparent'}`}>
              <ClipboardCheck size={20} className={activeTab === 'processing' ? "fill-blue-200/50" : ""} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Triagem</span>
          </button>

          <div className="w-[1px] h-6 bg-slate-200/50"></div>

          <button
            onClick={() => setActiveTab('pickup')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'pickup' ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-500'}`}
          >
            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'pickup' ? 'bg-emerald-50' : 'bg-transparent'}`}>
              <UserCheck size={20} className={activeTab === 'pickup' ? "fill-emerald-200/50" : ""} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Retirada</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- CHAT CENTRAL ---
export const AdminConciergeChat: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [messages, setMessages] = useState([{ id: 1, sender: 'resident', text: 'Olá, gostaria de confirmar se meu pacote chegou.', time: '14:20' }]);
  const [inputText, setInputText] = useState('');
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <AdminHeader title="Alex Ferreira" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === 'admin' ? 'ml-auto items-end' : 'items-start'}`}>
            <div className={`p-5 rounded-[28px] text-sm font-medium tracking-tight shadow-sm leading-relaxed ${msg.sender === 'admin' ? 'bg-slate-900 text-white rounded-tr-none italic border border-white/10' : 'bg-white/10 text-white border border-white/5 rounded-tl-none'}`}>{msg.text}</div>
            <span className="text-[9px] font-black text-slate-500 uppercase px-2">{msg.time}</span>
          </div>
        ))}
      </div>
      <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
        <input placeholder="Resposta..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="flex-1 h-14 bg-white/5 rounded-2xl px-6 font-bold italic text-white placeholder-slate-500 border border-white/5 focus:border-brand-500 outline-none transition-all" />
        <button onClick={() => { if (inputText) { setMessages([...messages, { id: Date.now(), sender: 'admin', text: inputText, time: 'Agora' }]); setInputText(''); } }} className="w-14 h-14 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center"><Send /></button>
      </div>
    </div>
  );
};


// --- INCIDENTES ---
export const AdminIncidents: React.FC<{ onBack: () => void; serviceRequests?: any[]; onUpdateRequest?: (id: number, status: string) => void }> = ({ onBack, serviceRequests = [], onUpdateRequest }) => {
  const [filter, setFilter] = useState('Todos');
  const filtered = filter === 'Todos' ? serviceRequests : serviceRequests.filter(req => req.status === filter);

  const stats = {
    open: serviceRequests.filter(r => r.status === 'Aberto').length,
    progress: serviceRequests.filter(r => r.status === 'Em Análise').length
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <AdminHeader title="OCORRÊNCIAS" onBack={onBack} />
      <div className="p-6 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-rose-500/10 p-6 rounded-[32px] border border-rose-500/20 shadow-lg shadow-rose-900/20">
            <h4 className="text-4xl font-black text-rose-500 italic tracking-tighter">{stats.open}</h4>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Status Aberto</p>
          </div>
          <div className="bg-blue-500/10 p-6 rounded-[32px] border border-blue-500/20 shadow-lg shadow-blue-900/20">
            <h4 className="text-4xl font-black text-blue-500 italic tracking-tighter">{stats.progress}</h4>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Em Análise</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['Todos', 'Aberto', 'Em Análise', 'Concluído'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-6 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${filter === f ? 'bg-slate-100 text-slate-950' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? <p className="text-center text-slate-500 font-bold italic py-8">Nenhum chamado encontrado.</p> : filtered.map((req) => (
            <Card key={req.id} className="p-6 border-white/10 shadow-lg rounded-[32px] bg-white/5 space-y-4 animate-in slide-in-from-bottom-4 backdrop-blur-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-bold text-slate-400 text-lg italic uppercase border border-white/5">{req.resident.charAt(0)}</div>
                  <div><h5 className="font-bold text-white italic leading-none">{req.title}</h5><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Apt {req.unit}</p></div>
                </div>
                <Badge className={`border-none ${req.status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'}`}>{req.status}</Badge>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/5">{req.description}</p>

              {req.status !== 'Concluído' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {req.status === 'Aberto' && (
                    <Button fullWidth onClick={() => onUpdateRequest && onUpdateRequest(req.id, 'Em Análise')} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Analisar</Button>
                  )}
                  <Button fullWidth onClick={() => onUpdateRequest && onUpdateRequest(req.id, 'Concluído')} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest col-span-2 border border-emerald-500/20">Concluir</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
export const AdminGarage: React.FC<{ onBack: () => void }> = ({ onBack }) => <div className="min-h-screen bg-slate-50"><AdminHeader title="GARAGEM" onBack={onBack} /><div className="p-8 text-center text-slate-500 text-xs font-black uppercase tracking-widest py-32">Mapa de vagas em manutenção.</div></div>;

// --- CATEGORIAS (COM SUB-CATEGORIAS) ---
export const AdminCategories: React.FC<{ onBack: () => void; categories: any[]; onRefresh: () => void }> = ({ onBack, categories, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', image: '', type: 'product', parent_id: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Separate parents and children for UI logic
  const parentCategories = categories.filter(c => !c.parent_id);
  const subCategories = categories.filter(c => c.parent_id);

  const getChildren = (parentId: string) => subCategories.filter(sc => sc.parent_id === parentId);

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      image: category.image_url || '',
      type: category.type,
      parent_id: category.parent_id || ''
    });
    setImageFile(null);
    setIsAdding(true);
    window.scrollTo(0, 0);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setUploading(true);

    try {
      let publicUrl = form.image;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to 'categories' bucket or fallback
        const { error: uploadError } = await supabase.storage.from('categories').upload(filePath, imageFile);
        if (uploadError) {
          console.warn('Bucket categories not found, trying public...');
          const { error: retryError } = await supabase.storage.from('public').upload(`categories/${filePath}`, imageFile);
          if (retryError) throw uploadError;
          const { data } = supabase.storage.from('public').getPublicUrl(`categories/${filePath}`);
          publicUrl = data.publicUrl;
        } else {
          const { data } = supabase.storage.from('categories').getPublicUrl(filePath);
          publicUrl = data.publicUrl;
        }
      }

      // If parent_id is set, force type to match parent
      let finalType = form.type;
      if (form.parent_id) {
        const parent = parentCategories.find(p => p.id === form.parent_id);
        if (parent) finalType = parent.type;
      }

      const payload: any = {
        name: form.name,
        image_url: publicUrl,
        type: finalType,
        parent_id: form.parent_id || null
      };

      if (editingId) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('Categoria atualizada!');
      } else {
        const { error } = await supabase.from('categories').insert([payload]);
        if (error) throw error;
        alert('Categoria criada!');
      }

      setIsAdding(false);
      setEditingId(null);
      setForm({ name: '', image: '', type: 'product', parent_id: '' });
      setImageFile(null);
      onRefresh();

    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir? Isso apagará também as sub-categorias.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) onRefresh();
    else alert('Erro: ' + error.message);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <AdminHeader title="CATEGORIAS" onBack={onBack} />
      <div className="p-6 space-y-6">
        {!isAdding && (
          <Button fullWidth onClick={() => { setIsAdding(true); setEditingId(null); setForm({ name: '', image: '', type: 'product', parent_id: '' }); }} className="h-16 rounded-[24px] bg-slate-100 text-slate-950 flex items-center gap-2 hover:bg-white transition-colors">
            <Plus size={20} /> Nova Categoria
          </Button>
        )}

        {isAdding && (
          <Card className="p-8 space-y-6 animate-in slide-in-from-top-4 border-white/20 shadow-2xl rounded-[40px] bg-slate-900/90 backdrop-blur-md">
            <h3 className="text-lg font-black italic text-white">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>

            {/* PREVIEW/UPLOAD */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-32 bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-500/50 overflow-hidden relative transition-all"
            >
              {imageFile ? <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" /> :
                form.image ? <img src={form.image} className="w-full h-full object-cover opacity-50" /> : <ImageIcon className="text-slate-500" size={32} />}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }} />
            </div>

            <Input placeholder="Nome (Ex: Manutenção ou Piscina)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-14 bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-brand-500" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Tipo</label>
                <select value={form.type} disabled={!!form.parent_id} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full h-14 bg-white/5 rounded-3xl px-4 font-bold border border-white/10 text-xs text-white outline-none focus:border-brand-500">
                  <option value="product" className="bg-slate-900 text-white">Produto</option>
                  <option value="service" className="bg-slate-900 text-white">Serviço</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Categoria Pai (Opcional)</label>
                <select value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })} className="w-full h-14 bg-white/5 rounded-3xl px-4 font-bold border border-white/10 text-xs text-white outline-none focus:border-brand-500">
                  <option value="" className="bg-slate-900 text-white">Nenhuma (Raiz)</option>
                  {parentCategories.map(p => <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.name} ({p.type === 'service' ? 'Serviço' : 'Produto'})</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button fullWidth variant="secondary" onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-white/5 hover:bg-white/10 text-white border-white/5">Cancelar</Button>
              <Button fullWidth onClick={handleSave} disabled={uploading} className="bg-brand-600 hover:bg-brand-700 text-[10px] uppercase font-black text-white">{uploading ? '...' : (editingId ? 'Atualizar' : 'Salvar')}</Button>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          {parentCategories.map(parent => (
            <div key={parent.id} className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-sm relative group overflow-hidden backdrop-blur-sm">
              {/* PARENT HEADER */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl overflow-hidden cursor-pointer border border-white/5" onClick={() => handleEdit(parent)}>
                  <img src={parent.image_url || `https://ui-avatars.com/api/?name=${parent.name}&background=random`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="cursor-pointer" onClick={() => handleEdit(parent)}>
                  <h4 className="font-black text-white text-xl italic">{parent.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{parent.type === 'service' ? 'Serviços' : 'Marketplace'}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button onClick={() => handleEdit(parent)} className="w-10 h-10 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center active:scale-95 hover:bg-white/10 hover:text-white transition-all border border-white/5"><Settings size={18} /></button>
                  <button onClick={() => handleDelete(parent.id)} className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center active:scale-95 hover:bg-rose-500/20 transition-all border border-rose-500/10"><Trash2 size={18} /></button>
                </div>
              </div>

              {/* SUB CATEGORIES CHIPS */}
              <div className="flex flex-wrap gap-2">
                {getChildren(parent.id).map(child => (
                  <div key={child.id} className="pl-3 pr-2 py-1.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 group/child hover:bg-white/10 transition-colors">
                    <span className="text-xs font-bold text-slate-300 cursor-pointer hover:text-brand-400 transition-colors" onClick={() => handleEdit(child)}>{child.name}</span>
                    <button onClick={() => handleEdit(child)} className="w-5 h-5 bg-white/10 text-slate-400 rounded-full flex items-center justify-center opacity-0 group-hover/child:opacity-100 transition-opacity hover:bg-brand-500 hover:text-white"><Settings size={10} /></button>
                    <button onClick={() => handleDelete(child.id)} className="w-5 h-5 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center opacity-50 group-hover/child:opacity-100 hover:bg-rose-500 hover:text-white transition-all"><X size={12} strokeWidth={3} /></button>
                  </div>
                ))}
                <button onClick={() => { setIsAdding(true); setEditingId(null); setForm({ name: '', image: '', type: parent.type, parent_id: parent.id }); }} className="px-4 py-1.5 bg-brand-500/10 text-brand-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 active:scale-95 border border-brand-500/20 hover:bg-brand-500/20 transition-colors">
                  <Plus size={12} /> Add Sub
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- PERFIL DO ADMIN ---
export const AdminProfile: React.FC<{
  currentUser: any;
  onLogout: () => void;
}> = ({ currentUser, onLogout }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
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
    <div className="min-h-screen bg-slate-50 pb-32">
      <AdminHeader title="Meu Perfil" />

      <div className="p-8">
        <div className="bg-white/5 p-8 rounded-[40px] shadow-sm border border-white/10 mb-6 flex flex-col items-center backdrop-blur-sm">
          <div
            className="w-32 h-32 rounded-[40px] border-4 border-white/10 shadow-xl overflow-hidden mb-4 relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
            {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="text-brand-400 font-bold text-xs uppercase bg-brand-500/10 px-4 py-2 rounded-lg active:scale-95 transition-transform hover:bg-brand-500/20" disabled={uploading}>
            {uploading ? 'Enviando...' : 'Alterar Foto'}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
        </div>

        <div className="bg-white/5 p-8 rounded-[40px] shadow-sm border border-white/10 space-y-4 mb-8 backdrop-blur-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome</label>
            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-14 font-medium bg-white/5 border-white/10 text-white focus:border-brand-500" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Telefone</label>
            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="h-14 font-medium bg-white/5 border-white/10 text-white focus:border-brand-500" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email</label>
            <Input value={currentUser?.email} readOnly className="h-14 font-medium bg-white/5 text-slate-500 border-white/5" />
          </div>
        </div>

        <div className="space-y-4">
          <Button fullWidth onClick={handleSave} disabled={loading} className="h-16 bg-white text-slate-950 font-black uppercase text-xs tracking-widest rounded-[24px] hover:bg-slate-200">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              if (window.confirm('Sair do Admin?')) {
                await onLogout();
                localStorage.removeItem('userRole_cache');
                window.location.href = '/';
              }
            }}
            className="w-full border-rose-500/20 text-rose-500 h-16 bg-rose-500/10 rounded-[24px] hover:bg-rose-500/20"
          >
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- GESTÃO DE BANNERS (CARROSSEL) ---
export const AdminBanners: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [banners, setBanners] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', link: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    const { data } = await supabase.from('banners').select('*').order('display_order', { ascending: true });
    if (data) setBanners(data);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este banner?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (!error) loadBanners();
    else alert('Erro: ' + error.message);
  };

  const handleSave = async () => {
    if (!imageFile) return alert('Selecione uma imagem');
    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to 'banners' bucket or 'public/banners' as fallback
      const { error: uploadError } = await supabase.storage.from('banners').upload(filePath, imageFile);
      let publicUrl = '';

      if (uploadError) {
        // Fallback to public bucket if banners bucket doesn't exist
        const { error: retryError } = await supabase.storage.from('public').upload(`banners/${filePath}`, imageFile);
        if (retryError) throw retryError;
        const { data } = supabase.storage.from('public').getPublicUrl(`banners/${filePath}`);
        publicUrl = data.publicUrl;
      } else {
        const { data } = supabase.storage.from('banners').getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      }

      const { error: dbError } = await supabase.from('banners').insert([{
        image_url: publicUrl,
        title: form.title,
        link_url: form.link,
        active: true
      }]);

      if (dbError) throw dbError;

      alert('Banner adicionado com sucesso!');
      setIsAdding(false);
      setForm({ title: '', link: '' });
      setImageFile(null);
      loadBanners();

    } catch (error: any) {
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <AdminHeader title="BANNERS APP" onBack={onBack} />
      <div className="p-6 space-y-6">

        {!isAdding && (
          <Button fullWidth onClick={() => setIsAdding(true)} className="h-16 rounded-[24px] bg-slate-100 text-slate-950 flex items-center gap-2 hover:bg-white transition-colors">
            <Plus size={20} /> Novo Banner
          </Button>
        )}

        {isAdding && (
          <Card className="p-8 space-y-6 animate-in slide-in-from-top-4 border-white/20 shadow-2xl rounded-[40px] bg-slate-900/95 backdrop-blur-md">
            <h3 className="text-lg font-black italic text-white">Novo Banner</h3>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-40 bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-500/50 overflow-hidden relative transition-all"
            >
              {imageFile ? <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" /> : <div className="text-center"><ImageIcon className="mx-auto text-slate-500 mb-2" size={32} /><p className="text-[10px] font-bold text-slate-400 uppercase">Clique para upload</p></div>}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }} />
            </div>

            <Input placeholder="Título (Opcional)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="h-14 bg-white/5 border-white/10 text-white focus:border-brand-500" />
            <Input placeholder="Link (Opcional)" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="h-14 bg-white/5 border-white/10 text-white focus:border-brand-500" />

            <div className="flex gap-3">
              <Button fullWidth variant="secondary" onClick={() => setIsAdding(false)} className="bg-white/5 border-white/5 text-white hover:bg-white/10">Cancelar</Button>
              <Button fullWidth onClick={handleSave} disabled={uploading} className="bg-brand-600 hover:bg-brand-700 text-[10px] uppercase font-black text-white">{uploading ? 'Enviando...' : 'Salvar'}</Button>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="font-bold text-white uppercase text-xs tracking-widest ml-2">Banners Ativos</h3>
          {banners.length === 0 && <p className="text-slate-500 text-xs font-bold italic text-center py-8">Nenhum banner cadastrado.</p>}
          {banners.map(banner => (
            <div key={banner.id} className="bg-white/5 p-4 rounded-[32px] border border-white/10 shadow-sm relative group overflow-hidden backdrop-blur-sm">
              <div className="h-32 rounded-2xl overflow-hidden mb-3 relative">
                <img src={banner.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <h4 className="text-white font-bold italic">{banner.title}</h4>
                </div>
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] uppercase font-black text-emerald-400">{banner.active ? 'Ativo' : 'Inativo'}</span>
                <button onClick={() => handleDelete(banner.id)} className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center active:scale-95 hover:bg-rose-500/20 transition-colors border border-rose-500/10">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MURAL DE AVISOS (NOTICES) ---
export const AdminNotices: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [notices, setNotices] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', isUrgent: false, targetRole: 'all' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadNotices(); }, []);

  const loadNotices = async () => {
    // Fetch global notices or notices created by admin
    const { data } = await supabase
      .from('sent_notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setNotices(data);
  };

  const handleSend = async () => {
    if (!form.title || !form.body) return alert('Preencha título e mensagem');
    setLoading(true);

    const { error } = await supabase.from('sent_notifications').insert([{
      title: form.title,
      body: form.body,
      target_role: form.targetRole, // Uses selected role
      target_user_id: null,
      condominium_id: null
    }]);

    setLoading(false);

    if (error) {
      alert('Erro: ' + error.message);
    } else {
      // TRIGGER BROADCAST PUSH
      supabase.functions.invoke('push', {
        body: {
          title: form.title,
          body: form.body,
          target_role: form.targetRole, // all, resident, professional
          icon: '/icon.png'
        }
      }).catch(err => console.error('Broadcast Error:', err));

      alert('Aviso publicado e notificações enviadas!');
      setIsAdding(false);
      setForm({ title: '', body: '', isUrgent: false, targetRole: 'all' });
      loadNotices();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este aviso?')) return;
    const { error } = await supabase.from('sent_notifications').delete().eq('id', id);
    if (!error) loadNotices();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <AdminHeader title="Mural de Avisos" onBack={onBack} />
      <div className="p-6 space-y-6">

        {!isAdding && (
          <Button fullWidth onClick={() => setIsAdding(true)} className="h-16 rounded-[24px] bg-slate-100 text-slate-950 flex items-center gap-2 hover:bg-white transition-colors">
            <Plus size={20} /> Novo Comunicado
          </Button>
        )}

        {isAdding && (
          <Card className="p-8 space-y-4 animate-in slide-in-from-top-4 border-white/20 shadow-2xl rounded-[40px] bg-slate-900/95 backdrop-blur-md">
            <h3 className="text-lg font-black italic text-white">Novo Comunicado Geral</h3>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Destinatários</label>
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'resident', label: 'Moradores' },
                  { id: 'professional', label: 'Prestadores' }
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setForm({ ...form, targetRole: role.id })}
                    className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-2 ${form.targetRole === role.id
                      ? 'bg-slate-100 text-slate-950 border-slate-100'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'
                      }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              placeholder="Título do Aviso"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="h-14 bg-white/5 border-transparent focus:bg-white/10 text-white placeholder-slate-500"
            />
            <textarea
              placeholder="Digite a mensagem..."
              className="w-full h-32 bg-white/5 border-none rounded-3xl p-5 text-sm resize-none outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-white placeholder-slate-500 focus:bg-white/10"
              value={form.body}
              onChange={e => setForm({ ...form, body: e.target.value })}
            />
            <div className="flex gap-3 pt-2">
              <Button fullWidth variant="secondary" onClick={() => setIsAdding(false)} className="bg-white/5 border-white/5 text-white hover:bg-white/10">Cancelar</Button>
              <Button fullWidth onClick={handleSend} disabled={loading} className="bg-brand-600 hover:bg-brand-700 text-white font-black uppercase text-xs tracking-widest">
                {loading ? 'Enviando...' : 'Publicar'}
              </Button>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest ml-2">Histórico de Avisos</h3>
          {notices.length === 0 && <p className="text-slate-500 text-xs font-bold italic text-center py-8">Nenhum aviso publicado.</p>}

          {notices.map(notice => (
            <div key={notice.id} className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-sm relative group backdrop-blur-sm">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-black italic text-white">{notice.title}</h4>
                <button onClick={() => handleDelete(notice.id)} className="text-slate-500 hover:text-rose-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-slate-400 font-medium text-sm leading-relaxed mb-4">{notice.body}</p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                <Clock size={12} />
                {new Date(notice.created_at).toLocaleDateString('pt-BR')} às {new Date(notice.created_at).toLocaleTimeString('pt-BR').slice(0, 5)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- FINANCEIRO (PLACEHOLDER) ---
export const AdminFinance: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <AdminHeader title="Financeiro" onBack={onBack} />
      <div className="p-10 flex flex-col items-center justify-center text-center space-y-6 opacity-60">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
          <Wallet className="text-slate-500" size={48} />
        </div>
        <h3 className="text-2xl font-black italic text-white">Em Breve</h3>
        <p className="text-slate-400 font-medium max-w-xs mx-auto">
          O módulo financeiro administrativo está sendo preparado com relatórios avançados e gestão de cobranças.
        </p>
      </div>
    </div>
  );
};

