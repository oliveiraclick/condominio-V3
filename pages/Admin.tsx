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
  Briefcase, Share2, X, PartyPopper, Save, Building2, UserCog, Flame, Dumbbell, LogOut
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';

export const AdminNavigation: React.FC<{ activeTab: string; onChange: (tab: string) => void }> = ({ activeTab, onChange }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center z-40 max-w-md mx-auto">
    {[
      { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: 'Início' },
      { id: 'residents', icon: <Users size={24} />, label: 'Moradores' },
      { id: 'messages', icon: <MessageSquare size={24} />, label: 'Chat' },
      { id: 'system-users', icon: <Lock size={24} />, label: 'Acessos' },
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => onChange(item.id)}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-violet-600 scale-110' : 'text-slate-300'}`}
      >
        {item.icon}
        <span className="text-[10px] font-bold uppercase">{item.label}</span>
      </button>
    ))}
  </div>
);

const AdminHeader: React.FC<{ title: string; onBack?: () => void; rightElement?: React.ReactNode }> = ({ title, onBack, rightElement }) => (
  <header className="p-6 pt-12 bg-white border-b border-slate-50 flex items-center justify-between sticky top-0 z-50 shadow-sm">
    <div className="flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900">
          <ArrowLeft size={20} />
        </button>
      )}
      <h2 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter">{title}</h2>
    </div>
    {rightElement}
  </header>
);

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

