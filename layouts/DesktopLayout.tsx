import React, { useState } from 'react';
import {
    LayoutGrid, ShoppingBag, Calendar, Users, FileText,
    LogOut, Bell, Search, Menu, Settings, HelpCircle,
    Building2, ChevronRight, User
} from 'lucide-react';
import { UserRole } from '../types';

interface DesktopLayoutProps {
    children: React.ReactNode;
    currentUser: any;
    activeTab: string;
    onNavigate: (tab: string) => void;
    onLogout: () => void;
}

const SidebarItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
            ? 'bg-brand-50 text-brand-600 font-bold shadow-sm'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`}
    >
        <div className={`transition-colors ${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {icon}
        </div>
        <span className="text-sm tracking-tight">{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-600"></div>}
    </button>
);

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
    children, currentUser, activeTab, onNavigate, onLogout
}) => {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* SIDEBAR */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 shadow-xl shadow-slate-200/50">
                {/* Sidebar Header */}
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">CondoHub</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Enterprise</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    <div className="px-4 pb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal</p>
                    </div>
                    <SidebarItem icon={<LayoutGrid size={20} />} label="Visão Geral" isActive={activeTab === 'home' || activeTab === 'resident'} onClick={() => onNavigate('home')} />
                    <SidebarItem icon={<ShoppingBag size={20} />} label="e-Shop & Desapego" isActive={activeTab === 'market'} onClick={() => onNavigate('market')} />
                    <SidebarItem icon={<Calendar size={20} />} label="Agendamentos" isActive={activeTab === 'condo-agenda'} onClick={() => onNavigate('condo-agenda')} />
                    <SidebarItem icon={<FileText size={20} />} label="Minhas Faturas" isActive={activeTab === 'financeiro'} onClick={() => onNavigate('financeiro')} />

                    <div className="px-4 pb-2 pt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comunidade</p>
                    </div>
                    <SidebarItem icon={<Users size={20} />} label="Mural & Avisos" isActive={activeTab === 'communication'} onClick={() => onNavigate('chamado')} />
                    <SidebarItem icon={<Settings size={20} />} label="Configurações" isActive={activeTab === 'settings'} onClick={() => onNavigate('settings')} />
                    <SidebarItem icon={<HelpCircle size={20} />} label="Ajuda e Suporte" isActive={activeTab === 'support'} onClick={() => onNavigate('support')} />
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm cursor-pointer hover:border-brand-200 transition-colors" onClick={() => onNavigate('profile')}>
                        <img
                            src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`}
                            className="w-10 h-10 rounded-xl bg-slate-100"
                            alt="User"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 truncate">{currentUser?.name}</h4>
                            <p className="text-xs text-slate-500 truncate">{currentUser?.condo}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative">
                {/* Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
                    {/* Search */}
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <div className="relative w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Pesquisar serviços, vizinhos, avisos..."
                                className="w-full h-12 bg-slate-100 rounded-2xl pl-12 pr-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4 pl-8">
                        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm active:scale-95 relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <button className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors">
                            <span className="hidden xl:inline">Precisa de ajuda?</span>
                            <HelpCircle size={18} />
                        </button>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-7xl mx-auto pb-20">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
