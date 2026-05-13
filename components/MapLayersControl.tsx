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
                                <div className="w-full aspect-video rounded-lg bg-amber-200 overflow-hidden"><img src="https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/10/619/913" className="w-full h-full object-cover" alt="3d" /></div>
                                <span className="text-[9px] font-bold uppercase">3D Relief</span>
                            </button>
                            <button onClick={() => setMapType('photorealistic')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${mapType === 'photorealistic' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                <div className="w-full aspect-video rounded-lg bg-blue-200 overflow-hidden"><img src="https://mt1.google.com/vt/lyrs=s&x=619&y=913&z=10" className="w-full h-full object-cover" alt="photorealistic" /></div>
                                <span className="text-[9px] font-bold uppercase">Google 3D</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
