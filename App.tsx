import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RAW_GEOJSON_DATA } from './data';
import { HeritageSite } from './types';

declare const L: any;

type MapType = 'standard' | 'satellite' | 'terrain';

const getIconConfig = (types: string[] = [], isUnesco: boolean = false, isUserGenerated: boolean = false) => {
  if (isUserGenerated) {
    return {
      path: `<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />`,
      color: '#8b5cf6'
    };
  }

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
  } else if (allTypesStr.includes('fairy chimney') || allTypesStr.includes('natural') || allTypesStr.includes('national park')) {
    color = isUnesco ? '#d97706' : '#ea580c';
    path = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3l8 18H4L12 3zM12 8l4 9H8l4-9z" />`;
  } else if (allTypesStr.includes('fountain') || allTypesStr.includes('baths') || allTypesStr.includes('hammām')) {
    color = isUnesco ? '#d97706' : '#0ea5e9';
    path = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />`;
  } else if (allTypesStr.includes('mosque') || allTypesStr.includes('cami')) {
    color = isUnesco ? '#d97706' : '#0284c7';
    path = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />`;
  } else if (allTypesStr.includes('tell') || allTypesStr.includes('höyük') || allTypesStr.includes('mound') || allTypesStr.includes('archaeological')) {
    color = isUnesco ? '#d97706' : '#92400e';
    path = `<path stroke-linecap="round" stroke-linejoin="round" d="M21 21H3M5 21v-4a7 7 0 0114 0v4M12 17v-4" />`;
  } else if (allTypesStr.includes('caravanserai') || allTypesStr.includes('han')) {
    color = isUnesco ? '#d97706' : '#475569';
    path = `<path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />`;
  } else if (allTypesStr.includes('clock tower')) {
    color = isUnesco ? '#d97706' : '#7c3aed';
    path = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />`;
  } else {
    path = `<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />`;
  }
  return { path, color };
};

const getProcessedSites = (userSites: HeritageSite[]): HeritageSite[] => {
  const dataSites = Array.from(
    RAW_GEOJSON_DATA.features.reduce((acc, feature) => {
      const lat = feature.geometry.coordinates[1];
      const lng = feature.geometry.coordinates[0];
      const id = `${feature.properties.item}_${lat}_${lng}`;
      
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
          coords: [lat, lng],
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
  return [...userSites, ...dataSites];
};

const CATEGORIES = ["ALL", "MY LANDMARKS", "ARCHAEOLOGICAL SITE", "CAVE", "FAIRY CHIMNEY", "MUSEUM", "ROCK CHURCH", "FOUNTAIN", "MOSQUE", "CASTLE", "MONASTERY"];

const SiteCard: React.FC<{ site: HeritageSite; onClick: () => void; isActive: boolean; onDelete?: () => void }> = ({ site, onClick, isActive, onDelete }) => {
  const { path, color } = getIconConfig(site.types, site.isUnesco, site.isUserGenerated);

  return (
    <div 
      onClick={onClick}
      className={`group p-4 mb-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative ${
        isActive ? 'border-amber-500 bg-amber-50 shadow-md translate-x-1' : 'border-gray-50 bg-white hover:border-gray-200 shadow-sm'
      }`}
    >
      {site.isUserGenerated && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors md:opacity-0 group-hover:opacity-100"
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
          <div className="flex flex-wrap items-center gap-1 mt-2">
            {site.isUnesco && (
              <span className="bg-amber-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tight shadow-sm">UNESCO</span>
            )}
            {site.isUserGenerated && (
              <span className="bg-violet-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tight shadow-sm">Landmark</span>
            )}
            <span className="text-slate-500 text-[9px] font-medium border border-slate-100 px-1.5 py-0.5 rounded bg-slate-50 truncate max-w-[80px]">{site.types[0] || 'Unknown'}</span>
          </div>
          {site.description && (
            <p className="mt-2 text-[10px] text-slate-500 italic line-clamp-1 leading-snug">{site.description}</p>
          )}
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
  const [isAddingPin, setIsAddingPin] = useState(false);
  
  const [userSites, setUserSites] = useState<HeritageSite[]>(() => {
    const saved = localStorage.getItem('nevsehir_user_points');
    return saved ? JSON.parse(saved) : [];
  });

  const mapRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const layersRef = useRef<{ [key: string]: any }>({});
  const userMarkerRef = useRef<any>(null);

  const processedSites = useMemo(() => getProcessedSites(userSites), [userSites]);

  const filteredSites = useMemo(() => {
    return processedSites.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesCategory = activeCategory === 'ALL' || 
                             (activeCategory === 'MY LANDMARKS' ? s.isUserGenerated : s.types.some(t => t.toUpperCase().includes(activeCategory)));
      const matchesUnesco = !unescoOnly || s.isUnesco;
      return matchesSearch && matchesCategory && matchesUnesco;
    });
  }, [searchTerm, activeCategory, unescoOnly, processedSites]);

  const selectedSite = useMemo(() => processedSites.find(s => s.id === selectedSiteId), [selectedSiteId, processedSites]);

  useEffect(() => {
    localStorage.setItem('nevsehir_user_points', JSON.stringify(userSites));
  }, [userSites]);

  useEffect(() => {
    if (typeof L === 'undefined') return;
    
    const container = L.DomUtil.get('map');
    if (container !== null && container._leaflet_id !== undefined) return;

    const map = L.map('map', { zoomControl: false, tap: false }).setView([38.62, 34.72], 10);
    L.control.zoom({ position: 'topright' }).addTo(map);

    layersRef.current.standard = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' });
    layersRef.current.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri' });
    layersRef.current.terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: 'OpenTopoMap' });
    layersRef.current.labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO', pane: 'shadowPane' });

    layersRef.current.standard.addTo(map);

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster: any) => {
        const markers = cluster.getAllChildMarkers();
        const unescoCount = markers.filter((m: any) => m.options.isUnesco).length;
        const userCount = markers.filter((m: any) => m.options.isUserGenerated).length;
        const total = markers.length;
        const isPrimarilyUnesco = unescoCount / total >= 0.5;
        const isPrimarilyUser = userCount / total >= 0.5;
        let bgColor = '#64748b';
        let borderColor = 'white';
        let extraStyles = '';
        if (isPrimarilyUnesco) {
          bgColor = '#d97706';
          borderColor = '#fbbf24';
          extraStyles = 'box-shadow: 0 0 15px rgba(217, 119, 6, 0.6); border-width: 4px;';
        } else if (isPrimarilyUser) {
          bgColor = '#8b5cf6';
        }
        return L.divIcon({ 
          html: `<div class="custom-cluster-div" style="background-color: ${bgColor}; border-color: ${borderColor}; ${extraStyles} position: relative;">
                  <span>${total}</span>
                  ${unescoCount > 0 && !isPrimarilyUnesco ? '<div style="position: absolute; top: -4px; right: -4px; width: 14px; height: 14px; background: #d97706; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>' : ''}
                </div>`, 
          className: 'marker-cluster', 
          iconSize: L.point(40, 40) 
        });
      }
    });

    map.addLayer(clusterGroup);
    mapRef.current = map;
    clusterGroupRef.current = clusterGroup;

    const handleNewPoint = (lat: number, lng: number) => {
      const name = prompt("Enter a name for this discovery:");
      if (name) {
        const description = prompt("Enter a brief description or notes for this location:");
        const newPoint: HeritageSite = {
          id: `user_${Date.now()}`,
          name,
          description: description || undefined,
          types: ['User Landmark'],
          coords: [lat, lng],
          admin: 'Discovery',
          isUnesco: false,
          isUserGenerated: true,
          externalLinks: { wiki: '#' }
        };
        setUserSites(prev => [newPoint, ...prev]);
        setSelectedSiteId(newPoint.id);
        setIsAddingPin(false);
      }
    };

    map.on('contextmenu', (e: any) => handleNewPoint(e.latlng.lat, e.latlng.lng));
    map.on('click', (e: any) => {
      if (isAddingPin) handleNewPoint(e.latlng.lat, e.latlng.lng);
    });

    updateMarkers(filteredSites);
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      map.remove();
      mapRef.current = null;
    };
  }, [isAddingPin]);

  const updateMarkers = (sitesToMark: HeritageSite[]) => {
    if (!clusterGroupRef.current || !mapRef.current) return;
    clusterGroupRef.current.clearLayers();
    markersRef.current = {};
    sitesToMark.forEach(site => {
      const { path, color } = getIconConfig(site.types, site.isUnesco, site.isUserGenerated);
      const markerIcon = L.divIcon({
        className: 'custom-heritage-marker',
        html: `<div style="background: white; color: ${color}; width: 36px; height: 36px; border-radius: 14px; border: 3px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); position: relative;">
          <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="width: 20px; height: 20px;">${path}</svg>
          ${site.isUnesco ? '<div style="position: absolute; top: -6px; right: -6px; background: #d97706; border-radius: 50%; width: 14px; height: 14px; border: 2px solid white;"></div>' : ''}
        </div>`,
        iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18]
      });
      const marker = L.marker(site.coords, { icon: markerIcon, isUnesco: site.isUnesco, isUserGenerated: site.isUserGenerated })
        .bindPopup(`<b>${site.name}</b>`, { closeButton: false, offset: L.point(0, -10) })
        .on('click', () => { setSelectedSiteId(site.id); setViewMode('map'); });
      markersRef.current[site.id] = marker;
      clusterGroupRef.current.addLayer(marker);
    });
  };

  useEffect(() => { if (mapRef.current) updateMarkers(filteredSites); }, [filteredSites]);

  useEffect(() => {
    if (!mapRef.current) return;
    ['standard', 'satellite', 'terrain', 'labels'].forEach(l => { if (layersRef.current[l]) mapRef.current.removeLayer(layersRef.current[l]); });
    if (mapType === 'satellite') {
      mapRef.current.addLayer(layersRef.current.satellite);
      if (showLabels) mapRef.current.addLayer(layersRef.current.labels);
    } else if (mapType === 'terrain') {
      mapRef.current.addLayer(layersRef.current.terrain);
    } else {
      mapRef.current.addLayer(layersRef.current.standard);
    }
  }, [mapType, showLabels]);

  useEffect(() => {
    if (selectedSite && mapRef.current) {
      mapRef.current.flyTo(selectedSite.coords, 16);
      setTimeout(() => markersRef.current[selectedSite.id]?.openPopup(), 300);
    }
  }, [selectedSite]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      if (mapRef.current) {
        mapRef.current.flyTo([latitude, longitude], 14);
        if (userMarkerRef.current) mapRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = L.circleMarker([latitude, longitude], {
          radius: 10, fillColor: '#3b82f6', fillOpacity: 0.8, color: 'white', weight: 3
        }).addTo(mapRef.current);
        userMarkerRef.current.bindTooltip("You are here").openTooltip();
        if (viewMode === 'list') setViewMode('map');
      }
    });
  };

  const deleteUserSite = (id: string) => {
    if (confirm("Delete this landmark?")) {
      setUserSites(prev => prev.filter(s => s.id !== id));
      if (selectedSiteId === id) setSelectedSiteId(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-50 font-sans text-slate-900 overflow-hidden select-none">
      {/* Sidebar - List View */}
      <div className={`${viewMode === 'list' ? 'flex' : 'hidden md:flex'} flex-1 md:flex-none w-full md:w-[420px] bg-white shadow-2xl z-20 flex-col h-full border-r border-slate-100 overflow-hidden`}>
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                 <h1 className="text-lg font-black tracking-tight leading-none uppercase">DKM Nevşehir</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Heritage Explorer</p>
              </div>
            </div>
            <button onClick={() => setViewMode('map')} className="md:hidden p-2 text-slate-400">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </button>
          </div>

          <div className="relative mb-4 group">
            <input 
              type="text" placeholder="Search heritage, landmarks, notes..."
              className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base md:text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 shadow-inner"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 ${activeCategory === cat ? 'bg-amber-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
             <div onClick={() => setUnescoOnly(!unescoOnly)} className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-colors cursor-pointer ${unescoOnly ? 'border-amber-400 bg-amber-50' : 'border-slate-100 bg-slate-50/50'}`}>
                <span className={`text-[9px] font-black uppercase tracking-widest ${unescoOnly ? 'text-amber-700' : 'text-slate-400'}`}>UNESCO Only</span>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${unescoOnly ? 'bg-amber-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${unescoOnly ? 'left-4.5' : 'left-0.5'}`} style={{ left: unescoOnly ? '18px' : '2px' }}></div>
                </div>
             </div>
             <button onClick={handleLocateMe} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Locate Me
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-1 scroll-smooth">
          <div className="mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 sticky top-0 bg-white py-2 z-10">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            {filteredSites.length} LOCATIONS
          </div>
          {filteredSites.map(site => (
            <SiteCard 
              key={site.id} 
              site={site} 
              onClick={() => { setSelectedSiteId(site.id); setViewMode('map'); }} 
              isActive={selectedSiteId === site.id} 
              onDelete={site.isUserGenerated ? () => deleteUserSite(site.id) : undefined}
            />
          ))}
          {filteredSites.length === 0 && (
            <div className="py-20 text-center text-slate-300">
               <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <p className="text-sm font-bold">No locations found</p>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
          <div className="hidden md:block">Right-click on map to drop a pin</div>
          <div className="md:hidden">Use "Add Point" button below to discover</div>
          <div className="mt-1 opacity-60">Created by <a href="https://DigitalHeritageLAB.com" target="_blank" rel="noreferrer" className="hover:text-amber-600 underline">DigitalHeritageLAB.com</a></div>
        </div>
      </div>

      {/* Map View */}
      <div className={`${viewMode === 'map' ? 'block' : 'hidden md:block'} flex-1 relative h-full bg-slate-200 overflow-hidden`}>
        <div id="map" className="h-full w-full z-0"></div>
        
        {/* Mobile Header Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-[1000] pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button onClick={() => setViewMode('list')} className="md:hidden w-12 h-12 bg-white/95 backdrop-blur flex items-center justify-center rounded-2xl shadow-xl border border-slate-100 active:scale-90 transition-transform">
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsLayersMenuOpen(!isLayersMenuOpen)}
                className="w-12 h-12 md:w-auto md:px-6 bg-white/95 backdrop-blur flex items-center justify-center gap-2 rounded-2xl shadow-xl border border-slate-100 hover:bg-white active:scale-95 transition-all"
              >
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                <span className="hidden md:block font-black text-[11px] uppercase tracking-wider">Layers</span>
              </button>

              {isLayersMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-slate-100 rounded-3xl shadow-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Map</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => setMapType('standard')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${mapType === 'standard' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <div className="w-full aspect-square rounded-lg bg-slate-200 overflow-hidden"><img src="https://cartodb-basemaps-a.global.ssl.fastly.net/rastertiles/voyager/10/583/387.png" className="w-full h-full object-cover" alt="standard" /></div>
                        <span className="text-[9px] font-bold uppercase">Standard</span>
                      </button>
                      <button onClick={() => setMapType('satellite')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${mapType === 'satellite' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <div className="w-full aspect-square rounded-lg bg-slate-900 overflow-hidden"><img src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/387/583" className="w-full h-full object-cover" alt="satellite" /></div>
                        <span className="text-[9px] font-bold uppercase">Satellite</span>
                      </button>
                      <button onClick={() => setMapType('terrain')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${mapType === 'terrain' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <div className="w-full aspect-square rounded-lg bg-green-200 overflow-hidden"><img src="https://a.tile.opentopomap.org/10/583/387.png" className="w-full h-full object-cover" alt="terrain" /></div>
                        <span className="text-[9px] font-bold uppercase">Terrain</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Interaction Control (Mobile Discovery) */}
          <div className="md:hidden pointer-events-auto">
            <button 
              onClick={() => setIsAddingPin(!isAddingPin)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl border transition-all active:scale-95 ${isAddingPin ? 'bg-amber-500 text-white border-amber-600 animate-pulse' : 'bg-white/95 text-slate-700 border-slate-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="font-black text-[11px] uppercase tracking-wider">{isAddingPin ? 'Click Map' : 'Add Discovery'}</span>
            </button>
          </div>
        </div>

        {/* Selected Site Detail View - Desktop (Floating) / Mobile (Bottom Sheet) */}
        {selectedSite && (
          <div className="fixed md:absolute inset-0 md:inset-auto md:bottom-8 md:right-8 flex items-end md:items-center justify-center z-[1100] pointer-events-none">
            {/* Backdrop for mobile */}
            <div className="md:hidden absolute inset-0 bg-black/30 pointer-events-auto" onClick={() => setSelectedSiteId(null)}></div>
            
            <div className="w-full md:w-[480px] max-h-[85vh] md:max-h-[90vh] bg-white rounded-t-[40px] md:rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-y-auto pointer-events-auto border border-white p-6 md:p-10 animate-in slide-in-from-bottom-10 fade-in duration-300">
              <div className="md:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
              <button onClick={() => setSelectedSiteId(null)} className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 z-10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              {selectedSite.image && (
                <div className="h-48 md:h-64 w-full mb-6 md:mb-8 rounded-[28px] md:rounded-[32px] overflow-hidden shadow-2xl border-4 border-white relative group">
                  <img src={`https://commons.wikimedia.org/wiki/Special:FilePath/${selectedSite.image}?width=800`} className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110" alt={selectedSite.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}
              
              <div className="mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-black mb-1 leading-tight text-slate-900">{selectedSite.name}</h2>
                <p className="text-[12px] md:text-sm font-bold text-amber-600 uppercase tracking-widest">{selectedSite.admin}, NEVŞEHİR</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedSite.types.map(t => <span key={t} className="text-[9px] font-black bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">{t}</span>)}
                </div>
                
                {selectedSite.description && (
                  <div className="mt-6 p-4 md:p-5 bg-slate-50 rounded-2xl md:rounded-3xl border-l-4 border-amber-400">
                    <p className="text-sm text-slate-600 italic leading-relaxed">{selectedSite.description}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 mb-2">
                <a href={selectedSite.externalLinks.wiki} target="_blank" rel="noreferrer" className="flex-1 text-center py-4 md:py-5 bg-slate-900 text-white rounded-[20px] md:rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">Wikipedia</a>
                {selectedSite.externalLinks.kultur && (
                  <a href={`https://kulturenvanteri.com/yer/${selectedSite.externalLinks.kultur}`} target="_blank" rel="noreferrer" className="flex-1 text-center py-4 md:py-5 bg-slate-100 text-slate-900 rounded-[20px] md:rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Archive</a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;