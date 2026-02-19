import { LatLngBounds } from 'leaflet';

/**
 * Tipos de geometría soportados
 */
export type GeometryType = 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';

/**
 * Tipos de capas soportados
 */
export type LayerType = 'geojson' | 'wms' | 'wfs' | 'arcgis' | 'tile';

/**
 * Tipos de servicios externos
 */
export type ServiceType = 'WMS' | 'WFS' | 'ArcGIS REST';

/**
 * Interfaz base para propiedades de features
 */
export interface FeatureProperties {
  [key: string]: any;
}

/**
 * Interfaz para geometrías GeoJSON
 */
export interface GeoJSONGeometry {
  type: GeometryType;
  coordinates: number[] | number[][] | number[][][] | number[][][][];
}

/**
 * Interfaz para features GeoJSON
 */
export interface GeoJSONFeature {
  type: 'Feature';
  id?: string | number;
  geometry: GeoJSONGeometry;
  properties: FeatureProperties;
}

/**
 * Interfaz para FeatureCollection GeoJSON
 */
export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

/**
 * Configuración de estilo para capas
 */
export interface LayerStyle {
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  weight?: number;
  opacity?: number;
  dashArray?: string;
  radius?: number;
}

/**
 * Interfaz principal para capas
 */
export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number;
  zIndex: number;
  geometryType?: GeometryType;  //  Tipo de geometría predominante
  data?: GeoJSONFeatureCollection;
  leafletLayer?: any;  //  Referencia a la capa de Leaflet
  markers?: any[];  //  Referencias a marcadores individuales
  url?: string;
  style?: LayerStyle;
  metadata?: LayerMetadata;
  bounds?: LatLngBounds;
  selected?: boolean;
}

/**
 * Metadatos de capa
 */
export interface LayerMetadata {
  source?: string;
  description?: string;
  projection?: string;
  featureCount?: number;
  fields?: FieldInfo[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Información de campos de atributos
 */
export interface FieldInfo {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  alias?: string;
}

/**
 * Configuración de servicios externos
 */
export interface ServiceConfig {
  type: ServiceType;
  url: string;
  layers?: string[];
  version?: string;
  format?: string;
  parameters?: Record<string, any>;
}

/**
 * Resultados de selección espacial
 */
export interface SelectionResult {
  layerId: string;
  features: GeoJSONFeature[];
  count: number;
}

/**
 * Tipos de herramientas de medición
 */
export type MeasurementType = 'distance' | 'area';

/**
 * Resultado de medición
 */
export interface MeasurementResult {
  type: MeasurementType;
  value: number;
  unit: string;
  geometry: GeoJSONGeometry;
}

/**
 * Tipos de herramientas de dibujo
 */
export type DrawType = 'point' | 'line' | 'polygon' | 'rectangle' | 'circle';

/**
 * Bookmark (vista guardada)
 */
export interface Bookmark {
  id: string;
  name: string;
  description?: string;
  center: [number, number];
  zoom: number;
  bounds?: LatLngBounds;
  layers?: string[];
  createdAt: Date;
}

/**
 * Tipos de consulta espacial
 */
export type SpatialQueryType = 'intersects' | 'contains' | 'within' | 'touches' | 'buffer';

/**
 * Parámetros de consulta espacial
 */
export interface SpatialQueryParams {
  type: SpatialQueryType;
  geometry: GeoJSONGeometry;
  targetLayers: string[];
  bufferDistance?: number;
}

/**
 * Filtro de atributos
 */
export interface AttributeFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greater' | 'less' | 'between';
  value: any;
}

/**
 * Configuración de tabla de atributos
 */
export interface AttributeTableConfig {
  layerId: string;
  visible: boolean;
  selectedFeatures: (string | number)[];
  filters: AttributeFilter[];
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  pageSize: number;
  currentPage: number;
}

/**
 * Estado del mapa
 */
export interface MapState {
  center: [number, number];
  zoom: number;
  bounds?: LatLngBounds;
  basemap: string;
}

/**
 * Coordenadas
 */
export interface Coordinates {
  lng: number;
  lat: number;
}




