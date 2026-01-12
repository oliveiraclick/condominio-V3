import React from 'react';

export const MuralSkeleton = () => {
    return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex items-start gap-4 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                            <div className="h-2 bg-slate-100 rounded w-1/4"></div>
                        </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded w-full mb-1"></div>
                    <div className="h-2 bg-slate-100 rounded w-2/3 mb-4"></div>
                    <div className="h-12 bg-slate-100 rounded-2xl w-full"></div>
                </div>
            ))}
        </div>
    );
};

export const LeadsSkeleton = () => {
    return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-2 bg-slate-100 rounded w-1/3"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};
