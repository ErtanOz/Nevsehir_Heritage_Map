import React, { useEffect, useRef, useState } from 'react';
import {
  Cartesian2,
  Cartesian3,
  Cesium3DTileset,
  Color,
  Entity,
  Ion,
  LabelStyle,
  Math as CesiumMath,
  VerticalOrigin,
  Viewer,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { HeritageSite } from '../types';
import { getIconConfig } from '../utils/mapIcons';

interface CesiumPhotorealisticMapProps {
  sites: HeritageSite[];
  selectedSiteId: string | null;
  onSelectSite: (id: string) => void;
  center?: [number, number];
  zoomHeight?: number;
}

const DEFAULT_CENTER: [number, number] = [38.62, 34.72];
const GOOGLE_PHOTOREALISTIC_3D_TILES_ASSET_ID = 2275207;

const colorFromHex = (hex: string) => Color.fromCssColorString(hex);

export const CesiumPhotorealisticMap: React.FC<CesiumPhotorealisticMapProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  center = DEFAULT_CENTER,
  zoomHeight = 52000,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const onSelectSiteRef = useRef(onSelectSite);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onSelectSiteRef.current = onSelectSite;
  }, [onSelectSite]);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const token = import.meta.env.VITE_CESIUM_ION_TOKEN;
    if (!token) {
      setError('VITE_CESIUM_ION_TOKEN is missing. Add it to .env.local to load Google 3D.');
      return;
    }

    let cancelled = false;
    Ion.defaultAccessToken = token;

    const viewer = new Viewer(containerRef.current, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      globe: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      requestRenderMode: true,
    });

    viewerRef.current = viewer;
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(center[1], center[0], zoomHeight),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-48),
        roll: 0,
      },
    });

    viewer.selectedEntityChanged.addEventListener((entity?: Entity) => {
      const siteId = entity?.id;
      if (typeof siteId === 'string') {
        onSelectSiteRef.current(siteId);
      }
    });

    const loadTileset = async () => {
      try {
        const tileset = await Cesium3DTileset.fromIonAssetId(
          GOOGLE_PHOTOREALISTIC_3D_TILES_ASSET_ID
        );
        if (cancelled) {
          tileset.destroy();
          return;
        }
        viewer.scene.primitives.add(tileset);
        viewer.scene.requestRender();
      } catch (err) {
        console.error('Failed to load Google Photorealistic 3D Tiles', err);
        if (!cancelled) {
          setError('Google Photorealistic 3D Tiles could not be loaded. Check the Cesium ion token and access permissions.');
        }
      }
    };

    loadTileset();

    return () => {
      cancelled = true;
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [center, zoomHeight]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.entities.removeAll();
    sites.forEach((site) => {
      const { color } = getIconConfig(site.types, site.isUnesco, site.isUserGenerated);
      const markerColor = colorFromHex(color);

      viewer.entities.add({
        id: site.id,
        name: site.name,
        position: Cartesian3.fromDegrees(site.coords[1], site.coords[0], 40),
        point: {
          pixelSize: site.isUnesco ? 17 : 14,
          color: markerColor,
          outlineColor: Color.WHITE,
          outlineWidth: 4,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: site.name,
          font: '700 12px sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 3,
          style: LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cartesian2(0, -24),
          verticalOrigin: VerticalOrigin.BOTTOM,
          showBackground: true,
          backgroundColor: Color.BLACK.withAlpha(0.45),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    });

    viewer.scene.requestRender();
  }, [sites]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !selectedSiteId) return;

    const site = sites.find((s) => s.id === selectedSiteId);
    if (!site) return;

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(site.coords[1], site.coords[0], 900),
      orientation: {
        heading: viewer.camera.heading,
        pitch: CesiumMath.toRadians(-35),
        roll: 0,
      },
      duration: 1.4,
      complete: () => {
        viewer.selectedEntity = viewer.entities.getById(site.id);
        viewer.scene.requestRender();
      },
    });
  }, [selectedSiteId, sites]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {error && (
        <div className="absolute inset-x-4 top-4 z-[1000] rounded-xl border border-amber-200 bg-white/95 px-4 py-3 text-xs font-bold text-slate-700 shadow-xl backdrop-blur">
          {error}
        </div>
      )}
    </div>
  );
};
