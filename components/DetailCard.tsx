import React from 'react';
import { HeritageSite } from '../types';

interface DetailCardProps {
    site: HeritageSite;
    onClose: () => void;
}

export const DetailCard: React.FC<DetailCardProps> = ({ site, onClose }) => {
    return (
        <div className="absolute bottom-8 right-8 left-8 md:left-auto md:w-[480px] bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] z-[1000] overflow-hidden border border-white p-10 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 z-10 transition-colors">✕</button>
            {site.image && (
                <div className="h-64 w-full mb-8 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white relative group">
                    <img src={`https://commons.wikimedia.org/wiki/Special:FilePath/${site.image}?width=800`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={site.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            )}
            <div className="mb-8">
                <h2 className="text-3xl font-black mb-1 leading-tight text-slate-900">{site.name}</h2>
                <p className="text-sm font-bold text-amber-600 uppercase tracking-widest">{site.admin}, NEVŞEHİR</p>
                <div className="flex gap-2 mt-4">
                    {site.types.map(t => <span key={t} className="text-[9px] font-black bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">{t}</span>)}
                </div>
            </div>
            <div className="flex gap-4">
                <a href={site.externalLinks.wiki} target="_blank" rel="noreferrer" className="flex-1 text-center py-5 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">Wikipedia</a>
                {site.externalLinks.kultur && (
                    <a href={`https://kulturenvanteri.com/yer/${site.externalLinks.kultur}`} target="_blank" rel="noreferrer" className="flex-1 text-center py-5 bg-slate-100 text-slate-900 rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Archive</a>
                )}
            </div>
        </div>
    );
};
