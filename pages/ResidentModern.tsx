import React, { useState } from 'react';
import {
    Building, LayoutGrid, ShoppingBag, Plus, CalendarDays, User,
    Bell, Search, MapPin, ChevronRight, Star, Key, Zap, CreditCard,
    MessageSquare, Settings, LogOut, Sparkles
} from 'lucide-react';
import { Card } from '../components/ui';
import { AppFeedbackModal } from '../components/AppFeedbackModal';


export const ResidentModern: React.FC<{
    user: any;
    activeTab: string;
    onChangeTab: (tab: string) => void;
    notifications?: any[];
    desapegos?: any[];
    packages?: any[];
    onNavigate?: (screen: string) => void;
    onSelectDesapego?: (item: any) => void;
}> = ({ user, activeTab, onChangeTab, notifications = [], desapegos = [], packages = [], onNavigate, onSelectDesapego }) => {
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;
    const myPackages = packages.filter(p => p.unit === (user?.unit || ''));


    return (
        <div className="min-h-screen bg-[#0f111a] text-slate-200 font-sans pb-24">

            {/* HEADER LUXO (Igual ao Original mas com tema Gold) */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-[#0f111a]/80 backdrop-blur-md border-b border-amber-500/10 px-6 pt-12 pb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-amber-500/80 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Bem-vindo de volta</p>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            {user?.name ? user.name.split(' ')[0] : 'Morador'}
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        </h1>
                    </div>
                    <button className="w-10 h-10 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center text-amber-400 relative">
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full" />}
                    </button>
                </div>
            </header>

            {/* CONTENT SCROLLABLE */}
            <main className="pt-32 px-6">

                {/* GOLD CARD INFO (Mantendo a ideia do card de unidade que substitui o cabeçalho original) */}
                <div className="relative w-full h-40 rounded-[32px] overflow-hidden mb-8 shadow-2xl shadow-amber-500/10 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 opacity-90" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay" />

                    <div className="relative z-10 p-6 h-full flex flex-col justify-between text-[#0f111a]">
                        <div className="flex justify-between items-start">
                            <span className="bg-black/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/5">
                                Residencial Luxury
                            </span>
                            <Building size={32} className="text-amber-900 mix-blend-overlay" />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Sua Unidade</p>
                            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-2">
                                {user?.tower || 'A'} <span className="opacity-40">|</span> {user?.unit || '...'}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* PACKAGE ALERT (Igual ao Original) */}
                {myPackages.length > 0 && (
                    <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-pulse cursor-pointer" onClick={() => onChangeTab('chamado')}>
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-emerald-400">Encomenda na Portaria!</h3>
                            <p className="text-xs text-emerald-400/80">Você tem {myPackages.length} pacote(s) aguardando retirada.</p>
                        </div>
                    </div>
                )}

                {/* QUICK ACTIONS GRID (Igual ao ResidentHome original) */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button onClick={() => onChangeTab('acesso')} className="bg-[#161b22] p-5 rounded-[24px] border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Key size={24} />
                        </div>
                        <span className="text-sm font-bold text-slate-300">Acesso</span>
                    </button>
                    <button onClick={() => onChangeTab('market')} className="bg-[#161b22] p-5 rounded-[24px] border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShoppingBag size={24} />
                        </div>
                        <span className="text-sm font-bold text-slate-300">Mercadinho</span>
                    </button>
                    <button onClick={() => onChangeTab('servicos-full')} className="bg-[#161b22] p-5 rounded-[24px] border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Zap size={24} />
                        </div>
                        <span className="text-sm font-bold text-slate-300">Serviços</span>
                    </button>
                    <button onClick={() => onChangeTab('financeiro')} className="bg-[#161b22] p-5 rounded-[24px] border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CreditCard size={24} />
                        </div>
                        <span className="text-sm font-bold text-slate-300">Fatura</span>
                    </button>
                </div>

                {/* VITRINE DO CONDOMÍNIO (Igual ao Original "Desapegos") */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <Star size={16} className="text-amber-400 fill-amber-400" />
                        Vitrine (Desapegos)
                    </h3>
                    <button className="text-[10px] font-bold text-amber-500 uppercase tracking-widest" onClick={() => onChangeTab('market')}>Ver tudo</button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                    {desapegos.length > 0 ? desapegos.slice(0, 5).map(item => (
                        <div key={item.id} onClick={() => onSelectDesapego && onSelectDesapego(item)} className="min-w-[200px] h-48 bg-[#161b22] border border-white/5 rounded-[24px] p-4 flex flex-col justify-between relative group overflow-hidden cursor-pointer">
                            {item.image_url ? (
                                <div className="absolute inset-0">
                                    <img src={item.image_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                            )}

                            <div className="relative z-10 flex justify-between items-start">
                                <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-amber-400 border border-white/10">
                                    <ShoppingBag size={14} />
                                </div>
                                <span className="bg-amber-500 text-[#0f111a] text-[10px] font-bold px-2 py-0.5 rounded-full">R$ {item.price}</span>
                            </div>

                            <div className="relative z-10">
                                <h4 className="font-bold text-white text-sm line-clamp-2 leading-tight mb-1">{item.title}</h4>
                                <p className="text-[10px] text-slate-300 flex items-center gap-1">
                                    <User size={10} /> {item.profiles?.name?.split(' ')[0]}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="min-w-[280px] h-40 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-slate-500">
                            <ShoppingBag size={32} className="mb-2 opacity-50" />
                            <p className="text-xs">Nenhum item anunciado</p>
                        </div>
                    )}
                </div>

                {/* FEEDBACK TRIGGER CARD */}
                <div className="mt-12 mb-12">
                    <Card
                        onClick={() => setFeedbackOpen(true)}
                        className="p-8 border-none bg-gradient-to-br from-[#1c2230] to-[#0f111a] text-white rounded-[40px] shadow-2xl relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all border border-white/5"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-amber-500/20 transition-all duration-700"></div>

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 shadow-inner">
                                <Sparkles size={32} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white">💡 Sugestão para o App</h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">Sua ideia pode ser a próxima funcionalidade do sistema!</p>
                            </div>
                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* FEEDBACK MODAL */}
                <AppFeedbackModal
                    isOpen={feedbackOpen}
                    onClose={() => setFeedbackOpen(false)}
                    currentUser={user}
                    userRole="resident"
                />
            </main>


            {/* BOTTOM NAVIGATION (Mantida a nova versão Gold pois é apenas visual) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[#0f111a]/95 backdrop-blur-xl border-t border-amber-500/10 px-6 py-4 flex justify-between items-end z-50 rounded-t-[32px]">
                {[
                    { id: 'home', icon: LayoutGrid, label: 'Home' },
                    { id: 'market', icon: ShoppingBag, label: 'Shop' },
                    { id: 'create', icon: Plus, isBig: true },
                    { id: 'condo-agenda', icon: CalendarDays, label: 'Agenda' },
                    { id: 'profile', icon: User, label: 'Perfil' },
                ].map(item => {
                    if (item.isBig) {
                        return (
                            <button key={item.id} onClick={() => onChangeTab('create-desapego')} className="-mt-12 w-16 h-16 bg-gradient-to-tr from-amber-300 via-amber-500 to-amber-600 rounded-full flex items-center justify-center text-[#0f111a] shadow-xl shadow-amber-500/30 border-4 border-[#0f111a] active:scale-95 transition-transform">
                                <Plus size={32} />
                            </button>
                        )
                    }
                    const active = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChangeTab(item.id)}
                            className={`flex flex-col items-center gap-1 transition-all w-12 ${active ? 'text-amber-400' : 'text-slate-600'}`}
                        >
                            <item.icon size={24} className={active ? 'fill-amber-400/20' : ''} />
                            {active && <div className="w-1 h-1 bg-amber-400 rounded-full mb-1" />}
                        </button>
                    )
                })}
            </nav>
        </div>
    );
};
