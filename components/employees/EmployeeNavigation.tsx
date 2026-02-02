import React from 'react';
import { Home, Package, MessageSquare, CheckSquare, Settings } from 'lucide-react';
import { useEmployeePermissions } from '../hooks/useEmployeePermissions';
import { colors } from '../design-system/tokens';

interface EmployeeNavigationProps {
    activeTab: string;
    onChange: (tab: string) => void;
    currentUser: any;
}

export const EmployeeNavigation: React.FC<EmployeeNavigationProps> = ({
    activeTab,
    onChange,
    currentUser,
}) => {
    const { hasPermission } = useEmployeePermissions(currentUser);

    // Define navigation items based on permissions
    const navItems = [
        { id: 'home', icon: <Home size={24} />, label: 'Início', show: true },
        { id: 'tasks', icon: <CheckSquare size={24} />, label: 'Tarefas', show: hasPermission('tasks') },
        { id: 'packages', icon: <Package size={24} />, label: 'Encomendas', show: hasPermission('packages') },
        { id: 'communication', icon: <MessageSquare size={24} />, label: 'Avisos', show: hasPermission('communication') },
        { id: 'settings', icon: <Settings size={24} />, label: 'Perfil', show: true },
    ].filter(item => item.show);

    return (
        <div
            className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-4 flex justify-between items-center z-40 max-w-md mx-auto"
            style={{
                borderTop: `1px solid ${colors.neutral[200]}`,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }}
        >
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onChange(item.id)}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id
                        ? 'text-blue-600 scale-110 drop-shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                    style={{
                        color: activeTab === item.id ? colors.brand[600] : colors.neutral[400],
                    }}
                >
                    {item.icon}
                    <span className="text-[10px] font-bold uppercase">{item.label}</span>
                </button>
            ))}
        </div>
    );
};
