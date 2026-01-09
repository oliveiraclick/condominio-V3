import React, { useState } from 'react';
import {
    Building, LayoutGrid, ShoppingBag, Plus, CalendarDays, User,
    Bell, Search, MapPin, ChevronRight, Star
} from 'lucide-react';

export const ResidentModern: React.FC<{
    user: any;
    activeTab: string;
    onChangeTab: (tab: string) => void;
    notifications?: any[];
    desapegos?: any[];
    packages?: any[];
}> = ({ user, activeTab, onChangeTab, notifications = [], desapegos = [], packages = [] }) => {
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-[#0f111a] text-slate-200 font-sans pb-24">

            {/* HEADER LUXO */}
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

                {/* GOLD CARD */}
                <div className="relative w-full h-48 rounded-[32px] overflow-hidden mb-8 shadow-2xl shadow-amber-500/10 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 opacity-90" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay" />

                    <div className="absolute top-0 right-0 p-6 opacity-50">
                        <Building size={120} className="text-amber-900 mix-blend-overlay -rotate-12 translate-x-4 -translate-y-4" />
                    </div>

                    <div className="relative z-10 p-6 h-full flex flex-col justify-between text-[#0f111a]">
                        {/* ... card content same as before ... */}
                        <div className="flex justify-between items-start">
                            <span className="bg-black/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/5">
                                Residencial Luxury
                            </span>
                            <img src="/logo-icon.png" className="w-8 h-8 opacity-80" alt="" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Sua Unidade</p>
                            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-2">
                                {user?.tower || 'A'} <span className="opacity-40">|</span> {user?.unit || '...'}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* PACKAGE ALERT */}
                {packages.length > 0 && (
                    <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-emerald-400">Encomenda Chegou!</h3>
                            <p className="text-xs text-emerald-400/80">Você tem {packages.length} pacote(s) na portaria.</p>
                        </div>
                    </div>
                )}

                {/* DESAPEGOS SECTION */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <Star size={16} className="text-amber-400 fill-amber-400" />
                        Vitrine do Condomínio
                    </h3>
                    <button className="text-[10px] font-bold text-amber-500 uppercase tracking-widest" onClick={() => onChangeTab('market')}>Ver tudo</button>
                </div>

                {/* HORIZONTAL SCROLL (REAL DATA) */}
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                    {desapegos.length > 0 ? desapegos.slice(0, 5).map(item => (
                        <div key={item.id} className="min-w-[200px] h-48 bg-[#161b22] border border-white/5 rounded-[24px] p-4 flex flex-col justify-between relative group overflow-hidden">
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

            </main>

            {/* BOTTOM NAVIGATION (GOLD) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[#0f111a]/90 backdrop-blur-xl border-t border-amber-500/10 px-6 py-4 flex justify-between items-end z-50 rounded-t-[32px]">
                {[
                    { id: 'home', icon: LayoutGrid, label: 'Home' },
                    { id: 'market', icon: ShoppingBag, label: 'Shop' },
                    { id: 'create', icon: Plus, isBig: true },
                    { id: 'booking', icon: CalendarDays, label: 'Reservas' },
                    { id: 'profile', icon: User, label: 'Perfil' },
                ].map(item => {
                    if (item.isBig) {
                        return (
                            <button key={item.id} className="-mt-12 w-16 h-16 bg-gradient-to-tr from-amber-300 via-amber-500 to-amber-600 rounded-full flex items-center justify-center text-[#0f111a] shadow-xl shadow-amber-500/30 border-4 border-[#0f111a] active:scale-95 transition-transform">
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
