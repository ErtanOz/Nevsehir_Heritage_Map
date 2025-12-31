
export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    item: string;
    itemLabel: string;
    typeLabel: string;
    adminLabel: string;
    image?: string;
    heritageLabel?: string;
    kulturenvanteriID?: string;
    culturePortalID?: string;
  };
}

export interface GeoJSONData {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface HeritageSite {
  id: string;
  name: string;
  types: string[];
  coords: [number, number]; // [lat, lng]
  image?: string;
  admin: string;
  isUnesco: boolean;
  externalLinks: {
    wiki: string;
    kultur?: string;
  };
}
