import { BaseApiService } from '../api/baseApi.js';

export interface GeoFeature {
  id: string;
  name: string;
  geometry: any;
  properties: Record<string, any>;
}

export interface LayerInfo {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  url?: string;
}

export interface AgentResponse {
  reply?: string;
  response?: string;
  message?: string;
  error?: string;
  [key: string]: any;
}

export class FlaskApiService extends BaseApiService {
  constructor() {
    super('http://localhost:5000');
  }

  /**
   * Endpoint para el agente de IA - coincide con el backend
   */
  async postAgent(data: { message: string }): Promise<AgentResponse> {
    return this.post<AgentResponse>('/api/agent', data);
  }

  /**
   * Obtiene información de ubicaciones GIS - endpoint disponible en backend
   */
  async getGISLocations(): Promise<{ locations: any[]; count: number }> {
    return this.get<{ locations: any[]; count: number }>('/api/gis/locations');
  }

  /**
   * Analiza datos GIS - endpoint disponible en backend
   */
  async analyzeGISData(data: any): Promise<{ result: string; data: any }> {
    return this.post<{ result: string; data: any }>('/api/gis/analyze', data);
  }

  /**
   * Verificar estado de salud del backend
   */
  async getHealthStatus(): Promise<{ status: string }> {
    return this.get<{ status: string }>('/api/health');
  }

  // Métodos placeholder para compatibilidad (estos endpoints no existen en el backend)
  async getLayers(): Promise<LayerInfo[]> {
    console.warn('⚠️ Endpoint /layers no implementado en backend');
    return [];
  }

  async getGeoFeatures(layerId: string): Promise<GeoFeature[]> {
    console.warn('⚠️ Endpoint de features no implementado en backend');
    return [];
  }

  async searchFeatures(query: string): Promise<GeoFeature[]> {
    console.warn('⚠️ Endpoint de búsqueda no implementado en backend');
    return [];
  }

  async getLayerStats(layerId: string): Promise<any> {
    console.warn('⚠️ Endpoint de estadísticas no implementado en backend');
    return {};
  }

  async createFeature(layerId: string, feature: Partial<GeoFeature>): Promise<GeoFeature> {
    console.warn('⚠️ Endpoint de crear feature no implementado en backend');
    throw new Error('Endpoint no disponible');
  }

  async updateFeature(
    layerId: string,
    featureId: string,
    feature: Partial<GeoFeature>
  ): Promise<GeoFeature> {
    console.warn('⚠️ Endpoint de actualizar feature no implementado en backend');
    throw new Error('Endpoint no disponible');
  }

  async deleteFeature(layerId: string, featureId: string): Promise<void> {
    console.warn('⚠️ Endpoint de eliminar feature no implementado en backend');
    throw new Error('Endpoint no disponible');
  }
}

export const flaskApiService = new FlaskApiService();
