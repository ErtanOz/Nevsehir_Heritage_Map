import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RAW_GEOJSON_DATA } from './data';
import { HeritageSite } from './types';

declare const L: any;

type MapType = 'standard' | 'satellite' | 'terrain';

const getIconConfig = (types: string[] = [], isUnesco: boolean = false) => {
  const allTypesStr = types.join(' ').toLowerCase();
  let path = '';
  let color = isUnesco ? '#d97706' : '#4b5563';

  if (allTypesStr.includes('underground') || allTypesStr.includes('unterirdisch')) {
    color = isUnesco ? '#d97706' : '#78350f';
    path = `<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`;
  } else if (allTypesStr.includes('church') || allTypesStr.includes('kirche') || allTypesStr.includes('monastery') || allTypesStr.includes('kapelle')) {
    color = isUnesco ? '#d97706' : '#2563eb';
    path = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18M8 8h8M6 21h12l-2-10H8l-2 10z" />`;
  } else if (allTypesStr.includes('castle') || allTypesStr.includes('burg') || allTypesStr.includes('festung')) {
    color = isUnesco ? '#d97706' : '#dc2626';
    path = `<path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M4 21V7l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2v14M9 21v-4a3 3 0 0 1 6 0v4" />`;
  } else if (allTypesStr.includes('museum') || allTypesStr.includes('madrasa')) {
    color = isUnesco ? '#d97706' : '#059669';
    path = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />`;
  } else if (allTypesStr.includes('mosque') || allTypesStr.includes('cami')) {
    color = isUnesco ? '#d97706' : '#0284c7';
    path = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />`;
  } else {
    path = `<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />`;
  }
  return { path, color };
};

const getProcessedSites = (): HeritageSite[] => {
  return Array.from(
    RAW_GEOJSON_DATA.features.reduce((acc, feature) => {
      const lat = feature.geometry.coordinates[1];
      const lng = feature.geometry.coordinates[0];
      const id = `${feature.properties.item || 'feature'}_${lat}_${lng}`;
      
      if (!acc.has(id)) {
        let imageName = undefined;
        if (feature.properties.image) {
          const parts = feature.properties.image.split('/');
          imageName = parts[parts.length - 1];
        }
        acc.set(id, {
          id: id,
          name: feature.properties.itemLabel || 'Unknown Site',
          types: [],
          coords: [lat, lng],
          image: imageName,
          admin: feature.properties.adminLabel || 'Nevşehir',
          isUnesco: feature.properties.heritageLabel?.toLowerCase().includes('unesco') || false,
          externalLinks: {
            wiki: feature.properties.item || '#',
            kultur: feature.properties.kulturenvanteriID
          }
        });
      }
      const site = acc.get(id)!;
      if (feature.properties.typeLabel && !site.types.includes(feature.properties.typeLabel)) {
        site.types.push(feature.properties.typeLabel);
      }
      return acc;
    }, new Map<string, HeritageSite>()).values()
  );
};

