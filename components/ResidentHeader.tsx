import React from 'react';
import { Bell, QrCode } from 'lucide-react';

interface ResidentHeaderProps {
    onQrCodeClick?: () => void;
    onNotificationsClick?: () => void;
    notificationCount?: number;
    className?: string;
}

export const ResidentHeader: React.FC<ResidentHeaderProps> = ({
    onQrCodeClick,
    onNotificationsClick,
    notificationCount = 0,
    className = '',
}) => {
    return (
        <header className={`px-6 pt-12 pb-4 flex items-center justify-between bg-white sticky top-0 z-40 transition-shadow ${className}`}>
            {/* Logo Section */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#7C3AED] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                    {/* Simple Icon Representation for Splendido - Diamond shape or S */}
                    <div className="w-4 h-4 bg-white rotate-45 rounded-sm"></div>
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>Splendido</h1>
            </div>

            {/* Actions Section */}
            <div className="flex gap-3">
                <button
                    onClick={onQrCodeClick}
                    className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-[#7C3AED] hover:bg-purple-100 active:scale-95 transition-all border border-purple-100"
                >
                    <QrCode size={20} />
                </button>
                <button
                    onClick={onNotificationsClick}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 relative hover:bg-slate-50 active:scale-95 transition-all border border-slate-100 shadow-sm"
                >
                    <Bell size={20} />
                    {notificationCount > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                    )}
                </button>
            </div>
        </header>
    );
};
