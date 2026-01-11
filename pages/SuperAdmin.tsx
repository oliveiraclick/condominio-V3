import React, { useState, useEffect } from 'react';
import { Users, Building, DollarSign, Activity, LayoutGrid, User, ShieldCheck, Plus, Search, ArrowLeft, Trash2, Bell, BookOpen, Star, Palette } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/UI';
import { supabase } from '../supabase';

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
    <div className="p-6 space-y-6 pt-12 animate-in slide-in-from-right-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic text-slate-900 uppercase">Visão Geral</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Painel Super Admin</p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.reload();
          }}
          className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 active:scale-95 transition-all"
          title="Sair da conta"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl shadow-slate-900/20 col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10"><DollarSign size={100} /></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">MRR Mensal</p>
          <h3 className="text-4xl font-black italic tracking-tighter">R$ {stats.mrr.toLocaleString('pt-BR')}</h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-lg">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Condomínios</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.condos}</h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-lg">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Usuários</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.users}</h3>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4 ml-2">Recentes</h3>
        <div className="space-y-3">
          {recentCondos.map(c => (
            <div key={c.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-lg">{c.name?.[0]}</div>
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
  const [newCondo, setNewCondo] = useState({ name: '', address: '', plan: 'basic', type: 'vertical', status: 'active' });

  useEffect(() => { loadCondos(); }, []);

  const loadCondos = async () => {
    const { data } = await supabase.from('condominiums').select('*').order('created_at', { ascending: false });
    if (data) setCondos(data);
  }

  const handleCreate = async () => {
    if (!newCondo.name) return;
    const { error } = await supabase.from('condominiums').insert([newCondo]);
    if (!error) {
      setShowNew(false);
      alert('Condomínio criado!');
      loadCondos();
      setNewCondo({ name: '', address: '', plan: 'basic', type: 'vertical', status: 'active' });
    } else {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja EXCLUIR este condomínio?')) return;
    const { error } = await supabase.from('condominiums').delete().eq('id', id);
    if (!error) { alert('Excluído.'); loadCondos(); } else { alert('Erro: ' + error.message); }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const { error } = await supabase.from('condominiums').update({ status: newStatus }).eq('id', id);
    if (!error) loadCondos(); else alert('Erro: ' + error.message);
  };

  return (
    <div className="p-6 space-y-6 pt-12 animate-in slide-in-from-right-8">
      <div className="flex justify-between items-end">
        <h1 className="text-2xl font-black italic text-slate-900 uppercase">Condomínios</h1>
        <button onClick={() => setShowNew(true)} className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-200"><Plus size={24} /></button>
      </div>

      {showNew && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 space-y-4 animate-in zoom-in-95">
          <h3 className="font-bold text-slate-900">Novo Condomínio</h3>
          <Input placeholder="Nome" value={newCondo.name} onChange={e => setNewCondo({ ...newCondo, name: e.target.value })} />
          <Input placeholder="Endereço" value={newCondo.address} onChange={e => setNewCondo({ ...newCondo, address: e.target.value })} />

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Tipo</label>
              <select
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-bold text-xs outline-none focus:border-violet-500"
                value={newCondo.type}
                onChange={e => setNewCondo({ ...newCondo, type: e.target.value })}
              >
                <option value="vertical">Vertical (Prédio)</option>
                <option value="horizontal">Horizontal (Casas)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Plano</label>
              <div className="w-full h-12 bg-slate-100 border border-slate-200 rounded-xl px-4 flex items-center text-slate-500 font-bold text-xs cursor-not-allowed">
                Plano Pro (Único)
              </div>
            </div>
          </div>

          <Button fullWidth onClick={() => { setNewCondo({ ...newCondo, plan: 'pro' }); handleCreate(); }} className="bg-slate-900 text-white h-12 uppercase font-black text-xs">Salvar</Button>
          <button onClick={() => setShowNew(false)} className="w-full text-center text-xs text-slate-400 font-bold uppercase mt-2">Cancelar</button>
        </div>
      )}

      <div className="space-y-3 pb-20">
        {condos.map(c => (
          <div key={c.id} className={`p-4 rounded-3xl border shadow-sm flex items-center justify-between transition-all ${c.status === 'blocked' ? 'bg-slate-100 border-slate-200 opacity-75' : 'bg-white border-slate-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${c.status === 'blocked' ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>{c.name?.[0]}</div>
              <div>
                <h4 className={`font-bold text-sm ${c.status === 'blocked' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{c.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{c.plan} • {c.type === 'horizontal' ? 'Horizontal' : 'Vertical'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleStatus(c.id, c.status || 'active')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors ${c.status === 'blocked' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}
              >
                {c.status === 'blocked' ? 'Ativar' : 'Bloquear'}
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SUBSCRIPTIONS VIEW ---
const SubscriptionsView = () => {
  const [pros, setPros] = useState<any[]>([]);

  useEffect(() => { loadPros(); }, []);

  const loadPros = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'professional').order('created_at', { ascending: false });
    if (data) setPros(data);
  };

  const extendTrial = async (id: string) => {
    alert('Função simulada: +15 dias adicionados.');
  };

  return (
    <div className="p-6 space-y-6 pt-12 animate-in slide-in-from-right-8">
      <h1 className="text-2xl font-black italic text-slate-900 uppercase">Assinaturas</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Ativos</p>
          <h3 className="text-4xl font-black italic">{pros.length}</h3>
        </div>
        <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/30">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 mb-1">MRR Estimado</p>
          <h3 className="text-4xl font-black italic">R$ {(pros.length * 29.90).toFixed(0)}</h3>
        </div>
      </div>
      <div className="space-y-4 pb-20">
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest ml-1">Profissionais</h3>
        {pros.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-50 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400">{p.name?.[0]}</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                  <div className="flex gap-2 text-[10px] uppercase font-bold text-slate-400">
                    <span>{p.category || 'Geral'}</span>
                    {p.is_verified && <span className="text-blue-500 flex items-center gap-0.5"><ShieldCheck size={10} /> Verificado</span>}
                  </div>
                </div>
              </div>
              <Badge className={p.subscription_plan === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}>{p.subscription_plan === 'active' ? 'Pago' : 'Trial'}</Badge>
            </div>
            {p.subscription_plan !== 'active' && (
              <div className="flex gap-2">
                <Button onClick={() => extendTrial(p.id)} variant="secondary" className="flex-1 h-8 text-[10px] uppercase font-black bg-slate-50 border-slate-200">+15 Dias</Button>
                <Button onClick={() => alert('Link de cobrança enviado!')} className="flex-1 h-8 text-[10px] uppercase font-black bg-slate-900 text-white">Cobrar</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- FINANCE VIEW ---
const FinanceView = () => {
  const transactions = [
    { id: 1, desc: 'Assinatura Pro - João Silva', amount: 29.90, type: 'credit', date: 'Hoje' },
    { id: 2, desc: 'Assinatura Pro - Maria Clean', amount: 29.90, type: 'credit', date: 'Ontem' },
    { id: 3, desc: 'Servidor AWS', amount: -150.00, type: 'debit', date: '05/01' },
    { id: 4, desc: 'Taxa Kiwify (Saque)', amount: -367.50, type: 'debit', date: '01/01' },
  ];
  const totalBalance = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-6 space-y-6 pt-12 animate-in slide-in-from-right-8">
      <h1 className="text-2xl font-black italic text-slate-900 uppercase">Financeiro</h1>
      <div className="bg-slate-950 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-900/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><DollarSign size={150} /></div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Caixa da Plataforma</p>
        <h3 className="text-4xl font-black italic tracking-tighter">R$ {totalBalance.toFixed(2)}</h3>
        <div className="mt-8 flex gap-4">
          <div className="flex-1 bg-white/10 rounded-2xl p-4">
            <span className="text-emerald-400 text-xs font-black uppercase block mb-1">Entradas</span>
            <span className="text-xl font-bold">R$ 59.80</span>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl p-4">
            <span className="text-rose-400 text-xs font-black uppercase block mb-1">Saídas</span>
            <span className="text-xl font-bold">R$ 517.50</span>
          </div>
        </div>
      </div>
      <div className="space-y-4 pb-20">
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest ml-1">Extrato Recente</h3>
        {transactions.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {t.type === 'credit' ? <ArrowLeft className="rotate-45" size={20} /> : <ArrowLeft className="-rotate-135" size={20} />}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{t.desc}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{t.date} • {t.type === 'credit' ? 'Recebido via Kiwify' : 'Pago'}</p>
              </div>
            </div>
            <span className={`font-black tracking-tight ${t.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>{t.type === 'credit' ? '+' : ''} R$ {Math.abs(t.amount).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- NOTIFICATIONS VIEW ---
const NotificationsView = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', body: '', target: 'all' });
  const [sending, setSending] = useState(false);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    const { data } = await supabase.from('sent_notifications').select('*').order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  const handleSend = async () => {
    if (!form.title || !form.body) return alert('Preencha título e mensagem.');
    setSending(true);
    const { error } = await supabase.from('sent_notifications').insert([{
      title: form.title,
      body: form.body,
      target_role: form.target,
      created_by: (await supabase.auth.getUser()).data.user?.id
    }]);

    setSending(false);
    if (error) {
      alert('Erro ao enviar: ' + error.message);
    } else {
      alert('Notificação Enviada com Sucesso!');
      setForm({ title: '', body: '', target: 'all' });
      loadHistory();
    }
  };

  return (
    <div className="p-6 space-y-6 pt-12 animate-in slide-in-from-right-8">
      <h1 className="text-2xl font-black italic text-slate-900 uppercase">Notificações Push</h1>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl space-y-4">
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Nova Mensagem</h3>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Título</label>
          <Input placeholder="Ex: Aviso de Manutenção" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Mensagem</label>
          <textarea
            className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 font-bold text-xs outline-none focus:border-violet-500 resize-none transition-all"
            placeholder="Digite sua mensagem global aqui..."
            value={form.body}
            onChange={e => setForm({ ...form, body: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Destinatários</label>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            {['all', 'resident', 'professional'].map(t => (
              <button
                key={t}
                onClick={() => setForm({ ...form, target: t })}
                className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${form.target === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t === 'all' ? 'Todos' : t === 'resident' ? 'Moradores' : 'Pros'}
              </button>
            ))}
          </div>
        </div>

        <Button fullWidth onClick={handleSend} disabled={sending} className="h-14 bg-violet-600 text-white uppercase font-black text-xs shadow-xl shadow-violet-200">
          {sending ? 'Enviando...' : 'Enviar Push Global'}
        </Button>
      </div>

      <div className="space-y-4 pb-20">
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest ml-1">Histórico de Envios</h3>
        {history.map(h => (
          <div key={h.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-900 text-sm">{h.title}</h4>
              <Badge variant="secondary" className="text-[9px] uppercase bg-slate-100 text-slate-500">{h.target_role}</Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">{h.body}</p>
            <p className="text-[9px] text-slate-300 font-bold uppercase">{new Date(h.created_at).toLocaleDateString()} às {new Date(h.created_at).toLocaleTimeString().slice(0, 5)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- PROFESSIONAL GUIDE VIEW ---
const ProfessionalGuideView = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    icon_name: 'BookOpen',
    bg_color: 'bg-white',
    text_color: 'text-slate-900',
    icon_bg_color: 'bg-emerald-100',
    icon_color: 'text-emerald-600',
    sort_order: 0
  });

  useEffect(() => { loadCards(); }, []);

  const loadCards = async () => {
    const { data } = await supabase.from('pro_guide_cards').select('*').order('sort_order', { ascending: true });
    if (data) setCards(data);
  };

  const handleCreate = async () => {
    if (!newCard.title) return;
    const { error } = await supabase.from('pro_guide_cards').insert([newCard]);
    if (!error) {
      setShowNew(false);
      loadCards();
      setNewCard({
        title: '',
        description: '',
        icon_name: 'BookOpen',
        bg_color: 'bg-white',
        text_color: 'text-slate-900',
        icon_bg_color: 'bg-emerald-100',
        icon_color: 'text-emerald-600',
        sort_order: 0
      });
    } else {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este card?')) return;
    const { error } = await supabase.from('pro_guide_cards').delete().eq('id', id);
    if (!error) loadCards();
  };

  return (
    <div className="p-6 space-y-6 pt-12 animate-in slide-in-from-right-8">
      <div className="flex justify-between items-end">
        <h1 className="text-2xl font-black italic text-slate-900 uppercase">Guia do Prestador</h1>
        <button onClick={() => setShowNew(true)} className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-200"><Plus size={24} /></button>
      </div>

      {showNew && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 space-y-4 animate-in zoom-in-95">
          <h3 className="font-bold text-slate-900">Novo Card no Guia</h3>
          <Input placeholder="Título" value={newCard.title} onChange={e => setNewCard({ ...newCard, title: e.target.value })} />
          <Input placeholder="Descrição" value={newCard.description} onChange={e => setNewCard({ ...newCard, description: e.target.value })} />

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Ícone (Nome Lucide)</label>
              <Input placeholder="Ex: Zap, Store..." value={newCard.icon_name} onChange={e => setNewCard({ ...newCard, icon_name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Ordem</label>
              <Input type="number" value={newCard.sort_order} onChange={e => setNewCard({ ...newCard, sort_order: parseInt(e.target.value) })} />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Configurações Visuais (Tailwind)</p>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="BG Color" value={newCard.bg_color} onChange={e => setNewCard({ ...newCard, bg_color: e.target.value })} />
              <Input placeholder="Text Color" value={newCard.text_color} onChange={e => setNewCard({ ...newCard, text_color: e.target.value })} />
              <Input placeholder="Icon BG" value={newCard.icon_bg_color} onChange={e => setNewCard({ ...newCard, icon_bg_color: e.target.value })} />
              <Input placeholder="Icon Color" value={newCard.icon_color} onChange={e => setNewCard({ ...newCard, icon_color: e.target.value })} />
            </div>
          </div>

          <Button fullWidth onClick={handleCreate} className="bg-slate-900 text-white h-12 uppercase font-black text-xs">Adicionar ao Guia</Button>
          <button onClick={() => setShowNew(false)} className="w-full text-center text-xs text-slate-400 font-bold uppercase mt-2">Cancelar</button>
        </div>
      )}

      <div className="space-y-3 pb-20">
        {cards.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon_bg_color} ${c.icon_color}`}>
                <Star size={20} />
              </div>
              <div className="max-w-[200px]">
                <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{c.description}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(c.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
// --- USERS VIEW (STATS) ---
const UsersView = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'stats'>('stats');
  const [users, setUsers] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'stats') loadStats();
  }, [activeTab, limit]);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').limit(50).order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  }

  const loadStats = async () => {
    setLoading(true);
    const { data } = await supabase.from('login_history').select('user_id, role, condo_id');

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((r: any) => {
        counts[r.user_id] = (counts[r.user_id] || 0) + 1;
      });

      const userIds = Object.keys(counts);
      const { data: profiles } = await supabase.from('profiles').select('id, name, avatar, role, condominium_id').in('id', userIds);
      const { data: condos } = await supabase.from('condominiums').select('id, name');
      const condoMap = condos?.reduce((acc: any, c: any) => ({ ...acc, [c.id]: c.name }), {}) || {};

      const ranked = profiles?.map((p: any) => ({
        ...p,
        count: counts[p.id],
        condo_name: condoMap[p.condominium_id] || 'N/A'
      })).sort((a: any, b: any) => b.count - a.count).slice(0, limit);

      setTopUsers(ranked || []);
    }
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6 pt-12 animate-in slide-in-from-right-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black italic text-slate-900 uppercase">Usuários</h1>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'stats' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400'}`}>Top Acessos</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'users' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400'}`}>Recentes</button>
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Filtrar Top:</p>
            <div className="flex gap-2">
              {[10, 20, 50, 100].map(v => (
                <button key={v} onClick={() => setLimit(v)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${limit === v ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{v}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pb-20">
            {loading && <div className="text-center py-10 text-xs font-bold text-slate-400 uppercase animate-pulse">Carregando dados...</div>}

            {!loading && topUsers.map((u, i) => (
              <div key={u.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex items-center justify-between relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-50">
                      <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm">#{i + 1}</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight text-left">{u.name}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded ${u.role === 'resident' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>{u.role === 'resident' ? 'Morador' : 'Pro'}</span>
                      • {u.condo_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black text-slate-900 tracking-tighter italic">{u.count}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Acessos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-3 pb-20">
          {users.map(u => (
            <div key={u.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400"><User size={20} /></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{u.name || 'Sem Nome'}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{u.role} • {u.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN SUPER ADMIN COMPONENT ---
export const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [history, setHistory] = useState<string[]>(['dashboard']);

  const baseScreen = (screen: string) => { setHistory([screen]); setActiveTab(screen); };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex justify-center pb-24">
      <div className="w-full max-w-md bg-[#f8fafc] min-h-screen shadow-2xl relative overflow-hidden">
        <div className="h-full overflow-y-auto hide-scrollbar">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'condos' && <CondosView />}
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'subscriptions' && <SubscriptionsView />}
          {activeTab === 'finance' && <FinanceView />}
          {activeTab === 'notifications' && <NotificationsView />}
          {activeTab === 'guide' && <ProfessionalGuideView />}
        </div>
        <SuperAdminNavigation activeTab={history[0]} onChange={baseScreen} />
      </div>
    </div>
  );
};

const SuperAdminNavigation = ({ activeTab, onChange }: { activeTab: string, onChange: (tab: string) => void }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Dash' },
    { id: 'condos', icon: Building, label: 'Condos' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'finance', icon: DollarSign, label: 'Finan.' },
    { id: 'guide', icon: BookOpen, label: 'Guia' },
    { id: 'notifications', icon: Bell, label: 'Push' },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-5px_30px_rgba(124,58,237,0.15)] border-t border-violet-100 px-6 py-4 flex justify-between items-end z-50 max-w-md mx-auto rounded-t-[32px] mb-0">
      {navItems.map((item) => (
        <button key={item.id} onClick={() => onChange(item.id)} className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === item.id ? '-translate-y-2' : ''}`}>
          <div className={`p-3 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30' : 'text-slate-300 hover:text-slate-600'}`}>
            <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
          </div>
          {activeTab === item.id && <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 animate-in fade-in slide-in-from-bottom-2">{item.label}</span>}
        </button>
      ))}
    </div>
  );
};
