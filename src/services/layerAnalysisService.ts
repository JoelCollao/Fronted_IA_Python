import { LayerInfo } from '../components/map/LayerControl';

export interface LayerAnalysis {
  totalLayers: number;
  polygonLayers: number;
  lineLayers: number;
  pointLayers: number;
  layersByType: {
    polygons: LayerInfo[];
    lines: LayerInfo[];
    points: LayerInfo[];
  };
}

export class LayerAnalysisService {
  static analyzeLayers(layers: LayerInfo[]): LayerAnalysis {
    const analysis: LayerAnalysis = {
      totalLayers: layers.length,
      polygonLayers: 0,
      lineLayers: 0,
      pointLayers: 0,
      layersByType: {
        polygons: [],
        lines: [],
        points: []
      }
    };

    layers.forEach(layer => {
      if (!layer.geometryType) return;

      if (layer.geometryType === 'Polygon' || layer.geometryType === 'MultiPolygon') {
        analysis.polygonLayers++;
        analysis.layersByType.polygons.push(layer);
      } else if (layer.geometryType === 'LineString' || layer.geometryType === 'MultiLineString') {
        analysis.lineLayers++;
        analysis.layersByType.lines.push(layer);
      } else if (layer.geometryType === 'Point' || layer.geometryType === 'MultiPoint') {
        analysis.pointLayers++;
        analysis.layersByType.points.push(layer);
      }
    });

    return analysis;
  }

  static generateAnalysisText(analysis: LayerAnalysis): string {
    const parts: string[] = [];

    if (analysis.polygonLayers > 0) {
      parts.push(`${analysis.polygonLayers} capa${analysis.polygonLayers !== 1 ? 's' : ''} de tipo polígono`);
    }
    if (analysis.lineLayers > 0) {
      parts.push(`${analysis.lineLayers} capa${analysis.lineLayers !== 1 ? 's' : ''} de tipo línea`);
    }
    if (analysis.pointLayers > 0) {
      parts.push(`${analysis.pointLayers} capa${analysis.pointLayers !== 1 ? 's' : ''} de tipo punto`);
    }

    if (parts.length === 0) {
      return 'No hay capas vectoriales cargadas en el mapa actualmente.';
    }

    return `En el mapa existen: ${parts.join(', ')}.`;
  }
}

