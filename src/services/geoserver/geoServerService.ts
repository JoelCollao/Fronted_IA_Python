import { currentEnvironment } from '@core/config/environment';

export interface WMSLayerConfig {
  workspace: string;
  layerName: string;
  format?: string;
  transparent?: boolean;
  version?: string;
}

export interface WFSFeatureRequest {
  workspace: string;
  typeName: string;
  maxFeatures?: number;
  bbox?: string;
  cql_filter?: string;
}

export class GeoServerService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = currentEnvironment.geoServerUrl;
  }

  /**
   * Construye URL para servicio WMS
   */
  getWMSUrl(config: WMSLayerConfig): string {
    const params = new URLSearchParams({
      service: 'WMS',
      version: config.version || '1.1.1',
      request: 'GetMap',
      layers: `${config.workspace}:${config.layerName}`,
      format: config.format || 'image/png',
      transparent: (config.transparent ?? true).toString(),
      srs: 'EPSG:4326',
      // Los parámetros bbox, width, height serán añadidos por Leaflet
    });

    return `${this.baseUrl}/${config.workspace}/wms?${params.toString()}`;
  }

  /**
   * Construye URL para GetCapabilities WMS
   */
  getWMSCapabilitiesUrl(workspace: string): string {
    const params = new URLSearchParams({
      service: 'WMS',
      version: '1.1.1',
      request: 'GetCapabilities',
    });

    return `${this.baseUrl}/${workspace}/wms?${params.toString()}`;
  }

  /**
   * Obtiene features via WFS
   */
  async getWFSFeatures(request: WFSFeatureRequest): Promise<any> {
    const params = new URLSearchParams({
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      typeName: `${request.workspace}:${request.typeName}`,
      outputFormat: 'application/json',
    });

    if (request.maxFeatures) {
      params.append('maxFeatures', request.maxFeatures.toString());
    }

    if (request.bbox) {
      params.append('bbox', request.bbox);
    }

    if (request.cql_filter) {
      params.append('cql_filter', request.cql_filter);
    }

    const url = `${this.baseUrl}/${request.workspace}/ows?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`WFS request failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching WFS features:', error);
      throw error;
    }
  }

  /**
   * Construye URL para GetFeatureInfo WMS
   */
  getFeatureInfoUrl(
    config: WMSLayerConfig,
    point: { x: number; y: number },
    mapSize: { width: number; height: number },
    bbox: string
  ): string {
    const params = new URLSearchParams({
      service: 'WMS',
      version: '1.1.1',
      request: 'GetFeatureInfo',
      layers: `${config.workspace}:${config.layerName}`,
      query_layers: `${config.workspace}:${config.layerName}`,
      info_format: 'application/json',
      x: point.x.toString(),
      y: point.y.toString(),
      width: mapSize.width.toString(),
      height: mapSize.height.toString(),
      bbox: bbox,
      srs: 'EPSG:4326',
    });

    return `${this.baseUrl}/${config.workspace}/wms?${params.toString()}`;
  }
}

export const geoServerService = new GeoServerService();
