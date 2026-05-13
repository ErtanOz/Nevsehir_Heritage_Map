import React, { useState } from 'react';

type MapType = 'standard' | 'satellite' | 'terrain' | '3d' | 'photorealistic';

interface MapLayersControlProps {
    mapType: MapType;
    setMapType: (type: MapType) => void;
}

export const MapLayersControl: React.FC<MapLayersControlProps> = ({ mapType, setMapType }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-6 py-3 bg-white/95 backdrop-blur rounded-2xl shadow-2xl font-black text-[11px] uppercase border border-slate-100 flex items-center gap-2 hover:bg-white transition-all active:scale-95"
            >
                Map Layers
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-slate-100 rounded-3xl shadow-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Map</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setMapType('standard')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${mapType === 'standard' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                <div className="w-full aspect-video rounded-lg bg-slate-200 overflow-hidden"><img src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/10/619/913" className="w-full h-full object-cover" alt="standard" /></div>
                                <span className="text-[9px] font-bold uppercase">Standard</span>
                            </button>
                            <button onClick={() => setMapType('satellite')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${mapType === 'satellite' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                <div className="w-full aspect-video rounded-lg bg-slate-900 overflow-hidden"><img src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/619/913" className="w-full h-full object-cover" alt="satellite" /></div>
                                <span className="text-[9px] font-bold uppercase">Satellite</span>
                            </button>
                            <button onClick={() => setMapType('terrain')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${mapType === 'terrain' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                <div className="w-full aspect-video rounded-lg bg-green-200 overflow-hidden"><img src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/10/619/913" className="w-full h-full object-cover" alt="terrain" /></div>
                                <span className="text-[9px] font-bold uppercase">Terrain</span>
                            </button>
                            <button onClick={() => setMapType('3d')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${mapType === '3d' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                <div className="w-full aspect-video rounded-lg bg-amber-200 overflow-hidden"><img src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/619/913" className="w-full h-full object-cover" alt="3d" /></div>
                                <span className="text-[9px] font-bold uppercase">3D Terrain</span>
                            </button>
                            <button onClick={() => setMapType('photorealistic')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${mapType === 'photorealistic' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-sky-200 via-emerald-100 to-stone-300 shadow-inner">
                                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(150deg,#4d7c0f_0%,#65a30d_36%,#78716c_37%,#a8a29e_58%,#166534_59%,#22c55e_100%)] [clip-path:polygon(0_58%,22%_34%,38%_48%,56%_16%,78%_46%,100%_24%,100%_100%,0_100%)]" />
                                    <div className="absolute left-[18%] top-[34%] h-5 w-6 -skew-y-12 rounded-sm bg-white/85 shadow-md ring-1 ring-black/10" />
                                    <div className="absolute left-[48%] top-[24%] h-7 w-8 -skew-y-12 rounded-sm bg-stone-50/90 shadow-lg ring-1 ring-black/10" />
                                    <div className="absolute right-2 top-2 rounded-md bg-white/95 px-1.5 py-0.5 text-[8px] font-black text-slate-800 shadow-sm ring-1 ring-black/10">3D</div>
                                </div>
                                <span className="text-[9px] font-bold uppercase">Google 3D</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
