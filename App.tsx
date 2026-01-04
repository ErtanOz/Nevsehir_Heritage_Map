import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RAW_GEOJSON_DATA } from './data';
import { HeritageSite } from './types';
import { getIconConfig } from './utils/mapIcons';
import { SiteCard } from './components/SiteCard';
import { DetailCard } from './components/DetailCard';
import { MapLayersControl } from './components/MapLayersControl';

declare const L: any;

type MapType = 'standard' | 'satellite' | 'terrain';

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

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [unescoOnly, setUnescoOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [mapType, setMapType] = useState<MapType>('standard');
  const [showLabels, setShowLabels] = useState(true);

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
        s.admin.toLowerCase().includes(searchTerm.toLowerCase());
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
    if (container !== null && container._leaflet_id !== undefined) {
      return;
    }

    const map = L.map('map', { zoomControl: false }).setView([38.62, 34.72], 10);
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

        let color = '#64748b';
        if (unescoCount / total >= 0.5) color = '#d97706';
        if (userCount / total >= 0.5) color = '#8b5cf6';

        return L.divIcon({
          html: `<div class="custom-cluster-div" style="background-color: ${color};"><span>${total}</span></div>`,
          className: 'marker-cluster',
          iconSize: L.point(40, 40)
        });
      }
    });

    map.addLayer(clusterGroup);
    mapRef.current = map;
    clusterGroupRef.current = clusterGroup;

    map.on('contextmenu', (e: any) => {
      const name = prompt("Enter a name for this discovery:");
      if (name) {
        const newPoint: HeritageSite = {
          id: `user_${Date.now()}`,
          name,
          types: ['User Landmark'],
          coords: [e.latlng.lat, e.latlng.lng],
          admin: 'Discovery',
          isUnesco: false,
          isUserGenerated: true,
          externalLinks: { wiki: '#' }
        };
        setUserSites(prev => [newPoint, ...prev]);
        setSelectedSiteId(newPoint.id);
      }
    });

    updateMarkers(filteredSites);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

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

      const marker = L.marker(site.coords, {
        icon: markerIcon,
        isUnesco: site.isUnesco,
        isUserGenerated: site.isUserGenerated
      })
        .bindPopup(`<b>${site.name}</b>`)
        .on('click', () => { setSelectedSiteId(site.id); setViewMode('map'); });

      markersRef.current[site.id] = marker;
      clusterGroupRef.current.addLayer(marker);
    });
  };

  useEffect(() => {
    if (mapRef.current) updateMarkers(filteredSites);
  }, [filteredSites]);

  useEffect(() => {
    if (!mapRef.current) return;
    ['standard', 'satellite', 'terrain', 'labels'].forEach(l => {
      if (layersRef.current[l]) mapRef.current.removeLayer(layersRef.current[l]);
    });

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
      setTimeout(() => {
        if (markersRef.current[selectedSite.id]) {
          markersRef.current[selectedSite.id].openPopup();
        }
      }, 300);
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
          radius: 10,
          fillColor: '#3b82f6',
          fillOpacity: 0.8,
          color: 'white',
          weight: 3
        }).addTo(mapRef.current);

        userMarkerRef.current.bindTooltip("You are here").openTooltip();
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
    <div className="flex h-full w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <div className={`${viewMode === 'list' ? 'flex' : 'hidden md:flex'} w-full md:w-[440px] bg-white shadow-2xl z-20 flex-col h-full border-r border-slate-100`}>
        <div className="p-6 pb-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">NEVŞEHİR</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Heritage Explorer</p>
            </div>
          </div>

          <input
            type="text" placeholder="Search heritage or landmarks..."
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 mb-4"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex gap-2 overflow-x-auto pb-5 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${activeCategory === cat ? 'bg-amber-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-colors ${unescoOnly ? 'border-amber-400 bg-amber-50' : 'border-slate-100 bg-slate-50/50'}`}>
              <span className={`text-[9px] font-black uppercase tracking-widest ${unescoOnly ? 'text-amber-700' : 'text-slate-400'}`}>UNESCO</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={unescoOnly} onChange={() => setUnescoOnly(!unescoOnly)} />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
            <button onClick={handleLocateMe} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Locate Me
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-1">
          <div className="mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
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
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
          Right-click on map to drop a pin
        </div>
      </div>

      <div className={`${viewMode === 'map' ? 'block' : 'hidden md:block'} flex-1 relative h-full bg-slate-200`}>
        <div id="map" className="h-full w-full z-0"></div>

        <div className="absolute top-6 left-6 flex flex-col gap-3 z-[1000]">
          <button onClick={() => setViewMode('list')} className="md:hidden px-6 py-3 bg-white/90 backdrop-blur rounded-2xl shadow-2xl font-black text-[11px] uppercase border border-slate-100 flex items-center gap-2">
            ← Back to List
          </button>

          <MapLayersControl mapType={mapType} setMapType={setMapType} />
        </div>

        {selectedSite && <DetailCard site={selectedSite} onClose={() => setSelectedSiteId(null)} />}
      </div>
    </div>
  );
};

export default App;