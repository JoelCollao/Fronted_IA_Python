import { BaseApiService } from '@services/api/baseApi';

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

export class FlaskApiService extends BaseApiService {
  /**
   * Obtiene información de capas disponibles
   */
  async getLayers(): Promise<LayerInfo[]> {
    return this.get<LayerInfo[]>('/layers');
  }

  /**
   * Obtiene features geoespaciales
   */
  async getGeoFeatures(layerId: string): Promise<GeoFeature[]> {
    return this.get<GeoFeature[]>(`/layers/${layerId}/features`);
  }

  /**
   * Busca features por atributos
   */
  async searchFeatures(query: string): Promise<GeoFeature[]> {
    return this.get<GeoFeature[]>(`/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Obtiene estadísticas de una capa
   */
  async getLayerStats(layerId: string): Promise<any> {
    return this.get<any>(`/layers/${layerId}/stats`);
  }

  /**
   * Crea una nueva feature
   */
  async createFeature(layerId: string, feature: Partial<GeoFeature>): Promise<GeoFeature> {
    return this.post<GeoFeature>(`/layers/${layerId}/features`, feature);
  }

  /**
   * Actualiza una feature existente
   */
  async updateFeature(layerId: string, featureId: string, feature: Partial<GeoFeature>): Promise<GeoFeature> {
    return this.put<GeoFeature>(`/layers/${layerId}/features/${featureId}`, feature);
  }

  /**
   * Elimina una feature
   */
  async deleteFeature(layerId: string, featureId: string): Promise<void> {
    return this.delete<void>(`/layers/${layerId}/features/${featureId}`);
  }
}

export const flaskApiService = new FlaskApiService();
