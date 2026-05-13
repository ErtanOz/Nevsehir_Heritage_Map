import React from 'react';
import { HeritageSite } from '../types';
import { getIconConfig } from '../utils/mapIcons';

interface SiteCardProps {
    site: HeritageSite;
    onClick: () => void;
    isActive: boolean;
    onDelete?: () => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({ site, onClick, isActive, onDelete }) => {
    const { path, color } = getIconConfig(site.types, site.isUnesco, site.isUserGenerated);

    return (
        <div
            onClick={onClick}
            className={`group p-4 mb-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative ${isActive ? 'border-amber-500 bg-amber-50 shadow-md translate-x-1' : 'border-gray-50 bg-white hover:border-gray-200 shadow-sm'
                }`}
        >
            {site.isUserGenerated && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            )}
            <div className="flex gap-4 items-center">
                <div className="w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100">
                    {site.image ? (
                        <img
                            src={`https://commons.wikimedia.org/wiki/Special:FilePath/${site.image}?width=200`}
                            alt={site.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${color}10`, color: color }}>
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: path }} />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate leading-tight">{site.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{site.admin}</p>
                    <div className="flex wrap items-center gap-2 mt-2">
                        {site.isUnesco && (
                            <span className="bg-amber-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tight shadow-sm">UNESCO</span>
                        )}
                        {site.isUserGenerated && (
                            <span className="bg-violet-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tight shadow-sm">Landmark</span>
                        )}
                        <span className="text-slate-500 text-[9px] font-medium border border-slate-100 px-1.5 py-0.5 rounded bg-slate-50">{site.types[0] || 'Unknown'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
