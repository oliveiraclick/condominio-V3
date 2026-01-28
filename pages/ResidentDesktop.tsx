import React from 'react';
import {
    Sparkles, Package, Star, Calendar,
    Zap, Droplets, Leaf, Building2, ChevronRight,
    Megaphone, ShoppingBag, LayoutGrid, Clock
} from 'lucide-react';

const QuickActionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string;
    onClick: () => void;
}> = ({ title, description, icon, colorClass, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer group hover:shadow-lg hover:border-brand-100 transition-all duration-300"
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${colorClass}`}>
            {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
);

const NoticeWidget: React.FC = () => (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                    <Megaphone size={20} className="text-amber-400" />
                </div>
                <h3 className="font-bold text-lg">Mural de Avisos</h3>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Manutenção</span>
                        <span className="text-[10px] text-slate-400">Há 2 horas</span>
                    </div>
                    <p className="text-sm font-medium leading-snug">Limpeza da caixa d'água agendada para sábado (29/01).</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Social</span>
                        <span className="text-[10px] text-slate-400">Ontem</span>
                    </div>
                    <p className="text-sm font-medium leading-snug">Festa junina do condomínio: Inscrições abertas!</p>
                </div>
            </div>

            <button className="w-full mt-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-widest transition-all">Ver todos</button>
        </div>
        {/* Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
    </div>
);

export const ResidentDesktop: React.FC<{
    currentUser: any;
    onNavigate: (target: string) => void;
    onSelectCategory: (cat: string) => void;
    packages: any[];
}> = ({ currentUser, onNavigate, onSelectCategory, packages }) => {

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. WELCOME BANNER (Desktop Version) */}
            <div className="w-full bg-gradient-to-r from-brand-900 to-slate-900 rounded-[40px] text-white overflow-hidden shadow-2xl relative">
                <div className="px-12 py-16 relative z-10 flex items-center justify-between">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-widest mb-6">
                            <Sparkles size={14} />
                            <span>Painel do Morador</span>
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter mb-6 leading-tight">
                            Bem-vindo, {currentUser?.name?.split(' ')[0]}. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-400">Tudo sob controle hoje?</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-lg mb-10 leading-relaxed">
                            Acesse rapidamente seus pagamentos, reservas e encomendas. Seu condomínio, simplificado.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => onNavigate('market')} className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2">
                                <ShoppingBag size={18} />
                                Acessar e-Shop
                            </button>
                            <button onClick={() => onNavigate('chamado')} className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm backdrop-blur-sm transition-all hover:-translate-y-1 active:scale-95">
                                Abrir Chamado
                            </button>
                        </div>
                    </div>

                    {/* 3D Illustration / Graphic */}
                    <div className="hidden xl:block relative pr-12">
                        <div className="w-96 h-96 bg-brand-500/10 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-[40px] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 w-80">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                                    <Package size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-white">Encomendas</h4>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Última atualização: Hoje</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {packages.slice(0, 3).map((pkg, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                                        <span className="text-sm font-medium text-slate-200">{pkg.description || 'Encomenda #' + pkg.id.substring(0, 4)}</span>
                                        <div className={`w-2 h-2 rounded-full ${pkg.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                                    </div>
                                ))}
                                {packages.length === 0 && (
                                    <p className="text-sm text-slate-500 text-center py-4">Nenhuma encomenda pendente.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-brand-900/40 to-transparent"></div>
            </div>

            {/* 2. MAIN GRID LAYOUT */}
            <div className="grid grid-cols-12 gap-8">

                {/* LEFT COLUMN (Widgets) - Span 8 */}
                <div className="col-span-12 xl:col-span-8 space-y-8">

                    {/* Quick Services Grid */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                            <Sparkles className="text-brand-500" size={24} />
                            Serviços Rápidos
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <QuickActionCard
                                title="Encanador"
                                description="Vazamentos e reparos hidráulicos urgentes."
                                icon={<Droplets size={24} className="text-cyan-600" />}
                                colorClass="bg-cyan-50"
                                onClick={() => onSelectCategory('Encanador')}
                            />
                            <QuickActionCard
                                title="Eletricista"
                                description="Instalações, reparos e manutenção elétrica."
                                icon={<Zap size={24} className="text-amber-500" />}
                                colorClass="bg-amber-50"
                                onClick={() => onSelectCategory('Eletricista')}
                            />
                            <QuickActionCard
                                title="Limpeza"
                                description="Faxina completa e limpeza pós-obra."
                                icon={<Sparkles size={24} className="text-emerald-500" />}
                                colorClass="bg-emerald-50"
                                onClick={() => onSelectCategory('Limpeza')}
                            />
                            <QuickActionCard
                                title="J jardinagem"
                                description="Poda, paisagismo e manutenção de jardim."
                                icon={<Leaf size={24} className="text-green-600" />}
                                colorClass="bg-green-50"
                                onClick={() => onSelectCategory('Jardinagem')}
                            />
                            <QuickActionCard
                                title="Reservar Área"
                                description="Salão de festas, churrasqueira e mais."
                                icon={<Calendar size={24} className="text-brand-600" />}
                                colorClass="bg-brand-50"
                                onClick={() => onNavigate('condo-agenda')}
                            />
                            <QuickActionCard
                                title="Ver Todos"
                                description="Explore mais de 20 categorias de serviços."
                                icon={<LayoutGrid size={24} className="text-slate-600" />}
                                colorClass="bg-slate-100"
                                onClick={() => onSelectCategory('Todos')}
                            />
                        </div>
                    </section>

                    {/* Pending Packages Table (Replacing Cards) */}
                    <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Minhas Encomendas</h2>
                            <button className="text-brand-600 text-sm font-bold uppercase tracking-wider hover:text-brand-700">Ver Histórico</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                    <tr>
                                        <th className="px-8 py-4">Descrição</th>
                                        <th className="px-8 py-4">Recebido em</th>
                                        <th className="px-8 py-4">Código</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {packages.length > 0 ? packages.map((pkg) => (
                                        <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-4 font-medium text-slate-800">{pkg.description || 'Encomenda sem descrição'}</td>
                                            <td className="px-8 py-4 text-slate-500 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} />
                                                    {new Date(pkg.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 font-mono text-xs text-slate-400">{pkg.tracking_code || '-'}</td>
                                            <td className="px-8 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${pkg.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                        pkg.status === 'picked_up' ? 'bg-slate-100 text-slate-500' :
                                                            'bg-brand-100 text-brand-600'
                                                    }`}>
                                                    {pkg.status === 'pending' ? 'Aguardando' : 'Entregue'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <button className="text-slate-400 hover:text-brand-600 transition-colors">
                                                    <ChevronRight size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">
                                                Nenhuma encomenda pendente no momento.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>

                {/* RIGHT COLUMN (Utilities) - Span 4 */}
                <div className="col-span-12 xl:col-span-4 space-y-8">
                    <NoticeWidget />

                    {/* Calendar Widget Placeholder */}
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800">Próximos Eventos</h3>
                            <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-500">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-center">
                                <div className="text-center w-12 bg-slate-50 rounded-xl p-2 shrink-0">
                                    <span className="block text-xs font-black text-slate-400 uppercase">Jan</span>
                                    <span className="block text-lg font-black text-slate-800">28</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">Assembléia Geral</h4>
                                    <p className="text-xs text-slate-400">Salão de Festas • 19:00</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-center opacity-50">
                                <div className="text-center w-12 bg-slate-50 rounded-xl p-2 shrink-0">
                                    <span className="block text-xs font-black text-slate-400 uppercase">Fev</span>
                                    <span className="block text-lg font-black text-slate-800">05</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">Dedetização</h4>
                                    <p className="text-xs text-slate-400">Áreas Comuns • 08:00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