const SiteCard: React.FC<{ site: HeritageSite; onClick: () => void; isActive: boolean }> = ({ site, onClick, isActive }) => {
  const { path, color } = getIconConfig(site.types, site.isUnesco);

  return (
    <div 
      onClick={onClick}
      className={`group p-4 mb-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative ${
        isActive ? 'border-amber-500 bg-amber-50 shadow-md translate-x-1' : 'border-gray-50 bg-white hover:border-gray-200 shadow-sm'
      }`}
    >
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
          <div className="flex flex-wrap items-center gap-1 mt-2">
            {site.isUnesco && (
              <span className="bg-amber-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tight shadow-sm">UNESCO</span>
            )}
            <span className="text-slate-500 text-[9px] font-medium border border-slate-100 px-1.5 py-0.5 rounded bg-slate-50 truncate max-w-[120px]">{site.types[0] || 'Unknown Site'}</span>
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
  const [mapType, setMapType] = useState<MapType>('standard');
  const [showLabels, setShowLabels] = useState(true);
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);
  
  const mapRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const layersRef = useRef<{ [key: string]: any }>({});

  const processedSites = useMemo(() => getProcessedSites(), []);

  const dynamicCategories = useMemo(() => {
    const types = new Set<string>();
    processedSites.forEach(s => s.types.forEach(t => {
      if (t) types.add(t.toUpperCase());
    }));
    return ["ALL", ...Array.from(types).sort()];
  }, [processedSites]);

  const filteredSites = useMemo(() => {
    return processedSites.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.admin.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'ALL' || s.types.some(t => t.toUpperCase() === activeCategory);
      const matchesUnesco = !unescoOnly || s.isUnesco;
      return matchesSearch && matchesCategory && matchesUnesco;
    });
  }, [searchTerm, activeCategory, unescoOnly, processedSites]);

  const selectedSite = useMemo(() => processedSites.find(s => s.id === selectedSiteId), [selectedSiteId, processedSites]);

  useEffect(() => {
    if (typeof L === 'undefined') return;
    
    const container = L.DomUtil.get('map');
    if (container !== null && container._leaflet_id !== undefined) return;

    const map = L.map('map', { zoomControl: false, tap: false }).setView([38.62, 34.72], 10);
    L.control.zoom({ position: 'topright' }).addTo(map);

    layersRef.current.standard = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' });
    layersRef.current.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri' });
    layersRef.current.terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: 'OpenTopoMap' });

    layersRef.current.standard.addTo(map);

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster: any) => {
        const markers = cluster.getAllChildMarkers();
        const unescoCount = markers.filter((m: any) => m.options.isUnesco).length;
        const total = markers.length;
        const isPrimarilyUnesco = unescoCount / total >= 0.5;
        let bgColor = isPrimarilyUnesco ? '#d97706' : '#64748b';
        return L.divIcon({ 
          html: `<div class="custom-cluster-div" style="background-color: ${bgColor}; border: 3px solid white;">
                  <span>${total}</span>
                </div>`, 
          className: 'marker-cluster', 
          iconSize: L.point(40, 40) 
        });
      }
    });

    map.addLayer(clusterGroup);
    mapRef.current = map;
    clusterGroupRef.current = clusterGroup;

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!clusterGroupRef.current || !mapRef.current) return;
    clusterGroupRef.current.clearLayers();
    markersRef.current = {};

    filteredSites.forEach(site => {
      const { path, color } = getIconConfig(site.types, site.isUnesco);
      const isActive = site.id === selectedSiteId;
      const markerIcon = L.divIcon({
        className: `custom-heritage-marker ${isActive ? 'is-active' : ''}`,
        html: `<div class="marker-container" style="background: white; color: ${color}; width: 36px; height: 36px; border-radius: 14px; border: 3px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); position: relative;">
          <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="width: 20px; height: 20px;">${path}</svg>
        </div>`,
        iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18]
      });
      const marker = L.marker(site.coords, { icon: markerIcon, isUnesco: site.isUnesco })
        .on('click', () => { setSelectedSiteId(site.id); setViewMode('map'); });

      if (showLabels) {
        marker.bindTooltip(site.name, {
          permanent: true,
          direction: 'top',
          offset: [0, -20],
          className: 'custom-map-label'
        });
      }

      markersRef.current[site.id] = marker;
      clusterGroupRef.current.addLayer(marker);
    });
  }, [filteredSites, selectedSiteId, showLabels]);

  useEffect(() => {
    if (!mapRef.current) return;
    // Remove existing layers
    Object.values(layersRef.current).forEach((layer: any) => mapRef.current.removeLayer(layer));
    // Add selected layer
    layersRef.current[mapType].addTo(mapRef.current);
  }, [mapType]);

  useEffect(() => {
    if (selectedSite && mapRef.current) {
      mapRef.current.flyTo(selectedSite.coords, 16);
    }
  }, [selectedSite]);

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-50 font-sans text-slate-900 overflow-hidden select-none">
      {/* Sidebar - List View */}
      <div className={`${viewMode === 'list' ? 'flex' : 'hidden md:flex'} flex-1 md:flex-none w-full md:w-[420px] bg-white shadow-2xl z-20 flex-col h-full border-r border-slate-100 overflow-hidden`}>
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
              </div>
              <div>
                 <h1 className="text-xl font-black tracking-tighter uppercase leading-none">DKM NEVŞEHİR</h1>
                 <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">HERITAGE EXPLORER</p>
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            <input 
              type="text" placeholder="Search locations..."
              className="w-full pl-12 pr-5 py-4 bg-slate-100 border-none rounded-2xl text-base focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {dynamicCategories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeCategory === cat ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                {filteredSites.length} SHOWN
             </div>
             <div className="opacity-60">TOTAL: {RAW_GEOJSON_DATA.features.length}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-1 scroll-smooth">
          {filteredSites.map(site => (
            <SiteCard 
              key={site.id} 
              site={site} 
              onClick={() => { setSelectedSiteId(site.id); setViewMode('map'); }} 
              isActive={selectedSiteId === site.id} 
            />
          ))}
          {filteredSites.length === 0 && (
            <div className="py-20 text-center text-slate-300">
               <p className="text-sm font-bold uppercase tracking-widest">No matching heritage</p>
            </div>
          )}
        </div>
        
        {/* SIDEBAR FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
          <div className="flex flex-col gap-1">
            <p className="opacity-60">Created by <a href="https://DigitalHeritageLAB.com" target="_blank" rel="noreferrer" className="text-amber-600 hover:underline">DigitalHeritageLAB.com</a></p>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className={`${viewMode === 'map' ? 'block' : 'hidden md:block'} flex-1 relative h-full bg-slate-200 overflow-hidden`}>
        <div id="map" className="h-full w-full z-0"></div>
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-[1000] pointer-events-auto">
          <button onClick={() => setViewMode('list')} className="md:hidden w-12 h-12 bg-white flex items-center justify-center rounded-2xl shadow-xl border">
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <div className="relative">
            <button 
              onClick={() => setIsLayersMenuOpen(!isLayersMenuOpen)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl border transition-all ${isLayersMenuOpen ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 border-slate-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              <span className="font-black text-[11px] uppercase tracking-wider">Map Layers</span>
            </button>
            {isLayersMenuOpen && (
              <div className="absolute left-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 w-48 animate-detail">
                <div className="flex flex-col gap-1">
                  {(['standard', 'satellite', 'terrain'] as MapType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => { setMapType(type); setIsLayersMenuOpen(false); }}
                      className={`px-4 py-3 rounded-xl text-left text-[10px] font-black uppercase tracking-wider transition-all ${mapType === type ? 'bg-amber-50 text-amber-600' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setShowLabels(!showLabels)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl border transition-all ${showLabels ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
            <span className="font-black text-[11px] uppercase tracking-wider">{showLabels ? 'Hide Labels' : 'Show Labels'}</span>
          </button>
        </div>

        {selectedSite && (
          <div className="fixed md:absolute bottom-0 right-0 left-0 md:left-auto md:bottom-8 md:right-8 z-[1100] p-6 pointer-events-none animate-detail">
            <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden pointer-events-auto border w-full md:w-[420px]">
              <div className="relative">
                {selectedSite.image ? (
                  <img src={`https://commons.wikimedia.org/wiki/Special:FilePath/${selectedSite.image}?width=600`} className="w-full h-56 object-cover" alt={selectedSite.name} />
                ) : (
                  <div className="w-full h-40 bg-slate-50 flex items-center justify-center">
                    <svg className="w-12 h-12 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                  </div>
                )}
                <button onClick={() => setSelectedSiteId(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white transition-all">✕</button>
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-black mb-1 text-slate-900 leading-tight">{selectedSite.name}</h2>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-4">{selectedSite.admin}, NEVŞEHİR</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {selectedSite.types.map(t => <span key={t} className="text-[9px] font-black bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">{t}</span>)}
                </div>
                <div className="flex gap-4">
                  <a href={selectedSite.externalLinks.wiki} target="_blank" rel="noreferrer" className="flex-1 text-center py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">Wikipedia</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;