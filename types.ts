
export interface HeritageBinding {
  item: { type: string; value: string };
  coords: { datatype: string; type: string; value: string };
  itemLabel: { "xml:lang": string; type: string; value: string };
  typeLabel: { "xml:lang": string; type: string; value: string };
  adminLabel: { "xml:lang": string; type: string; value: string };
  image?: { type: string; value: string };
  heritageLabel?: { "xml:lang": string; type: string; value: string };
  kulturenvanteriID?: { type: string; value: string };
  culturePortalID?: { type: string; value: string };
}

export interface HeritageSite {
  id: string;
  name: string;
  types: string[];
  coords: [number, number]; // [lat, lng]
  image?: string;
  admin: string;
  heritage?: string;
  externalLinks: {
    wiki: string;
    kultur?: string;
    portal?: string;
  };
}

export interface RawData {
  results: {
    bindings: HeritageBinding[];
  };
}
