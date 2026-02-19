import React, { useEffect } from 'react';
import { LayerControl, LayerInfo } from '../map/LayerControl';
import { useLayers } from '../../core/contexts/LayerContext';
import { Layer } from '../../core/types/gis.types';

export const MapComponentExample: React.FC = () => {
  const { layers, addLayer, toggleLayerVisibility } = useLayers();

  useEffect(() => {
    // Ejemplo: Cargar capas desde GeoServer
    const loadLayersFromGeoServer = async () => {
      try {
        // Aquí podrías hacer una llamada a tu API de GeoServer
        // Por ahora, usamos datos de ejemplo
        const exampleLayers: Layer[] = [
          {
            id: 'departamentos',
            name: 'Departamentos del Perú',
            type: 'geojson',
            visible: true,
            opacity: 1,
            zIndex: 1,
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: [[[-77.0428, -12.0464], [-77.0328, -12.0364], [-77.0228, -12.0464], [-77.0428, -12.0464]]]
                  },
                  properties: { name: 'Lima', id: 1 }
                }
              ]
            }
          },
          {
            id: 'carreteras',
            name: 'Red Vial Nacional',
            type: 'geojson',
            visible: true,
            opacity: 1,
            zIndex: 2,
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: [[-77.0428, -12.0464], [-77.0328, -12.0364]]
                  },
                  properties: { name: 'Panamericana Norte', id: 1 }
                }
              ]
            }
          },
          {
            id: 'ciudades',
            name: 'Ciudades Principales',
            type: 'geojson',
            visible: false,
            opacity: 1,
            zIndex: 3,
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [-77.0428, -12.0464]
                  },
                  properties: { name: 'Lima', population: 9000000 }
                }
              ]
            }
          }
        ];
        
        // Agregar capas al contexto
        exampleLayers.forEach(layer => addLayer(layer));
        
        console.log(' Capas de ejemplo cargadas desde GeoServer');
      } catch (error) {
        console.error(' Error cargando capas:', error);
      }
    };

    loadLayersFromGeoServer();
  }, [addLayer]);

  // Convertir Layer a LayerInfo para el control
  const layerInfos: LayerInfo[] = layers.map(layer => ({
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    type: layer.type === 'geojson' ? 'vector' : (layer.type === 'wms' ? 'wms' : 'base'),
    geometryType: layer.data?.features[0]?.geometry?.type as any
  }));

  const handleLayerToggle = (layerId: string, visible: boolean) => {
    toggleLayerVisibility(layerId);
  };

  return (
    <div className="map-container relative w-full h-full">
      {/* Control de capas */}
      <LayerControl
        layers={layerInfos}
        onLayerToggle={handleLayerToggle}
        className="absolute top-4 right-4 z-10 max-w-xs"
      />
      
      {/* Aquí iría tu componente de mapa real (Leaflet, OpenLayers, etc.) */}
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Componente de Mapa</p>
      </div>
    </div>
  );
};
