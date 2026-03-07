const GIS_API_URL = 'http://localhost:5000/api/v1/gis';

export interface GISQueryParams {
  layer?: string;
  bbox?: number[];
  filter?: string;
  operation?: 'count' | 'sum' | 'filter' | 'bbox' | 'intersect' | 'buffer';
  distance?: number;
}

export interface GISQueryResult {
  success: boolean;
  data: any;
  message?: string;
}

export class GISApiService {
  /**
   * Detecta si la consulta es una operación GIS simple (sin razonamiento IA).
   * Retorna true solo si tiene operador GIS Y no requiere análisis complejo.
   */
  static isSimpleGISQuery(message: string): boolean {
    const normalizedMessage = message.toLowerCase();

    const gisOperations = [
      'filtrar',
      'bbox',
      'bounding box',
      'en el área',
      'dentro de',
      'intersect',
      'intersección',
      'sumar',
      'calcular área',
      'distancia entre',
      'distancia de',
      'features en',
      'geometrías en',
    ];

    const hasGISOperation = gisOperations.some(op => normalizedMessage.includes(op));
    const requiresAI = this.requiresReasoning(normalizedMessage);

    return hasGISOperation && !requiresAI;
  }

  private static requiresReasoning(message: string): boolean {
    const reasoningKeywords = [
      'por qué',
      'cómo',
      'analiza',
      'compara',
      'recomienda',
      'tendencia',
      'patrón',
      'densidad',
      'correlación',
      'impacto',
      'interpreta',
      'explica',
      'relación entre',
      'causa',
      'efecto',
    ];

    return reasoningKeywords.some(kw => message.toLowerCase().includes(kw));
  }

  /**
   * Ejecuta consulta GIS tradicional en el backend
   */
  static async executeGISQuery(message: string): Promise<GISQueryResult> {
    try {
      const params = this.parseGISQuery(message);

      console.log('🌍 Ejecutando consulta GIS:', { message, params });

      const response = await fetch(`${GIS_API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: message, ...params }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.result || data.data,
        message: data.message || this.formatGISResult(data),
      };
    } catch (error: any) {
      console.error('❌ Error en consulta GIS:', error);
      return {
        success: false,
        data: null,
        message: `Error al ejecutar consulta GIS: ${error.message}`,
      };
    }
  }

  /**
   * Parsea la consulta para extraer parámetros GIS
   */
  private static parseGISQuery(message: string): GISQueryParams {
    const params: GISQueryParams = {};
    const normalized = message.toLowerCase();

    // Detectar operación
    if (normalized.includes('contar') || normalized.includes('cuántos')) {
      params.operation = 'count';
    } else if (normalized.includes('sumar') || normalized.includes('total')) {
      params.operation = 'sum';
    } else if (normalized.includes('filtrar')) {
      params.operation = 'filter';
    } else if (normalized.includes('bbox') || normalized.includes('bounding box')) {
      params.operation = 'bbox';
    } else if (normalized.includes('intersect') || normalized.includes('intersección')) {
      params.operation = 'intersect';
    } else if (normalized.includes('buffer')) {
      params.operation = 'buffer';
    }

    // Detectar nombre de capa
    const layerMatch =
      normalized.match(/capa\s+["']?([^"']+)["']?/) ||
      normalized.match(/layer\s+["']?([^"']+)["']?/);
    if (layerMatch) {
      params.layer = layerMatch[1].trim();
    }

    // Detectar bbox [minLon, minLat, maxLon, maxLat]
    const bboxMatch = message.match(/\[([-\d.,\s]+)\]/);
    if (bboxMatch) {
      const coords = bboxMatch[1].split(',').map(n => parseFloat(n.trim()));
      if (coords.length === 4 && coords.every(n => !isNaN(n))) {
        params.bbox = coords;
      }
    }

    // Detectar distancia
    const distanceMatch = normalized.match(/(\d+)\s*(metros?|km|kilómetros?|m)/);
    if (distanceMatch) {
      let distance = parseFloat(distanceMatch[1]);
      if (distanceMatch[2].includes('km') || distanceMatch[2].includes('kilómetro')) {
        distance *= 1000; // convertir a metros
      }
      params.distance = distance;
    }

    return params;
  }

  /**
   * Formatea el resultado GIS para mostrarlo al usuario
   */
  private static formatGISResult(data: any): string {
    if (data.count !== undefined) {
      return `Se encontraron ${data.count} resultados.`;
    }
    if (data.features) {
      return `Se encontraron ${data.features.length} features.`;
    }
    if (data.result) {
      return `Resultado: ${JSON.stringify(data.result)}`;
    }
    return 'Consulta ejecutada exitosamente.';
  }
}
