import React, { useState, useEffect } from 'react';
import { Users, Building, DollarSign, Activity, LayoutGrid, ShieldCheck, Plus, Search, ArrowLeft, Trash2, Bell, BookOpen, Star, Palette, X, Edit, Phone, MapPin, Grid, Layers, Menu, Briefcase, CheckCircle2, UserCheck, MessageCircle, Image as ImageIcon, Key, Lock, CircleAlert, FileText, ChevronDown, ChevronUp, Package, ShoppingBag, Zap, Calendar, User, Sparkles } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/ui';
import { supabase } from '../supabase';

// --- SHARED STYLES ---
const PAGE_CONTAINER = "p-6 space-y-6 pt-12 animate-in slide-in-from-right-8 pb-32";
const HEADER_TITLE = "text-3xl font-black italic text-slate-900 uppercase tracking-tighter";
const CARD_BASE = "bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all";
const GRADIENT_TEXT = "bg-gradient-to-r from-brand-600 to-fuchsia-600 bg-clip-text text-transparent";

// --- MESSAGE USER MODAL ---
const MessageUserModal: React.FC<{ isOpen: boolean; onClose: () => void; user: any }> = ({ isOpen, onClose, user }) => {
  const [form, setForm] = useState({ title: '', body: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleSend = async () => {
    if (!form.title || !form.body) return alert('Preencha título e mensagem');
    setLoading(true);

    const { error } = await supabase.from('sent_notifications').insert([{
      title: form.title,
      body: form.body,
      target_role: user.role, // Fallback/Reference
      target_user_id: user.id, // DIRECT TARGETING
      condominium_id: user.condominium_id
    }]);

    setLoading(false);

    if (error) {
      alert('Erro: ' + error.message);
    } else {
      alert(`Mensagem enviada para ${user.name}!`);
      onClose();
      setForm({ title: '', body: '' });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-black italic text-slate-900 tracking-tight">Nova Mensagem</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Para: {user.name}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Título"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="h-14 bg-slate-50 border-transparent focus:bg-white"
          />
          <textarea
            placeholder="Digite sua mensagem..."
            className="w-full h-32 bg-slate-50 border-none rounded-3xl p-5 text-sm resize-none outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-slate-700 focus:bg-white"
            value={form.body}
            onChange={e => setForm({ ...form, body: e.target.value })}
          />

          <Button fullWidth onClick={handleSend} disabled={loading} className="h-14 bg-slate-900 text-white uppercase font-black text-xs shadow-xl tracking-wider">
            {loading ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD VIEW ---
const DashboardView = () => {
  const [stats, setStats] = useState({ condos: 0, users: 0, mrr: 0 });
  const [recentCondos, setRecentCondos] = useState<any[]>([]);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const { count: condosCount } = await supabase.from('condominiums').select('*', { count: 'exact', head: true });
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data: recent } = await supabase.from('condominiums').select('*').order('created_at', { ascending: false }).limit(3);

    setStats({
      condos: condosCount || 0,
      users: usersCount || 0,
      mrr: (condosCount || 0) * 2000
    });
    if (recent) setRecentCondos(recent);
  };

  return (
    <div className={PAGE_CONTAINER}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className={HEADER_TITLE}>Visão <span className={GRADIENT_TEXT}>Geral</span></h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Super Admin Control</p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.reload();
          }}
          className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 active:scale-90 transition-all shadow-sm"
          title="Sair"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-900/20 col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700"><DollarSign size={120} /></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-500/30 rounded-full blur-3xl"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 relative z-10">MRR Mensal</p>
          <h3 className="text-5xl font-black italic tracking-tighter relative z-10">R$ {stats.mrr.toLocaleString('pt-BR')}</h3>
        </div>
        <div className={CARD_BASE}>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3"><Building size={20} /></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Condomínios</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.condos}</h3>
        </div>
        <div className={CARD_BASE}>
          <div className="w-10 h-10 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center mb-3"><Users size={20} /></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Usuários</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.users}</h3>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4 ml-2">Condomínios Recentes</h3>
        <div className="space-y-3">
          {recentCondos.map(c => (
            <div key={c.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-300 text-xl border border-slate-100">{c.name?.[0]}</div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{c.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- CONDOS VIEW ---
const CondosView = () => {
  const [condos, setCondos] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newCondo, setNewCondo] = useState({ name: '', address: '', plan: 'basic', type: 'vertical', status: 'active', primary_color: '#7c3aed', logo_url: '', symbol_url: '', symbol_opacity: 15 });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [symbolFile, setSymbolFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const symbolInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => { loadCondos(); }, []);

  const loadCondos = async () => {
    const { data } = await supabase.from('condominiums').select('*').order('created_at', { ascending: false });
    if (data) setCondos(data);
  }

  const handleSave = async () => {
    if (!newCondo.name) return;
    setUploading(true);
    let finalLogoUrl = newCondo.logo_url;

    // 1. Upload Logo if selected
    if (logoFile) {
      try {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Date.now()}_logo.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('condo_assets').upload(fileName, logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('condo_assets').getPublicUrl(fileName);
        finalLogoUrl = publicUrl;
      } catch (err: any) {
        alert('Erro no upload da logo: ' + err.message);
        setUploading(false);
        return;
      }
    }


    // 2. Upload Symbol if selected
    let finalSymbolUrl = newCondo.symbol_url;
    if (symbolFile) {
      try {
        const fileExt = symbolFile.name.split('.').pop();
        const fileName = `${Date.now()}_symbol.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('condo_assets').upload(fileName, symbolFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('condo_assets').getPublicUrl(fileName);
        finalSymbolUrl = publicUrl;
      } catch (err: any) {
        alert('Erro no upload do símbolo: ' + err.message);
        setUploading(false);
        return;
      }
    }

    const condoData = { ...newCondo, logo_url: finalLogoUrl, symbol_url: finalSymbolUrl };

    let error;
    if (editingId) {
      // UPDATE
      const { error: updateError } = await supabase.from('condominiums').update(condoData).eq('id', editingId);
      error = updateError;
    } else {
      // CREATE
      const { error: insertError } = await supabase.from('condominiums').insert([condoData]);
      error = insertError;
    }

    if (!error) {
      setShowNew(false);
      setEditingId(null);
      loadCondos();
      setNewCondo({ name: '', address: '', plan: 'basic', type: 'vertical', status: 'active', primary_color: '#7c3aed', logo_url: '', symbol_url: '', symbol_opacity: 15 });
      setLogoFile(null);
      setSymbolFile(null);
    } else {
      alert(error.message);
    }
    setUploading(false);
  };

  const handleEdit = (condo: any) => {
    setNewCondo({
      name: condo.name,
      address: condo.address,
      plan: condo.plan || 'basic',
      type: condo.type || 'vertical',
      status: condo.status || 'active',
      primary_color: condo.primary_color || '#7c3aed',
      logo_url: condo.logo_url || '',
      symbol_url: condo.symbol_url || '',
      symbol_opacity: condo.symbol_opacity || 15
    });
    setEditingId(condo.id);
    setShowNew(true);
    setLogoFile(null);
    setSymbolFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja EXCLUIR este condomínio?')) return;
    const { error } = await supabase.from('condominiums').delete().eq('id', id);
    if (!error) { loadCondos(); } else { alert('Erro: ' + error.message); }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const { error } = await supabase.from('condominiums').update({ status: newStatus }).eq('id', id);
    if (!error) loadCondos(); else alert('Erro: ' + error.message);
  };

  return (
    <div className={PAGE_CONTAINER}>
      <div className="flex justify-between items-end mb-6">
        <h1 className={HEADER_TITLE}>Condos</h1>
        <button onClick={() => { setShowNew(true); setEditingId(null); setNewCondo({ name: '', address: '', plan: 'basic', type: 'vertical', status: 'active', primary_color: '#7c3aed', logo_url: '' }); }} className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20 active:scale-90 transition-all"><Plus size={24} /></button>
      </div>

      {showNew && (
        <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 mb-8 ring-4 ring-slate-50">
          <h3 className="font-black italic text-slate-900 text-lg">{editingId ? 'Editar Condomínio' : 'Novo Condomínio'}</h3>

          {/* Logo Upload */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer relative hover:border-brand-500 transition-colors"
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              {logoFile ? (
                <img src={URL.createObjectURL(logoFile)} className="w-full h-full object-cover" />
              ) : newCondo.logo_url ? (
                <img src={newCondo.logo_url} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-slate-300" />
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 uppercase">Logo da Marca</p>
              <p className="text-[10px] text-slate-400">Clique para enviar (PNG/JPG)</p>
            </div>
          </div>

          {/* SYMBOL UPLOAD & OPACITY */}
          <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div
              onClick={() => symbolInputRef.current?.click()}
              className="w-20 h-20 bg-white rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 overflow-hidden relative shrink-0"
            >
              {symbolFile ? <img src={URL.createObjectURL(symbolFile)} className="w-full h-full object-contain p-2" /> :
                newCondo.symbol_url ? <img src={newCondo.symbol_url} className="w-full h-full object-contain p-2 bg-slate-900/10" /> : <div className="text-center p-2"><ImageIcon size={20} className="mx-auto text-slate-400" /><span className="text-[8px] font-bold text-slate-400 uppercase leading-none block mt-1">Símbolo</span></div>}
              <input type="file" ref={symbolInputRef} className="hidden" accept="image/*" onChange={e => { if (e.target.files?.[0]) setSymbolFile(e.target.files[0]); }} />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Opacidade do Símbolo</label>
                <span className="text-xs font-bold text-brand-600">{newCondo.symbol_opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={newCondo.symbol_opacity}
                onChange={(e) => setNewCondo({ ...newCondo, symbol_opacity: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="h-10 bg-brand-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                <span className="text-[10px] text-white font-bold opacity-50 z-10 uppercase tracking-widest">Preview Fundo</span>
                {(symbolFile || newCondo.symbol_url) && (
                  <img
                    src={symbolFile ? URL.createObjectURL(symbolFile) : newCondo.symbol_url}
                    className="absolute center h-16 w-16 object-contain"
                    style={{ opacity: newCondo.symbol_opacity / 100 }}
                  />
                )}
              </div>
            </div>
          </div>

          <Input placeholder="Nome do Condomínio" value={newCondo.name} onChange={e => setNewCondo({ ...newCondo, name: e.target.value })} />
          <Input placeholder="Endereço Completo" value={newCondo.address} onChange={e => setNewCondo({ ...newCondo, address: e.target.value })} />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Tipo</label>
              <select
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-slate-900 font-bold text-xs outline-none focus:border-brand-500"
                value={newCondo.type}
                onChange={e => setNewCondo({ ...newCondo, type: e.target.value })}
              >
                <option value="vertical">Prédio (Vertical)</option>
                <option value="horizontal">Casas (Horizontal)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Cor Principal</label>
              <div className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-2 flex items-center gap-2">
                <input
                  type="color"
                  value={newCondo.primary_color}
                  onChange={(e) => setNewCondo({ ...newCondo, primary_color: e.target.value })}
                  className="w-8 h-8 rounded-full border-none cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-600 uppercase">{newCondo.primary_color}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button fullWidth onClick={() => { setNewCondo({ ...newCondo, plan: 'pro' }); handleSave(); }} disabled={uploading} className="bg-brand-600 text-white shadow-lg shadow-brand-200">
              {uploading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Criar')}
            </Button>
            <Button fullWidth onClick={() => { setShowNew(false); setEditingId(null); }} variant="secondary">Cancelar</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {condos.map(c => (
          <div key={c.id} className={`p-5 rounded-[28px] border flex items-center justify-between transition-all ${c.status === 'blocked' ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 ${c.status === 'blocked' ? 'bg-slate-200 text-slate-400 border-transparent' : 'bg-white text-slate-400 border-slate-100'}`}
                style={{ borderColor: c.primary_color || 'transparent' }}
              >
                {c.logo_url ? <img src={c.logo_url} className="w-full h-full object-cover rounded-xl" /> : c.name?.[0]}
              </div>
              <div>
                <h4 className={`font-bold text-sm ${c.status === 'blocked' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{c.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{c.plan} • {c.type}</p>
                {c.primary_color && <div className="flex items-center gap-1 mt-1"><div className="w-2 h-2 rounded-full" style={{ background: c.primary_color }}></div><span className="text-[9px] text-slate-400">{c.primary_color}</span></div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(c)}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
                title="Editar"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleToggleStatus(c.id, c.status || 'active')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${c.status === 'blocked' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}
                title={c.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
              >
                {c.status === 'blocked' ? <CheckCircle2 size={18} /> : <X size={18} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- PROFESSIONALS VIEW (Prev. Subscriptions) ---
const ProfessionalsView = () => {
  const [pros, setPros] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editingPro, setEditingPro] = useState<any>(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => { loadPros(); loadCategories(); }, []);

  const loadPros = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'professional').order('created_at', { ascending: false });
    if (data) setPros(data);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const handleSavePro = async () => {
    if (!editingPro) return;
    const { error } = await supabase.from('profiles').update({
      category: editingPro.category,
      specialties: editingPro.specialties,
      phone: editingPro.phone
    }).eq('id', editingPro.id);

    if (error) alert('Erro: ' + error.message);
    else {
      setEditingPro(null);
      loadPros();
    }
  };

  const addTag = () => {
    if (!tagInput.trim() || !editingPro) return;
    const currentTags = editingPro.specialties || [];
    if (!currentTags.includes(tagInput.trim())) {
      setEditingPro({ ...editingPro, specialties: [...currentTags, tagInput.trim()] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    const currentTags = editingPro.specialties || [];
    setEditingPro({ ...editingPro, specialties: currentTags.filter((t: string) => t !== tag) });
  };

  return (
    <div className={PAGE_CONTAINER}>
      <h1 className={HEADER_TITLE}>Gestão de <span className="text-brand-600">Pros</span></h1>

      <div className="bg-gradient-to-br from-brand-600 to-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-brand-500/30 relative overflow-hidden mb-8">
        <div className="flex justify-between items-end relative z-10">
          <div>
            <p className="text-brand-200 font-bold uppercase tracking-widest text-xs mb-1">Profissionais Ativos</p>
            <h2 className="text-6xl font-black italic tracking-tighter">{pros.length}</h2>
          </div>
          <div className="text-right">
            <p className="text-brand-200 font-bold uppercase tracking-widest text-xs mb-1">Receita Estimada</p>
            <h3 className="text-2xl font-black">R$ {(pros.length * 29.90).toFixed(0)}</h3>
          </div>
        </div>
      </div>

      {editingPro && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingPro(null)}></div>
          <div className="bg-white w-full max-w-lg sm:rounded-[40px] rounded-t-[40px] p-8 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black italic text-slate-900 tracking-tight">Editar Profissional</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{editingPro.name}</p>
              </div>
              <button onClick={() => setEditingPro(null)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wide">Categoria Principal</label>
                <select
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-4 outline-none font-bold text-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  value={editingPro.category || ''}
                  onChange={e => setEditingPro({ ...editingPro, category: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wide">Telefone / WhatsApp</label>
                <Input
                  placeholder="Ex: 11999999999"
                  value={editingPro.phone || ''}
                  onChange={e => setEditingPro({ ...editingPro, phone: e.target.value })}
                  className="h-14"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wide">Especialidades (Tags)</label>
                <p className="text-[10px] text-slate-400 leading-tight">Adicione palavras-chave para a busca (ex: Piscina, Telhado).</p>

                <div className="flex gap-2">
                  <Input
                    placeholder="Digite e Enter..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addTag(); }}
                    className="flex-1 h-14"
                  />
                  <Button onClick={addTag} className="w-14 h-14 rounded-2xl shadow-xl shadow-brand-200" displayIconOnly><Plus size={24} /></Button>
                </div>

                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-3xl min-h-[100px] content-start">
                  {editingPro.specialties?.length > 0 ? editingPro.specialties.map((tag: string) => (
                    <span key={tag} className="bg-white border border-slate-200 pl-3 pr-2 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm animate-in scale-95">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="w-5 h-5 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-100"><X size={10} /></button>
                    </span>
                  )) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                      <span className="text-xs font-bold uppercase">Sem tags</span>
                    </div>
                  )}
                </div>
              </div>

              <Button fullWidth onClick={handleSavePro} className="h-14 bg-slate-900 text-white uppercase font-black text-xs shadow-xl tracking-wider">Salvar Alterações</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest ml-2">Lista de Cadastros</h3>
        {pros.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl border border-slate-50">
                  {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover rounded-2xl" /> : p.name?.[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{p.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-brand-50 text-brand-600 text-[10px] px-2 py-0.5">{p.category || 'Sem Categoria'}</Badge>
                    {p.is_verified && <ShieldCheck size={14} className="text-blue-500" />}
                  </div>
                </div>
              </div>
              <Button onClick={() => setEditingPro(p)} className="h-10 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wide hover:scale-105 shadow-lg shadow-slate-200">
                Editar
              </Button>
            </div>

            {/* Tags Display */}
            <div className="bg-slate-50 rounded-2xl p-3 flex flex-wrap gap-2 min-h-[40px]">
              {p.specialties && p.specialties.length > 0 ? p.specialties.map((tag: string) => (
                <span key={tag} className="text-[10px] bg-white border border-slate-100 px-2 py-1 rounded-lg font-bold text-slate-500">{tag}</span>
              )) : <span className="text-[10px] text-slate-300 italic">Sem especialidades cadastradas</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- GUIDE VIEW ---
const ProfessionalGuideView = () => {
  // Keeping simple for now, just updated container style
  return <div className={PAGE_CONTAINER}><h1 className={HEADER_TITLE}>Guia</h1><p className="text-slate-400">Em construção...</p></div>
};

// --- USERS VIEW ---
// --- USERS VIEW ---
const UsersView = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'resident').order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.unit?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={PAGE_CONTAINER}>
      {/* MESSAGE MODAL */}
      <MessageUserModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser} />

      <h1 className={HEADER_TITLE}>Clientes <span className="text-brand-600">Moradores</span></h1>

      <div className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 flex items-center gap-3 mb-6">
        <Search className="text-slate-400" size={20} />
        <Input
          placeholder="Buscar por nome, unidade ou email..."
          className="h-10 border-none bg-transparent p-0 focus:ring-0"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest ml-2">Total: {filteredUsers.length}</h3>

          {filteredUsers.map(u => (
            <div key={u.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-50">
                  <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{u.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Building size={10} /> {u.tower || 'Torre A'} - {u.unit || '---'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(u)}
                  className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all active:scale-90"
                  title="Enviar Mensagem"
                >
                  <MessageCircle size={18} />
                </button>
                <div className="text-right">
                  <Badge className={u.status === 'blocked' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}>
                    {u.status === 'blocked' ? 'Bloqueado' : 'Ativo'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-10 opacity-50">
              <Users size={48} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-400">Nenhum morador encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- ACCESS DEVICES VIEW (NEW) ---
const AccessDevicesView = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [condos, setCondos] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newDevice, setNewDevice] = useState({
    name: '',
    ip_address: '',
    device_type: 'hikvision_facial',
    location: '',
    condominium_id: '',
    status: 'active'
  });

  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadDevices();
    loadCondos();
    loadLogs();
    const interval = setInterval(loadLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    const { data } = await supabase
      .from('access_logs')
      .select('*, profiles(name, condominiums(name)), access_devices(name)')
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setLogs(data);
  };

  const loadCondos = async () => {
    const { data } = await supabase.from('condominiums').select('id, name');
    if (data) setCondos(data);
  };

  const loadDevices = async () => {
    setLoading(true);
    const { data } = await supabase.from('access_devices').select('*, condominiums(name)').order('created_at', { ascending: false });
    if (data) setDevices(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!newDevice.name || !newDevice.condominium_id) return alert('Nome e Condomínio obrigatórios');

    const { error } = await supabase.from('access_devices').insert(newDevice);
    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      setShowNew(false);
      setNewDevice({ ...newDevice, name: '', ip_address: '', location: '' });
      loadDevices();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este dispositivo?')) return;
    const { error } = await supabase.from('access_devices').delete().eq('id', id);
    if (!error) loadDevices();
  };

  return (
    <div className={PAGE_CONTAINER}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={HEADER_TITLE}>Controle de <span className="text-brand-600">Acesso</span></h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Câmeras e Terminais</p>
        </div>
        <div className="flex gap-2">
          <a href="/manual_integracao_hikvision.md" download="Manual_Integracao_Hikvision.md">
            <Button className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-white border border-slate-200 text-slate-400 shadow-sm hover:scale-110 hover:text-brand-600" title="Baixar Manual Técnico">
              <BookOpen size={20} />
            </Button>
          </a>
          <Button onClick={() => setShowNew(true)} className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-brand-600 text-white shadow-xl shadow-brand-500/30 hover:scale-110">
            <Plus size={24} />
          </Button>
        </div>
      </div>

      {showNew && (
        <div className="bg-slate-50 border border-brand-200 p-6 rounded-[32px] mb-8 animate-in slide-in-from-top-4 shadow-lg shadow-brand-500/10">
          <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2">
            <ShieldCheck className="text-brand-600" /> Novo Dispositivo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nome do Equipamento</label>
              <Input
                placeholder="Ex: Portaria Social"
                value={newDevice.name}
                onChange={e => setNewDevice({ ...newDevice, name: e.target.value })}
              />
            </div>

            {/* IP Address */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">IP Local</label>
              <Input
                placeholder="Ex: 192.168.1.200"
                value={newDevice.ip_address}
                onChange={e => setNewDevice({ ...newDevice, ip_address: e.target.value })}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipo</label>
              <select
                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-700 outline-none focus:border-brand-500 transition-all text-sm"
                value={newDevice.device_type}
                onChange={e => setNewDevice({ ...newDevice, device_type: e.target.value })}
              >
                <option value="hikvision_facial">Hikvision Facial (MinMoe)</option>
                <option value="control_id">Control iD</option>
                <option value="intelbras">Intelbras</option>
              </select>
            </div>

            {/* Condominium */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Condomínio</label>
              <select
                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-700 outline-none focus:border-brand-500 transition-all text-sm"
                value={newDevice.condominium_id}
                onChange={e => setNewDevice({ ...newDevice, condominium_id: e.target.value })}
              >
                <option value="">Selecione...</option>
                {condos.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* API Key (Auto-generated) */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Token de Acesso (Gerado Automaticamente)</label>
              <div className="flex bg-slate-100 rounded-xl p-3 items-center justify-between border border-slate-200">
                <code className="text-xs font-mono font-bold text-slate-600 tracking-wider">
                  {newDevice.api_key || 'Será gerado ao salvar...'}
                </code>
                <Lock key="lock-icon" size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1 bg-brand-600 text-white h-12 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] shadow-lg shadow-brand-500/20">
              Salvar Dispositivo
            </Button>
            <button onClick={() => setShowNew(false)} className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {devices.map(d => (
          <div key={d.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative group hover:shadow-lg transition-all">
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <Badge className={d.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}>
                {d.status === 'active' ? 'Online' : 'Offline'}
              </Badge>
              <button onClick={() => handleDelete(d.id)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <UserCheck size={24} />
              </div>
              <h3 className="font-black text-slate-900 text-lg">{d.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{d.condominiums?.name || 'Desconhecido'}</p>
            </div>

            <div className="space-y-2 border-t border-slate-50 pt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">IP:</span>
                <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{d.ip_address || '---'}</span>
              </div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-400 font-bold">Tipo:</span>
                <span className="font-bold text-slate-700">{d.device_type}</span>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button className="text-[10px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-widest flex items-center gap-1" onClick={() => alert('Pinging device...' + d.ip_address)}>
                  <Activity size={12} /> Testar Conexão
                </button>
                {d.api_key && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-full">
                    <Key size={10} /> {d.api_key.substring(0, 8)}...
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {devices.length === 0 && !showNew && (
          <div className="col-span-2 text-center py-20 opacity-50 border-2 border-dashed border-slate-200 rounded-[40px]">
            <ShieldCheck size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhum dispositivo encontrado</p>
          </div>
        )}
      </div>

      {/* --- RECENT ACCESS LOGS --- */}
      <div className="bg-slate-900 text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-black italic tracking-tighter">Últimos Acessos</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Monitoramento em Tempo Real</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center animate-pulse">
              <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Live Access Logs from DB */}
            {logs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-bold uppercase tracking-widest border border-dashed border-slate-700/50 rounded-2xl">
                Aguardando registros...
              </div>
            ) : logs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.event_type === 'entry_granted' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                    {log.event_type === 'entry_granted' ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{log.profiles?.name || 'Visitante / Desconhecido'}</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{log.profiles?.condominiums?.name || '---'}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>
    </div>
  );
};



// --- API DOCS VIEW ---
const ApiDocsView = () => {
  return (
    <div className={PAGE_CONTAINER}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={HEADER_TITLE}>Área do <span className="text-brand-600">Dev</span></h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Integração & API</p>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden mb-8 group">
        <div className="relative z-10">
          <h3 className="text-2xl font-black italic tracking-tighter mb-4">Documentação Técnica</h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-[90%]">
            Guia completo para desenvolvedores integrarem sistemas externos (Câmeras, ERPs, Portais) com o Condo V3.
          </p>
          <a href="/manual_integracao_hikvision.md" download="Manual_Integracao.md" className="mr-3 inline-block">
            <Button className="h-12 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 transition-all text-[10px]">
              <BookOpen size={16} /> Manual Hardware
            </Button>
          </a>
          <a href="/api_reference.md" download="Manual_API_CondoV3.md" className="inline-block">
            <Button className="h-12 px-6 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95 transition-all text-[10px]">
              <Layers size={16} /> Referência API
            </Button>
          </a>
        </div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl group-hover:bg-brand-500/30 transition-all duration-700"></div>
        <div className="absolute top-1/2 -right-6 text-slate-800 rotate-12 -translate-y-1/2">
          <LayoutGrid size={140} strokeWidth={1} opacity={0.2} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={20} /> Autenticação</h4>
          <p className="text-xs text-slate-500 mb-4 font-medium">Todas as requisições devem incluir o token no cabeçalho.</p>
          <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner">
            <code className="text-[10px] font-mono text-emerald-400">
              Authorization: Bearer &lt;seu_token&gt;<br />
              apikey: &lt;public_key&gt;
            </code>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2"><Activity className="text-blue-500" size={20} /> Endpoints Principais</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-mono text-slate-600 font-bold">GET /profiles</span>
              <Badge className="bg-blue-100 text-blue-600 border-none">Moradores</Badge>
            </div>
            <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-mono text-slate-600 font-bold">POST /access_logs</span>
              <Badge className="bg-purple-100 text-purple-600 border-none">Acessos</Badge>
            </div>
          </div>
        </div>

        {/* --- ERROS COMUNS (Inspired by Bling) --- */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
            <ShieldCheck className="text-rose-500" size={20} /> Erros Comuns
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 hover:shadow-md transition-all">
              <span className="text-xs font-black text-rose-600 bg-white px-2 py-1 rounded-md shadow-sm mb-2 inline-block">401 Unauthorized</span>
              <p className="text-[11px] text-rose-800 font-medium leading-relaxed">
                Token inválido ou expirado. Verifique se o header <code>Authorization</code> está correto.
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 hover:shadow-md transition-all">
              <span className="text-xs font-black text-amber-600 bg-white px-2 py-1 rounded-md shadow-sm mb-2 inline-block">403 Forbidden</span>
              <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                Você não tem permissão para acessar este recurso (RLS Policy). Verifique seu nível de acesso.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
              <span className="text-xs font-black text-slate-600 bg-white px-2 py-1 rounded-md shadow-sm mb-2 inline-block">400 Bad Request</span>
              <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                Sintaxe inválida. Verifique o formato do JSON enviado no corpo da requisição.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
              <span className="text-xs font-black text-slate-600 bg-white px-2 py-1 rounded-md shadow-sm mb-2 inline-block">409 Conflict</span>
              <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                Violação de unicidade. Ex: Tentar cadastrar um email que já existe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PUSH VIEW ---
const PushView = () => {
  const [form, setForm] = useState({ title: '', body: '', target_role: 'all' });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    const { data } = await supabase.from('sent_notifications').select('*').order('created_at', { ascending: false }).limit(10);
    if (data) setHistory(data);
  };

  const handleSend = async () => {
    if (!form.title || !form.body) return alert('Preencha título e mensagem');
    setLoading(true);

    // 1. Insert into DB (Triggers will handle external Push API if configured)
    const { error } = await supabase.from('sent_notifications').insert([{
      title: form.title,
      body: form.body,
      target_role: form.target_role
    }]);

    if (error) {
      alert('Erro ao enviar: ' + error.message);
    } else {
      alert('Notificação enviada com sucesso!');
      setForm({ title: '', body: '', target_role: 'all' });
      loadHistory();
    }
    setLoading(false);
  };

  return (
    <div className={PAGE_CONTAINER}>
      <h1 className={HEADER_TITLE}>Notificações <span className="text-brand-600">Push</span></h1>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4 mb-8">
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Nova Mensagem</h3>

        <Input
          placeholder="Título da Notificação"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="h-12 bg-slate-50"
        />

        <textarea
          placeholder="Digite sua mensagem aqui..."
          className="w-full h-24 bg-slate-50 border-none rounded-2xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-slate-700"
          value={form.body}
          onChange={e => setForm({ ...form, body: e.target.value })}
        />

        <div className="flex gap-4">
          <select
            className="flex-1 h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold text-slate-600 outline-none"
            value={form.target_role}
            onChange={e => setForm({ ...form, target_role: e.target.value })}
          >
            <option value="all">Todos os Usuários</option>
            <option value="resident">Apenas Moradores</option>
            <option value="professional">Apenas Prestadores</option>
          </select>

          <Button
            onClick={handleSend}
            disabled={loading}
            className="h-12 px-8 bg-slate-900 text-white font-black uppercase text-xs tracking-widest"
          >
            {loading ? 'Enviando...' : 'Enviar Push'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest ml-2">Histórico de Envios</h3>
        {history.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-1">{item.body}</p>
            </div>
            <div className="text-right">
              <Badge className="mb-1 bg-slate-100 text-slate-500 text-[10px]">{item.target_role === 'all' ? 'Geral' : item.target_role}</Badge>
              <p className="text-[9px] font-bold text-slate-300 uppercase">{new Date(item.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
        {history.length === 0 && <p className="text-center text-slate-300 text-xs font-bold py-4">Nenhum envio recente.</p>}
      </div>
    </div>
  );
};

// --- SYSTEM OVERVIEW VIEW ---
const SystemOverviewView = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>('resident');

  const systemFeatures = {
    resident: {
      title: 'MORADOR',
      subtitle: 'Resident',
      icon: Users,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-50',
      features: [
        { icon: Grid, title: 'Home / Dashboard', desc: 'Visualização centralizada de pacotes, notificações, serviços e marketplace' },
        { icon: Bell, title: 'Notificações', desc: 'Central de avisos e alertas em tempo real' },
        { icon: UserCheck, title: 'Identidade Digital', desc: 'QR Code pessoal e gestão de autorizações de visitantes' },
        { icon: Package, title: 'Pacotes', desc: 'Visualização de encomendas, scanner QR Code e histórico' },
        { icon: ShoppingBag, title: 'e-Shop', desc: 'Marketplace de produtos entre moradores e profissionais' },
        { icon: Zap, title: 'Desapego', desc: 'Publicar e visualizar itens para doação/venda' },
        { icon: Briefcase, title: 'Serviços', desc: 'Busca de profissionais, solicitações e avaliações' },
        { icon: Calendar, title: 'Reservas', desc: 'Reserva de áreas comuns e calendário de disponibilidade' },
        { icon: Bell, title: 'Comunicação', desc: 'Hub de comunicação com síndico e avisos' },
        { icon: User, title: 'Perfil', desc: 'Edição de dados pessoais e configurações' }
      ]
    },
    professional: {
      title: 'PRESTADOR',
      subtitle: 'Professional',
      icon: Briefcase,
      gradient: 'from-emerald-500 to-cyan-600',
      bgGradient: 'from-emerald-50 to-cyan-50',
      features: [
        { icon: Grid, title: 'Dashboard', desc: 'Visão geral de solicitações, estatísticas e avaliações' },
        { icon: Briefcase, title: 'Serviços', desc: 'Cadastro e gerenciamento de serviços oferecidos' },
        { icon: ShoppingBag, title: 'Loja (e-Shop)', desc: 'Cadastro de produtos, gestão de estoque e vendas' },
        { icon: Calendar, title: 'Agenda', desc: 'Solicitações pendentes, aceitar/rejeitar e calendário' },
        { icon: Star, title: 'Avaliações', desc: 'Visualização de reviews e estatísticas de satisfação' },
        { icon: UserCheck, title: 'Identidade Digital', desc: 'QR Code profissional para acesso a condomínios' },
        { icon: User, title: 'Perfil', desc: 'Dados profissionais, foto/logo, WhatsApp e especialidades' }
      ]
    },
    admin: {
      title: 'ADMIN',
      subtitle: 'Administrador',
      icon: ShieldCheck,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      features: [
        { icon: LayoutGrid, title: 'Dashboard', desc: 'Estatísticas do condomínio e visão geral de atividades' },
        { icon: Package, title: 'Gestão de Pacotes', desc: 'Registro, notificação, controle de retiradas e scanner' },
        { icon: Calendar, title: 'Gestão de Reservas', desc: 'Aprovação/rejeição, configuração de áreas e regras' },
        { icon: Users, title: 'Gestão de Moradores', desc: 'Visualização de perfis e aprovação de cadastros' },
        { icon: Briefcase, title: 'Gestão de Profissionais', desc: 'Aprovação de prestadores e moderação de serviços' },
        { icon: UserCheck, title: 'Controle de Acesso', desc: 'Validação de QR Codes e registro de entradas/saídas' },
        { icon: Bell, title: 'Comunicação', desc: 'Envio de avisos gerais e gestão do mural' }
      ]
    },
    superadmin: {
      title: 'SUPER ADMIN',
      subtitle: 'Super Administrador',
      icon: Star,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      features: [
        { icon: LayoutGrid, title: 'Dashboard', desc: 'Estatísticas globais, métricas de uso e visão de todos os condomínios' },
        { icon: Building, title: 'Gestão de Condomínios', desc: 'Cadastro, edição, ativação/desativação e configurações' },
        { icon: Users, title: 'Gestão de Usuários', desc: 'Visualização global, controle de permissões e moderação' },
        { icon: Briefcase, title: 'Gestão de Profissionais', desc: 'Cadastro de tags/especialidades e aprovação global' },
        { icon: ShieldCheck, title: 'Dispositivos de Acesso', desc: 'Cadastro de dispositivos, vinculação e logs de acesso' },
        { icon: Bell, title: 'Notificações Push', desc: 'Envio global, segmentação por perfil e histórico' },
        { icon: Layers, title: 'Documentação API', desc: 'Documentação técnica, endpoints e exemplos de uso' },
        { icon: FileText, title: 'Visão Geral do Sistema', desc: 'Documentação de funcionalidades e resumo por perfil' }
      ]
    }
  };

  const toggleCard = (key: string) => {
    setExpandedCard(expandedCard === key ? null : key);
  };

  return (
    <div className={PAGE_CONTAINER}>
      <div className="mb-8">
        <h1 className={HEADER_TITLE}>Visão <span className="text-brand-600">Geral</span></h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">
          Documentação completa de funcionalidades por perfil
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Object.entries(systemFeatures).map(([key, profile]) => {
          const isExpanded = expandedCard === key;
          const Icon = profile.icon;

          return (
            <div
              key={key}
              className={`bg-gradient-to-br ${profile.bgGradient} rounded-[32px] border border-white/50 shadow-lg overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-xl' : 'shadow-md'}`}
            >
              {/* Header */}
              <button
                onClick={() => toggleCard(key)}
                className="w-full p-6 flex items-center justify-between hover:bg-white/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center text-white shadow-lg`}>
                    <Icon size={28} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-lg text-slate-900 tracking-tight">{profile.title}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{profile.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/80 text-slate-700 border-none shadow-sm">
                    {profile.features.length} recursos
                  </Badge>
                  {isExpanded ? <ChevronUp className="text-slate-600" size={20} /> : <ChevronDown className="text-slate-600" size={20} />}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-6 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-300">
                  {profile.features.map((feature, idx) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div
                        key={idx}
                        className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <FeatureIcon size={18} strokeWidth={2.5} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-slate-900 mb-1">{feature.title}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-8 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Sobre esta documentação</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Esta visão geral apresenta todas as funcionalidades disponíveis no sistema, organizadas por tipo de usuário.
              Cada perfil tem acesso a recursos específicos para suas necessidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- FEEDBACKS VIEW ---
const FeedbacksView = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFeedbacks(); }, []);

  const loadFeedbacks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_feedback')
      .select(`
                *,
                profiles:user_id (name, condominium_id, condominiums:condominium_id (name))
            `)
      .order('created_at', { ascending: false });

    if (data && !error) setFeedbacks(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('app_feedback').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Carregando feedbacks...</div>;

  return (
    <div className={PAGE_CONTAINER}>
      <header className="mb-8">
        <h1 className={HEADER_TITLE}>Dicas & <span className={GRADIENT_TEXT}>Sugestões</span></h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Feedback da comunidade</p>
      </header>

      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <Sparkles size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhum feedback recebido</p>
          </div>
        ) : feedbacks.map((f: any) => (
          <div key={f.id} className={`${CARD_BASE} relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-2 h-full ${f.status === 'new' ? 'bg-brand-500' : f.status === 'reviewed' ? 'bg-blue-400' : 'bg-slate-200'}`}></div>

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Badge className={`${f.type === 'Dica' ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'} text-[9px] uppercase font-black px-2 py-0.5`}>
                  {f.type}
                </Badge>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{f.area}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(f.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <p className="text-sm text-slate-700 font-medium leading-relaxed mb-6">"{f.content}"</p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <User size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-900">{f.profiles?.name}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                    {f.role === 'resident' ? 'Morador' : 'Profissional'} • {f.profiles?.condominiums?.name}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {f.status === 'new' && (
                  <button
                    onClick={() => handleUpdateStatus(f.id, 'reviewed')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Marcar Lido
                  </button>
                )}
                {f.status !== 'archived' && (
                  <button
                    onClick={() => handleUpdateStatus(f.id, 'archived')}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Arquivar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN LAYOUT ---

export const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState('professionals'); // Default to professionals for User flow

  return (
    <div className="min-h-screen bg-[#f8fafc] flex justify-center pb-24 font-sans selection:bg-brand-200 text-slate-900">
      <div className="w-full max-w-md bg-[#f8fafc] min-h-screen shadow-2xl relative overflow-hidden">

        <div className="h-full overflow-y-auto hide-scrollbar">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'condos' && <CondosView />}
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'professionals' && <ProfessionalsView />}
          {activeTab === 'access' && <AccessDevicesView />}
          {activeTab === 'api' && <ApiDocsView />}
          {activeTab === 'notifications' && <PushView />}
          {activeTab === 'overview' && <SystemOverviewView />}
          {activeTab === 'feedbacks' && <FeedbacksView />}
        </div>

        {/* BOTTOM NAV */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-slate-900/90 backdrop-blur-xl text-white shadow-2xl shadow-slate-900/40 rounded-[32px] p-2 flex justify-between items-center z-50 border border-white/10 overflow-x-auto hide-scrollbar">
          {[
            { id: 'dashboard', icon: LayoutGrid, label: 'Dash' },
            { id: 'condos', icon: Building, label: 'Condos' },
            { id: 'professionals', icon: Briefcase, label: 'Pros' },
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'access', icon: ShieldCheck, label: 'Acesso' },
            { id: 'api', icon: Layers, label: 'API' },
            { id: 'notifications', icon: Bell, label: 'Push' },
            { id: 'overview', icon: FileText, label: 'Docs' },
            { id: 'feedbacks', icon: Sparkles, label: 'Sugestões' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative min-w-[56px] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${activeTab === item.id ? 'bg-white text-slate-900 shadow-lg scale-110' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};


