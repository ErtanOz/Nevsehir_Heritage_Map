
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RAW_GEOJSON_DATA } from './data';
import { HeritageSite } from './types';

declare const L: any;

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
};

const getIconConfig = (types: string[] = [], isUnesco: boolean = false) => {
  const allTypesStr = types.join(' ').toLowerCase();
  let path = '';
  let color = isUnesco ? '#d97706' : '#4b5563';

  if (allTypesStr.includes('underground') || allTypesStr.includes('unterirdisch') || allTypesStr.includes('untergrund')) {
    color = isUnesco ? '#d97706' : '#78350f';
    path = `<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`;
  } else if (allTypesStr.includes('church') || allTypesStr.includes('kirche') || allTypesStr.includes('kapelle') || allTypesStr.includes('kloster')) {
    color = isUnesco ? '#d97706' : '#2563eb';
    path = `<path d="M12 3v18M8 8h8M6 21h12l-2-10H8l-2 10z" />`;
  } else if (allTypesStr.includes('castle') || allTypesStr.includes('burg') || allTypesStr.includes('festung')) {
    color = isUnesco ? '#d97706' : '#dc2626';
    path = `<path d="M3 21h18M4 21V7l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2v14M9 21v-4a3 3 0 0 1 6 0v4" />`;
  } else if (allTypesStr.includes('museum') || allTypesStr.includes('bibliothek')) {
    color = isUnesco ? '#d97706' : '#059669';
    path = `<path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />`;
  } else if (allTypesStr.includes('höyük') || allTypesStr.includes('tell') || allTypesStr.includes('hügelgrab') || allTypesStr.includes('mound') || allTypesStr.includes('tumulus')) {
    color = isUnesco ? '#d97706' : '#92400e';
    path = `<path d="M12 21a9 9 0 009-9 9 9 0 00-9-9 9 9 0 00-9 9 9 9 0 00 9 9zM12 7v10M7 12h10" />`;
  } else if (allTypesStr.includes('moschee') || allTypesStr.includes('mosque')) {
    color = isUnesco ? '#d97706' : '#0ea5e9';
    path = `<path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />`;
  } else {
    path = `<path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />`;
  }
  return { path, color };
};

const processedSites: HeritageSite[] = Array.from(
  RAW_GEOJSON_DATA.features.reduce((acc, feature) => {
    const id = feature.properties.item;
    if (!acc.has(id)) {
      let imageName = undefined;
      if (feature.properties.image) {
        const parts = feature.properties.image.split('/');
        imageName = parts[parts.length - 1];
      }
      acc.set(id, {
        id: id,
        name: feature.properties.itemLabel,
        types: [],
        coords: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
        image: imageName,
        admin: feature.properties.adminLabel,
        isUnesco: feature.properties.heritageLabel?.toLowerCase().includes('unesco') || false,
        externalLinks: {
          wiki: feature.properties.item,
          kultur: feature.properties.kulturenvanteriID
        }
      });
    }
    const site = acc.get(id)!;
    if (!site.types.includes(feature.properties.typeLabel)) {
      site.types.push(feature.properties.typeLabel);
    }
    return acc;
  }, new Map<string, HeritageSite>()).values()
);

const CATEGORIES = Array.from(new Set(processedSites.flatMap(s => s.types))).sort();

