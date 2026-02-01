import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import {
    Dumbbell, MessageSquare, Car, LogOut, LayoutGrid, Users,
    ShieldCheck, Calendar, Bell, Search, ChevronRight, TrendingUp,
    AlertTriangle, DollarSign, Box, ClipboardCheck, User, CheckSquare
} from 'lucide-react';

import { PackagePickupFlow } from '../components/PackagePickupFlow';

export const AdminDashboardModern: React.FC<{ onNavigate: (screen: string) => void, onLogout: () => void, currentUser?: any }> = ({ onNavigate, onLogout, currentUser }) => {
    const [activeMenu, setActiveMenu] = useState('overview');
    const [counts, setCounts] = useState({ residents: 0, incidents: 0, reservations: 0, accessToday: 0 });
    const [pickupFlowOpen, setPickupFlowOpen] = useState(false);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [chartData, setChartData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Residents
            const { count: resCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'resident');

            // 2. Incidents (Open)
            const { count: incCount } = await supabase.from('service_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'open']);

            // 3. Reservations (Today)
            const today = new Date().toISOString().split('T')[0];
            const { count: resvCount } = await supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('date', today);

            // 4. Access Today
            const { count: accCount } = await supabase.from('access_logs').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

            setCounts({
                residents: resCount || 0,
                incidents: incCount || 0,
                reservations: resvCount || 0,
                accessToday: accCount || 0
            });

            // 5. Recent Activity
            const { data: logs } = await supabase.from('access_logs').select('*, profiles(name)').order('created_at', { ascending: false }).limit(4);
            if (logs) {
                setRecentActivity(logs.map(l => ({
                    user: l.profiles?.name || 'Visitante',
                    action: l.event_type === 'entry_granted' ? 'Acesso liberado' : 'Acesso negado',
                    time: new Date(l.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    icon: ShieldCheck,
                    color: l.event_type === 'entry_granted' ? 'text-emerald-400' : 'text-rose-400'
                })));
            }

            // 6. Chart Data (Last 12 hours)
            const { data: chartLogs } = await supabase.from('access_logs').select('created_at').gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString());
            if (chartLogs) {
                const hours = new Array(12).fill(0);
                const now = new Date();
                chartLogs.forEach(l => {
                    const logDate = new Date(l.created_at);
                    const diff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60));
                    if (diff >= 0 && diff < 12) {
                        hours[11 - diff]++;
                    }
                });
                // Normalize for visualization (max height 100)
                const max = Math.max(...hours, 1);
                setChartData(hours.map(h => Math.min(100, (h / max) * 100)));
            }
        };

        fetchData();
    }, []);

    const stats = [
        { label: 'Moradores', value: counts.residents.toString(), change: '+12%', icon: Users, color: 'text-brand-400', bg: 'bg-brand-400/10' },
        { label: 'Ocorrências', value: counts.incidents.toString().padStart(2, '0'), change: '-2%', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { label: 'Reservas Hoje', value: counts.reservations.toString(), change: '+5%', icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Acessos Hoje', value: counts.accessToday.toString(), change: '+23%', icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    ];

    return (
        <div className="min-h-screen bg-[#0f111a] text-slate-200 font-sans selection:bg-brand-500/30">

            {/* Sidebar Navigation */}
            <aside className="fixed left-0 top-0 bottom-0 w-20 xl:w-64 bg-[#161b22]/50 backdrop-blur-xl border-r border-white/5 flex flex-col items-center xl:items-stretch py-8 z-50">
                <div className="mb-12 px-4 flex items-center gap-3 justify-center xl:justify-start">
                    <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <LayoutGrid className="text-white" size={20} />
                    </div>
                    <span className="hidden xl:block font-bold text-xl tracking-tight text-white">Admin<span className="text-brand-500">Pro</span></span>
                </div>

                <nav className="flex-1 space-y-2 px-2">
                    {[
                        { id: 'overview', icon: LayoutGrid, label: 'Visão Geral' },
                        { id: 'admin-residents', icon: Users, label: 'Moradores' },
                        { id: 'package-receipt', icon: Box, label: 'Receber (Lote)' },
                        { id: 'package-processing', icon: ClipboardCheck, label: 'Triagem' },
                        { id: 'package-pickup', icon: User, label: 'Retirada' },
                        { id: 'tasks', icon: CheckSquare, label: 'Tarefas' },
                        { id: 'admin-incidents', icon: AlertTriangle, label: 'Ocorrências' },
                        { id: 'admin-reservations', icon: Calendar, label: 'Reservas' },
                        { id: 'admin-access', icon: ShieldCheck, label: 'Portaria (Acesso)' },
                        { id: 'admin-finance', icon: DollarSign, label: 'Financeiro' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'package-pickup') {
                                    setPickupFlowOpen(true);
                                } else {
                                    setActiveMenu(item.id);
                                    onNavigate(item.id);
                                }
                            }}
                            className={`w-full p-3 rounded-xl flex items-center gap-4 transition-all duration-300 group
                ${activeMenu === item.id
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <item.icon size={22} className={activeMenu === item.id ? 'animate-pulse' : ''} />
                            <span className="hidden xl:block text-sm font-medium">{item.label}</span>
                            {activeMenu === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white hidden xl:block" />}
                        </button>
                    ))}
                </nav>

                <div className="px-2 mt-auto">
                    <button
                        onClick={() => {
                            if (window.confirm('Deseja realmente sair do Painel Admin?')) {
                                onLogout();
                            }
                        }}
                        className="w-full p-3 rounded-xl flex items-center gap-4 text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                        <LogOut size={22} />
                        <span className="hidden xl:block text-sm font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pl-20 xl:pl-64">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0f111a]/80 backdrop-blur-sm sticky top-0 z-40">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Olá, Gestor</h1>
                        <p className="text-xs text-slate-500">Bem-vindo ao painel de controle</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="bg-[#181b25] border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all w-64"
                            />
                        </div>
                        <button className="relative w-10 h-10 rounded-full bg-[#181b25] border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#181b25]" />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-fuchsia-500 p-[2px]">
                            <img src="https://github.com/shadcn.png" className="w-full h-full rounded-full border-2 border-[#0f111a]" alt="Admin" />
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-8 space-y-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-[#161b22] border border-white/5 p-6 rounded-2xl hover:border-brand-500/20 transition-colors group relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-opacity-100 transition-all duration-500`} />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                            <stat.icon size={24} />
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                                    <p className="text-sm text-slate-500">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts & Activity Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Dynamic Activity Chart (Live Data) */}
                        <div className="lg:col-span-2 bg-[#161b22] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <TrendingUp size={18} className="text-brand-500" />
                                    Atividade do Condomínio
                                </h3>
                                <select className="bg-[#0f111a] border border-white/5 text-xs rounded-lg px-3 py-1.5 text-slate-400 outline-none">
                                    <option>Últimos 7 dias</option>
                                    <option>Este Mês</option>
                                </select>
                            </div>

                            <div className="h-64 flex items-end justify-between gap-2 px-4">
                                {chartData.map((h, i) => (
                                    <div key={i} className="w-full bg-[#0f111a] rounded-t-lg relative group">
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-600/50 to-indigo-500 rounded-t-lg transition-all duration-500 group-hover:from-brand-500 group-hover:to-fuchsia-500"
                                            style={{ height: `${h}%` }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 text-xs text-slate-500 px-4">
                                <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span>
                                <span>Jul</span><span>Ago</span><span>Set</span><span>Out</span><span>Nov</span><span>Dez</span>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
                            <h3 className="font-bold text-white mb-6">Atividade Recente</h3>
                            <div className="space-y-6">
                                {recentActivity.length === 0 ? (
                                    <p className="text-xs text-slate-500 text-center py-4">Nenhuma atividade recente</p>
                                ) : recentActivity.map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-lg bg-white/5 ${item.color}`}>
                                            <item.icon size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-300 font-medium">{item.user}</p>
                                            <p className="text-xs text-slate-500">{item.action}</p>
                                        </div>
                                        <span className="ml-auto text-[10px] text-slate-600 whitespace-nowrap">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-3 rounded-xl border border-white/5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-2">
                                Ver Todo Histórico
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <PackagePickupFlow
                open={pickupFlowOpen}
                onClose={() => setPickupFlowOpen(false)}
                currentUser={currentUser || { name: 'Admin', id: 'admin' }}
            />
        </div>
    );
};
