import React, { useState, useEffect } from 'react';
import { Users, Building, DollarSign, Activity, LayoutGrid, ShieldCheck, Plus, Search, ArrowLeft, Trash2, Bell, BookOpen, Star, Palette, X, Edit, Phone, MapPin, Grid, Layers, Menu, Briefcase, CheckCircle2, UserCheck, Image as ImageIcon } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/ui';
import { supabase } from '../supabase';

// --- SHARED STYLES ---
const PAGE_CONTAINER = "p-6 space-y-6 pt-12 animate-in slide-in-from-right-8 pb-32";
const HEADER_TITLE = "text-3xl font-black italic text-slate-900 uppercase tracking-tighter";
const CARD_BASE = "bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all";
const GRADIENT_TEXT = "bg-gradient-to-r from-brand-600 to-fuchsia-600 bg-clip-text text-transparent";

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
  const [newCondo, setNewCondo] = useState({ name: '', address: '', plan: 'basic', type: 'vertical', status: 'active', primary_color: '#7c3aed', logo_url: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
  const [editingPro, setEditingPro] = useState<any>(null);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPros(); }, []);

  const loadPros = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'professional').order('created_at', { ascending: false });
    if (data) setPros(data);
    setLoading(false);
  };

  const handleSaveTags = async () => {
    if (!editingPro) return;
    const { error } = await supabase.from('profiles').update({
      category: editingPro.category,
      specialties: editingPro.specialties
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
                  <option value="Manutenção">Manutenção</option>
                  <option value="Limpeza">Limpeza</option>
                  <option value="Jardinagem">Jardinagem</option>
                  <option value="Eletricista">Eletricista</option>
                  <option value="Pintor">Pintor</option>
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Outros">Outros</option>
                  <option value="Beleza">Beleza</option>
                  <option value="Saúde">Saúde</option>
                </select>
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

              <Button fullWidth onClick={handleSaveTags} className="h-14 bg-slate-900 text-white uppercase font-black text-xs shadow-xl tracking-wider">Salvar Alterações</Button>
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

              <div className="text-right">
                <Badge className={u.status === 'blocked' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}>
                  {u.status === 'blocked' ? 'Bloqueado' : 'Ativo'}
                </Badge>
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
          {activeTab === 'notifications' && <PushView />}
        </div>

        {/* BOTTOM NAV */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-slate-900/90 backdrop-blur-xl text-white shadow-2xl shadow-slate-900/40 rounded-[32px] p-2 flex justify-between items-center z-50 border border-white/10">
          {[
            { id: 'dashboard', icon: LayoutGrid, label: 'Dash' },
            { id: 'condos', icon: Building, label: 'Condos' },
            { id: 'professionals', icon: Briefcase, label: 'Pros' }, // Changed Icon
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'notifications', icon: Bell, label: 'Push' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${activeTab === item.id ? 'bg-white text-slate-900 shadow-lg scale-110' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};