const SiteCard: React.FC<{ site: HeritageSite; onClick: () => void; isActive: boolean; distance?: number }> = ({ site, onClick, isActive, distance }) => {
  const { path, color } = getIconConfig(site.types, site.isUnesco);

  return (
    <div 
      onClick={onClick}
      className={`p-3 mb-2 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
        isActive ? 'border-amber-500 bg-amber-50 shadow-lg translate-x-1' : 'border-gray-50 bg-white hover:border-gray-200'
      }`}
    >
      <div className="flex gap-4 items-center">
        {/* Image or Icon Container */}
        <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100 shadow-sm">
          {site.image ? (
            <img 
              src={`https://commons.wikimedia.org/wiki/Special:FilePath/${site.image}?width=200`} 
              alt={site.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.classList.add('bg-slate-50');
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${color}10`, color: color }}>
              <svg className="w-8 h-8 opacity-70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: path }} />
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-slate-800 text-sm truncate leading-snug">{site.name}</h3>
            {distance !== undefined && (
              <span className="text-[9px] font-black text-amber-600 bg-amber-100/50 px-1.5 py-0.5 rounded-full ml-2">
                {distance.toFixed(1)} km
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{site.admin}</p>
          <div className="flex items-center gap-1.5 mt-2">
            {site.isUnesco && (
              <span className="bg-amber-600 text-white text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase shadow-sm">UNESCO</span>
            )}
            <span className="text-slate-500 text-[10px] font-medium truncate italic">{site.types[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [mapMode, setMapMode] = useState<'standard' | 'satellite'>('standard');
  const [unescoOnly, setUnescoOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const mapRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const layersRef = useRef<{ standard: any; satellite: any }>({ standard: null, satellite: null });

  const filteredSites = useMemo(() => {
    return processedSites.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.admin.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !activeCategory || s.types.includes(activeCategory);
      const matchesUnesco = !unescoOnly || s.isUnesco;
      return matchesSearch && matchesCategory && matchesUnesco;
    }).sort((a, b) => {
      if (userCoords) {
        return getDistance(userCoords[0], userCoords[1], a.coords[0], a.coords[1]) - 
               getDistance(userCoords[0], userCoords[1], b.coords[0], b.coords[1]);
      }
      return 0;
    });
  }, [searchTerm, activeCategory, userCoords, unescoOnly]);

  const selectedSite = useMemo(() => processedSites.find(s => s.id === selectedSiteId), [selectedSiteId]);

  useEffect(() => {
    if (typeof L === 'undefined') return;
    if (mapRef.current) return;

    const map = L.map('map', { zoomControl: false }).setView([38.62, 34.72], 10);
    L.control.zoom({ position: 'topright' }).addTo(map);

    layersRef.current.standard = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { 
      attribution: '&copy; CARTO' 
    });
    layersRef.current.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { 
      attribution: 'Esri' 
    });
    layersRef.current.standard.addTo(map);

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      iconCreateFunction: (cluster: any) => L.divIcon({ 
        html: `<div class="flex items-center justify-center w-full h-full font-black text-white"><span>${cluster.getChildCount()}</span></div>`, 
        className: 'marker-cluster marker-cluster-medium', 
        iconSize: L.point(40, 40) 
      })
    });

    map.addLayer(clusterGroup);
    mapRef.current = map;
    clusterGroupRef.current = clusterGroup;

    updateMarkers(filteredSites);
    window.addEventListener('resize', () => map.invalidateSize());
  }, []);

  const updateMarkers = (sitesToMark: HeritageSite[]) => {
    if (!clusterGroupRef.current || !mapRef.current) return;
    clusterGroupRef.current.clearLayers();
    markersRef.current = {};

    sitesToMark.forEach(site => {
      const { path, color } = getIconConfig(site.types, site.isUnesco);
      const markerIcon = L.divIcon({
        className: 'custom-heritage-icon',
        html: `<div style="background: white; color: ${color}; width: 34px; height: 34px; border-radius: 12px; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15); padding: 4px; position: relative;">
          <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="width: 100%; height: 100%;">${path}</svg>
          ${site.isUnesco ? '<div style="position: absolute; top: -5px; right: -5px; background: #d97706; border-radius: 50%; width: 12px; height: 12px; border: 1.5px solid white;"></div>' : ''}
        </div>`,
        iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -17]
      });

      const marker = L.marker(site.coords, { icon: markerIcon })
        .bindPopup(`<b>${site.name}</b><br><small>${site.admin}</small>`)
        .on('click', () => { setSelectedSiteId(site.id); setViewMode('map'); });
      
      markersRef.current[site.id] = marker;
      clusterGroupRef.current.addLayer(marker);
    });

    if (sitesToMark.length > 0) {
      const group = L.featureGroup(Object.values(markersRef.current));
      mapRef.current.fitBounds(group.getBounds().pad(0.2));
    }
  };

  useEffect(() => { 
    if (mapRef.current) updateMarkers(filteredSites); 
  }, [filteredSites]);

  useEffect(() => {
    if (!mapRef.current || !layersRef.current.standard) return;
    if (mapMode === 'satellite') {
      mapRef.current.removeLayer(layersRef.current.standard);
      mapRef.current.addLayer(layersRef.current.satellite);
    } else {
      mapRef.current.removeLayer(layersRef.current.satellite);
      mapRef.current.addLayer(layersRef.current.standard);
    }
  }, [mapMode]);

  useEffect(() => {
    if (selectedSite && mapRef.current) {
      mapRef.current.flyTo(selectedSite.coords, 16);
      setTimeout(() => markersRef.current[selectedSite.id]?.openPopup(), 400);
    }
  }, [selectedSite]);

  return (
    <div className="flex h-full w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div className={`${viewMode === 'list' ? 'flex' : 'hidden md:flex'} w-full md:w-[420px] bg-white shadow-2xl z-20 flex-col h-full border-r border-slate-100`}>
        <header className="p-6 bg-slate-900 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-inner">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">NEVŞEHİR</h1>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-0.5">Heritage Explorer</p>
            </div>
          </div>
          <button className="md:hidden p-2.5 bg-white/10 rounded-xl text-xs font-bold" onClick={() => setViewMode('map')}>Open Map</button>
        </header>

        <div className="p-5 space-y-4 border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
          <input 
            type="text" placeholder="Search locations..."
            className="w-full px-5 py-3 bg-slate-100 border border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-amber-200 outline-none transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button onClick={() => setActiveCategory(null)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${!activeCategory ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>All</button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>{cat}</button>
            ))}
          </div>
          <button onClick={() => setUnescoOnly(!unescoOnly)} className={`flex items-center justify-between w-full px-5 py-3 rounded-2xl text-[11px] font-black uppercase transition-all border-2 ${unescoOnly ? 'bg-amber-500 text-white border-amber-600 shadow-md' : 'bg-white text-amber-600 border-amber-100'}`}>
            <span>UNESCO ONLY</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${unescoOnly ? 'bg-white/30' : 'bg-amber-100'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${unescoOnly ? 'right-0.5 bg-white' : 'left-0.5 bg-amber-500'}`} />
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-1 bg-slate-50/50">
          <div className="mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            {filteredSites.length} LOCATIONS
          </div>
          {filteredSites.map(site => (
            <SiteCard 
              key={site.id} 
              site={site} 
              onClick={() => { setSelectedSiteId(site.id); setViewMode('map'); }} 
              isActive={selectedSiteId === site.id} 
              distance={userCoords ? getDistance(userCoords[0], userCoords[1], site.coords[0], site.coords[1]) : undefined} 
            />
          ))}
          {filteredSites.length === 0 && (
             <div className="text-center py-24 opacity-20 grayscale">
               <div className="text-6xl mb-4">🗿</div>
               <p className="font-black text-sm">NO HERITAGE FOUND</p>
             </div>
          )}
        </div>
      </div>

      {/* Map Content */}
      <div className={`${viewMode === 'map' ? 'block' : 'hidden md:block'} flex-1 relative h-full bg-slate-200`}>
        <div id="map" className="h-full w-full z-0"></div>
        
        <button onClick={() => setViewMode('list')} className="md:hidden absolute top-6 left-6 px-6 py-3 bg-white rounded-2xl shadow-2xl z-[1000] font-black text-[11px] uppercase border border-slate-100 flex items-center gap-2">
          <span>←</span> Back to List
        </button>

        <div className="absolute top-6 right-6 flex flex-col gap-3 z-[1000]">
          <button onClick={() => setMapMode(mapMode === 'standard' ? 'satellite' : 'standard')} className="p-4 bg-white rounded-2xl shadow-2xl border-2 border-white hover:bg-slate-50 transition-transform active:scale-95 group" title="Toggle Satellite">
            <svg className={`w-6 h-6 ${mapMode === 'satellite' ? 'text-emerald-600' : 'text-slate-600'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
          </button>
        </div>

        {selectedSite && (
          <div className="absolute bottom-8 right-8 left-8 md:left-auto md:w-[480px] bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] z-[1000] overflow-hidden border border-white p-10 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <button onClick={() => setSelectedSiteId(null)} className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors z-10">✕</button>
            {selectedSite.image && (
              <div className="h-64 w-full mb-8 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white relative group">
                <img src={`https://commons.wikimedia.org/wiki/Special:FilePath/${selectedSite.image}?width=800`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={selectedSite.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            )}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSite.types.map(t => <span key={t} className="text-[10px] font-black bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">{t}</span>)}
              </div>
              <h2 className="text-3xl font-black mb-1 leading-tight text-slate-900">{selectedSite.name}</h2>
              <p className="text-sm font-bold text-amber-600 uppercase tracking-widest">{selectedSite.admin}, NEVŞEHİR</p>
            </div>
            <div className="flex gap-4">
              <a href={selectedSite.externalLinks.wiki} target="_blank" rel="noreferrer" className="flex-1 text-center py-5 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">Open Wiki</a>
              {selectedSite.externalLinks.kultur && (
                <a href={`https://kulturenvanteri.com/yer/${selectedSite.externalLinks.kultur}`} target="_blank" rel="noreferrer" className="flex-1 text-center py-5 bg-slate-100 text-slate-900 rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Archive Link</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
