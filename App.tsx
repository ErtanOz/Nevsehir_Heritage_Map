
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RAW_GEOJSON_DATA } from './data';
import { HeritageSite } from './types';

declare const L: any;

const getIconConfig = (types: string[] = [], isUnesco: boolean = false) => {
  const allTypesStr = types.join(' ').toLowerCase();
  let path = '';
  let color = isUnesco ? '#d97706' : '#4b5563';

  if (allTypesStr.includes('underground') || allTypesStr.includes('unterirdisch')) {
    color = isUnesco ? '#d97706' : '#78350f';
    path = `<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`;
  } else if (allTypesStr.includes('church') || allTypesStr.includes('kirche') || allTypesStr.includes('kapelle')) {
    color = isUnesco ? '#d97706' : '#2563eb';
    path = `<path d="M12 3v18M8 8h8M6 21h12l-2-10H8l-2 10z" />`;
  } else if (allTypesStr.includes('castle') || allTypesStr.includes('burg') || allTypesStr.includes('festung')) {
    color = isUnesco ? '#d97706' : '#dc2626';
    path = `<path d="M3 21h18M4 21V7l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2v14M9 21v-4a3 3 0 0 1 6 0v4" />`;
  } else if (allTypesStr.includes('museum')) {
    color = isUnesco ? '#d97706' : '#059669';
    path = `<path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />`;
  } else if (allTypesStr.includes('cave') || allTypesStr.includes('höhle')) {
    color = isUnesco ? '#d97706' : '#64748b';
    path = `<path d="M12 21a9 9 0 110-18 9 9 0 010 18zM9 12h6" />`;
  } else if (allTypesStr.includes('chimney') || allTypesStr.includes('kamin')) {
    color = isUnesco ? '#d97706' : '#f97316';
    path = `<path d="M12 2L4 22h16L12 2zM12 7l3 9H9l3-9z" />`;
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

const CATEGORIES = ["ALL", "ARCHAEOLOGICAL SITE", "CAVE", "FAIRY CHIMNEY", "MUSEUM", "ROCK CHURCH"];

const SiteCard: React.FC<{ site: HeritageSite; onClick: () => void; isActive: boolean }> = ({ site, onClick, isActive }) => {
  const { path, color } = getIconConfig(site.types, site.isUnesco);

  return (
    <div 
      onClick={onClick}
      className={`p-4 mb-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
        isActive ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-50 bg-white hover:border-gray-200 shadow-sm'
      }`}
    >
      <div className="flex gap-4 items-center">
        {/* Thumbnail: Image if exists, else Icon */}
        <div className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100">
          {site.image ? (
            <img 
              src={`https://commons.wikimedia.org/wiki/Special:FilePath/${site.image}?width=200`} 
              alt={site.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${color}10`, color: color }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: path }} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-base truncate leading-tight">{site.name}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{site.admin}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {site.isUnesco && (
              <span className="bg-amber-600 text-white text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tight shadow-sm">UNESCO</span>
            )}
            <span className="text-slate-500 text-[10px] font-medium border border-slate-100 px-2 py-0.5 rounded-md bg-slate-50">{site.types[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [unescoOnly, setUnescoOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const mapRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  const filteredSites = useMemo(() => {
    return processedSites.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.admin.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'ALL' || s.types.some(t => t.toUpperCase().includes(activeCategory));
      const matchesUnesco = !unescoOnly || s.isUnesco;
      return matchesSearch && matchesCategory && matchesUnesco;
    });
  }, [searchTerm, activeCategory, unescoOnly]);

  const selectedSite = useMemo(() => processedSites.find(s => s.id === selectedSiteId), [selectedSiteId]);

  useEffect(() => {
    if (typeof L === 'undefined') return;
    if (mapRef.current) return;

    const map = L.map('map', { zoomControl: false }).setView([38.62, 34.72], 10);
    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { 
      attribution: '&copy; CARTO' 
    }).addTo(map);

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
        className: 'custom-heritage-marker',
        html: `<div style="background: white; color: ${color}; width: 36px; height: 36px; border-radius: 14px; border: 3px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); position: relative;">
          <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="width: 20px; height: 20px;">${path}</svg>
          ${site.isUnesco ? '<div style="position: absolute; top: -6px; right: -6px; background: #d97706; border-radius: 50%; width: 14px; height: 14px; border: 2px solid white;"></div>' : ''}
        </div>`,
        iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18]
      });

      const marker = L.marker(site.coords, { icon: markerIcon })
        .bindPopup(`<b>${site.name}</b>`)
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
    if (selectedSite && mapRef.current) {
      mapRef.current.flyTo(selectedSite.coords, 16);
      setTimeout(() => markersRef.current[selectedSite.id]?.openPopup(), 300);
    }
  }, [selectedSite]);

  return (
    <div className="flex h-full w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar - Matching user's screenshot layout */}
      <div className={`${viewMode === 'list' ? 'flex' : 'hidden md:flex'} w-full md:w-[440px] bg-white shadow-2xl z-20 flex-col h-full border-r border-slate-100`}>
        <div className="p-6 pb-0">
          <input 
            type="text" placeholder="Search..."
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all placeholder-slate-400"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div className="flex gap-2 overflow-x-auto py-5 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-sm ${activeCategory === cat ? 'bg-amber-600 text-white scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between px-5 py-4 mb-4 rounded-2xl border-2 border-amber-100 bg-amber-50/30">
            <span className="text-amber-700 text-xs font-black uppercase tracking-widest">UNESCO ONLY</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={unescoOnly} onChange={() => setUnescoOnly(!unescoOnly)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-1">
          <div className="mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {filteredSites.length} LOCATIONS
          </div>
          {filteredSites.map(site => (
            <SiteCard 
              key={site.id} 
              site={site} 
              onClick={() => { setSelectedSiteId(site.id); setViewMode('map'); }} 
              isActive={selectedSiteId === site.id} 
            />
          ))}
          {filteredSites.length === 0 && (
             <div className="text-center py-24 opacity-20 flex flex-col items-center">
               <span className="text-6xl">🏛️</span>
               <p className="font-black text-xs mt-4 tracking-widest uppercase">No locations match your filters</p>
             </div>
          )}
        </div>
      </div>

      {/* Map Side */}
      <div className={`${viewMode === 'map' ? 'block' : 'hidden md:block'} flex-1 relative h-full bg-slate-200`}>
        <div id="map" className="h-full w-full z-0"></div>
        
        <button onClick={() => setViewMode('list')} className="md:hidden absolute top-6 left-6 px-6 py-3 bg-white/90 backdrop-blur rounded-2xl shadow-2xl z-[1000] font-black text-[11px] uppercase border border-slate-100 flex items-center gap-2">
          ← Back to List
        </button>

        {selectedSite && (
          <div className="absolute bottom-8 right-8 left-8 md:left-auto md:w-[480px] bg-white rounded-[40px] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.5)] z-[1000] overflow-hidden border border-white p-10 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <button onClick={() => setSelectedSiteId(null)} className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 z-10">✕</button>
            {selectedSite.image && (
              <div className="h-64 w-full mb-8 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white relative">
                <img src={`https://commons.wikimedia.org/wiki/Special:FilePath/${selectedSite.image}?width=800`} className="w-full h-full object-cover" alt={selectedSite.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            )}
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-1 leading-tight text-slate-900">{selectedSite.name}</h2>
              <p className="text-sm font-bold text-amber-600 uppercase tracking-widest">{selectedSite.admin}, NEVŞEHİR</p>
              <div className="flex gap-2 mt-4">
                {selectedSite.types.map(t => <span key={t} className="text-[10px] font-black bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">{t}</span>)}
              </div>
            </div>
            <div className="flex gap-4">
              <a href={selectedSite.externalLinks.wiki} target="_blank" rel="noreferrer" className="flex-1 text-center py-5 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">Open Wikipedia</a>
              {selectedSite.externalLinks.kultur && (
                <a href={`https://kulturenvanteri.com/yer/${selectedSite.externalLinks.kultur}`} target="_blank" rel="noreferrer" className="flex-1 text-center py-5 bg-slate-100 text-slate-900 rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Heritage Portal</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
