
export const getIconConfig = (types: string[] = [], isUnesco: boolean = false, isUserGenerated: boolean = false) => {
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
