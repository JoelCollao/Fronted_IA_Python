export const GIS_CONSTANTS = {
  // Sistemas de coordenadas
  EPSG: {
    WGS84: 'EPSG:4326',
    WEB_MERCATOR: 'EPSG:3857',
    UTM_30N: 'EPSG:25830' // Para España
  },
  
  // Tipos de capas
  LAYER_TYPES: {
    WMS: 'WMS',
    WFS: 'WFS',
    VECTOR: 'VECTOR',
    RASTER: 'RASTER'
  },
  
  // Estilos por defecto
  DEFAULT_STYLES: {
    POINT: {
      radius: 6,
      fillColor: '#ff7800',
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    },
    LINE: {
      color: '#3388ff',
      weight: 3,
      opacity: 0.8
    },
    POLYGON: {
      fillColor: '#3388ff',
      fillOpacity: 0.3,
      color: '#3388ff',
      weight: 2,
      opacity: 1
    }
  },
  
  // Límites de zoom
  ZOOM_LIMITS: {
    MIN: 3,
    MAX: 18,
    DEFAULT: 10
  }
} as const;
