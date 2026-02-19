import { useEffect } from 'react';
import { useLayers } from '../../core/contexts/LayerContext';
import { LayerAnalysisService } from '../../services/layerAnalysisService';
import { LayerInfo } from '../map/LayerControl';

export const ChatBridge: React.FC = () => {
  const { layers } = useLayers();

  useEffect(() => {
    // Convertir Layer a LayerInfo para el análisis
    const layerInfos: LayerInfo[] = layers.map(layer => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      type: layer.type === 'geojson' ? 'vector' : (layer.type === 'wms' ? 'wms' : 'base'),
      geometryType: layer.data?.features[0]?.geometry?.type as any
    }));

    // Actualizar los datos globales cada vez que cambien las capas
    const analysis = LayerAnalysisService.analyzeLayers(layerInfos);
    
    (window as any).layersAnalysisData = {
      totalLayers: analysis.totalLayers,
      polygonLayers: analysis.polygonLayers,
      lineLayers: analysis.lineLayers,
      pointLayers: analysis.pointLayers
    };

    console.log(' Datos de capas actualizados:', (window as any).layersAnalysisData);
  }, [layers]);

  return null; // Este componente no renderiza nada
};
