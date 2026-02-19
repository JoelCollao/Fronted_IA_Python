import React from 'react';

export interface LayerInfo {
  id: string;
  name: string;
  visible: boolean;
  type: 'vector' | 'wms' | 'base';
  geometryType?: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon'; // NUEVO
}

interface LayerControlProps {
  layers: LayerInfo[];
  onLayerToggle: (layerId: string, visible: boolean) => void;
  className?: string;
}

export const LayerControl: React.FC<LayerControlProps> = ({
  layers,
  onLayerToggle,
  className = ''
}) => {
  const groupedLayers = layers.reduce((acc, layer) => {
    if (!acc[layer.type]) {
      acc[layer.type] = [];
    }
    acc[layer.type].push(layer);
    return acc;
  }, {} as Record<string, LayerInfo[]>);

  const typeLabels = {
    base: 'Capas Base',
    wms: 'Capas WMS',
    vector: 'Capas Vectoriales'
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Control de Capas</h3>
      
      {Object.entries(groupedLayers).map(([type, typeLayers]) => (
        <div key={type} className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {typeLabels[type as keyof typeof typeLabels] || type}
          </h4>
          
          <div className="space-y-2">
            {typeLayers.map(layer => (
              <label key={layer.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={(e) => onLayerToggle(layer.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{layer.name}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
