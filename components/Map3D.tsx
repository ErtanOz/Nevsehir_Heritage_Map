import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { HeritageSite } from '../types';
import { getIconConfig } from '../utils/mapIcons';

interface Map3DProps {
  sites: HeritageSite[];
  selectedSiteId: string | null;
  onSelectSite: (id: string) => void;
  center?: [number, number]; // [lat, lng]
  zoom?: number;
}

export const Map3D: React.FC<Map3DProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  center = [38.62, 34.72],
  zoom = 10,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize MapLibre GL map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'satellite': {
            type: 'raster',
            tiles: [
              'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            ],
            tileSize: 256,
            attribution: '&copy; Google',
          },
          'terrain-dem': {
            type: 'raster-dem',
            tiles: [
              'https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; MapLibre',
          },
          'openfreemap': {
            type: 'vector',
            url: 'https://tiles.openfreemap.org/planet',
          },
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite',
            minzoom: 0,
            maxzoom: 20,
          },
          {
            id: 'hillshade',
            type: 'hillshade',
            source: 'terrain-dem',
            paint: {
              'hillshade-shadow-color': '#000000',
              'hillshade-highlight-color': '#ffffff',
              'hillshade-accent-color': '#555555',
              'hillshade-exaggeration': 0.3,
            },
          },
          {
            id: '3d-buildings',
            source: 'openfreemap',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
              'fill-extrusion-color': '#ffffff',
              'fill-extrusion-height': ['get', 'render_height'],
              'fill-extrusion-base': ['get', 'render_min_height'],
              'fill-extrusion-opacity': 0.7,
            },
          },
        ],
        terrain: {
          source: 'terrain-dem',
          exaggeration: 1.5,
        },
      },
      center: [center[1], center[0]], // MapLibre uses [lng, lat]
      zoom: zoom,
      pitch: 55,
      bearing: -20,
      maxPitch: 80,
    });

    // Navigation controls with compass
    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
        showZoom: true,
      }),
      'top-right'
    );

    map.on('load', () => {
      mapRef.current = map;
      addMarkers(map, sites);
    });

    return () => {
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Clear all markers
  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  };

  // Add markers for the given sites
  const addMarkers = (map: maplibregl.Map, sitesToMark: HeritageSite[]) => {
    clearMarkers();

    sitesToMark.forEach((site) => {
      const { path, color } = getIconConfig(
        site.types,
        site.isUnesco,
        site.isUserGenerated
      );

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'map3d-marker';
      el.innerHTML = `
        <div style="background: white; color: ${color}; width: 36px; height: 36px; border-radius: 14px; border: 3px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); position: relative; cursor: pointer;">
          <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="width: 20px; height: 20px;">${path}</svg>
          ${
            site.isUnesco
              ? '<div style="position: absolute; top: -6px; right: -6px; background: #d97706; border-radius: 50%; width: 14px; height: 14px; border: 2px solid white;"></div>'
              : ''
          }
        </div>
      `;

      el.addEventListener('click', () => {
        onSelectSite(site.id);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([site.coords[1], site.coords[0]]) // [lng, lat]
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<b>${site.name}</b>`
          )
        )
        .addTo(map);

      markersRef.current.push(marker);
    });
  };

  // Update markers when sites change
  useEffect(() => {
    if (mapRef.current) {
      addMarkers(mapRef.current, sites);
    }
  }, [sites]);

  // Fly to selected site
  useEffect(() => {
    if (!mapRef.current || !selectedSiteId) return;
    const site = sites.find((s) => s.id === selectedSiteId);
    if (site) {
      mapRef.current.flyTo({
        center: [site.coords[1], site.coords[0]],
        zoom: 16,
        pitch: 65,
        bearing: mapRef.current.getBearing(),
        duration: 2000,
      });

      // Open popup for selected marker
      setTimeout(() => {
        const idx = sites.findIndex((s) => s.id === selectedSiteId);
        if (idx >= 0 && markersRef.current[idx]) {
          markersRef.current[idx].togglePopup();
        }
      }, 2100);
    }
  }, [selectedSiteId]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
