import { Layer } from '../core/types/gis.types';

export interface BufferRequest {
  distance: number;
  unit: 'meters' | 'kilometers' | 'feet' | 'miles';
  geometryType?: 'Point' | 'LineString' | 'Polygon';
  layerIds?: string[];
}

export interface BufferResponse {
  success: boolean;
  message: string;
  bufferedLayerId?: string;
  affectedLayers?: string[];
  error?: string;
}

export class BufferService {
  /**
   * Extrae la distancia y unidad del mensaje del usuario
   */
  static parseBufferRequest(message: string): BufferRequest | null {
    const messageLower = message.toLowerCase();

    // Detectar distancia (números seguidos de unidad)
    const patterns = [
      { regex: /(\d+)\s*(metros?|m\b)/i, unit: 'meters' as const },
      { regex: /(\d+)\s*(kilómetros?|kilometros?|km)/i, unit: 'kilometers' as const },
      { regex: /(\d+)\s*(pies?|ft|feet)/i, unit: 'feet' as const },
      { regex: /(\d+)\s*(millas?|miles?|mi)/i, unit: 'miles' as const },
    ];

    for (const pattern of patterns) {
      const match = messageLower.match(pattern.regex);
      if (match) {
        const distance = parseInt(match[1]);
        return {
          distance,
          unit: pattern.unit,
        };
      }
    }

    return null;
  }

  /**
   * Detecta el tipo de geometría mencionado en el mensaje
   */
  static detectGeometryType(message: string): 'Point' | 'LineString' | 'Polygon' | undefined {
    const messageLower = message.toLowerCase();

    if (messageLower.includes('punto') || messageLower.includes('point')) {
      return 'Point';
    }
    if (
      messageLower.includes('línea') ||
      messageLower.includes('linea') ||
      messageLower.includes('line')
    ) {
      return 'LineString';
    }
    if (
      messageLower.includes('polígono') ||
      messageLower.includes('poligono') ||
      messageLower.includes('polygon')
    ) {
      return 'Polygon';
    }

    return undefined;
  }

  /**
   * Valida si el mensaje es una solicitud de buffer
   */
  static isBufferRequest(message: string): boolean {
    const messageLower = message.toLowerCase();
    const bufferKeywords = [
      'buffer',
      'área de influencia',
      'zona de influencia',
      'radio',
      'genera',
      'crear',
    ];

    // Debe contener "buffer" o palabras relacionadas Y una distancia
    const hasBufferKeyword = bufferKeywords.some(keyword => messageLower.includes(keyword));
    const hasDistance =
      /\d+\s*(metros?|m\b|kilómetros?|kilometros?|km|pies?|ft|feet|millas?|miles?|mi)/i.test(
        messageLower
      );

    return hasBufferKeyword && hasDistance;
  }

  /**
   * Filtra capas según el tipo de geometría solicitado
   */
  static filterLayersByGeometry(
    layers: Layer[],
    geometryType?: 'Point' | 'LineString' | 'Polygon'
  ): Layer[] {
    if (!geometryType) {
      return layers.filter(layer => layer.visible && layer.geometryType);
    }

    return layers.filter(layer => {
      if (!layer.visible || !layer.geometryType) return false;

      if (geometryType === 'Point') {
        return layer.geometryType === 'Point' || layer.geometryType === 'MultiPoint';
      }
      if (geometryType === 'LineString') {
        return layer.geometryType === 'LineString' || layer.geometryType === 'MultiLineString';
      }
      if (geometryType === 'Polygon') {
        return layer.geometryType === 'Polygon' || layer.geometryType === 'MultiPolygon';
      }

      return false;
    });
  }

  /**
   * Genera el mensaje de solicitud completo para el backend
   */
  static buildBufferRequest(
    message: string,
    layers: Layer[]
  ): { request: BufferRequest; targetLayers: Layer[] } | null {
    if (!this.isBufferRequest(message)) {
      return null;
    }

    const bufferParams = this.parseBufferRequest(message);
    if (!bufferParams) {
      return null;
    }

    const geometryType = this.detectGeometryType(message);
    const targetLayers = this.filterLayersByGeometry(layers, geometryType);

    return {
      request: {
        ...bufferParams,
        geometryType,
        layerIds: targetLayers.map(layer => layer.id),
      },
      targetLayers,
    };
  }

  /**
   * Genera mensaje de confirmación al usuario
   */
  static generateConfirmationMessage(request: BufferRequest, targetLayers: Layer[]): string {
    if (targetLayers.length === 0) {
      return `No se encontraron capas cargadas ${request.geometryType ? `de tipo ${request.geometryType}` : ''} en el mapa.`;
    }

    const layerNames = targetLayers.map(l => l.name).join(', ');
    const geomTypeText = request.geometryType ? ` de tipo ${request.geometryType}` : '';

    const unitText =
      request.unit === 'meters'
        ? 'metros'
        : request.unit === 'kilometers'
          ? 'kilómetros'
          : request.unit === 'feet'
            ? 'pies'
            : 'millas';

    return `Se generará un buffer de ${request.distance} ${unitText} para las capas${geomTypeText}: ${layerNames}`;
  }
}