// --- DASHBOARD ADMIN REDESIGNED ---
export const AdminDashboard: React.FC<{ onNavigate: (t: string) => void, onLogout: () => void }> = ({ onNavigate, onLogout }) => {
  const stats = [
    { label: 'Moradores', value: '142', icon: <Users size={16} />, color: 'bg-blue-500' },
    { label: 'Reservas Hoje', value: '3', icon: <CalendarDays size={16} />, color: 'bg-emerald-500' },
    { label: 'Pendências', value: '8', icon: <AlertCircle size={16} />, color: 'bg-amber-500' },
  ];

  const operationalGroups = [
    {
      title: 'Operações Diárias',
      items: [
        { id: 'access', icon: <Key size={24} />, label: 'Portaria & Acessos', desc: 'Controle de visitantes', target: 'admin-access', color: 'text-violet-600', bg: 'bg-violet-50' },
        { id: 'packages', icon: <Package size={24} />, label: 'Encomendas', desc: 'Gestão de recebidos', target: 'admin-packages', color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'reserves', icon: <CalendarDays size={24} />, label: 'Reservas', desc: 'Áreas comuns', target: 'admin-reservations', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      ]
    },
    {
      title: 'Gestão & Comunidade',
      items: [
        { id: 'residents', icon: <Users size={24} />, label: 'Moradores', desc: 'Base de condôminos', target: 'admin-residents', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'finance', icon: <Wallet size={24} />, label: 'Financeiro', desc: 'Cobranças e taxas', target: 'admin-finance', color: 'text-slate-600', bg: 'bg-slate-50' },
        { id: 'notices', icon: <Megaphone size={24} />, label: 'Mural de Avisos', desc: 'Comunicados gerais', target: 'admin-notices', color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'banners', icon: <ImageIcon size={24} />, label: 'Banners App', desc: 'Carrossel Home', target: 'admin-banners', color: 'text-violet-600', bg: 'bg-violet-50' },
        { id: 'categories', icon: <Layers size={24} />, label: 'Categorias', desc: 'Serviços e áreas', target: 'admin-categories', color: 'text-pink-600', bg: 'bg-pink-50' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 font-sans">
      {/* Hero Section */}
      <div className="bg-white pt-12 pb-8 px-8 rounded-b-[40px] shadow-sm mb-8 relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black italic text-slate-900 tracking-tighter">Painel Admin</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Gestão Completa do Condomínio</p>
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Building2 className="text-slate-400" size={24} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</span>
              </div>
              <p className="text-xl font-black text-slate-900">{stat.value}</p>
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
                  className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-50 flex flex-col gap-3 group active:scale-95 transition-all hover:border-violet-100 hover:shadow-md text-left relative overflow-hidden"
                >
                  <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{item.label}</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{item.desc}</p>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* System & Logout */}
        <div className="space-y-4 pt-4 border-t border-slate-200/50">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('profile')}
              className="bg-slate-900 p-5 rounded-[24px] shadow-lg flex items-center gap-4 group active:scale-95 transition-all"
            >
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white">
                <UserCircle2 size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-black text-white text-sm">Meu Perfil</h4>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest">Configurações</p>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="bg-rose-50 p-5 rounded-[24px] border border-rose-100 flex items-center gap-4 group active:scale-95 transition-all hover:bg-rose-500"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm">
                <LogOut size={20} />
              </div>
              <div className="text-left group-hover:text-white">
                <h4 className="font-black text-rose-950 text-sm group-hover:text-white">Sair</h4>
                <p className="text-[9px] text-rose-400 uppercase tracking-widest group-hover:text-rose-100">Encerrar</p>
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
  const [form, setForm] = useState({ name: '', desc: '', price: '', hours: '', inventory: '', photo: '', category: 'Gourmet' });
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
      setForm({ name: '', desc: '', price: '', hours: '', inventory: '', photo: '', category: 'Gourmet' });
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
      category: area.category || 'Gourmet'
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
    <div key={area.id} onClick={() => startEdit(area)} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center justify-between shadow-sm group cursor-pointer hover:border-violet-200 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden relative">
          {area.photos?.[0] ? <img src={area.photos[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>}
        </div>
        <div>
          <h5 className="font-black text-slate-900 italic leading-none">{area.name}</h5>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest truncate max-w-[200px]">{area.hours} • R$ {area.price}</p>
          <p className="text-[9px] text-slate-300 truncate max-w-[200px] mt-0.5">{area.inventory}</p>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); handleDelete(area.id); }} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 hover:bg-rose-100">
        <Trash2 size={18} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center px-2">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configuração de Espaços</h4>
        <button onClick={() => { setIsAdding(true); setEditingId(null); setForm({ name: '', desc: '', price: '', hours: '', inventory: '', photo: '', category: 'Gourmet' }); }} className="text-[10px] font-black text-violet-600 uppercase bg-violet-50 px-4 py-2 rounded-xl active:scale-95 transition-all flex items-center gap-1">
          <Plus size={14} /> Novo Espaço
        </button>
      </div>

      {isAdding && (
        <Card className="p-8 space-y-4 border-2 border-dashed border-violet-200 bg-violet-50/30 rounded-[40px] animate-in slide-in-from-top-4">
          <h3 className="text-lg font-black italic text-slate-900">{editingId ? 'Editar Espaço' : 'Novo Espaço'}</h3>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-40 bg-white/50 rounded-3xl border-2 border-dashed border-violet-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white hover:border-violet-500 transition-all overflow-hidden relative"
          >
            {imageFile ? (
              <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" />
            ) : form.photo ? (
              <img src={form.photo} className="w-full h-full object-cover opacity-50" />
            ) : (
              <>
                <Camera className="text-violet-400" size={32} />
                <span className="text-[10px] font-bold text-violet-400 uppercase">Toque para adicionar foto</span>
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

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-900 uppercase">Categoria</label>
            <select
              className="w-full h-14 bg-white rounded-2xl px-4 font-bold text-slate-700 outline-none border border-violet-100"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              <option value="Gourmet">Gourmet & Festas</option>
              <option value="Esportes">Esportes & Lazer</option>
            </select>
          </div>

          <Input placeholder="Nome da Área (Ex: Salão de Festas)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-14" />
          <Input placeholder="URL da Foto (Opcional se enviou arquivo)" value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} className="h-14" />
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Preço (R$ 0,00)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="h-14" />
            <Input placeholder="Horário (Ex: 08h - 22h)" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} className="h-14" />
          </div>
          <Input placeholder="Inventário (Ex: 50 cadeiras, 1 freezer)" value={form.inventory} onChange={e => setForm({ ...form, inventory: e.target.value })} className="h-14" />
          <Input placeholder="Descrição / Regras" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} className="h-14" />

          <div className="flex gap-3 pt-2">
            <Button fullWidth variant="secondary" onClick={() => setIsAdding(false)}>Cancelar</Button>
            <Button fullWidth onClick={handleSave} disabled={uploading} className="bg-slate-950">
              {uploading ? 'Enviando...' : 'Salvar'}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-8">
        {gourmetAreas.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 italic text-lg flex items-center gap-2"><PartyPopper size={20} className="text-violet-500" /> Gourmet & Festas</h3>
            {gourmetAreas.map(renderAreaCard)}
          </div>
        )}

        {sportsAreas.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 italic text-lg flex items-center gap-2"><Dumbbell size={20} className="text-emerald-500" /> Esportes & Lazer</h3>
            {sportsAreas.map(renderAreaCard)}
          </div>
        )}

        {gourmetAreas.length === 0 && sportsAreas.length === 0 && (
          <div className="text-center py-10 text-slate-400 font-bold italic">Nenhuma área cadastrada.</div>
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

  const handleCancel = (id: number, resDate: string) => {
    if (window.confirm('Confirmar cancelamento desta reserva no sistema?')) {
      setReservations(reservations.filter(r => r.id !== id));
      alert('Reserva removida com sucesso.');
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
              <button onClick={() => setView('check')} className="text-[10px] font-black text-violet-600 uppercase tracking-widest bg-violet-50 px-3 py-2 rounded-xl active:scale-95 transition-all border border-violet-100">
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
                <button onClick={() => setSelectedCategory('Gourmet')} className="h-40 bg-white rounded-[32px] border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:border-violet-500 hover:bg-violet-50 transition-all active:scale-95">
                  <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center">
                    <PartyPopper size={32} />
                  </div>
                  <span className="font-black text-slate-700 uppercase tracking-widest text-xs">Gourmet & Festas</span>
                </button>
                <button onClick={() => setSelectedCategory('Esportes')} className="h-40 bg-white rounded-[32px] border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all active:scale-95">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <Dumbbell size={32} />
                  </div>
                  <span className="font-black text-slate-700 uppercase tracking-widest text-xs">Esportes & Lazer</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setSelectedCategory(null)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <h3 className="text-lg font-black italic text-slate-900">{selectedCategory}</h3>
                </div>

                {/* Date Picker */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Selecione uma Data</label>
                  <input
                    type="date"
                    className="w-full h-14 bg-slate-50 rounded-2xl px-4 font-bold text-slate-900 outline-none border border-slate-200"
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
                        <div key={area.id} className={`p-4 rounded-2xl border flex items-center justify-between ${reservation ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/50">
                              {area.photos?.[0] ? <img src={area.photos[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="text-slate-300" /></div>}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{area.name}</p>
                              {reservation && <p className="text-[10px] font-bold text-rose-500 uppercase">Reservado: {reservation.resident} (Casa {reservation.unit})</p>}
                              {!reservation && <p className="text-[10px] font-bold text-emerald-600 uppercase">Disponível</p>}
                            </div>
                          </div>
                          {reservation ? <X size={20} className="text-rose-400" /> : <CheckCheck size={20} className="text-emerald-500" />}
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
            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-900/20">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-4">Status do Condomínio</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-black italic tracking-tighter">{reservations.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-1">Reservas Ativas</p>
                </div>
                <CalendarDays className="text-violet-500 opacity-20" size={64} />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Agenda Confirmada</h4>
              {reservations.length > 0 ? reservations.map((r) => (
                <Card key={r.id} className="p-8 border-none shadow-2xl shadow-slate-200/50 rounded-[48px] space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-[24px] flex items-center justify-center shadow-sm">
                        <PartyPopper size={32} />
                      </div>
                      <div>
                        <h5 className="text-xl font-black text-slate-950 italic tracking-tight">{r.area}</h5>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          Morador: <span className="text-slate-900">{r.resident}</span>
                        </p>
                        <p className="text-[9px] font-black text-violet-500 uppercase tracking-widest leading-none mt-1">Casa {r.unit}</p>
                      </div>
                    </div>
                    <Badge color="bg-emerald-50 text-emerald-600">ATIVO</Badge>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-3xl flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Agendada</p>
                      <p className="font-black text-slate-900 italic text-lg">{new Date(r.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Clock className="text-slate-200" size={32} />
                  </div>

                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => handleCancel(r.id, r.date)}
                    className="py-5 border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl active:scale-95 transition-all"
                  >
                    Remover Reserva
                  </Button>
                </Card>
              )) : (
                <div className="py-24 text-center">
                  <CalendarDays className="mx-auto text-slate-100 mb-6" size={80} />
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
            <div key={res.id} className="bg-white p-6 rounded-[32px] border flex items-center justify-between shadow-sm hover:border-violet-200 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
                  {res.avatar ? <img src={res.avatar} className="w-full h-full object-cover" /> : <span className="font-black text-slate-300">{res.name?.[0]}</span>}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 italic">{res.name}</h4>
                  <p className="text-[10px] font-bold text-violet-500 uppercase">Casa {res.unit || '---'} • Rua {res.tower || ''}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-200 group-hover:text-violet-400 transition-colors" />
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
                <div><h4 className="text-sm font-black text-slate-900 italic">{res.name}</h4><p className="text-[9px] font-black text-violet-500 uppercase tracking-widest">Unidade {res.unit}</p></div>
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

export const AdminPackages: React.FC<{ onBack: () => void; packages?: any[]; setPackages?: any }> = ({ onBack }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResident, setScannedResident] = useState<any>(null);
  const [pendingDeliveryList, setPendingDeliveryList] = useState<any[]>([]);

  const [formData, setFormData] = useState({ photo: '', desc: '' });
  const [pkgList, setPkgList] = useState<any[]>([]);
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [residentsList, setResidentsList] = useState<any[]>([]);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  // Fetch initial packages and residents
  useEffect(() => {
    fetchPackages();
    fetchResidents();
  }, []);

  const fetchPackages = async () => {
    const { data } = await supabase.from('packages').select('*, profiles:resident_id(name, unit, tower)').order('created_at', { ascending: false });
    if (data) setPkgList(data);
  };

  const fetchResidents = async () => {
    const { data } = await supabase.from('profiles').select('id, name, unit, tower').eq('role', 'resident');
    if (data) setResidentsList(data);
  };

  const handleRegister = async () => {
    if (!selectedResident) return;

    // Simplified Registration for Reverse Flow
    const payload = {
      resident_id: selectedResident.id,
      unit: selectedResident.unit,
      resident_name: selectedResident.name,
      description: formData.desc || 'Encomenda Recebida',
      photo_url: formData.photo || 'https://placehold.co/600x400/png?text=Pacote',
      qr_code: `PKG-${Date.now()}`, // Internal ID only
      status: 'pending'
    };

    const { error } = await supabase.from('packages').insert([payload]);

    if (!error) {
      await supabase.from('sent_notifications').insert([{
        title: 'Nova Encomenda!',
        body: `Uma nova encomenda chegou! Apresente seu QR Code na portaria para retirar.`,
        target_role: 'resident',
        condominium_id: selectedResident.condominium_id || null
      }]);

      alert('Encomenda registrada com sucesso!');
      fetchPackages();
      closeRegistration();
    } else {
      alert('Erro ao registrar: ' + error.message);
    }
  };

  const closeRegistration = () => {
    setIsRegistering(false);
    setGeneratedQR(null);
    setFormData({ photo: '', desc: '' });
    setSelectedResident(null);
    setSearchTerm('');
  };

  const handleScan = async (text: string) => {
    if (text && text.startsWith('RESIDENT:')) {
      const residentId = text.split(':')[1];
      setIsScanning(false);

      // Find resident
      const resident = residentsList.find(r => r.id === residentId);

      if (!resident) {
        alert('Morador não encontrado!');
        return;
      }

      // Check for authorizations (Neighbor Pickup)
      const { data: auths } = await supabase
        .from('package_authorizations')
        .select('grantor_id, grantor:grantor_id(unit, tower, name)')
        .eq('grantee_id', resident.id)
        .eq('status', 'active');

      // Map authorized IDs and Units
      const authorizedGrantorIds = auths?.map((a: any) => a.grantor_id) || [];
      const authorizedUnits = auths?.map((a: any) => ({ unit: a.grantor.unit, tower: a.grantor.tower })) || [];

      const allRelevantIds = [resident.id, ...authorizedGrantorIds];

      // Find pending packages for OWN ID OR AUTHORIZED IDs (Robust matching)
      const pending = pkgList.filter(p => allRelevantIds.includes(p.resident_id) && p.status === 'pending');

      if (pending.length > 0) {
        setScannedResident({ ...resident, authorizedUnits }); // Store auth info for display
        setPendingDeliveryList(pending);
      } else {
        alert(`Nenhuma encomenda encontrada para ${resident.name} (nem autorizações).`);
      }
    }
  };

  const confirmDelivery = async () => {
    if (!scannedResident || pendingDeliveryList.length === 0) return;

    const { error } = await supabase
      .from('packages')
      .update({
        status: 'delivered',
        picked_up_at: new Date().toISOString(),
        picked_up_by: scannedResident.id
      })
      .in('id', pendingDeliveryList.map(p => p.id));

    if (!error) {
      alert(`${pendingDeliveryList.length} encomendas entregues com sucesso!`);
      setScannedResident(null);
      setPendingDeliveryList([]);
      fetchPackages();
    } else {
      alert('Erro ao confirmar entrega: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <AdminHeader title="ENCOMENDAS" onBack={onBack} />
      <div className="p-6 space-y-6">

        <div className="flex gap-3">
          <Button fullWidth onClick={() => setIsRegistering(true)} className="h-16 rounded-[24px] bg-slate-950 flex items-center gap-2 shadow-xl shadow-slate-900/20">
            <Plus size={20} /> Nova Encomenda
          </Button>
          <Button fullWidth onClick={() => setIsScanning(true)} className="h-16 rounded-[24px] bg-emerald-500 text-white flex items-center gap-2 shadow-xl shadow-emerald-500/20">
            <Scan size={20} /> Entregar
          </Button>
        </div>

        {/* SCANNER MODAL */}
        {isScanning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden relative">
              <Scanner onScan={(r) => r[0] && handleScan(r[0].rawValue)} />
              <button onClick={() => setIsScanning(false)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full text-white"><X size={24} /></button>
              <p className="text-center p-4 font-bold text-slate-500">Aponte para o QR Code do Morador</p>
            </div>
          </div>
        )}

        {/* CONFIRMATION MODAL */}
        {scannedResident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in bg-black/50">
            <Card className="w-full max-w-sm p-6 rounded-[32px] m-4 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Confirmar Entrega?</h3>
                <div className="text-sm text-slate-500 mt-2 text-left bg-slate-50 p-4 rounded-2xl">
                  <p className="mb-2 text-center">Entregar <strong className="text-slate-900">{pendingDeliveryList.length} volumes</strong> para:</p>

                  {/* OWN UNIT */}
                  {pendingDeliveryList.some(p => p.unit === scannedResident.unit) && (
                    <div className="mb-2">
                      <strong className="text-violet-600 block">Rua {scannedResident.tower} - {scannedResident.unit} (Própria)</strong>
                      <span className="text-xs text-slate-400">{pendingDeliveryList.filter(p => p.unit === scannedResident.unit).length} volume(s)</span>
                    </div>
                  )}

                  {/* AUTHORIZED UNITS */}
                  {scannedResident.authorizedUnits?.map((auth: any) => {
                    const count = pendingDeliveryList.filter(p => p.unit === auth.unit).length;
                    if (count === 0) return null;
                    return (
                      <div key={auth.unit} className="mb-2">
                        <strong className="text-amber-600 block">Rua {auth.tower} - {auth.unit} (Autorizado)</strong>
                        <span className="text-xs text-slate-400">{count} volume(s)</span>
                      </div>
                    );
                  })}

                  <div className="mt-4 pt-2 border-t border-slate-200 text-center">
                    <span className="text-xs text-slate-400">Retirado por: <strong>{scannedResident.name}</strong></span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button fullWidth onClick={() => setScannedResident(null)} className="bg-slate-100 text-slate-500">Cancelar</Button>
                <Button fullWidth onClick={confirmDelivery} className="bg-emerald-500 text-white">Confirmar</Button>
              </div>
            </Card>
          </div>
        )}

        {isRegistering && (
          <Card className="p-8 space-y-6 border-none shadow-2xl rounded-[40px] bg-white animate-in slide-in-from-top-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black italic text-slate-900">Registrar Encomenda</h3>
              <button onClick={closeRegistration} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X size={16} /></button>
            </div>

            <div className="relative">
              <Input
                placeholder="Buscar Morador (Nome ou Casa)..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setSelectedResident(null); }}
                className="h-14"
              />
              {searchTerm && !selectedResident && (
                <div className="absolute top-full left-0 right-0 bg-white border border-slate-100 shadow-xl rounded-2xl mt-2 max-h-48 overflow-y-auto z-50">
                  {residentsList.filter(r => (r.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (r.unit || '').includes(searchTerm)).map(r => (
                    <button key={r.id} onClick={() => { setSelectedResident(r); setSearchTerm(`${r.name} - ${r.unit}`); }} className="w-full px-6 py-4 hover:bg-violet-50 text-left border-b border-slate-50 last:border-none">
                      <span className="font-bold text-slate-900">{r.name}</span> <span className="text-slate-400 text-xs">({r.unit})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Input placeholder="Descrição (Ex: Caixa Amazon Grande)" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="h-14" />

            <Button fullWidth onClick={handleRegister} disabled={!selectedResident} className="bg-violet-600 h-14 font-black uppercase tracking-widest text-xs">
              Confirmar Recebimento
            </Button>
          </Card>
        )}

        <div className="space-y-4">
          <SectionHeader title="Pendentes de Retirada" />
          {pkgList.filter(p => p.status === 'pending').map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center gap-4 shadow-sm relative overflow-hidden">
              <div className="w-1.5 absolute left-0 top-0 bottom-0 bg-amber-400"></div>
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                <Package size={24} />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-slate-900 italic">Rua {p.profiles?.tower} - {p.unit}</h5>
                <p className="text-[10px] font-black text-slate-400 uppercase">{p.resident_name}</p>
                <p className="text-[10px] text-slate-400 mt-1">{p.description}</p>
              </div>
              <div onClick={() => setGeneratedQR(p.qr_code)} className="cursor-pointer">
                <QrCode size={24} className="text-slate-300 hover:text-slate-900 transition-colors" />
              </div>
            </div>
          ))}

          {pkgList.filter(p => p.status === 'pending').length === 0 && (
            <p className="text-center text-slate-300 font-bold italic py-8">Nenhuma encomenda pendente.</p>
          )}
        </div>

        <div className="space-y-4 pt-8 border-t border-slate-100">
          <SectionHeader title="Histórico de Entregas" />
          {pkgList.filter(p => p.status === 'delivered').map(p => (
            <div key={p.id} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 italic line-through decoration-slate-400">Casa {p.unit}</h5>
                <p className="text-[10px] font-black text-slate-400 uppercase">Retirado em {new Date(p.picked_up_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col pb-24">
      <AdminHeader title="Alex Ferreira" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === 'admin' ? 'ml-auto items-end' : 'items-start'}`}>
            <div className={`p-5 rounded-[28px] text-sm font-medium tracking-tight shadow-sm leading-relaxed ${msg.sender === 'admin' ? 'bg-[#050b18] text-white rounded-tr-none italic' : 'bg-white text-slate-800 border border-slate-50 rounded-tl-none'}`}>{msg.text}</div>
            <span className="text-[9px] font-black text-slate-300 uppercase px-2">{msg.time}</span>
          </div>
        ))}
      </div>
      <div className="p-6 bg-white border-t border-slate-50 flex items-center gap-3">
        <input placeholder="Resposta..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="flex-1 h-14 bg-slate-50 rounded-2xl px-6 font-bold italic" />
        <button onClick={() => { if (inputText) { setMessages([...messages, { id: Date.now(), sender: 'admin', text: inputText, time: 'Agora' }]); setInputText(''); } }} className="w-14 h-14 bg-[#050b18] text-white rounded-full flex items-center justify-center"><Send /></button>
      </div>
    </div>
  );
};

export const AdminNotices: React.FC<{ onBack: () => void; onAddNotification?: (n: any) => void }> = ({ onBack, onAddNotification }) => {
  const [form, setForm] = useState({ title: '', desc: '', type: 'AVISO' });

  const handleSend = () => {
    if (!form.title || !form.desc) return;
    if (onAddNotification) {
      onAddNotification({
        id: Date.now(),
        title: form.title,
        desc: form.desc,
        time: 'Agora',
        read: false
      });
      alert('Notificação enviada com sucesso!');
      setForm({ title: '', desc: '', type: 'AVISO' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <AdminHeader title="AVISOS MURAL" onBack={onBack} />
      <div className="p-6 space-y-8">
        <Card className="p-8 border-none shadow-xl rounded-[40px] bg-white space-y-6">
          <h3 className="text-lg font-black italic text-slate-900">Nova Notificação</h3>
          <Input placeholder="Título (ex: Encomenda na Portaria)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="h-14" />
          <textarea
            placeholder="Mensagem..."
            className="w-full h-32 bg-slate-50 border-none rounded-2xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
            value={form.desc}
            onChange={e => setForm({ ...form, desc: e.target.value })}
          />
          <Button fullWidth onClick={handleSend} className="bg-violet-600 h-14 rounded-[24px] uppercase tracking-widest font-black text-xs">Enviar Notificação</Button>
        </Card>
      </div>
    </div>
  );
};
export const AdminFinance: React.FC<{ onBack: () => void; invoices?: any[]; onAddInvoice?: (i: any) => void }> = ({ onBack, invoices = [], onAddInvoice }) => {
  const [form, setForm] = useState({ title: '', value: '', resident: 'Alex Ferreira', date: '' });

  const handleIssue = () => {
    if (!form.title || !form.value || !form.date) return;
    if (onAddInvoice) {
      onAddInvoice({
        id: Date.now().toString(),
        title: form.title,
        value: form.value,
        status: 'Pendente',
        dueDate: form.date,
        read: false,
        resident: form.resident
      });
      alert('Cobrança emitida com sucesso!');
      setForm({ title: '', value: '', resident: 'Alex Ferreira', date: '' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <AdminHeader title="FINANCEIRO" onBack={onBack} />
      <div className="p-6 space-y-8">
        <Card className="p-8 border-none shadow-xl rounded-[40px] bg-white space-y-6 animate-in slide-in-from-top-4">
          <h3 className="text-lg font-black italic text-slate-900">Nova Cobrança</h3>
          <Input placeholder="Título (ex: Mensalidade Nov/24)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="h-14" />
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Valor (R$)" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="h-14" />
            <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-14" />
          </div>
          <select value={form.resident} onChange={e => setForm({ ...form, resident: e.target.value })} className="w-full h-14 bg-slate-50 rounded-2xl px-4 font-bold text-slate-600 outline-none">
            <option>Alex Ferreira (Apt 402-B)</option>
            <option>Clara Mendes (Apt 105-B)</option>
          </select>
          <Button fullWidth onClick={handleIssue} className="bg-violet-600 h-14 rounded-[24px] uppercase tracking-widest font-black text-xs">Emitir Boleto</Button>
        </Card>

        <div className="space-y-4">
          <SectionHeader title="Cobranças Recentes" />
          {invoices.length === 0 ? <p className="text-center text-slate-300 font-bold italic py-4">Nenhuma cobrança registrada.</p> : invoices.map((inv) => (
            <div key={inv.id} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center justify-between shadow-sm">
              <div>
                <h5 className="font-bold text-slate-900 italic">{inv.title}</h5>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Vence em {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-slate-900">R$ {inv.value}</p>
                <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full inline-block mt-1 ${inv.status === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{inv.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export const AdminIncidents: React.FC<{ onBack: () => void; serviceRequests?: any[]; onUpdateRequest?: (id: number, status: string) => void }> = ({ onBack, serviceRequests = [], onUpdateRequest }) => {
  const [filter, setFilter] = useState('Todos');
  const filtered = filter === 'Todos' ? serviceRequests : serviceRequests.filter(req => req.status === filter);

  const stats = {
    open: serviceRequests.filter(r => r.status === 'Aberto').length,
    progress: serviceRequests.filter(r => r.status === 'Em Análise').length
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <AdminHeader title="OCORRÊNCIAS" onBack={onBack} />
      <div className="p-6 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100">
            <h4 className="text-4xl font-black text-rose-500 italic tracking-tighter">{stats.open}</h4>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Status Aberto</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100">
            <h4 className="text-4xl font-black text-blue-500 italic tracking-tighter">{stats.progress}</h4>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Em Análise</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['Todos', 'Aberto', 'Em Análise', 'Concluído'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-6 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${filter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? <p className="text-center text-slate-300 font-bold italic py-8">Nenhum chamado encontrado.</p> : filtered.map((req) => (
            <Card key={req.id} className="p-6 border-none shadow-lg rounded-[32px] bg-white space-y-4 animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-lg italic uppercase">{req.resident.charAt(0)}</div>
                  <div><h5 className="font-bold text-slate-900 italic leading-none">{req.title}</h5><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Apt {req.unit}</p></div>
                </div>
                <Badge color={req.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>{req.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl">{req.description}</p>

              {req.status !== 'Concluído' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {req.status === 'Aberto' && (
                    <Button fullWidth onClick={() => onUpdateRequest && onUpdateRequest(req.id, 'Em Análise')} className="bg-blue-50 text-blue-600 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest">Analisar</Button>
                  )}
                  <Button fullWidth onClick={() => onUpdateRequest && onUpdateRequest(req.id, 'Concluído')} className="bg-emerald-50 text-emerald-600 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest col-span-2">Concluir</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
export const AdminGarage: React.FC<{ onBack: () => void }> = ({ onBack }) => <div className="min-h-screen bg-[#fcfcfd]"><AdminHeader title="GARAGEM" onBack={onBack} /><div className="p-8 text-center text-slate-400 text-xs font-black uppercase tracking-widest py-32">Mapa de vagas em manutenção.</div></div>;

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
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <AdminHeader title="CATEGORIAS" onBack={onBack} />
      <div className="p-6 space-y-6">
        {!isAdding && (
          <Button fullWidth onClick={() => { setIsAdding(true); setEditingId(null); setForm({ name: '', image: '', type: 'product', parent_id: '' }); }} className="h-16 rounded-[24px] bg-slate-950 flex items-center gap-2">
            <Plus size={20} /> Nova Categoria
          </Button>
        )}

        {isAdding && (
          <Card className="p-8 space-y-6 animate-in slide-in-from-top-4 border-none shadow-2xl rounded-[40px]">
            <h3 className="text-lg font-black italic text-slate-900">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>

            {/* PREVIEW/UPLOAD */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-violet-400 overflow-hidden relative"
            >
              {imageFile ? <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" /> :
                form.image ? <img src={form.image} className="w-full h-full object-cover opacity-50" /> : <ImageIcon className="text-slate-300" size={32} />}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }} />
            </div>

            <Input placeholder="Nome (Ex: Manutenção ou Piscina)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-14" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Tipo</label>
                <select value={form.type} disabled={!!form.parent_id} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full h-14 bg-white rounded-3xl px-4 font-bold border border-slate-100 text-xs text-slate-700 outline-none">
                  <option value="product">Produto</option>
                  <option value="service">Serviço</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Categoria Pai (Opcional)</label>
                <select value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })} className="w-full h-14 bg-white rounded-3xl px-4 font-bold border border-slate-100 text-xs text-slate-600 outline-none">
                  <option value="">Nenhuma (Raiz)</option>
                  {parentCategories.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type === 'service' ? 'Serviço' : 'Produto'})</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button fullWidth variant="secondary" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancelar</Button>
              <Button fullWidth onClick={handleSave} disabled={uploading} className="bg-slate-950 text-[10px] uppercase font-black">{uploading ? '...' : (editingId ? 'Atualizar' : 'Salvar')}</Button>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          {parentCategories.map(parent => (
            <div key={parent.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative group overflow-hidden">
              {/* PARENT HEADER */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden cursor-pointer" onClick={() => handleEdit(parent)}>
                  <img src={parent.image_url || `https://ui-avatars.com/api/?name=${parent.name}&background=random`} className="w-full h-full object-cover" />
                </div>
                <div className="cursor-pointer" onClick={() => handleEdit(parent)}>
                  <h4 className="font-black text-slate-900 text-xl italic">{parent.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{parent.type === 'service' ? 'Serviços' : 'Marketplace'}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button onClick={() => handleEdit(parent)} className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center active:scale-95"><Settings size={18} /></button>
                  <button onClick={() => handleDelete(parent.id)} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center active:scale-95"><Trash2 size={18} /></button>
                </div>
              </div>

              {/* SUB CATEGORIES CHIPS */}
              <div className="flex flex-wrap gap-2">
                {getChildren(parent.id).map(child => (
                  <div key={child.id} className="pl-3 pr-2 py-1.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 group/child">
                    <span className="text-xs font-bold text-slate-600 cursor-pointer hover:text-violet-600" onClick={() => handleEdit(child)}>{child.name}</span>
                    <button onClick={() => handleEdit(child)} className="w-5 h-5 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center opacity-0 group-hover/child:opacity-100 transition-opacity"><Settings size={10} /></button>
                    <button onClick={() => handleDelete(child.id)} className="w-5 h-5 bg-rose-200 text-rose-600 rounded-full flex items-center justify-center opacity-50 group-hover/child:opacity-100"><X size={12} strokeWidth={3} /></button>
                  </div>
                ))}
                <button onClick={() => { setIsAdding(true); setEditingId(null); setForm({ name: '', image: '', type: parent.type, parent_id: parent.id }); }} className="px-4 py-1.5 bg-violet-50 text-violet-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 active:scale-95 border border-violet-100 hover:bg-violet-100 transition-colors">
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
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      <AdminHeader title="Meu Perfil" />

      <div className="p-8">
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome</label>
            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-14 font-medium" />
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
              if (window.confirm('Sair do Admin?')) {
                await onLogout();
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
    <div className="min-h-screen bg-[#fcfcfd] pb-32">
      <AdminHeader title="BANNERS APP" onBack={onBack} />
      <div className="p-6 space-y-6">

        {!isAdding && (
          <Button fullWidth onClick={() => setIsAdding(true)} className="h-16 rounded-[24px] bg-slate-950 flex items-center gap-2">
            <Plus size={20} /> Novo Banner
          </Button>
        )}

        {isAdding && (
          <Card className="p-8 space-y-6 animate-in slide-in-from-top-4 border-none shadow-2xl rounded-[40px]">
            <h3 className="text-lg font-black italic text-slate-900">Novo Banner</h3>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-40 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-violet-400 overflow-hidden relative"
            >
              {imageFile ? <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" /> : <div className="text-center"><ImageIcon className="mx-auto text-slate-300 mb-2" size={32} /><p className="text-[10px] font-bold text-slate-400 uppercase">Clique para upload</p></div>}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }} />
            </div>

            <Input placeholder="Título (Opcional)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="h-14" />
            <Input placeholder="Link (Opcional)" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="h-14" />

            <div className="flex gap-3">
              <Button fullWidth variant="secondary" onClick={() => setIsAdding(false)}>Cancelar</Button>
              <Button fullWidth onClick={handleSave} disabled={uploading} className="bg-slate-950 text-[10px] uppercase font-black">{uploading ? 'Enviando...' : 'Salvar'}</Button>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest ml-2">Banners Ativos</h3>
          {banners.length === 0 && <p className="text-slate-400 text-xs font-bold italic text-center py-8">Nenhum banner cadastrado.</p>}
          {banners.map(banner => (
            <div key={banner.id} className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm relative group overflow-hidden">
              <div className="h-32 rounded-2xl overflow-hidden mb-3 relative">
                <img src={banner.image_url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <h4 className="text-white font-bold italic">{banner.title}</h4>
                </div>
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] uppercase font-black text-slate-400">{banner.active ? 'Ativo' : 'Inativo'}</span>
                <button onClick={() => handleDelete(banner.id)} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center active:scale-95 hover:bg-rose-100 transition-colors">
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

