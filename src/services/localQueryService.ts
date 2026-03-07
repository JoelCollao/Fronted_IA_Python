export interface LocalQueryResult {
  success: boolean;
  answer: string;
  data?: any;
}

export class LocalQueryService {
  /**
   * Responde consultas locales sin llamar al backend.
   * Usa datos ya cargados en memoria (window.layersAnalysisData / window.getLayerStatistics).
   */
  static answerLocalQuery(message: string): LocalQueryResult | null {
    const normalizedMessage = message.toLowerCase().trim();

    // Obtener datos del window
    const layersData = (window as any).layersAnalysisData;
    const getStats = (window as any).getLayerStatistics;

    if (!layersData && !getStats) {
      return null;
    }

    const stats = getStats?.() || layersData;

    // CONSULTAS DE CONTEO DE POLÍGONOS
    if (this.isCountQuery(normalizedMessage, 'polígono', 'poligono', 'polygon')) {
      const count = stats.polygonLayers || 0;
      return {
        success: true,
        answer: `En el mapa existen ${count} capa${count !== 1 ? 's' : ''} de tipo polígono.`,
        data: { count, type: 'polygon' },
      };
    }

    // CONSULTAS DE CONTEO DE LÍNEAS
    if (this.isCountQuery(normalizedMessage, 'línea', 'linea', 'line')) {
      const count = stats.lineLayers || 0;
      return {
        success: true,
        answer: `En el mapa existen ${count} capa${count !== 1 ? 's' : ''} de tipo línea.`,
        data: { count, type: 'line' },
      };
    }

    // CONSULTAS DE CONTEO DE PUNTOS
    if (this.isCountQuery(normalizedMessage, 'punto', 'point')) {
      const count = stats.pointLayers || 0;
      return {
        success: true,
        answer: `En el mapa existen ${count} capa${count !== 1 ? 's' : ''} de tipo punto.`,
        data: { count, type: 'point' },
      };
    }

    // TOTAL DE CAPAS
    if (
      this.matchesPattern(normalizedMessage, [
        'cuántas capas',
        'cuantas capas',
        'total de capas',
        'cantidad de capas',
        'número de capas',
        'numero de capas',
        'capas hay',
      ])
    ) {
      const total = stats.totalLayers || 0;
      return {
        success: true,
        answer: `Hay ${total} capa${total !== 1 ? 's' : ''} cargada${total !== 1 ? 's' : ''} en total.`,
        data: { totalLayers: total },
      };
    }

    // CONTEO DE REGISTROS/FEATURES
    if (
      this.matchesPattern(normalizedMessage, [
        'cuántos registros',
        'cuantos registros',
        'total de registros',
        'cantidad de features',
        'features totales',
        'total features',
        'registros tienen las capas',
        'registros tiene las capas',
        'registros tienen',
        'registros hay',
        'features tienen las capas',
        'features tiene',
      ])
    ) {
      const totalFeatures = stats.totalFeatures || 0;
      const layersList = stats.layersDetails || [];
      if (layersList.length > 0) {
        const detalle = layersList
          .map((l: any, i: number) => `  ${i + 1}. ${l.name}: ${l.featureCount} registros`)
          .join('\n');
        return {
          success: true,
          answer: `Hay ${totalFeatures} registro${totalFeatures !== 1 ? 's' : ''} en total.\n\nDetalle por capa:\n${detalle}`,
          data: { totalFeatures, layers: layersList },
        };
      }
      return {
        success: true,
        answer: `Hay ${totalFeatures} registro${totalFeatures !== 1 ? 's' : ''} en total en todas las capas.`,
        data: { totalFeatures },
      };
    }

    // LISTADO DE CAPAS
    if (
      this.matchesPattern(normalizedMessage, [
        'lista de capas',
        'qué capas',
        'capas disponibles',
        'mostrar capas',
        'listar capas',
      ])
    ) {
      const layersList = stats.layersDetails || [];
      if (layersList.length === 0) {
        return {
          success: true,
          answer: 'No hay capas cargadas actualmente.',
          data: { layers: [] },
        };
      }

      const list = layersList
        .map(
          (l: any, i: number) =>
            `${i + 1}. ${l.name} (${l.geometryType}, ${l.featureCount} registros, ${l.visible ? 'visible' : 'oculta'})`
        )
        .join('\n');

      return {
        success: true,
        answer: `Capas cargadas:\n${list}`,
        data: { layers: layersList },
      };
    }

    // CAPAS VISIBLES
    if (
      this.matchesPattern(normalizedMessage, [
        'capas visibles',
        'qué capas están visibles',
        'capas activas',
        'capas mostradas',
      ])
    ) {
      const visibleLayers = (stats.layersDetails || []).filter((l: any) => l.visible);
      const count = visibleLayers.length;
      return {
        success: true,
        answer: `Hay ${count} capa${count !== 1 ? 's' : ''} visible${count !== 1 ? 's' : ''} actualmente.`,
        data: { visibleLayers },
      };
    }

    // CAPAS OCULTAS
    if (
      this.matchesPattern(normalizedMessage, [
        'capas ocultas',
        'qué capas están ocultas',
        'capas inactivas',
      ])
    ) {
      const hiddenLayers = (stats.layersDetails || []).filter((l: any) => !l.visible);
      const count = hiddenLayers.length;
      return {
        success: true,
        answer: `Hay ${count} capa${count !== 1 ? 's' : ''} oculta${count !== 1 ? 's' : ''} actualmente.`,
        data: { hiddenLayers },
      };
    }

    // REGISTROS POR CAPA ESPECÍFICA
    const layerNameMatch =
      normalizedMessage.match(/registros.*capa\s+["']?([^"'?]+)["']?/i) ||
      normalizedMessage.match(/features.*["']?([^"'?]+)["']?\s+capa/i) ||
      normalizedMessage.match(/capa\s+["']?([^"'?]+)["']?.*registros/i);
    if (layerNameMatch) {
      const searchName = layerNameMatch[1].trim();
      const layer = (stats.layersDetails || []).find((l: any) =>
        l.name.toLowerCase().includes(searchName.toLowerCase())
      );

      if (layer) {
        return {
          success: true,
          answer: `La capa "${layer.name}" tiene ${layer.featureCount} registro${layer.featureCount !== 1 ? 's' : ''}.`,
          data: { layer },
        };
      } else {
        return {
          success: true,
          answer: `No se encontró ninguna capa que coincida con "${searchName}".`,
          data: null,
        };
      }
    }

    // HAY CAPAS CARGADAS
    if (this.matchesPattern(normalizedMessage, ['hay capas', 'existen capas', 'tiene capas'])) {
      const total = stats.totalLayers || 0;
      return {
        success: true,
        answer:
          total > 0
            ? `Sí, hay ${total} capa${total !== 1 ? 's' : ''} cargada${total !== 1 ? 's' : ''}.`
            : 'No hay capas cargadas actualmente.',
        data: { totalLayers: total },
      };
    }

    return null; // No puede responder localmente
  }

  private static isCountQuery(message: string, ...keywords: string[]): boolean {
    const hasKeyword = keywords.some(k => message.includes(k));
    const isCountQuestion =
      message.includes('cuántas') ||
      message.includes('cuantas') ||
      message.includes('cuántos') ||
      message.includes('cuantos') ||
      message.includes('cantidad') ||
      message.includes('número') ||
      message.includes('numero') ||
      message.includes('hay');
    return hasKeyword && isCountQuestion;
  }

  private static matchesPattern(message: string, patterns: string[]): boolean {
    return patterns.some(pattern => message.includes(pattern));
  }
}
