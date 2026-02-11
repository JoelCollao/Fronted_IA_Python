import { Layer, GeoJSONFeatureCollection, ServiceConfig } from '../types/gis.types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Servicio para operaciones con capas
 */
export class LayerService {
  /**
   * Sube un archivo y lo convierte a GeoJSON
   */
  static async uploadFile(file: File): Promise<GeoJSONFeatureCollection> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/layers/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Consume un servicio WMS/WFS/ArcGIS
   */
  static async loadService(config: ServiceConfig): Promise<GeoJSONFeatureCollection> {
    const response = await fetch(`${API_BASE_URL}/layers/service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error(`Failed to load service: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Carga un GeoJSON desde URL
   */
  static async loadGeoJSON(url: string): Promise<GeoJSONFeatureCollection> {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to load GeoJSON: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Guarda una capa en el backend
   */
  static async saveLayer(layer: Layer): Promise<Layer> {
    const response = await fetch(`${API_BASE_URL}/layers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(layer)
    });

    if (!response.ok) {
      throw new Error(`Failed to save layer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene todas las capas guardadas
   */
  static async getLayers(): Promise<Layer[]> {
    const response = await fetch(`${API_BASE_URL}/layers`);
    
    if (!response.ok) {
      throw new Error(`Failed to get layers: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Elimina una capa
   */
  static async deleteLayer(layerId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/layers/${layerId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete layer: ${response.statusText}`);
    }
  }

  /**
   * Realiza consulta espacial
   */
  static async spatialQuery(params: any): Promise<GeoJSONFeatureCollection> {
    const response = await fetch(`${API_BASE_URL}/spatial/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Failed to perform spatial query: ${response.statusText}`);
    }

    return response.json();
  }
}
